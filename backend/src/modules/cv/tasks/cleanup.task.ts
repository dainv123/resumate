import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { DataCleanupService } from '../services/data-cleanup.service';

@Injectable()
export class CleanupTask {
  private readonly logger = new Logger(CleanupTask.name);

  constructor(private readonly dataCleanupService: DataCleanupService) {}

  /**
   * Run cleanup every Sunday at 2 AM
   */
  // @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyCleanup() {
    this.logger.log('Starting weekly data cleanup...');

    try {
      const stats = await this.dataCleanupService.getCleanupStats();
      this.logger.log('Cleanup stats:', stats);

      const result = await this.dataCleanupService.cleanupOldSnapshots();

      this.logger.log('Weekly cleanup completed:', {
        deletedAnalyses: result.deletedAnalyses,
        deletedCoverLetters: result.deletedCoverLetters,
        deletedOrphanedAnalyses: result.deletedOrphanedAnalyses,
        deletedOrphanedCoverLetters: result.deletedOrphanedCoverLetters,
      });
    } catch (error) {
      this.logger.error('Weekly cleanup failed:', error);
    }
  }

  /**
   * Run expired snapshots cleanup daily at 3 AM
   */
  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyExpiredCleanup() {
    this.logger.log('Starting daily expired snapshots cleanup...');

    try {
      const result = await this.dataCleanupService.cleanupExpiredSnapshots();

      if (
        result.deletedExpiredAnalyses > 0 ||
        result.deletedExpiredCoverLetters > 0
      ) {
        this.logger.log('Daily expired cleanup completed:', {
          deletedExpiredAnalyses: result.deletedExpiredAnalyses,
          deletedExpiredCoverLetters: result.deletedExpiredCoverLetters,
        });
      }
    } catch (error) {
      this.logger.error('Daily expired cleanup failed:', error);
    }
  }

  /**
   * Manual cleanup trigger (for testing or emergency cleanup)
   */
  async manualCleanup(): Promise<{
    deletedAnalyses: number;
    deletedCoverLetters: number;
    deletedOrphanedAnalyses: number;
    deletedOrphanedCoverLetters: number;
  }> {
    this.logger.log('Starting manual cleanup...');

    try {
      const result = await this.dataCleanupService.cleanupOldSnapshots();

      this.logger.log('Manual cleanup completed:', result);
      return result;
    } catch (error) {
      this.logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }
}
