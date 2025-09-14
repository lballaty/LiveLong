import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:11000';

test.describe('"Start Here" from Preview List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should start the session from the selected exercise', async ({ page }) => {
    // 1. Find a specific exercise in the preview list that is not the first one.
    // We'll use "Towel Twist" which is the second exercise (index 1).
    const towelTwistPreview = page.locator('li[data-index="1"]');
    await expect(towelTwistPreview).toContainText('Towel Twist — Taoru Shibori');

    // 2. Click the exercise in the preview list to start the session.
    await towelTwistPreview.click();

    // 3. Verify the session view is now visible.
    await expect(page.locator('#session-view')).toBeVisible();

    // 4. Check that the "Get Ready..." screen correctly shows the selected exercise as "Next".
    await expect(page.getByRole('heading', { name: 'Get Ready...' })).toBeVisible();
    await expect(page.getByText('Next: Towel Twist — Taoru Shibori')).toBeVisible();

    // 5. Wait for the prepare countdown to finish and verify the session has started on the correct exercise.
    const exerciseTitle = page.locator('#ex-title');
    await expect(exerciseTitle).toHaveText('Towel Twist — Taoru Shibori', { timeout: 6000 });
  });
});