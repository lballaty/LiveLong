// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/profiles/profile-manager.spec.ts
// Description: E2E tests for UnifiedProfileManager in the Practices view
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with 4-view UnifiedTimerDisplay and UnifiedProfileManager

import { test, expect } from '@playwright/test';

test.describe('Profile Manager (Practices View)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="time-display"]');
    await page.click('nav button:has-text("Routines")');
    await expect(page.locator('h2:has-text("Routines & Timers")')).toBeVisible();
  });

  test.describe('Default Profiles & Filtering', () => {
    test('should display all default practice categories and focus profiles', async ({ page }) => {
      await expect(page.locator('h3:has-text("Japanese Longevity Exercises")')).toBeVisible();
      await expect(page.locator('h3:has-text("Breathing Exercises")')).toBeVisible();
      await expect(page.locator('h3:has-text("Focus & Meditation Timers")')).toBeVisible();

      await expect(page.locator('[data-testid^="profile-simple-"]:has-text("Pomodoro")')).toBeVisible();
      await expect(page.locator('[data-testid^="profile-simple-"]:has-text("Deep Work")')).toBeVisible();
      await expect(page.locator('[data-testid^="profile-simple-"]:has-text("Quick Focus")')).toBeVisible();
      await expect(page.locator('[data-testid^="profile-simple-"]:has-text("Exercise")')).toBeVisible();
      await expect(page.locator('[data-testid^="profile-simple-"]:has-text("Meditation")')).toBeVisible();
    });

    test('should filter practices by category', async ({ page }) => {
      await page.click('button:has-text("Exercises")');
      await expect(page.locator('h3:has-text("Japanese Longevity Exercises")')).toBeVisible();
      await expect(page.locator('h3:has-text("Breathing Exercises")')).not.toBeVisible();
      await expect(page.locator('h3:has-text("Focus & Meditation Timers")')).not.toBeVisible();

      await page.click('button:has-text("Breathing")');
      await expect(page.locator('h3:has-text("Breathing Exercises")')).toBeVisible();
      await expect(page.locator('h3:has-text("Japanese Longevity Exercises")')).not.toBeVisible();

      await page.click('button:has-text("Focus Timers")');
      await expect(page.locator('h3:has-text("Focus & Meditation Timers")')).toBeVisible();
      await expect(page.locator('h3:has-text("Breathing Exercises")')).not.toBeVisible();

      await page.click('button:has-text("All")');
      await expect(page.locator('h3:has-text("Japanese Longevity Exercises")')).toBeVisible();
    });

    test('should select focus profiles and update Practice timer', async ({ page }) => {
      await page.locator('[data-testid^="profile-simple-"]:has-text("Pomodoro")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('25:00');
      await expect(page.locator('h2:has-text("Pomodoro")')).toBeVisible();

      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Deep Work")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('01:30:00');

      await page.click('nav button:has-text("Routines")');
      await page.locator('[data-testid^="profile-simple-"]:has-text("Exercise")').click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('00:30');
    });

    test('should not allow deleting built-in exercise or breathing profiles', async ({ page }) => {
      const rajio = page.locator('[data-testid="profile-rajio-taiso-series"]');
      await expect(rajio.locator('button[aria-label="Delete profile"]')).not.toBeVisible();
    });
  });

  test.describe('Custom Profile Creation, Editing, and Deletion', () => {
    test('should create a custom profile and persist across reloads', async ({ page }) => {
      await page.click('button:has-text("+ Create Custom Timer")');
      await expect(page.locator('h2:has-text("Create Custom Timer")')).toBeVisible();

      const form = page.locator('form');
      await form.locator('input[type="text"]').fill('Study Session');
      await form.locator('textarea').fill('Focused study block');
      const numInputs = form.locator('input[type="number"]');
      await numInputs.nth(0).fill('45');
      await numInputs.nth(1).fill('0');
      await numInputs.nth(2).fill('10');
      await numInputs.nth(3).fill('0');
      await form.locator('button:has-text("📚")').click();
      await form.locator('button[type="submit"]').click();

      const customCard = page.locator('[data-testid^="profile-simple-"]:has-text("Study Session")');
      await expect(customCard).toBeVisible();
      await expect(customCard).toContainText('📚');

      // Select it and verify Practice timer updates to 45:00
      await customCard.click();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('45:00');

      // Reload and verify custom profile persists in Practices
      await page.reload();
      await page.click('nav button:has-text("Routines")');
      await expect(page.locator('[data-testid^="profile-simple-"]:has-text("Study Session")')).toBeVisible();
    });

    test('should cancel custom profile creation', async ({ page }) => {
      await page.click('button:has-text("+ Create Custom Timer")');
      await page.locator('form input[type="text"]').fill('Cancelled Timer');
      await page.click('form button:has-text("Cancel")');

      await expect(page.locator('h2:has-text("Create Custom Timer")')).not.toBeVisible();
      await expect(page.locator('text=Cancelled Timer')).not.toBeVisible();
    });

    test('should edit and delete a custom profile', async ({ page }) => {
      await page.click('button:has-text("+ Create Custom Timer")');
      const form = page.locator('form');
      await form.locator('input[type="text"]').fill('Original Custom');
      await form.locator('button[type="submit"]').click();

      const customCard = page.locator('[data-testid^="profile-simple-"]:has-text("Original Custom")');
      await customCard.locator('button[aria-label="Edit profile"]').click();

      await expect(page.locator('h2:has-text("Edit Timer: Original Custom")')).toBeVisible();
      await page.fill('input[name="name"]', 'Updated Custom');
      await page.fill('input[name="workMinutes"]', '30');
      await page.click('button:has-text("Save Changes")');

      const updatedCard = page.locator('[data-testid^="profile-simple-"]:has-text("Updated Custom")');
      await expect(updatedCard).toBeVisible();

      await updatedCard.locator('button[aria-label="Delete profile"]').click();
      await expect(page.locator('text=Updated Custom')).not.toBeVisible();
    });
  });
});
