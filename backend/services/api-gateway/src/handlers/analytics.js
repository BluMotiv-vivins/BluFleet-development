const AWS = require('aws-sdk');
const { Pool } = require('pg');

// AWS Configuration
const timestream = new AWS.TimestreamQuery({
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
// DASHBOARD ANALYTICS ENDPOINTS
// =============================================

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard analytics
 */
exports.getDashboardAnalytics = async (event) => {
    try {
        const { timeframe = '24h' } = event.queryStringParameters || {};
        
        // Get basic fleet statistics from PostgreSQL
        const fleetStatsQuery = `
            SELECT 
                COUNT(*) as total_vehicles,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_vehicles,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_vehicles,
                COUNT(CASE WHEN vehicle_type = 'delivery_van' THEN 1 END) as delivery_vans,
                COUNT(CASE WHEN vehicle_type = 'truck' THEN 1 END) as trucks,
                COUNT(CASE WHEN vehicle_type = 'passenger' THEN 1 END) as passenger_vehicles
            FROM vehicles
        `;
        
        const fleetStats = await pool.query(fleetStatsQuery);

        // Get driver statistics
        const driverStatsQuery = `
            SELECT 
                COUNT(*) as total_drivers,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_drivers
            FROM drivers
        `;
        
        const driverStats = await pool.query(driverStatsQuery);

        // Get today's trip statistics
        const tripStatsQuery = `
            SELECT 
                COUNT(*) as total_trips,
                COUNT(CASE WHEN trip_status = 'completed' THEN 1 END) as completed_trips,
                COUNT(CASE WHEN trip_status = 'in_progress' THEN 1 END) as active_trips,
                SUM(actual_distance_km) as total_distance,
                SUM(energy_consumed_kwh) as total_energy_consumed,
                AVG(route_efficiency_score) as avg_efficiency_score,
                COUNT(CASE WHEN on_time_delivery_status = true THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN trip_status = 'completed' THEN 1 END), 0) as on_time_percentage
            FROM vehicle_trips
            WHERE DATE(planned_start_time) = CURRENT_DATE
        `;
        
        const tripStats = await pool.query(tripStatsQuery);

        // Get charging statistics from PostgreSQL
        const chargingStatsQuery = `
            SELECT 
                COUNT(*) as active_charging_sessions,
                SUM(energy_consumed_kwh) as total_energy_charged_today,
                AVG(charging_cost) as avg_charging_cost
            FROM charging_sessions
            WHERE DATE(start_time) = CURRENT_DATE
                AND session_status = 'charging'
        `;
        
        const chargingStats = await pool.query(chargingStatsQuery);

        // Get real-time telemetry data from Timestream
        const telemetryTimeframe = getTimestreamTimeframe(timeframe);
        
        const batteryStatusQuery = `
            WITH latest_battery AS (
                SELECT 
                    vehicle_id,
                    measure_value::double as soc,
                    ROW_NUMBER() OVER (PARTITION BY vehicle_id ORDER BY time DESC) as rn
                FROM blufleet_telemetry.vehicle_telemetry 
                WHERE measure_name = 'battery_soc_percentage'
                    AND time > ago(15m)
            )
            SELECT 
                COUNT(*) as total_vehicles_reporting,
                AVG(soc) as avg_battery_soc,
                COUNT(CASE WHEN soc < 20 THEN 1 END) as low_battery_count,
                COUNT(CASE WHEN soc < 10 THEN 1 END) as critical_battery_count
            FROM latest_battery
            WHERE rn = 1
        `;

        let batteryStatus = {};
        try {
            const batteryResult = await timestream.query({ QueryString: batteryStatusQuery }).promise();
            if (batteryResult.Rows.length > 0) {
                const row = batteryResult.Rows[0];
                batteryStatus = {
                    vehicles_reporting: parseInt(row.Data[0].ScalarValue || 0),
                    avg_battery_soc: parseFloat(row.Data[1].ScalarValue || 0),
                    low_battery_alerts: parseInt(row.Data[2].ScalarValue || 0),
                    critical_battery_alerts: parseInt(row.Data[3].ScalarValue || 0)
                };
            }
        } catch (error) {
            console.error('Error fetching battery status from Timestream:', error);
            batteryStatus = {
                vehicles_reporting: 0,
                avg_battery_soc: 0,
                low_battery_alerts: 0,
                critical_battery_alerts: 0
            };
        }

        // Get energy consumption trends
        const energyTrendsQuery = `
            SELECT 
                bin(time, 1h) as hour,
                SUM(measure_value::double) as total_consumption
            FROM blufleet_telemetry.vehicle_telemetry 
            WHERE measure_name = 'power_consumption_kw'
                AND time > ago(${telemetryTimeframe})
            GROUP BY bin(time, 1h)
            ORDER BY hour DESC
            LIMIT 24
        `;

        let energyTrends = [];
        try {
            const energyResult = await timestream.query({ QueryString: energyTrendsQuery }).promise();
            energyTrends = energyResult.Rows.map(row => ({
                hour: row.Data[0].ScalarValue,
                consumption_kwh: parseFloat(row.Data[1].ScalarValue || 0)
            }));
        } catch (error) {
            console.error('Error fetching energy trends from Timestream:', error);
        }

        // Get driver behavior alerts
        const driverBehaviorQuery = `
            SELECT 
                COUNT(DISTINCT vehicle_id) as vehicles_with_alerts,
                SUM(CASE WHEN measure_name = 'harsh_acceleration_count' THEN measure_value::bigint ELSE 0 END) as total_harsh_accelerations,
                SUM(CASE WHEN measure_name = 'harsh_braking_count' THEN measure_value::bigint ELSE 0 END) as total_harsh_braking
            FROM blufleet_telemetry.vehicle_telemetry 
            WHERE measure_name IN ('harsh_acceleration_count', 'harsh_braking_count')
                AND time > ago(${telemetryTimeframe})
                AND measure_value::bigint > 0
        `;

        let driverBehaviorAlerts = {};
        try {
            const behaviorResult = await timestream.query({ QueryString: driverBehaviorQuery }).promise();
            if (behaviorResult.Rows.length > 0) {
                const row = behaviorResult.Rows[0];
                driverBehaviorAlerts = {
                    vehicles_with_alerts: parseInt(row.Data[0].ScalarValue || 0),
                    harsh_accelerations: parseInt(row.Data[1].ScalarValue || 0),
                    harsh_braking_events: parseInt(row.Data[2].ScalarValue || 0)
                };
            }
        } catch (error) {
            console.error('Error fetching driver behavior alerts from Timestream:', error);
            driverBehaviorAlerts = {
                vehicles_with_alerts: 0,
                harsh_accelerations: 0,
                harsh_braking_events: 0
            };
        }

        // Compile dashboard data
        const dashboardData = {
            timestamp: new Date().toISOString(),
            timeframe,
            fleet_overview: {
                total_vehicles: parseInt(fleetStats.rows[0].total_vehicles),
                active_vehicles: parseInt(fleetStats.rows[0].active_vehicles),
                maintenance_vehicles: parseInt(fleetStats.rows[0].maintenance_vehicles),
                vehicle_breakdown: {
                    delivery_vans: parseInt(fleetStats.rows[0].delivery_vans),
                    trucks: parseInt(fleetStats.rows[0].trucks),
                    passenger_vehicles: parseInt(fleetStats.rows[0].passenger_vehicles)
                }
            },
            driver_overview: {
                total_drivers: parseInt(driverStats.rows[0].total_drivers),
                active_drivers: parseInt(driverStats.rows[0].active_drivers)
            },
            operations_today: {
                total_trips: parseInt(tripStats.rows[0].total_trips || 0),
                completed_trips: parseInt(tripStats.rows[0].completed_trips || 0),
                active_trips: parseInt(tripStats.rows[0].active_trips || 0),
                total_distance_km: parseFloat(tripStats.rows[0].total_distance || 0),
                total_energy_consumed_kwh: parseFloat(tripStats.rows[0].total_energy_consumed || 0),
                avg_efficiency_score: parseFloat(tripStats.rows[0].avg_efficiency_score || 0),
                on_time_delivery_percentage: parseFloat(tripStats.rows[0].on_time_percentage || 0)
            },
            charging_overview: {
                active_charging_sessions: parseInt(chargingStats.rows[0].active_charging_sessions || 0),
                total_energy_charged_today_kwh: parseFloat(chargingStats.rows[0].total_energy_charged_today || 0),
                avg_charging_cost: parseFloat(chargingStats.rows[0].avg_charging_cost || 0)
            },
            battery_status: batteryStatus,
            energy_trends: energyTrends,
            alerts: {
                low_battery: batteryStatus.low_battery_alerts || 0,
                critical_battery: batteryStatus.critical_battery_alerts || 0,
                driver_behavior: driverBehaviorAlerts.vehicles_with_alerts || 0,
                maintenance_due: parseInt(fleetStats.rows[0].maintenance_vehicles || 0)
            },
            performance_metrics: {
                fleet_utilization: fleetStats.rows[0].active_vehicles > 0 ? 
                    ((tripStats.rows[0].active_trips || 0) / fleetStats.rows[0].active_vehicles * 100) : 0,
                avg_energy_efficiency: tripStats.rows[0].total_distance > 0 ?
                    (tripStats.rows[0].total_energy_consumed / tripStats.rows[0].total_distance) : 0,
                driver_behavior_score: driverBehaviorAlerts.vehicles_with_alerts > 0 ?
                    Math.max(0, 100 - (driverBehaviorAlerts.harsh_accelerations + driverBehaviorAlerts.harsh_braking_events) * 2) : 100
            }
        };

        return response(200, dashboardData);

    } catch (error) {
        return handleError(error, 'getDashboardAnalytics');
    }
};

/**
 * GET /api/analytics/fleet-health
 * Get comprehensive fleet health metrics
 */
exports.getFleetHealth = async (event) => {
    try {
        // Get vehicle health from PostgreSQL
        const vehicleHealthQuery = `
            SELECT 
                v.vehicle_id,
                v.vin_number,
                v.make,
                v.model,
                v.battery_capacity_kwh,
                v.status,
                EXTRACT(DAYS FROM CURRENT_DATE - v.last_service_date) as days_since_service,
                COUNT(m.maintenance_id) as open_maintenance_items
            FROM vehicles v
            LEFT JOIN maintenance_records m ON v.vehicle_id = m.vehicle_id 
                AND m.maintenance_status IN ('scheduled', 'in_progress')
            WHERE v.status = 'active'
            GROUP BY v.vehicle_id, v.vin_number, v.make, v.model, v.battery_capacity_kwh, v.status, v.last_service_date
        `;

        const vehicleHealth = await pool.query(vehicleHealthQuery);

        // Get battery health from Timestream
        const batteryHealthQuery = `
            WITH battery_health AS (
                SELECT 
                    vehicle_id,
                    measure_name,
                    measure_value::double as value,
                    time,
                    ROW_NUMBER() OVER (PARTITION BY vehicle_id, measure_name ORDER BY time DESC) as rn
                FROM blufleet_telemetry.vehicle_telemetry 
                WHERE measure_name IN ('battery_soc_percentage', 'battery_temperature_celsius', 'battery_voltage')
                    AND time > ago(1h)
            )
            SELECT vehicle_id, measure_name, value
            FROM battery_health
            WHERE rn = 1
        `;

        let batteryHealthData = {};
        try {
            const batteryResult = await timestream.query({ QueryString: batteryHealthQuery }).promise();
            batteryResult.Rows.forEach(row => {
                const vehicleId = row.Data[0].ScalarValue;
                const measureName = row.Data[1].ScalarValue;
                const value = parseFloat(row.Data[2].ScalarValue);

                if (!batteryHealthData[vehicleId]) {
                    batteryHealthData[vehicleId] = {};
                }
                batteryHealthData[vehicleId][measureName] = value;
            });
        } catch (error) {
            console.error('Error fetching battery health from Timestream:', error);
        }

        // Calculate health scores
        const fleetHealthData = vehicleHealth.rows.map(vehicle => {
            const batteryData = batteryHealthData[vehicle.vehicle_id] || {};
            
            // Calculate health score (0-100)
            let healthScore = 100;
            
            // Reduce score based on maintenance issues
            if (vehicle.open_maintenance_items > 0) {
                healthScore -= vehicle.open_maintenance_items * 10;
            }
            
            // Reduce score based on service overdue
            if (vehicle.days_since_service > 90) {
                healthScore -= (vehicle.days_since_service - 90) * 0.5;
            }
            
            // Reduce score based on battery issues
            if (batteryData.battery_temperature_celsius > 45) {
                healthScore -= 15; // High battery temperature
            }
            
            if (batteryData.battery_soc_percentage < 20) {
                healthScore -= 10; // Low battery
            }

            healthScore = Math.max(0, Math.min(100, healthScore));

            // Determine health status
            let healthStatus = 'excellent';
            if (healthScore < 90) healthStatus = 'good';
            if (healthScore < 75) healthStatus = 'fair';
            if (healthScore < 60) healthStatus = 'poor';
            if (healthScore < 40) healthStatus = 'critical';

            return {
                vehicle_id: vehicle.vehicle_id,
                vin_number: vehicle.vin_number,
                make: vehicle.make,
                model: vehicle.model,
                battery_capacity_kwh: vehicle.battery_capacity_kwh,
                health_score: Math.round(healthScore),
                health_status: healthStatus,
                days_since_service: vehicle.days_since_service,
                open_maintenance_items: vehicle.open_maintenance_items,
                battery_metrics: {
                    soc_percentage: batteryData.battery_soc_percentage || null,
                    temperature_celsius: batteryData.battery_temperature_celsius || null,
                    voltage: batteryData.battery_voltage || null
                },
                alerts: [
                    ...(vehicle.open_maintenance_items > 0 ? [`${vehicle.open_maintenance_items} open maintenance items`] : []),
                    ...(vehicle.days_since_service > 90 ? [`Service overdue by ${vehicle.days_since_service - 90} days`] : []),
                    ...((batteryData.battery_temperature_celsius || 0) > 45 ? ['High battery temperature'] : []),
                    ...((batteryData.battery_soc_percentage || 100) < 20 ? ['Low battery charge'] : [])
                ]
            };
        });

        // Calculate fleet health summary
        const healthSummary = {
            total_vehicles: fleetHealthData.length,
            excellent: fleetHealthData.filter(v => v.health_status === 'excellent').length,
            good: fleetHealthData.filter(v => v.health_status === 'good').length,
            fair: fleetHealthData.filter(v => v.health_status === 'fair').length,
            poor: fleetHealthData.filter(v => v.health_status === 'poor').length,
            critical: fleetHealthData.filter(v => v.health_status === 'critical').length,
            avg_health_score: fleetHealthData.length > 0 ? 
                Math.round(fleetHealthData.reduce((sum, v) => sum + v.health_score, 0) / fleetHealthData.length) : 0
        };

        return response(200, {
            timestamp: new Date().toISOString(),
            fleet_health_summary: healthSummary,
            vehicle_health_details: fleetHealthData.sort((a, b) => a.health_score - b.health_score) // Worst first
        });

    } catch (error) {
        return handleError(error, 'getFleetHealth');
    }
};

/**
 * GET /api/analytics/energy-efficiency
 * Get energy efficiency analytics
 */
exports.getEnergyEfficiency = async (event) => {
    try {
        const { timeframe = '7d', granularity = '1h' } = event.queryStringParameters || {};
        
        const telemetryTimeframe = getTimestreamTimeframe(timeframe);
        
        // Get energy consumption trends
        const energyTrendsQuery = `
            SELECT 
                bin(time, ${granularity}) as time_bucket,
                SUM(measure_value::double) as total_consumption_kwh,
                AVG(measure_value::double) as avg_consumption_kw,
                COUNT(DISTINCT vehicle_id) as active_vehicles
            FROM blufleet_telemetry.vehicle_telemetry 
            WHERE measure_name = 'power_consumption_kw'
                AND time > ago(${telemetryTimeframe})
            GROUP BY bin(time, ${granularity})
            ORDER BY time_bucket DESC
        `;

        let energyTrends = [];
        try {
            const trendsResult = await timestream.query({ QueryString: energyTrendsQuery }).promise();
            energyTrends = trendsResult.Rows.map(row => ({
                timestamp: row.Data[0].ScalarValue,
                total_consumption_kwh: parseFloat(row.Data[1].ScalarValue || 0),
                avg_consumption_kw: parseFloat(row.Data[2].ScalarValue || 0),
                active_vehicles: parseInt(row.Data[3].ScalarValue || 0)
            }));
        } catch (error) {
            console.error('Error fetching energy trends:', error);
        }

        // Get efficiency by vehicle
        const vehicleEfficiencyQuery = `
            WITH vehicle_metrics AS (
                SELECT 
                    vehicle_id,
                    measure_name,
                    AVG(measure_value::double) as avg_value
                FROM blufleet_telemetry.vehicle_telemetry 
                WHERE measure_name IN ('power_consumption_kw', 'speed_kmh')
                    AND time > ago(${telemetryTimeframe})
                    AND measure_value::double > 0
                GROUP BY vehicle_id, measure_name
            )
            SELECT 
                v1.vehicle_id,
                v1.avg_value as avg_power_consumption,
                v2.avg_value as avg_speed
            FROM vehicle_metrics v1
            JOIN vehicle_metrics v2 ON v1.vehicle_id = v2.vehicle_id
            WHERE v1.measure_name = 'power_consumption_kw'
                AND v2.measure_name = 'speed_kmh'
        `;

        let vehicleEfficiency = [];
        try {
            const efficiencyResult = await timestream.query({ QueryString: vehicleEfficiencyQuery }).promise();
            vehicleEfficiency = efficiencyResult.Rows.map(row => {
                const vehicleId = row.Data[0].ScalarValue;
                const avgPowerConsumption = parseFloat(row.Data[1].ScalarValue);
                const avgSpeed = parseFloat(row.Data[2].ScalarValue);
                
                // Calculate efficiency (kWh per 100km)
                const efficiencyPer100km = avgSpeed > 0 ? (avgPowerConsumption / avgSpeed) * 100 : 0;
                
                return {
                    vehicle_id: vehicleId,
                    avg_power_consumption_kw: avgPowerConsumption,
                    avg_speed_kmh: avgSpeed,
                    efficiency_kwh_per_100km: Math.round(efficiencyPer100km * 100) / 100
                };
            });
        } catch (error) {
            console.error('Error fetching vehicle efficiency:', error);
        }

        // Get trip-based efficiency from PostgreSQL
        const tripEfficiencyQuery = `
            SELECT 
                v.make,
                v.model,
                v.vehicle_type,
                COUNT(t.trip_id) as total_trips,
                AVG(t.actual_distance_km) as avg_distance,
                AVG(t.energy_consumed_kwh) as avg_energy_consumed,
                AVG(CASE WHEN t.actual_distance_km > 0 
                     THEN t.energy_consumed_kwh / t.actual_distance_km * 100 
                     ELSE 0 END) as avg_efficiency_kwh_per_100km
            FROM vehicles v
            JOIN vehicle_trips t ON v.vehicle_id = t.vehicle_id
            WHERE t.trip_status = 'completed'
                AND t.actual_end_time >= CURRENT_DATE - INTERVAL '${timeframe.replace('d', ' days').replace('h', ' hours')}'
                AND t.energy_consumed_kwh > 0
                AND t.actual_distance_km > 0
            GROUP BY v.make, v.model, v.vehicle_type
            ORDER BY avg_efficiency_kwh_per_100km ASC
        `;

        const tripEfficiency = await pool.query(tripEfficiencyQuery);

        return response(200, {
            timestamp: new Date().toISOString(),
            timeframe,
            granularity,
            energy_trends: energyTrends,
            vehicle_efficiency: vehicleEfficiency.sort((a, b) => a.efficiency_kwh_per_100km - b.efficiency_kwh_per_100km),
            efficiency_by_model: tripEfficiency.rows,
            summary: {
                total_consumption_kwh: energyTrends.reduce((sum, t) => sum + t.total_consumption_kwh, 0),
                avg_fleet_efficiency: vehicleEfficiency.length > 0 ?
                    Math.round((vehicleEfficiency.reduce((sum, v) => sum + v.efficiency_kwh_per_100km, 0) / vehicleEfficiency.length) * 100) / 100 : 0,
                most_efficient_vehicle: vehicleEfficiency.length > 0 ? vehicleEfficiency[0] : null,
                least_efficient_vehicle: vehicleEfficiency.length > 0 ? vehicleEfficiency[vehicleEfficiency.length - 1] : null
            }
        });

    } catch (error) {
        return handleError(error, 'getEnergyEfficiency');
    }
};

// Helper function to convert timeframe to Timestream format
function getTimestreamTimeframe(timeframe) {
    const timeframeMap = {
        '1h': '1h',
        '6h': '6h',
        '24h': '24h',
        '7d': '7d',
        '30d': '30d'
    };
    
    return timeframeMap[timeframe] || '24h';
}

module.exports = {
    getDashboardAnalytics: exports.getDashboardAnalytics,
    getFleetHealth: exports.getFleetHealth,
    getEnergyEfficiency: exports.getEnergyEfficiency
};
