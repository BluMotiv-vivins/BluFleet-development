import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICard from '../KPICard';

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <div className={className} data-testid="mock-icon">Icon</div>
);

describe('KPICard', () => {
  const defaultProps = {
    title: 'Test KPI',
    value: '100',
    color: 'blue' as const,
    icon: MockIcon,
  };

  it('renders with basic props', () => {
    render(<KPICard {...defaultProps} />);
    
    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with string icon', () => {
    render(<KPICard {...defaultProps} icon="🚛" />);
    
    expect(screen.getByText('🚛')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<KPICard {...defaultProps} subtitle="Test subtitle" />);
    
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<KPICard {...defaultProps} color="green" />);
    
    expect(container.firstChild).toHaveClass('border-l-success-500', 'bg-success-50');
  });

  it('shows correct trend indicators', () => {
    const { rerender } = render(<KPICard {...defaultProps} trend="up" />);
    expect(screen.getByText('Trending up')).toBeInTheDocument();

    rerender(<KPICard {...defaultProps} trend="down" />);
    expect(screen.getByText('Trending down')).toBeInTheDocument();

    rerender(<KPICard {...defaultProps} trend="neutral" />);
    expect(screen.getByText('Neutral trend')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<KPICard {...defaultProps} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-labelledby', 'kpi-test-kpi-title');
    
    const title = screen.getByText('Test KPI');
    expect(title).toHaveAttribute('id', 'kpi-test-kpi-title');
  });

  it('applies custom className', () => {
    const { container } = render(<KPICard {...defaultProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});