# 🚀 How to Start BluFleet Locally - Complete Guide

## 📋 **Prerequisites**

Before starting, ensure you have:
- **Node.js 18+** installed
- **npm** package manager
- **Terminal/Command Prompt** access
- **Web Browser** (Chrome, Firefox, Safari, Edge)

## 🎯 **Quick Start (3 Steps)**

### **Step 1: Start Backend Server**
```bash
# Open Terminal 1
cd backend
npm run dev
```
**Expected Output**: "BluFleet API Gateway started on port 3000"

### **Step 2: Start Frontend Server**
```bash
# Open Terminal 2 (new terminal window)
cd frontend
npm run dev
```
**Expected Output**: "Local: http://localhost:5173"

### **Step 3: Open Browser**
```bash
# Open your web browser and navigate to:
http://localhost:5173

# Login with test credentials:
Email: admin@blufleet.com
Password: password
```

## 🔧 **Detailed Setup Instructions**

### **1. Project Setup**
```bash
# Navigate to project directory
cd /path/to/blufleet

# Verify project structure
ls -la
# Should see: backend/, frontend/, database/, shared/, scripts/
```

### **2. Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to project root
cd ..
```

### **3. Environment Configuration**
```bash
# Backend environment
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=3000
JWT_SECRET=blufleet-dev-jwt-secret-2024-very-secure-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DEV_BYPASS_AUTH=false
MOCK_EXTERNAL_SERVICES=true
EOF

# Frontend environment
cat > frontend/.env << 'EOF'
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_ENVIRONMENT=development
EOF
```

### **4. Start Services**

#### **Option A: Manual Start (Recommended for Testing)**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend (in new terminal)
cd frontend
npm run dev
```

#### **Option B: Automated Start**
```bash
# Use the automated startup script
./start-local-development.sh
```

## 🧪 **Testing & Verification**

### **1. Verify Backend is Running**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"blufleet-api-gateway"}
```

### **2. Test Authentication**
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blufleet.com","password":"password"}'

# Expected response: JSON with "token" field
```

### **3. Verify Frontend is Running**
```bash
# Check if frontend is accessible
curl -I http://localhost:5173

# Expected response: HTTP/1.1 200 OK
```

### **4. Browser Testing**
1. **Open**: http://localhost:5173
2. **Login**: admin@blufleet.com / password
3. **Navigate**: Test all menu items
4. **Check Console**: Open browser dev tools (F12) and check for errors

## 🐛 **Common Issues & Fixes**

### **Issue 1: Backend Won't Start**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process if needed
kill -9 <PID>

# Restart backend
cd backend && npm run dev
```

### **Issue 2: Frontend Won't Start**
```bash
# Check if port 5173 is in use
lsof -i :5173

# Kill existing process if needed
kill -9 <PID>

# Restart frontend
cd frontend && npm run dev
```

### **Issue 3: Authentication Errors**
```bash
# Check JWT secret is set
cat backend/.env | grep JWT_SECRET

# If missing, create the .env file as shown above
```

### **Issue 4: Frontend Console Errors**
Open browser dev tools (F12) and check for:

#### **Common Error 1: Module Not Found**
```javascript
// Error: Cannot resolve module '../components/...'
// Fix: Create missing component files (see below)
```

#### **Common Error 2: Type Errors**
```javascript
// Error: Property 'name' does not exist on type 'User'
// Fix: Update type definitions (handled automatically)
```

#### **Common Error 3: API Connection Errors**
```javascript
// Error: Failed to fetch from API
// Fix: Ensure backend is running on port 3000
```

## 🔧 **Browser Console Error Fixes**

### **Fix Missing Components**
If you see "Module not found" errors in browser console:

<function_calls>
<invoke name="fsWrite">
<parameter name="path">fix-frontend-errors.sh/bin/bash

# Fix Frontend Console Errors Script
echo "🔧 Fixing frontend console errors..."

# Create missing UI components
mkdir -p frontend/src/components/ui

cat > frontend/src/components/ui/Icon.tsx << 'EOF'
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  // Simple icon component - in production, use a proper icon library
  const iconMap: Record<string, string> = {
    'alert-triangle': '⚠️',
    'refresh-cw': '🔄',
    'zap': '⚡',
    'zap-off': '⚡',
    'menu': '☰',
    'x': '✕',
    'check': '✓',
    'user': '👤',
    'settings': '⚙️',
    'bell': '🔔',
    'search': '🔍'
  };

  return (
    <span className={`inline-block ${className}`} style={{ fontSize: `${size}px` }}>
      {iconMap[name] || '?'}
    </span>
  );
};

export default Icon;
EOF

# Create PageLoadingFallback component
cat > frontend/src/utils/lazyImports.tsx << 'EOF'
import React, { lazy } from 'react';

// Loading fallback component
export const PageLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Lazy imports for pages
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyFleetTracking = lazy(() => import('../pages/FleetTracking'));
export const LazyEnergyCharging = lazy(() => import('../pages/EnergyCharging'));
export const LazyMaintenance = lazy(() => import('../pages/Maintenance'));
export const LazySafetyCompliance = lazy(() => import('../pages/SafetyCompliance'));
export const LazyAnalyticsReports = lazy(() => import('../pages/AnalyticsReports'));
export const LazyFleetPredictions = lazy(() => import('../pages/FleetPredictions'));
export const LazySimulationResults = lazy(() => import('../pages/SimulationResults'));
export const LazyGeoOperations = lazy(() => import('../pages/GeoOperations'));
export const LazyIntegrations = lazy(() => import('../pages/Integrations'));
export const LazyUserManagement = lazy(() => import('../pages/UserManagement'));
EOF

# Create missing layout components
mkdir -p frontend/src/components/layout

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

echo "✅ Created all missing components"
echo "✅ Frontend should now build without errors"