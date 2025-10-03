// /src/hooks/useRealTimeSyncRead.ts
import { useCallback, useEffect, useState } from "react";
import { getRealTimeSyncService } from "@/services/realtime-sync.service";

export interface UseRealTimeSyncReadResult<T> {
  data: T[];
  error: string | null;
  loading: boolean;
  refresh: () => void;
}

export const useRealTimeSyncRead = <T>(
  entityType: string,
  syncInterval?: number
): UseRealTimeSyncReadResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncService = getRealTimeSyncService();

  const updateData = useCallback(() => {
    const entities = syncService.getAllEntities<T>(entityType);
    setData(entities);
    
    const state = syncService.getSyncState(entityType);
    if (state) {
      setLoading(state.loading);
      setError(state.error);
    }
  }, [entityType, syncService]);

  const refresh = useCallback(() => {
    syncService.requestFullSync(entityType);
    updateData();
  }, [entityType, syncService, updateData]);

  useEffect(() => {
    // Initialize if not already done
    syncService.initializeEntity(entityType, {}, syncInterval);

    // Subscribe to changes
    const unsubscribe = syncService.subscribeToEntity(entityType, () => {
      updateData();
    });

    // Initial data load
    updateData();

    return unsubscribe;
  }, [entityType, syncInterval, syncService, updateData]);

  return {
    data,
    error,
    loading,
    refresh
  };
};
