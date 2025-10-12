# ⚡ Rate Limiting - Quick Start Guide

## 🚀 Deployment trong 5 phút

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

Expected output:
```
added 4 packages (ioredis, @nestjs/throttler, @nestjs/axios, axios)
```

### Step 2: Start Services

```bash
# Từ project root
docker-compose up -d redis postgres

# Wait 10 seconds
sleep 10

# Start backend
cd backend
npm run start:dev
```

### Step 3: Verify

```bash
# Check Redis
docker exec resumate-redis redis-cli ping
# Expected: PONG

# Check backend health
curl http://localhost:5001/api/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}

# Check rate limit status
curl http://localhost:5001/api/health/rate-limit-status
# Expected: {"strategy":"redis","enabled":true,"health":"healthy",...}
```

**✅ Done! Rate limiting is now active.**

---

## 🧪 Test Rate Limiting

### Quick Test (No Auth Required)

```bash
# Health endpoint is public, test it
for i in {1..15}; do
  curl -s http://localhost:5001/api/health | head -c 50
  echo " - Request $i"
  sleep 0.2
done
```

### Full Test (Requires JWT Token)

```bash
# 1. Get JWT token by logging in
TOKEN=$(curl -s -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Make 12 requests (free plan limit: 10/min)
for i in {1..12}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:5001/api/cv)
  echo "Request $i: HTTP $STATUS"
  
  if [ "$STATUS" == "429" ]; then
    echo "✅ Rate limiting works! Got 429 on request $i"
    break
  fi
  sleep 0.5
done
```

---

## 🎛️ Configuration

### Enable/Disable

```bash
# Disable rate limiting (in .env or docker-compose.yml)
ENABLE_RATE_LIMITING=false

# Restart backend
docker-compose restart backend
```

### Change Strategy

```bash
# Use Redis (default, recommended)
RATE_LIMIT_STRATEGY=redis

# Use Cloud (stub, for future)
RATE_LIMIT_STRATEGY=cloud

# Disable completely
RATE_LIMIT_STRATEGY=disabled
```

### Adjust Limits (Code)

Edit `backend/src/common/strategies/rate-limit.strategy.ts`:

```typescript
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { minute: 10, hour: 100 },      // ← Change these
  pro: { minute: 60, hour: 1000 },
  enterprise: { minute: 200, hour: 5000 },
};
```

Edit `backend/src/modules/users/users.service.ts`:

```typescript
getLimits(plan: string): Record<string, number> {
  const planLimits = {
    free: {
      cvUploads: 1,     // ← Change these
      projects: 3,
      jobTailors: 5,
      exports: 10,
    },
    // ...
  };
  return planLimits[plan] || planLimits.free;
}
```

---

## 📊 Monitoring

### Check Redis Stats

```bash
# Keys count
docker exec resumate-redis redis-cli DBSIZE

# Memory usage
docker exec resumate-redis redis-cli INFO memory | grep used_memory_human

# Rate limit keys
docker exec resumate-redis redis-cli KEYS "rate:*"

# Usage cache keys
docker exec resumate-redis redis-cli KEYS "usage:*"
```

### Monitor Real-time

```bash
# Watch Redis commands in real-time
docker exec resumate-redis redis-cli MONITOR

# Follow backend logs
docker-compose logs -f backend | grep -i "rate"
```

### Check User Usage

```bash
# Via PostgreSQL
docker exec resumate-postgres psql -U postgres resumate \
  -c "SELECT userId, cvUploads, projects, jobTailors, exports, resetDate FROM user_usage LIMIT 5;"
```

---

## 🔧 Troubleshooting

### Redis not working?

```bash
# Check if running
docker ps | grep redis

# Check logs
docker logs resumate-redis

# Restart
docker-compose restart redis

# Test connection
docker exec resumate-redis redis-cli ping
```

### Rate limiting not triggering?

```bash
# Check backend env
docker exec resumate-backend env | grep RATE_LIMIT

# Expected:
# RATE_LIMIT_STRATEGY=redis
# ENABLE_RATE_LIMITING=true

# Check health
curl http://localhost:5001/api/health/rate-limit-status
```

