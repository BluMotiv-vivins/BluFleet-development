import React, { useState, useMemo, memo, useCallback } from 'react';
import { useAppSelector } from '../../store';
import type { Vehicle, TableFilters } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Dropdown from '../ui/Dropdown';
import Modal from '../ui/Modal';

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SortIcon = ({ className, direction }: { className?: string; direction?: 'asc' | 'desc' | null }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {direction === 'asc' ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    ) : direction === 'desc' ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    )}
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MonitorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

type SortField = 'id' | 'location' | 'battery' | 'status' | 'type';
type SortDirection = 'asc' | 'desc';

interface VehicleTableProps {
  onVehicleAction?: (vehicleId: string, action: 'view' | 'track' | 'monitor') => void;
}

const VehicleTable: React.FC<VehicleTableProps> = memo(({ onVehicleAction }) => {
  const { vehicles } = useAppSelector((state) => state.fleet);
  
  // State for filtering, sorting, and pagination
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    status: [],
    location: [],
    batteryLevel: { min: 0, max: 100 }
  });
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter options
  const statusOptions = useMemo(() => [
    { value: 'active', label: 'Active' },
    { value: 'charging', label: 'Charging' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' }
  ], []);

  const locationOptions = useMemo(() => {
    const locations = [...new Set(vehicles.map(v => v.location.address).filter(Boolean))];
    return locations.map(location => ({ value: location!, label: location! }));
  }, [vehicles]);

  // Filter and sort vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          vehicle.id.toLowerCase().includes(searchTerm) ||
          vehicle.name.toLowerCase().includes(searchTerm) ||
          vehicle.location.address?.toLowerCase().includes(searchTerm) ||
          vehicle.driver?.name.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(vehicle.status)) return false;
      }

      // Location filter
      if (filters.location && filters.location.length > 0) {
        if (!vehicle.location.address || !filters.location.includes(vehicle.location.address)) return false;
      }

      // Battery level filter
      if (filters.batteryLevel) {
        const { min, max } = filters.batteryLevel;
        if (vehicle.battery.currentLevel < min || vehicle.battery.currentLevel > max) return false;
      }

      return true;
    });

    // Sort vehicles
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'location':
          aValue = a.location.address || '';
          bValue = b.location.address || '';
          break;
        case 'battery':
          aValue = a.battery.currentLevel;
          bValue = b.battery.currentLevel;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vehicles, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredAndSortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
      case 'charging':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300';
      case 'maintenance':
        return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
      case 'offline':
        return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'text-success-600 dark:text-success-400';
    if (level >= 30) return 'text-warning-600 dark:text-warning-400';
    return 'text-danger-600 dark:text-danger-400';
  };

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleVehicleAction = useCallback((vehicle: Vehicle, action: 'view' | 'track' | 'monitor') => {
    if (action === 'view') {
      setSelectedVehicle(vehicle);
    } else if (onVehicleAction) {
      onVehicleAction(vehicle.id, action);
    }
  }, [onVehicleAction]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Vehicle ID', 'Name', 'Type', 'Status', 'Location', 'Battery %', 'Battery Health', 'Driver', 'Last Updated'],
      ...filteredAndSortedVehicles.map(vehicle => [
        vehicle.id,
        vehicle.name,
        vehicle.type,
        vehicle.status,
        vehicle.location.address || 'Unknown',
        vehicle.battery.currentLevel.toString(),
        vehicle.battery.health.toString(),
        vehicle.driver?.name || 'Unassigned',
        vehicle.updatedAt.toISOString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-vehicles-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredAndSortedVehicles]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      location: [],
      batteryLevel: { min: 0, max: 100 }
    });
    setCurrentPage(1);
  }, []);

  return (
    <div className="card rounded-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAndSortedVehicles.length} of {vehicles.length} vehicles
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={FilterIcon}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={DownloadIcon}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Search vehicles, drivers, or locations..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            leftIcon={SearchIcon}
          />

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Dropdown
                label="Status"
                options={statusOptions}
                value={filters.status?.[0] || ''}
                onSelect={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value ? [value] : [] 
                }))}
                placeholder="All statuses"
              />
              
              <Dropdown
                label="Location"
                options={locationOptions}
                value={filters.location?.[0] || ''}
                onSelect={(value) => setFilters(prev => ({ 
                  ...prev, 
                  location: value ? [value] : [] 
                }))}
                placeholder="All locations"
                searchable
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Battery %
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.batteryLevel?.min || 0}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    batteryLevel: {
                      ...prev.batteryLevel!,
                      min: parseInt(e.target.value) || 0
                    }
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Battery %
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.batteryLevel?.max || 100}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    batteryLevel: {
                      ...prev.batteryLevel!,
                      max: parseInt(e.target.value) || 100
                    }
                  }))}
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto rounded-b-xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Vehicle ID</span>
                  <SortIcon 
                    className="w-4 h-4" 
                    direction={sortField === 'id' ? sortDirection : null} 
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  <SortIcon 
                    className="w-4 h-4" 
                    direction={sortField === 'location' ? sortDirection : null} 
                  />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('battery')}
              >
                <div className="flex items-center space-x-1">
                  <span>Battery %</span>
                  <SortIcon 
                    className="w-4 h-4" 
                    direction={sortField === 'battery' ? sortDirection : null} 
                  />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon 
                    className="w-4 h-4" 
                    direction={sortField === 'status' ? sortDirection : null} 
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {vehicle.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {vehicle.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
                    {vehicle.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {vehicle.location.address || 'Unknown Location'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`text-sm font-semibold ${getBatteryColor(vehicle.battery.currentLevel)}`}>
                      {vehicle.battery.currentLevel}%
                    </div>
                    <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({vehicle.battery.health}% health)
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {vehicle.driver?.name || 'Unassigned'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={EyeIcon}
                      onClick={() => handleVehicleAction(vehicle, 'view')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={LocationIcon}
                      onClick={() => handleVehicleAction(vehicle, 'track')}
                    >
                      Track
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={MonitorIcon}
                      onClick={() => handleVehicleAction(vehicle, 'monitor')}
                    >
                      Monitor
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {filteredAndSortedVehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🚛</div>
          <p className="text-gray-500 dark:text-gray-400">
            {vehicles.length === 0 ? 'No vehicles found' : 'No vehicles match your filters'}
          </p>
          {vehicles.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVehicle(null)}
          title={`Vehicle Details - ${selectedVehicle.id}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle ID</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedVehicle.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedVehicle.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{selectedVehicle.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedVehicle.status)}`}>
                  {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {selectedVehicle.location.address || 'Unknown Location'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lat: {selectedVehicle.location.lat.toFixed(6)}, Lng: {selectedVehicle.location.lng.toFixed(6)}
              </p>
            </div>

            {/* Battery Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Battery Information</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Current Level</div>
                  <div className={`text-lg font-semibold ${getBatteryColor(selectedVehicle.battery.currentLevel)}`}>
                    {selectedVehicle.battery.currentLevel}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Health</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedVehicle.battery.health}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Estimated Range</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedVehicle.battery.estimatedRange} mi
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Last charged: {new Date(selectedVehicle.battery.lastCharged).toLocaleString()}
              </p>
            </div>

            {/* Driver Info */}
            {selectedVehicle.driver && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Driver</label>
                <div className="mt-1 flex items-center space-x-3">
                  {selectedVehicle.driver.avatar && (
                    <img
                      src={selectedVehicle.driver.avatar}
                      alt={selectedVehicle.driver.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVehicle.driver.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedVehicle.driver.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Alerts */}
            {selectedVehicle.alerts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Alerts</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedVehicle.alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-gray-900 dark:text-gray-100">{alert.title}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                onClick={() => setSelectedVehicle(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={LocationIcon}
                onClick={() => {
                  handleVehicleAction(selectedVehicle, 'track');
                  setSelectedVehicle(null);
                }}
              >
                Track Vehicle
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
});

VehicleTable.displayName = 'VehicleTable';

export default VehicleTable;