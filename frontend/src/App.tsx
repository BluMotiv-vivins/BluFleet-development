import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { 
  LazyDashboard as Dashboard,
  LazyFleetTracking as FleetTracking,
  LazyEnergyCharging as EnergyCharging,
  LazyMaintenance as Maintenance,
  LazySafetyCompliance as SafetyCompliance,
  LazyAnalyticsReports as AnalyticsReports,
  LazyBatteryAnalytics as BatteryAnalytics,
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
import type { User } from '../../shared/types';
import { getAuthToken, setAuthToken, clearAuthData, getAuthHeaders } from './utils/auth';
import { createMockNotifications } from './utils/notificationUtils';
import './services/mockWebSocketServer'; // Initialize mock server in development
import './App.css';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>(createMockNotifications());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // Validate token with backend using correct endpoint
          const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: getAuthHeaders()
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data?.user) {
              // Map the backend user data to our User type
              const mappedUser: User = {
                id: userData.data.user.id,
                organizationId: userData.data.user.organizationId || '550e8400-e29b-41d4-a716-446655440000',
                email: userData.data.user.email,
                firstName: userData.data.user.firstName,
                lastName: userData.data.user.lastName,
                role: userData.data.user.role,
                permissions: userData.data.user.permissions || ['*'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUser(mappedUser);
            }
          } else {
            clearAuthData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

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

  const handleLogin = async (email: string, password: string) => {
    try {
      // Use correct API endpoint
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      setAuthToken(data.data.token);
      
      // Map user data to our User type
      const userObj: User = {
        id: data.data.user.id,
        organizationId: data.data.user.organizationId || '550e8400-e29b-41d4-a716-446655440000',
        email: data.data.user.email,
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
        role: data.data.user.role,
        permissions: data.data.user.permissions || ['*'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(userObj);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
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
    <ErrorBoundary>
      <Provider store={store}>
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
          
          {/* Offline Indicator */}
          {isOffline && (
            <div className="fixed top-0 left-0 right-0 z-50">
              <OfflineIndicator isOffline={isOffline} />
            </div>
          )}
          
          <Router>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/" replace /> : (
                    <Login 
                      onLogin={handleLogin}
                      isAuthenticated={!!user}
                    />
                  )
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
                      <Route path="/battery-analytics" element={
                        <ErrorBoundary level="page">
                          <React.Suspense fallback={<PageLoadingFallback message="Loading Battery Analytics..." />}>
                            <BatteryAnalytics />
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
        </WebSocketProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
