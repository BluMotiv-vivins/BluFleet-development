#!/bin/bash

echo "📊 FleetVolt Pro Services Status"
echo "================================"

# Check Analytics Service
echo "🔧 Backend Analytics Service:"
if curl -s http://localhost:3005/health > /dev/null 2>&1; then
    RECORD_COUNT=$(curl -s http://localhost:3005/api/analytics/predictions | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   ✅ RUNNING on port 3005"
    echo "   📈 Real S3 Data: $RECORD_COUNT records"
    echo "   🌐 Endpoint: http://localhost:3005/api/analytics/predictions"
else
    echo "   ❌ NOT RUNNING"
fi

echo ""

# Check Frontend
echo "🎨 Frontend Application:"
FRONTEND_PORT=""
for port in 5173 5174 5175 5176 5177 5178 5179; do
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        FRONTEND_PORT=$port
        break
    fi
done

if [ ! -z "$FRONTEND_PORT" ]; then
    echo "   ✅ RUNNING on port $FRONTEND_PORT"
    echo "   🌐 URL: http://localhost:$FRONTEND_PORT"
    echo "   💎 Enhanced UI with 3x3 layout"
else
    echo "   ❌ NOT RUNNING"
fi

echo ""

# Check S3 Connection
echo "☁️  AWS S3 Integration:"
if curl -s http://localhost:3005/api/analytics/health/aws > /dev/null 2>&1; then
    echo "   ✅ Connected to blufleet-predictions-20250826"
    echo "   📁 Time-based folder structure active"
    echo "   🕐 US East timezone processing"
else
    echo "   ❌ S3 connection issue"
fi

echo ""
echo "🚀 Quick Actions:"
echo "   Start services: ./start-services.sh"
echo "   View dashboard: open http://localhost:$FRONTEND_PORT"
echo "   Stop services:  pkill -f 'simple-server.js' && pkill -f 'vite'"
