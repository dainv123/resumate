import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeCvsTableIndexes1734567890010
  implements MigrationInterface
{
  name = 'OptimizeCvsTableIndexes1734567890010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add index on userId for faster filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_user_id" 
      ON cvs("userId")
    `);

    // Add composite index for userId + createdAt DESC (common sorting)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_user_created_at" 
      ON cvs("userId", "createdAt" DESC)
    `);

    // Add composite index for userId + updatedAt DESC
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_user_updated_at" 
      ON cvs("userId", "updatedAt" DESC)
    `);

    // Add index on originalFileName for search operations
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_original_file_name" 
      ON cvs("originalFileName")
    `);

    // Add GIN index on parsedData JSONB column for future complex searches
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_parsed_data_gin" 
      ON cvs USING gin("parsedData")
    `);

    // Add index on isTailored for filtering tailored vs original CVs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_is_tailored" 
      ON cvs("isTailored")
    `);

    // Add composite index for userId + isTailored (common filter combination)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cvs_user_is_tailored" 
      ON cvs("userId", "isTailored")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all created indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cvs_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cvs_user_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cvs_user_updated_at"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_cvs_original_file_name"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cvs_parsed_data_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cvs_is_tailored"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cvs_user_is_tailored"`);
  }
}
