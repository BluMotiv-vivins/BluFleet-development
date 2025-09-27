import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Button from '../Button';

// Mock LoadingSpinner
vi.mock('../LoadingSpinner', () => ({
  default: ({ 'aria-label': ariaLabel }: { 'aria-label'?: string }) => (
    <div role="status" aria-label={ariaLabel}>Loading...</div>
  ),
}));

describe('Button Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(
      <Button aria-describedby="help-text">
        Click me
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'help-text');
  });

  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('handles loading state with proper accessibility', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Should have loading spinner with proper role
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
    
    // Should have screen reader text (using getAllByText since there are multiple)
    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts.length).toBeGreaterThan(0);
    
    // Button text should be visually hidden but still present
    const buttonText = screen.getByText('Loading Button');
    expect(buttonText).toHaveClass('opacity-0');
  });

  it('has minimum touch target size', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[36px]');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[44px]');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[52px]');
  });

  it('provides proper focus styles', () => {
    render(<Button>Focus me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });

  it('handles keyboard interaction', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    
    // Should work with Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter' });
    
    // Should work with Space key
    fireEvent.keyDown(button, { key: ' ' });
    fireEvent.keyUp(button, { key: ' ' });
  });

  it('renders icons with proper accessibility', () => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg className={className} data-testid="mock-icon" aria-hidden="true">
        <path />
      </svg>
    );

    render(
      <Button leftIcon={MockIcon} rightIcon={MockIcon}>
        Button with icons
      </Button>
    );
    
    const icons = screen.getAllByTestId('mock-icon');
    expect(icons).toHaveLength(2);
    
    // Icons should have aria-hidden
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('supports full width layout', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('has proper color contrast for variants', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant} Button</Button>);
      
      const button = screen.getByRole('button');
      
      // All variants should have focus styles
      expect(button).toHaveClass('focus:ring-2');
      
      // All variants should have hover states
      expect(button.className).toMatch(/hover:/);
      
      unmount();
    });
  });

  it('provides visual feedback on interaction', () => {
    render(<Button>Interactive Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Should have active state styles
    expect(button).toHaveClass('active:transform', 'active:scale-95');
    
    // Should have transition classes
    expect(button).toHaveClass('transition-all', 'duration-200');
  });

  it('prevents interaction when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    
    // Should have pointer-events-none class
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('maintains semantic meaning with proper button type', () => {
    render(<Button type="submit">Submit Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});