#!/usr/bin/env ts-node

/**
 * CV Data Migration Script
 * Migrates existing CV data from legacy structure to standard structure
 */

import { createConnection } from 'typeorm';
import { Cv } from '../modules/cv/entities/cv.entity';
import { CVDataUtils } from '../shared/utils/cv-data.utils';
import { CVData } from '../shared/interfaces/cv-data.interface';

async function migrateCVData() {
  console.log('🔄 Starting CV data migration to standard structure...');
  
  try {
    // Create database connection
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'resumate',
      entities: [Cv],
      synchronize: false,
      logging: false
    });

    console.log('✅ Database connected');

    // Get all CVs
    const cvRepository = connection.getRepository(Cv);
    const cvs = await cvRepository.find();

    console.log(`📊 Found ${cvs.length} CVs to migrate`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const cv of cvs) {
      try {
        // Check if CV data is already in new format
        if (cv.parsedData && cv.parsedData.contact && typeof cv.parsedData.contact === 'object') {
          console.log(`⏭️  CV ${cv.id} already in standard format, skipping`);
          skipped++;
          continue;
        }

        // Normalize CV data to standard format
        const normalizedData = CVDataUtils.normalizeCVData(cv.parsedData);
        
        // Update CV with normalized data
        await cvRepository.update(cv.id, {
          parsedData: normalizedData
        });

        console.log(`✅ Migrated CV ${cv.id}`);
        migrated++;

      } catch (error) {
        console.error(`❌ Error migrating CV ${cv.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Migrated: ${migrated} CVs`);
    console.log(`⏭️  Skipped: ${skipped} CVs`);
    console.log(`❌ Errors: ${errors} CVs`);
    console.log(`📊 Total: ${cvs.length} CVs`);

    await connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateCVData();
}

export { migrateCVData };
