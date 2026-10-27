import { MigrationInterface, QueryRunner } from 'typeorm';

export class InterviewPrepPhase21761500000004 implements MigrationInterface {
  name = 'InterviewPrepPhase21761500000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "interview_prep_plans"
      ADD COLUMN IF NOT EXISTS "companyResearch" jsonb,
      ADD COLUMN IF NOT EXISTS "postInterviewSurvey" jsonb,
      ADD COLUMN IF NOT EXISTS "questionPack" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "interview_prep_plans"
      DROP COLUMN IF EXISTS "companyResearch",
      DROP COLUMN IF EXISTS "postInterviewSurvey",
      DROP COLUMN IF EXISTS "questionPack"
    `);
  }
}
