import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:11000';

test.describe('Application Smoke Test', () => {
  test('should load the home page and display the main start button', async ({ page }) => {
    // 1. Navigate to the application's URL.
    await page.goto(APP_URL);

    // 2. Check that the main heading is visible.
    await expect(page.getByRole('heading', { name: 'Japanese Longevity Exercises' })).toBeVisible();

    // 3. Verify the primary "Start Session" button is present. This is a great check to see if the app initialized.
    await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible();
  });
});