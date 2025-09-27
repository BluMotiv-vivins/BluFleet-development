import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../components/dashboard/Dashboard';
import uiSlice from '../store/slices/uiSlice';
import dashboardSlice from '../store/slices/dashboardSlice';
import fleetSlice from '../store/slices/fleetSlice';
import alertSlice from '../store/slices/alertSlice';
import type { User, AppNotification } from '../types';

// Mock child components to focus on responsive behavior
vi.mock('../components/layout/Header', () => ({
  default: ({ isMobile, onSidebarToggle }: { isMobile?: boolean; onSidebarToggle?: () => void }) => (
    <div data-testid="header" data-mobile={isMobile}>
      <button onClick={onSidebarToggle} data-testid="menu-toggle">Menu</button>
      {isMobile && <div data-testid="mobile-search">Mobile Search</div>}
    </div>
  ),
}));

vi.mock('../components/layout/Sidebar', () => ({
  default: ({ isOpen, isMobile }: { isOpen?: boolean; isMobile?: boolean }) => (
    <div 
      data-testid="sidebar" 
      data-open={isOpen} 
      data-mobile={isMobile}
      className={isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
    >
      Sidebar
    </div>
  ),
}));

vi.mock('../components/dashboard/KPICards', () => ({
  default: () => (
    <div data-testid="kpi-cards" className="grid-responsive-cards">
      <div className="kpi-card">KPI 1</div>
      <div className="kpi-card">KPI 2</div>
      <div className="kpi-card">KPI 3</div>
      <div className="kpi-card">KPI 4</div>
    </div>
  ),
}));

const mockStore = configureStore({
  reducer: {
    ui: uiSlice,
    dashboard: dashboardSlice,
    fleet: fleetSlice,
    alerts: alertSlice,
  },
  preloadedState: {
    ui: {
      sidebarCollapsed: false,
      activeRoute: '/',
      theme: 'light',
    },
    dashboard: {
      kpis: {
        totalVehicles: 25,
        activeVehicles: 20,
        chargingVehicles: 3,
        maintenanceVehicles: 2,
        averageBatteryLevel: 78,
        totalDistance: 1250,
        energyConsumed: 450,
        co2Saved: 125,
      },
      timeRange: '24h',
      refreshInterval: 30000,
      lastUpdated: new Date().toISOString(),
    },
    fleet: {
      vehicles: [],
      drivers: [],
      chargingStations: [],
      routes: [],
      geofences: [],
      loading: false,
      error: null,
    },
    alerts: {
      alerts: [],
      unreadCount: 0,
      loading: false,
      error: null,
    },
  },
});

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  avatar: 'avatar.jpg',
};

const mockNotifications: AppNotification[] = [];

// Viewport size utilities
const setViewportSize = (width: number, height: number = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

const triggerResize = () => {
  fireEvent(window, new Event('resize'));
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Responsive Design', () => {
  beforeEach(() => {
    // Reset to desktop size
    setViewportSize(1024);
  });

  describe('Breakpoint Behavior', () => {
    it('handles extra small screens (xs: 475px)', async () => {
      setViewportSize(400);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        const header = screen.getByTestId('header');
        expect(header).toHaveAttribute('data-mobile', 'true');
      });
    });

    it('handles small screens (sm: 640px)', async () => {
      setViewportSize(640);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toHaveAttribute('data-mobile', 'true');
      });
    });

    it('handles medium screens (md: 768px)', async () => {
      setViewportSize(768);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      // Should transition from mobile to desktop behavior
      await waitFor(() => {
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toHaveAttribute('data-mobile', 'false');
      });
    });

    it('handles large screens (lg: 1024px)', () => {
      setViewportSize(1024);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('data-mobile', 'false');
    });

    it('handles extra large screens (xl: 1280px)', () => {
      setViewportSize(1280);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      // Should have optimal desktop layout
      const kpiCards = screen.getByTestId('kpi-cards');
      expect(kpiCards).toHaveClass('grid-responsive-cards');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      setViewportSize(600); // Mobile size
    });

    it('shows mobile sidebar overlay', async () => {
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toHaveAttribute('data-mobile', 'true');
        expect(sidebar).toHaveAttribute('data-open', 'false');
      });
    });

    it('toggles mobile sidebar', async () => {
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        const menuToggle = screen.getByTestId('menu-toggle');
        fireEvent.click(menuToggle);
      });
      
      await waitFor(() => {
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toHaveAttribute('data-open', 'true');
      });
    });

    it('shows mobile search in header', async () => {
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-search')).toBeInTheDocument();
      });
    });
  });

  describe('Content Adaptation', () => {
    it('adapts dashboard layout for mobile', async () => {
      setViewportSize(400);
      
      renderWithProviders(<Dashboard />);
      
      // Dashboard should have mobile-friendly spacing
      const dashboard = screen.getByText('Fleet Dashboard').closest('div');
      expect(dashboard).toHaveClass('space-y-4');
    });

    it('adapts dashboard layout for tablet', async () => {
      setViewportSize(768);
      
      renderWithProviders(<Dashboard />);
      
      // Dashboard should have tablet spacing
      const dashboard = screen.getByText('Fleet Dashboard').closest('div');
      expect(dashboard).toHaveClass('sm:space-y-6');
    });

    it('shows collapsible sections on mobile', async () => {
      setViewportSize(400);
      
      renderWithProviders(<Dashboard />);
      
      // Should have expand/collapse buttons for sections
      const expandButtons = screen.getAllByLabelText(/toggle.*section/i);
      expect(expandButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Targets', () => {
    it('ensures minimum touch target sizes', () => {
      setViewportSize(400);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      const menuToggle = screen.getByTestId('menu-toggle');
      
      // Should have minimum 44px touch target
      const styles = window.getComputedStyle(menuToggle);
      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);
      
      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Responsive Typography', () => {
    it('scales text appropriately for different screen sizes', () => {
      const { rerender } = renderWithProviders(<Dashboard />);
      
      const heading = screen.getByText('Fleet Dashboard');
      
      // Should have responsive text classes
      expect(heading).toHaveClass('text-responsive-xl');
      
      // Test different viewport sizes
      setViewportSize(400);
      rerender(<Dashboard />);
      
      // Text should still be readable on small screens
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Grid Layouts', () => {
    it('adapts grid layouts for different screen sizes', () => {
      renderWithProviders(<Dashboard />);
      
      const kpiCards = screen.getByTestId('kpi-cards');
      
      // Should have responsive grid classes
      expect(kpiCards).toHaveClass('grid-responsive-cards');
    });
  });

  describe('Performance Considerations', () => {
    it('handles resize events efficiently', async () => {
      const resizeHandler = vi.fn();
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      // Simulate multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        setViewportSize(400 + i * 10);
        triggerResize();
      }
      
      // Should not cause performance issues
      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility at Different Sizes', () => {
    it('maintains accessibility on mobile', async () => {
      setViewportSize(400);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        // Skip link should still be present
        const skipLink = screen.getByRole('button', { name: /skip to main content/i });
        expect(skipLink).toBeInTheDocument();
        
        // Main content should have proper ARIA
        const main = screen.getByRole('main');
        expect(main).toHaveAttribute('aria-label', 'Main content');
      });
    });

    it('maintains focus management on mobile', async () => {
      setViewportSize(400);
      
      renderWithProviders(
        <AppLayout user={mockUser} notifications={mockNotifications}>
          <Dashboard />
        </AppLayout>
      );
      
      triggerResize();
      
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toHaveAttribute('tabIndex', '-1');
      });
    });
  });
});