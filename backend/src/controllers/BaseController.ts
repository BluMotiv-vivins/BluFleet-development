// Base Controller Class for BluFleet Backend
// Version: 1.0.0
// Description: Abstract base controller with common functionality

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
// import { ApiResponse, PaginatedResponse } from '../../../shared/types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export abstract class BaseController {
  /**
   * Handle validation errors from express-validator
   */
  protected validateRequest(req: Request): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        errors: errors.array()
      });
    }
  }

  /**
   * Send success response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  protected sendPaginatedResponse<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): void {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    };

    res.json(response);
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    error: string | AppError,
    statusCode: number = 500
  ): void {
    let errorResponse: ApiResponse;

    if (error instanceof AppError) {
      errorResponse = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      statusCode = error.statusCode;
    } else {
      errorResponse = {
        success: false,
        error: typeof error === 'string' ? error : 'Internal server error',
        timestamp: new Date().toISOString()
      };
    }

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Async handler wrapper to catch errors
   */
  protected asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Extract pagination parameters from query
   */
  protected getPaginationParams(req: Request): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Extract date range from query parameters
   */
  protected getDateRange(req: Request): {
    startDate?: Date;
    endDate?: Date;
  } {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : undefined;
    
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    // Validate dates
    if (startDate && isNaN(startDate.getTime())) {
      throw new AppError('Invalid start date format', 400, 'INVALID_DATE');
    }

    if (endDate && isNaN(endDate.getTime())) {
      throw new AppError('Invalid end date format', 400, 'INVALID_DATE');
    }

    if (startDate && endDate && startDate > endDate) {
      throw new AppError('Start date cannot be after end date', 400, 'INVALID_DATE_RANGE');
    }

    return { startDate, endDate };
  }

  /**
   * Log controller action
   */
  protected logAction(
    action: string,
    userId?: string,
    organizationId?: string,
    metadata?: Record<string, any>
  ): void {
    logger.info('Controller action', {
      action,
      userId,
      organizationId,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Extract user context from request
   */
  protected getUserContext(req: Request): {
    userId: string;
    organizationId: string;
    role: string;
    permissions: string[];
  } {
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('User context not found', 401, 'UNAUTHORIZED');
    }

    return {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      permissions: user.permissions || []
    };
  }

  /**
   * Check if user has required permission
   */
  protected checkPermission(req: Request, requiredPermission: string): void {
    const { permissions } = this.getUserContext(req);
    
    if (!permissions.includes('*') && !permissions.includes(requiredPermission)) {
      throw new AppError(
        `Insufficient permissions. Required: ${requiredPermission}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
  }

  /**
   * Sanitize query parameters
   */
  protected sanitizeQuery(query: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        // Remove potential SQL injection patterns
        if (typeof value === 'string') {
          sanitized[key] = value.replace(/['"`;\\]/g, '');
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Build filter conditions from query parameters
   */
  protected buildFilters(
    req: Request,
    allowedFilters: string[]
  ): Record<string, any> {
    const query = this.sanitizeQuery(req.query);
    const filters: Record<string, any> = {};

    for (const filter of allowedFilters) {
      if (query[filter] !== undefined) {
        filters[filter] = query[filter];
      }
    }

    return filters;
  }

  /**
   * Handle file upload validation
   */
  protected validateFileUpload(
    file: any, // Express.Multer.File
    allowedTypes: string[],
    maxSize: number
  ): void {
    if (!file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        400,
        'INVALID_FILE_TYPE'
      );
    }

    if (file.size > maxSize) {
      throw new AppError(
        `File too large. Maximum size: ${maxSize} bytes`,
        400,
        'FILE_TOO_LARGE'
      );
    }
  }
}