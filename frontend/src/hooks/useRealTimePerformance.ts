import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface PerformanceMetrics {
  latency: number;
  messageRate: number;
  reconnectionCount: number;
  uptime: number;
  lastMessageTime: Date | null;
  averageLatency: number;
  messageCount: number;
}

interface UseRealTimePerformanceOptions {
  enableMetrics?: boolean;
  latencyThreshold?: number;
  messageRateThreshold?: number;
}

interface UseRealTimePerformanceReturn {
  metrics: PerformanceMetrics;
  isHealthy: boolean;
  resetMetrics: () => void;
  getPerformanceReport: () => string;
}

export const useRealTimePerformance = (
  options: UseRealTimePerformanceOptions = {}
): UseRealTimePerformanceReturn => {
  const {
    enableMetrics = true,
    latencyThreshold = 1000, // 1 second
    messageRateThreshold = 10, // messages per minute
  } = options;

  const { connectionState, send } = useWebSocket();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    latency: 0,
    messageRate: 0,
    reconnectionCount: 0,
    uptime: 0,
    lastMessageTime: null,
    averageLatency: 0,
    messageCount: 0,
  });

  const startTimeRef = useRef<Date>(new Date());
  const lastPingTimeRef = useRef<number>(0);
  const latencyHistoryRef = useRef<number[]>([]);
  const messageTimestampsRef = useRef<number[]>([]);
  const reconnectionCountRef = useRef<number>(0);
  const previousConnectionStateRef = useRef<string>('disconnected');
  const metricsIntervalRef = useRef<number | null>(null);

  // Track reconnections
  useEffect(() => {
    if (connectionState === 'connected' && previousConnectionStateRef.current === 'reconnecting') {
      reconnectionCountRef.current += 1;
    }
    previousConnectionStateRef.current = connectionState;
  }, [connectionState]);

  // Send periodic ping messages to measure latency
  useEffect(() => {
    if (!enableMetrics || connectionState !== 'connected') return;

    const pingInterval = setInterval(() => {
      lastPingTimeRef.current = Date.now();
      send({
        type: 'ping',
        timestamp: new Date().toISOString(),
        data: { performanceTest: true },
      });
    }, 10000); // Ping every 10 seconds

    return () => clearInterval(pingInterval);
  }, [connectionState, enableMetrics, send]);

  // Listen for WebSocket messages to track performance
  useEffect(() => {
    if (!enableMetrics) return;

    const handleWebSocketMessage = (event: CustomEvent) => {
      const { message, latency } = event.detail;
      
      try {
        if (message.type === 'pong' && latency !== undefined) {
          // Update latency history
          latencyHistoryRef.current.push(latency);
          if (latencyHistoryRef.current.length > 10) {
            latencyHistoryRef.current.shift();
          }
          
          // Calculate average latency
          const averageLatency = latencyHistoryRef.current.reduce((sum, l) => sum + l, 0) / 
                                latencyHistoryRef.current.length;
          
          setMetrics(prev => ({
            ...prev,
            latency,
            averageLatency,
          }));
        }
        
        // Track message rate for all messages
        const now = Date.now();
        messageTimestampsRef.current.push(now);
        
        // Keep only messages from the last minute
        messageTimestampsRef.current = messageTimestampsRef.current.filter(
          timestamp => now - timestamp < 60000
        );
        
        setMetrics(prev => ({
          ...prev,
          messageCount: prev.messageCount + 1,
          messageRate: messageTimestampsRef.current.length,
          lastMessageTime: new Date(),
        }));
        
      } catch (error) {
        console.error('Error processing WebSocket message for performance tracking:', error);
      }
    };

    // Listen for custom WebSocket message events
    window.addEventListener('webSocketMessage', handleWebSocketMessage as EventListener);
    
    return () => {
      window.removeEventListener('webSocketMessage', handleWebSocketMessage as EventListener);
    };
  }, [enableMetrics]);

  // Update uptime metrics
  useEffect(() => {
    if (!enableMetrics) return;

    metricsIntervalRef.current = setInterval(() => {
      const uptime = Date.now() - startTimeRef.current.getTime();
      
      setMetrics(prev => ({
        ...prev,
        uptime,
        reconnectionCount: reconnectionCountRef.current,
      }));
    }, 1000);

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [enableMetrics]);

  const resetMetrics = useCallback(() => {
    startTimeRef.current = new Date();
    lastPingTimeRef.current = 0;
    latencyHistoryRef.current = [];
    messageTimestampsRef.current = [];
    reconnectionCountRef.current = 0;
    
    setMetrics({
      latency: 0,
      messageRate: 0,
      reconnectionCount: 0,
      uptime: 0,
      lastMessageTime: null,
      averageLatency: 0,
      messageCount: 0,
    });
  }, []);

  const getPerformanceReport = useCallback(() => {
    const uptimeHours = (metrics.uptime / (1000 * 60 * 60)).toFixed(2);
    const uptimeMinutes = (metrics.uptime / (1000 * 60)).toFixed(1);
    
    return `
Real-time Performance Report:
- Connection Uptime: ${uptimeHours}h (${uptimeMinutes}m)
- Current Latency: ${metrics.latency}ms
- Average Latency: ${metrics.averageLatency.toFixed(1)}ms
- Message Rate: ${metrics.messageRate} msg/min
- Total Messages: ${metrics.messageCount}
- Reconnections: ${metrics.reconnectionCount}
- Last Message: ${metrics.lastMessageTime?.toLocaleTimeString() || 'Never'}
- Health Status: ${isHealthy ? 'Healthy' : 'Degraded'}
    `.trim();
  }, [metrics]);

  // Determine if the connection is healthy
  const isHealthy = 
    connectionState === 'connected' &&
    metrics.latency < latencyThreshold &&
    (metrics.messageRate >= messageRateThreshold || metrics.messageCount < 10);

  return {
    metrics,
    isHealthy,
    resetMetrics,
    getPerformanceReport,
  };
};

