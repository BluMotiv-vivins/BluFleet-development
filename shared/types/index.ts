// Shared TypeScript Types for BluFleet
// Version: 1.0.0
// Description: Common types used across frontend and backend

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Organization Types
export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  settings: Record<string, any>;
}

// User & Authentication Types
export interface User extends BaseEntity {
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'manager' | 'driver' | 'viewer';

export type Permission = 
  | 'dashboard:read' | 'dashboard:write'
  | 'fleet:read' | 'fleet:write' | 'fleet:delete'
  | 'energy:read' | 'energy:write'
  | 'maintenance:read' | 'maintenance:write'
  | 'safety:read' | 'safety:write'
  | 'analytics:read' | 'analytics:write'
  | 'admin:read' | 'admin:write'
  | '*'; // All permissions

// Fleet Types
export interface Fleet extends BaseEntity {
  organizationId: string;
  name: string;
  description?: string;
  managerId?: string;
  settings: FleetSettings;
  vehicleCount?: number;
}

export interface FleetSettings {
  maxSpeed?: number;
  geofenceAlerts?: boolean;
  maintenanceAlerts?: boolean;
  batteryThresholds?: {
    low: number;
    critical: number;
  };
}

// Vehicle Types
export interface Vehicle extends BaseEntity {
  organizationId: string;
  fleetId?: string;
  vin: string;
  licensePlate?: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  batteryCapacityKwh?: number;
  maxRangeKm?: number;
  status: VehicleStatus;
  currentLocation?: GeoPoint;
  currentBatterySoc?: number;
  currentBatterySoh?: number;
  odometerKm: number;
  lastMaintenanceKm?: number;
  nextMaintenanceKm?: number;
  metadata: Record<string, any>;
}

export type VehicleType = 'sedan' | 'suv' | 'van' | 'truck' | 'bus' | 'motorcycle' | 'hatchback';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'charging' | 'offline';

// Driver Types
export interface Driver extends BaseEntity {
  organizationId: string;
  userId?: string;
  employeeId?: string;
  licenseNumber: string;
  licenseExpiry?: string;
  phone?: string;
  emergencyContact?: EmergencyContact;
  status: DriverStatus;
  performanceScore: number;
  ecoScore: number;
  safetyScore: number;
  totalDistanceKm: number;
  totalTrips: number;
}

export type DriverStatus = 'active' | 'inactive' | 'suspended' | 'on_leave';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Trip Types
export interface Trip extends BaseEntity {
  organizationId: string;
  vehicleId: string;
  driverId?: string;
  startTime: string;
  endTime?: string;
  startLocation?: GeoPoint;
  endLocation?: GeoPoint;
  startBatterySoc?: number;
  endBatterySoc?: number;
  distanceKm?: number;
  energyConsumedKwh?: number;
  efficiencyScore?: number;
  routeData?: RouteData;
  status: TripStatus;
}

export type TripStatus = 'active' | 'completed' | 'cancelled' | 'paused';

export interface RouteData {
  waypoints: GeoPoint[];
  plannedRoute?: GeoPoint[];
  actualRoute?: GeoPoint[];
  deviations?: RouteDeviation[];
}

export interface RouteDeviation {
  timestamp: string;
  location: GeoPoint;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

// Charging Types
export interface ChargingStation extends BaseEntity {
  organizationId: string;
  name: string;
  location: GeoPoint;
  address?: string;
  stationType: ChargingStationType;
  connectorTypes: ConnectorType[];
  maxPowerKw: number;
  costPerKwh?: number;
  status: ChargingStationStatus;
  ocppId?: string;
  metadata: Record<string, any>;
}

export type ChargingStationType = 'ac_level1' | 'ac_level2' | 'dc_fast' | 'dc_ultra_fast';
export type ConnectorType = 'Type1' | 'Type2' | 'CCS' | 'CHAdeMO' | 'Tesla';
export type ChargingStationStatus = 'available' | 'occupied' | 'offline' | 'maintenance' | 'reserved';

export interface ChargingSession extends BaseEntity {
  organizationId: string;
  vehicleId: string;
  chargingStationId: string;
  driverId?: string;
  startTime: string;
  endTime?: string;
  startBatterySoc?: number;
  endBatterySoc?: number;
  energyDeliveredKwh?: number;
  cost?: number;
  status: ChargingSessionStatus;
  ocppTransactionId?: string;
}

export type ChargingSessionStatus = 'active' | 'completed' | 'failed' | 'cancelled';

// Maintenance Types
export interface MaintenanceRecord extends BaseEntity {
  organizationId: string;
  vehicleId: string;
  maintenanceType: MaintenanceType;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  odometerKm?: number;
  cost?: number;
  partsUsed?: MaintenancePart[];
  technicianNotes?: string;
  status: MaintenanceStatus;
}

export type MaintenanceType = 
  | 'routine_service' | 'oil_change' | 'tire_replacement' | 'brake_service'
  | 'battery_check' | 'software_update' | 'body_repair' | 'electrical_repair'
  | 'emergency_repair' | 'inspection';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface MaintenancePart {
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
}

// Alert Types
export interface Alert extends BaseEntity {
  organizationId: string;
  vehicleId?: string;
  driverId?: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  data?: Record<string, any>;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export type AlertType = 
  | 'low_battery' | 'critical_battery' | 'maintenance_due' | 'maintenance_overdue'
  | 'geofence_violation' | 'speed_violation' | 'driver_behavior' | 'vehicle_fault'
  | 'charging_error' | 'security_alert' | 'system_error';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

// Geofence Types
export interface Geofence extends BaseEntity {
  organizationId: string;
  name: string;
  description?: string;
  geometry: GeoPolygon;
  fenceType: GeofenceType;
  settings: GeofenceSettings;
  isActive: boolean;
}

export type GeofenceType = 'allowed' | 'restricted' | 'speed_limit' | 'charging_zone';

export interface GeofenceSettings {
  alertOnEntry?: boolean;
  alertOnExit?: boolean;
  speedLimit?: number;
  timeRestrictions?: TimeRestriction[];
}

export interface TimeRestriction {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

// Geographic Types
export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp?: string;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
}

// Telemetry Types
export interface VehicleTelemetry {
  vehicleId: string;
  timestamp: string;
  location: GeoPoint;
  speed: number;
  heading: number;
  batterySoc: number;
  batterySoh?: number;
  batteryTemperature?: number;
  batteryVoltage?: number;
  batteryCurrent?: number;
  energyConsumption?: number;
  odometerKm: number;
  engineStatus?: string;
  diagnosticCodes?: string[];
  metadata?: Record<string, any>;
}

// Analytics Types
export interface KPIMetrics {
  timestamp: string;
  timeframe: string;
  fleetUtilization: number;
  averageEnergyEfficiency: number;
  totalDistanceKm: number;
  totalEnergyConsumedKwh: number;
  averageBatterySoc: number;
  activeVehicles: number;
  completedTrips: number;
  maintenanceAlerts: number;
  safetyScore: number;
}

export interface EnergyMetrics {
  totalEnergyConsumed: number;
  totalEnergyCharged: number;
  averageEfficiency: number;
  co2Savings: number;
  costSavings: number;
  chargingCost: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  clientId?: string;
}

export interface RealTimeUpdate {
  type: 'vehicle_update' | 'battery_update' | 'location_update' | 'alert' | 'trip_update';
  data: any;
  timestamp: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string;
  wsUrl: string;
  mapboxToken: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    realTimeUpdates: boolean;
    predictiveMaintenance: boolean;
    advancedAnalytics: boolean;
  };
}

// Export all types
export * from './api';
export * from './websocket';