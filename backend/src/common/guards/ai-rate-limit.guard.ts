import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RedisDefaults,
  RedisEnv,
  RedisKey,
} from '../../shared/redis/redis.constants';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request.user?.id;
    const keyPart = userId ?? request.ip ?? 'anonymous';

    const max = Number(
      this.configService.get<string>(RedisEnv.AI_RATE_LIMIT_MAX) ??
        RedisDefaults.AI_RATE_LIMIT_MAX,
    );
    const windowSec = Number(
      this.configService.get<string>(RedisEnv.AI_RATE_LIMIT_WINDOW_SEC) ??
        RedisDefaults.AI_RATE_LIMIT_WINDOW_SEC,
    );

    const allowed = await this.redisService.consumeRateLimit(
      RedisKey.aiRateLimit(keyPart),
      max,
      windowSec,
    );

    if (!allowed) {
      throw new HttpException(
        `AI rate limit exceeded (${max} requests / ${windowSec}s). Try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
