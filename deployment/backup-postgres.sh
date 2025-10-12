#!/bin/bash

# PostgreSQL Daily Backup Script
# Rate Limiting Implementation - Resumate

set -e

# Configuration
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d-%H%M%S)
CONTAINER_NAME="resumate-postgres"
DB_NAME="resumate"
DB_USER="postgres"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== PostgreSQL Backup Script ===${NC}"
echo "Timestamp: $(date)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: Container $CONTAINER_NAME is not running${NC}"
    exit 1
fi

# Create backup
echo -e "${YELLOW}Creating PostgreSQL backup...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" \
    | gzip > "$BACKUP_DIR/postgres-$DATE.sql.gz"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/postgres-$DATE.sql.gz" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully: postgres-$DATE.sql.gz (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up backups older than $RETENTION_DAYS days...${NC}"
find "$BACKUP_DIR" -name "postgres-*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List recent backups
echo -e "${GREEN}Recent backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -5

echo -e "${GREEN}=== Backup Complete ===${NC}"

