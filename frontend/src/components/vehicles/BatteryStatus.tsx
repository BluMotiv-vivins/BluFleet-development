import React from 'react';
import Icon from '../ui/Icon';
import { getBatteryLevelColor, getBatteryLevelIcon, formatBatteryPercentage } from '../../utils/vehicleUtils';
import { BATTERY_LEVEL } from '../../constants/vehicle';

interface BatteryStatusProps {
  batteryLevel?: number;
  isCharging: boolean;
}

/**
 * BatteryStatus component displays battery level with appropriate color coding
 */
export const BatteryStatus: React.FC<BatteryStatusProps> = ({ 
  batteryLevel, 
  isCharging 
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <Icon 
          data-testid="battery-icon"
          name={getBatteryLevelIcon(batteryLevel)} 
          className={`h-5 w-5 ${getBatteryLevelColor(batteryLevel)}`} 
        />
        <span data-testid="battery-level" className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatBatteryPercentage(batteryLevel)}
        </span>
      </div>
      {isCharging && (
        <div className="flex items-center text-blue-600 text-sm">
          <Icon name="zap" className="h-4 w-4 mr-1" />
          Charging
        </div>
      )}
      
      {/* Battery Progress Bar */}
      {batteryLevel !== undefined && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              batteryLevel >= BATTERY_LEVEL.HIGH ? 'bg-green-500' :
              batteryLevel >= BATTERY_LEVEL.MEDIUM ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }}
          />
        </div>
      )}
    </div>
  );
};
