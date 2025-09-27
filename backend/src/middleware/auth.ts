// Authentication and authorization middleware for BluFleet Backend
// Version: 1.0.0

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger, loggers } from '../utils/logger';
// import { User } from '../../../shared/types';

interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User & { permissions: string[] };
    }
  }
}

interface JWTPayload {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * JWT Authentication Middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('Invalid authentication token format');
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'CONFIGURATION_ERROR');
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        loggers.logAuth('token_expired', undefined, undefined, false, 'Token expired');
        throw new UnauthorizedError('Authentication token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        loggers.logAuth('invalid_token', undefined, undefined, false, 'Invalid token');
        throw new UnauthorizedError('Invalid authentication token');
      } else {
        throw error;
      }
    }

    // TODO: In production, verify user still exists and is active in database
    // For now, we'll use the token payload directly
    req.user = {
      id: decoded.id,
      organizationId: decoded.organizationId,
      email: decoded.email,
      role: decoded.role as any,
      permissions: decoded.permissions as any,
      createdAt: '',
      updatedAt: '',
      firstName: '',
      lastName: '',
      isActive: true
    };

    loggers.logAuth('token_verified', decoded.id, decoded.email, true);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Adds user context if token is present but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If token is present, validate it
      await authenticate(req, res, next);
    } else {
      // No token present, continue without user context
      next();
    }
  } catch (error) {
    // If token validation fails, continue without user context
    // This allows endpoints to work for both authenticated and anonymous users
    next();
  }
};

/**
 * Role-based Authorization Middleware
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        loggers.logSecurity('unauthorized_access', 'medium', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          endpoint: req.path,
          method: req.method
        });
        
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Permission-based Authorization Middleware
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userPermissions = req.user.permissions || [];
      
      // Check if user has admin permission (wildcard)
      if (userPermissions.includes('*')) {
        next();
        return;
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        loggers.logSecurity('insufficient_permissions', 'medium', {
          userId: req.user.id,
          userPermissions,
          requiredPermissions,
          endpoint: req.path,
          method: req.method
        });

        throw new ForbiddenError(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Organization-based Authorization Middleware
 * Ensures user can only access resources from their organization
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Extract organization ID from request (params, body, or query)
    const requestOrgId = req.params.organizationId || 
                        req.body.organizationId || 
                        req.query.organizationId;

    if (requestOrgId && requestOrgId !== req.user.organizationId) {
      loggers.logSecurity('cross_organization_access', 'high', {
        userId: req.user.id,
        userOrganizationId: req.user.organizationId,
        requestedOrganizationId: requestOrgId,
        endpoint: req.path,
        method: req.method
      });

      throw new ForbiddenError('Access denied to resources outside your organization');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * API Key Authentication Middleware
 * For service-to-service communication
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key required');
    }

    // TODO: Validate API key against database
    // For now, check against environment variable
    const validApiKeys = process.env.API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      loggers.logSecurity('invalid_api_key', 'high', {
        apiKey: apiKey.substring(0, 8) + '...',
        endpoint: req.path,
        method: req.method,
        ip: req.ip
      });

      throw new UnauthorizedError('Invalid API key');
    }

    // Set service context
    req.user = {
      id: 'service',
      organizationId: 'system',
      email: 'service@blufleet.com',
      role: 'service' as any,
      permissions: ['*'],
      createdAt: '',
      updatedAt: '',
      firstName: 'Service',
      lastName: 'Account',
      isActive: true
    };

    loggers.logAuth('api_key_verified', 'service', 'service@blufleet.com', true);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rate Limiting Middleware
 */
export const rateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();
    
    const userRequests = requests.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize counter
      requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      loggers.logSecurity('rate_limit_exceeded', 'medium', {
        identifier,
        count: userRequests.count,
        maxRequests,
        endpoint: req.path,
        method: req.method
      });

      throw new AppError(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    userRequests.count++;
    next();
  };
};

/**
 * Development-only bypass middleware
 */
export const devBypass = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true') {
    // Set mock user for development
    req.user = {
      id: 'dev-user',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'dev@blufleet.com',
      role: 'admin' as any,
      permissions: ['*'],
      createdAt: '',
      updatedAt: '',
      firstName: 'Dev',
      lastName: 'User',
      isActive: true
    };
    
    logger.warn('Development authentication bypass enabled');
  }
  
  next();
};