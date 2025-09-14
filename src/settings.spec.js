import { test, expect } from '@playwright/test';

// Use a constant for the URL to make it easy to update if the port changes.
// This port should match the DEFAULT_PORT in your ./scripts/start.sh script.
const APP_URL = 'http://localhost:11000';

test.describe('Settings Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto(APP_URL);
    // Clear localStorage to ensure a clean state for each test
    await page.evaluate(() => localStorage.clear());
    // Reload to apply cleared storage and default preferences
    await page.reload();
  });

  test('should toggle pill settings and persist to localStorage', async ({ page }) => {
    const musicToggle = page.getByRole('button', { name: 'Toggle Music' });
    const musicKey = 'LL_music';

    // 1. Check initial state (should be off by default after clearing storage)
    await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');

    // 2. Click to turn on
    await musicToggle.click();
    await expect(musicToggle).toHaveAttribute('aria-pressed', 'true');
    const musicPrefOn = await page.evaluate((key) => localStorage.getItem(key), musicKey);
    expect(musicPrefOn).toBe('true');

    // 3. Click to turn off
    await musicToggle.click();
    await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');
    const musicPrefOff = await page.evaluate((key) => localStorage.getItem(key), musicKey);
    expect(musicPrefOff).toBe('false');
  });

  test('should change segmented control settings and persist to localStorage', async ({ page }) => {
    const prepareTimeContainer = page.locator('#prepare-time');
    const button5s = prepareTimeContainer.getByRole('button', { name: '5s' });
    const button10s = prepareTimeContainer.getByRole('button', { name: '10s' });
    const prepareTimeKey = 'LL_prepareTime';

    // 1. Check initial state (5s should be default)
    await expect(button5s).toHaveAttribute('aria-pressed', 'true');
    await expect(button10s).toHaveAttribute('aria-pressed', 'false');

    // 2. Click 10s
    await button10s.click();
    await expect(button5s).toHaveAttribute('aria-pressed', 'false');
    await expect(button10s).toHaveAttribute('aria-pressed', 'true');
    const prepareTimePref = await page.evaluate((key) => localStorage.getItem(key), prepareTimeKey);
    expect(prepareTimePref).toBe('10');
  });

  test('should apply text size class to body and persist on reload', async ({ page }) => {
    const textSizeContainer = page.locator('#text-size');
    const button150 = textSizeContainer.getByRole('button', { name: '150%' });
    const body = page.locator('body');

    // 1. Check initial state
    await expect(body).not.toHaveClass(/text-150/);

    // 2. Click 150%
    await button150.click();
    await expect(body).toHaveClass(/text-150/);

    // 3. Reload and check for persistence
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/text-150/);
  });
});