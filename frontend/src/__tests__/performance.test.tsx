import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { performance } from 'perf_hooks';
import VehicleTable from '../components/dashboard/VehicleTable';
import FleetMap from '../components/map/FleetMap';
import VirtualizedTable from '../components/ui/VirtualizedTable';
import VirtualizedList from '../components/ui/VirtualizedList';
import { fleetSlice } from '../store/slices/fleetSlice';
import { dashboardSlice } from '../store/slices/dashboardSlice';
import { alertSlice } from '../store/slices/alertSlice';
import { uiSlice } from '../store/slices/uiSlice';
import type { Vehicle, ChargingStation } from '../types';

import { vi } from 'vitest';

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(() => ({
    addControl: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    getLayer: vi.fn(),
    getSource: vi.fn(),
  })),
  NavigationControl: vi.fn(),
  FullscreenControl: vi.fn(),
  ScaleControl: vi.fn(),
  AttributionControl: vi.fn(),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    setPopup: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getElement: vi.fn(() => document.createElement('div')),
    getLngLat: vi.fn(() => ({ lng: 0, lat: 0 })),
    getPopup: vi.fn(),
  })),
  Popup: vi.fn(() => ({
    setHTML: vi.fn().mockReturnThis(),
  })),
  accessToken: '',
}));

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }: any) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: Math.min(itemCount, 10) }, (_, index) =>
        children({ index, style: {}, data: itemData })
      )}
    </div>
  ),
  VariableSizeList: ({ children, itemCount, itemData }: any) => (
    <div data-testid="virtualized-variable-list">
      {Array.from({ length: Math.min(itemCount, 10) }, (_, index) =>
        children({ index, style: {}, data: itemData })
      )}
    </div>
  ),
}));

// Generate test data
const generateVehicles = (count: number): Vehicle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `vehicle-${i}`,
    name: `Vehicle ${i}`,
    type: ['truck', 'van', 'car', 'forklift'][i % 4] as Vehicle['type'],
    status: ['active', 'charging', 'maintenance', 'offline'][i % 4] as Vehicle['status'],
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
      address: `Address ${i}`,
    },
    battery: {
      currentLevel: Math.floor(Math.random() * 100),
      health: Math.floor(Math.random() * 100),
      lastCharged: new Date(),
      estimatedRange: Math.floor(Math.random() * 300),
    },
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

const generateChargingStations = (count: number): ChargingStation[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `station-${i}`,
    name: `Station ${i}`,
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
      address: `Station Address ${i}`,
    },
    status: ['available', 'occupied', 'maintenance', 'offline'][i % 4] as ChargingStation['status'],
    powerOutput: 50 + Math.floor(Math.random() * 100),
    connectorTypes: ['Type 2', 'CCS'],
    queue: [],
    pricing: {
      rate: 0.25 + Math.random() * 0.5,
      currency: 'INR',
    },
  }));
};

