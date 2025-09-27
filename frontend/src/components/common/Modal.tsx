/**
 * Modal Component
 * A reusable modal dialog component
 */
import React, { Fragment, useEffect, useRef } from 'react';
import Button from './Button';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal footer content (default: close button) */
  footer?: React.ReactNode;
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show a close button in the header */
  showCloseButton?: boolean;
  /** Whether the modal can be closed by clicking outside or pressing Escape */
  closeOnOutsideClick?: boolean;
  /** Additional class for the modal container */
  className?: string;
  /** Whether to center the modal vertically */
  centered?: boolean;
  /** Whether the modal has a scrollable body */
  scrollable?: boolean;
  /** Additional props */
  [x: string]: any;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOutsideClick = true,
  className = '',
  centered = true,
  scrollable = true,
  ...rest
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape' && closeOnOutsideClick) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, closeOnOutsideClick]);
  
  // Handle click outside modal
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOutsideClick &&
      modalRef.current && 
      !modalRef.current.contains(event.target as Node)
    ) {
      onClose();
    }
  };
  
  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Determine size classes
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'max-w-sm';
      break;
    case 'lg':
      sizeClasses = 'max-w-2xl';
      break;
    case 'xl':
      sizeClasses = 'max-w-4xl';
      break;
    case 'full':
      sizeClasses = 'max-w-full m-4';
      break;
    default: // md
      sizeClasses = 'max-w-lg';
  }
  
  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity"
        onClick={handleOutsideClick}
      >
        {/* Modal positioning container */}
        <div 
          className={`fixed inset-0 z-50 overflow-y-auto ${centered ? 'flex items-center justify-center' : 'pt-10'}`}
        >
          {/* Modal content */}
          <div 
            ref={modalRef}
            className={`bg-white rounded-lg shadow-xl relative ${sizeClasses} w-full mx-auto ${className}`}
            {...rest}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  {title && (
                    <h3 className="text-lg font-medium text-gray-900">
                      {title}
                    </h3>
                  )}
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                      aria-label="Close"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Body */}
            <div className={`px-4 py-3 ${scrollable ? 'max-h-[60vh] overflow-y-auto' : ''}`}>
              {children}
            </div>
            
            {/* Footer */}
            {(footer !== undefined) && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                {footer !== null ? footer : (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Modal;
