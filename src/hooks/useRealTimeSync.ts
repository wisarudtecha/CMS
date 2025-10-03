// /src/hooks/useRealTimeSync.ts
import { useCallback, useEffect, useRef, useState, } from "react";
import { getRealTimeSyncService, SyncOperation, SyncState } from "@/services/realtime-sync.service";

export interface UseRealTimeSyncOptions {
  autoSync?: boolean;
  optimisticUpdates?: boolean;
  syncInterval?: number;
  conflictResolver?: (local: unknown, remote: unknown, operation: SyncOperation) => unknown;
  onError?: (error: string) => void;
  onSync?: (entityType: string, data: unknown[]) => void;
}

export interface UseRealTimeSyncResult<T> {
  data: Record<string, T>;
  entities: T[];
  error: string | null;
  isOnline: boolean;
  lastSync: string | null;
  loading: boolean;
  pendingOperations: SyncOperation[];
  // Actions
  clearError: () => void;
  create: (data: Omit<T, "id">) => Promise<T>;
  refresh: () => void;
  remove: (id: string) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<T | null>;
}

export const useRealTimeSync = <T extends { id: string }>(
  entityType: string,
  options: UseRealTimeSyncOptions = {}
): UseRealTimeSyncResult<T> => {
  const {
    autoSync = true,
    optimisticUpdates = true,
    syncInterval,
    conflictResolver,
    onError,
    onSync
  } = options;

  const [syncState, setSyncState] = useState<SyncState<T>>({
    data: {},
    error: null,
    lastSync: null,
    loading: false,
    pendingOperations: []
  });

  const [isOnline, setIsOnline] = useState(false);
  const syncService = useRef(getRealTimeSyncService());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize entity type in sync service
  useEffect(() => {
    if (!isInitializedRef.current) {
      syncService.current.initializeEntity<T>(
        entityType,
        {},
        autoSync ? syncInterval : undefined
      );
      isInitializedRef.current = true;

      // Set conflict resolver if provided
      if (conflictResolver) {
        syncService.current.setConflictResolver(entityType, conflictResolver);
      }
    }
  }, [entityType, syncInterval, autoSync, conflictResolver]);

  // Update sync state when service state changes
  const updateSyncState = useCallback(() => {
    const serviceState = syncService.current.getSyncState<T>(entityType);
    if (serviceState) {
      setSyncState(serviceState);
    }
    setIsOnline(syncService.current.isEntityOnline());
  }, [entityType]);

  // Subscribe to entity changes
  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to changes
    unsubscribeRef.current = syncService.current.subscribeToEntity<T>(
      entityType,
      (
        // operation, data
      ) => {
        updateSyncState();
        
        // Call onSync callback if provided
        if (onSync) {
          const allEntities = syncService.current.getAllEntities<T>(entityType);
          onSync(entityType, allEntities);
        }
      }
    );

    // Initial state update
    updateSyncState();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [entityType, updateSyncState, onSync]);

  // Handle errors
  useEffect(() => {
    if (syncState.error && onError) {
      onError(syncState.error);
    }
  }, [syncState.error, onError]);

  // Periodic state updates (fallback for missed events)
  useEffect(() => {
    const interval = setInterval(() => {
      updateSyncState();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [updateSyncState]);

  // Action: Create entity
  const create = useCallback(async (data: Omit<T, "id">): Promise<T> => {
    try {
      const entity = await syncService.current.createEntity<T>(
        data,
        entityType,
        optimisticUpdates
      );
      updateSyncState();
      return entity;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create entity";
      setSyncState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [entityType, optimisticUpdates, updateSyncState]);

  // Action: Update entity
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    try {
      const entity = await syncService.current.updateEntity<T>(
        id,
        entityType,
        optimisticUpdates,
        updates
      );
      updateSyncState();
      return entity;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update entity";
      setSyncState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [entityType, optimisticUpdates, updateSyncState]);

  // Action: Remove entity
  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      await syncService.current.deleteEntity(
        id,
        entityType,
        optimisticUpdates
      );
      updateSyncState();
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete entity";
      setSyncState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [entityType, optimisticUpdates, updateSyncState]);

  // Action: Refresh data
  const refresh = useCallback(() => {
    syncService.current.requestFullSync(entityType);
    updateSyncState();
  }, [entityType, updateSyncState]);

  // Action: Clear error
  const clearError = useCallback(() => {
    setSyncState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    data: syncState.data,
    entities: Object.values(syncState.data),
    error: syncState.error,
    isOnline,
    lastSync: syncState.lastSync,
    loading: syncState.loading,
    pendingOperations: syncState.pendingOperations,
    clearError,
    create,
    refresh,
    remove,
    update
  };
};

export default useRealTimeSync;
