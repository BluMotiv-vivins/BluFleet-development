import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AppLayout from '../AppLayout';
import uiSlice from '../../../store/slices/uiSlice';
import alertSlice from '../../../store/slices/alertSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import type { User, AppNotification } from '../../../types';

// Mock store
const mockStore = configureStore({
  reducer: {
    ui: uiSlice,
    alerts: alertSlice,
    fleet: fleetSlice,
  },
});

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'manager',
  permissions: ['dashboard:read'],
};

const mockNotifications: AppNotification[] = [
  {
    id: '1',
    title: 'Test Notification',
    message: 'Test message',
    type: 'info',
    read: false,
    timestamp: new Date(),
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('AppLayout', () => {
  it('renders sidebar and header', () => {
    renderWithProviders(
      <AppLayout user={mockUser} notifications={mockNotifications}>
        <div>Test Content</div>
      </AppLayout>
    );

    // Check if header elements are present
    expect(screen.getAllByText('FleetVolt Pro')).toHaveLength(2); // One in sidebar, one in header
    expect(screen.getByPlaceholderText('Search vehicles, drivers, locations...')).toBeInTheDocument();
    
    // Check if sidebar navigation is present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Fleet Tracking')).toBeInTheDocument();
    
    // Check if main content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays user information in header', () => {
    renderWithProviders(
      <AppLayout user={mockUser} notifications={mockNotifications}>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
  });

  it('shows notification count badge when there are unread notifications', () => {
    renderWithProviders(
      <AppLayout user={mockUser} notifications={mockNotifications}>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // notification count badge
  });

  it('adjusts layout when sidebar is collapsed', () => {
    const storeWithCollapsedSidebar = configureStore({
      reducer: {
        ui: uiSlice,
        alerts: alertSlice,
        fleet: fleetSlice,
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
        alerts: {
          alerts: [],
          unreadCount: 0,
          loading: false,
          error: null,
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
      },
    });

    render(
      <Provider store={storeWithCollapsedSidebar}>
        <BrowserRouter>
          <AppLayout user={mockUser} notifications={mockNotifications}>
            <div>Test Content</div>
          </AppLayout>
        </BrowserRouter>
      </Provider>
    );

    // Check if the main content area has the correct margin for collapsed sidebar
    const mainContent = screen.getByRole('main');
    expect(mainContent.parentElement).toHaveClass('ml-16');
  });
});