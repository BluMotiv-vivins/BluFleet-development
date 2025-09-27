import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Driver, Alert } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CircularGauge from '../ui/CircularGauge';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface DriverPerformanceProps {
  className?: string;
}

interface DriverAnalytics {
  driverId: string;
  weeklyTrends: {
    safetyScore: number[];
    ecoScore: number[];
    milesdriven: number[];
  };
  monthlyStats: {
    totalMiles: number;
    avgSafetyScore: number;
    avgEcoScore: number;
    alertCount: number;
    harshEvents: number;
  };
}

export const DriverPerformance: React.FC<DriverPerformanceProps> = ({ className = '' }) => {
  const { drivers } = useSelector((state: RootState) => state.fleet);
  const { alerts } = useSelector((state: RootState) => state.alerts);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filter alerts for drivers and recent ones (last 7 days)
  const recentDriverAlerts = alerts.filter(alert => 
    alert.driverId && 
    alert.type === 'safety' &&
    new Date(alert.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  // Sort drivers by eco score for highlighting top performers
  const sortedDrivers = [...drivers].sort((a, b) => b.ecoScore - a.ecoScore);
  const topEcoDrivers = sortedDrivers.slice(0, 3);

  // Generate mock analytics data for selected driver
  const generateDriverAnalytics = (driver: Driver): DriverAnalytics => {
    return {
      driverId: driver.id,
      weeklyTrends: {
        safetyScore: [88, 90, 92, 89, 91, 93, driver.safetyScore],
        ecoScore: [85, 87, 89, 86, 88, 90, driver.ecoScore],
        milesdriven: [120, 135, 128, 142, 118, 155, 138],
      },
      monthlyStats: {
        totalMiles: driver.totalMiles,
        avgSafetyScore: driver.safetyScore,
        avgEcoScore: driver.ecoScore,
        alertCount: recentDriverAlerts.filter(a => a.driverId === driver.id).length,
        harshEvents: Math.floor(Math.random() * 5),
      },
    };
  };

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowAnalytics(true);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };



  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Driver Performance</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <TrophyIcon className="h-4 w-4" />
            <span>Top Eco Drivers</span>
          </div>
        </div>

        {/* Top Eco Drivers Highlight */}
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3 flex items-center">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Eco-Driving Champions
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {topEcoDrivers.map((driver, index) => (
              <div key={driver.id} className="text-center">
                <div className="relative">
                  {driver.avatar ? (
                    <img
                      src={driver.avatar}
                      alt={driver.name}
                      className="w-12 h-12 rounded-full mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <TrophyIcon className="h-3 w-3 text-yellow-800" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{driver.name}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{driver.ecoScore}% Eco</p>
              </div>
            ))}
          </div>
        </div>

        {/* Driver List */}
        <div className="space-y-4">
          {drivers.map((driver) => {
            const driverAlerts = recentDriverAlerts.filter(alert => alert.driverId === driver.id);
            const hasRecentAlerts = driverAlerts.length > 0;
            const isTopEco = topEcoDrivers.some(top => top.id === driver.id);

            return (
              <div
                key={driver.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isTopEco 
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleDriverClick(driver)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Driver Avatar */}
                    <div className="relative">
                      {driver.avatar ? (
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        driver.status === 'active' ? 'bg-green-500' : 
                        driver.status === 'break' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>

                    {/* Driver Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{driver.name}</h4>
                        {isTopEco && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded-full">
                            <SparklesIcon className="h-3 w-3 text-green-600 dark:text-green-300" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-300">Eco Champion</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{driver.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {driver.totalMiles.toLocaleString()} miles
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {driver.certifications.length} certifications
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scores and Alerts */}
                  <div className="flex items-center space-x-6">
                    {/* Safety Score */}
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <ShieldCheckIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Safety</span>
                      </div>
                      <p className={`text-lg font-semibold ${getScoreColor(driver.safetyScore)}`}>
                        {driver.safetyScore}%
                      </p>
                    </div>

                    {/* Eco Score */}
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <SparklesIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Eco</span>
                      </div>
                      <p className={`text-lg font-semibold ${getScoreColor(driver.ecoScore)}`}>
                        {driver.ecoScore}%
                      </p>
                    </div>

                    {/* Recent Alerts */}
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <ExclamationTriangleIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Alerts</span>
                      </div>
                      <p className={`text-lg font-semibold ${
                        hasRecentAlerts ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {driverAlerts.length}
                      </p>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDriverClick(driver);
                      }}
                    >
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>

                {/* Recent Alerts Display */}
                {hasRecentAlerts && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Safety Events:</h5>
                    <div className="space-y-1">
                      {driverAlerts.slice(0, 2).map((alert) => (
                        <div key={alert.id} className="flex items-center space-x-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <span className="text-gray-600 dark:text-gray-300">{alert.title}</span>
                          <span className="text-gray-400 dark:text-gray-500">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {driverAlerts.length > 2 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          +{driverAlerts.length - 2} more alerts
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Driver Analytics Modal */}
        {selectedDriver && (
          <Modal
            isOpen={showAnalytics}
            onClose={() => {
              setShowAnalytics(false);
              setSelectedDriver(null);
            }}
            title={`${selectedDriver.name} - Performance Analytics`}
            size="lg"
          >
            <DriverAnalyticsModal 
              driver={selectedDriver} 
              analytics={generateDriverAnalytics(selectedDriver)}
              alerts={recentDriverAlerts.filter(a => a.driverId === selectedDriver.id)}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

// Driver Analytics Modal Component
interface DriverAnalyticsModalProps {
  driver: Driver;
  analytics: DriverAnalytics;
  alerts: Alert[];
}

const DriverAnalyticsModal: React.FC<DriverAnalyticsModalProps> = ({ 
  driver, 
  analytics, 
  alerts 
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      {/* Driver Header */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        {driver.avatar ? (
          <img
            src={driver.avatar}
            alt={driver.name}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-600" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
          <p className="text-gray-600">{driver.email}</p>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-gray-500">
              Status: <span className="capitalize font-medium">{driver.status}</span>
            </span>
            <span className="text-sm text-gray-500">
              Total Miles: {driver.totalMiles.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Gauges */}
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Safety Score</h4>
          <CircularGauge
            value={driver.safetyScore}
            max={100}
            color={getScoreColor(driver.safetyScore)}
            size="lg"
            label={`${driver.safetyScore}%`}
          />
        </div>
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Eco Score</h4>
          <CircularGauge
            value={driver.ecoScore}
            max={100}
            color={getScoreColor(driver.ecoScore)}
            size="lg"
            label={`${driver.ecoScore}%`}
          />
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Monthly Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Total Miles:</span>
              <span className="text-sm font-medium text-blue-900">
                {analytics.monthlyStats.totalMiles.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Avg Safety:</span>
              <span className="text-sm font-medium text-blue-900">
                {analytics.monthlyStats.avgSafetyScore}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Avg Eco:</span>
              <span className="text-sm font-medium text-blue-900">
                {analytics.monthlyStats.avgEcoScore}%
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Safety Events</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Recent Alerts:</span>
              <span className="text-sm font-medium text-red-900">{analytics.monthlyStats.alertCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Harsh Events:</span>
              <span className="text-sm font-medium text-red-900">{analytics.monthlyStats.harshEvents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Safety Alerts</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{alert.message}</p>
                {alert.vehicleId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vehicle: {alert.vehicleId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Certifications</h4>
        <div className="flex flex-wrap gap-2">
          {driver.certifications.map((cert, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {cert}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};