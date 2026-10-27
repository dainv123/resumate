import { InterviewPrepAnalyticsEvent } from '../constants/interview-prep-analytics.constants';
import { InterviewPrepAnalyticsService } from './interview-prep-analytics.service';

describe('InterviewPrepAnalyticsService', () => {
  it('tracks events without throwing', () => {
    const service = new InterviewPrepAnalyticsService();

    expect(() =>
      service.track(
        'user-1',
        InterviewPrepAnalyticsEvent.PLAN_CREATED,
        'plan-1',
        { readinessScore: 65 },
      ),
    ).not.toThrow();
  });
});
