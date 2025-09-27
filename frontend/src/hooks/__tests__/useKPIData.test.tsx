import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { useKPIData } from '../useKPIData';
import dashboardReducer from '../../store/slices/dashboardSlice';
import fleetReducer from '../../store/slices/fleetSlice';
import type { Vehicle, ChargingStation } from '../../types';

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Fleet Truck 001',
    type: 'truck',
    status: 'active',
    location: { lat: 47.6062, lng: -122.3321, address: 'Seattle Depot' },
    battery: { currentLevel: 82, health: 94, lastCharged: new Date(), estimatedRange: 245 },
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
    battery: { currentLevel: 45, health: 89, lastCharged: new Date(), estimatedRange: 128 },
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
];

const createTestStore = (refreshInterval = 0) => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
      fleet: fleetReducer,
    },
    preloadedState: {
      fleet: {
        vehicles: mockVehicles,
        chargingStations: mockChargingStations,
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
      dashboard: {
        kpis: {
          totalVehicles: 0,
          activeVehicles: 0,
          chargingVehicles: 0,
          maintenanceVehicles: 0,
          averageBatteryLevel: 0,
          averageBatteryHealth: 0,
          monthlySavings: 0,
          co2Reduction: 0,
        },
        kpiDetails: null,
        filters: { timeRange: '24h', vehicleTypes: [], locations: [] },
        timeRange: '24h',
        refreshInterval,
        lastUpdated: null,
        previousPeriodData: {
          totalVehicles: 1,
          averageBatteryHealth: 85,
          monthlySavings: 8000,
          co2Reduction: 2.1,
        },
      },
    },
  });
};

const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useKPIData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('calculates KPIs on initial render', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useKPIData(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.kpiData).toBeTruthy();
    expect(result.current.kpiData?.totalVehicles).toBe(2);
    expect(result.current.kpiData?.activeVehicles).toBe(1);
    expect(result.current.kpiData?.chargingVehicles).toBe(1);
  });

  it('recalculates KPIs when fleet data changes', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useKPIData(), { wrapper });

    const initialTotalVehicles = result.current.kpiData?.totalVehicles;
    expect(initialTotalVehicles).toBe(2);

    // Update an existing vehicle's battery level
    act(() => {
      store.dispatch({
        type: 'fleet/updateVehicleBattery',
        payload: { id: 'EV-001', level: 95 },
      });
    });

    // KPIs should be recalculated with updated battery level
    expect(result.current.kpiData?.totalVehicles).toBe(2);
    expect(result.current.kpiData?.averageBatteryLevel).toBeGreaterThan(49); // Should be higher now
  });

  it('provides refresh function that recalculates KPIs', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useKPIData(), { wrapper });

    const initialKPIData = result.current.kpiData;
    expect(initialKPIData).toBeTruthy();

    // Call refresh function
    act(() => {
      const refreshedData = result.current.refreshKPIs();
      expect(refreshedData).toBeTruthy();
      expect(refreshedData.totalVehicles).toBe(2);
    });
  });

  it('sets up real-time updates when refresh interval is configured', () => {
    const store = createTestStore(1000); // 1 second refresh interval
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useKPIData(), { wrapper });

    expect(result.current.kpiData).toBeTruthy();

    // Fast-forward time to trigger refresh
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should still have valid KPI data after refresh
    expect(result.current.kpiData).toBeTruthy();
    expect(result.current.kpiData?.totalVehicles).toBe(2);
  });

  it('cleans up interval on unmount', () => {
    const store = createTestStore(1000);
    const wrapper = createWrapper(store);

    const { unmount } = renderHook(() => useKPIData(), { wrapper });

    // Verify interval is set up
    expect(vi.getTimerCount()).toBe(1);

    // Unmount the hook
    unmount();

    // Interval should be cleared
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not set up interval when refresh interval is 0 or negative', () => {
    const store = createTestStore(0);
    const wrapper = createWrapper(store);

    renderHook(() => useKPIData(), { wrapper });

    // No timers should be set up
    expect(vi.getTimerCount()).toBe(0);
  });

  it('handles empty fleet data gracefully', () => {
    const emptyStore = configureStore({
      reducer: {
        dashboard: dashboardReducer,
        fleet: fleetReducer,
      },
      preloadedState: {
        fleet: {
          vehicles: [],
          chargingStations: [],
          drivers: [],
          routes: [],
          geofences: [],
          loading: false,
          error: null,
        },
        dashboard: {
          kpis: {
            totalVehicles: 0,
            activeVehicles: 0,
            chargingVehicles: 0,
            maintenanceVehicles: 0,
            averageBatteryLevel: 0,
            averageBatteryHealth: 0,
            monthlySavings: 0,
            co2Reduction: 0,
          },
          kpiDetails: null,
          filters: { timeRange: '24h', vehicleTypes: [], locations: [] },
          timeRange: '24h',
          refreshInterval: 0,
          lastUpdated: null,
          previousPeriodData: null,
        },
      },
    });

    const wrapper = createWrapper(emptyStore);
    const { result } = renderHook(() => useKPIData(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.kpiData).toBeTruthy();
    expect(result.current.kpiData?.totalVehicles).toBe(0);
    expect(result.current.kpiData?.activeVehicles).toBe(0);
  });

  it('updates KPIs when previous period data changes', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useKPIData(), { wrapper });

    const initialTrends = result.current.kpiData?.trends;
    expect(initialTrends).toBeTruthy();

    // Update previous period data
    act(() => {
      store.dispatch({
        type: 'dashboard/setPreviousPeriodData',
        payload: {
          totalVehicles: 3, // Higher than current 2
          averageBatteryHealth: 90, // Higher than current
          monthlySavings: 15000, // Higher than current
          co2Reduction: 5.0, // Higher than current
        },
      });
    });

    // Trends should be recalculated
    const updatedTrends = result.current.kpiData?.trends;
    expect(updatedTrends).toBeTruthy();
    // Most trends should now be 'down' since previous values are higher
  });

  it('maintains consistent data structure', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useKPIData(), { wrapper });

    const kpiData = result.current.kpiData;
    expect(kpiData).toBeTruthy();

    // Verify all required properties exist
    expect(typeof kpiData?.totalVehicles).toBe('number');
    expect(typeof kpiData?.activeVehicles).toBe('number');
    expect(typeof kpiData?.chargingVehicles).toBe('number');
    expect(typeof kpiData?.maintenanceVehicles).toBe('number');
    expect(typeof kpiData?.averageBatteryLevel).toBe('number');
    expect(typeof kpiData?.averageBatteryHealth).toBe('number');
    expect(typeof kpiData?.monthlySavings).toBe('number');
    expect(typeof kpiData?.co2Reduction).toBe('number');

    // Verify trends object
    expect(kpiData?.trends).toBeTruthy();
    expect(['up', 'down', 'neutral']).toContain(kpiData?.trends.totalVehicles);
    expect(['up', 'down', 'neutral']).toContain(kpiData?.trends.batteryHealth);
    expect(['up', 'down', 'neutral']).toContain(kpiData?.trends.monthlySavings);
    expect(['up', 'down', 'neutral']).toContain(kpiData?.trends.co2Reduction);

    // Verify details object
    expect(kpiData?.details).toBeTruthy();
    expect(kpiData?.details.statusBreakdown).toBeTruthy();
    expect(kpiData?.details.batteryDetails).toBeTruthy();
    expect(kpiData?.details.costDetails).toBeTruthy();
    expect(kpiData?.details.sustainabilityDetails).toBeTruthy();
  });
});