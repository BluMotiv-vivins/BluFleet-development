#!/bin/bash

# BluFleet Local Development Startup (No Docker Required)
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    log_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Cleanup function
cleanup() {
    log_info "Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

main() {
    echo "🚀 BluFleet Local Development Environment"
    echo "========================================"
    echo
    
    # Check if ports are available
    log_step "1. Checking port availability..."
    
    if ! check_port 3000; then
        log_error "Port 3000 is already in use. Please stop the service using this port."
        exit 1
    fi
    
    if ! check_port 5173; then
        log_error "Port 5173 is already in use. Please stop the service using this port."
        exit 1
    fi
    
    log_success "Ports 3000 and 5173 are available"

    # Create environment file for development
    log_step "2. Setting up development environment..."
    
    cat > .env << 'EOF'
# BluFleet Development Environment (No Database)
NODE_ENV=development
PORT=3000

# Mock Database (No real database required)
DATABASE_URL=mock://localhost/blufleet
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=blufleet
DATABASE_USER=blufleet
DATABASE_PASSWORD=blufleet_dev_password

# JWT Configuration
JWT_SECRET=blufleet-dev-jwt-secret-2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Development Settings
DEV_BYPASS_AUTH=false
MOCK_EXTERNAL_SERVICES=true

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_ENVIRONMENT=development
EOF
    
    log_success "Environment configured for development"

    # Install dependencies if needed
    log_step "3. Checking dependencies..."
    
    if [ ! -d "backend/node_modules" ]; then
        log_info "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        log_info "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    log_success "Dependencies ready"

    # Start backend server
    log_step "4. Starting backend server..."
    
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    log_info "Backend starting on port 3000..."
    
    # Wait for backend to be ready
    if wait_for_service "Backend API" "http://localhost:3000/health"; then
        log_success "Backend server is running!"
    else
        log_error "Backend failed to start"
        cleanup
        exit 1
    fi

    # Start frontend server
    log_step "5. Starting frontend server..."
    
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_info "Frontend starting on port 5173..."
    
    # Wait for frontend to be ready
    sleep 5
    if wait_for_service "Frontend App" "http://localhost:5173"; then
        log_success "Frontend server is running!"
    else
        log_warning "Frontend may still be starting..."
    fi

    # Display access information
    echo
    echo "🎉 BluFleet Development Environment Ready!"
    echo "========================================"
    echo
    echo "🌐 Access Points:"
    echo "  Frontend App:     http://localhost:5173"
    echo "  Backend API:      http://localhost:3000"
    echo "  API Health:       http://localhost:3000/health"
    echo "  API Docs:         http://localhost:3000/api/docs"
    echo
    echo "🔐 Test Credentials:"
    echo "  Admin:    admin@blufleet.com / password"
    echo "  Manager:  manager@blufleet.com / password"
    echo
    echo "📊 Available API Endpoints:"
    echo "  POST /api/auth/login           - User authentication"
    echo "  GET  /api/vehicles             - List vehicles"
    echo "  GET  /api/drivers              - List drivers"
    echo "  GET  /api/trips                - List trips"
    echo "  GET  /api/alerts               - List alerts"
    echo "  GET  /api/analytics/dashboard  - Dashboard metrics"
    echo
    echo "🧪 Test the APIs:"
    echo "  curl http://localhost:3000/health"
    echo "  curl -X POST http://localhost:3000/api/auth/login \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"email\":\"admin@blufleet.com\",\"password\":\"password\"}'"
    echo
    echo "Press Ctrl+C to stop all services"
    echo

    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"