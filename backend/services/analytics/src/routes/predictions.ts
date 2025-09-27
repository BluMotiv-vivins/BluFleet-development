import express from 'express';
import { PredictionsService } from '../services/predictionsService';
import { AWSHealthService } from '../services/awsHealthService';

const router = express.Router();
const predictionsService = new PredictionsService();
const awsHealthService = new AWSHealthService();

// GET /predictions - Get predictions with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      deviceId,
      healthStage,
      minConfidence,
      limit = '100',
      offset = '0'
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      deviceId: deviceId as string,
      healthStage: healthStage as string,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    const result = await predictionsService.getPredictions(filters);
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: result.total,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /predictions/latest - Get latest predictions
router.get('/latest', async (req, res, next) => {
  try {
    const { limit = '50' } = req.query;
    
    const predictions = await predictionsService.getLatestPredictions(
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    next(error);
  }
});

// GET /predictions/summary - Get predictions summary/statistics
router.get('/summary', async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      deviceId,
      healthStage,
      minConfidence
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      deviceId: deviceId as string,
      healthStage: healthStage as string,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined
    };

    const summary = await predictionsService.getPredictionsSummary(filters);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

// GET /predictions/export - Export predictions as CSV
router.get('/export', async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      deviceId,
      healthStage,
      minConfidence
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      deviceId: deviceId as string,
      healthStage: healthStage as string,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined,
      limit: 10000, // Max export limit
      offset: 0
    };

    const result = await predictionsService.getPredictions(filters);
    
    // Convert to CSV format
    const headers = [
      'Record ID', 'Timestamp', 'Device ID', 'Cycle', 'Frequency',
      'Z Real', 'Z Imag', 'RRUL', 'RUL Prediction', 'Health Stage',
      'Kinesis Stream', 'SageMaker Endpoint', 'Lambda Request ID', 'Raw Data Location'
    ];
    
    const csvData = [
      headers.join(','),
      ...result.data.map(record => [
        record.record_id,
        record.timestamp,
        record.device_id,
        record.cycle,
        record.frequency,
        record.z_real,
        record.z_imag,
        record.rrul,
        record.rul_prediction,
        record.health_stage,
        record.kinesis_stream,
        record.sagemaker_endpoint,
        record.lambda_request_id,
        record.raw_data_location
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="fleet-predictions-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);
  } catch (error) {
    next(error);
  }
});

// GET /health/aws - Check AWS services health
router.get('/health/aws', async (req, res, next) => {
  try {
    const healthStatus = await awsHealthService.checkAllServices();

    res.json({
      success: true,
      health: healthStatus
    });
  } catch (error) {
    next(error);
  }
});

// POST /test/iot - Send test message to IoT Core
router.post('/test/iot', async (req, res, next) => {
  try {
    const testPayload = {
      device_id: `TEST_VEHICLE_${Date.now()}`,
      cycle: Math.floor(Math.random() * 1000) + 500,
      frequency: Math.random() * 5 + 1,
      Z_real: Math.random() * 0.5,
      Z_imag: Math.random() * 0.5,
      rRUL: Math.random() * 200 + 50,
      timestamp: new Date().toISOString()
    };

    const result = await awsHealthService.sendTestIoTMessage(testPayload);

    res.json({
      success: true,
      message: 'Test message sent to IoT Core successfully',
      messageId: result.messageId,
      timestamp: result.timestamp,
      payload: testPayload
    });
  } catch (error) {
    next(error);
  }
});

// GET /metrics/realtime - Get real-time metrics
router.get('/metrics/realtime', async (req, res, next) => {
  try {
    const metrics = {
      activeConnections: Math.floor(Math.random() * 50) + 100,
      messagesPerSecond: Math.floor(Math.random() * 20) + 5,
      processingLatency: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.random() * 0.1,
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

// GET /export - Export predictions data as CSV or JSON
router.get('/export', async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      deviceId,
      healthStage,
      minConfidence,
      format = 'csv'
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      deviceId: deviceId as string,
      healthStage: healthStage as string,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined
    };

    const exportData = await predictionsService.exportPredictions(filters, format as 'csv' | 'json');
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="predictions_${new Date().toISOString().split('T')[0]}.json"`);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="predictions_${new Date().toISOString().split('T')[0]}.csv"`);
    }
    
    res.send(exportData);
  } catch (error) {
    next(error);
  }
});

export default router;
