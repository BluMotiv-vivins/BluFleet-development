import { store } from '../store';
import { updateVehicle, updateVehicleBattery, updateVehicleLocation, updateChargingStation, syncData, updateVehicleStatus } from '../store/slices/fleetSlice';
import { addAlert, addBulkAlerts } from '../store/slices/alertSlice';
import { setConnectionStatus } from '../store/slices/uiSlice';
import type { Vehicle, ChargingStation, Alert, Driver } from '../types';

// WebSocket message types
export interface WebSocketMessage {
  type: 'vehicle_update' | 'battery_update' | 'location_update' | 'charging_station_update' | 'alert' | 'ping' | 'pong' | 'bulk_alerts' | 'sync_data' | 'vehicle_status_update' | 'charging_status_update' | 'sync_request';
  timestamp: string;
  data?: any;
}

export interface VehicleUpdateMessage extends WebSocketMessage {
  type: 'vehicle_update';
  data: Vehicle;
}

export interface BatteryUpdateMessage extends WebSocketMessage {
  type: 'battery_update';
  data: {
    vehicleId: string;
    batteryLevel: number;
    health?: number;
    estimatedRange?: number;
  };
}

export interface LocationUpdateMessage extends WebSocketMessage {
  type: 'location_update';
  data: {
    vehicleId: string;
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface ChargingStationUpdateMessage extends WebSocketMessage {
  type: 'charging_station_update';
  data: ChargingStation;
}

export interface AlertMessage extends WebSocketMessage {
  type: 'alert';
  data: Alert;
}

export interface BulkAlertsMessage extends WebSocketMessage {
  type: 'bulk_alerts';
  data: Alert[];
}

export interface SyncDataMessage extends WebSocketMessage {
  type: 'sync_data';
  data: {
    vehicles?: Vehicle[];
    chargingStations?: ChargingStation[];
    drivers?: Driver[];
    alerts?: Alert[];
    timestamp: string;
  };
}

export interface VehicleStatusMessage extends WebSocketMessage {
  type: 'vehicle_status_update';
  data: {
    vehicleId: string;
    status: Vehicle['status'];
    timestamp: string;
  };
}

export interface ChargingStatusMessage extends WebSocketMessage {
  type: 'charging_status_update';
  data: {
    vehicleId: string;
    isCharging: boolean;
    chargingStationId?: string;
    estimatedCompletionTime?: string;
  };
}

export interface DataSyncRequestMessage extends WebSocketMessage {
  type: 'sync_request';
  data: {
    lastSyncTimestamp?: string;
    clientId: string;
  };
}

export type WebSocketMessageType = 
  | VehicleUpdateMessage 
  | BatteryUpdateMessage 
  | LocationUpdateMessage 
  | ChargingStationUpdateMessage 
  | AlertMessage 
  | BulkAlertsMessage
  | SyncDataMessage
  | VehicleStatusMessage
  | ChargingStatusMessage
  | DataSyncRequestMessage
  | WebSocketMessage;

// WebSocket connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// WebSocket service configuration
interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private connectionTimer: number | null = null;
  private isManualClose = false;
  private messageQueue: WebSocketMessageType[] = [];
  private lastPingTime = 0;
  private connectionState: ConnectionState = 'disconnected';
  private clientId: string;
  private lastSyncTimestamp: string | null = null;
  private syncInProgress = false;
  private pendingUpdates: Map<string, any> = new Map();
  private conflictResolutionStrategy: 'server_wins' | 'client_wins' | 'merge' = 'server_wins';

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || this.getWebSocketUrl(),
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      connectionTimeout: config.connectionTimeout || 10000,
    };
    
