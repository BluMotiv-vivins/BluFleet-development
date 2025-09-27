import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../../components/dashboard/Dashboard';
import { fleetSlice } from '../../store/slices/fleetSlice';
import { dashboardSlice } from '../../store/slices/dashboardSlice';
import { alertSlice } from '../../store/slices/alertSlice';
import { uiSlice } from '../../store/slices/uiSlice';
import { mockVehicles, mockChargingStations, mockDrivers } from '../mocks/mockData';

// Mock WebSocket
vi.mock('../../services/websocket', () => ({
  WebSocketService: {
    getInstance: () => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }),
  },
}));

// Mock Mapbox GL
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    setLayoutProperty: vi.fn(),
    getSource: vi.fn(),
  })),
  NavigationControl: vi.fn(),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  Popup: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  })),
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      fleet: fleetSlice.reducer,
      dashboard: dashboardSlice.reducer,
      alerts: alertSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: {
      fleet: {
        vehicles: mockVehicles,
        chargingStations: mockChargingStations,
        drivers: mockDrivers,
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
      dashboard: {
        kpis: {
          totalFleetStatus: { active: 2, charging: 1, maintenance: 0 },
          batteryHealth: { averageSOC: 75, overallHealth: 85 },
          costSavings: { monthly: 1200, fuel: 800, maintenance: 400 },
          sustainability: { co2Reduction: 2.5, milesReduction: 8500 },
        },
        filters: {},
        timeRange: '24h',
        refreshInterval: 30000,
        lastUpdated: new Date(),
      },
      alerts: {
        alerts: [
          {
            id: '1',
            type: 'battery',
            severity: 'high',
            title: 'Low Battery Alert',
            message: 'Vehicle EV-001 battery level is below 20%',
            vehicleId: 'EV-001',
            timestamp: new Date(),
            acknowledged: false,
          },
        ],
        loading: false,
        error: null,
      },
      ui: {
        sidebarCollapsed: false,
        connectionStatus: 'connected',
        isOffline: false,
        notifications: [],
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render dashboard with all components', async () => {
    renderWithProviders(<Dashboard />);

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
    });

    // Verify KPI cards are rendered
    expect(screen.getByText('Battery Health Overview')).toBeInTheDocument();
    expect(screen.getByText('Monthly Cost Savings')).toBeInTheDocument();
    expect(screen.getByText('Sustainability Impact')).toBeInTheDocument();

    // Verify other dashboard components
    expect(screen.getByTestId('fleet-map')).toBeInTheDocument();
    expect(screen.getByTestId('battery-panel')).toBeInTheDocument();
    expect(screen.getByTestId('vehicle-table')).toBeInTheDocument();
    expect(screen.getByTestId('alert-panel')).toBeInTheDocument();
  });

  test('should update KPIs when fleet data changes', async () => {
    const store = createTestStore();
    renderWithProviders(<Dashboard />, store);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
    });

    // Dispatch action to update fleet data
    store.dispatch(fleetSlice.actions.addVehicle({
      id: 'EV-004',
      name: 'New Vehicle',
      type: 'truck',
      status: 'active',
      location: { lat: 47.6062, lng: -122.3321 },
      battery: {
        currentLevel: 80,
        health: 90,
        lastCharged: new Date(),
        estimatedRange: 250,
      },
      alerts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Wait for KPIs to update
    await waitFor(() => {
      // The total active vehicles should increase
      expect(screen.getByText(/3/)).toBeInTheDocument(); // Updated count
    });
  });

  test('should handle real-time alerts', async () => {
    const store = createTestStore();
    renderWithProviders(<Dashboard />, store);

    await waitFor(() => {
      expect(screen.getByTestId('alert-panel')).toBeInTheDocument();
    });

    // Add a new alert
    store.dispatch(alertSlice.actions.addAlert({
      id: '2',
      type: 'maintenance',
      severity: 'medium',
      title: 'Maintenance Due',
      message: 'Vehicle EV-002 is due for maintenance',
      vehicleId: 'EV-002',
      timestamp: new Date(),
      acknowledged: false,
    }));

    // Verify alert appears
    await waitFor(() => {
      expect(screen.getByText('Maintenance Due')).toBeInTheDocument();
    });
  });

  test('should handle vehicle interactions', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-table')).toBeInTheDocument();
    });

    // Find and click on a vehicle action button
    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);

    // Verify vehicle modal opens
    await waitFor(() => {
      expect(screen.getByTestId('vehicle-modal')).toBeInTheDocument();
    });
  });

  test('should display loading states', async () => {
    const store = createTestStore({
      fleet: {
        vehicles: [],
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: true,
        error: null,
      },
    });

    renderWithProviders(<Dashboard />, store);

    // Verify loading indicators
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('should handle error states', async () => {
    const store = createTestStore({
      fleet: {
        vehicles: [],
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: 'Failed to load fleet data',
      },
    });

    renderWithProviders(<Dashboard />, store);

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load fleet data/)).toBeInTheDocument();
    });
  });

  test('should handle offline state', async () => {
    const store = createTestStore({
      ui: {
        sidebarCollapsed: false,
        connectionStatus: 'disconnected',
        isOffline: true,
        notifications: [],
      },
    });

    renderWithProviders(<Dashboard />, store);

    // Verify offline indicator
    await waitFor(() => {
      expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    });
  });

  test('should update data freshness indicators', async () => {
    const store = createTestStore();
    renderWithProviders(<Dashboard />, store);

    await waitFor(() => {
      expect(screen.getByTestId('data-freshness-indicator')).toBeInTheDocument();
    });

    // Update last updated time
    store.dispatch(dashboardSlice.actions.updateLastUpdated(new Date()));

    // Verify freshness indicator updates
    await waitFor(() => {
      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });
  });
});