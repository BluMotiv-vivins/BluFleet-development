import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { acknowledgeAlert, resolveAlert } from '../../store/slices/alertSlice';
import type { Alert } from '../../types';

export interface AlertPanelProps {
  maxDisplayed?: number;
  showFilters?: boolean;
  className?: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({
  maxDisplayed = 10,
  showFilters = true,
  className = '',
}) => {
  const dispatch = useDispatch();
  const { alerts, loading } = useSelector((state: RootState) => state.alerts);
  
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Priority order for severity levels
  const severityPriority = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => {
      // Filter by resolved status
      if (!showResolved && alert.resolvedAt) return false;
      
      // Filter by severity
      if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
      
      // Filter by type
      if (selectedType !== 'all' && alert.type !== selectedType) return false;
      
      return true;
    });

    // Sort by priority (severity) and timestamp
    filtered.sort((a, b) => {
      const severityDiff = severityPriority[b.severity] - severityPriority[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered.slice(0, maxDisplayed);
  }, [alerts, selectedSeverity, selectedType, showResolved, maxDisplayed]);

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          dot: 'bg-red-500',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-200',
          dot: 'bg-orange-500',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          dot: 'bg-yellow-500',
          badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
        };
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          dot: 'bg-blue-500',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
          dot: 'bg-gray-500',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        };
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'battery':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v.75c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 7.5v6A2.25 2.25 0 003.75 18z" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        );
      case 'safety':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        );
      case 'geofence':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleAcknowledge = (alertId: string) => {
    dispatch(acknowledgeAlert(alertId));
  };

  const handleResolve = (alertId: string) => {
    dispatch(resolveAlert(alertId));
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Alerts & Notifications
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredAlerts.length} of {alerts.length}
        </span>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="battery">Battery</option>
            <option value="maintenance">Maintenance</option>
            <option value="safety">Safety</option>
            <option value="geofence">Geofence</option>
            <option value="system">System</option>
          </select>

          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="mr-1"
            />
            Show Resolved
          </label>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <p>No alerts to display</p>
            <p className="text-sm">Your fleet is running smoothly</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const colors = getSeverityColor(alert.severity);
            const TypeIcon = () => getTypeIcon(alert.type);
            
            return (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-4 rounded-xl border ${colors.bg} ${colors.border} ${
                  alert.acknowledged ? 'opacity-75' : ''
                }`}
              >
                <div className={`w-2 h-2 ${colors.dot} rounded-full mt-2 flex-shrink-0`}></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mb-1">
                      <TypeIcon />
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatTimestamp(new Date(alert.timestamp))}
                    </span>
                  </div>
                  
                  <h4 className={`text-sm font-medium ${colors.text} mb-1`}>
                    {alert.title}
                  </h4>
                  
                  <p className={`text-sm ${colors.text} opacity-90 mb-2`}>
                    {alert.message}
                  </p>
                  
                  {(alert.vehicleId || alert.driverId) && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {alert.vehicleId && (
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Vehicle: {alert.vehicleId}
                        </span>
                      )}
                      {alert.driverId && (
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Driver: {alert.driverId}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {!alert.resolvedAt && (
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                  
                  {alert.resolvedAt && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      ✓ Resolved {formatTimestamp(new Date(alert.resolvedAt))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertPanel;