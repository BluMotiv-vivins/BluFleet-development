import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CircularGauge from '../ui/CircularGauge';
import Button from '../ui/Button';
import { useBatteryData } from '../../hooks/useBatteryData';

interface BatteryPanelProps {
  className?: string;
}

export const BatteryPanel: React.FC<BatteryPanelProps> = ({ className = '' }) => {
  const {
    batteryData,
    chargingQueue,
    powerConsumption,
    nextChargeCountdown,
    isLoading,
    error,
    updateChargingPriority,
    optimizeQueue,
    refreshData,
  } = useBatteryData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading battery data: {error}</p>
          <Button onClick={refreshData} variant="secondary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !batteryData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Battery & Charging Management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor battery levels and manage charging schedules</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Battery Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average Battery Level */}
          <div className="flex flex-col items-center">
            <CircularGauge
              value={batteryData.averageLevel}
              max={100}
              color="green"
              size="lg"
              label="Average Battery"
            />
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{batteryData.averageLevel}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fleet Average</p>
            </div>
          </div>

          {/* Next Scheduled Charge */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Next Scheduled Charge</h3>
            {batteryData.nextChargeVehicle ? (
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">Vehicle: {batteryData.nextChargeVehicle}</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-300 mt-1">{nextChargeCountdown}</p>
              </div>
            ) : (
              <p className="text-sm text-blue-700 dark:text-blue-400">No charges scheduled</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Charging Now</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{batteryData.chargingVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Battery</span>
              <span className="font-medium text-red-600 dark:text-red-400">{batteryData.lowBatteryCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{batteryData.totalCapacity} kWh</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Power Consumption Chart */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">24-Hour Power Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerConsumption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00`}
                  formatter={(value: number, name: string) => [
                    `${value} ${name === 'consumption' ? 'kWh' : '%'}`,
                    name === 'consumption' ? 'Consumption' : 'Efficiency'
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--tw-bg-white, white)',
                    color: 'var(--tw-text-gray-900, #111827)',
                    border: '1px solid var(--tw-border-gray-200, #e5e7eb)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  wrapperStyle={{
                    filter: 'drop-shadow(0 4px 6px -1px rgb(0 0 0 / 0.1))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charging Queue Management */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Charging Queue</h3>
            <Button variant="secondary" size="sm" onClick={optimizeQueue}>
              Optimize Queue
            </Button>
          </div>
          
          {chargingQueue.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No vehicles in charging queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chargingQueue.map((item, index) => (
                <div key={item.vehicleId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.vehicleName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Battery: {item.currentBattery}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Wait: {item.estimatedWaitTime}m</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Charge: {Math.round(item.estimatedChargeTime)}m</p>
                    </div>
                    
                    <select
                      value={item.priority}
                      onChange={(e) => updateChargingPriority(item.vehicleId, e.target.value as 'high' | 'medium' | 'low')}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getPriorityColor(item.priority)}`}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};