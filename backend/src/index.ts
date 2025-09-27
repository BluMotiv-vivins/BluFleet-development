// BluFleet Backend Main Entry Point
// Version: 1.0.0
// Description: Main server entry point for API Gateway

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { logger, morganStream } from './utils/logger';
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from './middleware/errorHandler';
import { authenticate, optionalAuth } from './middleware/auth';
import { AppError } from './utils/errors';

// Import route handlers
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import vehicleRoutes from './routes/vehicles';
import driverRoutes from './routes/drivers';
import tripRoutes from './routes/trips';
import alertRoutes from './routes/alerts';
import analyticsRoutes from './routes/analytics';
import simulationRoutes from './routes/simulation';
import batteryAnalyticsRoutes from './routes/batteryAnalytics';

// Load environment variables
dotenv.config();

// Import database module
import db from './utils/database';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Setup global error handlers
setupGlobalErrorHandlers();

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
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: morganStream }));

// Request ID middleware
app.use((req: any, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/vehicles', authenticate, vehicleRoutes);
app.use('/api/drivers', authenticate, driverRoutes);
app.use('/api/trips', authenticate, tripRoutes);
app.use('/api/alerts', authenticate, alertRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/simulation', authenticate, simulationRoutes);
app.use('/api/battery', batteryAnalyticsRoutes);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'blufleet-api-gateway',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'BluFleet API',
    version: '1.0.0',
    description: 'Electric Vehicle Fleet Management API',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      drivers: '/api/drivers',
      trips: '/api/trips',
      alerts: '/api/alerts',
      analytics: '/api/analytics'
    },
    documentation: 'https://docs.blufleet.com'
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  socket.on('authenticate', (data) => {
    // TODO: Implement WebSocket authentication
    socket.emit('authenticated', { success: true, clientId: socket.id });
  });

  socket.on('subscribe', (channels) => {
    // TODO: Implement channel subscription
    channels.forEach((channel: string) => {
      socket.join(channel);
    });
    socket.emit('subscribed', { channels });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with database connection
const startServer = async () => {
  try {
    // Test database connection
    await db.testConnection();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`BluFleet API Gateway started on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`Documentation available at http://localhost:${PORT}/api/docs`);
      logger.info('Using real database connection');
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Initialize application
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, server, io };