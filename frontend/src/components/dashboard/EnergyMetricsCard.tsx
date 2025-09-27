import React from 'react';

interface EnergyMetricsCardProps {
  operationsData: any;
  chargingData: any;
}

export const EnergyMetricsCard: React.FC<EnergyMetricsCardProps> = ({ 
  operationsData, 
  chargingData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Metrics</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Energy Consumed</span>
          <span className="font-semibold">{operationsData?.totalEnergyConsumedKwh || 0} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Energy Charged</span>
          <span className="font-semibold">{chargingData?.totalEnergyChargedTodayKwh || 0} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Efficiency Score</span>
          <span className="font-semibold">{operationsData?.avgEfficiencyScore || 0}%</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyMetricsCard;