import React from 'react';
import { VEHICLE_STATUSES } from '../../constants/vehicle';
import type { VehicleStatus } from '../../types/vehicle';

interface StatusBadgeProps {
  status: string;
}

/**
 * StatusBadge component displays a colored badge for vehicle status
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case VEHICLE_STATUSES.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case VEHICLE_STATUSES.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case VEHICLE_STATUSES.INACTIVE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case VEHICLE_STATUSES.CHARGING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case VEHICLE_STATUSES.OUT_OF_SERVICE:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div 
      data-testid="vehicle-status" 
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status}
    </div>
  );
};
