import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check if the main layout elements are present
    expect(screen.getAllByText('FleetVolt Pro')).toHaveLength(2); // One in sidebar, one in header
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
