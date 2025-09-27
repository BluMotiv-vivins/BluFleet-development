import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { useDriverData } from '../useDriverData';
import fleetReducer from '../../store/slices/fleetSlice';
import alertReducer from '../../store/slices/alertSlice';
import type { Driver, Alert, Vehicle } from '../../types';

// Mock data
const mockDrivers: Driver[] = [
  {
    id: 'D-001',
    name: 'Sarah Johnson',
    email: 'sarah@test.com',
    safetyScore: 95,
    ecoScore: 92,
    totalMiles: 15000,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'active',
  },
  {
    id: 'D-002',
    name: 'Mike Chen',
    email: 'mike@test.com',
    safetyScore: 88,
    ecoScore: 85,
    totalMiles: 12000,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'active',
  },
  {
    id: 'D-003',
    name: 'Emily Rodriguez',
    email: 'emily@test.com',
    safetyScore: 91,
    ecoScore: 89,
    totalMiles: 18000,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'active',
  },
];

const mockVehicles: Vehicle[] = [
  {
    id: 'V-001',
    name: 'Test Vehicle 1',
    type: 'van',
    status: 'active',
    location: { lat: 47.6062, lng: -122.3321 },
    battery: {
      currentLevel: 75,
      health: 90,
      lastCharged: new Date(),
      estimatedRange: 200,
    },
    driver: mockDrivers[0],
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    type: 'safety',
    severity: 'high',
    title: 'Harsh Braking',
    message: 'Driver performed harsh braking',
    driverId: 'D-001',
    vehicleId: 'V-001',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'safety',
    severity: 'medium',
    title: 'Speed Limit Exceeded',
    message: 'Driver exceeded speed limit',
    driverId: 'D-002',
    vehicleId: 'V-001',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    acknowledged: false,
  },
  {
    id: 'A-003',
    type: 'battery',
    severity: 'low',
    title: 'Low Battery',
    message: 'Vehicle battery is low',
    vehicleId: 'V-001',
    timestamp: new Date(),
    acknowledged: false,
  },
];

const createMockStore = (drivers = mockDrivers, vehicles = mockVehicles, alerts = mockAlerts) => {
  return configureStore({
    reducer: {
      fleet: fleetReducer,
      alerts: alertReducer,
    },
    preloadedState: {
      fleet: {
        drivers,
        vehicles,
        chargingStations: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
      alerts: {
        alerts,
        unreadCount: alerts.filter(a => !a.acknowledged).length,
        loading: false,
      },
    },
  });
};

const renderHookWithProvider = (store = createMockStore()) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useDriverData(), { wrapper });
};

