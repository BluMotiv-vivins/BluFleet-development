import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import { 
  MapIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Geofence {
  id: string;
  name: string;
  type: 'circular' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number;
  coordinates?: { lat: number; lng: number }[];
  alertType: 'entry' | 'exit' | 'both';
  isActive: boolean;
  createdAt: Date;
  triggeredCount: number;
}

const GeoOperations: React.FC = () => {
  const { vehicles } = useSelector((state: RootState) => state.fleet);
  const [geofences, setGeofences] = useState<Geofence[]>([
    {
      id: 'gf-001',
      name: 'Mumbai Depot',
      type: 'circular',
      center: { lat: 19.0760, lng: 72.8777 },
      radius: 500,
      alertType: 'both',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      triggeredCount: 45
    },
    {
      id: 'gf-002',
      name: 'Delhi Service Center',
      type: 'circular',
      center: { lat: 28.6139, lng: 77.2090 },
      radius: 300,
      alertType: 'entry',
      isActive: true,
      createdAt: new Date('2024-01-20'),
      triggeredCount: 23
    },
    {
      id: 'gf-003',
      name: 'Bangalore Warehouse',
      type: 'polygon',
      coordinates: [
        { lat: 12.9716, lng: 77.5946 },
        { lat: 12.9720, lng: 77.5950 },
        { lat: 12.9715, lng: 77.5955 },
        { lat: 12.9710, lng: 77.5950 }
      ],
      alertType: 'exit',
      isActive: false,
      createdAt: new Date('2024-02-01'),
      triggeredCount: 12
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    type: 'circular' as 'circular' | 'polygon',
    center: { lat: 19.0760, lng: 72.8777 },
    radius: 500,
    alertType: 'both' as 'entry' | 'exit' | 'both'
  });

  const geofenceTypes = [
    { value: 'circular', label: 'Circular Zone' },
    { value: 'polygon', label: 'Custom Polygon' }
  ];

  const alertTypes = [
    { value: 'entry', label: 'Entry Alert Only' },
    { value: 'exit', label: 'Exit Alert Only' },
    { value: 'both', label: 'Entry & Exit Alerts' }
  ];

  const handleCreateGeofence = () => {
    const geofence: Geofence = {
      id: `gf-${String(geofences.length + 1).padStart(3, '0')}`,
      name: newGeofence.name,
      type: newGeofence.type,
      center: newGeofence.center,
      radius: newGeofence.radius,
      alertType: newGeofence.alertType,
      isActive: true,
      createdAt: new Date(),
      triggeredCount: 0
    };

    setGeofences([...geofences, geofence]);
    setShowCreateModal(false);
    setNewGeofence({
      name: '',
      type: 'circular',
      center: { lat: 19.0760, lng: 72.8777 },
      radius: 500,
      alertType: 'both'
    });
  };

  // const handleEditGeofence = (geofence: Geofence) => {
  //   setSelectedGeofence(geofence);
  //   setShowEditModal(true);
  // };

  const handleDeleteGeofence = (id: string) => {
    if (confirm('Are you sure you want to delete this geofence?')) {
      setGeofences(geofences.filter(gf => gf.id !== id));
    }
  };

  const toggleGeofenceStatus = (id: string) => {
    setGeofences(geofences.map(gf => 
      gf.id === id ? { ...gf, isActive: !gf.isActive } : gf
    ));
  };

  const getVehiclesInZone = () => {
    // Mock calculation - in real app, this would use actual geospatial calculations
    return Math.floor(Math.random() * 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Geo-Operations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage geofences, routes, and location-based operations</p>
        </div>
        <Button
          variant="primary"
          leftIcon={PlusIcon}
          onClick={() => setShowCreateModal(true)}
        >
          Create Geofence
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Geofences</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{geofences.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{geofences.filter(gf => gf.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.floor(Math.random() * 20) + 5}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPinIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicles Tracked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vehicles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Live Map View</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time vehicle positions and geofence boundaries</p>
        </div>
        <div className="p-6">
          <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <MapIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Interactive Map</p>
              <p className="text-gray-400 dark:text-gray-500">Mapbox GL JS integration will display here</p>
              <p className="text-sm text-gray-400 mt-2">
                • Vehicle locations in real-time<br/>
                • Geofence boundaries<br/>
                • Route optimization<br/>
                • Traffic conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Geofences List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Geofences</h2>
          <p className="text-gray-600 mt-1">Manage your location-based alerts and zones</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicles Inside
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Triggered Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {geofences.map((geofence) => (
                <tr key={geofence.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{geofence.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{geofence.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      geofence.type === 'circular' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {geofence.type === 'circular' ? 'Circular' : 'Polygon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {geofence.alertType === 'both' ? 'Entry & Exit' : 
                     geofence.alertType === 'entry' ? 'Entry Only' : 'Exit Only'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleGeofenceStatus(geofence.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        geofence.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors cursor-pointer`}
                    >
                      {geofence.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getVehiclesInZone()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {geofence.triggeredCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={PencilIcon}
                        onClick={() => {/* handleEditGeofence(geofence) */}}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={TrashIcon}
                        onClick={() => handleDeleteGeofence(geofence.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Geofence Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Geofence"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geofence Name
            </label>
            <Input
              type="text"
              value={newGeofence.name}
              onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
              placeholder="Enter geofence name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geofence Type
            </label>
            <Dropdown
              options={geofenceTypes}
              value={newGeofence.type}
              onSelect={(value) => setNewGeofence({ ...newGeofence, type: value as 'circular' | 'polygon' })}
              placeholder="Select geofence type"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <Input
                type="number"
                value={newGeofence.center.lat}
                onChange={(e) => setNewGeofence({ 
                  ...newGeofence, 
                  center: { ...newGeofence.center, lat: parseFloat(e.target.value) }
                })}
                placeholder="Latitude"
                step="0.000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <Input
                type="number"
                value={newGeofence.center.lng}
                onChange={(e) => setNewGeofence({ 
                  ...newGeofence, 
                  center: { ...newGeofence.center, lng: parseFloat(e.target.value) }
                })}
                placeholder="Longitude"
                step="0.000001"
              />
            </div>
          </div>

          {newGeofence.type === 'circular' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (meters)
              </label>
              <Input
                type="number"
                value={newGeofence.radius}
                onChange={(e) => setNewGeofence({ ...newGeofence, radius: parseInt(e.target.value) })}
                placeholder="Radius in meters"
                min="50"
                max="10000"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type
            </label>
            <Dropdown
              options={alertTypes}
              value={newGeofence.alertType}
              onSelect={(value) => setNewGeofence({ ...newGeofence, alertType: value as 'entry' | 'exit' | 'both' })}
              placeholder="Select alert type"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateGeofence}
              disabled={!newGeofence.name}
            >
              Create Geofence
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal would be similar to Create Modal */}
    </div>
  );
};

export default GeoOperations;