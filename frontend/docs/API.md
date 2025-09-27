# FleetVolt Pro API Documentation

## Overview

FleetVolt Pro uses a RESTful API architecture with WebSocket connections for real-time updates. This document outlines the API endpoints, data models, and integration patterns.

## Base URL

```
Production: https://api.fleetvolt.com/v1
Development: http://localhost:3001/api/v1
```

## Authentication

All API requests require authentication using JWT tokens.

```http
Authorization: Bearer <jwt_token>
```

## Data Models

### Vehicle

```typescript
interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'forklift' | 'van' | 'car';
  status: 'active' | 'charging' | 'maintenance' | 'offline';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  battery: {
    currentLevel: number;
    health: number;
    lastCharged: Date;
    estimatedRange: number;
  };
  driver?: Driver;
  route?: Route;
  alerts: Alert[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ChargingStation

```typescript
interface ChargingStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  powerOutput: number;
  connectorTypes: string[];
  currentVehicle?: string;
  queue: string[];
  pricing: {
    rate: number;
    currency: string;
  };
}
```

### Driver

```typescript
interface Driver {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  safetyScore: number;
  ecoScore: number;
  totalMiles: number;
  recentAlerts: Alert[];
  certifications: string[];
  status: 'active' | 'offline' | 'break';
}
```

### Alert

```typescript
interface Alert {
  id: string;
  type: 'battery' | 'maintenance' | 'safety' | 'geofence' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  vehicleId?: string;
  driverId?: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}
```

## API Endpoints

### Vehicles

#### Get All Vehicles

```http
GET /vehicles
```

**Query Parameters:**
- `status` (optional): Filter by vehicle status
- `type` (optional): Filter by vehicle type
- `limit` (optional): Number of results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "data": [Vehicle],
  "total": number,
  "limit": number,
  "offset": number
}
```

#### Get Vehicle by ID

```http
GET /vehicles/{id}
```

**Response:**
```json
{
  "data": Vehicle
}
```

#### Update Vehicle

```http
PUT /vehicles/{id}
```

**Request Body:**
```json
{
  "name": "string",
  "status": "active | charging | maintenance | offline",
  "location": {
    "lat": number,
    "lng": number,
    "address": "string"
  }
}
```

#### Create Vehicle

```http
POST /vehicles
```

**Request Body:**
```json
{
  "name": "string",
  "type": "truck | forklift | van | car",
  "location": {
    "lat": number,
    "lng": number,
    "address": "string"
  }
}
```

### Charging Stations

#### Get All Charging Stations

```http
GET /charging-stations
```

**Query Parameters:**
- `status` (optional): Filter by station status
- `available` (optional): Filter by availability

**Response:**
```json
{
  "data": [ChargingStation],
  "total": number
}
```

#### Get Charging Station by ID

```http
GET /charging-stations/{id}
```

#### Update Charging Station

```http
PUT /charging-stations/{id}
```

### Drivers

#### Get All Drivers

```http
GET /drivers
```

#### Get Driver by ID

```http
GET /drivers/{id}
```

#### Update Driver

```http
PUT /drivers/{id}
```

### Alerts

#### Get All Alerts

```http
GET /alerts
```

**Query Parameters:**
- `severity` (optional): Filter by alert severity
- `type` (optional): Filter by alert type
- `acknowledged` (optional): Filter by acknowledgment status
- `vehicleId` (optional): Filter by vehicle ID
- `driverId` (optional): Filter by driver ID

#### Acknowledge Alert

```http
POST /alerts/{id}/acknowledge
```

#### Resolve Alert

```http
POST /alerts/{id}/resolve
```

### Analytics

#### Get Fleet KPIs

```http
GET /analytics/kpis
```

**Query Parameters:**
- `timeRange` (optional): Time range for analytics (1h, 24h, 7d, 30d)

**Response:**
```json
{
  "data": {
    "totalFleetStatus": {
      "active": number,
      "charging": number,
      "maintenance": number,
      "offline": number
    },
    "batteryHealth": {
      "averageSOC": number,
      "overallHealth": number,
      "healthyBatteries": number
    },
    "costSavings": {
      "monthly": number,
      "fuel": number,
      "maintenance": number
    },
    "sustainability": {
      "co2Reduction": number,
      "milesReduction": number
    }
  }
}
```

#### Get Battery Analytics

```http
GET /analytics/battery
```

#### Get Driver Performance

```http
GET /analytics/drivers
```

## WebSocket API

### Connection

Connect to the WebSocket endpoint for real-time updates:

```
wss://api.fleetvolt.com/ws
```

### Authentication

Send authentication message after connection:

```json
{
  "type": "auth",
  "token": "jwt_token"
}
```

### Message Types

#### Vehicle Location Update

```json
{
  "type": "vehicle_location",
  "data": {
    "vehicleId": "string",
    "location": {
      "lat": number,
      "lng": number
    },
    "timestamp": "ISO_DATE"
  }
}
```

#### Battery Level Update

```json
{
  "type": "battery_update",
  "data": {
    "vehicleId": "string",
    "batteryLevel": number,
    "timestamp": "ISO_DATE"
  }
}
```

#### New Alert

```json
{
  "type": "new_alert",
  "data": Alert
}
```

#### Status Change

```json
{
  "type": "status_change",
  "data": {
    "vehicleId": "string",
    "oldStatus": "string",
    "newStatus": "string",
    "timestamp": "ISO_DATE"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_SERVER_ERROR` (500): Server error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Standard endpoints**: 1000 requests per hour per user
- **Analytics endpoints**: 100 requests per hour per user
- **WebSocket connections**: 1 connection per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination using `limit` and `offset` parameters:

```http
GET /vehicles?limit=20&offset=40
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Filtering and Sorting

### Filtering

Most list endpoints support filtering using query parameters:

```http
GET /vehicles?status=active&type=truck
GET /alerts?severity=high&acknowledged=false
```

### Sorting

Use the `sort` parameter for sorting:

```http
GET /vehicles?sort=name:asc
GET /alerts?sort=timestamp:desc
```

Multiple sort fields:

```http
GET /vehicles?sort=status:asc,name:asc
```

## Webhooks

FleetVolt Pro supports webhooks for real-time notifications to external systems.

### Webhook Events

- `vehicle.status_changed`
- `vehicle.battery_low`
- `alert.created`
- `alert.resolved`
- `maintenance.due`

### Webhook Payload

```json
{
  "event": "vehicle.status_changed",
  "timestamp": "ISO_DATE",
  "data": {
    "vehicleId": "string",
    "oldStatus": "string",
    "newStatus": "string"
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @fleetvolt/sdk
```

```typescript
import { FleetVoltClient } from '@fleetvolt/sdk';

const client = new FleetVoltClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.fleetvolt.com/v1'
});

// Get all vehicles
const vehicles = await client.vehicles.list();

// Subscribe to real-time updates
client.realtime.on('vehicle_location', (data) => {
  console.log('Vehicle location updated:', data);
});
```

## Testing

### Test Environment

Use the test environment for development and testing:

```
Base URL: https://api-test.fleetvolt.com/v1
```

### Mock Data

The test environment provides consistent mock data for testing purposes.

## Support

For API support and questions:

- Documentation: https://docs.fleetvolt.com
- Support Email: api-support@fleetvolt.com
- GitHub Issues: https://github.com/fleetvolt/api-issues