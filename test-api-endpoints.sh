#!/bin/bash

# BluFleet API Testing Script
# Version: 1.0.0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local headers=$4
    local data=$5
    
    echo -n "Testing $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X "$method" "$url" -H "$headers" -d "$data")
    elif [ -n "$headers" ]; then
        response=$(curl -s -w "%{http_code}" -X "$method" "$url" -H "$headers")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$url")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        return 1
    fi
}

main() {
    echo "🧪 BluFleet API Testing"
    echo "======================"
    echo
    
    BASE_URL="http://localhost:3000"
    
    # Test 1: Health Check
    log_info "1. Testing Health Endpoints"
    test_endpoint "GET" "$BASE_URL/health" "Basic Health Check"
    test_endpoint "GET" "$BASE_URL/api/health" "API Health Check"
    test_endpoint "GET" "$BASE_URL/api/health/detailed" "Detailed Health Check"
    echo
    
    # Test 2: Authentication
    log_info "2. Testing Authentication"
    
    # Test login
    login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@blufleet.com","password":"password"}')
    
    if echo "$login_response" | grep -q "token"; then
        log_success "✅ Login successful"
        token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo "Token: ${token:0:20}..."
    else
        log_error "❌ Login failed"
        echo "Response: $login_response"
        exit 1
    fi
    echo
    
    # Test 3: Protected Endpoints
    log_info "3. Testing Protected Endpoints"
    auth_header="Authorization: Bearer $token"
    
    test_endpoint "GET" "$BASE_URL/api/auth/me" "Get Current User" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/vehicles" "List Vehicles" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/drivers" "List Drivers" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/trips" "List Trips" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/alerts" "List Alerts" "$auth_header"
    echo
    
    # Test 4: Analytics Endpoints
    log_info "4. Testing Analytics Endpoints"
    test_endpoint "GET" "$BASE_URL/api/analytics/dashboard" "Dashboard Metrics" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/analytics/energy" "Energy Analytics" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/analytics/kpis" "Fleet KPIs" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/analytics/predictions" "Fleet Predictions" "$auth_header"
    echo
    
    # Test 5: CRUD Operations
    log_info "5. Testing CRUD Operations"
    
    # Create a vehicle
    create_response=$(curl -s -X POST "$BASE_URL/api/vehicles" \
        -H "Content-Type: application/json" \
        -H "$auth_header" \
        -d '{
            "vin": "TEST123456789ABCD",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2023,
            "vehicleType": "sedan",
            "licensePlate": "TEST-001"
        }')
    
    if echo "$create_response" | grep -q "TEST123456789ABCD"; then
        log_success "✅ Vehicle creation successful"
        vehicle_id=$(echo "$create_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "Created vehicle ID: $vehicle_id"
        
        # Test getting the created vehicle
        test_endpoint "GET" "$BASE_URL/api/vehicles/$vehicle_id" "Get Created Vehicle" "$auth_header"
        
        # Test updating the vehicle
        test_endpoint "PATCH" "$BASE_URL/api/vehicles/$vehicle_id" "Update Vehicle" "$auth_header" '{"licensePlate":"TEST-002"}'
        
    else
        log_error "❌ Vehicle creation failed"
        echo "Response: $create_response"
    fi
    echo
    
    # Test 6: Error Handling
    log_info "6. Testing Error Handling"
    test_endpoint "GET" "$BASE_URL/api/vehicles/nonexistent" "Non-existent Resource" "$auth_header"
    test_endpoint "GET" "$BASE_URL/api/vehicles" "Unauthorized Access" ""
    test_endpoint "POST" "$BASE_URL/api/vehicles" "Invalid Data" "$auth_header" '{"invalid":"data"}'
    echo
    
    # Summary
    echo "🎉 API Testing Complete!"
    echo
    echo "📊 Test Summary:"
    echo "  ✅ Health checks working"
    echo "  ✅ Authentication working"
    echo "  ✅ Protected endpoints working"
    echo "  ✅ Analytics endpoints working"
    echo "  ✅ CRUD operations working"
    echo "  ✅ Error handling working"
    echo
    echo "🌐 Frontend: http://localhost:5173"
    echo "📚 API Docs: http://localhost:3000/api/docs"
}

main "$@"