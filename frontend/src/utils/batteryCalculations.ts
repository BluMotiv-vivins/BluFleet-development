import type { Vehicle, BatteryData, ChargingQueueItem, PowerConsumptionData } from '../types';

/**
 * Calculate average battery level across all vehicles
 */
export const calculateAverageBatteryLevel = (vehicles: Vehicle[]): number => {
  if (vehicles.length === 0) return 0;
  
  const totalBattery = vehicles.reduce((sum, vehicle) => sum + vehicle.battery.currentLevel, 0);
  return Math.round(totalBattery / vehicles.length);
};

/**
 * Calculate battery health average across all vehicles
 */
export const calculateAverageBatteryHealth = (vehicles: Vehicle[]): number => {
  if (vehicles.length === 0) return 0;
  
  const totalHealth = vehicles.reduce((sum, vehicle) => sum + vehicle.battery.health, 0);
  return Math.round(totalHealth / vehicles.length);
};

/**
 * Get vehicles that need charging (below 80% battery)
 */
export const getVehiclesNeedingCharge = (vehicles: Vehicle[]): Vehicle[] => {
  return vehicles
    .filter(v => v.battery.currentLevel < 80 && v.status !== 'charging')
    .sort((a, b) => a.battery.currentLevel - b.battery.currentLevel);
};

/**
 * Get vehicles with low battery (below 20%)
 */
export const getLowBatteryVehicles = (vehicles: Vehicle[]): Vehicle[] => {
  return vehicles.filter(v => v.battery.currentLevel < 20);
};

/**
 * Get vehicles currently charging
 */
export const getChargingVehicles = (vehicles: Vehicle[]): Vehicle[] => {
  return vehicles.filter(v => v.status === 'charging');
};

/**
 * Calculate estimated charging time for a vehicle
 * @param currentLevel Current battery percentage
 * @param targetLevel Target battery percentage (default 80%)
 * @param chargingRate Charging rate in %/hour (default 40%/hour)
 */
export const calculateChargingTime = (
  currentLevel: number, 
  targetLevel: number = 80, 
  chargingRate: number = 40
): number => {
  if (currentLevel >= targetLevel) return 0;
  
  const percentageToCharge = targetLevel - currentLevel;
  return Math.round((percentageToCharge / chargingRate) * 60); // Return in minutes
};

/**
 * Calculate estimated wait time in charging queue
 * @param position Position in queue (0-based)
 * @param averageChargingTime Average time per vehicle in minutes
 */
export const calculateWaitTime = (position: number, averageChargingTime: number = 45): number => {
  return position * averageChargingTime;
};

/**
 * Generate charging queue with priorities
 */
export const generateChargingQueue = (vehicles: Vehicle[], maxQueueSize: number = 10): ChargingQueueItem[] => {
  const vehiclesNeedingCharge = getVehiclesNeedingCharge(vehicles);
  
  return vehiclesNeedingCharge
    .slice(0, maxQueueSize)
    .map((vehicle, index) => {
      const priority = vehicle.battery.currentLevel < 20 ? 'high' 
        : vehicle.battery.currentLevel < 60 ? 'medium' 
        : 'low';
      
      const estimatedChargeTime = calculateChargingTime(vehicle.battery.currentLevel);
      const estimatedWaitTime = calculateWaitTime(index);
      
      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        currentBattery: vehicle.battery.currentLevel,
        priority: priority as 'high' | 'medium' | 'low',
        estimatedWaitTime,
        estimatedChargeTime,
      };
    })
    .sort((a, b) => {
      // Sort by priority first, then by battery level
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      return a.currentBattery - b.currentBattery;
    });
};

/**
 * Calculate next scheduled charge time
 */
export const calculateNextChargeTime = (vehicles: Vehicle[]): { time: Date; vehicleId: string } | null => {
  const vehiclesNeedingCharge = getVehiclesNeedingCharge(vehicles);
  
  if (vehiclesNeedingCharge.length === 0) return null;
  
  const nextVehicle = vehiclesNeedingCharge[0];
  const urgencyFactor = Math.max(1, (100 - nextVehicle.battery.currentLevel) / 20);
  const estimatedTime = new Date(Date.now() + (urgencyFactor * 30 * 60 * 1000)); // 30 minutes base time
  
  return {
    time: estimatedTime,
    vehicleId: nextVehicle.id,
  };
};

/**
 * Generate mock 24-hour power consumption data
 */
export const generatePowerConsumptionData = (vehicles: Vehicle[]): PowerConsumptionData[] => {
  const now = new Date();
  const data: PowerConsumptionData[] = [];
  const baseConsumption = vehicles.length * 5; // 5 kWh per vehicle base
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Simulate higher consumption during peak hours (6-9 AM, 5-8 PM)
    const hourOfDay = hour.getHours();
    const isPeakHour = (hourOfDay >= 6 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 20);
    const peakMultiplier = isPeakHour ? 1.5 : 1;
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    const consumption = Math.round(baseConsumption * peakMultiplier * randomFactor);
    const efficiency = Math.round(85 + Math.random() * 10); // 85-95% efficiency
    
    data.push({
      hour: hourOfDay,
      consumption,
      efficiency,
      timestamp: hour,
    });
  }
  
  return data;
};

/**
 * Calculate total fleet battery capacity
 */
export const calculateTotalCapacity = (vehicles: Vehicle[], capacityPerVehicle: number = 100): number => {
  return vehicles.length * capacityPerVehicle;
};

/**
 * Calculate battery statistics for dashboard
 */
export const calculateBatteryStats = (vehicles: Vehicle[]): BatteryData => {
  const averageLevel = calculateAverageBatteryLevel(vehicles);
  const totalCapacity = calculateTotalCapacity(vehicles);
  const chargingVehicles = getChargingVehicles(vehicles).length;
  const lowBatteryCount = getLowBatteryVehicles(vehicles).length;
  
  const nextCharge = calculateNextChargeTime(vehicles);
  
  return {
    averageLevel,
    totalCapacity,
    chargingVehicles,
    lowBatteryCount,
    nextChargeTime: nextCharge?.time,
    nextChargeVehicle: nextCharge?.vehicleId,
  };
};

/**
 * Format time remaining until next charge
 */
export const formatTimeRemaining = (targetTime: Date): string => {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Charging now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

/**
 * Optimize charging queue based on priority and efficiency
 */
export const optimizeChargingQueue = (queue: ChargingQueueItem[]): ChargingQueueItem[] => {
  return [...queue].sort((a, b) => {
    // Priority weights
    const priorityWeights = { high: 100, medium: 50, low: 10 };
    
    // Combined score
    const scoreA = priorityWeights[a.priority] + (100 - a.currentBattery);
    const scoreB = priorityWeights[b.priority] + (100 - b.currentBattery);
    
    return scoreB - scoreA;
  });
};