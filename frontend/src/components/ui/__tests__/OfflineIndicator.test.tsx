import React from 'react';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from '../OfflineIndicator';

describe('OfflineIndicator', () => {
  test('renders when offline', () => {
    render(<OfflineIndicator isOffline={true} />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('You are currently offline. Some features may be limited.')).toBeInTheDocument();
  });

  test('does not render when online', () => {
    render(<OfflineIndicator isOffline={false} />);
    
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  test('has proper accessibility attributes when offline', () => {
    render(<OfflineIndicator isOffline={true} />);
    
    const indicator = screen.getByRole('alert');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  test('applies correct styling when offline', () => {
    render(<OfflineIndicator isOffline={true} />);
    
    const indicator = screen.getByRole('alert');
    expect(indicator).toHaveClass('bg-warning-100', 'border-warning-300', 'text-warning-800');
  });

  test('displays offline icon', () => {
    render(<OfflineIndicator isOffline={true} />);
    
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});