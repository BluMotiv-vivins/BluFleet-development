import React from 'react';
import { useKPIData } from '../../hooks/useKPIData';
import {
  TotalFleetStatusCard,
  BatteryHealthCard,
  CostSavingsCard,
  SustainabilityCard,
} from './kpi';

const KPICards: React.FC = () => {
  const { kpiData, isLoading } = useKPIData();

  if (isLoading || !kpiData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                      gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            data-testid={`loading-skeleton-${index}`}
            className="card p-4 sm:p-6 border-l-4 border-l-gray-300 
                       bg-gray-50 dark:bg-gray-800 animate-pulse 
                       transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-4 h-3 sm:w-6 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-3 sm:w-24 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-12 h-6 sm:w-16 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-28 h-2 sm:w-32 sm:h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                    gap-3 sm:gap-4 lg:gap-6 xl:gap-8 
                    transition-all duration-300">
      <TotalFleetStatusCard kpiData={kpiData} />
      <BatteryHealthCard kpiData={kpiData} />
      <CostSavingsCard kpiData={kpiData} />
      <SustainabilityCard kpiData={kpiData} />
    </div>
  );
};

export default KPICards;