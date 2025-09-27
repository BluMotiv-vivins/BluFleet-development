#!/bin/bash

# BluFleet Database Real-Time Data Updater
# This script simulates real-time updates to vehicle data in the database
# Run this script in the background to keep data fresh

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="blufleet"
DB_USER="blufleet"
DB_PASSWORD="blufleet_dev_password"
UPDATE_INTERVAL=30  # seconds

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}BluFleet Real-Time Data Updater${NC}"
echo -e "${BLUE}==============================${NC}"
echo -e "This script will update vehicle data in the database every ${YELLOW}${UPDATE_INTERVAL}${NC} seconds."
echo -e "Press Ctrl+C to stop at any time."
echo ""

# Function to log with timestamp
log() {
  echo -e "$(date "+%Y-%m-%d %H:%M:%S") $1"
}

# Check PostgreSQL is available
if ! command -v psql &> /dev/null; then
  echo -e "${RED}Error: PostgreSQL client not found.${NC}"
  echo "Please install PostgreSQL client before running this script."
  exit 1
fi

# Function to run SQL query
run_query() {
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$1"
}

# Get vehicle count
VEHICLE_COUNT=$(run_query "SELECT COUNT(*) FROM vehicles")
if [ -z "$VEHICLE_COUNT" ] || [ "$VEHICLE_COUNT" -eq 0 ]; then
  echo -e "${RED}Error: No vehicles found in database.${NC}"
  exit 1
fi

log "${GREEN}Found ${VEHICLE_COUNT} vehicles in the database.${NC}"

# Main update loop
while true; do
  # Get all vehicle IDs
  VEHICLE_IDS=$(run_query "SELECT id FROM vehicles")
  
  for ID in $VEHICLE_IDS; do
    # Skip blank lines
    if [ -z "$ID" ]; then
      continue
    fi
    
    # Generate random data
    SOC=$(awk -v min=10 -v max=100 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
    LATITUDE_CHANGE=$(awk 'BEGIN{srand(); print (rand()-0.5)/1000}')
    LONGITUDE_CHANGE=$(awk 'BEGIN{srand(); print (rand()-0.5)/1000}')
    ODOMETER_INCREASE=$(awk 'BEGIN{srand(); print int(rand()*10)}')
    
    # Update vehicle data
    run_query "
      UPDATE vehicles
      SET 
        current_battery_soc = $SOC,
        current_location = ST_Translate(current_location, $LONGITUDE_CHANGE, $LATITUDE_CHANGE),
        odometer_km = odometer_km + $ODOMETER_INCREASE,
        updated_at = NOW()
      WHERE id = '$ID'
    " > /dev/null
    
    log "${GREEN}Updated vehicle ${ID}:${NC} Battery: ${SOC}%, Position: +${LATITUDE_CHANGE},+${LONGITUDE_CHANGE}, Odometer: +${ODOMETER_INCREASE}km"
  done
  
  echo -e "${BLUE}Sleeping for ${UPDATE_INTERVAL} seconds...${NC}"
  sleep $UPDATE_INTERVAL
done
