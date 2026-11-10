import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

type Counter = { count: number; ttl: number | null };

function createFakeRedis() {
  const keys = new Map<string, Counter>();

  return {
    isOpen: true,
    async incr(key: string): Promise<number> {
      const row = keys.get(key) ?? { count: 0, ttl: null };
      row.count += 1;
      keys.set(key, row);
      return row.count;
    },
    async ttl(key: string): Promise<number> {
      const row = keys.get(key);
      if (!row) return -2;
      return row.ttl ?? -1;
    },
    async expire(key: string, seconds: number): Promise<number> {
      const row = keys.get(key);
      if (!row) return 0;
      row.ttl = seconds;
      return 1;
    },
    snapshot(key: string): Counter | undefined {
      const row = keys.get(key);
      return row ? { ...row } : undefined;
    },
    dropTtl(key: string): void {
      const row = keys.get(key);
      if (row) row.ttl = null;
    },
    delete(key: string): void {
      keys.delete(key);
    },
  };
}

function serviceWithClient(
  client: ReturnType<typeof createFakeRedis>,
): RedisService {
  const config = {
    get: jest.fn(),
  } as unknown as ConfigService;
  const service = new RedisService(config);
  const readyService = service as unknown as {
    client: ReturnType<typeof createFakeRedis>;
    ready: boolean;
  };
  readyService.client = client;
  readyService.ready = true;
  return service;
}

describe('RedisService', () => {
  it('consumeRateLimit allows when Redis is not ready (fail-open)', async () => {
    const config = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'REDIS_ENABLED') return 'false';
        return fallback;
      }),
    } as unknown as ConfigService;

    const service = new RedisService(config);
    await service.onModuleInit();

    expect(service.isReady()).toBe(false);
    await expect(
      service.consumeRateLimit('rl:test', 1, 60),
    ).resolves.toBe(true);
  });

  it('sets a TTL on the first hit and denies once the window is full', async () => {
    const redis = createFakeRedis();
    const service = serviceWithClient(redis);

    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).resolves.toBe(
      true,
    );
    expect(redis.snapshot('rl:ai:user')).toEqual({ count: 1, ttl: 60 });

    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).resolves.toBe(
      true,
    );
    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).resolves.toBe(
      false,
    );
    expect(redis.snapshot('rl:ai:user')?.ttl).toBe(60);
  });

  it('repairs a counter left without a TTL so the lockout can expire', async () => {
    const redis = createFakeRedis();
    const service = serviceWithClient(redis);
    const expire = redis.expire.bind(redis);
    let expireAttempts = 0;
    redis.expire = async (key: string, seconds: number) => {
      expireAttempts += 1;
      if (expireAttempts === 1) {
        throw new Error('connection reset');
      }
      return expire(key, seconds);
    };

    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).rejects.toThrow(
      'connection reset',
    );
    expect(redis.snapshot('rl:ai:user')).toEqual({ count: 1, ttl: null });

    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).resolves.toBe(
      true,
    );
    expect(redis.snapshot('rl:ai:user')).toEqual({ count: 2, ttl: 60 });

    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).resolves.toBe(
      false,
    );

    redis.delete('rl:ai:user');
    await expect(service.consumeRateLimit('rl:ai:user', 2, 60)).resolves.toBe(
      true,
    );
    expect(redis.snapshot('rl:ai:user')).toEqual({ count: 1, ttl: 60 });
  });
});
