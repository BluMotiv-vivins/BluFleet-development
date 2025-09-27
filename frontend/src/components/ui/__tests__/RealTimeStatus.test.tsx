import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RealTimeStatus from '../RealTimeStatus';
import uiSlice from '../../../store/slices/uiSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import alertSlice from '../../../store/slices/alertSlice';
import dashboardSlice from '../../../store/slices/dashboardSlice';

// Mock the hooks
vi.mock('../../../hooks/useWebSocket', () => ({
  useConnectionStatus: vi.fn(() => ({
    connectionState: 'connected',
    isConnected: true,
    statusColor: 'green',
    statusText: 'Connected',
  })),
}));

vi.mock('../../../hooks/useRealTimePerformance', () => ({
  useRealTimePerformance: vi.fn(() => ({
    metrics: {
      latency: 150,
      messageRate: 12,
      reconnectionCount: 0,
      uptime: 300000, // 5 minutes
      lastMessageTime: new Date(),
      averageLatency: 145.5,
      messageCount: 50,
    },
    isHealthy: true,
    getPerformanceReport: vi.fn(() => 'Mock performance report'),
  })),
  useDataFreshness: vi.fn(() => ({
    getStaleDataTypes: vi.fn(() => []),
    lastUpdateTimes: {
      vehicles: new Date(),
      alerts: new Date(Date.now() - 30000), // 30 seconds ago
    },
  })),
}));

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
      ...initialState,
    },
  });
};

const renderWithStore = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('RealTimeStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render connection status indicator', () => {
      renderWithStore(<RealTimeStatus />);
      
      // Should have a connection status indicator
      const indicator = document.querySelector('.rounded-full');
      expect(indicator).toBeInTheDocument();
    });

    it('should render info button when detailed info is not shown', () => {
      renderWithStore(<RealTimeStatus />);
      
      const infoButton = screen.getByTitle('View connection details');
      expect(infoButton).toBeInTheDocument();
      expect(infoButton).toHaveTextContent('ℹ');
    });

    it('should render detailed info when showDetailedInfo is true', () => {
      renderWithStore(<RealTimeStatus showDetailedInfo />);
      
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderWithStore(
        <RealTimeStatus className="custom-class" />
      );
      
      expect(container.firstChild?.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Detailed Information Display', () => {
    it('should show performance metrics when detailed info is enabled', () => {
      renderWithStore(<RealTimeStatus showDetailedInfo />);
      
      // Should show health status
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      
      // Should show uptime (5 minutes = 5m 0s)
      expect(screen.getByText(/5m/)).toBeInTheDocument();
      
      // Should show latency
      expect(screen.getByText(/150ms/)).toBeInTheDocument();
      
      // Should show message rate
      expect(screen.getByText(/12\/min/)).toBeInTheDocument();
    });

    it('should show degraded status when connection is unhealthy', () => {
      const { useRealTimePerformance } = require('../../../hooks/useRealTimePerformance');
      useRealTimePerformance.mockReturnValue({
        metrics: {
          latency: 2500, // High latency
          messageRate: 2,
          reconnectionCount: 3,
          uptime: 300000,
          lastMessageTime: new Date(),
          averageLatency: 2200,
          messageCount: 10,
        },
        isHealthy: false,
        getPerformanceReport: vi.fn(() => 'Degraded performance report'),
      });

      renderWithStore(<RealTimeStatus showDetailedInfo />);
      
      expect(screen.getByText('Degraded')).toBeInTheDocument();
    });

    it('should show stale data warning when data is stale', () => {
      const { useDataFreshness } = require('../../../hooks/useRealTimePerformance');
      useDataFreshness.mockReturnValue({
        getStaleDataTypes: vi.fn(() => ['vehicles', 'alerts']),
        lastUpdateTimes: {
          vehicles: new Date(Date.now() - 120000), // 2 minutes ago
          alerts: new Date(Date.now() - 180000), // 3 minutes ago
        },
      });

      renderWithStore(<RealTimeStatus showDetailedInfo />);
      
      expect(screen.getByText(/2 stale/)).toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('should open modal when details button is clicked', () => {
      renderWithStore(<RealTimeStatus showDetailedInfo />);
      
      const detailsButton = screen.getByText('Details');
      fireEvent.click(detailsButton);
      
      expect(screen.getByText('Real-time Connection Status')).toBeInTheDocument();
    });

    it('should open modal when info button is clicked', () => {
      renderWithStore(<RealTimeStatus />);
      
      const infoButton = screen.getByTitle('View connection details');
      fireEvent.click(infoButton);
      
      expect(screen.getByText('Real-time Connection Status')).toBeInTheDocument();
    });

    it('should display performance metrics in modal', () => {
      renderWithStore(<RealTimeStatus />);
      
      const infoButton = screen.getByTitle('View connection details');
      fireEvent.click(infoButton);
      
      // Check for modal sections
      expect(screen.getByText('Connection Overview')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Data Freshness')).toBeInTheDocument();
      expect(screen.getByText('Detailed Report')).toBeInTheDocument();
      
      // Check for specific metrics
      expect(screen.getByText('150ms')).toBeInTheDocument();
      expect(screen.getByText('145.5ms')).toBeInTheDocument();
      expect(screen.getByText('12 msg/min')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', () => {
      renderWithStore(<RealTimeStatus />);
      
      const infoButton = screen.getByTitle('View connection details');
      fireEvent.click(infoButton);
      
      expect(screen.getByText('Real-time Connection Status')).toBeInTheDocument();
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      expect(screen.queryByText('Real-time Connection Status')).not.toBeInTheDocument();
    });

    it('should copy report when copy button is clicked', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      renderWithStore(<RealTimeStatus />);
      
      const infoButton = screen.getByTitle('View connection details');
      fireEvent.click(infoButton);
      
      const copyButton = screen.getByText('Copy Report');
      fireEvent.click(copyButton);
      
      expect(mockWriteText).toHaveBeenCalledWith('Mock performance report');
    });
  });

  describe('Utility Functions', () => {
    it('should format uptime correctly', () => {
      // Test different uptime values by checking rendered output
      const { useRealTimePerformance } = require('../../../hooks/useRealTimePerformance');
      
      // Test hours and minutes
      useRealTimePerformance.mockReturnValue({
        metrics: {
          uptime: 3661000, // 1 hour, 1 minute, 1 second
          latency: 100,
          messageRate: 10,
          reconnectionCount: 0,
          lastMessageTime: new Date(),
          averageLatency: 100,
          messageCount: 20,
        },
        isHealthy: true,
        getPerformanceReport: vi.fn(() => 'Test report'),
      });

      renderWithStore(<RealTimeStatus showDetailedInfo />);
      expect(screen.getByText(/1h 1m/)).toBeInTheDocument();
    });

    it('should format latency quality correctly', () => {
      renderWithStore(<RealTimeStatus />);
      
      const infoButton = screen.getByTitle('View connection details');
      fireEvent.click(infoButton);
      
      // 150ms should be "Good"
      expect(screen.getByText('(Good)')).toBeInTheDocument();
    });
  });

  describe('Disconnected State', () => {
    it('should handle disconnected state gracefully', () => {
      const { useConnectionStatus } = require('../../../hooks/useWebSocket');
      useConnectionStatus.mockReturnValue({
        connectionState: 'disconnected',
        isConnected: false,
        statusColor: 'red',
        statusText: 'Disconnected',
      });

      renderWithStore(<RealTimeStatus showDetailedInfo />);
      
      // Should not show performance metrics when disconnected
      expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
      expect(screen.queryByText(/ms/)).not.toBeInTheDocument();
    });
  });
});