import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobDescription } from '../cv/entities/job-description.entity';
import { CvModule } from '../cv/cv.module';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { InterviewPrepController } from './interview-prep.controller';
import { InterviewPrepService } from './interview-prep.service';
import { QuestionBank } from './entities/question-bank.entity';
import { InterviewPrepPlan } from './entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from './entities/interview-question-assignment.entity';
import { ImpactScoringService } from './services/impact-scoring.service';
import { DailySchedulerService } from './services/daily-scheduler.service';
import { QuestionBankSeederService } from './services/question-bank-seeder.service';
import { QuestionSelectorService } from './services/question-selector.service';
import { ReadinessService } from './services/readiness.service';
import { SpacedRepetitionService } from './services/spaced-repetition.service';
import { CheatSheetExportService } from './services/cheat-sheet-export.service';
import { InterviewPrepAnalyticsService } from './services/interview-prep-analytics.service';
import { InterviewPrepReminderTask } from './tasks/interview-prep-reminder.task';
import { InterviewPrepEnabledGuard } from './guards/interview-prep-enabled.guard';
import { JdUrlResolverService } from './services/jd-url-resolver.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionBank,
      InterviewPrepPlan,
      InterviewQuestionAssignment,
      JobDescription,
    ]),
    CvModule,
    AiModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [InterviewPrepController],
  providers: [
    InterviewPrepService,
    ImpactScoringService,
    DailySchedulerService,
    QuestionBankSeederService,
    QuestionSelectorService,
    ReadinessService,
    SpacedRepetitionService,
    CheatSheetExportService,
    InterviewPrepAnalyticsService,
    InterviewPrepReminderTask,
    InterviewPrepEnabledGuard,
    JdUrlResolverService,
  ],
  exports: [
    TypeOrmModule,
    InterviewPrepService,
    ImpactScoringService,
    DailySchedulerService,
  ],
})
export class InterviewPrepModule {}
