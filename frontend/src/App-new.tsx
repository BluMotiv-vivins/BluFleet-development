import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  LazyDashboard as Dashboard,
  LazyFleetTracking as FleetTracking,
  LazyEnergyCharging as EnergyCharging,
  LazyMaintenance as Maintenance,
  LazySafetyCompliance as SafetyCompliance,
  LazyAnalyticsReports as AnalyticsReports,
  LazyFleetPredictions as FleetPredictions,
  LazySimulationResults as SimulationResults,
  LazyGeoOperations as GeoOperations,
  LazyIntegrations as Integrations,
  LazyUserManagement as UserManagement,
  PageLoadingFallback
} from './utils/lazyImports';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import WebSocketProvider from './components/providers/WebSocketProvider';
import { ErrorBoundary } from './components/error';
import OfflineIndicator from './components/ui/OfflineIndicator';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

import { createMockNotifications } from './utils/notificationUtils';
import './services/mockWebSocketServer'; // Initialize mock server in development
import './App.css';

// LoginPage wrapper component with auth context
function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Login 
      onLogin={handleLogin}
      isAuthenticated={isAuthenticated}
    />
  );
}

function AuthenticatedApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Mock notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(createMockNotifications());
  
  // Online/offline status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = (query: string) => {
    // TODO: Implement proper search functionality
    if (query.trim()) {
      // Perform search across vehicles, drivers, trips, etc.
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoadingFallback message="Loading BluFleet..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } 
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute user={user}>
            <AppLayout 
              user={user!} 
              notifications={notifications}
              onSearch={handleSearch}
              onNotificationClick={handleNotificationClick}
              onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
              onClearAllNotifications={handleClearAllNotifications}
            >
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Dashboard..." />}>
                      <Dashboard />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/fleet-tracking" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Fleet Tracking..." />}>
                      <FleetTracking />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/energy-charging" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Energy & Charging..." />}>
                      <EnergyCharging />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/maintenance" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Maintenance..." />}>
                      <Maintenance />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/safety-compliance" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Safety & Compliance..." />}>
                      <SafetyCompliance />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/analytics-reports" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Analytics & Reports..." />}>
                      <AnalyticsReports />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/fleet-predictions" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Fleet Predictions..." />}>
                      <FleetPredictions />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/simulation-results" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Simulation Results..." />}>
                      <SimulationResults />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/geo-operations" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Geo Operations..." />}>
                      <GeoOperations />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route path="/integrations" element={
                  <ErrorBoundary level="page">
                    <React.Suspense fallback={<PageLoadingFallback message="Loading Integrations..." />}>
                      <Integrations />
                    </React.Suspense>
                  </ErrorBoundary>
                } />
                <Route 
                  path="/user-management" 
                  element={
                    <ProtectedRoute user={user} requiredPermissions={['admin:read']}>
                      <ErrorBoundary level="page">
                        <React.Suspense fallback={<PageLoadingFallback message="Loading User Management..." />}>
                          <UserManagement />
                        </React.Suspense>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <WebSocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <AuthenticatedApp />
          </WebSocketProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
