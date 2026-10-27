import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

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
});
