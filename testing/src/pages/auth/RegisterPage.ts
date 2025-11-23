import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/BasePage';

/**
 * Register Page Object Model
 * Handles all interactions with the registration page
 */
export class RegisterPage extends BasePage {
  // Page elements selectors
  private readonly selectors = {
    // Form elements
    nameInput: 'input[type="text"], input[placeholder*="name" i], input[placeholder*="họ tên" i]',
    emailInput: 'input[type="email"], input[placeholder*="email" i]',
    passwordInput: 'input[name="password"], input[placeholder="Enter your password"], input[placeholder*="mật khẩu" i]:not([placeholder*="confirm" i])',
    confirmPasswordInput: 'input[placeholder*="confirm" i], input[placeholder*="xác nhận" i], input[type="password"]:nth-of-type(2)',
    registerButton: 'button[type="submit"], button:has-text("Register"), button:has-text("Đăng ký"), button:has-text("Sign up")',
    googleRegisterButton: 'button:has-text("Google"), button:has-text("Continue with Google")',

    // Links and navigation
    loginLink: 'a:has-text("Login"), a:has-text("Sign in"), a:has-text("Đăng nhập"), a:has-text("Already have an account"), a[href*="login"], a[href*="signin"]',
    termsLink: 'a:has-text("Terms"), a:has-text("Điều khoản")',
    privacyLink: 'a:has-text("Privacy"), a:has-text("Bảo mật")',

    // Checkboxes
    termsCheckbox: 'input[type="checkbox"], [data-testid="terms-checkbox"]',
    newsletterCheckbox: 'input[type="checkbox"]:nth-of-type(2), [data-testid="newsletter-checkbox"]',

    // Error messages
    errorMessage: '.text-red-600, .text-red-500, .error-message, [data-testid="error-message"]',
    nameError: '[data-testid="name-error"], .name-error',
    emailError: '[data-testid="email-error"], .email-error',
    passwordError: '[data-testid="password-error"], .password-error',
    confirmPasswordError: '[data-testid="confirm-password-error"], .confirm-password-error',

    // Success messages
    successMessage: '.text-green-600, .text-green-500, .success-message',

    // Loading states
    loadingSpinner: '.animate-spin, .loading-spinner, [data-testid="loading"]',
    registerButtonLoading: 'button[type="submit"]:has(.animate-spin)',

    // Page containers
    registerForm: 'form, [data-testid="register-form"]',
    registerContainer: '[data-testid="register-container"], .register-container'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to register page
   */
  async navigateToRegister(): Promise<void> {
    await this.navigateTo('/auth/register');
    await this.waitForRegisterPageLoad();
  }

  /**
   * Wait for register page to load completely
   */
  async waitForRegisterPageLoad(): Promise<void> {
    await this.waitForElement(this.selectors.registerForm);
    await this.waitForElement(this.selectors.nameInput);
    await this.waitForElement(this.selectors.emailInput);
    await this.waitForElement(this.selectors.passwordInput);
    await this.waitForElement(this.selectors.registerButton);
  }

  /**
   * Fill name field
   */
  async fillName(name: string): Promise<void> {
    await this.fillInput(this.selectors.nameInput, name);
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
   * Fill confirm password field
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.fillInput(this.selectors.confirmPasswordInput, password);
  }

  /**
   * Click register button
   */
  async clickRegisterButton(): Promise<void> {
    await this.clickElement(this.selectors.registerButton);
  }

  /**
   * Perform complete registration
   */
  async register(name: string, email: string, password: string): Promise<void> {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);

    // Accept terms if checkbox exists
    if (await this.elementExists(this.selectors.termsCheckbox)) {
      await this.checkTermsAndConditions();
    }

    await this.clickRegisterButton();
    await this.waitForRegistrationCompletion();
  }

  /**
   * Check terms and conditions checkbox
   */
  async checkTermsAndConditions(): Promise<void> {
    await this.page.check(this.selectors.termsCheckbox);
  }

  /**
   * Uncheck terms and conditions checkbox
   */
  async uncheckTermsAndConditions(): Promise<void> {
    await this.page.uncheck(this.selectors.termsCheckbox);
  }

  /**
   * Check newsletter subscription checkbox
   */
  async checkNewsletterSubscription(): Promise<void> {
    if (await this.elementExists(this.selectors.newsletterCheckbox)) {
      await this.page.check(this.selectors.newsletterCheckbox);
    }
  }

