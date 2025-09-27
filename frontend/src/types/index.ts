// Frontend-specific types for BluFleet
// Version: 1.0.0

// Re-export shared types
export * from '../../../shared/types';

// Frontend-specific types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterState {
  [key: string]: any;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DashboardMetrics {
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