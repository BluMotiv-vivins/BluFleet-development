import React, { useState } from 'react';
import type { ComplianceViolation } from '../../types';
import Button from '../ui/Button';

interface ViolationsListProps {
  violations: ComplianceViolation[];
  onResolveViolation?: (violationId: string) => void;
}

export const ViolationsList: React.FC<ViolationsListProps> = ({ 
  violations, 
  onResolveViolation 
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getViolationTypeIcon = (type: string) => {
    switch (type) {
      case 'restricted_area':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'speed_limit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'operating_hours':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'certification':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'safety':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const filteredViolations = violations.filter(violation => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !violation.resolvedAt;
    if (filter === 'resolved') return !!violation.resolvedAt;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(['all', 'pending', 'resolved'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === filterOption
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {filterOption === 'all' 
                ? violations.length 
                : filterOption === 'pending'
                ? violations.filter(v => !v.resolvedAt).length
                : violations.filter(v => !!v.resolvedAt).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Violations List */}
      {filteredViolations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No violations found for the selected filter
        </div>
      ) : (
        <div className="space-y-4">
          {filteredViolations.map((violation) => (
            <div
              key={violation.id}
              className={`border rounded-lg p-4 ${
                violation.resolvedAt ? 'bg-gray-50' : 'bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getViolationTypeIcon(violation.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {violation.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Violation
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(violation.severity)}`}
                      >
                        {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {violation.description}
                    </p>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Occurred:</span> {formatDate(violation.timestamp)}
                      </p>
                      {violation.location && (
                        <p>
                          <span className="font-medium">Location:</span> {violation.location.address || `${violation.location.lat}, ${violation.location.lng}`}
                        </p>
                      )}
                      {violation.fineAmount && (
                        <p>
                          <span className="font-medium">Fine:</span> ₹{violation.fineAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Reported by:</span> {violation.reportedBy.replace('_', ' ')}
                      </p>
                      {violation.resolvedAt && (
                        <p className="text-green-600">
                          <span className="font-medium">Resolved:</span> {formatDate(violation.resolvedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {!violation.resolvedAt && onResolveViolation && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onResolveViolation(violation.id)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {violation.correctionRequired && !violation.resolvedAt && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Action Required
                    </span>
                  )}
                  {violation.resolvedAt && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};