  /**
   * Click Google register button
   */
  async clickGoogleRegister(): Promise<void> {
    await this.clickElement(this.selectors.googleRegisterButton);
  }

  /**
   * Click login link
   */
  async clickLoginLink(): Promise<void> {
    await this.clickElement(this.selectors.loginLink);
  }

  /**
   * Click terms of service link
   */
  async clickTermsLink(): Promise<void> {
    await this.clickElement(this.selectors.termsLink);
  }

  /**
   * Click privacy policy link
   */
  async clickPrivacyLink(): Promise<void> {
    await this.clickElement(this.selectors.privacyLink);
  }

  /**
   * Wait for registration completion
   */
  async waitForRegistrationCompletion(): Promise<void> {
    try {
      // Wait for either redirect to dashboard, email verification, or success message
      await Promise.race([
        this.page.waitForURL('**/dashboard', { timeout: 10000 }),
        this.page.waitForURL('**/verify-email', { timeout: 10000 }),
        this.waitForElement(this.selectors.successMessage, 10000),
        this.page.waitForLoadState('networkidle', { timeout: 10000 })
      ]);
    } catch (error) {
      console.log('Registration completion check failed, checking for errors...');
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
   * Get name error message
   */
  async getNameError(): Promise<string> {
    try {
      return await this.getText(this.selectors.nameError);
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
   * Get confirm password error message
   */
  async getConfirmPasswordError(): Promise<string> {
    try {
      return await this.getText(this.selectors.confirmPasswordError);
    } catch {
      return '';
    }
  }

  /**
   * Check if register button is loading
   */
  async isRegisterButtonLoading(): Promise<boolean> {
    return await this.elementExists(this.selectors.registerButtonLoading);
  }

  /**
   * Check if page is in loading state
   */
  async isPageLoading(): Promise<boolean> {
    return await this.elementExists(this.selectors.loadingSpinner);
  }

  /**
   * Clear registration form
   */
  async clearForm(): Promise<void> {
    await this.fillInput(this.selectors.nameInput, '');
    await this.fillInput(this.selectors.emailInput, '');
    await this.fillInput(this.selectors.passwordInput, '');
    await this.fillInput(this.selectors.confirmPasswordInput, '');

    if (await this.elementExists(this.selectors.termsCheckbox)) {
      await this.uncheckTermsAndConditions();
    }
  }

  /**
   * Check if registration was successful
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    try {
      const currentURL = await this.getCurrentURL();
      return currentURL.includes('/dashboard') ||
             currentURL.includes('/verify-email') ||
             await this.elementExists(this.selectors.successMessage);
    } catch {
      return false;
    }
  }

  /**
   * Check if registration failed
   */
  async isRegistrationFailed(): Promise<boolean> {
    return await this.elementExists(this.selectors.errorMessage);
  }

  /**
   * Get current form values
   */
  async getFormValues(): Promise<{ name: string; email: string; password: string; confirmPassword: string }> {
    const name = await this.page.inputValue(this.selectors.nameInput);
    const email = await this.page.inputValue(this.selectors.emailInput);
    const password = await this.page.inputValue(this.selectors.passwordInput);
    const confirmPassword = await this.page.inputValue(this.selectors.confirmPasswordInput);

    return { name, email, password, confirmPassword };
  }

  /**
   * Validate required fields
   */
  async validateRequiredFields(): Promise<boolean> {
    const values = await this.getFormValues();
    return !!(values.name && values.email && values.password && values.confirmPassword);
  }

  /**
   * Check password strength requirements
   */
  async checkPasswordRequirements(): Promise<{ minLength: boolean; hasNumber: boolean; hasSpecial: boolean }> {
    const password = await this.page.inputValue(this.selectors.passwordInput);

    return {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  /**
   * Take screenshot of register page
   */
  async takeRegisterScreenshot(filename: string = 'register-page'): Promise<void> {
    await this.takeScreenshot(filename);
  }

  /**
   * Validate register page elements are present
   */
  async validatePageElements(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        this.elementExists(this.selectors.nameInput),
        this.elementExists(this.selectors.emailInput),
        this.elementExists(this.selectors.passwordInput),
        this.elementExists(this.selectors.confirmPasswordInput),
        this.elementExists(this.selectors.registerButton),
        this.elementExists(this.selectors.loginLink)
      ]);

      return checks.every(check => check === true);
    } catch {
      return false;
    }
  }
}
