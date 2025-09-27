import { calculateKPIs, formatCurrency, formatPercentage, formatNumber } from '../kpiCalculations';
import type { Vehicle, ChargingStation } from '../../types';

// Mock data for testing
const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Fleet Truck 001',
    type: 'truck',
    status: 'active',
    location: { lat: 47.6062, lng: -122.3321, address: 'Seattle Depot' },
    battery: { currentLevel: 80, health: 90, lastCharged: new Date(), estimatedRange: 245 },
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'EV-002',
    name: 'Delivery Van 002',
    type: 'van',
    status: 'charging',
    location: { lat: 45.5152, lng: -122.6784, address: 'Portland Route' },
    battery: { currentLevel: 60, health: 85, lastCharged: new Date(), estimatedRange: 128 },
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'EV-003',
    name: 'Forklift 003',
    type: 'forklift',
    status: 'maintenance',
    location: { lat: 47.6205, lng: -122.3493, address: 'Maintenance Bay' },
    battery: { currentLevel: 40, health: 75, lastCharged: new Date(), estimatedRange: 45 },
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'EV-004',
    name: 'Car 004',
    type: 'car',
    status: 'offline',
    location: { lat: 47.6205, lng: -122.3493, address: 'Parking' },
    battery: { currentLevel: 20, health: 95, lastCharged: new Date(), estimatedRange: 80 },
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockChargingStations: ChargingStation[] = [
  {
    id: 'CS-001',
    name: 'Main Depot Charger',
    location: { lat: 47.6205, lng: -122.3493, address: '123 Fleet St, Seattle, WA' },
    status: 'occupied',
    powerOutput: 150,
    connectorTypes: ['CCS', 'CHAdeMO'],
    currentVehicle: 'EV-002',
    queue: [],
    pricing: { rate: 20, currency: 'INR' },
  },
  {
    id: 'CS-002',
    name: 'Portland Hub Charger',
    location: { lat: 45.5152, lng: -122.6784, address: '456 Industrial Ave, Portland, OR' },
    status: 'available',
    powerOutput: 100,
    connectorTypes: ['CCS'],
    queue: [],
    pricing: { rate: 18, currency: 'INR' },
  },
];

