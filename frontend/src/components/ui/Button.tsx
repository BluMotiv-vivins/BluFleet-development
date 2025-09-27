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
        return 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-500/50 border border-blue-600 dark:border-blue-700';
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500/50 border border-gray-200 dark:border-gray-700';
      case 'outline':
        return 'border-2 border-blue-600 dark:border-blue-700 bg-transparent text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-700 hover:text-white focus:ring-blue-500/50';
      case 'ghost':
        return 'bg-transparent border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500/50';
      case 'danger':
        return 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500/50 border border-red-600 dark:border-red-700';
      case 'success':
        return 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 focus:ring-green-500/50 border border-green-600 dark:border-green-700';
      case 'warning':
        return 'bg-yellow-600 dark:bg-yellow-700 text-white hover:bg-yellow-700 dark:hover:bg-yellow-800 focus:ring-yellow-500/50 border border-yellow-600 dark:border-yellow-700';
      default:
        return 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-500/50 border border-blue-600 dark:border-blue-700';
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
    inline-flex items-center justify-center rounded-xl font-medium 
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
    select-none touch-manipulation
    whitespace-nowrap
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
      {/* Left icon or loading spinner */}
      {loading ? (
        <LoadingSpinner size={spinnerSize} />
      ) : (
        LeftIcon && <LeftIcon className={`${iconSize} flex-shrink-0`} />
      )}

      {/* Button text */}
      <span className="font-medium">
        {loading && loadingText ? loadingText : children}
      </span>

      {/* Right icon (hidden when loading) */}
      {!loading && RightIcon && (
        <RightIcon className={`${iconSize} flex-shrink-0`} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
