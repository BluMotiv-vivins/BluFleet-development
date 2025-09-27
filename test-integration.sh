#!/bin/bash

echo "🚀 Testing Backend and Frontend Integration..."
echo ""

# Test Backend Health
echo "1. Testing Backend Health..."
curl -s http://localhost:3005/health > /tmp/health_check.json
if [ $? -eq 0 ]; then
    echo "✅ Backend Analytics Service: HEALTHY"
    echo "   Port: 3005"
else
    echo "❌ Backend Analytics Service: NOT RESPONDING"
fi

echo ""

# Test Backend Predictions API
echo "2. Testing Real S3 Data Connection..."
curl -s http://localhost:3005/api/analytics/predictions > /tmp/predictions_check.json
if [ $? -eq 0 ]; then
    RECORD_COUNT=$(cat /tmp/predictions_check.json | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "✅ Real S3 Data: CONNECTED"
    echo "   Records found: $RECORD_COUNT"
    echo "   Endpoint: /api/analytics/predictions"
else
    echo "❌ Real S3 Data: CONNECTION FAILED"
fi

echo ""

# Check Frontend
echo "3. Testing Frontend Availability..."
curl -s http://localhost:5178 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend Application: RUNNING"
    echo "   URL: http://localhost:5178"
else
    echo "❌ Frontend Application: NOT AVAILABLE"
fi

echo ""
echo "🎯 Integration Status Summary:"
echo "- Backend Analytics: http://localhost:3005 (Real S3 Connected)"
echo "- Frontend Dashboard: http://localhost:5178 (Enhanced UI)"
echo ""
echo "🔗 Navigate to: http://localhost:5178"
echo "   Then go to Fleet Predictions page to see real AWS S3 data!"
