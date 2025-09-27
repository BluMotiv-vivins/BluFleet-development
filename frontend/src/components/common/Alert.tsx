/**
 * Alert Component
 * A reusable alert component for displaying messages, warnings, and errors
 */
import React, { useState } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps {
  /** Alert title (optional) */
  title?: string;
  /** Alert message content */
  children: React.ReactNode;
  /** Alert variant/color */
  variant?: AlertVariant;
  /** Alert size */
  size?: AlertSize;
  /** Whether the alert is dismissible */
  dismissible?: boolean;
  /** Whether to show an icon */
  showIcon?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Function called when alert is dismissed */
  onDismiss?: () => void;
  /** Additional props */
  [x: string]: any;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  size = 'md',
  dismissible = false,
  showIcon = true,
  className = '',
  onDismiss,
  ...rest
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  
  // If the alert has been dismissed, don't render anything
  if (!visible) return null;
  
  // Handle dismiss click
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };
  
  // Base classes
  let classes = 'rounded-md ';
  
  // Size classes
  switch (size) {
    case 'sm':
      classes += 'p-2 text-sm ';
      break;
    case 'lg':
      classes += 'p-5 text-base ';
      break;
    default: // md
      classes += 'p-4 text-sm ';
  }
  
  // Variant classes
  switch (variant) {
    case 'success':
      classes += 'bg-green-50 text-green-800 ';
      break;
    case 'warning':
      classes += 'bg-yellow-50 text-yellow-800 ';
      break;
    case 'danger':
      classes += 'bg-red-50 text-red-800 ';
      break;
    default: // info
      classes += 'bg-blue-50 text-blue-800 ';
  }
  
  // Add custom classes
  classes += className;
  
  // Get the appropriate icon based on variant
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'danger':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default: // info
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  return (
    <div className={classes} role="alert" {...rest}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        )}
        
        <div className={`${showIcon ? 'ml-3' : ''} w-full`}>
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          
          <div className={`${title ? 'mt-2' : ''} text-sm`}>
            {children}
          </div>
        </div>
        
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${variant === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' : ''}
                  ${variant === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' : ''}
                  ${variant === 'danger' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' : ''}
                  ${variant === 'info' ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600' : ''}
                `}
                onClick={handleDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
