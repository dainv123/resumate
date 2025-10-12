# Rate Limiting & Usage Tracking Workflow

## 📋 Table of Contents
1. [Feature Flag Strategy](#feature-flag-strategy)
2. [System Architecture](#system-architecture)
3. [Request Flow](#request-flow)
4. [Implementation Workflow](#implementation-workflow)
5. [Deployment Workflow](#deployment-workflow)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Error Handling](#error-handling)
8. [Migration to Cloud Services](#migration-to-cloud-services)

---

## 🚩 Feature Flag Strategy

### **Environment Variables**

```bash
# backend/.env

# Rate Limiting Strategy
# Options: 'redis' | 'cloud' | 'disabled'
RATE_LIMIT_STRATEGY=redis

# Redis Rate Limiting (when RATE_LIMIT_STRATEGY=redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloud Rate Limiting (when RATE_LIMIT_STRATEGY=cloud)
CLOUD_RATE_LIMIT_PROVIDER=aws  # 'aws' | 'cloudflare' | 'cloudfront'
AWS_API_GATEWAY_ID=
CLOUDFLARE_ZONE_ID=

# Usage Tracking Strategy
# Options: 'postgres' | 'redis' | 'dynamodb'
USAGE_TRACKING_STRATEGY=postgres

# Feature Flags
ENABLE_RATE_LIMITING=true
ENABLE_USAGE_TRACKING=true
```

---

### **Strategy Pattern Implementation**

```typescript
// backend/src/common/strategies/rate-limit.strategy.ts

export interface IRateLimitStrategy {
  checkLimit(userId: string, plan: string, window: string): Promise<boolean>;
  getRemaining(userId: string, window: string): Promise<number>;
  getRateLimitInfo(userId: string): Promise<RateLimitInfo>;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

// Redis Strategy
@Injectable()
export class RedisRateLimitStrategy implements IRateLimitStrategy {
  constructor(private redisService: RedisService) {}

  async checkLimit(userId: string, plan: string, window: string): Promise<boolean> {
    const limits = this.getLimitsByPlan(plan);
    const key = `rate:${userId}:${window}`;
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, this.getWindowSeconds(window));
    }

    return count <= limits[window];
  }

  async getRemaining(userId: string, window: string): Promise<number> {
    const key = `rate:${userId}:${window}`;
    const count = parseInt(await this.redisService.get(key) || '0');
    const limit = this.getLimitsByPlan('free')[window]; // Get from user
    return Math.max(0, limit - count);
  }

  async getRateLimitInfo(userId: string): Promise<RateLimitInfo> {
    const key = `rate:${userId}:minute`;
    const count = parseInt(await this.redisService.get(key) || '0');
    const ttl = await this.redisService.ttl(key);
    
    return {
      limit: 10, // Get from plan
      remaining: Math.max(0, 10 - count),
      reset: Date.now() + ttl * 1000,
    };
  }

  private getLimitsByPlan(plan: string) {
    return {
      free: { minute: 10, hour: 100 },
      pro: { minute: 60, hour: 1000 },
      enterprise: { minute: 200, hour: 5000 },
    }[plan] || { minute: 10, hour: 100 };
  }

  private getWindowSeconds(window: string): number {
    return window === 'minute' ? 60 : 3600;
  }
}

// Cloud Strategy (AWS API Gateway)
@Injectable()
export class CloudRateLimitStrategy implements IRateLimitStrategy {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async checkLimit(userId: string, plan: string, window: string): Promise<boolean> {
    // AWS API Gateway handles this at infrastructure level
    // This is just for checking current status
    const apiKey = await this.getApiKeyForUser(userId);
    const usage = await this.getApiGatewayUsage(apiKey);
    
    return usage.remaining > 0;
  }

  async getRemaining(userId: string, window: string): Promise<number> {
    const apiKey = await this.getApiKeyForUser(userId);
    const usage = await this.getApiGatewayUsage(apiKey);
    return usage.remaining;
  }

  async getRateLimitInfo(userId: string): Promise<RateLimitInfo> {
    const apiKey = await this.getApiKeyForUser(userId);
    const usage = await this.getApiGatewayUsage(apiKey);
    
    return {
      limit: usage.limit,
      remaining: usage.remaining,
      reset: usage.reset,
    };
  }

  private async getApiKeyForUser(userId: string): Promise<string> {
    // Get or create API key for user in AWS API Gateway
    return 'api-key';
  }

  private async getApiGatewayUsage(apiKey: string) {
    // Query AWS API Gateway usage plans
    return { limit: 100, remaining: 50, reset: Date.now() + 60000 };
  }
}

// Disabled Strategy (No-op)
@Injectable()
export class DisabledRateLimitStrategy implements IRateLimitStrategy {
  async checkLimit(): Promise<boolean> {
    return true; // Always allow
  }

  async getRemaining(): Promise<number> {
    return Infinity;
  }

  async getRateLimitInfo(): Promise<RateLimitInfo> {
    return {
      limit: Infinity,
      remaining: Infinity,
      reset: 0,
    };
  }
}
```

---

### **Strategy Factory**

```typescript
// backend/src/common/factories/rate-limit-strategy.factory.ts

@Injectable()
export class RateLimitStrategyFactory {
  constructor(
    private configService: ConfigService,
    private redisRateLimitStrategy: RedisRateLimitStrategy,
    private cloudRateLimitStrategy: CloudRateLimitStrategy,
    private disabledRateLimitStrategy: DisabledRateLimitStrategy,
  ) {}

  getStrategy(): IRateLimitStrategy {
    const strategy = this.configService.get('RATE_LIMIT_STRATEGY', 'redis');
    const enabled = this.configService.get('ENABLE_RATE_LIMITING', 'true') === 'true';

    if (!enabled) {
      return this.disabledRateLimitStrategy;
    }

    switch (strategy) {
      case 'redis':
        return this.redisRateLimitStrategy;
      case 'cloud':
        return this.cloudRateLimitStrategy;
      case 'disabled':
        return this.disabledRateLimitStrategy;
      default:
        console.warn(`Unknown rate limit strategy: ${strategy}, using disabled`);
        return this.disabledRateLimitStrategy;
    }
  }
}
```

---

### **Updated Rate Limit Guard**

```typescript
// backend/src/common/guards/rate-limit.guard.ts

@Injectable()
export class RateLimitGuard implements CanActivate {
  private strategy: IRateLimitStrategy;

  constructor(
    private reflector: Reflector,
    private strategyFactory: RateLimitStrategyFactory,
  ) {
    this.strategy = this.strategyFactory.getStrategy();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitMeta = this.reflector.get(RATE_LIMIT, context.getHandler());
    if (!rateLimitMeta) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true;

    // Use strategy pattern
    const canProceed = await this.strategy.checkLimit(
      user.id,
      user.plan,
      'minute',
    );

    if (!canProceed) {
      const info = await this.strategy.getRateLimitInfo(user.id);
      
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', info.limit);
      response.setHeader('X-RateLimit-Remaining', info.remaining);
      response.setHeader('X-RateLimit-Reset', info.reset);
      response.setHeader('Retry-After', Math.ceil((info.reset - Date.now()) / 1000));

      throw new ThrottlerException({
        message: 'Too many requests',
        retryAfter: Math.ceil((info.reset - Date.now()) / 1000),
        limit: info.limit,
        remaining: info.remaining,
      });
    }

    return true;
  }
}
```

---

### **Module Configuration**

```typescript
// backend/src/common/rate-limit.module.ts

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    HttpModule,
  ],
  providers: [
    RedisRateLimitStrategy,
    CloudRateLimitStrategy,
    DisabledRateLimitStrategy,
    RateLimitStrategyFactory,
    RateLimitGuard,
  ],
  exports: [RateLimitStrategyFactory, RateLimitGuard],
})
export class RateLimitModule {}
```

---

### **Usage Example**

```typescript
// Automatically uses strategy from env
@Post('upload')
@UseGuards(RateLimitGuard)
@RateLimit(10, 60)
async uploadCv() {
  // If RATE_LIMIT_STRATEGY=disabled, guard does nothing
  // If RATE_LIMIT_STRATEGY=redis, uses Redis
  // If RATE_LIMIT_STRATEGY=cloud, uses AWS/Cloudflare
}
```

---

### **Migration Path**

```bash
# Phase 1: Local development (Redis)
RATE_LIMIT_STRATEGY=redis
ENABLE_RATE_LIMITING=true

# Phase 2: Staging with Redis
RATE_LIMIT_STRATEGY=redis
REDIS_HOST=staging-redis.example.com

# Phase 3: Production with Cloud
RATE_LIMIT_STRATEGY=cloud
CLOUD_RATE_LIMIT_PROVIDER=aws
AWS_API_GATEWAY_ID=abc123

# Phase 4: Rollback if needed
RATE_LIMIT_STRATEGY=redis
# or
ENABLE_RATE_LIMITING=false
```

---

### **Health Check Endpoint**

```typescript
// backend/src/modules/health/health.controller.ts

@Get('rate-limit-status')
async getRateLimitStatus() {
  const strategy = this.configService.get('RATE_LIMIT_STRATEGY');
  const enabled = this.configService.get('ENABLE_RATE_LIMITING') === 'true';

  let health = 'unknown';
  
  if (!enabled) {
    health = 'disabled';
  } else if (strategy === 'redis') {
    health = await this.checkRedisHealth();
  } else if (strategy === 'cloud') {
    health = await this.checkCloudHealth();
  }

  return {
    strategy,
    enabled,
    health,
    timestamp: new Date().toISOString(),
  };
}

private async checkRedisHealth(): Promise<string> {
  try {
    await this.redisService.ping();
    return 'healthy';
  } catch (error) {
    return 'unhealthy';
  }
}
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Frontend)                        │
│  - Retry logic với exponential backoff                          │
│  - UI feedback cho rate limit / quota errors                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer                 │
│  - SSL/TLS termination                                          │
│  - IP-based rate limiting (optional)                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       NestJS Backend                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Authentication Middleware                             │  │
│  │    - JWT validation                                       │  │
│  │    - Extract user + plan                                  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │ 2. Rate Limit Guard (Redis)                              │  │
│  │    - Check requests/minute                                │  │
│  │    - Check requests/hour                                  │  │
│  │    - Return 429 if exceeded                               │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │ 3. Usage Check (PostgreSQL + Redis Cache)                │  │
│  │    - Check monthly quota                                  │  │
│  │    - Return 403 if exceeded                               │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │ 4. Business Logic                                         │  │
│  │    - Process request                                      │  │
│  │    - Interact with services                               │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │ 5. Increment Usage Counter                                │  │
│  │    - Update PostgreSQL                                    │  │
│  │    - Invalidate cache                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────┬──────────────────────────────────┬────────────────┬──────┘
       │                                  │                │
       ▼                                  ▼                ▼
┌─────────────┐                    ┌──────────┐    ┌──────────┐
│   Redis     │                    │PostgreSQL│    │   S3     │
│ (Rate Limit)│                    │ (Usage)  │    │ (Files)  │
└─────────────┘                    └──────────┘    └──────────┘
```

---

## 🔄 Request Flow

### **Flow 1: CV Upload (Success)**

```typescript
// Step-by-step flow
POST /api/cv/upload
Headers: Authorization: Bearer <JWT>
Body: multipart/form-data (CV file)

┌─────────────────────────────────────────────────────────────┐
│ Step 1: Authentication                                       │
├─────────────────────────────────────────────────────────────┤
│ Input:  JWT token                                           │
│ Action: Validate token, extract user                        │
│ Output: user = { id: '123', plan: 'free', email: '...' }   │
│ Time:   ~2ms                                                │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Rate Limit Check (Redis)                            │
├─────────────────────────────────────────────────────────────┤
│ Key:    user:123:requests:minute                            │
│ Action: INCR key, check against limit                       │
│ Limit:  10 requests/minute (free plan)                      │
│ Current: 5/10                                               │
│ Result: ✅ PASS                                             │
│ Time:   ~1ms                                                │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Usage Check (PostgreSQL + Redis Cache)              │
├─────────────────────────────────────────────────────────────┤
│ Cache:  usage:123:cvUploads                                 │
│ Cached: 0/1 (free plan)                                     │
│ Result: ✅ PASS (has quota)                                 │
│ Time:   ~2ms (cache hit)                                    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Process Upload                                      │
├─────────────────────────────────────────────────────────────┤
│ 4a. Parse CV (pdf-parse)                    → 150ms         │
│ 4b. Extract data with AI (Gemini)           → 2000ms        │
│ 4c. Upload to S3                             → 300ms         │
│ 4d. Save to database                         → 20ms          │
│ Total:                                         ~2470ms       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Increment Usage                                     │
├─────────────────────────────────────────────────────────────┤
│ Action: UPDATE user_usage SET cvUploads = cvUploads + 1    │
│ Cache:  DELETE usage:123:cvUploads                          │
│ Result: cvUploads now = 1/1                                 │
│ Time:   ~15ms                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Response 200 OK                                             │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "id": "cv-uuid",                                          │
│   "fileName": "resume.pdf",                                 │
│   "parsedData": { ... },                                    │
│   "usage": {                                                │
│     "cvUploads": { used: 1, limit: 1 },                     │
│     "resetsAt": "2025-11-01T00:00:00Z"                      │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Total Time: ~2490ms                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### **Flow 2: Rate Limit Exceeded (429)**

```typescript
POST /api/cv/upload (6th request trong cùng phút)

┌─────────────────────────────────────────────────────────────┐
│ Step 1: Authentication                          ✅ PASS     │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Rate Limit Check (Redis)                            │
├─────────────────────────────────────────────────────────────┤
│ Key:    user:123:requests:minute                            │
│ Action: INCR key                                            │
│ Limit:  10 requests/minute (free plan)                      │
│ Current: 11/10 ❌ EXCEEDED                                  │
│ TTL:    42 seconds remaining                                │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Response 429 Too Many Requests                              │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "statusCode": 429,                                        │
│   "message": "Too many requests",                           │
│   "error": "ThrottlerException",                            │
│   "retryAfter": 42,  // seconds                             │
│   "limit": 10,                                              │
│   "current": 11                                             │
│ }                                                           │
│                                                             │
│ Headers:                                                    │
│   Retry-After: 42                                           │
│   X-RateLimit-Limit: 10                                     │
│   X-RateLimit-Remaining: 0                                  │
│   X-RateLimit-Reset: 1697123456                             │
│                                                             │
│ Total Time: ~3ms (blocked early)                            │
└─────────────────────────────────────────────────────────────┘
```

---

### **Flow 3: Quota Exceeded (403)**

```typescript
POST /api/cv/upload (đã upload 1 CV trong tháng, free plan)

┌─────────────────────────────────────────────────────────────┐
│ Step 1: Authentication                          ✅ PASS     │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Rate Limit Check                        ✅ PASS     │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Usage Check (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────┤
│ Query:  SELECT * FROM user_usage WHERE userId = '123'      │
│ Result: cvUploads = 1, limit = 1 (free plan)               │
│ Check:  1 >= 1 ❌ QUOTA EXCEEDED                           │
│ Reset:  2025-11-01T00:00:00Z (18 days remaining)            │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Response 403 Forbidden                                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "statusCode": 403,                                        │
│   "message": "Monthly CV upload limit reached",             │
│   "error": "ForbiddenException",                            │
│   "usage": {                                                │
│     "feature": "cvUploads",                                 │
│     "used": 1,                                              │
│     "limit": 1,                                             │
│     "resetsAt": "2025-11-01T00:00:00Z"                      │
│   },                                                        │
│   "upgrade": {                                              │
│     "available": true,                                      │
│     "plan": "pro",                                          │
│     "newLimit": 10,                                         │
│     "price": "$9.99/month"                                  │
│   }                                                         │
│ }                                                           │
│                                                             │
│ Total Time: ~20ms (blocked at check)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Workflow

### **Phase 1: Backend Infrastructure Setup**

```bash
# 1.1 Add Redis to docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

# 1.2 Create redis.conf
cat > backend/redis.conf <<EOF
appendonly yes
appendfsync everysec
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

# 1.3 Install dependencies
cd backend
npm install --save @nestjs/throttler ioredis
npm install --save-dev @types/ioredis
```

---

### **Phase 2: Redis Module Setup**

```typescript
// backend/src/shared/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

// backend/src/shared/redis/redis.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

---

### **Phase 3: Rate Limit Guard**

```typescript
// backend/src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../shared/redis/redis.service';

export const RATE_LIMIT = 'rateLimit';

export const RateLimit = (limit: number, window: number) =>
  SetMetadata(RATE_LIMIT, { limit, window });

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitMeta = this.reflector.get(RATE_LIMIT, context.getHandler());
    if (!rateLimitMeta) return true; // No rate limit set

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true; // Not authenticated

    const { limit, window } = this.getRateLimitByPlan(
      user.plan,
      rateLimitMeta,
    );

    const key = `rate:${user.id}:${window}`;
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, window);
    }

    if (count > limit) {
      const ttl = await this.redisService.ttl(key);
      
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', limit);
      response.setHeader('X-RateLimit-Remaining', 0);
      response.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);
      response.setHeader('Retry-After', ttl);

      throw new ThrottlerException({
        message: 'Too many requests',
        retryAfter: ttl,
        limit,
        current: count,
      });
    }

    // Add headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));

    return true;
  }

  private getRateLimitByPlan(plan: string, meta: any) {
    const multipliers = {
      free: 1,
      pro: 6,
      enterprise: 20,
    };

    return {
      limit: meta.limit * (multipliers[plan] || 1),
      window: meta.window,
    };
  }
}
```

---

### **Phase 4: Usage Guard**

```typescript
// backend/src/common/guards/usage.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../modules/users/users.service';

