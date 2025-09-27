import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setActiveRoute, toggleSidebar } from '../../store/slices/uiSlice';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import Icon from '../ui/Icon';
import blumotivLogo from '../../assets/blumotivlogowhite.png';
import blumotivLogoSmall from '../../assets/blumotivlogowhitesmall.png';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  onToggle,
  isMobile = false 
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const sidebarRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const handleRouteChange = (path: string) => {
    dispatch(setActiveRoute(path));
    navigate(path);
    
    // Close mobile sidebar after navigation
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isMobile && onToggle) {
      onToggle();
    }
  };

  // Focus management for mobile sidebar
  useEffect(() => {
    if (isMobile && isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isMobile, isOpen]);

  const sidebarClasses = isMobile
    ? `fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
       text-gray-900 dark:text-white transition-all duration-300 z-40 shadow-lg
       ${isOpen ? 'translate-x-0 w-64 sm:w-72' : '-translate-x-full w-64 sm:w-72'}`
    : `fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
       text-gray-900 dark:text-white transition-all duration-300 z-30 shadow-lg
       ${sidebarCollapsed ? 'w-12 sm:w-16 lg:w-20' : 'w-56 sm:w-64 lg:w-72 xl:w-80'}`;

  return (
    <aside
      ref={sidebarRef}
      data-testid="sidebar-container"
      className={sidebarClasses}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="Main navigation"
      aria-hidden={isMobile ? !isOpen : false}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area - Responsive Logo Display */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <div className="rounded-lg p-1 transition-all duration-200">
              <img 
                src={sidebarCollapsed && !isMobile ? blumotivLogoSmall : blumotivLogo}
                alt="BluFleet Logo"
                className={`w-auto transition-all duration-200 ${
                  sidebarCollapsed && !isMobile ? 'h-5' : 'h-6'
                }`}
                role="img"
                aria-label="BluFleet logo"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 sm:py-4 lg:py-6" role="navigation" aria-label="Main menu">
          <ul className="space-y-1 px-2 sm:px-3 lg:px-4" role="list">
            {NAVIGATION_ITEMS.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id} role="listitem">
                  <button
                    ref={index === 0 ? firstFocusableRef : undefined}
                    onClick={() => handleRouteChange(item.path)}
                    className={`
                      w-full group flex items-center px-2 py-2 text-sm font-medium rounded-lg 
                      transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`
                      ${(!sidebarCollapsed || isMobile) ? 'mr-3' : 'mx-auto'} 
                      transition-all duration-200
                    `}>
                      <Icon name={item.icon} className="w-5 h-5" />
                    </span>
                    {(!sidebarCollapsed || isMobile) && (
                      <span className="text-sm font-medium truncate transition-all duration-200">
                        {item.label}
                      </span>
                    )}
                    {sidebarCollapsed && !isMobile && (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle for Desktop */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="w-full flex items-center justify-center p-3 text-gray-600 dark:text-gray-300 
                       hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 
                       rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {!sidebarCollapsed && (
                <span className="ml-2 text-sm">Collapse</span>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {(!sidebarCollapsed || isMobile) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Powering Smart Fleet Management
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;