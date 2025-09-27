// Vehicle Repository
// Version: 1.0.0
// Handles database operations for vehicles using PostgreSQL

import db from '../utils/database';
import { logger } from '../utils/logger';

class VehicleRepository {
  // Get all vehicles with pagination and filtering
  async getVehicles(organizationId: string, options: any = {}) {
    const { 
      page = 1, 
      limit = 10,
      status,
      fleetId,
      vehicleType,
      make,
      model
    } = options;
    
    const offset = (page - 1) * limit;
    const params: any[] = [organizationId, limit, offset];
    let filterIndex = 3;
    
    let query = `
      SELECT 
        id, organization_id, fleet_id, vin, license_plate, 
        make, model, year, vehicle_type, battery_capacity_kwh,
        max_range_km, status, 
        ST_X(current_location::geometry) as longitude,
        ST_Y(current_location::geometry) as latitude,
        current_battery_soc, current_battery_soh,
        odometer_km, last_maintenance_km, next_maintenance_km,
        metadata, created_at, updated_at
      FROM vehicles
      WHERE organization_id = $1
    `;
    
    // Add filters
    if (status) {
      query += ` AND status = $${filterIndex}`;
      params.push(status);
      filterIndex++;
    }
    
    if (fleetId) {
      query += ` AND fleet_id = $${filterIndex}`;
      params.push(fleetId);
      filterIndex++;
    }
    
    if (vehicleType) {
      query += ` AND vehicle_type = $${filterIndex}`;
      params.push(vehicleType);
      filterIndex++;
    }
    
    if (make) {
      query += ` AND make = $${filterIndex}`;
      params.push(make);
      filterIndex++;
    }
    
    if (model) {
      query += ` AND model = $${filterIndex}`;
      params.push(model);
      filterIndex++;
    }
    
    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    
    try {
      // Get vehicles
      const result = await db.query(query, params);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM vehicles
        WHERE organization_id = $1
      `;
      const countResult = await db.query(countQuery, [organizationId]);
      const total = parseInt(countResult.rows[0].total);
      
      // Transform results
      const vehicles = result.rows.map(row => ({
        id: row.id,
        organizationId: row.organization_id,
        fleetId: row.fleet_id,
        vin: row.vin,
        licensePlate: row.license_plate,
        make: row.make,
        model: row.model,
        year: row.year,
        vehicleType: row.vehicle_type,
        batteryCapacityKwh: row.battery_capacity_kwh,
        maxRangeKm: row.max_range_km,
        status: row.status,
        currentLocation: { latitude: row.latitude, longitude: row.longitude },
        currentBatterySoc: row.current_battery_soc,
        currentBatterySoh: row.current_battery_soh,
        odometerKm: row.odometer_km,
        lastMaintenanceKm: row.last_maintenance_km,
        nextMaintenanceKm: row.next_maintenance_km,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      return {
        vehicles,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching vehicles from database', { error });
      throw error;
    }
  }
  
  // Get a single vehicle by ID
  async getVehicleById(organizationId: string, id: string) {
    const query = `
      SELECT 
        id, organization_id, fleet_id, vin, license_plate, 
        make, model, year, vehicle_type, battery_capacity_kwh,
        max_range_km, status, 
        ST_X(current_location::geometry) as longitude,
        ST_Y(current_location::geometry) as latitude,
        current_battery_soc, current_battery_soh,
        odometer_km, last_maintenance_km, next_maintenance_km,
        metadata, created_at, updated_at
      FROM vehicles
      WHERE organization_id = $1 AND id = $2
    `;
    
    try {
      const result = await db.query(query, [organizationId, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      
      return {
        id: row.id,
        organizationId: row.organization_id,
        fleetId: row.fleet_id,
        vin: row.vin,
        licensePlate: row.license_plate,
        make: row.make,
        model: row.model,
        year: row.year,
        vehicleType: row.vehicle_type,
        batteryCapacityKwh: row.battery_capacity_kwh,
        maxRangeKm: row.max_range_km,
        status: row.status,
        currentLocation: { latitude: row.latitude, longitude: row.longitude },
        currentBatterySoc: row.current_battery_soc,
        currentBatterySoh: row.current_battery_soh,
        odometerKm: row.odometer_km,
        lastMaintenanceKm: row.last_maintenance_km,
        nextMaintenanceKm: row.next_maintenance_km,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      logger.error('Error fetching vehicle from database', { error, id });
      throw error;
    }
  }
  
  // Create a new vehicle
  async createVehicle(vehicle: any) {
    const query = `
      INSERT INTO vehicles (
        id, organization_id, fleet_id, vin, license_plate,
        make, model, year, vehicle_type, battery_capacity_kwh,
        max_range_km, status, current_location, current_battery_soc,
        current_battery_soh, odometer_km, last_maintenance_km,
        next_maintenance_km, metadata
      ) VALUES (
        uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, ST_SetSRID(ST_MakePoint($12, $13), 4326), $14, $15, $16, $17, $18, $19
      )
      RETURNING id
    `;
    
    const values = [
      vehicle.organizationId,
      vehicle.fleetId,
      vehicle.vin,
      vehicle.licensePlate,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.vehicleType,
      vehicle.batteryCapacityKwh,
      vehicle.maxRangeKm,
      vehicle.status || 'active',
      vehicle.currentLocation?.longitude || 0,
      vehicle.currentLocation?.latitude || 0,
      vehicle.currentBatterySoc || 0,
      vehicle.currentBatterySoh || 100,
      vehicle.odometerKm || 0,
      vehicle.lastMaintenanceKm || 0,
      vehicle.nextMaintenanceKm || 5000,
      vehicle.metadata || {}
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating vehicle in database', { error, vehicle });
      throw error;
    }
  }
  
  // Update a vehicle
  async updateVehicle(id: string, organizationId: string, updates: any) {
    // Build dynamic query based on provided updates
    const updateFields: string[] = [];
    const values: any[] = [id, organizationId];
    let paramIndex = 3;
    
    // Process normal fields
    const fieldMap: Record<string, string> = {
      fleetId: 'fleet_id',
      licensePlate: 'license_plate',
      make: 'make',
      model: 'model',
      year: 'year',
      vehicleType: 'vehicle_type',
      batteryCapacityKwh: 'battery_capacity_kwh',
      maxRangeKm: 'max_range_km',
      status: 'status',
      currentBatterySoc: 'current_battery_soc',
      currentBatterySoh: 'current_battery_soh',
      odometerKm: 'odometer_km',
      lastMaintenanceKm: 'last_maintenance_km',
      nextMaintenanceKm: 'next_maintenance_km',
      metadata: 'metadata'
    };
    
    Object.entries(fieldMap).forEach(([jsField, dbField]) => {
      if (updates[jsField] !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(updates[jsField]);
        paramIndex++;
      }
    });
    
    // Handle location separately if provided
    if (updates.currentLocation) {
      updateFields.push(`current_location = ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)`);
      values.push(updates.currentLocation.longitude || 0);
      values.push(updates.currentLocation.latitude || 0);
      paramIndex += 2;
    }
    
    if (updateFields.length === 0) {
      return null; // No fields to update
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    const query = `
      UPDATE vehicles
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND organization_id = $2
      RETURNING id
    `;
    
    try {
      const result = await db.query(query, values);
      
      if (result.rowCount === 0) {
        return null; // No vehicle found or no update happened
      }
      
      return { id: result.rows[0].id };
    } catch (error) {
      logger.error('Error updating vehicle in database', { error, id, updates });
      throw error;
    }
  }
  
  // Delete a vehicle
  async deleteVehicle(id: string, organizationId: string) {
    const query = `
      DELETE FROM vehicles
      WHERE id = $1 AND organization_id = $2
      RETURNING id
    `;
    
    try {
      const result = await db.query(query, [id, organizationId]);
      
      if (result.rowCount === 0) {
        return null; // No vehicle found
      }
      
      return { id: result.rows[0].id };
    } catch (error) {
      logger.error('Error deleting vehicle from database', { error, id });
      throw error;
    }
  }
}

export default new VehicleRepository();