    // Generate unique client ID
    this.clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private getWebSocketUrl(): string {
    // In development, disable WebSocket connection to avoid console errors
    if (import.meta.env.DEV) {
      // Return a mock URL that won't actually connect
      return 'ws://localhost:8080/ws';
    }
    
    // In production, use the actual WebSocket endpoint
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  public connect(): void {
    // Enable WebSocket connection in development mode too
    if (import.meta.env.DEV) {
      console.log('WebSocket connecting in development mode to mock server...');
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualClose = false;
    this.setConnectionState('connecting');
    
    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventListeners();
      this.startConnectionTimeout();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setConnectionState('error');
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isManualClose = true;
    this.cleanup();
    this.setConnectionState('disconnected');
  }

  public send(message: WebSocketMessageType): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.messageQueue.push(message);
      }
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public setConflictResolutionStrategy(strategy: 'server_wins' | 'client_wins' | 'merge'): void {
    this.conflictResolutionStrategy = strategy;
  }

  public getLastSyncTimestamp(): string | null {
    return this.lastSyncTimestamp;
  }

  public getConnectionMetrics() {
    return {
      clientId: this.clientId,
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      pendingUpdatesCount: this.pendingUpdates.size,
      messageQueueLength: this.messageQueue.length,
      lastSyncTimestamp: this.lastSyncTimestamp,
      conflictResolutionStrategy: this.conflictResolutionStrategy,
    };
  }

  public clearPendingUpdates(): void {
    this.pendingUpdates.clear();
  }

  public getPendingUpdates(): Map<string, any> {
    return new Map(this.pendingUpdates);
  }

  private handleVehicleUpdate(vehicle: Vehicle): void {
    // Check for conflicts if we have pending updates
    const pendingKey = `vehicle_${vehicle.id}`;
    if (this.pendingUpdates.has(pendingKey)) {
      const pendingUpdate = this.pendingUpdates.get(pendingKey);
      const resolvedVehicle = this.resolveConflict(vehicle, pendingUpdate, 'vehicle');
      store.dispatch(updateVehicle(resolvedVehicle));
      this.pendingUpdates.delete(pendingKey);
      // Conflict resolved for vehicle update
    } else {
      store.dispatch(updateVehicle(vehicle));
    }
    
    // Update data freshness timestamp
    this.updateDataFreshness('vehicles');
  }

  private handleBatteryUpdate(data: { vehicleId: string; batteryLevel: number; health?: number; estimatedRange?: number }): void {
    const pendingKey = `battery_${data.vehicleId}`;
    if (this.pendingUpdates.has(pendingKey)) {
      const pendingUpdate = this.pendingUpdates.get(pendingKey);
      const resolvedData = this.resolveConflict(data, pendingUpdate, 'battery');
      store.dispatch(updateVehicleBattery({
        id: resolvedData.vehicleId,
        level: resolvedData.batteryLevel,
      }));
      this.pendingUpdates.delete(pendingKey);
      // Battery conflict resolved
    } else {
      store.dispatch(updateVehicleBattery({
        id: data.vehicleId,
        level: data.batteryLevel,
      }));
    }
    
    // Update data freshness timestamp
    this.updateDataFreshness('battery_data');
  }

  private handleLocationUpdate(data: { vehicleId: string; lat: number; lng: number; address?: string }): void {
    const pendingKey = `location_${data.vehicleId}`;
    if (this.pendingUpdates.has(pendingKey)) {
      const pendingUpdate = this.pendingUpdates.get(pendingKey);
      const resolvedData = this.resolveConflict(data, pendingUpdate, 'location');
      store.dispatch(updateVehicleLocation({
        id: resolvedData.vehicleId,
        lat: resolvedData.lat,
        lng: resolvedData.lng,
        address: resolvedData.address,
      }));
      this.pendingUpdates.delete(pendingKey);
      // Location conflict resolved
    } else {
      store.dispatch(updateVehicleLocation({
        id: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
      }));
    }
    
    // Update data freshness timestamp
    this.updateDataFreshness('location_data');
  }

  private handleVehicleStatusUpdate(data: { vehicleId: string; status: Vehicle['status']; timestamp: string }): void {
    const pendingKey = `status_${data.vehicleId}`;
    if (this.pendingUpdates.has(pendingKey)) {
      const pendingUpdate = this.pendingUpdates.get(pendingKey);
      const resolvedData = this.resolveConflict(data, pendingUpdate, 'status');
      store.dispatch(updateVehicleStatus({
        id: resolvedData.vehicleId,
        status: resolvedData.status,
      }));
      this.pendingUpdates.delete(pendingKey);
    } else {
      store.dispatch(updateVehicleStatus({
        id: data.vehicleId,
        status: data.status,
      }));
    }
  }

  private handleChargingStatusUpdate(data: { vehicleId: string; isCharging: boolean; chargingStationId?: string; estimatedCompletionTime?: string }): void {
    // Update vehicle status based on charging state
    const newStatus: Vehicle['status'] = data.isCharging ? 'charging' : 'active';
    store.dispatch(updateVehicleStatus({
      id: data.vehicleId,
      status: newStatus,
    }));
  }

  private handleDataSync(data: { vehicles?: Vehicle[]; chargingStations?: ChargingStation[]; drivers?: Driver[]; alerts?: Alert[]; timestamp: string }): void {
    if (this.syncInProgress) {
      return; // Sync already in progress
    }

    this.syncInProgress = true;
    
    try {
      // Apply conflict resolution for any pending updates
      if (this.pendingUpdates.size > 0) {
        this.resolvePendingConflicts(data);
      }

      // Sync the data
      store.dispatch(syncData({
        vehicles: data.vehicles,
        chargingStations: data.chargingStations,
        drivers: data.drivers,
      }));

      // Add any new alerts
      if (data.alerts && data.alerts.length > 0) {
        store.dispatch(addBulkAlerts(data.alerts));
      }

      this.lastSyncTimestamp = data.timestamp;
      // Data synchronization completed
    } catch (error) {
      console.error('Error during data synchronization:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private handlePongResponse(): void {
    const latency = Date.now() - this.lastPingTime;
    // WebSocket latency tracking
  }

  private resolveConflict(serverData: any, clientData: any, dataType: string): any {
    switch (this.conflictResolutionStrategy) {
      case 'server_wins':
        // Server wins conflict resolution
        return serverData;
        
      case 'client_wins':
        // Client wins conflict resolution
        return clientData;
        
      case 'merge':
        // Merge conflict resolution
        return this.mergeData(serverData, clientData);
        
      default:
        return serverData;
    }
  }

  private mergeData(serverData: any, clientData: any): any {
    // Simple merge strategy - prefer newer timestamps
    const serverTime = new Date(serverData.timestamp || serverData.updatedAt || 0).getTime();
    const clientTime = new Date(clientData.timestamp || clientData.updatedAt || 0).getTime();
    
    if (clientTime > serverTime) {
      return { ...serverData, ...clientData };
    } else {
      return { ...clientData, ...serverData };
    }
  }

  private resolvePendingConflicts(syncData: any): void {
    this.pendingUpdates.forEach((pendingUpdate, key) => {
      const [type, id] = key.split('_');
      
      switch (type) {
        case 'vehicle':
          if (syncData.vehicles) {
            const serverVehicle = syncData.vehicles.find((v: Vehicle) => v.id === id);
            if (serverVehicle) {
              const resolved = this.resolveConflict(serverVehicle, pendingUpdate, 'vehicle');
              // Update the sync data with resolved version
              const index = syncData.vehicles.findIndex((v: Vehicle) => v.id === id);
              if (index !== -1) {
                syncData.vehicles[index] = resolved;
              }
            }
          }
          break;
          
        // Add other conflict resolution cases as needed
      }
    });
    
    // Clear pending updates after resolution
    this.pendingUpdates.clear();
  }

  private requestDataSync(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const syncRequest: DataSyncRequestMessage = {
        type: 'sync_request',
        timestamp: new Date().toISOString(),
        data: {
          lastSyncTimestamp: this.lastSyncTimestamp || undefined,
          clientId: this.clientId,
        },
      };
      
      this.send(syncRequest);
      // Data synchronization requested
    }
  }

  public addPendingUpdate(key: string, data: any): void {
    this.pendingUpdates.set(key, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  private updateDataFreshness(dataType: string): void {
    // Dispatch a custom action to update data freshness
    // This will be used by the useDataFreshness hook
    try {
      window.dispatchEvent(new CustomEvent('dataFreshnessUpdate', {
        detail: { dataType, timestamp: new Date() }
      }));
    } catch (error) {
      console.error('Error dispatching data freshness update:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      // WebSocket connection established
      this.clearConnectionTimeout();
      this.setConnectionState('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.processMessageQueue();
      
      // Request data synchronization after reconnection
      this.requestDataSync();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessageType = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      // WebSocket disconnected
      this.cleanup();
      
      if (!this.isManualClose) {
        this.setConnectionState('disconnected');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.setConnectionState('error');
    };
  }

  private handleMessage(message: WebSocketMessageType): void {
    // Update last sync timestamp for data synchronization
    if (message.timestamp) {
      this.lastSyncTimestamp = message.timestamp;
    }

    // Emit performance tracking event
    let latency: number | undefined;
    if (message.type === 'pong' && this.lastPingTime > 0) {
      latency = Date.now() - this.lastPingTime;
      this.lastPingTime = 0;
    }
    
    window.dispatchEvent(new CustomEvent('webSocketMessage', {
      detail: { message, latency }
    }));

    switch (message.type) {
      case 'vehicle_update':
        this.handleVehicleUpdate((message as VehicleUpdateMessage).data);
        break;
        
      case 'battery_update':
        const batteryData = (message as BatteryUpdateMessage).data;
        this.handleBatteryUpdate(batteryData);
        break;
        
      case 'location_update':
        const locationData = (message as LocationUpdateMessage).data;
        this.handleLocationUpdate(locationData);
        break;
        
      case 'charging_station_update':
        store.dispatch(updateChargingStation((message as ChargingStationUpdateMessage).data));
        break;
        
      case 'vehicle_status_update':
        const statusData = (message as VehicleStatusMessage).data;
        this.handleVehicleStatusUpdate(statusData);
        break;
        
      case 'charging_status_update':
        const chargingData = (message as ChargingStatusMessage).data;
        this.handleChargingStatusUpdate(chargingData);
        break;
        
      case 'alert':
        store.dispatch(addAlert((message as AlertMessage).data));
        this.updateDataFreshness('alerts');
        break;
        
      case 'bulk_alerts':
        store.dispatch(addBulkAlerts((message as BulkAlertsMessage).data));
        this.updateDataFreshness('alerts');
        break;
        
      case 'sync_data':
        this.handleDataSync((message as SyncDataMessage).data);
        break;
        
      case 'pong':
        // Handle pong response for heartbeat
        this.handlePongResponse();
        break;
        
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    store.dispatch(setConnectionStatus(state));
  }

  private scheduleReconnect(): void {
    if (this.isManualClose || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setConnectionState('error');
      return;
    }

    // In development, limit reconnection attempts when mock server isn't available
    if (import.meta.env.DEV && this.reconnectAttempts >= 3) {
      console.warn('WebSocket reconnection disabled in development after 3 attempts. Mock server may not be available.');
      this.setConnectionState('error');
      return;
    }

    this.setConnectionState('reconnecting');
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    // Attempting reconnection
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString(),
        });
      }
    }, this.config.heartbeatInterval);
  }

  private startConnectionTimeout(): void {
    this.connectionTimer = setTimeout(() => {
      if (this.ws?.readyState === WebSocket.CONNECTING) {
        console.warn('WebSocket connection timeout');
        this.ws.close();
      }
    }, this.config.connectionTimeout);
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    this.clearConnectionTimeout();
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      
      this.ws = null;
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when service is imported (only in production)
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  webSocketService.connect();
}