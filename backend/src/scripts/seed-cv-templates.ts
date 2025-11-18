#!/usr/bin/env node

/**
 * Seed CV Templates Script
 * Seeds new CV templates into the database
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TemplatesService } from '../modules/templates/templates.service';

async function seedCVTemplates() {
  console.log('🌱 Starting CV templates seeding...\n');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    const templatesService = app.get(TemplatesService);

    // Seed default templates first
    await templatesService.seedDefaultTemplates();
    console.log('✅ Default templates seeded');

    // Add new templates
    const newTemplates = [
      {
        name: 'dynamic',
        displayName: 'Dynamic Template',
        description:
          'Smart template that adapts to your CV content automatically',
        metadata: {
          category: 'professional' as const,
          color: '#2563eb',
          preview: 'Automatically adjusts sections based on available data',
          features: [
            'Auto-layout',
            'Content-aware',
            'Modern design',
            'Responsive',
          ],
        },
        isPremium: false,
      },
      {
        name: 'show-all',
        displayName: 'Show All Template',
        description:
          'Displays all sections even when empty for comprehensive view',
        metadata: {
          category: 'professional' as const,
          color: '#059669',
          preview: 'Shows all CV sections for comprehensive view',
          features: [
            'Complete sections',
            'Comprehensive view',
            'ATS-friendly',
            'No hidden content',
          ],
        },
        isPremium: false,
      },
      {
        name: 'modern',
        displayName: 'Modern Template',
        description:
          'Contemporary design with clean layout and modern typography',
        metadata: {
          category: 'modern' as const,
          color: '#7c3aed',
          preview: 'Modern design with clean typography and spacing',
          features: [
            'Modern design',
            'Clean layout',
            'Professional styling',
            'Contemporary',
          ],
        },
        isPremium: false,
      },
      {
        name: 'creative',
        displayName: 'Creative Template',
        description: 'Bold and creative design for creative professionals',
        metadata: {
          category: 'creative' as const,
          color: '#dc2626',
          preview: 'Bold design with creative elements and visual hierarchy',
          features: [
            'Creative design',
            'Visual hierarchy',
            'Bold colors',
            'Unique layout',
          ],
        },
        isPremium: true,
      },
      {
        name: 'minimal',
        displayName: 'Minimal Template',
        description: 'Clean and minimal design focusing on content',
        metadata: {
          category: 'professional' as const,
          color: '#374151',
          preview: 'Minimal design with focus on content readability',
          features: [
            'Minimal design',
            'Content-focused',
            'Clean typography',
            'Simple layout',
          ],
        },
        isPremium: false,
      },
      {
        name: 'executive',
        displayName: 'Executive Template',
        description: 'Professional template designed for executive positions',
        metadata: {
          category: 'professional' as const,
          color: '#1f2937',
          preview:
            'Executive-focused design with emphasis on leadership and achievements',
          features: [
            'Executive design',
            'Leadership focus',
            'Professional styling',
            'High-level positioning',
          ],
        },
        isPremium: true,
      },
    ];

    let seededCount = 0;
    let skippedCount = 0;

    for (const templateData of newTemplates) {
      try {
        const existing = await templatesService.findByName(templateData.name);
        if (!existing) {
          await templatesService.create(templateData);
          console.log(`✅ Seeded template: ${templateData.displayName}`);
          seededCount++;
        } else {
          console.log(
            `⏭️  Template already exists: ${templateData.displayName}`,
          );
          skippedCount++;
        }
      } catch (error) {
        console.error(
          `❌ Failed to seed template ${templateData.name}:`,
          error.message,
        );
      }
    }

    console.log(`\n🎉 CV Templates seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   • New templates seeded: ${seededCount}`);
    console.log(`   • Templates skipped: ${skippedCount}`);
    console.log(
      `   • Total templates in database: ${(await templatesService.findAll()).length}`,
    );

    // Close the application
    await app.close();
  } catch (error) {
    console.error('❌ Error seeding CV templates:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedCVTemplates()
    .then(() => {
      console.log('\n✅ CV templates seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ CV templates seeding script failed:', error);
      process.exit(1);
    });
}

export { seedCVTemplates };
