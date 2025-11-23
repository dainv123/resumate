import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/BasePage';

/**
 * Login Page Object Model
 * Handles all interactions with the login page
 */
export class LoginPage extends BasePage {
  // Page elements selectors
  private readonly selectors = {
    // Form elements
    emailInput: 'input[type="email"], input[placeholder*="email" i]',
    passwordInput: 'input[type="password"], input[placeholder*="password" i]',
    loginButton: 'button[type="submit"], button:has-text("Login"), button:has-text("Đăng nhập")',
    googleLoginButton: 'button:has-text("Google"), button:has-text("Continue with Google")',

    // Links and navigation
    registerLink: 'a:has-text("Register"), a:has-text("Sign up"), a:has-text("Đăng ký")',
    forgotPasswordLink: 'a:has-text("Forgot"), a:has-text("Quên mật khẩu")',

    // Error messages
    errorMessage: '.text-red-600, .text-red-500, .error-message, [data-testid="error-message"]',
    emailError: '[data-testid="email-error"], .email-error',
    passwordError: '[data-testid="password-error"], .password-error',

    // Success messages
    successMessage: '.text-green-600, .text-green-500, .success-message',

    // Loading states
    loadingSpinner: '.animate-spin, .loading-spinner, [data-testid="loading"]',
    loginButtonLoading: 'button[type="submit"]:has(.animate-spin)',

    // Page containers
    loginForm: 'form, [data-testid="login-form"]',
    loginContainer: '[data-testid="login-container"], .login-container'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateTo('/auth/login');
    await this.waitForLoginPageLoad();
  }

  /**
   * Wait for login page to load completely
   */
  async waitForLoginPageLoad(): Promise<void> {
    await this.waitForElement(this.selectors.loginForm);
    await this.waitForElement(this.selectors.emailInput);
    await this.waitForElement(this.selectors.passwordInput);
    await this.waitForElement(this.selectors.loginButton);
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.fillInput(this.selectors.emailInput, email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillInput(this.selectors.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.selectors.loginButton);
  }

  /**
   * Perform complete login
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    await this.waitForLoginCompletion();
  }

  /**
   * Click Google login button
   */
  async clickGoogleLogin(): Promise<void> {
    await this.clickElement(this.selectors.googleLoginButton);
  }

  /**
   * Click register link
   */
  async clickRegisterLink(): Promise<void> {
    await this.clickElement(this.selectors.registerLink);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPasswordLink(): Promise<void> {
    await this.clickElement(this.selectors.forgotPasswordLink);
  }

  /**
   * Wait for login completion (redirect or success message)
   */
  async waitForLoginCompletion(): Promise<void> {
    try {
      // Wait for either redirect to dashboard or success message
      await Promise.race([
        this.page.waitForURL('**/dashboard', { timeout: 10000 }),
        this.waitForElement(this.selectors.successMessage, 10000),
        this.page.waitForLoadState('networkidle', { timeout: 10000 })
      ]);
    } catch (error) {
      // If no redirect, check for error message
      console.log('Login completion check failed, checking for errors...');
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch {
      return '';
    }
  }

  /**
   * Get email error message
   */
  async getEmailError(): Promise<string> {
    try {
      return await this.getText(this.selectors.emailError);
    } catch {
      return '';
    }
  }

  /**
   * Get password error message
   */
  async getPasswordError(): Promise<string> {
    try {
      return await this.getText(this.selectors.passwordError);
    } catch {
      return '';
    }
  }

  /**
   * Check if login button is loading
   */
  async isLoginButtonLoading(): Promise<boolean> {
    return await this.elementExists(this.selectors.loginButtonLoading);
  }

  /**
   * Check if page is in loading state
   */
  async isPageLoading(): Promise<boolean> {
    return await this.elementExists(this.selectors.loadingSpinner);
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.fillInput(this.selectors.emailInput, '');
    await this.fillInput(this.selectors.passwordInput, '');
  }

  /**
   * Check if login was successful
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      // Check if redirected to dashboard
      const currentURL = await this.getCurrentURL();
      return currentURL.includes('/dashboard') ||
             await this.elementExists(this.selectors.successMessage);
    } catch {
      return false;
    }
  }

  /**
   * Check if login failed
   */
  async isLoginFailed(): Promise<boolean> {
    return await this.elementExists(this.selectors.errorMessage);
  }

  /**
   * Get current form values
   */
  async getFormValues(): Promise<{ email: string; password: string }> {
    const email = await this.page.inputValue(this.selectors.emailInput);
    const password = await this.page.inputValue(this.selectors.passwordInput);

    return { email, password };
  }

  /**
   * Take screenshot of login page
   */
  async takeLoginScreenshot(filename: string = 'login-page'): Promise<void> {
    await this.takeScreenshot(filename);
  }

  /**
   * Validate login page elements are present
   */
  async validatePageElements(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        this.elementExists(this.selectors.emailInput),
        this.elementExists(this.selectors.passwordInput),
        this.elementExists(this.selectors.loginButton),
        this.elementExists(this.selectors.registerLink)
      ]);

      return checks.every(check => check === true);
    } catch {
      return false;
    }
  }
}
