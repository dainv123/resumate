const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/auth/LoginPage');
const { RegisterPage } = require('../pages/auth/RegisterPage');
const { TestDataManager } = require('../utils/test-data-manager');

// Background step
Given('I am on the Resumate application', async function () {
  // Ensure we're on the correct base URL
  await this.context.page.goto(process.env.BASE_URL || 'http://localhost:5006');
});

// Login page navigation
Given('I am on the login page', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.navigateToLogin();
});

Given('I am on the registration page', async function () {
  const registerPage = new RegisterPage(this.context.page);
  await registerPage.navigateToRegister();
});

// Form interactions
When('I enter valid email and password', async function () {
  const loginPage = new LoginPage(this.context.page);
  const testUser = TestDataManager.getRandomUser();

  await loginPage.fillEmail(testUser.email);
  await loginPage.fillPassword(testUser.password);

  // Store user for later verification
  this.context.setTestUser(testUser);
});

When('I enter a valid email', async function () {
  const loginPage = new LoginPage(this.context.page);
  const testUser = TestDataManager.getRandomUser();
  await loginPage.fillEmail(testUser.email);
});

When('I enter an invalid email format', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.fillEmail('invalid-email-format');
});

When('I enter an incorrect password', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.fillPassword('wrongpassword123!');
});

When('I enter a valid password', async function () {
  const loginPage = new LoginPage(this.context.page);
  const testUser = TestDataManager.getRandomUser();
  await loginPage.fillPassword(testUser.password);
});

// Button clicks
When('I click the login button', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.clickLoginButton();
});

When('I click the {string} link', async function (linkText: string) {
  if (linkText === 'Register') {
    const loginPage = new LoginPage(this.context.page);
    await loginPage.clickRegisterLink();
  } else if (linkText === 'Login') {
    const registerPage = new RegisterPage(this.context.page);
    await registerPage.clickLoginLink();
  }
});

When('I click the login button without entering credentials', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.clickLoginButton();
});

// Navigation assertions
Then('I should be redirected to the dashboard', async function () {
  await this.context.page.waitForURL('**/dashboard', { timeout: 10000 });
  const currentURL = this.context.getCurrentURL();
  expect(currentURL).toMatch(/dashboard/);
});

Then('I should be redirected to the registration page', async function () {
  await this.context.page.waitForURL('**/register', { timeout: 5000 });
  const currentURL = this.context.getCurrentURL();
  expect(currentURL).toMatch(/register/);
});

Then('I should be redirected to the login page', async function () {
  await this.context.page.waitForURL('**/login', { timeout: 5000 });
  const currentURL = this.context.getCurrentURL();
  expect(currentURL).toMatch(/login/);
});

// Account verification
Then('I should see my account information', async function () {
  // Wait for dashboard to load
  await this.context.page.waitForLoadState('networkidle');

  // Check for common dashboard elements
  const dashboardElements = [
    'text="Welcome"',
    '[data-testid="user-menu"]',
    'text="Dashboard"',
    'text="My CV"'
  ];

  for (const element of dashboardElements) {
    const isVisible = await this.context.page.locator(element).isVisible().catch(() => false);
    if (isVisible) {
      return; // Found at least one dashboard element
    }
  }

  // If no dashboard elements found, fail the test
  throw new Error('Dashboard elements not found after login');
});

// Validation error assertions
Then('I should see validation errors for required fields', async function () {
  const loginPage = new LoginPage(this.context.page);

  const emailError = await loginPage.getEmailError();
  const passwordError = await loginPage.getPasswordError();

  // At least one validation error should be present
  expect(emailError || passwordError).toBeTruthy();
});

Then('I should see an email validation error', async function () {
  const loginPage = new LoginPage(this.context.page);
  const emailError = await loginPage.getEmailError();
  expect(emailError).toBeTruthy();
  expect(emailError.toLowerCase()).toMatch(/email|valid|format/);
});

Then('I should see an authentication error message', async function () {
  const loginPage = new LoginPage(this.context.page);

  // Check for various error message patterns
  const errorSelectors = [
    '.text-red-600',
    '.text-red-500',
    '[data-testid="error-message"]',
    '.error-message'
  ];

  let errorFound = false;
  for (const selector of errorSelectors) {
    const errorElement = this.context.page.locator(selector);
    if (await errorElement.isVisible().catch(() => false)) {
      const errorText = await errorElement.textContent();
      if (errorText && (errorText.toLowerCase().includes('invalid') ||
                       errorText.toLowerCase().includes('wrong') ||
                       errorText.toLowerCase().includes('incorrect'))) {
        errorFound = true;
        break;
      }
    }
  }

  expect(errorFound).toBe(true);
});

