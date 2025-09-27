/**
 * Card Component
 * A reusable card container with various styles and options
 */
import React from 'react';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Whether the card has a border */
  bordered?: boolean;
  /** Whether the card has a shadow */
  shadowed?: boolean;
  /** Whether the card has hover effects */
  hoverable?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Optional function called when card is clicked */
  onClick?: () => void;
  /** Additional props */
  [x: string]: any;
}

const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  bordered = true,
  shadowed = true,
  hoverable = false,
  className = '',
  onClick,
  ...rest
}) => {
  // Base classes
  let classes = 'bg-white rounded-lg overflow-hidden ';
  
  // Add conditional classes
  if (bordered) classes += 'border border-gray-200 ';
  if (shadowed) classes += 'shadow-md ';
  if (hoverable) classes += 'transition-shadow duration-200 hover:shadow-lg ';
  if (onClick) classes += 'cursor-pointer ';
  
  // Add any additional classes
  classes += className;
  
  return (
    <div className={classes} onClick={onClick} {...rest}>
      {header && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          {header}
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
