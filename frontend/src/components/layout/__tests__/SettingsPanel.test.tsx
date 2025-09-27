import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPanel from '../SettingsPanel';

import { vi } from 'vitest';

// Mock the Modal component
vi.mock('../../ui', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <div>{title}</div>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null,
}));

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when open', () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SettingsPanel isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('displays all setting tabs', () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  it('shows general settings by default', () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Timezone')).toBeInTheDocument();
    expect(screen.getByText('Data Refresh Interval (seconds)')).toBeInTheDocument();
  });

  it('switches to notifications tab when clicked', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Notification Channels')).toBeInTheDocument();
      expect(screen.getByText('Alert Types')).toBeInTheDocument();
      expect(screen.getByText(/email.*Notifications/)).toBeInTheDocument();
    });
  });

  it('switches to dashboard tab when clicked', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const dashboardTab = screen.getByText('Dashboard');
    fireEvent.click(dashboardTab);
    
    await waitFor(() => {
      expect(screen.getByText('Auto Refresh Data')).toBeInTheDocument();
      expect(screen.getByText('Show Animations')).toBeInTheDocument();
      expect(screen.getByText('Compact Mode')).toBeInTheDocument();
    });
  });

  it('switches to map tab when clicked', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const mapTab = screen.getByText('Map');
    fireEvent.click(mapTab);
    
    await waitFor(() => {
      expect(screen.getByText('Default Zoom Level')).toBeInTheDocument();
      expect(screen.getByText('Show Traffic Layer')).toBeInTheDocument();
      expect(screen.getByText('Show Satellite View')).toBeInTheDocument();
      expect(screen.getByText('Cluster Vehicle Markers')).toBeInTheDocument();
    });
  });

  it('highlights active tab', () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const generalTab = screen.getByText('General');
    expect(generalTab).toHaveClass('bg-primary-100', 'text-primary-700');
  });

  it('changes theme setting', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const themeSelect = screen.getByDisplayValue('Light');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    expect(themeSelect).toHaveValue('dark');
  });

  it('changes language setting', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const languageSelect = screen.getByDisplayValue('English (US)');
    fireEvent.change(languageSelect, { target: { value: 'es-ES' } });
    
    expect(languageSelect).toHaveValue('es-ES');
  });

  it('changes refresh interval setting', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const refreshInput = screen.getByDisplayValue('30');
    fireEvent.change(refreshInput, { target: { value: '60' } });
    
    expect(refreshInput).toHaveValue(60);
  });

  it('toggles notification settings', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);
    
    await waitFor(() => {
      // Find all checkboxes in the notifications section
      const checkboxes = screen.getAllByRole('checkbox');
      const emailToggle = checkboxes[0]; // First checkbox should be email
      expect(emailToggle).toBeChecked();
      
      fireEvent.click(emailToggle);
      expect(emailToggle).not.toBeChecked();
    });
  });

  it('toggles dashboard settings', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const dashboardTab = screen.getByText('Dashboard');
    fireEvent.click(dashboardTab);
    
    await waitFor(() => {
      // Find all checkboxes in the dashboard section
      const checkboxes = screen.getAllByRole('checkbox');
      const autoRefreshToggle = checkboxes[0]; // First checkbox should be auto refresh
      expect(autoRefreshToggle).toBeChecked();
      
      fireEvent.click(autoRefreshToggle);
      expect(autoRefreshToggle).not.toBeChecked();
    });
  });

  it('adjusts map zoom level', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const mapTab = screen.getByText('Map');
    fireEvent.click(mapTab);
    
    await waitFor(() => {
      const zoomSlider = screen.getByDisplayValue('12');
      fireEvent.change(zoomSlider, { target: { value: '15' } });
      
      expect(zoomSlider).toHaveValue('15');
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('resets settings to defaults', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    // Change a setting first
    const themeSelect = screen.getByDisplayValue('Light');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(themeSelect).toHaveValue('dark');
    
    // Reset to defaults
    const resetButton = screen.getByText('Reset to Defaults');
    fireEvent.click(resetButton);
    
    expect(themeSelect).toHaveValue('light');
  });

  it('saves settings and closes panel', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('cancels without saving', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('validates refresh interval input', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const refreshInput = screen.getByDisplayValue('30');
    expect(refreshInput).toHaveAttribute('min', '5');
    expect(refreshInput).toHaveAttribute('max', '300');
  });

  it('shows zoom level value in real-time', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const mapTab = screen.getByText('Map');
    fireEvent.click(mapTab);
    
    await waitFor(() => {
      const zoomSlider = screen.getByDisplayValue('12');
      fireEvent.change(zoomSlider, { target: { value: '10' } });
      
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('displays all notification channel options', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Notification Channels')).toBeInTheDocument();
      expect(screen.getByText('Alert Types')).toBeInTheDocument();
      // Check for partial text matches
      expect(screen.getByText(/email.*Notifications/)).toBeInTheDocument();
      expect(screen.getByText(/push.*Notifications/)).toBeInTheDocument();
      expect(screen.getByText(/sms.*Notifications/)).toBeInTheDocument();
    });
  });

  it('displays all alert type options', async () => {
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    
    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Low Battery Alerts')).toBeInTheDocument();
      expect(screen.getByText('Maintenance Alerts')).toBeInTheDocument();
      expect(screen.getByText('Geofence Alerts')).toBeInTheDocument();
    });
  });
});