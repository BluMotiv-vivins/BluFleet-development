import {
  calculateComplianceScore,
  calculateSafetyScore,
  calculateEnvironmentalScore,
  calculateOperationalScore,
  generateComplianceMetrics,
  isCertificationExpiringSoon,
  isBadgeExpiringSoon,
  calculateRiskAssessment,
} from '../complianceCalculations';
import { 
  ComplianceBadge, 
  ComplianceViolation, 
  VehicleCertification,
  AccessLog 
} from '../../types';

describe('complianceCalculations', () => {
  const mockBadges: ComplianceBadge[] = [
    {
      id: 'badge_1',
      type: 'safety',
      name: 'Safety Badge',
      status: 'active',
      issuedDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-01-01'),
      issuingAuthority: 'Authority',
      description: 'Description',
    },
    {
      id: 'badge_2',
      type: 'environmental',
      name: 'Environmental Badge',
      status: 'expired',
      issuedDate: new Date('2023-01-01'),
      expiryDate: new Date('2024-01-01'),
      issuingAuthority: 'Authority',
      description: 'Description',
    },
  ];

  const mockViolations: ComplianceViolation[] = [
    {
      id: 'violation_1',
      type: 'safety',
      severity: 'critical',
      description: 'Critical safety violation',
      timestamp: new Date('2024-12-01'),
      correctionRequired: true,
      reportedBy: 'system',
    },
    {
      id: 'violation_2',
      type: 'operational',
      severity: 'minor',
      description: 'Minor operational violation',
      timestamp: new Date('2024-12-02'),
      resolvedAt: new Date('2024-12-03'),
      correctionRequired: false,
      reportedBy: 'system',
    },
  ];

  const mockCertifications: VehicleCertification[] = [
    {
      id: 'cert_1',
      name: 'Safety Certification',
      type: 'safety',
      issuedDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-01-01'),
      issuingBody: 'Safety Authority',
      certificateNumber: 'SAFE-001',
      status: 'valid',
    },
    {
      id: 'cert_2',
      name: 'Environmental Certification',
      type: 'environmental',
      issuedDate: new Date('2023-01-01'),
      expiryDate: new Date('2024-01-01'),
      issuingBody: 'Environmental Authority',
      certificateNumber: 'ENV-001',
      status: 'expired',
    },
  ];

  const mockAccessLogs: AccessLog[] = [
    {
      id: 'log_1',
      vehicleId: 'EV-001',
      areaId: 'area_1',
      areaName: 'Restricted Area',
      accessType: 'entry',
      timestamp: new Date('2024-12-01'),
      authorized: true,
      reportedBy: 'system',
    },
    {
      id: 'log_2',
      vehicleId: 'EV-002',
      areaId: 'area_2',
      areaName: 'Secure Zone',
      accessType: 'violation',
      timestamp: new Date('2024-12-02'),
      authorized: false,
      reportedBy: 'security',
    },
  ];

  describe('calculateComplianceScore', () => {
    it('calculates perfect score with no violations', () => {
      const score = calculateComplianceScore([], [], []);
      expect(score).toBe(100);
    });

    it('deducts points for critical violations', () => {
      const violations = [mockViolations[0]]; // Critical violation
      const score = calculateComplianceScore([], violations, []);
      expect(score).toBe(80); // 100 - 20 for critical
    });

    it('deducts points for expired badges', () => {
      const badges = [mockBadges[1]]; // Expired badge
      const score = calculateComplianceScore(badges, [], []);
      expect(score).toBe(95); // 100 - 5 for expired badge
    });

    it('deducts points for expired certifications', () => {
      const certifications = [mockCertifications[1]]; // Expired certification
      const score = calculateComplianceScore([], [], certifications);
      expect(score).toBe(92); // 100 - 8 for expired certification
    });

    it('adds bonus points for active safety badges', () => {
      const badges = [mockBadges[0]]; // Active safety badge
      const score = calculateComplianceScore(badges, [], []);
      expect(score).toBe(102); // 100 + 2 for active safety badge
    });

    it('allows score above 100 for exceptional compliance', () => {
      const badges = Array(10).fill(mockBadges[0]); // 10 active safety badges
      const score = calculateComplianceScore(badges, [], []);
      expect(score).toBe(120); // 100 + (10 * 2) bonus points
    });

    it('floors score at 0', () => {
      const violations = Array(10).fill(mockViolations[0]); // 10 critical violations
      const score = calculateComplianceScore([], violations, []);
      expect(score).toBe(0); // Floored at 0
    });
  });

  describe('calculateSafetyScore', () => {
    it('calculates perfect safety score with no safety violations', () => {
      const score = calculateSafetyScore([], []);
      expect(score).toBe(100);
    });

    it('deducts points for safety violations', () => {
      const violations = [mockViolations[0]]; // Critical safety violation
      const score = calculateSafetyScore(violations, []);
      expect(score).toBe(75); // 100 - 25 for critical safety violation
    });

    it('deducts points for expired safety certifications', () => {
      const certifications = [mockCertifications[1]]; // Expired certification (but not safety type)
      const score = calculateSafetyScore([], certifications);
      expect(score).toBe(100); // No deduction for non-safety certification
    });

    it('ignores resolved violations', () => {
      const violations = [mockViolations[1]]; // Resolved violation
      const score = calculateSafetyScore(violations, []);
      expect(score).toBe(100); // No deduction for resolved violation
    });
  });

  describe('calculateEnvironmentalScore', () => {
    it('calculates perfect environmental score', () => {
      const score = calculateEnvironmentalScore([], []);
      expect(score).toBe(100);
    });

    it('adds bonus for valid environmental certifications', () => {
      const certifications = [
        { ...mockCertifications[0], type: 'environmental' as const }
      ];
      const score = calculateEnvironmentalScore([], certifications);
      expect(score).toBe(105); // 100 + 5 for valid environmental certification
    });
  });

  describe('calculateOperationalScore', () => {
    it('calculates perfect operational score', () => {
      const score = calculateOperationalScore([], []);
      expect(score).toBe(100);
    });

    it('deducts points for unauthorized access', () => {
      const accessLogs = [mockAccessLogs[1]]; // Unauthorized access
      const score = calculateOperationalScore([], accessLogs);
      expect(score).toBe(98); // 100 - 2 for unauthorized access
    });

    it('deducts points for operational violations', () => {
      const violations = [
        { ...mockViolations[0], type: 'restricted_area' as const }
      ];
      const score = calculateOperationalScore(violations, []);
      expect(score).toBe(85); // 100 - 15 for critical operational violation
    });
  });

  describe('generateComplianceMetrics', () => {
    it('generates comprehensive compliance metrics', () => {
      const metrics = generateComplianceMetrics(
        mockBadges,
        mockViolations,
        mockCertifications,
        mockAccessLogs
      );

      expect(metrics.overallScore).toBeGreaterThan(0);
      expect(metrics.safetyScore).toBeGreaterThan(0);
      expect(metrics.environmentalScore).toBeGreaterThan(0);
      expect(metrics.operationalScore).toBeGreaterThan(0);
      expect(metrics.violations.total).toBe(2);
      expect(metrics.violations.pending).toBe(1);
      expect(metrics.violations.resolved).toBe(1);
      expect(metrics.certifications.total).toBe(2);
      expect(metrics.trendsData).toHaveLength(30);
    });

    it('calculates violation counts by type', () => {
      const metrics = generateComplianceMetrics(
        [],
        mockViolations,
        [],
        []
      );

      expect(metrics.violations.byType.safety).toBe(1);
      expect(metrics.violations.byType.operational).toBe(1);
    });
  });

  describe('isCertificationExpiringSoon', () => {
    it('returns true for certification expiring within 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15); // 15 days from now

      const certification = {
        ...mockCertifications[0],
        expiryDate: futureDate,
      };

      expect(isCertificationExpiringSoon(certification)).toBe(true);
    });

    it('returns false for certification expiring after 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45); // 45 days from now

      const certification = {
        ...mockCertifications[0],
        expiryDate: futureDate,
      };

      expect(isCertificationExpiringSoon(certification)).toBe(false);
    });

    it('returns false for already expired certification', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

      const certification = {
        ...mockCertifications[0],
        expiryDate: pastDate,
      };

      expect(isCertificationExpiringSoon(certification)).toBe(false);
    });
  });

  describe('isBadgeExpiringSoon', () => {
    it('returns true for badge expiring within 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20); // 20 days from now

      const badge = {
        ...mockBadges[0],
        expiryDate: futureDate,
      };

      expect(isBadgeExpiringSoon(badge)).toBe(true);
    });

    it('returns false for badge without expiry date', () => {
      const badge = {
        ...mockBadges[0],
        expiryDate: undefined,
      };

      expect(isBadgeExpiringSoon(badge)).toBe(false);
    });
  });

  describe('calculateRiskAssessment', () => {
    it('returns low risk for minimal violations and claims', () => {
      const risk = calculateRiskAssessment([], 0, 0);
      expect(risk).toBe('low');
    });

    it('returns medium risk for moderate violations', () => {
      const violations = [mockViolations[0]]; // One critical violation
      const risk = calculateRiskAssessment(violations, 1, 10000);
      expect(risk).toBe('medium');
    });

    it('returns high risk for many violations and high claims', () => {
      const violations = [
        mockViolations[0],
        mockViolations[0],
        mockViolations[0],
      ]; // Multiple critical violations
      const risk = calculateRiskAssessment(violations, 5, 150000);
      expect(risk).toBe('high');
    });

    it('considers resolved violations', () => {
      const violations = [mockViolations[1]]; // Resolved violation
      const risk = calculateRiskAssessment(violations, 0, 0);
      expect(risk).toBe('low'); // Resolved violations don't count
    });
  });
});