import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import winston from 'winston';
import expressWinston from 'express-winston';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateApiKey } from './middleware/apiKey';
import { rateLimitConfig } from './config/rateLimit';
import { swaggerOptions } from './config/swagger';
import { WebSocketManager } from './services/websocket';
import { HealthCheckService } from './services/healthCheck';
import { MetricsService } from './services/metrics';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize services
const healthCheckService = new HealthCheckService();
const metricsService = new MetricsService();
const wsManager = new WebSocketManager(server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Tenant-ID']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

app.use(requestLogger);

// Rate limiting
app.use('/api/', rateLimit(rateLimitConfig.api));
app.use('/auth/', rateLimit(rateLimitConfig.auth));

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheckService.getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  const metrics = await metricsService.getMetrics();
  res.json(metrics);
});

// API Documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FleetVolt Pro API Documentation'
}));

// Authentication routes (handled directly by gateway)
app.use('/auth', require('./routes/auth'));

// API routes with authentication and service proxying
app.use('/api/fleet-monitoring', 
  authMiddleware, 
  validateApiKey,
  createProxyMiddleware({
    target: process.env.FLEET_MONITORING_SERVICE_URL || 'http://fleet-monitoring:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/fleet-monitoring': ''
    },
    onError: (err, req, res) => {
      logger.error('Fleet Monitoring Service Error:', err);
      res.status(503).json({ error: 'Fleet Monitoring Service Unavailable' });
    }
  })
);

app.use('/api/energy-charging',
  authMiddleware,
  validateApiKey,
  createProxyMiddleware({
    target: process.env.ENERGY_CHARGING_SERVICE_URL || 'http://energy-charging:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/energy-charging': ''
    },
    onError: (err, req, res) => {
      logger.error('Energy Charging Service Error:', err);
      res.status(503).json({ error: 'Energy Charging Service Unavailable' });
    }
  })
);

app.use('/api/maintenance',
  authMiddleware,
  validateApiKey,
  createProxyMiddleware({
    target: process.env.MAINTENANCE_SERVICE_URL || 'http://maintenance:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/maintenance': ''
    },
    onError: (err, req, res) => {
      logger.error('Maintenance Service Error:', err);
      res.status(503).json({ error: 'Maintenance Service Unavailable' });
    }
  })
);

app.use('/api/safety-compliance',
  authMiddleware,
  validateApiKey,
  createProxyMiddleware({
    target: process.env.SAFETY_COMPLIANCE_SERVICE_URL || 'http://safety-compliance:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/safety-compliance': ''
    },
    onError: (err, req, res) => {
      logger.error('Safety Compliance Service Error:', err);
      res.status(503).json({ error: 'Safety Compliance Service Unavailable' });
    }
  })
);

app.use('/api/analytics',
  authMiddleware,
  validateApiKey,
  createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL || 'http://analytics:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/analytics': ''
    },
    onError: (err, req, res) => {
      logger.error('Analytics Service Error:', err);
      res.status(503).json({ error: 'Analytics Service Unavailable' });
    }
  })
);

app.use('/api/insurance-finance',
  authMiddleware,
  validateApiKey,
  createProxyMiddleware({
    target: process.env.INSURANCE_FINANCE_SERVICE_URL || 'http://insurance-finance:3006',
    changeOrigin: true,
    pathRewrite: {
      '^/api/insurance-finance': ''
    },
    onError: (err, req, res) => {
      logger.error('Insurance Finance Service Error:', err);
      res.status(503).json({ error: 'Insurance Finance Service Unavailable' });
    }
  })
);

app.use('/api/integration-iot',
  authMiddleware,
  validateApiKey,
  createProxyMiddleware({
    target: process.env.INTEGRATION_IOT_SERVICE_URL || 'http://integration-iot:3007',
    changeOrigin: true,
    pathRewrite: {
      '^/api/integration-iot': ''
    },
    onError: (err, req, res) => {
      logger.error('Integration IoT Service Error:', err);
      res.status(503).json({ error: 'Integration IoT Service Unavailable' });
    }
  })
);

// Error logging
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(port, () => {
  logger.info(`FleetVolt Pro API Gateway running on port ${port}`);
  logger.info(`API Documentation available at http://localhost:${port}/docs`);
  logger.info(`Health check available at http://localhost:${port}/health`);
});

export default app;