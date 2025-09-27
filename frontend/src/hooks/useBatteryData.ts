import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { BatteryData, ChargingQueueItem, PowerConsumptionData } from '../types';
import {
  calculateBatteryStats,
  generateChargingQueue,
  generatePowerConsumptionData,
  optimizeChargingQueue,
  formatTimeRemaining,
} from '../utils/batteryCalculations';

interface UseBatteryDataReturn {
  batteryData: BatteryData | null;
  chargingQueue: ChargingQueueItem[];
  powerConsumption: PowerConsumptionData[];
  nextChargeCountdown: string;
  isLoading: boolean;
  error: string | null;
  updateChargingPriority: (vehicleId: string, priority: 'high' | 'medium' | 'low') => void;
  optimizeQueue: () => void;
  refreshData: () => void;
}

export const useBatteryData = (): UseBatteryDataReturn => {
  const { vehicles, loading, error } = useSelector((state: RootState) => state.fleet);
  
  const [batteryData, setBatteryData] = useState<BatteryData | null>(null);
  const [chargingQueue, setChargingQueue] = useState<ChargingQueueItem[]>([]);
  const [powerConsumption, setPowerConsumption] = useState<PowerConsumptionData[]>([]);
  const [nextChargeCountdown, setNextChargeCountdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Calculate battery statistics
  const calculateStats = useCallback(() => {
    if (vehicles.length === 0) {
      setBatteryData(null);
      setChargingQueue([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Calculate battery data
      const stats = calculateBatteryStats(vehicles);
      setBatteryData(stats);

      // Generate charging queue
      const queue = generateChargingQueue(vehicles, 10);
      setChargingQueue(queue);

      // Generate power consumption data
      const consumption = generatePowerConsumptionData(vehicles);
      setPowerConsumption(consumption);

    } catch (err) {
      console.error('Error calculating battery stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [vehicles]);

  // Update countdown timer
  useEffect(() => {
    if (!batteryData?.nextChargeTime) {
      setNextChargeCountdown('');
      return;
    }

    const updateCountdown = () => {
      const countdown = formatTimeRemaining(batteryData.nextChargeTime!);
      setNextChargeCountdown(countdown);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [batteryData?.nextChargeTime]);

  // Recalculate when vehicles change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Update charging priority
  const updateChargingPriority = useCallback((vehicleId: string, priority: 'high' | 'medium' | 'low') => {
    setChargingQueue(prev => {
      const updated = prev.map(item => 
        item.vehicleId === vehicleId 
          ? { ...item, priority }
          : item
      );
      
      // Re-sort based on new priority
      return optimizeChargingQueue(updated);
    });
  }, []);

  // Optimize queue
  const optimizeQueue = useCallback(() => {
    setChargingQueue(prev => optimizeChargingQueue(prev));
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    batteryData,
    chargingQueue,
    powerConsumption,
    nextChargeCountdown,
    isLoading: isLoading || loading,
    error,
    updateChargingPriority,
    optimizeQueue,
    refreshData,
  };
};