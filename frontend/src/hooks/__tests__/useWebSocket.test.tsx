import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useWebSocket, useConnectionStatus } from '../useWebSocket';
import { webSocketService } from '../../services/websocket';
import uiSlice from '../../store/slices/uiSlice';
import fleetSlice from '../../store/slices/fleetSlice';
import alertSlice from '../../store/slices/alertSlice';
import dashboardSlice from '../../store/slices/dashboardSlice';

// Mock the WebSocket service
vi.mock('../../services/websocket', () => ({
  webSocketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    getConnectionState: vi.fn(() => 'disconnected'),
    setConflictResolutionStrategy: vi.fn(),
    getLastSyncTimestamp: vi.fn(() => null),
    addPendingUpdate: vi.fn(),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      ui: uiSlice,
      fleet: fleetSlice,
      alerts: alertSlice,
      dashboard: dashboardSlice,
    },
  });
};

const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useWebSocket Hook', () => {
  let store: ReturnType<typeof createTestStore>;
  let mockConnect: Mock;
  let mockDisconnect: Mock;
  let mockSend: Mock;
  let mockGetConnectionState: Mock;

  beforeEach(() => {
    store = createTestStore();
    mockConnect = webSocketService.connect as Mock;
    mockDisconnect = webSocketService.disconnect as Mock;
    mockSend = webSocketService.send as Mock;
    mockGetConnectionState = webSocketService.getConnectionState as Mock;
    
    vi.clearAllMocks();
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should auto-connect by default when online', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      expect(mockConnect).toHaveBeenCalled();
    });

    it('should not auto-connect when autoConnect is false', () => {
      renderHook(() => useWebSocket({ autoConnect: false }), {
        wrapper: createWrapper(store),
      });

      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('should not auto-connect when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
      });

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('should provide connect function', () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.connect();
      });

      expect(mockConnect).toHaveBeenCalled();
    });

    it('should provide disconnect function', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.disconnect();
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should provide send function', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      const message = { type: 'test', data: 'test' };

      act(() => {
        result.current.send(message);
      });

      expect(mockSend).toHaveBeenCalledWith(message);
    });
  });

  describe('Connection State', () => {
    it('should return connection state from store', () => {
      // Set connection state in store
      store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connected' });

      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.connectionState).toBe('connected');
      expect(result.current.isConnected).toBe(true);
    });

    it('should return offline state from store', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        store.dispatch({ type: 'ui/setOfflineStatus', payload: true });
      });

      expect(result.current.isOffline).toBe(true);
    });
  });

  describe('Online/Offline Handling', () => {
    it('should handle online event', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      // Simulate going offline then online
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));

      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));

      // Should dispatch setOfflineStatus(false)
      const state = store.getState();
      expect(state.ui.isOffline).toBe(false);
    });

    it('should handle offline event', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));

      expect(mockDisconnect).toHaveBeenCalled();
      
      const state = store.getState();
      expect(state.ui.isOffline).toBe(true);
    });
  });

  describe('Callback Handling', () => {
    it('should call onConnect callback when connection is established', () => {
      const onConnect = vi.fn();
      
      renderHook(() => useWebSocket({ onConnect }), {
        wrapper: createWrapper(store),
      });

      // Simulate connection state change
      act(() => {
        store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connected' });
      });

      expect(onConnect).toHaveBeenCalled();
    });

    it('should call onDisconnect callback when connection is lost', () => {
      const onDisconnect = vi.fn();
      
      // Start with connected state
      store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connected' });
      
      renderHook(() => useWebSocket({ onDisconnect }), {
        wrapper: createWrapper(store),
      });

      // Simulate disconnection
      act(() => {
        store.dispatch({ type: 'ui/setConnectionStatus', payload: 'disconnected' });
      });

      expect(onDisconnect).toHaveBeenCalled();
    });

    it('should call onReconnect callback when reconnecting after being connected', () => {
      const onReconnect = vi.fn();
      
      renderHook(() => useWebSocket({ onReconnect }), {
        wrapper: createWrapper(store),
      });

      // Simulate connection sequence: connecting -> connected -> reconnecting -> connected
      act(() => {
        store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connecting' });
      });
      
      act(() => {
        store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connected' });
      });
      
      act(() => {
        store.dispatch({ type: 'ui/setConnectionStatus', payload: 'reconnecting' });
      });
      
      act(() => {
        store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connected' });
      });

      expect(onReconnect).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect on unmount when auto-connect is enabled', () => {
      const { unmount } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(store),
      });

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should not disconnect on unmount when auto-connect is disabled', () => {
      const { unmount } = renderHook(() => useWebSocket({ autoConnect: false }), {
        wrapper: createWrapper(store),
      });

      mockDisconnect.mockClear();
      unmount();

      expect(mockDisconnect).not.toHaveBeenCalled();
    });
  });
});

describe('useConnectionStatus Hook', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should return connection status from store', () => {
    store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connected' });

    const { result } = renderHook(() => useConnectionStatus(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.connectionState).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.statusColor).toBe('green');
    expect(result.current.statusText).toBe('Connected');
  });

  it('should return offline status when offline', () => {
    store.dispatch({ type: 'ui/setOfflineStatus', payload: true });

    const { result } = renderHook(() => useConnectionStatus(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.statusColor).toBe('gray');
    expect(result.current.statusText).toBe('Offline');
  });

  it('should return correct status colors for different connection states', () => {
    const { result, rerender } = renderHook(() => useConnectionStatus(), {
      wrapper: createWrapper(store),
    });

    // Test connecting state
    act(() => {
      store.dispatch({ type: 'ui/setConnectionStatus', payload: 'connecting' });
    });
    rerender();
    expect(result.current.statusColor).toBe('yellow');
    expect(result.current.statusText).toBe('Connecting...');

    // Test reconnecting state
    act(() => {
      store.dispatch({ type: 'ui/setConnectionStatus', payload: 'reconnecting' });
    });
    rerender();
    expect(result.current.statusColor).toBe('yellow');
    expect(result.current.statusText).toBe('Reconnecting...');

    // Test error state
    act(() => {
      store.dispatch({ type: 'ui/setConnectionStatus', payload: 'error' });
    });
    rerender();
    expect(result.current.statusColor).toBe('red');
    expect(result.current.statusText).toBe('Connection Error');

    // Test disconnected state
    act(() => {
      store.dispatch({ type: 'ui/setConnectionStatus', payload: 'disconnected' });
    });
    rerender();
    expect(result.current.statusColor).toBe('red');
    expect(result.current.statusText).toBe('Disconnected');
  });
});