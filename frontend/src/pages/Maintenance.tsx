import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { getAuthHeaders } from '../utils/auth';

// Maintenance Types
interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  parts?: MaintenancePart[];
}

interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

interface CreateMaintenanceData {
  vehicleId: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  scheduledDate: string;
  assignedTo?: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  notes?: string;
}

interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  status: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string[];
  availability: boolean;
}

interface MaintenanceStats {
  totalRecords: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  overdueCount: number;
  priorityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  averageCompletionTime: number;
  totalCost: number;
  upcomingMaintenance: MaintenanceRecord[];
}

const Maintenance: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState<CreateMaintenanceData>({
    vehicleId: '',
    type: 'scheduled',
    priority: 'medium',
    title: '',
    description: '',
    scheduledDate: '',
    assignedTo: '',
    estimatedCost: 0,
    estimatedDuration: 0,
    notes: ''
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const maintenanceTypes = [
    'scheduled', 'preventive', 'corrective', 'emergency', 
    'inspection', 'battery_service', 'tire_service', 'brake_service', 
    'engine_service', 'software_update'
  ];

  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed', 'pending_parts'];

  // Load data
  useEffect(() => {
    loadRecords();
    loadStats();
    loadVehicles();
    loadTechnicians();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch maintenance records');
      }

      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error loading maintenance records:', error);
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/maintenance/stats/overview', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch maintenance stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading maintenance stats:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/maintenance/data/vehicles', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await fetch('/api/maintenance/data/technicians', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch technicians');
      }

      const data = await response.json();
      setTechnicians(data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const createRecord = async (recordData: CreateMaintenanceData) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create maintenance record');
      }

      const newRecord = await response.json();
      setRecords([newRecord, ...records]);
      setSuccess('Maintenance record created successfully');
      setShowCreateModal(false);
      resetForm();
      loadStats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const updateRecordStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          completedDate: status === 'completed' ? new Date().toISOString() : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const updatedRecord = await response.json();
      setRecords(records.map(record => record.id === id ? updatedRecord : record));
      setSuccess('Status updated successfully');
      loadStats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete maintenance record');
      }

      setRecords(records.filter(record => record.id !== id));
      setSuccess('Maintenance record deleted successfully');
      loadStats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      type: 'scheduled',
      priority: 'medium',
      title: '',
      description: '',
      scheduledDate: '',
      assignedTo: '',
      estimatedCost: 0,
      estimatedDuration: 0,
      notes: ''
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesVehicle = vehicleFilter === 'all' || record.vehicleId === vehicleFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesVehicle;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'pending_parts': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-600">Schedule and track vehicle maintenance activities</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Icon name="Calendar" className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Icon name="Clock" className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Icon name="Play" className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Icon name="AlertTriangle" className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search maintenance..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {formatType(status)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {maintenanceTypes.map(type => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setTypeFilter('all');
                setVehicleFilter('all');
                setSearchTerm('');
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.title}</div>
                      <div className="text-sm text-gray-500">{formatType(record.type)}</div>
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        {record.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.vehicleName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(record.priority)}`}>
                      {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                      {formatType(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(record.scheduledDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.assignedToName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowViewModal(true);
                        }}
                      >
                        <Icon name="Eye" className="w-4 h-4" />
                      </Button>
                      {record.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRecordStatus(record.id, 'in_progress')}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Icon name="Play" className="w-4 h-4" />
                        </Button>
                      )}
                      {record.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRecordStatus(record.id, 'completed')}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Icon name="CheckCircle" className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteRecord(record.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Icon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' || vehicleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by scheduling your first maintenance activity.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Maintenance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Schedule Maintenance</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createRecord(formData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                    <select
                      required
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {maintenanceTypes.map(type => (
                        <option key={type} value={type}>
                          {formatType(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Technician</option>
                      {technicians.filter(t => t.availability).map(technician => (
                        <option key={technician.id} value={technician.id}>
                          {technician.name} - {technician.specialization.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Brief maintenance title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Detailed description of maintenance work"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({...formData, estimatedCost: parseFloat(e.target.value) || 0})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (hours)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({...formData, estimatedDuration: parseFloat(e.target.value) || 0})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Additional notes"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Schedule Maintenance
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Maintenance Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Maintenance Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRecord(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.vehicleName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{formatType(selectedRecord.type)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(selectedRecord.priority)}`}>
                      {selectedRecord.priority.charAt(0).toUpperCase() + selectedRecord.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedRecord.status)}`}>
                      {formatType(selectedRecord.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRecord.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRecord.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.scheduledDate)}</p>
                  </div>
                  {selectedRecord.completedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.completedDate)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRecord.assignedToName || 'Unassigned'}</p>
                </div>
                
                {(selectedRecord.estimatedCost || selectedRecord.actualCost) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRecord.estimatedCost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
                        <p className="mt-1 text-sm text-gray-900">${selectedRecord.estimatedCost.toFixed(2)}</p>
                      </div>
                    )}
                    {selectedRecord.actualCost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Actual Cost</label>
                        <p className="mt-1 text-sm text-gray-900">${selectedRecord.actualCost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {(selectedRecord.estimatedDuration || selectedRecord.actualDuration) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRecord.estimatedDuration && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRecord.estimatedDuration} hours</p>
                      </div>
                    )}
                    {selectedRecord.actualDuration && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Actual Duration</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRecord.actualDuration} hours</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedRecord.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.notes}</p>
                  </div>
                )}
                
                {selectedRecord.parts && selectedRecord.parts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parts Used</label>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedRecord.parts.map((part) => (
                            <tr key={part.id}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {part.name}
                                <div className="text-xs text-gray-500">{part.partNumber}</div>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">{part.quantity}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">${part.totalCost.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(selectedRecord.createdAt)} by {selectedRecord.createdByName}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(selectedRecord.updatedAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRecord(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;