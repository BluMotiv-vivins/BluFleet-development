import React from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

/**
 * Demo component to showcase alert generation functionality
 * This would typically be integrated into the main dashboard or triggered by real events
 */
const AlertDemo: React.FC = () => {
  const { 
    createGeofenceViolationAlert,
    createSafetyAlert,
    createSystemUpdateAlert,
    generateAutomatedAlerts,
    getAlertStats
  } = useAlerts();
  
  const vehicles = useSelector((state: RootState) => state.fleet.vehicles);
  const stats = getAlertStats();

  const handleGenerateGeofenceAlert = () => {
    if (vehicles.length > 0) {
      createGeofenceViolationAlert(
        vehicles[0],
        'Downtown Restricted Zone',
        'exited',
        { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
      );
    }
  };

  const handleGenerateSafetyAlert = () => {
    if (vehicles.length > 0) {
      const mockDriver = {
        id: 'D-DEMO',
        name: 'Demo Driver',
        email: 'demo@example.com',
        safetyScore: 75,
        ecoScore: 80,
        totalMiles: 10000,
        recentAlerts: [],
        certifications: [],
        status: 'active' as const,
      };

      createSafetyAlert(
        vehicles[0],
        mockDriver,
        'harsh_braking'
      );
    }
  };

  const handleGenerateSystemAlert = () => {
    createSystemUpdateAlert(
      'feature',
      '2.1.0',
      'New dashboard features and improved alert system',
      false
    );
  };

  const handleGenerateAutomatedAlerts = () => {
    generateAutomatedAlerts();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Alert System Demo
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Alert Statistics</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Total Alerts: {stats.total}</div>
            <div>Unresolved: {stats.unresolved}</div>
            <div>Unacknowledged: {stats.unacknowledged}</div>
            <div className="mt-2">
              <div>Critical: {stats.bySeverity.critical}</div>
              <div>High: {stats.bySeverity.high}</div>
              <div>Medium: {stats.bySeverity.medium}</div>
              <div>Low: {stats.bySeverity.low}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Alert Types</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Battery: {stats.byType.battery}</div>
            <div>Maintenance: {stats.byType.maintenance}</div>
            <div>Safety: {stats.byType.safety}</div>
            <div>Geofence: {stats.byType.geofence}</div>
            <div>System: {stats.byType.system}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Generate Demo Alerts</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateGeofenceAlert}
            className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm hover:bg-orange-200 transition-colors"
            disabled={vehicles.length === 0}
          >
            Geofence Violation
          </button>
          
          <button
            onClick={handleGenerateSafetyAlert}
            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
            disabled={vehicles.length === 0}
          >
            Safety Event
          </button>
          
          <button
            onClick={handleGenerateSystemAlert}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
          >
            System Update
          </button>
          
          <button
            onClick={handleGenerateAutomatedAlerts}
            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
            disabled={vehicles.length === 0}
          >
            Auto-Generate Alerts
          </button>
        </div>
        
        {vehicles.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Vehicle data needed for some alert types
          </p>
        )}
      </div>
    </div>
  );
};

export default AlertDemo;