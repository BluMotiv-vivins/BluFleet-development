import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useBatteryData } from '../useBatteryData';
import fleetSlice from '../../store/slices/fleetSlice';
import type { Vehicle } from '../../types';

// Mock the battery calculations module
vi.mock('../../utils/batteryCalculations', () => ({
  calculateBatteryStats: vi.fn(() => ({
    averageLevel: 65,
    totalCapacity: 400,
    chargingVehicles: 1,
    lowBatteryCount: 1,
    nextChargeTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    nextChargeVehicle: 'EV-002',
  })),
  generateChargingQueue: vi.fn(() => [
    {
      vehicleId: 'EV-002',
      vehicleName: 'Delivery Van 002',
      currentBattery: 15,
      priority: 'high' as const,
      estimatedWaitTime: 0,
      estimatedChargeTime: 97,
    },
    {
      vehicleId: 'EV-004',
      vehicleName: 'Car 004',
      currentBattery: 60,
      priority: 'medium' as const,
      estimatedWaitTime: 45,
      estimatedChargeTime: 30,
    },
  ]),
  generatePowerConsumptionData: vi.fn(() => [
    {
      hour: 0,
      consumption: 45,
      efficiency: 88,
      timestamp: new Date(),
    },
    {
      hour: 1,
      consumption: 52,
      efficiency: 91,
      timestamp: new Date(),
    },
  ]),
  optimizeChargingQueue: vi.fn((queue) => [...queue].reverse()),
  formatTimeRemaining: vi.fn(() => '2h 0m'),
}));

const mockVehicles: Vehicle[] = [
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
];

const createMockStore = (vehicles: Vehicle[] = mockVehicles) => {
  return configureStore({
    reducer: {
      fleet: fleetSlice,
    },
    preloadedState: {
      fleet: {
        vehicles,
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
    },
  });
};

const renderHookWithProvider = (vehicles?: Vehicle[]) => {
  const store = createMockStore(vehicles);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  
  return renderHook(() => useBatteryData(), { wrapper });
};

describe('useBatteryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct initial state', () => {
    const { result } = renderHookWithProvider();
    
    // The hook processes data immediately, so we check the final state
    expect(result.current.batteryData).toBeDefined();
    expect(result.current.chargingQueue).toBeDefined();
    expect(result.current.powerConsumption).toBeDefined();
  });

  it('should calculate battery data when vehicles are available', async () => {
    const { result } = renderHookWithProvider();
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.batteryData).toEqual({
      averageLevel: 65,
      totalCapacity: 400,
      chargingVehicles: 1,
      lowBatteryCount: 1,
      nextChargeTime: expect.any(Date),
      nextChargeVehicle: 'EV-002',
    });
  });

  it('should generate charging queue', async () => {
    const { result } = renderHookWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.chargingQueue).toHaveLength(2);
    expect(result.current.chargingQueue[0]).toEqual({
      vehicleId: 'EV-002',
      vehicleName: 'Delivery Van 002',
      currentBattery: 15,
      priority: 'high',
      estimatedWaitTime: 0,
      estimatedChargeTime: 97,
    });
  });

  it('should generate power consumption data', async () => {
    const { result } = renderHookWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.powerConsumption).toHaveLength(2);
    expect(result.current.powerConsumption[0]).toEqual({
      hour: 0,
      consumption: 45,
      efficiency: 88,
      timestamp: expect.any(Date),
    });
  });

  it('should update charging priority', async () => {
    const { result } = renderHookWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    act(() => {
      result.current.updateChargingPriority('EV-002', 'low');
    });
    
    // The queue should be optimized after priority change
    expect(result.current.chargingQueue[0].priority).toBe('medium'); // Reversed due to mock
    expect(result.current.chargingQueue[1].priority).toBe('low');
  });

  it('should optimize queue', async () => {
    const { result } = renderHookWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const originalOrder = [...result.current.chargingQueue];
    
    act(() => {
      result.current.optimizeQueue();
    });
    
    // Queue should be reversed due to mock implementation
    expect(result.current.chargingQueue[0]).toEqual(originalOrder[1]);
    expect(result.current.chargingQueue[1]).toEqual(originalOrder[0]);
  });

  it('should refresh data', async () => {
    const { result } = renderHookWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Clear the mock calls
    vi.clearAllMocks();
    
    act(() => {
      result.current.refreshData();
    });
    
    // Should call the calculation functions again
    const { calculateBatteryStats, generateChargingQueue, generatePowerConsumptionData } = 
      await import('../../utils/batteryCalculations');
    
    expect(calculateBatteryStats).toHaveBeenCalled();
    expect(generateChargingQueue).toHaveBeenCalled();
    expect(generatePowerConsumptionData).toHaveBeenCalled();
  });

  it('should handle empty vehicle array', async () => {
    const { result } = renderHookWithProvider([]);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.batteryData).toBeNull();
    expect(result.current.chargingQueue).toEqual([]);
  });

  it('should update countdown timer', async () => {
    const { result } = renderHookWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.nextChargeCountdown).toBe('2h 0m');
  });

  it('should handle fleet loading state', () => {
    const store = configureStore({
      reducer: {
        fleet: fleetSlice,
      },
      preloadedState: {
        fleet: {
          vehicles: mockVehicles,
          chargingStations: [],
          drivers: [],
          routes: [],
          geofences: [],
          loading: true,
          error: null,
        },
      },
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    
    const { result } = renderHook(() => useBatteryData(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle fleet error state', () => {
    const store = configureStore({
      reducer: {
        fleet: fleetSlice,
      },
      preloadedState: {
        fleet: {
          vehicles: mockVehicles,
          chargingStations: [],
          drivers: [],
          routes: [],
          geofences: [],
          loading: false,
          error: 'Network error',
        },
      },
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    
    const { result } = renderHook(() => useBatteryData(), { wrapper });
    
    expect(result.current.error).toBe('Network error');
  });
});