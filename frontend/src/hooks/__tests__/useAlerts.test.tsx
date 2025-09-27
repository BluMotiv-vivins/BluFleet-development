import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { useAlerts } from '../useAlerts';
import alertSlice from '../../store/slices/alertSlice';
import fleetSlice from '../../store/slices/fleetSlice';
import type { Alert, Vehicle, Driver } from '../../types';

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Fleet Vehicle 001',
    type: 'van',
    status: 'active',
    location: { lat: 40.7128, lng: -74.0060 },
    battery: {
      currentLevel: 12,
      health: 85,
      lastCharged: new Date(),
      estimatedRange: 45,
    },
    alerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockDriver: Driver = {
  id: 'D-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  safetyScore: 85,
  ecoScore: 92,
  totalMiles: 15000,
  recentAlerts: [],
  certifications: [],
  status: 'active',
};

const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    type: 'battery',
    severity: 'critical',
    title: 'Critical Battery',
    message: 'Critical battery level',
    vehicleId: 'EV-001',
    timestamp: new Date(),
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'safety',
    severity: 'medium',
    title: 'Safety Event',
    message: 'Safety event occurred',
    vehicleId: 'EV-001',
    driverId: 'D-001',
    timestamp: new Date(),
    acknowledged: true,
  },
];

