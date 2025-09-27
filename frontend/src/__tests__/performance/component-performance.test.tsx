import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { performance } from 'perf_hooks';
import VehicleTable from '../../components/dashboard/VehicleTable';
import KPICards from '../../components/dashboard/KPICards';
import { fleetSlice } from '../../store/slices/fleetSlice';
import { dashboardSlice } from '../../store/slices/dashboardSlice';

// Generate large datasets for performance testing
const generateVehicles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `EV-${String(i + 1).padStart(3, '0')}`,
    name: `Vehicle ${i + 1}`,
    type: ['truck', 'van', 'car', 'forklift'][i % 4] as any,
    status: ['active', 'charging', 'maintenance', 'offline'][i % 4] as any,
    location: {
      lat: 47.6062 + (Math.random() - 0.5) * 0.1,
      lng: -122.3321 + (Math.random() - 0.5) * 0.1,
      address: `${1000 + i} Test St, Seattle, WA`,
    },
    battery: {
      currentLevel: Math.floor(Math.random() * 100),
      health: 80 + Math.floor(Math.random() * 20),
      lastCharged: new Date(Date.now() - Math.random() * 86400000),
      estimatedRange: 200 + Math.floor(Math.random() * 100),
    },
    driver: i % 3 === 0 ? {
      id: `D-${i}`,
      name: `Driver ${i}`,
      email: `driver${i}@example.com`,
      safetyScore: 80 + Math.floor(Math.random() * 20),
      ecoScore: 70 + Math.floor(Math.random() * 30),
      totalMiles: Math.floor(Math.random() * 50000),
      recentAlerts: [],
      certifications: ['Basic', 'Advanced'],
      status: 'active' as any,
    } : undefined,
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

const createTestStore = (vehicles: any[] = []) => {
  return configureStore({
    reducer: {
      fleet: fleetSlice.reducer,
      dashboard: dashboardSlice.reducer,
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
      dashboard: {
        kpis: {
          totalFleetStatus: { active: 50, charging: 25, maintenance: 10 },
          batteryHealth: { averageSOC: 75, overallHealth: 85 },
          costSavings: { monthly: 5000, fuel: 3000, maintenance: 2000 },
          sustainability: { co2Reduction: 10.5, milesReduction: 50000 },
        },
        filters: {},
        timeRange: '24h',
        refreshInterval: 30000,
        lastUpdated: new Date(),
      },
    },
  });
};

const renderWithStore = (component: React.ReactElement, store: any) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Component Performance Tests', () => {
  const PERFORMANCE_THRESHOLD = 100; // milliseconds

  test('VehicleTable should render 100 vehicles within performance threshold', () => {
    const vehicles = generateVehicles(100);
    const store = createTestStore(vehicles);

    const startTime = performance.now();
    
    renderWithStore(
      <VehicleTable 
        vehicles={vehicles}
        onVehicleAction={() => {}}
        filters={{}}
        onFilterChange={() => {}}
      />, 
      store
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLD);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('VehicleTable should handle 500 vehicles efficiently', () => {
    const vehicles = generateVehicles(500);
    const store = createTestStore(vehicles);

    const startTime = performance.now();
    
    renderWithStore(
      <VehicleTable 
        vehicles={vehicles}
        onVehicleAction={() => {}}
        filters={{}}
        onFilterChange={() => {}}
      />, 
      store
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Allow more time for larger datasets
    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLD * 3);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('KPICards should render quickly with complex calculations', () => {
    const vehicles = generateVehicles(1000);
    const store = createTestStore(vehicles);

    const startTime = performance.now();
    
    renderWithStore(<KPICards />, store);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLD);
    expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
  });

  test('should handle rapid re-renders without performance degradation', () => {
    const vehicles = generateVehicles(50);
    const store = createTestStore(vehicles);

    const renderTimes: number[] = [];

    // Perform multiple renders to test consistency
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      
      const { unmount } = renderWithStore(
        <VehicleTable 
          vehicles={vehicles}
          onVehicleAction={() => {}}
          filters={{}}
          onFilterChange={() => {}}
        />, 
        store
      );

      const endTime = performance.now();
      renderTimes.push(endTime - startTime);
      
      unmount();
    }

    // Check that render times are consistent (no memory leaks or performance degradation)
    const averageTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxTime = Math.max(...renderTimes);
    
    expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD);
    expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLD * 1.5);
  });

  test('should handle memory efficiently with large datasets', () => {
    const vehicles = generateVehicles(1000);
    const store = createTestStore(vehicles);

    // Measure memory before
    const memoryBefore = process.memoryUsage().heapUsed;

    const { unmount } = renderWithStore(
      <VehicleTable 
        vehicles={vehicles}
        onVehicleAction={() => {}}
        filters={{}}
        onFilterChange={() => {}}
      />, 
      store
    );

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    unmount();

    // Force garbage collection again
    if (global.gc) {
      global.gc();
    }

    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryDiff = memoryAfter - memoryBefore;

    // Memory usage should not increase significantly after unmounting
    expect(memoryDiff).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
  });

  test('should handle frequent prop updates efficiently', () => {
    const vehicles = generateVehicles(100);
    const store = createTestStore(vehicles);

    const { rerender } = renderWithStore(
      <VehicleTable 
        vehicles={vehicles}
        onVehicleAction={() => {}}
        filters={{}}
        onFilterChange={() => {}}
      />, 
      store
    );

    const updateTimes: number[] = [];

    // Simulate frequent updates
    for (let i = 0; i < 10; i++) {
      const updatedVehicles = vehicles.map(v => ({
        ...v,
        battery: {
          ...v.battery,
          currentLevel: Math.floor(Math.random() * 100),
        },
      }));

      const startTime = performance.now();
      
      rerender(
        <Provider store={store}>
          <VehicleTable 
            vehicles={updatedVehicles}
            onVehicleAction={() => {}}
            filters={{}}
            onFilterChange={() => {}}
          />
        </Provider>
      );

      const endTime = performance.now();
      updateTimes.push(endTime - startTime);
    }

    const averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
    expect(averageUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLD / 2); // Updates should be faster than initial render
  });
});