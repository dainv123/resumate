import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewPrepAiContent1761500000001
  implements MigrationInterface
{
  name = 'AddInterviewPrepAiContent1761500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "interview_prep_plans"
      ADD COLUMN IF NOT EXISTS "starStories" jsonb,
      ADD COLUMN IF NOT EXISTS "projectDefenses" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "interview_prep_plans"
      DROP COLUMN IF EXISTS "projectDefenses",
      DROP COLUMN IF EXISTS "starStories"
    `);
  }
}
