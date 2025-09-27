import React from 'react';
import { KPICard } from '../../ui';
import type { KPICalculationResult } from '../../../utils/kpiCalculations';

interface SustainabilityCardProps {
  kpiData: KPICalculationResult;
}

const SustainabilityCard: React.FC<SustainabilityCardProps> = ({ kpiData }) => {
  const { co2Reduction, details, trends } = kpiData;
  const { sustainabilityDetails } = details;

  const subtitle = `${sustainabilityDetails.co2ReductionPercentage}% Reduction vs ICE Fleet • ${sustainabilityDetails.totalMilesDriven.toLocaleString()} Miles Driven`;

  return (
    <KPICard
      title="Sustainability Impact"
      value={`${co2Reduction} tons CO₂`}
      subtitle={subtitle}
      color="green"
      icon={(
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
      trend={trends.co2Reduction}
      className="sustainability-card"
    />
  );
};

export default SustainabilityCard;