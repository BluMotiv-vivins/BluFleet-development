// Custom React hooks for API operations
// Version: 1.0.0
// Description: Reusable hooks for API calls with loading states and error handling

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '../services/api/client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  refreshInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Generic hook for API calls with loading states
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & {
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const {
    immediate = true,
    refreshInterval,
    retryAttempts = 0,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      
      if (mountedRef.current) {
        setState({
          data: result,
          loading: false,
          error: null,
          lastFetch: new Date()
        });
        retryCountRef.current = 0;
      }
    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';

      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData();
          }
        }, retryDelay * retryCountRef.current);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [apiCall, retryAttempts, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null
    });
    retryCountRef.current = 0;
  }, []);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch: fetchData,
    reset
  };
}

/**
 * Hook for API mutations (POST, PUT, DELETE)
 */
export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<T>
): {
  mutate: (params: P) => Promise<T>;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(params);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number, filters?: any) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>,
  initialLimit: number = 20,
  initialFilters?: any
): {
  data: T[];
  pagination: any;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  filters: any;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: any) => void;
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState(initialFilters || {});
  
  const [state, setState] = useState({
    data: [] as T[],
    pagination: null as any,
    loading: false,
    error: null as string | null
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall(page, limit, filters);
      setState({
        data: result.data,
        pagination: result.pagination,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [apiCall, page, limit, filters]);

  const reset = useCallback(() => {
    setPage(1);
    setLimit(initialLimit);
    setFilters(initialFilters || {});
    setState({
      data: [],
      pagination: null,
      loading: false,
      error: null
    });
  }, [initialLimit, initialFilters]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [filters]);

  return {
    ...state,
    page,
    limit,
    filters,
    setPage,
    setLimit,
    setFilters,
    refetch: fetchData,
    reset
  };
}

/**
 * Hook for real-time data with WebSocket fallback to polling
 */
export function useRealTimeData<T>(
  apiCall: () => Promise<T>,
  wsChannel?: string,
  pollInterval: number = 30000
): UseApiState<T> & {
  isRealTime: boolean;
  refetch: () => Promise<void>;
} {
  const [isRealTime, setIsRealTime] = useState(false);
  
  const apiState = useApi(apiCall, {
    immediate: true,
    refreshInterval: isRealTime ? 0 : pollInterval
  });

  // TODO: Implement WebSocket connection when wsChannel is provided
  useEffect(() => {
    if (wsChannel) {
      // WebSocket implementation would go here
      // For now, fall back to polling
      setIsRealTime(false);
    }
  }, [wsChannel]);

  return {
    ...apiState,
    isRealTime
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  data: T | null,
  updateFn: (data: T, update: Partial<T>) => T
): {
  optimisticData: T | null;
  applyOptimisticUpdate: (update: Partial<T>) => void;
  revertOptimisticUpdate: () => void;
} {
  const [optimisticData, setOptimisticData] = useState<T | null>(data);
  const [hasOptimisticUpdate, setHasOptimisticUpdate] = useState(false);

  // Sync with actual data when it changes
  useEffect(() => {
    if (!hasOptimisticUpdate) {
      setOptimisticData(data);
    }
  }, [data, hasOptimisticUpdate]);

  const applyOptimisticUpdate = useCallback((update: Partial<T>) => {
    if (data) {
      setOptimisticData(updateFn(data, update));
      setHasOptimisticUpdate(true);
    }
  }, [data, updateFn]);

  const revertOptimisticUpdate = useCallback(() => {
    setOptimisticData(data);
    setHasOptimisticUpdate(false);
  }, [data]);

  return {
    optimisticData,
    applyOptimisticUpdate,
    revertOptimisticUpdate
  };
}