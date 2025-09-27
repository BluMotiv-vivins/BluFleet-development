import React from 'react';

interface BatteryStatusCardProps {
  batteryStatus: any;
  vehicleCount: number;
}

export const BatteryStatusCard: React.FC<BatteryStatusCardProps> = ({ 
  batteryStatus, 
  vehicleCount 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Status</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Average SOC</span>
          <span className="font-semibold">{batteryStatus?.avgBatterySoc || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Vehicles Reporting</span>
          <span className="font-semibold">{batteryStatus?.vehiclesReporting || vehicleCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Low Battery Alerts</span>
          <span className="font-semibold text-orange-600">{batteryStatus?.lowBatteryAlerts || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default BatteryStatusCard;