export const CHECK_USAGE = 'checkUsage';

export const CheckUsage = (feature: string) =>
  SetMetadata(CHECK_USAGE, feature);

@Injectable()
export class UsageGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get(CHECK_USAGE, context.getHandler());
    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true;

    const canProceed = await this.usersService.checkUserLimit(
      user.id,
      feature,
    );

    if (!canProceed) {
      const usage = await this.usersService.getUserUsage(user.id);
      const limits = this.usersService.getLimits(user.plan);

      throw new ForbiddenException({
        message: `Monthly ${feature} limit reached`,
        usage: {
          feature,
          used: usage[feature],
          limit: limits[feature],
          resetsAt: usage.resetDate,
        },
        upgrade: this.getUpgradeInfo(user.plan),
      });
    }

    return true;
  }

  private getUpgradeInfo(currentPlan: string) {
    if (currentPlan === 'free') {
      return {
        available: true,
        plan: 'pro',
        newLimit: 10,
        price: '$9.99/month',
      };
    }
    return { available: false };
  }
}
```

---

### **Phase 5: Apply Guards to Controllers**

```typescript
// backend/src/modules/cv/cv.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard, RateLimit } from '../../common/guards/rate-limit.guard';
import { UsageGuard, CheckUsage } from '../../common/guards/usage.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload')
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(10, 60) // 10 requests per minute (base for free)
  @CheckUsage('cvUploads')
  async uploadCv(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Process upload
      const cv = await this.cvService.create(user.id, file);

      // Increment usage
      await this.usersService.incrementUsage(user.id, 'cvUploads');

      // Get updated usage
      const usage = await this.usersService.getUserUsage(user.id);
      const limits = this.usersService.getLimits(user.plan);

      return {
        ...cv,
        usage: {
          cvUploads: {
            used: usage.cvUploads,
            limit: limits.cvUploads,
          },
          resetsAt: usage.resetDate,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('tailor')
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(5, 60) // 5 requests per minute
  @CheckUsage('jobTailors')
  async tailorCv(@GetUser() user: User, @Body() dto: TailorCvDto) {
    const result = await this.cvService.tailorCv(user.id, dto);
    await this.usersService.incrementUsage(user.id, 'jobTailors');
    return result;
  }

  @Get(':id/export')
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(20, 60) // 20 exports per minute
  @CheckUsage('exports')
  async exportCv(@GetUser() user: User, @Param('id') id: string) {
    const pdf = await this.cvService.exportPdf(user.id, id);
    await this.usersService.incrementUsage(user.id, 'exports');
    return pdf;
  }
}
```

---

### **Phase 6: Update UsersService**

```typescript
// backend/src/modules/users/users.service.ts

// Re-enable checkUserLimit
async checkUserLimit(userId: string, feature: string): Promise<boolean> {
  // Try cache first
  const cacheKey = `usage:${userId}:${feature}`;
  const cached = await this.redisService.get(cacheKey);

  if (cached !== null) {
    const user = await this.findById(userId);
    const limits = this.getLimits(user.plan);
    return limits[feature] === -1 || parseInt(cached) < limits[feature];
  }

  // Query database
  const user = await this.findById(userId);
  const usage = await this.getUserUsage(userId);
  const limits = this.getLimits(user.plan);

  // Cache for 5 minutes
  await this.redisService.set(cacheKey, usage[feature].toString(), 300);

  return limits[feature] === -1 || usage[feature] < limits[feature];
}

getLimits(plan: string) {
  const limits = {
    free: {
      cvUploads: 1,
      projects: 3,
      jobTailors: 5,
      exports: 10,
    },
    pro: {
      cvUploads: 10,
      projects: 50,
      jobTailors: 100,
      exports: 500,
    },
    enterprise: {
      cvUploads: -1, // unlimited
      projects: -1,
      jobTailors: -1,
      exports: -1,
    },
  };
  return limits[plan] || limits.free;
}

async incrementUsage(userId: string, feature: keyof UserUsage): Promise<void> {
  const usage = await this.getUserUsage(userId);
  (usage as any)[feature] = ((usage as any)[feature] as number) + 1;
  await this.userUsageRepository.save(usage);

  // Invalidate cache
  const cacheKey = `usage:${userId}:${feature}`;
  await this.redisService.del(cacheKey);
}
```

---

### **Phase 7: Frontend Integration**

```typescript
// frontend/src/lib/api.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any,
  ) {
    super(message);
  }
}

