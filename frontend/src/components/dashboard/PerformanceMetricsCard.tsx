import React from 'react';

interface PerformanceMetricsCardProps {
  metrics: any;
  operationsData: any;
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ 
  metrics, 
  operationsData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Fleet Utilization</span>
          <span className="font-semibold">{metrics?.fleetUtilization || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Energy Efficiency</span>
          <span className="font-semibold">{metrics?.avgEnergyEfficiency || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Driver Score</span>
          <span className="font-semibold">{metrics?.driverBehaviorScore || 0}%</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;