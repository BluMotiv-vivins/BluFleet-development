# FleetVolt Pro API Specification

## Overview

FleetVolt Pro provides a comprehensive REST API and GraphQL endpoint for managing electric vehicle fleets. The API follows RESTful principles and includes real-time WebSocket connections for live data streaming.

## Base URLs

- **Development**: `https://api-dev.fleetvolt.com`
- **Staging**: `https://api-staging.fleetvolt.com`
- **Production**: `https://api.fleetvolt.com`

## Authentication

### JWT Bearer Token
```http
Authorization: Bearer <jwt_token>
```

### API Key
```http
X-API-Key: <api_key>
```

### Multi-Tenant Header
```http
X-Tenant-ID: <tenant_uuid>
```

## Rate Limiting

- **General API**: 2000 requests per 5 minutes per API key
- **Authentication**: 100 requests per 5 minutes per IP
- **Telemetry Ingestion**: 10000 requests per minute per tenant
- **WebSocket**: 1000 messages per minute per connection

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "metadata": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}
```

## Core API Endpoints

### Authentication Service

#### POST /auth/login
Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenantId": "tenant-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["fleet_manager"]
    }
  }
}
```

#### POST /auth/refresh
Refresh JWT access token using refresh token.

#### POST /auth/logout
Invalidate current session and tokens.

### Fleet Monitoring Service

#### GET /api/fleet-monitoring/vehicles
Get list of vehicles with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by vehicle status
- `type`: Filter by vehicle type
- `fleetId`: Filter by fleet ID
- `search`: Search by VIN, make, or model

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle-uuid",
      "vin": "1HGBH41JXMN109186",
      "make": "Tesla",
      "model": "Model 3",
      "year": 2023,
      "type": "sedan",
      "status": "active",
      "batteryCapacity": 75.0,
      "maxRange": 358,
      "currentLocation": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "San Francisco, CA",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      "assignedDriverId": "driver-uuid",
      "fleetId": "fleet-uuid",
      "telemetry": {
        "battery": {
          "currentLevel": 85,
          "health": 98,
          "estimatedRange": 304
        },
        "speed": 0,
        "odometer": 15420
      }
    }
  ],
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

#### GET /api/fleet-monitoring/vehicles/{id}
Get detailed information about a specific vehicle.

#### POST /api/fleet-monitoring/vehicles
Create a new vehicle.

**Request:**
```json
{
  "vin": "1HGBH41JXMN109186",
  "make": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "type": "sedan",
  "batteryCapacity": 75.0,
  "maxRange": 358,
  "specifications": {
    "length": 4.69,
    "width": 1.85,
    "height": 1.44,
    "weight": 1611,
    "chargingPorts": ["type2", "ccs"]
  }
}
```

#### PUT /api/fleet-monitoring/vehicles/{id}
Update vehicle information.

#### DELETE /api/fleet-monitoring/vehicles/{id}
Soft delete a vehicle.

#### GET /api/fleet-monitoring/vehicles/{id}/telemetry
Get real-time telemetry data for a vehicle.

**Query Parameters:**
- `from`: Start timestamp (ISO 8601)
- `to`: End timestamp (ISO 8601)
- `interval`: Data aggregation interval (1m, 5m, 15m, 1h, 1d)

#### POST /api/fleet-monitoring/vehicles/{id}/telemetry
Ingest telemetry data from vehicle.

**Request:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "altitude": 52.0,
    "accuracy": 5.0,
    "heading": 180.5,
    "speed": 65.2
  },
  "battery": {
    "currentLevel": 85,
    "health": 98,
    "temperature": 25.5,
    "voltage": 400.2,
    "current": -15.8,
    "chargingRate": 0,
    "estimatedRange": 304
  },
  "diagnostics": [
    {
      "code": "P0001",
      "description": "Battery temperature high",
      "severity": "warning",
      "isActive": true
    }
  ],
  "sensors": [
    {
      "sensorId": "temp_001",
      "type": "temperature",
      "value": 25.5,
      "unit": "celsius",
      "status": "normal"
    }
  ]
}
```

### Energy & Charging Service

#### GET /api/energy-charging/stations
Get list of charging stations.

#### GET /api/energy-charging/stations/{id}
Get detailed information about a charging station.

#### POST /api/energy-charging/stations/{id}/reserve
Reserve a charging station.

#### GET /api/energy-charging/sessions
Get charging sessions history.

#### POST /api/energy-charging/sessions
Start a new charging session.

**Request:**
```json
{
  "vehicleId": "vehicle-uuid",
  "stationId": "station-uuid",
  "connectorId": "connector-1",
  "paymentMethod": "credit_card"
}
```

#### PUT /api/energy-charging/sessions/{id}/stop
Stop an active charging session.

### Maintenance Service

#### GET /api/maintenance/records
Get maintenance records with filtering.

#### POST /api/maintenance/records
Create a new maintenance record.

#### GET /api/maintenance/schedules
Get maintenance schedules for vehicles.

#### POST /api/maintenance/schedules
Create or update maintenance schedule.

### Safety & Compliance Service

#### GET /api/safety-compliance/incidents
Get safety incidents.

#### POST /api/safety-compliance/incidents
Report a new safety incident.

#### GET /api/safety-compliance/violations
Get compliance violations.

#### POST /api/safety-compliance/violations/{id}/resolve
Mark a violation as resolved.

### Analytics Service

#### GET /api/analytics/kpis
Get key performance indicators.

**Response:**
```json
{
  "success": true,
  "data": {
    "fleet": {
      "totalVehicles": 150,
      "activeVehicles": 142,
      "utilizationRate": 94.7,
      "averageBatteryHealth": 96.2
    },
    "energy": {
      "totalEnergyConsumed": 45230.5,
      "averageEfficiency": 4.2,
      "chargingCost": 8450.30,
      "costSavings": 15670.80
    },
    "maintenance": {
      "scheduledMaintenance": 23,
      "overdueMaintenance": 3,
      "maintenanceCost": 12450.00,
      "vehicleUptime": 98.5
    },
    "safety": {
      "incidentCount": 2,
      "violationCount": 5,
      "safetyScore": 92.3,
      "complianceScore": 88.7
    }
  }
}
```

#### GET /api/analytics/reports
Generate and retrieve reports.

**Query Parameters:**
- `type`: Report type (fleet-performance, cost-analysis, etc.)
- `from`: Start date
- `to`: End date
- `format`: Output format (json, csv, pdf)

### Insurance & Finance Service

#### GET /api/insurance-finance/policies
Get insurance policies.

#### GET /api/insurance-finance/claims
Get insurance claims.

#### POST /api/insurance-finance/claims
File a new insurance claim.

### Integration & IoT Service

#### GET /api/integration-iot/integrations
Get list of configured integrations.

#### POST /api/integration-iot/integrations
Configure a new integration.

#### GET /api/integration-iot/devices
Get IoT devices.

#### POST /api/integration-iot/devices/{id}/command
Send command to IoT device.

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('wss://api.fleetvolt.com/ws');
ws.onopen = function() {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'jwt_token',
    tenantId: 'tenant-uuid'
  }));
};
```