// Interceptor for handling errors
const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;

    // Rate limit error
    if (status === 429) {
      const retryAfter = data.retryAfter || 60;
      toast.error(
        `Too many requests. Please wait ${retryAfter} seconds.`,
        { duration: retryAfter * 1000 }
      );
      throw new ApiError(429, data.message, data);
    }

    // Quota exceeded
    if (status === 403 && data.usage) {
      const resetsAt = new Date(data.usage.resetsAt);
      const daysRemaining = Math.ceil(
        (resetsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      toast.error(
        `Monthly limit reached. Resets in ${daysRemaining} days.`,
        {
          action: data.upgrade?.available ? {
            label: 'Upgrade',
            onClick: () => router.push('/upgrade'),
          } : undefined,
        }
      );
      throw new ApiError(403, data.message, data);
    }
  }

  throw error;
};

// Upload with retry
export async function uploadCV(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/cv/upload', formData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// frontend/src/components/cv/CVUpload.tsx
const CVUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [usage, setUsage] = useState(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadCV(file);
      setUsage(result.usage);
      toast.success('CV uploaded successfully');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 429) {
          // Show retry timer
        } else if (error.statusCode === 403) {
          // Show upgrade prompt
        }
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {usage && (
        <UsageIndicator
          used={usage.cvUploads.used}
          limit={usage.cvUploads.limit}
          resetsAt={usage.resetsAt}
        />
      )}
      <FileUpload onUpload={handleUpload} disabled={uploading} />
    </div>
  );
};
```

---

## 🚀 Deployment Workflow

### **Step 1: Pre-deployment Checklist**

```bash
# 1.1 Test locally
cd backend
npm run test
npm run test:e2e