// UI element verification
Then('I should see the login form with email and password fields', async function () {
  const loginPage = new LoginPage(this.context.page);
  const isValid = await loginPage.validatePageElements();
  expect(isValid).toBe(true);
});

Then('I should see the login button', async function () {
  const loginPage = new LoginPage(this.context.page);
  const loginButton = this.context.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Đăng nhập")');
  await expect(loginButton).toBeVisible();
});

Then('I should see the {string} link', async function (linkText: string) {
  const linkSelector = `a:has-text("${linkText}")`;
  const link = this.context.page.locator(linkSelector);
  await expect(link).toBeVisible();
});

Then('I should see the Google login option', async function () {
  const googleButton = this.context.page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
  await expect(googleButton).toBeVisible();
});

Then('I should see the registration form', async function () {
  const registerPage = new RegisterPage(this.context.page);
  const isValid = await registerPage.validatePageElements();
  expect(isValid).toBe(true);
});

Then('I should see name, email, password, and confirm password fields', async function () {
  const registerPage = new RegisterPage(this.context.page);

  const nameField = this.context.page.locator('input[type="text"], input[placeholder*="name" i]');
  const emailField = this.context.page.locator('input[type="email"]');
  const passwordField = this.context.page.locator('input[type="password"]');
  const confirmPasswordField = this.context.page.locator('input[placeholder*="confirm" i]');

  await expect(nameField).toBeVisible();
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();
  await expect(confirmPasswordField).toBeVisible();
});

Then('I should see the terms and conditions checkbox', async function () {
  const termsCheckbox = this.context.page.locator('input[type="checkbox"]');
  await expect(termsCheckbox).toBeVisible();
});

Then('I should see the registration button', async function () {
  const registerButton = this.context.page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Đăng ký")');
  await expect(registerButton).toBeVisible();
});

Then('I should see the Google registration option', async function () {
  const googleButton = this.context.page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
  await expect(googleButton).toBeVisible();
});

// Keyboard navigation
When('I use Tab key to navigate through form fields', async function () {
  // Press Tab multiple times to navigate through form
  for (let i = 0; i < 5; i++) {
    await this.context.page.keyboard.press('Tab');
    await this.context.page.waitForTimeout(100); // Small delay for visual feedback
  }
});

Then('all form elements should be accessible via keyboard', async function () {
  // Check that some element has focus (indicating keyboard navigation works)
  const activeElement = await this.context.page.evaluate(() => document.activeElement?.tagName);
  expect(activeElement).toBeTruthy();
});

Then('I should be able to submit the form with Enter key', async function () {
  // Focus on password field first
  const passwordField = this.context.page.locator('input[type="password"]').first();
  await passwordField.focus();

  // Press Enter
  await this.context.page.keyboard.press('Enter');

  // Should trigger form submission (either success or validation)
  await this.context.page.waitForLoadState('networkidle');
});

// Mobile-specific scenarios
Given('I am on the login page using a mobile device', async function () {
  // Set mobile viewport
  await this.context.page.setViewportSize({ width: 375, height: 667 });

  const loginPage = new LoginPage(this.context.page);
  await loginPage.navigateToLogin();
});

Then('the login form should be properly sized for mobile', async function () {
  const form = this.context.page.locator('form, [data-testid="login-form"]');
  await expect(form).toBeVisible();

  // Check that form elements are not too small for touch
  const inputs = this.context.page.locator('input');
  const inputCount = await inputs.count();

  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const boundingBox = await input.boundingBox();
    if (boundingBox) {
      // Touch targets should be at least 44px
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    }
  }
});

Then('all elements should be touch-friendly', async function () {
  // Check buttons are large enough for touch
  const buttons = this.context.page.locator('button');
  const buttonCount = await buttons.count();

  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const boundingBox = await button.boundingBox();
    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
    }
  }
});

Then('the form should scroll properly on small screens', async function () {
  // Try to scroll down
  await this.context.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Check if we can still see form elements
  const loginButton = this.context.page.locator('button[type="submit"]');
  await expect(loginButton).toBeVisible();
});
