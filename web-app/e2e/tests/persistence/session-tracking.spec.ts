// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/persistence/session-tracking.spec.ts
// Description: E2E tests for IndexedDB session persistence, ProgressView, and localStorage state
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with focus-timer-db, ProgressView, and UnifiedProfileManager

import { test, expect } from '@playwright/test';

async function createAndSelectShortTimer(page: import('@playwright/test').Page, seconds: number) {
  await page.click('nav button:has-text("Routines")');
  await page.click('button:has-text("+ Create Custom Timer")');

  const form = page.locator('form');
  await form.locator('input[type="text"]').fill('Quick E2E Session');
  await form.locator('textarea').fill('Short timer for persistence test');
  const numInputs = form.locator('input[type="number"]');
  await numInputs.nth(0).fill('0');
  await numInputs.nth(1).fill(String(seconds));
  await numInputs.nth(2).fill('0');
  await numInputs.nth(3).fill('0');
  await form.locator('button[type="submit"]').click();

  await page.locator('[data-testid^="profile-simple-"]:has-text("Quick E2E Session")').click();
}

test.describe('Session Persistence & Progress View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');

    await page.evaluate(async () => {
      localStorage.clear();
      await new Promise((resolve) => {
        const deleteReq = indexedDB.deleteDatabase('focus-timer-db');
        deleteReq.onsuccess = () => resolve(undefined);
        deleteReq.onerror = () => resolve(undefined);
        deleteReq.onblocked = () => resolve(undefined);
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should save completed session to IndexedDB and display it in Progress view', async ({ page }) => {
    await createAndSelectShortTimer(page, 2);
    await expect(page.locator('[data-testid="time-display"]')).toHaveText('00:02');

    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    // Wait for 2s timer to complete and return to idle
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible({ timeout: 6000 });

    const sessions = await page.evaluate(async () => {
      return new Promise<any[]>((resolve, reject) => {
        const req = indexedDB.open('focus-timer-db', 1);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['sessions'], 'readonly');
          const store = tx.objectStore('sessions');
          const getAll = store.getAll();
          getAll.onsuccess = () => resolve(getAll.result);
          getAll.onerror = () => reject(getAll.error);
        };
        req.onerror = () => reject(req.error);
      });
    });

    expect(sessions.length).toBe(1);
    expect(sessions[0].completionStatus).toBe('completed');
    expect(sessions[0].profileId).toMatch(/^simple-/);
    expect(sessions[0].startedAt).toBeTruthy();
    expect(sessions[0].completedAt).toBeTruthy();

    // Verify Progress view reflects the completed session
    await page.click('nav button:has-text("Progress")');
    const progressView = page.locator('[data-testid="progress-view"]');
    await expect(progressView).toBeVisible();
    await expect(progressView).toContainText('1');
    await expect(progressView).toContainText('completed');
  });

  test('should maintain completed sessions across page reloads', async ({ page }) => {
    await createAndSelectShortTimer(page, 1);
    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForSelector('[data-testid="time-display"]');
    await page.click('nav button:has-text("Progress")');

    const progressView = page.locator('[data-testid="progress-view"]');
    await expect(progressView).toBeVisible();
    await expect(progressView).toContainText('1');
    await expect(progressView).toContainText('completed');
  });

  test('should reset timer cleanly when stopped before completion', async ({ page }) => {
    await page.click('[data-testid="start-focus-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

    await page.waitForTimeout(1000);
    await page.click('[data-testid="stop-button"]');

    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-display"]')).toHaveText('00:30');
  });

  test('should persist preferences across page reloads', async ({ page }) => {
    await page.click('nav button:has-text("Settings")');
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();

    await page.click('button:has-text("Chair-Based")');
    await page.click('button:has-text("Front + Side")');

    await page.reload();
    await page.waitForSelector('[data-testid="exercise-animation-player"]');
    const player = page.locator('[data-testid="exercise-animation-player"]');
    await expect(player).toContainText('Chair');
    await expect(player).toContainText('front view');
    await expect(player).toContainText('side view');
  });
});
