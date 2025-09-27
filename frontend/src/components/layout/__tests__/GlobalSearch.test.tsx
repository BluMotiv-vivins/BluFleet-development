import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import GlobalSearch from '../GlobalSearch';
import fleetSlice from '../../../store/slices/fleetSlice';
import type { Vehicle, Driver, ChargingStation } from '../../../types';

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
];

const mockDrivers: Driver[] = [
  {
    id: 'D-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@fleetvolt.com',
    safetyScore: 95,
    ecoScore: 92,
    totalMiles: 15420,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'active',
  },
];

const mockChargingStations: ChargingStation[] = [
  {
    id: 'CS-001',
    name: 'Main Depot Charger',
    location: { lat: 47.6205, lng: -122.3493, address: '123 Fleet St, Seattle, WA' },
    status: 'available',
    powerOutput: 150,
    connectorTypes: ['CCS'],
    queue: [],
    pricing: { rate: 20, currency: 'INR' },
  },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      fleet: fleetSlice,
    },
    preloadedState: {
      fleet: {
        vehicles: mockVehicles,
        drivers: mockDrivers,
        chargingStations: mockChargingStations,
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
    },
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('GlobalSearch', () => {
  it('renders search input with placeholder', () => {
    renderWithProvider(<GlobalSearch />);
    
    expect(screen.getByPlaceholderText('Search vehicles, drivers, locations...')).toBeInTheDocument();
  });

  it('shows search results when typing', async () => {
    const mockOnResultClick = vi.fn();
    renderWithProvider(<GlobalSearch onResultClick={mockOnResultClick} />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'Fleet' } });
    
    await waitFor(() => {
      expect(screen.getByText('Fleet Truck 001')).toBeInTheDocument();
    });
  });

  it('categorizes search results correctly', async () => {
    renderWithProvider(<GlobalSearch />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'a' } }); // Search for 'a' to get multiple results
    
    await waitFor(() => {
      expect(screen.getByText('Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Drivers')).toBeInTheDocument();
      expect(screen.getByText('Locations')).toBeInTheDocument();
    });
  });

  it('handles result click', async () => {
    const mockOnResultClick = vi.fn();
    renderWithProvider(<GlobalSearch onResultClick={mockOnResultClick} />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'Fleet' } });
    
    await waitFor(() => {
      const result = screen.getByText('Fleet Truck 001');
      fireEvent.click(result);
    });
    
    expect(mockOnResultClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'EV-001',
        type: 'vehicle',
        title: 'Fleet Truck 001',
      })
    );
  });

  it('shows no results message when no matches found', async () => {
    renderWithProvider(<GlobalSearch />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    renderWithProvider(<GlobalSearch />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'Fleet' } });
    
    await waitFor(() => {
      expect(screen.getByText('Fleet Truck 001')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Fleet Truck 001')).not.toBeInTheDocument();
    });
  });

  it('displays status indicators for results', async () => {
    renderWithProvider(<GlobalSearch />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'Fleet' } });
    
    await waitFor(() => {
      expect(screen.getAllByText('active')).toHaveLength(2); // Vehicle and driver both have active status
    });
  });

  it('searches across multiple fields', async () => {
    renderWithProvider(<GlobalSearch />);
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    
    // Search by vehicle ID
    fireEvent.change(searchInput, { target: { value: 'EV-001' } });
    await waitFor(() => {
      expect(screen.getByText('Fleet Truck 001')).toBeInTheDocument();
    });
    
    // Search by driver email
    fireEvent.change(searchInput, { target: { value: 'sarah.johnson' } });
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
    
    // Search by location address
    fireEvent.change(searchInput, { target: { value: 'Seattle' } });
    await waitFor(() => {
      expect(screen.getByText('Fleet Truck 001')).toBeInTheDocument();
    });
  });

  it('limits results to 10 items', async () => {
    // Create a store with many vehicles
    const manyVehicles = Array.from({ length: 15 }, (_, i) => ({
      ...mockVehicles[0],
      id: `EV-${String(i + 1).padStart(3, '0')}`,
      name: `Fleet Vehicle ${i + 1}`,
    }));
    
    const store = configureStore({
      reducer: { fleet: fleetSlice },
      preloadedState: {
        fleet: {
          vehicles: manyVehicles,
          drivers: [],
          chargingStations: [],
          routes: [],
          geofences: [],
          loading: false,
          error: null,
        },
      },
    });
    
    render(
      <Provider store={store}>
        <GlobalSearch />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText('Search vehicles, drivers, locations...');
    fireEvent.change(searchInput, { target: { value: 'Fleet' } });
    
    await waitFor(() => {
      const results = screen.getAllByText(/Fleet Vehicle/);
      expect(results).toHaveLength(10);
    });
  });
});