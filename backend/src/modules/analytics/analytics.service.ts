import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics, ActivityEvent } from './entities/analytics.entity';
import { Cv } from '../cv/entities/cv.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
  ) {}

  async getOrCreateAnalytics(userId: string): Promise<Analytics> {
    // Find with order by updatedAt DESC to get the most recent one with data
    const analytics = await this.analyticsRepository.findOne({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    if (!analytics) {
      const newAnalytics = this.analyticsRepository.create({
        userId,
        activityLog: [],
      });
      return await this.analyticsRepository.save(newAnalytics);
    }

    return analytics;
  }

  async trackActivity(userId: string, action: string, resourceId?: string, metadata?: any): Promise<void> {
    const analytics = await this.getOrCreateAnalytics(userId);

    const activityEvent: ActivityEvent = {
      date: new Date().toISOString(),
      action,
      resourceId,
      metadata,
    };
    analytics.activityLog.push(activityEvent);

    await this.analyticsRepository.save(analytics);
  }

  async getStats(userId: string) {
    // Get all user's CVs
    const cvs = await this.cvRepository.find({
      where: { userId },
      select: ['id', 'isTailored'],
    });

    // Get activity log for all analytics
    const analytics = await this.getOrCreateAnalytics(userId);

    this.logger.debug(`[getStats] userId: ${userId}`);
    this.logger.debug(`[getStats] activityLog length: ${analytics.activityLog.length}`);
    this.logger.debug(`[getStats] activityLog: ${JSON.stringify(analytics.activityLog.slice(0, 5))}`);

    // Aggregate export data from activityLog
    let totalExports = 0;
    let pdfCount = 0, wordCount = 0, atsCount = 0;
    let lastExportDate: string | null = null;

    analytics.activityLog.forEach(activity => {
      if (activity.action === 'cv_exported') {
        totalExports++;
        
        if (activity.metadata?.format === 'pdf') pdfCount++;
        else if (activity.metadata?.format === 'word') wordCount++;
        else if (activity.metadata?.format === 'ats') atsCount++;
        
        // Track latest export
        if (!lastExportDate || new Date(activity.date) > new Date(lastExportDate)) {
          lastExportDate = activity.date;
        }
      }
    });

    this.logger.debug(`[getStats] totalExports: ${totalExports}, pdf: ${pdfCount}, word: ${wordCount}, ats: ${atsCount}`);

    // Count total activities from activityLog
    const totalActivities = analytics.activityLog.length;
    
    // Find last activity
    const lastActivity = analytics.activityLog.length > 0
      ? analytics.activityLog[analytics.activityLog.length - 1].date
      : null;

    return {
      stats: {
        cvViews: 0, // Not tracked yet
        cvDownloads: totalExports,
        cvUploads: cvs.length,
        tailoringCount: cvs.filter(cv => cv.isTailored).length,
        portfolioCreated: 0, // Not tracked yet
        exportsByFormat: {
          pdf: pdfCount,
          word: wordCount,
          ats: atsCount,
        },
      },
      totalExports,
      totalActivities,
      lastActivity,
    };
  }

  async getExportHistory(userId: string, limit: number = 50) {
    const analytics = await this.getOrCreateAnalytics(userId);
    
    // Get all CVs to map ID to name
    const cvs = await this.cvRepository.find({
      where: { userId },
      select: ['id', 'originalFileName'],
    });
    const cvMap = new Map(cvs.map(cv => [cv.id, cv.originalFileName]));

    // Filter export activities from activityLog
    const exportActivities = analytics.activityLog
      .filter(activity => activity.action === 'cv_exported')
      .map(activity => ({
        date: activity.date,
        format: activity.metadata?.format || 'unknown',
        template: activity.metadata?.template || 'default',
        cvId: activity.resourceId || '',
        cvName: cvMap.get(activity.resourceId || '') || 'Unknown CV',
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return exportActivities;
  }

  async getActivityLog(userId: string, limit: number = 100) {
    const analytics = await this.getOrCreateAnalytics(userId);
    return analytics.activityLog.slice(-limit).reverse();
  }

  async getExportsByFormat(userId: string) {
    // Aggregate from CV records for accurate data
    const stats = await this.getStats(userId);
    return stats.stats.exportsByFormat;
  }

  async getActivitiesByType(userId: string) {
    const analytics = await this.getOrCreateAnalytics(userId);
    
    // Group activities by action type
    const breakdown: Record<string, number> = {};
    
    analytics.activityLog.forEach(activity => {
      breakdown[activity.action] = (breakdown[activity.action] || 0) + 1;
    });
    
    return breakdown;
  }

  async getTimelineData(userId: string, days: number = 30) {
    const analytics = await this.getOrCreateAnalytics(userId);
    
    // Group activities by date
    const timeline = new Map<string, number>();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    analytics.activityLog.forEach(activity => {
      const activityDate = new Date(activity.date);
      if (activityDate >= cutoffDate) {
        const dateKey = activityDate.toISOString().split('T')[0];
        timeline.set(dateKey, (timeline.get(dateKey) || 0) + 1);
      }
    });

    // Return sorted by date
    return Array.from(timeline.entries())
      .map(([date, count]) => ({
        date,
        activities: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

