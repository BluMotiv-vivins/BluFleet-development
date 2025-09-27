import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAppSelector, useAppDispatch } from '../store';
import { generateAutomatedAlertsAction } from '../store/slices/alertSlice';
import { showNotification } from '../store/slices/uiSlice';

interface UseRealTimeSyncOptions {
  enableAutoAlerts?: boolean;
  alertGenerationInterval?: number;
  syncNotifications?: boolean;
  conflictResolution?: 'server_wins' | 'client_wins' | 'merge';
}

interface UseRealTimeSyncReturn {
  isRealTimeActive: boolean;
  lastSyncTime: string | null;
  pendingUpdatesCount: number;
  forceSync: () => void;
  enableAutoAlerts: () => void;
  disableAutoAlerts: () => void;
  handleVehicleUpdate: (vehicleId: string, updateData: any) => void;
  handleBatteryUpdate: (vehicleId: string, batteryData: any) => void;
  handleLocationUpdate: (vehicleId: string, locationData: any) => void;
}

export const useRealTimeSync = (options: UseRealTimeSyncOptions = {}): UseRealTimeSyncReturn => {
  const {
    enableAutoAlerts = true,
    alertGenerationInterval = 30000, // 30 seconds
    syncNotifications = true,
    conflictResolution = 'server_wins',
  } = options;

  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(state => state.fleet.vehicles);
  const isConnected = useAppSelector(state => state.ui.connectionStatus === 'connected');
  const isOffline = useAppSelector(state => state.ui.isOffline);
  
  const alertIntervalRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<number>(0);
  const lastSyncTimeRef = useRef<string | null>(null);
  const autoAlertsEnabledRef = useRef(enableAutoAlerts);

  const { 
    lastSyncTimestamp, 
    addPendingUpdate, 
    setConflictResolution,
    send 
  } = useWebSocket({
    autoConnect: true,
    conflictResolution,
    onConnect: () => {
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Real-time sync connected',
          type: 'success'
        }));
      }
      startAutoAlertGeneration();
    },
    onDisconnect: () => {
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Real-time sync disconnected',
          type: 'warning'
        }));
      }
      stopAutoAlertGeneration();
    },
    onReconnect: () => {
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Real-time sync reconnected - data synchronized',
          type: 'success'
        }));
      }
      startAutoAlertGeneration();
    },
    onDataSync: (timestamp: string) => {
      lastSyncTimeRef.current = timestamp;
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Data synchronized successfully',
          type: 'info'
        }));
      }
    },
  });

  // Update conflict resolution strategy
  useEffect(() => {
    setConflictResolution(conflictResolution);
  }, [conflictResolution, setConflictResolution]);

  // Auto-generate alerts based on vehicle data
  const generateAlerts = useCallback(() => {
    if (autoAlertsEnabledRef.current && vehicles.length > 0) {
      dispatch(generateAutomatedAlertsAction(vehicles));
    }
  }, [vehicles, dispatch]);

  const startAutoAlertGeneration = useCallback(() => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
    }
    
    if (autoAlertsEnabledRef.current) {
      alertIntervalRef.current = setInterval(generateAlerts, alertGenerationInterval);
    }
  }, [generateAlerts, alertGenerationInterval]);

  const stopAutoAlertGeneration = useCallback(() => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
  }, []);

  // Start/stop alert generation based on connection status
  useEffect(() => {
    if (isConnected && !isOffline) {
      startAutoAlertGeneration();
    } else {
      stopAutoAlertGeneration();
    }

    return () => {
      stopAutoAlertGeneration();
    };
  }, [isConnected, isOffline, startAutoAlertGeneration, stopAutoAlertGeneration]);

  // Handle vehicle updates with conflict detection
  const handleVehicleUpdate = useCallback((vehicleId: string, updateData: any) => {
    try {
      if (!isConnected) {
        // Queue update for when connection is restored
        addPendingUpdate(`vehicle_${vehicleId}`, updateData);
        pendingUpdatesRef.current += 1;
        
        if (syncNotifications) {
          dispatch(showNotification({
            message: `Vehicle update queued (offline)`,
            type: 'info'
          }));
        }
      } else {
        // Send update immediately
        send({
          type: 'vehicle_update',
          timestamp: new Date().toISOString(),
          data: updateData,
        });
      }
    } catch (error) {
      console.error('Error handling vehicle update:', error);
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Failed to update vehicle data',
          type: 'error'
        }));
      }
    }
  }, [isConnected, addPendingUpdate, send, syncNotifications, dispatch]);

  // Handle battery updates with conflict detection
  const handleBatteryUpdate = useCallback((vehicleId: string, batteryData: any) => {
    try {
      if (!isConnected) {
        addPendingUpdate(`battery_${vehicleId}`, batteryData);
        pendingUpdatesRef.current += 1;
      } else {
        send({
          type: 'battery_update',
          timestamp: new Date().toISOString(),
          data: { vehicleId, ...batteryData },
        });
      }
    } catch (error) {
      console.error('Error handling battery update:', error);
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Failed to update battery data',
          type: 'error'
        }));
      }
    }
  }, [isConnected, addPendingUpdate, send, syncNotifications, dispatch]);

  // Handle location updates with conflict detection
  const handleLocationUpdate = useCallback((vehicleId: string, locationData: any) => {
    try {
      if (!isConnected) {
        addPendingUpdate(`location_${vehicleId}`, locationData);
        pendingUpdatesRef.current += 1;
      } else {
        send({
          type: 'location_update',
          timestamp: new Date().toISOString(),
          data: { vehicleId, ...locationData },
        });
      }
    } catch (error) {
      console.error('Error handling location update:', error);
      if (syncNotifications) {
        dispatch(showNotification({
          message: 'Failed to update location data',
          type: 'error'
        }));
      }
    }
  }, [isConnected, addPendingUpdate, send, syncNotifications, dispatch]);

  const forceSync = useCallback(() => {
    if (isConnected) {
      send({
        type: 'sync_request',
        timestamp: new Date().toISOString(),
        data: {
          lastSyncTimestamp: lastSyncTimestamp,
          clientId: `client-${Date.now()}`,
        },
      });
    }
  }, [isConnected, send, lastSyncTimestamp]);

  const enableAutoAlertsFunc = useCallback(() => {
    autoAlertsEnabledRef.current = true;
    if (isConnected && !isOffline) {
      startAutoAlertGeneration();
    }
  }, [isConnected, isOffline, startAutoAlertGeneration]);

  const disableAutoAlertsFunc = useCallback(() => {
    autoAlertsEnabledRef.current = false;
    stopAutoAlertGeneration();
  }, [stopAutoAlertGeneration]);

  // Update sync timestamp
  useEffect(() => {
    if (lastSyncTimestamp) {
      lastSyncTimeRef.current = lastSyncTimestamp;
    }
  }, [lastSyncTimestamp]);

  // Reset pending updates count when connected
  useEffect(() => {
    if (isConnected && !isOffline) {
      pendingUpdatesRef.current = 0;
    }
  }, [isConnected, isOffline]);

  return {
    isRealTimeActive: isConnected && !isOffline,
    lastSyncTime: lastSyncTimeRef.current,
    pendingUpdatesCount: pendingUpdatesRef.current,
    forceSync,
    enableAutoAlerts: enableAutoAlertsFunc,
    disableAutoAlerts: disableAutoAlertsFunc,
    handleVehicleUpdate,
    handleBatteryUpdate,
    handleLocationUpdate,
  };
};

