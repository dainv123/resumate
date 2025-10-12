import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '../shared/redis/redis.module';
import { UsersModule } from '../modules/users/users.module';

// Strategies
import { RedisRateLimitStrategy } from './strategies/redis-rate-limit.strategy';
import { CloudRateLimitStrategy } from './strategies/cloud-rate-limit.strategy';
import { DisabledRateLimitStrategy } from './strategies/disabled-rate-limit.strategy';

// Factory
import { RateLimitStrategyFactory } from './factories/rate-limit-strategy.factory';

// Guards
import { RateLimitGuard } from './guards/rate-limit.guard';
import { UsageGuard } from './guards/usage.guard';

@Module({
  imports: [ConfigModule, HttpModule, RedisModule, UsersModule],
  providers: [
    // Strategies
    RedisRateLimitStrategy,
    CloudRateLimitStrategy,
    DisabledRateLimitStrategy,
    
    // Factory
    RateLimitStrategyFactory,
    
    // Guards
    RateLimitGuard,
    UsageGuard,
  ],
  exports: [
    RateLimitStrategyFactory,
    RateLimitGuard,
    UsageGuard,
  ],
})
export class RateLimitModule {}

