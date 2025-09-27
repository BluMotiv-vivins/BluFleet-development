import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Vehicle, ChargingStation, Driver, Route, Geofence } from '../../types';

interface FleetState {
  vehicles: Vehicle[];
  chargingStations: ChargingStation[];
  drivers: Driver[];
  routes: Route[];
  geofences: Geofence[];
  loading: boolean;
  error: string | null;
}

// Mock data for development
const mockDrivers: Driver[] = [
  {
    id: 'D-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@blufleet.com',
    avatar: undefined,
    safetyScore: 95,
    ecoScore: 92,
    totalMiles: 15420,
    recentAlerts: [],
    certifications: ['Commercial License', 'EV Certified', 'Defensive Driving'],
    status: 'active',
  },
  {
    id: 'D-002',
    name: 'Mike Chen',
    email: 'mike.chen@blufleet.com',
    avatar: undefined,
    safetyScore: 88,
    ecoScore: 85,
    totalMiles: 12350,
    recentAlerts: [],
    certifications: ['Commercial License', 'Hazmat Certified'],
    status: 'active',
  },
  {
    id: 'D-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@blufleet.com',
    avatar: undefined,
    safetyScore: 91,
    ecoScore: 89,
    totalMiles: 18750,
    recentAlerts: [],
    certifications: ['Commercial License', 'EV Certified', 'Safety Training'],
    status: 'active',
  },
  {
    id: 'D-004',
    name: 'James Wilson',
    email: 'james.wilson@blufleet.com',
    avatar: undefined,
    safetyScore: 82,
    ecoScore: 78,
    totalMiles: 9840,
    recentAlerts: [],
    certifications: ['Commercial License'],
    status: 'break',
  },
  {
    id: 'D-005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@blufleet.com',
    avatar: undefined,
    safetyScore: 97,
    ecoScore: 94,
    totalMiles: 22100,
    recentAlerts: [],
    certifications: ['Commercial License', 'EV Certified', 'Advanced Safety', 'Eco-Driving'],
    status: 'active',
  },
];

