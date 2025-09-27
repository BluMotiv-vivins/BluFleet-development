import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRealTimeSync, useRealTimeVehicleMonitoring, useRealTimeAlerts } from '../useRealTimeSync';
import { webSocketService } from '../../services/websocket';
import uiSlice from '../../store/slices/uiSlice';
import fleetSlice from '../../store/slices/fleetSlice';
import alertSlice from '../../store/slices/alertSlice';
import dashboardSlice from '../../store/slices/dashboardSlice';
import type { Vehicle, Alert } from '../../types';

// Mock the WebSocket service
vi.mock('../../services/websocket', () => ({
  webSocketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    getConnectionState: vi.fn(() => 'disconnected'),
    setConflictResolutionStrategy: vi.fn(),
    getLastSyncTimestamp: vi.fn(() => null),
    addPendingUpdate: vi.fn(),
  },
}));

// Mock useWebSocket hook
vi.mock('../useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({
    connectionState: 'connected',
    isConnected: true,
    isOffline: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    lastSyncTimestamp: null,
    addPendingUpdate: vi.fn(),
    setConflictResolution: vi.fn(),
  })),
}));

const mockVehicle: Vehicle = {
  id: 'EV-001',
  name: 'Test Vehicle',
  type: 'truck',
  status: 'active',
  location: {
    lat: 47.6062,
    lng: -122.3321,
    address: 'Seattle, WA',
  },
  battery: {
    currentLevel: 80,
    health: 95,
    lastCharged: new Date(),
    estimatedRange: 200,
  },
  alerts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAlert: Alert = {
  id: 'alert-001',
  type: 'battery',
  severity: 'medium',
  title: 'Low Battery',
  message: 'Vehicle EV-001 has low battery',
  vehicleId: 'EV-001',
  timestamp: new Date(),
  acknowledged: false,
};

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice,
      fleet: fleetSlice,
      alerts: alertSlice,
      dashboard: dashboardSlice,
    },
    preloadedState: {
      ui: {
        connectionStatus: 'connected',
        isOffline: false,
        sidebarCollapsed: false,
        activeRoute: '/',
        theme: 'light',
        notifications: null,
        modals: {
          vehicleDetail: { open: false, vehicleId: null },
          driverDetail: { open: false, driverId: null },
        },
      },
      fleet: {
        vehicles: [mockVehicle],
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
      alerts: {
        alerts: [mockAlert],
        unreadCount: 1,
        loading: false,
        lastAutoGeneration: null,
        autoGenerationEnabled: true,
      },
      dashboard: {
        kpis: {
          totalVehicles: 1,
          activeVehicles: 1,
          chargingVehicles: 0,
          maintenanceVehicles: 0,
          averageBatteryLevel: 80,
          averageBatteryHealth: 95,
          monthlySavings: 1500,
          co2Reduction: 2.5,
        },
        timeRange: '24h',
        refreshInterval: 30000,
        filters: {
          status: 'all',
          location: 'all',
          batteryLevel: 'all',
        },
      },
      ...initialState,
    },
  });
};

