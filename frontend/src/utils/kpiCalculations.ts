import type { Vehicle, ChargingStation, KPIData } from '../types';

export interface KPICalculationResult extends KPIData {
  trends: {
    totalVehicles: 'up' | 'down' | 'neutral';
    batteryHealth: 'up' | 'down' | 'neutral';
    monthlySavings: 'up' | 'down' | 'neutral';
    co2Reduction: 'up' | 'down' | 'neutral';
  };
  details: {
    statusBreakdown: {
      active: number;
      charging: number;
      maintenance: number;
      offline: number;
    };
    batteryDetails: {
      lowBattery: number; // vehicles with <20% battery
      criticalBattery: number; // vehicles with <10% battery
      healthyBatteries: number; // vehicles with >80% health
    };
    costDetails: {
      fuelSavings: number;
      maintenanceSavings: number;
      totalOperationalSavings: number;
      previousMonthSavings: number;
    };
    sustainabilityDetails: {
      totalMilesDriven: number;
      equivalentGasolineVehicleCO2: number;
      co2ReductionPercentage: number;
      previousQuarterCO2: number;
    };
  };
}

/**
 * Calculate comprehensive KPI metrics from fleet data
 */
export const calculateKPIs = (
  vehicles: Vehicle[],
  _chargingStations: ChargingStation[],
  previousPeriodData?: Partial<KPIData>
): KPICalculationResult => {
  // Basic fleet status calculations
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const chargingVehicles = vehicles.filter(v => v.status === 'charging').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const offlineVehicles = vehicles.filter(v => v.status === 'offline').length;

  // Battery health calculations
  const batteryLevels = vehicles.map(v => v.battery.currentLevel);
  const batteryHealths = vehicles.map(v => v.battery.health);
  
  const averageBatteryLevel = batteryLevels.length > 0 
    ? batteryLevels.reduce((sum, level) => sum + level, 0) / batteryLevels.length 
    : 0;
  
  const averageBatteryHealth = batteryHealths.length > 0
    ? batteryHealths.reduce((sum, health) => sum + health, 0) / batteryHealths.length
    : 0;

  const lowBatteryVehicles = vehicles.filter(v => v.battery.currentLevel < 20).length;
  const criticalBatteryVehicles = vehicles.filter(v => v.battery.currentLevel < 10).length;
  const healthyBatteries = vehicles.filter(v => v.battery.health > 80).length;

  // Cost savings calculations (mock realistic calculations)
  const avgMilesPerVehiclePerMonth = 1200;
  const avgFuelCostPerMileICE = 12; // ₹12 per mile for ICE vehicles
  const avgElectricityCostPerMileEV = 3; // ₹3 per mile for EVs
  const avgMaintenanceSavingsPerVehiclePerMonth = 12500; // EVs have lower maintenance costs

  const fuelSavings = totalVehicles * avgMilesPerVehiclePerMonth * (avgFuelCostPerMileICE - avgElectricityCostPerMileEV);
  const maintenanceSavings = totalVehicles * avgMaintenanceSavingsPerVehiclePerMonth;
  const monthlySavings = fuelSavings + maintenanceSavings;

  // Sustainability calculations
  const totalMilesDriven = totalVehicles * avgMilesPerVehiclePerMonth * 3; // quarterly
  const co2PerMileICE = 0.89; // pounds of CO2 per mile for average ICE vehicle
  const co2PerMileEV = 0.25; // pounds of CO2 per mile for EVs (including electricity generation)
  const co2ReductionPounds = totalMilesDriven * (co2PerMileICE - co2PerMileEV);
  const co2Reduction = co2ReductionPounds / 2000; // convert to tons
  const co2ReductionPercentage = ((co2PerMileICE - co2PerMileEV) / co2PerMileICE) * 100;

  // Calculate trends based on previous period data
  const trends = {
    totalVehicles: calculateTrend(totalVehicles, previousPeriodData?.totalVehicles),
    batteryHealth: calculateTrend(averageBatteryHealth, previousPeriodData?.averageBatteryHealth),
    monthlySavings: calculateTrend(monthlySavings, previousPeriodData?.monthlySavings),
    co2Reduction: calculateTrend(co2Reduction, previousPeriodData?.co2Reduction),
  };

  return {
    totalVehicles,
    activeVehicles,
    chargingVehicles,
    maintenanceVehicles,
    averageBatteryLevel: Math.round(averageBatteryLevel * 10) / 10,
    averageBatteryHealth: Math.round(averageBatteryHealth),
    monthlySavings: Math.round(monthlySavings),
    co2Reduction: Math.round(co2Reduction * 10) / 10,
    trends,
    details: {
      statusBreakdown: {
        active: activeVehicles,
        charging: chargingVehicles,
        maintenance: maintenanceVehicles,
        offline: offlineVehicles,
      },
      batteryDetails: {
        lowBattery: lowBatteryVehicles,
        criticalBattery: criticalBatteryVehicles,
        healthyBatteries,
      },
      costDetails: {
        fuelSavings: Math.round(fuelSavings),
        maintenanceSavings: Math.round(maintenanceSavings),
        totalOperationalSavings: Math.round(monthlySavings),
        previousMonthSavings: previousPeriodData?.monthlySavings || 0,
      },
      sustainabilityDetails: {
        totalMilesDriven,
        equivalentGasolineVehicleCO2: Math.round((totalMilesDriven * co2PerMileICE) / 2000 * 10) / 10,
        co2ReductionPercentage: Math.round(co2ReductionPercentage),
        previousQuarterCO2: previousPeriodData?.co2Reduction || 0,
      },
    },
  };
};

/**
 * Calculate trend direction based on current and previous values
 */
const calculateTrend = (current: number, previous?: number): 'up' | 'down' | 'neutral' => {
  if (!previous || previous === 0) return 'neutral';
  
  const percentChange = ((current - previous) / previous) * 100;
  
  if (percentChange > 2) return 'up';
  if (percentChange < -2) return 'down';
  return 'neutral';
};

/**
 * Format currency values for display
 */
export const formatCurrency = (value: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format percentage values for display
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with appropriate suffixes
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};