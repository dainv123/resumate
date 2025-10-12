#!/bin/bash

# Setup Automated Backup Cron Jobs
# Resumate Application

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Automated Backup Cron Jobs     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_DIR="${LOG_DIR:-/var/log/resumate-backups}"

echo -e "${GREEN}Project root: $PROJECT_ROOT${NC}"
echo -e "${GREEN}Backup directory: $BACKUP_DIR${NC}"
echo -e "${GREEN}Log directory: $LOG_DIR${NC}"
echo ""

# Create directories
echo -e "${YELLOW}Creating backup directories...${NC}"
sudo mkdir -p "$BACKUP_DIR/postgres"
sudo mkdir -p "$BACKUP_DIR/redis"
sudo mkdir -p "$LOG_DIR"

# Set permissions
sudo chmod 755 "$BACKUP_DIR"
sudo chmod 755 "$LOG_DIR"

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Create crontab file
CRON_FILE="/tmp/resumate-crontab.txt"

cat > "$CRON_FILE" << EOF
# Resumate Automated Backups
# Generated on $(date)

# Set environment
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
BACKUP_DIR=$BACKUP_DIR
PROJECT_ROOT=$PROJECT_ROOT

# Daily PostgreSQL backup at 2:00 AM
0 2 * * * $DEPLOYMENT_DIR/backup-postgres.sh >> $LOG_DIR/postgres-backup.log 2>&1

# Weekly Redis backup every Sunday at 3:00 AM
0 3 * * 0 $DEPLOYMENT_DIR/backup-redis.sh >> $LOG_DIR/redis-backup.log 2>&1

# Monthly cleanup on the 1st at 4:00 AM
0 4 1 * * $DEPLOYMENT_DIR/cleanup-backups.sh >> $LOG_DIR/cleanup.log 2>&1

# Daily health check at 6:00 AM
0 6 * * * curl -s http://localhost:5001/api/health/rate-limit-status >> $LOG_DIR/health-check.log 2>&1

EOF

echo -e "${YELLOW}Generated crontab configuration:${NC}"
cat "$CRON_FILE"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Do you want to install these cron jobs? (y/n)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${RED}Installation cancelled${NC}"
    rm "$CRON_FILE"
    exit 0
fi

# Install crontab
echo -e "${YELLOW}Installing cron jobs...${NC}"

# Backup existing crontab
crontab -l > /tmp/crontab-backup-$(date +%Y%m%d-%H%M%S).txt 2>/dev/null || true

# Add new jobs
if crontab -l 2>/dev/null | grep -q "Resumate Automated Backups"; then
    echo -e "${YELLOW}Resumate cron jobs already exist. Replacing...${NC}"
    crontab -l 2>/dev/null | grep -v "Resumate" | grep -v "backup-postgres" | grep -v "backup-redis" | grep -v "cleanup-backups" > /tmp/crontab-temp.txt || true
    cat "$CRON_FILE" >> /tmp/crontab-temp.txt
    crontab /tmp/crontab-temp.txt
    rm /tmp/crontab-temp.txt
else
    echo -e "${YELLOW}Adding new cron jobs...${NC}"
    (crontab -l 2>/dev/null; cat "$CRON_FILE") | crontab -
fi

rm "$CRON_FILE"

echo -e "${GREEN}✅ Cron jobs installed successfully${NC}"
echo ""

# Show installed jobs
echo -e "${GREEN}Current crontab:${NC}"
crontab -l | grep -A 20 "Resumate"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Setup Complete!                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📅 Backup Schedule:${NC}"
echo "  - PostgreSQL: Daily at 2:00 AM"
echo "  - Redis: Weekly (Sunday) at 3:00 AM"
echo "  - Cleanup: Monthly (1st) at 4:00 AM"
echo "  - Health Check: Daily at 6:00 AM"
echo ""

echo -e "${GREEN}📊 Log Files:${NC}"
echo "  - PostgreSQL: $LOG_DIR/postgres-backup.log"
echo "  - Redis: $LOG_DIR/redis-backup.log"
echo "  - Cleanup: $LOG_DIR/cleanup.log"
echo "  - Health: $LOG_DIR/health-check.log"
echo ""

echo -e "${GREEN}🔧 Useful Commands:${NC}"
echo "  - View crontab: crontab -l"
echo "  - Edit crontab: crontab -e"
echo "  - Remove crontab: crontab -r"
echo "  - View logs: tail -f $LOG_DIR/*.log"
echo "  - Test backup: $DEPLOYMENT_DIR/backup-postgres.sh"
echo ""

echo -e "${YELLOW}💡 Tip: Monitor logs regularly to ensure backups are working${NC}"

