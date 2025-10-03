// /src/services/realtime-sync.service.ts
import {
  getWebSocketService,
  // WebSocketMessage
} from "@/services/websocket.service";

export interface OptimisticUpdate<T = unknown> {
  id: string;
  data: T;
  operation: "create" | "update" | "delete";
  timestamp: string;
  rollback: () => void;
}

export interface SyncEntity {
  id: string;
  data: unknown;
  lastModified: string;
  type: string;
  version: number;
  modifiedBy: string;
}

export interface SyncOperation {
  entity: SyncEntity;
  operation: "create" | "update" | "delete";
  timestamp: string;
  userId: string;
}

export interface SyncState<T = unknown> {
  data: Record<string, T>;
  error: string | null;
  lastSync: string | null;
  loading: boolean;
  pendingOperations: SyncOperation[];
}

export type SyncEventHandler<T = unknown> = (operation: SyncOperation, data: T) => void;
export type ConflictResolver<T = unknown> = (local: T, remote: T, operation: SyncOperation) => T;

class RealTimeSyncService {
  private wsService: ReturnType<typeof getWebSocketService> = null;
  private syncStates = new Map<string, SyncState>();
  private eventHandlers = new Map<string, Set<SyncEventHandler>>();
  private conflictResolvers = new Map<string, ConflictResolver>();
  private optimisticUpdates = new Map<string, OptimisticUpdate[]>();
  private syncIntervals = new Map<string, NodeJS.Timeout>();
  private offlineQueue: SyncOperation[] = [];
  private isOnline = true;

  constructor() {
    this.wsService = getWebSocketService();
    this.setupWebSocketHandlers();
    this.setupOnlineOfflineHandlers();
  }

  public initializeEntity<T>(
    entityType: string,
    initialData: Record<string, T> = {},
    syncInterval?: number
  ): void {
    if (!this.syncStates.has(entityType)) {
      this.syncStates.set(entityType, {
        data: initialData,
        error: null,
        lastSync: null,
        loading: false,
        pendingOperations: []
      });

      // Set up periodic sync if interval provided
      if (syncInterval && syncInterval > 0) {
        const interval = setInterval(() => {
          this.requestFullSync(entityType);
        }, syncInterval);
        
        this.syncIntervals.set(entityType, interval);
      }

      // Request initial sync
      this.requestFullSync(entityType);
    }
  }

  public getSyncState<T>(entityType: string): SyncState<T> | null {
    return this.syncStates.get(entityType) as SyncState<T> || null;
  }

  public getEntity<T>(entityType: string, entityId: string): T | null {
    const state = this.syncStates.get(entityType);
    return (state?.data[entityId] as T) || null;
  }

  public getAllEntities<T>(entityType: string): T[] {
    const state = this.syncStates.get(entityType);
    return state ? (Object.values(state.data) as T[]) : [];
  }

