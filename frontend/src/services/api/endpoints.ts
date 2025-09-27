// API Endpoints for BluFleet Frontend
// Version: 1.0.0
// Description: Centralized API endpoint definitions and service functions

import apiClient, { ApiError } from './client';
import {
  User,
  Vehicle,
  Driver,
  Trip,
  Alert,
  ChargingSession,
  MaintenanceRecord,
  Fleet,
  ChargingStation,
  DashboardMetricsResponse,
  EnergyAnalyticsResponse,
  LoginRequest,
  LoginResponse,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleListResponse,
  TripListQuery,
  AlertListQuery,
  PaginatedResponse
} from '../../../../shared/types';

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    apiClient.clearAuthToken();
    localStorage.removeItem('token');
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401);
    }

    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken
    });

    // Update stored tokens
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    apiClient.setAuthToken(response.token);

    return response;
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  }
};

// Fleet Management API
export const fleetApi = {
  getFleets: async (): Promise<Fleet[]> => {
    return apiClient.get<Fleet[]>('/fleets');
  },

  getFleet: async (id: string): Promise<Fleet> => {
    return apiClient.get<Fleet>(`/fleets/${id}`);
  },

  createFleet: async (fleet: Partial<Fleet>): Promise<Fleet> => {
    return apiClient.post<Fleet>('/fleets', fleet);
  },

  updateFleet: async (id: string, updates: Partial<Fleet>): Promise<Fleet> => {
    return apiClient.patch<Fleet>(`/fleets/${id}`, updates);
  },

  deleteFleet: async (id: string): Promise<void> => {
    return apiClient.delete(`/fleets/${id}`);
  }
};