describe('KPI Calculations', () => {
  describe('calculateKPIs', () => {
    it('calculates basic fleet metrics correctly', () => {
      const result = calculateKPIs(mockVehicles, mockChargingStations);

      expect(result.totalVehicles).toBe(4);
      expect(result.activeVehicles).toBe(1);
      expect(result.chargingVehicles).toBe(1);
      expect(result.maintenanceVehicles).toBe(1);
      expect(result.details.statusBreakdown.offline).toBe(1);
    });

    it('calculates battery metrics correctly', () => {
      const result = calculateKPIs(mockVehicles, mockChargingStations);

      // Average battery level: (80 + 60 + 40 + 20) / 4 = 50%
      expect(result.averageBatteryLevel).toBe(50);
      
      // Average battery health: (90 + 85 + 75 + 95) / 4 = 86.25 -> 86
      expect(result.averageBatteryHealth).toBe(86);

      // Battery details
      expect(result.details.batteryDetails.lowBattery).toBe(0); // EV-004 has exactly 20%, threshold is <20%
      expect(result.details.batteryDetails.criticalBattery).toBe(0); // None have <10%
      expect(result.details.batteryDetails.healthyBatteries).toBe(3); // 3 vehicles have >80% health (90, 85, 95)
    });

    it('calculates cost savings correctly', () => {
      const result = calculateKPIs(mockVehicles, mockChargingStations);

      expect(result.monthlySavings).toBeGreaterThan(0);
      expect(result.details.costDetails.fuelSavings).toBeGreaterThan(0);
      expect(result.details.costDetails.maintenanceSavings).toBeGreaterThan(0);
      expect(result.details.costDetails.totalOperationalSavings).toBe(result.monthlySavings);
    });

    it('calculates sustainability metrics correctly', () => {
      const result = calculateKPIs(mockVehicles, mockChargingStations);

      expect(result.co2Reduction).toBeGreaterThan(0);
      expect(result.details.sustainabilityDetails.co2ReductionPercentage).toBeGreaterThan(0);
      expect(result.details.sustainabilityDetails.totalMilesDriven).toBeGreaterThan(0);
      expect(result.details.sustainabilityDetails.equivalentGasolineVehicleCO2).toBeGreaterThan(result.co2Reduction);
    });

    it('calculates trends correctly with previous period data', () => {
      const previousData = {
        totalVehicles: 3,
        averageBatteryHealth: 80,
        monthlySavings: 1000,
        co2Reduction: 1.0,
      };

      const result = calculateKPIs(mockVehicles, mockChargingStations, previousData);

      expect(result.trends.totalVehicles).toBe('up'); // 4 vs 3
      expect(result.trends.batteryHealth).toBe('up'); // 86 vs 80
      expect(result.trends.monthlySavings).toBe('up'); // Much higher than 1000
      expect(result.trends.co2Reduction).toBe('up'); // Much higher than 1.0
    });

    it('handles neutral trends correctly', () => {
      const previousData = {
        totalVehicles: 4,
        averageBatteryHealth: 86,
        monthlySavings: 0, // Will be calculated to similar value
        co2Reduction: 0, // Will be calculated to similar value
      };

      const result = calculateKPIs(mockVehicles, mockChargingStations, previousData);

      expect(result.trends.totalVehicles).toBe('neutral'); // Same count
      expect(result.trends.batteryHealth).toBe('neutral'); // Same health
    });

    it('handles empty vehicle array', () => {
      const result = calculateKPIs([], mockChargingStations);

      expect(result.totalVehicles).toBe(0);
      expect(result.activeVehicles).toBe(0);
      expect(result.chargingVehicles).toBe(0);
      expect(result.maintenanceVehicles).toBe(0);
      expect(result.averageBatteryLevel).toBe(0);
      expect(result.averageBatteryHealth).toBe(0);
      expect(result.monthlySavings).toBe(0);
      expect(result.co2Reduction).toBe(0);
    });

    it('handles single vehicle correctly', () => {
      const singleVehicle = [mockVehicles[0]];
      const result = calculateKPIs(singleVehicle, mockChargingStations);

      expect(result.totalVehicles).toBe(1);
      expect(result.averageBatteryLevel).toBe(80);
      expect(result.averageBatteryHealth).toBe(90);
      expect(result.details.statusBreakdown.active).toBe(1);
    });
  });

  describe('Formatting utilities', () => {
    describe('formatCurrency', () => {
      it('formats currency correctly', () => {
        expect(formatCurrency(1234)).toBe('₹1,234');
        expect(formatCurrency(1234.56)).toBe('₹1,235'); // Rounds to nearest rupee
        expect(formatCurrency(0)).toBe('₹0');
        expect(formatCurrency(1000000)).toBe('₹10,00,000');
      });

      it('handles different currencies', () => {
        expect(formatCurrency(1234, 'EUR')).toBe('€1,234');
      });
    });

    describe('formatPercentage', () => {
      it('formats percentages correctly', () => {
        expect(formatPercentage(85.6)).toBe('85.6%');
        expect(formatPercentage(85.67, 2)).toBe('85.67%');
        expect(formatPercentage(100)).toBe('100.0%');
        expect(formatPercentage(0)).toBe('0.0%');
      });
    });

    describe('formatNumber', () => {
      it('formats large numbers with suffixes', () => {
        expect(formatNumber(1234)).toBe('1.2K');
        expect(formatNumber(1234567)).toBe('1.2M');
        expect(formatNumber(999)).toBe('999');
        expect(formatNumber(1000)).toBe('1.0K');
        expect(formatNumber(1000000)).toBe('1.0M');
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles vehicles with missing battery data gracefully', () => {
      const vehicleWithMissingData = {
        ...mockVehicles[0],
        battery: { currentLevel: 0, health: 0, lastCharged: new Date(), estimatedRange: 0 },
      };

      const result = calculateKPIs([vehicleWithMissingData], mockChargingStations);

      expect(result.totalVehicles).toBe(1);
      expect(result.averageBatteryLevel).toBe(0);
      expect(result.averageBatteryHealth).toBe(0);
    });

    it('handles extreme battery values', () => {
      const extremeVehicles = [
        { ...mockVehicles[0], battery: { ...mockVehicles[0].battery, currentLevel: 100, health: 100 } },
        { ...mockVehicles[1], battery: { ...mockVehicles[1].battery, currentLevel: 0, health: 0 } },
      ];

      const result = calculateKPIs(extremeVehicles, mockChargingStations);

      expect(result.averageBatteryLevel).toBe(50); // (100 + 0) / 2
      expect(result.averageBatteryHealth).toBe(50); // (100 + 0) / 2
    });

    it('calculates trends with zero previous values', () => {
      const previousData = {
        totalVehicles: 0,
        averageBatteryHealth: 0,
        monthlySavings: 0,
        co2Reduction: 0,
      };

      const result = calculateKPIs(mockVehicles, mockChargingStations, previousData);

      // Should handle division by zero gracefully
      expect(result.trends.totalVehicles).toBe('neutral');
      expect(result.trends.batteryHealth).toBe('neutral');
      expect(result.trends.monthlySavings).toBe('neutral');
      expect(result.trends.co2Reduction).toBe('neutral');
    });
  });
});