import React from 'react';
import { Badge } from '../common';

export interface BatteryStatusProps {
  vehicles_reporting: number;
  avg_battery_soc: number;
  low_battery_alerts: number;
  critical_battery_alerts: number;
}

const BatteryStatusCardRefactored: React.FC<{ status: BatteryStatusProps }> = ({ status }) => {
  const getBatteryLevelColor = (level: number) => {
    if (level <= 20) return 'bg-red-500';
    if (level <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">Average Battery Level</div>
        <div className="text-xl font-semibold">{status.avg_battery_soc.toFixed(0)}%</div>
      </div>
      
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getBatteryLevelColor(status.avg_battery_soc)}`} 
          style={{ width: `${status.avg_battery_soc}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Reporting Vehicles</div>
          <div className="text-xl font-semibold">{status.vehicles_reporting}</div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Battery Alerts</div>
          <div className="flex items-center space-x-2">
            <div className="text-xl font-semibold">
              {status.low_battery_alerts + status.critical_battery_alerts}
            </div>
            
            {status.critical_battery_alerts > 0 && (
              <Badge variant="danger" size="sm">
                {status.critical_battery_alerts} Critical
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryStatusCardRefactored;
