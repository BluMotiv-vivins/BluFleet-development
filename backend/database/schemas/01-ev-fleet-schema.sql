-- BluFleet EV Fleet Management Database Schema
-- PostgreSQL schema optimized for electric vehicle fleet operations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- CORE VEHICLE MANAGEMENT TABLES
-- =============================================

-- Vehicle Master Data
CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin_number VARCHAR(17) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year > 1990 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
    battery_capacity_kwh DECIMAL(8,2) NOT NULL CHECK (battery_capacity_kwh > 0),
    max_charging_power_kw DECIMAL(8,2) NOT NULL CHECK (max_charging_power_kw > 0),
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('delivery_van', 'truck', 'passenger', 'bus')),
    registration_date DATE NOT NULL,
    last_service_date DATE,
    warranty_expiry DATE,
    assigned_driver_id UUID,
    home_depot_location GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver Information
CREATE TABLE drivers (
    driver_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    certification_level VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging Stations
CREATE TABLE charging_stations (
    charger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_name VARCHAR(200) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    charger_type VARCHAR(50) NOT NULL CHECK (charger_type IN ('AC_level1', 'AC_level2', 'DC_fast', 'ultra_fast')),
    max_power_kw DECIMAL(8,2) NOT NULL,
    connector_types TEXT[], -- Array of connector types
    cost_per_kwh DECIMAL(8,4),
    network_provider VARCHAR(100),
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routes and Route Planning
CREATE TABLE routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(200) NOT NULL,
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    end_location GEOGRAPHY(POINT, 4326) NOT NULL,
    waypoints GEOGRAPHY(POINT, 4326)[], -- Array of waypoints
    planned_distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    route_type VARCHAR(50) DEFAULT 'delivery' CHECK (route_type IN ('delivery', 'service', 'pickup', 'transfer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery/Service Stops
CREATE TABLE delivery_stops (
    stop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(route_id) ON DELETE CASCADE,
    stop_sequence INTEGER NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    customer_name VARCHAR(200),
    estimated_arrival_time TIMESTAMP WITH TIME ZONE,
    estimated_service_duration_minutes INTEGER DEFAULT 15,
    stop_type VARCHAR(50) DEFAULT 'delivery' CHECK (stop_type IN ('delivery', 'pickup', 'service', 'charging')),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- OPERATIONAL DATA TABLES
-- =============================================

-- Vehicle Assignments and Trips
CREATE TABLE vehicle_trips (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(driver_id),
    route_id UUID REFERENCES routes(route_id),
    planned_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    planned_end_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    start_odometer_km DECIMAL(12,2),
    end_odometer_km DECIMAL(12,2),
    start_battery_soc DECIMAL(5,2),
    end_battery_soc DECIMAL(5,2),
    planned_distance_km DECIMAL(10,2),
    actual_distance_km DECIMAL(10,2),
    energy_consumed_kwh DECIMAL(10,4),
    trip_status VARCHAR(50) DEFAULT 'planned' CHECK (trip_status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    route_efficiency_score DECIMAL(5,2),
    on_time_delivery_status BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging Sessions
CREATE TABLE charging_sessions (
    charging_session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    charger_id UUID REFERENCES charging_stations(charger_id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    start_soc DECIMAL(5,2) NOT NULL CHECK (start_soc >= 0 AND start_soc <= 100),
    end_soc DECIMAL(5,2) CHECK (end_soc >= 0 AND end_soc <= 100),
    energy_consumed_kwh DECIMAL(10,4),
    charging_cost DECIMAL(10,2),
    charging_power_kw DECIMAL(8,2),
    session_status VARCHAR(50) DEFAULT 'charging' CHECK (session_status IN ('charging', 'completed', 'interrupted', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Maintenance Records
CREATE TABLE maintenance_records (
    maintenance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    odometer_km DECIMAL(12,2),
    cost DECIMAL(10,2),
    service_provider VARCHAR(200),
    maintenance_status VARCHAR(50) DEFAULT 'scheduled' CHECK (maintenance_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    next_service_km DECIMAL(12,2),
    next_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Geofences for Fleet Management
CREATE TABLE geofences (
    geofence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    fence_type VARCHAR(50) DEFAULT 'operational' CHECK (fence_type IN ('operational', 'depot', 'restricted', 'charging_zone')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ANALYTICS AND REPORTING TABLES
-- =============================================

-- Daily Fleet Summary (for quick dashboard queries)
CREATE TABLE daily_fleet_summary (
    summary_date DATE PRIMARY KEY,
    total_vehicles INTEGER,
    active_vehicles INTEGER,
    total_distance_km DECIMAL(12,2),
    total_energy_consumed_kwh DECIMAL(12,4),
    total_charging_cost DECIMAL(12,2),
    average_efficiency_kwh_per_km DECIMAL(8,4),
    on_time_deliveries INTEGER,
    total_deliveries INTEGER,
    maintenance_alerts INTEGER,
    battery_health_alerts INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver Performance Metrics
CREATE TABLE driver_performance (
    performance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(driver_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_distance_km DECIMAL(10,2),
    total_trips INTEGER,
    average_efficiency_score DECIMAL(5,2),
    harsh_acceleration_count INTEGER DEFAULT 0,
    harsh_braking_count INTEGER DEFAULT 0,
    speeding_violations INTEGER DEFAULT 0,
    idle_time_minutes INTEGER DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2),
    energy_efficiency_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(driver_id, date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Vehicle indexes
CREATE INDEX idx_vehicles_vin ON vehicles(vin_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_driver ON vehicles(assigned_driver_id);

-- Spatial indexes
CREATE INDEX idx_vehicles_location ON vehicles USING GIST(home_depot_location);
CREATE INDEX idx_charging_stations_location ON charging_stations USING GIST(location);
CREATE INDEX idx_routes_start_location ON routes USING GIST(start_location);
CREATE INDEX idx_routes_end_location ON routes USING GIST(end_location);
CREATE INDEX idx_geofences_boundary ON geofences USING GIST(boundary);

-- Trip and operational indexes
CREATE INDEX idx_vehicle_trips_vehicle_id ON vehicle_trips(vehicle_id);
CREATE INDEX idx_vehicle_trips_driver_id ON vehicle_trips(driver_id);
CREATE INDEX idx_vehicle_trips_route_id ON vehicle_trips(route_id);
CREATE INDEX idx_vehicle_trips_start_time ON vehicle_trips(planned_start_time);
CREATE INDEX idx_vehicle_trips_status ON vehicle_trips(trip_status);

-- Charging session indexes
CREATE INDEX idx_charging_sessions_vehicle_id ON charging_sessions(vehicle_id);
CREATE INDEX idx_charging_sessions_charger_id ON charging_sessions(charger_id);
CREATE INDEX idx_charging_sessions_start_time ON charging_sessions(start_time);
CREATE INDEX idx_charging_sessions_status ON charging_sessions(session_status);

-- Performance indexes
CREATE INDEX idx_driver_performance_driver_date ON driver_performance(driver_id, date);
CREATE INDEX idx_daily_fleet_summary_date ON daily_fleet_summary(summary_date);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_driver 
    FOREIGN KEY (assigned_driver_id) REFERENCES drivers(driver_id) ON DELETE SET NULL;

ALTER TABLE vehicle_trips ADD CONSTRAINT fk_trips_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE;

ALTER TABLE vehicle_trips ADD CONSTRAINT fk_trips_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE SET NULL;

ALTER TABLE vehicle_trips ADD CONSTRAINT fk_trips_route
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE SET NULL;

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charging_stations_updated_at BEFORE UPDATE ON charging_stations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_trips_updated_at BEFORE UPDATE ON vehicle_trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charging_sessions_updated_at BEFORE UPDATE ON charging_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_fleet_summary_updated_at BEFORE UPDATE ON daily_fleet_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =============================================

-- Insert sample drivers
INSERT INTO drivers (employee_id, first_name, last_name, email, phone, license_number, license_expiry, hire_date) VALUES
('EMP001', 'John', 'Smith', 'john.smith@blufleet.com', '+1-555-0101', 'D123456789', '2026-12-31', '2023-01-15'),
('EMP002', 'Sarah', 'Johnson', 'sarah.johnson@blufleet.com', '+1-555-0102', 'D123456790', '2027-06-30', '2023-02-01'),
('EMP003', 'Mike', 'Chen', 'mike.chen@blufleet.com', '+1-555-0103', 'D123456791', '2025-09-15', '2022-11-10'),
('EMP004', 'Emily', 'Davis', 'emily.davis@blufleet.com', '+1-555-0104', 'D123456792', '2026-03-20', '2023-03-01'),
('EMP005', 'Robert', 'Wilson', 'robert.wilson@blufleet.com', '+1-555-0105', 'D123456793', '2027-01-10', '2023-01-20');

-- Insert sample vehicles
INSERT INTO vehicles (vin_number, make, model, year, battery_capacity_kwh, max_charging_power_kw, vehicle_type, registration_date, assigned_driver_id, home_depot_location) VALUES
('1FTFW1E58DFC12345', 'Ford', 'E-Transit', 2024, 68.0, 115.0, 'delivery_van', '2024-01-15', (SELECT driver_id FROM drivers WHERE employee_id = 'EMP001'), ST_GeogFromText('POINT(-74.006 40.7128)')),
('1GCCS19X8X8123456', 'Rivian', 'EDV-700', 2024, 135.0, 210.0, 'delivery_van', '2024-02-01', (SELECT driver_id FROM drivers WHERE employee_id = 'EMP002'), ST_GeogFromText('POINT(-74.006 40.7128)')),
('1HGBH41JXMN123457', 'Mercedes', 'eSprinter', 2024, 113.0, 80.0, 'delivery_van', '2024-01-20', (SELECT driver_id FROM drivers WHERE employee_id = 'EMP003'), ST_GeogFromText('POINT(-74.006 40.7128)')),
('2T1BURHE0JC123458', 'Tesla', 'Semi', 2024, 500.0, 750.0, 'truck', '2024-03-01', (SELECT driver_id FROM drivers WHERE employee_id = 'EMP004'), ST_GeogFromText('POINT(-74.006 40.7128)')),
('WVWZZZ7LZKW123459', 'Volkswagen', 'ID.Buzz Cargo', 2024, 77.0, 170.0, 'delivery_van', '2024-02-15', (SELECT driver_id FROM drivers WHERE employee_id = 'EMP005'), ST_GeogFromText('POINT(-74.006 40.7128)'));

-- Insert sample charging stations
INSERT INTO charging_stations (station_name, location, address, charger_type, max_power_kw, connector_types, cost_per_kwh, network_provider) VALUES
('BluFleet HQ Fast Charger', ST_GeogFromText('POINT(-74.006 40.7128)'), '123 Fleet St, New York, NY 10001', 'DC_fast', 150.0, ARRAY['CCS', 'CHAdeMO'], 0.35, 'ChargePoint'),
('Depot Station A', ST_GeogFromText('POINT(-74.008 40.7140)'), '125 Fleet St, New York, NY 10001', 'AC_level2', 22.0, ARRAY['J1772'], 0.15, 'Internal'),
('Highway Rest Stop', ST_GeogFromText('POINT(-74.200 40.8000)'), 'I-95 Rest Area, Mile 45', 'ultra_fast', 350.0, ARRAY['CCS'], 0.45, 'Electrify America'),
('City Center Station', ST_GeogFromText('POINT(-73.985 40.7580)'), '456 Business Ave, New York, NY 10019', 'DC_fast', 125.0, ARRAY['CCS', 'CHAdeMO'], 0.40, 'EVgo'),
('Warehouse District', ST_GeogFromText('POINT(-74.020 40.7200)'), '789 Industrial Blvd, Jersey City, NJ 07302', 'AC_level2', 19.2, ARRAY['J1772'], 0.18, 'Internal');

-- Insert sample routes
INSERT INTO routes (route_name, start_location, end_location, planned_distance_km, estimated_duration_minutes, route_type) VALUES
('Downtown Delivery Circuit', ST_GeogFromText('POINT(-74.006 40.7128)'), ST_GeogFromText('POINT(-73.985 40.7580)'), 25.5, 90, 'delivery'),
('Brooklyn Route', ST_GeogFromText('POINT(-74.006 40.7128)'), ST_GeogFromText('POINT(-73.950 40.6500)'), 35.2, 120, 'delivery'),
('Long Island Express', ST_GeogFromText('POINT(-74.006 40.7128)'), ST_GeogFromText('POINT(-73.200 40.8000)'), 85.0, 180, 'delivery'),
('New Jersey Circuit', ST_GeogFromText('POINT(-74.006 40.7128)'), ST_GeogFromText('POINT(-74.200 40.7300)'), 45.8, 150, 'delivery'),
('Maintenance Run', ST_GeogFromText('POINT(-74.006 40.7128)'), ST_GeogFromText('POINT(-74.100 40.7500)'), 15.0, 45, 'service');

COMMIT;
