#!/bin/bash

echo "🚀 Testing BluFleet API endpoints..."

echo -e "\n1. First, login to get authentication token:"
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blufleet.com","password":"password"}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool

echo -e "\n2. Extracting token from response..."
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Token obtained successfully"

echo -e "\n3. Testing /api/vehicles endpoint with authentication:"
VEHICLES_RESPONSE=$(curl -s "http://localhost:3000/api/vehicles" \
  -H "Authorization: Bearer $TOKEN")

echo "Vehicles API response:"
echo "$VEHICLES_RESPONSE" | python3 -m json.tool | head -50

echo -e "\n4. Testing vehicle count:"
VEHICLE_COUNT=$(echo "$VEHICLES_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total vehicles: {len(data.get(\"data\", []))}')" 2>/dev/null)
echo "$VEHICLE_COUNT"

echo -e "\n5. Testing first vehicle details:"
echo "$VEHICLES_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    vehicles = data.get('data', [])
    if vehicles:
        print('First vehicle details:')
        print(json.dumps(vehicles[0], indent=2))
    else:
        print('No vehicles found in response')
except Exception as e:
    print(f'Error parsing response: {e}')
"
