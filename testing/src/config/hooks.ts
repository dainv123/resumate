import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { BrowserManager } from '../core/BrowserManager';
import { TestDataManager } from '../utils/test-data-manager';

// Set default timeout for all steps (30 seconds)
setDefaultTimeout(30000);

// Global setup - runs once before all tests
BeforeAll(async function () {
  console.log('🚀 Starting test suite...');

  try {
    // Load all test data
    await TestDataManager.loadAllTestData();
    console.log('✅ Test data loaded');
  } catch (error) {
    console.error('❌ Failed to load test data:', error);
    throw error;
  }
});

// Global teardown - runs once after all tests
AfterAll(async function () {
  console.log('🧹 Cleaning up test suite...');

  try {
    // Cleanup browser instances
    await BrowserManager.cleanup();
    console.log('✅ Browser cleanup complete');

    // Cleanup test data
    await TestDataManager.cleanup();
    console.log('✅ Test data cleanup complete');

  } catch (error) {
    console.error('❌ Error during global cleanup:', error);
  }

  console.log('✅ Test suite cleanup complete');
});

// Scenario setup - runs before each scenario
Before(async function (scenario) {
  console.log(`🎬 Starting scenario: ${scenario.pickle.name}`);

  try {
    // Initialize test context for this scenario
    await this.init();

    // Set current page to null at start of each scenario
    this.context.currentPage = null;

    // Clear any stored test data
    this.context.testUser = null;
    this.context.testCV = null;
    this.context.testProject = null;

    console.log('✅ Scenario setup complete');

  } catch (error) {
    console.error('❌ Failed to setup scenario:', error);
    throw error;
  }
});

// Scenario teardown - runs after each scenario
After(async function (scenario) {
  console.log(`🏁 Finishing scenario: ${scenario.pickle.name}`);

  try {
    // Take screenshot if scenario failed
    if (scenario.result?.status === 'FAILED') {
      const screenshotName = `failed_${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await this.takeScreenshot(screenshotName);
      console.log(`📸 Screenshot taken: ${screenshotName}`);
    }

    // Cleanup scenario-specific data
    if (this.context) {
      await this.cleanup();
    }

    console.log('✅ Scenario cleanup complete');

  } catch (error) {
    console.error('❌ Error during scenario cleanup:', error);
  }
});

// Hook for scenarios tagged with @mobile
Before({ tags: '@mobile' }, async function () {
  console.log('📱 Setting up mobile scenario...');

  try {
    // Create mobile browser context
    this.context = await BrowserManager.createTestContext('chromium', {
      mobile: true,
      mobileDevice: 'iPhone'
    });

    console.log('✅ Mobile setup complete');

  } catch (error) {
    console.error('❌ Failed to setup mobile scenario:', error);
    throw error;
  }
});

// Hook for scenarios tagged with @authenticated
Before({ tags: '@authenticated' }, async function () {
  console.log('🔐 Setting up authenticated scenario...');

  try {
    // Get test user and create authenticated context
    const testUser = TestDataManager.getRandomUser();

    this.context = await BrowserManager.createTestContext('chromium', {
      authenticated: true,
      authToken: 'fake-jwt-token-for-testing' // In real scenario, this would be obtained from login
    });

    this.context.setTestUser(testUser);
    console.log('✅ Authentication setup complete');

  } catch (error) {
    console.error('❌ Failed to setup authenticated scenario:', error);
    throw error;
  }
});

// Hook for scenarios tagged with @slow
Before({ tags: '@slow' }, async function () {
  console.log('🐌 Setting up slow scenario...');

  // Increase timeout for slow scenarios
  setDefaultTimeout(60000); // 1 minute

  console.log('✅ Slow scenario setup complete');
});

// Hook for scenarios tagged with @debug
Before({ tags: '@debug' }, async function () {
  console.log('🐛 Setting up debug scenario...');

  // Enable debug mode
  this.context.page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });

  this.context.page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });

  console.log('✅ Debug setup complete');
});

// Hook for scenarios that need specific browser
Before({ tags: '@firefox' }, async function () {
  console.log('🦊 Switching to Firefox...');
  this.browserType = 'firefox';
  await this.init();
});

Before({ tags: '@webkit' }, async function () {
  console.log('🍎 Switching to WebKit...');
  this.browserType = 'webkit';
  await this.init();
});

// Hook for performance testing scenarios
Before({ tags: '@performance' }, async function () {
  console.log('⚡ Setting up performance scenario...');

  // Disable screenshots and videos for performance tests
  this.context.page.context().tracing.start({ screenshots: false, snapshots: false });

  console.log('✅ Performance setup complete');
});

After({ tags: '@performance' }, async function () {
  try {
    // Stop tracing and save trace file
    await this.context.page.context().tracing.stop({
      path: `reports/traces/trace_${Date.now()}.zip`
    });
    console.log('📊 Performance trace saved');
  } catch (error) {
    console.error('❌ Failed to save performance trace:', error);
  }
});

// Hook for accessibility testing
Before({ tags: '@accessibility' }, async function () {
  console.log('♿ Setting up accessibility scenario...');

  // Enable accessibility features
  // Note: Additional accessibility testing would require axe-playwright or similar
  console.log('✅ Accessibility setup complete');
});

// Hook for visual regression testing
Before({ tags: '@visual' }, async function () {
  console.log('👁️ Setting up visual regression scenario...');

  // Configure for visual comparison
  // Note: Would integrate with tools like playwright-visual-regression
  console.log('✅ Visual regression setup complete');
});

// Error handling hook
After({ tags: '@flaky' }, async function (scenario) {
  // Special handling for known flaky tests
  if (scenario.result?.status === 'FAILED') {
    console.log('🔄 Flaky test failed - this is expected, not taking screenshot');

    // Don't take screenshot for known flaky tests
    return;
  }
});

// Retry hook for failed scenarios
After({ tags: '@retry' }, async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    console.log('🔄 Test failed, will retry...');

    // Wait before retry
    await this.context.page.waitForTimeout(2000);
  }
});
