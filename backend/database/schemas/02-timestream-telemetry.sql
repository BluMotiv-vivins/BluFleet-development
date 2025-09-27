-- TimeStream Schema for Real-time Telemetry Data
-- This file documents the Amazon Timestream database structure for BluFleet EV telemetry

-- TIMESTREAM DATABASE: blufleet_telemetry
-- TIMESTREAM TABLE: vehicle_telemetry

-- =============================================
-- VEHICLE TELEMETRY DATA STRUCTURE
-- =============================================

/*
Timestream Table: vehicle_telemetry
- Time dimension: timestamp (default time column)
- Measure name: Various telemetry metrics
- Measure value: Numeric values for telemetry data
- Dimensions: vehicle_id, driver_id, route_id, etc.

Sample records structure:

Record 1 - Battery Data:
{
  "time": "2024-09-24T10:30:00.000Z",
  "measure_name": "battery_soc_percentage",
  "measure_value": 85.5,
  "dimensions": {
    "vehicle_id": "vehicle-uuid-123",
    "driver_id": "driver-uuid-456",
    "route_id": "route-uuid-789",
    "vehicle_vin": "1FTFW1E58DFC12345"
  }
}

Record 2 - Location Data:
{
  "time": "2024-09-24T10:30:00.000Z",
  "measure_name": "location",
  "measure_value": null,
  "dimensions": {
    "vehicle_id": "vehicle-uuid-123",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "altitude": "10.5"
  }
}

Record 3 - Performance Metrics:
{
  "time": "2024-09-24T10:30:00.000Z",
  "measure_name": "energy_consumption",
  "measure_value": 2.5,
  "dimensions": {
    "vehicle_id": "vehicle-uuid-123",
    "metric_type": "power_consumption_kw"
  }
}
*/

-- =============================================
-- MEASURE NAMES (TELEMETRY METRICS)
-- =============================================

/*
Battery Metrics:
- battery_soc_percentage (0-100)
- battery_voltage (volts)
- battery_temperature_celsius
- estimated_range_km
- charging_power_kw (when charging)
- regenerative_braking_power_kw

Performance Metrics:
- speed_kmh
- power_consumption_kw
- motor_temperature_celsius
- odometer_km
- trip_distance_km
- energy_efficiency_kwh_per_km

Driver Behavior:
- harsh_acceleration_count (cumulative for trip)
- harsh_braking_count (cumulative for trip)
- idle_time_minutes (cumulative for trip)
- driver_behavior_score (0-100)

Operational Status:
- charging_status (dimensions: status=charging|discharging|idle)
- geofence_violations (count)
- vehicle_status (dimensions: status=active|maintenance|emergency)
*/

-- =============================================
-- COMMON DIMENSIONS
-- =============================================

/*
Core Dimensions (always present):
- vehicle_id: UUID from PostgreSQL vehicles table
- timestamp_source: 'vehicle_sensor' | 'iot_gateway' | 'mobile_app'
- data_quality: 'high' | 'medium' | 'low'

Location Dimensions:
- latitude: Decimal degrees
- longitude: Decimal degrees  
- altitude: Meters above sea level
- gps_accuracy: Meters

Trip Context:
- driver_id: UUID from PostgreSQL drivers table
- route_id: UUID from PostgreSQL routes table (if on planned route)
- trip_id: UUID from PostgreSQL vehicle_trips table

Vehicle Context:
- vehicle_vin: VIN number for cross-reference
- vehicle_make: Make of vehicle
- vehicle_model: Model of vehicle
- battery_capacity_kwh: Total battery capacity

Operational Context:
- charging_station_id: UUID when at charging station
- geofence_id: UUID when inside geofence
- weather_condition: 'clear' | 'rain' | 'snow' | 'fog'
- temperature_celsius: Ambient temperature
*/

-- =============================================
-- SAMPLE TIMESTREAM QUERIES
-- =============================================