  public async createEntity<T extends { id: string }>(
    data: Omit<T, "id">,
    entityType: string,
    optimistic = true
  ): Promise<T> {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36)}`;
    const entity: T = { ...data, id: tempId } as T;

    if (optimistic) {
      this.applyOptimisticUpdate(entityType, "create", entity);
    }

    const operation: SyncOperation = {
      operation: "create",
      entity: {
        id: tempId,
        data: entity,
        lastModified: new Date().toISOString(),
        modifiedBy: this.getCurrentUserId(),
        type: entityType,
        version: 1
      },
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };

    if (this.isOnline && this.wsService?.isConnected()) {
      this.wsService.send("entity:create", operation);
    }
    else {
      this.queueOfflineOperation(operation);
    }

    return entity;
  }

  public async updateEntity<T>(
    entityId: string,
    entityType: string,
    optimistic = true,
    updates: Partial<T>
  ): Promise<T | null> {
    const currentEntity = this.getEntity<T>(entityType, entityId);
    if (!currentEntity) {
      throw new Error(`Entity ${entityId} not found in ${entityType}`);
    }

    const updatedEntity = { ...currentEntity, ...updates };

    if (optimistic) {
      this.applyOptimisticUpdate(entityType, "update", updatedEntity);
    }

    const operation: SyncOperation = {
      operation: "update",
      entity: {
        id: entityId,
        type: entityType,
        data: updatedEntity,
        version: ((currentEntity as { version?: number }).version || 0) + 1,
        lastModified: new Date().toISOString(),
        modifiedBy: this.getCurrentUserId()
      },
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };

    if (this.isOnline && this.wsService?.isConnected()) {
      this.wsService.send("entity:update", operation);
    }
    else {
      this.queueOfflineOperation(operation);
    }

    return updatedEntity;
  }

  public async deleteEntity(
    entityId: string,
    entityType: string,
    optimistic = true
  ): Promise<void> {
    const entity = this.getEntity(entityType, entityId);
    if (!entity) {
      throw new Error(`Entity ${entityId} not found in ${entityType}`);
    }

    if (optimistic) {
      this.applyOptimisticUpdate(entityType, "delete", entity);
    }

    const operation: SyncOperation = {
      operation: "delete",
      entity: {
        id: entityId,
        type: entityType,
        data: entity,
        version: (entity as { version?: number }).version || 1,
        lastModified: new Date().toISOString(),
        modifiedBy: this.getCurrentUserId()
      },
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };

    if (this.isOnline && this.wsService?.isConnected()) {
      this.wsService.send("entity:delete", operation);
    }
    else {
      this.queueOfflineOperation(operation);
    }
  }

  public subscribeToEntity<T>(
    entityType: string,
    handler: SyncEventHandler<T>
  ): () => void {
    if (!this.eventHandlers.has(entityType)) {
      this.eventHandlers.set(entityType, new Set());
    }

    this.eventHandlers.get(entityType)!.add(handler as SyncEventHandler<unknown>);

    return () => {
      const handlers = this.eventHandlers.get(entityType);
      if (handlers) {
        handlers.delete(handler as SyncEventHandler<unknown>);
        if (handlers.size === 0) {
          this.eventHandlers.delete(entityType);
        }
      }
    };
  }

  public setConflictResolver<T>(
    entityType: string,
    resolver: ConflictResolver<T>
  ): void {
    this.conflictResolvers.set(entityType, resolver as ConflictResolver<unknown>);
  }

  public requestFullSync(entityType: string): void {
    if (this.wsService?.isConnected()) {
      const state = this.syncStates.get(entityType);
      this.updateSyncState(entityType, { ...state!, loading: true });

      this.wsService.send("entity:sync", {
        entityType,
        lastSync: state?.lastSync,
        timestamp: new Date().toISOString()
      });
    }
  }

  public clearEntity(entityType: string): void {
    // Clear sync interval
    const interval = this.syncIntervals.get(entityType);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(entityType);
    }

    // Clear state
    this.syncStates.delete(entityType);
    this.eventHandlers.delete(entityType);
    this.conflictResolvers.delete(entityType);
    this.optimisticUpdates.delete(entityType);
  }

  public getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  public isEntityOnline(): boolean {
    return this.isOnline && (this.wsService?.isConnected() ?? false);
  }

  private setupWebSocketHandlers(): void {
    if (!this.wsService) return;

    // Handle entity creation
    this.wsService.subscribe("entity:created", (message) => {
      this.handleRemoteOperation(message.payload as SyncOperation);
    });

    // Handle entity updates
    this.wsService.subscribe("entity:updated", (message) => {
      this.handleRemoteOperation(message.payload as SyncOperation);
    });

    // Handle entity deletion
    this.wsService.subscribe("entity:deleted", (message) => {
      this.handleRemoteOperation(message.payload as SyncOperation);
    });

    // Handle full sync response
    this.wsService.subscribe("entity:sync:response", (message) => {
      this.handleFullSyncResponse(message.payload as { entityType: string; entities: SyncEntity[]; timestamp: string });
    });

    // Handle operation confirmation
    this.wsService.subscribe("entity:operation:confirmed", (message) => {
      this.handleOperationConfirmation(message.payload as {
        tempId?: string;
        realId: string;
        entityType: string;
        operation: string;
      });
    });

    // Handle operation error
    this.wsService.subscribe("entity:operation:error", (message) => {
      this.handleOperationError(message.payload as {
        tempId?: string;
        entityId: string;
        entityType: string;
        operation: string;
        error: string;
      });
    });

    // Handle connection restore
    this.wsService.onStatusChange((status: string) => {
      if (status === "connected" && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });
  }

  private setupOnlineOfflineHandlers(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      if (this.wsService?.isConnected() && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private handleRemoteOperation(operation: SyncOperation): void {
    const { entity } = operation;
    const entityType = entity.type;
    const state = this.syncStates.get(entityType);

    if (!state) {
      return;
    }

    // Check for conflicts with optimistic updates
    const optimisticUpdates = this.optimisticUpdates.get(entityType) || [];
    const conflictingUpdate = optimisticUpdates.find(
      update => update.id === entity.id
    );

    if (conflictingUpdate) {
      this.resolveConflict(entityType, operation, conflictingUpdate);
      return;
    }

    // Apply remote operation
    this.applyOperation(entityType, operation);

    // Notify subscribers
    const handlers = this.eventHandlers.get(entityType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(operation, entity.data);
        }
        catch (error) {
          console.error("Error in sync event handler:", error);
        }
      });
    }
  }

  private handleFullSyncResponse(payload: {
    entities: SyncEntity[];
    entityType: string;
    timestamp: string;
  }): void {
    const { entities, entityType, timestamp } = payload;
    const state = this.syncStates.get(entityType);

    if (!state) {
      return;
    }

    const newData: Record<string, unknown> = {};
    entities.forEach(entity => {
      newData[entity.id] = entity.data;
    });

    this.updateSyncState(entityType, {
      ...state,
      data: newData,
      error: null,
      lastSync: timestamp,
      loading: false
    });
  }

  private handleOperationConfirmation(payload: {
    tempId?: string;
    entityType: string;
    realId: string;
    operation: string;
  }): void {
    const { tempId, entityType, realId } = payload;
    
    if (tempId && tempId !== realId) {
      // Update temporary ID to real ID
      const state = this.syncStates.get(entityType);
      if (state && state.data[tempId]) {
        const entity = state.data[tempId];
        delete state.data[tempId];
        state.data[realId] = { ...entity, id: realId };
        
        this.updateSyncState(entityType, state);
      }
    }

    // Remove optimistic update
    this.removeOptimisticUpdate(entityType, tempId || realId);
  }

  private handleOperationError(payload: {
    tempId?: string;
    entityId: string;
    entityType: string;
    error: string;
    operation: string;
  }): void {
    const { tempId, entityId, entityType, error } = payload;
    
    // Rollback optimistic update
    this.rollbackOptimisticUpdate(entityType, tempId || entityId);

    // Update error state
    const state = this.syncStates.get(entityType);
    if (state) {
      this.updateSyncState(entityType, {
        ...state,
        error: error
      });
    }
  }

  private applyOptimisticUpdate<T>(
    entityType: string,
    operation: "create" | "update" | "delete",
    data: T
  ): void {
    const state = this.syncStates.get(entityType);
    if (!state) {
      return;
    }

    const entityId = (data as { id: string }).id;
    const originalData = { ...state.data };

    // Apply optimistic update
    const newState = { ...state };
    
    switch (operation) {
      case "create":
        newState.data = { ...state.data, [entityId]: data };
        break;
      case "update":
        newState.data = { ...state.data, [entityId]: data };
        break;
      case "delete":
        newState.data = { ...state.data };
        delete newState.data[entityId];
        break;
    }

    // Store rollback function
    const rollback = () => {
      this.updateSyncState(entityType, { ...state, data: originalData });
    };

    const optimisticUpdate: OptimisticUpdate = {
      id: entityId,
      data,
      operation,
      timestamp: new Date().toISOString(),
      rollback
    };

    if (!this.optimisticUpdates.has(entityType)) {
      this.optimisticUpdates.set(entityType, []);
    }
    this.optimisticUpdates.get(entityType)!.push(optimisticUpdate);

    this.updateSyncState(entityType, newState);
  }

  private applyOperation(entityType: string, operation: SyncOperation): void {
    const state = this.syncStates.get(entityType);
    if (!state) {
      return;
    }

    const { entity } = operation;
    const newState = { ...state };

    switch (operation.operation) {
      case "create":
        newState.data = { ...state.data, [entity.id]: entity.data };
        break;
      case "update":
        newState.data = { ...state.data, [entity.id]: entity.data };
        break;
      case "delete":
        newState.data = { ...state.data };
        delete newState.data[entity.id];
        break;
    }

    this.updateSyncState(entityType, newState);
  }

  private resolveConflict(
    entityType: string,
    remoteOperation: SyncOperation,
    optimisticUpdate: OptimisticUpdate
  ): void {
    const resolver = this.conflictResolvers.get(entityType);
    
    if (resolver) {
      try {
        const resolvedData = resolver(
          optimisticUpdate.data,
          remoteOperation.entity.data,
          remoteOperation
        );
        
        // Apply resolved data
        this.removeOptimisticUpdate(entityType, optimisticUpdate.id);
        this.applyOperation(entityType, {
          ...remoteOperation,
          entity: { ...remoteOperation.entity, data: resolvedData }
        });
      } catch (error) {
        console.error("Error in conflict resolver:", error);
        // Fallback: use remote data
        this.rollbackOptimisticUpdate(entityType, optimisticUpdate.id);
        this.applyOperation(entityType, remoteOperation);
      }
    } else {
      // Default: remote wins
      this.rollbackOptimisticUpdate(entityType, optimisticUpdate.id);
      this.applyOperation(entityType, remoteOperation);
    }
  }

  private removeOptimisticUpdate(entityType: string, entityId: string): void {
    const updates = this.optimisticUpdates.get(entityType);
    if (updates) {
      const index = updates.findIndex(update => update.id === entityId);
      if (index !== -1) {
        updates.splice(index, 1);
      }
    }
  }

  private rollbackOptimisticUpdate(entityType: string, entityId: string): void {
    const updates = this.optimisticUpdates.get(entityType);
    if (updates) {
      const updateIndex = updates.findIndex(update => update.id === entityId);
      if (updateIndex !== -1) {
        const update = updates[updateIndex];
        update.rollback();
        updates.splice(updateIndex, 1);
      }
    }
  }

  private queueOfflineOperation(operation: SyncOperation): void {
    this.offlineQueue.push(operation);
    
    // Limit queue size
    if (this.offlineQueue.length > 1000) {
      this.offlineQueue.shift();
    }
  }

  private async processOfflineQueue(): Promise<void> {
    while (this.offlineQueue.length > 0 && this.wsService?.isConnected()) {
      const operation = this.offlineQueue.shift();
      if (operation) {
        const eventType = `entity:${operation.operation}`;
        this.wsService.send(eventType, operation);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  private updateSyncState(entityType: string, newState: SyncState): void {
    this.syncStates.set(entityType, newState);
  }

  private getCurrentUserId(): string {
    // This would typically come from authentication service
    return "current-user-id";
  }
}

// Singleton instance
let realTimeSyncService: RealTimeSyncService | null = null;

export const getRealTimeSyncService = (): RealTimeSyncService => {
  if (!realTimeSyncService) {
    realTimeSyncService = new RealTimeSyncService();
  }
  return realTimeSyncService;
};

export default RealTimeSyncService;
