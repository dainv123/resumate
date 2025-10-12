#!/bin/bash
# Quick Production Deployment Script
# Run this on your production server

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Resumate Production Quick Deploy     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get project directory
PROJECT_DIR=$(pwd)
echo -e "${GREEN}Project directory: $PROJECT_DIR${NC}"

# Step 1: Create backup directories
echo -e "${YELLOW}[1/8] Creating backup directories...${NC}"
sudo mkdir -p /backups/{postgres,redis}
sudo mkdir -p /var/log/resumate-backups
sudo chown -R $USER:$USER /backups
sudo chmod -R 755 /backups /var/log/resumate-backups

# Step 2: Make scripts executable
echo -e "${YELLOW}[2/8] Making scripts executable...${NC}"
chmod +x $PROJECT_DIR/deployment/*.sh

# Step 3: Check environment files
echo -e "${YELLOW}[3/8] Checking environment files...${NC}"
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo -e "${RED}Warning: backend/.env not found. Please create it from env.example${NC}"
    echo "Press any key to continue or Ctrl+C to abort..."
    read
fi

# Step 4: Install dependencies
echo -e "${YELLOW}[4/8] Installing backend dependencies...${NC}"
cd $PROJECT_DIR/backend
npm install
npm run build

# Step 5: Start services
echo -e "${YELLOW}[5/8] Starting Docker services...${NC}"
cd $PROJECT_DIR
docker-compose up -d

# Step 6: Wait for services
echo -e "${YELLOW}[6/8] Waiting for services to start...${NC}"
sleep 20

# Step 7: Health checks
echo -e "${YELLOW}[7/8] Running health checks...${NC}"
docker exec resumate-redis redis-cli ping
curl -s http://localhost:5001/api/health

# Step 8: Setup cron jobs
echo -e "${YELLOW}[8/8] Setting up cron jobs...${NC}"
(crontab -l 2>/dev/null | grep -v "Resumate"; cat <<EOF
# Resumate Automated Backups
0 2 * * * $PROJECT_DIR/deployment/backup-postgres.sh >> /var/log/resumate-backups/postgres.log 2>&1
0 3 * * 0 $PROJECT_DIR/deployment/backup-redis.sh >> /var/log/resumate-backups/redis.log 2>&1
0 4 1 * * $PROJECT_DIR/deployment/cleanup-backups.sh >> /var/log/resumate-backups/cleanup.log 2>&1
0 6 * * * curl -sf http://localhost:5001/api/health/rate-limit-status >> /var/log/resumate-backups/health.log 2>&1
EOF
) | crontab -

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Complete!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services Status:${NC}"
docker-compose ps
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Configure Nginx (see PRODUCTION_DEPLOYMENT_STEPS.md)"
echo "2. Setup SSL with certbot"
echo "3. Test rate limiting"
echo "4. Monitor logs: docker-compose logs -f"
