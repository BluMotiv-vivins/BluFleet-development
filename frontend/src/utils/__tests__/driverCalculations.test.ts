import {
  calculateSafetyScore,
  calculateEcoScore,
  detectHarshDrivingEvents,
  generateDriverPerformanceAlerts,
  calculateDriverRanking,
  getDriverPerformanceTrends,
  type HarshDrivingEvent,
} from '../driverCalculations';
import type { Driver, Alert, Vehicle } from '../../types';

// Mock data for testing
const mockDriver: Driver = {
  id: 'D-001',
  name: 'Test Driver',
  email: 'test@example.com',
  safetyScore: 85,
  ecoScore: 80,
  totalMiles: 10000,
  recentAlerts: [],
  certifications: ['Commercial License'],
  status: 'active',
};

const mockVehicle: Vehicle = {
  id: 'V-001',
  name: 'Test Vehicle',
  type: 'van',
  status: 'active',
  location: { lat: 47.6062, lng: -122.3321 },
  battery: {
    currentLevel: 75,
    health: 90,
    lastCharged: new Date(),
    estimatedRange: 200,
  },
  driver: mockDriver,
  alerts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSafetyAlert: Alert = {
  id: 'A-001',
  type: 'safety',
  severity: 'high',
  title: 'Harsh Braking',
  message: 'Driver performed harsh braking',
  driverId: 'D-001',
  vehicleId: 'V-001',
  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  acknowledged: false,
};

describe('driverCalculations', () => {
  describe('calculateSafetyScore', () => {
    it('should return base score of 100 with no alerts or harsh events', () => {
      const score = calculateSafetyScore(mockDriver, [], []);
      expect(score).toBe(100);
    });

    it('should deduct points for critical safety alerts', () => {
      const criticalAlert: Alert = {
        ...mockSafetyAlert,
        severity: 'critical',
      };
      const score = calculateSafetyScore(mockDriver, [criticalAlert], []);
      expect(score).toBeLessThan(100);
      expect(score).toBeLessThanOrEqual(85); // 100 - 15 (critical alert)
    });

    it('should deduct points for high severity alerts', () => {
      const score = calculateSafetyScore(mockDriver, [mockSafetyAlert], []);
      expect(score).toBeLessThan(100);
      expect(score).toBeLessThanOrEqual(90); // 100 - 10 (high alert)
    });

    it('should deduct points for harsh driving events', () => {
      const harshEvent: HarshDrivingEvent = {
        id: 'HE-001',
        driverId: 'D-001',
        vehicleId: 'V-001',
        type: 'harsh_braking',
        severity: 'high',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      };
      const score = calculateSafetyScore(mockDriver, [], [harshEvent]);
      expect(score).toBeLessThan(100);
      expect(score).toBeLessThanOrEqual(92); // 100 - 8 (high harsh event)
    });

    it('should not go below 0', () => {
      const manyAlerts = Array(20).fill(null).map((_, i) => ({
        ...mockSafetyAlert,
        id: `A-${i}`,
        severity: 'critical' as const,
      }));
      const score = calculateSafetyScore(mockDriver, manyAlerts, []);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should filter alerts by time range', () => {
      const oldAlert: Alert = {
        ...mockSafetyAlert,
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      };
      const score = calculateSafetyScore(mockDriver, [oldAlert], [], 30); // 30-day window
      expect(score).toBe(100); // Old alert should be ignored
    });

    it('should filter alerts by driver ID', () => {
      const otherDriverAlert: Alert = {
        ...mockSafetyAlert,
        driverId: 'D-002',
      };
      const score = calculateSafetyScore(mockDriver, [otherDriverAlert], []);
      expect(score).toBe(100); // Other driver's alert should be ignored
    });
  });

  describe('calculateEcoScore', () => {
    it('should return default score when no vehicles assigned', () => {
      const score = calculateEcoScore(mockDriver, []);
      expect(score).toBe(80); // Default score matches driver's ecoScore
    });

    it('should calculate score based on vehicle battery health', () => {
      const score = calculateEcoScore(mockDriver, [mockVehicle]);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle multiple vehicles', () => {
      const vehicle2: Vehicle = {
        ...mockVehicle,
        id: 'V-002',
        battery: {
          ...mockVehicle.battery,
          health: 95,
          estimatedRange: 250,
        },
      };
      const score = calculateEcoScore(mockDriver, [mockVehicle, vehicle2]);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('detectHarshDrivingEvents', () => {
    const mockTelemetryData = [
      {
        timestamp: new Date(),
        speed: 45,
        acceleration: 0.2,
        braking: 0.1,
        cornering: 0.2,
        location: { lat: 47.6062, lng: -122.3321 },
      },
      {
        timestamp: new Date(),
        speed: 70, // Speeding
        acceleration: 0.6, // Harsh acceleration
        braking: 0.5, // Harsh braking
        cornering: 0.7, // Harsh cornering
        location: { lat: 47.6062, lng: -122.3321 },
      },
    ];

    it('should detect harsh braking events', () => {
      const events = detectHarshDrivingEvents('V-001', 'D-001', mockTelemetryData);
      const brakingEvents = events.filter(e => e.type === 'harsh_braking');
      expect(brakingEvents).toHaveLength(1);
      expect(brakingEvents[0].severity).toBe('low'); // 0.5 braking is low severity
    });

    it('should detect harsh acceleration events', () => {
      const events = detectHarshDrivingEvents('V-001', 'D-001', mockTelemetryData);
      const accelerationEvents = events.filter(e => e.type === 'harsh_acceleration');
      expect(accelerationEvents).toHaveLength(1);
      expect(accelerationEvents[0].severity).toBe('high');
    });

    it('should detect harsh cornering events', () => {
      const events = detectHarshDrivingEvents('V-001', 'D-001', mockTelemetryData);
      const corneringEvents = events.filter(e => e.type === 'harsh_cornering');
      expect(corneringEvents).toHaveLength(1);
      expect(corneringEvents[0].severity).toBe('high');
    });

    it('should detect speeding events', () => {
      const events = detectHarshDrivingEvents('V-001', 'D-001', mockTelemetryData);
      const speedingEvents = events.filter(e => e.type === 'speeding');
      expect(speedingEvents).toHaveLength(1);
      expect(speedingEvents[0].severity).toBe('low'); // 70 mph is 15 over 55 limit, which is low severity
    });

    it('should not detect events for normal driving', () => {
      const normalTelemetry = [mockTelemetryData[0]]; // Only normal driving data
      const events = detectHarshDrivingEvents('V-001', 'D-001', normalTelemetry);
      expect(events).toHaveLength(0);
    });
  });

  describe('generateDriverPerformanceAlerts', () => {
    it('should generate low safety score alert', () => {
      const metrics = {
        safetyScore: 60,
        ecoScore: 80,
        harshDrivingEvents: 2,
        alertCount: 1,
        milesPerAlert: 5000,
        efficiencyRating: 80,
      };
      const alerts = generateDriverPerformanceAlerts(mockDriver, metrics, []);
      const safetyAlerts = alerts.filter(a => a.title.includes('Safety Score'));
      expect(safetyAlerts).toHaveLength(1);
      expect(safetyAlerts[0].severity).toBe('high');
    });

    it('should generate critical safety score alert for very low scores', () => {
      const metrics = {
        safetyScore: 40,
        ecoScore: 80,
        harshDrivingEvents: 2,
        alertCount: 1,
        milesPerAlert: 5000,
        efficiencyRating: 80,
      };
      const alerts = generateDriverPerformanceAlerts(mockDriver, metrics, []);
      const safetyAlerts = alerts.filter(a => a.title.includes('Safety Score'));
      expect(safetyAlerts).toHaveLength(1);
      expect(safetyAlerts[0].severity).toBe('critical');
    });

    it('should generate low eco score alert', () => {
      const metrics = {
        safetyScore: 85,
        ecoScore: 60,
        harshDrivingEvents: 2,
        alertCount: 1,
        milesPerAlert: 5000,
        efficiencyRating: 60,
      };
      const alerts = generateDriverPerformanceAlerts(mockDriver, metrics, []);
      const ecoAlerts = alerts.filter(a => a.title.includes('Eco-Driving'));
      expect(ecoAlerts).toHaveLength(1);
      expect(ecoAlerts[0].severity).toBe('medium');
    });

    it('should generate harsh events alert for frequent events', () => {
      const recentHarshEvents: HarshDrivingEvent[] = Array(6).fill(null).map((_, i) => ({
        id: `HE-${i}`,
        driverId: 'D-001',
        vehicleId: 'V-001',
        type: 'harsh_braking',
        severity: 'medium',
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Spread over last 6 hours
      }));

      const metrics = {
        safetyScore: 85,
        ecoScore: 80,
        harshDrivingEvents: 6,
        alertCount: 1,
        milesPerAlert: 5000,
        efficiencyRating: 80,
      };

      const alerts = generateDriverPerformanceAlerts(mockDriver, metrics, recentHarshEvents);
      const harshEventAlerts = alerts.filter(a => a.title.includes('Harsh Driving'));
      expect(harshEventAlerts).toHaveLength(1);
      expect(harshEventAlerts[0].severity).toBe('high');
    });

    it('should not generate alerts for good performance', () => {
      const metrics = {
        safetyScore: 95,
        ecoScore: 90,
        harshDrivingEvents: 1,
        alertCount: 0,
        milesPerAlert: 10000,
        efficiencyRating: 90,
      };
      const alerts = generateDriverPerformanceAlerts(mockDriver, metrics, []);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('calculateDriverRanking', () => {
    it('should rank drivers by combined score', () => {
      const drivers: Driver[] = [
        { ...mockDriver, id: 'D-001', safetyScore: 90, ecoScore: 85 },
        { ...mockDriver, id: 'D-002', safetyScore: 95, ecoScore: 90 },
        { ...mockDriver, id: 'D-003', safetyScore: 80, ecoScore: 75 },
      ];

      const ranked = calculateDriverRanking(drivers);
      expect(ranked[0].id).toBe('D-002'); // Highest combined score
      expect(ranked[1].id).toBe('D-001');
      expect(ranked[2].id).toBe('D-003'); // Lowest combined score
    });

    it('should weight safety score more heavily than eco score', () => {
      const drivers: Driver[] = [
        { ...mockDriver, id: 'D-001', safetyScore: 100, ecoScore: 70 }, // 100*0.6 + 70*0.4 = 88
        { ...mockDriver, id: 'D-002', safetyScore: 80, ecoScore: 100 }, // 80*0.6 + 100*0.4 = 88
      ];

      const ranked = calculateDriverRanking(drivers);
      // Both should have same combined score, but safety-focused driver should rank higher
      expect(ranked[0].id).toBe('D-001');
    });
  });

  describe('getDriverPerformanceTrends', () => {
    const mockHistoricalData = [
      { date: new Date('2024-11-01'), safetyScore: 80, ecoScore: 75, alertCount: 2, milesdriven: 100 },
      { date: new Date('2024-11-02'), safetyScore: 82, ecoScore: 77, alertCount: 1, milesdriven: 120 },
      { date: new Date('2024-11-03'), safetyScore: 85, ecoScore: 80, alertCount: 1, milesdriven: 110 },
      { date: new Date('2024-11-04'), safetyScore: 87, ecoScore: 82, alertCount: 0, milesdriven: 130 },
      { date: new Date('2024-11-05'), safetyScore: 90, ecoScore: 85, alertCount: 0, milesdriven: 125 },
      { date: new Date('2024-11-06'), safetyScore: 92, ecoScore: 87, alertCount: 0, milesdriven: 115 },
      { date: new Date('2024-11-07'), safetyScore: 95, ecoScore: 90, alertCount: 0, milesdriven: 140 },
      { date: new Date('2024-11-08'), safetyScore: 93, ecoScore: 88, alertCount: 1, milesdriven: 135 },
      { date: new Date('2024-11-09'), safetyScore: 94, ecoScore: 89, alertCount: 0, milesdriven: 120 },
      { date: new Date('2024-11-10'), safetyScore: 96, ecoScore: 91, alertCount: 0, milesdriven: 145 },
      { date: new Date('2024-11-11'), safetyScore: 97, ecoScore: 92, alertCount: 0, milesdriven: 150 },
      { date: new Date('2024-11-12'), safetyScore: 95, ecoScore: 90, alertCount: 0, milesdriven: 130 },
      { date: new Date('2024-11-13'), safetyScore: 96, ecoScore: 91, alertCount: 0, milesdriven: 140 },
      { date: new Date('2024-11-14'), safetyScore: 98, ecoScore: 93, alertCount: 0, milesdriven: 155 },
    ];

    it('should detect improving trends', () => {
      const trends = getDriverPerformanceTrends('D-001', mockHistoricalData);
      expect(trends.safetyTrend).toBe('improving');
      expect(trends.ecoTrend).toBe('improving');
      expect(trends.overallTrend).toBe('improving');
    });

    it('should detect declining trends', () => {
      const decliningData = mockHistoricalData.map((d, i) => ({
        ...d,
        safetyScore: 100 - i * 2, // Declining safety scores
        ecoScore: 95 - i * 1.5, // Declining eco scores
      }));

      const trends = getDriverPerformanceTrends('D-001', decliningData);
      expect(trends.safetyTrend).toBe('declining');
      expect(trends.ecoTrend).toBe('declining');
      expect(trends.overallTrend).toBe('declining');
    });

    it('should detect stable trends', () => {
      const stableData = mockHistoricalData.map(d => ({
        ...d,
        safetyScore: 85, // Stable safety scores
        ecoScore: 80, // Stable eco scores
      }));

      const trends = getDriverPerformanceTrends('D-001', stableData);
      expect(trends.safetyTrend).toBe('stable');
      expect(trends.ecoTrend).toBe('stable');
      expect(trends.overallTrend).toBe('stable');
    });

    it('should return stable for insufficient data', () => {
      const insufficientData = [mockHistoricalData[0]];
      const trends = getDriverPerformanceTrends('D-001', insufficientData);
      expect(trends.safetyTrend).toBe('stable');
      expect(trends.ecoTrend).toBe('stable');
      expect(trends.overallTrend).toBe('stable');
    });
  });
});