// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/timer/timer-basic.spec.ts
// Description: E2E smoke tests for UnifiedTimerDisplay 4-view LiveLong PWA
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with UnifiedTimerDisplay and 4-view navigation

import { test, expect } from '@playwright/test';

test.describe('LiveLong Practice & Timer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="start-focus-button"]');
  });

  test('should display initial Rajio Taiso practice and animation slot', async ({ page }) => {
    const timeDisplay = await page.textContent('[data-testid="time-display"]');
    expect(timeDisplay).toBe('00:30');

    await expect(page.locator('[data-testid="exercise-animation-player"]')).toBeVisible();
    const startButton = page.locator('[data-testid="start-focus-button"]');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('should start, pause, resume, and stop practice timer', async ({ page }) => {
    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    await page.waitForTimeout(1500);
    const runningTime = await page.textContent('[data-testid="time-display"]');
    expect(runningTime).not.toBe('00:30');

    await page.click('[data-testid="pause-button"]');
    await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="stop-button"]')).toBeVisible();

    const pausedTime = await page.textContent('[data-testid="time-display"]');
    await page.waitForTimeout(1100);
    expect(await page.textContent('[data-testid="time-display"]')).toBe(pausedTime);

    await page.click('[data-testid="resume-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    await page.click('[data-testid="stop-button"]');
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
    expect(await page.textContent('[data-testid="time-display"]')).toBe('00:30');
  });

  test('should switch standing/chair and front/side/both animation views in Settings', async ({ page }) => {
    await page.click('nav button:has-text("Settings")');
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();

    await page.click('button:has-text("Chair-Based")');
    await page.click('button:has-text("Front + Side")');

    await page.click('nav button:has-text("Practice")');
    await expect(page.locator('[data-testid="exercise-animation-player"]')).toContainText('Chair');
    await expect(page.locator('[data-testid="exercise-animation-player"]')).toContainText('front view');
    await expect(page.locator('[data-testid="exercise-animation-player"]')).toContainText('side view');
  });

  test('should navigate across Practices, Progress, and Settings views', async ({ page }) => {
    await page.click('nav button:has-text("Practices")');
    await expect(page.locator('h2:has-text("Practices & Timers")')).toBeVisible();

    await page.click('text=Box Breathing');
    await expect(page.locator('[data-testid="breathing-visualizer"]')).toBeVisible();

    await page.click('nav button:has-text("Progress")');
    await expect(page.locator('[data-testid="progress-view"]')).toBeVisible();

    await page.click('nav button:has-text("Settings")');
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();
  });
});
