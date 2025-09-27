import React, { useState } from 'react';
// import { useAppSelector } from '../store';
import { BatteryPanel } from '../components/dashboard/BatteryPanel';
import KPICard from '../components/ui/KPICard';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  MapPinIcon, 
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ChargingStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  powerOutput: number;
  connectorTypes: string[];
  currentVehicle?: string;
  queue: string[];
  pricing: {
    rate: number;
    currency: string;
  };
  utilization: number;
  totalSessions: number;
  revenue: number;
}

interface ChargingSession {
  id: string;
  vehicleId: string;
  stationId: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number;
  cost: number;
  status: 'active' | 'completed' | 'interrupted';
}

const EnergyCharging: React.FC = () => {
  // const { vehicles } = useAppSelector((state) => state.fleet);
  const [showAddStation, setShowAddStation] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);

  // Mock charging stations data
  const chargingStations: ChargingStation[] = [
    {
      id: 'CS-001',
      name: 'Main Depot - Fast Charger 1',
      location: {
        lat: 47.6062,
        lng: -122.3321,
        address: '123 Fleet St, Seattle, WA'
      },
      status: 'occupied',
      powerOutput: 150,
      connectorTypes: ['CCS', 'CHAdeMO'],
      currentVehicle: 'EV-001',
      queue: ['EV-003'],
      pricing: { rate: 20, currency: 'INR' },
      utilization: 85,
      totalSessions: 245,
      revenue: 12450
    },
    {
      id: 'CS-002',
      name: 'Main Depot - Fast Charger 2',
      location: {
        lat: 47.6065,
        lng: -122.3325,
        address: '123 Fleet St, Seattle, WA'
      },
      status: 'available',
      powerOutput: 150,
      connectorTypes: ['CCS', 'Type 2'],
      queue: [],
      pricing: { rate: 20, currency: 'INR' },
      utilization: 72,
      totalSessions: 198,
      revenue: 9890
    },
    {
      id: 'CS-003',
      name: 'Warehouse - Level 2 Charger',
      location: {
        lat: 47.6058,
        lng: -122.3315,
        address: '456 Warehouse Ave, Seattle, WA'
      },
      status: 'available',
      powerOutput: 22,
      connectorTypes: ['Type 2'],
      queue: [],
      pricing: { rate: 12, currency: 'INR' },
      utilization: 45,
      totalSessions: 89,
      revenue: 2340
    }
  ];

  // Mock charging sessions
  const chargingSessions: ChargingSession[] = [
    {
      id: 'SESSION-001',
      vehicleId: 'EV-001',
      stationId: 'CS-001',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      energyDelivered: 45.5,
      cost: 11.38,
      status: 'active'
    },
    {
      id: 'SESSION-002',
      vehicleId: 'EV-002',
      stationId: 'CS-002',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      energyDelivered: 62.3,
      cost: 15.58,
      status: 'completed'
    }
  ];

  // Calculate KPIs
  const totalStations = chargingStations.length;
  const availableStations = chargingStations.filter(s => s.status === 'available').length;
  const occupiedStations = chargingStations.filter(s => s.status === 'occupied').length;
  const avgUtilization = chargingStations.reduce((sum, s) => sum + s.utilization, 0) / totalStations;
  const totalRevenue = chargingStations.reduce((sum, s) => sum + s.revenue, 0);
  const activeSessions = chargingSessions.filter(s => s.status === 'active').length;

  const getStatusColor = (status: ChargingStation['status']) => {
    switch (status) {
      case 'available': return 'text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/30';
      case 'occupied': return 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30';
      case 'maintenance': return 'text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30';
      case 'offline': return 'text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diff = end.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Energy & Charging</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage charging infrastructure and energy consumption</p>
        </div>
        <Button
          leftIcon={PlusIcon}
          onClick={() => setShowAddStation(true)}
        >
          Add Charging Station
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Stations"
          value={totalStations}
          subtitle={`${availableStations} Available, ${occupiedStations} Occupied`}
          trend="neutral"
          color="blue"
          icon={<Icon name="lightning" />}
        />
        <KPICard
          title="Average Utilization"
          value={`${avgUtilization.toFixed(1)}%`}
          subtitle="Across all charging stations"
          trend={avgUtilization > 70 ? "up" : "neutral"}
          color={avgUtilization > 70 ? "green" : "orange"}
          icon={<Icon name="chart" />}
        />
        <KPICard
          title="Active Sessions"
          value={activeSessions}
          subtitle="Currently charging vehicles"
          trend="neutral"
          color="green"
          icon="🔌"
        />
        <KPICard
          title="Monthly Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle="From charging services"
          trend="up"
          color="green"
          icon={<Icon name="dollar" />}
        />
      </div>

      {/* Battery Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fleet Battery Overview</h2>
        <BatteryPanel />
      </section>

      {/* Charging Stations */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Charging Stations</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {chargingStations.map((station) => (
                <div
                  key={station.id}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/30 transition-shadow cursor-pointer"
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{station.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {station.location.address}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                      {station.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Power Output:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{station.powerOutput} kW</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{station.utilization}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">₹{station.pricing.rate}/kWh</span>
                    </div>
                    {station.currentVehicle && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current Vehicle:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{station.currentVehicle}</span>
                      </div>
                    )}
                    {station.queue.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Queue:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">{station.queue.length} vehicles</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{station.totalSessions} sessions</span>
                      <span>₹{station.revenue.toLocaleString('en-IN')} revenue</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Active Charging Sessions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Charging Sessions</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Energy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {chargingSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.vehicleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {chargingStations.find(s => s.id === session.stationId)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDuration(session.startTime, session.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {session.energyDelivered.toFixed(1)} kWh
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ₹{session.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        session.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add Station Modal */}
      <Modal
        isOpen={showAddStation}
        onClose={() => setShowAddStation(false)}
        title="Add Charging Station"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Station Name"
            placeholder="Enter station name"
            required
          />
          <Input
            label="Address"
            placeholder="Enter station address"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Power Output (kW)"
              type="number"
              placeholder="150"
              required
            />
            <Input
              label="Rate (₹/kWh)"
              type="number"
              step="0.01"
              placeholder="0.25"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddStation(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowAddStation(false)}>
              Add Station
            </Button>
          </div>
        </div>
      </Modal>

      {/* Station Details Modal */}
      {selectedStation && (
        <Modal
          isOpen={!!selectedStation}
          onClose={() => setSelectedStation(null)}
          title={selectedStation.name}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Station Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStation.status)}`}>
                      {selectedStation.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Power Output:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedStation.powerOutput} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connectors:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedStation.connectorTypes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                    <span className="text-gray-900 dark:text-gray-100">₹{selectedStation.pricing.rate}/kWh</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedStation.utilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Sessions:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedStation.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="text-gray-900 dark:text-gray-100">₹{selectedStation.revenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                leftIcon={CogIcon}
              >
                Configure
              </Button>
              <Button
                leftIcon={ChartBarIcon}
              >
                View Analytics
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EnergyCharging;