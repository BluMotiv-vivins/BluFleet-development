import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Alert from '../Alert';

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <div className={className} data-testid="custom-icon">Custom Icon</div>
);

describe('Alert', () => {
  it('renders with children', () => {
    render(<Alert>Alert message</Alert>);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert title="Alert Title">Alert message</Alert>);
    
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('applies correct type classes', () => {
    const { rerender } = render(<Alert type="info">Info message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-primary-50', 'border-primary-200');

    rerender(<Alert type="success">Success message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-success-50', 'border-success-200');

    rerender(<Alert type="warning">Warning message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-warning-50', 'border-warning-200');

    rerender(<Alert type="error">Error message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-danger-50', 'border-danger-200');
  });

  it('renders default icons for each type', () => {
    const { rerender } = render(<Alert type="success">Success</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

    rerender(<Alert type="warning">Warning</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

    rerender(<Alert type="error">Error</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

    rerender(<Alert type="info">Info</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<Alert icon={MockIcon}>Alert with custom icon</Alert>);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(<Alert dismissible>Dismissible alert</Alert>);
    
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Alert dismissible onDismiss={onDismiss}>Dismissible alert</Alert>);
    
    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when not dismissible', () => {
    render(<Alert>Non-dismissible alert</Alert>);
    
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Alert className="custom-class">Alert</Alert>);
    
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Alert>Alert message</Alert>);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('renders complex content', () => {
    render(
      <Alert title="Complex Alert">
        <div>
          <p>This is a paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </Alert>
    );
    
    expect(screen.getByText('Complex Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a paragraph')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});