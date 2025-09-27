import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { webSocketService } from '../websocket';
import { store } from '../../store';
import { updateVehicle, updateVehicleBattery, updateVehicleLocation } from '../../store/slices/fleetSlice';
import { addAlert } from '../../store/slices/alertSlice';
import { setConnectionStatus } from '../../store/slices/uiSlice';

// Mock the store
vi.mock('../../store', () => ({
  store: {
    dispatch: vi.fn(),
  },
}));

// Mock WebSocket
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public url: string;

  constructor(url: string) {
    this.url = url;
  }

  send(data: string) {
    // Mock send implementation
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));
    }
  }

  // Simulate connection opening
  simulateOpen() {
    this.readyState = WebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  // Simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  // Simulate connection error
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any;
Object.assign(global.WebSocket, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
});

describe('WebSocket Service', () => {
  let mockDispatch: Mock;

  beforeEach(() => {
    mockDispatch = vi.fn();
    (store.dispatch as Mock) = mockDispatch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    webSocketService.disconnect();
  });

  describe('Connection Management', () => {
    it('should establish connection when connect is called', () => {
      webSocketService.connect();
      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('connecting'));
    });

    it('should handle successful connection', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      
      ws.simulateOpen();
      
      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('connected'));
    });

    it('should handle connection errors', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      
      ws.simulateError();
      
      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('error'));
    });

    it('should handle disconnection', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      
      ws.simulateOpen();
      ws.close();
      
      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('disconnected'));
    });

    it('should not reconnect when manually disconnected', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      
      ws.simulateOpen();
      webSocketService.disconnect();
      
      expect(webSocketService.getConnectionState()).toBe('disconnected');
    });
  });

  describe('Message Handling', () => {
    beforeEach(() => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      ws.simulateOpen();
      mockDispatch.mockClear(); // Clear connection-related dispatches
    });

    it('should handle vehicle update messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const now = new Date();
      const vehicleData = {
        id: 'EV-001',
        name: 'Test Vehicle',
        type: 'truck',
        status: 'active',
        location: { lat: 47.6062, lng: -122.3321 },
        battery: { currentLevel: 80, health: 95, lastCharged: now, estimatedRange: 200 },
        alerts: [],
        createdAt: now,
        updatedAt: now,
      };

      ws.simulateMessage({
        type: 'vehicle_update',
        timestamp: new Date().toISOString(),
        data: vehicleData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(updateVehicle(expect.objectContaining({
        id: vehicleData.id,
        name: vehicleData.name,
        type: vehicleData.type,
        status: vehicleData.status,
        location: vehicleData.location,
        battery: expect.objectContaining({
          currentLevel: vehicleData.battery.currentLevel,
          health: vehicleData.battery.health,
          estimatedRange: vehicleData.battery.estimatedRange,
        }),
        alerts: vehicleData.alerts,
      })));
    });

    it('should handle battery update messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const batteryData = {
        vehicleId: 'EV-001',
        batteryLevel: 75,
        health: 92,
        estimatedRange: 180,
      };

      ws.simulateMessage({
        type: 'battery_update',
        timestamp: new Date().toISOString(),
        data: batteryData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(updateVehicleBattery({
        id: batteryData.vehicleId,
        level: batteryData.batteryLevel,
      }));
    });

    it('should handle location update messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const locationData = {
        vehicleId: 'EV-001',
        lat: 47.6062,
        lng: -122.3321,
        address: 'Seattle, WA',
      };

      ws.simulateMessage({
        type: 'location_update',
        timestamp: new Date().toISOString(),
        data: locationData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(updateVehicleLocation({
        id: locationData.vehicleId,
        lat: locationData.lat,
        lng: locationData.lng,
        address: locationData.address,
      }));
    });

    it('should handle alert messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const alertData = {
        id: 'alert-001',
        type: 'battery',
        severity: 'high',
        title: 'Low Battery',
        message: 'Vehicle EV-001 has low battery',
        vehicleId: 'EV-001',
        timestamp: new Date(),
        acknowledged: false,
      };

      ws.simulateMessage({
        type: 'alert',
        timestamp: new Date().toISOString(),
        data: alertData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(addAlert(expect.objectContaining({
        id: alertData.id,
        type: alertData.type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        vehicleId: alertData.vehicleId,
        acknowledged: alertData.acknowledged,
      })));
    });

    it('should handle pong messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;

      ws.simulateMessage({
        type: 'pong',
        timestamp: new Date().toISOString(),
      });

      // Pong messages shouldn't trigger any dispatches
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle vehicle status update messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const statusData = {
        vehicleId: 'EV-001',
        status: 'charging',
        timestamp: new Date().toISOString(),
      };

      ws.simulateMessage({
        type: 'vehicle_status_update',
        timestamp: new Date().toISOString(),
        data: statusData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: expect.stringContaining('updateVehicleStatus'),
      }));
    });

    it('should handle charging status update messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const chargingData = {
        vehicleId: 'EV-001',
        isCharging: true,
        chargingStationId: 'CS-001',
        estimatedCompletionTime: new Date().toISOString(),
      };

      ws.simulateMessage({
        type: 'charging_status_update',
        timestamp: new Date().toISOString(),
        data: chargingData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: expect.stringContaining('updateVehicleStatus'),
      }));
    });

    it('should handle bulk alerts messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const alertsData = [
        {
          id: 'alert-001',
          type: 'battery',
          severity: 'high',
          title: 'Low Battery',
          message: 'Vehicle EV-001 has low battery',
          vehicleId: 'EV-001',
          timestamp: new Date(),
          acknowledged: false,
        },
        {
          id: 'alert-002',
          type: 'maintenance',
          severity: 'medium',
          title: 'Maintenance Due',
          message: 'Vehicle EV-002 needs maintenance',
          vehicleId: 'EV-002',
          timestamp: new Date(),
          acknowledged: false,
        },
      ];

      ws.simulateMessage({
        type: 'bulk_alerts',
        timestamp: new Date().toISOString(),
        data: alertsData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: expect.stringContaining('addBulkAlerts'),
      }));
    });

    it('should handle sync data messages', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const syncData = {
        vehicles: [{
          id: 'EV-001',
          name: 'Test Vehicle',
          type: 'truck',
          status: 'active',
          location: { lat: 47.6062, lng: -122.3321 },
          battery: { currentLevel: 80, health: 95, lastCharged: new Date(), estimatedRange: 200 },
          alerts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        chargingStations: [],
        drivers: [],
        alerts: [],
        timestamp: new Date().toISOString(),
      };

      ws.simulateMessage({
        type: 'sync_data',
        timestamp: new Date().toISOString(),
        data: syncData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: expect.stringContaining('syncData'),
      }));
    });

    it('should emit data freshness events for vehicle updates', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const eventSpy = vi.spyOn(window, 'dispatchEvent');
      const now = new Date();
      
      const vehicleData = {
        id: 'EV-001',
        name: 'Test Vehicle',
        type: 'truck',
        status: 'active',
        location: { lat: 47.6062, lng: -122.3321 },
        battery: { currentLevel: 80, health: 95, lastCharged: now, estimatedRange: 200 },
        alerts: [],
        createdAt: now,
        updatedAt: now,
      };

      ws.simulateMessage({
        type: 'vehicle_update',
        timestamp: new Date().toISOString(),
        data: vehicleData,
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dataFreshnessUpdate',
          detail: expect.objectContaining({
            dataType: 'vehicles',
            timestamp: expect.any(Date),
          }),
        })
      );
      
      eventSpy.mockRestore();
    });

    it('should emit performance tracking events', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const eventSpy = vi.spyOn(window, 'dispatchEvent');

      ws.simulateMessage({
        type: 'pong',
        timestamp: new Date().toISOString(),
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'webSocketMessage',
          detail: expect.objectContaining({
            message: expect.objectContaining({
              type: 'pong',
            }),
          }),
        })
      );
      
      eventSpy.mockRestore();
    });

    it('should handle unknown message types gracefully', () => {
      const ws = (webSocketService as any).ws as MockWebSocket;
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      ws.simulateMessage({
        type: 'unknown_type',
        timestamp: new Date().toISOString(),
        data: {},
      });

      expect(consoleSpy).toHaveBeenCalledWith('Unknown WebSocket message type:', 'unknown_type');
      consoleSpy.mockRestore();
    });
  });

  describe('Message Sending', () => {
    it('should send messages when connected', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      const sendSpy = vi.spyOn(ws, 'send');
      
      ws.simulateOpen();

      const message = {
        type: 'ping' as const,
        timestamp: new Date().toISOString(),
      };

      webSocketService.send(message);

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should queue messages when disconnected', () => {
      const message = {
        type: 'ping' as const,
        timestamp: new Date().toISOString(),
      };

      webSocketService.send(message);

      // Message should be queued
      const messageQueue = (webSocketService as any).messageQueue;
      expect(messageQueue).toContain(message);
    });

    it('should process queued messages when connection is restored', () => {
      const message = {
        type: 'ping' as const,
        timestamp: new Date().toISOString(),
      };

      // Send message while disconnected
      webSocketService.send(message);

      // Connect and simulate open
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      const sendSpy = vi.spyOn(ws, 'send');
      
      ws.simulateOpen();

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message));
    });
  });

  describe('Heartbeat', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should send ping messages at regular intervals', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      const sendSpy = vi.spyOn(ws, 'send');
      
      ws.simulateOpen();
      sendSpy.mockClear(); // Clear the initial connection messages

      // Fast-forward time to trigger heartbeat
      vi.advanceTimersByTime(30000); // 30 seconds

      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"ping"')
      );
    });
  });

  describe('Connection Metrics', () => {
    it('should provide connection metrics', () => {
      const metrics = webSocketService.getConnectionMetrics();
      
      expect(metrics).toHaveProperty('clientId');
      expect(metrics).toHaveProperty('connectionState');
      expect(metrics).toHaveProperty('reconnectAttempts');
      expect(metrics).toHaveProperty('pendingUpdatesCount');
      expect(metrics).toHaveProperty('messageQueueLength');
      expect(metrics).toHaveProperty('lastSyncTimestamp');
      expect(metrics).toHaveProperty('conflictResolutionStrategy');
    });

    it('should track pending updates count', () => {
      const service = webSocketService as any;
      
      service.addPendingUpdate('vehicle_EV-001', { status: 'charging' });
      service.addPendingUpdate('battery_EV-002', { level: 75 });
      
      const metrics = webSocketService.getConnectionMetrics();
      expect(metrics.pendingUpdatesCount).toBe(2);
    });

    it('should allow clearing pending updates', () => {
      const service = webSocketService as any;
      
      service.addPendingUpdate('vehicle_EV-001', { status: 'charging' });
      service.addPendingUpdate('battery_EV-002', { level: 75 });
      
      webSocketService.clearPendingUpdates();
      
      const metrics = webSocketService.getConnectionMetrics();
      expect(metrics.pendingUpdatesCount).toBe(0);
    });

    it('should provide pending updates map', () => {
      const service = webSocketService as any;
      
      service.addPendingUpdate('vehicle_EV-001', { status: 'charging' });
      
      const pendingUpdates = webSocketService.getPendingUpdates();
      expect(pendingUpdates.size).toBe(1);
      expect(pendingUpdates.has('vehicle_EV-001')).toBe(true);
    });
  });

  describe('Conflict Resolution', () => {
    beforeEach(() => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      ws.simulateOpen();
      mockDispatch.mockClear();
    });

    it('should resolve vehicle update conflicts using server_wins strategy', () => {
      const service = webSocketService as any;
      service.setConflictResolutionStrategy('server_wins');
      
      // Add a pending update
      const pendingVehicleData = {
        id: 'EV-001',
        name: 'Client Updated Vehicle',
        status: 'maintenance',
        timestamp: new Date(Date.now() - 1000).toISOString(), // Older timestamp
      };
      
      service.addPendingUpdate('vehicle_EV-001', pendingVehicleData);
      
      // Simulate server update
      const ws = service.ws as MockWebSocket;
      const now = new Date();
      const serverVehicleData = {
        id: 'EV-001',
        name: 'Server Updated Vehicle',
        type: 'truck',
        status: 'active',
        location: { lat: 47.6062, lng: -122.3321 },
        battery: { currentLevel: 80, health: 95, lastCharged: now, estimatedRange: 200 },
        alerts: [],
        createdAt: now,
        updatedAt: now,
        timestamp: new Date().toISOString(), // Newer timestamp
      };

      ws.simulateMessage({
        type: 'vehicle_update',
        timestamp: new Date().toISOString(),
        data: serverVehicleData,
      });

      // Should dispatch the server version (server_wins strategy)
      expect(mockDispatch).toHaveBeenCalledWith(updateVehicle(expect.objectContaining({
        id: 'EV-001',
        name: 'Server Updated Vehicle',
        status: 'active',
      })));
    });

    it('should resolve battery update conflicts', () => {
      const service = webSocketService as any;
      
      // Add a pending battery update
      const pendingBatteryData = {
        vehicleId: 'EV-001',
        batteryLevel: 70,
        timestamp: new Date(Date.now() - 1000).toISOString(),
      };
      
      service.addPendingUpdate('battery_EV-001', pendingBatteryData);
      
      // Simulate server battery update
      const ws = service.ws as MockWebSocket;
      const serverBatteryData = {
        vehicleId: 'EV-001',
        batteryLevel: 75,
        health: 92,
        estimatedRange: 180,
      };

      ws.simulateMessage({
        type: 'battery_update',
        timestamp: new Date().toISOString(),
        data: serverBatteryData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(updateVehicleBattery({
        id: 'EV-001',
        level: 75, // Server value should win
      }));
    });

    it('should resolve location update conflicts', () => {
      const service = webSocketService as any;
      
      // Add a pending location update
      const pendingLocationData = {
        vehicleId: 'EV-001',
        lat: 47.6000,
        lng: -122.3000,
        timestamp: new Date(Date.now() - 1000).toISOString(),
      };
      
      service.addPendingUpdate('location_EV-001', pendingLocationData);
      
      // Simulate server location update
      const ws = service.ws as MockWebSocket;
      const serverLocationData = {
        vehicleId: 'EV-001',
        lat: 47.6062,
        lng: -122.3321,
        address: 'Seattle, WA',
      };

      ws.simulateMessage({
        type: 'location_update',
        timestamp: new Date().toISOString(),
        data: serverLocationData,
      });

      expect(mockDispatch).toHaveBeenCalledWith(updateVehicleLocation({
        id: 'EV-001',
        lat: 47.6062, // Server value should win
        lng: -122.3321,
        address: 'Seattle, WA',
      }));
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should attempt to reconnect after disconnection', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      
      ws.simulateOpen();
      ws.close(); // Simulate unexpected disconnection

      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('reconnecting'));

      // Fast-forward time to trigger reconnection
      vi.advanceTimersByTime(3000);

      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('connecting'));
    });

    it('should use exponential backoff for reconnection attempts', () => {
      const service = webSocketService as any;
      
      webSocketService.connect();
      let ws = service.ws as MockWebSocket;
      
      ws.simulateOpen();
      ws.close();

      // First reconnection attempt
      vi.advanceTimersByTime(3000);
      ws = service.ws as MockWebSocket;
      ws.close();

      // Second reconnection attempt should have longer delay
      const reconnectAttempts = service.reconnectAttempts;
      expect(reconnectAttempts).toBe(2);
    });

    it('should stop reconnecting after max attempts', () => {
      const service = webSocketService as any;
      service.config.maxReconnectAttempts = 2;
      
      webSocketService.connect();
      let ws = service.ws as MockWebSocket;
      
      ws.simulateOpen();

      // Simulate multiple failed reconnection attempts
      for (let i = 0; i < 3; i++) {
        ws.close();
        vi.advanceTimersByTime(10000);
        ws = service.ws as MockWebSocket;
      }

      expect(mockDispatch).toHaveBeenCalledWith(setConnectionStatus('error'));
    });

    it('should request data sync after reconnection', () => {
      webSocketService.connect();
      const ws = (webSocketService as any).ws as MockWebSocket;
      const sendSpy = vi.spyOn(ws, 'send');
      
      ws.simulateOpen();

      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining('"type":"sync_request"')
      );
    });
  });
});