import React from 'react';

export interface NotificationBadgeProps {
  count: number;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md';
  max?: number;
  showZero?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  variant = 'primary',
  size = 'md',
  max = 99,
  showZero = false,
  className = '',
  children,
}) => {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count.toString();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500 text-white';
      case 'danger':
        return 'bg-danger-500 text-white';
      case 'warning':
        return 'bg-warning-500 text-white';
      case 'success':
        return 'bg-success-500 text-white';
      default:
        return 'bg-primary-500 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 text-xs';
      default:
        return 'h-5 w-5 text-xs';
    }
  };

  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  if (children) {
    return (
      <div className={`relative inline-block ${className}`}>
        {children}
        {shouldShow && (
          <span
            className={`absolute -top-1 -right-1 inline-flex items-center justify-center ${sizeClasses} ${variantClasses} font-bold rounded-full ring-2 ring-white`}
            aria-label={`${count} notifications`}
          >
            {displayCount}
          </span>
        )}
      </div>
    );
  }

  if (!shouldShow) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses} ${variantClasses} font-bold rounded-full ${className}`}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;