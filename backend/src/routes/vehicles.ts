// Vehicle Management Routes for BluFleet Backend
// Version: 1.0.0

import { Router } from 'express';
import { body, query } from 'express-validator';
import { BaseController } from '../controllers/BaseController';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import VehicleRepository from '../repositories/VehicleRepository';

class VehicleController extends BaseController {
  // Get all vehicles with pagination and filtering
  getVehicles = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { page, limit } = this.getPaginationParams(req);
    const filters = this.buildFilters(req, ['status', 'fleetId', 'vehicleType', 'make', 'model']);
    
    // Use repository to get vehicles from database
    const result = await VehicleRepository.getVehicles(userContext.organizationId, {
      page,
      limit,
      ...filters
    });

    res.json({
      vehicles: result.vehicles,
      pagination: result.pagination
    });
  });

  // Get a single vehicle by ID
  getVehicleById = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { id } = req.params;

    // Get vehicle from database
    const vehicle = await VehicleRepository.getVehicleById(userContext.organizationId, id);
    
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    res.json(vehicle);
  });

  // Create a new vehicle
  createVehicle = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    
    // Extract validated vehicle data
    const vehicleData = {
      organizationId: userContext.organizationId,
      ...req.body
    };

    // Create vehicle in database
    const result = await VehicleRepository.createVehicle(vehicleData);

    res.status(201).json({ 
      message: 'Vehicle created successfully',
      id: result.id
    });
  });

  // Update a vehicle
  updateVehicle = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { id } = req.params;

    // Check if vehicle exists
    const vehicle = await VehicleRepository.getVehicleById(userContext.organizationId, id);
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    // Extract update data
    const updateData = req.body;

    // Update vehicle in database
    const result = await VehicleRepository.updateVehicle(id, userContext.organizationId, updateData);

    res.json({
      message: 'Vehicle updated successfully',
      id
    });
  });

  // Delete a vehicle
  deleteVehicle = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { id } = req.params;

    // Delete vehicle from database
    const result = await VehicleRepository.deleteVehicle(id, userContext.organizationId);

    if (!result) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    res.json({
      message: 'Vehicle deleted successfully',
      id
    });
  });

  // Get vehicle telemetry
  getVehicleTelemetry = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { id } = req.params;

    // Check if vehicle exists
    const vehicle = await VehicleRepository.getVehicleById(userContext.organizationId, id);
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    // Mock telemetry data for now (can be replaced with real data source later)
    const telemetry = {
      vehicleId: id,
      timestamp: new Date().toISOString(),
      location: vehicle.currentLocation,
      speed: Math.floor(Math.random() * 80),
      batterySoc: vehicle.currentBatterySoc,
      batteryTemperature: 25 + Math.floor(Math.random() * 15),
      powerUsage: 15 + Math.floor(Math.random() * 30),
      rangeEstimate: Math.floor(vehicle.maxRangeKm * (vehicle.currentBatterySoc / 100)),
      status: vehicle.status
    };

    res.json(telemetry);
  });

  // Get vehicle trips
  getVehicleTrips = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const { page, limit } = this.getPaginationParams(req);

    // Check if vehicle exists
    const vehicle = await VehicleRepository.getVehicleById(userContext.organizationId, id);
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    // TODO: Implement real trip data query using a TripRepository
    // For now, return mock data
    const mockTrips: any[] = [];
    const total = mockTrips.length;

    res.json({
      trips: mockTrips,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  });
}

const controller = new VehicleController();
const router = Router();

// Define routes
router.get('/',
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isString(),
  query('fleetId').optional().isUUID(),
  query('vehicleType').optional().isString(),
  query('make').optional().isString(),
  query('model').optional().isString(),
  requirePermission('vehicles:read'),
  controller.getVehicles
);

router.get('/:id',
  requirePermission('vehicles:read'),
  controller.getVehicleById
);

router.post('/',
  body('vin').isString().isLength({ min: 1, max: 17 }),
  body('licensePlate').isString().isLength({ min: 1, max: 20 }),
  body('make').isString().isLength({ min: 1, max: 100 }),
  body('model').isString().isLength({ min: 1, max: 100 }),
  body('year').isInt({ min: 1900, max: 2100 }),
  body('vehicleType').isString(),
  body('batteryCapacityKwh').optional().isFloat({ min: 0 }),
  body('maxRangeKm').optional().isInt({ min: 0 }),
  body('status').optional().isString(),
  body('fleetId').optional().isUUID(),
  requirePermission('vehicles:write'),
  controller.createVehicle
);

router.put('/:id',
  body('licensePlate').optional().isString().isLength({ min: 1, max: 20 }),
  body('status').optional().isString(),
  body('fleetId').optional().isUUID(),
  body('make').optional().isString().isLength({ min: 1, max: 100 }),
  body('model').optional().isString().isLength({ min: 1, max: 100 }),
  body('year').optional().isInt({ min: 1900, max: 2100 }),
  body('vehicleType').optional().isString(),
  body('batteryCapacityKwh').optional().isFloat({ min: 0 }),
  body('maxRangeKm').optional().isInt({ min: 0 }),
  body('currentLocation').optional().isObject(),
  body('currentBatterySoc').optional().isFloat({ min: 0, max: 100 }),
  body('currentBatterySoh').optional().isFloat({ min: 0, max: 100 }),
  body('odometerKm').optional().isInt({ min: 0 }),
  body('lastMaintenanceKm').optional().isInt({ min: 0 }),
  body('nextMaintenanceKm').optional().isInt({ min: 0 }),
  requirePermission('vehicles:write'),
  controller.updateVehicle
);

router.delete('/:id',
  requirePermission('vehicles:write'),
  controller.deleteVehicle
);

router.get('/:id/telemetry',
  requirePermission('vehicles:read'),
  controller.getVehicleTelemetry
);

router.get('/:id/trips',
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  requirePermission('vehicles:read'),
  controller.getVehicleTrips
);

export default router;