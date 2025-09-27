import React, { useState } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

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

interface VehicleFiltersProps {
  filters: {
    status?: string;
    vehicle_type?: string;
    search?: string;
    battery_range?: [number, number];
    assigned_driver_id?: string;
  };
  onFiltersChange: (filters: any) => void;
  sortBy: 'make' | 'year' | 'battery_soc' | 'status';
  onSortChange: (sortBy: 'make' | 'year' | 'battery_soc' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  vehicles: Vehicle[];
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  vehicles
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get unique values for filter options
  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.vehicle_type))).filter(Boolean);
  const statuses = Array.from(new Set(vehicles.map(v => v.status))).filter(Boolean);
  const drivers = Array.from(new Set(
    vehicles.filter(v => v.driver_name).map(v => ({ 
      id: v.assigned_driver_id!, 
      name: v.driver_name! 
    }))
  ));

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  const handleRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      battery_range: min === 0 && max === 100 ? undefined : [min, max]
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== undefined);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Filters & Sorting
          </h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <Icon name="x" className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs"
            >
              <Icon name={showAdvanced ? 'chevron-up' : 'chevron-down'} className="h-3 w-3 mr-1" />
              Advanced
            </Button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="VIN, make, model, driver..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle Type
            </label>
            <select
              value={filters.vehicle_type || ''}
              onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">All Types</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="make">Make/Model</option>
                <option value="year">Year</option>
                <option value="battery_soc">Battery Level</option>
                <option value="status">Status</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2"
              >
                <Icon name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Battery Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Battery Level Range
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.battery_range?.[0] || 0}
                      onChange={(e) => handleRangeChange(
                        parseInt(e.target.value), 
                        filters.battery_range?.[1] || 100
                      )}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {filters.battery_range?.[0] || 0}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.battery_range?.[1] || 100}
                      onChange={(e) => handleRangeChange(
                        filters.battery_range?.[0] || 0, 
                        parseInt(e.target.value)
                      )}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {filters.battery_range?.[1] || 100}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {filters.battery_range?.[0] || 0}% - {filters.battery_range?.[1] || 100}%
                  </div>
                </div>
              </div>

              {/* Assigned Driver */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Driver
                </label>
                <select
                  value={filters.assigned_driver_id || ''}
                  onChange={(e) => handleFilterChange('assigned_driver_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Drivers</option>
                  <option value="unassigned">Unassigned</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('status', 'active')}
                    className={`text-xs ${filters.status === 'active' ? 'bg-green-100 border-green-300 text-green-800' : ''}`}
                  >
                    <Icon name="check-circle" className="h-3 w-3 mr-1" />
                    Active Only
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRangeChange(0, 20)}
                    className={`text-xs ${filters.battery_range?.[1] === 20 ? 'bg-red-100 border-red-300 text-red-800' : ''}`}
                  >
                    <Icon name="battery-low" className="h-3 w-3 mr-1" />
                    Low Battery
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('assigned_driver_id', 'unassigned')}
                    className={`text-xs ${filters.assigned_driver_id === 'unassigned' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : ''}`}
                  >
                    <Icon name="user-x" className="h-3 w-3 mr-1" />
                    Unassigned
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('status', 'maintenance')}
                    className={`text-xs ${filters.status === 'maintenance' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : ''}`}
                  >
                    <Icon name="tool" className="h-3 w-3 mr-1" />
                    Maintenance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            
            {filters.search && (
              <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                <Icon name="search" className="h-3 w-3 mr-1" />
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.status && (
              <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:text-green-600"
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.vehicle_type && (
              <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-xs">
                Type: {filters.vehicle_type}
                <button
                  onClick={() => handleFilterChange('vehicle_type', '')}
                  className="ml-1 hover:text-purple-600"
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.battery_range && (
              <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs">
                Battery: {filters.battery_range[0]}%-{filters.battery_range[1]}%
                <button
                  onClick={() => handleFilterChange('battery_range', undefined)}
                  className="ml-1 hover:text-yellow-600"
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.assigned_driver_id && (
              <div className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded text-xs">
                Driver: {filters.assigned_driver_id === 'unassigned' ? 'Unassigned' : 
                  drivers.find(d => d.id === filters.assigned_driver_id)?.name || 'Unknown'}
                <button
                  onClick={() => handleFilterChange('assigned_driver_id', '')}
                  className="ml-1 hover:text-indigo-600"
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
