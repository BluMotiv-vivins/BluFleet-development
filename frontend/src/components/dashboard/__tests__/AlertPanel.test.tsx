import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AlertPanel from '../AlertPanel';
import alertSlice from '../../../store/slices/alertSlice';
import fleetSlice from '../../../store/slices/fleetSlice';
import type { Alert } from '../../../types';

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    type: 'battery',
    severity: 'critical',
    title: 'Critical Battery Level',
    message: 'Vehicle EV-001 battery level is critically low at 12%',
    vehicleId: 'EV-001',
    timestamp: new Date('2024-12-09T12:00:00Z'),
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'maintenance',
    severity: 'high',
    title: 'Maintenance Overdue',
    message: 'Vehicle EV-002 maintenance is overdue',
    vehicleId: 'EV-002',
    timestamp: new Date('2024-12-09T11:00:00Z'),
    acknowledged: false,
  },
  {
    id: 'A-003',
    type: 'safety',
    severity: 'medium',
    title: 'Harsh Braking Event',
    message: 'Driver John performed harsh braking on EV-003',
    vehicleId: 'EV-003',
    driverId: 'D-001',
    timestamp: new Date('2024-12-09T10:00:00Z'),
    acknowledged: true,
  },
  {
    id: 'A-004',
    type: 'geofence',
    severity: 'low',
    title: 'Geofence Entry',
    message: 'Vehicle EV-004 entered restricted area',
    vehicleId: 'EV-004',
    timestamp: new Date('2024-12-09T09:00:00Z'),
    acknowledged: false,
    resolvedAt: new Date('2024-12-09T09:30:00Z'),
  },
  {
    id: 'A-005',
    type: 'system',
    severity: 'low',
    title: 'System Update Available',
    message: 'New system update v2.1.0 is available',
    timestamp: new Date('2024-12-09T08:00:00Z'),
    acknowledged: false,
  },
];

