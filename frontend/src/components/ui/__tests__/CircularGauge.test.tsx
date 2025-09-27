import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CircularGauge from '../CircularGauge';

describe('CircularGauge', () => {
  const defaultProps = {
    value: 75,
    max: 100,
  };

  it('renders with basic props', () => {
    render(<CircularGauge {...defaultProps} />);
    
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-valuenow', '75');
    expect(svg).toHaveAttribute('aria-valuemin', '0');
    expect(svg).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays percentage by default', () => {
    render(<CircularGauge {...defaultProps} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays raw value when showPercentage is false', () => {
    render(<CircularGauge {...defaultProps} showPercentage={false} />);
    
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<CircularGauge {...defaultProps} label="Battery Level" />);
    
    expect(screen.getByText('Battery Level')).toBeInTheDocument();
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-labelledby', 'gauge-label-battery-level');
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(<CircularGauge {...defaultProps} size="sm" />);
    expect(container.querySelector('.w-16')).toBeInTheDocument();

    rerender(<CircularGauge {...defaultProps} size="lg" />);
    expect(container.querySelector('.w-32')).toBeInTheDocument();

    rerender(<CircularGauge {...defaultProps} size="md" />);
    expect(container.querySelector('.w-24')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container, rerender } = render(<CircularGauge {...defaultProps} color="green" />);
    expect(container.querySelector('.stroke-success-500')).toBeInTheDocument();

    rerender(<CircularGauge {...defaultProps} color="red" />);
    expect(container.querySelector('.stroke-danger-500')).toBeInTheDocument();

    rerender(<CircularGauge {...defaultProps} color="orange" />);
    expect(container.querySelector('.stroke-warning-500')).toBeInTheDocument();
  });

  it('handles edge cases for percentage calculation', () => {
    const { rerender } = render(<CircularGauge value={-10} max={100} />);
    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(<CircularGauge value={150} max={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CircularGauge {...defaultProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});