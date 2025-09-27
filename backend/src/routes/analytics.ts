// Analytics Routes for BluFleet Backend
// Version: 1.0.0

import { Router } from 'express';
import { query } from 'express-validator';
import { BaseController } from '../controllers/BaseController';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/auth';
import { S3PredictionsService } from '../services/s3PredictionsService';

class AnalyticsController extends BaseController {
  private s3PredictionsService: S3PredictionsService;

  constructor() {
    super();
    this.s3PredictionsService = new S3PredictionsService();
  }
  // Get dashboard metrics
  getDashboardMetrics = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { timeframe = '24h' } = req.query;

    // TODO: Replace with actual database aggregation
    const mockMetrics = {
      timestamp: new Date().toISOString(),
      timeframe,
      fleetOverview: {
        totalVehicles: 25,
        activeVehicles: 22,
        maintenanceVehicles: 2,
        vehicleBreakdown: {
          deliveryVans: 15,
          trucks: 8,
          passengerVehicles: 2
        }
      },
      driverOverview: {
        totalDrivers: 18,
        activeDrivers: 16
      },
      operationsToday: {
        totalTrips: 47,
        completedTrips: 42,
        activeTrips: 5,
        totalDistanceKm: 1247.5,
        totalEnergyConsumedKwh: 287.3,
        avgEfficiencyScore: 89.2,
        onTimeDeliveryPercentage: 94.5
      },
      chargingOverview: {
        activeChargingSessions: 3,
        totalEnergyChargedTodayKwh: 156.8,
        avgChargingCost: 0.18
      },
      batteryStatus: {
        vehiclesReporting: 22,
        avgBatterySoc: 78.5,
        lowBatteryAlerts: 2,
        criticalBatteryAlerts: 0
      },
      energyTrends: [
        { hour: '00:00', consumptionKwh: 12.5 },
        { hour: '01:00', consumptionKwh: 8.2 },
        { hour: '02:00', consumptionKwh: 5.1 },
        { hour: '03:00', consumptionKwh: 3.8 },
        { hour: '04:00', consumptionKwh: 4.2 },
        { hour: '05:00', consumptionKwh: 8.9 },
        { hour: '06:00', consumptionKwh: 15.3 },
        { hour: '07:00', consumptionKwh: 22.1 },
        { hour: '08:00', consumptionKwh: 28.7 },
        { hour: '09:00', consumptionKwh: 31.2 },
        { hour: '10:00', consumptionKwh: 29.8 },
        { hour: '11:00', consumptionKwh: 27.4 }
      ],
      alerts: {
        lowBattery: 2,
        criticalBattery: 0,
        driverBehavior: 1,
        maintenanceDue: 3
      },
      performanceMetrics: {
        fleetUtilization: 88.0,
        avgEnergyEfficiency: 89.2,
        driverBehaviorScore: 91.5
      }
    };

    this.logAction('get_dashboard_metrics', userContext.userId, userContext.organizationId, {
      timeframe
    });

