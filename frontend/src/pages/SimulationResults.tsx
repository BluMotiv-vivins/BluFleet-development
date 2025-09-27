import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Icon from '../components/ui/Icon';
import { getAuthHeaders } from '../utils/auth';

// Types for SUMO simulation data
interface SimulationRecord {
  vehicleId: string;
  depart: number;
  arrival: number;
  duration: number;
  routeLength: number;
  waitingTime: number;
  stopTime: number;
  vType: string;
  criticalTurns: number;
}

interface SimulationSummary {
  totalVehicles: number;
  averageDuration: number;
  averageWaitingTime: number;
  totalDistance: number;
  vehicleTypes: Record<string, number>;
  performanceMetrics: {
    efficiency: number;
    throughput: number;
  };
}

interface SimulationFilters {
  vehicleType: string;
  durationRange: {
    min: number;
    max: number;
  };
  distanceRange: {
    min: number;
    max: number;
  };
  waitingTimeRange: {
    min: number;
    max: number;
  };
  criticalTurnsRange: {
    min: number;
    max: number;
  };
}

const SimulationResults: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationRecord[]>([]);
  const [summary, setSummary] = useState<SimulationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize filters based on data ranges
  const [filters, setFilters] = useState<SimulationFilters>({
    vehicleType: 'all',
    durationRange: { min: 0, max: 1000 },
    distanceRange: { min: 0, max: 5000 },
    waitingTimeRange: { min: 0, max: 100 },
    criticalTurnsRange: { min: 0, max: 500 }
  });

  // Apply filters to simulation data
  const applyFilters = (data: SimulationRecord[]): SimulationRecord[] => {
    return data.filter(record => {
      // Vehicle type filter
      if (filters.vehicleType !== 'all' && record.vType !== filters.vehicleType) {
        return false;
      }
      
      // Duration filter
      if (record.duration < filters.durationRange.min || record.duration > filters.durationRange.max) {
        return false;
      }
      
      // Distance filter
      if (record.routeLength < filters.distanceRange.min || record.routeLength > filters.distanceRange.max) {
        return false;
      }
      
      // Waiting time filter
      if (record.waitingTime < filters.waitingTimeRange.min || record.waitingTime > filters.waitingTimeRange.max) {
        return false;
      }
      
      // Critical turns filter
      if (record.criticalTurns < filters.criticalTurnsRange.min || record.criticalTurns > filters.criticalTurnsRange.max) {
        return false;
      }
      
      return true;
    });
  };

  // Update filters ranges when data changes
  useEffect(() => {
    if (simulationData.length > 0) {
      const durations = simulationData.map(r => r.duration);
      const distances = simulationData.map(r => r.routeLength);
      const waitingTimes = simulationData.map(r => r.waitingTime);
      const criticalTurns = simulationData.map(r => r.criticalTurns);
      
      setFilters(prev => ({
        ...prev,
        durationRange: { min: 0, max: Math.max(...durations) + 10 },
        distanceRange: { min: 0, max: Math.max(...distances) + 100 },
        waitingTimeRange: { min: 0, max: Math.max(...waitingTimes) + 5 },
        criticalTurnsRange: { min: 0, max: Math.max(...criticalTurns) + 10 }
      }));
    }
  }, [simulationData]);

  // Load simulation data from S3
  const loadSimulationData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/simulation/data', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const response_data = await response.json();
      setSimulationData(response_data.data?.records || []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load simulation data');
      console.error('Error loading simulation data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load simulation summary
  const loadSimulationSummary = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/simulation/summary', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const response_data = await response.json();
      setSummary(response_data.data || null);
    } catch (err) {
      console.error('Error loading simulation summary:', err);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      loadSimulationData();
      loadSimulationSummary();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Initial load
  useEffect(() => {
    loadSimulationData();
    loadSimulationSummary();
  }, []);

  const handleRefresh = () => {
    loadSimulationData();
    loadSimulationSummary();
  };

  // Filter data by comprehensive filters
  const filteredData = applyFilters(simulationData);

  // Get unique vehicle types
  const vehicleTypes = Array.from(new Set(simulationData.map(record => record.vType)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 rounded-xl mx-6 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-6 rounded-xl">
          {/* Row 1: Title */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SUMO Simulation Results</h1>
          </div>
          
          {/* Row 2: Subtitle and Status Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">Real-time mining fleet traffic simulation analysis and performance metrics</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Last updated: {lastRefresh}</span>
              <span>•</span>
              <span>Data source: S3 blufleet-sumo-sim</span>
              <span>•</span>
              <span>Real-time: {realTimeEnabled ? 'Active' : 'Paused'}</span>
            </div>
          </div>
          
          {/* Row 3: Controls */}
          <div className="flex justify-center gap-2 flex-wrap pb-2">
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <Icon name="search" className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant={realTimeEnabled ? 'primary' : 'outline'}
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className="flex items-center gap-2"
            >
              <Icon name="radio" className="w-4 h-4" />
              <span>{realTimeEnabled ? 'Real-Time ON' : 'Real-Time OFF'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <Icon name="chart" className="w-4 h-4" />
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex">
              <Icon name="warning" className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Data</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center space-y-4">
              <Icon name="refresh" className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Simulation Data...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fetching real-time data from S3 blufleet-sumo-sim</p>
            </div>
          </div>
        )}

        {/* Summary Cards Grid */}
        {summary && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalVehicles}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-2xl">🚛</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Simulated vehicles</p>
            </div>

            {/* Average Duration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.averageDuration?.toFixed(1) || '0.0'}s</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Icon name="clock" className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Trip duration</p>
            </div>

            {/* Total Distance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Distance</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{((summary.totalDistance || 0) / 1000).toFixed(1)} km</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <span className="text-2xl">📏</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total route distance</p>
            </div>

            {/* Efficiency Score */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.performanceMetrics?.efficiency?.toFixed(1) || '0.0'}%</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Icon name="trending" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Overall performance</p>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {summary && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Types Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vehicle Types Distribution</h3>
              <div className="space-y-3">
                {Object.entries(summary.vehicleTypes || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${(count / (summary.totalVehicles || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Throughput</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{summary.performanceMetrics?.throughput?.toFixed(1) || '0.0'} veh/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Waiting Time</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{summary.averageWaitingTime?.toFixed(1) || '0.0'}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Distance</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{((summary.totalDistance || 0) / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Speed</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{(((summary.totalDistance || 0) / (summary.totalVehicles || 1) / (summary.averageDuration || 1) * 3.6) || 0).toFixed(1)} km/h</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Data Table */}
        {showDetails && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Detailed Simulation Data ({filteredData.length} records)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration (s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance (m)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waiting (s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Critical Turns</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.slice(0, 20).map((record, index) => (
                    <tr key={`${record.vehicleId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {record.vehicleId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.vType.includes('empty') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {record.vType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(record.duration || 0).toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(record.routeLength || 0).toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(record.waitingTime || 0).toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.criticalTurns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length > 20 && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center">
                Showing first 20 of {filteredData.length} records
              </div>
            )}
          </div>
        )}

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">S3 Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                !error ? 'bg-green-500 animate-pulse' : 'bg-red-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">S3 Bucket Access</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{!error ? 'Connected' : 'Error'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                realTimeEnabled ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Real-time Updates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{realTimeEnabled ? 'Enabled (30s)' : 'Disabled'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Data Source</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">blufleet-sumo-sim</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Advanced Simulation Filters"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vehicle Types</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Duration (s)
              </label>
              <input
                type="number"
                value={filters.durationRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  durationRange: { ...filters.durationRange, min: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Duration (s)
              </label>
              <input
                type="number"
                value={filters.durationRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  durationRange: { ...filters.durationRange, max: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Distance (m)
              </label>
              <input
                type="number"
                value={filters.distanceRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  distanceRange: { ...filters.distanceRange, min: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance (m)
              </label>
              <input
                type="number"
                value={filters.distanceRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  distanceRange: { ...filters.distanceRange, max: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Waiting Time (s)
              </label>
              <input
                type="number"
                value={filters.waitingTimeRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  waitingTimeRange: { ...filters.waitingTimeRange, min: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Waiting Time (s)
              </label>
              <input
                type="number"
                value={filters.waitingTimeRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  waitingTimeRange: { ...filters.waitingTimeRange, max: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Critical Turns
              </label>
              <input
                type="number"
                value={filters.criticalTurnsRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  criticalTurnsRange: { ...filters.criticalTurnsRange, min: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Critical Turns
              </label>
              <input
                type="number"
                value={filters.criticalTurnsRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  criticalTurnsRange: { ...filters.criticalTurnsRange, max: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  vehicleType: 'all',
                  durationRange: { min: 0, max: 1000 },
                  distanceRange: { min: 0, max: 5000 },
                  waitingTimeRange: { min: 0, max: 100 },
                  criticalTurnsRange: { min: 0, max: 500 }
                });
              }}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SimulationResults;
