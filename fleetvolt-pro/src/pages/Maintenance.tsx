import React, { useState } from 'react';
import { useAppSelector } from '../store';
import KPICard from '../components/ui/KPICard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import { 
  PlusIcon
} from '@heroicons/react/24/outline';

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'scheduled' | 'unscheduled' | 'preventive';
  category: 'battery' | 'brakes' | 'tires' | 'electrical' | 'software' | 'general';
  title: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  technician?: string;
  cost?: number;
  parts?: string[];
  notes?: string;
}

interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  serviceType: string;
  intervalMiles: number;
  intervalDays: number;
  lastServiceMiles: number;
  lastServiceDate: Date;
  nextServiceMiles: number;
  nextServiceDate: Date;
  isOverdue: boolean;
}

const Maintenance: React.FC = () => {
  const { vehicles } = useAppSelector((state) => state.fleet);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock maintenance records
  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'MAINT-001',
      vehicleId: 'EV-001',
      type: 'scheduled',
      category: 'battery',
      title: 'Battery Health Check',
      description: 'Routine battery performance and health assessment',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'medium',
      technician: 'Mike Johnson',
      cost: 12500
    },
    {
      id: 'MAINT-002',
      vehicleId: 'EV-002',
      type: 'unscheduled',
      category: 'brakes',
      title: 'Brake Pad Replacement',
      description: 'Replace worn brake pads - reported squeaking',
      scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedDate: new Date(),
      status: 'completed',
      priority: 'high',
      technician: 'Sarah Wilson',
      cost: 26500,
      parts: ['Brake Pads (Front)', 'Brake Fluid'],
      notes: 'Brake pads were at 15% remaining. Replaced with OEM parts.'
    },
    {
      id: 'MAINT-003',
      vehicleId: 'EV-003',
      type: 'preventive',
      category: 'tires',
      title: 'Tire Rotation & Inspection',
      description: 'Rotate tires and inspect for wear patterns',
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'overdue',
      priority: 'medium',
      technician: 'Alex Chen'
    },
    {
      id: 'MAINT-004',
      vehicleId: 'EV-001',
      type: 'scheduled',
      category: 'software',
      title: 'Software Update',
      description: 'Install latest firmware update v2.1.3',
      scheduledDate: new Date(),
      status: 'in_progress',
      priority: 'low',
      technician: 'David Park',
      cost: 0
    }
  ];

  // Mock maintenance schedules
  const maintenanceSchedules: MaintenanceSchedule[] = [
    {
      id: 'SCHED-001',
      vehicleId: 'EV-001',
      serviceType: 'Battery Health Check',
      intervalMiles: 10000,
      intervalDays: 90,
      lastServiceMiles: 15000,
      lastServiceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextServiceMiles: 25000,
      nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isOverdue: false
    },
    {
      id: 'SCHED-002',
      vehicleId: 'EV-002',
      serviceType: 'Tire Rotation',
      intervalMiles: 7500,
      intervalDays: 180,
      lastServiceMiles: 12000,
      lastServiceDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      nextServiceMiles: 19500,
      nextServiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isOverdue: true
    }
  ];

  // Filter records
  const filteredRecords = maintenanceRecords.filter(record => {
    if (filterStatus !== 'all' && record.status !== filterStatus) return false;
    if (filterPriority !== 'all' && record.priority !== filterPriority) return false;
    return true;
  });

  // Calculate KPIs
  const totalRecords = maintenanceRecords.length;
  const pendingRecords = maintenanceRecords.filter(r => r.status === 'pending').length;
  const overdueRecords = maintenanceRecords.filter(r => r.status === 'overdue').length;
  const completedThisMonth = maintenanceRecords.filter(r => 
    r.status === 'completed' && 
    r.completedDate && 
    r.completedDate.getMonth() === new Date().getMonth()
  ).length;
  const totalCost = maintenanceRecords
    .filter(r => r.cost && r.status === 'completed')
    .reduce((sum, r) => sum + (r.cost || 0), 0);

  const getStatusColor = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: MaintenanceRecord['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-600">Track and manage vehicle maintenance schedules</p>
        </div>
        <Button
          leftIcon={PlusIcon}
          onClick={() => setShowAddMaintenance(true)}
        >
          Schedule Maintenance
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Records"
          value={totalRecords}
          subtitle={`${pendingRecords} pending, ${overdueRecords} overdue`}
          trend="neutral"
          color="blue"
          icon="🔧"
        />
        <KPICard
          title="Overdue Items"
          value={overdueRecords}
          subtitle="Require immediate attention"
          trend={overdueRecords > 0 ? "down" : "neutral"}
          color={overdueRecords > 0 ? "red" : "green"}
          icon="⚠️"
        />
        <KPICard
          title="Completed This Month"
          value={completedThisMonth}
          subtitle="Maintenance tasks finished"
          trend="up"
          color="green"
          icon="✅"
        />
        <KPICard
          title="Monthly Cost"
          value={`₹${totalCost.toLocaleString('en-IN')}`}
          subtitle="Maintenance expenses"
          trend="neutral"
          color="orange"
          icon="💰"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <Dropdown
              options={statusOptions}
              value={filterStatus}
              onSelect={setFilterStatus}
              placeholder="Filter by status"
            />
          </div>
          <div className="min-w-[200px]">
            <Dropdown
              options={priorityOptions}
              value={filterPriority}
              onSelect={setFilterPriority}
              placeholder="Filter by priority"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Records */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Records</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.vehicleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.type === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        record.type === 'unscheduled' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.title}</div>
                        <div className="text-sm text-gray-500">{record.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(record.priority)}`}>
                        {record.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.scheduledDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.cost ? `₹${record.cost.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          View
                        </Button>
                        {record.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Maintenance Schedules */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Schedules</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miles Until Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceSchedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {schedule.vehicleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(schedule.nextServiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.nextServiceMiles - schedule.lastServiceMiles} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        schedule.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {schedule.isOverdue ? 'Overdue' : 'On Schedule'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="primary"
                        size="sm"
                      >
                        Schedule Now
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add Maintenance Modal */}
      <Modal
        isOpen={showAddMaintenance}
        onClose={() => setShowAddMaintenance(false)}
        title="Schedule Maintenance"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle
            </label>
            <Dropdown
              options={vehicles.map(v => ({ value: v.id, label: `${v.id} - ${v.name}` }))}
              value=""
              onSelect={() => {}}
              placeholder="Select vehicle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Type
            </label>
            <Dropdown
              options={[
                { value: 'scheduled', label: 'Scheduled Maintenance' },
                { value: 'unscheduled', label: 'Unscheduled Repair' },
                { value: 'preventive', label: 'Preventive Maintenance' }
              ]}
              value=""
              onSelect={() => {}}
              placeholder="Select type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              type="text"
              placeholder="Enter maintenance title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter maintenance description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <Input
                type="date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Dropdown
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]}
                value=""
                onSelect={() => {}}
                placeholder="Select priority"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddMaintenance(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
            >
              Schedule Maintenance
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Record Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={`Maintenance Record - ${selectedRecord.id}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.vehicleId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedRecord.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedRecord.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                  {selectedRecord.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRecord.priority)}`}>
                  {selectedRecord.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.scheduledDate)}</p>
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

            {selectedRecord.technician && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Technician</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.technician}</p>
              </div>
            )}

            {selectedRecord.cost && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <p className="mt-1 text-sm text-gray-900">₹{selectedRecord.cost.toLocaleString('en-IN')}</p>
              </div>
            )}

            {selectedRecord.parts && selectedRecord.parts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Parts Used</label>
                <ul className="mt-1 text-sm text-gray-900">
                  {selectedRecord.parts.map((part, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      {part}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedRecord.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.notes}</p>
              </div>
            )}

            {selectedRecord.completedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Completed Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.completedDate)}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Maintenance;