// Hook for real-time vehicle monitoring
export const useRealTimeVehicleMonitoring = (vehicleId?: string) => {
  const vehicle = useAppSelector(state => 
    vehicleId ? state.fleet.vehicles.find(v => v.id === vehicleId) : null
  );
  
  const { isRealTimeActive } = useRealTimeSync();
  
  const lastUpdateTime = vehicle?.updatedAt ? new Date(vehicle.updatedAt).getTime() : 0;
  const isStale = Date.now() - lastUpdateTime > 60000; // 1 minute threshold
  
  return {
    vehicle,
    isRealTimeActive,
    isStale,
    lastUpdateTime: vehicle?.updatedAt || null,
  };
};

// Hook for real-time alert monitoring
export const useRealTimeAlerts = () => {
  const alerts = useAppSelector(state => state.alerts.alerts);
  const unreadCount = useAppSelector(state => state.alerts.unreadCount);
  const { isRealTimeActive } = useRealTimeSync();
  
  const recentAlerts = alerts.filter(alert => {
    const alertTime = new Date(alert.timestamp).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return alertTime > fiveMinutesAgo;
  });
  
  return {
    alerts,
    recentAlerts,
    unreadCount,
    isRealTimeActive,
    hasRecentAlerts: recentAlerts.length > 0,
  };
};