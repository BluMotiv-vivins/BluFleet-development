# BluFleet Local Startup Guide - Step by Step

## 🚀 **Complete Local Setup & Error Fixing Guide**

This guide will walk you through starting the BluFleet project locally and fixing all browser console errors step by step.

## 📋 **Prerequisites Check**

Before starting, ensure you have:
- **Node.js 18+** installed
- **npm** package manager
- **Git** (if cloning)
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### **Check Prerequisites**
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if ports are free
lsof -i :3000  # Should return nothing
lsof -i :5173  # Should return nothing
```

## 🔧 **Step 1: Project Setup**

### **1.1 Navigate to Project Directory**
```bash
cd /path/to/your/blufleet/project
# Example: cd ~/Desktop/mockfleet
```

### **1.2 Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies  
cd frontend
npm install
cd ..
```

### **1.3 Create Environment Files**
```bash
# Create backend environment file
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=3000
JWT_SECRET=blufleet-dev-jwt-secret-2024-very-secure-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DEV_BYPASS_AUTH=false
MOCK_EXTERNAL_SERVICES=true
DATABASE_URL=mock://localhost/blufleet
EOF

# Create frontend environment file
cat > frontend/.env << 'EOF'
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_ENVIRONMENT=development
EOF
```

## 🚀 **Step 2: Start Backend Server**

### **2.1 Start Backend**
```bash
# Open Terminal 1 - Backend
cd backend
npm run dev
```

**Expected Output:**
```
> blufleet-backend@1.0.0 dev
> nodemon --exec ts-node src/index.ts

[nodemon] starting `ts-node src/index.ts`
info: BluFleet API Gateway started on port 3000
```

### **2.2 Test Backend Health**
```bash
# Open Terminal 2 - Testing
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-24T...",
  "service": "blufleet-api-gateway",
  "version": "1.0.0",
  "uptime": 5.123,
  "environment": "development"
}
```

### **2.3 Test Authentication**
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blufleet.com","password":"password"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "admin@blufleet.com",
      "firstName": "John",
      "lastName": "Admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

## 🌐 **Step 3: Start Frontend Server**

### **3.1 Start Frontend**
```bash
# Open Terminal 3 - Frontend
cd frontend
npm run dev
```

