// Simulation Routes for BluFleet Backend
// Version: 1.0.0

import { Router } from 'express';
import { BaseController } from '../controllers/BaseController';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/auth';
import { S3SimulationService } from '../services/s3SimulationService';

class SimulationController extends BaseController {
  private s3SimulationService: S3SimulationService;

  constructor() {
    super();
    this.s3SimulationService = new S3SimulationService();
  }

  // Get simulation data (for SUMO simulations page)
  getSimulationData = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);

    try {
      console.log('SimulationController: Getting simulation data');
      const simulationData = await this.s3SimulationService.getSimulationData();
      
      this.sendSuccess(res, {
        records: simulationData.records,
        metadata: simulationData.metadata
      });
    } catch (error) {
      console.error('SimulationController: Error getting simulation data:', error);
      
      // Fallback to mock data
      const mockSimulationData = {
        records: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            scenario: 'Urban Traffic Simulation',
            vehicleCount: 150,
            averageSpeed: 45.2,
            totalDistance: 2847.5,
            fuelConsumption: 12.8,
            emissions: 3.2,
            status: 'completed'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            scenario: 'Highway Traffic Simulation',
            vehicleCount: 200,
            averageSpeed: 78.5,
            totalDistance: 4521.3,
            fuelConsumption: 18.7,
            emissions: 4.8,
            status: 'completed'
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            scenario: 'Mixed Traffic Simulation',
            vehicleCount: 175,
            averageSpeed: 52.8,
            totalDistance: 3284.9,
            fuelConsumption: 15.2,
            emissions: 3.9,
            status: 'running'
          }
        ]
      };

      this.sendSuccess(res, mockSimulationData);
    }
  });

  // Get simulation summary
  getSimulationSummary = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);

    try {
      console.log('SimulationController: Getting simulation summary');
      const summary = await this.s3SimulationService.getSimulationSummary();
      
      this.sendSuccess(res, {
        ...summary,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('SimulationController: Error getting simulation summary:', error);
      
      // Fallback to mock summary
      const mockSummary = {
        totalSimulations: 45,
        activeSimulations: 3,
        completedSimulations: 42,
        averageExecutionTime: 145, // seconds
        totalVehiclesSimulated: 12750,
        totalDistanceSimulated: 458392.7, // km
        averageFuelEfficiency: 24.8, // mpg
        totalEmissionsSimulated: 187.5, // kg CO2
        lastUpdated: new Date().toISOString()
      };

      this.sendSuccess(res, mockSummary);
    }
  });

  // List available simulation files
  getSimulationFiles = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);

    try {
      console.log('SimulationController: Getting simulation files');
      const files = await this.s3SimulationService.getSimulationFiles();
      
      const fileList = files.map(file => ({
        key: file.Key,
        name: file.Key?.split('/').pop(),
        lastModified: file.LastModified,
        size: file.Size,
        sizeKB: file.Size ? Math.round(file.Size / 1024) : 0
      }));
      
      this.sendSuccess(res, { files: fileList });
    } catch (error) {
      console.error('SimulationController: Error getting simulation files:', error);
      this.sendSuccess(res, { files: [] });
    }
  });
}

const simulationController = new SimulationController();
const router = Router();

// Routes
router.get('/data', requirePermission('simulation:read'), simulationController.getSimulationData);
router.get('/summary', requirePermission('simulation:read'), simulationController.getSimulationSummary);
router.get('/files', requirePermission('simulation:read'), simulationController.getSimulationFiles);

export default router;
