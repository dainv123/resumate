import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('stats')
  async getStats(@GetUser('id') userId: string) {
    return this.analyticsService.getStats(userId);
  }

  @Get('exports')
  async getExportHistory(
    @GetUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.analyticsService.getExportHistory(userId, limitNum);
  }

  @Get('activity')
  async getActivityLog(
    @GetUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 100;
    return this.analyticsService.getActivityLog(userId, limitNum);
  }

  @Get('exports-by-format')
  async getExportsByFormat(@GetUser('id') userId: string) {
    return this.analyticsService.getExportsByFormat(userId);
  }

  @Get('activities-by-type')
  async getActivitiesByType(@GetUser('id') userId: string) {
    return this.analyticsService.getActivitiesByType(userId);
  }

  @Get('timeline')
  async getTimelineData(
    @GetUser('id') userId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days) : 30;
    return this.analyticsService.getTimelineData(userId, daysNum);
  }

  @Post('track')
  async trackActivity(
    @GetUser('id') userId: string,
    @Body() body: { action: string; resourceId?: string; metadata?: any },
  ) {
    await this.analyticsService.trackActivity(
      userId,
      body.action,
      body.resourceId,
      body.metadata,
    );
    return { success: true };
  }
}

