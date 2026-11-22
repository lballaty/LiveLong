// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/breathing/breathing-visualizer.spec.ts
// Description: E2E tests for embedded BreathingVisualizer and breathing practices in UnifiedTimerDisplay
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with 4-view UnifiedTimerDisplay and embedded BreathingVisualizer

import { test, expect } from '@playwright/test';

test.describe('Breathing Visualizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
    await page.click('nav button:has-text("Routines")');
    await page.waitForSelector('[data-testid="profile-box-breathing-profile"]');
  });

  test.describe('Breathing Profile Visibility', () => {
    test('should display all breathing pattern profiles', async ({ page }) => {
      await expect(page.locator('[data-testid="profile-box-breathing-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-4-7-8-breathing-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-wim-hof-breathing-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-deep-breathing-profile"]')).toBeVisible();
    });

    test('should display correct breathing icons, descriptions, and cycles', async ({ page }) => {
      const boxProfile = page.locator('[data-testid="profile-box-breathing-profile"]');
      await expect(boxProfile).toContainText('🫁');
      await expect(boxProfile).toContainText('Box Breathing');
      await expect(boxProfile).toContainText('Navy SEAL technique');
      await expect(boxProfile).toContainText('8 cycles');

      const breathing478Profile = page.locator('[data-testid="profile-4-7-8-breathing-profile"]');
      await expect(breathing478Profile).toContainText('4-7-8 Relaxation');
      await expect(breathing478Profile).toContainText('natural tranquilizer');
      await expect(breathing478Profile).toContainText('6 cycles');

      const deepProfile = page.locator('[data-testid="profile-deep-breathing-profile"]');
      await expect(deepProfile).toContainText('Deep Breathing');
      await expect(deepProfile).toContainText('Simple deep breathing');
      await expect(deepProfile).toContainText('10 cycles');
    });

    test('should show correct initial phase durations when selected', async ({ page }) => {
      await page.click('[data-testid="profile-box-breathing-profile"]');
      await expect(page.locator('[data-testid="breathing-visualizer"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-display"]')).toHaveText('4s');
      await expect(page.locator('[data-testid="breathing-visualizer"]')).toContainText('Cycle 1 of 8');

      await page.click('nav button:has-text("Routines")');
      await page.click('[data-testid="profile-deep-breathing-profile"]');
      await expect(page.locator('[data-testid="time-display"]')).toHaveText('6s');
      await expect(page.locator('[data-testid="breathing-visualizer"]')).toContainText('Cycle 1 of 10');
    });
  });

  test.describe('Breathing Visualizer Launch & Phases', () => {
    test('should display embedded breathing visualizer for Box Breathing', async ({ page }) => {
      await page.click('[data-testid="profile-box-breathing-profile"]');

      const visualizer = page.locator('[data-testid="breathing-visualizer"]');
      await expect(visualizer).toBeVisible();
      await expect(visualizer).toContainText('Breathe In');
      await expect(visualizer).toContainText('Cycle 1 of 8');

      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    });

    test('should advance breathing phases during Box Breathing', async ({ page }) => {
      await page.click('[data-testid="profile-box-breathing-profile"]');
      await page.click('[data-testid="start-focus-button"]');

      const visualizer = page.locator('[data-testid="breathing-visualizer"]');
      await expect(visualizer).toContainText('Breathe In');

      // Wait for 4s inhale phase to transition to hold-in ("Hold")
      await expect(visualizer).toContainText('Hold', { timeout: 6500 });
    });

    test('should use square style for Box Breathing and circle style for Deep Breathing', async ({ page }) => {
      await page.click('[data-testid="profile-box-breathing-profile"]');
      const boxShape = page.locator('[data-testid="breathing-visualizer"] div.border-8').first();
      await expect(boxShape).toBeVisible();
      await expect(boxShape).not.toHaveClass(/rounded-full/);

      await page.click('nav button:has-text("Routines")');
      await page.click('[data-testid="profile-deep-breathing-profile"]');
      const circleShape = page.locator('[data-testid="breathing-visualizer"] div.border-8').first();
      await expect(circleShape).toBeVisible();
      await expect(circleShape).toHaveClass(/rounded-full/);
    });
  });

  test.describe('Breathing Visualizer Interactions', () => {
    test('should pause, resume, and stop breathing session', async ({ page }) => {
      await page.click('[data-testid="profile-wim-hof-breathing-profile"]');
      await page.click('[data-testid="start-focus-button"]');

      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
      await page.click('[data-testid="pause-button"]');
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

      const pausedTime = await page.textContent('[data-testid="time-display"]');
      await page.waitForTimeout(1100);
      expect(await page.textContent('[data-testid="time-display"]')).toBe(pausedTime);

      await page.click('[data-testid="resume-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.click('[data-testid="stop-button"]');
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-display"]')).toHaveText('2s');
    });
  });

  test.describe('Breathing Mobile Experience', () => {
    test('should render cleanly and support touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.click('nav button:has-text("Routines")');
      await page.click('[data-testid="profile-4-7-8-breathing-profile"]');

      const visualizer = page.locator('[data-testid="breathing-visualizer"]');
      await expect(visualizer).toBeVisible();
      await expect(visualizer).toBeInViewport();

      const phaseHeading = visualizer.locator('div.text-3xl');
      const fontSize = await phaseHeading.evaluate((el) => window.getComputedStyle(el).fontSize);
      expect(parseInt(fontSize, 10)).toBeGreaterThanOrEqual(24);

      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
      await page.click('[data-testid="pause-button"]');
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();
    });
  });
});
