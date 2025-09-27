import React, { useState } from 'react';
import { useConnectionStatus } from '../../hooks/useWebSocket';
import { useRealTimePerformance, useDataFreshness } from '../../hooks/useRealTimePerformance';
import ConnectionStatus from './ConnectionStatus';
import Modal from './Modal';

interface RealTimeStatusProps {
  showDetailedInfo?: boolean;
  className?: string;
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({
  showDetailedInfo = false,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const { isConnected, statusColor, statusText } = useConnectionStatus();
  const { metrics, isHealthy, getPerformanceReport } = useRealTimePerformance();
  const { getStaleDataTypes, lastUpdateTimes } = useDataFreshness();

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatLatency = (latency: number) => {
    if (latency < 100) return 'Excellent';
    if (latency < 300) return 'Good';
    if (latency < 1000) return 'Fair';
    return 'Poor';
  };

  const getHealthColor = () => {
    if (!isConnected) return 'text-gray-500';
    if (isHealthy) return 'text-green-600';
    return 'text-yellow-600';
  };

  const staleDataTypes = getStaleDataTypes();

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <ConnectionStatus 
          showText={showDetailedInfo} 
          size="sm"
        />
        
        {showDetailedInfo && (
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
            {isConnected && (
              <>
                <span className={getHealthColor()}>
                  {isHealthy ? '●' : '◐'} {isHealthy ? 'Healthy' : 'Degraded'}
                </span>
                
                {metrics.uptime > 0 && (
                  <span>
                    ⏱ {formatUptime(metrics.uptime)}
                  </span>
                )}
                
                {metrics.latency > 0 && (
                  <span>
                    📡 {metrics.latency}ms ({formatLatency(metrics.latency)})
                  </span>
                )}
                
                {metrics.messageRate > 0 && (
                  <span>
                    📊 {metrics.messageRate}/min
                  </span>
                )}
                
                {staleDataTypes.length > 0 && (
                  <span className="text-yellow-600">
                    ⚠ {staleDataTypes.length} stale
                  </span>
                )}
              </>
            )}
            
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-800 underline"
              title="View detailed performance metrics"
            >
              Details
            </button>
          </div>
        )}
        
        {!showDetailedInfo && (
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="View connection details"
          >
            ℹ
          </button>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Real-time Connection Status"
        size="lg"
      >
        <div className="space-y-6">
          {/* Connection Overview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Connection Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                  <span className="font-medium">{statusText}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Health:</span>
                <div className={`mt-1 font-medium ${getHealthColor()}`}>
                  {isHealthy ? 'Healthy' : 'Degraded'}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                <div className="mt-1 font-medium">
                  {metrics.uptime > 0 ? formatUptime(metrics.uptime) : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Reconnections:</span>
                <div className="mt-1 font-medium">{metrics.reconnectionCount}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Current Latency:</span>
                <div className="mt-1">
                  <span className="font-medium">{metrics.latency}ms</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({formatLatency(metrics.latency)})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Average Latency:</span>
                <div className="mt-1 font-medium">
                  {metrics.averageLatency.toFixed(1)}ms
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Message Rate:</span>
                <div className="mt-1 font-medium">{metrics.messageRate} msg/min</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Messages:</span>
                <div className="mt-1 font-medium">{metrics.messageCount}</div>
              </div>
            </div>
          </div>

          {/* Data Freshness */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Data Freshness</h3>
            {Object.keys(lastUpdateTimes).length > 0 ? (
              <div className="space-y-2 text-sm">
                {Object.entries(lastUpdateTimes).map(([dataType, timestamp]) => {
                  const age = Date.now() - timestamp.getTime();
                  const isStale = age > 60000; // 1 minute
                  
                  return (
                    <div key={dataType} className="flex justify-between items-center">
                      <span className="capitalize">{dataType.replace('_', ' ')}:</span>
                      <span className={isStale ? 'text-yellow-600' : 'text-green-600'}>
                        {age < 1000 ? 'Just now' : 
                         age < 60000 ? `${Math.floor(age / 1000)}s ago` :
                         `${Math.floor(age / 60000)}m ago`}
                      </span>
                    </div>
                  );
                })}
                
                {staleDataTypes.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                    <div className="text-yellow-800 dark:text-yellow-200 text-xs">
                      <strong>Stale Data:</strong> {staleDataTypes.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No data updates tracked yet</div>
            )}
          </div>

          {/* Performance Report */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Detailed Report</h3>
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {getPerformanceReport()}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getPerformanceReport());
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy Report
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RealTimeStatus;