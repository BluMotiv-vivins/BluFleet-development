// Design system constants for BluFleet

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#0066ff',
    600: '#0052cc',
    700: '#0043a3',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  navy: {
    800: '#1e293b',
    900: '#1a2332',
  },
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

export const VEHICLE_TYPES = {
  truck: 'Truck',
  forklift: 'Forklift',
  van: 'Van',
  car: 'Car',
} as const;

export const VEHICLE_STATUS = {
  active: 'Active',
  charging: 'Charging',
  maintenance: 'Maintenance',
  offline: 'Offline',
} as const;

export const ALERT_TYPES = {
  battery: 'Battery',
  maintenance: 'Maintenance',
  safety: 'Safety',
  geofence: 'Geofence',
  system: 'System',
} as const;

export const ALERT_SEVERITY = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const;

export const DRIVER_STATUS = {
  active: 'Active',
  offline: 'Offline',
  break: 'On Break',
} as const;

export const CHARGING_STATION_STATUS = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  offline: 'Offline',
} as const;

export const ROUTE_STATUS = {
  planned: 'Planned',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const USER_ROLES = {
  admin: 'Administrator',
  manager: 'Fleet Manager',
  operator: 'Operator',
} as const;

export const NOTIFICATION_TYPES = {
  info: 'Information',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
} as const;

export const TIME_RANGES = {
  '1h': '1 Hour',
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  custom: 'Custom Range',
} as const;

// Navigation menu items with icon names
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/',
  },
  {
    id: 'fleet-tracking',
    label: 'Fleet Tracking',
    icon: 'location',
    path: '/fleet-tracking',
  },
  {
    id: 'energy-charging',
    label: 'Energy & Charging',
    icon: 'lightning',
    path: '/energy-charging',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'tools',
    path: '/maintenance',
  },
  {
    id: 'safety-compliance',
    label: 'Safety & Compliance',
    icon: 'shield',
    path: '/safety-compliance',
  },
  {
    id: 'analytics-reports',
    label: 'Analytics & Reports',
    icon: 'chart',
    path: '/analytics-reports',
  },
  {
    id: 'battery-analytics',
    label: 'Battery Analytics',
    icon: 'lightning',
    path: '/battery-analytics',
  },
  {
    id: 'simulation-results',
    label: 'Simulation Results',
    icon: 'beaker',
    path: '/simulation-results',
  },
  {
    id: 'geo-operations',
    label: 'Geo-Operations',
    icon: 'map',
    path: '/geo-operations',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'grid',
    path: '/integrations',
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: 'users',
    path: '/user-management',
  },
] as const;

// API endpoints
export const API_ENDPOINTS = {
  vehicles: 'http://localhost:3000/api/vehicles',
  drivers: 'http://localhost:3000/api/drivers',
  chargingStations: 'http://localhost:3000/api/charging-stations',
  alerts: 'http://localhost:3000/api/alerts',
  routes: 'http://localhost:3000/api/routes',
  geofences: 'http://localhost:3000/api/geofences',
  dashboard: 'http://localhost:3000/api/dashboard',
  auth: 'http://localhost:3000/api/auth',
  notifications: 'http://localhost:3000/api/notifications',
  predictions: 'http://localhost:3000/api/analytics/predictions',
} as const;

// WebSocket events
export const WS_EVENTS = {
  VEHICLE_UPDATE: 'vehicle:update',
  BATTERY_UPDATE: 'battery:update',
  ALERT_NEW: 'alert:new',
  DRIVER_UPDATE: 'driver:update',
  CHARGING_UPDATE: 'charging:update',
  LOCATION_UPDATE: 'location:update',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'blufleet_auth_token',
  USER_PREFERENCES: 'blufleet_user_preferences',
  DASHBOARD_FILTERS: 'blufleet_dashboard_filters',
  SIDEBAR_COLLAPSED: 'blufleet_sidebar_collapsed',
} as const;

// Configuration
export const CONFIG = {
  APP_NAME: 'BluFleet',
  APP_TAGLINE: 'Powering Sustainable Fleet Operations',
  REFRESH_INTERVAL: 30000, // 30 seconds
  WEBSOCKET_RECONNECT_DELAY: 5000, // 5 seconds
  API_TIMEOUT: 10000, // 10 seconds
  PAGINATION_SIZE: 20,
  MAX_ALERTS_DISPLAY: 10,
  BATTERY_LOW_THRESHOLD: 25,
  BATTERY_CRITICAL_THRESHOLD: 10,
} as const;
