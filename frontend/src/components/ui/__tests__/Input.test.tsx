import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '../Input';

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <div className={className} data-testid="mock-icon">Icon</div>
);

describe('Input', () => {
  it('renders with basic props', () => {
    render(<Input placeholder="Enter text" />);
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays helper text', () => {
    render(<Input helperText="Enter your username" />);
    
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(<Input error="Error message" helperText="Helper text" />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('renders with left icon', () => {
    render(<Input leftIcon={MockIcon} />);
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    render(<Input rightIcon={MockIcon} />);
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Input variant="filled" />);
    expect(screen.getByRole('textbox')).toHaveClass('bg-gray-50');

    rerender(<Input variant="default" />);
    expect(screen.getByRole('textbox')).toHaveClass('bg-white');
  });

  it('applies error styling', () => {
    render(<Input error="Error" />);
    
    expect(screen.getByRole('textbox')).toHaveClass('border-danger-500');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    
    expect(screen.getByRole('textbox').closest('.custom-class')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('generates unique id when not provided', () => {
    render(<Input label="Test" />);
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test');
    
    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Test" />);
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test');
    
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });
});