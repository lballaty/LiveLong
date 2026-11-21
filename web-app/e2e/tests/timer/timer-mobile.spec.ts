// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/timer/timer-mobile.spec.ts
// Description: E2E tests for mobile responsiveness, touch targets, accessibility, and PWA meta tags
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with 4-view UnifiedTimerDisplay UI

import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should display Practice view and 4-tab navigation cleanly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="time-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="exercise-animation-player"]')).toBeVisible();

    for (const label of ['Practice', 'Practices', 'Progress', 'Settings']) {
      await expect(page.locator('nav').getByRole('button', { name: label, exact: true })).toBeVisible();
    }
  });

  test('should have touch-friendly Start button dimensions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const startButton = page.locator('[data-testid="start-focus-button"]');
    const box = await startButton.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('should handle start, pause, resume, and stop on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    await page.click('[data-testid="pause-button"]');
    await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

    await page.click('[data-testid="resume-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    await page.click('[data-testid="stop-button"]');
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
  });

  test('should have readable time display font size', async ({ page }) => {
    const timeDisplay = page.locator('[data-testid="time-display"]');
    const fontSize = await timeDisplay.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize, 10)
    );
    expect(fontSize).toBeGreaterThanOrEqual(32);
  });

  test('should support keyboard activation and sufficient button contrast', async ({ page }) => {
    const startButton = page.locator('[data-testid="start-focus-button"]');
    await expect(startButton).toHaveText('Start');

    const colors = await startButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { bg: style.backgroundColor, fg: style.color };
    });
    expect(colors.bg).not.toBe(colors.fg);

    await startButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
  });

  test('should handle viewport orientation changes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="time-display"]')).toBeVisible();

    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('[data-testid="time-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeEnabled();
  });

  test('should have viewport and apple mobile web app meta tags', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');

    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').first().getAttribute('content');
    expect(appleCapable).toBe('yes');
  });
});
