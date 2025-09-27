import React, { useState } from 'react';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';

interface RegulatoryReportsProps {
  onGenerateReport: (type: string) => void;
}

export const RegulatoryReports: React.FC<RegulatoryReportsProps> = ({ onGenerateReport }) => {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'safety', label: 'Safety Compliance Report' },
    { value: 'environmental', label: 'Environmental Impact Report' },
    { value: 'operational', label: 'Operational Compliance Report' },
    { value: 'financial', label: 'Financial Compliance Report' },
    { value: 'audit', label: 'Audit Trail Report' },
    { value: 'violations', label: 'Violations Summary Report' },
    { value: 'certifications', label: 'Certifications Status Report' },
    { value: 'insurance', label: 'Insurance Claims Report' },
  ];

  const reportPeriods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;
    
    setIsGenerating(true);
    try {
      await onGenerateReport(selectedReportType);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'safety':
        return 'Comprehensive safety metrics, incident reports, and compliance status for regulatory authorities.';
      case 'environmental':
        return 'Environmental impact assessment, emissions data, and sustainability metrics.';
      case 'operational':
        return 'Operational efficiency, vehicle utilization, and performance metrics.';
      case 'financial':
        return 'Cost analysis, savings reports, and financial compliance documentation.';
      case 'audit':
        return 'Complete audit trail of all system activities and compliance actions.';
      case 'violations':
        return 'Summary of all compliance violations, resolutions, and corrective actions.';
      case 'certifications':
        return 'Status of all vehicle and driver certifications, renewals, and expirations.';
      case 'insurance':
        return 'Insurance coverage details, claims history, and risk assessments.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        Generate regulatory reports for compliance authorities, audits, and internal reviews.
      </div>

      {/* Report Type Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <Dropdown
            options={reportTypes}
            value={selectedReportType}
            onSelect={setSelectedReportType}
            placeholder="Select report type..."
          />
          {selectedReportType && (
            <p className="mt-2 text-sm text-gray-600">
              {getReportDescription(selectedReportType)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Period
          </label>
          <Dropdown
            options={reportPeriods}
            value={reportPeriod}
            onSelect={setReportPeriod}
            placeholder="Select report period..."
          />
        </div>
      </div>

      {/* Report Templates */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Report Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Monthly Safety Report',
              description: 'Standard monthly safety compliance report for regulatory submission.',
              type: 'safety',
              period: 'monthly',
            },
            {
              title: 'Quarterly Environmental Report',
              description: 'Environmental impact and sustainability metrics for quarterly review.',
              type: 'environmental',
              period: 'quarterly',
            },
            {
              title: 'Annual Compliance Summary',
              description: 'Comprehensive annual compliance report covering all areas.',
              type: 'operational',
              period: 'yearly',
            },
            {
              title: 'Incident Response Report',
              description: 'Emergency response and incident management summary.',
              type: 'audit',
              period: 'custom',
            },
          ].map((template, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedReportType(template.type);
                setReportPeriod(template.period);
              }}
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                {template.title}
              </h4>
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="border-t pt-6 flex justify-end space-x-3">
        <Button
          variant="secondary"
          onClick={() => {
            setSelectedReportType('');
            setReportPeriod('monthly');
          }}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          onClick={handleGenerateReport}
          disabled={!selectedReportType || isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </Button>
      </div>

      {/* Recent Reports */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Reports
        </h3>
        <div className="space-y-3">
          {[
            {
              name: 'Safety Compliance Report - November 2024',
              type: 'Safety',
              date: '2024-12-01',
              status: 'Completed',
            },
            {
              name: 'Environmental Impact Report - Q3 2024',
              type: 'Environmental',
              date: '2024-10-15',
              status: 'Submitted',
            },
            {
              name: 'Operational Compliance - October 2024',
              type: 'Operational',
              date: '2024-11-01',
              status: 'Pending Review',
            },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">{report.name}</h4>
                <p className="text-sm text-gray-600">
                  {report.type} • Generated on {new Date(report.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : report.status === 'Submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {report.status}
                </span>
                <Button variant="secondary" size="sm">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};