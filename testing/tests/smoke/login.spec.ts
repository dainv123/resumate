import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/auth/LoginPage';
import { RegisterPage } from '../../src/pages/auth/RegisterPage';
import { TestDataManager } from '../../src/utils/test-data-manager';

test.describe('Authentication - Smoke Tests', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeAll(async () => {
    // Load test data
    await TestDataManager.loadAllTestData();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  test('should load login page successfully', async ({ page }) => {
    // Act
    await loginPage.navigateToLogin();

    // Assert
    await expect(page).toHaveURL(/.*login/);
    expect(await loginPage.validatePageElements()).toBe(true);
  });

  test('should load register page successfully', async ({ page }) => {
    // Act
    await registerPage.navigateToRegister();

    // Assert
    await expect(page).toHaveURL(/.*register/);
    expect(await registerPage.validatePageElements()).toBe(true);
  });

  test('should navigate from login to register page', async ({ page }) => {
    // Arrange
    await loginPage.navigateToLogin();

    // Act
    await loginPage.clickRegisterLink();

    // Assert
    await expect(page).toHaveURL(/.*register/);
  });

  test('should navigate from register to login page', async ({ page }) => {
    // Arrange
    await registerPage.navigateToRegister();

    // Act
    await registerPage.clickLoginLink();

    // Assert
    await expect(page).toHaveURL(/.*login/);
  });

  test('should validate login form inputs', async () => {
    // Arrange
    await loginPage.navigateToLogin();
    const testUser = TestDataManager.getRandomUser();

    // Act
    await loginPage.fillEmail(testUser.email);
    await loginPage.fillPassword(testUser.password);

    // Assert
    const formValues = await loginPage.getFormValues();
    expect(formValues.email).toBe(testUser.email);
    expect(formValues.password).toBe(testUser.password);
  });

  test('should validate register form inputs', async () => {
    // Arrange
    await registerPage.navigateToRegister();
    const testUser = TestDataManager.getRandomUser();

    // Act
    await registerPage.fillName(testUser.name);
    await registerPage.fillEmail(testUser.email);
    await registerPage.fillPassword(testUser.password);
    await registerPage.fillConfirmPassword(testUser.password);

    // Assert
    const formValues = await registerPage.getFormValues();
    expect(formValues.name).toBe(testUser.name);
    expect(formValues.email).toBe(testUser.email);
    expect(formValues.password).toBe(testUser.password);
    expect(formValues.confirmPassword).toBe(testUser.password);
  });

  test('should handle invalid login gracefully', async ({ page }) => {
    // Act
    await loginPage.navigateToLogin();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Assert - Should not crash, should show error or stay on login page
    const currentURL = page.url();
    expect(currentURL).toMatch(/login|auth/);
  });

  test('should handle invalid registration gracefully', async ({ page }) => {
    // Act
    await registerPage.navigateToRegister();
    await registerPage.register('', 'invalid-email', 'short', 'short');

    // Assert - Should not crash, should show validation errors
    const currentURL = page.url();
    expect(currentURL).toMatch(/register|auth/);
  });
});
