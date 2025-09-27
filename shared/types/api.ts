// API-specific types for BluFleet
// Version: 1.0.0

import { BaseEntity, Vehicle, Driver, Trip, Alert, ChargingSession } from './index';

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Fleet API Types
export interface CreateVehicleRequest {
  vin: string;
  licensePlate?: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  batteryCapacityKwh?: number;
  maxRangeKm?: number;
  fleetId?: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  status?: string;
  currentBatterySoc?: number;
  currentBatterySoh?: number;
  odometerKm?: number;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

// Driver API Types
export interface CreateDriverRequest {
  employeeId?: string;
  licenseNumber: string;
  licenseExpiry?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdateDriverRequest extends Partial<CreateDriverRequest> {
  status?: string;
  performanceScore?: number;
  ecoScore?: number;
  safetyScore?: number;
}

// Trip API Types
export interface StartTripRequest {
  vehicleId: string;
  driverId?: string;
  startLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface EndTripRequest {
  endLocation?: {
    latitude: number;
    longitude: number;
  };
  odometerKm?: number;
}

export interface TripListQuery {
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Analytics API Types
export interface DashboardMetricsResponse {
  timestamp: string;
  timeframe: string;
  fleetOverview: {
    totalVehicles: number;
    activeVehicles: number;
    maintenanceVehicles: number;
    vehicleBreakdown: {
      deliveryVans: number;
      trucks: number;
      passengerVehicles: number;
    };
  };
  driverOverview: {
    totalDrivers: number;
    activeDrivers: number;
  };
  operationsToday: {
    totalTrips: number;
    completedTrips: number;
    activeTrips: number;
    totalDistanceKm: number;
    totalEnergyConsumedKwh: number;
    avgEfficiencyScore: number;
    onTimeDeliveryPercentage: number;
  };
  chargingOverview: {
    activeChargingSessions: number;
    totalEnergyChargedTodayKwh: number;
    avgChargingCost: number;
  };
  batteryStatus: {
    vehiclesReporting: number;
    avgBatterySoc: number;
    lowBatteryAlerts: number;
    criticalBatteryAlerts: number;
  };
  energyTrends: Array<{
    hour: string;
    consumptionKwh: number;
  }>;
  alerts: {
    lowBattery: number;
    criticalBattery: number;
    driverBehavior: number;
    maintenanceDue: number;
  };
  performanceMetrics: {
    fleetUtilization: number;
    avgEnergyEfficiency: number;
    driverBehaviorScore: number;
  };
}

export interface EnergyAnalyticsResponse {
  timestamp: string;
  timeframe: string;
  energyConsumption: {
    total: number;
    byVehicleType: Record<string, number>;
    byTimeOfDay: Array<{
      hour: number;
      consumption: number;
    }>;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  chargingAnalytics: {
    totalSessions: number;
    totalEnergyDelivered: number;
    averageSessionDuration: number;
    peakHours: number[];
    stationUtilization: Array<{
      stationId: string;
      utilizationRate: number;
    }>;
  };
  costAnalysis: {
    totalEnergyCost: number;
    costPerKm: number;
    savingsVsFuel: number;
    projectedMonthlyCost: number;
  };
  sustainability: {
    co2Avoided: number;
    renewableEnergyPercentage: number;
    carbonFootprint: number;
  };
}

// Maintenance API Types
export interface CreateMaintenanceRequest {
  vehicleId: string;
  maintenanceType: string;
  description?: string;
  scheduledDate?: string;
  estimatedCost?: number;
}

export interface UpdateMaintenanceRequest extends Partial<CreateMaintenanceRequest> {
  completedDate?: string;
  actualCost?: number;
  partsUsed?: Array<{
    partNumber: string;
    description: string;
    quantity: number;
    unitCost: number;
  }>;
  technicianNotes?: string;
  status?: string;
}

export interface MaintenanceScheduleResponse {
  upcoming: Array<{
    id: string;
    vehicleId: string;
    vehicleLicensePlate: string;
    maintenanceType: string;
    scheduledDate: string;
    estimatedCost: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  overdue: Array<{
    id: string;
    vehicleId: string;
    vehicleLicensePlate: string;
    maintenanceType: string;
    scheduledDate: string;
    daysPastDue: number;
  }>;
}

// Alert API Types
export interface CreateAlertRequest {
  vehicleId?: string;
  driverId?: string;
  alertType: string;
  severity: string;
  title: string;
  description?: string;
  data?: Record<string, any>;
}

export interface AlertListQuery {
  vehicleId?: string;
  driverId?: string;
  alertType?: string;
  severity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AlertSummaryResponse {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recent: Alert[];
}

// Charging API Types
export interface StartChargingRequest {
  vehicleId: string;
  chargingStationId: string;
  driverId?: string;
}

export interface StopChargingRequest {
  sessionId: string;
}

export interface ChargingStationStatus {
  id: string;
  name: string;
  status: string;
  connectorStatus: Array<{
    connectorId: string;
    type: string;
    status: string;
    currentSession?: {
      vehicleId: string;
      startTime: string;
      energyDelivered: number;
    };
  }>;
}

// Real-time API Types
export interface TelemetryData {
  vehicleId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  speed: number;
  heading: number;
  batterySoc: number;
  batterySoh?: number;
  batteryTemperature?: number;
  energyConsumption?: number;
  odometerKm: number;
  diagnosticCodes?: string[];
}

export interface BulkTelemetryRequest {
  data: TelemetryData[];
}

// Export/Import Types
export interface ExportRequest {
  type: 'vehicles' | 'trips' | 'maintenance' | 'alerts' | 'charging';
  format: 'csv' | 'json' | 'xlsx';
  filters?: Record<string, any>;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface ExportResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  expiresAt: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    messageQueue: 'healthy' | 'unhealthy';
    externalApis: 'healthy' | 'degraded' | 'unhealthy';
  };
  version: string;
  uptime: number;
}

// Error Response Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationError[];
  };
  timestamp: string;
  requestId: string;
}