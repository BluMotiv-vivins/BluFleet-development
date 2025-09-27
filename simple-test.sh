#!/bin/bash

# Test script for checking API endpoints separately
echo "🧪 Simple API endpoint test..."

# Test 1: Login to get token
echo -e "\n1. Login test:"
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blufleet.com","password":"password"}')

echo "Login response (first 200 chars): ${LOGIN_RESPONSE:0:200}..."

# Test 2: Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token, stopping test"
  exit 1
fi

echo "✅ Token obtained (first 20 chars): ${TOKEN:0:20}..."

# Test 3: Test analytics health endpoint
echo -e "\n3. Testing /api/analytics/health/aws:"
curl -s "http://localhost:3000/api/analytics/health/aws" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "Request failed"

# Test 4: Test simulation data endpoint  
echo -e "\n4. Testing /api/simulation/data:"
curl -s "http://localhost:3000/api/simulation/data" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "Request failed"

# Test 5: Test simulation summary endpoint
echo -e "\n5. Testing /api/simulation/summary:"
curl -s "http://localhost:3000/api/simulation/summary" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "Request failed"

echo -e "\n✅ Test completed!"
