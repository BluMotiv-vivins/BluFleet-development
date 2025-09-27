import React, { memo } from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'green' | 'blue' | 'orange' | 'red';
  icon: React.ComponentType<{ className?: string }> | string | React.ReactElement;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  'aria-describedby'?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend = 'neutral',
  trendValue,
  color,
  icon,
  className = '',
  loading = false,
  onClick,
  'aria-describedby': ariaDescribedBy,
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'border-l-success-500 bg-success-50 hover:bg-success-100 dark:bg-success-900/20 dark:hover:bg-success-900/30';
      case 'blue':
        return 'border-l-primary-500 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30';
      case 'orange':
        return 'border-l-warning-500 bg-warning-50 hover:bg-warning-100 dark:bg-warning-900/20 dark:hover:bg-warning-900/30';
      case 'red':
        return 'border-l-danger-500 bg-danger-50 hover:bg-danger-100 dark:bg-danger-900/20 dark:hover:bg-danger-900/30';
      default:
        return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center space-x-1 text-success-600 dark:text-success-400">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {trendValue && <span className="text-xs sm:text-sm font-medium">{trendValue}</span>}
            <span className="sr-only">Trending up</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center space-x-1 text-danger-600 dark:text-danger-400">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {trendValue && <span className="text-xs sm:text-sm font-medium">{trendValue}</span>}
            <span className="sr-only">Trending down</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {trendValue && <span className="text-xs sm:text-sm font-medium">{trendValue}</span>}
            <span className="sr-only">Neutral trend</span>
          </div>
        );
    }
  };

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <div 
          className="text-lg sm:text-xl lg:text-2xl xl:text-3xl transition-all duration-300" 
          role="img" 
          aria-label={`${title} icon`}
        >
          {icon}
        </div>
      );
    }
    
    if (React.isValidElement(icon)) {
      return (
        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600 dark:text-gray-400 transition-all duration-300">
          {icon}
        </div>
      );
    }
    
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return (
      <IconComponent 
        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600 dark:text-gray-400 
                   transition-all duration-300" 
        aria-hidden="true"
      />
    );
  };

  const cardId = `kpi-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const isInteractive = Boolean(onClick);

  const cardClasses = [
    'card p-3 sm:p-4 lg:p-6 xl:p-8 border-l-4',
    getColorClasses(color),
    'transition-all duration-300 ease-in-out',
    'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    isInteractive ? 'cursor-pointer interactive-hover focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900' : 'hover:shadow-card-hover',
    loading ? 'animate-pulse' : '',
    className
  ].join(' ');

  const CardComponent = isInteractive ? 'button' : 'div';

  return (
    <CardComponent
      className={cardClasses}
      role={isInteractive ? 'button' : 'article'}
      aria-labelledby={`${cardId}-title`}
      aria-describedby={ariaDescribedBy || (subtitle ? `${cardId}-subtitle` : undefined)}
      onClick={onClick}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
        <div className="flex-shrink-0">{renderIcon()}</div>
        <div className="flex-shrink-0">{getTrendIcon(trend)}</div>
      </div>
      
      <div className="space-y-1 sm:space-y-2 lg:space-y-3 text-left">
        <h3 
          id={`${cardId}-title`}
          className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 dark:text-gray-300 
                     uppercase tracking-wide transition-colors duration-300"
        >
          {title}
        </h3>
        
        <div className="flex items-baseline space-x-2">
          {loading ? (
            <div className="loading-skeleton h-6 sm:h-8 lg:h-10 xl:h-12 w-16 sm:w-20 lg:w-24 xl:w-28 rounded" />
          ) : (
            <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold 
                           text-gray-900 dark:text-white break-all transition-all duration-300">
              {value}
            </span>
          )}
        </div>
        
        {subtitle && (
          <p 
            id={`${cardId}-subtitle`}
            className="text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400 
                       leading-relaxed transition-colors duration-300"
          >
            {loading ? (
              <span className="loading-skeleton h-3 sm:h-4 w-24 sm:w-32 lg:w-40 rounded inline-block" />
            ) : (
              subtitle
            )}
          </p>
        )}
      </div>

      {isInteractive && (
        <div className="sr-only">
          Press Enter or Space to view details for {title}
        </div>
      )}
    </CardComponent>
  );
};

export default memo(KPICard);