/*
1. Get latest telemetry for all vehicles:
SELECT 
    vehicle_id,
    measure_name,
    measure_value::double,
    time
FROM blufleet_telemetry.vehicle_telemetry 
WHERE time > ago(5m)
ORDER BY time DESC

2. Get battery status for specific vehicle:
SELECT 
    time,
    measure_value::double as battery_soc
FROM blufleet_telemetry.vehicle_telemetry 
WHERE vehicle_id = 'vehicle-uuid-123'
    AND measure_name = 'battery_soc_percentage'
    AND time > ago(1h)
ORDER BY time DESC

3. Get location history for vehicle:
SELECT 
    time,
    latitude,
    longitude,
    altitude
FROM blufleet_telemetry.vehicle_telemetry 
WHERE vehicle_id = 'vehicle-uuid-123'
    AND measure_name = 'location'
    AND time BETWEEN ago(24h) AND now()
ORDER BY time ASC

4. Get energy consumption trends:
SELECT 
    bin(time, 15m) as time_bucket,
    vehicle_id,
    AVG(measure_value::double) as avg_power_consumption
FROM blufleet_telemetry.vehicle_telemetry 
WHERE measure_name = 'power_consumption_kw'
    AND time > ago(24h)
GROUP BY bin(time, 15m), vehicle_id
ORDER BY time_bucket DESC

5. Get driver behavior metrics:
SELECT 
    driver_id,
    vehicle_id,
    measure_name,
    measure_value::double,
    time
FROM blufleet_telemetry.vehicle_telemetry 
WHERE measure_name IN ('harsh_acceleration_count', 'harsh_braking_count', 'driver_behavior_score')
    AND time > ago(24h)
ORDER BY time DESC

6. Get charging session data:
SELECT 
    vehicle_id,
    charging_station_id,
    time,
    measure_value::double as charging_power
FROM blufleet_telemetry.vehicle_telemetry 
WHERE measure_name = 'charging_power_kw'
    AND measure_value::double > 0
    AND time > ago(24h)
ORDER BY time DESC

7. Fleet-wide energy efficiency:
SELECT 
    bin(time, 1h) as hour,
    COUNT(DISTINCT vehicle_id) as active_vehicles,
    AVG(CASE WHEN measure_name = 'energy_efficiency_kwh_per_km' 
             THEN measure_value::double END) as avg_efficiency,
    SUM(CASE WHEN measure_name = 'power_consumption_kw' 
             THEN measure_value::double END) as total_power_consumption
FROM blufleet_telemetry.vehicle_telemetry 
WHERE time > ago(24h)
    AND measure_name IN ('energy_efficiency_kwh_per_km', 'power_consumption_kw')
GROUP BY bin(time, 1h)
ORDER BY hour DESC

8. Geofence violation monitoring:
SELECT 
    vehicle_id,
    geofence_id,
    time,
    measure_value::double as violation_count
FROM blufleet_telemetry.vehicle_telemetry 
WHERE measure_name = 'geofence_violations'
    AND measure_value::double > 0
    AND time > ago(24h)
ORDER BY time DESC

9. Vehicle health monitoring:
SELECT 
    vehicle_id,
    measure_name,
    measure_value::double,
    time
FROM blufleet_telemetry.vehicle_telemetry 
WHERE vehicle_id = 'vehicle-uuid-123'
    AND measure_name IN ('battery_temperature_celsius', 'motor_temperature_celsius')
    AND time > ago(24h)
ORDER BY time DESC

10. Real-time dashboard data (last 5 minutes):
SELECT 
    vehicle_id,
    MAX(CASE WHEN measure_name = 'battery_soc_percentage' THEN measure_value::double END) as battery_soc,
    MAX(CASE WHEN measure_name = 'speed_kmh' THEN measure_value::double END) as current_speed,
    MAX(CASE WHEN measure_name = 'power_consumption_kw' THEN measure_value::double END) as power_consumption,
    MAX(time) as last_update
FROM blufleet_telemetry.vehicle_telemetry 
WHERE time > ago(5m)
    AND measure_name IN ('battery_soc_percentage', 'speed_kmh', 'power_consumption_kw')
GROUP BY vehicle_id
ORDER BY last_update DESC
*/

-- =============================================
-- DATA RETENTION POLICIES
-- =============================================

/*
Timestream Retention Configuration:

Memory Store TTL: 24 hours
- Real-time data for dashboards and alerts
- High-frequency queries (every few seconds)
- Latest telemetry for operational decisions

Magnetic Store TTL: 7 years
- Historical analysis and reporting
- Long-term trend analysis
- Compliance and audit requirements
- Machine learning model training

Data Lifecycle:
1. Fresh data (0-24h): Memory store (fast queries)
2. Recent data (1d-30d): Magnetic store (normal queries)
3. Historical data (30d-7y): Magnetic store (archived)
4. Old data (>7y): Automatically deleted

Cost Optimization:
- Memory store: $0.036 per GB-hour (expensive, fast)
- Magnetic store: $0.03 per GB-month (cheap, slower)
- Automatic tiering based on age
*/

-- =============================================
-- INTEGRATION WITH POSTGRESQL
-- =============================================

/*
Cross-database Joins (Application Layer):

1. Get vehicle details with latest telemetry:
   a. Query PostgreSQL for vehicle metadata
   b. Query Timestream for latest telemetry
   c. Combine in application layer

2. Trip analysis with telemetry:
   a. Query PostgreSQL for trip details
   b. Query Timestream for telemetry during trip timeframe
   c. Calculate trip metrics in application

3. Driver performance reports:
   a. Query PostgreSQL for driver and trip information
   b. Query Timestream for driver behavior metrics
   c. Generate performance scores

Data Synchronization:
- Use vehicle_id as common key between systems
- PostgreSQL trip_id included in Timestream dimensions
- Application ensures data consistency
*/
