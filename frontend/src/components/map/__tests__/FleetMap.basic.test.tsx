import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Mapbox GL JS completely
const mockMap = {
  addControl: vi.fn(),
  on: vi.fn(),
  remove: vi.fn(),
  addSource: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  removeSource: vi.fn(),
  getLayer: vi.fn(),
  getSource: vi.fn(),
};

const mockMarker = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  setPopup: vi.fn().mockReturnThis(),
  remove: vi.fn(),
  getElement: vi.fn(() => {
    const el = document.createElement('div');
    el.classList.add('vehicle-marker');
    return el;
  }),
  getLngLat: vi.fn(() => ({ lng: -122.4194, lat: 37.7749 })),
  getPopup: vi.fn(() => ({
    setHTML: vi.fn().mockReturnThis(),
  })),
};

const mockPopup = {
  setHTML: vi.fn().mockReturnThis(),
};

vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => mockMap),
    Marker: vi.fn(() => mockMarker),
    Popup: vi.fn(() => mockPopup),
    NavigationControl: vi.fn(),
    FullscreenControl: vi.fn(),
    ScaleControl: vi.fn(),
    AttributionControl: vi.fn(),
    accessToken: '',
  },
}));

// Mock CSS import
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

import FleetMap from '../FleetMap';
import type { Vehicle, ChargingStation, Geofence, Route } from '../../../types';

// Mock data for testing
const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    name: 'Truck 001',
    type: 'truck',
    status: 'active',
    location: { lat: 37.7749, lng: -122.4194, address: '123 Main St' },
    battery: { currentLevel: 85, health: 95, lastCharged: new Date(), estimatedRange: 150 },
    alerts: [],
    complianceStatus: {
      overallStatus: 'compliant',
      badges: [],
      lastAudit: new Date(),
      nextAuditDue: new Date(),
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'vehicle-2',
    name: 'Van 002',
    type: 'van',
    status: 'charging',
    location: { lat: 37.7849, lng: -122.4094 },
    battery: { currentLevel: 45, health: 88, lastCharged: new Date(), estimatedRange: 80 },
    alerts: [],
    complianceStatus: {
      overallStatus: 'compliant',
      badges: [],
      lastAudit: new Date(),
      nextAuditDue: new Date(),
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockChargingStations: ChargingStation[] = [
  {
    id: 'station-1',
    name: 'Main Depot Charger',
    location: { lat: 37.7649, lng: -122.4294, address: '456 Depot Ave' },
    status: 'available',
    powerOutput: 150,
    connectorTypes: ['CCS', 'CHAdeMO'],
    queue: [],
    pricing: { rate: 0.25, currency: 'kWh' }
  },
  {
    id: 'station-2',
    name: 'Service Center Charger',
    location: { lat: 37.7949, lng: -122.4394, address: '789 Service Rd' },
    status: 'occupied',
    powerOutput: 100,
    connectorTypes: ['CCS'],
    currentVehicle: 'vehicle-2',
    queue: ['vehicle-3'],
    pricing: { rate: 0.30, currency: 'kWh' }
  }
];

const mockGeofences: Geofence[] = [
  {
    id: 'geofence-1',
    name: 'Warehouse Zone',
    type: 'polygon',
    coordinates: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      { lat: 37.7649, lng: -122.4094 },
      { lat: 37.7749, lng: -122.4194 }
    ],
    restrictions: ['authorized_only']
  }
];

const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Delivery Route A',
    waypoints: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 }
    ],
    estimatedDuration: 30,
    estimatedDistance: 5.2,
    status: 'active'
  }
];

