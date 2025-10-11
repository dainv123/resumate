import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { TRACK_ACTIVITY_KEY, TrackActivityOptions } from '../decorators/track-activity.decorator';

@Injectable()
export class ActivityTrackingInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private analyticsService: AnalyticsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const trackOptions = this.reflector.get<TrackActivityOptions>(
      TRACK_ACTIVITY_KEY,
      context.getHandler(),
    );

    // If no @TrackActivity decorator, skip tracking
    if (!trackOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.userId;

    // If no userId (not authenticated), skip tracking
    if (!userId) {
      return next.handle();
    }

    // Execute the handler and track activity after completion
    return next.handle().pipe(
      tap(async (result) => {
        try {
          // Prepare context for callbacks
          const callbackContext = {
            params: request.params,
            query: request.query,
            body: request.body,
          };

          const resourceId = trackOptions.getResourceId?.(result, callbackContext);
          const metadata = trackOptions.getMetadata?.(result, callbackContext);

          await this.analyticsService.trackActivity(
            userId,
            trackOptions.type,
            resourceId,
            metadata,
          );
        } catch (error) {
          // Log error but don't break the request
          console.error('Failed to track activity:', error);
        }
      }),
    );
  }
}

