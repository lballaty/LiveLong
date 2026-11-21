// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/pwa/service-worker.spec.ts
// Description: E2E tests for PWA assets, offline timer functionality, and background tab execution
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with UnifiedTimerDisplay and current PWA assets

import { test, expect } from '@playwright/test';

test.describe('Service Worker & PWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test.describe('PWA Assets & Manifest', () => {
    test('should serve manifest, service worker, offline fallback, and timer worker', async ({ page }) => {
      for (const asset of ['/manifest.json', '/sw.js', '/offline.html', '/timer-worker.js']) {
        const response = await page.request.get(asset);
        expect(response.status(), `Expected ${asset} to return 200`).toBe(200);
      }
    });

    test('should include manifest link and mobile web app meta tags', async ({ page }) => {
      const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
      expect(manifestHref).toBe('/manifest.json');

      const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').first().getAttribute('content');
      expect(appleCapable).toBe('yes');
    });
  });

  test.describe('Offline Functionality', () => {
    test('should run timer and navigate views while offline', async ({ page, context }) => {
      await expect(page.locator('[data-testid="time-display"]')).toHaveText('00:30');

      await context.setOffline(true);

      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.waitForTimeout(1200);
      const runningTime = await page.textContent('[data-testid="time-display"]');
      expect(runningTime).not.toBe('00:30');

      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-button"]');
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();

      // View navigation still works offline
      await page.click('nav button:has-text("Practices")');
      await expect(page.locator('h2:has-text("Practices & Timers")')).toBeVisible();

      await page.click('nav button:has-text("Settings")');
      await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();

      await context.setOffline(false);
    });
  });

  test.describe('Background Tab Functionality', () => {
    test('should continue running when another tab is focused', async ({ page, context }) => {
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      const newPage = await context.newPage();
      await newPage.goto('about:blank');
      await newPage.waitForTimeout(1500);

      await page.bringToFront();
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.click('[data-testid="stop-button"]');
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
      await newPage.close();
    });
  });
});
