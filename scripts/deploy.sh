#!/bin/bash

# BluFleet Deployment Script
# Version: 1.0.0
# Usage: ./scripts/deploy.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_NAME="blufleet"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Environment-specific configuration
setup_environment() {
    log_info "Setting up environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        "development")
            DOCKER_COMPOSE_FILE="docker-compose.yml"
            ;;
        "staging")
            DOCKER_COMPOSE_FILE="docker-compose.staging.yml"
            ;;
        "production")
            DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            log_info "Available environments: development, staging, production"
            exit 1
            ;;
    esac
    
    # Check if compose file exists
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Environment configuration loaded"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Build backend
    log_info "Building backend services..."
    cd backend
    npm install
    npm run build
    cd ..
    
    # Build frontend
    log_info "Building frontend application..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    log_success "Application build completed"
}

# Database operations
setup_database() {
    log_info "Setting up database..."
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    timeout=60
    while ! docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_isready -U blufleet -d blufleet; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            log_error "Database connection timeout"
            exit 1
        fi
    done
    
    # Run migrations
    log_info "Running database migrations..."
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U blufleet -d blufleet -f /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
    
    # Seed data (only for development)
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "Seeding development data..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U blufleet -d blufleet -f /docker-entrypoint-initdb.d/seeds/001_sample_data.sql
    fi
    
    log_success "Database setup completed"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    # Pull latest images (for production)
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Pulling latest images..."
        docker-compose -f $DOCKER_COMPOSE_FILE pull
    fi
    
    # Build and start services
    log_info "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --build
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Services deployed successfully"
}

# Health check
check_service_health() {
    log_info "Checking service health..."
    
    services=(
        "http://localhost:3000/health:API Gateway"
        "http://localhost:3001/health:Fleet Monitoring"
        "http://localhost:3002/health:Energy & Charging"
        "http://localhost:3003/health:Maintenance"
        "http://localhost:3004/health:Safety & Compliance"
        "http://localhost:3005/health:Analytics"
        "http://localhost:5173:Frontend"
    )
    
    for service in "${services[@]}"; do
        url=$(echo $service | cut -d: -f1)
        name=$(echo $service | cut -d: -f2)
        
        if curl -f -s "$url" > /dev/null; then
            log_success "$name is healthy"
        else
            log_warning "$name health check failed"
        fi
    done
}

# Cleanup old resources
cleanup() {
    log_info "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes (be careful in production)
    if [ "$ENVIRONMENT" = "development" ]; then
        docker volume prune -f
    fi
    
    log_success "Cleanup completed"
}

# Backup (for production)
backup_data() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating backup..."
        
        # Create backup directory
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p $BACKUP_DIR
        
        # Backup database
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_dump -U blufleet blufleet > $BACKUP_DIR/database.sql
        
        # Backup environment file
        cp .env $BACKUP_DIR/
        
        log_success "Backup created: $BACKUP_DIR"
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Restore from backup (implement as needed)
    log_info "Rollback completed"
}

# Main deployment function
main() {
    log_info "Starting BluFleet deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Timestamp: $(date)"
    
    # Trap errors for rollback
    trap 'log_error "Deployment failed! Rolling back..."; rollback; exit 1' ERR
    
    check_prerequisites
    setup_environment
    
    # Backup before deployment (production only)
    backup_data
    
    build_application
    deploy_services
    setup_database
    cleanup
    
    log_success "BluFleet deployment completed successfully!"
    log_info "Access the application at:"
    log_info "  Frontend: http://localhost:5173"
    log_info "  API: http://localhost:3000"
    log_info "  Documentation: http://localhost:3000/docs"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi