#!/bin/bash

# BluFleet Complete System Test Script
echo "🚀 BluFleet Complete System Test"
echo "================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"
API_URL="${BACKEND_URL}/api/v1"

# Function to print test results
print_test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        echo -e "${YELLOW}  Error: $3${NC}"
    fi
    echo ""
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    local expected_field="$3"
    
    echo -e "${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}Endpoint:${NC} $endpoint"
    
    response=$(curl -s -w "%{http_code}" "$endpoint")
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        if [ -n "$expected_field" ]; then
            # Check if expected field exists in response
            if echo "$body" | jq -e ".$expected_field" > /dev/null 2>&1; then
                print_test_result 0 "$description"
                # Show sample data
                echo -e "${BLUE}Sample Response:${NC}"
                echo "$body" | jq ".$expected_field" | head -5
            else
                print_test_result 1 "$description" "Expected field '$expected_field' not found in response"
            fi
        else
            print_test_result 0 "$description"
            echo -e "${BLUE}Response:${NC}"
            echo "$body" | jq . | head -10
        fi
    else
        print_test_result 1 "$description" "HTTP $http_code - $body"
    fi
    echo "----------------------------------------"
}

# Function to check if service is running
check_service() {
    local url="$1"
    local service_name="$2"
    
    echo -e "${BLUE}Checking:${NC} $service_name"
    
    if curl -s --connect-timeout 5 "$url" > /dev/null; then
        print_test_result 0 "$service_name is running"
    else
        print_test_result 1 "$service_name is not responding" "Could not connect to $url"
        return 1
    fi
}

echo -e "${BLUE}PHASE 1: Service Health Checks${NC}"
echo "================================"

# Check if backend is running
check_service "${BACKEND_URL}/health" "Backend Server"
backend_running=$?

# Check if frontend is running  
check_service "$FRONTEND_URL" "Frontend Server"
frontend_running=$?

if [ $backend_running -ne 0 ]; then
    echo -e "${RED}❌ Backend server is not running. Please start it with:${NC}"
    echo "cd /Users/vivinvarshans/Desktop/mockfleet/test-backend && node server.js"
    echo ""
fi

if [ $frontend_running -ne 0 ]; then
    echo -e "${RED}❌ Frontend server is not running. Please start it with:${NC}"
    echo "cd /Users/vivinvarshans/Desktop/mockfleet/frontend && npm run dev"
    echo ""
fi

if [ $backend_running -ne 0 ] || [ $frontend_running -ne 0 ]; then
    echo -e "${RED}❌ Cannot proceed with API tests until both servers are running.${NC}"
    exit 1
fi

echo -e "${BLUE}PHASE 2: Backend API Tests${NC}"
echo "========================="

# Test Health endpoint
test_api_endpoint "${BACKEND_URL}/health" "Health Check" "status"

# Test Vehicles API
test_api_endpoint "${API_URL}/vehicles" "Get All Vehicles" "vehicles"
test_api_endpoint "${API_URL}/vehicles?status=active" "Filter Vehicles by Status" "vehicles"
test_api_endpoint "${API_URL}/vehicles?limit=2" "Paginated Vehicles" "vehicles"

# Test Telemetry API
test_api_endpoint "${API_URL}/telemetry/fleet/realtime" "Real-time Fleet Telemetry" "fleet"

# Test Analytics API
test_api_endpoint "${API_URL}/analytics/dashboard" "Dashboard Analytics" "fleet_overview"
test_api_endpoint "${API_URL}/analytics/fleet-health" "Fleet Health Analytics" "overall_health_score"
test_api_endpoint "${API_URL}/analytics/energy-efficiency" "Energy Efficiency Analytics" "fleet_avg_efficiency"

echo -e "${BLUE}PHASE 3: API CRUD Operations Test${NC}"
echo "================================"

echo -e "${BLUE}Testing:${NC} Create New Vehicle"
new_vehicle_data='{
  "vin_number": "TEST123456789",
  "make": "Ford",
  "model": "E-Transit",
  "year": 2024,
  "battery_capacity_kwh": 68.0,
  "max_charging_power_kw": 115.0,
  "vehicle_type": "van",
  "status": "active",
  "driver_name": "Test Driver",
  "driver_email": "test@fleetvolt.com"
}'

