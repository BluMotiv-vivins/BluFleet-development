import React, { useState, useEffect } from 'react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FleetOverviewCard } from '../components/dashboard/FleetOverviewCard';
import { EnergyMetricsCard } from '../components/dashboard/EnergyMetricsCard';
import { BatteryStatusCard } from '../components/dashboard/BatteryStatusCard';
import { PerformanceMetricsCard } from '../components/dashboard/PerformanceMetricsCard';
import { AlertsCard } from '../components/dashboard/AlertsCard';
import { EnergyTrendsChart } from '../components/dashboard/EnergyTrendsChart';
import { FleetMapView } from '../components/map/FleetMapView';
import Icon from '../components/ui/Icon';

interface DashboardData {
  timestamp: string;
  timeframe: string;
  fleet_overview: {
    total_vehicles: number;
    active_vehicles: number;
    maintenance_vehicles: number;
    vehicle_breakdown: {
      delivery_vans: number;
      trucks: number;
      passenger_vehicles: number;
    };
  };
  driver_overview: {
    total_drivers: number;
    active_drivers: number;
  };
  operations_today: {
    total_trips: number;
    completed_trips: number;
    active_trips: number;
    total_distance_km: number;
    total_energy_consumed_kwh: number;
    avg_efficiency_score: number;
    on_time_delivery_percentage: number;
  };
  charging_overview: {
    active_charging_sessions: number;
    total_energy_charged_today_kwh: number;
    avg_charging_cost: number;
  };
  battery_status: {
    vehicles_reporting: number;
    avg_battery_soc: number;
    low_battery_alerts: number;
    critical_battery_alerts: number;
  };
  energy_trends: Array<{
    hour: string;
    consumption_kwh: number;
  }>;
  alerts: {
    low_battery: number;
    critical_battery: number;
    driver_behavior: number;
    maintenance_due: number;
  };
  performance_metrics: {
    fleet_utilization: number;
    avg_energy_efficiency: number;
    driver_behavior_score: number;
  };
}

const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: dashboardData,
    loading,
    error,
    refresh: refreshData
  } = useAnalyticsData<DashboardData>('/api/v1/analytics/dashboard', {
    timeframe
  }, refreshInterval);

  // Manual refresh handler
  const handleRefresh = () => {
    refreshData();
    setLastRefresh(new Date());
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Timeframe change handler
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="alert-triangle" className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to load dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fleet Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          {/* Auto-refresh Toggle */}
          <button
            onClick={toggleAutoRefresh}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Icon name={autoRefresh ? 'zap' : 'zap-off'} className="h-4 w-4" />
            <span className="text-sm">Auto-refresh</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white 
                     rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Icon name="refresh-cw" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <AlertsCard
        alerts={data.alerts}
        batteryStatus={data.battery_status}
      />

      {/* Fleet Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FleetOverviewCard
          fleetData={data.fleet_overview}
          driverData={data.driver_overview}
        />
        
        <EnergyMetricsCard
          operationsData={data.operations_today}
          chargingData={data.charging_overview}
        />
        
        <BatteryStatusCard
          batteryStatus={data.battery_status}
          vehicleCount={data.fleet_overview.active_vehicles}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetricsCard
          metrics={data.performance_metrics}
          operationsData={data.operations_today}
        />

        {/* Operations Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Operations
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.operations_today.total_trips}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Trips</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.operations_today.completed_trips}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {Math.round(data.operations_today.total_distance_km)}km
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Distance</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(data.operations_today.on_time_delivery_percentage)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">On Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Energy Consumption Trends
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {Math.round(data.operations_today.total_energy_consumed_kwh)} kWh today
          </div>
        </div>
        <EnergyTrendsChart data={data.energy_trends} />
      </div>

      {/* Fleet Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fleet Locations
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.battery_status.vehicles_reporting} vehicles reporting
          </div>
        </div>
        <div className="h-96 rounded-lg overflow-hidden">
          <FleetMapView />
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Real-time data • Last update: {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.fleet_overview.active_vehicles} active vehicles • {data.operations_today.active_trips} active trips
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
