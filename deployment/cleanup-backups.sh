#!/bin/bash

# Cleanup Old Backups Script
# Rate Limiting Implementation - Resumate

set -e

# Configuration
POSTGRES_BACKUP_DIR="/backups/postgres"
REDIS_BACKUP_DIR="/backups/redis"
POSTGRES_RETENTION_DAYS=30
REDIS_RETENTION_WEEKS=8

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Cleanup Backups Script ===${NC}"
echo "Timestamp: $(date)"

# PostgreSQL cleanup
if [ -d "$POSTGRES_BACKUP_DIR" ]; then
    echo -e "${YELLOW}Cleaning PostgreSQL backups older than $POSTGRES_RETENTION_DAYS days...${NC}"
    POSTGRES_COUNT=$(find "$POSTGRES_BACKUP_DIR" -name "postgres-*.sql.gz" -mtime +$POSTGRES_RETENTION_DAYS | wc -l)
    
    if [ "$POSTGRES_COUNT" -gt 0 ]; then
        find "$POSTGRES_BACKUP_DIR" -name "postgres-*.sql.gz" -mtime +$POSTGRES_RETENTION_DAYS -delete
        echo -e "${GREEN}✅ Deleted $POSTGRES_COUNT PostgreSQL backup(s)${NC}"
    else
        echo -e "${GREEN}No PostgreSQL backups to delete${NC}"
    fi
else
    echo -e "${YELLOW}PostgreSQL backup directory not found${NC}"
fi

# Redis cleanup
if [ -d "$REDIS_BACKUP_DIR" ]; then
    echo -e "${YELLOW}Cleaning Redis backups older than $REDIS_RETENTION_WEEKS weeks...${NC}"
    REDIS_COUNT=$(find "$REDIS_BACKUP_DIR" -name "redis-*" -mtime +$(($REDIS_RETENTION_WEEKS * 7)) | wc -l)
    
    if [ "$REDIS_COUNT" -gt 0 ]; then
        find "$REDIS_BACKUP_DIR" -name "redis-*" -mtime +$(($REDIS_RETENTION_WEEKS * 7)) -delete
        echo -e "${GREEN}✅ Deleted $REDIS_COUNT Redis backup(s)${NC}"
    else
        echo -e "${GREEN}No Redis backups to delete${NC}"
    fi
else
    echo -e "${YELLOW}Redis backup directory not found${NC}"
fi

# Show current backup statistics
echo -e "${GREEN}=== Backup Statistics ===${NC}"

if [ -d "$POSTGRES_BACKUP_DIR" ]; then
    PG_COUNT=$(ls -1 "$POSTGRES_BACKUP_DIR"/postgres-*.sql.gz 2>/dev/null | wc -l)
    PG_SIZE=$(du -sh "$POSTGRES_BACKUP_DIR" 2>/dev/null | cut -f1)
    echo "PostgreSQL: $PG_COUNT backups ($PG_SIZE)"
fi

if [ -d "$REDIS_BACKUP_DIR" ]; then
    REDIS_COUNT=$(ls -1 "$REDIS_BACKUP_DIR"/redis-* 2>/dev/null | wc -l)
    REDIS_SIZE=$(du -sh "$REDIS_BACKUP_DIR" 2>/dev/null | cut -f1)
    echo "Redis: $REDIS_COUNT backups ($REDIS_SIZE)"
fi

echo -e "${GREEN}=== Cleanup Complete ===${NC}"

