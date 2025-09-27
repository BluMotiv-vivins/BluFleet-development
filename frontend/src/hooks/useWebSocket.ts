import { useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { webSocketService } from '../services/websocket';
import { setOfflineStatus } from '../store/slices/uiSlice';
import type { ConnectionState } from '../store/slices/uiSlice';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onReconnect?: () => void;
  onDataSync?: (timestamp: string) => void;
  conflictResolution?: 'server_wins' | 'client_wins' | 'merge';
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  isOffline: boolean;
  connect: () => void;
  disconnect: () => void;
  send: (message: any) => void;
  lastSyncTimestamp: string | null;
  addPendingUpdate: (key: string, data: any) => void;
  setConflictResolution: (strategy: 'server_wins' | 'client_wins' | 'merge') => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onReconnect,
    onDataSync,
    conflictResolution = 'server_wins',
  } = options;

  const dispatch = useAppDispatch();
  const connectionState = useAppSelector(state => state.ui.connectionStatus);
  const isOffline = useAppSelector(state => state.ui.isOffline);
  
  const previousConnectionState = useRef<ConnectionState>('disconnected');
  const onlineStatusRef = useRef(navigator.onLine);
  const lastSyncTimestamp = useRef<string | null>(null);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      onlineStatusRef.current = true;
      dispatch(setOfflineStatus(false));
      
      // Reconnect if we were previously connected
      if (previousConnectionState.current === 'connected') {
        webSocketService.connect();
      }
    };

    const handleOffline = () => {
      onlineStatusRef.current = false;
      dispatch(setOfflineStatus(true));
      webSocketService.disconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    dispatch(setOfflineStatus(!navigator.onLine));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // Handle connection state changes
  useEffect(() => {
    const prevState = previousConnectionState.current;
    
    if (connectionState !== prevState) {
      switch (connectionState) {
        case 'connected':
          if (prevState === 'reconnecting') {
            onReconnect?.();
          } else {
            onConnect?.();
          }
          break;
          
        case 'disconnected':
        case 'error':
          if (prevState === 'connected') {
            onDisconnect?.();
          }
          break;
      }
      
      previousConnectionState.current = connectionState;
    }
  }, [connectionState, onConnect, onDisconnect, onReconnect]);

  // Auto-connect on mount and set conflict resolution strategy
  useEffect(() => {
    webSocketService.setConflictResolutionStrategy(conflictResolution);
    
    if (autoConnect && navigator.onLine) {
      webSocketService.connect();
    }

    return () => {
      if (autoConnect) {
        webSocketService.disconnect();
      }
    };
  }, [autoConnect, conflictResolution]);

  // Monitor sync timestamp changes
  useEffect(() => {
    const checkSyncTimestamp = () => {
      const currentTimestamp = webSocketService.getLastSyncTimestamp();
      if (currentTimestamp !== lastSyncTimestamp.current) {
        lastSyncTimestamp.current = currentTimestamp;
        onDataSync?.(currentTimestamp || '');
      }
    };

    const interval = setInterval(checkSyncTimestamp, 1000);
    return () => clearInterval(interval);
  }, [onDataSync]);

  const connect = useCallback(() => {
    if (navigator.onLine) {
      webSocketService.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const send = useCallback((message: any) => {
    webSocketService.send(message);
  }, []);

  const addPendingUpdate = useCallback((key: string, data: any) => {
    webSocketService.addPendingUpdate(key, data);
  }, []);

  const setConflictResolution = useCallback((strategy: 'server_wins' | 'client_wins' | 'merge') => {
    webSocketService.setConflictResolutionStrategy(strategy);
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isOffline,
    connect,
    disconnect,
    send,
    lastSyncTimestamp: lastSyncTimestamp.current,
    addPendingUpdate,
    setConflictResolution,
  };
};

// Hook for connection status indicator
export const useConnectionStatus = () => {
  const connectionState = useAppSelector(state => state.ui.connectionStatus);
  const isOffline = useAppSelector(state => state.ui.isOffline);

  const getStatusColor = useCallback(() => {
    if (isOffline) return 'gray';
    
    switch (connectionState) {
      case 'connected':
        return 'green';
      case 'connecting':
      case 'reconnecting':
        return 'yellow';
      case 'disconnected':
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  }, [connectionState, isOffline]);

  const getStatusText = useCallback(() => {
    if (isOffline) return 'Offline';
    
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  }, [connectionState, isOffline]);

  return {
    connectionState,
    isOffline,
    isConnected: connectionState === 'connected' && !isOffline,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
  };
};