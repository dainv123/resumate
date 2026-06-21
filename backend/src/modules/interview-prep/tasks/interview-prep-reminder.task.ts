import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../../notifications/notifications.service';
import { UsersService } from '../../users/users.service';
import { InterviewPrepAnalyticsEvent } from '../constants/interview-prep-analytics.constants';
import { PrepPlanStatus } from '../constants/interview-prep.constants';
import { formatDateISO, PrepDay } from '../domain/pass-framework';
import { InterviewPrepPlan } from '../entities/interview-prep-plan.entity';
import { InterviewPrepAnalyticsService } from '../services/interview-prep-analytics.service';

@Injectable()
export class InterviewPrepReminderTask {
  private readonly logger = new Logger(InterviewPrepReminderTask.name);

  constructor(
    @InjectRepository(InterviewPrepPlan)
    private planRepository: Repository<InterviewPrepPlan>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private analyticsService: InterviewPrepAnalyticsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyReminders(): Promise<void> {
    const today = formatDateISO(new Date());
    this.logger.log(`Running daily interview prep reminders for ${today}`);

    const plans = await this.planRepository.find({
      where: { status: PrepPlanStatus.ACTIVE },
    });

    for (const plan of plans) {
      if (formatDateISO(new Date(plan.interviewDate)) < today) continue;
      if (plan.lastReminderDate === today) continue;

      const roadmap = plan.roadmap as unknown as PrepDay[];
      const todayDay = roadmap.find((d) => d.date === today);
      if (!todayDay || todayDay.tasks.length === 0) continue;

      const user = await this.usersService.findById(plan.userId);
      await this.notificationsService.notifyDailyPrepReminder(
        user.email,
        user.name,
        plan.id,
        todayDay,
        Number(plan.readinessScore ?? 0),
      );

      plan.lastReminderDate = today;
      await this.planRepository.save(plan);

      this.analyticsService.track(
        plan.userId,
        InterviewPrepAnalyticsEvent.REMINDER_SENT,
        plan.id,
        { date: today, taskCount: todayDay.tasks.length },
      );
    }
  }
}
