/**
 * Vehicle related types
 */

export interface Vehicle {
  vehicle_id: string;
  vin_number: string;
  make: string;
  model: string;
  year: number;
  battery_capacity_kwh: number;
  max_charging_power_kw: number;
  vehicle_type: string;
  status: string;
  assigned_driver_id?: string;
  driver_name?: string;
  driver_email?: string;
  created_at: string;
  updated_at: string;
  telemetry?: {
    battery_soc_percentage?: { value: number; timestamp: string };
    speed_kmh?: { value: number; timestamp: string };
    power_consumption_kw?: { value: number; timestamp: string };
    estimated_range_km?: { value: number; timestamp: string };
    location?: {
      latitude: number;
      longitude: number;
      altitude?: number;
      timestamp: string;
    };
  };
}

/**
 * Vehicle status types
 */
export type VehicleStatus = 'active' | 'maintenance' | 'inactive' | 'charging';

/**
 * Props for VehicleCard component
 */
export interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: () => void;
  onUpdate: (updateData: Partial<Vehicle>) => void;
  loading?: boolean;
}
