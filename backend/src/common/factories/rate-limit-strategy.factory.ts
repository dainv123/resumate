import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRateLimitStrategy } from '../strategies/rate-limit.strategy';
import { RedisRateLimitStrategy } from '../strategies/redis-rate-limit.strategy';
import { CloudRateLimitStrategy } from '../strategies/cloud-rate-limit.strategy';
import { DisabledRateLimitStrategy } from '../strategies/disabled-rate-limit.strategy';

@Injectable()
export class RateLimitStrategyFactory {
  private readonly logger = new Logger(RateLimitStrategyFactory.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisRateLimitStrategy: RedisRateLimitStrategy,
    private readonly cloudRateLimitStrategy: CloudRateLimitStrategy,
    private readonly disabledRateLimitStrategy: DisabledRateLimitStrategy,
  ) {}

  getStrategy(): IRateLimitStrategy {
    const enabled =
      this.configService.get('ENABLE_RATE_LIMITING', 'true') === 'true';

    if (!enabled) {
      this.logger.warn('Rate limiting is disabled');
      return this.disabledRateLimitStrategy;
    }

    const strategy = this.configService.get('RATE_LIMIT_STRATEGY', 'redis');

    switch (strategy) {
      case 'redis':
        this.logger.log('Using Redis rate limiting strategy');
        return this.redisRateLimitStrategy;

      case 'cloud':
        this.logger.log('Using Cloud rate limiting strategy');
        return this.cloudRateLimitStrategy;

      case 'disabled':
        this.logger.warn('Rate limiting is disabled via strategy');
        return this.disabledRateLimitStrategy;

      default:
        this.logger.warn(
          `Unknown rate limit strategy: ${strategy}, using disabled`,
        );
        return this.disabledRateLimitStrategy;
    }
  }
}

