import { Page, Browser, BrowserContext } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Test execution context holding shared state and utilities
 */
export class TestContext {
  public page: Page;
  public browser: Browser;
  public context: BrowserContext;
  public currentPage: BasePage | null = null;

  // Test data
  public testUser: any = null;
  public testCV: any = null;
  public testProject: any = null;

  // Environment data
  public baseURL: string;
  public isCI: boolean;

  constructor(page: Page, browser: Browser, context: BrowserContext) {
    this.page = page;
    this.browser = browser;
    this.context = context;
    this.baseURL = process.env.BASE_URL || 'http://localhost:3000';
    this.isCI = !!process.env.CI;
  }

  /**
   * Set current page object
   */
  setCurrentPage(pageObject: BasePage): void {
    this.currentPage = pageObject;
  }

  /**
   * Get current page object
   */
  getCurrentPage(): BasePage | null {
    return this.currentPage;
  }

  /**
   * Store test user data
   */
  setTestUser(user: any): void {
    this.testUser = user;
  }

  /**
   * Get test user data
   */
  getTestUser(): any {
    return this.testUser;
  }

  /**
   * Store test CV data
   */
  setTestCV(cv: any): void {
    this.testCV = cv;
  }

  /**
   * Get test CV data
   */
  getTestCV(): any {
    return this.testCV;
  }

  /**
   * Store test project data
   */
  setTestProject(project: any): void {
    this.testProject = project;
  }

  /**
   * Get test project data
   */
  getTestProject(): any {
    return this.testProject;
  }

  /**
   * Clean up test context
   */
  async cleanup(): Promise<void> {
    try {
      // Close context and browser if needed
      if (this.context) {
        await this.context.close();
      }
    } catch (error) {
      console.error('Error during test context cleanup:', error);
    }
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(filename: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `reports/screenshots/${timestamp}_${filename}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  /**
   * Get current page URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Wait for page navigation
   */
  async waitForNavigation(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Clear browser storage
   */
  async clearStorage(): Promise<void> {
    await this.context.clearCookies();
    await this.context.clearPermissions();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Set viewport size
   */
  async setViewportSize(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Mock API responses
   */
  async mockAPI(url: string, response: any, status: number = 200): Promise<void> {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Intercept and modify API calls
   */
  async interceptAPI(url: string, modifier: (request: any) => any): Promise<void> {
    await this.page.route(url, route => {
      const request = route.request();
      const modifiedResponse = modifier(request);
      route.fulfill(modifiedResponse);
    });
  }
}
