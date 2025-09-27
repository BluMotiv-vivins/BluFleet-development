import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import FleetTracking from './pages/FleetTracking';
import EnergyCharging from './pages/EnergyCharging';
import Maintenance from './pages/Maintenance';
import SafetyCompliance from './pages/SafetyCompliance';
import FleetPredictions from './pages/FleetPredictions';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
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

// App content component that has access to auth context
const AppContent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage />}
        />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/fleet-tracking" element={<FleetTracking />} />
                <Route path="/energy-consumption" element={<EnergyConsumption />} />
                <Route path="/maintenance-scheduling" element={<MaintenanceScheduling />} />
                <Route path="/safety-compliance" element={<SafetyCompliance />} />
                <Route path="/fleet-predictions" element={<FleetPredictions />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
