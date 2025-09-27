/**
 * useDarkMode Hook
 * A hook for managing dark mode with localStorage persistence
 */
import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * Hook to manage dark mode state with localStorage persistence
 * and system preference detection.
 * 
 * @param defaultValue The default dark mode value (optional)
 * @returns Dark mode state and toggle/set functions
 */
function useDarkMode(defaultValue?: boolean) {
  // Use matchMedia to detect system preference if defaultValue is not provided
  const getDefaultValue = (): boolean => {
    if (typeof defaultValue !== 'undefined') return defaultValue;
    
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  };
  
  // Store dark mode state in localStorage
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(
    'blufleet-dark-mode',
    getDefaultValue
  );
  
  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);
  
  // Apply dark mode class to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (typeof defaultValue === 'undefined') {
        setDarkMode(e.matches);
      }
    };
    
    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [defaultValue, setDarkMode]);
  
  return {
    darkMode,
    toggleDarkMode,
    setDarkMode
  };
}

export default useDarkMode;
