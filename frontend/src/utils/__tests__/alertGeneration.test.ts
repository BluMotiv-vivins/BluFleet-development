import {
  generateAlertId,
  generateLowBatteryAlerts,
  generateMaintenanceAlerts,
  generateGeofenceViolationAlert,
  generateSafetyAlert,
  generateSystemUpdateAlert,
  generateAutomatedAlerts,
  prioritizeAlerts,
  getUnacknowledgedAlerts,
  getAlertStatistics,
  defaultAlertConfig,
} from '../alertGeneration';
import type { Vehicle, Driver, Alert } from '../../types';

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Fleet Vehicle 001',
    type: 'van',
    status: 'active',
    location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
    battery: {
      currentLevel: 12, // Critical level
      health: 85,
      lastCharged: new Date('2024-12-08T10:00:00Z'),
      estimatedRange: 45,
    },
    alerts: [],
    createdAt: new Date('2024-10-01T00:00:00Z'), // 69 days ago
    updatedAt: new Date(),
  },
  {
    id: 'EV-002',
    name: 'Fleet Vehicle 002',
    type: 'truck',
    status: 'charging',
    location: { lat: 40.7589, lng: -73.9851, address: 'Manhattan, NY' },
    battery: {
      currentLevel: 23, // Low level
      health: 92,
      lastCharged: new Date('2024-12-09T08:00:00Z'),
      estimatedRange: 78,
    },
    alerts: [],
    createdAt: new Date('2024-09-15T00:00:00Z'), // 85 days ago
    updatedAt: new Date(),
  },
  {
    id: 'EV-003',
    name: 'Fleet Vehicle 003',
    type: 'car',
    status: 'active',
    location: { lat: 40.6782, lng: -73.9442, address: 'Brooklyn, NY' },
    battery: {
      currentLevel: 78, // Good level
      health: 88,
      lastCharged: new Date('2024-12-09T06:00:00Z'),
      estimatedRange: 156,
    },
    alerts: [],
    createdAt: new Date('2024-11-20T00:00:00Z'), // 19 days ago
    updatedAt: new Date(),
  },
];

const mockDriver: Driver = {
  id: 'D-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  safetyScore: 85,
  ecoScore: 92,
  totalMiles: 15000,
  recentAlerts: [],
  certifications: ['Commercial License'],
  status: 'active',
};

const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    type: 'battery',
    severity: 'critical',
    title: 'Critical Battery',
    message: 'Critical battery level',
    timestamp: new Date('2024-12-09T12:00:00Z'),
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'maintenance',
    severity: 'high',
    title: 'Maintenance Due',
    message: 'Maintenance is due',
    timestamp: new Date('2024-12-09T11:00:00Z'),
    acknowledged: true,
  },
  {
    id: 'A-003',
    type: 'safety',
    severity: 'medium',
    title: 'Safety Event',
    message: 'Safety event occurred',
    timestamp: new Date('2024-12-09T10:00:00Z'),
    acknowledged: false,
    resolvedAt: new Date('2024-12-09T10:30:00Z'),
  },
  {
    id: 'A-004',
    type: 'system',
    severity: 'low',
    title: 'System Update',
    message: 'System update available',
    timestamp: new Date('2024-12-09T09:00:00Z'),
    acknowledged: false,
  },
];

