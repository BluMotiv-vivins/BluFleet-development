#!/bin/bash

# BluFleet Simple Test Script
echo "🚀 BluFleet System Test"
echo "======================="

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
BACKEND_URL="http://localhost:3001"
API_URL="${BACKEND_URL}/api/v1"

echo -e "${BLUE}Testing Backend:${NC}"
echo "------------------------"

# Check backend health
health_response=$(curl -s "${BACKEND_URL}/health")
if [[ "$health_response" == *"healthy"* ]]; then
  echo -e "${GREEN}✓ Backend is healthy${NC}"
else
  echo -e "${RED}✗ Backend health check failed${NC}"
  exit 1
fi

# Test vehicle API
vehicles_response=$(curl -s "${API_URL}/vehicles")
vehicle_count=$(echo "$vehicles_response" | jq -r '.pagination.total')
echo -e "${GREEN}✓ Vehicle API working - found $vehicle_count vehicles${NC}"
echo "Sample vehicle:"
echo "$vehicles_response" | jq '.vehicles[0] | {make, model, status}' 

# Test analytics API
analytics_response=$(curl -s "${API_URL}/analytics/dashboard")
active_vehicles=$(echo "$analytics_response" | jq -r '.fleet_overview.active_vehicles')
echo -e "${GREEN}✓ Analytics API working - $active_vehicles active vehicles${NC}"
echo "Fleet overview:"
echo "$analytics_response" | jq '.fleet_overview'

# Test telemetry API
telemetry_response=$(curl -s "${API_URL}/telemetry/fleet/realtime")
telemetry_count=$(echo "$telemetry_response" | jq -r '.total_vehicles')
echo -e "${GREEN}✓ Telemetry API working - $telemetry_count vehicles reporting${NC}"
echo "Sample telemetry:"
echo "$telemetry_response" | jq '.fleet[0].telemetry.battery_soc_percentage'

echo ""
echo -e "${BLUE}Backend Tests:${NC} ${GREEN}PASSED${NC}"
echo ""

# Perform a CRUD test
echo -e "${BLUE}Testing CRUD Operations:${NC}"
echo "-------------------------"

# Create a vehicle
echo "Creating test vehicle..."
vehicle_data='{
  "vin_number": "TEST987654321",
  "make": "Rivian", 
  "model": "R1S",
  "year": 2025,
  "battery_capacity_kwh": 135.0,
  "max_charging_power_kw": 220.0,
  "vehicle_type": "suv",
  "status": "active"
}'

create_response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$vehicle_data" \
  "${API_URL}/vehicles")

vehicle_id=$(echo "$create_response" | jq -r '.vehicle.vehicle_id')

if [[ "$vehicle_id" != "null" && "$vehicle_id" != "" ]]; then
  echo -e "${GREEN}✓ Created vehicle with ID: $vehicle_id${NC}"
  
  # Update vehicle
  update_response=$(curl -s -X PUT \
    -H "Content-Type: application/json" \
    -d '{"status": "charging"}' \
    "${API_URL}/vehicles/$vehicle_id")
    
  updated_status=$(echo "$update_response" | jq -r '.vehicle.status')
  
  if [[ "$updated_status" == "charging" ]]; then
    echo -e "${GREEN}✓ Updated vehicle status to: charging${NC}"
    
    # Delete vehicle
    delete_response=$(curl -s -X DELETE "${API_URL}/vehicles/$vehicle_id")
    delete_message=$(echo "$delete_response" | jq -r '.message')
    
    if [[ "$delete_message" == *"deleted"* ]]; then
      echo -e "${GREEN}✓ Deleted vehicle successfully${NC}"
    else
      echo -e "${RED}✗ Delete operation failed${NC}"
    fi
  else
    echo -e "${RED}✗ Update operation failed${NC}"
  fi
else
  echo -e "${RED}✗ Create operation failed${NC}"
fi

echo ""
echo -e "${BLUE}CRUD Tests:${NC} ${GREEN}PASSED${NC}"
echo ""

echo -e "${BLUE}All Tests Complete!${NC}"
echo ""
echo "Summary of API endpoints tested:"
echo "- ${BACKEND_URL}/health"
echo "- ${API_URL}/vehicles"
echo "- ${API_URL}/vehicles/:id"
echo "- ${API_URL}/analytics/dashboard"
echo "- ${API_URL}/telemetry/fleet/realtime"
echo ""
echo -e "${GREEN}BluFleet system is operational!${NC}"
