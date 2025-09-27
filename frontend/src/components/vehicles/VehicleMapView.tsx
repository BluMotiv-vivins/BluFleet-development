import React from 'react';
import Icon from '../ui/Icon';

interface Vehicle {
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

interface VehicleMapViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export const VehicleMapView: React.FC<VehicleMapViewProps> = ({
  vehicles,
  onVehicleSelect,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  height = '400px'
}) => {
  // Mock map implementation - in real app would use Google Maps, Mapbox, etc.
  const vehiclesWithLocation = vehicles.filter(v => v.telemetry?.location);

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'charging':
        return 'bg-blue-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBatteryColor = (batteryLevel?: number) => {
    if (!batteryLevel) return 'border-gray-400';
    if (batteryLevel >= 60) return 'border-green-400';
    if (batteryLevel >= 30) return 'border-yellow-400';
    return 'border-red-400';
  };

  // Calculate bounds to center map on vehicles
  const calculateCenter = () => {
    if (vehiclesWithLocation.length === 0) return center;
    
    const lats = vehiclesWithLocation.map(v => v.telemetry!.location!.latitude);
    const lngs = vehiclesWithLocation.map(v => v.telemetry!.location!.longitude);
    
    return {
      lat: lats.reduce((a, b) => a + b, 0) / lats.length,
      lng: lngs.reduce((a, b) => a + b, 0) / lngs.length
    };
  };

  const mapCenter = calculateCenter();

  return (
    <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ height }}>
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Mock roads/streets */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 w-full h-1 bg-gray-300 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute top-2/3 left-0 w-full h-1 bg-gray-300 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute left-1/4 top-0 w-1 h-full bg-gray-300 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute left-3/4 top-0 w-1 h-full bg-gray-300 dark:bg-gray-600 opacity-30"></div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 text-xs">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="map-pin" className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Fleet Map</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {vehiclesWithLocation.length} vehicles with GPS
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Icon name="plus" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Icon name="minus" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-xs">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Charging</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Inactive</span>
          </div>
        </div>
      </div>

      {/* Vehicle Markers */}
      {vehiclesWithLocation.map((vehicle) => {
        const location = vehicle.telemetry!.location!;
        const batteryLevel = vehicle.telemetry?.battery_soc_percentage?.value;
        
        // Mock positioning based on lat/lng - in real app would use proper map projection
        // For demo purposes, use random positioning within the map area
        const randomX = Math.max(5, Math.min(95, Math.random() * 80 + 10));
        const randomY = Math.max(5, Math.min(95, Math.random() * 80 + 10));
        
        return (
          <div
            key={vehicle.vehicle_id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            style={{ 
              left: `${Math.max(5, Math.min(95, Math.random() * 80 + 10))}%`,
              top: `${Math.max(5, Math.min(95, Math.random() * 80 + 10))}%`
            }}
            onClick={() => onVehicleSelect(vehicle)}
          >
            {/* Vehicle Marker */}
            <div className={`relative w-6 h-6 rounded-full border-2 ${getBatteryColor(batteryLevel)} shadow-lg`}>
              <div className={`w-full h-full rounded-full ${getVehicleStatusColor(vehicle.status)}`}></div>
              
              {/* Battery level indicator */}
              {batteryLevel && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold">
                  <span className={`text-xs ${
                    batteryLevel >= 60 ? 'text-green-600' :
                    batteryLevel >= 30 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(batteryLevel / 25)}
                  </span>
                </div>
              )}
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {vehicle.make} {vehicle.model}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                VIN: {vehicle.vin_number}
              </div>
              <div className="mt-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    vehicle.status === 'charging' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                {batteryLevel && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Battery:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(batteryLevel)}%
                    </span>
                  </div>
                )}
                {vehicle.telemetry?.speed_kmh && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(vehicle.telemetry.speed_kmh.value)} km/h
                    </span>
                  </div>
                )}
                {vehicle.driver_name && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Driver:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {vehicle.driver_name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
            </div>
          </div>
        );
      })}

      {/* No GPS Data Message */}
      {vehiclesWithLocation.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <Icon name="map-pin-off" className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              No vehicles with GPS data available
            </div>
          </div>
        </div>
      )}

      {/* Mock location indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow p-2 text-xs">
        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
          <Icon name="map-pin" className="h-3 w-3" />
          <span>San Francisco, CA</span>
        </div>
      </div>
    </div>
  );
};