const createMockStore = (alerts: Alert[] = mockAlerts) => {
  return configureStore({
    reducer: {
      alerts: alertSlice,
      fleet: fleetSlice,
    },
    preloadedState: {
      alerts: {
        alerts,
        unreadCount: alerts.filter(alert => !alert.acknowledged).length,
        loading: false,
        lastAutoGeneration: null,
        autoGenerationEnabled: true,
      },
      fleet: {
        vehicles: [],
        chargingStations: [],
        drivers: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
    },
  });
};

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('AlertPanel', () => {
  describe('Rendering', () => {
    it('renders the alert panel with title', () => {
      renderWithProvider(<AlertPanel />);
      
      expect(screen.getByText('Alerts & Notifications')).toBeInTheDocument();
    });

    it('displays alert count', () => {
      renderWithProvider(<AlertPanel />);
      
      expect(screen.getByText('4 of 5')).toBeInTheDocument();
    });

    it('renders filters when showFilters is true', () => {
      renderWithProvider(<AlertPanel showFilters={true} />);
      
      expect(screen.getByDisplayValue('All Severities')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Resolved')).toBeInTheDocument();
    });

    it('hides filters when showFilters is false', () => {
      renderWithProvider(<AlertPanel showFilters={false} />);
      
      expect(screen.queryByDisplayValue('All Severities')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('All Types')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      const store = createMockStore();
      store.dispatch({ type: 'alerts/setLoading', payload: true });
      
      renderWithProvider(<AlertPanel />, store);
      
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows empty state when no alerts', () => {
      const store = createMockStore([]);
      
      renderWithProvider(<AlertPanel />, store);
      
      expect(screen.getByText('No alerts to display')).toBeInTheDocument();
      expect(screen.getByText('Your fleet is running smoothly')).toBeInTheDocument();
    });
  });

  describe('Alert Display', () => {
    it('displays alerts with correct severity colors', () => {
      renderWithProvider(<AlertPanel />);
      
      // Critical alert should have red styling
      const criticalAlert = screen.getByText('Critical Battery Level').closest('.bg-red-50');
      expect(criticalAlert).toBeInTheDocument();
      
      // High alert should have orange styling
      const highAlert = screen.getByText('Maintenance Overdue').closest('.bg-orange-50');
      expect(highAlert).toBeInTheDocument();
      
      // Medium alert should have yellow styling
      const mediumAlert = screen.getByText('Harsh Braking Event').closest('.bg-yellow-50');
      expect(mediumAlert).toBeInTheDocument();
      
      // Low alert should have blue styling
      const lowAlert = screen.getByText('System Update Available').closest('.bg-blue-50');
      expect(lowAlert).toBeInTheDocument();
    });

    it('displays alert information correctly', () => {
      renderWithProvider(<AlertPanel />);
      
      // Check critical alert details
      expect(screen.getByText('Critical Battery Level')).toBeInTheDocument();
      expect(screen.getByText('Vehicle EV-001 battery level is critically low at 12%')).toBeInTheDocument();
      expect(screen.getByText('Vehicle: EV-001')).toBeInTheDocument();
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });

    it('shows vehicle and driver information when available', () => {
      renderWithProvider(<AlertPanel />);
      
      // Safety alert should show both vehicle and driver
      expect(screen.getByText('Vehicle: EV-003')).toBeInTheDocument();
      expect(screen.getByText('Driver: D-001')).toBeInTheDocument();
    });

    it('displays timestamps correctly', () => {
      renderWithProvider(<AlertPanel />);
      
      // Should show relative timestamps
      expect(screen.getAllByText(/ago/)).toHaveLength(4);
    });

    it('shows resolved status for resolved alerts', () => {
      renderWithProvider(<AlertPanel showFilters={true} />);
      
      // Enable showing resolved alerts
      const showResolvedCheckbox = screen.getByLabelText('Show Resolved');
      fireEvent.click(showResolvedCheckbox);
      
      expect(screen.getByText(/✓ Resolved/)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters alerts by severity', async () => {
      renderWithProvider(<AlertPanel />);
      
      const severityFilter = screen.getByDisplayValue('All Severities');
      fireEvent.change(severityFilter, { target: { value: 'critical' } });
      
      await waitFor(() => {
        expect(screen.getByText('Critical Battery Level')).toBeInTheDocument();
        expect(screen.queryByText('Maintenance Overdue')).not.toBeInTheDocument();
      });
    });

    it('filters alerts by type', async () => {
      renderWithProvider(<AlertPanel />);
      
      const typeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(typeFilter, { target: { value: 'battery' } });
      
      await waitFor(() => {
        expect(screen.getByText('Critical Battery Level')).toBeInTheDocument();
        expect(screen.queryByText('Maintenance Overdue')).not.toBeInTheDocument();
      });
    });

    it('toggles resolved alerts visibility', async () => {
      renderWithProvider(<AlertPanel />);
      
      // Initially resolved alerts should be hidden
      expect(screen.queryByText('Geofence Entry')).not.toBeInTheDocument();
      
      const showResolvedCheckbox = screen.getByLabelText('Show Resolved');
      fireEvent.click(showResolvedCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('Geofence Entry')).toBeInTheDocument();
      });
    });

    it('updates alert count based on filters', async () => {
      renderWithProvider(<AlertPanel />);
      
      const severityFilter = screen.getByDisplayValue('All Severities');
      fireEvent.change(severityFilter, { target: { value: 'critical' } });
      
      await waitFor(() => {
        expect(screen.getByText('1 of 5')).toBeInTheDocument();
      });
    });
  });

  describe('Alert Actions', () => {
    it('acknowledges alerts when acknowledge button is clicked', async () => {
      const store = createMockStore();
      renderWithProvider(<AlertPanel />, store);
      
      const acknowledgeButtons = screen.getAllByText('Acknowledge');
      fireEvent.click(acknowledgeButtons[0]);
      
      await waitFor(() => {
        const state = store.getState();
        const alert = state.alerts.alerts.find(a => a.id === 'A-001');
        expect(alert?.acknowledged).toBe(true);
      });
    });

    it('resolves alerts when resolve button is clicked', async () => {
      const store = createMockStore();
      renderWithProvider(<AlertPanel />, store);
      
      const resolveButtons = screen.getAllByText('Resolve');
      fireEvent.click(resolveButtons[0]);
      
      await waitFor(() => {
        const state = store.getState();
        const alert = state.alerts.alerts.find(a => a.id === 'A-001');
        expect(alert?.resolvedAt).toBeDefined();
      });
    });

    it('hides acknowledge button for already acknowledged alerts', () => {
      renderWithProvider(<AlertPanel />);
      
      // The acknowledged alert (A-003) should not show acknowledge button
      const acknowledgedAlert = screen.getByText('Harsh Braking Event').closest('div');
      expect(acknowledgedAlert?.querySelector('button[text="Acknowledge"]')).not.toBeInTheDocument();
    });

    it('shows resolved status instead of action buttons for resolved alerts', () => {
      renderWithProvider(<AlertPanel showFilters={true} />);
      
      // Enable showing resolved alerts
      const showResolvedCheckbox = screen.getByLabelText('Show Resolved');
      fireEvent.click(showResolvedCheckbox);
      
      const resolvedAlert = screen.getByText('Geofence Entry').closest('div');
      expect(resolvedAlert?.querySelector('button')).not.toBeInTheDocument();
      expect(screen.getByText(/✓ Resolved/)).toBeInTheDocument();
    });
  });

  describe('Priority Sorting', () => {
    it('sorts alerts by severity priority', () => {
      renderWithProvider(<AlertPanel />);
      
      const alertTitles = screen.getAllByRole('heading', { level: 4 });
      const titles = alertTitles.map(el => el.textContent);
      
      // Critical should come first, then high, medium, low
      expect(titles[0]).toBe('Critical Battery Level');
      expect(titles[1]).toBe('Maintenance Overdue');
    });

    it('sorts alerts by timestamp within same severity', () => {
      const alertsWithSameSeverity: Alert[] = [
        {
          id: 'A-001',
          type: 'battery',
          severity: 'high',
          title: 'Older Alert',
          message: 'Older alert message',
          timestamp: new Date('2024-12-09T10:00:00Z'),
          acknowledged: false,
        },
        {
          id: 'A-002',
          type: 'maintenance',
          severity: 'high',
          title: 'Newer Alert',
          message: 'Newer alert message',
          timestamp: new Date('2024-12-09T11:00:00Z'),
          acknowledged: false,
        },
      ];
      
      const store = createMockStore(alertsWithSameSeverity);
      renderWithProvider(<AlertPanel />, store);
      
      const alertTitles = screen.getAllByRole('heading', { level: 4 });
      const titles = alertTitles.map(el => el.textContent);
      
      // Newer alert should come first
      expect(titles[0]).toBe('Newer Alert');
      expect(titles[1]).toBe('Older Alert');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProvider(<AlertPanel />);
      
      const acknowledgeButtons = screen.getAllByText('Acknowledge');
      acknowledgeButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('supports keyboard navigation', () => {
      renderWithProvider(<AlertPanel />);
      
      const firstButton = screen.getAllByText('Acknowledge')[0];
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });
  });

  describe('Props', () => {
    it('respects maxDisplayed prop', () => {
      renderWithProvider(<AlertPanel maxDisplayed={2} />);
      
      expect(screen.getByText('2 of 5')).toBeInTheDocument();
      
      // Should only show 2 alerts
      const alertElements = screen.getAllByRole('heading', { level: 4 });
      expect(alertElements).toHaveLength(2);
    });

    it('applies custom className', () => {
      const { container } = renderWithProvider(<AlertPanel className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});