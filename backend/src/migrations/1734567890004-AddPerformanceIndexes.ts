import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1734567890004 implements MigrationInterface {
  name = 'AddPerformanceIndexes1734567890004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for cv_matching_analyses
    await queryRunner.query(`
      CREATE INDEX "idx_matching_analysis_job_description_id" 
      ON cv_matching_analyses("jobDescriptionId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_matching_analysis_user_id" 
      ON cv_matching_analyses("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_matching_analysis_created_at" 
      ON cv_matching_analyses("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_matching_analysis_expires_at" 
      ON cv_matching_analyses("expiresAt")
    `);

    // Add indexes for cv_cover_letters
    await queryRunner.query(`
      CREATE INDEX "idx_cover_letter_job_description_id" 
      ON cv_cover_letters("jobDescriptionId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cover_letter_user_id" 
      ON cv_cover_letters("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cover_letter_created_at" 
      ON cv_cover_letters("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cover_letter_expires_at" 
      ON cv_cover_letters("expiresAt")
    `);

    // Add composite indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "idx_analysis_jd_user" 
      ON cv_matching_analyses("jobDescriptionId", "userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cover_letter_jd_user" 
      ON cv_cover_letters("jobDescriptionId", "userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_matching_analysis_job_description_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_matching_analysis_user_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_matching_analysis_created_at"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_matching_analysis_expires_at"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_cover_letter_job_description_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_cover_letter_user_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_cover_letter_created_at"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_cover_letter_expires_at"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_analysis_jd_user"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_cover_letter_jd_user"
    `);
  }
}
