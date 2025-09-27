import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Base API URL - will be configured per environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * Custom hook for making API calls with automatic refresh and error handling
 */
export function useApiCall<T>(
  endpoint: string,
  params?: Record<string, any>,
  refreshInterval?: number,
  config?: ApiConfig
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build URL with query parameters
  const buildUrl = useCallback((endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    return url.toString();
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = buildUrl(endpoint, params);
      const response = await fetch(url, {
        method: config?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
        body: config?.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, config, buildUrl]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh };
}

/**
 * Hook specifically for analytics data with enhanced error handling
 */
export function useAnalyticsData<T>(
  endpoint: string,
  params?: Record<string, any>,
  refreshInterval?: number
): ApiResponse<T> {
  const { data, loading, error, refresh } = useApiCall<T>(
    endpoint,
    params,
    refreshInterval,
    {
      headers: {
        'X-Request-Source': 'analytics-dashboard',
      },
    }
  );

  return { data, loading, error, refresh };
}

/**
 * Hook for real-time vehicle data
 */
export function useVehicleData(
  vehicleId?: string,
  refreshInterval: number = 5000
): ApiResponse<any> {
  const endpoint = vehicleId ? `/api/v1/vehicles/${vehicleId}` : '/api/v1/vehicles';
  
  return useApiCall(
    endpoint,
    {},
    refreshInterval,
    {
      headers: {
        'X-Request-Source': 'vehicle-tracking',
      },
    }
  );
}

/**
 * Hook for telemetry data
 */
export function useTelemetryData(
  vehicleId?: string,
  type: 'latest' | 'history' | 'fleet' = 'latest',
  params?: Record<string, any>,
  refreshInterval: number = 10000
): ApiResponse<any> {
  let endpoint = '/api/v1/telemetry';
  
  if (type === 'fleet') {
    endpoint += '/fleet/realtime';
  } else if (vehicleId) {
    endpoint += `/vehicles/${vehicleId}/${type}`;
  }

  return useApiCall(endpoint, params, refreshInterval);
}

/**
 * Hook for fleet health data
 */
export function useFleetHealth(refreshInterval: number = 60000): ApiResponse<any> {
  return useApiCall('/api/v1/analytics/fleet-health', {}, refreshInterval);
}

/**
 * Hook for energy efficiency data
 */
export function useEnergyEfficiency(
  timeframe: string = '24h',
  granularity: string = '1h',
  refreshInterval: number = 300000 // 5 minutes
): ApiResponse<any> {
  return useApiCall(
    '/api/v1/analytics/energy-efficiency',
    { timeframe, granularity },
    refreshInterval
  );
}

/**
 * Hook for making mutations (POST, PUT, DELETE)
 */
export function useApiMutation<T, P = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    endpoint: string,
    data?: P,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('API mutation failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Hook for WebSocket connections for real-time updates
 */
export function useWebSocket(url?: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  return { socket, isConnected, lastMessage, sendMessage };
}
