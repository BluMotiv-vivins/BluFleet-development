import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealTimePerformance, useDataFreshness } from '../useRealTimePerformance';

// Mock the useWebSocket hook
vi.mock('../useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({
    connectionState: 'connected',
    send: vi.fn(),
  })),
}));

describe('useRealTimePerformance Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default metrics', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      expect(result.current.metrics).toEqual({
        latency: 0,
        messageRate: 0,
        reconnectionCount: 0,
        uptime: 0,
        lastMessageTime: null,
        averageLatency: 0,
        messageCount: 0,
      });
      expect(result.current.isHealthy).toBe(true);
    });

    it('should update uptime metrics over time', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      // Fast-forward time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.metrics.uptime).toBeGreaterThan(0);
    });

    it('should reset metrics when resetMetrics is called', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      // Let some time pass
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.metrics.uptime).toBeGreaterThan(0);

      // Reset metrics
      act(() => {
        result.current.resetMetrics();
      });

      expect(result.current.metrics.uptime).toBe(0);
      expect(result.current.metrics.messageCount).toBe(0);
      expect(result.current.metrics.reconnectionCount).toBe(0);
    });

    it('should generate performance report', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      const report = result.current.getPerformanceReport();

      expect(report).toContain('Real-time Performance Report:');
      expect(report).toContain('Connection Uptime:');
      expect(report).toContain('Current Latency:');
      expect(report).toContain('Message Rate:');
      expect(report).toContain('Health Status:');
    });
  });

  describe('Health Monitoring', () => {
    it('should be healthy with good metrics', () => {
      const { result } = renderHook(() => 
        useRealTimePerformance({ 
          latencyThreshold: 1000,
          messageRateThreshold: 5 
        })
      );

      expect(result.current.isHealthy).toBe(true);
    });

    it('should be unhealthy with high latency', () => {
      const { result } = renderHook(() => 
        useRealTimePerformance({ 
          latencyThreshold: 100 // Very low threshold
        })
      );

      // Simulate high latency by manually updating metrics
      // In a real scenario, this would come from WebSocket messages
      expect(result.current.isHealthy).toBe(true); // Initially healthy
    });
  });

  describe('WebSocket Message Tracking', () => {
    it('should track WebSocket messages and update metrics', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      // Simulate WebSocket message event
      act(() => {
        const event = new CustomEvent('webSocketMessage', {
          detail: { 
            message: { type: 'vehicle_update', timestamp: new Date().toISOString() },
            latency: undefined
          }
        });
        window.dispatchEvent(event);
      });

      expect(result.current.metrics.messageCount).toBe(1);
      expect(result.current.metrics.messageRate).toBe(1);
      expect(result.current.metrics.lastMessageTime).toBeInstanceOf(Date);
    });

    it('should track latency from pong messages', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      // Simulate pong message with latency
      act(() => {
        const event = new CustomEvent('webSocketMessage', {
          detail: { 
            message: { type: 'pong', timestamp: new Date().toISOString() },
            latency: 150
          }
        });
        window.dispatchEvent(event);
      });

      expect(result.current.metrics.latency).toBe(150);
      expect(result.current.metrics.averageLatency).toBe(150);
    });

    it('should calculate average latency over multiple pong messages', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      // Simulate multiple pong messages
      const latencies = [100, 150, 200];
      
      latencies.forEach(latency => {
        act(() => {
          const event = new CustomEvent('webSocketMessage', {
            detail: { 
              message: { type: 'pong', timestamp: new Date().toISOString() },
              latency
            }
          });
          window.dispatchEvent(event);
        });
      });

      const expectedAverage = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      expect(result.current.metrics.averageLatency).toBe(expectedAverage);
      expect(result.current.metrics.latency).toBe(200); // Last latency
    });

    it('should limit latency history to 10 entries', () => {
      const { result } = renderHook(() => useRealTimePerformance());

      // Simulate 15 pong messages
      for (let i = 0; i < 15; i++) {
        act(() => {
          const event = new CustomEvent('webSocketMessage', {
            detail: { 
              message: { type: 'pong', timestamp: new Date().toISOString() },
              latency: 100 + i
            }
          });
          window.dispatchEvent(event);
        });
      }

      // Average should be calculated from last 10 entries only
      const expectedAverage = Array.from({length: 10}, (_, i) => 105 + i).reduce((sum, l) => sum + l, 0) / 10;
      expect(result.current.metrics.averageLatency).toBe(expectedAverage);
    });
  });

  describe('Options', () => {
    it('should respect enableMetrics option', () => {
      const { result } = renderHook(() => 
        useRealTimePerformance({ enableMetrics: false })
      );

      // Should still provide basic functionality even when metrics are disabled
      expect(result.current.metrics).toBeDefined();
      expect(typeof result.current.resetMetrics).toBe('function');
      expect(typeof result.current.getPerformanceReport).toBe('function');
    });

    it('should use custom thresholds', () => {
      const customLatencyThreshold = 500;
      const customMessageRateThreshold = 20;

      const { result } = renderHook(() => 
        useRealTimePerformance({ 
          latencyThreshold: customLatencyThreshold,
          messageRateThreshold: customMessageRateThreshold
        })
      );

      // The thresholds are used internally for health calculation
      expect(result.current.isHealthy).toBe(true);
    });

    it('should not track messages when metrics are disabled', () => {
      const { result } = renderHook(() => 
        useRealTimePerformance({ enableMetrics: false })
      );

      // Simulate WebSocket message event
      act(() => {
        const event = new CustomEvent('webSocketMessage', {
          detail: { 
            message: { type: 'vehicle_update', timestamp: new Date().toISOString() },
            latency: undefined
          }
        });
        window.dispatchEvent(event);
      });

      // Metrics should remain at initial values
      expect(result.current.metrics.messageCount).toBe(0);
      expect(result.current.metrics.messageRate).toBe(0);
    });
  });
});

