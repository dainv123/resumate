import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './shared/redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('api/health/rate-limit-status')
  async getRateLimitStatus() {
    const strategy = this.configService.get('RATE_LIMIT_STRATEGY', 'redis');
    const enabled = this.configService.get('ENABLE_RATE_LIMITING', 'true') === 'true';

    let redisHealth = 'unknown';
    
    if (strategy === 'redis' && enabled) {
      try {
        const ping = await this.redisService.ping();
        redisHealth = ping ? 'healthy' : 'unhealthy';
      } catch (error) {
        redisHealth = 'error';
      }
    } else if (!enabled) {
      redisHealth = 'disabled';
    }

    return {
      strategy,
      enabled,
      health: redisHealth,
      timestamp: new Date().toISOString(),
      info: {
        message: enabled 
          ? `Rate limiting is enabled using ${strategy} strategy`
          : 'Rate limiting is disabled',
      },
    };
  }
}
