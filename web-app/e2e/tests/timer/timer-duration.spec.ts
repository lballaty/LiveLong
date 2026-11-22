// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/timer/timer-duration.spec.ts
// Description: E2E tests for practice duration selection, custom durations, and time formatting
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with UnifiedTimerDisplay Practices view and custom timer creation

import { test, expect } from '@playwright/test';

async function createAndSelectCustomTimer(
  page: import('@playwright/test').Page,
  name: string,
  workMinutes: number,
  workSeconds: number
) {
  await page.click('nav button:has-text("Routines")');
  await page.click('button:has-text("+ Create Custom Timer")');

  const form = page.locator('form');
  await form.locator('input[type="text"]').fill(name);
  const numInputs = form.locator('input[type="number"]');
  await numInputs.nth(0).fill(String(workMinutes));
  await numInputs.nth(1).fill(String(workSeconds));
  await numInputs.nth(2).fill('0');
  await numInputs.nth(3).fill('0');
  await form.locator('button[type="submit"]').click();

  await page.locator(`[data-testid^="profile-simple-"]:has-text("${name}")`).click();
}

test.describe('Timer Duration Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test.describe('Built-in Practice Durations', () => {
    test('should show Rajio Taiso default warmup of 00:30 on load', async ({ page }) => {
      expect(await page.textContent('[data-testid="time-display"]')).toBe('00:30');
    });

    test('should set timer to 15:00 for Quick Focus, 10:00 for Meditation, and 25:00 for Pomodoro', async ({ page }) => {
      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Quick Focus")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('15:00');

      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Meditation")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('10:00');

      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Pomodoro")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('25:00');
    });

    test('should display HH:MM:SS format for Deep Work (90 minutes)', async ({ page }) => {
      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Deep Work")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('01:30:00');
    });
  });

  test.describe('Custom Duration Creation & Formatting', () => {
    test('should set custom duration with minutes and seconds (02:30)', async ({ page }) => {
      await createAndSelectCustomTimer(page, 'Custom 2m30s', 2, 30);
      expect(await page.textContent('[data-testid="time-display"]')).toBe('02:30');
    });

    test('should set custom duration with seconds only (00:45)', async ({ page }) => {
      await createAndSelectCustomTimer(page, 'Custom 45s', 0, 45);
      expect(await page.textContent('[data-testid="time-display"]')).toBe('00:45');
    });

    test('should format durations over 60 minutes as HH:MM:SS (01:15:30)', async ({ page }) => {
      await createAndSelectCustomTimer(page, 'Custom 75m30s', 75, 30);
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('01:15:30');
    });

    test('should cancel custom timer creation without changing active duration', async ({ page }) => {
      const initialTime = await page.textContent('[data-testid="time-display"]');
      await page.click('nav button:has-text("Routines")');
      await page.click('button:has-text("+ Create Custom Timer")');
      await page.locator('form input[type="text"]').fill('Ignored');
      await page.click('form button:has-text("Cancel")');

      await page.click('nav button:has-text("Session")');
      expect(await page.textContent('[data-testid="time-display"]')).toBe(initialTime);
    });
  });

  test.describe('Switching Duration After Stopping Timer', () => {
    test('should allow switching practice after stopping an active timer', async ({ page }) => {
      await page.click('[data-testid="start-focus-button"]');
      await page.waitForTimeout(1000);
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-button"]');

      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Pomodoro")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('25:00');
    });
  });
});
