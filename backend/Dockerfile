# BluFleet Backend Dockerfile
# Multi-stage build for development and production

# Base stage with Node.js
FROM node:18-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Copy package files
COPY package*.json ./
COPY services/*/package*.json ./services/

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS production-deps

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache postgresql-client

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S blufleet -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=production-deps --chown=blufleet:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=blufleet:nodejs /app/dist ./dist
COPY --from=build --chown=blufleet:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown blufleet:nodejs logs

# Switch to non-root user
USER blufleet

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Start application
CMD ["node", "dist/index.js"]