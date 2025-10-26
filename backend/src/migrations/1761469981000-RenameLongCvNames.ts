import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameLongCvNames1761469981000 implements MigrationInterface {
  name = 'RenameLongCvNames1761469981000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting migration: Rename CVs with long names...');

    // Define maximum length for CV names (adjust as needed)
    const MAX_NAME_LENGTH = 50;

    // Get all CVs with names longer than MAX_NAME_LENGTH
    const longNamedCvs = await queryRunner.query(`
      SELECT id, "originalFileName", "userId", "createdAt"
      FROM cvs 
      WHERE LENGTH("originalFileName") > ${MAX_NAME_LENGTH}
      ORDER BY "createdAt" ASC
    `);

    console.log(
      `📊 Found ${longNamedCvs.length} CVs with names longer than ${MAX_NAME_LENGTH} characters`,
    );

    if (longNamedCvs.length === 0) {
      console.log('✅ No CVs need renaming. Migration completed.');
      return;
    }

    // Process each CV
    for (const cv of longNamedCvs) {
      const originalName = cv.originalFileName;
      const userId = cv.userId;
      const createdAt = cv.createdAt;

      // Generate new name based on different strategies
      const newName = this.generateShortName(originalName, userId, createdAt);

      console.log(`🔄 Renaming CV ${cv.id}:`);
      console.log(
        `   Original: "${originalName}" (${originalName.length} chars)`,
      );
      console.log(`   New:      "${newName}" (${newName.length} chars)`);

      // Update the CV name
      await queryRunner.query(
        `
        UPDATE cvs 
        SET "originalFileName" = $1, "updatedAt" = NOW()
        WHERE id = $2
      `,
        [newName, cv.id],
      );

      console.log(`   ✅ Updated successfully`);
    }

    console.log(`🎉 Migration completed! Renamed ${longNamedCvs.length} CVs.`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️  This migration cannot be automatically reversed.');
    console.log('   Original file names were not stored during the migration.');
    console.log('   If you need to restore original names, you will need to:');
    console.log('   1. Restore from a database backup, or');
    console.log('   2. Manually restore the original names from your records.');
  }

  /**
   * Generate a shorter name for CV based on original name and metadata
   */
  private generateShortName(
    originalName: string,
    userId: string,
    createdAt: string,
  ): string {
    // Strategy 1: Try to extract meaningful parts
    const meaningfulName = this.extractMeaningfulName(originalName);
    if (meaningfulName.length <= 50) {
      return meaningfulName;
    }

    // Strategy 2: Use date-based naming
    const dateBasedName = this.generateDateBasedName(createdAt, userId);
    if (dateBasedName.length <= 50) {
      return dateBasedName;
    }

    // Strategy 3: Use hash-based naming as fallback
    return this.generateHashBasedName(originalName, userId);
  }

  /**
   * Extract meaningful parts from original filename
   */
  private extractMeaningfulName(originalName: string): string {
    // Remove common file extensions
    let name = originalName.replace(/\.(pdf|docx?|txt)$/i, '');

    // Remove common prefixes/suffixes
    name = name.replace(/^(cv|resume|curriculum|vitae)[\s_-]*/i, '');
    name = name.replace(/[\s_-]*(cv|resume|curriculum|vitae)$/i, '');

    // Remove version numbers
    name = name.replace(/[\s_-]*v?\d+[\s_-]*$/i, '');
    name = name.replace(/[\s_-]*version\s*\d+[\s_-]*$/i, '');

    // Remove dates
    name = name.replace(/[\s_-]*\d{4}[\s_-]*\d{2}[\s_-]*\d{2}[\s_-]*/g, '');
    name = name.replace(/[\s_-]*\d{2}[\s_-]*\d{2}[\s_-]*\d{4}[\s_-]*/g, '');

    // Clean up multiple spaces/underscores/dashes
    name = name.replace(/[\s_-]+/g, ' ').trim();

    // If still too long, truncate intelligently
    if (name.length > 50) {
      // Try to keep first part and last part
      const words = name.split(' ');
      if (words.length > 2) {
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        const middleLength = 50 - firstWord.length - lastWord.length - 3; // 3 for "..."

        if (middleLength > 0) {
          const middle = words
            .slice(1, -1)
            .join(' ')
            .substring(0, middleLength);
          name = `${firstWord} ${middle}... ${lastWord}`;
        } else {
          name = `${firstWord}...${lastWord}`;
        }
      } else {
        name = name.substring(0, 47) + '...';
      }
    }

    return name || 'CV';
  }

  /**
   * Generate date-based name
   */
  private generateDateBasedName(createdAt: string, userId: string): string {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Use first 8 characters of userId for uniqueness
    const userShort = userId.substring(0, 8);

    return `CV_${year}${month}${day}_${userShort}`;
  }

  /**
   * Generate hash-based name as fallback
   */
  private generateHashBasedName(originalName: string, userId: string): string {
    // Simple hash function
    let hash = 0;
    const str = originalName + userId;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to positive hex string
    const hashStr = Math.abs(hash).toString(16).substring(0, 8);

    return `CV_${hashStr}`;
  }
}
