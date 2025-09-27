-- BluFleet Sample Data - Development Seed
-- Description: Sample data for development and testing

-- Insert sample organization
INSERT INTO organizations (id, name, slug, subscription_tier, settings) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'BluFleet Demo Corp', 'blufleet-demo', 'enterprise', '{"timezone": "UTC", "currency": "USD"}');

-- Insert sample users
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, permissions) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@blufleet.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZu', 'John', 'Admin', 'admin', '["*"]'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'manager@blufleet.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZu', 'Sarah', 'Manager', 'manager', '["dashboard:read", "fleet:read", "fleet:write", "energy:read", "maintenance:read"]'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'driver@blufleet.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZu', 'Mike', 'Driver', 'driver', '["dashboard:read", "trips:read"]');

-- Insert sample fleet
INSERT INTO fleets (id, organization_id, name, description, manager_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Delivery Fleet', 'Main delivery vehicle fleet', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample vehicles
INSERT INTO vehicles (id, organization_id, fleet_id, vin, license_plate, make, model, year, vehicle_type, battery_capacity_kwh, max_range_km, current_location, current_battery_soc, current_battery_soh, odometer_km) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '1HGBH41JXMN109186', 'EV-001', 'Tesla', 'Model 3', 2023, 'sedan', 75.0, 500, POINT(-122.4194, 37.7749), 85.5, 98.2, 15420),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '2HGBH41JXMN109187', 'EV-002', 'Nissan', 'Leaf', 2023, 'hatchback', 62.0, 400, POINT(-122.4094, 37.7849), 72.3, 96.8, 12350),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '3HGBH41JXMN109188', 'EV-003', 'Ford', 'E-Transit', 2023, 'van', 68.0, 350, POINT(-122.3994, 37.7949), 45.8, 94.5, 28750),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '4HGBH41JXMN109189', 'EV-004', 'Rivian', 'EDV', 2023, 'van', 135.0, 600, POINT(-122.3894, 37.8049), 91.2, 99.1, 8920),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '5HGBH41JXMN109190', 'EV-005', 'Mercedes', 'eSprinter', 2023, 'van', 113.0, 450, POINT(-122.3794, 37.8149), 23.7, 97.3, 19680);

-- Insert sample drivers
INSERT INTO drivers (id, organization_id, user_id, employee_id, license_number, license_expiry, phone, performance_score, eco_score, safety_score, total_distance_km, total_trips) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'DRV001', 'D1234567', '2025-12-31', '+1-555-0101', 87.5, 92.3, 89.1, 45230, 342),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', NULL, 'DRV002', 'D2345678', '2026-06-15', '+1-555-0102', 91.2, 88.7, 94.5, 38920, 298),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', NULL, 'DRV003', 'D3456789', '2025-09-20', '+1-555-0103', 78.9, 85.4, 82.1, 52340, 401),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', NULL, 'DRV004', 'D4567890', '2026-03-10', '+1-555-0104', 95.1, 96.8, 93.2, 29870, 234);

-- Insert sample charging stations
INSERT INTO charging_stations (id, organization_id, name, location, address, station_type, connector_types, max_power_kw, cost_per_kwh, status) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', 'HQ Charging Hub', POINT(-122.4194, 37.7749), '123 Fleet St, San Francisco, CA', 'dc_fast', '["CCS", "CHAdeMO"]', 150.0, 0.25, 'available'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', 'Warehouse Station A', POINT(-122.4094, 37.7849), '456 Warehouse Ave, San Francisco, CA', 'ac_level2', '["Type2"]', 22.0, 0.18, 'available'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', 'Depot Fast Charger', POINT(-122.3994, 37.7949), '789 Depot Rd, San Francisco, CA', 'dc_fast', '["CCS"]', 100.0, 0.22, 'occupied'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440000', 'Service Center', POINT(-122.3894, 37.8049), '321 Service Blvd, San Francisco, CA', 'ac_level2', '["Type2", "Type1"]', 11.0, 0.15, 'maintenance');

-- Insert sample trips (recent)
INSERT INTO trips (id, organization_id, vehicle_id, driver_id, start_time, end_time, start_location, end_location, start_battery_soc, end_battery_soc, distance_km, energy_consumed_kwh, efficiency_score) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', POINT(-122.4194, 37.7749), POINT(-122.4094, 37.7849), 90.0, 85.5, 12.5, 2.8, 88.5),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440031', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', POINT(-122.4094, 37.7849), POINT(-122.3994, 37.7949), 78.0, 72.3, 15.2, 3.1, 91.2),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440032', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', POINT(-122.3994, 37.7949), POINT(-122.3894, 37.8049), 52.0, 45.8, 18.7, 4.2, 82.1);

-- Insert sample charging sessions
INSERT INTO charging_sessions (id, organization_id, vehicle_id, charging_station_id, driver_id, start_time, end_time, start_battery_soc, end_battery_soc, energy_delivered_kwh, cost) VALUES
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '11 hours', 25.0, 90.0, 48.75, 12.19),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '6 hours', 35.0, 78.0, 26.66, 4.80);

-- Insert sample maintenance records
INSERT INTO maintenance_records (id, organization_id, vehicle_id, maintenance_type, description, scheduled_date, completed_date, odometer_km, cost, status) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', 'routine_service', 'Routine 15,000km service check', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 15000, 285.50, 'completed'),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', 'tire_replacement', 'Replace front tires', CURRENT_DATE + INTERVAL '3 days', NULL, 28500, 450.00, 'scheduled'),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440024', 'battery_check', 'Battery health diagnostic', CURRENT_DATE + INTERVAL '7 days', NULL, 19500, 125.00, 'scheduled');

-- Insert sample alerts
INSERT INTO alerts (id, organization_id, vehicle_id, driver_id, alert_type, severity, title, description, status) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440033', 'low_battery', 'warning', 'Low Battery Alert', 'Vehicle EV-005 battery level is at 23.7%', 'active'),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440032', 'maintenance_due', 'info', 'Maintenance Due', 'Vehicle EV-003 is due for tire replacement', 'active'),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440000', NULL, '550e8400-e29b-41d4-a716-446655440032', 'driver_behavior', 'warning', 'Harsh Braking Detected', 'Multiple harsh braking events detected for driver DRV003', 'acknowledged');

-- Insert sample geofences
INSERT INTO geofences (id, organization_id, name, description, geometry, fence_type) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440000', 'HQ Zone', 'Company headquarters area', ST_GeomFromText('POLYGON((-122.4244 37.7699, -122.4144 37.7699, -122.4144 37.7799, -122.4244 37.7799, -122.4244 37.7699))', 4326), 'allowed'),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440000', 'Restricted Zone', 'No vehicle access area', ST_GeomFromText('POLYGON((-122.4000 37.7900, -122.3950 37.7900, -122.3950 37.7950, -122.4000 37.7950, -122.4000 37.7900))', 4326), 'restricted');