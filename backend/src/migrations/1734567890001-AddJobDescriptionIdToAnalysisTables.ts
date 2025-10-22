import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobDescriptionIdToAnalysisTables1734567890001 implements MigrationInterface {
  name = 'AddJobDescriptionIdToAnalysisTables1734567890001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add jobDescriptionId to cv_matching_analyses
    // COMMENTED OUT: Column already exists
    // await queryRunner.query(`
    //   ALTER TABLE cv_matching_analyses 
    //   ADD COLUMN "jobDescriptionId" UUID
    // `);

    // Add jobDescriptionId to cv_cover_letters
    // COMMENTED OUT: Column already exists
    // await queryRunner.query(`
    //   ALTER TABLE cv_cover_letters 
    //   ADD COLUMN "jobDescriptionId" UUID
    // `);

    // Add snapshot and optimization fields to cv_matching_analyses
    // COMMENTED OUT: Columns already exist
    // await queryRunner.query(`
    //   ALTER TABLE cv_matching_analyses 
    //   ADD COLUMN "jobDescriptionSnapshot" JSONB,
    //   ADD COLUMN "isSnapshot" BOOLEAN DEFAULT FALSE,
    //   ADD COLUMN "snapshotReason" VARCHAR(50),
    //   ADD COLUMN "expiresAt" TIMESTAMP
    // `);

    // Add snapshot and optimization fields to cv_cover_letters
    // COMMENTED OUT: Columns already exist
    // await queryRunner.query(`
    //   ALTER TABLE cv_cover_letters 
    //   ADD COLUMN "jobDescriptionSnapshot" JSONB,
    //   ADD COLUMN "isSnapshot" BOOLEAN DEFAULT FALSE,
    //   ADD COLUMN "snapshotReason" VARCHAR(50),
    //   ADD COLUMN "expiresAt" TIMESTAMP
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove added columns
    await queryRunner.query(`
      ALTER TABLE cv_matching_analyses 
      DROP COLUMN "jobDescriptionId",
      DROP COLUMN "jobDescriptionSnapshot",
      DROP COLUMN "isSnapshot",
      DROP COLUMN "snapshotReason",
      DROP COLUMN "expiresAt"
    `);

    await queryRunner.query(`
      ALTER TABLE cv_cover_letters 
      DROP COLUMN "jobDescriptionId",
      DROP COLUMN "jobDescriptionSnapshot",
      DROP COLUMN "isSnapshot",
      DROP COLUMN "snapshotReason",
      DROP COLUMN "expiresAt"
    `);
  }
}
