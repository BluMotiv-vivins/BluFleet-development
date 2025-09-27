# BluFleet Frontend Dockerfile
# Multi-stage build for development and production

# Base stage with Node.js
FROM node:18-alpine AS base
WORKDIR /app

# Development stage
FROM base AS development

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S blufleet -u 1001

# Set ownership
RUN chown -R blufleet:nodejs /usr/share/nginx/html
RUN chown -R blufleet:nodejs /var/cache/nginx
RUN chown -R blufleet:nodejs /var/log/nginx
RUN chown -R blufleet:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER blufleet

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]