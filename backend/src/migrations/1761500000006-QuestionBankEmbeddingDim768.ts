import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Switch question_bank.embedding to vector(768) for Google text-embedding-004 (free tier).
 * Clears prior 1536-dim vectors — re-run: npm run backfill:question-embeddings
 */
export class QuestionBankEmbeddingDim7681761500000006
  implements MigrationInterface
{
  name = 'QuestionBankEmbeddingDim7681761500000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_question_bank_embedding_hnsw"`,
    );

    await queryRunner.query(`
      ALTER TABLE "question_bank"
      DROP COLUMN IF EXISTS "embedding"
    `);

    await queryRunner.query(`
      ALTER TABLE "question_bank"
      ADD COLUMN "embedding" vector(768)
    `);

    await queryRunner.query(`
      UPDATE "question_bank"
      SET "embeddingModel" = NULL, "embeddedAt" = NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_question_bank_embedding_hnsw"
      ON "question_bank"
      USING hnsw ("embedding" vector_cosine_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_question_bank_embedding_hnsw"`,
    );
    await queryRunner.query(`
      ALTER TABLE "question_bank" DROP COLUMN IF EXISTS "embedding"
    `);
    await queryRunner.query(`
      ALTER TABLE "question_bank" ADD COLUMN "embedding" vector(1536)
    `);
    await queryRunner.query(`
      UPDATE "question_bank"
      SET "embeddingModel" = NULL, "embeddedAt" = NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_question_bank_embedding_hnsw"
      ON "question_bank"
      USING hnsw ("embedding" vector_cosine_ops)
    `);
  }
}