create_response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$new_vehicle_data" \
  "${API_URL}/vehicles")

if echo "$create_response" | jq -e '.vehicle.vehicle_id' > /dev/null 2>&1; then
    vehicle_id=$(echo "$create_response" | jq -r '.vehicle.vehicle_id')
    print_test_result 0 "Create New Vehicle"
    echo -e "${GREEN}Created vehicle with ID: $vehicle_id${NC}"
    echo ""
    
    # Test Get Single Vehicle
    echo -e "${BLUE}Testing:${NC} Get Single Vehicle"
    get_response=$(curl -s "${API_URL}/vehicles/${vehicle_id}")
    if echo "$get_response" | jq -e '.vehicle.vin_number' > /dev/null 2>&1; then
        print_test_result 0 "Get Single Vehicle"
        echo -e "${BLUE}Vehicle Details:${NC}"
        echo "$get_response" | jq '.vehicle | {vin_number, make, model, status}'
    else
        print_test_result 1 "Get Single Vehicle" "Could not retrieve created vehicle"
    fi
    echo ""
    
    # Test Update Vehicle
    echo -e "${BLUE}Testing:${NC} Update Vehicle"
    update_data='{"status": "charging"}'
    update_response=$(curl -s -X PUT \
      -H "Content-Type: application/json" \
      -d "$update_data" \
      "${API_URL}/vehicles/${vehicle_id}")
    
    if echo "$update_response" | jq -e '.vehicle.status' > /dev/null 2>&1; then
        updated_status=$(echo "$update_response" | jq -r '.vehicle.status')
        if [ "$updated_status" = "charging" ]; then
            print_test_result 0 "Update Vehicle Status"
            echo -e "${GREEN}Status updated to: $updated_status${NC}"
        else
            print_test_result 1 "Update Vehicle Status" "Status not updated correctly"
        fi
    else
        print_test_result 1 "Update Vehicle Status" "Update request failed"
    fi
    echo ""
    
    # Test Delete Vehicle
    echo -e "${BLUE}Testing:${NC} Delete Vehicle"
    delete_response=$(curl -s -X DELETE "${API_URL}/vehicles/${vehicle_id}")
    if echo "$delete_response" | jq -e '.message' > /dev/null 2>&1; then
        print_test_result 0 "Delete Vehicle"
        echo -e "${GREEN}$(echo "$delete_response" | jq -r '.message')${NC}"
    else
        print_test_result 1 "Delete Vehicle" "Delete request failed"
    fi
    echo ""
else
    print_test_result 1 "Create New Vehicle" "Could not create test vehicle"
fi

echo -e "${BLUE}PHASE 4: Telemetry Data Test${NC}"
echo "========================="

# Get a vehicle ID for telemetry testing
echo -e "${BLUE}Testing:${NC} Telemetry Data Ingestion"
vehicles_response=$(curl -s "${API_URL}/vehicles?limit=1")
first_vehicle_id=$(echo "$vehicles_response" | jq -r '.vehicles[0].vehicle_id')

if [ "$first_vehicle_id" != "null" ] && [ -n "$first_vehicle_id" ]; then
    # Test telemetry ingestion
    telemetry_data='{
      "battery_soc_percentage": 67,
      "speed_kmh": 45,
      "power_consumption_kw": 15.2,
      "estimated_range_km": 201,
      "location": {
        "latitude": 37.7849,
        "longitude": -122.4094,
        "altitude": 48
      }
    }'
    
    ingest_response=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "{\"vehicle_id\": \"$first_vehicle_id\", \"data\": $telemetry_data}" \
      "${API_URL}/telemetry/ingest")
    
    if echo "$ingest_response" | jq -e '.message' > /dev/null 2>&1; then
        print_test_result 0 "Ingest Telemetry Data"
        echo -e "${GREEN}$(echo "$ingest_response" | jq -r '.message')${NC}"
        
        # Test get latest telemetry
        echo -e "${BLUE}Testing:${NC} Get Latest Telemetry"
        latest_response=$(curl -s "${API_URL}/telemetry/${first_vehicle_id}/latest")
        if echo "$latest_response" | jq -e '.telemetry.battery_soc_percentage' > /dev/null 2>&1; then
            print_test_result 0 "Get Latest Telemetry"
            echo -e "${BLUE}Latest Telemetry:${NC}"
            echo "$latest_response" | jq '.telemetry'
        else
            print_test_result 1 "Get Latest Telemetry" "Could not retrieve latest telemetry"
        fi
        
        # Test telemetry history
        echo -e "${BLUE}Testing:${NC} Get Telemetry History"
        history_response=$(curl -s "${API_URL}/telemetry/${first_vehicle_id}/history?limit=5")
        if echo "$history_response" | jq -e '.telemetry' > /dev/null 2>&1; then
            history_count=$(echo "$history_response" | jq '.count')
            print_test_result 0 "Get Telemetry History"
            echo -e "${GREEN}Retrieved $history_count historical records${NC}"
        else
            print_test_result 1 "Get Telemetry History" "Could not retrieve telemetry history"
        fi
    else
        print_test_result 1 "Ingest Telemetry Data" "Telemetry ingestion failed"
    fi
