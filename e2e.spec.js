import { test, expect } from '@playwright/test';

// Use a constant for the URL to make it easy to update if the port changes.
// This port should match the DEFAULT_PORT in your ./scripts/start.sh script.
const APP_URL = 'http://localhost:11000';

test.describe('LiveLong Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Before each test, navigate to the app.
    await page.goto(APP_URL);
  });

  test('should load the home page, start a session, and handle pause/resume', async ({ page }) => {
    // 1. Check that the home page is loaded correctly.
    await expect(page.getByRole('heading', { name: 'Japanese Longevity Exercises' })).toBeVisible();
    const startButton = page.getByRole('button', { name: 'Start Session' });
    await expect(startButton).toBeVisible();

    // 2. Click the "Start Session" button.
    await startButton.click();

    // 3. Verify the session view is now visible and the home view is hidden.
    await expect(page.locator('#session-view')).toBeVisible();
    await expect(page.locator('#home-view')).toBeHidden();

    // 4. Check for the "Get Ready..." state for the first exercise.
    await expect(page.getByRole('heading', { name: 'Get Ready...' })).toBeVisible();
    await expect(page.getByText('Next: Breathing — Kokyū Taiso')).toBeVisible();

    // 5. Wait for the prepare state to finish (default is 5s) and the first exercise to start.
    // We'll give it a slightly longer timeout to be safe.
    await expect(page.getByRole('heading', { name: 'Breathing — Kokyū Taiso' })).toBeVisible({ timeout: 6000 });

    // 6. Test the pause and resume functionality.
    const playPauseButton = page.getByLabel('Pause');
    await expect(playPauseButton).toBeEnabled();

    // Pause the session
    await playPauseButton.click();
    await expect(page.locator('#paused-overlay')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();

    // The button's accessible name should now be "Play"
    const resumeButton = page.getByLabel('Play');
    await expect(resumeButton).toBeVisible();

    // Resume the session
    await resumeButton.click();
    await expect(page.locator('#paused-overlay')).toBeHidden();
    await expect(page.getByLabel('Pause')).toBeVisible(); // Check that it's back to a pause button
  });
});