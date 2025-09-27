import React from 'react';
import { KPICard } from '../../ui';
import { formatPercentage } from '../../../utils/kpiCalculations';
import type { KPICalculationResult } from '../../../utils/kpiCalculations';

interface BatteryHealthCardProps {
  kpiData: KPICalculationResult;
}

const BatteryHealthCard: React.FC<BatteryHealthCardProps> = ({ kpiData }) => {
  const { averageBatteryLevel, averageBatteryHealth, details, trends } = kpiData;
  const { batteryDetails } = details;

  const subtitle = `${formatPercentage(averageBatteryHealth)} Overall Health • ${batteryDetails.healthyBatteries} Healthy Batteries`;

  // Determine color based on battery level
  const getColor = (level: number): 'green' | 'blue' | 'orange' | 'red' => {
    if (level >= 80) return 'green';
    if (level >= 60) return 'blue';
    if (level >= 40) return 'orange';
    return 'red';
  };

  return (
    <KPICard
      title="Battery Health Overview"
      value={formatPercentage(averageBatteryLevel)}
      subtitle={subtitle}
      color={getColor(averageBatteryLevel)}
      icon={(
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )}
      trend={trends.batteryHealth}
      className="battery-health-card"
    />
  );
};

export default BatteryHealthCard;