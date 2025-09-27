import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RealTimeMonitor from '../RealTimeMonitor';
import uiSlice from '../../../store/slices/uiSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import alertSlice from '../../../store/slices/alertSlice';
import dashboardSlice from '../../../store/slices/dashboardSlice';

// Mock the hooks
vi.mock('../../../hooks/useRealTimeSync', () => ({
  useRealTimeSync: vi.fn(() => ({
    isRealTimeActive: true,
    lastSyncTime: new Date().toISOString(),
    pendingUpdatesCount: 0,
    forceSync: vi.fn(),
    enableAutoAlerts: vi.fn(),
    disableAutoAlerts: vi.fn(),
  })),
}));

vi.mock('../../../hooks/useRealTimePerformance', () => ({
  useRealTimePerformance: vi.fn(() => ({
    metrics: {
      latency: 150,
      messageRate: 25,
      uptime: 300000, // 5 minutes
      reconnectionCount: 1,
      messageCount: 100,
      averageLatency: 145,
      lastMessageTime: new Date(),
    },
    isHealthy: true,
    resetMetrics: vi.fn(),
  })),
  useDataFreshness: vi.fn(() => ({
    getStaleDataTypes: vi.fn(() => []),
    clearAllTimestamps: vi.fn(),
    lastUpdateTimes: {
      vehicles: new Date(),
      alerts: new Date(),
    },
  })),
}));

