#!/bin/bash
# Script to setup PostgreSQL database and user for BluFleet

echo "Setting up PostgreSQL database and user for BluFleet..."

# Variables
DB_NAME="blufleet"
DB_USER="postgres"
DB_PASSWORD="postgres"
CONTAINER_NAME="blufleet-postgres"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "PostgreSQL container is not running. Starting container..."
    docker-compose up -d postgres
    echo "Waiting for PostgreSQL to start..."
    sleep 10
fi

# Create database and user if they don't exist
echo "Setting up database and user..."
docker exec -i $CONTAINER_NAME psql -U postgres <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
EOF

# Apply migrations
echo "Applying migrations..."
for file in ./database/migrations/*.sql; do
    echo "Applying migration: $file"
    docker exec -i $CONTAINER_NAME psql -U postgres -d blufleet < "$file"
done

# Apply seed data
echo "Applying seed data..."
for file in ./database/seeds/*.sql; do
    echo "Applying seed data: $file"
    docker exec -i $CONTAINER_NAME psql -U postgres -d blufleet < "$file"
done

echo "Database setup complete!"
