import React, { useState } from 'react';
import type { ComplianceMetrics, ComplianceBadge, ComplianceViolation } from '../../types';
import KPICard from '../ui/KPICard';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { ComplianceBadgeList } from './ComplianceBadgeList';
import { ViolationsList } from './ViolationsList';
import { RegulatoryReports } from './RegulatoryReports';
import { EmergencyResponsePanel } from './EmergencyResponsePanel';

interface ComplianceDashboardProps {
  metrics: ComplianceMetrics;
  badges: ComplianceBadge[];
  violations: ComplianceViolation[];
  onGenerateReport: (type: string) => void;
  onEmergencyResponse: (type: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  metrics,
  badges,
  violations,
  onGenerateReport,
  onEmergencyResponse,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getScoreColor = (score: number): 'green' | 'blue' | 'orange' | 'red' => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'orange';
    return 'red';
  };

  const ShieldIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const ExclamationIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );



  const BadgeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Compliance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Overall Compliance"
          value={`${metrics.overallScore}%`}
          color={getScoreColor(metrics.overallScore)}
          icon={ShieldIcon}
          trend={metrics.overallScore >= 85 ? 'up' : metrics.overallScore >= 70 ? 'neutral' : 'down'}
        />
        <KPICard
          title="Active Violations"
          value={metrics.violations.pending}
          subtitle={`${metrics.violations.resolved} resolved`}
          color={metrics.violations.pending === 0 ? 'green' : metrics.violations.pending <= 2 ? 'orange' : 'red'}
          icon={ExclamationIcon}
        />
        <KPICard
          title="Valid Certifications"
          value={metrics.certifications.valid}
          subtitle={`${metrics.certifications.expiring} expiring soon`}
          color={metrics.certifications.expiring === 0 ? 'green' : 'orange'}
          icon={BadgeIcon}
        />
        <KPICard
          title="Safety Score"
          value={`${metrics.safetyScore}%`}
          color={getScoreColor(metrics.safetyScore)}
          icon={ShieldIcon}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="primary"
          onClick={() => setActiveModal('badges')}
        >
          View Compliance Badges
        </Button>
        <Button
          variant="secondary"
          onClick={() => setActiveModal('violations')}
        >
          Manage Violations
        </Button>
        <Button
          variant="secondary"
          onClick={() => setActiveModal('reports')}
        >
          Generate Reports
        </Button>
        <Button
          variant="danger"
          onClick={() => setActiveModal('emergency')}
        >
          Emergency Response
        </Button>
      </div>

      {/* Compliance Badges Modal */}
      <Modal
        isOpen={activeModal === 'badges'}
        onClose={() => setActiveModal(null)}
        title="Compliance Badges"
        size="lg"
      >
        <ComplianceBadgeList badges={badges} />
      </Modal>

      {/* Violations Modal */}
      <Modal
        isOpen={activeModal === 'violations'}
        onClose={() => setActiveModal(null)}
        title="Compliance Violations"
        size="lg"
      >
        <ViolationsList violations={violations} />
      </Modal>

      {/* Reports Modal */}
      <Modal
        isOpen={activeModal === 'reports'}
        onClose={() => setActiveModal(null)}
        title="Regulatory Reports"
        size="lg"
      >
        <RegulatoryReports onGenerateReport={onGenerateReport} />
      </Modal>

      {/* Emergency Response Modal */}
      <Modal
        isOpen={activeModal === 'emergency'}
        onClose={() => setActiveModal(null)}
        title="Emergency Response"
        size="lg"
      >
        <EmergencyResponsePanel onEmergencyResponse={onEmergencyResponse} />
      </Modal>
    </div>
  );
};