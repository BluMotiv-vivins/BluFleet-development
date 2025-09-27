import React from 'react';
import Icon from '../ui/Icon';

interface VehicleAlertProps {
  type: 'low-battery' | 'maintenance' | 'error';
  message: string;
}

/**
 * VehicleAlert component displays alert notifications in the vehicle card
 */
export const VehicleAlert: React.FC<VehicleAlertProps> = ({ type, message }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'low-battery':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: 'alert-triangle'
        };
      case 'maintenance':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: 'tool'
        };
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: 'alert-circle'
        };
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'info'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className="px-4 pb-4">
      <div 
        data-testid={`${type}-alert`} 
        className={`${styles.container} rounded-md p-2`}
      >
        <div className={`flex items-center ${styles.text} text-xs`}>
          <Icon name={styles.icon} className="h-3 w-3 mr-1" />
          {message}
        </div>
      </div>
    </div>
  );
};