**Expected Output:**
```
> blufleet@0.0.0 dev
> vite

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **3.2 Access Frontend**
Open your browser and navigate to: **http://localhost:5173**

## 🔍 **Step 4: Browser Console Error Fixing**

### **4.1 Open Browser Developer Tools**
1. **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
3. **Safari**: Press `Cmd+Option+I` (Mac)

### **4.2 Check Console Tab**
Look for errors in the Console tab. Common errors and fixes:

#### **Error 1: Module Resolution Errors**
```
Error: Failed to resolve import './components/...'
```

**Fix:**
<function_calls>
<invoke name="fsWrite">
<parameter name="path">fix-import-errors.sh!/bin/bash

# Fix common import errors in frontend
echo "🔧 Fixing import errors..."

# Create missing component files
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/components/dashboard
mkdir -p frontend/src/components/layout
mkdir -p frontend/src/components/map

# Create missing UI components
cat > frontend/src/components/ui/LoadingSpinner.tsx << 'EOF'
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}>
    </div>
  );
};

export default LoadingSpinner;
EOF

# Create missing dashboard components
cat > frontend/src/components/dashboard/FleetOverviewCard.tsx << 'EOF'
import React from 'react';

interface FleetOverviewCardProps {
  fleetData: any;
  driverData: any;
}

export const FleetOverviewCard: React.FC<FleetOverviewCardProps> = ({ 
  fleetData, 
  driverData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {fleetData?.totalVehicles || 0}
          </div>
          <div className="text-sm text-gray-600">Total Vehicles</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {fleetData?.activeVehicles || 0}
          </div>
          <div className="text-sm text-gray-600">Active Vehicles</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">
            {driverData?.totalDrivers || 0}
          </div>
          <div className="text-sm text-gray-600">Total Drivers</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {driverData?.activeDrivers || 0}
          </div>
          <div className="text-sm text-gray-600">Active Drivers</div>
        </div>
      </div>
    </div>
  );
};

export default FleetOverviewCard;
EOF

# Create other missing dashboard components
cat > frontend/src/components/dashboard/EnergyMetricsCard.tsx << 'EOF'
import React from 'react';

interface EnergyMetricsCardProps {
  operationsData: any;
  chargingData: any;
}

export const EnergyMetricsCard: React.FC<EnergyMetricsCardProps> = ({ 
  operationsData, 
  chargingData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Metrics</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Energy Consumed</span>
          <span className="font-semibold">{operationsData?.totalEnergyConsumedKwh || 0} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Energy Charged</span>
          <span className="font-semibold">{chargingData?.totalEnergyChargedTodayKwh || 0} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Efficiency Score</span>
          <span className="font-semibold">{operationsData?.avgEfficiencyScore || 0}%</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyMetricsCard;
EOF

cat > frontend/src/components/dashboard/BatteryStatusCard.tsx << 'EOF'
import React from 'react';

interface BatteryStatusCardProps {
  batteryStatus: any;
  vehicleCount: number;
}

export const BatteryStatusCard: React.FC<BatteryStatusCardProps> = ({ 
  batteryStatus, 
  vehicleCount 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Status</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Average SOC</span>
          <span className="font-semibold">{batteryStatus?.avgBatterySoc || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Vehicles Reporting</span>
          <span className="font-semibold">{batteryStatus?.vehiclesReporting || vehicleCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Low Battery Alerts</span>
          <span className="font-semibold text-orange-600">{batteryStatus?.lowBatteryAlerts || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default BatteryStatusCard;
EOF

cat > frontend/src/components/dashboard/PerformanceMetricsCard.tsx << 'EOF'
import React from 'react';

interface PerformanceMetricsCardProps {
  metrics: any;
  operationsData: any;
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ 
  metrics, 
  operationsData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Fleet Utilization</span>
          <span className="font-semibold">{metrics?.fleetUtilization || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Energy Efficiency</span>
          <span className="font-semibold">{metrics?.avgEnergyEfficiency || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Driver Score</span>
          <span className="font-semibold">{metrics?.driverBehaviorScore || 0}%</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;
EOF

cat > frontend/src/components/dashboard/AlertsCard.tsx << 'EOF'
import React from 'react';

interface AlertsCardProps {
  alerts: any;
  batteryStatus: any;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ 
  alerts, 
  batteryStatus 
}) => {
  const totalAlerts = (alerts?.lowBattery || 0) + (alerts?.criticalBattery || 0) + 
                     (alerts?.driverBehavior || 0) + (alerts?.maintenanceDue || 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
          {totalAlerts}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{alerts?.lowBattery || 0}</div>
          <div className="text-sm text-gray-600">Low Battery</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">{alerts?.criticalBattery || 0}</div>
          <div className="text-sm text-gray-600">Critical Battery</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">{alerts?.driverBehavior || 0}</div>
          <div className="text-sm text-gray-600">Driver Behavior</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{alerts?.maintenanceDue || 0}</div>
          <div className="text-sm text-gray-600">Maintenance Due</div>
        </div>
      </div>
    </div>
  );
};

export default AlertsCard;
EOF

echo "✅ Created missing dashboard components"

# Create missing layout components
cat > frontend/src/components/layout/AppLayout.tsx << 'EOF'
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  user: any;
  notifications: any[];
  onSearch: (query: string) => void;
  onNotificationClick: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onClearAllNotifications: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  user,
  notifications,
  onSearch,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearAllNotifications
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header
          user={user}
          notifications={notifications}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onClearAllNotifications={onClearAllNotifications}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
EOF

cat > frontend/src/components/layout/Header.tsx << 'EOF'
import React from 'react';

interface HeaderProps {
  user: any;
  notifications: any[];
  onSearch: (query: string) => void;
  onNotificationClick: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onClearAllNotifications: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  notifications,
  onSearch,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  onMenuClick
}) => {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <button
              type="button"
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={onMenuClick}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-semibold text-gray-900">BluFleet</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Welcome, {user?.firstName || 'User'}</span>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
EOF

cat > frontend/src/components/layout/Sidebar.tsx << 'EOF'
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Fleet Tracking', href: '/fleet-tracking', icon: '🚗' },
  { name: 'Energy & Charging', href: '/energy-charging', icon: '⚡' },
  { name: 'Maintenance', href: '/maintenance', icon: '🔧' },
  { name: 'Safety & Compliance', href: '/safety-compliance', icon: '🛡️' },
  { name: 'Analytics & Reports', href: '/analytics-reports', icon: '📈' },
  { name: 'Fleet Predictions', href: '/fleet-predictions', icon: '🔮' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-white">BluFleet</h1>
          <button
            type="button"
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={onClose}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
EOF

echo "✅ Created missing layout components"
echo "✅ All missing components created successfully!"