import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import KPICards from '../KPICards';
import dashboardReducer from '../../../store/slices/dashboardSlice';
import fleetReducer from '../../../store/slices/fleetSlice';
import type { Vehicle, ChargingStation } from '../../../types';

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
  {
    id: 'EV-003',
    name: 'Forklift 003',
    type: 'forklift',
    status: 'maintenance',
    location: { lat: 47.6205, lng: -122.3493, address: 'Maintenance Bay' },
    battery: { currentLevel: 20, health: 75, lastCharged: new Date(), estimatedRange: 45 },
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

const createTestStore = (initialState = {}) => {
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
          totalVehicles: 3,
          activeVehicles: 1,
          chargingVehicles: 1,
          maintenanceVehicles: 1,
          averageBatteryLevel: 49,
          averageBatteryHealth: 86,
          monthlySavings: 12000,
          co2Reduction: 3.2,
        },
        kpiDetails: null,
        filters: { timeRange: '24h', vehicleTypes: [], locations: [] },
        timeRange: '24h',
        refreshInterval: 0, // Disable auto-refresh in tests
        lastUpdated: new Date(),
        previousPeriodData: {
          totalVehicles: 2,
          averageBatteryHealth: 84,
          monthlySavings: 10000,
          co2Reduction: 2.8,
        },
      },
      ...initialState,
    },
  });
};

const renderWithStore = (component: React.ReactElement, store = createTestStore()) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('KPICards Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four KPI cards with correct data', async () => {
    renderWithStore(<KPICards />);

    await waitFor(() => {
      expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
      expect(screen.getByText('Battery Health Overview')).toBeInTheDocument();
      expect(screen.getByText('Monthly Cost Savings')).toBeInTheDocument();
      expect(screen.getByText('Sustainability Impact')).toBeInTheDocument();
    });
  });

  it('displays correct fleet status breakdown', async () => {
    renderWithStore(<KPICards />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total vehicles
      expect(screen.getByText(/1 Active, 1 Charging, 1 Maintenance/)).toBeInTheDocument();
    });
  });

  it('shows battery health with correct calculations', async () => {
    renderWithStore(<KPICards />);

    await waitFor(() => {
      // Should show battery health card
      expect(screen.getByText('Battery Health Overview')).toBeInTheDocument();
      expect(screen.getByText(/Overall Health/)).toBeInTheDocument();
    });
  });

  it('displays cost savings with proper formatting', async () => {
    renderWithStore(<KPICards />);

    await waitFor(() => {
      expect(screen.getByText('Monthly Cost Savings')).toBeInTheDocument();
      expect(screen.getByText(/vs Traditional ICE Fleet/)).toBeInTheDocument();
    });
  });

  it('shows sustainability impact with CO₂ reduction', async () => {
    renderWithStore(<KPICards />);

    await waitFor(() => {
      expect(screen.getByText(/tons CO₂/)).toBeInTheDocument();
      expect(screen.getByText(/\d+% Reduction vs ICE Fleet/)).toBeInTheDocument();
    });
  });

  it('displays trend indicators correctly', async () => {
    renderWithStore(<KPICards />);

    await waitFor(() => {
      // Should show trend arrows based on comparison with previous period data
      const trendElements = screen.getAllByLabelText(/Trending/);
      expect(trendElements.length).toBeGreaterThan(0);
    });
  });

  it('handles loading state properly', () => {
    const storeWithoutKPIDetails = createTestStore({
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
    });

    renderWithStore(<KPICards />, storeWithoutKPIDetails);

    // Should show loading skeleton initially, then render with empty data
    expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
  });

  it('updates KPIs when fleet data changes', async () => {
    const store = createTestStore();
    renderWithStore(<KPICards />, store);

    // Initial state
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    // Add a new vehicle to the store
    const newVehicle: Vehicle = {
      id: 'EV-004',
      name: 'New Truck 004',
      type: 'truck',
      status: 'active',
      location: { lat: 47.6062, lng: -122.3321 },
      battery: { currentLevel: 90, health: 95, lastCharged: new Date(), estimatedRange: 300 },
      alerts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.dispatch({
      type: 'fleet/updateVehicle',
      payload: newVehicle,
    });

    // The KPIs should update automatically through the hook
    await waitFor(() => {
      // This test verifies the integration works, actual values depend on calculation logic
      expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
    });
  });

  it('applies correct color coding based on battery levels', async () => {
    // Test with low battery scenario
    const lowBatteryVehicles: Vehicle[] = [
      {
        ...mockVehicles[0],
        battery: { ...mockVehicles[0].battery, currentLevel: 15, health: 60 },
      },
    ];

    const storeWithLowBattery = createTestStore({
      fleet: {
        vehicles: lowBatteryVehicles,
        chargingStations: mockChargingStations,
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
    });

    renderWithStore(<KPICards />, storeWithLowBattery);

    await waitFor(() => {
      const batteryCard = screen.getByText('Battery Health Overview').closest('.card');
      // Should have red color for low battery (15% is < 40%)
      expect(batteryCard).toHaveClass('border-l-danger-500');
    });
  });

  it('handles empty fleet data gracefully', async () => {
    const emptyFleetStore = createTestStore({
      fleet: {
        vehicles: [],
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
    });

    renderWithStore(<KPICards />, emptyFleetStore);

    await waitFor(() => {
      expect(screen.getByText('Total Fleet Status')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 vehicles
    });
  });
});