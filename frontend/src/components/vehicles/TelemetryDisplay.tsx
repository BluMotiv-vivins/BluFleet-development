import React from 'react';
import { formatDistance, formatPower } from '../../utils/vehicleUtils';

interface TelemetryDisplayProps {
  currentSpeed?: number;
  estimatedRange?: number;
  powerConsumption?: number;
  maxChargingPower: number;
}

/**
 * TelemetryDisplay component shows vehicle telemetry data in a grid format
 */
export const TelemetryDisplay: React.FC<TelemetryDisplayProps> = ({
  currentSpeed,
  estimatedRange,
  powerConsumption,
  maxChargingPower
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">Speed:</span>
        <span data-testid="vehicle-speed" className="font-medium text-gray-900 dark:text-white">
          {currentSpeed ? `${Math.round(currentSpeed)} km/h` : 'N/A'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">Range:</span>
        <span data-testid="vehicle-range" className="font-medium text-gray-900 dark:text-white">
          {formatDistance(estimatedRange)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">Power:</span>
        <span data-testid="power-consumption" className="font-medium text-gray-900 dark:text-white">
          {formatPower(powerConsumption)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">Max Charge:</span>
        <span data-testid="max-charging-power" className="font-medium text-gray-900 dark:text-white">
          {formatPower(maxChargingPower)}
        </span>
      </div>
    </div>
  );
};
