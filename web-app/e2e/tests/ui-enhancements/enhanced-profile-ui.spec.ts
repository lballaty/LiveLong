// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/e2e/tests/ui-enhancements/enhanced-profile-ui.spec.ts
// Description: E2E tests for LiveLong 4-view UI, UnifiedProfileManager, and SettingsView
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30
// Updated: 2026-11-21 - Aligned with 4-view UnifiedTimerDisplay, UnifiedProfileManager, and SettingsView

import { test, expect } from '@playwright/test';

test.describe('Enhanced UI: Practices, Branding, & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should display LiveLong ⊹ branding and all 4 navigation views', async ({ page }) => {
    await expect(page.locator('h1:has-text("LiveLong ⊹")')).toBeVisible();

    await page.click('nav button:has-text("Routines")');
    await expect(page.locator('h2:has-text("Routines & Timers")')).toBeVisible();

    await page.click('nav button:has-text("Progress")');
    await expect(page.locator('[data-testid="progress-view"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Your Practice Progress")')).toBeVisible();

    await page.click('nav button:has-text("Settings")');
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Practice Settings")')).toBeVisible();

    await page.click('nav button:has-text("Session")');
    await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
  });

  test('should show clear duration and unit labels in Create Custom Timer modal', async ({ page }) => {
    await page.click('nav button:has-text("Routines")');
    await page.click('button:has-text("+ Create Custom Timer")');

    const form = page.locator('form');
    await expect(form.locator('label:has-text("Name")')).toBeVisible();
    await expect(form.locator('label:has-text("Description")')).toBeVisible();
    await expect(form.locator('label:has-text("Work Duration")')).toBeVisible();
    await expect(form.locator('label:has-text("Break Duration")')).toBeVisible();
    await expect(form.locator('label:has-text("Icon")')).toBeVisible();
    await expect(form.locator('span:has-text("min")').first()).toBeVisible();
    await expect(form.locator('span:has-text("sec")').first()).toBeVisible();
  });

  test('should configure character, posture variant, camera view, and audio toggles in SettingsView', async ({ page }) => {
    await page.click('nav button:has-text("Settings")');
    const settings = page.locator('[data-testid="settings-view"]');
    await expect(settings).toBeVisible();

    // Cast of 6 character selector
    const characterSelect = settings.locator('select');
    await expect(characterSelect.locator('option')).toHaveCount(6);
    await characterSelect.selectOption('f72-stooped');

    // Posture variant & camera view buttons
    await settings.locator('button:has-text("Chair-Based")').click();
    await settings.locator('button:has-text("Front + Side")').click();

    // Audio Chimes / Script Voice / Background Music / Haptic checkboxes + 2 volume sliders
    const checkboxes = settings.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(4);
    await expect(settings.locator('input[type="range"]')).toHaveCount(2);
    await checkboxes.nth(1).check(); // Enable Script / Voice Guidance

    // Switch back to Practice and verify ExerciseAnimationPlayer reflects Settings
    await page.click('nav button:has-text("Session")');
    const player = page.locator('[data-testid="exercise-animation-player"]');
    await expect(player).toContainText('Woman ~72 (Gentle Stoop)');
    await expect(player).toContainText('Chair');
    await expect(player).toContainText('front view');
    await expect(player).toContainText('side view');
  });

  test('should render Practices and Settings cleanly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.click('nav button:has-text("Routines")');
    await expect(page.locator('[data-testid="profile-rajio-taiso-series"]')).toBeVisible();

    await page.click('nav button:has-text("Settings")');
    await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();
    await expect(page.locator('button:has-text("Test Audio Cue")')).toBeVisible();
  });
});
