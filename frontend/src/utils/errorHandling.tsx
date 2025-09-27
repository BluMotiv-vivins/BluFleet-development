import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors
 * Prevents the entire application from crashing when a component fails
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, info);
    
    // Call the onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Something went wrong
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Custom hook to log errors
 * @param error Error object
 * @param context Additional context information
 */
export const logError = (error: unknown, context: string = 'general'): void => {
  // Format the error message
  const errorMessage = error instanceof Error 
    ? error.message 
    : String(error);
  
  // Log to console
  console.error(`[${context}] Error:`, error);
  
  // In a real application, you would send this to your error tracking service
  // For example: Sentry, LogRocket, etc.
  // Example with Sentry:
  // Sentry.captureException(error, { extra: { context } });
};

/**
 * Handle API errors consistently
 * @param error Error from API call
 * @returns Formatted error message for display
 */
export const handleApiError = (error: unknown): string => {
  // Log the error
  logError(error, 'api');
  
  // Format user-friendly error message
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }
    
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again later.';
};
