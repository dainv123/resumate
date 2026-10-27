import { Injectable, Logger } from '@nestjs/common';
import { InterviewPrepAnalyticsEvent } from '../constants/interview-prep-analytics.constants';

@Injectable()
export class InterviewPrepAnalyticsService {
  private readonly logger = new Logger(InterviewPrepAnalyticsService.name);

  track(
    userId: string,
    event: InterviewPrepAnalyticsEvent,
    resourceId?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.logger.log(
      JSON.stringify({
        type: 'analytics',
        event,
        userId,
        resourceId,
        metadata,
        at: new Date().toISOString(),
      }),
    );
  }
}
