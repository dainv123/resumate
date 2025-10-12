import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_USAGE_KEY } from '../decorators/check-usage.decorator';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class UsageGuard implements CanActivate {
  private readonly logger = new Logger(UsageGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get(CHECK_USAGE_KEY, context.getHandler());

    if (!feature) {
      return true; // No usage check set
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Not authenticated, skip usage check
    }

    try {
      const canProceed = await this.usersService.checkUserLimit(
        user.id,
        feature,
      );

      if (!canProceed) {
        const usage = await this.usersService.getUserUsage(user.id);
        const limits = this.usersService.getLimits(user.plan);

        this.logger.warn(
          `Usage limit exceeded for user ${user.id}: ${feature} (${usage[feature]}/${limits[feature]})`,
        );

        throw new ForbiddenException({
          statusCode: 403,
          message: `Monthly ${feature} limit reached`,
          error: 'ForbiddenException',
          usage: {
            feature,
            used: usage[feature],
            limit: limits[feature],
            resetsAt: usage.resetDate,
          },
          upgrade: this.getUpgradeInfo(user.plan),
        });
      }

      return true;
    } catch (error) {
      // If it's already a ForbiddenException, rethrow it
      if (error instanceof ForbiddenException) {
        throw error;
      }

      // Log error and allow request to proceed (fail-open strategy)
      this.logger.error(
        `Usage check failed for user ${user.id}:`,
        error,
      );
      return true;
    }
  }

  private getUpgradeInfo(currentPlan: string) {
    if (currentPlan === 'free') {
      return {
        available: true,
        plan: 'pro',
        price: '$9.99/month',
      };
    } else if (currentPlan === 'pro') {
      return {
        available: true,
        plan: 'enterprise',
        price: 'Contact sales',
      };
    }
    return { available: false };
  }
}

