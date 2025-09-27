import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import NotificationsDropdown from '../NotificationsDropdown';
import type { AppNotification } from '../../../types';

const mockNotifications: AppNotification[] = [
  {
    id: 'notif-001',
    title: 'Low Battery Alert',
    message: 'Vehicle EV-004 battery level is at 23%',
    type: 'warning',
    read: false,
    timestamp: new Date('2024-12-09T11:45:00Z'),
    actionUrl: '/fleet/vehicles/EV-004',
  },
  {
    id: 'notif-002',
    title: 'Maintenance Due',
    message: 'Vehicle EV-009 is due for scheduled maintenance',
    type: 'info',
    read: true,
    timestamp: new Date('2024-12-09T10:30:00Z'),
  },
  {
    id: 'notif-003',
    title: 'Geofence Violation',
    message: 'Vehicle EV-012 has exited authorized area',
    type: 'error',
    read: false,
    timestamp: new Date('2024-12-09T09:15:00Z'),
  },
];

describe('NotificationsDropdown', () => {
  it('renders notification button with unread count', () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    expect(notificationButton).toBeInTheDocument();
    
    const unreadBadge = screen.getByText('2');
    expect(unreadBadge).toBeInTheDocument();
  });

  it('does not show badge when no unread notifications', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    render(<NotificationsDropdown notifications={readNotifications} />);
    
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('opens dropdown when notification button clicked', async () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Low Battery Alert')).toBeInTheDocument();
      expect(screen.getByText('Maintenance Due')).toBeInTheDocument();
      expect(screen.getByText('Geofence Violation')).toBeInTheDocument();
    });
  });

  it('displays unread count in header', async () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('2 unread notifications')).toBeInTheDocument();
    });
  });

  it('shows mark all read button when there are unread notifications', async () => {
    const mockOnMarkAllRead = vi.fn();
    render(
      <NotificationsDropdown 
        notifications={mockNotifications} 
        onMarkAllRead={mockOnMarkAllRead}
      />
    );
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      const markAllReadButton = screen.getByText('Mark all read');
      expect(markAllReadButton).toBeInTheDocument();
      
      fireEvent.click(markAllReadButton);
      expect(mockOnMarkAllRead).toHaveBeenCalledTimes(1);
    });
  });

  it('shows clear all button when there are notifications', async () => {
    const mockOnClearAll = vi.fn();
    render(
      <NotificationsDropdown 
        notifications={mockNotifications} 
        onClearAll={mockOnClearAll}
      />
    );
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      const clearAllButton = screen.getByText('Clear all');
      expect(clearAllButton).toBeInTheDocument();
      
      fireEvent.click(clearAllButton);
      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onNotificationClick when notification is clicked', async () => {
    const mockOnNotificationClick = vi.fn();
    render(
      <NotificationsDropdown 
        notifications={mockNotifications} 
        onNotificationClick={mockOnNotificationClick}
      />
    );
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      const notification = screen.getByText('Low Battery Alert');
      fireEvent.click(notification);
    });
    
    expect(mockOnNotificationClick).toHaveBeenCalledWith('notif-001');
  });

  it('displays empty state when no notifications', async () => {
    render(<NotificationsDropdown notifications={[]} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });
  });

  it('shows correct icons for different notification types', async () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      // Check that different colored icons are present
      const warningIcon = screen.getByText('Low Battery Alert').closest('button')?.querySelector('.text-yellow-600');
      const infoIcon = screen.getByText('Maintenance Due').closest('button')?.querySelector('.text-blue-600');
      const errorIcon = screen.getByText('Geofence Violation').closest('button')?.querySelector('.text-red-600');
      
      expect(warningIcon).toBeInTheDocument();
      expect(infoIcon).toBeInTheDocument();
      expect(errorIcon).toBeInTheDocument();
    });
  });

  it('formats timestamps correctly', async () => {
    const recentNotification: AppNotification = {
      id: 'recent',
      title: 'Recent Alert',
      message: 'This just happened',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 30000), // 30 seconds ago
    };
    
    render(<NotificationsDropdown notifications={[recentNotification]} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Just now')).toBeInTheDocument();
    });
  });

  it('highlights unread notifications', async () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      const unreadNotification = screen.getByText('Low Battery Alert').closest('button');
      const readNotification = screen.getByText('Maintenance Due').closest('button');
      
      expect(unreadNotification).toHaveClass('bg-blue-50', 'border-l-4', 'border-blue-400');
      expect(readNotification).not.toHaveClass('bg-blue-50');
    });
  });

  it('shows action URL hint for notifications with actionUrl', async () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Click to view details →')).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(<NotificationsDropdown notifications={mockNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Low Battery Alert')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Low Battery Alert')).not.toBeInTheDocument();
    });
  });

  it('limits displayed notifications to 10', async () => {
    const manyNotifications = Array.from({ length: 15 }, (_, i) => ({
      id: `notif-${i}`,
      title: `Notification ${i}`,
      message: `Message ${i}`,
      type: 'info' as const,
      read: false,
      timestamp: new Date(),
    }));
    
    render(<NotificationsDropdown notifications={manyNotifications} />);
    
    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      const notifications = screen.getAllByText(/Notification \d+/);
      expect(notifications).toHaveLength(10);
      expect(screen.getByText('View all notifications (15)')).toBeInTheDocument();
    });
  });

  it('shows 99+ for very high unread counts', () => {
    const manyUnreadNotifications = Array.from({ length: 150 }, (_, i) => ({
      id: `notif-${i}`,
      title: `Notification ${i}`,
      message: `Message ${i}`,
      type: 'info' as const,
      read: false,
      timestamp: new Date(),
    }));
    
    render(<NotificationsDropdown notifications={manyUnreadNotifications} />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});