// Hook for monitoring real-time data freshness
export const useDataFreshness = () => {
  const [lastUpdateTimes, setLastUpdateTimes] = useState<Record<string, Date>>({});
  const [staleDataThreshold] = useState(60000); // 1 minute

  const updateDataTimestamp = useCallback((dataType: string) => {
    setLastUpdateTimes(prev => ({
      ...prev,
      [dataType]: new Date(),
    }));
  }, []);

  // Listen for data freshness updates from WebSocket service
  useEffect(() => {
    const handleDataFreshnessUpdate = (event: CustomEvent) => {
      const { dataType, timestamp } = event.detail;
      setLastUpdateTimes(prev => ({
        ...prev,
        [dataType]: timestamp,
      }));
    };

    window.addEventListener('dataFreshnessUpdate', handleDataFreshnessUpdate as EventListener);
    
    return () => {
      window.removeEventListener('dataFreshnessUpdate', handleDataFreshnessUpdate as EventListener);
    };
  }, []);

  const isDataStale = useCallback((dataType: string) => {
    const lastUpdate = lastUpdateTimes[dataType];
    if (!lastUpdate) return true;
    
    return Date.now() - lastUpdate.getTime() > staleDataThreshold;
  }, [lastUpdateTimes, staleDataThreshold]);

  const getDataAge = useCallback((dataType: string) => {
    const lastUpdate = lastUpdateTimes[dataType];
    if (!lastUpdate) return null;
    
    return Date.now() - lastUpdate.getTime();
  }, [lastUpdateTimes]);

  const getStaleDataTypes = useCallback(() => {
    return Object.keys(lastUpdateTimes).filter(isDataStale);
  }, [lastUpdateTimes, isDataStale]);

  const clearDataTimestamp = useCallback((dataType: string) => {
    setLastUpdateTimes(prev => {
      const newTimes = { ...prev };
      delete newTimes[dataType];
      return newTimes;
    });
  }, []);

  const clearAllTimestamps = useCallback(() => {
    setLastUpdateTimes({});
  }, []);

  return {
    updateDataTimestamp,
    isDataStale,
    getDataAge,
    getStaleDataTypes,
    lastUpdateTimes,
    clearDataTimestamp,
    clearAllTimestamps,
  };
};