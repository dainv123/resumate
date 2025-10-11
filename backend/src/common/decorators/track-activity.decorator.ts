import { SetMetadata } from '@nestjs/common';
import { ActivityType } from '../enums/activity-type.enum';

export const TRACK_ACTIVITY_KEY = 'trackActivity';

export interface RequestContext {
  params: any;
  query: any;
  body: any;
}

export interface TrackActivityOptions {
  type: ActivityType;
  getResourceId?: (result: any, context: RequestContext) => string | undefined;
  getMetadata?: (result: any, context: RequestContext) => any;
}

/**
 * Decorator to automatically track user activities
 * @param type - Type of activity to track
 * @param options - Optional configuration
 * 
 * @example
 * ```typescript
 * @TrackActivity(ActivityType.CV_UPLOADED, {
 *   getResourceId: (cv) => cv.id,
 *   getMetadata: (cv, context) => ({ fileName: cv.originalFileName })
 * })
 * 
 * @TrackActivity(ActivityType.CV_EXPORTED, {
 *   getResourceId: (result, context) => context.params.id,
 *   getMetadata: (result, context) => ({ format: 'pdf', template: context.query.template })
 * })
 * ```
 */
export const TrackActivity = (
  type: ActivityType,
  options?: {
    getResourceId?: (result: any, context: RequestContext) => string | undefined;
    getMetadata?: (result: any, context: RequestContext) => any;
  }
) => {
  const trackOptions: TrackActivityOptions = {
    type,
    getResourceId: options?.getResourceId || ((result) => result?.id),
    getMetadata: options?.getMetadata,
  };
  
  return SetMetadata(TRACK_ACTIVITY_KEY, trackOptions);
};

