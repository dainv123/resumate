import { setWorldConstructor, World } from '@cucumber/cucumber';
import { BrowserManager } from './BrowserManager';
import { TestContext } from './TestContext';

/**
 * Cucumber World class for BDD testing
 * Provides shared context and utilities for all step definitions
 */
export class TestWorld extends World {
  public context!: TestContext;
  public browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium';

  constructor(options: any) {
    super(options);
  }

  /**
   * Initialize test context before each scenario
   */
  async init(): Promise<void> {
    try {
      this.context = await BrowserManager.createTestContext(this.browserType, {
        authenticated: false // Will be set later if needed
      });
      console.log(`🌐 Browser context initialized for ${this.browserType}`);
    } catch (error) {
      console.error('❌ Failed to initialize test context:', error);
      throw error;
    }
  }

  /**
   * Cleanup after each scenario
   */
  async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.cleanup();
        console.log('🧹 Test context cleaned up');
      }
    } catch (error) {
      console.error('❌ Error during context cleanup:', error);
    }
  }

  /**
   * Set browser type for this scenario
   */
  setBrowserType(browserType: 'chromium' | 'firefox' | 'webkit'): void {
    this.browserType = browserType;
  }

  /**
   * Authenticate user for current session
   */
  async authenticateUser(email: string, password: string): Promise<void> {
    // Implementation will be in auth steps
    console.log(`🔐 Authenticating user: ${email}`);
  }

  /**
   * Set test data for current scenario
   */
  setTestData(key: string, value: any): void {
    // Store test data that can be shared across steps
    (this as any)[`test_${key}`] = value;
  }

  /**
   * Get test data for current scenario
   */
  getTestData(key: string): any {
    return (this as any)[`test_${key}`];
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(filename: string): Promise<void> {
    if (this.context) {
      await this.context.takeScreenshot(filename);
    }
  }

  /**
   * Wait for specified time (use sparingly)
   */
  async waitForTimeout(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current page URL
   */
  getCurrentURL(): string {
    return this.context ? this.context.getCurrentURL() : '';
  }

  /**
   * Navigate to specific page
   */
  async navigateTo(path: string): Promise<void> {
    if (this.context && this.context.page) {
      await this.context.page.goto(`${this.parameters.baseURL}${path}`);
      await this.context.waitForNavigation();
    }
  }
}

// Set the world constructor for Cucumber
setWorldConstructor(TestWorld);