describe('useDriverData', () => {
  it('should return all drivers from the store', () => {
    const { result } = renderHookWithProvider();
    
    expect(result.current.drivers).toHaveLength(mockDrivers.length);
    expect(result.current.drivers[0].name).toBe('Sarah Johnson');
  });

  it('should return top eco drivers sorted by eco score', () => {
    const { result } = renderHookWithProvider();
    
    expect(result.current.topEcoDrivers).toHaveLength(3);
    expect(result.current.topEcoDrivers[0].ecoScore).toBe(92); // Sarah Johnson
    expect(result.current.topEcoDrivers[1].ecoScore).toBe(89); // Emily Rodriguez
    expect(result.current.topEcoDrivers[2].ecoScore).toBe(85); // Mike Chen
  });

  it('should return top safety drivers sorted by safety score', () => {
    const { result } = renderHookWithProvider();
    
    expect(result.current.topSafetyDrivers).toHaveLength(3);
    expect(result.current.topSafetyDrivers[0].safetyScore).toBe(95); // Sarah Johnson
    expect(result.current.topSafetyDrivers[1].safetyScore).toBe(91); // Emily Rodriguez
    expect(result.current.topSafetyDrivers[2].safetyScore).toBe(88); // Mike Chen
  });

  it('should return driver rankings based on combined score', () => {
    const { result } = renderHookWithProvider();
    
    expect(result.current.driverRankings).toHaveLength(3);
    // Sarah Johnson should be first (95*0.6 + 92*0.4 = 93.8)
    expect(result.current.driverRankings[0].name).toBe('Sarah Johnson');
  });

  it('should filter driver alerts correctly', () => {
    const { result } = renderHookWithProvider();
    
    expect(result.current.driverAlerts).toHaveLength(2); // Only safety alerts with driverId
    expect(result.current.driverAlerts.every(alert => alert.type === 'safety')).toBe(true);
    expect(result.current.driverAlerts.every(alert => alert.driverId)).toBe(true);
  });

  it('should get driver metrics for specific driver', () => {
    const { result } = renderHookWithProvider();
    
    const metrics = result.current.getDriverMetrics('D-001');
    
    expect(metrics.safetyScore).toBeGreaterThan(0);
    expect(metrics.ecoScore).toBeGreaterThan(0);
    expect(metrics.alertCount).toBeGreaterThanOrEqual(0);
    expect(metrics.harshDrivingEvents).toBeGreaterThanOrEqual(0);
    expect(metrics.milesPerAlert).toBeGreaterThan(0);
    expect(metrics.efficiencyRating).toBeGreaterThan(0);
  });

  it('should return default metrics for non-existent driver', () => {
    const { result } = renderHookWithProvider();
    
    const metrics = result.current.getDriverMetrics('NON-EXISTENT');
    
    expect(metrics.safetyScore).toBe(0);
    expect(metrics.ecoScore).toBe(0);
    expect(metrics.alertCount).toBe(0);
    expect(metrics.harshDrivingEvents).toBe(0);
    expect(metrics.milesPerAlert).toBe(0);
    expect(metrics.efficiencyRating).toBe(0);
  });

  it('should get alerts for specific driver', () => {
    const { result } = renderHookWithProvider();
    
    const driverAlerts = result.current.getDriverAlerts('D-001');
    
    expect(driverAlerts).toHaveLength(1);
    expect(driverAlerts[0].driverId).toBe('D-001');
    expect(driverAlerts[0].type).toBe('safety');
  });

  it('should get harsh driving events for specific driver', () => {
    const { result } = renderHookWithProvider();
    
    const harshEvents = result.current.getHarshDrivingEvents('D-001');
    
    expect(Array.isArray(harshEvents)).toBe(true);
    // Mock harsh events are generated randomly, so we just check the structure
    harshEvents.forEach(event => {
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('driverId');
      expect(event).toHaveProperty('vehicleId');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('severity');
      expect(event).toHaveProperty('timestamp');
    });
  });

  it('should handle empty driver list', () => {
    const store = createMockStore([], [], []);
    const { result } = renderHookWithProvider(store);
    
    expect(result.current.drivers).toHaveLength(0);
    expect(result.current.topEcoDrivers).toHaveLength(0);
    expect(result.current.topSafetyDrivers).toHaveLength(0);
    expect(result.current.driverRankings).toHaveLength(0);
    expect(result.current.driverAlerts).toHaveLength(0);
  });

  it('should handle empty alerts list', () => {
    const store = createMockStore(mockDrivers, mockVehicles, []);
    const { result } = renderHookWithProvider(store);
    
    expect(result.current.driverAlerts).toHaveLength(0);
    
    const driverAlerts = result.current.getDriverAlerts('D-001');
    expect(driverAlerts).toHaveLength(0);
  });

  it('should limit top drivers to 5', () => {
    const manyDrivers = Array(10).fill(null).map((_, i) => ({
      ...mockDrivers[0],
      id: `D-${i + 1}`,
      name: `Driver ${i + 1}`,
      ecoScore: 90 - i,
      safetyScore: 95 - i,
    }));
    
    const store = createMockStore(manyDrivers, mockVehicles, mockAlerts);
    const { result } = renderHookWithProvider(store);
    
    expect(result.current.topEcoDrivers).toHaveLength(5);
    expect(result.current.topSafetyDrivers).toHaveLength(5);
  });

  it('should call refreshDriverScores without errors', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHookWithProvider();
    
    expect(() => result.current.refreshDriverScores()).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('Refreshing driver scores...');
    
    consoleSpy.mockRestore();
  });

  it('should update when store data changes', () => {
    const store = createMockStore();
    const { result, rerender } = renderHookWithProvider(store);
    
    const initialDriverCount = result.current.drivers.length;
    
    // Simulate store update by re-rendering
    rerender();
    
    expect(result.current.drivers.length).toBe(initialDriverCount);
  });

  it('should handle drivers with no recent alerts', () => {
    const driversWithoutAlerts = mockDrivers.map(d => ({ ...d, id: `${d.id}-NO-ALERTS` }));
    const alertsWithoutDrivers = mockAlerts.filter(a => a.type !== 'safety');
    
    const store = createMockStore(driversWithoutAlerts, mockVehicles, alertsWithoutDrivers);
    const { result } = renderHookWithProvider(store);
    
    const metrics = result.current.getDriverMetrics(driversWithoutAlerts[0].id);
    expect(metrics.alertCount).toBe(0);
    
    const driverAlerts = result.current.getDriverAlerts(driversWithoutAlerts[0].id);
    expect(driverAlerts).toHaveLength(0);
  });
});