import React, { useState } from 'react';
import type { AccessLog } from '../../types';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';

interface AccessLogViewerProps {
  accessLogs: AccessLog[];
  onExportLogs?: () => void;
}

export const AccessLogViewer: React.FC<AccessLogViewerProps> = ({ 
  accessLogs, 
  onExportLogs 
}) => {
  const [filter, setFilter] = useState<'all' | 'authorized' | 'violations'>('all');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [areaFilter] = useState('all');

  const timeFilterOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  const getAccessTypeColor = (accessType: string, authorized: boolean) => {
    if (!authorized) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    switch (accessType) {
      case 'entry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'exit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'violation':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessTypeIcon = (accessType: string, authorized: boolean) => {
    if (!authorized) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }

    switch (accessType) {
      case 'entry':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'exit':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getViolationDescription = (violationType?: string) => {
    switch (violationType) {
      case 'unauthorized_entry':
        return 'Unauthorized entry attempt';
      case 'overstay':
        return 'Exceeded maximum stay duration';
      case 'wrong_vehicle_type':
        return 'Vehicle type not permitted in area';
      case 'missing_certification':
        return 'Required certification not found';
      default:
        return 'Access violation';
    }
  };

  const filteredLogs = accessLogs.filter(log => {
    // Filter by authorization status
    if (filter === 'authorized' && !log.authorized) return false;
    if (filter === 'violations' && log.authorized) return false;
    
    // Filter by area (if implemented)
    if (areaFilter !== 'all' && log.areaId !== areaFilter) return false;
    
    // Filter by time (basic implementation)
    const now = new Date();
    const logTime = new Date(log.timestamp);
    const timeDiff = now.getTime() - logTime.getTime();
    
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

  const uniqueAreas = Array.from(new Set(accessLogs.map(log => log.areaName)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'authorized', 'violations'] as const).map((filterOption) => (
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
                    ? accessLogs.length 
                    : filterOption === 'authorized'
                    ? accessLogs.filter(l => l.authorized).length
                    : accessLogs.filter(l => !l.authorized).length
                  }
                </span>
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
        {onExportLogs && (
          <Button variant="secondary" onClick={onExportLogs}>
            Export Logs
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Access Events</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Authorized Access</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredLogs.filter(l => l.authorized).length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Violations</h3>
          <p className="text-2xl font-bold text-red-600">
            {filteredLogs.filter(l => !l.authorized).length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Unique Areas</h3>
          <p className="text-2xl font-bold text-blue-600">{uniqueAreas.length}</p>
        </div>
      </div>

      {/* Access Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No access logs found for the selected filters
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg p-4 ${
                !log.authorized ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAccessTypeIcon(log.accessType, log.authorized)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Vehicle {log.vehicleId}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAccessTypeColor(log.accessType, log.authorized)}`}
                      >
                        {log.accessType.charAt(0).toUpperCase() + log.accessType.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Area:</span> {log.areaName}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span> {formatDate(log.timestamp)}
                      </p>
                      {log.duration && (
                        <p>
                          <span className="font-medium">Duration:</span> {formatDuration(log.duration)}
                        </p>
                      )}
                      {log.driverId && (
                        <p>
                          <span className="font-medium">Driver:</span> {log.driverId}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Reported by:</span> {log.reportedBy}
                      </p>
                      {!log.authorized && log.violationType && (
                        <p className="text-red-600">
                          <span className="font-medium">Violation:</span> {getViolationDescription(log.violationType)}
                        </p>
                      )}
                      {log.notes && (
                        <p>
                          <span className="font-medium">Notes:</span> {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {!log.authorized && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Violation
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