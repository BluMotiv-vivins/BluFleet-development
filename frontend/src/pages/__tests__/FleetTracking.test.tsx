import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import FleetTracking from '../FleetTracking';
import fleetReducer from '../../store/slices/fleetSlice';
import dashboardReducer from '../../store/slices/dashboardSlice';
import alertReducer from '../../store/slices/alertSlice';
import uiReducer from '../../store/slices/uiSlice';

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => ({
  default: {
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
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      getElement: vi.fn(() => document.createElement('div')),
    })),
    Popup: vi.fn(() => ({
      setHTML: vi.fn().mockReturnThis(),
    })),
    NavigationControl: vi.fn(),
    FullscreenControl: vi.fn(),
    ScaleControl: vi.fn(),
    accessToken: '',
  },
}));

// Mock CSS import
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      fleet: fleetReducer,
      dashboard: dashboardReducer,
      alerts: alertReducer,
      ui: uiReducer,
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('FleetTracking Page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<FleetTracking />);
    
    expect(screen.getByText('Fleet Tracking')).toBeInTheDocument();
  });

  it('displays fleet statistics in header', () => {
    renderWithProviders(<FleetTracking />);
    
    expect(screen.getByText(/Vehicles:/)).toBeInTheDocument();
    expect(screen.getByText(/Stations:/)).toBeInTheDocument();
    expect(screen.getByText(/Active Routes:/)).toBeInTheDocument();
  });

  it('renders map container', () => {
    renderWithProviders(<FleetTracking />);
    
    // Check for map controls
    expect(screen.getByText('Map Layers')).toBeInTheDocument();
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });

  it('displays layer controls', () => {
    renderWithProviders(<FleetTracking />);
    
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Charging Stations')).toBeInTheDocument();
    expect(screen.getByText('Geofences')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
  });

  it('shows legend with status indicators', () => {
    renderWithProviders(<FleetTracking />);
    
    expect(screen.getByText('Active/Available')).toBeInTheDocument();
    expect(screen.getByText('Charging/Occupied')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});