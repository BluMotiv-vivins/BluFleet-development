import React, { useState } from 'react';
import type { AuditTrail } from '../../types';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';

interface AuditTrailViewerProps {
  auditTrails: AuditTrail[];
  onExportAuditTrail?: () => void;
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({ 
  auditTrails, 
  onExportAuditTrail 
}) => {
  const [filter, setFilter] = useState<'all' | 'compliance' | 'security' | 'operational' | 'maintenance'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [timeFilter, setTimeFilter] = useState('24h');

  const timeFilterOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'operational':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'update':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'access':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case 'violation':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'emergency':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      second: '2-digit',
    }).format(new Date(date));
  };

  const filteredTrails = auditTrails.filter(trail => {
    // Filter by category
    if (filter !== 'all' && trail.category !== filter) return false;
    
    // Filter by severity
    if (severityFilter !== 'all' && trail.severity !== severityFilter) return false;
    
    // Filter by time (basic implementation)
    const now = new Date();
    const trailTime = new Date(trail.timestamp);
    const timeDiff = now.getTime() - trailTime.getTime();
    
    switch (timeFilter) {
      case '1h':
        return timeDiff <= 60 * 60 * 1000;
      case '24h':
        return timeDiff <= 24 * 60 * 60 * 1000;
      case '7d':
        return timeDiff <= 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return timeDiff <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'compliance', 'security', 'operational', 'maintenance'] as const).map((filterOption) => (
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
                    ? auditTrails.length 
                    : auditTrails.filter(t => t.category === filterOption).length
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'info', 'warning', 'error', 'critical'] as const).map((severityOption) => (
              <button
                key={severityOption}
                onClick={() => setSeverityFilter(severityOption)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  severityFilter === severityOption
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {severityOption.charAt(0).toUpperCase() + severityOption.slice(1)}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <Dropdown
            options={timeFilterOptions}
            value={timeFilter}
            onSelect={setTimeFilter}
            placeholder="Select time range..."
          />
        </div>

        {/* Export Button */}
        {onExportAuditTrail && (
          <Button variant="secondary" onClick={onExportAuditTrail}>
            Export Audit Trail
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredTrails.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Critical Events</h3>
          <p className="text-2xl font-bold text-red-600">
            {filteredTrails.filter(t => t.severity === 'critical').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Security Events</h3>
          <p className="text-2xl font-bold text-orange-600">
            {filteredTrails.filter(t => t.category === 'security').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Compliance Events</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredTrails.filter(t => t.category === 'compliance').length}
          </p>
        </div>
      </div>

      {/* Audit Trail List */}
      {filteredTrails.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No audit trail entries found for the selected filters
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrails.map((trail) => (
            <div
              key={trail.id}
              className={`border rounded-lg p-4 ${
                trail.severity === 'critical' ? 'border-red-200 bg-red-50' : 
                trail.severity === 'error' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(trail.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {trail.action.charAt(0).toUpperCase() + trail.action.slice(1)} - {trail.entityType}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(trail.severity)}`}
                      >
                        {trail.severity.charAt(0).toUpperCase() + trail.severity.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(trail.category)}`}
                      >
                        {trail.category.charAt(0).toUpperCase() + trail.category.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {trail.description}
                    </p>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Entity ID:</span> {trail.entityId}
                      </p>
                      <p>
                        <span className="font-medium">User:</span> {trail.userName} ({trail.userId})
                      </p>
                      <p>
                        <span className="font-medium">Timestamp:</span> {formatDate(trail.timestamp)}
                      </p>
                      {trail.ipAddress && (
                        <p>
                          <span className="font-medium">IP Address:</span> {trail.ipAddress}
                        </p>
                      )}
                      {trail.userAgent && (
                        <p>
                          <span className="font-medium">User Agent:</span> {trail.userAgent}
                        </p>
                      )}
                    </div>

                    {/* Changes Details */}
                    {trail.changes && Object.keys(trail.changes).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Changes:</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(trail.changes).map(([field, change]) => (
                            <div key={field} className="flex items-center space-x-2">
                              <span className="font-medium text-gray-700">{field}:</span>
                              <span className="text-red-600 line-through">{String(change.old)}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-600">{String(change.new)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};