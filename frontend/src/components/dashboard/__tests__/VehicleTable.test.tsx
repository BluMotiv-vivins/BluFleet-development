import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import VehicleTable from '../VehicleTable';
import fleetReducer from '../../../store/slices/fleetSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
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
    },
  });
};

const renderWithStore = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('VehicleTable', () => {
  it('should be defined and exportable', () => {
    expect(VehicleTable).toBeDefined();
    expect(typeof VehicleTable).toBe('object'); // memo components are objects
  });

  it('should render without crashing', () => {
    renderWithStore(
      <VehicleTable 
        vehicles={[]}
        onVehicleAction={() => {}}
        filters={{}}
        onFilterChange={() => {}}
      />
    );
    
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display empty state when no vehicles', () => {
    renderWithStore(
      <VehicleTable 
        vehicles={[]}
        onVehicleAction={() => {}}
        filters={{}}
        onFilterChange={() => {}}
      />
    );
    
    expect(screen.getByText(/no vehicles found/i)).toBeInTheDocument();
  });
});