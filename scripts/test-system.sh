#!/bin/bash

# BluFleet System Testing Script
# Version: 1.0.0
# Usage: ./scripts/test-system.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test configuration
API_BASE_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"
TEST_EMAIL="admin@blufleet.com"
TEST_PASSWORD="password"

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper functions
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_info "Running test: $test_name"
    
    if eval "$test_command"; then
        log_success "✓ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "✗ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# API test helper
test_api_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local headers="$4"
    
    local response
    local status_code
    
    if [ -n "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" -H "$headers")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        log_error "Expected status $expected_status, got $status_code"
        return 1
    fi
}

# Health check tests
test_service_health() {
    log_info "Testing service health endpoints..."
    
    run_test "API Gateway Health" "test_api_endpoint GET /health 200"
    run_test "Fleet Monitoring Health" "curl -f -s http://localhost:3001/health > /dev/null"
    run_test "Energy & Charging Health" "curl -f -s http://localhost:3002/health > /dev/null"
    run_test "Maintenance Health" "curl -f -s http://localhost:3003/health > /dev/null"
    run_test "Safety & Compliance Health" "curl -f -s http://localhost:3004/health > /dev/null"
    run_test "Analytics Health" "curl -f -s http://localhost:3005/health > /dev/null"
}

# Database connectivity tests
test_database_connectivity() {
    log_info "Testing database connectivity..."
    
    run_test "PostgreSQL Connection" "docker-compose exec -T postgres pg_isready -U blufleet -d blufleet"
    run_test "Redis Connection" "docker-compose exec -T redis redis-cli ping | grep -q PONG"
}

# Authentication tests
test_authentication() {
    log_info "Testing authentication..."
    
    # Test login endpoint
    local login_response
    login_response=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
    
    if echo "$login_response" | grep -q "token"; then
        log_success "✓ Login endpoint working"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Extract token for further tests
        TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        export AUTH_HEADER="Authorization: Bearer $TOKEN"
    else
        log_error "✗ Login endpoint failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        export AUTH_HEADER=""
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    # Test protected endpoint
    if [ -n "$AUTH_HEADER" ]; then
        run_test "Protected Endpoint Access" "test_api_endpoint GET /api/auth/me 200 '$AUTH_HEADER'"
    else
        run_test "Protected Endpoint Access" "false"
    fi
}

# API endpoint tests
test_api_endpoints() {
    log_info "Testing API endpoints..."
    
    if [ -n "$AUTH_HEADER" ]; then
        run_test "Get Vehicles" "test_api_endpoint GET /api/vehicles 200 '$AUTH_HEADER'"
        run_test "Get Drivers" "test_api_endpoint GET /api/drivers 200 '$AUTH_HEADER'"
        run_test "Get Trips" "test_api_endpoint GET /api/trips 200 '$AUTH_HEADER'"
        run_test "Get Alerts" "test_api_endpoint GET /api/alerts 200 '$AUTH_HEADER'"
        run_test "Get Dashboard Metrics" "test_api_endpoint GET /api/analytics/dashboard 200 '$AUTH_HEADER'"
    else
        log_warning "Skipping API endpoint tests (no auth token)"
    fi
}

# Frontend tests
test_frontend() {
    log_info "Testing frontend application..."
    
    run_test "Frontend Accessibility" "curl -f -s $FRONTEND_URL > /dev/null"
    
    # Test if main JavaScript bundle loads
    local main_js
    main_js=$(curl -s $FRONTEND_URL | grep -o 'src="[^"]*\.js"' | head -1 | cut -d'"' -f2)
    
    if [ -n "$main_js" ]; then
        run_test "Main JavaScript Bundle" "curl -f -s $FRONTEND_URL$main_js > /dev/null"
    else
        run_test "Main JavaScript Bundle" "false"
    fi
}

# Performance tests
test_performance() {
    log_info "Testing performance..."
    
    # Test API response time
    local response_time
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$API_BASE_URL/health")
    
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        log_success "✓ API Response Time: ${response_time}s"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "✗ API Response Time too slow: ${response_time}s"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    # Test frontend load time
    local frontend_time
    frontend_time=$(curl -o /dev/null -s -w "%{time_total}" "$FRONTEND_URL")
    
    if (( $(echo "$frontend_time < 2.0" | bc -l) )); then
        log_success "✓ Frontend Load Time: ${frontend_time}s"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "✗ Frontend Load Time too slow: ${frontend_time}s"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
}

# Security tests
test_security() {
    log_info "Testing security..."
    
    # Test unauthorized access
    run_test "Unauthorized Access Blocked" "test_api_endpoint GET /api/vehicles 401"
    
    # Test invalid token
    run_test "Invalid Token Rejected" "test_api_endpoint GET /api/vehicles 401 'Authorization: Bearer invalid-token'"
    
    # Test SQL injection protection
    run_test "SQL Injection Protection" "test_api_endpoint GET '/api/vehicles?id=1%27%20OR%20%271%27=%271' 400 '$AUTH_HEADER'"
}

# Integration tests
test_integration() {
    log_info "Testing integration scenarios..."
    
    if [ -n "$AUTH_HEADER" ]; then
        # Test creating and retrieving a vehicle
        local create_response
        create_response=$(curl -s -X POST "$API_BASE_URL/api/vehicles" \
            -H "Content-Type: application/json" \
            -H "$AUTH_HEADER" \
            -d '{
                "vin": "TEST123456789",
                "make": "Tesla",
                "model": "Model 3",
                "year": 2023,
                "vehicleType": "sedan"
            }')
        
        if echo "$create_response" | grep -q "TEST123456789"; then
            log_success "✓ Vehicle Creation Integration"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            
            # Extract vehicle ID and test retrieval
            local vehicle_id
            vehicle_id=$(echo "$create_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
            
            if [ -n "$vehicle_id" ]; then
                run_test "Vehicle Retrieval Integration" "test_api_endpoint GET /api/vehicles/$vehicle_id 200 '$AUTH_HEADER'"
            fi
        else
            log_error "✗ Vehicle Creation Integration"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        log_warning "Skipping integration tests (no auth token)"
    fi
}

# Load tests (basic)
test_load() {
    log_info "Running basic load tests..."
    
    # Simple concurrent request test
    local concurrent_requests=10
    local success_count=0
    
    for i in $(seq 1 $concurrent_requests); do
        if curl -f -s "$API_BASE_URL/health" > /dev/null & then
            success_count=$((success_count + 1))
        fi
    done
    
    wait
    
    if [ $success_count -eq $concurrent_requests ]; then
        log_success "✓ Concurrent Requests ($concurrent_requests)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "✗ Concurrent Requests ($success_count/$concurrent_requests succeeded)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
}

# Main test execution
main() {
    log_info "Starting BluFleet System Tests..."
    log_info "Timestamp: $(date)"
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Run test suites
    test_service_health
    test_database_connectivity
    test_authentication
    test_api_endpoints
    test_frontend
    test_performance
    test_security
    test_integration
    test_load
    
    # Test summary
    echo
    log_info "=== Test Summary ==="
    log_info "Total Tests: $TESTS_TOTAL"
    log_success "Passed: $TESTS_PASSED"
    log_error "Failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed! ✨"
        exit 0
    else
        log_error "Some tests failed. Please check the output above."
        exit 1
    fi
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi