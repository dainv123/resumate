import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitStrategyFactory } from '../factories/rate-limit-strategy.factory';
import { IRateLimitStrategy } from '../strategies/rate-limit.strategy';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly strategy: IRateLimitStrategy;

  constructor(
    private readonly reflector: Reflector,
    private readonly strategyFactory: RateLimitStrategyFactory,
  ) {
    this.strategy = this.strategyFactory.getStrategy();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitMeta = this.reflector.get(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitMeta) {
      return true; // No rate limit set
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    if (!user) {
      return true; // Not authenticated, skip rate limiting
    }

    const { window } = rateLimitMeta;
    const userId = user.id;
    const plan = user.plan || 'free';

    try {
      // Check rate limit
      const canProceed = await this.strategy.checkLimit(userId, plan, window);

      // Get rate limit info for headers
      const info = await this.strategy.getRateLimitInfo(userId, plan, window);

      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', info.limit);
      response.setHeader('X-RateLimit-Remaining', info.remaining);
      response.setHeader('X-RateLimit-Reset', info.reset);

      if (!canProceed) {
        const retryAfter = Math.ceil((info.reset - Date.now()) / 1000);
        response.setHeader('Retry-After', retryAfter);

        this.logger.warn(
          `Rate limit exceeded for user ${userId} (${plan} plan)`,
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests',
            error: 'ThrottlerException',
            retryAfter,
            limit: info.limit,
            remaining: 0,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      // If it's already an HTTP exception, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Log error and allow request to proceed (fail-open strategy)
      this.logger.error(
        `Rate limit check failed for user ${userId}:`,
        error,
      );
      return true;
    }
  }
}

