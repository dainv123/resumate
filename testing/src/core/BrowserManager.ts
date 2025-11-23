import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { TestContext } from './TestContext';

/**
 * Browser management utilities for different test scenarios
 */
export class BrowserManager {
  private static browser: Browser | null = null;
  private static contexts: Map<string, BrowserContext> = new Map();

  /**
   * Get browser instance based on browser type
   */
  static async getBrowser(browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<Browser> {
    if (!this.browser) {
      const launchOptions = {
        headless: process.env.CI ? true : process.env.HEADLESS !== 'false',
        slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };

      switch (browserType) {
        case 'firefox':
          this.browser = await firefox.launch(launchOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(launchOptions);
          break;
        case 'chromium':
        default:
          this.browser = await chromium.launch(launchOptions);
          break;
      }
    }

    return this.browser;
  }

  /**
   * Create new browser context with default settings
   */
  static async createContext(browser: Browser, options?: {
    viewport?: { width: number; height: number };
    userAgent?: string;
    locale?: string;
    timezoneId?: string;
    permissions?: string[];
  }): Promise<BrowserContext> {
    const contextOptions: any = {
      viewport: options?.viewport || { width: 1280, height: 720 },
      userAgent: options?.userAgent,
      locale: options?.locale || 'en-US',
      timezoneId: options?.timezoneId || 'America/New_York',
      permissions: options?.permissions || [],
      // Enable video recording for failed tests
      recordVideo: process.env.RECORD_VIDEO === 'true' ? { dir: 'reports/videos/' } : undefined,
    };

    const context = await browser.newContext(contextOptions);
    return context;
  }

  /**
   * Create authenticated context with stored session
   */
  static async createAuthenticatedContext(
    browser: Browser,
    authToken: string,
    options?: any
  ): Promise<BrowserContext> {
    const context = await this.createContext(browser, options);

    // Set authentication token in localStorage and cookies
    const page = await context.newPage();

    // Navigate to app and set auth token
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
      // Set cookie for API calls
      document.cookie = `auth_token=${token}; path=/`;
    }, authToken);

    await page.close();
    return context;
  }

  /**
   * Create mobile context for mobile testing
   */
  static async createMobileContext(
    browser: Browser,
    device: 'iPhone' | 'Android' = 'iPhone'
  ): Promise<BrowserContext> {
    const mobileOptions = {
      viewport: device === 'iPhone'
        ? { width: 375, height: 667 }
        : { width: 360, height: 640 },
      userAgent: device === 'iPhone'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      hasTouch: true,
      isMobile: true
    };

    return await this.createContext(browser, mobileOptions);
  }

  /**
   * Create test context with all necessary setup
   */
  static async createTestContext(
    browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium',
    options?: {
      authenticated?: boolean;
      authToken?: string;
      mobile?: boolean;
      mobileDevice?: 'iPhone' | 'Android';
      customViewport?: { width: number; height: number };
    }
  ): Promise<TestContext> {
    const browser = await this.getBrowser(browserType);
    let context: BrowserContext;

    if (options?.mobile) {
      context = await this.createMobileContext(browser, options.mobileDevice);
    } else if (options?.authenticated && options.authToken) {
      context = await this.createAuthenticatedContext(browser, options.authToken, {
        viewport: options.customViewport
      });
    } else {
      context = await this.createContext(browser, {
        viewport: options?.customViewport
      });
    }

    const page = await context.newPage();
    const testContext = new TestContext(page, browser, context);

    return testContext;
  }

  /**
   * Cleanup browser instance
   */
  static async cleanup(): Promise<void> {
    try {
      // Close all contexts
      for (const context of this.contexts.values()) {
        await context.close();
      }
      this.contexts.clear();

      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error('Error during browser cleanup:', error);
    }
  }

  /**
   * Get browser capabilities
   */
  static getBrowserCapabilities(browserType: string): string[] {
    const capabilities = {
      chromium: ['headless', 'extensions', 'geolocation', 'permissions', 'downloads'],
      firefox: ['headless', 'geolocation', 'permissions', 'downloads'],
      webkit: ['headless', 'geolocation', 'permissions']
    };

    return capabilities[browserType as keyof typeof capabilities] || [];
  }

  /**
   * Setup browser for CI environment
   */
  static getCIConfiguration(): any {
    return {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      slowMo: 0
    };
  }

  /**
   * Setup browser for local development
   */
  static getLocalConfiguration(): any {
    return {
      headless: false,
      slowMo: 100,
      args: ['--disable-web-security']
    };
  }
}
