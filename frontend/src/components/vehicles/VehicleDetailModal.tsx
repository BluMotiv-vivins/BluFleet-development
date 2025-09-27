import React, { useState, useEffect } from 'react';
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

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (updateData: Partial<Vehicle>) => void;
  onDelete: () => void;
  loading?: boolean;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onUpdate,
  onDelete,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'telemetry' | 'maintenance' | 'edit'>('details');
  const [editData, setEditData] = useState<Partial<Vehicle>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      battery_capacity_kwh: vehicle.battery_capacity_kwh,
      max_charging_power_kw: vehicle.max_charging_power_kw,
      vehicle_type: vehicle.vehicle_type,
      status: vehicle.status,
      assigned_driver_id: vehicle.assigned_driver_id
    });
  }, [vehicle]);

  const handleSave = () => {
    onUpdate(editData);
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getBatteryIcon = (batteryLevel?: number) => {
    if (!batteryLevel) return 'battery';
    if (batteryLevel >= 80) return 'battery';
    if (batteryLevel >= 60) return 'battery';
    if (batteryLevel >= 40) return 'battery';
    if (batteryLevel >= 20) return 'battery-low';
    return 'battery-low';
  };

  const getBatteryColor = (batteryLevel?: number) => {
    if (!batteryLevel) return 'text-gray-400';
    if (batteryLevel >= 60) return 'text-green-500';
    if (batteryLevel >= 30) return 'text-yellow-500';
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

  const batteryLevel = vehicle.telemetry?.battery_soc_percentage?.value;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Icon name="truck" className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  VIN: {vehicle.vin_number} • {vehicle.vehicle_type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </div>
              <Button variant="outline" onClick={onClose}>
                <Icon name="x" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', label: 'Details', icon: 'info' },
                { id: 'telemetry', label: 'Live Data', icon: 'activity' },
                { id: 'maintenance', label: 'Maintenance', icon: 'tool' },
                { id: 'edit', label: 'Edit', icon: 'edit' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon name={tab.icon as any} className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Vehicle Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Make & Model:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Year:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">VIN:</span>
                        <span className="font-medium text-gray-900 dark:text-white font-mono">{vehicle.vin_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.vehicle_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatTimestamp(vehicle.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Battery Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Battery Capacity:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.battery_capacity_kwh} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Max Charging Power:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.max_charging_power_kw} kW</span>
                      </div>
                      {batteryLevel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current Battery:</span>
                          <div className="flex items-center space-x-2">
                            <Icon 
                              name={getBatteryIcon(batteryLevel)} 
                              className={`h-4 w-4 ${getBatteryColor(batteryLevel)}`} 
                            />
                            <span className="font-medium text-gray-900 dark:text-white">{Math.round(batteryLevel)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Driver Assignment</h4>
                  {vehicle.driver_name ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon name="user" className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{vehicle.driver_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{vehicle.driver_email}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="edit" className="h-3 w-3 mr-1" />
                        Change Driver
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon name="user-x" className="h-5 w-5 text-gray-400" />
                        <div className="text-gray-600 dark:text-gray-400">No driver assigned</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="user-plus" className="h-3 w-3 mr-1" />
                        Assign Driver
                      </Button>
                    </div>
                  )}
                </div>

                {/* Current Location */}
                {vehicle.telemetry?.location && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Location</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                        <span className="font-medium text-gray-900 dark:text-white font-mono">
                          {vehicle.telemetry.location.latitude.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                        <span className="font-medium text-gray-900 dark:text-white font-mono">
                          {vehicle.telemetry.location.longitude.toFixed(6)}
                        </span>
                      </div>
                      {vehicle.telemetry.location.altitude && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Altitude:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {Math.round(vehicle.telemetry.location.altitude)} m
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatTimestamp(vehicle.telemetry.location.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div className="space-y-6">
                {/* Real-time Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {batteryLevel ? `${Math.round(batteryLevel)}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Battery Level</div>
                      </div>
                      <Icon name={getBatteryIcon(batteryLevel)} className={`h-8 w-8 ${getBatteryColor(batteryLevel)}`} />
                    </div>
                    {batteryLevel && (
                      <div className="mt-2">
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {vehicle.telemetry?.speed_kmh ? `${Math.round(vehicle.telemetry.speed_kmh.value)}` : '0'}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Speed (km/h)</div>
                      </div>
                      <Icon name="gauge" className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {vehicle.telemetry?.power_consumption_kw ? vehicle.telemetry.power_consumption_kw.value.toFixed(1) : '0.0'}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">Power (kW)</div>
                      </div>
                      <Icon name="zap" className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          {vehicle.telemetry?.estimated_range_km ? Math.round(vehicle.telemetry.estimated_range_km.value) : 'N/A'}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Range (km)</div>
                      </div>
                      <Icon name="map-pin" className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Telemetry Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Telemetry Data</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Metric</th>
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Value</th>
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {vehicle.telemetry?.battery_soc_percentage && (
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 text-gray-900 dark:text-white">Battery SOC</td>
                            <td className="py-2 text-gray-900 dark:text-white font-medium">
                              {Math.round(vehicle.telemetry.battery_soc_percentage.value)}%
                            </td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">
                              {formatTimestamp(vehicle.telemetry.battery_soc_percentage.timestamp)}
                            </td>
                          </tr>
                        )}
                        {vehicle.telemetry?.speed_kmh && (
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 text-gray-900 dark:text-white">Speed</td>
                            <td className="py-2 text-gray-900 dark:text-white font-medium">
                              {Math.round(vehicle.telemetry.speed_kmh.value)} km/h
                            </td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">
                              {formatTimestamp(vehicle.telemetry.speed_kmh.timestamp)}
                            </td>
                          </tr>
                        )}
                        {vehicle.telemetry?.power_consumption_kw && (
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 text-gray-900 dark:text-white">Power Consumption</td>
                            <td className="py-2 text-gray-900 dark:text-white font-medium">
                              {vehicle.telemetry.power_consumption_kw.value.toFixed(1)} kW
                            </td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">
                              {formatTimestamp(vehicle.telemetry.power_consumption_kw.timestamp)}
                            </td>
                          </tr>
                        )}
                        {vehicle.telemetry?.estimated_range_km && (
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 text-gray-900 dark:text-white">Estimated Range</td>
                            <td className="py-2 text-gray-900 dark:text-white font-medium">
                              {Math.round(vehicle.telemetry.estimated_range_km.value)} km
                            </td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">
                              {formatTimestamp(vehicle.telemetry.estimated_range_km.timestamp)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Icon name="tool" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Maintenance Records
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Maintenance tracking feature coming soon
                  </p>
                  <Button variant="outline">
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Make
                    </label>
                    <input
                      type="text"
                      value={editData.make || ''}
                      onChange={(e) => setEditData({ ...editData, make: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={editData.model || ''}
                      onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={editData.year || ''}
                      onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={editData.status || ''}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="charging">Charging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Battery Capacity (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editData.battery_capacity_kwh || ''}
                      onChange={(e) => setEditData({ ...editData, battery_capacity_kwh: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Charging Power (kW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editData.max_charging_power_kw || ''}
                      onChange={(e) => setEditData({ ...editData, max_charging_power_kw: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={editData.vehicle_type || ''}
                      onChange={(e) => setEditData({ ...editData, vehicle_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="bus">Bus</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    <Icon name="trash-2" className="h-4 w-4 mr-2" />
                    Delete Vehicle
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setActiveTab('details')}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? (
                        <Icon name="loader" className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Icon name="save" className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <div className="flex items-center mb-4">
                <Icon name="alert-triangle" className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete Vehicle
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this vehicle? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <Icon name="loader" className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Icon name="trash-2" className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
