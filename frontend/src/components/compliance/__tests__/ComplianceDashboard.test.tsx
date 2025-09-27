import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ComplianceDashboard } from '../ComplianceDashboard';
import { ComplianceMetrics, ComplianceBadge, ComplianceViolation } from '../../../types';

const mockMetrics: ComplianceMetrics = {
  overallScore: 85,
  safetyScore: 90,
  environmentalScore: 80,
  operationalScore: 88,
  trendsData: [],
  violations: {
    total: 5,
    resolved: 3,
    pending: 2,
    byType: { safety: 2, operational: 3 },
  },
  certifications: {
    total: 10,
    valid: 8,
    expiring: 1,
    expired: 1,
  },
};

const mockBadges: ComplianceBadge[] = [
  {
    id: 'badge_1',
    type: 'safety',
    name: 'OSHA Safety Compliance',
    status: 'active',
    issuedDate: new Date('2024-01-15'),
    expiryDate: new Date('2025-01-15'),
    issuingAuthority: 'OSHA',
    description: 'Safety compliance certification',
  },
];

const mockViolations: ComplianceViolation[] = [
  {
    id: 'violation_1',
    type: 'restricted_area',
    severity: 'major',
    description: 'Unauthorized area access',
    timestamp: new Date('2024-12-10T14:30:00Z'),
    correctionRequired: true,
    reportedBy: 'system',
  },
];

const mockProps = {
  metrics: mockMetrics,
  badges: mockBadges,
  violations: mockViolations,
  onGenerateReport: vi.fn(),
  onEmergencyResponse: vi.fn(),
};

describe('ComplianceDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders compliance metrics correctly', () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // pending violations
    expect(screen.getByText('8')).toBeInTheDocument(); // valid certifications
  });

  it('displays KPI cards with correct colors based on scores', () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    // Overall compliance score of 85% should be green
    const overallScoreCard = screen.getByText('Overall Compliance').closest('div');
    expect(overallScoreCard).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    expect(screen.getByText('View Compliance Badges')).toBeInTheDocument();
    expect(screen.getByText('Manage Violations')).toBeInTheDocument();
    expect(screen.getByText('Generate Reports')).toBeInTheDocument();
    expect(screen.getByText('Emergency Response')).toBeInTheDocument();
  });

  it('opens badges modal when button is clicked', async () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    fireEvent.click(screen.getByText('View Compliance Badges'));
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Badges')).toBeInTheDocument();
    });
  });

  it('opens violations modal when button is clicked', async () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Manage Violations'));
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Violations')).toBeInTheDocument();
    });
  });

  it('opens reports modal when button is clicked', async () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Generate Reports'));
    
    await waitFor(() => {
      expect(screen.getByText('Regulatory Reports')).toBeInTheDocument();
    });
  });

  it('opens emergency response modal when button is clicked', async () => {
    render(<ComplianceDashboard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Emergency Response'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Emergency Response')).toBeInTheDocument();
    });
  });

  it('handles zero violations correctly', () => {
    const propsWithNoViolations = {
      ...mockProps,
      metrics: {
        ...mockMetrics,
        violations: {
          total: 0,
          resolved: 0,
          pending: 0,
          byType: {},
        },
      },
    };

    render(<ComplianceDashboard {...propsWithNoViolations} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays correct trend indicators', () => {
    const propsWithLowScore = {
      ...mockProps,
      metrics: {
        ...mockMetrics,
        overallScore: 65,
      },
    };

    render(<ComplianceDashboard {...propsWithLowScore} />);
    
    // Should show a down trend for low score
    expect(screen.getByText('65%')).toBeInTheDocument();
  });
});