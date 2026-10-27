import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CvModule } from './modules/cv/cv.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InterviewPrepModule } from './modules/interview-prep/interview-prep.module';
import { ActivityTrackingInterceptor } from './common/interceptors/activity-tracking.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RedisModule } from './shared/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Prefer .env.dev (Docker / laptop) over shared .env (RDS / resumate.click)
      envFilePath: ['../.env.dev', '.env.dev', '../.env', '.env'],
      validatePredefined: false,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Docker sets TYPEORM_SYNCHRONIZE=false (entrypoint runs schema:sync + migration:run).
      synchronize:
        process.env.TYPEORM_SYNCHRONIZE === 'true' ||
        (process.env.TYPEORM_SYNCHRONIZE !== 'false' &&
          process.env.NODE_ENV === 'development'),
      ssl:
        process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      extra: {
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      },
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    CvModule,
    ProjectsModule,
    PortfolioModule,
    AiModule,
    AnalyticsModule,
    TemplatesModule,
    NotificationsModule,
    InterviewPrepModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityTrackingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
