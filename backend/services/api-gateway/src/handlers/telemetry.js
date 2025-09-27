const AWS = require('aws-sdk');
const { Pool } = require('pg');

// AWS Configuration
const timestream = new AWS.TimestreamQuery({
    region: process.env.AWS_REGION || 'us-east-1'
});

const timestreamWrite = new AWS.TimestreamWrite({
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
// TELEMETRY DATA INGESTION
// =============================================

/**
 * POST /api/telemetry/ingest
 * Ingest real-time telemetry data from vehicles
 */
exports.ingestTelemetry = async (event) => {
    try {
        const telemetryData = JSON.parse(event.body);
        
        // Validate required fields
        if (!telemetryData.vehicle_id || !telemetryData.timestamp || !telemetryData.data) {
            return response(400, { error: 'Missing required fields: vehicle_id, timestamp, data' });
        }

        const { vehicle_id, timestamp, data, driver_id, route_id, trip_id } = telemetryData;

        // Verify vehicle exists
        const vehicleCheck = await pool.query(
            'SELECT vehicle_id, vin_number FROM vehicles WHERE vehicle_id = $1 AND status = $2',
            [vehicle_id, 'active']
        );

        if (vehicleCheck.rows.length === 0) {
            return response(404, { error: 'Vehicle not found or not active' });
        }

        const vehicle = vehicleCheck.rows[0];

        // Prepare Timestream records
        const records = [];
        const currentTime = new Date(timestamp).getTime().toString();

        // Common dimensions for all records
        const baseDimensions = [
            { Name: 'vehicle_id', Value: vehicle_id },
            { Name: 'vehicle_vin', Value: vehicle.vin_number },
            { Name: 'timestamp_source', Value: data.timestamp_source || 'vehicle_sensor' },
            { Name: 'data_quality', Value: data.data_quality || 'high' }
        ];

        if (driver_id) baseDimensions.push({ Name: 'driver_id', Value: driver_id });
        if (route_id) baseDimensions.push({ Name: 'route_id', Value: route_id });
        if (trip_id) baseDimensions.push({ Name: 'trip_id', Value: trip_id });

        // Battery metrics
        if (data.battery) {
            const { soc_percentage, voltage, temperature_celsius, estimated_range_km } = data.battery;
            
            if (soc_percentage !== undefined) {
                records.push({
                    Time: currentTime,
                    TimeUnit: 'MILLISECONDS',
                    MeasureName: 'battery_soc_percentage',
                    MeasureValue: soc_percentage.toString(),
                    MeasureValueType: 'DOUBLE',
                    Dimensions: [...baseDimensions]
                });
            }

            if (voltage !== undefined) {
                records.push({
                    Time: currentTime,
                    TimeUnit: 'MILLISECONDS',
                    MeasureName: 'battery_voltage',
                    MeasureValue: voltage.toString(),
                    MeasureValueType: 'DOUBLE',
                    Dimensions: [...baseDimensions]
                });
            }

            if (temperature_celsius !== undefined) {
                records.push({
                    Time: currentTime,
                    TimeUnit: 'MILLISECONDS',
                    MeasureName: 'battery_temperature_celsius',
                    MeasureValue: temperature_celsius.toString(),
                    MeasureValueType: 'DOUBLE',
                    Dimensions: [...baseDimensions]
                });
            }

            if (estimated_range_km !== undefined) {
                records.push({
                    Time: currentTime,
                    TimeUnit: 'MILLISECONDS',
                    MeasureName: 'estimated_range_km',
                    MeasureValue: estimated_range_km.toString(),
                    MeasureValueType: 'DOUBLE',
                    Dimensions: [...baseDimensions]
                });
            }
        }

        // Location data
        if (data.location) {
            const { latitude, longitude, altitude, gps_accuracy } = data.location;
            
            const locationDimensions = [
                ...baseDimensions,
                { Name: 'latitude', Value: latitude.toString() },
                { Name: 'longitude', Value: longitude.toString() }
            ];

            if (altitude !== undefined) {
                locationDimensions.push({ Name: 'altitude', Value: altitude.toString() });
            }

            if (gps_accuracy !== undefined) {
                locationDimensions.push({ Name: 'gps_accuracy', Value: gps_accuracy.toString() });
            }

            records.push({
                Time: currentTime,
                TimeUnit: 'MILLISECONDS',
                MeasureName: 'location',
                MeasureValueType: 'DOUBLE',
                Dimensions: locationDimensions
            });
        }

        // Performance metrics
        if (data.performance) {
            const {
                speed_kmh,
                power_consumption_kw,
                regenerative_braking_power_kw,
                motor_temperature_celsius,
                odometer_km,
                trip_distance_km,
                energy_efficiency_kwh_per_km
            } = data.performance;

            const performanceMetrics = {
                speed_kmh,
                power_consumption_kw,
                regenerative_braking_power_kw,
                motor_temperature_celsius,
                odometer_km,
                trip_distance_km,
                energy_efficiency_kwh_per_km
            };

            Object.entries(performanceMetrics).forEach(([metric, value]) => {
                if (value !== undefined) {
                    records.push({
                        Time: currentTime,
                        TimeUnit: 'MILLISECONDS',
                        MeasureName: metric,
                        MeasureValue: value.toString(),
                        MeasureValueType: 'DOUBLE',
                        Dimensions: [...baseDimensions]
                    });
                }
            });
        }

        // Driver behavior metrics
        if (data.driver_behavior) {
            const {
                harsh_acceleration_count,
                harsh_braking_count,
                idle_time_minutes,
                driver_behavior_score,
                speeding_violations
            } = data.driver_behavior;

            const behaviorMetrics = {
                harsh_acceleration_count,
                harsh_braking_count,
                idle_time_minutes,
                driver_behavior_score,
                speeding_violations
            };

            Object.entries(behaviorMetrics).forEach(([metric, value]) => {
                if (value !== undefined) {
                    records.push({
                        Time: currentTime,
                        TimeUnit: 'MILLISECONDS',
                        MeasureName: metric,
                        MeasureValue: value.toString(),
                        MeasureValueType: value === parseInt(value) ? 'BIGINT' : 'DOUBLE',
                        Dimensions: [...baseDimensions]
                    });
                }
            });
        }

        // Charging status
        if (data.charging) {
            const { status, power_kw, station_id } = data.charging;
            
            const chargingDimensions = [...baseDimensions];
            if (status) chargingDimensions.push({ Name: 'charging_status', Value: status });
            if (station_id) chargingDimensions.push({ Name: 'charging_station_id', Value: station_id });

            if (power_kw !== undefined) {
                records.push({
                    Time: currentTime,
                    TimeUnit: 'MILLISECONDS',
                    MeasureName: 'charging_power_kw',
                    MeasureValue: power_kw.toString(),
                    MeasureValueType: 'DOUBLE',
                    Dimensions: chargingDimensions
                });
            }
        }

        // Environmental context
        if (data.environment) {
            const { temperature_celsius, weather_condition } = data.environment;
            
            const envDimensions = [...baseDimensions];
            if (weather_condition) envDimensions.push({ Name: 'weather_condition', Value: weather_condition });

            if (temperature_celsius !== undefined) {
                records.push({
                    Time: currentTime,
                    TimeUnit: 'MILLISECONDS',
                    MeasureName: 'ambient_temperature_celsius',
                    MeasureValue: temperature_celsius.toString(),
                    MeasureValueType: 'DOUBLE',
                    Dimensions: envDimensions
                });
            }
        }

        // Write to Timestream
        if (records.length > 0) {
            const params = {
                DatabaseName: 'blufleet_telemetry',
                TableName: 'vehicle_telemetry',
                Records: records
            };

            await timestreamWrite.writeRecords(params).promise();
        }

        // Update vehicle's last seen timestamp in PostgreSQL
        await pool.query(
            'UPDATE vehicles SET updated_at = CURRENT_TIMESTAMP WHERE vehicle_id = $1',
            [vehicle_id]
        );

        return response(200, {
            message: 'Telemetry data ingested successfully',
            records_written: records.length,
            vehicle_id
        });

    } catch (error) {
        return handleError(error, 'ingestTelemetry');
    }
};

/**
 * GET /api/telemetry/vehicles/{vehicleId}/latest
 * Get latest telemetry data for a specific vehicle
 */
exports.getLatestTelemetry = async (event) => {
    try {
        const { vehicleId } = event.pathParameters;
        const { metrics } = event.queryStringParameters || {};

        // Default metrics if not specified
        const requestedMetrics = metrics ? metrics.split(',') : [
            'battery_soc_percentage',
            'speed_kmh',
            'power_consumption_kw',
            'estimated_range_km',
            'battery_temperature_celsius',
            'motor_temperature_celsius',
            'driver_behavior_score'
        ];

        const metricsString = requestedMetrics.map(m => `'${m}'`).join(',');

        const query = `
            WITH latest_telemetry AS (
                SELECT 
                    measure_name,
                    measure_value::double as value,
                    time,
                    ROW_NUMBER() OVER (PARTITION BY measure_name ORDER BY time DESC) as rn
                FROM blufleet_telemetry.vehicle_telemetry 
                WHERE vehicle_id = '${vehicleId}'
                    AND time > ago(1h)
                    AND measure_name IN (${metricsString})
            )
            SELECT measure_name, value, time
            FROM latest_telemetry
            WHERE rn = 1
        `;

        const result = await timestream.query({ QueryString: query }).promise();
        
        const telemetryData = {};
        
        result.Rows.forEach(row => {
            const measureName = row.Data[0].ScalarValue;
            const value = parseFloat(row.Data[1].ScalarValue);
            const timestamp = row.Data[2].ScalarValue;

            telemetryData[measureName] = {
                value,
                timestamp
            };
        });

        // Get latest location
        const locationQuery = `
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

        const locationResult = await timestream.query({ QueryString: locationQuery }).promise();
        
        if (locationResult.Rows.length > 0) {
            const row = locationResult.Rows[0];
            telemetryData.location = {
                latitude: parseFloat(row.Data[0].ScalarValue),
                longitude: parseFloat(row.Data[1].ScalarValue),
                altitude: row.Data[2].ScalarValue ? parseFloat(row.Data[2].ScalarValue) : null,
                timestamp: row.Data[3].ScalarValue
            };
        }

        return response(200, {
            vehicle_id: vehicleId,
            telemetry: telemetryData,
            last_updated: new Date().toISOString()
        });

    } catch (error) {
        return handleError(error, 'getLatestTelemetry');
    }
};

/**
 * GET /api/telemetry/vehicles/{vehicleId}/history
 * Get historical telemetry data for a specific vehicle
 */
exports.getTelemetryHistory = async (event) => {
    try {
        const { vehicleId } = event.pathParameters;
        const {
            startTime,
            endTime,
            metrics = 'battery_soc_percentage,speed_kmh,power_consumption_kw',
            interval = '5m'
        } = event.queryStringParameters || {};

        // Default to last 24 hours if no time range specified
        const start = startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const end = endTime || new Date().toISOString();

        const requestedMetrics = metrics.split(',');
        const metricsString = requestedMetrics.map(m => `'${m}'`).join(',');

        const query = `
            SELECT 
                bin(time, ${interval}) as time_bucket,
                measure_name,
                AVG(measure_value::double) as avg_value,
                MIN(measure_value::double) as min_value,
                MAX(measure_value::double) as max_value,
                COUNT(*) as data_points
            FROM blufleet_telemetry.vehicle_telemetry 
            WHERE vehicle_id = '${vehicleId}'
                AND time BETWEEN '${start}' AND '${end}'
                AND measure_name IN (${metricsString})
            GROUP BY bin(time, ${interval}), measure_name
            ORDER BY time_bucket ASC, measure_name
        `;

        const result = await timestream.query({ QueryString: query }).promise();
        
        const historyData = {};
        
        result.Rows.forEach(row => {
            const timeBucket = row.Data[0].ScalarValue;
            const measureName = row.Data[1].ScalarValue;
            const avgValue = parseFloat(row.Data[2].ScalarValue);
            const minValue = parseFloat(row.Data[3].ScalarValue);
            const maxValue = parseFloat(row.Data[4].ScalarValue);
            const dataPoints = parseInt(row.Data[5].ScalarValue);

            if (!historyData[measureName]) {
                historyData[measureName] = [];
            }

            historyData[measureName].push({
                timestamp: timeBucket,
                avg_value: avgValue,
                min_value: minValue,
                max_value: maxValue,
                data_points: dataPoints
            });
        });

        return response(200, {
            vehicle_id: vehicleId,
            time_range: { start, end },
            interval,
            metrics: requestedMetrics,
            history: historyData
        });

    } catch (error) {
        return handleError(error, 'getTelemetryHistory');
    }
};

/**
 * GET /api/telemetry/fleet/realtime
 * Get real-time telemetry data for all active vehicles
 */
exports.getFleetRealtime = async (event) => {
    try {
        const { metrics = 'battery_soc_percentage,speed_kmh,power_consumption_kw' } = event.queryStringParameters || {};
        
        const requestedMetrics = metrics.split(',');
        const metricsString = requestedMetrics.map(m => `'${m}'`).join(',');

        const query = `
            SELECT 
                vehicle_id,
                measure_name,
                measure_value::double as value,
                time
            FROM blufleet_telemetry.vehicle_telemetry 
            WHERE time > ago(5m)
                AND measure_name IN (${metricsString})
            ORDER BY vehicle_id, measure_name, time DESC
        `;

        const result = await timestream.query({ QueryString: query }).promise();
        
        const fleetData = {};
        const processedVehicles = new Set();
        
        result.Rows.forEach(row => {
            const vehicleId = row.Data[0].ScalarValue;
            const measureName = row.Data[1].ScalarValue;
            const value = parseFloat(row.Data[2].ScalarValue);
            const timestamp = row.Data[3].ScalarValue;

            const key = `${vehicleId}-${measureName}`;
            
            // Only take the latest value for each vehicle-metric combination
            if (!processedVehicles.has(key)) {
                if (!fleetData[vehicleId]) {
                    fleetData[vehicleId] = {};
                }

                fleetData[vehicleId][measureName] = {
                    value,
                    timestamp
                };

                processedVehicles.add(key);
            }
        });

        return response(200, {
            timestamp: new Date().toISOString(),
            vehicle_count: Object.keys(fleetData).length,
            metrics: requestedMetrics,
            fleet_data: fleetData
        });

    } catch (error) {
        return handleError(error, 'getFleetRealtime');
    }
};

module.exports = {
    ingestTelemetry: exports.ingestTelemetry,
    getLatestTelemetry: exports.getLatestTelemetry,
    getTelemetryHistory: exports.getTelemetryHistory,
    getFleetRealtime: exports.getFleetRealtime
};