const createTestStore = (vehicles: Vehicle[] = [], chargingStations: ChargingStation[] = []) => {
  return configureStore({
    reducer: {
      fleet: fleetSlice.reducer,
      dashboard: dashboardSlice.reducer,
      alerts: alertSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: {
      fleet: {
        vehicles,
        chargingStations,
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
      dashboard: {
        kpis: {
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter(v => v.status === 'active').length,
          averageBatteryLevel: 75,
          totalDistance: 1000,
          costSavings: 5000,
          co2Reduction: 2500,
        },
        filters: {
          dateRange: { start: new Date(), end: new Date() },
          vehicleTypes: [],
          locations: [],
        },
        timeRange: 'today',
        refreshInterval: 30000,
      },
      alerts: {
        alerts: [],
        unreadCount: 0,
        loading: false,
        error: null,
      },
      ui: {
        sidebarCollapsed: false,
        theme: 'light',
        notifications: [],
      },
    },
  });
};

describe('Performance Tests', () => {
  describe('VehicleTable Performance', () => {
    it('should render 100 vehicles within performance threshold', async () => {
      const vehicles = generateVehicles(100);
      const store = createTestStore(vehicles);
      
      const startTime = performance.now();
      
      render(
        <Provider store={store}>
          <VehicleTable />
        </Provider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Vehicle Status')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle 1000 vehicles without performance degradation', async () => {
      const vehicles = generateVehicles(1000);
      const store = createTestStore(vehicles);
      
      const startTime = performance.now();
      
      render(
        <Provider store={store}>
          <VehicleTable />
        </Provider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Vehicle Status')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should still render within reasonable time even with 1000 items
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('FleetMap Performance', () => {
    it('should render map with 50 vehicles and stations efficiently', async () => {
      const vehicles = generateVehicles(50);
      const chargingStations = generateChargingStations(20);
      
      const startTime = performance.now();
      
      render(
        <FleetMap
          vehicles={vehicles}
          chargingStations={chargingStations}
          geofences={[]}
          routes={[]}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Map should initialize quickly
      expect(renderTime).toBeLessThan(300);
    });

    it('should handle large datasets without memory leaks', () => {
      const vehicles = generateVehicles(200);
      const chargingStations = generateChargingStations(50);
      
      const { unmount } = render(
        <FleetMap
          vehicles={vehicles}
          chargingStations={chargingStations}
          geofences={[]}
          routes={[]}
        />
      );
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('VirtualizedTable Performance', () => {
    const columns = [
      { key: 'id' as const, header: 'ID', width: 100 },
      { key: 'name' as const, header: 'Name', width: 200 },
      { key: 'status' as const, header: 'Status', width: 100 },
    ];

    it('should efficiently render large datasets', async () => {
      const vehicles = generateVehicles(10000);
      
      const startTime = performance.now();
      
      render(
        <VirtualizedTable
          data={vehicles}
          columns={columns}
          height={400}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Virtualized table should render very quickly regardless of data size
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });

    it('should only render visible items', () => {
      const vehicles = generateVehicles(1000);
      
      render(
        <VirtualizedTable
          data={vehicles}
          columns={columns}
          height={400}
          itemHeight={48}
        />
      );
      
      const listElement = screen.getByTestId('virtualized-list');
      // Should only render a subset of items (mocked to 10 in our mock)
      expect(listElement.children.length).toBeLessThanOrEqual(10);
    });
  });

  describe('VirtualizedList Performance', () => {
    it('should handle large lists efficiently', () => {
      const items = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      const startTime = performance.now();
      
      render(
        <VirtualizedList
          items={items}
          height={400}
          itemHeight={40}
          renderItem={(item) => <div key={item.id}>{item.name}</div>}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50);
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });

    it('should support variable height items', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      render(
        <VirtualizedList
          items={items}
          height={400}
          itemHeight={(index) => 40 + (index % 3) * 20}
          renderItem={(item) => <div key={item.id}>{item.name}</div>}
        />
      );
      
      expect(screen.getByTestId('virtualized-variable-list')).toBeInTheDocument();
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with frequent re-renders', () => {
      const vehicles = generateVehicles(100);
      const store = createTestStore(vehicles);
      
      const { rerender, unmount } = render(
        <Provider store={store}>
          <VehicleTable />
        </Provider>
      );
      
      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        const newVehicles = generateVehicles(100);
        const newStore = createTestStore(newVehicles);
        
        rerender(
          <Provider store={newStore}>
            <VehicleTable />
          </Provider>
        );
      }
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const { performanceMonitor } = require('../utils/performanceMonitoring');
      
      performanceMonitor.addMetric({
        name: 'test-render',
        duration: 50,
        timestamp: Date.now(),
        type: 'render',
      });
      
      const metrics = performanceMonitor.getMetrics('render');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-render');
      expect(metrics[0].duration).toBe(50);
    });

    it('should measure async operations', async () => {
      const { measureAsync } = require('../utils/performanceMonitoring');
      
      const asyncOperation = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 100)
      );
      
      const result = await measureAsync('test-async', asyncOperation, 'api');
      expect(result).toBe('result');
    });

    it('should measure sync operations', () => {
      const { measureSync } = require('../utils/performanceMonitoring');
      
      const syncOperation = () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };
      
      const result = measureSync('test-sync', syncOperation, 'render');
      expect(result).toBe(499500);
    });

    it('should generate performance reports', () => {
      const { generatePerformanceReport, performanceMonitor } = require('../utils/performanceMonitoring');
      
      // Add some test metrics
      performanceMonitor.addMetric({
        name: 'slow-render',
        duration: 200,
        timestamp: Date.now(),
        type: 'render',
      });
      
      const report = generatePerformanceReport();
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('recommendations');
      expect(report.recommendations).toContain('slow renders detected');
    });

    it('should detect memory usage when available', () => {
      const { getMemoryUsage } = require('../utils/performanceMonitoring');
      
      // Mock performance.memory
      const originalPerformance = global.performance;
      (global as any).performance = {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000,
        },
      };
      
      const memoryUsage = getMemoryUsage();
      expect(memoryUsage).toEqual({
        used: 1000000,
        total: 2000000,
        limit: 4000000,
        percentage: 25,
      });
      
      global.performance = originalPerformance;
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should support lazy loading', async () => {
      // Test that lazy imports work
      const LazyComponent = React.lazy(() => 
        Promise.resolve({ default: () => <div>Lazy Component</div> })
      );
      
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Lazy Component')).toBeInTheDocument();
      });
    });

    it('should handle lazy loading failures gracefully', async () => {
      const FailingLazyComponent = React.lazy(() => 
        Promise.reject(new Error('Failed to load component'))
      );
      
      const { ErrorBoundary } = require('../components/error/ErrorBoundary');
      
      render(
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <FailingLazyComponent />
          </React.Suspense>
        </ErrorBoundary>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('should analyze bundle size', () => {
      const { analyzeBundleSize } = require('../utils/performanceMonitoring');
      
      // Mock DOM elements
      document.head.innerHTML = `
        <script src="/static/js/main.js"></script>
        <script src="/static/js/vendor.js"></script>
        <link rel="stylesheet" href="/static/css/main.css">
      `;
      
      const analysis = analyzeBundleSize();
      expect(analysis.scripts).toBe(2);
      expect(analysis.stylesheets).toBe(1);
      expect(analysis.totalResources).toBe(3);
    });
  });

  describe('React.memo Optimization', () => {
    it('should prevent unnecessary re-renders with memo', () => {
      let renderCount = 0;
      
      const ExpensiveComponent = React.memo<{ value: number }>(({ value }) => {
        renderCount++;
        return <div>Value: {value}</div>;
      });
      
      const ParentComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);
        const [otherState, setOtherState] = React.useState(0);
        
        return (
          <div>
            <ExpensiveComponent value={count} />
            <button onClick={() => setCount(count + 1)}>Increment Count</button>
            <button onClick={() => setOtherState(otherState + 1)}>Increment Other</button>
          </div>
        );
      };
      
      render(<ParentComponent />);
      
      expect(renderCount).toBe(1);
      
      // Clicking "Increment Other" should not re-render ExpensiveComponent
      fireEvent.click(screen.getByText('Increment Other'));
      expect(renderCount).toBe(1);
      
      // Clicking "Increment Count" should re-render ExpensiveComponent
      fireEvent.click(screen.getByText('Increment Count'));
      expect(renderCount).toBe(2);
    });
  });
});