import type { Driver, Alert, Vehicle } from '../types';

export interface DriverMetrics {
  safetyScore: number;
  ecoScore: number;
  harshDrivingEvents: number;
  alertCount: number;
  milesPerAlert: number;
  efficiencyRating: number;
}

export interface HarshDrivingEvent {
  id: string;
  driverId: string;
  vehicleId: string;
  type: 'harsh_braking' | 'harsh_acceleration' | 'harsh_cornering' | 'speeding';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  speed?: number;
  gForce?: number;
}

/**
 * Calculate driver safety score based on various factors
 */
export const calculateSafetyScore = (
  driver: Driver,
  alerts: Alert[],
  harshEvents: HarshDrivingEvent[] = [],
  timeRangeInDays: number = 30
): number => {
  const baseScore = 100;
  const cutoffDate = new Date(Date.now() - timeRangeInDays * 24 * 60 * 60 * 1000);
  
  // Filter recent alerts and events
  const recentAlerts = alerts.filter(
    alert => alert.driverId === driver.id && 
    alert.type === 'safety' && 
    new Date(alert.timestamp) > cutoffDate
  );
  
  const recentHarshEvents = harshEvents.filter(
    event => event.driverId === driver.id && 
    new Date(event.timestamp) > cutoffDate
  );

  // Deduct points for safety alerts
  let alertDeduction = 0;
  recentAlerts.forEach(alert => {
    switch (alert.severity) {
      case 'critical':
        alertDeduction += 15;
        break;
      case 'high':
        alertDeduction += 10;
        break;
      case 'medium':
        alertDeduction += 5;
        break;
      case 'low':
        alertDeduction += 2;
        break;
    }
  });

  // Deduct points for harsh driving events
  let harshEventDeduction = 0;
  recentHarshEvents.forEach(event => {
    switch (event.severity) {
      case 'high':
        harshEventDeduction += 8;
        break;
      case 'medium':
        harshEventDeduction += 5;
        break;
      case 'low':
        harshEventDeduction += 2;
        break;
    }
  });

  // Calculate miles-based adjustment (fewer incidents per mile = better score)
  const milesInPeriod = Math.min(driver.totalMiles, driver.totalMiles * (timeRangeInDays / 365));
  const incidentRate = (recentAlerts.length + recentHarshEvents.length) / Math.max(milesInPeriod / 1000, 1);
  const incidentRateDeduction = Math.min(incidentRate * 3, 20);

  const finalScore = Math.max(
    baseScore - alertDeduction - harshEventDeduction - incidentRateDeduction,
    0
  );

  return Math.round(finalScore);
};

/**
 * Calculate driver eco score based on efficiency metrics
 */
export const calculateEcoScore = (
  driver: Driver,
  vehicles: Vehicle[]
): number => {
  
  // Find vehicles driven by this driver
  const driverVehicles = vehicles.filter(v => v.driver?.id === driver.id);
  
  if (driverVehicles.length === 0) {
    return driver.ecoScore || 85; // Default score if no vehicle data
  }

  // Calculate average battery efficiency
  const avgBatteryHealth = driverVehicles.reduce((sum, v) => sum + v.battery.health, 0) / driverVehicles.length;
  const batteryHealthScore = (avgBatteryHealth / 100) * 30; // Max 30 points

  // Calculate range efficiency (mock calculation)
  const avgRange = driverVehicles.reduce((sum, v) => sum + v.battery.estimatedRange, 0) / driverVehicles.length;
  const expectedRange = 200; // Expected range for fleet vehicles
  const rangeEfficiencyScore = Math.min((avgRange / expectedRange) * 25, 25); // Max 25 points

  // Driving behavior score (based on harsh events)
  const smoothDrivingScore = 25; // Base score, reduced by harsh events

  // Energy consumption score (mock calculation)
  const energyEfficiencyScore = 20; // Base score

  const totalScore = batteryHealthScore + rangeEfficiencyScore + smoothDrivingScore + energyEfficiencyScore;
  
  return Math.round(Math.min(totalScore, 100));
};

/**
 * Detect harsh driving events from vehicle telemetry
 */
