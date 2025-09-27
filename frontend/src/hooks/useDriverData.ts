import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Driver, Alert } from '../types';
import { 
  calculateSafetyScore, 
  calculateEcoScore, 
  calculateDriverRanking,
  type HarshDrivingEvent,
  type DriverMetrics
} from '../utils/driverCalculations';

export interface UseDriverDataReturn {
  drivers: Driver[];
  topEcoDrivers: Driver[];
  topSafetyDrivers: Driver[];
  driverRankings: Driver[];
  driverAlerts: Alert[];
  getDriverMetrics: (driverId: string) => DriverMetrics;
  getDriverAlerts: (driverId: string) => Alert[];
  getHarshDrivingEvents: (driverId: string) => HarshDrivingEvent[];
  refreshDriverScores: () => void;
}

/**
 * Custom hook for managing driver performance data and calculations
 */
export const useDriverData = (): UseDriverDataReturn => {
  const { drivers, vehicles } = useSelector((state: RootState) => state.fleet);
  const { alerts } = useSelector((state: RootState) => state.alerts);

  // Filter driver-related alerts
  const driverAlerts = useMemo(() => {
    return alerts.filter(alert => alert.driverId && alert.type === 'safety');
  }, [alerts]);

  // Calculate top performing drivers
  const topEcoDrivers = useMemo(() => {
    return [...drivers]
      .sort((a, b) => b.ecoScore - a.ecoScore)
      .slice(0, 5);
  }, [drivers]);

  const topSafetyDrivers = useMemo(() => {
    return [...drivers]
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 5);
  }, [drivers]);

  // Calculate overall driver rankings
  const driverRankings = useMemo(() => {
    return calculateDriverRanking(drivers);
  }, [drivers]);

  // Mock harsh driving events data (in real app, this would come from telemetry)
  const mockHarshEvents: HarshDrivingEvent[] = useMemo(() => {
    const events: HarshDrivingEvent[] = [];
    const now = new Date();
    
    drivers.forEach(driver => {
      // Generate some mock harsh driving events for demonstration
      const eventCount = Math.floor(Math.random() * 3); // 0-2 events per driver
      
      for (let i = 0; i < eventCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7); // Within last 7 days
        const eventDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        const eventTypes: HarshDrivingEvent['type'][] = [
          'harsh_braking', 'harsh_acceleration', 'harsh_cornering', 'speeding'
        ];
        const severities: HarshDrivingEvent['severity'][] = ['low', 'medium', 'high'];
        
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        
        // Find a vehicle for this driver
        const driverVehicle = vehicles.find(v => v.driver?.id === driver.id);
        
        events.push({
          id: `harsh-${driver.id}-${i}-${eventDate.getTime()}`,
          driverId: driver.id,
          vehicleId: driverVehicle?.id || 'unknown',
          type: eventType,
          severity,
          timestamp: eventDate,
          location: {
            lat: 47.6062 + (Math.random() - 0.5) * 0.1,
            lng: -122.3321 + (Math.random() - 0.5) * 0.1,
            address: 'Fleet Route'
          },
          gForce: eventType.includes('braking') || eventType.includes('acceleration') || eventType.includes('cornering') 
            ? 0.3 + Math.random() * 0.4 : undefined,
          speed: eventType === 'speeding' ? 60 + Math.random() * 20 : undefined,
        });
      }
    });
    
    return events;
  }, [drivers, vehicles]);

  // Get driver metrics
  const getDriverMetrics = (driverId: string): DriverMetrics => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      return {
        safetyScore: 0,
        ecoScore: 0,
        harshDrivingEvents: 0,
        alertCount: 0,
        milesPerAlert: 0,
        efficiencyRating: 0,
      };
    }

    const driverSpecificAlerts = driverAlerts.filter(a => a.driverId === driverId);
    const driverHarshEvents = mockHarshEvents.filter(e => e.driverId === driverId);
    
    const recentAlerts = driverSpecificAlerts.filter(
      alert => new Date(alert.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const recentHarshEvents = driverHarshEvents.filter(
      event => new Date(event.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    return {
      safetyScore: calculateSafetyScore(driver, driverSpecificAlerts, driverHarshEvents),
      ecoScore: calculateEcoScore(driver, vehicles),
      harshDrivingEvents: recentHarshEvents.length,
      alertCount: recentAlerts.length,
      milesPerAlert: recentAlerts.length > 0 ? driver.totalMiles / recentAlerts.length : driver.totalMiles,
      efficiencyRating: driver.ecoScore,
    };
  };

  // Get alerts for specific driver
  const getDriverAlerts = (driverId: string): Alert[] => {
    return driverAlerts.filter(alert => alert.driverId === driverId);
  };

  // Get harsh driving events for specific driver
  const getHarshDrivingEvents = (driverId: string): HarshDrivingEvent[] => {
    return mockHarshEvents.filter(event => event.driverId === driverId);
  };

  // Refresh driver scores (in real app, this would trigger API calls)
  const refreshDriverScores = () => {
    // This would typically dispatch actions to recalculate scores
    console.log('Refreshing driver scores...');
  };

  return {
    drivers,
    topEcoDrivers,
    topSafetyDrivers,
    driverRankings,
    driverAlerts,
    getDriverMetrics,
    getDriverAlerts,
    getHarshDrivingEvents,
    refreshDriverScores,
  };
};