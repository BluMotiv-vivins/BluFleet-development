import { describe, it, expect, beforeEach } from 'vitest';
import type { Vehicle } from '../../types';
import {
  calculateAverageBatteryLevel,
  calculateAverageBatteryHealth,
  getVehiclesNeedingCharge,
  getLowBatteryVehicles,
  getChargingVehicles,
  calculateChargingTime,
  calculateWaitTime,
  generateChargingQueue,
  calculateNextChargeTime,
  generatePowerConsumptionData,
  calculateTotalCapacity,
  calculateBatteryStats,
  formatTimeRemaining,
  optimizeChargingQueue,
} from '../batteryCalculations';

describe('batteryCalculations', () => {
  let mockVehicles: Vehicle[];

  beforeEach(() => {
    mockVehicles = [
      {
        id: 'EV-001',
        name: 'Fleet Truck 001',
        type: 'truck',
        status: 'active',
        location: { lat: 47.6062, lng: -122.3321 },
        battery: {
          currentLevel: 85,
          health: 95,
          lastCharged: new Date('2024-12-09T10:00:00Z'),
          estimatedRange: 250,
        },
        alerts: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-12-09T12:00:00Z'),
      },
      {
        id: 'EV-002',
        name: 'Delivery Van 002',
        type: 'van',
        status: 'active',
        location: { lat: 45.5152, lng: -122.6784 },
        battery: {
          currentLevel: 15,
          health: 88,
          lastCharged: new Date('2024-12-09T06:00:00Z'),
          estimatedRange: 45,
        },
        alerts: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-12-09T12:00:00Z'),
      },
      {
        id: 'EV-003',
        name: 'Forklift 003',
        type: 'forklift',
        status: 'charging',
        location: { lat: 47.6205, lng: -122.3493 },
        battery: {
          currentLevel: 45,
          health: 92,
          lastCharged: new Date('2024-12-09T11:00:00Z'),
          estimatedRange: 90,
        },
        alerts: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-12-09T12:00:00Z'),
      },
      {
        id: 'EV-004',
        name: 'Car 004',
        type: 'car',
        status: 'maintenance',
        location: { lat: 47.6097, lng: -122.3331 },
        battery: {
          currentLevel: 60,
          health: 90,
          lastCharged: new Date('2024-12-09T08:00:00Z'),
          estimatedRange: 180,
        },
        alerts: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-12-09T12:00:00Z'),
      },
    ];
  });

  describe('calculateAverageBatteryLevel', () => {
    it('should calculate correct average battery level', () => {
      const average = calculateAverageBatteryLevel(mockVehicles);
      expect(average).toBe(51); // (85 + 15 + 45 + 60) / 4 = 51.25, rounded to 51
    });

    it('should return 0 for empty vehicle array', () => {
      const average = calculateAverageBatteryLevel([]);
      expect(average).toBe(0);
    });

    it('should handle single vehicle', () => {
      const average = calculateAverageBatteryLevel([mockVehicles[0]]);
      expect(average).toBe(85);
    });
  });

  describe('calculateAverageBatteryHealth', () => {
    it('should calculate correct average battery health', () => {
      const average = calculateAverageBatteryHealth(mockVehicles);
      expect(average).toBe(91); // (95 + 88 + 92 + 90) / 4 = 91.25, rounded to 91
    });

    it('should return 0 for empty vehicle array', () => {
      const average = calculateAverageBatteryHealth([]);
      expect(average).toBe(0);
    });
  });

  describe('getVehiclesNeedingCharge', () => {
    it('should return vehicles with battery below 80% that are not charging', () => {
      const vehicles = getVehiclesNeedingCharge(mockVehicles);
      expect(vehicles).toHaveLength(2);
      expect(vehicles[0].id).toBe('EV-002'); // 15% battery, lowest first
      expect(vehicles[1].id).toBe('EV-004'); // 60% battery
    });

    it('should exclude charging vehicles', () => {
      const vehicles = getVehiclesNeedingCharge(mockVehicles);
      const chargingVehicle = vehicles.find(v => v.status === 'charging');
      expect(chargingVehicle).toBeUndefined();
    });

    it('should sort by battery level ascending', () => {
      const vehicles = getVehiclesNeedingCharge(mockVehicles);
      for (let i = 1; i < vehicles.length; i++) {
        expect(vehicles[i].battery.currentLevel).toBeGreaterThanOrEqual(
          vehicles[i - 1].battery.currentLevel
        );
      }
    });
  });

  describe('getLowBatteryVehicles', () => {
    it('should return vehicles with battery below 20%', () => {
      const vehicles = getLowBatteryVehicles(mockVehicles);
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].id).toBe('EV-002');
      expect(vehicles[0].battery.currentLevel).toBe(15);
    });

    it('should return empty array when no vehicles have low battery', () => {
      const highBatteryVehicles = mockVehicles.map(v => ({
        ...v,
        battery: { ...v.battery, currentLevel: 50 },
      }));
      const vehicles = getLowBatteryVehicles(highBatteryVehicles);
      expect(vehicles).toHaveLength(0);
    });
  });

  describe('getChargingVehicles', () => {
    it('should return vehicles with charging status', () => {
      const vehicles = getChargingVehicles(mockVehicles);
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].id).toBe('EV-003');
      expect(vehicles[0].status).toBe('charging');
    });
  });

  describe('calculateChargingTime', () => {
    it('should calculate charging time correctly', () => {
      const time = calculateChargingTime(20, 80, 40); // 20% to 80% at 40%/hour
      expect(time).toBe(90); // (80-20)/40 * 60 = 90 minutes
    });

    it('should return 0 if already at target level', () => {
      const time = calculateChargingTime(85, 80);
      expect(time).toBe(0);
    });

    it('should use default values', () => {
      const time = calculateChargingTime(20);
      expect(time).toBe(90); // (80-20)/40 * 60 = 90 minutes
    });
  });

  describe('calculateWaitTime', () => {
    it('should calculate wait time based on position', () => {
      const waitTime = calculateWaitTime(2, 30); // Position 2, 30 min per vehicle
      expect(waitTime).toBe(60); // 2 * 30 = 60 minutes
    });

    it('should use default average charging time', () => {
      const waitTime = calculateWaitTime(1);
      expect(waitTime).toBe(45); // 1 * 45 = 45 minutes
    });

    it('should return 0 for first position', () => {
      const waitTime = calculateWaitTime(0);
      expect(waitTime).toBe(0);
    });
  });

  describe('generateChargingQueue', () => {
    it('should generate charging queue with correct priorities', () => {
      const queue = generateChargingQueue(mockVehicles, 5);
      
      expect(queue).toHaveLength(2); // Only 2 vehicles need charging
      
      // First vehicle should be the one with lowest battery (high priority)
      expect(queue[0].vehicleId).toBe('EV-002');
      expect(queue[0].priority).toBe('high');
      expect(queue[0].currentBattery).toBe(15);
      
      // Second vehicle should have low priority (60% battery)
      expect(queue[1].vehicleId).toBe('EV-004');
      expect(queue[1].priority).toBe('low');
      expect(queue[1].currentBattery).toBe(60);
    });

    it('should limit queue size', () => {
      const queue = generateChargingQueue(mockVehicles, 1);
      expect(queue).toHaveLength(1);
    });

    it('should calculate estimated times', () => {
      const queue = generateChargingQueue(mockVehicles);
      
      queue.forEach(item => {
        expect(item.estimatedWaitTime).toBeGreaterThanOrEqual(0);
        expect(item.estimatedChargeTime).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateNextChargeTime', () => {
    it('should return next charge time for vehicle with lowest battery', () => {
      const nextCharge = calculateNextChargeTime(mockVehicles);
      
      expect(nextCharge).not.toBeNull();
      expect(nextCharge!.vehicleId).toBe('EV-002'); // Lowest battery
      expect(nextCharge!.time).toBeInstanceOf(Date);
      expect(nextCharge!.time.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null when no vehicles need charging', () => {
      const highBatteryVehicles = mockVehicles.map(v => ({
        ...v,
        battery: { ...v.battery, currentLevel: 90 },
        status: 'active' as const,
      }));
      
      const nextCharge = calculateNextChargeTime(highBatteryVehicles);
      expect(nextCharge).toBeNull();
    });
  });

  describe('generatePowerConsumptionData', () => {
    it('should generate 24 hours of data', () => {
      const data = generatePowerConsumptionData(mockVehicles);
      expect(data).toHaveLength(24);
    });

    it('should have correct data structure', () => {
      const data = generatePowerConsumptionData(mockVehicles);
      
      data.forEach(item => {
        expect(item).toHaveProperty('hour');
        expect(item).toHaveProperty('consumption');
        expect(item).toHaveProperty('efficiency');
        expect(item).toHaveProperty('timestamp');
        
        expect(item.hour).toBeGreaterThanOrEqual(0);
        expect(item.hour).toBeLessThan(24);
        expect(item.consumption).toBeGreaterThan(0);
        expect(item.efficiency).toBeGreaterThanOrEqual(0);
        expect(item.efficiency).toBeLessThanOrEqual(100);
        expect(item.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should scale consumption with vehicle count', () => {
      const smallFleetData = generatePowerConsumptionData([mockVehicles[0]]);
      const largeFleetData = generatePowerConsumptionData(mockVehicles);
      
      const smallAvg = smallFleetData.reduce((sum, item) => sum + item.consumption, 0) / 24;
      const largeAvg = largeFleetData.reduce((sum, item) => sum + item.consumption, 0) / 24;
      
      expect(largeAvg).toBeGreaterThan(smallAvg);
    });
  });

  describe('calculateTotalCapacity', () => {
    it('should calculate total capacity correctly', () => {
      const capacity = calculateTotalCapacity(mockVehicles, 100);
      expect(capacity).toBe(400); // 4 vehicles * 100 kWh
    });

    it('should use default capacity per vehicle', () => {
      const capacity = calculateTotalCapacity(mockVehicles);
      expect(capacity).toBe(400); // 4 vehicles * 100 kWh (default)
    });

    it('should return 0 for empty vehicle array', () => {
      const capacity = calculateTotalCapacity([]);
      expect(capacity).toBe(0);
    });
  });

  describe('calculateBatteryStats', () => {
    it('should return comprehensive battery statistics', () => {
      const stats = calculateBatteryStats(mockVehicles);
      
      expect(stats).toHaveProperty('averageLevel');
      expect(stats).toHaveProperty('totalCapacity');
      expect(stats).toHaveProperty('chargingVehicles');
      expect(stats).toHaveProperty('lowBatteryCount');
      expect(stats).toHaveProperty('nextChargeTime');
      expect(stats).toHaveProperty('nextChargeVehicle');
      
      expect(stats.averageLevel).toBe(51);
      expect(stats.totalCapacity).toBe(400);
      expect(stats.chargingVehicles).toBe(1);
      expect(stats.lowBatteryCount).toBe(1);
      expect(stats.nextChargeVehicle).toBe('EV-002');
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format time correctly for hours and minutes', () => {
      const futureTime = new Date(Date.now() + 2.5 * 60 * 60 * 1000); // 2.5 hours
      const formatted = formatTimeRemaining(futureTime);
      expect(formatted).toMatch(/^2h \d+m$/); // Should be around 2h 30m, allowing for timing variations
    });

    it('should format time correctly for minutes only', () => {
      const futureTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const formatted = formatTimeRemaining(futureTime);
      expect(formatted).toBe('30m');
    });

    it('should return "Charging now" for past time', () => {
      const pastTime = new Date(Date.now() - 60 * 1000); // 1 minute ago
      const formatted = formatTimeRemaining(pastTime);
      expect(formatted).toBe('Charging now');
    });
  });

  describe('optimizeChargingQueue', () => {
    it('should optimize queue based on priority and battery level', () => {
      const queue = generateChargingQueue(mockVehicles);
      const optimized = optimizeChargingQueue(queue);
      
      // Should maintain the same length
      expect(optimized).toHaveLength(queue.length);
      
      // Should prioritize high priority vehicles
      for (let i = 1; i < optimized.length; i++) {
        const current = optimized[i];
        const previous = optimized[i - 1];
        
        const priorityWeights = { high: 100, medium: 50, low: 10 };
        const currentScore = priorityWeights[current.priority] + (100 - current.currentBattery);
        const previousScore = priorityWeights[previous.priority] + (100 - previous.currentBattery);
        
        expect(previousScore).toBeGreaterThanOrEqual(currentScore);
      }
    });

    it('should handle empty queue', () => {
      const optimized = optimizeChargingQueue([]);
      expect(optimized).toHaveLength(0);
    });
  });
});