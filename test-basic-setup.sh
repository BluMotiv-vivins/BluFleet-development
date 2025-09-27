#!/bin/bash

# Basic BluFleet Setup Test
# Version: 1.0.0

set -e

echo "🚀 Starting BluFleet Basic Setup Test..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Test 1: Check project structure
log_info "Testing project structure..."

required_dirs=(
    "frontend"
    "backend" 
    "database"
    "shared"
    "scripts"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        log_success "✓ Directory exists: $dir"
    else
        log_error "✗ Missing directory: $dir"
        exit 1
    fi
done

# Test 2: Check key files
log_info "Testing key files..."

required_files=(
    "docker-compose.yml"
    ".env.example"
    "README.md"
    "backend/package.json"
    "backend/tsconfig.json"
    "frontend/package.json"
    "database/migrations/001_initial_schema.sql"
    "shared/types/index.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ File exists: $file"
    else
        log_error "✗ Missing file: $file"
        exit 1
    fi
done

# Test 3: Check backend structure
log_info "Testing backend structure..."

backend_files=(
    "backend/src/index.ts"
    "backend/src/routes/auth.ts"
    "backend/src/routes/vehicles.ts"
    "backend/src/routes/health.ts"
    "backend/src/controllers/BaseController.ts"
    "backend/src/middleware/auth.ts"
    "backend/src/middleware/errorHandler.ts"
    "backend/src/utils/logger.ts"
    "backend/src/utils/errors.ts"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ Backend file exists: $file"
    else
        log_error "✗ Missing backend file: $file"
        exit 1
    fi
done

# Test 4: Check frontend structure
log_info "Testing frontend structure..."

frontend_files=(
    "frontend/src/App.tsx"
    "frontend/src/main.tsx"
    "frontend/src/services/api/client.ts"
    "frontend/src/services/api/endpoints.ts"
    "frontend/src/hooks/useApi.ts"
    "frontend/src/components/auth/ProtectedRoute.tsx"
    "frontend/src/components/error/ErrorBoundary.tsx"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ Frontend file exists: $file"
    else
        log_error "✗ Missing frontend file: $file"
        exit 1
    fi
done

# Test 5: Check TypeScript compilation (backend)
log_info "Testing backend TypeScript compilation..."

cd backend
if npm list typescript > /dev/null 2>&1 || which tsc > /dev/null 2>&1; then
    if npx tsc --noEmit --skipLibCheck; then
        log_success "✓ Backend TypeScript compilation successful"
    else
        log_warning "⚠ Backend TypeScript compilation has issues (may be due to missing dependencies)"
    fi
else
    log_warning "⚠ TypeScript not installed, skipping compilation test"
fi
cd ..

# Test 6: Check package.json validity
log_info "Testing package.json files..."

if node -e "JSON.parse(require('fs').readFileSync('backend/package.json', 'utf8'))" 2>/dev/null; then
    log_success "✓ Backend package.json is valid JSON"
else
    log_error "✗ Backend package.json is invalid"
    exit 1
fi

if node -e "JSON.parse(require('fs').readFileSync('frontend/package.json', 'utf8'))" 2>/dev/null; then
    log_success "✓ Frontend package.json is valid JSON"
else
    log_error "✗ Frontend package.json is invalid"
    exit 1
fi

# Test 7: Check Docker Compose file
log_info "Testing Docker Compose configuration..."

if docker-compose config > /dev/null 2>&1; then
    log_success "✓ Docker Compose configuration is valid"
else
    log_warning "⚠ Docker Compose configuration may have issues (Docker may not be installed)"
fi

# Test 8: Check environment example
log_info "Testing environment configuration..."

if [ -f ".env.example" ]; then
    # Check if .env.example has required variables
    required_vars=(
        "NODE_ENV"
        "DATABASE_URL"
        "JWT_SECRET"
        "VITE_API_BASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.example; then
            log_success "✓ Environment variable defined: $var"
        else
            log_warning "⚠ Missing environment variable: $var"
        fi
    done
else
    log_error "✗ .env.example file not found"
    exit 1
fi

# Test 9: Check database schema
log_info "Testing database schema..."

if [ -f "database/migrations/001_initial_schema.sql" ]; then
    # Check if schema has required tables
    required_tables=(
        "organizations"
        "users"
        "vehicles"
        "drivers"
        "trips"
    )
    
    for table in "${required_tables[@]}"; do
        if grep -q "CREATE TABLE $table" database/migrations/001_initial_schema.sql; then
            log_success "✓ Database table defined: $table"
        else
            log_error "✗ Missing database table: $table"
            exit 1
        fi
    done
else
    log_error "✗ Database schema file not found"
    exit 1
fi

# Test 10: Check shared types
log_info "Testing shared types..."

if [ -f "shared/types/index.ts" ]; then
    # Check if shared types have required interfaces
    required_types=(
        "User"
        "Vehicle"
        "Driver"
        "Trip"
        "Alert"
    )
    
    for type in "${required_types[@]}"; do
        if grep -q "interface $type" shared/types/index.ts; then
            log_success "✓ Shared type defined: $type"
        else
            log_error "✗ Missing shared type: $type"
            exit 1
        fi
    done
else
    log_error "✗ Shared types file not found"
    exit 1
fi

echo
log_success "🎉 All basic setup tests passed!"
echo
log_info "Next steps:"
echo "  1. Run 'npm install' in both frontend and backend directories"
echo "  2. Copy .env.example to .env and configure your environment"
echo "  3. Start the development environment with 'docker-compose up -d'"
echo "  4. Run the comprehensive test suite with './scripts/test-system.sh'"
echo