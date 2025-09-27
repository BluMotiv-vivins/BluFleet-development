import React, { useState } from 'react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { Card, Button, Badge, Alert, LoadingSpinner } from '../components/common';
import FleetOverviewCard from '../components/dashboard/FleetOverviewCard';
import EnergyMetricsCard from '../components/dashboard/EnergyMetricsCard';
import BatteryStatusCardRefactored from '../components/dashboard/BatteryStatusCardRefactored';
import PerformanceMetricsCard from '../components/dashboard/PerformanceMetricsCard';
import AlertsCard from '../components/dashboard/AlertsCard';
import EnergyTrendsChart from '../components/dashboard/EnergyTrendsChart';
import FleetMapView from '../components/map/FleetMapView';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

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

const DashboardRefactored: React.FC = () => {
  const [timeframe, setTimeframe] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { user } = useAuth();

  const {
    data: dashboardData,
    loading,
    error,
    refresh: refreshData
  } = useAnalyticsData<DashboardData>('/api/v1/analytics/dashboard', {
    timeframe
  }, autoRefresh ? refreshInterval : undefined);

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
        <LoadingSpinner 
          size="lg" 
          variant="primary" 
          text="Loading dashboard data..." 
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-8xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fleet Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user?.firstName || 'Fleet Manager'}! Here's your fleet overview.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
            {/* Timeframe Selector */}
            <div className="inline-flex rounded-md shadow-sm">
              {['24h', '7d', '30d', '90d'].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'primary' : 'outline'}
                  size="sm"
                  className={`${
                    timeframe === tf ? '' : 'bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => handleTimeframeChange(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
            
            {/* Refresh Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
              className="bg-white dark:bg-gray-800"
              startIcon={
                <Icon 
                  name={autoRefresh ? "pause-circle" : "play-circle"} 
                  className="h-4 w-4" 
                />
              }
            >
              {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-white dark:bg-gray-800"
              startIcon={<Icon name="refresh" className="h-4 w-4" />}
            >
              Refresh Now
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
        
        {error && (
          <Alert 
            variant="warning" 
            title="Data Error" 
            className="mt-4"
            dismissible
          >
            There was an error loading the dashboard data. Some information may not be up to date.
          </Alert>
        )}
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fleet Overview */}
        <Card 
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Fleet Overview</h2>
              <Badge variant={dashboardData?.fleet_overview?.active_vehicles && dashboardData.fleet_overview.active_vehicles > 0 ? "success" : "warning"}>
                {dashboardData?.fleet_overview?.active_vehicles || 0} Active
              </Badge>
            </div>
          }
          className="col-span-1"
        >
          {dashboardData ? (
            <FleetOverviewCard 
              fleetData={dashboardData.fleet_overview}
              driverData={dashboardData.driver_overview}
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner size="md" variant="primary" />
            </div>
          )}
        </Card>
        
        {/* Energy Metrics */}
        <Card 
          header={<h2 className="text-lg font-medium text-gray-900 dark:text-white">Energy Consumption</h2>}
          className="col-span-1"
        >
          {dashboardData ? (
            <EnergyMetricsCard 
              operationsData={dashboardData.operations_today} 
              chargingData={dashboardData.charging_overview} 
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner size="md" variant="primary" />
            </div>
          )}
        </Card>
        
        {/* Battery Status */}
        <Card 
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Battery Status</h2>
              {dashboardData?.battery_status?.critical_battery_alerts && dashboardData.battery_status.critical_battery_alerts > 0 && (
                <Badge variant="danger">{dashboardData.battery_status.critical_battery_alerts} Critical</Badge>
              )}
            </div>
          }
          className="col-span-1"
        >
          {dashboardData ? (
            <BatteryStatusCardRefactored status={dashboardData.battery_status} />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner size="md" variant="primary" />
            </div>
          )}
        </Card>
        
        {/* Map */}
        <Card 
          header={<h2 className="text-lg font-medium text-gray-900 dark:text-white">Fleet Location</h2>}
          className="col-span-1 md:col-span-2 lg:col-span-2"
        >
          <div className="h-96">
            <FleetMapView />
          </div>
        </Card>
        
        {/* Alerts */}
        <Card 
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Alerts</h2>
              {dashboardData && (
                <Badge variant="warning">
                  {Object.values(dashboardData.alerts).reduce((sum, val) => sum + val, 0)} Total
                </Badge>
              )}
            </div>
          }
          className="col-span-1"
        >
          {dashboardData ? (
            <AlertsCard 
              alerts={dashboardData.alerts}
              batteryStatus={dashboardData.battery_status} 
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner size="md" variant="primary" />
            </div>
          )}
        </Card>
        
        {/* Energy Trends Chart */}
        <Card 
          header={<h2 className="text-lg font-medium text-gray-900 dark:text-white">Energy Trends</h2>}
          className="col-span-1 md:col-span-2 lg:col-span-2"
        >
          {dashboardData ? (
            <EnergyTrendsChart 
              data={dashboardData.energy_trends.map(item => ({
                hour: item.hour,
                consumptionKwh: item.consumption_kwh
              }))} 
            />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner size="md" variant="primary" />
            </div>
          )}
        </Card>
        
        {/* Performance Metrics */}
        <Card 
          header={<h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance Metrics</h2>}
          className="col-span-1"
        >
          {dashboardData ? (
            <PerformanceMetricsCard 
              metrics={dashboardData.performance_metrics} 
              operationsData={dashboardData.operations_today}
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner size="md" variant="primary" />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardRefactored;
