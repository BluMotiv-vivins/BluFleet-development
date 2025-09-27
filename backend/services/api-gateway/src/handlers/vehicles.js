const AWS = require('aws-sdk');
const { Pool } = require('pg');

// AWS Configuration
const timestream = new AWS.TimestreamQuery({
    region: process.env.AWS_REGION || 'us-east-1'
});

const iotData = new AWS.IotData({
    endpoint: process.env.IOT_ENDPOINT,
    region: process.env.AWS_REGION || 'us-east-1'
});

// PostgreSQL Configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    'Content-Type': 'application/json'
};

// Response helper
const response = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
});

// Error handler
const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    return response(500, {
        error: 'Internal server error',
        message: error.message,
        context
    });
};

// =============================================
// VEHICLE MANAGEMENT ENDPOINTS
// =============================================

/**
 * GET /api/vehicles
 * Retrieve all vehicles with optional filtering and pagination
 */
exports.getVehicles = async (event) => {
    try {
        const { queryStringParameters } = event;
        const {
            page = 1,
            limit = 50,
            status,
            vehicle_type,
            assigned_driver_id,
            search
        } = queryStringParameters || {};

        let query = `
            SELECT 
                v.*,
                d.first_name || ' ' || d.last_name as driver_name,
                d.email as driver_email,
                ST_X(v.home_depot_location) as depot_longitude,
                ST_Y(v.home_depot_location) as depot_latitude
            FROM vehicles v
            LEFT JOIN drivers d ON v.assigned_driver_id = d.driver_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;

        if (status) {
            query += ` AND v.status = $${++paramCount}`;
            params.push(status);
        }

        if (vehicle_type) {
            query += ` AND v.vehicle_type = $${++paramCount}`;
            params.push(vehicle_type);
        }

        if (assigned_driver_id) {
            query += ` AND v.assigned_driver_id = $${++paramCount}`;
            params.push(assigned_driver_id);
        }

        if (search) {
            query += ` AND (v.vin_number ILIKE $${++paramCount} OR v.make ILIKE $${paramCount} OR v.model ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // Count total records
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').replace(/LEFT JOIN.*/, '');
        const countResult = await pool.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count);

        // Add pagination
        query += ` ORDER BY v.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const result = await pool.query(query, params);

        // Get latest telemetry for each vehicle
        const vehicleIds = result.rows.map(v => v.vehicle_id);
        const telemetryData = await getLatestTelemetryForVehicles(vehicleIds);

        // Combine vehicle data with telemetry
        const vehiclesWithTelemetry = result.rows.map(vehicle => ({
            ...vehicle,
            telemetry: telemetryData[vehicle.vehicle_id] || {}
        }));

        return response(200, {
            vehicles: vehiclesWithTelemetry,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalRecords,
                totalPages: Math.ceil(totalRecords / parseInt(limit))
            }
        });
    } catch (error) {
        return handleError(error, 'getVehicles');
    }
};

/**
 * GET /api/vehicles/{vehicleId}
 * Retrieve specific vehicle details with latest telemetry
 */
exports.getVehicleById = async (event) => {
    try {
        const { vehicleId } = event.pathParameters;

        const query = `
            SELECT 
                v.*,
                d.first_name || ' ' || d.last_name as driver_name,
                d.email as driver_email,
                d.phone as driver_phone,
                d.license_number as driver_license,
                ST_X(v.home_depot_location) as depot_longitude,
                ST_Y(v.home_depot_location) as depot_latitude
            FROM vehicles v
            LEFT JOIN drivers d ON v.assigned_driver_id = d.driver_id
            WHERE v.vehicle_id = $1
        `;

        const result = await pool.query(query, [vehicleId]);

        if (result.rows.length === 0) {
            return response(404, { error: 'Vehicle not found' });
        }

        const vehicle = result.rows[0];

        // Get latest telemetry
        const telemetry = await getLatestTelemetryForVehicles([vehicleId]);
        vehicle.telemetry = telemetry[vehicleId] || {};

        // Get recent trips
        const tripsQuery = `
            SELECT * FROM vehicle_trips
            WHERE vehicle_id = $1
            ORDER BY planned_start_time DESC
            LIMIT 10
        `;
        const trips = await pool.query(tripsQuery, [vehicleId]);
        vehicle.recent_trips = trips.rows;

        // Get maintenance history
        const maintenanceQuery = `
            SELECT * FROM maintenance_records
            WHERE vehicle_id = $1
            ORDER BY scheduled_date DESC
            LIMIT 5
        `;
        const maintenance = await pool.query(maintenanceQuery, [vehicleId]);
        vehicle.maintenance_history = maintenance.rows;

        return response(200, vehicle);
    } catch (error) {
        return handleError(error, 'getVehicleById');
    }
};

/**
 * POST /api/vehicles
 * Create a new vehicle
 */
exports.createVehicle = async (event) => {
    try {
        const vehicleData = JSON.parse(event.body);
        
        const {
            vin_number,
            make,
            model,
            year,
            battery_capacity_kwh,
            max_charging_power_kw,
            vehicle_type,
            registration_date,
            assigned_driver_id,
            home_depot_location
        } = vehicleData;

        // Validate required fields
        if (!vin_number || !make || !model || !year || !battery_capacity_kwh || !max_charging_power_kw || !vehicle_type) {
            return response(400, { error: 'Missing required fields' });
        }

        // Check if VIN already exists
        const vinCheck = await pool.query('SELECT vehicle_id FROM vehicles WHERE vin_number = $1', [vin_number]);
        if (vinCheck.rows.length > 0) {
            return response(409, { error: 'Vehicle with this VIN already exists' });
        }

        const query = `
            INSERT INTO vehicles (
                vin_number, make, model, year, battery_capacity_kwh, 
                max_charging_power_kw, vehicle_type, registration_date,
                assigned_driver_id, home_depot_location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const depot_location = home_depot_location ? 
            `POINT(${home_depot_location.longitude} ${home_depot_location.latitude})` : null;

        const params = [
            vin_number, make, model, year, battery_capacity_kwh,
            max_charging_power_kw, vehicle_type, registration_date,
            assigned_driver_id, depot_location
        ];

        const result = await pool.query(query, params);
        
        return response(201, result.rows[0]);
    } catch (error) {
        return handleError(error, 'createVehicle');
    }
};

/**
 * PUT /api/vehicles/{vehicleId}
 * Update vehicle information
 */
exports.updateVehicle = async (event) => {
    try {
        const { vehicleId } = event.pathParameters;
        const updateData = JSON.parse(event.body);

        // Check if vehicle exists
        const existingVehicle = await pool.query('SELECT * FROM vehicles WHERE vehicle_id = $1', [vehicleId]);
        if (existingVehicle.rows.length === 0) {
            return response(404, { error: 'Vehicle not found' });
        }

        // Build dynamic update query
        const updateFields = [];
        const params = [vehicleId];
        let paramCount = 1;

        const allowedFields = [
            'make', 'model', 'year', 'battery_capacity_kwh', 'max_charging_power_kw',
            'vehicle_type', 'assigned_driver_id', 'status', 'last_service_date', 'warranty_expiry'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = $${++paramCount}`);
                params.push(updateData[field]);
            }
        });

        if (updateData.home_depot_location) {
            updateFields.push(`home_depot_location = ST_GeogFromText($${++paramCount})`);
            params.push(`POINT(${updateData.home_depot_location.longitude} ${updateData.home_depot_location.latitude})`);
        }

        if (updateFields.length === 0) {
            return response(400, { error: 'No valid fields to update' });
        }

        const query = `
            UPDATE vehicles 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE vehicle_id = $1
            RETURNING *
        `;

        const result = await pool.query(query, params);
        
        return response(200, result.rows[0]);
    } catch (error) {
        return handleError(error, 'updateVehicle');
    }
};

/**
 * DELETE /api/vehicles/{vehicleId}
 * Soft delete a vehicle (set status to retired)
 */
exports.deleteVehicle = async (event) => {
    try {
        const { vehicleId } = event.pathParameters;

        const query = `
            UPDATE vehicles 
            SET status = 'retired', updated_at = CURRENT_TIMESTAMP
            WHERE vehicle_id = $1
            RETURNING *
        `;

        const result = await pool.query(query, [vehicleId]);

        if (result.rows.length === 0) {
            return response(404, { error: 'Vehicle not found' });
        }

        return response(200, { message: 'Vehicle retired successfully', vehicle: result.rows[0] });
    } catch (error) {
        return handleError(error, 'deleteVehicle');
    }
};

// =============================================
// TELEMETRY HELPER FUNCTIONS
// =============================================

/**
 * Get latest telemetry data for vehicles from Timestream
 */
async function getLatestTelemetryForVehicles(vehicleIds) {
    if (!vehicleIds.length) return {};

    try {
        const vehicleIdList = vehicleIds.map(id => `'${id}'`).join(',');
        
        const query = `
            WITH latest_telemetry AS (
                SELECT 
                    vehicle_id,
                    measure_name,
                    measure_value::double as value,
                    time,
                    ROW_NUMBER() OVER (PARTITION BY vehicle_id, measure_name ORDER BY time DESC) as rn
                FROM blufleet_telemetry.vehicle_telemetry 
                WHERE vehicle_id IN (${vehicleIdList})
                    AND time > ago(1h)
                    AND measure_name IN (
                        'battery_soc_percentage', 'speed_kmh', 'power_consumption_kw',
                        'estimated_range_km', 'odometer_km', 'battery_temperature_celsius',
                        'motor_temperature_celsius', 'driver_behavior_score'
                    )
            )
            SELECT vehicle_id, measure_name, value, time
            FROM latest_telemetry
            WHERE rn = 1
        `;

        const result = await timestream.query({ QueryString: query }).promise();
        
        const telemetryData = {};
        
        result.Rows.forEach(row => {
            const vehicleId = row.Data[0].ScalarValue;
            const measureName = row.Data[1].ScalarValue;
            const value = parseFloat(row.Data[2].ScalarValue);
            const timestamp = row.Data[3].ScalarValue;

            if (!telemetryData[vehicleId]) {
                telemetryData[vehicleId] = {};
            }

            telemetryData[vehicleId][measureName] = {
                value,
                timestamp
            };
        });

        return telemetryData;
    } catch (error) {
        console.error('Error fetching telemetry data:', error);
        return {};
    }
}

/**
 * Get vehicle location from Timestream
 */
async function getVehicleLocation(vehicleId) {
    try {
        const query = `
            SELECT 
                latitude,
                longitude,
                altitude,
                time
            FROM blufleet_telemetry.vehicle_telemetry 
            WHERE vehicle_id = '${vehicleId}'
                AND measure_name = 'location'
                AND time > ago(15m)
            ORDER BY time DESC
            LIMIT 1
        `;

        const result = await timestream.query({ QueryString: query }).promise();
        
        if (result.Rows.length > 0) {
            const row = result.Rows[0];
            return {
                latitude: parseFloat(row.Data[0].ScalarValue),
                longitude: parseFloat(row.Data[1].ScalarValue),
                altitude: parseFloat(row.Data[2].ScalarValue),
                timestamp: row.Data[3].ScalarValue
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching vehicle location:', error);
        return null;
    }
}

module.exports = {
    getVehicles: exports.getVehicles,
    getVehicleById: exports.getVehicleById,
    createVehicle: exports.createVehicle,
    updateVehicle: exports.updateVehicle,
    deleteVehicle: exports.deleteVehicle,
    getLatestTelemetryForVehicles,
    getVehicleLocation
};
