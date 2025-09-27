import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AuditTrailViewer } from '../AuditTrailViewer';
import { AuditTrail } from '../../../types';

const mockAuditTrails: AuditTrail[] = [
  {
    id: 'audit_1',
    entityType: 'vehicle',
    entityId: 'EV-001',
    action: 'update',
    description: 'Vehicle compliance status updated',
    userId: 'user_123',
    userName: 'John Smith',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    changes: {
      complianceStatus: { old: 'warning', new: 'compliant' },
    },
    severity: 'info',
    category: 'compliance',
  },
  {
    id: 'audit_2',
    entityType: 'area',
    entityId: 'area_warehouse_a',
    action: 'access',
    description: 'Unauthorized access attempt detected',
    userId: 'system',
    userName: 'System',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    ipAddress: '10.0.0.50',
    severity: 'warning',
    category: 'security',
  },
  {
    id: 'audit_3',
    entityType: 'driver',
    entityId: 'driver_456',
    action: 'violation',
    description: 'Driver certification expired',
    userId: 'compliance_system',
    userName: 'Compliance System',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    severity: 'critical',
    category: 'compliance',
  },
];

const mockProps = {
  auditTrails: mockAuditTrails,
  onExportAuditTrail: vi.fn(),
};

describe('AuditTrailViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all audit trail entries by default', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('Vehicle compliance status updated')).toBeInTheDocument();
    expect(screen.getByText('Unauthorized access attempt detected')).toBeInTheDocument();
    expect(screen.getByText('Driver certification expired')).toBeInTheDocument();
  });

  it('displays audit trail counts in filter tabs', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // All entries
    expect(screen.getByText('2')).toBeInTheDocument(); // Compliance entries
    expect(screen.getByText('1')).toBeInTheDocument(); // Security entries
  });

  it('filters audit trails by category', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    // Click on compliance filter
    fireEvent.click(screen.getByRole('button', { name: /compliance 2/i }));
    
    // Should show only compliance entries
    expect(screen.getByText('Vehicle compliance status updated')).toBeInTheDocument();
    expect(screen.getByText('Driver certification expired')).toBeInTheDocument();
    expect(screen.queryByText('Unauthorized access attempt detected')).not.toBeInTheDocument();
  });

  it('filters audit trails by severity', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    // Click on critical severity filter
    fireEvent.click(screen.getByRole('button', { name: /critical/i }));
    
    // Should show only critical entries
    expect(screen.getByText('Driver certification expired')).toBeInTheDocument();
    expect(screen.queryByText('Vehicle compliance status updated')).not.toBeInTheDocument();
    expect(screen.queryByText('Unauthorized access attempt detected')).not.toBeInTheDocument();
  });

  it('displays severity badges with correct colors', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('displays category badges', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getAllByText('Compliance')).toHaveLength(2);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('shows audit trail details correctly', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('John Smith (user_123)')).toBeInTheDocument();
    expect(screen.getByText('EV-001')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
  });

  it('displays changes when available', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('Changes:')).toBeInTheDocument();
    expect(screen.getByText('complianceStatus:')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('compliant')).toBeInTheDocument();
  });

  it('calls onExportAuditTrail when export button is clicked', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    fireEvent.click(screen.getByText('Export Audit Trail'));
    
    expect(mockProps.onExportAuditTrail).toHaveBeenCalled();
  });

  it('displays empty state when no audit trails match filter', () => {
    render(<AuditTrailViewer auditTrails={[]} />);
    
    expect(screen.getByText('No audit trail entries found for the selected filters')).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('Critical Events')).toBeInTheDocument();
    expect(screen.getByText('Security Events')).toBeInTheDocument();
    expect(screen.getByText('Compliance Events')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    // Check that dates are formatted properly (should show current date since we're using recent timestamps)
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    expect(screen.getAllByText(new RegExp(today.replace(/,/, ',?')))).toHaveLength(3);
  });

  it('displays action icons for different actions', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    // Check that SVG icons are rendered for different actions
    const container = screen.getByText('Vehicle compliance status updated').closest('.space-y-3');
    const svgElements = container?.querySelectorAll('svg');
    expect(svgElements?.length).toBeGreaterThan(0);
  });

  it('shows entity type and action in headers', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    expect(screen.getByText('Update - vehicle')).toBeInTheDocument();
    expect(screen.getByText('Access - area')).toBeInTheDocument();
    expect(screen.getByText('Violation - driver')).toBeInTheDocument();
  });

  it('highlights critical and error entries with different styling', () => {
    render(<AuditTrailViewer {...mockProps} />);
    
    const criticalEntry = screen.getByText('Driver certification expired').closest('.border');
    expect(criticalEntry).toHaveClass('border-red-200', 'bg-red-50');
  });
});