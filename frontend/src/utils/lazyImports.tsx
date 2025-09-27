import React, { Suspense } from 'react';
import type { ComponentType } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<ComponentType<P>>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withLazyLoading(Component)`;
  return WrappedComponent;
};

// Custom loading component for page-level lazy loading
export const PageLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Custom loading component for component-level lazy loading
export const ComponentLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <LoadingSpinner />
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

// Lazy load pages with error handling
export const LazyDashboard = React.lazy(() => 
  import('../components/dashboard/Dashboard')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Dashboard:', error);
      return { default: () => <div>Failed to load Dashboard</div> };
    })
);

export const LazyFleetTracking = React.lazy(() => 
  import('../pages/FleetTracking')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load FleetTracking:', error);
      return { default: () => <div>Failed to load Fleet Tracking</div> };
    })
);

export const LazyEnergyCharging = React.lazy(() => 
  import('../pages/EnergyCharging')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load EnergyCharging:', error);
      return { default: () => <div>Failed to load Energy & Charging</div> };
    })
);

export const LazyMaintenance = React.lazy(() => 
  import('../pages/Maintenance')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Maintenance:', error);
      return { default: () => <div>Failed to load Maintenance</div> };
    })
);

export const LazySafetyCompliance = React.lazy(() => 
  import('../pages/SafetyCompliance')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load SafetyCompliance:', error);
      return { default: () => <div>Failed to load Safety & Compliance</div> };
    })
);

export const LazyAnalyticsReports = React.lazy(() => 
  import('../pages/AnalyticsReports')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load AnalyticsReports:', error);
      return { default: () => <div>Failed to load Analytics & Reports</div> };
    })
);

export const LazyBatteryAnalytics = React.lazy(() => 
  import('../pages/BatteryAnalytics')
    .catch(error => {
      console.error('Failed to load BatteryAnalytics:', error);
      return { default: () => <div>Failed to load Battery Analytics</div> };
    })
);

export const LazySimulationResults = React.lazy(() => 
  import('../pages/SimulationResults')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load SimulationResults:', error);
      return { default: () => <div>Failed to load Simulation Results</div> };
    })
);

export const LazyGeoOperations = React.lazy(() => 
  import('../pages/GeoOperations')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load GeoOperations:', error);
      return { default: () => <div>Failed to load Geo Operations</div> };
    })
);

export const LazyIntegrations = React.lazy(() => 
  import('../pages/Integrations')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load Integrations:', error);
      return { default: () => <div>Failed to load Integrations</div> };
    })
);

export const LazyUserManagement = React.lazy(() => 
  import('../pages/UserManagement')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load UserManagement:', error);
      return { default: () => <div>Failed to load User Management</div> };
    })
);

// Lazy load heavy components with error handling
export const LazyFleetMap = React.lazy(() => 
  import('../components/map/FleetMap')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load FleetMap:', error);
      return { default: () => <div>Failed to load Fleet Map</div> };
    })
);

// VirtualizedTable removed from lazy loading due to TypeScript complexity

export const LazyComplianceDashboard = React.lazy(() => 
  import('../components/compliance/ComplianceDashboard')
    .then(module => ({ default: module.ComplianceDashboard }))
    .catch(error => {
      console.error('Failed to load ComplianceDashboard:', error);
      return { default: () => <div>Failed to load Compliance Dashboard</div> };
    })
);

// Preload functions for better UX
export const preloadComponent = (componentImport: () => Promise<any>) => {
  const componentImportFunc = componentImport;
  componentImportFunc();
};

export const preloadPage = (pageName: string) => {
  switch (pageName) {
    case 'fleet-tracking':
      preloadComponent(() => import('../pages/FleetTracking'));
      break;
    case 'energy-charging':
      preloadComponent(() => import('../pages/EnergyCharging'));
      break;
    case 'maintenance':
      preloadComponent(() => import('../pages/Maintenance'));
      break;
    case 'safety-compliance':
      preloadComponent(() => import('../pages/SafetyCompliance'));
      break;
    case 'analytics-reports':
      preloadComponent(() => import('../pages/AnalyticsReports'));
      break;
    case 'battery-analytics':
      preloadComponent(() => import('../pages/BatteryAnalytics'));
      break;
    case 'simulation-results':
      preloadComponent(() => import('../pages/SimulationResults'));
      break;
    case 'geo-operations':
      preloadComponent(() => import('../pages/GeoOperations'));
      break;
    case 'integrations':
      preloadComponent(() => import('../pages/Integrations'));
      break;
    case 'user-management':
      preloadComponent(() => import('../pages/UserManagement'));
      break;
    default:
      console.warn(`Unknown page name for preloading: ${pageName}`);
  }
};

// Hook for preloading on hover
export const usePreloadOnHover = () => {
  return {
    onMouseEnter: (pageName: string) => () => preloadPage(pageName),
    onFocus: (pageName: string) => () => preloadPage(pageName)
  };
};