# 1.2 Build
npm run build

# 1.3 Test Redis connection
docker-compose up redis -d
npm run start:dev
# Test endpoints

# 1.4 Load test
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5001/api/cv
```

---

### **Step 2: Update docker-compose.yml**

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: resumate-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./backend/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    networks:
      - resumate-network

  postgres:
    # ... existing config
    networks:
      - resumate-network

  backend:
    # ... existing config
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      redis:
        condition: service_healthy
      postgres:
        condition: service_healthy
    networks:
      - resumate-network

volumes:
  redis_data:
    driver: local
  postgres_data:
    driver: local

networks:
  resumate-network:
    driver: bridge
```

---

### **Step 3: Deployment Script**

```bash
#!/bin/bash
# deployment/deploy-rate-limit.sh

set -e

echo "🚀 Deploying Rate Limit Feature..."

# 1. Backup current data
echo "📦 Backing up databases..."
docker exec resumate-postgres pg_dump -U postgres resumate \
  | gzip > "./backups/postgres-$(date +%Y%m%d-%H%M%S).sql.gz"

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Build backend
echo "🔨 Building backend..."
cd backend
npm install
npm run build
cd ..

# 4. Stop services
echo "🛑 Stopping services..."
docker-compose down

# 5. Start Redis first
echo "🚀 Starting Redis..."
docker-compose up -d redis

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until docker exec resumate-redis redis-cli ping; do
  echo "Waiting for Redis..."
  sleep 2
done

# 6. Start other services
echo "🚀 Starting all services..."
docker-compose up -d

# 7. Health check
echo "🏥 Health check..."
sleep 10

# Check Redis
if docker exec resumate-redis redis-cli ping | grep -q PONG; then
  echo "✅ Redis is healthy"
else
  echo "❌ Redis health check failed"
  exit 1
fi

# Check backend
if curl -f http://localhost:5001/api/health; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend health check failed"
  exit 1
fi

# 8. Test rate limiting
echo "🧪 Testing rate limiting..."
for i in {1..12}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TEST_TOKEN" \
    http://localhost:5001/api/cv)
  echo "Request $i: $response"
  
  if [ "$i" -gt "10" ] && [ "$response" == "429" ]; then
    echo "✅ Rate limiting working correctly"
    break
  fi
done

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Monitor logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f redis"
```

