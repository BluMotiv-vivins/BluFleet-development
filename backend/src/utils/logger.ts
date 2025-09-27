// Logging utility for BluFleet Backend
// Version: 1.0.0

import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log')
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log')
    })
  ]
});

// Create a stream object for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Utility functions for structured logging
export const loggers = {
  // Request logging
  logRequest: (req: any, res: any, responseTime?: number) => {
    logger.http('HTTP Request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      organizationId: req.user?.organizationId,
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  },

  // Database operation logging
  logDatabase: (operation: string, table: string, duration?: number, error?: Error) => {
    const logData = {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logger.error('Database operation failed', { ...logData, error: error.message });
    } else {
      logger.debug('Database operation', logData);
    }
  },

  // Authentication logging
  logAuth: (event: string, userId?: string, email?: string, success: boolean = true, error?: string) => {
    const logData = {
      event,
      userId,
      email,
      success,
      error,
      timestamp: new Date().toISOString()
    };

    if (success) {
      logger.info('Authentication event', logData);
    } else {
      logger.warn('Authentication failed', logData);
    }
  },

  // Business logic logging
  logBusiness: (event: string, entityType: string, entityId: string, userId?: string, metadata?: Record<string, any>) => {
    logger.info('Business event', {
      event,
      entityType,
      entityId,
      userId,
      metadata,
      timestamp: new Date().toISOString()
    });
  },

  // External service logging
  logExternalService: (service: string, operation: string, duration?: number, success: boolean = true, error?: string) => {
    const logData = {
      service,
      operation,
      duration: duration ? `${duration}ms` : undefined,
      success,
      error,
      timestamp: new Date().toISOString()
    };

    if (success) {
      logger.info('External service call', logData);
    } else {
      logger.error('External service failed', logData);
    }
  },

  // Performance logging
  logPerformance: (operation: string, duration: number, metadata?: Record<string, any>) => {
    const logData = {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (duration > 1000) {
      logger.warn('Slow operation detected', logData);
    } else {
      logger.debug('Performance metric', logData);
    }
  },

  // Security logging
  logSecurity: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>) => {
    logger.warn('Security event', {
      event,
      severity,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

// Export default logger
export default logger;