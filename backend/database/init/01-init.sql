-- FleetVolt Pro Database Initialization Script
-- This script creates the initial database structure for all microservices

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas for different microservices
CREATE SCHEMA IF NOT EXISTS fleet_monitoring;
CREATE SCHEMA IF NOT EXISTS energy_charging;
CREATE SCHEMA IF NOT EXISTS maintenance;
CREATE SCHEMA IF NOT EXISTS safety_compliance;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS insurance_finance;
CREATE SCHEMA IF NOT EXISTS integration_iot;
CREATE SCHEMA IF NOT EXISTS security_access;
CREATE SCHEMA IF NOT EXISTS shared;

-- Create shared tables used across services
CREATE TABLE IF NOT EXISTS shared.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('enterprise', 'smb', 'government', 'non_profit')),
    industry VARCHAR(100),
    address JSONB,
    contact_info JSONB,
    subscription JSONB,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS shared.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS shared.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS shared.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES shared.users(id),
    role_id UUID NOT NULL REFERENCES shared.roles(id),
    assigned_by UUID NOT NULL REFERENCES shared.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    UNIQUE(user_id, role_id)
);

-- Fleet Monitoring Schema
CREATE TABLE IF NOT EXISTS fleet_monitoring.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vin VARCHAR(17) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sedan', 'suv', 'truck', 'van', 'bus', 'forklift', 'other')),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'charging', 'maintenance', 'out_of_service', 'emergency')),
    battery_capacity DECIMAL(8,2) NOT NULL,
    max_range INTEGER NOT NULL,
    current_location GEOGRAPHY(POINT, 4326),
    assigned_driver_id UUID REFERENCES shared.users(id),
    fleet_id UUID,
    specifications JSONB DEFAULT '{}',
    insurance JSONB DEFAULT '{}',
    maintenance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fleet_monitoring.fleets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID NOT NULL REFERENCES shared.users(id),
    operating_regions JSONB DEFAULT '[]',
    policies JSONB DEFAULT '[]',
    kpis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fleet_monitoring.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    user_id UUID NOT NULL REFERENCES shared.users(id),
    employee_id VARCHAR(50),
    license_number VARCHAR(50) NOT NULL,
    license_class VARCHAR(10) NOT NULL,
    license_expiry_date DATE NOT NULL,
    certifications JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'on_leave', 'terminated')),
    performance_score DECIMAL(3,2) DEFAULT 0.00,
    safety_score DECIMAL(3,2) DEFAULT 0.00,
    eco_score DECIMAL(3,2) DEFAULT 0.00,
    total_miles_driven INTEGER DEFAULT 0,
    total_hours_driven INTEGER DEFAULT 0,
    violation_count INTEGER DEFAULT 0,
    incident_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    UNIQUE(tenant_id, employee_id)
);

CREATE TABLE IF NOT EXISTS fleet_monitoring.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    driver_id UUID NOT NULL REFERENCES fleet_monitoring.drivers(id),
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    end_location GEOGRAPHY(POINT, 4326),
    planned_route JSONB,
    actual_route JSONB DEFAULT '[]',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    distance DECIMAL(10,2) DEFAULT 0,
    duration INTEGER DEFAULT 0,
    energy_consumed DECIMAL(8,2) DEFAULT 0,
    average_speed DECIMAL(5,2) DEFAULT 0,
    max_speed DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'interrupted')),
    purpose VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fleet_monitoring.geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('circular', 'polygon', 'corridor')),
    coordinates JSONB NOT NULL,
    radius DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    alert_on_entry BOOLEAN DEFAULT false,
    alert_on_exit BOOLEAN DEFAULT false,
    allowed_vehicles JSONB DEFAULT '[]',
    schedule JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fleet_monitoring.vehicle_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    battery JSONB NOT NULL,
    speed DECIMAL(5,2) DEFAULT 0,
    heading DECIMAL(5,2) DEFAULT 0,
    odometer INTEGER DEFAULT 0,
    engine_status VARCHAR(20) DEFAULT 'off' CHECK (engine_status IN ('off', 'idle', 'driving', 'charging', 'error')),
    diagnostics JSONB DEFAULT '[]',
    sensors JSONB DEFAULT '[]',
    connectivity JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Energy & Charging Schema
CREATE TABLE IF NOT EXISTS energy_charging.charging_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    name VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'out_of_order', 'maintenance')),
    connector_types JSONB NOT NULL DEFAULT '[]',
    max_power DECIMAL(8,2) NOT NULL,
    current_power DECIMAL(8,2) DEFAULT 0,
    pricing JSONB NOT NULL DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    network_provider VARCHAR(100),
    ocpp_version VARCHAR(10),
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS energy_charging.charging_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    station_id UUID NOT NULL REFERENCES energy_charging.charging_stations(id),
    connector_id VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    energy_delivered DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'charging', 'completed', 'terminated', 'failed')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Maintenance Schema
