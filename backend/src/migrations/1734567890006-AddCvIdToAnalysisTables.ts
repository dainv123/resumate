import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddCvIdToAnalysisTables1734567890006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ======================= cv_matching_analyses =======================

    // Step 1: Add cvId column as nullable (will be populated by application)
    await queryRunner.addColumn(
      'cv_matching_analyses',
      new TableColumn({
        name: 'cv_id',
        type: 'uuid',
        isNullable: true,
        comment: 'Foreign key to cv table',
      }),
    );

    // Step 2: Add foreign key constraint
    try {
      await queryRunner.query(
        `ALTER TABLE "cv_matching_analyses" 
         ADD CONSTRAINT fk_cv_id FOREIGN KEY (cv_id) 
         REFERENCES cvs(id) ON DELETE CASCADE`,
      );
    } catch (error) {
      console.log('FK constraint already exists, skipping');
    }

    // Step 3: Add composite unique index for future records
    try {
      await queryRunner.createIndex(
        'cv_matching_analyses',
        new TableIndex({
          name: 'idx_cv_jd_user_analysis',
          columnNames: ['cv_id', 'jobDescriptionId', 'userId'],
          isUnique: true,
        }),
      );
    } catch (error) {
      console.log('Index creation skipped or already exists');
    }

    // ======================= cv_cover_letters =======================

    // Step 1: Add cvId column as nullable
    await queryRunner.addColumn(
      'cv_cover_letters',
      new TableColumn({
        name: 'cv_id',
        type: 'uuid',
        isNullable: true,
        comment: 'Foreign key to cv table',
      }),
    );

    // Step 2: Add foreign key constraint
    try {
      await queryRunner.query(
        `ALTER TABLE "cv_cover_letters" 
         ADD CONSTRAINT fk_cv_id_cover_letter FOREIGN KEY (cv_id) 
         REFERENCES cvs(id) ON DELETE CASCADE`,
      );
    } catch (error) {
      console.log('FK constraint already exists, skipping');
    }

    // Step 3: Add composite unique index for future records
    try {
      await queryRunner.createIndex(
        'cv_cover_letters',
        new TableIndex({
          name: 'idx_cv_jd_user_cover_letter',
          columnNames: ['cv_id', 'jobDescriptionId', 'userId'],
          isUnique: true,
        }),
      );
    } catch (error) {
      console.log('Index creation skipped or already exists');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    try {
      await queryRunner.dropIndex(
        'cv_matching_analyses',
        'idx_cv_jd_user_analysis',
      );
    } catch (error) {
      console.log('Index not found');
    }

    try {
      await queryRunner.dropIndex(
        'cv_cover_letters',
        'idx_cv_jd_user_cover_letter',
      );
    } catch (error) {
      console.log('Index not found');
    }

    // Drop constraints
    try {
      await queryRunner.query(
        `ALTER TABLE "cv_matching_analyses" DROP CONSTRAINT fk_cv_id`,
      );
    } catch (error) {
      console.log('Constraint not found');
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "cv_cover_letters" DROP CONSTRAINT fk_cv_id_cover_letter`,
      );
    } catch (error) {
      console.log('Constraint not found');
    }

    // Drop columns
    await queryRunner.dropColumn('cv_matching_analyses', 'cv_id');
    await queryRunner.dropColumn('cv_cover_letters', 'cv_id');
  }
}
