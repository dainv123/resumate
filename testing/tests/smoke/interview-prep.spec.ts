import { test, expect } from '@playwright/test';

test.describe('Interview Prep smoke @smoke', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('interview prep route redirects unauthenticated users to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/interview-prep');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
