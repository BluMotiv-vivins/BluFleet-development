import React, { useState } from 'react';
import { useVehicleContext } from '../context/VehicleContext';
import { Vehicle } from '../types/vehicle';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleDetailModal } from '../components/vehicles/VehicleDetailModal';
import { AddVehicleModal } from '../components/vehicles/AddVehicleModal';
import { VehicleFilters } from '../components/vehicles/VehicleFilters';
import { VehicleMapView } from '../components/vehicles/VehicleMapView';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

interface VehicleFilterOptions {
  status?: string;
  vehicle_type?: string;
  search?: string;
  battery_range?: [number, number];
  assigned_driver_id?: string;
}

const VehicleManagement: React.FC = () => {
  // State for UI
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<VehicleFilterOptions>({});
  const [sortBy, setSortBy] = useState<'make' | 'year' | 'battery_soc' | 'status'>('make');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get vehicle data from context
  const { 
    vehicles, 
    isLoading, 
    error, 
    selectedVehicle,
    setSelectedVehicle,
    updateVehicle,
    deleteVehicle,
    refreshVehicles 
  } = useVehicleContext();

  // Filter and sort vehicles
  const filteredVehicles = React.useMemo(() => {
    let filtered = vehicles.filter((vehicle) => {
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
      if (filters.battery_range) {
        const batterySoc = vehicle.telemetry?.battery_soc_percentage?.value;
        if (
          batterySoc === undefined || 
          batterySoc < filters.battery_range[0] || 
          batterySoc > filters.battery_range[1]
        ) {
          return false;
        }
      }
      
      return true;
    });
    
    // Sort vehicles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'make':
          return sortOrder === 'asc' 
            ? a.make.localeCompare(b.make) 
            : b.make.localeCompare(a.make);
            
        case 'year':
          return sortOrder === 'asc' 
            ? a.year - b.year 
            : b.year - a.year;
            
        case 'battery_soc': {
          const aBattery = a.telemetry?.battery_soc_percentage?.value || 0;
          const bBattery = b.telemetry?.battery_soc_percentage?.value || 0;
          return sortOrder === 'asc' ? aBattery - bBattery : bBattery - aBattery;
        }
        
        case 'status':
          return sortOrder === 'asc' 
            ? a.status.localeCompare(b.status) 
            : b.status.localeCompare(a.status);
            
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [vehicles, filters, sortBy, sortOrder]);

  // Handle vehicle selection
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };
  
  // Handle vehicle updates
  const handleUpdateVehicle = async (id: string, updateData: Partial<Vehicle>) => {
    try {
      await updateVehicle(id, updateData);
      // Success notification could be added here
    } catch (error) {
      // Error handling
      console.error('Failed to update vehicle:', error);
    }
  };

  // Loading state
  if (isLoading && vehicles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Vehicles</h3>
          <p className="text-red-600 dark:text-red-300">{error.message}</p>
        </div>
        <Button onClick={refreshVehicles}>
          <Icon name="refresh" className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="flex items-center"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters and view controls */}
      <div className="mb-6">
        <VehicleFilters 
          onFilterChange={setFilters}
          onSortChange={(sortBy, order) => {
            setSortBy(sortBy as any);
            setSortOrder(order);
          }}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        
        <div className="flex justify-between mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredVehicles.length} vehicles found
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="flex items-center"
            >
              <Icon name="grid" className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center"
            >
              <Icon name="list" className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="flex items-center"
            >
              <Icon name="map" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vehicles display based on view mode */}
      {viewMode === 'map' ? (
        <VehicleMapView vehicles={filteredVehicles} onSelectVehicle={handleSelectVehicle} />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        }>
          {filteredVehicles.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Icon name="inbox" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No vehicles found</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Try adjusting your filters or add a new vehicle.
              </p>
            </div>
          ) : (
            filteredVehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.vehicle_id}
                vehicle={vehicle}
                onSelect={() => handleSelectVehicle(vehicle)}
                onUpdate={(updateData) => handleUpdateVehicle(vehicle.vehicle_id, updateData)}
                loading={isLoading}
              />
            ))
          )}
        </div>
      )}

      {/* Vehicle detail modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdate={handleUpdateVehicle}
          onDelete={deleteVehicle}
        />
      )}

      {/* Add vehicle modal */}
      {showAddModal && (
        <AddVehicleModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={(newVehicle) => {
            // Here we would handle adding a new vehicle through the context
            refreshVehicles();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default VehicleManagement;
