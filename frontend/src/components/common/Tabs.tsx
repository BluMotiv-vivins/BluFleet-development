import React, { useEffect, useState } from 'react';

export interface TabProps {
  /** The label for the tab */
  label: string;
  /** Content inside the tab panel */
  children: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Icon for the tab (optional) */
  icon?: React.ReactNode;
}

export interface TabsProps {
  /** Child Tab components */
  children: React.ReactElement<TabProps>[];
  /** Default active tab index */
  defaultActiveIndex?: number;
  /** Custom active tab index (controlled) */
  activeIndex?: number;
  /** Called when active tab changes */
  onChange?: (index: number) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional CSS class for container */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'pills' | 'underline';
}

/**
 * Tab component to be used as a child of Tabs
 */
export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Tabs component for switching between different content views
 */
const Tabs: React.FC<TabsProps> = ({
  children,
  defaultActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onChange,
  orientation = 'horizontal',
  fullWidth = false,
  className = '',
  variant = 'default',
}) => {
  // For controlled/uncontrolled state
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  
  // Update internal state when controlled prop changes
  useEffect(() => {
    if (controlledActiveIndex !== undefined) {
      setActiveIndex(controlledActiveIndex);
    }
  }, [controlledActiveIndex]);
  
  // Handle tab click
  const handleTabClick = (index: number) => {
    if (controlledActiveIndex === undefined) {
      setActiveIndex(index);
    }
    
    if (onChange) {
      onChange(index);
    }
  };
  
  // Extract only Tab components
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Tab
  ) as React.ReactElement<TabProps>[];

  // Base container classes
  const containerClasses = `
    ${orientation === 'vertical' ? 'flex flex-row' : 'flex flex-col'} 
    ${className}
  `;
  
  // Tab list classes based on orientation and variant
  const tabListClasses = `
    ${orientation === 'vertical' 
      ? 'flex flex-col border-r border-gray-200 dark:border-gray-700' 
      : 'flex flex-row border-b border-gray-200 dark:border-gray-700'}
    ${variant === 'pills' ? 'space-x-2 border-0 p-1 mb-2' : ''}
    ${variant === 'underline' ? 'border-0' : ''}
  `;
  
  // Tab panel container
  const tabPanelContainerClasses = `
    ${orientation === 'vertical' ? 'ml-4 flex-1' : 'mt-4'}
  `;
  
  return (
    <div className={containerClasses}>
      {/* Tab List */}
      <div className={tabListClasses} role="tablist">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const isDisabled = tab.props.disabled;
          
          // Generate tab classes based on variant
          let tabClasses = '';
          
          switch(variant) {
            case 'pills':
              tabClasses = `
                px-3 py-2 rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
              `;
              break;
            case 'underline':
              tabClasses = `
                px-3 py-2 border-b-2 transition-colors
                ${isActive 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'}
              `;
              break;
            default: // default
              tabClasses = `
                px-4 py-2 transition-colors
                ${isActive 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'}
              `;
          }
          
          // Add other common classes
          tabClasses += ` 
            text-sm font-medium
            ${fullWidth ? 'flex-1 text-center' : ''}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${orientation === 'vertical' 
              ? 'text-left' 
              : ''}
          `;
          
          return (
            <div
              key={index}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
              className={tabClasses}
              onClick={() => !isDisabled && handleTabClick(index)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                  handleTabClick(index);
                  e.preventDefault();
                }
              }}
            >
              <div className="flex items-center">
                {tab.props.icon && (
                  <span className="mr-2">{tab.props.icon}</span>
                )}
                {tab.props.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Tab Panels */}
      <div className={tabPanelContainerClasses}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            role="tabpanel"
            className={`${index === activeIndex ? 'block' : 'hidden'}`}
            aria-hidden={index !== activeIndex}
          >
            {tab.props.children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