---

### **Step 4: Rollback Plan**

```bash
#!/bin/bash
# deployment/rollback.sh

set -e

echo "⏪ Rolling back to previous version..."

# 1. Stop services
docker-compose down

# 2. Checkout previous version
git checkout HEAD~1

# 3. Restore database
echo "📦 Restoring database..."
LATEST_BACKUP=$(ls -t backups/postgres-*.sql.gz | head -1)
gunzip < "$LATEST_BACKUP" | \
  docker exec -i resumate-postgres psql -U postgres resumate

# 4. Rebuild and restart
docker-compose up -d --build

echo "✅ Rollback completed"
```

---

## 📊 Monitoring & Maintenance

### **Monitoring Dashboard**

```typescript
// backend/src/modules/admin/admin.controller.ts

@Get('metrics/rate-limit')
async getRateLimitMetrics() {
  const keys = await this.redisService.keys('rate:*');
  
  const metrics = {
    totalKeys: keys.length,
    activeUsers: new Set(keys.map(k => k.split(':')[1])).size,
    topUsers: [],
  };

  // Get top rate limited users
  const counts = await Promise.all(
    keys.map(async (key) => ({
      key,
      value: await this.redisService.get(key),
    }))
  );

  metrics.topUsers = counts
    .sort((a, b) => parseInt(b.value) - parseInt(a.value))
    .slice(0, 10);

  return metrics;
}

@Get('metrics/usage')
async getUsageMetrics() {
  const usage = await this.userUsageRepository
    .createQueryBuilder('usage')
    .select('SUM(usage.cvUploads)', 'totalCvUploads')
    .addSelect('SUM(usage.projects)', 'totalProjects')
    .addSelect('SUM(usage.jobTailors)', 'totalJobTailors')
    .addSelect('SUM(usage.exports)', 'totalExports')
    .addSelect('AVG(usage.cvUploads)', 'avgCvUploads')
    .getRawOne();

  const planDistribution = await this.userRepository
    .createQueryBuilder('user')
    .select('user.plan', 'plan')
    .addSelect('COUNT(*)', 'count')
    .groupBy('user.plan')
    .getRawMany();

  return {
    usage,
    planDistribution,
  };
}
```

---

### **Alerting**

```typescript
// backend/src/shared/monitoring/alert.service.ts

@Injectable()
export class AlertService {
  constructor(private emailService: EmailService) {}

  async checkRedisHealth() {
    try {
      const ping = await this.redisService.ping();
      if (ping !== 'PONG') {
        await this.sendAlert('Redis', 'Redis ping failed');
      }
    } catch (error) {
      await this.sendAlert('Redis', `Redis error: ${error.message}`);
    }
  }

  async checkRateLimitAbuse() {
    const keys = await this.redisService.keys('rate:*:minute');
    
    for (const key of keys) {
      const count = await this.redisService.get(key);
      if (parseInt(count) > 100) {
        const userId = key.split(':')[1];
        await this.sendAlert(
          'Rate Limit Abuse',
          `User ${userId} exceeded 100 requests/minute`
        );
      }
    }
  }

  @Cron('*/5 * * * *') // Every 5 minutes
  async runHealthChecks() {
    await this.checkRedisHealth();
    await this.checkRateLimitAbuse();
  }
}
```

---

### **Backup Cron Jobs**

