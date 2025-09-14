import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:11000';

test.describe('Breathing Pacer Functionality', () => {
  test('should display the pacer and update its phase text', async ({ page }) => {
    await page.goto(APP_URL);

    // 1. Start the session to get to the first exercise.
    await page.getByRole('button', { name: 'Start Session' }).click();

    // 2. Wait for the "Get Ready..." screen to pass.
    await expect(page.getByRole('heading', { name: 'Breathing — Kokyū Taiso' })).toBeVisible({ timeout: 6000 });

    // 3. Verify the breathing pacer card is now visible.
    const pacerCard = page.locator('#breathing-card');
    await expect(pacerCard).toBeVisible();

    // 4. Check that the initial phase is "Inhale".
    const phaseText = pacerCard.locator('#breath-phase');
    await expect(phaseText).toHaveText('Inhale');

    // 5. Wait for the inhale phase to complete (default is 4 seconds) and check for the "Exhale" phase.
    // We use a slightly longer timeout to account for timing variations.
    await expect(phaseText).toHaveText('Exhale', { timeout: 5000 });

    // 6. (Optional) Check that the animation is running.
    const breathCircle = pacerCard.locator('#breath-circle');
    await expect(breathCircle).toHaveCSS('animation-play-state', 'running');
  });
});