export const detectHarshDrivingEvents = (
  vehicleId: string,
  driverId: string,
  telemetryData: {
    timestamp: Date;
    speed: number;
    acceleration: number;
    braking: number;
    cornering: number;
    location: { lat: number; lng: number };
  }[]
): HarshDrivingEvent[] => {
  const events: HarshDrivingEvent[] = [];
  
  telemetryData.forEach((data) => {
    const eventId = `${vehicleId}-${driverId}-${data.timestamp.getTime()}`;
    
    // Harsh braking detection (deceleration > 0.4g)
    if (data.braking > 0.4) {
      events.push({
        id: `${eventId}-braking`,
        driverId,
        vehicleId,
        type: 'harsh_braking',
        severity: data.braking > 0.6 ? 'high' : data.braking > 0.5 ? 'medium' : 'low',
        timestamp: data.timestamp,
        location: data.location,
        gForce: data.braking,
      });
    }
    
    // Harsh acceleration detection (acceleration > 0.35g)
    if (data.acceleration > 0.35) {
      events.push({
        id: `${eventId}-acceleration`,
        driverId,
        vehicleId,
        type: 'harsh_acceleration',
        severity: data.acceleration > 0.5 ? 'high' : data.acceleration > 0.4 ? 'medium' : 'low',
        timestamp: data.timestamp,
        location: data.location,
        gForce: data.acceleration,
      });
    }
    
    // Harsh cornering detection (lateral g-force > 0.4g)
    if (data.cornering > 0.4) {
      events.push({
        id: `${eventId}-cornering`,
        driverId,
        vehicleId,
        type: 'harsh_cornering',
        severity: data.cornering > 0.6 ? 'high' : data.cornering > 0.5 ? 'medium' : 'low',
        timestamp: data.timestamp,
        location: data.location,
        gForce: data.cornering,
      });
    }
    
    // Speeding detection (speed > speed limit + threshold)
    const speedLimit = 55; // Mock speed limit
    const speedThreshold = 10; // mph over limit
    if (data.speed > speedLimit + speedThreshold) {
      events.push({
        id: `${eventId}-speeding`,
        driverId,
        vehicleId,
        type: 'speeding',
        severity: data.speed > speedLimit + 20 ? 'high' : data.speed > speedLimit + 15 ? 'medium' : 'low',
        timestamp: data.timestamp,
        location: data.location,
        speed: data.speed,
      });
    }
  });
  
  return events;
};

/**
 * Generate driver performance alerts based on metrics
 */
export const generateDriverPerformanceAlerts = (
  driver: Driver,
  metrics: DriverMetrics,
  harshEvents: HarshDrivingEvent[]
): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  
  // Low safety score alert
  if (metrics.safetyScore < 70) {
    alerts.push({
      id: `safety-score-${driver.id}-${now.getTime()}`,
      type: 'safety',
      severity: metrics.safetyScore < 50 ? 'critical' : 'high',
      title: 'Low Safety Score Alert',
      message: `Driver ${driver.name} has a safety score of ${metrics.safetyScore}%. Immediate attention required.`,
      driverId: driver.id,
      timestamp: now,
      acknowledged: false,
    });
  }
  
  // Low eco score alert
  if (metrics.ecoScore < 70) {
    alerts.push({
      id: `eco-score-${driver.id}-${now.getTime()}`,
      type: 'safety',
      severity: 'medium',
      title: 'Low Eco-Driving Score',
      message: `Driver ${driver.name} has an eco-driving score of ${metrics.ecoScore}%. Consider additional training.`,
      driverId: driver.id,
      timestamp: now,
      acknowledged: false,
    });
  }
  
  // High frequency harsh events alert
  const recentHarshEvents = harshEvents.filter(
    event => new Date(event.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  
  if (recentHarshEvents.length >= 5) {
    alerts.push({
      id: `harsh-events-${driver.id}-${now.getTime()}`,
      type: 'safety',
      severity: 'high',
      title: 'Multiple Harsh Driving Events',
      message: `Driver ${driver.name} has ${recentHarshEvents.length} harsh driving events in the last 24 hours.`,
      driverId: driver.id,
      timestamp: now,
      acknowledged: false,
    });
  }
  
  return alerts;
};

/**
 * Calculate driver ranking based on combined metrics
 */
export const calculateDriverRanking = (drivers: Driver[]): Driver[] => {
  return drivers
    .map(driver => ({
      ...driver,
      combinedScore: (driver.safetyScore * 0.6) + (driver.ecoScore * 0.4), // Weight safety more heavily
    }))
    .sort((a, b) => (b as any).combinedScore - (a as any).combinedScore);
};

/**
 * Get driver performance trends over time
 */
export const getDriverPerformanceTrends = (
  historicalData: {
    date: Date;
    safetyScore: number;
    ecoScore: number;
    alertCount: number;
    milesdriven: number;
  }[]
): {
  safetyTrend: 'improving' | 'declining' | 'stable';
  ecoTrend: 'improving' | 'declining' | 'stable';
  overallTrend: 'improving' | 'declining' | 'stable';
} => {
  if (historicalData.length < 2) {
    return { safetyTrend: 'stable', ecoTrend: 'stable', overallTrend: 'stable' };
  }
  
  const recent = historicalData.slice(-7); // Last 7 data points
  const older = historicalData.slice(-14, -7); // Previous 7 data points
  
  const recentAvgSafety = recent.reduce((sum, d) => sum + d.safetyScore, 0) / recent.length;
  const olderAvgSafety = older.reduce((sum, d) => sum + d.safetyScore, 0) / older.length;
  
  const recentAvgEco = recent.reduce((sum, d) => sum + d.ecoScore, 0) / recent.length;
  const olderAvgEco = older.reduce((sum, d) => sum + d.ecoScore, 0) / older.length;
  
  const safetyDiff = recentAvgSafety - olderAvgSafety;
  const ecoDiff = recentAvgEco - olderAvgEco;
  
  const getTrend = (diff: number) => {
    if (diff > 2) return 'improving';
    if (diff < -2) return 'declining';
    return 'stable';
  };
  
  const safetyTrend = getTrend(safetyDiff);
  const ecoTrend = getTrend(ecoDiff);
  const overallTrend = getTrend((safetyDiff + ecoDiff) / 2);
  
  return { safetyTrend, ecoTrend, overallTrend };
};