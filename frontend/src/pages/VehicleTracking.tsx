import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicleData, useTelemetryData } from '../hooks/useAnalyticsData';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

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

interface TelemetryReading {
  timestamp: string;
  battery_soc_percentage?: number;
  speed_kmh?: number;
  power_consumption_kw?: number;
  estimated_range_km?: number;
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
}

const VehicleTracking: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryReading[]>([]);

  // Get vehicle data
  const {
    data: vehicleData,
    loading: vehicleLoading,
    error: vehicleError,
    refresh: refreshVehicle
  } = useVehicleData(vehicleId, autoRefresh ? 10000 : 0);

  // Get real-time telemetry
  const {
    data: telemetryData,
    loading: telemetryLoading,
    refresh: refreshTelemetry
  } = useTelemetryData(vehicleId, 'latest', {}, autoRefresh ? 5000 : 0);

  // Log telemetry data for debugging
  console.log('Real-time telemetry:', telemetryData);

  const vehicle: Vehicle | null = vehicleData?.vehicle || null;

  // Generate mock historical data for demonstration
  useEffect(() => {
    if (!vehicle) return;

    const generateMockHistory = () => {
      const now = new Date();
      const history: TelemetryReading[] = [];
      const intervals = timeRange === '1h' ? 60 : timeRange === '6h' ? 360 : timeRange === '24h' ? 1440 : 10080;
      const stepMinutes = timeRange === '1h' ? 1 : timeRange === '6h' ? 1 : timeRange === '24h' ? 1 : 1;

      for (let i = intervals; i >= 0; i -= stepMinutes) {
        const timestamp = new Date(now.getTime() - i * 60000).toISOString();
        const batteryBase = vehicle.telemetry?.battery_soc_percentage?.value || 75;
        const speedBase = vehicle.telemetry?.speed_kmh?.value || 45;
        
        history.push({
          timestamp,
          battery_soc_percentage: Math.max(0, Math.min(100, batteryBase + (Math.random() - 0.5) * 20)),
          speed_kmh: Math.max(0, speedBase + (Math.random() - 0.5) * 30),
          power_consumption_kw: Math.max(0, 15 + (Math.random() - 0.5) * 10),
          estimated_range_km: Math.max(0, 250 + (Math.random() - 0.5) * 100),
          location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
            altitude: 50 + Math.random() * 100
          }
        });
      }
      
      setTelemetryHistory(history);
    };

    generateMockHistory();
  }, [vehicle, timeRange]);

  if (vehicleLoading && !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="alert-triangle" className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Vehicle not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {vehicleError || 'The requested vehicle could not be found.'}
          </p>
          <Button onClick={() => navigate('/vehicles')}>
            <Icon name="arrow-left" className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  const batteryLevel = vehicle.telemetry?.battery_soc_percentage?.value;
  const currentSpeed = vehicle.telemetry?.speed_kmh?.value || 0;
  const powerConsumption = vehicle.telemetry?.power_consumption_kw?.value || 0;
  const estimatedRange = vehicle.telemetry?.estimated_range_km?.value || 0;

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level >= 60) return 'text-green-500';
    if (level >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'charging':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/vehicles')}
            className="flex items-center space-x-2"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              VIN: {vehicle.vin_number} • Real-time Tracking
            </p>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
            {vehicle.status}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
          </div>

          <Button
            onClick={() => {
              refreshVehicle();
              refreshTelemetry();
            }}
            variant="outline"
            disabled={vehicleLoading || telemetryLoading}
            className="flex items-center space-x-2"
          >
            <Icon name="refresh-cw" className={`h-4 w-4 ${(vehicleLoading || telemetryLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Battery */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {batteryLevel ? `${Math.round(batteryLevel)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Battery Level</div>
            </div>
            <Icon name="battery" className={`h-8 w-8 ${getBatteryColor(batteryLevel)}`} />
          </div>
          {batteryLevel && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  batteryLevel >= 60 ? 'bg-green-500' :
                  batteryLevel >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }}
              />
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Capacity: {vehicle.battery_capacity_kwh} kWh
          </div>
        </div>

        {/* Speed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(currentSpeed)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Speed (km/h)</div>
            </div>
            <Icon name="gauge" className="h-8 w-8 text-blue-600" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentSpeed / 120) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Max: 120 km/h
          </div>
        </div>

        {/* Power Consumption */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {powerConsumption.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Power (kW)</div>
            </div>
            <Icon name="zap" className="h-8 w-8 text-purple-600" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (powerConsumption / 50) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Max Charge: {vehicle.max_charging_power_kw} kW
          </div>
        </div>

        {/* Range */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(estimatedRange)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Range (km)</div>
            </div>
            <Icon name="map-pin" className="h-8 w-8 text-orange-600" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (estimatedRange / 400) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Typical: 300-400 km
          </div>
        </div>
      </div>

      {/* Driver Information */}
      {vehicle.driver_name && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Current Driver
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Icon name="user" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{vehicle.driver_name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{vehicle.driver_email}</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="message-circle" className="h-4 w-4 mr-2" />
              Contact Driver
            </Button>
          </div>
        </div>
      )}

      {/* Location and Route */}
      {vehicle.telemetry?.location && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Current Location
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date(vehicle.telemetry.location.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {vehicle.telemetry.location.latitude.toFixed(6)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Latitude</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {vehicle.telemetry.location.longitude.toFixed(6)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Longitude</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {vehicle.telemetry.location.altitude ? `${Math.round(vehicle.telemetry.location.altitude)} m` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Altitude</div>
            </div>
          </div>

          {/* Mock Map */}
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="map" className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <div className="text-gray-600 dark:text-gray-400">
                Interactive map view would be here
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Integration with Google Maps, Mapbox, or similar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Telemetry History
          </h3>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            {(['1h', '6h', '24h', '7d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="bar-chart-3" className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <div className="text-gray-600 dark:text-gray-400">
              Telemetry charts would be displayed here
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Battery, speed, power consumption over time
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Data points: {telemetryHistory.length} | Range: {timeRange}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Events
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Icon name="info" className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Vehicle started
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(Date.now() - 1800000).toLocaleTimeString()} - Driver authenticated
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Icon name="zap" className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Charging completed
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(Date.now() - 7200000).toLocaleTimeString()} - Battery at 95%
              </div>
            </div>
          </div>
          
          {batteryLevel && batteryLevel < 30 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Icon name="alert-triangle" className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Low battery warning
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Now - Battery level below 30%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleTracking;
