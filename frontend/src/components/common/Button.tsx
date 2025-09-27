/**
 * Button Component
 * A reusable button component with various styles and states
 */
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label content */
  children: React.ReactNode;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Function called when button is clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS class names */
  className?: string;
  /** Optional icon to show before text */
  startIcon?: React.ReactNode;
  /** Optional icon to show after text */
  endIcon?: React.ReactNode;
  /** Whether the button takes up the full width of its container */
  fullWidth?: boolean;
  /** Additional props to pass to the button element */
  [x: string]: any;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  startIcon,
  endIcon,
  fullWidth = false,
  ...rest
}) => {
  // Base classes always applied
  let classes = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ';
  
  // Size classes
  switch (size) {
    case 'sm':
      classes += 'px-3 py-1.5 text-sm ';
      break;
    case 'lg':
      classes += 'px-6 py-3 text-lg ';
      break;
    default:
      classes += 'px-4 py-2 text-base ';
  }

  // Variant classes
  switch (variant) {
    case 'primary':
      classes += 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ';
      classes += disabled ? 'opacity-50 cursor-not-allowed' : '';
      break;
    case 'secondary':
      classes += 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 ';
      classes += disabled ? 'opacity-50 cursor-not-allowed' : '';
      break;
    case 'outline':
      classes += 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 ';
      classes += disabled ? 'opacity-50 cursor-not-allowed' : '';
      break;
    case 'danger':
      classes += 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ';
      classes += disabled ? 'opacity-50 cursor-not-allowed' : '';
      break;
    case 'success':
      classes += 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ';
      classes += disabled ? 'opacity-50 cursor-not-allowed' : '';
      break;
    case 'text':
      classes += 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:ring-blue-500 bg-transparent ';
      classes += disabled ? 'opacity-50 cursor-not-allowed' : '';
      break;
  }

  // Full width class
  if (fullWidth) {
    classes += 'w-full ';
  }

  // Add any additional classes passed as props
  classes += className;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      <div className="flex items-center justify-center">
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        )}
        
        {startIcon && !isLoading && <span className="mr-2">{startIcon}</span>}
        {children}
        {endIcon && <span className="ml-2">{endIcon}</span>}
      </div>
    </button>
  );
};

export default Button;
