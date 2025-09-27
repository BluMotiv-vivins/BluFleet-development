// Protected Route Component for BluFleet Frontend
// Version: 1.0.0

import React from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '../../../../shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  user,
  requiredPermissions = []
}) => {
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const userPermissions = user.permissions || [];
    
    // Check if user has admin permission (wildcard)
    if (!userPermissions.includes('*')) {
      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;