const createMockStore = (alerts: Alert[] = mockAlerts, vehicles: Vehicle[] = mockVehicles) => {
  return configureStore({
    reducer: {
      alerts: alertSlice,
      fleet: fleetSlice,
    },
    preloadedState: {
      alerts: {
        alerts,
        unreadCount: alerts.filter(alert => !alert.acknowledged).length,
        loading: false,
        lastAutoGeneration: null,
        autoGenerationEnabled: true,
      },
      fleet: {
        vehicles,
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

const wrapper = ({ children, store = createMockStore() }: { children: React.ReactNode; store?: any }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('State Access', () => {
    it('provides access to alert state', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      expect(result.current.alerts).toHaveLength(2);
      expect(result.current.unreadCount).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.autoGenerationEnabled).toBe(true);
    });

    it('updates when state changes', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        store.dispatch({
          type: 'alerts/acknowledgeAlert',
          payload: 'A-001',
        });
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Alert Creation', () => {
    it('creates geofence violation alerts', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        const alert = result.current.createGeofenceViolationAlert(
          mockVehicles[0],
          'Restricted Zone',
          'exited',
          { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
        );

        expect(alert.type).toBe('geofence');
        expect(alert.severity).toBe('high');
        expect(alert.message).toContain('exited');
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(3);
    });

    it('creates safety alerts', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        const alert = result.current.createSafetyAlert(
          mockVehicles[0],
          mockDriver,
          'harsh_braking'
        );

        expect(alert.type).toBe('safety');
        expect(alert.severity).toBe('medium');
        expect(alert.message).toContain('harsh braking');
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(3);
    });

    it('creates system update alerts', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        const alert = result.current.createSystemUpdateAlert(
          'feature',
          '2.1.0',
          'New features available'
        );

        expect(alert.type).toBe('system');
        expect(alert.severity).toBe('low');
        expect(alert.message).toContain('Version 2.1.0');
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(3);
    });

    it('creates custom alerts', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        const alert = result.current.createCustomAlert({
          type: 'maintenance',
          severity: 'high',
          title: 'Custom Alert',
          message: 'Custom alert message',
          acknowledged: false,
        });

        expect(alert.id).toBeDefined();
        expect(alert.timestamp).toBeDefined();
        expect(alert.type).toBe('maintenance');
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(3);
    });

    it('adds multiple alerts at once', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      const newAlerts: Alert[] = [
        {
          id: 'A-003',
          type: 'maintenance',
          severity: 'low',
          title: 'Maintenance Alert',
          message: 'Maintenance needed',
          timestamp: new Date(),
          acknowledged: false,
        },
        {
          id: 'A-004',
          type: 'system',
          severity: 'low',
          title: 'System Alert',
          message: 'System notification',
          timestamp: new Date(),
          acknowledged: false,
        },
      ];

      act(() => {
        result.current.addMultipleAlerts(newAlerts);
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(4);
    });
  });

  describe('Alert Management', () => {
    it('acknowledges alerts', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        result.current.acknowledgeAlert('A-001');
      });

      const state = store.getState();
      const alert = state.alerts.alerts.find(a => a.id === 'A-001');
      expect(alert?.acknowledged).toBe(true);
    });

    it('resolves alerts', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        result.current.resolveAlert('A-001');
      });

      const state = store.getState();
      const alert = state.alerts.alerts.find(a => a.id === 'A-001');
      expect(alert?.resolvedAt).toBeDefined();
      expect(alert?.acknowledged).toBe(true);
    });
  });

  describe('Alert Filtering and Querying', () => {
    it('filters alerts by criteria', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const filteredAlerts = result.current.getFilteredAlerts({
        severity: ['critical'],
        type: ['battery'],
      });

      expect(filteredAlerts).toHaveLength(1);
      expect(filteredAlerts[0].id).toBe('A-001');
    });

    it('filters alerts by acknowledgment status', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const unacknowledged = result.current.getFilteredAlerts({
        acknowledged: false,
      });

      expect(unacknowledged).toHaveLength(1);
      expect(unacknowledged[0].acknowledged).toBe(false);
    });

    it('filters alerts by vehicle ID', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const vehicleAlerts = result.current.getVehicleAlerts('EV-001');

      expect(vehicleAlerts).toHaveLength(2);
      expect(vehicleAlerts.every(alert => alert.vehicleId === 'EV-001')).toBe(true);
    });

    it('filters alerts by driver ID', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const driverAlerts = result.current.getDriverAlerts('D-001');

      expect(driverAlerts).toHaveLength(1);
      expect(driverAlerts[0].driverId).toBe('D-001');
    });

    it('gets prioritized alerts', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const prioritized = result.current.getPrioritizedAlerts();

      expect(prioritized[0].severity).toBe('critical');
      expect(prioritized[1].severity).toBe('medium');
    });

    it('limits prioritized alerts', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const limited = result.current.getPrioritizedAlerts(1);

      expect(limited).toHaveLength(1);
      expect(limited[0].severity).toBe('critical');
    });

    it('gets recent alerts', () => {
      const recentAlert: Alert = {
        id: 'A-RECENT',
        type: 'system',
        severity: 'low',
        title: 'Recent Alert',
        message: 'Recent alert message',
        timestamp: new Date(), // Current time
        acknowledged: false,
      };

      const oldAlert: Alert = {
        id: 'A-OLD',
        type: 'system',
        severity: 'low',
        title: 'Old Alert',
        message: 'Old alert message',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        acknowledged: false,
      };

      const store = createMockStore([recentAlert, oldAlert]);
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      const recent = result.current.getRecentAlerts(24);

      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('A-RECENT');
    });

    it('gets unacknowledged alerts count', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const count = result.current.getUnacknowledgedAlertsCount();

      expect(count).toBe(1);
    });

    it('gets alert statistics', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper });

      const stats = result.current.getAlertStats();

      expect(stats.total).toBe(2);
      expect(stats.unresolved).toBe(2);
      expect(stats.unacknowledged).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.byType.battery).toBe(1);
      expect(stats.byType.safety).toBe(1);
    });
  });

  describe('Automated Alert Generation', () => {
    it('generates automated alerts manually', () => {
      const store = createMockStore([], mockVehicles);
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        result.current.generateAutomatedAlerts();
      });

      const state = store.getState();
      expect(state.alerts.alerts.length).toBeGreaterThan(0);
    });

    it('sets up automatic alert generation interval', () => {
      const store = createMockStore([], mockVehicles);
      renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      // Fast-forward 5 minutes
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      const state = store.getState();
      expect(state.alerts.alerts.length).toBeGreaterThan(0);
    });

    it('does not generate alerts when auto-generation is disabled', () => {
      const store = createMockStore([], mockVehicles);
      // Disable auto-generation
      store.dispatch({ type: 'alerts/toggleAutoGeneration', payload: false });

      renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      // Fast-forward 5 minutes
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(0);
    });

    it('cleans up interval on unmount', () => {
      const store = createMockStore([], mockVehicles);
      const { unmount } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles empty vehicle list gracefully', () => {
      const store = createMockStore([], []);
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        result.current.generateAutomatedAlerts();
      });

      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(0);
    });

    it('handles invalid alert IDs gracefully', () => {
      const store = createMockStore();
      const { result } = renderHook(() => useAlerts(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      act(() => {
        result.current.acknowledgeAlert('INVALID-ID');
        result.current.resolveAlert('INVALID-ID');
      });

      // Should not throw errors
      const state = store.getState();
      expect(state.alerts.alerts).toHaveLength(2);
    });
  });
});