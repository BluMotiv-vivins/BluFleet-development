import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { setSidebarCollapsed, toggleSidebar } from '../../store/slices/uiSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { User, AppNotification } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  notifications: AppNotification[];
  onSearch?: (query: string) => void;
  onNotificationClick?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearAllNotifications?: () => void;
  loading?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  user, 
  notifications, 
  onSearch, 
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Samsung-style responsive behavior with smooth transitions
  useEffect(() => {
    let timeoutId: number;
    
    const checkResponsive = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const width = window.innerWidth;
        const mobile = width < 768; // md breakpoint
        setIsMobile(mobile);
        
        // Samsung-style adaptive sidebar behavior
        if (mobile && !sidebarCollapsed) {
          dispatch(setSidebarCollapsed(true));
        }
      }, 150); // Samsung-style debounced resize
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => {
      window.removeEventListener('resize', checkResponsive);
      clearTimeout(timeoutId);
    };
  }, [dispatch, sidebarCollapsed]);

  // Handle mobile sidebar overlay
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(prev => !prev);
    } else {
      dispatch(setSidebarCollapsed(!sidebarCollapsed));
    }
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Skip to main content link for accessibility
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Skip to main content link - Samsung-style accessibility */}
      <button
        onClick={skipToMain}
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 
                   bg-blue-600 text-white px-4 py-2 z-[9999] rounded-br-lg 
                   transition-all duration-200 focus:shadow-lg"
        aria-label="Skip to main content"
      >
        Skip to main content
      </button>

      {/* Samsung-style mobile sidebar overlay with smooth transitions */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden 
                     animate-in fade-in duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with Samsung-style positioning */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        isMobile={isMobile}
      />
      
      {/* Main Content Area with Samsung-style responsive spacing */}
      <div className={`transition-all duration-300 ease-in-out ${
        isMobile 
          ? 'ml-0' 
          : sidebarCollapsed 
          ? 'ml-12 sm:ml-16 lg:ml-20' 
          : 'ml-56 lg:ml-64 xl:ml-72 2xl:ml-80'
      }`}>
        {/* Header with Samsung-style responsive behavior */}
        <Header 
          user={user} 
          notifications={notifications} 
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onClearAllNotifications={onClearAllNotifications}
          onSidebarToggle={handleSidebarToggle}
          isMobile={isMobile}
        />
        
        {/* Page Content with Samsung-style adaptive spacing */}
        <main 
          id="main-content"
          className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 
                     focus:outline-none transition-all duration-300"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          {loading ? (
            <div className="flex items-center justify-center min-h-96 
                           transition-all duration-300">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="animate-fade-in transition-all duration-300">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Samsung-style live region for screen readers */}
      <div
        id="live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
    </div>
  );
};

export default AppLayout;