### Clear all rate limits

```bash
# Delete all rate limit keys
docker exec resumate-redis redis-cli --scan --pattern "rate:*" | \
  xargs docker exec resumate-redis redis-cli DEL

# Or flush entire Redis
docker exec resumate-redis redis-cli FLUSHDB
```

---

## 📦 Backup & Restore

### Manual Backup

```bash
# PostgreSQL
./deployment/backup-postgres.sh

# Redis
./deployment/backup-redis.sh
```

### Restore from Backup

```bash
# PostgreSQL
gunzip < backups/postgres/postgres-YYYYMMDD.sql.gz | \
  docker exec -i resumate-postgres psql -U postgres resumate

# Redis
docker cp backups/redis/redis-YYYYMMDD.rdb resumate-redis:/data/dump.rdb
docker-compose restart redis
```

### Automated Backups (Cron)

```bash
# Add to crontab
crontab -e

# Daily PostgreSQL backup at 2am
0 2 * * * /path/to/deployment/backup-postgres.sh >> /var/log/backup.log 2>&1

# Weekly Redis backup (Sunday 3am)
0 3 * * 0 /path/to/deployment/backup-redis.sh >> /var/log/backup.log 2>&1

# Monthly cleanup (1st of month, 4am)
0 4 1 * * /path/to/deployment/cleanup-backups.sh >> /var/log/backup.log 2>&1
```

---

## 🎯 Common Commands

```bash
# Start everything
docker-compose up -d && cd backend && npm run start:dev

# Stop everything
docker-compose down

# Restart backend only
docker-compose restart backend

# View logs
docker-compose logs -f

# Check health
curl http://localhost:5001/api/health/rate-limit-status | jq

# Clear Redis
docker exec resumate-redis redis-cli FLUSHDB

# Redis info
docker exec resumate-redis redis-cli INFO | grep -E "(used_memory|total_commands|uptime)"

# PostgreSQL query
docker exec resumate-postgres psql -U postgres resumate -c "SELECT COUNT(*) FROM user_usage;"
```

---

## 🔑 Environment Variables

```bash
# Minimal setup (in backend/.env)
RATE_LIMIT_STRATEGY=redis
ENABLE_RATE_LIMITING=true
REDIS_HOST=redis  # or localhost if running locally
REDIS_PORT=6379

# Optional
CLOUD_RATE_LIMIT_PROVIDER=aws
AWS_API_GATEWAY_ID=your-gateway-id
```

---

## 🎓 Next Steps

1. **Frontend Integration:**
   - Add error handling in `frontend/src/lib/api.ts`
   - Create error components
   - Add usage indicators to UI

2. **Testing:**
   - Write E2E tests
   - Write unit tests
   - Load testing

3. **Production:**
   - Review limits per plan
   - Setup monitoring alerts
   - Configure backups
   - Deploy to staging first

4. **Future Enhancements:**
   - Implement admin dashboard
   - Add more sophisticated rules
   - Consider cloud migration
   - Add metrics visualization

---

## 📚 Documentation

- [Complete Workflow](./requiments/RATE_LIMIT_WORKFLOW.md) - 2179 lines, chi tiết implementation
- [Implementation Status](./RATE_LIMIT_IMPLEMENTATION_STATUS.md) - Progress tracking
- [Final Summary](./RATE_LIMIT_FINAL_SUMMARY.md) - Comprehensive overview

---

## 💡 Tips

1. **Start with limits disabled** để test functionality trước
2. **Monitor Redis memory** trong vài ngày đầu
3. **Adjust limits gradually** dựa vào usage patterns
4. **Setup alerts** cho Redis health
5. **Test rollback plan** trước khi deploy production

---

## 🆘 Need Help?

Check these files:
- Health status: `curl http://localhost:5001/api/health/rate-limit-status`
- Backend logs: `docker-compose logs backend`
- Redis logs: `docker-compose logs redis`
- Database: `docker exec resumate-postgres psql -U postgres resumate`

---

**✅ Chúc may mắn với deployment!**