```bash
# /etc/cron.d/resumate-backup

# Daily PostgreSQL backup (critical)
0 2 * * * /path/to/deployment/backup-postgres.sh

# Weekly Redis backup (optional)
0 3 * * 0 /path/to/deployment/backup-redis.sh

# Monthly cleanup old backups
0 4 1 * * /path/to/deployment/cleanup-backups.sh
```

```bash
#!/bin/bash
# deployment/backup-postgres.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

docker exec resumate-postgres pg_dump -U postgres resumate \
  | gzip > "$BACKUP_DIR/postgres-$DATE.sql.gz"

# Keep only last 30 days
find "$BACKUP_DIR" -name "postgres-*.sql.gz" -mtime +30 -delete

echo "✅ PostgreSQL backup completed: postgres-$DATE.sql.gz"
```

---

## ⚠️ Error Handling

### **Backend Error Responses**

```typescript
// 429 Rate Limit Exceeded
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "ThrottlerException",
  "retryAfter": 42,  // seconds
  "limit": 10,
  "current": 11,
  "window": "minute"
}

// 403 Quota Exceeded
{
  "statusCode": 403,
  "message": "Monthly CV upload limit reached",
  "error": "ForbiddenException",
  "usage": {
    "feature": "cvUploads",
    "used": 1,
    "limit": 1,
    "resetsAt": "2025-11-01T00:00:00Z"
  },
  "upgrade": {
    "available": true,
    "plan": "pro",
    "newLimit": 10,
    "price": "$9.99/month"
  }
}

// 503 Redis Unavailable
{
  "statusCode": 503,
  "message": "Service temporarily unavailable",
  "error": "ServiceUnavailableException",
  "details": "Rate limiting service is down"
}
```

---

### **Frontend Error Handling**

```typescript
// frontend/src/components/errors/RateLimitError.tsx

const RateLimitError = ({ error, onRetry }) => {
  const [countdown, setCountdown] = useState(error.retryAfter);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Alert variant="warning">
      <AlertTitle>Too Many Requests</AlertTitle>
      <AlertDescription>
        You've exceeded the rate limit. 
        Retrying in {countdown} seconds...
      </AlertDescription>
      <Progress value={(error.retryAfter - countdown) / error.retryAfter * 100} />
    </Alert>
  );
};

// frontend/src/components/errors/QuotaExceededError.tsx

const QuotaExceededError = ({ error }) => {
  const { usage, upgrade } = error.details;
  const daysUntilReset = Math.ceil(
    (new Date(usage.resetsAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Alert variant="destructive">
      <AlertTitle>Monthly Limit Reached</AlertTitle>
      <AlertDescription>
        You've used {usage.used}/{usage.limit} {usage.feature} this month.
        Resets in {daysUntilReset} days.
      </AlertDescription>
      {upgrade.available && (
        <Button onClick={() => router.push('/upgrade')}>
          Upgrade to {upgrade.plan} - {upgrade.price}
        </Button>
      )}
    </Alert>
  );
};
```

---

## 📈 Performance Optimization

### **Redis Connection Pooling**

```typescript
// backend/src/shared/redis/redis.module.ts

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const cluster = new Redis.Cluster([
          {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        ], {
          redisOptions: {
            password: configService.get('REDIS_PASSWORD'),
          },
          clusterRetryStrategy: (times) => {
            return Math.min(times * 100, 2000);
          },
        });

        return cluster;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

---

### **Caching Strategy**

```typescript
// Three-tier caching
// 1. In-memory cache (hot data, <1ms)
// 2. Redis cache (warm data, 1-5ms)
// 3. PostgreSQL (cold data, 5-50ms)

const cache = new Map(); // In-memory

async getUserLimitsCached(userId: string) {
  // Tier 1: Memory
  if (cache.has(userId)) {
    return cache.get(userId);
  }

  // Tier 2: Redis
  const redisKey = `limits:${userId}`;
  const cached = await this.redisService.get(redisKey);
  if (cached) {
    const data = JSON.parse(cached);
    cache.set(userId, data);
    return data;
  }

  // Tier 3: Database
  const user = await this.findById(userId);
  const limits = this.getLimits(user.plan);

  // Cache in both layers
  cache.set(userId, limits);
  await this.redisService.set(redisKey, JSON.stringify(limits), 3600);

  return limits;
}
```

---

## ✅ Testing Strategy

```typescript
// backend/test/rate-limit.e2e-spec.ts

describe('Rate Limiting (e2e)', () => {
  it('should block after exceeding rate limit', async () => {
    const token = await getAuthToken('free');

    // Send 10 requests (limit for free plan)
    for (let i = 0; i < 10; i++) {
      const response = await request(app.getHttpServer())
        .get('/api/cv')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    }

    // 11th request should be blocked
    const response = await request(app.getHttpServer())
      .get('/api/cv')
      .set('Authorization', `Bearer ${token}`)
      .expect(429);

    expect(response.body).toHaveProperty('retryAfter');
  });

  it('should reset after TTL expires', async () => {
    // ... test TTL reset
  });

  it('should allow pro users more requests', async () => {
    const proToken = await getAuthToken('pro');
    
    // Pro users should handle 60 requests/minute
    for (let i = 0; i < 60; i++) {
      await request(app.getHttpServer())
        .get('/api/cv')
        .set('Authorization', `Bearer ${proToken}`)
        .expect(200);
    }
  });
});
```

---

## 🌥️ Migration to Cloud Services

### **Why Migrate to Cloud Rate Limiting?**

```
Local Redis                   Cloud Service
├─ Self-managed              ├─ Fully managed
├─ Single point failure      ├─ Multi-region redundancy
├─ Manual scaling            ├─ Auto-scaling
├─ Infrastructure cost       ├─ Pay-per-use
└─ Maintenance overhead      └─ Zero maintenance
```

---

### **Cloud Provider Comparison**

| Feature | AWS API Gateway | Cloudflare | Google Cloud Armor | Azure API Management |
|---------|----------------|------------|-------------------|---------------------|
| **Setup** | Medium | Easy | Medium | Medium |
| **Cost** | $3.50/M req | Free tier generous | $0.75/M req | $0.035/1K req |
| **Latency** | ~5ms | ~2ms | ~5ms | ~10ms |
| **DDoS Protection** | ✅ WAF | ✅ Built-in | ✅ Built-in | ✅ WAF |
| **Global** | ✅ Edge locations | ✅ 300+ PoPs | ✅ Edge | ✅ Multi-region |
| **Granularity** | Per API key | Per zone/rule | Per policy | Per product |
| **Best For** | AWS ecosystem | Static sites/CDN | GCP ecosystem | Enterprise |

---

### **Option 1: AWS API Gateway Usage Plans**

#### **Setup Steps:**

```bash
# 1. Create API Gateway
aws apigateway create-rest-api \
  --name "Resumate API" \
  --description "Resume management API"

