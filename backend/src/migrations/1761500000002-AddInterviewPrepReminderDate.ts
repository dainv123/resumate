import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewPrepReminderDate1761500000002
  implements MigrationInterface
{
  name = 'AddInterviewPrepReminderDate1761500000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "interview_prep_plans"
      ADD COLUMN IF NOT EXISTS "lastReminderDate" date
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "interview_prep_plans"
      DROP COLUMN IF EXISTS "lastReminderDate"
    `);
  }
}
