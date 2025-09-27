import React from 'react';
import Icon from '../ui/Icon';

interface DriverInfoProps {
  driverName?: string;
}

/**
 * DriverInfo component displays driver assignment information
 */
export const DriverInfo: React.FC<DriverInfoProps> = ({ driverName }) => {
  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      {driverName ? (
        <div data-testid="driver-assignment" className="flex items-center text-sm">
          <Icon name="user" className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
          <span data-testid="driver-name" className="ml-1 font-medium text-gray-900 dark:text-white">
            {driverName}
          </span>
        </div>
      ) : (
        <div data-testid="driver-unassigned" className="flex items-center text-sm text-gray-500 dark:text-gray-500">
          <Icon name="user-x" className="h-4 w-4 mr-2" />
          <span>Unassigned</span>
        </div>
      )}
    </div>
  );
};
