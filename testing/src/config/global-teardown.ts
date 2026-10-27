import { BrowserManager } from '../core/BrowserManager';
import fs from 'fs-extra';

/**
 * Global teardown for Playwright tests
 * Runs once after all test suites
 */
async function globalTeardown(): Promise<void> {
  console.log('🧹 Cleaning up testing environment...');

  try {
    // Close browser instances
    await BrowserManager.cleanup();
    console.log('✅ Browser cleanup complete');

    // Clean up temporary files if not in CI
    if (!process.env.CI && process.env.CLEANUP_TEMP_FILES === 'true') {
      console.log('🗑️ Cleaning up temporary files...');

      // Remove old screenshots/videos (keep last 10 runs)
      const screenshotsDir = 'reports/screenshots';
      const videosDir = 'reports/videos';

      if (await fs.pathExists(screenshotsDir)) {
        const screenshotFiles = await fs.readdir(screenshotsDir);
        if (screenshotFiles.length > 100) { // Keep last 100 screenshots
          const filesToDelete = screenshotFiles
            .sort()
            .slice(0, -100);
          for (const file of filesToDelete) {
            await fs.remove(`${screenshotsDir}/${file}`);
          }
          console.log(`🗑️ Removed ${filesToDelete.length} old screenshots`);
        }
      }

      if (await fs.pathExists(videosDir)) {
        const videoFiles = await fs.readdir(videosDir);
        if (videoFiles.length > 10) { // Keep last 10 videos
          const filesToDelete = videoFiles
            .sort()
            .slice(0, -10);
          for (const file of filesToDelete) {
            await fs.remove(`${videosDir}/${file}`);
          }
          console.log(`🗑️ Removed ${filesToDelete.length} old videos`);
        }
      }
    }

    // Generate cleanup report
    if (process.env.GENERATE_CLEANUP_REPORT === 'true') {
      const cleanupReport = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cleanupActions: [
          'Browser instances closed',
          'Temporary files cleaned',
          'Test contexts cleared'
        ]
      };

      await fs.writeJson('reports/cleanup-report.json', cleanupReport, { spaces: 2 });
      console.log('📊 Cleanup report generated');
    }

    console.log('✅ Testing environment cleanup complete!');

  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
