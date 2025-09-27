/**
 * Badge Component
 * A reusable badge for status indicators, counters, etc.
 */
import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Badge variant/color */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Whether badge is pill-shaped (more rounded) */
  pill?: boolean;
  /** Whether badge is outlined instead of filled */
  outlined?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Additional props */
  [x: string]: any;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  outlined = false,
  className = '',
  ...rest
}) => {
  // Base classes
  let classes = 'inline-flex items-center justify-center font-medium ';
  
  // Size classes
  switch (size) {
    case 'sm':
      classes += 'px-2 py-0.5 text-xs ';
      break;
    case 'lg':
      classes += 'px-3 py-1 text-sm ';
      break;
    default: // md
      classes += 'px-2.5 py-0.5 text-xs ';
  }
  
  // Shape classes
  classes += pill ? 'rounded-full ' : 'rounded ';
  
  // Variant classes for filled badges
  if (!outlined) {
    switch (variant) {
      case 'primary':
        classes += 'bg-blue-100 text-blue-800 ';
        break;
      case 'secondary':
        classes += 'bg-gray-100 text-gray-800 ';
        break;
      case 'success':
        classes += 'bg-green-100 text-green-800 ';
        break;
      case 'warning':
        classes += 'bg-yellow-100 text-yellow-800 ';
        break;
      case 'danger':
        classes += 'bg-red-100 text-red-800 ';
        break;
      case 'info':
        classes += 'bg-purple-100 text-purple-800 ';
        break;
      default:
        classes += 'bg-gray-100 text-gray-800 ';
    }
  } 
  // Variant classes for outlined badges
  else {
    classes += 'border ';
    switch (variant) {
      case 'primary':
        classes += 'border-blue-500 text-blue-700 ';
        break;
      case 'secondary':
        classes += 'border-gray-500 text-gray-700 ';
        break;
      case 'success':
        classes += 'border-green-500 text-green-700 ';
        break;
      case 'warning':
        classes += 'border-yellow-500 text-yellow-700 ';
        break;
      case 'danger':
        classes += 'border-red-500 text-red-700 ';
        break;
      case 'info':
        classes += 'border-purple-500 text-purple-700 ';
        break;
      default:
        classes += 'border-gray-300 text-gray-700 ';
    }
  }
  
  // Add custom classes
  classes += className;
  
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
