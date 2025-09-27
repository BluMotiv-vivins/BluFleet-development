import React, { useState } from 'react';
import { useRealTimeSync } from '../../hooks/useRealTimeSync';
import { useRealTimePerformance, useDataFreshness } from '../../hooks/useRealTimePerformance';
import { useConnectionStatus } from '../../hooks/useWebSocket';
import ConnectionStatus from './ConnectionStatus';
import { DataFreshnessPanel } from './DataFreshnessIndicator';
import Modal from './Modal';
import Button from './Button';

interface RealTimeMonitorProps {
  showDetailedView?: boolean;
  className?: string;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  showDetailedView = false,
  className = '',
}) => {
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState(true);
  
  const { 
    lastSyncTime, 
    pendingUpdatesCount,
    forceSync,
    enableAutoAlerts,
    disableAutoAlerts,
  } = useRealTimeSync();
  
  const { metrics, isHealthy, resetMetrics } = useRealTimePerformance();
  const { getStaleDataTypes, clearAllTimestamps } = useDataFreshness();
  const { isConnected, statusText } = useConnectionStatus();

  const staleDataTypes = getStaleDataTypes();
  const hasIssues = !isHealthy || staleDataTypes.length > 0 || pendingUpdatesCount > 0;

  const handleToggleAutoAlerts = () => {
    if (autoAlertsEnabled) {
      disableAutoAlerts();
      setAutoAlertsEnabled(false);
    } else {
      enableAutoAlerts();
      setAutoAlertsEnabled(true);
    }
  };

  const handleResetMetrics = () => {
    resetMetrics();
    clearAllTimestamps();
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) {
      return `${Math.floor(diffMs / 1000)}s ago`;
    } else if (diffMs < 3600000) {
      return `${Math.floor(diffMs / 60000)}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  const getStatusIcon = () => {
    if (!isConnected) return '🔴';
    if (hasIssues) return '🟡';
    return '🟢';
  };

  const getStatusMessage = () => {
    if (!isConnected) return 'Disconnected';
    if (hasIssues) {
      const issues = [];
      if (!isHealthy) issues.push('performance issues');
      if (staleDataTypes.length > 0) issues.push(`${staleDataTypes.length} stale data types`);
      if (pendingUpdatesCount > 0) issues.push(`${pendingUpdatesCount} pending updates`);
      return `Issues: ${issues.join(', ')}`;
    }
    return 'All systems operational';
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-lg" title={getStatusMessage()}>
            {getStatusIcon()}
          </span>
          
          {showDetailedView && (
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <div className="font-medium">{statusText}</div>
              {lastSyncTime && (
                <div>Last sync: {formatLastSync(lastSyncTime)}</div>
              )}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <ConnectionStatus showText={showDetailedView} size="sm" />

        {/* Issues Badge */}
        {hasIssues && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <span>⚠</span>
            <span>
              {!isHealthy && 'Performance'}
              {staleDataTypes.length > 0 && (staleDataTypes.length > 0 && !isHealthy ? ', ' : '') + 'Stale Data'}
              {pendingUpdatesCount > 0 && ((staleDataTypes.length > 0 || !isHealthy) ? ', ' : '') + 'Pending'}
            </span>
          </div>
        )}

        {/* Pending Updates Badge */}
        {pendingUpdatesCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <span>📤</span>
            <span>{pendingUpdatesCount} queued</span>
          </div>
        )}

        {/* Control Button */}
        <button
          onClick={() => setShowControlPanel(true)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          title="Open real-time control panel"
        >
          ⚙️
        </button>
      </div>

      {/* Control Panel Modal */}
      <Modal
        isOpen={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        title="Real-time Monitoring Control Panel"
        size="lg"
      >
        <div className="space-y-6">
          {/* Connection Overview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>{getStatusIcon()}</span>
              Connection Status
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">State:</span>
                <div className="font-medium">{statusText}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Health:</span>
                <div className={`font-medium ${isHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isHealthy ? 'Healthy' : 'Degraded'}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
                <div className="font-medium">{formatLastSync(lastSyncTime)}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Pending Updates:</span>
                <div className="font-medium">{pendingUpdatesCount}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                <div className="font-medium">{metrics.latency}ms</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Message Rate:</span>
                <div className="font-medium">{metrics.messageRate}/min</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                <div className="font-medium">
                  {Math.floor(metrics.uptime / 60000)}m {Math.floor((metrics.uptime % 60000) / 1000)}s
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Reconnections:</span>
                <div className="font-medium">{metrics.reconnectionCount}</div>
              </div>
            </div>
          </div>

          {/* Data Freshness */}
          <DataFreshnessPanel />

          {/* Controls */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Controls</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-generate alerts</span>
                <button
                  onClick={handleToggleAutoAlerts}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    autoAlertsEnabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {autoAlertsEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={forceSync}
                  disabled={!isConnected}
                  size="sm"
                  variant="outline"
                >
                  Force Sync
                </Button>
                
                <Button
                  onClick={handleResetMetrics}
                  size="sm"
                  variant="outline"
                >
                  Reset Metrics
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowControlPanel(false)}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RealTimeMonitor;