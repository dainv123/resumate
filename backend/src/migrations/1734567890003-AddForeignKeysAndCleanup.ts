import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeysAndCleanup1734567890003
  implements MigrationInterface
{
  name = 'AddForeignKeysAndCleanup1734567890003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE cv_matching_analyses 
      ADD CONSTRAINT "FK_matching_analysis_job_description" 
      FOREIGN KEY ("jobDescriptionId") REFERENCES job_descriptions(id)
    `);

    await queryRunner.query(`
      ALTER TABLE cv_cover_letters 
      ADD CONSTRAINT "FK_cover_letter_job_description" 
      FOREIGN KEY ("jobDescriptionId") REFERENCES job_descriptions(id)
    `);

    // Remove old columns from CV table
    await queryRunner.query(`
      ALTER TABLE cvs DROP COLUMN "matchingAnalysis"
    `);

    await queryRunner.query(`
      ALTER TABLE cvs DROP COLUMN "coverLetter"
    `);

    // Remove old cvId columns from analysis tables
    // COMMENTED OUT: Columns don't exist
    // await queryRunner.query(`
    //   ALTER TABLE cv_matching_analyses DROP COLUMN "cvId"
    // `);

    // await queryRunner.query(`
    //   ALTER TABLE cv_cover_letters DROP COLUMN "cvId"
    // `);

    // Remove old jobDescription columns (after snapshot creation)
    // COMMENTED OUT: Columns don't exist
    // await queryRunner.query(`
    //   ALTER TABLE cv_matching_analyses DROP COLUMN "jobDescription"
    // `);

    // await queryRunner.query(`
    //   ALTER TABLE cv_cover_letters DROP COLUMN "jobDescription"
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back old columns
    await queryRunner.query(`
      ALTER TABLE cvs 
      ADD COLUMN "matchingAnalysis" JSONB,
      ADD COLUMN "coverLetter" TEXT
    `);

    await queryRunner.query(`
      ALTER TABLE cv_matching_analyses 
      ADD COLUMN "cvId" UUID,
      ADD COLUMN "jobDescription" JSONB
    `);

    await queryRunner.query(`
      ALTER TABLE cv_cover_letters 
      ADD COLUMN "cvId" UUID,
      ADD COLUMN "jobDescription" JSONB
    `);

    // Remove foreign key constraints
    await queryRunner.query(`
      ALTER TABLE cv_matching_analyses 
      DROP CONSTRAINT "FK_matching_analysis_job_description"
    `);

    await queryRunner.query(`
      ALTER TABLE cv_cover_letters 
      DROP CONSTRAINT "FK_cover_letter_job_description"
    `);
  }
}
