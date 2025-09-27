import React from 'react';

// Performance monitoring utilities
export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'api' | 'user-interaction' | 'navigation';
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private maxMetrics = 1000; // Prevent memory leaks

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.addMetric({
              name: 'long-task',
              duration: entry.duration,
              timestamp: entry.startTime,
              type: 'render',
              metadata: {
                entryType: entry.entryType,
              },
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Observe navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const navEntry = entry as PerformanceNavigationTiming;
            this.addMetric({
              name: 'navigation',
              duration: navEntry.loadEventEnd - navEntry.fetchStart,
              timestamp: navEntry.fetchStart,
              type: 'navigation',
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstPaint: navEntry.loadEventStart - navEntry.fetchStart,
                type: navEntry.type,
              },
            });
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.duration > 1000) { // Only track slow resources
              this.addMetric({
                name: 'slow-resource',
                duration: resourceEntry.duration,
                timestamp: resourceEntry.startTime,
                type: 'api',
                metadata: {
                  name: resourceEntry.name,
                  size: resourceEntry.transferSize,
                  type: resourceEntry.initiatorType,
                },
              });
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Prevent memory leaks by limiting stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2);
    }

    // Log performance issues in development
    if (import.meta.env.DEV) {
      if (metric.duration > 100 && metric.type === 'render') {
        console.warn(`Slow render detected: ${metric.name} took ${metric.duration}ms`);
      }
      if (metric.duration > 1000 && metric.type === 'api') {
        console.warn(`Slow API call detected: ${metric.name} took ${metric.duration}ms`);
      }
    }
  }

  getMetrics(type?: PerformanceMetrics['type']): PerformanceMetrics[] {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance measurement decorator
export const measurePerformance = (name: string, type: PerformanceMetrics['type'] = 'render') => {
  return <T extends (...args: any[]) => any>(
    _target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const originalMethod = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        
        performanceMonitor.addMetric({
          name,
          duration: endTime - startTime,
          timestamp: startTime,
          type,
          metadata: {
            method: propertyKey,
            args: args.length,
          },
        });
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        
        performanceMonitor.addMetric({
          name: `${name}-error`,
          duration: endTime - startTime,
          timestamp: startTime,
          type,
          metadata: {
            method: propertyKey,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        
        throw error;
      }
    }) as any;

    return descriptor;
  };
};

// Hook for measuring component render performance
export const useMeasureRender = (componentName: string) => {
  const startTime = React.useRef<number>(0);
  
  React.useLayoutEffect(() => {
    startTime.current = performance.now();
  });

  React.useEffect(() => {
    if (startTime.current) {
      const endTime = performance.now();
      performanceMonitor.addMetric({
        name: `${componentName}-render`,
        duration: endTime - startTime.current,
        timestamp: startTime.current,
        type: 'render',
      });
    }
  });
};

// Function to measure async operations
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  type: PerformanceMetrics['type'] = 'api'
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    
    performanceMonitor.addMetric({
      name,
      duration: endTime - startTime,
      timestamp: startTime,
      type,
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    performanceMonitor.addMetric({
      name: `${name}-error`,
      duration: endTime - startTime,
      timestamp: startTime,
      type,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    
    throw error;
  }
};

// Function to measure synchronous operations
export const measureSync = <T>(
  name: string,
  fn: () => T,
  type: PerformanceMetrics['type'] = 'render'
): T => {
  const startTime = performance.now();
  
  try {
    const result = fn();
    const endTime = performance.now();
    
    performanceMonitor.addMetric({
      name,
      duration: endTime - startTime,
      timestamp: startTime,
      type,
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    performanceMonitor.addMetric({
      name: `${name}-error`,
      duration: endTime - startTime,
      timestamp: startTime,
      type,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    
    throw error;
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
};

// Bundle size analysis helper
export const analyzeBundleSize = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  return {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    totalResources: scripts.length + stylesheets.length,
  };
};

// Performance report generator
export const generatePerformanceReport = () => {
  const metrics = performanceMonitor.getMetrics();
  const memoryUsage = getMemoryUsage();
  const bundleInfo = analyzeBundleSize();
  
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {
      total: metrics.length,
      byType: {
        render: metrics.filter(m => m.type === 'render').length,
        api: metrics.filter(m => m.type === 'api').length,
        navigation: metrics.filter(m => m.type === 'navigation').length,
        userInteraction: metrics.filter(m => m.type === 'user-interaction').length,
      },
      averages: {
        render: performanceMonitor.getAverageMetric('render'),
        api: performanceMonitor.getAverageMetric('api'),
      },
      slowOperations: metrics.filter(m => m.duration > 100).length,
    },
    memory: memoryUsage,
    bundle: bundleInfo,
    recommendations: generateRecommendations(metrics, memoryUsage),
  };
  
  return report;
};

const generateRecommendations = (
  metrics: PerformanceMetrics[], 
  memoryUsage: ReturnType<typeof getMemoryUsage>
): string[] => {
  const recommendations: string[] = [];
  
  const slowRenders = metrics.filter(m => m.type === 'render' && m.duration > 16);
  if (slowRenders.length > 0) {
    recommendations.push(`${slowRenders.length} slow renders detected. Consider using React.memo or useMemo.`);
  }
  
  const slowAPIs = metrics.filter(m => m.type === 'api' && m.duration > 1000);
  if (slowAPIs.length > 0) {
    recommendations.push(`${slowAPIs.length} slow API calls detected. Consider implementing caching or pagination.`);
  }
  
  if (memoryUsage && memoryUsage.percentage > 80) {
    recommendations.push('High memory usage detected. Consider implementing virtual scrolling or lazy loading.');
  }
  
  const longTasks = metrics.filter(m => m.name === 'long-task');
  if (longTasks.length > 0) {
    recommendations.push(`${longTasks.length} long tasks detected. Consider breaking up large operations.`);
  }
  
  return recommendations;
};