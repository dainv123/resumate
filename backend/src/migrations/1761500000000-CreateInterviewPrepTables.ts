import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInterviewPrepTables1761500000000
  implements MigrationInterface
{
  name = 'CreateInterviewPrepTables1761500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "question_bank" (
        "id" varchar NOT NULL,
        "category" varchar NOT NULL,
        "subcategory" varchar,
        "level" varchar NOT NULL,
        "roleTags" jsonb NOT NULL,
        "skillTags" jsonb NOT NULL,
        "difficulty" int NOT NULL DEFAULT 3,
        "frequency" varchar NOT NULL,
        "question" text NOT NULL,
        "evaluationRubric" jsonb NOT NULL,
        "sampleAnswerOutline" jsonb NOT NULL,
        "followUpQuestions" jsonb NOT NULL,
        "prepTimeMinutes" int NOT NULL DEFAULT 15,
        "source" varchar NOT NULL DEFAULT 'curated',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_question_bank" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interview_prep_plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "jobDescriptionId" uuid NOT NULL,
        "cvId" uuid NOT NULL,
        "interviewDate" date NOT NULL,
        "dailyCapacityMinutes" int NOT NULL DEFAULT 60,
        "processMap" jsonb NOT NULL,
        "roadmap" jsonb NOT NULL,
        "readinessScore" decimal(5,2),
        "readinessBreakdown" jsonb,
        "status" varchar NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview_prep_plans" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interview_question_assignments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "planId" uuid NOT NULL,
        "questionId" varchar NOT NULL,
        "priority" varchar NOT NULL,
        "impactScore" decimal(6,2) NOT NULL,
        "userAnswer" text,
        "starStory" jsonb,
        "mockScores" jsonb,
        "status" varchar NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview_question_assignments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "job_descriptions"
      ADD COLUMN IF NOT EXISTS "sourceUrl" varchar,
      ADD COLUMN IF NOT EXISTS "sourceType" varchar,
      ADD COLUMN IF NOT EXISTS "parsedMetadata" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "user_usage"
      ADD COLUMN IF NOT EXISTS "interviewPrepPlans" int NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "mockDrills" int NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_interview_prep_plans_userId"
      ON "interview_prep_plans" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_interview_question_assignments_planId"
      ON "interview_question_assignments" ("planId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_question_assignments_planId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_prep_plans_userId"`);
    await queryRunner.query(`ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "mockDrills"`);
    await queryRunner.query(`ALTER TABLE "user_usage" DROP COLUMN IF EXISTS "interviewPrepPlans"`);
    await queryRunner.query(`ALTER TABLE "job_descriptions" DROP COLUMN IF EXISTS "parsedMetadata"`);
    await queryRunner.query(`ALTER TABLE "job_descriptions" DROP COLUMN IF EXISTS "sourceType"`);
    await queryRunner.query(`ALTER TABLE "job_descriptions" DROP COLUMN IF EXISTS "sourceUrl"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_question_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_prep_plans"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "question_bank"`);
  }
}
