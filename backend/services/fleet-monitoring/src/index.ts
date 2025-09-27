import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import winston from 'winston';
import expressWinston from 'express-winston';

import { DatabaseService } from './services/database';
import { TelemetryService } from './services/telemetry';
import { GeofenceService } from './services/geofence';
import { RouteOptimizationService } from './services/routeOptimization';
import { KafkaService } from './services/kafka';
import { RedisService } from './services/redis';

import vehicleRoutes from './routes/vehicles';
import fleetRoutes from './routes/fleets';
import driverRoutes from './routes/drivers';
import tripRoutes from './routes/trips';
import geofenceRoutes from './routes/geofences';
import telemetryRoutes from './routes/telemetry';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateTenant } from './middleware/tenant';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fleet-monitoring' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize services
const databaseService = new DatabaseService();
const telemetryService = new TelemetryService();
const geofenceService = new GeofenceService();
const routeOptimizationService = new RouteOptimizationService();
const kafkaService = new KafkaService();
const redisService = new RedisService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false
}));

app.use(requestLogger);
app.use(validateTenant);

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    const redisHealth = await redisService.healthCheck();
    const kafkaHealth = await kafkaService.healthCheck();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'fleet-monitoring',
      version: process.env.npm_package_version || '1.0.0',
      dependencies: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'healthy' : 'unhealthy',
        kafka: kafkaHealth ? 'healthy' : 'unhealthy'
      }
    };

    const isHealthy = dbHealth && redisHealth && kafkaHealth;
    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'fleet-monitoring',
      error: 'Health check failed'
    });
  }
});

// Routes
app.use('/vehicles', vehicleRoutes);
app.use('/fleets', fleetRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/geofences', geofenceRoutes);
app.use('/telemetry', telemetryRoutes);

// Error logging
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    }
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database connection
    await databaseService.initialize();
    logger.info('Database connection established');

    // Initialize Redis connection
    await redisService.initialize();
    logger.info('Redis connection established');

    // Initialize Kafka connection
    await kafkaService.initialize();
    logger.info('Kafka connection established');

    // Initialize telemetry service
    await telemetryService.initialize();
    logger.info('Telemetry service initialized');

    // Start server
    app.listen(port, () => {
      logger.info(`Fleet Monitoring Service running on port ${port}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await databaseService.close();
  await redisService.close();
  await kafkaService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await databaseService.close();
  await redisService.close();
  await kafkaService.close();
  process.exit(0);
});

startServer();

export default app;