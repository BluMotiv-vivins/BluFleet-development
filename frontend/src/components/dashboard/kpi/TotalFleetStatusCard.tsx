import React from 'react';
import { KPICard } from '../../ui';
import type { KPICalculationResult } from '../../../utils/kpiCalculations';

interface TotalFleetStatusCardProps {
  kpiData: KPICalculationResult;
}

const TotalFleetStatusCard: React.FC<TotalFleetStatusCardProps> = ({ kpiData }) => {
  const { totalVehicles, details, trends } = kpiData;
  const { statusBreakdown } = details;

  const subtitle = `${statusBreakdown.active} Active, ${statusBreakdown.charging} Charging, ${statusBreakdown.maintenance} Maintenance`;

  return (
    <KPICard
      title="Total Fleet Status"
      value={totalVehicles}
      subtitle={subtitle}
      color="green"
      icon={(
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )}
      trend={trends.totalVehicles}
      className="total-fleet-status-card"
    />
  );
};

export default TotalFleetStatusCard;