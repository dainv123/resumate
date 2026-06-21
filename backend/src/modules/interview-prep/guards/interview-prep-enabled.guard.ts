import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INTERVIEW_PREP_ENV } from '../constants/interview-prep-env.constants';

@Injectable()
export class InterviewPrepEnabledGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    const enabled =
      this.configService.get<string>(
        INTERVIEW_PREP_ENV.ENABLED,
        INTERVIEW_PREP_ENV.DEFAULT_ENABLED,
      ) === 'true';

    if (!enabled) {
      throw new ForbiddenException('Interview Prep is not available');
    }

    return true;
  }
}
