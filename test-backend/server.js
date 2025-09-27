const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage (in real app this would be database)
let vehicles = [
  {
    vehicle_id: uuidv4(),
    vin_number: '1HGBH41JXMN109186',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    battery_capacity_kwh: 75.0,
    max_charging_power_kw: 250.0,
    vehicle_type: 'sedan',
    status: 'active',
    assigned_driver_id: uuidv4(),
    driver_name: 'John Smith',
    driver_email: 'john.smith@fleetvolt.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    telemetry: {
      battery_soc_percentage: { value: 85, timestamp: new Date().toISOString() },
      speed_kmh: { value: 65, timestamp: new Date().toISOString() },
      power_consumption_kw: { value: 18.5, timestamp: new Date().toISOString() },
      estimated_range_km: { value: 320, timestamp: new Date().toISOString() },
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 52,
        timestamp: new Date().toISOString()
      }
    }
  },
  {
    vehicle_id: uuidv4(),
    vin_number: '5NPE34AF4DH123456',
    make: 'BMW',
    model: 'iX',
    year: 2024,
    battery_capacity_kwh: 105.2,
    max_charging_power_kw: 200.0,
    vehicle_type: 'suv',
    status: 'charging',
    assigned_driver_id: uuidv4(),
    driver_name: 'Sarah Johnson',
    driver_email: 'sarah.johnson@fleetvolt.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    telemetry: {
      battery_soc_percentage: { value: 45, timestamp: new Date().toISOString() },
      speed_kmh: { value: 0, timestamp: new Date().toISOString() },
      power_consumption_kw: { value: -50.0, timestamp: new Date().toISOString() },
      estimated_range_km: { value: 180, timestamp: new Date().toISOString() },
      location: {
        latitude: 37.7849,
        longitude: -122.4094,
        altitude: 48,
        timestamp: new Date().toISOString()
      }
    }
  },
  {
    vehicle_id: uuidv4(),
    vin_number: 'JN1AZ4EH8DM123789',
    make: 'Nissan',
    model: 'Leaf',
    year: 2023,
    battery_capacity_kwh: 60.0,
    max_charging_power_kw: 46.0,
    vehicle_type: 'sedan',
    status: 'maintenance',
    assigned_driver_id: null,
    driver_name: null,
    driver_email: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    telemetry: {
      battery_soc_percentage: { value: 92, timestamp: new Date().toISOString() },
      speed_kmh: { value: 0, timestamp: new Date().toISOString() },
      power_consumption_kw: { value: 0, timestamp: new Date().toISOString() },
      estimated_range_km: { value: 275, timestamp: new Date().toISOString() },
      location: {
        latitude: 37.7649,
        longitude: -122.4294,
        altitude: 55,
        timestamp: new Date().toISOString()
      }
    }
  }
];

let telemetryHistory = [];

// Generate some historical telemetry data
vehicles.forEach(vehicle => {
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(Date.now() - i * 60000).toISOString(); // Every minute for 100 minutes
    telemetryHistory.push({
      vehicle_id: vehicle.vehicle_id,
      timestamp,
      battery_soc_percentage: Math.max(0, Math.min(100, vehicle.telemetry.battery_soc_percentage.value + (Math.random() - 0.5) * 10)),
      speed_kmh: Math.max(0, vehicle.telemetry.speed_kmh.value + (Math.random() - 0.5) * 20),
      power_consumption_kw: vehicle.telemetry.power_consumption_kw.value + (Math.random() - 0.5) * 10,
      estimated_range_km: Math.max(0, vehicle.telemetry.estimated_range_km.value + (Math.random() - 0.5) * 50),
      location: {
        latitude: vehicle.telemetry.location.latitude + (Math.random() - 0.5) * 0.01,
        longitude: vehicle.telemetry.location.longitude + (Math.random() - 0.5) * 0.01,
        altitude: vehicle.telemetry.location.altitude + (Math.random() - 0.5) * 20
      }
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'BluFleet Test Server',
    vehicles: vehicles.length,
    telemetryPoints: telemetryHistory.length
  });
});