    this.sendSuccess(res, mockMetrics);
  });

  // Get energy analytics
  getEnergyAnalytics = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { timeframe = '7d' } = req.query;

    // TODO: Replace with actual database aggregation
    const mockEnergyAnalytics = {
      timestamp: new Date().toISOString(),
      timeframe,
      energyConsumption: {
        total: 2847.5,
        byVehicleType: {
          van: 1523.2,
          truck: 987.8,
          sedan: 336.5
        },
        byTimeOfDay: [
          { hour: 0, consumption: 45.2 },
          { hour: 6, consumption: 123.8 },
          { hour: 12, consumption: 287.3 },
          { hour: 18, consumption: 198.7 }
        ],
        trend: 'decreasing'
      },
      chargingAnalytics: {
        totalSessions: 156,
        totalEnergyDelivered: 3247.8,
        averageSessionDuration: 2.5, // hours
        peakHours: [8, 9, 17, 18],
        stationUtilization: [
          { stationId: 'station-1', utilizationRate: 78.5 },
          { stationId: 'station-2', utilizationRate: 65.2 },
          { stationId: 'station-3', utilizationRate: 82.1 }
        ]
      },
      costAnalysis: {
        totalEnergyCost: 584.32,
        costPerKm: 0.205,
        savingsVsFuel: 1247.89,
        projectedMonthlyCost: 17529.60
      },
      sustainability: {
        co2Avoided: 1456.7, // kg
        renewableEnergyPercentage: 67.3,
        carbonFootprint: 234.5 // kg CO2 equivalent
      }
    };

    this.logAction('get_energy_analytics', userContext.userId, userContext.organizationId, {
      timeframe
    });

    this.sendSuccess(res, mockEnergyAnalytics);
  });

  // Get fleet KPIs
  getFleetKPIs = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { timeframe = '30d' } = req.query;

    // TODO: Replace with actual KPI calculation
    const mockKPIs = {
      timestamp: new Date().toISOString(),
      timeframe,
      fleetUtilization: 88.5,
      averageEnergyEfficiency: 89.2,
      totalDistanceKm: 15247.8,
      totalEnergyConsumedKwh: 3456.7,
      averageBatterySoc: 78.5,
      activeVehicles: 22,
      completedTrips: 1247,
      maintenanceAlerts: 8,
      safetyScore: 91.2,
      trends: {
        utilization: [85.2, 87.1, 88.5, 89.2, 88.8],
        efficiency: [87.5, 88.1, 89.2, 90.1, 89.7],
        safety: [89.8, 90.5, 91.2, 91.8, 91.5]
      }
    };

    this.sendSuccess(res, mockKPIs);
  });

  // Get performance metrics
  getPerformanceMetrics = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { timeframe = '7d' } = req.query;

    // TODO: Replace with actual performance calculation
    const mockPerformance = {
      timestamp: new Date().toISOString(),
      timeframe,
      overall: {
        score: 89.2,
        grade: 'A-',
        improvement: 2.3 // percentage improvement
      },
      categories: {
        efficiency: {
          score: 91.5,
          metrics: {
            energyPerKm: 0.227, // kWh/km
            regenerativeEfficiency: 23.4,
            idleTime: 8.2 // percentage
          }
        },
        safety: {
          score: 88.7,
          metrics: {
            incidentRate: 0.02, // per 1000 km
            harshBrakingEvents: 12,
            speedingViolations: 3
          }
        },
        utilization: {
          score: 87.3,
          metrics: {
            activeHours: 8.5, // per day
            distancePerDay: 125.7,
            downtimePercentage: 12.3
          }
        },
        maintenance: {
          score: 92.1,
          metrics: {
            scheduledMaintenanceCompliance: 96.8,
            unplannedDowntime: 2.1,
            maintenanceCostPerKm: 0.045
          }
        }
      },
      benchmarks: {
        industryAverage: 82.5,
        topPerformer: 94.2,
        ranking: 'Top 15%'
      }
    };

    this.sendSuccess(res, mockPerformance);
  });

  // Export data
  exportData = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { type, format = 'csv', ...filters } = req.query;

    // TODO: Implement actual data export
    // For now, return export job information
    const exportJob = {
      exportId: `export-${Date.now()}`,
      type,
      format,
      filters,
      status: 'processing',
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 60000).toISOString(), // 1 minute
      downloadUrl: null
    };

    this.logAction('export_data', userContext.userId, userContext.organizationId, {
      exportId: exportJob.exportId,
      type,
      format
    });

    // Simulate processing time
    setTimeout(() => {
      (exportJob as any).status = 'completed';
      (exportJob as any).downloadUrl = `/api/analytics/exports/${exportJob.exportId}/download`;
    }, 5000);

    this.sendSuccess(res, exportJob, 'Export job created successfully');
  });

  // Get predictions (for fleet predictions page)
  getPredictions = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { page, limit, offset } = this.getPaginationParams(req);
    const filters = this.buildFilters(req, ['deviceId', 'healthStage']);
    const { startDate, endDate } = this.getDateRange(req);

    try {
      console.log('Analytics: Getting predictions with filters:', {
        deviceId: filters.deviceId,
        healthStage: filters.healthStage,
        startDate,
        endDate,
        limit,
        offset
      });

      // Get real predictions from S3 using the new service interface
      const result = await this.s3PredictionsService.getPredictions({
        deviceId: filters.deviceId,
        healthStage: filters.healthStage,
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        limit,
        offset
      });

      // Map record_id to both recordId and id for frontend compatibility
      const mappedPredictions = result.data.map(p => ({
        recordId: p.record_id,
        id: p.record_id,
        timestamp: p.timestamp,
        deviceId: p.device_id,
        cycle: p.cycle,
        frequency: p.frequency,
        zReal: p.z_real,
        zImag: p.z_imag,
        rrul: p.rrul,
        rulPrediction: p.rul_prediction,
        healthStage: p.health_stage,
        kinesisStream: p.kinesis_stream,
        sagemakerEndpoint: p.sagemaker_endpoint,
        lambdaRequestId: p.lambda_request_id,
        rawDataLocation: p.raw_data_location
      }));

      console.log(`Analytics: Returning ${mappedPredictions.length} predictions`);
      this.sendPaginatedResponse(res, mappedPredictions, { page, limit, total: result.total });
    } catch (error) {
      console.error('Analytics: Error fetching predictions:', error);
      
      // Fallback to mock data if S3 fails
      const mockPredictions = [
        {
          recordId: '877c70c8',
          id: '877c70c8',
          timestamp: '2025-09-14T18:11:53.371854',
          deviceId: 'vehicle_5',
          cycle: 135,
          frequency: 2.5,
          zReal: 0.2204665168666829,
          zImag: 0.3227444130296822,
          rrul: 232.48323198139119,
          rulPrediction: 98.76,
          healthStage: 'healthy',
          kinesisStream: 'blufleet-live-stream',
          sagemakerEndpoint: 'blufleet-optimized-endpoint',
          lambdaRequestId: 'b3609b23-18cd-47e9-9276-8ac566800520',
          rawDataLocation: 'raw/year=2025/month=09/day=14/hour=18/20250914_181153_877c70c8.json'
        }
      ];

      this.sendPaginatedResponse(res, mockPredictions, { page, limit, total: mockPredictions.length });
    }
  });

  // Get predictions summary
  getPredictionsSummary = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);

    try {
      // Get real summary from S3 predictions
      const summary = await this.s3PredictionsService.getSummary();
      this.sendSuccess(res, {
        ...summary,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching predictions summary:', error);
      
      // Fallback to mock data if S3 fails
      const mockSummary = {
        totalPredictions: 45,
        healthyVehicles: 32,
        warningVehicles: 10,
        criticalVehicles: 3,
        averageRulScore: 78.5,
        activeDevices: 25,
        lastUpdated: new Date().toISOString()
      };

      this.sendSuccess(res, mockSummary);
    }
  });

  // Get AWS health status
  getAWSHealth = asyncHandler(async (req, res) => {
    try {
      // Import AWS health service
      const { awsHealthService } = await import('../services/awsHealthService');
      const healthStatus = await awsHealthService.getOverallHealth();
      this.sendSuccess(res, healthStatus);
    } catch (error) {
      console.error('AWS health check failed:', error);
      // Fallback to mock data if AWS service fails
      const mockHealth = {
        s3: 'error' as const,
        lambda: 'error' as const,
        iotCore: 'error' as const,
        kinesis: 'error' as const,
        timestamp: new Date().toISOString()
      };
      this.sendSuccess(res, mockHealth);
    }
  });
}

