// Notification utilities for BluFleet Frontend
// Version: 1.0.0

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export function createMockNotifications(): AppNotification[] {
  return [
    {
      id: '1',
      title: 'Low Battery Alert',
      message: 'Vehicle EV-005 battery level is at 23.7%',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      actionUrl: '/vehicles/ev-005'
    },
    {
      id: '2',
      title: 'Maintenance Due',
      message: 'Vehicle EV-003 is due for tire replacement',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      actionUrl: '/maintenance'
    },
    {
      id: '3',
      title: 'Trip Completed',
      message: 'Driver John completed delivery route successfully',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      actionUrl: '/trips'
    },
    {
      id: '4',
      title: 'Charging Complete',
      message: 'Vehicle EV-001 charging session completed',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
      actionUrl: '/energy-charging'
    }
  ];
}