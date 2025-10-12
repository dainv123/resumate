#!/bin/bash

# Rate Limiting Feature Deployment Script
# Resumate Application

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TEST_TOKEN="${TEST_TOKEN:-}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Rate Limiting Deployment Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Pre-deployment checks
echo -e "${GREEN}[1/10] Pre-deployment checks...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Step 2: Backup databases
echo -e "${GREEN}[2/10] Backing up databases...${NC}"
mkdir -p "$BACKUP_DIR/postgres" "$BACKUP_DIR/redis"

if docker ps | grep -q "resumate-postgres"; then
    BACKUP_FILE="$BACKUP_DIR/postgres/pre-rate-limit-$(date +%Y%m%d-%H%M%S).sql.gz"
    docker exec resumate-postgres pg_dump -U postgres resumate | gzip > "$BACKUP_FILE"
    echo -e "${GREEN}✅ PostgreSQL backup: $(basename $BACKUP_FILE)${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL container not running, skipping backup${NC}"
fi

# Step 3: Pull latest code
echo -e "${GREEN}[3/10] Pulling latest code...${NC}"
cd "$PROJECT_ROOT"
# git pull origin main  # Uncomment if using git

# Step 4: Install backend dependencies
echo -e "${GREEN}[4/10] Installing backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
npm install --silent

# Step 5: Build backend
echo -e "${GREEN}[5/10] Building backend...${NC}"
npm run build

# Step 6: Stop services
echo -e "${GREEN}[6/10] Stopping services...${NC}"
cd "$PROJECT_ROOT"
docker-compose down

# Step 7: Start Redis first
echo -e "${GREEN}[7/10] Starting Redis...${NC}"
docker-compose up -d redis

# Wait for Redis
echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
for i in {1..30}; do
    if docker exec resumate-redis redis-cli ping &>/dev/null; then
        echo -e "${GREEN}✅ Redis is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Redis failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Step 8: Start all services
echo -e "${GREEN}[8/10] Starting all services...${NC}"
docker-compose up -d

# Wait for services
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Step 9: Health checks
echo -e "${GREEN}[9/10] Running health checks...${NC}"

# Check Redis
if docker exec resumate-redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ Redis health check passed${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
    exit 1
fi

# Check PostgreSQL
if docker exec resumate-postgres pg_isready -U postgres | grep -q "accepting connections"; then
    echo -e "${GREEN}✅ PostgreSQL health check passed${NC}"
else
    echo -e "${RED}❌ PostgreSQL health check failed${NC}"
    exit 1
fi

# Check Backend
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health || echo "000")
if [ "$BACKEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
    exit 1
fi

# Check Rate Limit Health
RATE_LIMIT_HEALTH=$(curl -s http://localhost:5001/api/health/rate-limit-status || echo "{}")
if echo "$RATE_LIMIT_HEALTH" | grep -q "strategy"; then
    STRATEGY=$(echo "$RATE_LIMIT_HEALTH" | grep -o '"strategy":"[^"]*"' | cut -d'"' -f4)
    HEALTH=$(echo "$RATE_LIMIT_HEALTH" | grep -o '"health":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Rate Limit Status: strategy=$STRATEGY, health=$HEALTH${NC}"
else
    echo -e "${YELLOW}⚠ Rate limit health check endpoint not available yet${NC}"
fi

# Step 10: Test rate limiting
echo -e "${GREEN}[10/10] Testing rate limiting...${NC}"

if [ -n "$TEST_TOKEN" ]; then
    echo -e "${YELLOW}Testing with provided JWT token...${NC}"
    
    # Make 5 requests
    for i in {1..5}; do
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer $TEST_TOKEN" \
            http://localhost:5001/api/cv)
        echo "Request $i: HTTP $RESPONSE"
        
        if [ "$RESPONSE" == "429" ]; then
            echo -e "${GREEN}✅ Rate limiting is working correctly${NC}"
            break
        fi
        sleep 0.5
    done
else
    echo -e "${YELLOW}⚠ TEST_TOKEN not set, skipping rate limit test${NC}"
    echo -e "${YELLOW}To test: export TEST_TOKEN=<your_jwt_token> && ./deploy-rate-limit.sh${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Deployment Complete!               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}📊 Monitor logs:${NC}"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f redis"

echo ""
echo -e "${GREEN}📈 Check metrics:${NC}"
echo "  curl http://localhost:5001/api/health/rate-limit-status"

echo ""
echo -e "${GREEN}🔄 Rollback if needed:${NC}"
echo "  ./rollback.sh"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