const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useRealTimeSync Hook', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isRealTimeActive).toBe(true);
      expect(result.current.lastSyncTime).toBe(null);
      expect(result.current.pendingUpdatesCount).toBe(0);
      expect(typeof result.current.forceSync).toBe('function');
      expect(typeof result.current.enableAutoAlerts).toBe('function');
      expect(typeof result.current.disableAutoAlerts).toBe('function');
    });

    it('should handle offline state correctly', () => {
      const offlineStore = createTestStore({
        ui: {
          connectionStatus: 'disconnected',
          isOffline: true,
          sidebarCollapsed: false,
          activeRoute: '/',
          theme: 'light',
          notifications: null,
          modals: {
            vehicleDetail: { open: false, vehicleId: null },
            driverDetail: { open: false, driverId: null },
          },
        },
      });

      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(offlineStore),
      });

      expect(result.current.isRealTimeActive).toBe(false);
    });
  });

  describe('Auto Alert Generation', () => {
    it('should enable auto alerts by default', () => {
      renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      // Fast-forward time to trigger alert generation
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should have called the alert generation action
      const state = store.getState();
      expect(state.alerts.autoGenerationEnabled).toBe(true);
    });

    it('should allow disabling auto alerts', () => {
      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.disableAutoAlerts();
      });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Auto alerts should be disabled
      expect(result.current.isRealTimeActive).toBe(true);
    });

    it('should allow re-enabling auto alerts', () => {
      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.disableAutoAlerts();
      });

      act(() => {
        result.current.enableAutoAlerts();
      });

      // Auto alerts should be re-enabled
      expect(result.current.isRealTimeActive).toBe(true);
    });
  });

  describe('Conflict Resolution', () => {
    it('should set conflict resolution strategy', async () => {
      const mockSetConflictResolution = vi.fn();
      
      // Mock the useWebSocket hook to return our mock function
      const { useWebSocket } = await import('../useWebSocket');
      (useWebSocket as Mock).mockReturnValue({
        connectionState: 'connected',
        isConnected: true,
        isOffline: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: vi.fn(),
        lastSyncTimestamp: null,
        addPendingUpdate: vi.fn(),
        setConflictResolution: mockSetConflictResolution,
      });

      renderHook(() => useRealTimeSync({ conflictResolution: 'merge' }), {
        wrapper: createWrapper(store),
      });

      expect(mockSetConflictResolution).toHaveBeenCalledWith('merge');
    });
  });

  describe('Force Sync', () => {
    it('should trigger force sync when connected', async () => {
      const mockSend = vi.fn();
      
      const { useWebSocket } = await import('../useWebSocket');
      (useWebSocket as Mock).mockReturnValue({
        connectionState: 'connected',
        isConnected: true,
        isOffline: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: mockSend,
        lastSyncTimestamp: null,
        addPendingUpdate: vi.fn(),
        setConflictResolution: vi.fn(),
      });

      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.forceSync();
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sync_request',
          data: expect.objectContaining({
            clientId: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Update Handlers', () => {
    it('should handle vehicle updates when connected', async () => {
      const mockSend = vi.fn();
      
      const { useWebSocket } = await import('../useWebSocket');
      (useWebSocket as Mock).mockReturnValue({
        connectionState: 'connected',
        isConnected: true,
        isOffline: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: mockSend,
        lastSyncTimestamp: null,
        addPendingUpdate: vi.fn(),
        setConflictResolution: vi.fn(),
      });

      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      const updateData = { status: 'charging', batteryLevel: 75 };

      act(() => {
        result.current.handleVehicleUpdate('EV-001', updateData);
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vehicle_update',
          data: updateData,
        })
      );
    });

    it('should queue vehicle updates when disconnected', async () => {
      const mockAddPendingUpdate = vi.fn();
      
      // Create a store with offline state
      const offlineStore = createTestStore({
        ui: {
          connectionStatus: 'disconnected',
          isOffline: true,
          sidebarCollapsed: false,
          activeRoute: '/',
          theme: 'light',
          notifications: null,
          modals: {
            vehicleDetail: { open: false, vehicleId: null },
            driverDetail: { open: false, driverId: null },
          },
        },
      });
      
      const { useWebSocket } = await import('../useWebSocket');
      (useWebSocket as Mock).mockReturnValue({
        connectionState: 'disconnected',
        isConnected: false,
        isOffline: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: vi.fn(),
        lastSyncTimestamp: null,
        addPendingUpdate: mockAddPendingUpdate,
        setConflictResolution: vi.fn(),
      });

      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(offlineStore),
      });

      const updateData = { status: 'charging', batteryLevel: 75 };

      act(() => {
        result.current.handleVehicleUpdate('EV-001', updateData);
      });

      expect(mockAddPendingUpdate).toHaveBeenCalledWith('vehicle_EV-001', updateData);
    });

    it('should handle battery updates', async () => {
      const mockSend = vi.fn();
      
      const { useWebSocket } = await import('../useWebSocket');
      (useWebSocket as Mock).mockReturnValue({
        connectionState: 'connected',
        isConnected: true,
        isOffline: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: mockSend,
        lastSyncTimestamp: null,
        addPendingUpdate: vi.fn(),
        setConflictResolution: vi.fn(),
      });

      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      const batteryData = { batteryLevel: 85, health: 95 };

      act(() => {
        result.current.handleBatteryUpdate('EV-001', batteryData);
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'battery_update',
          data: { vehicleId: 'EV-001', ...batteryData },
        })
      );
    });

    it('should handle location updates', async () => {
      const mockSend = vi.fn();
      
      const { useWebSocket } = await import('../useWebSocket');
      (useWebSocket as Mock).mockReturnValue({
        connectionState: 'connected',
        isConnected: true,
        isOffline: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: mockSend,
        lastSyncTimestamp: null,
        addPendingUpdate: vi.fn(),
        setConflictResolution: vi.fn(),
      });

      const { result } = renderHook(() => useRealTimeSync(), {
        wrapper: createWrapper(store),
      });

      const locationData = { lat: 47.6062, lng: -122.3321, address: 'Seattle, WA' };

      act(() => {
        result.current.handleLocationUpdate('EV-001', locationData);
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'location_update',
          data: { vehicleId: 'EV-001', ...locationData },
        })
      );
    });
  });
});