// Mock vehicles with driver assignments
const mockVehicles: Vehicle[] = [
  {
    id: 'EV-001',
    name: 'Fleet Truck 001',
    type: 'truck',
    status: 'active',
    location: {
      lat: 47.6062,
      lng: -122.3321,
      address: 'Seattle Depot',
    },
    battery: {
      currentLevel: 82,
      health: 94,
      lastCharged: '2024-12-09T10:30:00Z',
      estimatedRange: 245,
    },
    driver: mockDrivers[0], // Sarah Johnson
    alerts: [],
    complianceStatus: {
      overallStatus: 'compliant',
      badges: [],
      lastAudit: '2024-11-01T00:00:00Z',
      nextAuditDue: '2025-02-01T00:00:00Z',
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-12-09T12:00:00Z',
  },
  {
    id: 'EV-002',
    name: 'Delivery Van 002',
    type: 'van',
    status: 'active',
    location: {
      lat: 45.5152,
      lng: -122.6784,
      address: 'Portland Route',
    },
    battery: {
      currentLevel: 45,
      health: 89,
      lastCharged: '2024-12-09T06:15:00Z',
      estimatedRange: 128,
    },
    driver: mockDrivers[1], // Mike Chen
    alerts: [],
    complianceStatus: {
      overallStatus: 'compliant',
      badges: [],
      lastAudit: '2024-11-01T00:00:00Z',
      nextAuditDue: '2025-02-01T00:00:00Z',
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-12-09T12:00:00Z',
  },
  {
    id: 'EV-003',
    name: 'Forklift 003',
    type: 'forklift',
    status: 'charging',
    location: {
      lat: 47.6205,
      lng: -122.3493,
      address: 'Charging Hub',
    },
    battery: {
      currentLevel: 95,
      health: 96,
      lastCharged: '2024-12-09T11:45:00Z',
      estimatedRange: 85,
    },
    driver: mockDrivers[2], // Emily Rodriguez
    alerts: [],
    complianceStatus: {
      overallStatus: 'compliant',
      badges: [],
      lastAudit: '2024-11-01T00:00:00Z',
      nextAuditDue: '2025-02-01T00:00:00Z',
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-12-09T12:00:00Z',
  },
  {
    id: 'EV-004',
    name: 'Delivery Van 004',
    type: 'van',
    status: 'maintenance',
    location: {
      lat: 47.6150,
      lng: -122.3400,
      address: 'Maintenance Bay',
    },
    battery: {
      currentLevel: 65,
      health: 87,
      lastCharged: '2024-12-08T14:20:00Z',
      estimatedRange: 155,
    },
    driver: mockDrivers[3], // James Wilson
    alerts: [],
    complianceStatus: {
      overallStatus: 'warning',
      badges: [],
      lastAudit: '2024-11-01T00:00:00Z',
      nextAuditDue: '2025-02-01T00:00:00Z',
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2024-12-09T12:00:00Z',
  },
  {
    id: 'EV-005',
    name: 'Fleet Truck 005',
    type: 'truck',
    status: 'active',
    location: {
      lat: 47.5990,
      lng: -122.3350,
      address: 'Downtown Route',
    },
    battery: {
      currentLevel: 78,
      health: 98,
      lastCharged: '2024-12-09T09:15:00Z',
      estimatedRange: 235,
    },
    driver: mockDrivers[4], // Lisa Thompson
    alerts: [],
    complianceStatus: {
      overallStatus: 'compliant',
      badges: [],
      lastAudit: '2024-11-01T00:00:00Z',
      nextAuditDue: '2025-02-01T00:00:00Z',
      violations: [],
      certifications: []
    },
    accessPermissions: [],
    emergencyProtocols: [],
    createdAt: '2024-05-12T00:00:00Z',
    updatedAt: '2024-12-09T12:00:00Z',
  },
];

const mockChargingStations: ChargingStation[] = [
  {
    id: 'CS-001',
    name: 'Main Depot Charger',
    location: {
      lat: 47.6205,
      lng: -122.3493,
      address: '123 Fleet St, Seattle, WA',
    },
    status: 'occupied',
    powerOutput: 150,
    connectorTypes: ['CCS', 'CHAdeMO'],
    currentVehicle: 'EV-003',
    queue: [],
    pricing: {
      rate: 20,
      currency: 'INR',
    },
  },
  {
    id: 'CS-002',
    name: 'Portland Hub Charger',
    location: {
      lat: 45.5152,
      lng: -122.6784,
      address: '456 Industrial Ave, Portland, OR',
    },
    status: 'available',
    powerOutput: 100,
    connectorTypes: ['CCS'],
    queue: ['EV-002'],
    pricing: {
      rate: 18,
      currency: 'INR',
    },
  },
];

const initialState: FleetState = {
  vehicles: mockVehicles,
  chargingStations: mockChargingStations,
  drivers: mockDrivers,
  routes: [],
  geofences: [],
  loading: false,
  error: null,
};

const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateVehicle: (state, action: PayloadAction<Vehicle>) => {
      const index = state.vehicles.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    },
    updateVehicleBattery: (state, action: PayloadAction<{ id: string; level: number }>) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.id);
      if (vehicle) {
        vehicle.battery.currentLevel = action.payload.level;
        vehicle.updatedAt = new Date().toISOString();
      }
    },
    updateVehicleLocation: (state, action: PayloadAction<{ id: string; lat: number; lng: number; address?: string }>) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.id);
      if (vehicle) {
        vehicle.location = {
          lat: action.payload.lat,
          lng: action.payload.lng,
          address: action.payload.address,
        };
        vehicle.updatedAt = new Date().toISOString();
      }
    },
    updateChargingStation: (state, action: PayloadAction<ChargingStation>) => {
      const index = state.chargingStations.findIndex(cs => cs.id === action.payload.id);
      if (index !== -1) {
        state.chargingStations[index] = action.payload;
      }
    },
    updateVehicleStatus: (state, action: PayloadAction<{ id: string; status: Vehicle['status'] }>) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.id);
      if (vehicle) {
        vehicle.status = action.payload.status;
        vehicle.updatedAt = new Date().toISOString();
      }
    },
    batchUpdateVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      action.payload.forEach(updatedVehicle => {
        const index = state.vehicles.findIndex(v => v.id === updatedVehicle.id);
        if (index !== -1) {
          state.vehicles[index] = updatedVehicle;
        }
      });
    },
    syncData: (state, action: PayloadAction<{ vehicles?: Vehicle[]; chargingStations?: ChargingStation[]; drivers?: Driver[] }>) => {
      if (action.payload.vehicles) {
        state.vehicles = action.payload.vehicles;
      }
      if (action.payload.chargingStations) {
        state.chargingStations = action.payload.chargingStations;
      }
      if (action.payload.drivers) {
        state.drivers = action.payload.drivers;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  updateVehicle,
  updateVehicleBattery,
  updateVehicleLocation,
  updateChargingStation,
  updateVehicleStatus,
  batchUpdateVehicles,
  syncData,
} = fleetSlice.actions;

export default fleetSlice.reducer;