# 2. Create usage plan
aws apigateway create-usage-plan \
  --name "Free Plan" \
  --description "Free tier: 10 req/min, 100 req/hour" \
  --throttle burstLimit=10,rateLimit=0.17 \
  --quota limit=100,period=HOUR

# 3. Create API key for user
aws apigateway create-api-key \
  --name "user-${USER_ID}" \
  --enabled

# 4. Associate key with plan
aws apigateway create-usage-plan-key \
  --usage-plan-id ${PLAN_ID} \
  --key-id ${KEY_ID} \
  --key-type API_KEY
```

#### **Implementation:**

```typescript
// backend/src/common/strategies/aws-rate-limit.strategy.ts

import { APIGatewayClient, GetUsageCommand } from '@aws-sdk/client-api-gateway';

@Injectable()
export class AwsRateLimitStrategy implements IRateLimitStrategy {
  private client: APIGatewayClient;

  constructor(private configService: ConfigService) {
    this.client = new APIGatewayClient({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async checkLimit(userId: string): Promise<boolean> {
    const apiKey = await this.getApiKeyForUser(userId);
    const usage = await this.getUsage(apiKey);
    
    // AWS returns current usage and limit
    return usage.remaining > 0;
  }

  async getRateLimitInfo(userId: string): Promise<RateLimitInfo> {
    const apiKey = await this.getApiKeyForUser(userId);
    const usage = await this.getUsage(apiKey);

    return {
      limit: usage.limit,
      remaining: usage.remaining,
      reset: usage.reset,
    };
  }

  private async getUsage(apiKey: string) {
    const command = new GetUsageCommand({
      usagePlanId: this.configService.get('AWS_USAGE_PLAN_ID'),
      keyId: apiKey,
    });

    const response = await this.client.send(command);
    const today = new Date().toISOString().split('T')[0];
    const usage = response.items?.[today] || { used: 0 };

    return {
      limit: 100, // From usage plan
      remaining: 100 - usage.used,
      reset: this.getNextHourTimestamp(),
    };
  }

  private getNextHourTimestamp(): number {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.getTime();
  }

  private async getApiKeyForUser(userId: string): Promise<string> {
    // Get from database or create new
    // Store mapping: userId -> AWS API Key
    return 'api-key-id';
  }
}
```

#### **Environment Variables:**

```bash
# AWS API Gateway
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_API_GATEWAY_ID=abc123xyz
AWS_USAGE_PLAN_FREE=plan-free-123
AWS_USAGE_PLAN_PRO=plan-pro-456
```

---

### **Option 2: Cloudflare Rate Limiting**

#### **Setup via Dashboard:**

1. Go to Cloudflare Dashboard → Security → WAF
2. Create Rate Limiting Rule:
   ```
   Name: Resumate API Rate Limit
   If: (http.request.uri.path contains "/api/")
   Then: Rate limit
   Requests: 10 per minute
   Action: Block with 429
   ```

#### **Implementation:**

```typescript
// backend/src/common/strategies/cloudflare-rate-limit.strategy.ts

@Injectable()
export class CloudflareRateLimitStrategy implements IRateLimitStrategy {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async checkLimit(userId: string): Promise<boolean> {
    // Cloudflare handles rate limiting at edge
    // This is just for displaying info to user
    
    // Query Cloudflare Analytics API
    const stats = await this.getCloudflareStats(userId);
    return stats.remaining > 0;
  }

  async getRateLimitInfo(userId: string): Promise<RateLimitInfo> {
    const stats = await this.getCloudflareStats(userId);
    return stats;
  }

  private async getCloudflareStats(userId: string) {
    const zoneId = this.configService.get('CLOUDFLARE_ZONE_ID');
    const apiToken = this.configService.get('CLOUDFLARE_API_TOKEN');

    // Query GraphQL Analytics API
    const response = await this.httpService.post(
      `https://api.cloudflare.com/client/v4/graphql`,
      {
        query: `{
          viewer {
            zones(filter: { zoneTag: "${zoneId}" }) {
              firewallEventsAdaptive(
                filter: {
                  clientRequestHTTPHeader_CF-User-ID: "${userId}"
                  action: "challenge"
                }
                limit: 1
              ) {
                count
              }
            }
          }
        }`,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    ).toPromise();

    // Parse and return
    return {
      limit: 10,
      remaining: 10 - (response.data?.viewer?.zones?.[0]?.count || 0),
      reset: Date.now() + 60000,
    };
  }
}
```

#### **Inject User ID in Request:**

```typescript
// Middleware to add user ID header for Cloudflare
@Injectable()
export class CloudflareUserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
      // Cloudflare will read this header for rate limiting
      res.setHeader('CF-User-ID', req.user.id);
      res.setHeader('CF-User-Plan', req.user.plan);
    }
    next();
  }
}
```

---

### **Option 3: Nginx Rate Limiting (Hybrid)**

Nếu dùng Nginx reverse proxy:

```nginx
# nginx.conf

http {
  # Define rate limit zones
  limit_req_zone $http_x_user_id zone=user_limit:10m rate=10r/m;
  limit_req_zone $http_x_user_plan_pro zone=pro_limit:10m rate=60r/m;

  server {
    location /api/ {
      # Apply rate limit based on user plan
      limit_req zone=user_limit burst=5 nodelay;
      
      # Return custom header
      add_header X-RateLimit-Limit $limit_req_limit;
      add_header X-RateLimit-Remaining $limit_req_remaining;

      proxy_pass http://backend:5001;
    }
  }
}
```

---

### **Migration Strategy**

#### **Phase 1: Preparation (Week 1)**

```bash
# 1. Add feature flag
RATE_LIMIT_STRATEGY=redis
ENABLE_RATE_LIMITING=true

# 2. Implement strategy pattern
# 3. Test with redis strategy
# 4. Deploy to production (no changes yet)
```

#### **Phase 2: Parallel Run (Week 2-3)**

```bash
# Run both Redis and Cloud in parallel
RATE_LIMIT_STRATEGY=redis
RATE_LIMIT_CLOUD_PARALLEL=true  # Log cloud results but don't enforce

# Compare results:
# - Redis: 100 requests blocked
# - Cloud: 95 requests blocked
# - Discrepancy: 5% (acceptable)
```

#### **Phase 3: Gradual Rollout (Week 4)**

```bash
# Use cloud for 10% of traffic
RATE_LIMIT_STRATEGY=redis
RATE_LIMIT_CLOUD_PERCENTAGE=10

# Increase gradually
# Day 1: 10%
# Day 2: 25%
# Day 3: 50%
# Day 4: 75%
# Day 5: 100%
```

#### **Phase 4: Full Migration (Week 5)**

```bash
# Switch to cloud completely
RATE_LIMIT_STRATEGY=cloud
CLOUD_RATE_LIMIT_PROVIDER=aws

# Keep Redis as fallback
RATE_LIMIT_FALLBACK=redis
```

#### **Phase 5: Cleanup (Week 6)**

```bash
# Remove Redis if stable
docker-compose down redis

# Update env
RATE_LIMIT_STRATEGY=cloud
# Remove: REDIS_HOST, REDIS_PORT
```

---

### **Cost Analysis**

#### **Redis (Self-hosted):**

```
VPS with Redis:
- 1GB RAM instance: $5/month
- Redis memory: ~256MB
- Backup storage: $1/month
Total: ~$6/month

Development time:
- Initial setup: 20 hours
- Maintenance: 2 hours/month
```

#### **AWS API Gateway:**

```
Production traffic: 1M requests/month
- Requests: $3.50
- Data transfer: $0.09/GB (~$5)
- CloudWatch: $1
Total: ~$9.50/month

Development time:
- Initial setup: 8 hours
- Maintenance: 0 hours/month
```

#### **Cloudflare:**

```
Free tier: 10K requests/day (300K/month)
Pro plan ($20/month): 1M requests/month included

Development time:
- Initial setup: 4 hours
- Maintenance: 0 hours/month
```

#### **Recommendation:**

- **< 100K requests/month**: Self-hosted Redis
- **100K - 1M requests/month**: Cloudflare Free/Pro
- **> 1M requests/month**: AWS API Gateway or Cloudflare Enterprise

---

### **Rollback Plan**

```typescript
// Automatic fallback on cloud failure
@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try cloud strategy
      return await this.cloudStrategy.checkLimit(userId);
    } catch (error) {
      // Log error
      this.logger.error('Cloud rate limit failed, falling back to Redis');
      
      // Fallback to Redis
      return await this.redisStrategy.checkLimit(userId);
    }
  }
}
```

---

### **Testing Cloud Migration**

```typescript
// backend/test/rate-limit-migration.e2e-spec.ts

