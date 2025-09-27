# FleetVolt Pro Deployment Guide

## Overview

This guide covers the deployment process for FleetVolt Pro, including environment setup, build configuration, and deployment to various platforms.

## Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)
- Access to deployment environment (AWS, Azure, GCP, etc.)

## Environment Configuration

### Environment Variables

Create environment files for different deployment stages:

#### `.env.production`

```bash
# API Configuration
VITE_API_BASE_URL=https://api.fleetvolt.com/v1
VITE_WS_URL=wss://api.fleetvolt.com/ws

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true

# Monitoring
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA_TRACKING_ID=your_ga_id

# Build Configuration
VITE_BUILD_VERSION=1.0.0
VITE_BUILD_TIMESTAMP=2024-01-01T00:00:00Z
```

#### `.env.staging`

```bash
# API Configuration
VITE_API_BASE_URL=https://api-staging.fleetvolt.com/v1
VITE_WS_URL=wss://api-staging.fleetvolt.com/ws

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_staging_mapbox_token

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=false

# Debug Mode
VITE_DEBUG_MODE=true
```

## Build Process

### Production Build

```bash
# Install dependencies
npm ci

# Run tests
npm run test:coverage

# Build for production
npm run build

# Preview build locally
npm run preview
```

### Build Optimization

The production build includes:

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Removes unused code
- **Minification**: JavaScript and CSS minification
- **Asset Optimization**: Image compression and optimization
- **Bundle Analysis**: Generate bundle size reports

### Build Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "build:analyze": "vite build --mode production && npx vite-bundle-analyzer dist",
    "build:docker": "docker build -t fleetvolt-pro ."
  }
}
```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Security: Hide nginx version
        server_tokens off;
    }
}
```

### Docker Compose

Create `docker-compose.yml` for local development:

```yaml
version: '3.8'

services:
  fleetvolt-pro:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Cloud Deployment

### AWS Deployment

#### Using AWS S3 + CloudFront

1. **Build the application**:
   ```bash
   npm run build:production
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **CloudFront Configuration**:
   ```json
   {
     "Origins": [{
       "DomainName": "your-bucket-name.s3.amazonaws.com",
       "Id": "S3-fleetvolt-pro"
     }],
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-fleetvolt-pro",
       "ViewerProtocolPolicy": "redirect-to-https"
     },
     "CustomErrorResponses": [{
       "ErrorCode": 404,
       "ResponseCode": 200,
       "ResponsePagePath": "/index.html"
     }]
   }
   ```

#### Using AWS ECS

1. **Build and push Docker image**:
   ```bash
   docker build -t fleetvolt-pro .
   docker tag fleetvolt-pro:latest your-account.dkr.ecr.region.amazonaws.com/fleetvolt-pro:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/fleetvolt-pro:latest
   ```

2. **ECS Task Definition**:
   ```json
   {
     "family": "fleetvolt-pro",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [{
       "name": "fleetvolt-pro",
       "image": "your-account.dkr.ecr.region.amazonaws.com/fleetvolt-pro:latest",
       "portMappings": [{
         "containerPort": 80,
         "protocol": "tcp"
       }],
       "essential": true,
       "logConfiguration": {
         "logDriver": "awslogs",
         "options": {
           "awslogs-group": "/ecs/fleetvolt-pro",
           "awslogs-region": "us-west-2",
           "awslogs-stream-prefix": "ecs"
         }
       }
     }]
   }
   ```

### Azure Deployment

#### Using Azure Static Web Apps

1. **GitHub Actions Workflow** (`.github/workflows/azure-static-web-apps.yml`):
   ```yaml
   name: Azure Static Web Apps CI/CD

   on:
     push:
       branches: [ main ]
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches: [ main ]

   jobs:
     build_and_deploy_job:
       if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
       runs-on: ubuntu-latest
       name: Build and Deploy Job
       steps:
         - uses: actions/checkout@v2
           with:
             submodules: true
         - name: Build And Deploy
           id: builddeploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             action: "upload"
             app_location: "/"
             api_location: ""
             output_location: "dist"
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and deploy**:
   ```bash
   gcloud builds submit --tag gcr.io/your-project/fleetvolt-pro
   gcloud run deploy fleetvolt-pro --image gcr.io/your-project/fleetvolt-pro --platform managed --region us-central1 --allow-unauthenticated
   ```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:production
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_MAPBOX_ACCESS_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Monitoring and Logging

### Application Monitoring

1. **Sentry Integration**:
   ```typescript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     tracesSampleRate: 1.0,
   });
   ```

2. **Google Analytics**:
   ```typescript
   import { gtag } from 'ga-gtag';

   gtag('config', import.meta.env.VITE_GA_TRACKING_ID);
   ```

### Performance Monitoring

1. **Web Vitals**:
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

2. **Custom Metrics**:
   ```typescript
   // Track component render times
   const trackRenderTime = (componentName: string, duration: number) => {
     gtag('event', 'timing_complete', {
       name: componentName,
       value: Math.round(duration)
     });
   };
   ```

## Security Considerations

### Content Security Policy

Add CSP headers in your deployment:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https:; connect-src 'self' https://api.fleetvolt.com wss://api.fleetvolt.com https://api.mapbox.com;
```

### Environment Security

- Use environment variables for sensitive configuration
- Never commit API keys or secrets to version control
- Use secrets management services (AWS Secrets Manager, Azure Key Vault, etc.)
- Implement proper CORS policies
- Use HTTPS in production

## Rollback Strategy

### Blue-Green Deployment

1. **Deploy to staging environment**
2. **Run smoke tests**
3. **Switch traffic to new version**
4. **Monitor for issues**
5. **Rollback if necessary**

### Rollback Commands

```bash
# AWS S3 + CloudFront
aws s3 sync s3://backup-bucket/ s3://production-bucket/ --delete
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"

# Docker
docker tag fleetvolt-pro:previous fleetvolt-pro:latest
docker-compose up -d
```

## Performance Optimization

### Build Optimizations

1. **Bundle Splitting**:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@heroicons/react'],
             maps: ['mapbox-gl'],
           },
         },
       },
     },
   });
   ```

2. **Asset Optimization**:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       assetsInlineLimit: 4096,
       cssCodeSplit: true,
       sourcemap: false,
     },
   });
   ```

### Runtime Optimizations

1. **Lazy Loading**:
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const FleetTracking = lazy(() => import('./pages/FleetTracking'));
   ```

2. **Service Worker**:
   ```typescript
   // Register service worker for caching
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Runtime Errors**:
   - Check environment variables
   - Verify API endpoints are accessible
   - Check browser console for errors

3. **Performance Issues**:
   - Analyze bundle size with `npm run build:analyze`
   - Check for memory leaks in components
   - Optimize images and assets

### Debugging

1. **Enable debug mode**:
   ```bash
   VITE_DEBUG_MODE=true npm run dev
   ```

2. **Check build output**:
   ```bash
   npm run build -- --debug
   ```

3. **Analyze bundle**:
   ```bash
   npx vite-bundle-analyzer dist
   ```

## Support

For deployment support:
- Documentation: https://docs.fleetvolt.com/deployment
- Support Email: devops@fleetvolt.com
- Slack Channel: #deployment-support