const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

// Import our Lambda handlers as regular functions
const vehicleHandlers = require('./src/handlers/vehicles');
const telemetryHandlers = require('./src/handlers/telemetry');
const analyticsHandlers = require('./src/handlers/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'BluFleet API Gateway'
  });
});

// Mock Lambda context and callback for testing
const mockContext = {
  getRemainingTimeInMillis: () => 30000,
  functionName: 'test-function',
  functionVersion: '1.0',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id'
};

const mockCallback = (error, result) => {
  if (error) {
    console.error('Lambda error:', error);
    throw error;
  }
  return result;
};

// Helper function to convert Express req/res to Lambda event format
const convertToLambdaEvent = (req, res) => {
  return {
    httpMethod: req.method,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : null,
    requestContext: {
      requestId: 'test-request-id',
      stage: 'dev'
    }
  };
};

// Vehicle endpoints
app.get('/api/v1/vehicles', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await vehicleHandlers.getVehicles(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/vehicles/:id', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    event.pathParameters = { id: req.params.id };
    const result = await vehicleHandlers.getVehicle(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/vehicles', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await vehicleHandlers.createVehicle(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/vehicles/:id', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    event.pathParameters = { id: req.params.id };
    const result = await vehicleHandlers.updateVehicle(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/vehicles/:id', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    event.pathParameters = { id: req.params.id };
    const result = await vehicleHandlers.deleteVehicle(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telemetry endpoints
app.post('/api/v1/telemetry/ingest', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await telemetryHandlers.ingestTelemetry(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/telemetry/:vehicleId/latest', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    event.pathParameters = { vehicleId: req.params.vehicleId };
    const result = await telemetryHandlers.getLatestTelemetry(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/telemetry/:vehicleId/history', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    event.pathParameters = { vehicleId: req.params.vehicleId };
    const result = await telemetryHandlers.getTelemetryHistory(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/telemetry/fleet/realtime', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await telemetryHandlers.getFleetRealtime(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoints
app.get('/api/v1/analytics/dashboard', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await analyticsHandlers.getDashboardAnalytics(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/analytics/fleet-health', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await analyticsHandlers.getFleetHealth(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/analytics/energy-efficiency', async (req, res) => {
  try {
    const event = convertToLambdaEvent(req, res);
    const result = await analyticsHandlers.getEnergyEfficiency(event, mockContext, mockCallback);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BluFleet API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🚗 Vehicles API: http://localhost:${PORT}/api/v1/vehicles`);
  console.log(`📡 Telemetry API: http://localhost:${PORT}/api/v1/telemetry`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/v1/analytics`);
});

module.exports = app;
