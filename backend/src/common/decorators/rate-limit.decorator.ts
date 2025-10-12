import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  limit: number;
  window: 'minute' | 'hour';
}

/**
 * Apply rate limiting to an endpoint
 * @param limit Number of requests allowed
 * @param window Time window ('minute' or 'hour')
 */
export const RateLimit = (limit: number, window: 'minute' | 'hour' = 'minute') =>
  SetMetadata(RATE_LIMIT_KEY, { limit, window });

