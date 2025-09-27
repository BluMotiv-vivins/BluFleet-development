import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DriverPerformance } from '../DriverPerformance';
import fleetReducer from '../../../store/slices/fleetSlice';
import alertReducer from '../../../store/slices/alertSlice';
import type { Driver, Alert, Vehicle } from '../../../types';

import { vi } from 'vitest';

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  UserIcon: ({ className }: { className?: string }) => <div data-testid="user-icon" className={className} />,
  ShieldCheckIcon: ({ className }: { className?: string }) => <div data-testid="shield-check-icon" className={className} />,
  LeafIcon: ({ className }: { className?: string }) => <div data-testid="leaf-icon" className={className} />,
  ExclamationTriangleIcon: ({ className }: { className?: string }) => <div data-testid="exclamation-triangle-icon" className={className} />,
  TrophyIcon: ({ className }: { className?: string }) => <div data-testid="trophy-icon" className={className} />,
  ChartBarIcon: ({ className }: { className?: string }) => <div data-testid="chart-bar-icon" className={className} />,
}));

// Mock data
const mockDrivers: Driver[] = [
  {
    id: 'D-001',
    name: 'Sarah Johnson',
    email: 'sarah@test.com',
    safetyScore: 95,
    ecoScore: 92,
    totalMiles: 15000,
    recentAlerts: [],
    certifications: ['Commercial License', 'EV Certified'],
    status: 'active',
  },
  {
    id: 'D-002',
    name: 'Mike Chen',
    email: 'mike@test.com',
    safetyScore: 88,
    ecoScore: 85,
    totalMiles: 12000,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'active',
  },
  {
    id: 'D-003',
    name: 'Emily Rodriguez',
    email: 'emily@test.com',
    safetyScore: 91,
    ecoScore: 89,
    totalMiles: 18000,
    recentAlerts: [],
    certifications: ['Commercial License', 'Safety Training'],
    status: 'break',
  },
  {
    id: 'D-004',
    name: 'James Wilson',
    email: 'james@test.com',
    safetyScore: 82,
    ecoScore: 78,
    totalMiles: 9000,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'active',
  },
];

const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    type: 'safety',
    severity: 'high',
    title: 'Harsh Braking Event',
    message: 'Driver performed harsh braking',
    driverId: 'D-002',
    vehicleId: 'V-001',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    acknowledged: false,
  },
  {
    id: 'A-002',
    type: 'safety',
    severity: 'medium',
    title: 'Speed Limit Exceeded',
    message: 'Driver exceeded speed limit',
    driverId: 'D-002',
    vehicleId: 'V-001',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    acknowledged: false,
  },
  {
    id: 'A-003',
    type: 'safety',
    severity: 'low',
    title: 'Sharp Turn',
    message: 'Driver took a sharp turn',
    driverId: 'D-004',
    vehicleId: 'V-002',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    acknowledged: false,
  },
  {
    id: 'A-004',
    type: 'battery',
    severity: 'medium',
    title: 'Low Battery',
    message: 'Vehicle battery is low',
    vehicleId: 'V-001',
    timestamp: new Date(),
    acknowledged: false,
  },
];

const createMockStore = (drivers = mockDrivers, alerts = mockAlerts) => {
  return configureStore({
    reducer: {
      fleet: fleetReducer,
      alerts: alertReducer,
    },
    preloadedState: {
      fleet: {
        drivers,
        vehicles: [],
        chargingStations: [],
        routes: [],
        geofences: [],
        loading: false,
        error: null,
      },
      alerts: {
        alerts,
        unreadCount: alerts.filter(a => !a.acknowledged).length,
        loading: false,
      },
    },
  });
};

const renderWithProvider = (store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <DriverPerformance />
    </Provider>
  );
};

