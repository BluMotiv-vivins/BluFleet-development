import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EmergencyResponsePanel } from '../EmergencyResponsePanel';

const mockProps = {
  onEmergencyResponse: vi.fn(),
};

describe('EmergencyResponsePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all emergency response buttons', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    expect(screen.getByText('Fire Emergency')).toBeInTheDocument();
    expect(screen.getByText('Medical Emergency')).toBeInTheDocument();
    expect(screen.getByText('Security Breach')).toBeInTheDocument();
    expect(screen.getByText('Environmental Hazard')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Failure')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Accident')).toBeInTheDocument();
  });

  it('displays emergency contact information', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    expect(screen.getByText('Emergency Services')).toBeInTheDocument();
    expect(screen.getByText('911')).toBeInTheDocument();
    expect(screen.getByText('Fleet Operations Center')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
  });

  it('shows warning message about emergency protocol', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    expect(screen.getByText(/Use these buttons only for genuine emergencies/)).toBeInTheDocument();
  });

  it('opens confirmation modal when emergency button is clicked', async () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    fireEvent.click(screen.getByText('Fire Emergency'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Emergency Response')).toBeInTheDocument();
    });
  });

  it('displays correct emergency type in confirmation modal', async () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    fireEvent.click(screen.getByText('Medical Emergency'));
    
    await waitFor(() => {
      expect(screen.getByText('Medical Emergency')).toBeInTheDocument();
      expect(screen.getByText('Driver injury, medical incident, or health emergency')).toBeInTheDocument();
    });
  });

  it('calls onEmergencyResponse when confirmed', async () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    fireEvent.click(screen.getByText('Fire Emergency'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Emergency Response')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Confirm Emergency'));
    
    expect(mockProps.onEmergencyResponse).toHaveBeenCalledWith('fire');
  });

  it('closes modal when cancel is clicked', async () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    fireEvent.click(screen.getByText('Security Breach'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Emergency Response')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Confirm Emergency Response')).not.toBeInTheDocument();
    });
  });

  it('displays recent emergency responses', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    expect(screen.getByText('Recent Emergency Responses')).toBeInTheDocument();
    expect(screen.getByText('Vehicle EV-001 charging system failure')).toBeInTheDocument();
    expect(screen.getByText('Unauthorized access attempt at Warehouse B')).toBeInTheDocument();
  });

  it('shows different emergency button colors', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    const fireButton = screen.getByText('Fire Emergency').closest('button');
    const medicalButton = screen.getByText('Medical Emergency').closest('button');
    
    expect(fireButton).toHaveClass('bg-red-600');
    expect(medicalButton).toHaveClass('bg-red-500');
  });

  it('displays emergency response status badges', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Under Investigation')).toBeInTheDocument();
  });

  it('renders emergency type icons', () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    // Check that SVG icons are rendered for each emergency type
    const buttons = screen.getAllByRole('button');
    const emergencyButtons = buttons.filter(button => 
      button.textContent?.includes('Emergency') || 
      button.textContent?.includes('Breach') ||
      button.textContent?.includes('Hazard') ||
      button.textContent?.includes('Failure') ||
      button.textContent?.includes('Accident')
    );
    
    expect(emergencyButtons.length).toBe(6);
  });

  it('shows confirmation warning in modal', async () => {
    render(<EmergencyResponsePanel {...mockProps} />);
    
    fireEvent.click(screen.getByText('Environmental Hazard'));
    
    await waitFor(() => {
      expect(screen.getByText(/This will immediately notify emergency responders/)).toBeInTheDocument();
    });
  });
});