import React from 'react';
import { useDataFreshness } from '../../hooks/useRealTimePerformance';

interface DataFreshnessIndicatorProps {
  dataType: string;
  label?: string;
  showAge?: boolean;
  className?: string;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  dataType,
  label,
  showAge = true,
  className = '',
}) => {
  const { isDataStale, getDataAge, lastUpdateTimes } = useDataFreshness();

  const isStale = isDataStale(dataType);
  const age = getDataAge(dataType);
  const lastUpdate = lastUpdateTimes[dataType];

  const formatAge = (ageMs: number | null) => {
    if (!ageMs) return 'Never';
    
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s ago`;
    } else if (seconds > 0) {
      return `${seconds}s ago`;
    } else {
      return 'Just now';
    }
  };

  const getStatusColor = () => {
    if (!lastUpdate) return 'text-gray-400';
    if (isStale) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!lastUpdate) {
      return '⚫'; // No data
    } else if (isStale) {
      return '🟡'; // Stale data
    } else {
      return '🟢'; // Fresh data
    }
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <span className="text-xs">{getStatusIcon()}</span>
      {label && (
        <span className="text-gray-600">{label}:</span>
      )}
      {showAge && (
        <span className={getStatusColor()}>
          {formatAge(age)}
        </span>
      )}
    </div>
  );
};

export const DataFreshnessPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lastUpdateTimes, getStaleDataTypes } = useDataFreshness();
  const staleTypes = getStaleDataTypes();

  const dataTypes = [
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'battery_data', label: 'Battery' },
    { key: 'location_data', label: 'Locations' },
    { key: 'charging_stations', label: 'Charging' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Freshness</h3>
      
      {Object.keys(lastUpdateTimes).length === 0 ? (
        <p className="text-xs text-gray-500">No real-time data received yet</p>
      ) : (
        <div className="space-y-2">
          {dataTypes.map(({ key, label }) => (
            lastUpdateTimes[key] && (
              <DataFreshnessIndicator
                key={key}
                dataType={key}
                label={label}
                className="justify-between"
              />
            )
          ))}
          
          {staleTypes.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <span className="font-medium text-yellow-800">Stale Data:</span>
              <span className="text-yellow-700 ml-1">
                {staleTypes.join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataFreshnessIndicator;