import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ViolationsList } from '../ViolationsList';
import { ComplianceViolation } from '../../../types';

const mockViolations: ComplianceViolation[] = [
  {
    id: 'violation_1',
    type: 'restricted_area',
    severity: 'major',
    description: 'Vehicle entered restricted area without authorization',
    location: { lat: 40.7128, lng: -74.0060, address: 'Warehouse A' },
    timestamp: new Date('2024-12-10T14:30:00Z'),
    correctionRequired: true,
    reportedBy: 'system',
  },
  {
    id: 'violation_2',
    type: 'speed_limit',
    severity: 'minor',
    description: 'Vehicle exceeded speed limit',
    timestamp: new Date('2024-12-08T09:15:00Z'),
    resolvedAt: new Date('2024-12-09T10:00:00Z'),
    correctionRequired: false,
    reportedBy: 'system',
  },
  {
    id: 'violation_3',
    type: 'certification',
    severity: 'critical',
    description: 'Driver certification expired',
    timestamp: new Date('2024-12-05T16:45:00Z'),
    correctionRequired: true,
    reportedBy: 'manual',
    fineAmount: 500,
  },
];

const mockProps = {
  violations: mockViolations,
  onResolveViolation: vi.fn(),
};

describe('ViolationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all violations by default', () => {
    render(<ViolationsList {...mockProps} />);
    
    expect(screen.getByText('Restricted Area Violation')).toBeInTheDocument();
    expect(screen.getByText('Speed Limit Violation')).toBeInTheDocument();
    expect(screen.getByText('Certification Violation')).toBeInTheDocument();
  });

  it('displays violation counts in filter tabs', () => {
    render(<ViolationsList {...mockProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // All violations
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending violations
    expect(screen.getByText('1')).toBeInTheDocument(); // Resolved violations
  });

  it('filters violations by status', () => {
    render(<ViolationsList {...mockProps} />);
    
    // Click on pending filter
    fireEvent.click(screen.getByText('Pending'));
    
    // Should show only pending violations
    expect(screen.getByText('Restricted Area Violation')).toBeInTheDocument();
    expect(screen.getByText('Certification Violation')).toBeInTheDocument();
    expect(screen.queryByText('Speed Limit Violation')).not.toBeInTheDocument();
  });

  it('filters violations by resolved status', () => {
    render(<ViolationsList {...mockProps} />);
    
    // Click on resolved filter
    fireEvent.click(screen.getByRole('button', { name: /resolved 1/i }));
    
    // Should show only resolved violations
    expect(screen.getByText('Speed Limit Violation')).toBeInTheDocument();
    expect(screen.queryByText('Restricted Area Violation')).not.toBeInTheDocument();
    expect(screen.queryByText('Certification Violation')).not.toBeInTheDocument();
  });

  it('displays violation severity with correct colors', () => {
    render(<ViolationsList {...mockProps} />);
    
    expect(screen.getByText('Major')).toBeInTheDocument();
    expect(screen.getByText('Minor')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('shows resolve button for pending violations', () => {
    render(<ViolationsList {...mockProps} />);
    
    const resolveButtons = screen.getAllByText('Mark Resolved');
    expect(resolveButtons).toHaveLength(2); // Two pending violations
  });

  it('calls onResolveViolation when resolve button is clicked', async () => {
    render(<ViolationsList {...mockProps} />);
    
    const resolveButtons = screen.getAllByText('Mark Resolved');
    fireEvent.click(resolveButtons[0]);
    
    expect(mockProps.onResolveViolation).toHaveBeenCalledWith('violation_1');
  });

  it('displays violation details correctly', () => {
    render(<ViolationsList {...mockProps} />);
    
    expect(screen.getByText('Vehicle entered restricted area without authorization')).toBeInTheDocument();
    expect(screen.getByText('Warehouse A')).toBeInTheDocument();
    expect(screen.getByText('₹40,000')).toBeInTheDocument(); // Fine amount
  });

  it('shows action required badge for violations needing correction', () => {
    render(<ViolationsList {...mockProps} />);
    
    const actionRequiredBadges = screen.getAllByText('Action Required');
    expect(actionRequiredBadges).toHaveLength(2); // Two violations require correction
  });

  it('shows resolved badge for resolved violations', () => {
    render(<ViolationsList {...mockProps} />);
    
    const resolvedBadges = screen.getAllByText('Resolved');
    expect(resolvedBadges.length).toBeGreaterThan(0);
  });

  it('displays empty state when no violations match filter', () => {
    render(<ViolationsList violations={[]} />);
    
    expect(screen.getByText('No violations found for the selected filter')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<ViolationsList {...mockProps} />);
    
    // Check that dates are formatted properly
    expect(screen.getByText(/Dec 10, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Dec 8, 2024/)).toBeInTheDocument();
  });

  it('displays violation type icons', () => {
    render(<ViolationsList {...mockProps} />);
    
    // Check that SVG elements are rendered
    const container = screen.getByText('Restricted Area Violation').closest('.space-y-4');
    const svgElements = container?.querySelectorAll('svg');
    expect(svgElements?.length).toBeGreaterThan(0);
  });
});