import React from 'react';

interface AlertsCardProps {
  alerts: any;
  batteryStatus: any;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ 
  alerts, 
  batteryStatus 
}) => {
  const totalAlerts = (alerts?.lowBattery || 0) + (alerts?.criticalBattery || 0) + 
                     (alerts?.driverBehavior || 0) + (alerts?.maintenanceDue || 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
          {totalAlerts}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{alerts?.lowBattery || 0}</div>
          <div className="text-sm text-gray-600">Low Battery</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">{alerts?.criticalBattery || 0}</div>
          <div className="text-sm text-gray-600">Critical Battery</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">{alerts?.driverBehavior || 0}</div>
          <div className="text-sm text-gray-600">Driver Behavior</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{alerts?.maintenanceDue || 0}</div>
          <div className="text-sm text-gray-600">Maintenance Due</div>
        </div>
      </div>
    </div>
  );
};

export default AlertsCard;