CREATE TABLE IF NOT EXISTS maintenance.maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('scheduled', 'unscheduled', 'preventive', 'corrective', 'emergency')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('battery', 'brakes', 'tires', 'electrical', 'software', 'hvac', 'body', 'general')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    technician_id UUID REFERENCES shared.users(id),
    cost DECIMAL(10,2),
    parts JSONB DEFAULT '[]',
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Safety & Compliance Schema
CREATE TABLE IF NOT EXISTS safety_compliance.safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    driver_id UUID REFERENCES fleet_monitoring.drivers(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('accident', 'near_miss', 'breakdown', 'theft', 'vandalism', 'fire', 'medical', 'environmental')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
    reported_by UUID NOT NULL REFERENCES shared.users(id),
    investigated_by UUID REFERENCES shared.users(id),
    resolution TEXT,
    attachments JSONB DEFAULT '[]',
    witnesses JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS safety_compliance.compliance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    driver_id UUID REFERENCES fleet_monitoring.drivers(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('speed_limit', 'restricted_area', 'operating_hours', 'weight_limit', 'emission_zone', 'parking', 'certification', 'safety')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
    description TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    fine_amount DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'disputed', 'dismissed')),
    reported_by VARCHAR(20) NOT NULL CHECK (reported_by IN ('system_automatic', 'driver_report', 'manager_report', 'external_authority', 'third_party')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    correction_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Insurance & Finance Schema
CREATE TABLE IF NOT EXISTS insurance_finance.insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    vehicle_id UUID NOT NULL REFERENCES fleet_monitoring.vehicles(id),
    policy_number VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('comprehensive', 'third_party', 'collision', 'liability')),
    coverage JSONB NOT NULL DEFAULT '{}',
    premium DECIMAL(10,2) NOT NULL,
    deductible DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS insurance_finance.insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    policy_id UUID NOT NULL REFERENCES insurance_finance.insurance_policies(id),
    claim_number VARCHAR(100) NOT NULL,
    incident_id UUID REFERENCES safety_compliance.safety_incidents(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('accident', 'theft', 'vandalism', 'natural_disaster', 'fire', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'under_review', 'approved', 'denied', 'settled')),
    filed_date DATE NOT NULL,
    settled_date DATE,
    description TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Integration & IoT Schema
CREATE TABLE IF NOT EXISTS integration_iot.external_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('telematics', 'charging_network', 'insurance', 'maintenance', 'payment', 'mapping', 'weather', 'traffic')),
    provider VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'syncing', 'rate_limited')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Security & Access Schema
CREATE TABLE IF NOT EXISTS security_access.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    user_id UUID REFERENCES shared.users(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS security_access.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    user_id UUID REFERENCES shared.users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Shared tables for alerts and notifications
CREATE TABLE IF NOT EXISTS shared.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.organizations(id),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed', 'escalated')),
    acknowledged_by UUID REFERENCES shared.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES shared.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_id ON fleet_monitoring.vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON fleet_monitoring.vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON fleet_monitoring.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON fleet_monitoring.vehicles USING GIST(current_location);

CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_id ON fleet_monitoring.vehicle_telemetry(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON fleet_monitoring.vehicle_telemetry(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_location ON fleet_monitoring.vehicle_telemetry USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON fleet_monitoring.trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON fleet_monitoring.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON fleet_monitoring.trips(start_time);
CREATE INDEX IF NOT EXISTS idx_trips_status ON fleet_monitoring.trips(status);

CREATE INDEX IF NOT EXISTS idx_charging_sessions_vehicle_id ON energy_charging.charging_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_station_id ON energy_charging.charging_sessions(station_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_start_time ON energy_charging.charging_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance.maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON maintenance.maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance.maintenance_records(status);

CREATE INDEX IF NOT EXISTS idx_alerts_tenant_id ON shared.alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_entity_type_id ON shared.alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON shared.alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON shared.alerts(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON security_access.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON security_access.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON security_access.audit_logs(timestamp);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT schemaname||'.'||tablename 
        FROM pg_tables 
        WHERE schemaname IN ('shared', 'fleet_monitoring', 'energy_charging', 'maintenance', 'safety_compliance', 'insurance_finance', 'integration_iot', 'security_access')
        AND tablename NOT LIKE '%_telemetry'
        AND tablename NOT LIKE '%_audit_logs'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
                      replace(t, '.', '_'), t);
    END LOOP;
END;
$$;