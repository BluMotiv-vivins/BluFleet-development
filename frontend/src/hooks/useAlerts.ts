import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import type { RootState } from '../store';
import {
  addAlert,
  acknowledgeAlert,
  resolveAlert,
  generateAutomatedAlertsAction,
  addBulkAlerts,
} from '../store/slices/alertSlice';
import {
  generateGeofenceViolationAlert,
  generateSafetyAlert,
  generateSystemUpdateAlert,
  getAlertStatistics,
  getUnacknowledgedAlerts,
  prioritizeAlerts,
} from '../utils/alertGeneration';
import type { Alert, Vehicle, Driver } from '../types';

export const useAlerts = () => {
  const dispatch = useDispatch();
  const alertState = useSelector((state: RootState) => state.alerts);
  const vehicles = useSelector((state: RootState) => state.fleet.vehicles);

  // Generate automated alerts based on fleet data
  const generateAutomatedAlerts = useCallback(() => {
    if (vehicles.length > 0) {
      dispatch(generateAutomatedAlertsAction(vehicles));
    }
  }, [dispatch, vehicles]);

  // Auto-generate alerts every 5 minutes
  useEffect(() => {
    if (alertState.autoGenerationEnabled) {
      const interval = setInterval(generateAutomatedAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [generateAutomatedAlerts, alertState.autoGenerationEnabled]);

  // Manual alert creation functions
  const createGeofenceViolationAlert = useCallback((
    vehicle: Vehicle,
    geofenceName: string,
    violationType: 'entered' | 'exited',
    location?: { lat: number; lng: number; address?: string }
  ) => {
    const alert = generateGeofenceViolationAlert(vehicle, geofenceName, violationType, location);
    dispatch(addAlert(alert));
    return alert;
  }, [dispatch]);

  const createSafetyAlert = useCallback((
    vehicle: Vehicle,
    driver: Driver,
    eventType: 'harsh_braking' | 'harsh_acceleration' | 'sharp_cornering' | 'speeding',
    details?: { speed?: number; speedLimit?: number; gForce?: number }
  ) => {
    const alert = generateSafetyAlert(vehicle, driver, eventType, details);
    dispatch(addAlert(alert));
    return alert;
  }, [dispatch]);

  const createSystemUpdateAlert = useCallback((
    updateType: 'security' | 'feature' | 'maintenance',
    version: string,
    description: string,
    requiresAction: boolean = false
  ) => {
    const alert = generateSystemUpdateAlert(updateType, version, description, requiresAction);
    dispatch(addAlert(alert));
    return alert;
  }, [dispatch]);

  const createCustomAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const fullAlert: Alert = {
      ...alert,
      id: `A-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
    };
    dispatch(addAlert(fullAlert));
    return fullAlert;
  }, [dispatch]);

  // Alert management functions
  const acknowledgeAlertById = useCallback((alertId: string) => {
    dispatch(acknowledgeAlert(alertId));
  }, [dispatch]);

  const resolveAlertById = useCallback((alertId: string) => {
    dispatch(resolveAlert(alertId));
  }, [dispatch]);

  const addMultipleAlerts = useCallback((alerts: Alert[]) => {
    dispatch(addBulkAlerts(alerts));
  }, [dispatch]);

  // Alert filtering and statistics
  const getFilteredAlerts = useCallback((filters: {
    severity?: string[];
    type?: string[];
    acknowledged?: boolean;
    resolved?: boolean;
    vehicleId?: string;
    driverId?: string;
  }) => {
    return alertState.alerts.filter(alert => {
      if (filters.severity && !filters.severity.includes(alert.severity)) return false;
      if (filters.type && !filters.type.includes(alert.type)) return false;
      if (filters.acknowledged !== undefined && alert.acknowledged !== filters.acknowledged) return false;
      if (filters.resolved !== undefined && (!!alert.resolvedAt) !== filters.resolved) return false;
      if (filters.vehicleId && alert.vehicleId !== filters.vehicleId) return false;
      if (filters.driverId && alert.driverId !== filters.driverId) return false;
      return true;
    });
  }, [alertState.alerts]);

  const getPrioritizedAlerts = useCallback((limit?: number) => {
    const prioritized = prioritizeAlerts(alertState.alerts);
    return limit ? prioritized.slice(0, limit) : prioritized;
  }, [alertState.alerts]);

  const getUnacknowledgedAlertsCount = useCallback(() => {
    return getUnacknowledgedAlerts(alertState.alerts).length;
  }, [alertState.alerts]);

  const getAlertStats = useCallback(() => {
    return getAlertStatistics(alertState.alerts);
  }, [alertState.alerts]);

  // Get alerts for specific entities
  const getVehicleAlerts = useCallback((vehicleId: string) => {
    return alertState.alerts.filter(alert => alert.vehicleId === vehicleId);
  }, [alertState.alerts]);

  const getDriverAlerts = useCallback((driverId: string) => {
    return alertState.alerts.filter(alert => alert.driverId === driverId);
  }, [alertState.alerts]);

  // Get recent alerts (last 24 hours)
  const getRecentAlerts = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return alertState.alerts.filter(alert => new Date(alert.timestamp) > cutoff);
  }, [alertState.alerts]);

  return {
    // State
    alerts: alertState.alerts,
    unreadCount: alertState.unreadCount,
    loading: alertState.loading,
    autoGenerationEnabled: alertState.autoGenerationEnabled,
    lastAutoGeneration: alertState.lastAutoGeneration,

    // Alert creation
    createGeofenceViolationAlert,
    createSafetyAlert,
    createSystemUpdateAlert,
    createCustomAlert,
    addMultipleAlerts,
    generateAutomatedAlerts,

    // Alert management
    acknowledgeAlert: acknowledgeAlertById,
    resolveAlert: resolveAlertById,

    // Alert filtering and querying
    getFilteredAlerts,
    getPrioritizedAlerts,
    getUnacknowledgedAlertsCount,
    getAlertStats,
    getVehicleAlerts,
    getDriverAlerts,
    getRecentAlerts,
  };
};