vi.mock('../../../hooks/useWebSocket', () => ({
  useConnectionStatus: vi.fn(() => ({
    connectionState: 'connected',
    isConnected: true,
    statusText: 'Connected',
    statusColor: 'green',
  })),
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      ui: uiSlice,
      fleet: fleetSlice,
      alerts: alertSlice,
      dashboard: dashboardSlice,
    },
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('RealTimeMonitor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render status indicator', () => {
      renderWithProvider(<RealTimeMonitor />);
      
      // Should show green status icon for healthy connection
      expect(screen.getByTitle(/All systems operational/)).toBeInTheDocument();
    });

    it('should show detailed view when enabled', () => {
      renderWithProvider(<RealTimeMonitor showDetailedView={true} />);
      
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
    });

    it('should show control panel button', () => {
      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      expect(controlButton).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    it('should show healthy status when all systems are operational', async () => {
      renderWithProvider(<RealTimeMonitor />);
      
      const statusIcon = screen.getByTitle('All systems operational');
      expect(statusIcon).toHaveTextContent('🟢');
    });

    it('should show warning status when there are issues', async () => {
      const { useRealTimeSync } = await import('../../../hooks/useRealTimeSync');
      const { useRealTimePerformance, useDataFreshness } = await import('../../../hooks/useRealTimePerformance');
      const { useConnectionStatus } = await import('../../../hooks/useWebSocket');
      
      // Mock disconnected state
      (useConnectionStatus as Mock).mockReturnValue({
        connectionState: 'disconnected',
        isConnected: false,
        statusText: 'Disconnected',
        statusColor: 'red',
      });

      // Mock unhealthy state with pending updates
      (useRealTimeSync as Mock).mockReturnValue({
        isRealTimeActive: false,
        lastSyncTime: null,
        pendingUpdatesCount: 5,
        forceSync: vi.fn(),
        enableAutoAlerts: vi.fn(),
        disableAutoAlerts: vi.fn(),
      });

      // Mock unhealthy performance
      (useRealTimePerformance as Mock).mockReturnValue({
        metrics: {
          latency: 2000, // High latency
          messageRate: 5,
          uptime: 300000,
          reconnectionCount: 3,
          messageCount: 50,
          averageLatency: 1800,
          lastMessageTime: new Date(),
        },
        isHealthy: false,
        resetMetrics: vi.fn(),
      });

      // Mock stale data
      (useDataFreshness as Mock).mockReturnValue({
        getStaleDataTypes: vi.fn(() => ['vehicles', 'alerts']),
        clearAllTimestamps: vi.fn(),
        lastUpdateTimes: {},
      });

      renderWithProvider(<RealTimeMonitor />);
      
      await waitFor(() => {
        expect(screen.getByText(/Issues:/)).toBeInTheDocument();
      });
    });

    it('should show disconnected status when offline', async () => {
      const { useConnectionStatus } = await import('../../../hooks/useWebSocket');
      
      (useConnectionStatus as Mock).mockReturnValue({
        connectionState: 'disconnected',
        isConnected: false,
        statusText: 'Disconnected',
        statusColor: 'red',
      });

      renderWithProvider(<RealTimeMonitor />);
      
      const statusIcon = screen.getByTitle('Disconnected');
      expect(statusIcon).toHaveTextContent('🔴');
    });
  });

  describe('Pending Updates', () => {
    it('should show pending updates badge when there are queued updates', async () => {
      const { useRealTimeSync } = await import('../../../hooks/useRealTimeSync');
      
      (useRealTimeSync as Mock).mockReturnValue({
        isRealTimeActive: false,
        lastSyncTime: null,
        pendingUpdatesCount: 5,
        forceSync: vi.fn(),
        enableAutoAlerts: vi.fn(),
        disableAutoAlerts: vi.fn(),
      });

      renderWithProvider(<RealTimeMonitor />);
      
      expect(screen.getByText('5 queued')).toBeInTheDocument();
    });

    it('should not show pending updates badge when count is zero', () => {
      renderWithProvider(<RealTimeMonitor />);
      
      expect(screen.queryByText(/queued/)).not.toBeInTheDocument();
    });
  });

  describe('Control Panel', () => {
    it('should open control panel when button is clicked', async () => {
      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        expect(screen.getByText('Real-time Monitoring Control Panel')).toBeInTheDocument();
      });
    });

    it('should display connection status in control panel', async () => {
      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connection Status')).toBeInTheDocument();
      });
    });

    it('should display performance metrics in control panel', async () => {
      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      });
    });

    it('should allow toggling auto alerts', async () => {
      const mockDisableAutoAlerts = vi.fn();
      const mockEnableAutoAlerts = vi.fn();
      
      const { useRealTimeSync } = await import('../../../hooks/useRealTimeSync');
      (useRealTimeSync as Mock).mockReturnValue({
        isRealTimeActive: true,
        lastSyncTime: new Date().toISOString(),
        pendingUpdatesCount: 0,
        forceSync: vi.fn(),
        enableAutoAlerts: mockEnableAutoAlerts,
        disableAutoAlerts: mockDisableAutoAlerts,
      });

      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        const toggleButton = screen.getByText('Enabled');
        fireEvent.click(toggleButton);
      });
      
      expect(mockDisableAutoAlerts).toHaveBeenCalled();
    });

    it('should allow forcing sync', async () => {
      const mockForceSync = vi.fn();
      
      const { useRealTimeSync } = await import('../../../hooks/useRealTimeSync');
      (useRealTimeSync as Mock).mockReturnValue({
        isRealTimeActive: true,
        lastSyncTime: new Date().toISOString(),
        pendingUpdatesCount: 0,
        forceSync: mockForceSync,
        enableAutoAlerts: vi.fn(),
        disableAutoAlerts: vi.fn(),
      });

      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        const forceSyncButton = screen.getByText('Force Sync');
        fireEvent.click(forceSyncButton);
      });
      
      expect(mockForceSync).toHaveBeenCalled();
    });

    it('should allow resetting metrics', async () => {
      const mockResetMetrics = vi.fn();
      const mockClearAllTimestamps = vi.fn();
      
      const { useRealTimePerformance, useDataFreshness } = await import('../../../hooks/useRealTimePerformance');
      
      (useRealTimePerformance as Mock).mockReturnValue({
        metrics: {
          latency: 150,
          messageRate: 25,
          uptime: 300000,
          reconnectionCount: 1,
          messageCount: 100,
          averageLatency: 145,
          lastMessageTime: new Date(),
        },
        isHealthy: true,
        resetMetrics: mockResetMetrics,
      });

      (useDataFreshness as Mock).mockReturnValue({
        getStaleDataTypes: vi.fn(() => []),
        clearAllTimestamps: mockClearAllTimestamps,
        lastUpdateTimes: {},
      });

      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        const resetButton = screen.getByText('Reset Metrics');
        fireEvent.click(resetButton);
      });
      
      expect(mockResetMetrics).toHaveBeenCalled();
      expect(mockClearAllTimestamps).toHaveBeenCalled();
    });

    it('should close control panel when close button is clicked', async () => {
      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        expect(screen.getByText('Real-time Monitoring Control Panel')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Real-time Monitoring Control Panel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format recent sync times correctly', async () => {
      const recentTime = new Date(Date.now() - 30000).toISOString(); // 30 seconds ago
      
      const { useRealTimeSync } = await import('../../../hooks/useRealTimeSync');
      (useRealTimeSync as Mock).mockReturnValue({
        isRealTimeActive: true,
        lastSyncTime: recentTime,
        pendingUpdatesCount: 0,
        forceSync: vi.fn(),
        enableAutoAlerts: vi.fn(),
        disableAutoAlerts: vi.fn(),
      });

      renderWithProvider(<RealTimeMonitor showDetailedView={true} />);
      
      expect(screen.getByText(/30s ago/)).toBeInTheDocument();
    });

    it('should show "Never" when no sync time is available', async () => {
      const { useRealTimeSync } = await import('../../../hooks/useRealTimeSync');
      (useRealTimeSync as Mock).mockReturnValue({
        isRealTimeActive: true,
        lastSyncTime: null,
        pendingUpdatesCount: 0,
        forceSync: vi.fn(),
        enableAutoAlerts: vi.fn(),
        disableAutoAlerts: vi.fn(),
      });

      renderWithProvider(<RealTimeMonitor />);
      
      const controlButton = screen.getByTitle('Open real-time control panel');
      fireEvent.click(controlButton);
      
      await waitFor(() => {
        expect(screen.getByText('Never')).toBeInTheDocument();
      });
    });
  });
});