import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Toast, { ToastContainer } from '../Toast';
import uiSlice from '../../../store/slices/uiSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import alertSlice from '../../../store/slices/alertSlice';
import dashboardSlice from '../../../store/slices/dashboardSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice,
      fleet: fleetSlice,
      alerts: alertSlice,
      dashboard: dashboardSlice,
    },
    preloadedState: {
      ui: {
        connectionStatus: 'connected',
        isOffline: false,
        sidebarCollapsed: false,
        activeRoute: '/',
        theme: 'light',
        notifications: null,
        modals: {
          vehicleDetail: { open: false, vehicleId: null },
          driverDetail: { open: false, driverId: null },
        },
      },
      ...initialState,
    },
  });
};

const renderWithStore = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render toast with message', () => {
      render(
        <Toast
          message="Test notification"
          type="info"
        />
      );

      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    it('should render different toast types with correct styling', () => {
      const types = ['success', 'error', 'warning', 'info'] as const;
      
      types.forEach(type => {
        const { unmount } = render(
          <Toast
            message={`${type} message`}
            type={type}
          />
        );

        expect(screen.getByText(`${type} message`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should render close button', () => {
      render(
        <Toast
          message="Test notification"
          type="info"
        />
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss Functionality', () => {
    it('should auto-dismiss after default duration', () => {
      const onClose = vi.fn();
      
      render(
        <Toast
          message="Test notification"
          type="info"
          onClose={onClose}
        />
      );

      expect(screen.getByText('Test notification')).toBeInTheDocument();

      // Fast-forward time by default duration (5 seconds)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Wait for animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('should auto-dismiss after custom duration', () => {
      const onClose = vi.fn();
      
      render(
        <Toast
          message="Test notification"
          type="info"
          duration={2000}
          onClose={onClose}
        />
      );

      // Fast-forward time by custom duration (2 seconds)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Wait for animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('should not auto-dismiss when duration is 0', () => {
      const onClose = vi.fn();
      
      render(
        <Toast
          message="Test notification"
          type="info"
          duration={0}
          onClose={onClose}
        />
      );

      // Fast-forward time significantly
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });
  });

  describe('Manual Dismiss', () => {
    it('should dismiss when close button is clicked', () => {
      const onClose = vi.fn();
      
      render(
        <Toast
          message="Test notification"
          type="info"
          onClose={onClose}
        />
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      // Wait for animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Toast Icons', () => {
    it('should render success icon for success type', () => {
      render(
        <Toast
          message="Success message"
          type="success"
        />
      );

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-green-400');
    });

    it('should render error icon for error type', () => {
      render(
        <Toast
          message="Error message"
          type="error"
        />
      );

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-400');
    });

    it('should render warning icon for warning type', () => {
      render(
        <Toast
          message="Warning message"
          type="warning"
        />
      );

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-400');
    });

    it('should render info icon for info type', () => {
      render(
        <Toast
          message="Info message"
          type="info"
        />
      );

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-blue-400');
    });
  });
});

describe('ToastContainer Component', () => {
  it('should not render when no notification is active', () => {
    const store = createTestStore();
    
    const { container } = renderWithStore(<ToastContainer />, store);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render toast when notification is active', () => {
    const store = createTestStore({
      ui: {
        connectionStatus: 'connected',
        isOffline: false,
        sidebarCollapsed: false,
        activeRoute: '/',
        theme: 'light',
        notifications: {
          show: true,
          message: 'Test notification from store',
          type: 'success',
        },
        modals: {
          vehicleDetail: { open: false, vehicleId: null },
          driverDetail: { open: false, driverId: null },
        },
      },
    });

    renderWithStore(<ToastContainer />, store);
    
    expect(screen.getByText('Test notification from store')).toBeInTheDocument();
  });

  it('should dispatch hideNotification when toast is closed', () => {
    vi.useFakeTimers();
    
    const store = createTestStore({
      ui: {
        connectionStatus: 'connected',
        isOffline: false,
        sidebarCollapsed: false,
        activeRoute: '/',
        theme: 'light',
        notifications: {
          show: true,
          message: 'Test notification from store',
          type: 'info',
        },
        modals: {
          vehicleDetail: { open: false, vehicleId: null },
          driverDetail: { open: false, driverId: null },
        },
      },
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithStore(<ToastContainer />, store);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // Wait for animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ui/hideNotification',
      })
    );
    
    vi.useRealTimers();
  });
});