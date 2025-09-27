import React, { useState } from 'react';
import type { InsuranceInfo } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface InsurancePanelProps {
  insuranceInfo: InsuranceInfo;
  onFileNewClaim?: () => void;
  onUpdatePolicy?: () => void;
}

export const InsurancePanel: React.FC<InsurancePanelProps> = ({ 
  insuranceInfo, 
  onFileNewClaim,
  onUpdatePolicy 
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(insuranceInfo.validUntil);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'settled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskAssessmentColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry <= 30;
  const isExpired = daysUntilExpiry < 0;

  return (
    <div className="space-y-6">
      {/* Policy Overview */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Insurance Policy</h2>
            <p className="text-gray-600">Policy #{insuranceInfo.policyNumber}</p>
          </div>
          <div className="flex space-x-2">
            {onUpdatePolicy && (
              <Button variant="secondary" onClick={onUpdatePolicy}>
                Update Policy
              </Button>
            )}
            {onFileNewClaim && (
              <Button variant="primary" onClick={onFileNewClaim}>
                File New Claim
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Provider</h3>
            <p className="text-lg font-semibold text-gray-900">{insuranceInfo.provider}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Coverage Type</h3>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {insuranceInfo.coverageType.replace('_', ' ')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Coverage Amount</h3>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(insuranceInfo.coverageAmount)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Deductible</h3>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(insuranceInfo.deductible)}
            </p>
          </div>
        </div>

        {/* Policy Status */}
        <div className="mt-4 p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Policy Status</h3>
              <p className="text-sm text-blue-700">
                Valid from {formatDate(insuranceInfo.validFrom)} to {formatDate(insuranceInfo.validUntil)}
              </p>
            </div>
            <div className="text-right">
              {isExpired ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                  Expired ({Math.abs(daysUntilExpiry)} days ago)
                </span>
              ) : isExpiringSoon ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Expires in {daysUntilExpiry} days
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  Active ({daysUntilExpiry} days remaining)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-600">Risk Assessment:</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskAssessmentColor(insuranceInfo.riskAssessment)}`}
            >
              {insuranceInfo.riskAssessment.charAt(0).toUpperCase() + insuranceInfo.riskAssessment.slice(1)} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Claims History */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Claims History</h3>
          <Button
            variant="secondary"
            onClick={() => setActiveModal('claims-details')}
          >
            View All Claims
          </Button>
        </div>

        {insuranceInfo.claimsHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No insurance claims on record
          </div>
        ) : (
          <div className="space-y-3">
            {insuranceInfo.claimsHistory.slice(0, 3).map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    Claim #{claim.claimNumber}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)} • {formatDate(claim.incidentDate)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {claim.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(claim.amount)}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getClaimStatusColor(claim.status)}`}
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
            
            {insuranceInfo.claimsHistory.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveModal('claims-details')}
                >
                  View {insuranceInfo.claimsHistory.length - 3} more claims
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claims Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Claims</h3>
          <p className="text-2xl font-bold text-gray-900">
            {insuranceInfo.claimsHistory.length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Pending Claims</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {insuranceInfo.claimsHistory.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Approved Claims</h3>
          <p className="text-2xl font-bold text-green-600">
            {insuranceInfo.claimsHistory.filter(c => c.status === 'approved' || c.status === 'settled').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Claimed</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(
              insuranceInfo.claimsHistory.reduce((sum, claim) => sum + claim.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Claims Details Modal */}
      <Modal
        isOpen={activeModal === 'claims-details'}
        onClose={() => setActiveModal(null)}
        title="All Insurance Claims"
        size="lg"
      >
        <div className="space-y-4">
          {insuranceInfo.claimsHistory.map((claim) => (
            <div
              key={claim.id}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Claim #{claim.claimNumber}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)} Incident
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getClaimStatusColor(claim.status)}`}
                >
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Incident Date:</span> {formatDate(claim.incidentDate)}
                </p>
                <p>
                  <span className="font-medium">Claim Filed:</span> {formatDate(claim.claimDate)}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> {formatCurrency(claim.amount)}
                </p>
                <p>
                  <span className="font-medium">Description:</span> {claim.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};