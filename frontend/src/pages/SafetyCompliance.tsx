import React, { useState } from 'react';
import { ComplianceDashboard, AccessLogViewer, InsurancePanel, AuditTrailViewer } from '../components/compliance';
import { useComplianceData } from '../hooks/useComplianceData';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { InsuranceInfo } from '../types';

const SafetyCompliance: React.FC = () => {
  const {
    metrics,
    badges,
    violations,
    accessLogs,
    auditTrails,
    loading,
    error,
    generateReport,
    triggerEmergencyResponse,
    exportAccessLogs,
    exportAuditTrail,
  } = useComplianceData();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Mock insurance data for demonstration
  const mockInsuranceInfo: InsuranceInfo = {
    policyNumber: 'FVP-2024-001',
    provider: 'Fleet Insurance Corp',
    coverageType: 'comprehensive',
    coverageAmount: 2000000,
    deductible: 5000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    claimsHistory: [
      {
        id: 'claim_1',
        claimNumber: 'CLM-2024-001',
        incidentDate: new Date('2024-11-15'),
        claimDate: new Date('2024-11-16'),
        type: 'accident',
        amount: 15000,
        status: 'settled',
        description: 'Minor collision in parking lot',
      },
      {
        id: 'claim_2',
        claimNumber: 'CLM-2024-002',
        incidentDate: new Date('2024-10-22'),
        claimDate: new Date('2024-10-23'),
        type: 'vandalism',
        amount: 3500,
        status: 'approved',
        description: 'Vandalism to vehicle exterior',
      },
    ],
    riskAssessment: 'low',
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Compliance Data</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety & Compliance</h1>
          <p className="text-gray-600">Monitor safety metrics, regulatory compliance, and industry-specific requirements</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="secondary"
          onClick={() => setActiveModal('access-logs')}
        >
          View Access Logs
        </Button>
        <Button
          variant="secondary"
          onClick={() => setActiveModal('audit-trail')}
        >
          Audit Trail
        </Button>
        <Button
          variant="secondary"
          onClick={() => setActiveModal('insurance')}
        >
          Insurance Information
        </Button>
        <Button
          variant="primary"
          onClick={() => generateReport('safety')}
        >
          Generate Safety Report
        </Button>
      </div>

      {/* Main Compliance Dashboard */}
      <ComplianceDashboard
        metrics={metrics}
        badges={badges}
        violations={violations}
        onGenerateReport={generateReport}
        onEmergencyResponse={triggerEmergencyResponse}
      />

      {/* Access Logs Modal */}
      <Modal
        isOpen={activeModal === 'access-logs'}
        onClose={() => setActiveModal(null)}
        title="Restricted Area Access Logs"
        size="xl"
      >
        <AccessLogViewer
          accessLogs={accessLogs}
          onExportLogs={exportAccessLogs}
        />
      </Modal>

      {/* Audit Trail Modal */}
      <Modal
        isOpen={activeModal === 'audit-trail'}
        onClose={() => setActiveModal(null)}
        title="Compliance Audit Trail"
        size="xl"
      >
        <AuditTrailViewer
          auditTrails={auditTrails}
          onExportAuditTrail={exportAuditTrail}
        />
      </Modal>

      {/* Insurance Modal */}
      <Modal
        isOpen={activeModal === 'insurance'}
        onClose={() => setActiveModal(null)}
        title="Insurance Information"
        size="xl"
      >
        <InsurancePanel
          insuranceInfo={mockInsuranceInfo}
          onFileNewClaim={() => {
            console.log('Filing new insurance claim...');
            // Would integrate with insurance system
          }}
          onUpdatePolicy={() => {
            console.log('Updating insurance policy...');
            // Would integrate with insurance system
          }}
        />
      </Modal>
    </div>
  );
};

export default SafetyCompliance;