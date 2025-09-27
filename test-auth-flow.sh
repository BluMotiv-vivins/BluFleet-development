#!/bin/bash

echo "=== Testing Complete Authentication Flow ==="
echo ""

# Step 1: Login and get token
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@blufleet.com", "password": "password"}')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Step 2: Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token from login response"
    exit 1
fi

echo "2. Token extracted successfully: ${TOKEN:0:50}..."
echo ""

# Step 3: Test protected endpoint
echo "3. Testing protected endpoint with token..."
API_RESPONSE=$(curl -s -X GET http://localhost:3000/api/analytics/health/aws \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "API response: $API_RESPONSE"
echo ""

# Check if the response is successful
if echo "$API_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Authentication flow working correctly!"
    echo "✅ Protected API endpoint accessible with JWT token"
else
    echo "❌ Authentication flow failed"
    echo "Response: $API_RESPONSE"
fi

echo ""
echo "=== Test Complete ==="
