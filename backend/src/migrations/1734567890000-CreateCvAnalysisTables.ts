import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCvAnalysisTables1734567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create cv_matching_analyses table
    await queryRunner.createTable(
      new Table({
        name: 'cv_matching_analyses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cvId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'jobDescription',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'score',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'matchedSkills',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'missingSkills',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'suggestions',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'strengths',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create cv_cover_letters table
    await queryRunner.createTable(
      new Table({
        name: 'cv_cover_letters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cvId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'jobDescription',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'personalizedContent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tone',
            type: 'varchar',
            length: '50',
            default: "'professional'",
          },
          {
            name: 'format',
            type: 'varchar',
            length: '50',
            default: "'standard'",
          },
          {
            name: 'wordCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'isCustomized',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_cv_matching_analyses_cv_id" ON "cv_matching_analyses" ("cvId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cv_matching_analyses_user_id" ON "cv_matching_analyses" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cv_cover_letters_cv_id" ON "cv_cover_letters" ("cvId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cv_cover_letters_user_id" ON "cv_cover_letters" ("userId")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "cv_matching_analyses" 
      ADD CONSTRAINT "FK_cv_matching_analyses_cv_id" 
      FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cv_matching_analyses" 
      ADD CONSTRAINT "FK_cv_matching_analyses_user_id" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cv_cover_letters" 
      ADD CONSTRAINT "FK_cv_cover_letters_cv_id" 
      FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cv_cover_letters" 
      ADD CONSTRAINT "FK_cv_cover_letters_user_id" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cv_cover_letters');
    await queryRunner.dropTable('cv_matching_analyses');
  }
}
