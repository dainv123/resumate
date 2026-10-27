export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisEnv = {
  HOST: 'REDIS_HOST',
  PORT: 'REDIS_PORT',
  ENABLED: 'REDIS_ENABLED',
  AI_RATE_LIMIT_MAX: 'AI_RATE_LIMIT_MAX',
  AI_RATE_LIMIT_WINDOW_SEC: 'AI_RATE_LIMIT_WINDOW_SEC',
  PORTFOLIO_CACHE_TTL_SEC: 'PORTFOLIO_CACHE_TTL_SEC',
} as const;

export const RedisDefaults = {
  HOST: 'localhost',
  PORT: 6379,
  ENABLED: 'true',
  /** Max AI-heavy requests per user per window */
  AI_RATE_LIMIT_MAX: 30,
  AI_RATE_LIMIT_WINDOW_SEC: 3600,
  PORTFOLIO_CACHE_TTL_SEC: 300,
} as const;

export const RedisKey = {
  aiRateLimit: (userId: string) => `rl:ai:${userId}`,
  portfolioHtml: (username: string) =>
    `cache:portfolio:html:${username.toLowerCase()}`,
} as const;