### Message Format
```json
{
  "type": "message_type",
  "payload": {},
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

### Subscription Types
- `vehicle_updates`: Real-time vehicle status updates
- `telemetry`: Live telemetry data stream
- `alerts`: Real-time alerts and notifications
- `charging_updates`: Charging session updates

### Example Subscription
```json
{
  "type": "subscribe",
  "payload": {
    "channel": "vehicle_updates",
    "filters": {
      "vehicleIds": ["vehicle-uuid-1", "vehicle-uuid-2"],
      "fleetId": "fleet-uuid"
    }
  }
}
```

## GraphQL API

### Endpoint
```
POST /graphql
```

### Schema Example
```graphql
type Query {
  vehicles(
    first: Int
    after: String
    filter: VehicleFilter
  ): VehicleConnection!
  
  vehicle(id: ID!): Vehicle
  
  fleets(
    first: Int
    after: String
  ): FleetConnection!
}

type Mutation {
  createVehicle(input: CreateVehicleInput!): Vehicle!
  updateVehicle(id: ID!, input: UpdateVehicleInput!): Vehicle!
  deleteVehicle(id: ID!): Boolean!
}

type Subscription {
  vehicleUpdated(vehicleId: ID!): Vehicle!
  telemetryReceived(vehicleId: ID!): Telemetry!
  alertCreated(tenantId: ID!): Alert!
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| `MAINTENANCE_MODE` | Service in maintenance mode |

## SDK Examples

### JavaScript/Node.js
```javascript
import { FleetVoltClient } from '@fleetvolt/sdk';

const client = new FleetVoltClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.fleetvolt.com',
  tenantId: 'your-tenant-id'
});

// Get vehicles
const vehicles = await client.vehicles.list({
  status: 'active',
  limit: 50
});

// Subscribe to real-time updates
client.subscribe('vehicle_updates', (update) => {
  console.log('Vehicle updated:', update);
});
```

### Python
```python
from fleetvolt import FleetVoltClient

client = FleetVoltClient(
    api_key='your-api-key',
    base_url='https://api.fleetvolt.com',
    tenant_id='your-tenant-id'
)

# Get vehicles
vehicles = client.vehicles.list(status='active', limit=50)

# Create vehicle
vehicle = client.vehicles.create({
    'vin': '1HGBH41JXMN109186',
    'make': 'Tesla',
    'model': 'Model 3',
    'year': 2023
})
```

## Webhooks

FleetVolt Pro supports webhooks for real-time event notifications.

### Configuration
```json
{
  "url": "https://your-app.com/webhooks/fleetvolt",
  "events": [
    "vehicle.status_changed",
    "alert.created",
    "charging.session_completed"
  ],
  "secret": "webhook-secret"
}
```

### Event Format
```json
{
  "id": "event-uuid",
  "type": "vehicle.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "tenant-uuid",
  "data": {
    "vehicleId": "vehicle-uuid",
    "oldStatus": "charging",
    "newStatus": "active"
  }
}
```

## Testing

### Postman Collection
Import our Postman collection for easy API testing:
```
https://api.fleetvolt.com/postman/collection.json
```

### Test Environment
Use our sandbox environment for testing:
- **Base URL**: `https://api-sandbox.fleetvolt.com`
- **Test API Key**: Contact support for test credentials

## Support

- **Documentation**: https://docs.fleetvolt.com
- **API Status**: https://status.fleetvolt.com
- **Support**: support@fleetvolt.com
- **Developer Forum**: https://community.fleetvolt.com