import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionBankEmbeddings1761500000005
  implements MigrationInterface
{
  name = 'AddQuestionBankEmbeddings1761500000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await queryRunner.query(`
      ALTER TABLE "question_bank"
      ADD COLUMN IF NOT EXISTS "embedding" vector(768),
      ADD COLUMN IF NOT EXISTS "embeddingModel" varchar(64),
      ADD COLUMN IF NOT EXISTS "embeddedAt" TIMESTAMPTZ
    `);

    // HNSW works on empty tables (unlike IVFFlat which needs data first)
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
      ALTER TABLE "question_bank"
      DROP COLUMN IF EXISTS "embedding",
      DROP COLUMN IF EXISTS "embeddingModel",
      DROP COLUMN IF EXISTS "embeddedAt"
    `);
  }
}
