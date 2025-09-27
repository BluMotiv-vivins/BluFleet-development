import React, { forwardRef } from 'react';

// Samsung-inspired button component with enhanced design
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  fullWidth?: boolean;
  'aria-describedby'?: string;
}

// Samsung-style loading spinner
const LoadingSpinner = ({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
    </div>
  );
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    className = '',
    disabled,
    fullWidth = false,
    'aria-describedby': ariaDescribedBy,
    ...restProps
  } = props;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blu-blue to-primary-600 text-white shadow-samsung-md hover:shadow-samsung-lg hover:from-primary-600 hover:to-blu-dark focus:ring-blu-blue/50 border border-blu-blue/20';
      case 'secondary':
        return 'bg-white/10 backdrop-blur-md border border-white/20 text-blu-white hover:bg-white/20 hover:border-white/30 shadow-samsung-sm hover:shadow-samsung-md focus:ring-blu-blue/50';
      case 'outline':
        return 'border-2 border-blu-blue/50 bg-transparent text-blu-blue hover:bg-blu-blue hover:text-white shadow-samsung-sm hover:shadow-samsung-md hover:border-blu-blue focus:ring-blu-blue/50';
      case 'ghost':
        return 'bg-transparent border-transparent text-text-secondary hover:bg-white/10 hover:text-blu-white focus:ring-blu-blue/50 hover:shadow-samsung-sm';
      case 'danger':
        return 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-samsung-md hover:shadow-samsung-lg hover:from-danger-600 hover:to-danger-700 focus:ring-danger-500/50 border border-danger-500/20';
      case 'success':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-samsung-md hover:shadow-samsung-lg hover:from-success-600 hover:to-success-700 focus:ring-success-500/50 border border-success-500/20';
      case 'warning':
        return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-samsung-md hover:shadow-samsung-lg hover:from-warning-600 hover:to-warning-700 focus:ring-warning-500/50 border border-warning-500/20';
      default:
        return 'bg-gradient-to-r from-blu-blue to-primary-600 text-white shadow-samsung-md hover:shadow-samsung-lg hover:from-primary-600 hover:to-blu-dark focus:ring-blu-blue/50 border border-blu-blue/20';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'h-8 px-3 text-xs gap-1.5';
      case 'sm':
        return 'h-9 px-4 text-sm gap-2';
      case 'lg':
        return 'h-11 px-8 text-base gap-2.5';
      case 'xl':
        return 'h-12 px-10 text-base gap-3';
      default:
        return 'h-10 px-6 text-sm gap-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-2xl font-medium 
    transition-all duration-350 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    relative overflow-hidden group
    active:scale-95 hover:scale-105
    select-none touch-manipulation tracking-tight
    ${fullWidth ? 'w-full' : 'w-auto'}
  `;

  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const iconSize = getIconSize();

  const isDisabled = disabled || loading;
  const spinnerSize = size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'lg' || size === 'xl' ? 'lg' : 'md';

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={ariaDescribedBy}
      {...restProps}
    >
      {/* Samsung-style shimmer effect */}
      <div className="absolute inset-0 bg-gradient-shimmer bg-[length:200%_100%] opacity-0 group-hover:opacity-20 group-hover:animate-shimmer transition-opacity duration-350 ease-smooth rounded-2xl" />
      
      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner size={spinnerSize} />
        ) : (
          LeftIcon && <LeftIcon className={`${iconSize} flex-shrink-0`} />
        )}

        {/* Button text */}
        <span className="font-medium tracking-tight">
          {loading && loadingText ? loadingText : children}
        </span>

        {/* Right icon (hidden when loading) */}
        {!loading && RightIcon && (
          <RightIcon className={`${iconSize} flex-shrink-0`} />
        )}
      </div>

      {/* Samsung-style glow effect for primary variant */}
      {variant === 'primary' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blu-blue/30 to-primary-600/30 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:animate-glow-pulse transition-opacity duration-350 ease-smooth blur-sm" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
