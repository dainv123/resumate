import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type RedisClientType } from 'redis';
import { RedisDefaults, RedisEnv } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private ready = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const enabled =
      this.configService.get<string>(
        RedisEnv.ENABLED,
        RedisDefaults.ENABLED,
      ) !== 'false';

    if (!enabled) {
      this.logger.warn('Redis disabled (REDIS_ENABLED=false)');
      return;
    }

    const host = this.configService.get<string>(
      RedisEnv.HOST,
      RedisDefaults.HOST,
    );
    const port = Number(
      this.configService.get<string>(RedisEnv.PORT) ?? RedisDefaults.PORT,
    );

    this.client = createClient({
      socket: { host, port },
    });

    this.client.on('error', (err) => {
      this.ready = false;
      this.logger.error(`Redis error: ${err.message}`);
    });

    try {
      await this.client.connect();
      this.ready = true;
      this.logger.log(`Redis connected at ${host}:${port}`);
    } catch (err) {
      this.ready = false;
      this.client = null;
      // shortcut: fail-open when Redis is down so local/dev still works; harden to fail-closed in prod if abuse appears
      this.logger.warn(
        `Redis unavailable — rate limit & cache disabled: ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
    this.ready = false;
    this.client = null;
  }

  isReady(): boolean {
    return this.ready && !!this.client?.isOpen;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady()) return null;
    return this.client!.get(key);
  }

  async set(key: string, value: string, ttlSec?: number): Promise<void> {
    if (!this.isReady()) return;
    if (ttlSec && ttlSec > 0) {
      await this.client!.set(key, value, { EX: ttlSec });
      return;
    }
    await this.client!.set(key, value);
  }

  async del(key: string): Promise<void> {
    if (!this.isReady()) return;
    await this.client!.del(key);
  }

  /**
   * Fixed-window counter. Returns true if the request is allowed.
   * Fail-open when Redis is down.
   */
  async consumeRateLimit(
    key: string,
    max: number,
    windowSec: number,
  ): Promise<boolean> {
    if (!this.isReady()) return true;

    const count = await this.client!.incr(key);
    if (count === 1) {
      await this.client!.expire(key, windowSec);
    }
    return count <= max;
  }
}
