import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './entities/analytics.entity';
import { Cv } from '../cv/entities/cv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, Cv])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

