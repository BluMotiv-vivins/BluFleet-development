import React, { memo, useMemo } from 'react';

export interface CircularGaugeProps {
  value: number;
  max: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  showPercentage?: boolean;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  max,
  color = 'blue',
  size = 'md',
  label,
  className = '',
  showPercentage = true,
}) => {
  const percentage = useMemo(() => 
    Math.min(Math.max((value / max) * 100, 0), 100), 
    [value, max]
  );
  
  const circumference = useMemo(() => 2 * Math.PI * 45, []); // radius = 45
  
  const strokeDashoffset = useMemo(() => 
    circumference - (percentage / 100) * circumference,
    [circumference, percentage]
  );

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return { container: 'w-16 h-16', text: 'text-xs', label: 'text-xs' };
      case 'lg':
        return { container: 'w-32 h-32', text: 'text-xl', label: 'text-sm' };
      default:
        return { container: 'w-24 h-24', text: 'text-sm', label: 'text-xs' };
    }
  }, [size]);

  const colorClass = useMemo(() => {
    switch (color) {
      case 'green':
        return 'stroke-success-500';
      case 'blue':
        return 'stroke-primary-500';
      case 'orange':
        return 'stroke-warning-500';
      case 'red':
        return 'stroke-danger-500';
      default:
        return 'stroke-primary-500';
    }
  }, [color]);

  const labelId = useMemo(() => 
    label ? `gauge-label-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined,
    [label]
  );

  const displayValue = useMemo(() => 
    showPercentage ? `${Math.round(percentage)}%` : value,
    [showPercentage, percentage, value]
  );

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className={`relative ${sizeClasses.container}`}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 100 100"
          role="img"
          aria-labelledby={labelId}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={colorClass}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold text-gray-900 dark:text-white ${sizeClasses.text}`}>
              {displayValue}
            </div>
          </div>
        </div>
      </div>
      
      {label && (
        <div 
          id={labelId}
          className={`text-center text-gray-600 font-medium ${sizeClasses.label}`}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default memo(CircularGauge);