describe('Rate Limit Migration', () => {
  it('should match Redis and Cloud results', async () => {
    const userId = 'test-user';
    
    // Test with Redis
    process.env.RATE_LIMIT_STRATEGY = 'redis';
    const redisResult = await testRateLimit(userId, 100);
    
    // Test with Cloud
    process.env.RATE_LIMIT_STRATEGY = 'cloud';
    const cloudResult = await testRateLimit(userId, 100);
    
    // Compare
    expect(cloudResult.blocked).toBeCloseTo(redisResult.blocked, 5); // 5% tolerance
  });

  it('should fallback to Redis on cloud failure', async () => {
    // Simulate cloud failure
    mockCloudService.mockImplementation(() => {
      throw new Error('Cloud unavailable');
    });

    const result = await request(app)
      .get('/api/cv')
      .set('Authorization', token);

    expect(result.status).toBe(200);
    expect(result.headers['x-ratelimit-provider']).toBe('redis-fallback');
  });
});
```

---

## 📝 Summary

### **Key Metrics:**
- ✅ Rate limit check latency: < 2ms (Redis) / < 5ms (Cloud)
- ✅ Usage check latency: < 20ms (with cache)
- ✅ Total overhead: < 25ms
- ✅ Redis memory usage: ~256MB
- ✅ Availability: 99.9% (Redis) / 99.99% (Cloud)

### **Feature Flags:**
- ✅ `RATE_LIMIT_STRATEGY`: redis | cloud | disabled
- ✅ `ENABLE_RATE_LIMITING`: true | false
- ✅ `CLOUD_RATE_LIMIT_PROVIDER`: aws | cloudflare | azure

### **Implementation Timeline:**
- Week 1: Backend infrastructure (Strategy pattern, Redis)
- Week 2: Guards & middleware
- Week 3: Frontend integration
- Week 4: Testing & deployment
- Week 5: Monitoring & optimization
- Week 6+: Optional cloud migration

### **Migration Path:**
1. Start with Redis (simple, cheap, fast)
2. Implement strategy pattern (future-proof)
3. When traffic grows → Migrate to cloud
4. Keep Redis as fallback (reliability)

### **Next Steps:**
1. Review this workflow
2. Decide on initial strategy (recommend: Redis)
3. Setup development environment
4. Implement Phase 1-7
5. Test locally
6. Deploy to staging
7. Production deployment
8. Monitor and optimize
9. (Optional) Plan cloud migration when needed

