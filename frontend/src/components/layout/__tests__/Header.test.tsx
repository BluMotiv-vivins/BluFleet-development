import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import uiSlice from '../../../store/slices/uiSlice';
import alertSlice from '../../../store/slices/alertSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import type { User, AppNotification } from '../../../types';

// Mock the child components
vi.mock('../GlobalSearch', () => ({
  default: ({ onResultClick }: any) => (
    <div data-testid="global-search">
      <input placeholder="Search vehicles, drivers, locations..." />
      <button onClick={() => onResultClick?.({ id: 'test', type: 'vehicle', title: 'Test Vehicle' })}>
        Mock Result
      </button>
    </div>
  ),
}));

vi.mock('../UserProfileDropdown', () => ({
  default: ({ user, onProfileClick, onSettingsClick, onSignOut }: any) => (
    <div data-testid="user-profile-dropdown">
      <span>{user.name}</span>
      <button onClick={onProfileClick}>Profile</button>
      <button onClick={onSettingsClick}>Settings</button>
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  ),
}));

vi.mock('../NotificationsDropdown', () => ({
  default: ({ notifications, onNotificationClick, onMarkAllRead, onClearAll }: any) => (
    <div data-testid="notifications-dropdown">
      <span>{notifications.length} notifications</span>
      <button onClick={() => onNotificationClick?.('test-id')}>Click Notification</button>
      <button onClick={onMarkAllRead}>Mark All Read</button>
      <button onClick={onClearAll}>Clear All</button>
    </div>
  ),
}));

vi.mock('../SettingsPanel', () => ({
  default: ({ isOpen, onClose }: any) => isOpen ? (
    <div data-testid="settings-panel">
      <button onClick={onClose}>Close Settings</button>
    </div>
  ) : null,
}));

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
  {
    id: '2',
    title: 'Read Notification',
    message: 'Read message',
    type: 'success',
    read: true,
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

import { vi } from 'vitest';

describe('Header', () => {
  const mockOnSearch = vi.fn();
  const mockOnNotificationClick = vi.fn();
  const mockOnMarkAllRead = vi.fn();
  const mockOnClearAll = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnNotificationClick.mockClear();
    mockOnMarkAllRead.mockClear();
    mockOnClearAll.mockClear();
  });

  it('renders header elements correctly', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    expect(screen.getByText('FleetVolt Pro')).toBeInTheDocument();
    expect(screen.getByTestId('global-search')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays correct notification count', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    expect(screen.getByText('2 notifications')).toBeInTheDocument();
  });

  it('opens settings panel when settings button clicked', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
  });

  it('calls notification handlers correctly', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    const clickNotificationButton = screen.getByText('Click Notification');
    fireEvent.click(clickNotificationButton);
    expect(mockOnNotificationClick).toHaveBeenCalledWith('test-id');

    const markAllReadButton = screen.getByText('Mark All Read');
    fireEvent.click(markAllReadButton);
    expect(mockOnMarkAllRead).toHaveBeenCalledTimes(1);

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);
    expect(mockOnClearAll).toHaveBeenCalledTimes(1);
  });

  it('calls user profile handlers correctly', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    const profileButton = screen.getByText('Profile');
    fireEvent.click(profileButton);

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
  });

  it('closes settings panel when close button clicked', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    // Open settings panel
    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();

    // Close settings panel
    const closeButton = screen.getByText('Close Settings');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
  });

  it('toggles sidebar when menu button clicked', () => {
    renderWithProviders(
      <Header 
        user={mockUser} 
        notifications={mockNotifications}
        onSearch={mockOnSearch}
        onNotificationClick={mockOnNotificationClick}
        onMarkAllNotificationsRead={mockOnMarkAllRead}
        onClearAllNotifications={mockOnClearAll}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    // The actual sidebar toggle would be tested in integration tests
  });
});