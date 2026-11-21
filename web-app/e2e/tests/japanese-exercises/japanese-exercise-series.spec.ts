// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/japanese-exercises/japanese-exercise-series.spec.ts
// Description: E2E tests for Japanese longevity exercise series in UnifiedTimerDisplay
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with 4-view UnifiedTimerDisplay and ExerciseAnimationPlayer

import { test, expect } from '@playwright/test';

test.describe('Japanese Exercise Series', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
    await page.click('nav button:has-text("Practices")');
    await page.waitForSelector('[data-testid="profile-rajio-taiso-series"]');
  });

  test.describe('Japanese Exercise Profile Visibility', () => {
    test('should display all Japanese exercise profiles', async ({ page }) => {
      await expect(page.locator('[data-testid="profile-rajio-taiso-series"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-tai-chi-morning-series"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-shinrin-yoku-series"]')).toBeVisible();
    });

    test('should display correct Japanese icons, names, and durations', async ({ page }) => {
      const rajioProfile = page.locator('[data-testid="profile-rajio-taiso-series"]');
      await expect(rajioProfile).toContainText('📻');
      await expect(rajioProfile).toContainText('Rajio Taiso Complete Series');
      await expect(rajioProfile).toContainText('Traditional Japanese radio calisthenics');
      await expect(rajioProfile).toContainText('8m 15s');
      await expect(rajioProfile).toContainText('6 steps');

      const taiChiProfile = page.locator('[data-testid="profile-tai-chi-morning-series"]');
      await expect(taiChiProfile).toContainText('☯️');
      await expect(taiChiProfile).toContainText('Tai Chi Morning Flow');
      await expect(taiChiProfile).toContainText('17min');
      await expect(taiChiProfile).toContainText('5 steps');

      const shinrinProfile = page.locator('[data-testid="profile-shinrin-yoku-series"]');
      await expect(shinrinProfile).toContainText('🌲');
      await expect(shinrinProfile).toContainText('Shinrin-yoku Practice');
      await expect(shinrinProfile).toContainText('26min');
      await expect(shinrinProfile).toContainText('4 steps');
    });

    test('should show correct warmup durations when selected', async ({ page }) => {
      await page.click('[data-testid="profile-rajio-taiso-series"]');
      expect(await page.textContent('[data-testid="time-display"]')).toBe('00:30');

      await page.click('nav button:has-text("Practices")');
      await page.click('[data-testid="profile-tai-chi-morning-series"]');
      expect(await page.textContent('[data-testid="time-display"]')).toBe('01:00');

      await page.click('nav button:has-text("Practices")');
      await page.click('[data-testid="profile-shinrin-yoku-series"]');
      expect(await page.textContent('[data-testid="time-display"]')).toBe('02:00');
    });
  });

  test.describe('Japanese Exercise Series Integration', () => {
    test('should start Rajio Taiso series with animation player and step list', async ({ page }) => {
      await page.click('[data-testid="profile-rajio-taiso-series"]');

      await expect(page.locator('strong:has-text("Rajio Taiso Complete Series")')).toBeVisible();
      await expect(page.locator('[data-testid="exercise-animation-player"]')).toBeVisible();
      await expect(page.locator('text=Step 1 of 6')).toBeVisible();
      await expect(page.locator('text=Up next: Arm Swings')).toBeVisible();

      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.waitForTimeout(1500);
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).not.toBe('00:30');
    });

    test('should handle exercise pause, resume, and stop', async ({ page }) => {
      await page.click('[data-testid="profile-shinrin-yoku-series"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.click('[data-testid="pause-button"]');
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

      await page.click('[data-testid="resume-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.click('[data-testid="stop-button"]');
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
      expect(await page.textContent('[data-testid="time-display"]')).toBe('02:00');
    });

    test('should switch posture variant and camera views in animation player', async ({ page }) => {
      await page.click('nav button:has-text("Settings")');
      await page.click('button:has-text("Chair-Based")');
      await page.click('button:has-text("Front + Side")');

      await page.click('nav button:has-text("Practice")');
      const player = page.locator('[data-testid="exercise-animation-player"]');
      await expect(player).toContainText('Chair');
      await expect(player).toContainText('front view');
      await expect(player).toContainText('side view');
    });

    test('should handle rapid profile switching between Japanese exercises', async ({ page }) => {
      await page.click('[data-testid="profile-rajio-taiso-series"]');
      await page.click('nav button:has-text("Practices")');
      await page.click('[data-testid="profile-tai-chi-morning-series"]');
      await page.click('nav button:has-text("Practices")');
      await page.click('[data-testid="profile-shinrin-yoku-series"]');

      expect(await page.textContent('[data-testid="time-display"]')).toBe('02:00');
      await expect(page.locator('strong:has-text("Shinrin-yoku Practice")')).toBeVisible();
    });
  });

  test.describe('Japanese Exercise Mobile Compatibility', () => {
    test('should work correctly on mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.click('nav button:has-text("Practices")');

      await expect(page.locator('[data-testid="profile-rajio-taiso-series"]')).toBeVisible();
      await page.click('[data-testid="profile-tai-chi-morning-series"]');

      expect(await page.textContent('[data-testid="time-display"]')).toBe('01:00');
      await expect(page.locator('[data-testid="exercise-animation-player"]')).toBeVisible();
    });
  });
});
