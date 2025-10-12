import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get('REDIS_HOST', 'localhost');
    const port = this.configService.get('REDIS_PORT', 6379);

    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis connection attempt ${times}, retry in ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis is ready');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set key-value pair
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
    }
  }

  /**
   * Set key-value pair with expiration
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    try {
      await this.client.setex(key, seconds, value);
    } catch (error) {
      this.logger.error(`Error setting key ${key} with expiration:`, error);
    }
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiration time
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
    }
  }

  /**
   * Get time to live
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Error deleting multiple keys:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get keys by pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys by pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Ping Redis
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis ping failed:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      this.logger.error('Error getting Redis info:', error);
      return '';
    }
  }

  /**
   * Flush all data (use with caution!)
   */
  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.warn('Redis flushed all data');
    } catch (error) {
      this.logger.error('Error flushing Redis:', error);
    }
  }

  /**
   * Get raw Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}

