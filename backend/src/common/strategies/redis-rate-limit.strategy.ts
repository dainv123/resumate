import { Injectable } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import {
  IRateLimitStrategy,
  RateLimitInfo,
  getLimitsByPlan,
  getWindowSeconds,
} from './rate-limit.strategy';

@Injectable()
export class RedisRateLimitStrategy implements IRateLimitStrategy {
  constructor(private readonly redisService: RedisService) {}

  async checkLimit(
    userId: string,
    plan: string,
    window: string,
  ): Promise<boolean> {
    const limits = getLimitsByPlan(plan);
    const key = `rate:${userId}:${window}`;
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, getWindowSeconds(window));
    }

    const limit = limits[window] || limits.minute;
    return count <= limit;
  }

  async getRemaining(userId: string, window: string): Promise<number> {
    const key = `rate:${userId}:${window}`;
    const count = parseInt((await this.redisService.get(key)) || '0');
    const limit = 10; // Default, should get from plan
    return Math.max(0, limit - count);
  }

  async getRateLimitInfo(
    userId: string,
    plan: string,
    window: string,
  ): Promise<RateLimitInfo> {
    const key = `rate:${userId}:${window}`;
    const count = parseInt((await this.redisService.get(key)) || '0');
    const ttl = await this.redisService.ttl(key);
    const limits = getLimitsByPlan(plan);
    const limit = limits[window] || limits.minute;

    return {
      limit,
      remaining: Math.max(0, limit - count),
      reset: Date.now() + (ttl > 0 ? ttl * 1000 : 0),
    };
  }
}