else
    print_test_result 1 "Telemetry Data Test Setup" "No vehicles available for telemetry testing"
fi

echo ""
echo -e "${BLUE}PHASE 5: Frontend Connectivity Test${NC}"
echo "================================="

echo -e "${BLUE}Testing:${NC} Frontend Application Load"
frontend_response=$(curl -s "$FRONTEND_URL")
if [ -n "$frontend_response" ]; then
    # Check if it looks like HTML
    if echo "$frontend_response" | grep -q "<!DOCTYPE html>"; then
        print_test_result 0 "Frontend Application Load"
        echo -e "${GREEN}Frontend is serving HTML content${NC}"
        
        # Check for expected elements
        if echo "$frontend_response" | grep -q "BluFleet\|Fleet Management\|root"; then
            print_test_result 0 "Frontend Content Check"
            echo -e "${GREEN}Frontend contains expected BluFleet content${NC}"
        else
            print_test_result 1 "Frontend Content Check" "Frontend HTML doesn't contain expected content"
        fi
    else
        print_test_result 1 "Frontend Application Load" "Response is not valid HTML"
    fi
else
    print_test_result 1 "Frontend Application Load" "No response from frontend server"
fi

echo ""
echo -e "${BLUE}PHASE 6: Integration Test Summary${NC}"
echo "================================="

# Summary statistics
total_vehicles=$(curl -s "${API_URL}/vehicles" | jq '.pagination.total')
dashboard_data=$(curl -s "${API_URL}/analytics/dashboard")
active_vehicles=$(echo "$dashboard_data" | jq '.fleet_overview.active_vehicles')
avg_battery=$(echo "$dashboard_data" | jq '.fleet_overview.avg_battery_level')

echo -e "${GREEN}📊 System Statistics:${NC}"
echo -e "   Total Vehicles: $total_vehicles"
echo -e "   Active Vehicles: $active_vehicles"
echo -e "   Average Battery Level: $avg_battery%"
echo ""

echo -e "${GREEN}🎯 Test Complete!${NC}"
echo -e "Backend Server: ${GREEN}${BACKEND_URL}${NC}"
echo -e "Frontend App: ${GREEN}${FRONTEND_URL}${NC}"
echo ""
echo -e "${YELLOW}🚀 Ready for Manual Testing:${NC}"
echo -e "1. Visit ${FRONTEND_URL} to test the web interface"
echo -e "2. Navigate through different pages (Dashboard, Vehicle Management, etc.)"
echo -e "3. Test CRUD operations through the UI"
echo -e "4. Verify real-time data updates"
echo -e "5. Check responsive design on different screen sizes"
echo ""

echo -e "${BLUE}📝 API Endpoints Available:${NC}"
echo -e "GET    ${API_URL}/vehicles"
echo -e "POST   ${API_URL}/vehicles"
echo -e "PUT    ${API_URL}/vehicles/{id}"
echo -e "DELETE ${API_URL}/vehicles/{id}"
echo -e "GET    ${API_URL}/telemetry/fleet/realtime"
echo -e "POST   ${API_URL}/telemetry/ingest"
echo -e "GET    ${API_URL}/analytics/dashboard"
echo -e "GET    ${API_URL}/analytics/fleet-health"
echo -e "GET    ${API_URL}/analytics/energy-efficiency"
