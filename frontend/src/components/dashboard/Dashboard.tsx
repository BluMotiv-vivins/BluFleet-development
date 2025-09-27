import React, { useState } from 'react';
import KPICards from './KPICards';
import VehicleTable from './VehicleTable';
import { BatteryPanel } from './BatteryPanel';
import { DriverPerformance } from './DriverPerformance';
import AlertPanel from './AlertPanel';
// import { DataFreshnessPanel } from '../ui/DataFreshnessIndicator';
import LoadingSpinner from '../ui/LoadingSpinner';

interface DashboardProps {
  loading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ loading = false }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" aria-label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="content-container space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Welcome Section with Samsung-style typography */}
      <div className="dashboard-section">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold 
                       text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4 
                       transition-all duration-300">
          Fleet Dashboard
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 
                      transition-colors duration-300">
          Monitor your electric vehicle fleet in real-time
        </p>
      </div>

      {/* KPI Cards - Samsung-style responsive grid */}
      <section 
        aria-labelledby="kpi-section-title"
        className="dashboard-section animate-fade-in transition-all duration-300"
      >
        <h2 id="kpi-section-title" className="sr-only">
          Key Performance Indicators
        </h2>
        <div className="layout-fix">
          <KPICards />
        </div>
      </section>

      {/* Battery & Charging Management with Samsung-style spacing */}
      <section 
        aria-labelledby="battery-section-title"
        className="dashboard-section animate-fade-in transition-all duration-300"
      >
        <h2 id="battery-section-title" className="sr-only">
          Battery and Charging Management
        </h2>
        <div className="layout-fix">
          <BatteryPanel />
        </div>
      </section>

      {/* Fleet Map Section - Samsung-style responsive layout */}
      <section 
        aria-labelledby="map-section-title"
        className="dashboard-section animate-fade-in transition-all duration-300"
      >
        <div className="dashboard-card layout-fix">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <h2 
              id="map-section-title"
              className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold 
                         text-gray-900 dark:text-white transition-all duration-300"
            >
              Real-Time Fleet Map
            </h2>
            
            {/* Samsung-style mobile expand/collapse button */}
            <button
              onClick={() => toggleSection('map')}
              className="sm:hidden p-2 text-gray-400 hover:text-gray-600 
                         dark:text-gray-500 dark:hover:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-primary-500 
                         rounded-lg transition-all duration-200 hover:bg-gray-100 
                         dark:hover:bg-gray-800"
              aria-expanded={expandedSection === 'map'}
              aria-controls="map-content"
              aria-label="Toggle map section"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                  expandedSection === 'map' ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div 
            id="map-content"
            className={`bg-gray-100 dark:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out ${
              expandedSection === 'map' || expandedSection === null 
                ? 'h-48 sm:h-64 lg:h-80 xl:h-96 2xl:h-[28rem]' 
                : 'h-0 overflow-hidden sm:h-80 xl:h-96 2xl:h-[28rem]'
            } flex items-center justify-center`}
          >
            <div className="text-center text-gray-500 dark:text-gray-400 p-4 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-medium">
                Interactive map will be implemented in Task 7
              </p>
              <p className="text-xs sm:text-sm lg:text-base mt-1 sm:mt-2 text-gray-400 dark:text-gray-500">
                Mapbox GL JS integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Status Table - Responsive */}
      <section 
        aria-labelledby="vehicle-table-title"
        className="dashboard-section animate-fade-in"
      >
        <h2 id="vehicle-table-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Vehicle Status Table
        </h2>
        <div className="layout-fix">
          <VehicleTable />
        </div>
      </section>

      {/* Horizontal Sections - No Overlapping */}
      
      {/* Driver Performance Section */}
      <section 
        aria-labelledby="driver-performance-title"
        className="dashboard-section animate-fade-in"
      >
        <h2 id="driver-performance-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Driver Performance
        </h2>
        <div className="layout-fix">
          <DriverPerformance className="w-full" />
        </div>
      </section>

      {/* Alerts & Notifications Section */}
      <section 
        aria-labelledby="alerts-notifications-title"
        className="dashboard-section animate-fade-in"
      >
        <h2 id="alerts-notifications-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Alerts & Notifications
        </h2>
        <div className="layout-fix">
          <AlertPanel maxDisplayed={8} className="w-full" />
        </div>
      </section>

      {/* System Status Section */}
      <section 
        aria-labelledby="system-status-title"
        className="dashboard-section animate-fade-in"
      >
        <h2 id="system-status-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h2>
        <div className="layout-fix">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Real-time Data Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Real-time Data</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">Data Stream</span>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">WebSocket</span>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">Connected</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Last Update</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Just now</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Data Sync Rate:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time:</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">120ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Active Connections:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">24</span>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">CPU Usage:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Memory Usage:</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">62%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Disk Usage:</span>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live region for dynamic updates */}
      <div
        id="dashboard-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="false"
      />
    </div>
  );
};

export default Dashboard;