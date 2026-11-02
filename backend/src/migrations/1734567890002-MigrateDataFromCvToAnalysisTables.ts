import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateDataFromCvToAnalysisTables1734567890002
  implements MigrationInterface
{
  name = 'MigrateDataFromCvToAnalysisTables1734567890002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const legacyColumns: Array<{ column_name: string }> =
      await queryRunner.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'cvs'
          AND column_name IN ('matchingAnalysis', 'coverLetter')
      `);
    const present = new Set(legacyColumns.map((row) => row.column_name));

    // Schema sync from the current entity no longer creates these columns.
    if (!present.has('matchingAnalysis') && !present.has('coverLetter')) {
      return;
    }

    if (present.has('matchingAnalysis')) {
      // Step 1: Migrate matchingAnalysis from CV to cv_matching_analyses
      await queryRunner.query(`
      INSERT INTO cv_matching_analyses (
        id, "userId", "jobDescriptionId", "jobDescriptionSnapshot", 
        score, "matchedSkills", "missingSkills", suggestions, strengths, 
        notes, "createdAt", "updatedAt", "isSnapshot", "snapshotReason"
      )
      SELECT 
        gen_random_uuid() as id,
        c."userId",
        c."jobDescriptionId",
        jsonb_build_object(
          'title', COALESCE(jd.title, 'Unknown Job'),
          'company', jd.company,
          'description', LEFT(COALESCE(jd.description, ''), 500),
          'keyRequirements', COALESCE(jd.requirements->'skills', '[]'::jsonb),
          'experience', jd.experience,
          'createdAt', NOW()::text
        ) as "jobDescriptionSnapshot",
        COALESCE((c."matchingAnalysis"->>'score')::int, 0) as score,
        COALESCE(c."matchingAnalysis"->'matchedSkills', '[]'::jsonb) as "matchedSkills",
        COALESCE(c."matchingAnalysis"->'missingSkills', '[]'::jsonb) as "missingSkills",
        COALESCE(c."matchingAnalysis"->'suggestions', '[]'::jsonb) as suggestions,
        COALESCE(c."matchingAnalysis"->'strengths', '[]'::jsonb) as strengths,
        NULL as notes,
        c."createdAt",
        c."updatedAt",
        TRUE as "isSnapshot",
        'MIGRATION_FROM_CV' as "snapshotReason"
      FROM cvs c
      LEFT JOIN job_descriptions jd ON c."jobDescriptionId" = jd.id
      WHERE c."matchingAnalysis" IS NOT NULL 
        AND c."matchingAnalysis" != '{}'::jsonb
    `);
    }

    if (present.has('coverLetter')) {
      // Step 2: Migrate coverLetter from CV to cv_cover_letters
      await queryRunner.query(`
      INSERT INTO cv_cover_letters (
        id, "userId", "jobDescriptionId", "jobDescriptionSnapshot",
        content, "personalizedContent", tone, format, "wordCount", 
        "isCustomized", notes, "createdAt", "updatedAt", "isSnapshot", "snapshotReason"
      )
      SELECT 
        gen_random_uuid() as id,
        c."userId",
        c."jobDescriptionId",
        jsonb_build_object(
          'title', COALESCE(jd.title, 'Unknown Job'),
          'company', jd.company,
          'description', LEFT(COALESCE(jd.description, ''), 500),
          'keyRequirements', COALESCE(jd.requirements->'skills', '[]'::jsonb),
          'experience', jd.experience,
          'createdAt', NOW()::text
        ) as "jobDescriptionSnapshot",
        c."coverLetter" as content,
        NULL as "personalizedContent",
        'professional' as tone,
        'standard' as format,
        LENGTH(c."coverLetter") as "wordCount",
        FALSE as "isCustomized",
        NULL as notes,
        c."createdAt",
        c."updatedAt",
        TRUE as "isSnapshot",
        'MIGRATION_FROM_CV' as "snapshotReason"
      FROM cvs c
      LEFT JOIN job_descriptions jd ON c."jobDescriptionId" = jd.id
      WHERE c."coverLetter" IS NOT NULL 
        AND c."coverLetter" != ''
    `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove migrated data
    await queryRunner.query(`
      DELETE FROM cv_matching_analyses 
      WHERE "snapshotReason" = 'MIGRATION_FROM_CV'
    `);

    await queryRunner.query(`
      DELETE FROM cv_cover_letters 
      WHERE "snapshotReason" = 'MIGRATION_FROM_CV'
    `);
  }
}