describe('Alert Generation Utilities', () => {
  describe('generateAlertId', () => {
    it('generates unique alert IDs', () => {
      const id1 = generateAlertId();
      const id2 = generateAlertId();
      
      expect(id1).toMatch(/^A-[a-z0-9]+-[a-z0-9]+$/);
      expect(id2).toMatch(/^A-[a-z0-9]+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('generates IDs with correct format', () => {
      const id = generateAlertId();
      expect(id).toMatch(/^A-/);
      expect(id.split('-')).toHaveLength(3);
    });
  });

  describe('generateLowBatteryAlerts', () => {
    it('generates critical battery alerts for vehicles below critical threshold', () => {
      const alerts = generateLowBatteryAlerts(mockVehicles);
      
      const criticalAlert = alerts.find(alert => 
        alert.vehicleId === 'EV-001' && alert.severity === 'critical'
      );
      
      expect(criticalAlert).toBeDefined();
      expect(criticalAlert?.type).toBe('battery');
      expect(criticalAlert?.title).toBe('Critical Battery Level');
      expect(criticalAlert?.message).toContain('12%');
      expect(criticalAlert?.message).toContain('Fleet Vehicle 001');
    });

    it('generates medium battery alerts for vehicles below low threshold', () => {
      const alerts = generateLowBatteryAlerts(mockVehicles);
      
      const lowAlert = alerts.find(alert => 
        alert.vehicleId === 'EV-002' && alert.severity === 'medium'
      );
      
      expect(lowAlert).toBeDefined();
      expect(lowAlert?.type).toBe('battery');
      expect(lowAlert?.title).toBe('Low Battery Alert');
      expect(lowAlert?.message).toContain('23%');
    });

    it('does not generate alerts for vehicles with good battery levels', () => {
      const alerts = generateLowBatteryAlerts(mockVehicles);
      
      const goodBatteryAlert = alerts.find(alert => alert.vehicleId === 'EV-003');
      expect(goodBatteryAlert).toBeUndefined();
    });

    it('respects custom configuration', () => {
      const customConfig = {
        ...defaultAlertConfig,
        lowBatteryThreshold: 80,
        criticalBatteryThreshold: 25,
      };
      
      const alerts = generateLowBatteryAlerts(mockVehicles, customConfig);
      
      // EV-003 with 78% should now generate an alert
      const newAlert = alerts.find(alert => alert.vehicleId === 'EV-003');
      expect(newAlert).toBeDefined();
      expect(newAlert?.severity).toBe('medium');
    });
  });

  describe('generateMaintenanceAlerts', () => {
    it('generates maintenance alerts for vehicles due for maintenance', () => {
      const alerts = generateMaintenanceAlerts(mockVehicles);
      
      // Should generate alerts for vehicles created more than 30 days ago
      expect(alerts.length).toBeGreaterThan(0);
      
      const maintenanceAlert = alerts.find(alert => alert.type === 'maintenance');
      expect(maintenanceAlert).toBeDefined();
      expect(maintenanceAlert?.title).toMatch(/Maintenance/);
    });

    it('generates different severity levels based on urgency', () => {
      const alerts = generateMaintenanceAlerts(mockVehicles);
      
      // Should generate alerts
      expect(alerts.length).toBeGreaterThan(0);
      
      // Should have valid severity levels
      const severities = alerts.map(alert => alert.severity);
      const validSeverities = ['low', 'medium', 'high'];
      severities.forEach(severity => {
        expect(validSeverities).toContain(severity);
      });
    });

    it('includes vehicle information in maintenance alerts', () => {
      const alerts = generateMaintenanceAlerts(mockVehicles);
      
      alerts.forEach(alert => {
        expect(alert.vehicleId).toBeDefined();
        expect(alert.message).toContain('Vehicle');
      });
    });
  });

  describe('generateGeofenceViolationAlert', () => {
    it('generates geofence violation alert for exiting', () => {
      const alert = generateGeofenceViolationAlert(
        mockVehicles[0],
        'Restricted Zone A',
        'exited',
        { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
      );
      
      expect(alert.type).toBe('geofence');
      expect(alert.severity).toBe('high');
      expect(alert.title).toBe('Geofence Violation');
      expect(alert.message).toContain('exited');
      expect(alert.message).toContain('Restricted Zone A');
      expect(alert.message).toContain('New York, NY');
      expect(alert.vehicleId).toBe('EV-001');
    });

    it('generates geofence violation alert for entering', () => {
      const alert = generateGeofenceViolationAlert(
        mockVehicles[0],
        'Restricted Zone B',
        'entered'
      );
      
      expect(alert.severity).toBe('medium');
      expect(alert.message).toContain('entered');
      expect(alert.message).toContain('Restricted Zone B');
    });

    it('includes driver information when available', () => {
      const vehicleWithDriver = { ...mockVehicles[0], driver: mockDriver };
      const alert = generateGeofenceViolationAlert(
        vehicleWithDriver,
        'Test Zone',
        'exited'
      );
      
      expect(alert.driverId).toBe('D-001');
    });
  });

  describe('generateSafetyAlert', () => {
    it('generates harsh braking safety alert', () => {
      const alert = generateSafetyAlert(
        mockVehicles[0],
        mockDriver,
        'harsh_braking'
      );
      
      expect(alert.type).toBe('safety');
      expect(alert.severity).toBe('medium');
      expect(alert.title).toBe('Harsh Driving Event');
      expect(alert.message).toContain('harsh braking');
      expect(alert.message).toContain('John Doe');
      expect(alert.vehicleId).toBe('EV-001');
      expect(alert.driverId).toBe('D-001');
    });

    it('generates speeding safety alert with high severity', () => {
      const alert = generateSafetyAlert(
        mockVehicles[0],
        mockDriver,
        'speeding',
        { speed: 67, speedLimit: 55 }
      );
      
      expect(alert.severity).toBe('high');
      expect(alert.message).toContain('exceeded speed limit');
      expect(alert.message).toContain('by 12 mph');
    });

    it('generates other safety events with medium severity', () => {
      const alert = generateSafetyAlert(
        mockVehicles[0],
        mockDriver,
        'sharp_cornering'
      );
      
      expect(alert.severity).toBe('medium');
      expect(alert.message).toContain('sharp corner');
    });
  });

  describe('generateSystemUpdateAlert', () => {
    it('generates system update alert', () => {
      const alert = generateSystemUpdateAlert(
        'feature',
        '2.1.0',
        'New dashboard features and improvements'
      );
      
      expect(alert.type).toBe('system');
      expect(alert.severity).toBe('low');
      expect(alert.title).toBe('System Update Available');
      expect(alert.message).toContain('Version 2.1.0');
      expect(alert.message).toContain('New dashboard features');
    });

    it('generates security update with higher priority', () => {
      const alert = generateSystemUpdateAlert(
        'security',
        '2.0.1',
        'Critical security patches',
        true
      );
      
      expect(alert.severity).toBe('medium');
      expect(alert.title).toBe('System Update Required');
      expect(alert.message).toContain('Action required');
    });
  });

  describe('generateAutomatedAlerts', () => {
    it('generates both battery and maintenance alerts', () => {
      const alerts = generateAutomatedAlerts(mockVehicles);
      
      const batteryAlerts = alerts.filter(alert => alert.type === 'battery');
      const maintenanceAlerts = alerts.filter(alert => alert.type === 'maintenance');
      
      expect(batteryAlerts.length).toBeGreaterThan(0);
      expect(maintenanceAlerts.length).toBeGreaterThan(0);
    });

    it('returns empty array for empty vehicle list', () => {
      const alerts = generateAutomatedAlerts([]);
      expect(alerts).toEqual([]);
    });

    it('respects custom configuration', () => {
      const customConfig = {
        ...defaultAlertConfig,
        lowBatteryThreshold: 100, // All vehicles should trigger
      };
      
      const alerts = generateAutomatedAlerts(mockVehicles, customConfig);
      const batteryAlerts = alerts.filter(alert => alert.type === 'battery');
      
      expect(batteryAlerts.length).toBe(mockVehicles.length);
    });
  });

  describe('prioritizeAlerts', () => {
    it('sorts alerts by severity priority', () => {
      const prioritized = prioritizeAlerts(mockAlerts);
      
      expect(prioritized[0].severity).toBe('critical');
      expect(prioritized[1].severity).toBe('high');
      expect(prioritized[2].severity).toBe('medium');
      expect(prioritized[3].severity).toBe('low');
    });

    it('sorts by timestamp within same severity', () => {
      const sameSevirityAlerts: Alert[] = [
        {
          ...mockAlerts[0],
          id: 'A-OLD',
          severity: 'high',
          timestamp: new Date('2024-12-09T10:00:00Z'),
        },
        {
          ...mockAlerts[0],
          id: 'A-NEW',
          severity: 'high',
          timestamp: new Date('2024-12-09T12:00:00Z'),
        },
      ];
      
      const prioritized = prioritizeAlerts(sameSevirityAlerts);
      
      expect(prioritized[0].id).toBe('A-NEW');
      expect(prioritized[1].id).toBe('A-OLD');
    });

    it('does not mutate original array', () => {
      const original = [...mockAlerts];
      const prioritized = prioritizeAlerts(mockAlerts);
      
      expect(mockAlerts).toEqual(original);
      expect(prioritized).not.toBe(mockAlerts);
    });
  });

  describe('getUnacknowledgedAlerts', () => {
    it('returns only unacknowledged and unresolved alerts', () => {
      const unacknowledged = getUnacknowledgedAlerts(mockAlerts);
      
      expect(unacknowledged).toHaveLength(2); // A-001 and A-004
      expect(unacknowledged.every(alert => !alert.acknowledged)).toBe(true);
      expect(unacknowledged.every(alert => !alert.resolvedAt)).toBe(true);
    });

    it('excludes acknowledged alerts', () => {
      const unacknowledged = getUnacknowledgedAlerts(mockAlerts);
      
      const acknowledgedAlert = unacknowledged.find(alert => alert.id === 'A-002');
      expect(acknowledgedAlert).toBeUndefined();
    });

    it('excludes resolved alerts', () => {
      const unacknowledged = getUnacknowledgedAlerts(mockAlerts);
      
      const resolvedAlert = unacknowledged.find(alert => alert.id === 'A-003');
      expect(resolvedAlert).toBeUndefined();
    });
  });

  describe('getAlertStatistics', () => {
    it('calculates correct statistics', () => {
      const stats = getAlertStatistics(mockAlerts);
      
      expect(stats.total).toBe(4);
      expect(stats.unresolved).toBe(3); // A-003 is resolved
      expect(stats.unacknowledged).toBe(2); // A-001 and A-004
    });

    it('calculates severity breakdown correctly', () => {
      const stats = getAlertStatistics(mockAlerts);
      
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.medium).toBe(0); // A-003 is resolved
      expect(stats.bySeverity.low).toBe(1);
    });

    it('calculates type breakdown correctly', () => {
      const stats = getAlertStatistics(mockAlerts);
      
      expect(stats.byType.battery).toBe(1);
      expect(stats.byType.maintenance).toBe(1);
      expect(stats.byType.safety).toBe(0); // A-003 is resolved
      expect(stats.byType.system).toBe(1);
      expect(stats.byType.geofence).toBe(0);
    });

    it('handles empty alert array', () => {
      const stats = getAlertStatistics([]);
      
      expect(stats.total).toBe(0);
      expect(stats.unresolved).toBe(0);
      expect(stats.unacknowledged).toBe(0);
      expect(Object.values(stats.bySeverity).every(count => count === 0)).toBe(true);
      expect(Object.values(stats.byType).every(count => count === 0)).toBe(true);
    });
  });
});