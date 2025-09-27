import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotificationBadge from '../NotificationBadge';

describe('NotificationBadge', () => {
  it('renders with count', () => {
    render(<NotificationBadge count={5} />);
    
    expect(screen.getByLabelText('5 notifications')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render when count is 0 and showZero is false', () => {
    render(<NotificationBadge count={0} />);
    
    expect(screen.queryByLabelText('0 notifications')).not.toBeInTheDocument();
  });

  it('renders when count is 0 and showZero is true', () => {
    render(<NotificationBadge count={0} showZero />);
    
    expect(screen.getByLabelText('0 notifications')).toBeInTheDocument();
  });

  it('shows max+ when count exceeds max', () => {
    render(<NotificationBadge count={150} max={99} />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(screen.getByLabelText('150 notifications')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<NotificationBadge count={1} variant="primary" />);
    expect(screen.getByText('1')).toHaveClass('bg-primary-500');

    rerender(<NotificationBadge count={1} variant="danger" />);
    expect(screen.getByText('1')).toHaveClass('bg-danger-500');

    rerender(<NotificationBadge count={1} variant="warning" />);
    expect(screen.getByText('1')).toHaveClass('bg-warning-500');

    rerender(<NotificationBadge count={1} variant="success" />);
    expect(screen.getByText('1')).toHaveClass('bg-success-500');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<NotificationBadge count={1} size="sm" />);
    expect(screen.getByText('1')).toHaveClass('h-4', 'w-4');

    rerender(<NotificationBadge count={1} size="md" />);
    expect(screen.getByText('1')).toHaveClass('h-5', 'w-5');
  });

  it('renders as overlay when children are provided', () => {
    render(
      <NotificationBadge count={3}>
        <button>Button</button>
      </NotificationBadge>
    );
    
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('absolute', '-top-1', '-right-1');
  });

  it('does not render overlay when count is 0 and showZero is false', () => {
    render(
      <NotificationBadge count={0}>
        <button>Button</button>
      </NotificationBadge>
    );
    
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<NotificationBadge count={1} className="custom-class" />);
    
    expect(screen.getByText('1')).toHaveClass('custom-class');
  });

  it('applies custom className to container when children are provided', () => {
    const { container } = render(
      <NotificationBadge count={1} className="custom-class">
        <button>Button</button>
      </NotificationBadge>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});