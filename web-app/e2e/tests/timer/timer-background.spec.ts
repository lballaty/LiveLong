// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/timer/timer-background.spec.ts
// Description: E2E tests for background timer behavior, visibility changes, and worker availability
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with UnifiedTimerDisplay and Rajio Taiso default 00:30

import { test, expect } from '@playwright/test';

test.describe('Background Timer & Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should load timer worker script', async ({ page }) => {
    const response = await page.request.get('/timer-worker.js');
    expect(response.status()).toBe(200);
  });

  test('should start timer cleanly on iOS user agent', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="time-display"]');

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    await page.waitForTimeout(1100);
    expect(await page.textContent('[data-testid="time-display"]')).not.toBe('00:30');
    expect(consoleErrors.filter((e) => e.includes('timer worker'))).toHaveLength(0);
  });

  test('should continue counting during background visibility simulation', async ({ page }) => {
    await expect(page.locator('[data-testid="time-display"]')).toHaveText('00:30');
    await page.click('[data-testid="start-focus-button"]');

    await page.waitForTimeout(1500);
    const updatedTime = await page.textContent('[data-testid="time-display"]');
    const seconds = parseInt(updatedTime!.split(':')[1], 10);
    expect(seconds).toBeLessThanOrEqual(29);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const finalTime = await page.textContent('[data-testid="time-display"]');
    const finalSeconds = parseInt(finalTime!.split(':')[1], 10);
    expect(finalSeconds).toBeLessThan(seconds);
  });

  test('should hold time steady when paused and resume cleanly', async ({ page }) => {
    await page.click('[data-testid="start-focus-button"]');
    await page.waitForTimeout(1200);

    await page.click('[data-testid="pause-button"]');
    const pausedTime = await page.textContent('[data-testid="time-display"]');

    await page.waitForTimeout(1500);
    expect(await page.textContent('[data-testid="time-display"]')).toBe(pausedTime);

    await page.click('[data-testid="resume-button"]');
    await page.waitForTimeout(1200);
    expect(await page.textContent('[data-testid="time-display"]')).not.toBe(pausedTime);
  });

  test('should complete a short custom timer and return to idle', async ({ page }) => {
    await page.click('nav button:has-text("Routines")');
    await page.click('button:has-text("+ Create Custom Timer")');

    const form = page.locator('form');
    await form.locator('input[type="text"]').fill('2s Background Test');
    const numInputs = form.locator('input[type="number"]');
    await numInputs.nth(0).fill('0');
    await numInputs.nth(1).fill('2');
    await numInputs.nth(2).fill('0');
    await numInputs.nth(3).fill('0');
    await form.locator('button[type="submit"]').click();

    await page.locator('[data-testid^="profile-simple-"]:has-text("2s Background Test")').click();
    await expect(page.locator('[data-testid="time-display"]')).toHaveText('00:02');

    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible({ timeout: 5000 });
  });

  test('should initialize fresh page with Rajio Taiso default 00:30 in idle state', async ({ page, context }) => {
    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForSelector('[data-testid="time-display"]');

    expect(await newPage.textContent('[data-testid="time-display"]')).toBe('00:30');
    await expect(newPage.locator('[data-testid="start-focus-button"]')).toBeVisible();
    await newPage.close();
  });
});
