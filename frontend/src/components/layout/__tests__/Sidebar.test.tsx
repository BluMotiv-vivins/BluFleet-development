import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from '../Sidebar';
import uiSlice from '../../../store/slices/uiSlice';

const mockStore = configureStore({
  reducer: {
    ui: uiSlice,
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

import { vi } from 'vitest';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('Sidebar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders all navigation items', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Fleet Tracking')).toBeInTheDocument();
    expect(screen.getByText('Energy & Charging')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Safety & Compliance')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    expect(screen.getByText('Geo-Operations')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('shows FleetVolt Pro logo and branding', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('FleetVolt Pro')).toBeInTheDocument();
    expect(screen.getByText('Powering Sustainable Fleet Operations')).toBeInTheDocument();
  });

  it('navigates to correct route when navigation item is clicked', () => {
    renderWithProviders(<Sidebar />);

    const fleetTrackingButton = screen.getByText('Fleet Tracking');
    fireEvent.click(fleetTrackingButton);

    expect(mockNavigate).toHaveBeenCalledWith('/fleet-tracking');
  });

  it('highlights active route', () => {
    renderWithProviders(<Sidebar />);

    const dashboardButton = screen.getByText('Dashboard').closest('button');
    expect(dashboardButton).toHaveClass('bg-primary-600');
  });

  it('shows collapsed state correctly', () => {
    const storeWithCollapsedSidebar = configureStore({
      reducer: {
        ui: uiSlice,
      },
      preloadedState: {
        ui: {
          sidebarCollapsed: true,
          activeRoute: '/',
          theme: 'light' as const,
          notifications: null,
          modals: {
            vehicleDetail: { open: false, vehicleId: null },
            driverDetail: { open: false, driverId: null },
          },
        },
      },
    });

    render(
      <Provider store={storeWithCollapsedSidebar}>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </Provider>
    );

    // In collapsed state, text labels should not be visible
    expect(screen.queryByText('FleetVolt Pro')).not.toBeInTheDocument();
    expect(screen.queryByText('Powering Sustainable Fleet Operations')).not.toBeInTheDocument();
    
    // But icons should still be visible (we can check for the sidebar container width)
    const sidebar = screen.getByTestId('sidebar-container');
    expect(sidebar).toHaveClass('w-16');
  });

  it('shows expanded state correctly', () => {
    renderWithProviders(<Sidebar />);

    // In expanded state, text labels should be visible
    expect(screen.getByText('FleetVolt Pro')).toBeInTheDocument();
    expect(screen.getByText('Powering Sustainable Fleet Operations')).toBeInTheDocument();
    
    // Sidebar should have full width
    const sidebar = screen.getByTestId('sidebar-container');
    expect(sidebar).toHaveClass('w-64');
  });
});