describe('useRealTimeVehicleMonitoring Hook', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should return vehicle data when vehicleId is provided', () => {
    const { result } = renderHook(() => useRealTimeVehicleMonitoring('EV-001'), {
      wrapper: createWrapper(store),
    });

    expect(result.current.vehicle).toEqual(mockVehicle);
    expect(result.current.isRealTimeActive).toBe(true);
    expect(result.current.lastUpdateTime).toBeTruthy();
  });

  it('should return null when vehicleId is not found', () => {
    const { result } = renderHook(() => useRealTimeVehicleMonitoring('NON-EXISTENT'), {
      wrapper: createWrapper(store),
    });

    expect(result.current.vehicle).toBeUndefined();
    expect(result.current.lastUpdateTime).toBe(null);
  });

  it('should detect stale data', () => {
    // Create a vehicle with old update time
    const staleVehicle = {
      ...mockVehicle,
      updatedAt: new Date(Date.now() - 120000), // 2 minutes ago
    };

    const staleStore = createTestStore({
      fleet: {
        vehicles: [staleVehicle],
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
    });

    const { result } = renderHook(() => useRealTimeVehicleMonitoring('EV-001'), {
      wrapper: createWrapper(staleStore),
    });

    expect(result.current.isStale).toBe(true);
  });
});

describe('useRealTimeAlerts Hook', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should return alert data', () => {
    const { result } = renderHook(() => useRealTimeAlerts(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.isRealTimeActive).toBe(true);
  });

  it('should identify recent alerts', () => {
    const recentAlert = {
      ...mockAlert,
      id: 'alert-002',
      timestamp: new Date(), // Current time
    };

    const alertStore = createTestStore({
      alerts: {
        alerts: [mockAlert, recentAlert],
        unreadCount: 2,
        loading: false,
        lastAutoGeneration: null,
        autoGenerationEnabled: true,
      },
    });

    const { result } = renderHook(() => useRealTimeAlerts(), {
      wrapper: createWrapper(alertStore),
    });

    expect(result.current.hasRecentAlerts).toBe(true);
    expect(result.current.recentAlerts.length).toBeGreaterThan(0);
  });

  it('should handle no recent alerts', () => {
    const oldAlert = {
      ...mockAlert,
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    };

    const alertStore = createTestStore({
      alerts: {
        alerts: [oldAlert],
        unreadCount: 1,
        loading: false,
        lastAutoGeneration: null,
        autoGenerationEnabled: true,
      },
    });

    const { result } = renderHook(() => useRealTimeAlerts(), {
      wrapper: createWrapper(alertStore),
    });

    expect(result.current.hasRecentAlerts).toBe(false);
    expect(result.current.recentAlerts).toHaveLength(0);
  });
});