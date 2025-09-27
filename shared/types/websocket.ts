// WebSocket-specific types for BluFleet
// Version: 1.0.0

// Base WebSocket Message
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  clientId?: string;
  requestId?: string;
}

// Connection Management
export interface ConnectionMessage {
  type: 'connection' | 'disconnection' | 'ping' | 'pong';
  clientId: string;
  timestamp: string;
}

export interface AuthMessage {
  type: 'auth';
  payload: {
    token: string;
    organizationId: string;
  };
}

export interface AuthResponseMessage {
  type: 'auth_response';
  payload: {
    success: boolean;
    clientId: string;
    permissions: string[];
    error?: string;
  };
}

// Subscription Management
export interface SubscribeMessage {
  type: 'subscribe';
  payload: {
    channels: string[];
    filters?: Record<string, any>;
  };
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  payload: {
    channels: string[];
  };
}

export interface SubscriptionResponseMessage {
  type: 'subscription_response';
  payload: {
    success: boolean;
    channels: string[];
    error?: string;
  };
}

// Real-time Data Updates
export interface VehicleUpdateMessage {
  type: 'vehicle_update';
  payload: {
    vehicleId: string;
    updates: {
      location?: {
        latitude: number;
        longitude: number;
        timestamp: string;
      };
      batterySoc?: number;
      batterySoh?: number;
      status?: string;
      speed?: number;
      heading?: number;
      odometerKm?: number;
    };
  };
}

export interface TripUpdateMessage {
  type: 'trip_update';
  payload: {
    tripId: string;
    vehicleId: string;
    driverId?: string;
    status: 'started' | 'updated' | 'completed' | 'cancelled';
    updates: {
      currentLocation?: {
        latitude: number;
        longitude: number;
      };
      distanceKm?: number;
      energyConsumedKwh?: number;
      duration?: number;
    };
  };
}

export interface ChargingUpdateMessage {
  type: 'charging_update';
  payload: {
    sessionId: string;
    vehicleId: string;
    stationId: string;
    status: 'started' | 'charging' | 'completed' | 'failed' | 'cancelled';
    updates: {
      energyDelivered?: number;
      currentPower?: number;
      estimatedTimeRemaining?: number;
      cost?: number;
    };
  };
}

export interface AlertMessage {
  type: 'alert';
  payload: {
    alertId: string;
    vehicleId?: string;
    driverId?: string;
    alertType: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    description?: string;
    data?: Record<string, any>;
    timestamp: string;
  };
}

export interface MaintenanceUpdateMessage {
  type: 'maintenance_update';
  payload: {
    maintenanceId: string;
    vehicleId: string;
    status: 'scheduled' | 'started' | 'completed' | 'cancelled';
    updates: {
      estimatedCompletion?: string;
      actualCost?: number;
      notes?: string;
    };
  };
}

// Fleet Analytics Updates
export interface FleetMetricsUpdateMessage {
  type: 'fleet_metrics_update';
  payload: {
    timestamp: string;
    metrics: {
      activeVehicles: number;
      totalTrips: number;
      averageBatterySoc: number;
      totalEnergyConsumed: number;
      alertCount: number;
    };
  };
}

export interface EnergyMetricsUpdateMessage {
  type: 'energy_metrics_update';
  payload: {
    timestamp: string;
    metrics: {
      totalEnergyConsumed: number;
      totalEnergyCharged: number;
      activeChargingSessions: number;
      averageEfficiency: number;
    };
  };
}

// Driver Updates
export interface DriverUpdateMessage {
  type: 'driver_update';
  payload: {
    driverId: string;
    updates: {
      status?: string;
      currentVehicleId?: string;
      performanceScore?: number;
      ecoScore?: number;
      safetyScore?: number;
    };
  };
}

// Geofence Events
export interface GeofenceEventMessage {
  type: 'geofence_event';
  payload: {
    vehicleId: string;
    driverId?: string;
    geofenceId: string;
    geofenceName: string;
    eventType: 'entry' | 'exit' | 'violation';
    location: {
      latitude: number;
      longitude: number;
    };
    timestamp: string;
    severity: 'info' | 'warning' | 'error';
  };
}

// System Events
export interface SystemEventMessage {
  type: 'system_event';
  payload: {
    eventType: 'maintenance_window' | 'service_degradation' | 'service_restored';
    message: string;
    affectedServices?: string[];
    estimatedDuration?: number;
    timestamp: string;
  };
}

// Bulk Data Sync
export interface DataSyncRequestMessage {
  type: 'data_sync_request';
  payload: {
    lastSyncTimestamp?: string;
    entities: ('vehicles' | 'drivers' | 'trips' | 'alerts' | 'charging_sessions')[];
  };
}

export interface DataSyncResponseMessage {
  type: 'data_sync_response';
  payload: {
    timestamp: string;
    vehicles?: Array<{
      id: string;
      updates: Record<string, any>;
      lastModified: string;
    }>;
    drivers?: Array<{
      id: string;
      updates: Record<string, any>;
      lastModified: string;
    }>;
    trips?: Array<{
      id: string;
      updates: Record<string, any>;
      lastModified: string;
    }>;
    alerts?: Array<{
      id: string;
      updates: Record<string, any>;
      lastModified: string;
    }>;
    chargingSessions?: Array<{
      id: string;
      updates: Record<string, any>;
      lastModified: string;
    }>;
  };
}

// Error Messages
export interface ErrorMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId?: string;
  };
}

// Channel Definitions
export type WebSocketChannel = 
  | 'fleet_updates'
  | 'vehicle_telemetry'
  | 'trip_updates'
  | 'charging_updates'
  | 'alerts'
  | 'maintenance_updates'
  | 'driver_updates'
  | 'geofence_events'
  | 'system_events'
  | 'analytics_updates';

// Message Union Type
export type WebSocketMessageType = 
  | ConnectionMessage
  | AuthMessage
  | AuthResponseMessage
  | SubscribeMessage
  | UnsubscribeMessage
  | SubscriptionResponseMessage
  | VehicleUpdateMessage
  | TripUpdateMessage
  | ChargingUpdateMessage
  | AlertMessage
  | MaintenanceUpdateMessage
  | FleetMetricsUpdateMessage
  | EnergyMetricsUpdateMessage
  | DriverUpdateMessage
  | GeofenceEventMessage
  | SystemEventMessage
  | DataSyncRequestMessage
  | DataSyncResponseMessage
  | ErrorMessage;

// Client State
export interface WebSocketClientState {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  clientId?: string;
  subscribedChannels: string[];
  lastPingTime?: number;
  lastPongTime?: number;
  reconnectAttempts: number;
  isAuthenticated: boolean;
}

// Connection Options
export interface WebSocketConnectionOptions {
  url: string;
  token?: string;
  organizationId?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  pingInterval?: number;
  pongTimeout?: number;
}

// Event Handlers
export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onMessage?: (message: WebSocketMessageType) => void;
  onVehicleUpdate?: (data: VehicleUpdateMessage['payload']) => void;
  onTripUpdate?: (data: TripUpdateMessage['payload']) => void;
  onChargingUpdate?: (data: ChargingUpdateMessage['payload']) => void;
  onAlert?: (data: AlertMessage['payload']) => void;
  onMaintenanceUpdate?: (data: MaintenanceUpdateMessage['payload']) => void;
  onDriverUpdate?: (data: DriverUpdateMessage['payload']) => void;
  onGeofenceEvent?: (data: GeofenceEventMessage['payload']) => void;
  onSystemEvent?: (data: SystemEventMessage['payload']) => void;
}