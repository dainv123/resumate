import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
// import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivityTrackingInterceptor } from './common/interceptors/activity-tracking.interceptor';
import { RedisModule } from './shared/redis/redis.module';
import { RateLimitModule } from './common/rate-limit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      ssl: { rejectUnauthorized: false },
      extra: {
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      },
    }),
    RedisModule,
    RateLimitModule,
    AuthModule,
    UsersModule,
    CvModule,
    ProjectsModule,
    PortfolioModule,
    AiModule,
    AnalyticsModule,
    TemplatesModule,
    // NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityTrackingInterceptor,
    },
  ],
})
export class AppModule {}
