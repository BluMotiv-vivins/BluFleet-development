import React, { useEffect } from 'react';
import { useRealTimeSync } from '../../hooks/useRealTimeSync';
import { useRealTimePerformance, useDataFreshness } from '../../hooks/useRealTimePerformance';
import { useAppDispatch, useAppSelector } from '../../store';
import { showNotification } from '../../store/slices/uiSlice';

interface WebSocketProviderProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  performanceReportInterval?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children,
  enablePerformanceMonitoring = true,
  performanceReportInterval = 300000, // 5 minutes
}) => {
  const dispatch = useAppDispatch();
  const connectionState = useAppSelector(state => state.ui.connectionStatus);
  
  const { 
    isRealTimeActive, 
    lastSyncTime, 
    pendingUpdatesCount 
  } = useRealTimeSync({
    enableAutoAlerts: true,
    alertGenerationInterval: 30000, // 30 seconds
    syncNotifications: true,
    conflictResolution: 'server_wins',
  });

  const { 
    metrics, 
    isHealthy, 
    getPerformanceReport 
  } = useRealTimePerformance({
    enableMetrics: enablePerformanceMonitoring,
    latencyThreshold: 2000, // 2 seconds
    messageRateThreshold: 5, // 5 messages per minute
  });

  const { 
    updateDataTimestamp, 
    getStaleDataTypes 
  } = useDataFreshness();

  // Update data freshness timestamps when real-time data is received
  useEffect(() => {
    if (isRealTimeActive && lastSyncTime) {
      updateDataTimestamp('realtime_sync');
    }
  }, [lastSyncTime, isRealTimeActive, updateDataTimestamp]);

  // Log connection state changes for debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('WebSocket connection state:', connectionState);
      console.log('Real-time active:', isRealTimeActive);
      console.log('Last sync time:', lastSyncTime);
      console.log('Pending updates:', pendingUpdatesCount);
      console.log('Connection healthy:', isHealthy);
    }
  }, [connectionState, isRealTimeActive, lastSyncTime, pendingUpdatesCount, isHealthy]);

  // Show notification for pending updates when offline
  useEffect(() => {
    if (pendingUpdatesCount > 0 && connectionState === 'disconnected') {
      dispatch(showNotification({
        message: `${pendingUpdatesCount} updates pending synchronization`,
        type: 'warning'
      }));
    }
  }, [pendingUpdatesCount, connectionState, dispatch]);

  // Monitor connection health and show warnings
  useEffect(() => {
    if (enablePerformanceMonitoring && !isHealthy && connectionState === 'connected') {
      dispatch(showNotification({
        message: 'Real-time connection performance is degraded. High latency detected.',
        type: 'warning'
      }));
    }
  }, [isHealthy, connectionState, enablePerformanceMonitoring, dispatch]);

  // Monitor stale data and show notifications
  useEffect(() => {
    const staleDataTypes = getStaleDataTypes();
    if (staleDataTypes.length > 0 && isRealTimeActive) {
      const staleDataMessage = staleDataTypes.length === 1 
        ? `${staleDataTypes[0]} data may be outdated`
        : `${staleDataTypes.length} data types may be outdated: ${staleDataTypes.slice(0, 3).join(', ')}${staleDataTypes.length > 3 ? '...' : ''}`;
      
      dispatch(showNotification({
        message: staleDataMessage,
        type: 'warning'
      }));
    }
  }, [getStaleDataTypes, isRealTimeActive, dispatch]);

  // Periodic performance reporting (development only)
  useEffect(() => {
    if (import.meta.env.DEV && enablePerformanceMonitoring) {
      const interval = setInterval(() => {
        console.log('=== Real-time Performance Report ===');
        console.log(getPerformanceReport());
        console.log('=====================================');
      }, performanceReportInterval);

      return () => clearInterval(interval);
    }
  }, [enablePerformanceMonitoring, getPerformanceReport, performanceReportInterval]);

  // Expose performance metrics to window for debugging (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).fleetVoltPerformance = {
        metrics,
        isHealthy,
        getReport: getPerformanceReport,
        staleDataTypes: getStaleDataTypes(),
      };
    }
  }, [metrics, isHealthy, getPerformanceReport, getStaleDataTypes]);

  return <>{children}</>;
};

export default WebSocketProvider;