#!/bin/bash

# FleetVolt Pro Backend Deployment Script
# This script handles the deployment of all microservices to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-west-2}
ECR_REGISTRY=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
CLUSTER_NAME="fleetvolt-${ENVIRONMENT}"

# Services to deploy
SERVICES=(
    "api-gateway"
    "fleet-monitoring"
    "energy-charging"
    "maintenance"
    "safety-compliance"
    "analytics"
    "insurance-finance"
    "integration-iot"
    "security-access"
)

# Functions
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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v aws >/dev/null 2>&1 || { log_error "AWS CLI is required but not installed. Aborting."; exit 1; }
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required but not installed. Aborting."; exit 1; }
    command -v helm >/dev/null 2>&1 || { log_error "Helm is required but not installed. Aborting."; exit 1; }
    
    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || { log_error "AWS credentials not configured. Aborting."; exit 1; }
    
    # Check if environment is valid
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or production."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

setup_infrastructure() {
    log_info "Setting up infrastructure with Terraform..."
    
    cd infrastructure
    
    # Initialize Terraform
    terraform init -backend-config="key=infrastructure/${ENVIRONMENT}/terraform.tfstate"
    
    # Plan infrastructure changes
    terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan
    
    # Apply infrastructure changes
    if [[ "$ENVIRONMENT" == "production" ]]; then
        read -p "Are you sure you want to deploy to production? (yes/no): " confirm
        if [[ $confirm != "yes" ]]; then
            log_warning "Production deployment cancelled"
            exit 0
        fi
    fi
    
    terraform apply tfplan
    
    # Get cluster credentials
    aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
    
    cd ..
    log_success "Infrastructure setup completed"
}

build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
    
    for service in "${SERVICES[@]}"; do
        log_info "Building $service..."
        
        # Build Docker image
        docker build -t fleetvolt-$service:latest services/$service/
        
        # Tag for ECR
        docker tag fleetvolt-$service:latest $ECR_REGISTRY/fleetvolt-$service:latest
        docker tag fleetvolt-$service:latest $ECR_REGISTRY/fleetvolt-$service:$ENVIRONMENT-$(git rev-parse --short HEAD)
        
        # Push to ECR
        docker push $ECR_REGISTRY/fleetvolt-$service:latest
        docker push $ECR_REGISTRY/fleetvolt-$service:$ENVIRONMENT-$(git rev-parse --short HEAD)
        
        log_success "$service image built and pushed"
    done
}

deploy_services() {
    log_info "Deploying services to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace fleetvolt-$ENVIRONMENT --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy each service using Helm
    for service in "${SERVICES[@]}"; do
        log_info "Deploying $service..."
        
        helm upgrade --install \
            fleetvolt-$service \
            ./helm/fleetvolt-service \
            --namespace fleetvolt-$ENVIRONMENT \
            --set image.repository=$ECR_REGISTRY/fleetvolt-$service \
            --set image.tag=$ENVIRONMENT-$(git rev-parse --short HEAD) \
            --set environment=$ENVIRONMENT \
            --set service.name=$service \
            --values ./helm/values-$ENVIRONMENT.yaml \
            --values ./helm/values-$service.yaml \
            --wait \
            --timeout=10m
        
        log_success "$service deployed successfully"
    done
}

run_database_migrations() {
    log_info "Running database migrations..."
    
    # Get database credentials from Secrets Manager
    DB_SECRET=$(aws secretsmanager get-secret-value --secret-id fleetvolt-$ENVIRONMENT-database-credentials --query SecretString --output text)
    DB_HOST=$(echo $DB_SECRET | jq -r '.host')
    DB_USER=$(echo $DB_SECRET | jq -r '.username')
    DB_PASS=$(echo $DB_SECRET | jq -r '.password')
    DB_NAME=$(echo $DB_SECRET | jq -r '.dbname')
    
    # Run migrations using a Kubernetes job
    kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: fleetvolt-migrations-$(date +%s)
  namespace: fleetvolt-$ENVIRONMENT
spec:
  template:
    spec:
      containers:
      - name: migrations
        image: $ECR_REGISTRY/fleetvolt-migrations:latest
        env:
        - name: DATABASE_URL
          value: "postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME"
        - name: ENVIRONMENT
          value: "$ENVIRONMENT"
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    # Wait for migration job to complete
    kubectl wait --for=condition=complete job/fleetvolt-migrations-$(date +%s) --namespace fleetvolt-$ENVIRONMENT --timeout=300s
    
    log_success "Database migrations completed"
}