// Vehicle endpoints
app.get('/api/v1/vehicles', (req, res) => {
  const { status, vehicle_type, search, page = 1, limit = 10 } = req.query;
  
  let filteredVehicles = vehicles;
  
  if (status) {
    filteredVehicles = filteredVehicles.filter(v => v.status === status);
  }
  
  if (vehicle_type) {
    filteredVehicles = filteredVehicles.filter(v => v.vehicle_type === vehicle_type);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredVehicles = filteredVehicles.filter(v => 
      v.vin_number.toLowerCase().includes(searchLower) ||
      v.make.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      (v.driver_name && v.driver_name.toLowerCase().includes(searchLower))
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
  
  res.json({
    vehicles: paginatedVehicles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredVehicles.length,
      totalPages: Math.ceil(filteredVehicles.length / limit)
    }
  });
});

app.get('/api/v1/vehicles/:id', (req, res) => {
  const vehicle = vehicles.find(v => v.vehicle_id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  res.json({ vehicle });
});

app.post('/api/v1/vehicles', (req, res) => {
  const newVehicle = {
    vehicle_id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    telemetry: {
      battery_soc_percentage: { value: 100, timestamp: new Date().toISOString() },
      speed_kmh: { value: 0, timestamp: new Date().toISOString() },
      power_consumption_kw: { value: 0, timestamp: new Date().toISOString() },
      estimated_range_km: { value: req.body.battery_capacity_kwh * 4, timestamp: new Date().toISOString() },
      location: {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        altitude: 50 + Math.random() * 20,
        timestamp: new Date().toISOString()
      }
    }
  };
  
  vehicles.push(newVehicle);
  res.status(201).json({ vehicle: newVehicle });
});

app.put('/api/v1/vehicles/:id', (req, res) => {
  const vehicleIndex = vehicles.findIndex(v => v.vehicle_id === req.params.id);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  vehicles[vehicleIndex] = {
    ...vehicles[vehicleIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  res.json({ vehicle: vehicles[vehicleIndex] });
});

app.delete('/api/v1/vehicles/:id', (req, res) => {
  const vehicleIndex = vehicles.findIndex(v => v.vehicle_id === req.params.id);
  if (vehicleIndex === -1) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  const deletedVehicle = vehicles.splice(vehicleIndex, 1)[0];
  
  // Also remove telemetry data
  telemetryHistory = telemetryHistory.filter(t => t.vehicle_id !== req.params.id);
  
  res.json({ message: 'Vehicle deleted successfully', vehicle: deletedVehicle });
});

// Telemetry endpoints
app.post('/api/v1/telemetry/ingest', (req, res) => {
  const telemetryData = req.body;
  
  // Update vehicle's latest telemetry
  const vehicle = vehicles.find(v => v.vehicle_id === telemetryData.vehicle_id);
  if (vehicle) {
    vehicle.telemetry = {
      ...vehicle.telemetry,
      ...telemetryData.data,
      timestamp: new Date().toISOString()
    };
  }
  
  // Add to historical data
  telemetryHistory.unshift({
    vehicle_id: telemetryData.vehicle_id,
    timestamp: new Date().toISOString(),
    ...telemetryData.data
  });
  
  // Keep only last 1000 records per vehicle
  if (telemetryHistory.length > 5000) {
    telemetryHistory = telemetryHistory.slice(0, 5000);
  }
  
  res.json({ message: 'Telemetry data ingested successfully' });
});

app.get('/api/v1/telemetry/:vehicleId/latest', (req, res) => {
  const vehicle = vehicles.find(v => v.vehicle_id === req.params.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  res.json({ telemetry: vehicle.telemetry });
});

app.get('/api/v1/telemetry/:vehicleId/history', (req, res) => {
  const { startTime, endTime, limit = 100 } = req.query;
  
  let vehicleTelemetry = telemetryHistory
    .filter(t => t.vehicle_id === req.params.vehicleId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (startTime) {
    vehicleTelemetry = vehicleTelemetry.filter(t => new Date(t.timestamp) >= new Date(startTime));
  }
  
  if (endTime) {
    vehicleTelemetry = vehicleTelemetry.filter(t => new Date(t.timestamp) <= new Date(endTime));
  }
  
  vehicleTelemetry = vehicleTelemetry.slice(0, parseInt(limit));
  
  res.json({ 
    telemetry: vehicleTelemetry,
    count: vehicleTelemetry.length 
  });
});

app.get('/api/v1/telemetry/fleet/realtime', (req, res) => {
  const fleetTelemetry = vehicles.map(vehicle => ({
    vehicle_id: vehicle.vehicle_id,
    make: vehicle.make,
    model: vehicle.model,
    status: vehicle.status,
    telemetry: vehicle.telemetry
  }));
  
  res.json({ 
    fleet: fleetTelemetry,
    timestamp: new Date().toISOString(),
    total_vehicles: fleetTelemetry.length
  });
});

// Analytics endpoints
app.get('/api/v1/analytics/dashboard', (req, res) => {
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const chargingVehicles = vehicles.filter(v => v.status === 'charging').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const totalVehicles = vehicles.length;
  
  const avgBatteryLevel = vehicles.reduce((sum, v) => 
    sum + (v.telemetry.battery_soc_percentage?.value || 0), 0
  ) / totalVehicles;
  
  const totalEnergyCapacity = vehicles.reduce((sum, v) => sum + v.battery_capacity_kwh, 0);
  const currentEnergyStored = vehicles.reduce((sum, v) => 
    sum + (v.battery_capacity_kwh * (v.telemetry.battery_soc_percentage?.value || 0) / 100), 0
  );
  
  const lowBatteryVehicles = vehicles.filter(v => 
    v.telemetry.battery_soc_percentage?.value < 20
  ).length;
  
  const alerts = [];
  if (lowBatteryVehicles > 0) {
    alerts.push({
      id: uuidv4(),
      type: 'warning',
      title: 'Low Battery Alert',
      message: `${lowBatteryVehicles} vehicle(s) have battery level below 20%`,
      timestamp: new Date().toISOString(),
      severity: 'medium'
    });
  }
  
  if (maintenanceVehicles > 0) {
    alerts.push({
      id: uuidv4(),
      type: 'info',
      title: 'Maintenance Required',
      message: `${maintenanceVehicles} vehicle(s) are currently in maintenance`,
      timestamp: new Date().toISOString(),
      severity: 'low'
    });
  }
  
  res.json({
    fleet_overview: {
      total_vehicles: totalVehicles,
      active_vehicles: activeVehicles,
      charging_vehicles: chargingVehicles,
      maintenance_vehicles: maintenanceVehicles,
      avg_battery_level: Math.round(avgBatteryLevel),
      total_energy_capacity: totalEnergyCapacity,
      current_energy_stored: currentEnergyStored,
      energy_utilization: Math.round((currentEnergyStored / totalEnergyCapacity) * 100)
    },
    energy_metrics: {
      total_consumption_today: 1250.5,
      avg_efficiency: 4.2,
      charging_sessions_today: 15,
      total_range_available: vehicles.reduce((sum, v) => 
        sum + (v.telemetry.estimated_range_km?.value || 0), 0
      )
    },
    performance_metrics: {
      avg_speed: Math.round(
        vehicles.reduce((sum, v) => sum + (v.telemetry.speed_kmh?.value || 0), 0) / totalVehicles
      ),
      total_distance_today: 2840,
      uptime: 98.5,
      driver_score: 85
    },
    alerts,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/analytics/fleet-health', (req, res) => {
  const healthMetrics = vehicles.map(vehicle => ({
    vehicle_id: vehicle.vehicle_id,
    make: vehicle.make,
    model: vehicle.model,
    vin: vehicle.vin_number,
    battery_health: Math.round(85 + Math.random() * 10), // Mock battery health
    last_maintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    mileage: Math.round(5000 + Math.random() * 50000),
    efficiency_score: Math.round(75 + Math.random() * 20),
    status: vehicle.status
  }));
  
  const overallHealth = healthMetrics.reduce((sum, v) => sum + v.battery_health, 0) / healthMetrics.length;
  
  res.json({
    overall_health_score: Math.round(overallHealth),
    vehicles: healthMetrics,
    recommendations: [
      {
        type: 'maintenance',
        priority: 'medium',
        message: 'Schedule maintenance for 2 vehicles due this month'
      },
      {
        type: 'efficiency',
        priority: 'low',
        message: 'Consider driver training to improve efficiency scores'
      }
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/analytics/energy-efficiency', (req, res) => {
  const efficiencyData = vehicles.map(vehicle => ({
    vehicle_id: vehicle.vehicle_id,
    make: vehicle.make,
    model: vehicle.model,
    avg_consumption: Math.round((15 + Math.random() * 10) * 100) / 100,
    efficiency_rating: Math.round((3.5 + Math.random() * 2) * 10) / 10,
    last_7_days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      consumption: Math.round((15 + Math.random() * 10) * 100) / 100,
      distance: Math.round(50 + Math.random() * 200)
    }))
  }));
  
  const fleetAvgEfficiency = efficiencyData.reduce((sum, v) => sum + v.efficiency_rating, 0) / efficiencyData.length;
  
  res.json({
    fleet_avg_efficiency: Math.round(fleetAvgEfficiency * 10) / 10,
    total_energy_saved: Math.round(125.5 * 100) / 100,
    cost_savings: Math.round(89.23 * 100) / 100,
    vehicles: efficiencyData,
    trends: {
      weekly_improvement: 2.3,
      best_performer: efficiencyData.sort((a, b) => b.efficiency_rating - a.efficiency_rating)[0],
      worst_performer: efficiencyData.sort((a, b) => a.efficiency_rating - b.efficiency_rating)[0]
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BluFleet Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🚗 Vehicles API: http://localhost:${PORT}/api/v1/vehicles`);
  console.log(`📡 Telemetry API: http://localhost:${PORT}/api/v1/telemetry/fleet/realtime`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/v1/analytics/dashboard`);
  console.log();
  console.log(`Test the APIs:`);
  console.log(`curl http://localhost:${PORT}/health`);
  console.log(`curl http://localhost:${PORT}/api/v1/vehicles`);
  console.log(`curl http://localhost:${PORT}/api/v1/analytics/dashboard`);
});

module.exports = app;
