import { toast } from 'react-hot-toast';

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  status?: number;
}

export class NetworkError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const createAPIError = (
  error: any,
  defaultMessage = 'An unexpected error occurred'
): APIError => {
  return {
    code: error.code || error.status?.toString() || 'UNKNOWN_ERROR',
    message: error.message || defaultMessage,
    details: error.details || error.data,
    timestamp: new Date(),
    status: error.status,
  };
};

export const handleAPIError = (error: APIError): void => {
  switch (error.code) {
    case 'NETWORK_ERROR':
    case 'ERR_NETWORK':
      toast.error('Connection lost. Please check your internet connection.');
      break;
    case '401':
    case 'UNAUTHORIZED':
      toast.error('Session expired. Please log in again.');
      // Redirect to login would happen here
      break;
    case '403':
    case 'FORBIDDEN':
      toast.error('You do not have permission to perform this action.');
      break;
    case '404':
    case 'NOT_FOUND':
      toast.error('The requested resource was not found.');
      break;
    case '429':
    case 'RATE_LIMITED':
      toast.error('Too many requests. Please wait a moment and try again.');
      break;
    case '500':
    case 'INTERNAL_SERVER_ERROR':
      toast.error('Server error. Please try again later.');
      break;
    case 'VALIDATION_ERROR':
      if (error.details && typeof error.details === 'object') {
        Object.values(error.details).forEach((message) => {
          if (typeof message === 'string') {
            toast.error(message);
          }
        });
      } else {
        toast.error(error.message);
      }
      break;
    default:
      toast.error(error.message || 'An unexpected error occurred');
  }
};

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ERR_NETWORK' ||
      (error.status >= 500 && error.status < 600)
    );
  },
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Check if we're online before attempting
      if (!navigator.onLine && attempt > 0) {
        throw new NetworkError('Device is offline', 0, 'OFFLINE');
      }

      return await fn();
    } catch (error) {
      lastError = error;
      
      const apiError = createAPIError(error);
      
      // Don't retry if condition is not met or it's the last attempt
      if (!opts.retryCondition?.(apiError) || attempt === opts.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      // If offline, wait for online status before retrying
      if (!navigator.onLine) {
        await waitForOnline();
      }

      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
};

// Wait for online status
const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

export const isNetworkError = (error: any): boolean => {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('fetch')
  );
};

export const isRetryableError = (error: any): boolean => {
  const apiError = createAPIError(error);
  return defaultRetryOptions.retryCondition!(apiError);
};

// Circuit breaker pattern for API calls
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private threshold: number;
  private timeout: number;

  constructor(
    threshold = 5,
    timeout = 60000 // 1 minute
  ) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker instance
export const apiCircuitBreaker = new CircuitBreaker();

// Enhanced fetch with error handling and retry
export const enhancedFetch = async (
  url: string,
  options: RequestInit = {},
  retryOptions?: Partial<RetryOptions>
): Promise<Response> => {
  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.status.toString()
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout', 408, 'TIMEOUT');
      }
      
      throw error;
    }
  };

  return apiCircuitBreaker.execute(() => 
    withRetry(fetchWithTimeout, retryOptions)
  );
};

// Graceful degradation helper
export const withGracefulDegradation = <T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>,
  errorCondition?: (error: any) => boolean
) => {
  return async (): Promise<T> => {
    try {
      return await primaryFn();
    } catch (error) {
      if (errorCondition && !errorCondition(error)) {
        throw error;
      }
      
      console.warn('Primary function failed, using fallback:', error);
      return await fallbackFn();
    }
  };
};

// Error aggregation for batch operations
export class ErrorAggregator {
  private errors: Array<{ operation: string; error: any }> = [];

  add(operation: string, error: any) {
    this.errors.push({ operation, error });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors() {
    return [...this.errors];
  }

  clear() {
    this.errors = [];
  }

  createSummaryError(): Error {
    if (this.errors.length === 0) {
      return new Error('No errors to summarize');
    }

    const summary = this.errors
      .map(({ operation, error }) => `${operation}: ${error.message}`)
      .join('; ');

    return new Error(`Multiple operations failed: ${summary}`);
  }
}