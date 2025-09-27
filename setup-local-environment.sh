#!/bin/bash

# BluFleet Local Environment Setup Script
# Version: 1.0.0
# Description: Complete setup for local development and testing

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
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

# Main setup function
main() {
    echo "🚀 BluFleet Local Environment Setup"
    echo "=================================="
    echo

    # Step 1: Check prerequisites
    log_step "1. Checking prerequisites..."
    
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "All prerequisites are installed"

    # Step 2: Create environment file
    log_step "2. Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        log_info "Creating .env file from .env.example..."
        cp .env.example .env
        
        # Update .env with local development settings
        cat > .env << EOF
# BluFleet Local Development Environment
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://blufleet:blufleet_dev_password@localhost:5432/blufleet
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=blufleet
DATABASE_USER=blufleet
DATABASE_PASSWORD=blufleet_dev_password
DATABASE_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=blufleet-dev-jwt-secret-change-in-production-2024
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
        log_success "Environment file created"
    else
        log_info "Environment file already exists"
    fi

    # Step 3: Install dependencies
    log_step "3. Installing dependencies..."
    
    log_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    log_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    log_success "Dependencies installed"

    # Step 4: Start database with Docker Compose
    log_step "4. Starting database services..."
    
    log_info "Starting PostgreSQL and Redis with Docker Compose..."
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if database is ready
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U blufleet -d blufleet > /dev/null 2>&1; then
            log_success "PostgreSQL is ready!"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "PostgreSQL failed to start"
        exit 1
    fi

    # Step 5: Setup database schema
    log_step "5. Setting up database schema..."
    
    log_info "Running database migrations..."
    docker-compose exec -T postgres psql -U blufleet -d blufleet -f /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
    
    log_info "Seeding sample data..."
    docker-compose exec -T postgres psql -U blufleet -d blufleet -f /docker-entrypoint-initdb.d/seeds/001_sample_data.sql
    
    log_success "Database setup complete"

    # Step 6: Create startup scripts
    log_step "6. Creating startup scripts..."
    
    # Backend startup script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting BluFleet Backend Server..."
cd backend
npm run dev
EOF
    chmod +x start-backend.sh
    
    # Frontend startup script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting BluFleet Frontend Server..."
cd frontend
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Complete system startup script
    cat > start-all-services.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting All BluFleet Services..."

# Start database services
echo "Starting database services..."
docker-compose up -d postgres redis

# Wait for database
echo "Waiting for database to be ready..."
sleep 10

# Start backend in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend in background
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "📊 Backend API: http://localhost:3000"
echo "🌐 Frontend App: http://localhost:5173"
echo "🗄️ Database: localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit' INT
wait
EOF
    chmod +x start-all-services.sh
    
    log_success "Startup scripts created"

    # Step 7: Create testing script
    log_step "7. Creating testing script..."
    
    cat > test-local-system.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing BluFleet Local System..."

# Test database connection
echo "Testing database connection..."
if docker-compose exec -T postgres pg_isready -U blufleet -d blufleet; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Failed"
    exit 1
fi

# Test backend health
echo "Testing backend health..."
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend: Healthy"
    curl -s http://localhost:3000/health | jq .
else
    echo "❌ Backend: Not responding"
fi

# Test frontend
echo "Testing frontend..."
if curl -f -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend: Accessible"
else
    echo "❌ Frontend: Not accessible"
fi

# Test API endpoints
echo "Testing API endpoints..."

# Test login
echo "Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blufleet.com","password":"password"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Authentication: Working"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
    
    # Test protected endpoints
    echo "Testing protected endpoints..."
    
    # Test vehicles endpoint
    if curl -f -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/vehicles > /dev/null; then
        echo "✅ Vehicles API: Working"
    else
        echo "❌ Vehicles API: Failed"
    fi
    
    # Test drivers endpoint
    if curl -f -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/drivers > /dev/null; then
        echo "✅ Drivers API: Working"
    else
        echo "❌ Drivers API: Failed"
    fi
    
    # Test analytics endpoint
    if curl -f -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/analytics/dashboard > /dev/null; then
        echo "✅ Analytics API: Working"
    else
        echo "❌ Analytics API: Failed"
    fi
    
else
    echo "❌ Authentication: Failed"
fi

echo ""
echo "🎉 Local system testing complete!"
echo "📊 Backend API: http://localhost:3000"
echo "🌐 Frontend App: http://localhost:5173"
echo "📚 API Docs: http://localhost:3000/api/docs"
EOF
    chmod +x test-local-system.sh
    
    log_success "Testing script created"

    # Final instructions
    echo
    echo "🎉 BluFleet Local Environment Setup Complete!"
    echo "============================================="
    echo
    echo "📋 Available Commands:"
    echo "  ./start-all-services.sh    - Start all services (database, backend, frontend)"
    echo "  ./start-backend.sh         - Start only backend server"
    echo "  ./start-frontend.sh        - Start only frontend server"
    echo "  ./test-local-system.sh     - Test all services"
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
    echo "🚀 Quick Start:"
    echo "  1. Run: ./start-all-services.sh"
    echo "  2. Wait for services to start (30-60 seconds)"
    echo "  3. Open: http://localhost:5173"
    echo "  4. Login with admin@blufleet.com / password"
    echo
    echo "🧪 To test the system:"
    echo "  ./test-local-system.sh"
    echo
}

# Run main function
main "$@"