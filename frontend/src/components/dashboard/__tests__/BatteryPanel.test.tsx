import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BatteryPanel } from '../BatteryPanel';
import fleetSlice from '../../../store/slices/fleetSlice';
import type { Vehicle } from '../../../types';

// Mock Recharts
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock the useBatteryData hook
const mockUseBatteryData = vi.fn();
vi.mock('../../../hooks/useBatteryData', () => ({
  useBatteryData: () => mockUseBatteryData(),
}));

const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Fleet Truck 001',
    type: 'truck',
    status: 'active',
    location: { lat: 47.6062, lng: -122.3321 },
    battery: {
      currentLevel: 85,
      health: 95,
      lastCharged: new Date('2024-12-09T10:00:00Z'),
      estimatedRange: 250,
    },
    alerts: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-12-09T12:00:00Z'),
  },
  {
    id: 'EV-002',
    name: 'Delivery Van 002',
    type: 'van',
    status: 'active',
    location: { lat: 45.5152, lng: -122.6784 },
    battery: {
      currentLevel: 15,
      health: 88,
      lastCharged: new Date('2024-12-09T06:00:00Z'),
      estimatedRange: 45,
    },
    alerts: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-12-09T12:00:00Z'),
  },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      fleet: fleetSlice,
    },
    preloadedState: {
      fleet: {
        vehicles: mockVehicles,
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

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('BatteryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseBatteryData.mockReturnValue({
      batteryData: {
        averageLevel: 65,
        totalCapacity: 400,
        chargingVehicles: 1,
        lowBatteryCount: 1,
        nextChargeTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        nextChargeVehicle: 'EV-002',
      },
      chargingQueue: [
        {
          vehicleId: 'EV-002',
          vehicleName: 'Delivery Van 002',
          currentBattery: 15,
          priority: 'high',
          estimatedWaitTime: 0,
          estimatedChargeTime: 97,
        },
        {
          vehicleId: 'EV-001',
          vehicleName: 'Fleet Truck 001',
          currentBattery: 60,
          priority: 'medium',
          estimatedWaitTime: 45,
          estimatedChargeTime: 30,
        },
      ],
      powerConsumption: [
        {
          hour: 0,
          consumption: 45,
          efficiency: 88,
          timestamp: new Date(),
        },
        {
          hour: 1,
          consumption: 52,
          efficiency: 91,
          timestamp: new Date(),
        },
      ],
      nextChargeCountdown: '2h 0m',
      isLoading: false,
      error: null,
      updateChargingPriority: vi.fn(),
      optimizeQueue: vi.fn(),
      refreshData: vi.fn(),
    });
  });

  it('should render battery panel with all sections', () => {
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText('Battery & Charging Management')).toBeInTheDocument();
    expect(screen.getByText('Monitor battery levels and manage charging schedules')).toBeInTheDocument();
    expect(screen.getByText('Average Battery')).toBeInTheDocument();
    expect(screen.getByText('Next Scheduled Charge')).toBeInTheDocument();
    expect(screen.getByText('24-Hour Power Consumption')).toBeInTheDocument();
    expect(screen.getByText('Charging Queue')).toBeInTheDocument();
  });

  it('should display battery statistics correctly', () => {
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getAllByText('65%')).toHaveLength(2); // One in gauge, one in text
    expect(screen.getByText('Fleet Average')).toBeInTheDocument();
    expect(screen.getByText('Charging Now')).toBeInTheDocument();
    expect(screen.getByText('Low Battery')).toBeInTheDocument();
    expect(screen.getByText('400 kWh')).toBeInTheDocument(); // Total capacity
  });

  it('should display next scheduled charge information', () => {
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText('Vehicle: EV-002')).toBeInTheDocument();
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it('should render power consumption chart', () => {
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('should display charging queue with vehicles', () => {
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText('Delivery Van 002')).toBeInTheDocument();
    expect(screen.getByText('Battery: 15%')).toBeInTheDocument();
    expect(screen.getByText('Fleet Truck 001')).toBeInTheDocument();
    expect(screen.getByText('Battery: 60%')).toBeInTheDocument();
  });

  it('should display priority dropdowns for queue items', () => {
    renderWithProvider(<BatteryPanel />);
    
    const prioritySelects = screen.getAllByRole('combobox');
    expect(prioritySelects).toHaveLength(2);
    
    expect(prioritySelects[0]).toHaveValue('high');
    expect(prioritySelects[1]).toHaveValue('medium');
  });

  it('should call updateChargingPriority when priority is changed', () => {
    const mockUpdatePriority = vi.fn();
    mockUseBatteryData.mockReturnValue({
      ...mockUseBatteryData(),
      updateChargingPriority: mockUpdatePriority,
    });
    
    renderWithProvider(<BatteryPanel />);
    
    const prioritySelects = screen.getAllByRole('combobox');
    fireEvent.change(prioritySelects[0], { target: { value: 'low' } });
    
    expect(mockUpdatePriority).toHaveBeenCalledWith('EV-002', 'low');
  });

  it('should call optimizeQueue when optimize button is clicked', () => {
    const mockOptimizeQueue = vi.fn();
    mockUseBatteryData.mockReturnValue({
      ...mockUseBatteryData(),
      optimizeQueue: mockOptimizeQueue,
    });
    
    renderWithProvider(<BatteryPanel />);
    
    const optimizeButton = screen.getByText('Optimize Queue');
    fireEvent.click(optimizeButton);
    
    expect(mockOptimizeQueue).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    mockUseBatteryData.mockReturnValue({
      batteryData: null,
      chargingQueue: [],
      powerConsumption: [],
      nextChargeCountdown: '',
      isLoading: true,
      error: null,
      updateChargingPriority: vi.fn(),
      optimizeQueue: vi.fn(),
      refreshData: vi.fn(),
    });
    
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByTestId('loading-skeleton')).toHaveClass('animate-pulse');
  });

  it('should show error state with retry button', () => {
    const mockRefreshData = vi.fn();
    mockUseBatteryData.mockReturnValue({
      batteryData: null,
      chargingQueue: [],
      powerConsumption: [],
      nextChargeCountdown: '',
      isLoading: false,
      error: 'Network error',
      updateChargingPriority: vi.fn(),
      optimizeQueue: vi.fn(),
      refreshData: mockRefreshData,
    });
    
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText(/Error loading battery data/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('should show empty queue message when no vehicles need charging', () => {
    mockUseBatteryData.mockReturnValue({
      ...mockUseBatteryData(),
      chargingQueue: [],
    });
    
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText('No vehicles in charging queue')).toBeInTheDocument();
  });

  it('should display wait and charge times for queue items', () => {
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText('Wait: 0m')).toBeInTheDocument();
    expect(screen.getByText('Charge: 97m')).toBeInTheDocument();
    expect(screen.getByText('Wait: 45m')).toBeInTheDocument();
    expect(screen.getByText('Charge: 30m')).toBeInTheDocument();
  });

  it('should apply correct priority colors', () => {
    renderWithProvider(<BatteryPanel />);
    
    const prioritySelects = screen.getAllByRole('combobox');
    
    expect(prioritySelects[0]).toHaveClass('text-red-600', 'bg-red-50');
    expect(prioritySelects[1]).toHaveClass('text-orange-600', 'bg-orange-50');
  });

  it('should show "No charges scheduled" when no next charge', () => {
    mockUseBatteryData.mockReturnValue({
      ...mockUseBatteryData(),
      batteryData: {
        ...mockUseBatteryData().batteryData,
        nextChargeTime: undefined,
        nextChargeVehicle: undefined,
      },
    });
    
    renderWithProvider(<BatteryPanel />);
    
    expect(screen.getByText('No charges scheduled')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithProvider(<BatteryPanel className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should display queue position numbers', () => {
    renderWithProvider(<BatteryPanel />);
    
    // Check for position numbers in the queue (they should be in blue circles)
    const positionElements = screen.getAllByText('1');
    const positionElements2 = screen.getAllByText('2');
    
    expect(positionElements.length).toBeGreaterThan(0);
    expect(positionElements2.length).toBeGreaterThan(0);
  });
});