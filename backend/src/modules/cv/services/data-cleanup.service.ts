import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CvMatchingAnalysis } from '../entities/cv-matching-analysis.entity';
import { CvCoverLetter } from '../entities/cv-cover-letter.entity';
import { JobDescription } from '../entities/job-description.entity';

@Injectable()
export class DataCleanupService {
  private readonly logger = new Logger(DataCleanupService.name);

  constructor(
    @InjectRepository(CvMatchingAnalysis)
    private matchingAnalysisRepository: Repository<CvMatchingAnalysis>,
    @InjectRepository(CvCoverLetter)
    private coverLetterRepository: Repository<CvCoverLetter>,
    @InjectRepository(JobDescription)
    private jobDescriptionRepository: Repository<JobDescription>,
  ) {}

  /**
   * Clean up old snapshots and orphaned records
   */
  async cleanupOldSnapshots(): Promise<{
    deletedAnalyses: number;
    deletedCoverLetters: number;
    deletedOrphanedAnalyses: number;
    deletedOrphanedCoverLetters: number;
  }> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    let deletedAnalyses = 0;
    let deletedCoverLetters = 0;
    let deletedOrphanedAnalyses = 0;
    let deletedOrphanedCoverLetters = 0;

    try {
      // 1. Delete analyses older than 1 year
      const oldAnalyses = await this.matchingAnalysisRepository.find({
        where: {
          createdAt: LessThan(oneYearAgo),
        },
      });

      if (oldAnalyses.length > 0) {
        await this.matchingAnalysisRepository.remove(oldAnalyses);
        deletedAnalyses = oldAnalyses.length;
        this.logger.log(`Deleted ${deletedAnalyses} old analyses`);
      }

      // 2. Delete cover letters older than 6 months
      const oldCoverLetters = await this.coverLetterRepository.find({
        where: {
          createdAt: LessThan(sixMonthsAgo),
        },
      });

      if (oldCoverLetters.length > 0) {
        await this.coverLetterRepository.remove(oldCoverLetters);
        deletedCoverLetters = oldCoverLetters.length;
        this.logger.log(`Deleted ${deletedCoverLetters} old cover letters`);
      }

      // 3. Delete orphaned analyses (where JobDescription no longer exists)
      const orphanedAnalyses = await this.matchingAnalysisRepository
        .createQueryBuilder('analysis')
        .leftJoin('analysis.jobDescription', 'jd')
        .where('jd.id IS NULL')
        .getMany();

      if (orphanedAnalyses.length > 0) {
        await this.matchingAnalysisRepository.remove(orphanedAnalyses);
        deletedOrphanedAnalyses = orphanedAnalyses.length;
        this.logger.log(`Deleted ${deletedOrphanedAnalyses} orphaned analyses`);
      }

      // 4. Delete orphaned cover letters (where JobDescription no longer exists)
      const orphanedCoverLetters = await this.coverLetterRepository
        .createQueryBuilder('coverLetter')
        .leftJoin('coverLetter.jobDescription', 'jd')
        .where('jd.id IS NULL')
        .getMany();

      if (orphanedCoverLetters.length > 0) {
        await this.coverLetterRepository.remove(orphanedCoverLetters);
        deletedOrphanedCoverLetters = orphanedCoverLetters.length;
        this.logger.log(`Deleted ${deletedOrphanedCoverLetters} orphaned cover letters`);
      }

      this.logger.log('Data cleanup completed successfully');

      return {
        deletedAnalyses,
        deletedCoverLetters,
        deletedOrphanedAnalyses,
        deletedOrphanedCoverLetters,
      };
    } catch (error) {
      this.logger.error('Data cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<{
    totalAnalyses: number;
    totalCoverLetters: number;
    oldAnalyses: number;
    oldCoverLetters: number;
    orphanedAnalyses: number;
    orphanedCoverLetters: number;
  }> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalAnalyses,
      totalCoverLetters,
      oldAnalyses,
      oldCoverLetters,
      orphanedAnalyses,
      orphanedCoverLetters,
    ] = await Promise.all([
      this.matchingAnalysisRepository.count(),
      this.coverLetterRepository.count(),
      this.matchingAnalysisRepository.count({
        where: { createdAt: LessThan(oneYearAgo) },
      }),
      this.coverLetterRepository.count({
        where: { createdAt: LessThan(sixMonthsAgo) },
      }),
      this.matchingAnalysisRepository
        .createQueryBuilder('analysis')
        .leftJoin('analysis.jobDescription', 'jd')
        .where('jd.id IS NULL')
        .getCount(),
      this.coverLetterRepository
        .createQueryBuilder('coverLetter')
        .leftJoin('coverLetter.jobDescription', 'jd')
        .where('jd.id IS NULL')
        .getCount(),
    ]);

    return {
      totalAnalyses,
      totalCoverLetters,
      oldAnalyses,
      oldCoverLetters,
      orphanedAnalyses,
      orphanedCoverLetters,
    };
  }

  /**
   * Clean up expired snapshots
   */
  async cleanupExpiredSnapshots(): Promise<{
    deletedExpiredAnalyses: number;
    deletedExpiredCoverLetters: number;
  }> {
    const now = new Date();
    let deletedExpiredAnalyses = 0;
    let deletedExpiredCoverLetters = 0;

    try {
      // Delete analyses with expired snapshots
      const expiredAnalyses = await this.matchingAnalysisRepository.find({
        where: {
          expiresAt: LessThan(now),
        },
      });

      if (expiredAnalyses.length > 0) {
        await this.matchingAnalysisRepository.remove(expiredAnalyses);
        deletedExpiredAnalyses = expiredAnalyses.length;
        this.logger.log(`Deleted ${deletedExpiredAnalyses} expired analyses`);
      }

      // Delete cover letters with expired snapshots
      const expiredCoverLetters = await this.coverLetterRepository.find({
        where: {
          expiresAt: LessThan(now),
        },
      });

      if (expiredCoverLetters.length > 0) {
        await this.coverLetterRepository.remove(expiredCoverLetters);
        deletedExpiredCoverLetters = expiredCoverLetters.length;
        this.logger.log(`Deleted ${deletedExpiredCoverLetters} expired cover letters`);
      }

      return {
        deletedExpiredAnalyses,
        deletedExpiredCoverLetters,
      };
    } catch (error) {
      this.logger.error('Expired snapshots cleanup failed:', error);
      throw error;
    }
  }
}