setup_monitoring() {
    log_info "Setting up monitoring and observability..."
    
    # Deploy Prometheus and Grafana
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    
    # Install Prometheus
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --values ./monitoring/prometheus-values.yaml \
        --wait
    
    # Install Grafana dashboards
    kubectl apply -f ./monitoring/grafana-dashboards/ --namespace monitoring
    
    # Deploy Jaeger for distributed tracing
    kubectl apply -f ./monitoring/jaeger.yaml --namespace monitoring
    
    log_success "Monitoring setup completed"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for all services to be ready
    for service in "${SERVICES[@]}"; do
        log_info "Checking health of $service..."
        
        kubectl wait --for=condition=available deployment/fleetvolt-$service \
            --namespace fleetvolt-$ENVIRONMENT \
            --timeout=300s
        
        # Test service endpoint
        SERVICE_URL=$(kubectl get service fleetvolt-$service -n fleetvolt-$ENVIRONMENT -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        
        if [[ -n "$SERVICE_URL" ]]; then
            curl -f http://$SERVICE_URL/health || log_warning "$service health check failed"
        fi
    done
    
    log_success "Health checks completed"
}

run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Run smoke tests using a Kubernetes job
    kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: fleetvolt-smoke-tests-$(date +%s)
  namespace: fleetvolt-$ENVIRONMENT
spec:
  template:
    spec:
      containers:
      - name: smoke-tests
        image: $ECR_REGISTRY/fleetvolt-smoke-tests:latest
        env:
        - name: ENVIRONMENT
          value: "$ENVIRONMENT"
        - name: API_BASE_URL
          value: "https://api-$ENVIRONMENT.fleetvolt.com"
      restartPolicy: Never
  backoffLimit: 1
EOF
    
    # Wait for smoke tests to complete
    kubectl wait --for=condition=complete job/fleetvolt-smoke-tests-$(date +%s) --namespace fleetvolt-$ENVIRONMENT --timeout=600s
    
    log_success "Smoke tests completed"
}

cleanup_old_resources() {
    log_info "Cleaning up old resources..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Clean up old Kubernetes jobs
    kubectl delete jobs --field-selector status.successful=1 --namespace fleetvolt-$ENVIRONMENT
    
    log_success "Cleanup completed"
}

send_deployment_notification() {
    log_info "Sending deployment notification..."
    
    # Send Slack notification (if webhook URL is configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"FleetVolt Pro $ENVIRONMENT deployment completed successfully! 🚀\"}" \
            $SLACK_WEBHOOK_URL
    fi
    
    # Send email notification (if configured)
    if [[ -n "$NOTIFICATION_EMAIL" ]]; then
        aws ses send-email \
            --source "deployments@fleetvolt.com" \
            --destination "ToAddresses=$NOTIFICATION_EMAIL" \
            --message "Subject={Data='FleetVolt Pro Deployment Complete'},Body={Text={Data='FleetVolt Pro $ENVIRONMENT deployment completed successfully at $(date)'}}"
    fi
    
    log_success "Deployment notification sent"
}

# Main deployment flow
main() {
    log_info "Starting FleetVolt Pro deployment to $ENVIRONMENT environment..."
    
    check_prerequisites
    setup_infrastructure
    build_and_push_images
    deploy_services
    run_database_migrations
    setup_monitoring
    run_health_checks
    run_smoke_tests
    cleanup_old_resources
    send_deployment_notification
    
    log_success "🎉 FleetVolt Pro deployment to $ENVIRONMENT completed successfully!"
    log_info "API Gateway URL: https://api-$ENVIRONMENT.fleetvolt.com"
    log_info "Monitoring Dashboard: https://grafana-$ENVIRONMENT.fleetvolt.com"
    log_info "Documentation: https://docs-$ENVIRONMENT.fleetvolt.com"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"