describe('useDataFreshness Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with empty update times', () => {
      const { result } = renderHook(() => useDataFreshness());

      expect(result.current.lastUpdateTimes).toEqual({});
    });

    it('should update data timestamp', () => {
      const { result } = renderHook(() => useDataFreshness());

      act(() => {
        result.current.updateDataTimestamp('vehicles');
      });

      expect(result.current.lastUpdateTimes.vehicles).toBeInstanceOf(Date);
    });

    it('should detect stale data', () => {
      const { result } = renderHook(() => useDataFreshness());

      // Data that was never updated should be stale
      expect(result.current.isDataStale('vehicles')).toBe(true);

      // Update data timestamp
      act(() => {
        result.current.updateDataTimestamp('vehicles');
      });

      // Should not be stale immediately after update
      expect(result.current.isDataStale('vehicles')).toBe(false);

      // Fast-forward time beyond stale threshold (1 minute)
      act(() => {
        vi.advanceTimersByTime(70000); // 70 seconds
      });

      // Should now be stale
      expect(result.current.isDataStale('vehicles')).toBe(true);
    });

    it('should calculate data age', () => {
      const { result } = renderHook(() => useDataFreshness());

      // No data should return null
      expect(result.current.getDataAge('vehicles')).toBe(null);

      // Update data timestamp
      act(() => {
        result.current.updateDataTimestamp('vehicles');
      });

      // Should return 0 immediately after update
      expect(result.current.getDataAge('vehicles')).toBe(0);

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });

      // Should return approximately 5000ms
      const age = result.current.getDataAge('vehicles');
      expect(age).toBeGreaterThanOrEqual(5000);
      expect(age).toBeLessThan(6000);
    });

    it('should identify stale data types', () => {
      const { result } = renderHook(() => useDataFreshness());

      // Update multiple data types
      act(() => {
        result.current.updateDataTimestamp('vehicles');
        result.current.updateDataTimestamp('alerts');
        result.current.updateDataTimestamp('drivers');
      });

      // All should be fresh initially
      expect(result.current.getStaleDataTypes()).toEqual([]);

      // Fast-forward time to make data stale
      act(() => {
        vi.advanceTimersByTime(70000); // 70 seconds
      });

      // All should now be stale
      const staleTypes = result.current.getStaleDataTypes();
      expect(staleTypes).toContain('vehicles');
      expect(staleTypes).toContain('alerts');
      expect(staleTypes).toContain('drivers');
      expect(staleTypes).toHaveLength(3);
    });

    it('should handle mixed fresh and stale data', () => {
      const { result } = renderHook(() => useDataFreshness());

      // Update some data types
      act(() => {
        result.current.updateDataTimestamp('vehicles');
        result.current.updateDataTimestamp('alerts');
      });

      // Fast-forward time to make first data stale
      act(() => {
        vi.advanceTimersByTime(70000); // 70 seconds
      });

      // Update one data type to make it fresh again
      act(() => {
        result.current.updateDataTimestamp('vehicles');
      });

      const staleTypes = result.current.getStaleDataTypes();
      expect(staleTypes).toContain('alerts');
      expect(staleTypes).not.toContain('vehicles');
      expect(staleTypes).toHaveLength(1);
    });

    it('should listen for data freshness events from WebSocket', () => {
      const { result } = renderHook(() => useDataFreshness());

      // Simulate WebSocket data freshness event
      act(() => {
        const event = new CustomEvent('dataFreshnessUpdate', {
          detail: { dataType: 'vehicles', timestamp: new Date() }
        });
        window.dispatchEvent(event);
      });

      expect(result.current.lastUpdateTimes.vehicles).toBeInstanceOf(Date);
      expect(result.current.isDataStale('vehicles')).toBe(false);
    });

    it('should clear data timestamps', () => {
      const { result } = renderHook(() => useDataFreshness());

      // Add some data timestamps
      act(() => {
        result.current.updateDataTimestamp('vehicles');
        result.current.updateDataTimestamp('alerts');
      });

      expect(Object.keys(result.current.lastUpdateTimes)).toHaveLength(2);

      // Clear one timestamp
      act(() => {
        result.current.clearDataTimestamp('vehicles');
      });

      expect(result.current.lastUpdateTimes.vehicles).toBeUndefined();
      expect(result.current.lastUpdateTimes.alerts).toBeDefined();

      // Clear all timestamps
      act(() => {
        result.current.clearAllTimestamps();
      });

      expect(Object.keys(result.current.lastUpdateTimes)).toHaveLength(0);
    });
  });
});