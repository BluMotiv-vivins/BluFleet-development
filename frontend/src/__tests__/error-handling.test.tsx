import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { handleAPIError, withRetry, createAPIError, NetworkError } from '../utils/errorHandling';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OfflineIndicator } from '../components/ui/OfflineIndicator';

import { vi } from 'vitest';

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock online status hook
vi.mock('../hooks/useOnlineStatus');
const mockUseOnlineStatus = useOnlineStatus as any;

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.error mock
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ErrorBoundary', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should allow retry functionality', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again
      fireEvent.click(screen.getByText('Try Again'));

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    });

    it('should log errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Console test error" />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Object)
      );
    });
  });

  describe('API Error Handling', () => {
    it('should create API error correctly', () => {
      const error = new Error('Test error');
      const apiError = createAPIError(error);

      expect(apiError).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Test error',
        details: undefined,
        timestamp: expect.any(Date),
        status: undefined,
      });
    });

    it('should create API error with status code', () => {
      const error = { status: 404, message: 'Not found', code: 'NOT_FOUND' };
      const apiError = createAPIError(error);

      expect(apiError).toEqual({
        code: 'NOT_FOUND',
        message: 'Not found',
        details: undefined,
        timestamp: expect.any(Date),
        status: 404,
      });
    });

    it('should handle different error types correctly', () => {
      const { toast } = require('react-hot-toast');

      // Network error
      handleAPIError(createAPIError({ code: 'NETWORK_ERROR' }));
      expect(toast.error).toHaveBeenCalledWith('Connection lost. Please check your internet connection.');

      // Unauthorized error
      handleAPIError(createAPIError({ code: '401' }));
      expect(toast.error).toHaveBeenCalledWith('Session expired. Please log in again.');

      // Forbidden error
      handleAPIError(createAPIError({ code: '403' }));
      expect(toast.error).toHaveBeenCalledWith('You do not have permission to perform this action.');

      // Not found error
      handleAPIError(createAPIError({ code: '404' }));
      expect(toast.error).toHaveBeenCalledWith('The requested resource was not found.');

      // Rate limited error
      handleAPIError(createAPIError({ code: '429' }));
      expect(toast.error).toHaveBeenCalledWith('Too many requests. Please wait a moment and try again.');

      // Server error
      handleAPIError(createAPIError({ code: '500' }));
      expect(toast.error).toHaveBeenCalledWith('Server error. Please try again later.');
    });

    it('should handle validation errors with details', () => {
      const { toast } = require('react-hot-toast');
      
      const validationError = createAPIError({
        code: 'VALIDATION_ERROR',
        details: {
          email: 'Email is required',
          password: 'Password must be at least 8 characters'
        }
      });

      handleAPIError(validationError);

      expect(toast.error).toHaveBeenCalledWith('Email is required');
      expect(toast.error).toHaveBeenCalledWith('Password must be at least 8 characters');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new NetworkError('Network error', undefined, 'NETWORK_ERROR');
        }
        return 'success';
      });

      const result = await withRetry(mockFn, { maxRetries: 3, baseDelay: 10 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Validation error');
      });

      await expect(withRetry(mockFn, { maxRetries: 3, baseDelay: 10 })).rejects.toThrow('Validation error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should respect max retry limit', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new NetworkError('Network error', undefined, 'NETWORK_ERROR');
      });

      await expect(withRetry(mockFn, { maxRetries: 2, baseDelay: 10 })).rejects.toThrow('Network error');
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });

    it('should use custom retry condition', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        throw new Error('Custom error');
      });

      const customRetryCondition = (error: any) => error.message === 'Custom error';

      await expect(
        withRetry(mockFn, { 
          maxRetries: 2, 
          baseDelay: 10, 
          retryCondition: customRetryCondition 
        })
      ).rejects.toThrow('Custom error');

      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should implement exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0); // Execute immediately for testing
      });

      const mockFn = vi.fn().mockImplementation(() => {
        throw new NetworkError('Network error', undefined, 'NETWORK_ERROR');
      });

      await expect(
        withRetry(mockFn, { maxRetries: 2, baseDelay: 100, backoffFactor: 2 })
      ).rejects.toThrow('Network error');

      // Should have exponential backoff with jitter
      expect(delays.length).toBe(2);
      expect(delays[0]).toBeGreaterThanOrEqual(100);
      expect(delays[1]).toBeGreaterThanOrEqual(200);

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Online Status Detection', () => {
    it('should detect online status', () => {
      mockUseOnlineStatus.mockReturnValue({
        isOnline: true,
        isSlowConnection: false,
        connectionType: '4g',
      });

      render(<OfflineIndicator />);

      // Should not show indicator when online
      expect(screen.queryByText('No Internet Connection')).not.toBeInTheDocument();
    });

    it('should show offline indicator when offline', () => {
      mockUseOnlineStatus.mockReturnValue({
        isOnline: false,
        isSlowConnection: false,
        connectionType: null,
      });

      render(<OfflineIndicator />);

      expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
      expect(screen.getByText(/You're currently offline/)).toBeInTheDocument();
    });

    it('should show slow connection warning', () => {
      mockUseOnlineStatus.mockReturnValue({
        isOnline: true,
        isSlowConnection: true,
        connectionType: '2g',
      });

      render(<OfflineIndicator showSlowConnection={true} />);

      expect(screen.getByText('Slow Connection')).toBeInTheDocument();
      expect(screen.getByText(/You're on a 2g connection/)).toBeInTheDocument();
    });

    it('should not show slow connection warning when disabled', () => {
      mockUseOnlineStatus.mockReturnValue({
        isOnline: true,
        isSlowConnection: true,
        connectionType: '2g',
      });

      render(<OfflineIndicator showSlowConnection={false} />);

      expect(screen.queryByText('Slow Connection')).not.toBeInTheDocument();
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should handle circuit breaker pattern', async () => {
      const { CircuitBreaker } = require('../utils/errorHandling');
      const circuitBreaker = new CircuitBreaker(2, 1000, 500);
      
      const failingFunction = vi.fn().mockRejectedValue(new Error('Service unavailable'));
      
      // First two calls should fail and open the circuit
      await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Service unavailable');
      await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Service unavailable');
      
      // Third call should fail due to open circuit
      await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Circuit breaker is OPEN');
      
      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should handle enhanced fetch with timeout', async () => {
      const { enhancedFetch } = require('../utils/errorHandling');
      
      // Mock fetch to simulate timeout
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve(new Response('OK')), 15000); // 15s delay
        })
      );

      await expect(
        enhancedFetch('https://api.example.com/data')
      ).rejects.toThrow('Request timeout');
    });

    it('should aggregate errors from batch operations', () => {
      const { ErrorAggregator } = require('../utils/errorHandling');
      const aggregator = new ErrorAggregator();
      
      aggregator.add('operation1', new Error('Error 1'));
      aggregator.add('operation2', new Error('Error 2'));
      
      expect(aggregator.hasErrors()).toBe(true);
      expect(aggregator.getErrors()).toHaveLength(2);
      
      const summaryError = aggregator.createSummaryError();
      expect(summaryError.message).toContain('operation1: Error 1');
      expect(summaryError.message).toContain('operation2: Error 2');
    });

    it('should handle graceful degradation with fallback', async () => {
      const { withGracefulDegradation } = require('../utils/errorHandling');
      
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockReturnValue('Fallback result');
      
      const gracefulFn = withGracefulDegradation(primaryFn, fallbackFn);
      const result = await gracefulFn();
      
      expect(result).toBe('Fallback result');
      expect(primaryFn).toHaveBeenCalled();
      expect(fallbackFn).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should handle graceful degradation', () => {
      // Test that components can handle missing data gracefully
      const ComponentWithOptionalData: React.FC<{ data?: any[] }> = ({ data }) => {
        if (!data || data.length === 0) {
          return <div>No data available</div>;
        }
        return <div>Data loaded: {data.length} items</div>;
      };

      // Test with no data
      const { rerender } = render(<ComponentWithOptionalData />);
      expect(screen.getByText('No data available')).toBeInTheDocument();

      // Test with data
      rerender(<ComponentWithOptionalData data={[1, 2, 3]} />);
      expect(screen.getByText('Data loaded: 3 items')).toBeInTheDocument();
    });

    it('should handle partial failures gracefully', async () => {
      const ComponentWithPartialFailure: React.FC = () => {
        const [error, setError] = React.useState<string | null>(null);
        const [data, setData] = React.useState<any[]>([]);

        React.useEffect(() => {
          // Simulate partial failure
          try {
            setData([1, 2, 3]);
            // Simulate an error that doesn't break the whole component
            throw new Error('Non-critical error');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        }, []);

        return (
          <div>
            <div>Data: {data.length} items</div>
            {error && <div>Warning: {error}</div>}
          </div>
        );
      };

      render(<ComponentWithPartialFailure />);

      await waitFor(() => {
        expect(screen.getByText('Data: 3 items')).toBeInTheDocument();
        expect(screen.getByText('Warning: Non-critical error')).toBeInTheDocument();
      });
    });

    it('should handle enhanced error boundary with retry limits', () => {
      let attemptCount = 0;
      const FailingComponent: React.FC = () => {
        attemptCount++;
        if (attemptCount <= 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return <div>Success after retries</div>;
      };

      render(
        <ErrorBoundary level="component">
          <FailingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
      
      // Click retry button multiple times
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      
      // After max retries, button should be disabled
      expect(screen.getByText('Max Retries Reached')).toBeInTheDocument();
    });
  });
});