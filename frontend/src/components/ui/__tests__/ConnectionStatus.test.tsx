import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ConnectionStatus from '../ConnectionStatus';
import uiSlice from '../../../store/slices/uiSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import alertSlice from '../../../store/slices/alertSlice';
import dashboardSlice from '../../../store/slices/dashboardSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice,
      fleet: fleetSlice,
      alerts: alertSlice,
      dashboard: dashboardSlice,
    },
    preloadedState: initialState,
  });
};

const renderWithStore = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('ConnectionStatus Component', () => {
  describe('Visual Rendering', () => {
    it('should render connection indicator without text by default', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus />, store);

      // Should have a status indicator
      const indicator = document.querySelector('.rounded-full');
      expect(indicator).toBeInTheDocument();
      
      // Should not show text by default
      expect(screen.queryByText('Connected')).not.toBeInTheDocument();
    });

    it('should render connection indicator with text when showText is true', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const store = createTestStore({
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
      });

      const { container } = renderWithStore(
        <ConnectionStatus className="custom-class" />, 
        store
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Connection States', () => {
    it('should show green indicator when connected', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.bg-green-500');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should show yellow indicator when connecting', () => {
      const store = createTestStore({
        ui: {
          connectionStatus: 'connecting',
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.bg-yellow-500');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should show yellow indicator when reconnecting', () => {
      const store = createTestStore({
        ui: {
          connectionStatus: 'reconnecting',
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.bg-yellow-500');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    });

    it('should show red indicator when disconnected', () => {
      const store = createTestStore({
        ui: {
          connectionStatus: 'disconnected',
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.bg-red-500');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('should show red indicator when error', () => {
      const store = createTestStore({
        ui: {
          connectionStatus: 'error',
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.bg-red-500');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
    });

    it('should show gray indicator when offline', () => {
      const store = createTestStore({
        ui: {
          connectionStatus: 'connected',
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

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.bg-gray-400');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus size="sm" showText />, store);

      const indicator = document.querySelector('.w-2.h-2');
      expect(indicator).toBeInTheDocument();
      
      const text = screen.getByText('Connected');
      expect(text).toHaveClass('text-xs');
    });

    it('should apply medium size classes by default', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus showText />, store);

      const indicator = document.querySelector('.w-3.h-3');
      expect(indicator).toBeInTheDocument();
      
      const text = screen.getByText('Connected');
      expect(text).toHaveClass('text-sm');
    });

    it('should apply large size classes', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus size="lg" showText />, store);

      const indicator = document.querySelector('.w-4.h-4');
      expect(indicator).toBeInTheDocument();
      
      const text = screen.getByText('Connected');
      expect(text).toHaveClass('text-base');
    });
  });

  describe('Animation', () => {
    it('should animate when connected', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus />, store);

      const indicator = document.querySelector('.animate-pulse');
      expect(indicator).toBeInTheDocument();
    });

    it('should not animate when disconnected', () => {
      const store = createTestStore({
        ui: {
          connectionStatus: 'disconnected',
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
      });

      renderWithStore(<ConnectionStatus />, store);

      const indicator = document.querySelector('.animate-pulse');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have title attribute for tooltip', () => {
      const store = createTestStore({
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
      });

      renderWithStore(<ConnectionStatus />, store);

      const indicator = document.querySelector('.rounded-full');
      expect(indicator).toHaveAttribute('title', 'Connected');
    });
  });
});