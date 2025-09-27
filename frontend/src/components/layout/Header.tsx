import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import GlobalSearch from './GlobalSearch';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import SettingsPanel from './SettingsPanel';
import RealTimeStatus from '../ui/RealTimeStatus';
import DarkModeToggle from '../ui/DarkModeToggle';
import type { User, AppNotification } from '../../types';

interface HeaderProps {
  user: User;
  notifications: AppNotification[];
  onSearch?: (query: string) => void;
  onNotificationClick?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearAllNotifications?: () => void;
  onSidebarToggle?: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  notifications, 
  onSearch: _onSearch, 
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  onSidebarToggle,
  isMobile = false,
}) => {
  const dispatch = useAppDispatch();
  const [showSettings, setShowSettings] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Samsung-style scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchResultClick = (result: any) => {
    console.log('Search result clicked:', result);
    // In a real app, this would navigate to the appropriate page
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    // In a real app, this would open profile settings
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
    // In a real app, this would handle sign out
  };

  const handleMenuToggle = () => {
    if (isMobile && onSidebarToggle) {
      onSidebarToggle();
    } else {
      dispatch(toggleSidebar());
    }
  };

  return (
    <header 
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-700' 
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800'
        }
        px-4 sm:px-6 py-4
      `}
      role="banner"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Menu Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                     hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            aria-label={isMobile ? "Open navigation menu" : "Toggle sidebar"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo Area - Removed */}
          <div className={`items-center space-x-2 sm:space-x-3 ${isMobile ? 'hidden xs:flex' : 'flex'}`}>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white 
                         transition-colors duration-200">
              <span className="hidden xs:inline sm:hidden">BF</span>
              <span className="hidden sm:inline">BluFleet</span>
            </h1>
          </div>
        </div>

        {/* Center - Global Search */}
        <div className="hidden md:block mx-2 lg:mx-4 xl:mx-8 flex-1 max-w-sm lg:max-w-md xl:max-w-lg">
          <GlobalSearch onResultClick={handleSearchResultClick} />
        </div>

        {/* Right side - Status, Notifications, Dark Mode, Settings, and User */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
          {/* Real-time Status */}
          <div className="hidden lg:block">
            <RealTimeStatus showDetailedInfo className="mr-1 lg:mr-2" />
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <DarkModeToggle size="sm" className="sm:mr-1" />
          </div>

          {/* Notifications */}
          <div>
            <NotificationsDropdown
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onMarkAllRead={onMarkAllNotificationsRead}
              onClearAll={onClearAllNotifications}
            />
          </div>

          {/* Settings */}
          <button 
            onClick={() => setShowSettings(true)}
            className="hidden sm:block p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                     hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200" 
            aria-label="Open settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* User Profile */}
          <div>
            <UserProfileDropdown
              user={user}
              onProfileClick={handleProfileClick}
              onSettingsClick={() => setShowSettings(true)}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobile && (
        <div className="mt-4 md:hidden">
          <GlobalSearch onResultClick={handleSearchResultClick} />
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
};

export default Header;