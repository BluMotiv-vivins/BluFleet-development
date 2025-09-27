import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { updateKPIDetails } from '../store/slices/dashboardSlice';
import { calculateKPIs } from '../utils/kpiCalculations';

/**
 * Hook to manage KPI data calculation and real-time updates
 */
export const useKPIData = () => {
  const dispatch = useAppDispatch();
  const { vehicles, chargingStations } = useAppSelector((state) => state.fleet);
  const { kpiDetails, previousPeriodData, refreshInterval } = useAppSelector((state) => state.dashboard);

  const calculateAndUpdateKPIs = useCallback(() => {
    const kpiResult = calculateKPIs(vehicles, chargingStations, previousPeriodData || undefined);
    dispatch(updateKPIDetails(kpiResult));
    return kpiResult;
  }, [vehicles, chargingStations, previousPeriodData, dispatch]);

  // Initial calculation when dependencies change
  useEffect(() => {
    calculateAndUpdateKPIs();
  }, [calculateAndUpdateKPIs]);

  // Set up real-time updates
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      calculateAndUpdateKPIs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, calculateAndUpdateKPIs]);

  return {
    kpiData: kpiDetails,
    refreshKPIs: calculateAndUpdateKPIs,
    isLoading: !kpiDetails,
  };
};

export default useKPIData;