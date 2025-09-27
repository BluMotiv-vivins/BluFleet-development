import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataFreshnessIndicator, { DataFreshnessPanel } from '../DataFreshnessIndicator';

// Simple mock for the hook
vi.mock('../../../hooks/useRealTimePerformance', () => ({
  useDataFreshness: () => ({
    isDataStale: () => false,
    getDataAge: () => 30000, // 30 seconds
    lastUpdateTimes: {
      vehicles: new Date(),
      alerts: new Date(Date.now() - 30000),
    },
    getStaleDataTypes: () => [],
  }),
}));

describe('DataFreshnessIndicator Component', () => {
  describe('Basic Rendering', () => {
    it('should render data freshness indicator', () => {
      render(
        <DataFreshnessIndicator
          dataType="vehicles"
          label="Vehicles"
        />
      );

      expect(screen.getByText('Vehicles:')).toBeInTheDocument();
      expect(screen.getByText('30s ago')).toBeInTheDocument();
    });

    it('should render without label when not provided', () => {
      render(
        <DataFreshnessIndicator
          dataType="vehicles"
        />
      );

      expect(screen.queryByText('Vehicles:')).not.toBeInTheDocument();
      expect(screen.getByText('30s ago')).toBeInTheDocument();
    });

    it('should not show age when showAge is false', () => {
      render(
        <DataFreshnessIndicator
          dataType="vehicles"
          label="Vehicles"
          showAge={false}
        />
      );

      expect(screen.getByText('Vehicles:')).toBeInTheDocument();
      expect(screen.queryByText('30s ago')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <DataFreshnessIndicator
          dataType="vehicles"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Status Display', () => {
    it('should show fresh data indicator', () => {
      render(
        <DataFreshnessIndicator
          dataType="vehicles"
          label="Vehicles"
        />
      );

      expect(screen.getByText('🟢')).toBeInTheDocument();
    });
  });
});

describe('DataFreshnessPanel Component', () => {
  it('should render panel with title', () => {
    render(<DataFreshnessPanel />);

    expect(screen.getByText('Data Freshness')).toBeInTheDocument();
  });

  it('should render data freshness indicators for available data', () => {
    render(<DataFreshnessPanel />);

    expect(screen.getByText('Vehicles:')).toBeInTheDocument();
    expect(screen.getByText('Alerts:')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DataFreshnessPanel className="custom-panel-class" />
    );

    expect(container.firstChild).toHaveClass('custom-panel-class');
  });
});