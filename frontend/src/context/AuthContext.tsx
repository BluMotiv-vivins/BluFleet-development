import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuthToken, 
  setAuthToken, 
  setRefreshToken, 
  clearAuthData,
  getAuthHeaders 
} from '../utils/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  organizationId: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          setUser(null);
          return;
        }
        
        // Validate the token with the backend
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Session expired');
        }
        
        const userData = await response.json();
        setUser(userData.data);
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err : new Error('Authentication error'));
        // Clear invalid auth data
        clearAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the login API
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const authData = await response.json();
      
      // Store auth tokens using utility functions
      setAuthToken(authData.data.token);
      setRefreshToken(authData.data.refreshToken);
      
      // Set user data
      setUser(authData.data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data using utility function
    clearAuthData();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
