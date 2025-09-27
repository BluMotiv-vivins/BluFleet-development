// API Configuration and Service Layer
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Vehicle {
  vehicle_id: string;
  vin_number: string;
  make: string;
  model: string;
  year: number;
  battery_capacity_kwh: number;
  max_charging_power_kw: number;
  vehicle_type: 'sedan' | 'suv' | 'truck' | 'van';
  status: 'active' | 'charging' | 'maintenance' | 'offline';
  assigned_driver_id?: string;
  driver_name?: string;
  driver_email?: string;
  created_at: string;
  updated_at: string;
  telemetry?: VehicleTelemetry;
}

export interface VehicleTelemetry {
  battery_soc_percentage: { value: number; timestamp: string };
  speed_kmh: { value: number; timestamp: string };
  power_consumption_kw: { value: number; timestamp: string };
  estimated_range_km: { value: number; timestamp: string };
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
    timestamp: string;
  };
}

export interface TelemetryHistory {
  vehicle_id: string;
  timestamp: string;
  battery_soc_percentage: number;
  speed_kmh: number;
  power_consumption_kw: number;
  estimated_range_km: number;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

export interface DashboardData {
  fleet_overview: {
    total_vehicles: number;
    active_vehicles: number;
    charging_vehicles: number;
    maintenance_vehicles: number;
    avg_battery_level: number;
    total_energy_capacity: number;
    current_energy_stored: number;
    energy_utilization: number;
  };
  energy_metrics: {
    total_consumption_today: number;
    avg_efficiency: number;
    charging_sessions_today: number;
    total_range_available: number;
  };
  performance_metrics: {
    avg_speed: number;
    total_distance_today: number;
    uptime: number;
    driver_score: number;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  vehicle_type?: string;
  search?: string;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Vehicle API methods
  async getVehicles(params: PaginationParams = {}): Promise<VehiclesResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.vehicle_type) queryParams.append('vehicle_type', params.vehicle_type);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `/vehicles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<VehiclesResponse>(endpoint);
  }

  async getVehicle(vehicleId: string): Promise<{ vehicle: Vehicle }> {
    return this.request<{ vehicle: Vehicle }>(`/vehicles/${vehicleId}`);
  }

  async createVehicle(vehicleData: Omit<Vehicle, 'vehicle_id' | 'created_at' | 'updated_at'>): Promise<{ vehicle: Vehicle }> {
    return this.request<{ vehicle: Vehicle }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<{ vehicle: Vehicle }> {
    return this.request<{ vehicle: Vehicle }>(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(vehicleId: string): Promise<{ message: string; vehicle: Vehicle }> {
    return this.request<{ message: string; vehicle: Vehicle }>(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }

  // Telemetry API methods
  async ingestTelemetry(vehicleId: string, telemetryData: any): Promise<{ message: string }> {
    return this.request<{ message: string }>('/telemetry/ingest', {
      method: 'POST',
      body: JSON.stringify({ vehicle_id: vehicleId, data: telemetryData }),
    });
  }

  async getLatestTelemetry(vehicleId: string): Promise<{ telemetry: VehicleTelemetry }> {
    return this.request<{ telemetry: VehicleTelemetry }>(`/telemetry/${vehicleId}/latest`);
  }

  async getTelemetryHistory(
    vehicleId: string,
    options: {
      startTime?: string;
      endTime?: string;
      limit?: number;
    } = {}
  ): Promise<{ telemetry: TelemetryHistory[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (options.startTime) queryParams.append('startTime', options.startTime);
    if (options.endTime) queryParams.append('endTime', options.endTime);
    if (options.limit) queryParams.append('limit', options.limit.toString());

    const endpoint = `/telemetry/${vehicleId}/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ telemetry: TelemetryHistory[]; count: number }>(endpoint);
  }

  async getFleetRealtime(): Promise<{
    fleet: Array<{
      vehicle_id: string;
      make: string;
      model: string;
      status: string;
      telemetry: VehicleTelemetry;
    }>;
    timestamp: string;
    total_vehicles: number;
  }> {
    return this.request<{
      fleet: Array<{
        vehicle_id: string;
        make: string;
        model: string;
        status: string;
        telemetry: VehicleTelemetry;
      }>;
      timestamp: string;
      total_vehicles: number;
    }>('/telemetry/fleet/realtime');
  }

  // Analytics API methods
  async getDashboardData(): Promise<DashboardData> {
    return this.request<DashboardData>('/analytics/dashboard');
  }

  async getFleetHealth(): Promise<{
    overall_health_score: number;
    vehicles: Array<{
      vehicle_id: string;
      make: string;
      model: string;
      vin: string;
      battery_health: number;
      last_maintenance: string;
      mileage: number;
      efficiency_score: number;
      status: string;
    }>;
    recommendations: Array<{
      type: string;
      priority: string;
      message: string;
    }>;
    timestamp: string;
  }> {
    return this.request('/analytics/fleet-health');
  }

  async getEnergyEfficiency(): Promise<{
    fleet_avg_efficiency: number;
    total_energy_saved: number;
    cost_savings: number;
    vehicles: Array<{
      vehicle_id: string;
      make: string;
      model: string;
      avg_consumption: number;
      efficiency_rating: number;
      last_7_days: Array<{
        date: string;
        consumption: number;
        distance: number;
      }>;
    }>;
    trends: {
      weekly_improvement: number;
      best_performer: any;
      worst_performer: any;
    };
    timestamp: string;
  }> {
    return this.request('/analytics/energy-efficiency');
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
    vehicles: number;
    telemetryPoints: number;
  }> {
    // Use direct base URL for health check (not /api/v1)
    const url = `${this.baseURL.replace('/api/v1', '')}/health`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing purposes
export { ApiService };
