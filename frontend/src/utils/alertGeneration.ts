import type { Alert, Vehicle, Driver } from '../types';

export interface AlertGenerationConfig {
  lowBatteryThreshold: number;
  criticalBatteryThreshold: number;
  maintenanceDueDays: number;
  geofenceViolationTimeout: number;
}

export const defaultAlertConfig: AlertGenerationConfig = {
  lowBatteryThreshold: 25,
  criticalBatteryThreshold: 15,
  maintenanceDueDays: 7,
  geofenceViolationTimeout: 300000, // 5 minutes in milliseconds
};

/**
 * Generate a unique alert ID
 */
export const generateAlertId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `A-${timestamp}-${random}`;
};

/**
 * Generate low battery alerts for vehicles
 */
export const generateLowBatteryAlerts = (
  vehicles: Vehicle[],
  config: AlertGenerationConfig = defaultAlertConfig
): Alert[] => {
  const alerts: Alert[] = [];

  vehicles.forEach(vehicle => {
    const batteryLevel = vehicle.battery.currentLevel;
    
    if (batteryLevel <= config.criticalBatteryThreshold) {
      alerts.push({
        id: generateAlertId(),
        type: 'battery',
        severity: 'critical',
        title: 'Critical Battery Level',
        message: `Vehicle ${vehicle.name} battery level is critically low at ${batteryLevel}%. Immediate charging required.`,
        vehicleId: vehicle.id,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (batteryLevel <= config.lowBatteryThreshold) {
      alerts.push({
        id: generateAlertId(),
        type: 'battery',
        severity: 'medium',
        title: 'Low Battery Alert',
        message: `Vehicle ${vehicle.name} battery level is at ${batteryLevel}%. Consider scheduling charging soon.`,
        vehicleId: vehicle.id,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });

  return alerts;
};

/**
 * Generate maintenance due notifications
 */
export const generateMaintenanceAlerts = (
  vehicles: Vehicle[],
  config: AlertGenerationConfig = defaultAlertConfig
): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();

  vehicles.forEach(vehicle => {
    // Calculate days since last maintenance (mock calculation)
    const daysSinceLastMaintenance = Math.floor(
      (now.getTime() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Mock maintenance schedule - every 30 days
    const maintenanceInterval = 30;
    const daysSinceLastScheduled = daysSinceLastMaintenance % maintenanceInterval;
    const daysUntilNext = maintenanceInterval - daysSinceLastScheduled;

    if (daysUntilNext <= config.maintenanceDueDays && daysUntilNext > 0) {
      const severity = daysUntilNext <= 1 ? 'high' : daysUntilNext <= 3 ? 'medium' : 'low';
      
      alerts.push({
        id: generateAlertId(),
        type: 'maintenance',
        severity,
        title: 'Maintenance Due Soon',
        message: `Vehicle ${vehicle.name} is due for scheduled maintenance in ${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''}.`,
        vehicleId: vehicle.id,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (daysUntilNext <= 0) {
      alerts.push({
        id: generateAlertId(),
        type: 'maintenance',
        severity: 'high',
        title: 'Maintenance Overdue',
        message: `Vehicle ${vehicle.name} maintenance is overdue. Please schedule immediately.`,
        vehicleId: vehicle.id,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });

  return alerts;
};

/**
 * Generate geofence violation alerts
 */
export const generateGeofenceViolationAlert = (
  vehicle: Vehicle,
  geofenceName: string,
  violationType: 'entered' | 'exited',
  location?: { lat: number; lng: number; address?: string }
): Alert => {
  const severity = violationType === 'exited' ? 'high' : 'medium';
  const action = violationType === 'exited' ? 'exited' : 'entered';
  
  return {
    id: generateAlertId(),
    type: 'geofence',
    severity,
    title: 'Geofence Violation',
    message: `Vehicle ${vehicle.name} has ${action} ${geofenceName}${location?.address ? ` at ${location.address}` : ''}.`,
    vehicleId: vehicle.id,
    driverId: vehicle.driver?.id,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
};

/**
 * Generate safety alerts for harsh driving events
 */
export const generateSafetyAlert = (
  vehicle: Vehicle,
  driver: Driver,
  eventType: 'harsh_braking' | 'harsh_acceleration' | 'sharp_cornering' | 'speeding',
  details?: { speed?: number; speedLimit?: number; gForce?: number }
): Alert => {
  const eventMessages = {
    harsh_braking: 'performed harsh braking',
    harsh_acceleration: 'performed harsh acceleration',
    sharp_cornering: 'took a sharp corner at high speed',
    speeding: `exceeded speed limit${details?.speed && details?.speedLimit ? ` by ${details.speed - details.speedLimit} mph` : ''}`,
  };

  const severity = eventType === 'speeding' ? 'high' : 'medium';

  return {
    id: generateAlertId(),
    type: 'safety',
    severity,
    title: 'Harsh Driving Event',
    message: `Driver ${driver.name} ${eventMessages[eventType]} on vehicle ${vehicle.name}.`,
    vehicleId: vehicle.id,
    driverId: driver.id,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
};

/**
 * Generate system update notifications
 */
export const generateSystemUpdateAlert = (
  updateType: 'security' | 'feature' | 'maintenance',
  version: string,
  description: string,
  requiresAction: boolean = false
): Alert => {
  const severity = updateType === 'security' ? 'medium' : 'low';
  const title = requiresAction ? 'System Update Required' : 'System Update Available';

  return {
    id: generateAlertId(),
    type: 'system',
    severity,
    title,
    message: `${description} (Version ${version})${requiresAction ? ' - Action required.' : ''}`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
};

/**
 * Check and generate all automated alerts for a fleet
 */
export const generateAutomatedAlerts = (
  vehicles: Vehicle[],
  config: AlertGenerationConfig = defaultAlertConfig
): Alert[] => {
  const alerts: Alert[] = [];

  // Generate battery alerts
  alerts.push(...generateLowBatteryAlerts(vehicles, config));

  // Generate maintenance alerts
  alerts.push(...generateMaintenanceAlerts(vehicles, config));

  return alerts;
};

/**
 * Prioritize alerts based on severity and timestamp
 */
export const prioritizeAlerts = (alerts: Alert[]): Alert[] => {
  const severityPriority = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...alerts].sort((a, b) => {
    // First sort by severity
    const severityDiff = severityPriority[b.severity] - severityPriority[a.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};

/**
 * Filter alerts by acknowledgment status
 */
export const getUnacknowledgedAlerts = (alerts: Alert[]): Alert[] => {
  return alerts.filter(alert => !alert.acknowledged && !alert.resolvedAt);
};

/**
 * Get alert statistics
 */
export const getAlertStatistics = (alerts: Alert[]) => {
  const unresolved = alerts.filter(alert => !alert.resolvedAt);
  const unacknowledged = alerts.filter(alert => !alert.acknowledged && !alert.resolvedAt);
  
  const bySeverity = {
    critical: unresolved.filter(alert => alert.severity === 'critical').length,
    high: unresolved.filter(alert => alert.severity === 'high').length,
    medium: unresolved.filter(alert => alert.severity === 'medium').length,
    low: unresolved.filter(alert => alert.severity === 'low').length,
  };

  const byType = {
    battery: unresolved.filter(alert => alert.type === 'battery').length,
    maintenance: unresolved.filter(alert => alert.type === 'maintenance').length,
    safety: unresolved.filter(alert => alert.type === 'safety').length,
    geofence: unresolved.filter(alert => alert.type === 'geofence').length,
    system: unresolved.filter(alert => alert.type === 'system').length,
  };

  return {
    total: alerts.length,
    unresolved: unresolved.length,
    unacknowledged: unacknowledged.length,
    bySeverity,
    byType,
  };
};