import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object class providing common functionality
 * for all page objects in the testing framework
 */
export abstract class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'http://localhost:5006';
  }

  /**
   * Navigate to a specific path
   */
  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toBeVisible({ timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toBeHidden({ timeout });
  }

  /**
   * Click on an element
   */
  async clickElement(selector: string | Locator): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.click();
  }

  /**
   * Fill text in an input field
   */
  async fillInput(selector: string | Locator, text: string): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.fill(text);
  }

  /**
   * Get text from an element
   */
  async getText(selector: string | Locator): Promise<string> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    return await element.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    try {
      await expect(element).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists in DOM
   */
  async elementExists(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.count() > 0;
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string | Locator, value: string): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.selectOption(value);
  }

  /**
   * Take screenshot of current page
   */
  async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${filename}.png`, fullPage: true });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string | Locator): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for specific text to appear
   */
  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible({ timeout });
  }

  /**
   * Wait for URL to contain specific path
   */
  async waitForURL(path: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(`**${path}`, { timeout });
  }

  /**
   * Get current page URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text with keyboard simulation
   */
  async typeText(text: string, delay: number = 100): Promise<void> {
    await this.page.keyboard.type(text, { delay });
  }

  /**
   * Clear input field and type new text
   */
  async clearAndType(selector: string | Locator, text: string): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.clear();
    await element.type(text);
  }

  /**
   * Handle dialog (alert, confirm, prompt)
   */
  async handleDialog(action: 'accept' | 'dismiss', promptText?: string): Promise<void> {
    this.page.on('dialog', async dialog => {
      if (promptText && dialog.type() === 'prompt') {
        await dialog.accept(promptText);
      } else if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Upload file to input
   */
  async uploadFile(selector: string | Locator, filePath: string): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.setInputFiles(filePath);
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Reload current page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Get element attribute
   */
  async getAttribute(selector: string | Locator, attribute: string): Promise<string | null> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    return await element.getAttribute(attribute);
  }

  /**
   * Hover over element
   */
  async hoverElement(selector: string | Locator): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.hover();
  }

  /**
   * Right click on element
   */
  async rightClickElement(selector: string | Locator): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.click({ button: 'right' });
  }

  /**
   * Double click on element
   */
  async doubleClickElement(selector: string | Locator): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await this.waitForElement(element);
    await element.dblclick();
  }

  /**
   * Drag and drop elements
   */
  async dragAndDrop(sourceSelector: string | Locator, targetSelector: string | Locator): Promise<void> {
    const source = typeof sourceSelector === 'string' ? this.page.locator(sourceSelector) : sourceSelector;
    const target = typeof targetSelector === 'string' ? this.page.locator(targetSelector) : targetSelector;

    await this.waitForElement(source);
    await this.waitForElement(target);

    await source.dragTo(target);
  }
}
