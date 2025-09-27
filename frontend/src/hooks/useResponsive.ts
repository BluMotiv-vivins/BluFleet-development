import { useState, useEffect } from 'react';

// Samsung-inspired responsive breakpoints
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Hook for Samsung-style responsive behavior
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      // Determine current breakpoint
      if (width >= BREAKPOINTS['4xl']) {
        setCurrentBreakpoint('4xl');
      } else if (width >= BREAKPOINTS['3xl']) {
        setCurrentBreakpoint('3xl');
      } else if (width >= BREAKPOINTS['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setCurrentBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    // Samsung-style smooth resize handling with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    handleResize(); // Initial call
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const isBreakpoint = (breakpoint: Breakpoint) => {
    return windowSize.width >= BREAKPOINTS[breakpoint];
  };

  const isAbove = (breakpoint: Breakpoint) => {
    return windowSize.width > BREAKPOINTS[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint) => {
    return windowSize.width < BREAKPOINTS[breakpoint];
  };

  const isMobile = windowSize.width < BREAKPOINTS.md;
  const isTablet = windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg;
  const isDesktop = windowSize.width >= BREAKPOINTS.lg;
  const isLargeScreen = windowSize.width >= BREAKPOINTS['2xl'];
  const isUltraWide = windowSize.width >= BREAKPOINTS['3xl'];

  return {
    windowSize,
    currentBreakpoint,
    isBreakpoint,
    isAbove,
    isBelow,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isUltraWide,
  };
};

// Samsung-style responsive spacing utilities
export const getResponsivePadding = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const paddingMap = {
    sm: 'p-2 sm:p-3 md:p-4',
    md: 'p-3 sm:p-4 md:p-6 lg:p-8',
    lg: 'p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12',
    xl: 'p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 2xl:p-20',
  };
  return paddingMap[size];
};

export const getResponsiveMargin = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const marginMap = {
    sm: 'm-2 sm:m-3 md:m-4',
    md: 'm-3 sm:m-4 md:m-6 lg:m-8',
    lg: 'm-4 sm:m-6 md:m-8 lg:m-10 xl:m-12',
    xl: 'm-6 sm:m-8 md:m-10 lg:m-12 xl:m-16 2xl:m-20',
  };
  return marginMap[size];
};

export default useResponsive;
