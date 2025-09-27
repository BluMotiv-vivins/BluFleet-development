import React from 'react';
import { useConnectionStatus } from '../../hooks/useWebSocket';

interface ConnectionStatusProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showText = false,
  size = 'md',
  className = '',
}) => {
  const { statusColor, statusText, isConnected } = useConnectionStatus();

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          rounded-full ${sizeClasses[size]} ${colorClasses[statusColor as keyof typeof colorClasses]}
          ${isConnected ? 'animate-pulse' : ''}
        `}
        title={statusText}
      />
      {showText && (
        <span className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-300`}>
          {statusText}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;