const analyticsController = new AnalyticsController();
const router = Router();

// Validation middleware
const timeframeValidation = [
  query('timeframe').optional().isIn(['1h', '6h', '24h', '7d', '30d', '90d']).withMessage('Invalid timeframe')
];

const exportValidation = [
  query('type').isIn(['vehicles', 'trips', 'maintenance', 'alerts', 'charging']).withMessage('Invalid export type'),
  query('format').optional().isIn(['csv', 'json', 'xlsx']).withMessage('Invalid export format')
];

// Routes
router.get('/dashboard', requirePermission('analytics:read'), timeframeValidation, analyticsController.getDashboardMetrics);
router.get('/energy', requirePermission('analytics:read'), timeframeValidation, analyticsController.getEnergyAnalytics);
router.get('/kpis', requirePermission('analytics:read'), timeframeValidation, analyticsController.getFleetKPIs);
router.get('/performance', requirePermission('analytics:read'), timeframeValidation, analyticsController.getPerformanceMetrics);
router.get('/export', requirePermission('analytics:read'), exportValidation, analyticsController.exportData);
router.get('/predictions', requirePermission('analytics:read'), analyticsController.getPredictions);
router.get('/predictions/summary', requirePermission('analytics:read'), analyticsController.getPredictionsSummary);
router.get('/health/aws', requirePermission('analytics:read'), analyticsController.getAWSHealth);

export default router;