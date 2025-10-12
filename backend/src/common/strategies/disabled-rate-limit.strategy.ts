import { Injectable } from '@nestjs/common';
import { IRateLimitStrategy, RateLimitInfo } from './rate-limit.strategy';

/**
 * Disabled rate limiting strategy
 * Used for testing or when rate limiting is turned off
 */
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

