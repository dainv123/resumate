import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillJobDescriptionsFromSnapshots1734567890005
  implements MigrationInterface
{
  name = 'BackfillJobDescriptionsFromSnapshots1734567890005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting JobDescription backfill from snapshots...');

    // Step 1: Find all analyses with jobDescriptionSnapshot but no jobDescriptionId
    const analysesWithoutJobDescription = await queryRunner.query(`
      SELECT 
        id,
        "userId",
        "jobDescriptionSnapshot",
        "createdAt"
      FROM cv_matching_analyses 
      WHERE "jobDescriptionSnapshot" IS NOT NULL 
        AND "jobDescriptionId" IS NULL
    `);

    console.log(
      `📊 Found ${analysesWithoutJobDescription.length} analyses with snapshots but no JobDescription`,
    );

    // Step 2: Find all cover letters with jobDescriptionSnapshot but no jobDescriptionId
    const coverLettersWithoutJobDescription = await queryRunner.query(`
      SELECT 
        id,
        "userId",
        "jobDescriptionSnapshot",
        "createdAt"
      FROM cv_cover_letters 
      WHERE "jobDescriptionSnapshot" IS NOT NULL 
        AND "jobDescriptionId" IS NULL
    `);

    console.log(
      `📊 Found ${coverLettersWithoutJobDescription.length} cover letters with snapshots but no JobDescription`,
    );

    // Step 3: Create JobDescriptions from snapshots
    const createdJobDescriptions = new Map<string, string>(); // snapshot hash -> jobDescriptionId

    // Process analyses
    for (const analysis of analysesWithoutJobDescription) {
      const snapshot = analysis.jobDescriptionSnapshot;
      if (!snapshot || !snapshot.title || !snapshot.description) {
        console.log(`⚠️ Skipping analysis ${analysis.id} - invalid snapshot`);
        continue;
      }

      // Create a hash of the snapshot for deduplication
      const snapshotHash = this.createSnapshotHash(snapshot);

      let jobDescriptionId = createdJobDescriptions.get(snapshotHash);

      if (!jobDescriptionId) {
        // Create new JobDescription
        const jobDescriptionResult = await queryRunner.query(
          `
          INSERT INTO job_descriptions (
            id,
            userId,
            title,
            description,
            company,
            location,
            salary,
            experience,
            requirements,
            keywords,
            createdAt,
            updatedAt
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $10
          ) RETURNING id
        `,
          [
            analysis.userId,
            snapshot.title,
            snapshot.description,
            snapshot.company || null,
            null, // location not in snapshot
            null, // salary not in snapshot
            snapshot.experience || null,
            JSON.stringify({
              skills: snapshot.keyRequirements || [],
              education: [],
              experience: [],
              certifications: [],
            }),
            JSON.stringify(snapshot.keyRequirements || []),
            analysis.createdAt,
          ],
        );

        jobDescriptionId = jobDescriptionResult[0].id;
        if (jobDescriptionId) {
          createdJobDescriptions.set(snapshotHash, jobDescriptionId);
        }

        console.log(
          `✅ Created JobDescription ${jobDescriptionId} for analysis ${analysis.id}`,
        );
      } else {
        console.log(
          `♻️ Reusing JobDescription ${jobDescriptionId} for analysis ${analysis.id}`,
        );
      }

      // Update analysis with jobDescriptionId
      await queryRunner.query(
        `
        UPDATE cv_matching_analyses 
        SET jobDescriptionId = $1,
            isSnapshot = true,
            snapshotReason = 'Backfilled from embedded snapshot'
        WHERE id = $2
      `,
        [jobDescriptionId, analysis.id],
      );
    }

    // Process cover letters
    for (const coverLetter of coverLettersWithoutJobDescription) {
      const snapshot = coverLetter.jobDescriptionSnapshot;
      if (!snapshot || !snapshot.title || !snapshot.description) {
        console.log(
          `⚠️ Skipping cover letter ${coverLetter.id} - invalid snapshot`,
        );
        continue;
      }

      // Create a hash of the snapshot for deduplication
      const snapshotHash = this.createSnapshotHash(snapshot);

      let jobDescriptionId = createdJobDescriptions.get(snapshotHash);

      if (!jobDescriptionId) {
        // Create new JobDescription
        const jobDescriptionResult = await queryRunner.query(
          `
          INSERT INTO job_descriptions (
            id,
            userId,
            title,
            description,
            company,
            location,
            salary,
            experience,
            requirements,
            keywords,
            createdAt,
            updatedAt
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $10
          ) RETURNING id
        `,
          [
            coverLetter.userId,
            snapshot.title,
            snapshot.description,
            snapshot.company || null,
            null, // location not in snapshot
            null, // salary not in snapshot
            snapshot.experience || null,
            JSON.stringify({
              skills: snapshot.keyRequirements || [],
              education: [],
              experience: [],
              certifications: [],
            }),
            JSON.stringify(snapshot.keyRequirements || []),
            coverLetter.createdAt,
          ],
        );

        jobDescriptionId = jobDescriptionResult[0].id;
        if (jobDescriptionId) {
          createdJobDescriptions.set(snapshotHash, jobDescriptionId);
        }

        console.log(
          `✅ Created JobDescription ${jobDescriptionId} for cover letter ${coverLetter.id}`,
        );
      } else {
        console.log(
          `♻️ Reusing JobDescription ${jobDescriptionId} for cover letter ${coverLetter.id}`,
        );
      }

      // Update cover letter with jobDescriptionId
      await queryRunner.query(
        `
        UPDATE cv_cover_letters 
        SET jobDescriptionId = $1,
            isSnapshot = true,
            snapshotReason = 'Backfilled from embedded snapshot'
        WHERE id = $2
      `,
        [jobDescriptionId, coverLetter.id],
      );
    }

    // Step 4: Verify the backfill
    const finalAnalysisCount = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM cv_matching_analyses 
      WHERE "jobDescriptionId" IS NOT NULL
    `);

    const finalCoverLetterCount = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM cv_cover_letters 
      WHERE "jobDescriptionId" IS NOT NULL
    `);

    const finalJobDescriptionCount = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM job_descriptions
    `);

    console.log(`📊 Backfill completed:`);
    console.log(
      `   - Analyses with JobDescription: ${finalAnalysisCount[0].count}`,
    );
    console.log(
      `   - Cover Letters with JobDescription: ${finalCoverLetterCount[0].count}`,
    );
    console.log(
      `   - Total JobDescriptions: ${finalJobDescriptionCount[0].count}`,
    );
    console.log(
      `   - Unique JobDescriptions created: ${createdJobDescriptions.size}`,
    );

    // Step 5: Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');

    await queryRunner.query(`
      ALTER TABLE cv_matching_analyses 
      ADD CONSTRAINT fk_cv_matching_analyses_job_description 
      FOREIGN KEY ("jobDescriptionId") REFERENCES job_descriptions(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE cv_cover_letters 
      ADD CONSTRAINT fk_cv_cover_letters_job_description 
      FOREIGN KEY ("jobDescriptionId") REFERENCES job_descriptions(id) ON DELETE CASCADE
    `);

    console.log('✅ Foreign key constraints added successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back JobDescription backfill...');

    // Remove foreign key constraints
    await queryRunner.query(`
      ALTER TABLE cv_matching_analyses 
      DROP CONSTRAINT IF EXISTS fk_cv_matching_analyses_job_description
    `);

    await queryRunner.query(`
      ALTER TABLE cv_cover_letters 
      DROP CONSTRAINT IF EXISTS fk_cv_cover_letters_job_description
    `);

    // Clear jobDescriptionId from backfilled records
    await queryRunner.query(`
      UPDATE cv_matching_analyses 
      SET jobDescriptionId = NULL,
          isSnapshot = false,
          snapshotReason = NULL
      WHERE snapshotReason = 'Backfilled from embedded snapshot'
    `);

    await queryRunner.query(`
      UPDATE cv_cover_letters 
      SET jobDescriptionId = NULL,
          isSnapshot = false,
          snapshotReason = NULL
      WHERE snapshotReason = 'Backfilled from embedded snapshot'
    `);

    // Delete backfilled JobDescriptions
    await queryRunner.query(`
      DELETE FROM job_descriptions 
      WHERE id NOT IN (
        SELECT DISTINCT jobDescriptionId 
        FROM cv_matching_analyses 
        WHERE jobDescriptionId IS NOT NULL
        UNION
        SELECT DISTINCT jobDescriptionId 
        FROM cv_cover_letters 
        WHERE jobDescriptionId IS NOT NULL
      )
    `);

    console.log('✅ JobDescription backfill rollback completed');
  }

  private createSnapshotHash(snapshot: any): string {
    // Create a hash based on key fields for deduplication
    const keyFields = {
      title: snapshot.title,
      description: snapshot.description,
      company: snapshot.company,
      keyRequirements: snapshot.keyRequirements,
    };

    return Buffer.from(JSON.stringify(keyFields)).toString('base64');
  }
}
