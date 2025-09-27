#!/bin/bash

echo "🚀 Starting FleetVolt Pro with Real AWS S3 Integration..."
echo ""

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node simple-server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

echo ""
echo "📊 Starting Backend Analytics Service (Real S3 Data)..."
cd /Users/vivinvarshans/Desktop/mockfleet/backend/services/analytics

# Start analytics service in background
nohup node simple-server.js > analytics.log 2>&1 &
ANALYTICS_PID=$!

# Wait a moment for service to start
sleep 3

# Check if analytics service started successfully
if check_port 3005; then
    echo "✅ Analytics Service: RUNNING on http://localhost:3005"
    echo "   - Real S3 bucket: blufleet-predictions-20250826"
    echo "   - Time-based folders: year/month/day structure"
    echo "   - Live data: $(curl -s http://localhost:3005/api/analytics/predictions | grep -o '"total":[0-9]*' | cut -d':' -f2) records"
else
    echo "❌ Analytics Service: FAILED TO START"
    exit 1
fi

echo ""
echo "🎨 Starting Frontend Application..."
cd /Users/vivinvarshans/Desktop/mockfleet/frontend

# Start frontend in background
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Find the actual port used by Vite
FRONTEND_PORT=$(grep -o "http://localhost:[0-9]*" frontend.log | head -1 | grep -o "[0-9]*")

if [ ! -z "$FRONTEND_PORT" ]; then
    echo "✅ Frontend Application: RUNNING on http://localhost:$FRONTEND_PORT"
    echo "   - Enhanced Fleet Predictions dashboard"
    echo "   - Fixed 3x3 layout (no more congestion)"
    echo "   - Real-time AWS S3 data integration"
else
    echo "❌ Frontend Application: FAILED TO START"
    echo "   Check frontend.log for details"
fi

echo ""
echo "🎯 INTEGRATION COMPLETE!"
echo "============================================"
echo "Backend Analytics:  http://localhost:3005"
echo "Frontend Dashboard: http://localhost:$FRONTEND_PORT"
echo "============================================"
echo ""
echo "📱 To view your enhanced Fleet Predictions:"
echo "1. Open: http://localhost:$FRONTEND_PORT"
echo "2. Navigate to Fleet Predictions page"
echo "3. See real AWS S3 data with professional 3x3 layout!"
echo ""
echo "🔍 Real S3 Data Features:"
echo "- Live data from blufleet-predictions-20250826 bucket"
echo "- Time-based folder structure (US East timezone)"
echo "- Real CSV records with IoT Core integration"
echo "- Auto-refresh every 30 seconds"
echo ""
echo "📋 Process IDs:"
echo "Analytics: $ANALYTICS_PID"
echo "Frontend:  $FRONTEND_PID"
echo ""
echo "🛑 To stop services: pkill -f 'simple-server.js' && pkill -f 'vite'"
