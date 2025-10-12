#!/bin/bash

# Redis Weekly Backup Script
# Rate Limiting Implementation - Resumate

set -e

# Configuration
BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d-%H%M%S)
CONTAINER_NAME="resumate-redis"
RETENTION_WEEKS=8

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Redis Backup Script ===${NC}"
echo "Timestamp: $(date)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: Container $CONTAINER_NAME is not running${NC}"
    exit 1
fi

# Trigger Redis save
echo -e "${YELLOW}Triggering Redis BGSAVE...${NC}"
docker exec "$CONTAINER_NAME" redis-cli BGSAVE

# Wait for save to complete
echo -e "${YELLOW}Waiting for save to complete...${NC}"
sleep 5

while docker exec "$CONTAINER_NAME" redis-cli LASTSAVE | grep -q "still running"; do
    echo "Waiting..."
    sleep 2
done

# Copy dump file
echo -e "${YELLOW}Copying Redis dump file...${NC}"
docker cp "$CONTAINER_NAME:/data/dump.rdb" "$BACKUP_DIR/redis-$DATE.rdb"

if [ $? -eq 0 ]; then
    # Also copy AOF if exists
    if docker exec "$CONTAINER_NAME" test -f /data/appendonly.aof; then
        docker cp "$CONTAINER_NAME:/data/appendonly.aof" "$BACKUP_DIR/redis-$DATE.aof"
    fi
    
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/redis-$DATE.rdb" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully: redis-$DATE.rdb (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up backups older than $RETENTION_WEEKS weeks...${NC}"
find "$BACKUP_DIR" -name "redis-*" -mtime +$(($RETENTION_WEEKS * 7)) -delete

# List recent backups
echo -e "${GREEN}Recent backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -5

echo -e "${GREEN}=== Backup Complete ===${NC}"

