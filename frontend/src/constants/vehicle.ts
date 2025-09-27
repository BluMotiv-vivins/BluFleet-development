/**
 * Vehicle related constants
 */

// Vehicle statuses
export const VEHICLE_STATUSES = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
  CHARGING: 'charging',
  OUT_OF_SERVICE: 'out_of_service'
} as const;

// Vehicle types
export const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  HATCHBACK: 'hatchback',
  TRUCK: 'truck',
  VAN: 'van',
  BUS: 'bus'
} as const;

// Battery level thresholds
export const BATTERY_LEVEL = {
  CRITICAL: 10,
  LOW: 20,
  MEDIUM: 40,
  HIGH: 60,
  FULL: 80
} as const;

// Sort options
export const SORT_OPTIONS = {
  MAKE: 'make',
  YEAR: 'year',
  BATTERY_SOC: 'battery_soc',
  STATUS: 'status',
  RANGE: 'range',
} as const;

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  VEHICLES: '/api/vehicles',
  DRIVERS: '/api/drivers',
  TRIPS: '/api/trips',
  MAINTENANCE: '/api/maintenance',
  TELEMETRY: '/api/telemetry',
  ALERTS: '/api/alerts'
} as const;

// Map settings
export const MAP_SETTINGS = {
  DEFAULT_CENTER: { lat: 37.7749, lng: -122.4194 },
  DEFAULT_ZOOM: 12,
  CLUSTER_RADIUS: 50,
  REFRESH_INTERVAL: 30000 // 30 seconds
} as const;

// Refresh intervals (ms)
export const REFRESH_INTERVALS = {
  FAST: 5000,   // 5 seconds
  MEDIUM: 15000, // 15 seconds
  SLOW: 30000,  // 30 seconds
  VERY_SLOW: 60000 // 1 minute
} as const;
