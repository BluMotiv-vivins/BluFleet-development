import React from 'react';
import { KPICard } from '../../ui';
import { formatCurrency } from '../../../utils/kpiCalculations';
import type { KPICalculationResult } from '../../../utils/kpiCalculations';

interface CostSavingsCardProps {
  kpiData: KPICalculationResult;
}

const CostSavingsCard: React.FC<CostSavingsCardProps> = ({ kpiData }) => {
  const { monthlySavings, details, trends } = kpiData;
  const { costDetails } = details;

  const subtitle = `vs Traditional ICE Fleet • ${formatCurrency(costDetails.fuelSavings)} Fuel + ${formatCurrency(costDetails.maintenanceSavings)} Maintenance`;

  return (
    <KPICard
      title="Monthly Cost Savings"
      value={formatCurrency(monthlySavings)}
      subtitle={subtitle}
      color="green"
      icon={(
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )}
      trend={trends.monthlySavings}
      className="cost-savings-card"
    />
  );
};

export default CostSavingsCard;