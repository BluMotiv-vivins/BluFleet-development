import type { 
  WebSocketMessageType, 
  BatteryUpdateMessage, 
  LocationUpdateMessage, 
  AlertMessage,
  ChargingStatusMessage,
  SyncDataMessage
} from './websocket';
import type { Alert } from '../types';

// Mock WebSocket server for development
class MockWebSocketServer {
  private clients: Set<WebSocket> = new Set();
  private intervals: number[] = [];
  private vehicleIds = ['EV-001', 'EV-002', 'EV-003', 'EV-004', 'EV-005'];
  private isRunning = false;

  start(port = 8080) {
    if (this.isRunning) return;
    
    console.log(`Mock WebSocket server starting on port ${port}`);
    this.isRunning = true;
    
    // Simulate real-time updates
    this.startBatteryUpdates();
    this.startLocationUpdates();
    this.startAlertGeneration();
  }

  stop() {
    this.isRunning = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.clients.clear();
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    
    ws.addEventListener('close', () => {
      this.clients.delete(ws);
    });

    ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleClientMessage(ws, message);
      } catch (error) {
        console.error('Error parsing client message:', error);
      }
    });
  }

  private handleClientMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: new Date().toISOString(),
        });
        break;
        
      case 'sync_request':
        this.handleSyncRequest(ws, message.data);
        break;
    }
  }

  private handleSyncRequest(ws: WebSocket, data: { lastSyncTimestamp?: string; clientId: string }) {
    // Simulate data sync response
    const syncData: SyncDataMessage = {
      type: 'sync_data',
      timestamp: new Date().toISOString(),
      data: {
        vehicles: this.generateMockVehicles(),
        chargingStations: this.generateMockChargingStations(),
        drivers: this.generateMockDrivers(),
        alerts: this.generateMockAlerts(),
        timestamp: new Date().toISOString(),
      },
    };

    // Send sync data to requesting client
    this.sendToClient(ws, syncData);
    console.log(`Sent sync data to client ${data.clientId}`);
  }

  private generateMockVehicles() {
    const types = ['truck', 'forklift', 'van', 'car'] as const;
    const statuses = ['active', 'charging', 'maintenance', 'offline'] as const;
    
    return this.vehicleIds.map(id => ({
      id,
      name: `Vehicle ${id}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: {
        lat: 47.6062 + (Math.random() - 0.5) * 0.01,
        lng: -122.3321 + (Math.random() - 0.5) * 0.01,
        address: this.generateRandomAddress(),
      },
      battery: {
        currentLevel: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 20) + 80,
        lastCharged: new Date(),
        estimatedRange: Math.floor(Math.random() * 200) + 50,
      },
      alerts: [],
      complianceStatus: {
        overallStatus: 'compliant' as const,
        badges: [],
        lastAudit: new Date(),
        nextAuditDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        violations: [],
        certifications: []
      },
      accessPermissions: [],
      emergencyProtocols: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private generateMockDrivers() {
    const driverStatuses = ['active', 'offline', 'break'] as const;
    
    return [
      {
        id: 'D-001',
        name: 'John Smith',
        email: 'john.smith@blufleet.com',
        safetyScore: Math.floor(Math.random() * 20) + 80,
        ecoScore: Math.floor(Math.random() * 20) + 80,
        totalMiles: Math.floor(Math.random() * 50000) + 10000,
        recentAlerts: [],
        certifications: ['Commercial License', 'Safety Training'],
        status: driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
      },
      {
        id: 'D-002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@blufleet.com',
        safetyScore: Math.floor(Math.random() * 20) + 80,
        ecoScore: Math.floor(Math.random() * 20) + 80,
        totalMiles: Math.floor(Math.random() * 50000) + 10000,
        recentAlerts: [],
        certifications: ['Commercial License', 'Eco Driving'],
        status: driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
      },
    ];
  }

  private generateMockChargingStations() {
    return [
      {
        id: 'CS-001',
        name: 'Main Depot Charger',
        location: {
          lat: 47.6205,
          lng: -122.3493,
          address: '123 Fleet St, Seattle, WA',
        },
        status: 'available' as const,
        powerOutput: 150,
        connectorTypes: ['CCS', 'CHAdeMO'],
        queue: [],
        pricing: { rate: 20, currency: 'INR' },
      },
      {
        id: 'CS-002',
        name: 'Portland Hub Charger',
        location: {
          lat: 45.5152,
          lng: -122.6784,
          address: '456 Industrial Ave, Portland, OR',
        },
        status: 'occupied' as const,
        powerOutput: 100,
        connectorTypes: ['CCS'],
        currentVehicle: this.getRandomVehicleId(),
        queue: [],
        pricing: { rate: 18, currency: 'INR' },
      },
    ];
  }



  private generateMockAlerts() {
    return Array.from({ length: Math.floor(Math.random() * 5) }, () => this.generateRandomAlert());
  }

  private broadcast(message: WebSocketMessageType) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
    });
  }

  private sendToClient(client: WebSocket, message: WebSocketMessageType) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  }

  private startBatteryUpdates() {
    const interval = setInterval(() => {
      if (!this.isRunning) return;

      const vehicleId = this.getRandomVehicleId();
      const batteryLevel = Math.max(5, Math.min(100, 
        Math.floor(Math.random() * 100) + (Math.random() - 0.5) * 10
      ));

      const message: BatteryUpdateMessage = {
        type: 'battery_update',
        timestamp: new Date().toISOString(),
        data: {
          vehicleId,
          batteryLevel,
          health: Math.floor(Math.random() * 10) + 85,
          estimatedRange: Math.floor(batteryLevel * 2.5),
        },
      };

      this.broadcast(message);

      // Occasionally send charging status updates
      if (Math.random() < 0.3) {
        const chargingMessage: ChargingStatusMessage = {
          type: 'charging_status_update',
          timestamp: new Date().toISOString(),
          data: {
            vehicleId,
            isCharging: batteryLevel < 30 || Math.random() < 0.2,
            chargingStationId: Math.random() < 0.5 ? 'CS-001' : 'CS-002',
            estimatedCompletionTime: new Date(Date.now() + Math.random() * 3600000).toISOString(),
          },
        };
        this.broadcast(chargingMessage);
      }
    }, 5000); // Every 5 seconds

    this.intervals.push(interval);
  }

  private startLocationUpdates() {
    const interval = setInterval(() => {
      if (!this.isRunning) return;

      const vehicleId = this.getRandomVehicleId();
      
      // Seattle area coordinates with small random variations
      const baseLat = 47.6062;
      const baseLng = -122.3321;
      const variation = 0.01;
      
      const lat = baseLat + (Math.random() - 0.5) * variation;
      const lng = baseLng + (Math.random() - 0.5) * variation;

      const message: LocationUpdateMessage = {
        type: 'location_update',
        timestamp: new Date().toISOString(),
        data: {
          vehicleId,
          lat,
          lng,
          address: this.generateRandomAddress(),
        },
      };

      this.broadcast(message);
    }, 10000); // Every 10 seconds

    this.intervals.push(interval);
  }

  private startAlertGeneration() {
    const interval = setInterval(() => {
      if (!this.isRunning) return;

      // Generate alerts less frequently
      if (Math.random() < 0.3) { // 30% chance every interval
        const alert = this.generateRandomAlert();
        
        const message: AlertMessage = {
          type: 'alert',
          timestamp: new Date().toISOString(),
          data: alert,
        };

        this.broadcast(message);
      }
    }, 30000); // Every 30 seconds

    this.intervals.push(interval);
  }

  private getRandomVehicleId(): string {
    return this.vehicleIds[Math.floor(Math.random() * this.vehicleIds.length)];
  }

  private generateRandomAddress(): string {
    const streets = ['Main St', 'First Ave', 'Pine St', 'Union St', 'Capitol Hill', 'Fremont Ave'];
    const numbers = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    return `${numbers} ${street}, Seattle, WA`;
  }

  private generateRandomAlert(): Alert {
    const alertTypes = ['battery', 'maintenance', 'safety', 'geofence'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const vehicleId = this.getRandomVehicleId();

    const alertMessages = {
      battery: [
        'Low battery level detected',
        'Battery health declining',
        'Charging required soon',
        'Battery temperature warning',
      ],
      maintenance: [
        'Scheduled maintenance due',
        'Tire pressure low',
        'Service interval reached',
        'Diagnostic code detected',
      ],
      safety: [
        'Harsh braking detected',
        'Speed limit exceeded',
        'Rapid acceleration detected',
        'Driver fatigue warning',
      ],
      geofence: [
        'Vehicle left authorized area',
        'Unauthorized zone entry',
        'Route deviation detected',
        'Restricted area violation',
      ],
    };

    const messages = alertMessages[type];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      severity,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Alert`,
      message: `${message} for vehicle ${vehicleId}`,
      vehicleId,
      timestamp: new Date(),
      acknowledged: false,
    };
  }
}

// Create and export singleton instance
export const mockWebSocketServer = new MockWebSocketServer();

// Auto-start in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Start the mock server when imported
  mockWebSocketServer.start();
  
  window.WebSocket = class MockWebSocket extends EventTarget {
    public readyState: number = WebSocket.CONNECTING;
    public url: string;
    public onopen: ((event: Event) => void) | null = null;
    public onclose: ((event: CloseEvent) => void) | null = null;
    public onmessage: ((event: MessageEvent) => void) | null = null;
    public onerror: ((event: Event) => void) | null = null;

    constructor(url: string) {
      super();
      this.url = url;
      
      // Simulate connection delay
      setTimeout(() => {
        this.readyState = WebSocket.OPEN;
        mockWebSocketServer.addClient(this as any);
        
        const openEvent = new Event('open');
        this.onopen?.(openEvent);
        this.dispatchEvent(openEvent);
      }, 100);
    }

    send(_data: string) {
      if (this.readyState === WebSocket.OPEN) {
        mockWebSocketServer.addClient(this as any);
      }
    }

    close() {
      this.readyState = WebSocket.CLOSED;
      const closeEvent = new CloseEvent('close', { code: 1000, reason: 'Normal closure' });
      this.onclose?.(closeEvent);
      this.dispatchEvent(closeEvent);
    }

    // WebSocket constants
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
  } as any;

  // Add constants to the mock class
  Object.assign(window.WebSocket, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  });
}