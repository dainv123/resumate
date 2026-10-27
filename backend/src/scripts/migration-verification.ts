import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from '../modules/cv/entities/cv.entity';
import { JobDescription } from '../modules/cv/entities/job-description.entity';
import { CvMatchingAnalysis } from '../modules/cv/entities/cv-matching-analysis.entity';
import { CvCoverLetter } from '../modules/cv/entities/cv-cover-letter.entity';

interface MigrationStats {
  before: {
    totalCvs: number;
    cvsWithMatchingAnalysis: number;
    cvsWithCoverLetter: number;
    totalJobDescriptions: number;
  };
  after: {
    totalCvs: number;
    totalJobDescriptions: number;
    totalAnalyses: number;
    totalCoverLetters: number;
    analysesWithJobDescription: number;
    coverLettersWithJobDescription: number;
    orphanedAnalyses: number;
    orphanedCoverLetters: number;
  };
}

async function verifyMigration() {
  console.log('🔍 Starting migration verification...');

  const app = await NestFactory.createApplicationContext(AppModule);

  const cvRepository = app.get<Repository<Cv>>(getRepositoryToken(Cv));
  const jobDescriptionRepository = app.get<Repository<JobDescription>>(
    getRepositoryToken(JobDescription),
  );
  const analysisRepository = app.get<Repository<CvMatchingAnalysis>>(
    getRepositoryToken(CvMatchingAnalysis),
  );
  const coverLetterRepository = app.get<Repository<CvCoverLetter>>(
    getRepositoryToken(CvCoverLetter),
  );

  try {
    // Get current stats
    const stats: MigrationStats = {
      before: {
        totalCvs: 0,
        cvsWithMatchingAnalysis: 0,
        cvsWithCoverLetter: 0,
        totalJobDescriptions: 0,
      },
      after: {
        totalCvs: 0,
        totalJobDescriptions: 0,
        totalAnalyses: 0,
        totalCoverLetters: 0,
        analysesWithJobDescription: 0,
        coverLettersWithJobDescription: 0,
        orphanedAnalyses: 0,
        orphanedCoverLetters: 0,
      },
    };

    // Count CVs
    stats.after.totalCvs = await cvRepository.count();
    console.log(`📊 Total CVs: ${stats.after.totalCvs}`);

    // Count Job Descriptions
    stats.after.totalJobDescriptions = await jobDescriptionRepository.count();
    console.log(
      `📊 Total Job Descriptions: ${stats.after.totalJobDescriptions}`,
    );

    // Count Analyses
    stats.after.totalAnalyses = await analysisRepository.count();
    console.log(`📊 Total Analyses: ${stats.after.totalAnalyses}`);

    // Count Cover Letters
    stats.after.totalCoverLetters = await coverLetterRepository.count();
    console.log(`📊 Total Cover Letters: ${stats.after.totalCoverLetters}`);

    // Check analyses with JobDescription
    stats.after.analysesWithJobDescription = await analysisRepository
      .createQueryBuilder('analysis')
      .where('analysis.jobDescriptionId IS NOT NULL')
      .getCount();
    console.log(
      `📊 Analyses with JobDescription: ${stats.after.analysesWithJobDescription}`,
    );

    // Check cover letters with JobDescription
    stats.after.coverLettersWithJobDescription = await coverLetterRepository
      .createQueryBuilder('coverLetter')
      .where('coverLetter.jobDescriptionId IS NOT NULL')
      .getCount();
    console.log(
      `📊 Cover Letters with JobDescription: ${stats.after.coverLettersWithJobDescription}`,
    );

    // Check for orphaned records
    stats.after.orphanedAnalyses = await analysisRepository
      .createQueryBuilder('analysis')
      .leftJoin('analysis.jobDescription', 'jd')
      .where('jd.id IS NULL')
      .getCount();
    console.log(`📊 Orphaned Analyses: ${stats.after.orphanedAnalyses}`);

    stats.after.orphanedCoverLetters = await coverLetterRepository
      .createQueryBuilder('coverLetter')
      .leftJoin('coverLetter.jobDescription', 'jd')
      .where('jd.id IS NULL')
      .getCount();
    console.log(
      `📊 Orphaned Cover Letters: ${stats.after.orphanedCoverLetters}`,
    );

    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');

    // Check foreign key constraints
    const invalidAnalyses = await analysisRepository
      .createQueryBuilder('analysis')
      .leftJoin('analysis.jobDescription', 'jd')
      .where('analysis.jobDescriptionId IS NOT NULL AND jd.id IS NULL')
      .getMany();

    const invalidCoverLetters = await coverLetterRepository
      .createQueryBuilder('coverLetter')
      .leftJoin('coverLetter.jobDescription', 'jd')
      .where('coverLetter.jobDescriptionId IS NOT NULL AND jd.id IS NULL')
      .getMany();

    if (invalidAnalyses.length > 0) {
      console.error(
        `❌ Found ${invalidAnalyses.length} analyses with invalid JobDescription references`,
      );
    } else {
      console.log('✅ All analyses have valid JobDescription references');
    }

    if (invalidCoverLetters.length > 0) {
      console.error(
        `❌ Found ${invalidCoverLetters.length} cover letters with invalid JobDescription references`,
      );
    } else {
      console.log('✅ All cover letters have valid JobDescription references');
    }

    // Check snapshot data
    const analysesWithSnapshots = await analysisRepository
      .createQueryBuilder('analysis')
      .where('analysis.jobDescriptionSnapshot IS NOT NULL')
      .getCount();
    console.log(`📊 Analyses with snapshots: ${analysesWithSnapshots}`);

    const coverLettersWithSnapshots = await coverLetterRepository
      .createQueryBuilder('coverLetter')
      .where('coverLetter.jobDescriptionSnapshot IS NOT NULL')
      .getCount();
    console.log(
      `📊 Cover Letters with snapshots: ${coverLettersWithSnapshots}`,
    );

    // Performance check
    console.log('\n⚡ Performance verification...');

    const startTime = Date.now();
    await analysisRepository.find({
      relations: ['jobDescription'],
      take: 10,
    });
    const analysisQueryTime = Date.now() - startTime;
    console.log(`📊 Analysis query time: ${analysisQueryTime}ms`);

    const startTime2 = Date.now();
    await coverLetterRepository.find({
      relations: ['jobDescription'],
      take: 10,
    });
    const coverLetterQueryTime = Date.now() - startTime2;
    console.log(`📊 Cover Letter query time: ${coverLetterQueryTime}ms`);

    // Summary
    console.log('\n📋 Migration Verification Summary:');
    console.log(`✅ Total CVs: ${stats.after.totalCvs}`);
    console.log(
      `✅ Total Job Descriptions: ${stats.after.totalJobDescriptions}`,
    );
    console.log(`✅ Total Analyses: ${stats.after.totalAnalyses}`);
    console.log(`✅ Total Cover Letters: ${stats.after.totalCoverLetters}`);
    console.log(
      `✅ Analyses with JobDescription: ${stats.after.analysesWithJobDescription}`,
    );
    console.log(
      `✅ Cover Letters with JobDescription: ${stats.after.coverLettersWithJobDescription}`,
    );
    console.log(`⚠️  Orphaned Analyses: ${stats.after.orphanedAnalyses}`);
    console.log(
      `⚠️  Orphaned Cover Letters: ${stats.after.orphanedCoverLetters}`,
    );
    console.log(`⚡ Analysis query performance: ${analysisQueryTime}ms`);
    console.log(`⚡ Cover Letter query performance: ${coverLetterQueryTime}ms`);

    if (
      stats.after.orphanedAnalyses === 0 &&
      stats.after.orphanedCoverLetters === 0
    ) {
      console.log(
        '\n🎉 Migration verification PASSED! All data integrity checks passed.',
      );
    } else {
      console.log(
        '\n⚠️  Migration verification completed with warnings. Some orphaned records found.',
      );
    }
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyMigration()
    .then(() => {
      console.log('✅ Migration verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration verification failed:', error);
      process.exit(1);
    });
}

export { verifyMigration };