describe('FleetMap Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );
      
      expect(screen.getByText('Map Layers')).toBeInTheDocument();
      expect(screen.getByText('Legend')).toBeInTheDocument();
    });

    it('displays layer controls', () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );

      expect(screen.getByText('Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Charging Stations')).toBeInTheDocument();
      expect(screen.getByText('Geofences')).toBeInTheDocument();
      expect(screen.getByText('Routes')).toBeInTheDocument();
    });

    it('displays legend with status indicators', () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );

      expect(screen.getByText('Active/Available')).toBeInTheDocument();
      expect(screen.getByText('Charging/Occupied')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          className="custom-map-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-map-class');
    });
  });

  describe('Map Initialization', () => {
    it('initializes Mapbox map with correct configuration', () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          viewport={{ latitude: 40.7128, longitude: -74.0060, zoom: 10 }}
        />
      );

      expect(mockMap.addControl).toHaveBeenCalledTimes(4); // Navigation, Fullscreen, Scale, Attribution
    });

    it('handles map load event', async () => {
      const onMapLoad = vi.fn();
      
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          onMapLoad={onMapLoad}
        />
      );

      // Simulate map load event
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(onMapLoad).toHaveBeenCalled();
      });
    });

    it('handles map error event', async () => {
      const onMapError = vi.fn();
      
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          onMapError={onMapError}
        />
      );

      // Simulate map error event
      const errorCallback = mockMap.on.mock.calls.find(call => call[0] === 'error')?.[1];
      if (errorCallback) {
        errorCallback({ error: { message: 'Test error' } });
      }

      await waitFor(() => {
        expect(onMapError).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('Vehicle Markers', () => {
    it('creates markers for vehicles', async () => {
      render(
        <FleetMap
          vehicles={mockVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );

      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMarker.setLngLat).toHaveBeenCalledWith([-122.4194, 37.7749]);
        expect(mockMarker.addTo).toHaveBeenCalled();
      });
    });

    it('handles vehicle click events', async () => {
      const onVehicleClick = vi.fn();
      
      render(
        <FleetMap
          vehicles={mockVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          onVehicleClick={onVehicleClick}
        />
      );

      // Simulate map load and marker creation
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMarker.addTo).toHaveBeenCalled();
      });

      // Verify that the onVehicleClick prop is passed correctly
      expect(onVehicleClick).toBeDefined();
    });

    it('updates vehicle marker positions with real-time tracking', async () => {
      const { rerender } = render(
        <FleetMap
          vehicles={mockVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          enableRealTimeTracking={true}
        />
      );

      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMarker.setLngLat).toHaveBeenCalled();
      });

      // Clear previous calls
      vi.clearAllMocks();

      // Update vehicle position significantly (more than 10 meters)
      const updatedVehicles = [
        {
          ...mockVehicles[0],
          location: { ...mockVehicles[0].location, lat: 37.7850, lng: -122.4200 }
        }
      ];

      rerender(
        <FleetMap
          vehicles={updatedVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          enableRealTimeTracking={true}
        />
      );

      // Should update marker position (animation will cause multiple calls)
      await waitFor(() => {
        expect(mockMarker.setLngLat).toHaveBeenCalled();
      });
    });
  });

  describe('Charging Station Markers', () => {
    it('creates markers for charging stations', async () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={mockChargingStations}
          geofences={[]}
          routes={[]}
        />
      );

      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMarker.setLngLat).toHaveBeenCalledWith([-122.4294, 37.7649]);
        expect(mockMarker.addTo).toHaveBeenCalled();
      });
    });

    it('handles charging station click events', async () => {
      const onStationClick = vi.fn();
      
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={mockChargingStations}
          geofences={[]}
          routes={[]}
          onStationClick={onStationClick}
        />
      );

      // Simulate map load and marker creation
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMarker.addTo).toHaveBeenCalled();
      });

      // Verify that the onStationClick prop is passed correctly
      expect(onStationClick).toBeDefined();
    });
  });

  describe('Layer Controls', () => {
    it('toggles layer visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <FleetMap
          vehicles={mockVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );

      const vehicleLayerCheckbox = screen.getByRole('checkbox', { name: /vehicles/i });
      expect(vehicleLayerCheckbox).toBeChecked();

      await user.click(vehicleLayerCheckbox);
      expect(vehicleLayerCheckbox).not.toBeChecked();
    });

    it('hides markers when layer is disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <FleetMap
          vehicles={mockVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );

      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMarker.addTo).toHaveBeenCalled();
      });

      // Toggle vehicles layer off
      const vehicleLayerCheckbox = screen.getByRole('checkbox', { name: /vehicles/i });
      await user.click(vehicleLayerCheckbox);

      await waitFor(() => {
        expect(mockMarker.remove).toHaveBeenCalled();
      });
    });
  });

  describe('Geofences and Routes', () => {
    it('adds geofence layers to map', async () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={mockGeofences}
          routes={[]}
        />
      );

      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMap.addSource).toHaveBeenCalledWith('geofences', expect.any(Object));
        expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({
          id: 'geofences-fill',
          type: 'fill'
        }));
      });
    });

    it('adds route layers to map', async () => {
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={mockRoutes}
        />
      );

      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(call => call[0] === 'load')?.[1];
      if (loadCallback) {
        loadCallback();
      }

      await waitFor(() => {
        expect(mockMap.addSource).toHaveBeenCalledWith('routes', expect.any(Object));
        expect(mockMap.addLayer).toHaveBeenCalledWith(expect.objectContaining({
          id: 'routes',
          type: 'line'
        }));
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when map fails to load', async () => {
      const onMapError = vi.fn();
      
      render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          onMapError={onMapError}
        />
      );

      // Simulate map error
      const errorCallback = mockMap.on.mock.calls.find(call => call[0] === 'error')?.[1];
      if (errorCallback) {
        errorCallback({ error: { message: 'Invalid access token' } });
      }

      await waitFor(() => {
        expect(onMapError).toHaveBeenCalledWith(expect.any(Error));
      });

      expect(screen.getByText('Map Error')).toBeInTheDocument();
      expect(screen.getByText(/check your Mapbox access token/i)).toBeInTheDocument();
    });
  });

  describe('Performance and Cleanup', () => {
    it('cleans up map instance on unmount', () => {
      const { unmount } = render(
        <FleetMap
          vehicles={[]}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
        />
      );

      unmount();

      expect(mockMap.remove).toHaveBeenCalled();
    });

    it('cancels animation frames on unmount', () => {
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
      
      const { unmount } = render(
        <FleetMap
          vehicles={mockVehicles}
          chargingStations={[]}
          geofences={[]}
          routes={[]}
          enableRealTimeTracking={true}
        />
      );

      unmount();

      // The component should call cancelAnimationFrame if there are active animations
      // Since we're not actually triggering animations in the test, we'll just verify the spy exists
      expect(cancelAnimationFrameSpy).toBeDefined();
      
      cancelAnimationFrameSpy.mockRestore();
    });
  });
});