import React, { useState } from 'react';
import { useVehicleData, useTelemetryData, useApiMutation } from '../hooks/useAnalyticsData';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleDetailModal } from '../components/vehicles/VehicleDetailModal';
import { AddVehicleModal } from '../components/vehicles/AddVehicleModal';
import { VehicleFilters } from '../components/vehicles/VehicleFilters';
import { VehicleMapView } from '../components/vehicles/VehicleMapView';
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

interface VehicleFilters {
  status?: string;
  vehicle_type?: string;
  search?: string;
  battery_range?: [number, number];
  assigned_driver_id?: string;
}

const VehicleManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [sortBy, setSortBy] = useState<'make' | 'year' | 'battery_soc' | 'status'>('make');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // API hooks
  const {
    data: vehiclesResponse,
    loading: vehiclesLoading,
    error: vehiclesError,
    refresh: refreshVehicles
  } = useVehicleData(undefined, 30000); // Refresh every 30 seconds

  const {
    data: fleetTelemetry,
    loading: telemetryLoading,
    refresh: refreshTelemetry
  } = useTelemetryData(undefined, 'fleet', {}, 15000); // Refresh every 15 seconds

  // Avoid unused variable warning - could use for real-time updates
  console.log('Fleet telemetry data available:', !!fleetTelemetry);

  const { mutate: updateVehicle, loading: updateLoading } = useApiMutation<Vehicle>();
  const { mutate: deleteVehicle, loading: deleteLoading } = useApiMutation<any>();

  // Process vehicles data
  const vehicles = vehiclesResponse?.vehicles || [];
  const pagination = vehiclesResponse?.pagination;

  // Filter and sort vehicles
  const filteredVehicles = React.useMemo(() => {
    let filtered = vehicles.filter((vehicle: Vehicle) => {
      // Status filter
      if (filters.status && vehicle.status !== filters.status) return false;
      
      // Vehicle type filter
      if (filters.vehicle_type && vehicle.vehicle_type !== filters.vehicle_type) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = 
          vehicle.vin_number.toLowerCase().includes(searchLower) ||
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          (vehicle.driver_name && vehicle.driver_name.toLowerCase().includes(searchLower));
        if (!searchMatch) return false;
      }
      
      // Battery range filter
      if (filters.battery_range && vehicle.telemetry?.battery_soc_percentage) {
        const batteryLevel = vehicle.telemetry.battery_soc_percentage.value;
        const [min, max] = filters.battery_range;
        if (batteryLevel < min || batteryLevel > max) return false;
      }
      
      // Driver filter
      if (filters.assigned_driver_id && vehicle.assigned_driver_id !== filters.assigned_driver_id) return false;
      
      return true;
    });

    // Sort vehicles
    filtered.sort((a: Vehicle, b: Vehicle) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'make':
          aValue = `${a.make} ${a.model}`;
          bValue = `${b.make} ${b.model}`;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'battery_soc':
          aValue = a.telemetry?.battery_soc_percentage?.value || 0;
          bValue = b.telemetry?.battery_soc_percentage?.value || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.make;
          bValue = b.make;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [vehicles, filters, sortBy, sortOrder]);

  // Handle vehicle actions
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleVehicleUpdate = async (vehicleId: string, updateData: Partial<Vehicle>) => {
    const result = await updateVehicle(`/api/v1/vehicles/${vehicleId}`, updateData, 'PUT');
    if (result) {
      refreshVehicles();
      setSelectedVehicle(null);
    }
  };

  const handleVehicleDelete = async (vehicleId: string) => {
    const result = await deleteVehicle(`/api/v1/vehicles/${vehicleId}`, undefined, 'DELETE');
    if (result) {
      refreshVehicles();
      setSelectedVehicle(null);
    }
  };

  const handleAddVehicle = () => {
    setShowAddModal(true);
  };

  const handleRefresh = () => {
    refreshVehicles();
    refreshTelemetry();
  };

  // Get summary statistics
  const summaryStats = React.useMemo(() => {
    const stats = {
      total: vehicles.length,
      active: vehicles.filter((v: Vehicle) => v.status === 'active').length,
      maintenance: vehicles.filter((v: Vehicle) => v.status === 'maintenance').length,
      lowBattery: vehicles.filter((v: Vehicle) => 
        v.telemetry?.battery_soc_percentage && v.telemetry.battery_soc_percentage.value < 20
      ).length,
      avgBatteryLevel: vehicles.length > 0 ? 
        vehicles.reduce((sum: number, v: Vehicle) => 
          sum + (v.telemetry?.battery_soc_percentage?.value || 0), 0
        ) / vehicles.length : 0
    };
    return stats;
  }, [vehicles]);

  if (vehiclesLoading && vehicles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehiclesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="alert-triangle" className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to load vehicles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{vehiclesError}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vehicle Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your electric vehicle fleet
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon name="grid" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon name="list" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-gray-600 shadow text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon name="map" className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={vehiclesLoading}
            className="flex items-center space-x-2"
          >
            <Icon name="refresh-cw" className={`h-4 w-4 ${vehiclesLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button onClick={handleAddVehicle} className="flex items-center space-x-2">
            <Icon name="plus" className="h-4 w-4" />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</div>
            </div>
            <Icon name="truck" className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summaryStats.active}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <Icon name="check-circle" className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {summaryStats.maintenance}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Maintenance</div>
            </div>
            <Icon name="tool" className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summaryStats.lowBattery}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Battery</div>
            </div>
            <Icon name="battery-low" className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(summaryStats.avgBatteryLevel)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Battery</div>
            </div>
            <Icon name="battery" className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <VehicleFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        vehicles={vehicles}
      />

      {/* Vehicle Content */}
      {viewMode === 'map' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-96 rounded-lg overflow-hidden">
            <VehicleMapView vehicles={filteredVehicles} onVehicleSelect={handleVehicleSelect} />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
                {telemetryLoading && (
                  <span className="ml-2 inline-flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-1">Updating telemetry...</span>
                  </span>
                )}
              </div>
              
              {pagination && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle: Vehicle) => (
                  <VehicleCard
                    key={vehicle.vehicle_id}
                    vehicle={vehicle}
                    onSelect={() => handleVehicleSelect(vehicle)}
                    onUpdate={(updateData: any) => handleVehicleUpdate(vehicle.vehicle_id, updateData)}
                    loading={updateLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle: Vehicle) => (
                  <div
                    key={vehicle.vehicle_id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => handleVehicleSelect(vehicle)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Icon name="truck" className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          VIN: {vehicle.vin_number} • {vehicle.vehicle_type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {vehicle.telemetry?.battery_soc_percentage && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {Math.round(vehicle.telemetry.battery_soc_percentage.value)}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Battery</div>
                        </div>
                      )}
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : vehicle.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {vehicle.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12">
                <Icon name="search" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No vehicles found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdate={(updateData: any) => handleVehicleUpdate(selectedVehicle.vehicle_id, updateData)}
          onDelete={() => handleVehicleDelete(selectedVehicle.vehicle_id)}
          loading={updateLoading || deleteLoading}
        />
      )}

      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onAdd={(vehicleData: any) => {
            // Handle add vehicle
            console.log('New vehicle added:', vehicleData);
            setShowAddModal(false);
            refreshVehicles();
          }}
        />
      )}
    </div>
  );
};

export default VehicleManagement;
