/**
 * LoadingSpinner Component
 * A reusable spinner for loading states
 */
import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'light' | 'dark' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Spinner color variant */
  variant?: SpinnerVariant;
  /** Optional text to display alongside spinner */
  text?: string;
  /** Whether to center the spinner in its container */
  centered?: boolean;
  /** Whether to show the spinner in a full-page overlay */
  fullScreen?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Additional props */
  [x: string]: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  centered = false,
  fullScreen = false,
  className = '',
  ...rest
}) => {
  // Determine size classes
  let sizeClasses = '';
  switch (size) {
    case 'xs':
      sizeClasses = 'h-4 w-4';
      break;
    case 'sm':
      sizeClasses = 'h-6 w-6';
      break;
    case 'lg':
      sizeClasses = 'h-10 w-10';
      break;
    case 'xl':
      sizeClasses = 'h-12 w-12';
      break;
    default: // md
      sizeClasses = 'h-8 w-8';
  }
  
  // Determine color classes
  let colorClass = '';
  switch (variant) {
    case 'light':
      colorClass = 'text-white';
      break;
    case 'dark':
      colorClass = 'text-gray-800';
      break;
    case 'secondary':
      colorClass = 'text-gray-600';
      break;
    case 'success':
      colorClass = 'text-green-600';
      break;
    case 'warning':
      colorClass = 'text-yellow-600';
      break;
    case 'danger':
      colorClass = 'text-red-600';
      break;
    default: // primary
      colorClass = 'text-blue-600';
  }
  
  // Create spinner element
  const spinner = (
    <svg
      className={`animate-spin ${sizeClasses} ${colorClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...rest}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  
  // Handle fullScreen mode
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg">
          {spinner}
          {text && (
            <span className="mt-2 text-gray-700">{text}</span>
          )}
        </div>
      </div>
    );
  }
  
  // Handle centered mode
  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        {spinner}
        {text && (
          <span className="mt-2 text-gray-700">{text}</span>
        )}
      </div>
    );
  }
  
  // Default mode: just the spinner with optional text
  return (
    <div className="flex items-center">
      {spinner}
      {text && (
        <span className="ml-2 text-gray-700">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
