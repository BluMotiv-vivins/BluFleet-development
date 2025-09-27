import React, { useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    dispatch(setTheme(initialTheme));
    updateDOM(initialTheme === 'dark');
  }, [dispatch]);

  // Update DOM whenever theme changes
  useEffect(() => {
    updateDOM(isDark);
  }, [isDark]);

  const updateDOM = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
    localStorage.setItem('theme', newTheme);
    updateDOM(newTheme === 'dark');
  };

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]} 
        ${className}
        relative rounded-full p-1
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        hover:scale-105
        ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle slider */}
      <div className={`
        relative w-full h-full rounded-full transition-all duration-300 ease-in-out
        ${isDark ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Icon container */}
        <div className={`
          absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
          ${isDark ? 'translate-x-1' : `translate-x-${size === 'sm' ? '5' : size === 'md' ? '6' : '7'}`}
          ${size === 'sm' ? 'left-0.5' : 'left-1'}
        `}>
          <div className={`
            ${iconSizeClasses[size]} 
            rounded-full flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${isDark 
              ? 'bg-gray-600 text-yellow-400' 
              : 'bg-blue-500 text-white'
            }
          `}>
            {isDark ? (
              <MoonIcon className={`${iconSizeClasses[size]} transition-transform duration-300 ease-in-out`} />
            ) : (
              <SunIcon className={`${iconSizeClasses[size]} transition-transform duration-300 ease-in-out`} />
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default DarkModeToggle;