// Vehicle API
export const vehicleApi = {
  getVehicles: async (params?: {
    fleetId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Vehicle>> => {
    return apiClient.getPaginated<Vehicle>(
      '/vehicles',
      params?.page,
      params?.limit,
      {
        fleetId: params?.fleetId,
        status: params?.status
      }
    );
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },

  createVehicle: async (vehicle: CreateVehicleRequest): Promise<Vehicle> => {
    return apiClient.post<Vehicle>('/vehicles', vehicle);
  },

  updateVehicle: async (id: string, updates: UpdateVehicleRequest): Promise<Vehicle> => {
    return apiClient.patch<Vehicle>(`/vehicles/${id}`, updates);
  },

  deleteVehicle: async (id: string): Promise<void> => {
    return apiClient.delete(`/vehicles/${id}`);
  },

  getVehicleTelemetry: async (id: string, timeRange?: string): Promise<any[]> => {
    return apiClient.get<any[]>(`/vehicles/${id}/telemetry`, {
      timeRange
    });
  },

  getVehicleTrips: async (id: string, params?: TripListQuery): Promise<PaginatedResponse<Trip>> => {
    return apiClient.getPaginated<Trip>(
      `/vehicles/${id}/trips`,
      params?.page,
      params?.limit,
      {
        startDate: params?.startDate,
        endDate: params?.endDate,
        status: params?.status
      }
    );
  }
};

// Driver API
export const driverApi = {
  getDrivers: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Driver>> => {
    return apiClient.getPaginated<Driver>(
      '/drivers',
      params?.page,
      params?.limit,
      {
        status: params?.status
      }
    );
  },

  getDriver: async (id: string): Promise<Driver> => {
    return apiClient.get<Driver>(`/drivers/${id}`);
  },

  createDriver: async (driver: Partial<Driver>): Promise<Driver> => {
    return apiClient.post<Driver>('/drivers', driver);
  },

  updateDriver: async (id: string, updates: Partial<Driver>): Promise<Driver> => {
    return apiClient.patch<Driver>(`/drivers/${id}`, updates);
  },

  deleteDriver: async (id: string): Promise<void> => {
    return apiClient.delete(`/drivers/${id}`);
  },

  getDriverTrips: async (id: string, params?: TripListQuery): Promise<PaginatedResponse<Trip>> => {
    return apiClient.getPaginated<Trip>(
      `/drivers/${id}/trips`,
      params?.page,
      params?.limit,
      {
        startDate: params?.startDate,
        endDate: params?.endDate,
        status: params?.status
      }
    );
  },

  getDriverPerformance: async (id: string, timeRange?: string): Promise<any> => {
    return apiClient.get(`/drivers/${id}/performance`, {
      timeRange
    });
  }
};

// Trip API
export const tripApi = {
  getTrips: async (params?: TripListQuery): Promise<PaginatedResponse<Trip>> => {
    return apiClient.getPaginated<Trip>(
      '/trips',
      params?.page,
      params?.limit,
      {
        vehicleId: params?.vehicleId,
        driverId: params?.driverId,
        startDate: params?.startDate,
        endDate: params?.endDate,
        status: params?.status
      }
    );
  },

  getTrip: async (id: string): Promise<Trip> => {
    return apiClient.get<Trip>(`/trips/${id}`);
  },

  startTrip: async (tripData: {
    vehicleId: string;
    driverId?: string;
    startLocation?: { latitude: number; longitude: number };
  }): Promise<Trip> => {
    return apiClient.post<Trip>('/trips', tripData);
  },

  endTrip: async (id: string, endData?: {
    endLocation?: { latitude: number; longitude: number };
    odometerKm?: number;
  }): Promise<Trip> => {
    return apiClient.patch<Trip>(`/trips/${id}/end`, endData);
  },

  updateTrip: async (id: string, updates: Partial<Trip>): Promise<Trip> => {
    return apiClient.patch<Trip>(`/trips/${id}`, updates);
  }
};

// Charging API
export const chargingApi = {
  getChargingStations: async (): Promise<ChargingStation[]> => {
    return apiClient.get<ChargingStation[]>('/charging/stations');
  },

  getChargingStation: async (id: string): Promise<ChargingStation> => {
    return apiClient.get<ChargingStation>(`/charging/stations/${id}`);
  },

  getChargingSessions: async (params?: {
    vehicleId?: string;
    stationId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ChargingSession>> => {
    return apiClient.getPaginated<ChargingSession>(
      '/charging/sessions',
      params?.page,
      params?.limit,
      {
        vehicleId: params?.vehicleId,
        stationId: params?.stationId,
        status: params?.status
      }
    );
  },

  startCharging: async (sessionData: {
    vehicleId: string;
    chargingStationId: string;
    driverId?: string;
  }): Promise<ChargingSession> => {
    return apiClient.post<ChargingSession>('/charging/sessions', sessionData);
  },

  stopCharging: async (sessionId: string): Promise<ChargingSession> => {
    return apiClient.patch<ChargingSession>(`/charging/sessions/${sessionId}/stop`);
  }
};

// Maintenance API
export const maintenanceApi = {
  getMaintenanceRecords: async (params?: {
    vehicleId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MaintenanceRecord>> => {
    return apiClient.getPaginated<MaintenanceRecord>(
      '/maintenance',
      params?.page,
      params?.limit,
      {
        vehicleId: params?.vehicleId,
        status: params?.status
      }
    );
  },

  getMaintenanceRecord: async (id: string): Promise<MaintenanceRecord> => {
    return apiClient.get<MaintenanceRecord>(`/maintenance/${id}`);
  },

  createMaintenanceRecord: async (record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    return apiClient.post<MaintenanceRecord>('/maintenance', record);
  },

  updateMaintenanceRecord: async (id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    return apiClient.patch<MaintenanceRecord>(`/maintenance/${id}`, updates);
  },

  getMaintenanceSchedule: async (): Promise<any> => {
    return apiClient.get('/maintenance/schedule');
  }
};

// Alert API
export const alertApi = {
  getAlerts: async (params?: AlertListQuery): Promise<PaginatedResponse<Alert>> => {
    return apiClient.getPaginated<Alert>(
      '/alerts',
      params?.page,
      params?.limit,
      {
        vehicleId: params?.vehicleId,
        driverId: params?.driverId,
        alertType: params?.alertType,
        severity: params?.severity,
        status: params?.status,
        startDate: params?.startDate,
        endDate: params?.endDate
      }
    );
  },

  getAlert: async (id: string): Promise<Alert> => {
    return apiClient.get<Alert>(`/alerts/${id}`);
  },

  acknowledgeAlert: async (id: string): Promise<Alert> => {
    return apiClient.patch<Alert>(`/alerts/${id}/acknowledge`);
  },

  resolveAlert: async (id: string): Promise<Alert> => {
    return apiClient.patch<Alert>(`/alerts/${id}/resolve`);
  },

  dismissAlert: async (id: string): Promise<Alert> => {
    return apiClient.patch<Alert>(`/alerts/${id}/dismiss`);
  },

  getAlertSummary: async (): Promise<any> => {
    return apiClient.get('/alerts/summary');
  }
};

// Analytics API
export const analyticsApi = {
  getDashboardMetrics: async (timeframe?: string): Promise<DashboardMetricsResponse> => {
    return apiClient.get<DashboardMetricsResponse>('/analytics/dashboard', {
      timeframe
    });
  },

  getEnergyAnalytics: async (timeframe?: string): Promise<EnergyAnalyticsResponse> => {
    return apiClient.get<EnergyAnalyticsResponse>('/analytics/energy', {
      timeframe
    });
  },

  getFleetKPIs: async (timeframe?: string): Promise<any> => {
    return apiClient.get('/analytics/kpis', {
      timeframe
    });
  },

  getPerformanceMetrics: async (timeframe?: string): Promise<any> => {
    return apiClient.get('/analytics/performance', {
      timeframe
    });
  },

  exportData: async (type: string, format: string, filters?: any): Promise<Blob> => {
    return apiClient.downloadFile('/analytics/export', {
      type,
      format,
      ...filters
    });
  }
};

// Health Check API
export const healthApi = {
  getSystemHealth: async (): Promise<any> => {
    return apiClient.get('/health');
  },

  getServiceHealth: async (service: string): Promise<any> => {
    return apiClient.get(`/health/${service}`);
  }
};

// Export all APIs
export default {
  auth: authApi,
  fleet: fleetApi,
  vehicle: vehicleApi,
  driver: driverApi,
  trip: tripApi,
  charging: chargingApi,
  maintenance: maintenanceApi,
  alert: alertApi,
  analytics: analyticsApi,
  health: healthApi
};