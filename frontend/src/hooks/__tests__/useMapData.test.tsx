import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { useMapData } from '../useMapData';
import fleetReducer from '../../store/slices/fleetSlice';
import { Vehicle, ChargingStation } from '../../types';

const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Test Vehicle 1',
    type: 'truck',
    status: 'active',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA',
    },
    battery: {
      currentLevel: 85,
      health: 95,
      lastCharged: new Date('2024-12-09T10:00:00Z'),
      estimatedRange: 200,
    },
    alerts: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-12-09T12:00:00Z'),
  },
  {
    id: 'EV-002',
    name: 'Test Vehicle 2',
    type: 'van',
    status: 'charging',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'New York, NY',
    },
    battery: {
      currentLevel: 45,
      health: 88,
      lastCharged: new Date('2024-12-09T08:00:00Z'),
      estimatedRange: 120,
    },
    alerts: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-12-09T12:00:00Z'),
  },
];

const mockChargingStations: ChargingStation[] = [
  {
    id: 'CS-001',
    name: 'Test Station 1',
    location: {
      lat: 37.7649,
      lng: -122.4294,
      address: 'Test Address 1',
    },
    status: 'available',
    powerOutput: 150,
    connectorTypes: ['CCS', 'CHAdeMO'],
    queue: [],
    pricing: {
      rate: 0.25,
      currency: 'INR',
    },
  },
];

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
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
        ...initialState,
      },
    },
  });
};

const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useMapData', () => {
  it('returns initial data from store', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.vehicles).toEqual(mockVehicles);
    expect(result.current.chargingStations).toEqual(mockChargingStations);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('returns loading state from store', () => {
    const store = createMockStore({ loading: true });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('returns error state from store', () => {
    const store = createMockStore({ error: 'Test error' });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.error).toBe('Test error');
  });

  it('provides default viewport', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    // Should calculate viewport based on vehicle locations
    expect(result.current.viewport).toEqual(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        zoom: expect.any(Number),
      })
    );
  });

  it('includes mock geofences data', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.geofences).toHaveLength(2);
    expect(result.current.geofences[0]).toEqual(
      expect.objectContaining({
        id: 'warehouse-1',
        name: 'Main Warehouse',
        type: 'polygon',
      })
    );
    expect(result.current.geofences[1]).toEqual(
      expect.objectContaining({
        id: 'depot-1',
        name: 'Service Depot',
        type: 'polygon',
      })
    );
  });

  it('includes mock routes data', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.routes).toHaveLength(2);
    expect(result.current.routes[0]).toEqual(
      expect.objectContaining({
        id: 'route-1',
        name: 'Delivery Route A',
        status: 'active',
      })
    );
    expect(result.current.routes[1]).toEqual(
      expect.objectContaining({
        id: 'route-2',
        name: 'Service Route B',
        status: 'planned',
      })
    );
  });

  it('calculates viewport to fit all vehicles', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    // Should calculate center point between San Francisco and New York
    const expectedLat = (37.7749 + 40.7128) / 2;
    const expectedLng = (-122.4194 + -74.0060) / 2;

    expect(result.current.viewport.latitude).toBeCloseTo(expectedLat, 4);
    expect(result.current.viewport.longitude).toBeCloseTo(expectedLng, 4);
    
    // Should adjust zoom based on distance between vehicles
    expect(result.current.viewport.zoom).toBeLessThan(12);
  });

  it('uses default viewport when no vehicles are present', () => {
    const store = createMockStore({ vehicles: [] });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.viewport).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 12,
    });
  });

  it('allows setting custom viewport', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    const newViewport = {
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 15,
    };

    // Use act to wrap the state update
    act(() => {
      result.current.setViewport(newViewport);
    });

    expect(result.current.viewport).toEqual(newViewport);
  });

  it('adjusts zoom level based on vehicle spread', () => {
    // Test with vehicles close together
    const closeVehicles: Vehicle[] = [
      {
        ...mockVehicles[0],
        location: { lat: 37.7749, lng: -122.4194 },
      },
      {
        ...mockVehicles[1],
        location: { lat: 37.7759, lng: -122.4184 }, // Very close
      },
    ];

    const store = createMockStore({ vehicles: closeVehicles });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    // Should maintain higher zoom for close vehicles
    expect(result.current.viewport.zoom).toBeGreaterThanOrEqual(10);
  });

  it('handles single vehicle correctly', () => {
    const singleVehicle = [mockVehicles[0]];
    const store = createMockStore({ vehicles: singleVehicle });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(result.current.viewport.latitude).toBe(37.7749);
    expect(result.current.viewport.longitude).toBe(-122.4194);
    expect(result.current.viewport.zoom).toBe(12);
  });

  it('provides setViewport function', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useMapData(), { wrapper });

    expect(typeof result.current.setViewport).toBe('function');
  });
});