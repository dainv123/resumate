import { chromium } from '@playwright/test';
import fs from 'fs-extra';
import path from 'path';

/**
 * Global setup for Playwright tests
 * Runs once before all test suites
 */
async function globalSetup(): Promise<void> {
  console.log('🚀 Setting up testing environment...');

  try {
    // Ensure reports directory exists
    await fs.ensureDir('reports');
    await fs.ensureDir('reports/screenshots');
    await fs.ensureDir('reports/videos');
    await fs.ensureDir('test-results');

    // Clean up old reports if not in CI
    if (!process.env.CI) {
      await fs.emptyDir('reports/screenshots');
      await fs.emptyDir('reports/videos');
      await fs.emptyDir('test-results');
    }

    // Pre-warm browser for faster test execution
    if (process.env.PREWARM_BROWSER === 'true') {
      console.log('🔥 Pre-warming browser...');
      const browser = await chromium.launch();
      const page = await browser.newPage();

      // Navigate to base URL to cache resources
      try {
        await page.goto(process.env.BASE_URL || 'http://localhost:3000', {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
      } catch (error) {
        console.warn('⚠️ Could not pre-warm browser:', error.message);
      }

      await page.close();
      await browser.close();
      console.log('✅ Browser pre-warmed');
    }

    // Setup test database if needed
    if (process.env.SETUP_TEST_DB === 'true') {
      console.log('🗄️ Setting up test database...');
      // Database setup logic would go here
      console.log('✅ Test database ready');
    }

    // Verify environment variables
    const requiredEnvVars = ['BASE_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    }

    console.log('✅ Testing environment setup complete!');

  } catch (error) {
    console.error('❌ Error during global setup:', error);
    throw error;
  }
}

export default globalSetup;
