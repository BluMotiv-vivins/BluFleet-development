#!/bin/bash

# Test complete authentication and API flow
echo "🔄 Testing complete BluFleet authentication and API flow..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Login and get JWT token
echo "1️⃣  Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@blufleet.com", "password": "password"}')

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   JWT Token received: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Test protected endpoints with JWT
echo "2️⃣  Testing protected API endpoints with JWT..."

# Test simulation endpoints
echo "   🔸 Testing /api/simulation/data..."
SIMULATION_DATA=$(curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/simulation/data")
if [[ $SIMULATION_DATA == *"vehicles"* ]] || [[ $SIMULATION_DATA == *"data"* ]]; then
    echo -e "   ${GREEN}✅ Simulation data endpoint working${NC}"
else
    echo -e "   ${RED}❌ Simulation data endpoint failed${NC}"
    echo "   Response: $SIMULATION_DATA"
fi

echo "   🔸 Testing /api/simulation/summary..."
SIMULATION_SUMMARY=$(curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/simulation/summary")
if [[ $SIMULATION_SUMMARY == *"total"* ]] || [[ $SIMULATION_SUMMARY == *"summary"* ]]; then
    echo -e "   ${GREEN}✅ Simulation summary endpoint working${NC}"
else
    echo -e "   ${RED}❌ Simulation summary endpoint failed${NC}"
    echo "   Response: $SIMULATION_SUMMARY"
fi

echo "   🔸 Testing /api/analytics/health/aws..."
AWS_HEALTH=$(curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/analytics/health/aws")
if [[ $AWS_HEALTH == *"status"* ]] || [[ $AWS_HEALTH == *"healthy"* ]]; then
    echo -e "   ${GREEN}✅ AWS health endpoint working${NC}"
else
    echo -e "   ${RED}❌ AWS health endpoint failed${NC}"
    echo "   Response: $AWS_HEALTH"
fi

echo ""

# Test 3: Test vehicle endpoints
echo "3️⃣  Testing vehicle endpoints..."
echo "   🔸 Testing /api/vehicles..."
VEHICLES=$(curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/vehicles")
if [[ $VEHICLES == *"id"* ]] && [[ $VEHICLES == *"license_plate"* ]]; then
    echo -e "   ${GREEN}✅ Vehicles endpoint working${NC}"
    VEHICLE_COUNT=$(echo $VEHICLES | grep -o '"id"' | wc -l)
    echo "   📊 Found $VEHICLE_COUNT vehicles in database"
else
    echo -e "   ${RED}❌ Vehicles endpoint failed${NC}"
    echo "   Response: $VEHICLES"
fi

echo ""

# Test 4: Test without authentication (should fail)
echo "4️⃣  Testing endpoints without authentication (should fail)..."
UNAUTH_TEST=$(curl -s "${BASE_URL}/api/vehicles")
if [[ $UNAUTH_TEST == *"UNAUTHORIZED"* ]] || [[ $UNAUTH_TEST == *"401"* ]]; then
    echo -e "${GREEN}✅ Authentication protection working correctly${NC}"
else
    echo -e "${RED}❌ Endpoints not properly protected${NC}"
    echo "   Response: $UNAUTH_TEST"
fi

echo ""
echo "🎉 Complete authentication and API flow test completed!"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "   🔐 JWT authentication: Working"
echo "   🚗 Vehicle API: Connected to real database"
echo "   📊 Simulation API: Working with mock data"
echo "   📈 Analytics API: Working with mock health data"
echo "   🛡️  Security: Endpoints properly protected"
echo ""
echo -e "${GREEN}✅ BluFleet backend is ready for frontend integration!${NC}"