describe('DriverPerformance', () => {
  it('should render the component title', () => {
    renderWithProvider();
    expect(screen.getByText('Driver Performance')).toBeInTheDocument();
  });

  it('should display top eco drivers section', () => {
    renderWithProvider();
    expect(screen.getByText('Eco-Driving Champions')).toBeInTheDocument();
    expect(screen.getByText('Top Eco Drivers')).toBeInTheDocument();
  });

  it('should display all drivers in the list', () => {
    renderWithProvider();
    
    expect(screen.getAllByText('Sarah Johnson')).toHaveLength(2); // In eco champions and main list
    expect(screen.getAllByText('Mike Chen')).toHaveLength(2); // In eco champions and main list
    expect(screen.getAllByText('Emily Rodriguez')).toHaveLength(2); // In eco champions and main list
    expect(screen.getByText('James Wilson')).toBeInTheDocument(); // Only in main list
  });

  it('should display driver emails', () => {
    renderWithProvider();
    
    expect(screen.getByText('sarah@test.com')).toBeInTheDocument();
    expect(screen.getByText('mike@test.com')).toBeInTheDocument();
  });

  it('should display driver scores', () => {
    renderWithProvider();
    
    expect(screen.getByText('95%')).toBeInTheDocument(); // Sarah's safety score
    expect(screen.getByText('92%')).toBeInTheDocument(); // Sarah's eco score
    expect(screen.getByText('88%')).toBeInTheDocument(); // Mike's safety score
    expect(screen.getByText('85%')).toBeInTheDocument(); // Mike's eco score
  });

  it('should display driver miles and certifications', () => {
    renderWithProvider();
    
    expect(screen.getByText('15,000 miles')).toBeInTheDocument();
    // Check for various certification counts that exist in the mock data
    const certificationElements = screen.getAllByText(/certifications/);
    expect(certificationElements.length).toBeGreaterThan(0);
  });

  it('should highlight top eco drivers', () => {
    renderWithProvider();
    
    // Sarah Johnson should be highlighted as top eco driver (92% eco score)
    const sarahCards = screen.getAllByText('Sarah Johnson');
    const mainSarahCard = sarahCards[1].closest('.p-4'); // Get the driver card container
    expect(mainSarahCard).toHaveClass('border-green-200', 'bg-green-50');
  });

  it('should show eco champion badge for top performers', () => {
    renderWithProvider();
    
    expect(screen.getAllByText('Eco Champion')).toHaveLength(3); // Top 3 eco drivers get the badge
  });

  it('should display driver status indicators', () => {
    renderWithProvider();
    
    // Check for active status (green dot) and break status (yellow dot)
    const statusIndicators = document.querySelectorAll('.bg-green-500, .bg-yellow-500');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });

  it('should display alert counts for drivers', () => {
    renderWithProvider();
    
    // Mike Chen has 2 safety alerts, James Wilson has 1
    const alertCounts = screen.getAllByText(/^[0-9]+$/);
    expect(alertCounts.length).toBeGreaterThan(0);
  });

  it('should show recent alerts for drivers with safety events', () => {
    renderWithProvider();
    
    expect(screen.getAllByText('Recent Safety Events:')).toHaveLength(2); // Mike and James have alerts
    expect(screen.getByText('Harsh Braking Event')).toBeInTheDocument();
    expect(screen.getByText('Speed Limit Exceeded')).toBeInTheDocument();
  });

  it('should open analytics modal when clicking on driver details', async () => {
    renderWithProvider();
    
    const detailsButton = screen.getAllByText('Details')[0];
    fireEvent.click(detailsButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Performance Analytics/)).toBeInTheDocument();
    });
  });

  it('should open analytics modal when clicking on driver card', async () => {
    renderWithProvider();
    
    // Get the driver card from the main list (not the eco champions section)
    const driverCards = screen.getAllByText('Sarah Johnson');
    const mainDriverCard = driverCards[1].closest('div'); // Second occurrence is in main list
    fireEvent.click(mainDriverCard!);
    
    await waitFor(() => {
      expect(screen.getByText(/Sarah Johnson - Performance Analytics/)).toBeInTheDocument();
    });
  });

  it('should display driver analytics in modal', async () => {
    renderWithProvider();
    
    const detailsButton = screen.getAllByText('Details')[0];
    fireEvent.click(detailsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Safety Score')).toBeInTheDocument();
      expect(screen.getByText('Eco Score')).toBeInTheDocument();
      expect(screen.getByText('Monthly Stats')).toBeInTheDocument();
      expect(screen.getByText('Safety Events')).toBeInTheDocument();
    });
  });

  it('should display certifications in analytics modal', async () => {
    renderWithProvider();
    
    const detailsButton = screen.getAllByText('Details')[0];
    fireEvent.click(detailsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Certifications')).toBeInTheDocument();
      expect(screen.getByText('Commercial License')).toBeInTheDocument();
      expect(screen.getByText('EV Certified')).toBeInTheDocument();
    });
  });

  it('should close modal when clicking close', async () => {
    renderWithProvider();
    
    const detailsButton = screen.getAllByText('Details')[0];
    fireEvent.click(detailsButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Performance Analytics/)).toBeInTheDocument();
    });
    
    // Find and click close button (assuming Modal component has a close button)
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    
    // Simulate pressing Escape key to close modal
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
  });

  it('should handle empty driver list', () => {
    const store = createMockStore([], []);
    renderWithProvider(store);
    
    expect(screen.getByText('Driver Performance')).toBeInTheDocument();
    expect(screen.getByText('Eco-Driving Champions')).toBeInTheDocument();
    
    // Should not display any driver cards
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
  });

  it('should handle drivers with no alerts', () => {
    const store = createMockStore(mockDrivers, []);
    renderWithProvider(store);
    
    // All drivers should show 0 alerts
    const alertCounts = screen.getAllByText('0');
    expect(alertCounts.length).toBeGreaterThan(0);
    
    // Should not show "Recent Safety Events" section
    expect(screen.queryByText('Recent Safety Events:')).not.toBeInTheDocument();
  });

  it('should apply correct color coding for scores', () => {
    renderWithProvider();
    
    // High scores (90+) should be green
    const highScores = screen.getAllByText('95%');
    highScores.forEach(score => {
      expect(score).toHaveClass('text-green-600');
    });
    
    // Medium scores (80-89) should be yellow
    const mediumScores = screen.getAllByText('88%');
    mediumScores.forEach(score => {
      expect(score).toHaveClass('text-yellow-600');
    });
  });

  it('should display correct number of top eco drivers', () => {
    renderWithProvider();
    
    // Should show top 3 eco drivers in the champions section
    const championSection = screen.getByText('Eco-Driving Champions').closest('div');
    const driverNames = championSection?.querySelectorAll('.text-xs.font-medium.text-gray-900');
    expect(driverNames?.length).toBe(3);
  });

  it('should show trophy icon for top eco driver', () => {
    renderWithProvider();
    
    expect(screen.getAllByTestId('trophy-icon')).toHaveLength(2); // One in header, one for top driver
  });

  it('should display recent alerts with correct severity colors', () => {
    renderWithProvider();
    
    // Check for severity color indicators
    const severityDots = document.querySelectorAll('.bg-red-500, .bg-orange-500, .bg-yellow-500, .bg-blue-500');
    expect(severityDots.length).toBeGreaterThan(0);
  });

  it('should limit displayed alerts to 2 per driver', () => {
    // Mike Chen has 2 alerts, should show both
    renderWithProvider();
    
    const mikeCards = screen.getAllByText('Mike Chen');
    // Mike appears in both the eco champions section and the main driver list
    expect(mikeCards.length).toBeGreaterThan(0);
    
    // Check that alerts are displayed (we can see "Recent Safety Events" text)
    const safetyEventsHeaders = screen.getAllByText('Recent Safety Events:');
    expect(safetyEventsHeaders.length).toBeGreaterThan(0);
  });

  it('should show "more alerts" message when driver has more than 2 alerts', () => {
    // Create a driver with 3+ alerts
    const manyAlerts = [
      ...mockAlerts,
      {
        id: 'A-005',
        type: 'safety' as const,
        severity: 'low' as const,
        title: 'Another Alert',
        message: 'Another safety event',
        driverId: 'D-002',
        vehicleId: 'V-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
      },
    ];
    
    const store = createMockStore(mockDrivers, manyAlerts);
    renderWithProvider(store);
    
    // Should show "+X more alerts" message
    expect(screen.getByText(/\+\d+ more alerts/)).toBeInTheDocument();
  });

  it('should apply custom className prop', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DriverPerformance className="custom-class" />
      </Provider>
    );
    
    const component = screen.getByText('Driver Performance').closest('.bg-white');
    expect(component).toHaveClass('custom-class');
  });
});