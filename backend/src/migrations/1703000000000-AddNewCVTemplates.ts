import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewCVTemplates1703000000000 implements MigrationInterface {
  name = 'AddNewCVTemplates1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert new CV templates
    await queryRunner.query(`
      INSERT INTO templates (id, name, displayName, description, metadata, "isActive", "isPremium", "usageCount", "createdAt", "updatedAt")
      VALUES 
        ('${this.generateUUID()}', 'dynamic', 'Dynamic Template', 'Smart template that adapts to your CV content', 
         '{"category": "professional", "color": "#2563eb", "preview": "Automatically adjusts sections based on available data", "features": ["Auto-layout", "Content-aware", "Modern design"]}', 
         true, false, 0, NOW(), NOW()),
         
        ('${this.generateUUID()}', 'show-all', 'Show All Template', 'Displays all sections even when empty', 
         '{"category": "professional", "color": "#059669", "preview": "Shows all CV sections for comprehensive view", "features": ["Complete sections", "Comprehensive view", "ATS-friendly"]}', 
         true, false, 0, NOW(), NOW()),
         
        ('${this.generateUUID()}', 'modern', 'Modern Template', 'Contemporary design with clean layout', 
         '{"category": "modern", "color": "#7c3aed", "preview": "Modern design with clean typography and spacing", "features": ["Modern design", "Clean layout", "Professional styling"]}', 
         true, false, 0, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);

    // Update existing templates with better metadata
    await queryRunner.query(`
      UPDATE templates 
      SET metadata = jsonb_set(
        jsonb_set(
          jsonb_set(
            metadata, 
            '{preview}', 
            '"Professional single-column layout with clean typography"'
          ), 
          '{features}', 
          '["ATS-friendly", "Clean layout", "Traditional design", "Single column"]'
        ),
        '{color}',
        '"#1f2937"'
      )
      WHERE name = 'professional';
    `);

    await queryRunner.query(`
      UPDATE templates 
      SET metadata = jsonb_set(
        jsonb_set(
          jsonb_set(
            metadata, 
            '{preview}', 
            '"Two-column design with skills sidebar and modern styling"'
          ), 
          '{features}', 
          '["Two-column layout", "Skills sidebar", "Modern design", "Professional styling"]'
        ),
        '{color}',
        '"#3b82f6"'
      )
      WHERE name = 'two-column';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the new templates
    await queryRunner.query(`
      DELETE FROM templates 
      WHERE name IN ('dynamic', 'show-all', 'modern');
    `);

    // Revert existing templates to original metadata
    await queryRunner.query(`
      UPDATE templates 
      SET metadata = jsonb_set(
        jsonb_set(
          jsonb_set(
            metadata, 
            '{preview}', 
            '"Single column with header, sections, and standard formatting"'
          ), 
          '{features}', 
          '["ATS-friendly", "Clean layout", "Traditional design"]'
        ),
        '{color}',
        '"#2c3e50"'
      )
      WHERE name = 'professional';
    `);

    await queryRunner.query(`
      UPDATE templates 
      SET metadata = jsonb_set(
        jsonb_set(
          jsonb_set(
            metadata, 
            '{preview}', 
            '"Left column: Contact info & skills, Right column: Experience & education"'
          ), 
          '{features}', 
          '["Modern design", "Skills sidebar", "Professional styling"]'
        ),
        '{color}',
        '"#4253D7"'
      )
      WHERE name = 'two-column';
    `);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
