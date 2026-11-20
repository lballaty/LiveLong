// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('LiveLong App - View Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index_new.html');
    // Wait for app to load
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('#loading')).toBeHidden();
  });

  test.describe('Home View', () => {
    test('should show home view by default', async ({ page }) => {
      // Home view should be visible
      await expect(page.locator('#home-view')).toBeVisible();
      await expect(page.locator('#session-view')).toBeHidden();
      await expect(page.locator('#summary-view')).toBeHidden();

      // Check page title
      await expect(page).toHaveTitle(/LiveLong.*Exercise Selection/);
    });

    test('should load and display exercise list', async ({ page }) => {
      // Wait for exercises to load
      await expect(page.locator('#exercise-list')).toBeVisible();

      // Should have exercise items
      const exerciseItems = page.locator('.exercise-item');
      await expect(exerciseItems).toHaveCount(11); // 11 Japanese exercises

      // Check first exercise
      const firstExercise = exerciseItems.first();
      await expect(firstExercise).toContainText('Breathing');
      await expect(firstExercise).toContainText('120s');

      // Should have exercise numbers
      await expect(firstExercise.locator('.exercise-number')).toContainText('1');
    });

    test('should display total session time', async ({ page }) => {
      // Wait for total time to be calculated
      const totalTime = page.locator('#total-time .time-text');
      await expect(totalTime).toBeVisible();
      await expect(totalTime).toContainText(/Total:.*minute/);
    });

    test('should have working settings controls', async ({ page }) => {
      // Music toggle
      const musicToggle = page.locator('#toggle-music');
      await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');

      await musicToggle.click();
      await expect(musicToggle).toHaveAttribute('aria-pressed', 'true');

      // Voice toggle
      const voiceToggle = page.locator('#toggle-voice');
      await voiceToggle.click();
      await expect(voiceToggle).toHaveAttribute('aria-pressed', 'true');

      // Text size select
      const textSelect = page.locator('#text-size');
      await textSelect.selectOption('large');
      await expect(page.locator('body')).toHaveClass(/text-large/);
    });
  });

  test.describe('Navigation to Session View', () => {
    test('should navigate to session view when start button clicked', async ({ page }) => {
      // Click start button
      const startButton = page.locator('#start-routine');
      await expect(startButton).toBeVisible();
      await startButton.click();

      // Should navigate to session view
      await expect(page.locator('#home-view')).toBeHidden();
      await expect(page.locator('#session-view')).toBeVisible();
      await expect(page.locator('#summary-view')).toBeHidden();

      // Check page title changed
      await expect(page).toHaveTitle(/LiveLong.*Exercise Session/);
    });

    test('should navigate to session view when exercise item clicked', async ({ page }) => {
      // Wait for exercises to load
      await expect(page.locator('.exercise-item')).toHaveCount(11);

      // Click on third exercise
      const thirdExercise = page.locator('.exercise-item').nth(2);
      await thirdExercise.click();

      // Should navigate to session view
      await expect(page.locator('#session-view')).toBeVisible();
      await expect(page.locator('#home-view')).toBeHidden();

      // Should show correct step number (starting from exercise 3)
      const stepCount = page.locator('#current-step');
      await expect(stepCount).toContainText('3');
    });

    test('should support keyboard navigation for exercise selection', async ({ page }) => {
      // Wait for exercises to load
      await expect(page.locator('.exercise-item')).toHaveCount(11);

      // Tab to first exercise and press Enter
      await page.keyboard.press('Tab'); // Might need several tabs to reach exercises
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Find focused exercise item and press Enter
      const focusedElement = page.locator(':focus');
      const isExerciseItem = await focusedElement.evaluate((el) => {
        return el.classList.contains('exercise-item') || el.closest('.exercise-item') !== null;
      });

      if (isExerciseItem) {
        await page.keyboard.press('Enter');

        // Should navigate to session view
        await expect(page.locator('#session-view')).toBeVisible();
      }
    });
  });

  test.describe('Session View', () => {
    test.beforeEach(async ({ page }) => {
      // Start a session
      await page.locator('#start-routine').click();
      await expect(page.locator('#session-view')).toBeVisible();
    });

    test('should display session view elements', async ({ page }) => {
      // Check essential session elements are present
      await expect(page.locator('#back-button')).toBeVisible();
      await expect(page.locator('#current-step')).toBeVisible();
      await expect(page.locator('#remaining-time')).toBeVisible();
      await expect(page.locator('#progress-fill')).toBeVisible();
      await expect(page.locator('#exercise-title')).toBeVisible();
      await expect(page.locator('#exercise-timer')).toBeVisible();

      // Control panel should be visible
      await expect(page.locator('#play-pause-button')).toBeVisible();
      await expect(page.locator('#prev-button')).toBeVisible();
      await expect(page.locator('#next-button')).toBeVisible();
    });

    test('should show progress information', async ({ page }) => {
      // Step count should show current position
      const stepCount = page.locator('#current-step');
      await expect(stepCount).toContainText(/\d+/); // Should contain numbers

      // Remaining time should be displayed
      const remainingTime = page.locator('#remaining-time');
      await expect(remainingTime).toContainText(/\d+:\d+/); // Should be in MM:SS format

      // Progress bar should exist
      const progressBar = page.locator('#progress-fill');
      await expect(progressBar).toBeVisible();
    });

    test('should display exercise content', async ({ page }) => {
      // Exercise title should be shown
      const exerciseTitle = page.locator('#exercise-title');
      await expect(exerciseTitle).toBeVisible();
      await expect(exerciseTitle).not.toBeEmpty();

      // Exercise timer should be visible
      const exerciseTimer = page.locator('#exercise-timer');
      await expect(exerciseTimer).toBeVisible();
      await expect(exerciseTimer).toContainText(/\d+/);

      // Exercise cues should be present
      const exerciseCues = page.locator('#exercise-cues');
      await expect(exerciseCues).toBeVisible();
    });

    test('should have accessible control buttons', async ({ page }) => {
      // All control buttons should have proper labels
      const playPauseBtn = page.locator('#play-pause-button');
      await expect(playPauseBtn).toHaveAttribute('aria-label');

      const prevBtn = page.locator('#prev-button');
      await expect(prevBtn).toHaveAttribute('aria-label');

      const nextBtn = page.locator('#next-button');
      await expect(nextBtn).toHaveAttribute('aria-label');

      const backBtn = page.locator('#back-button');
      await expect(backBtn).toHaveAttribute('aria-label');
    });
  });

  test.describe('Navigation from Session View', () => {
    test.beforeEach(async ({ page }) => {
      // Start a session
      await page.locator('#start-routine').click();
      await expect(page.locator('#session-view')).toBeVisible();
    });

    test('should return to home view when back button clicked', async ({ page }) => {
      // Set up dialog handler before clicking
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('end the session');
        dialog.accept();
      });

      // Click back button
      const backButton = page.locator('#back-button');
      await backButton.click();

      // Should return to home view
      await expect(page.locator('#home-view')).toBeVisible();
      await expect(page.locator('#session-view')).toBeHidden();
    });

    test('should stay in session if back navigation cancelled', async ({ page }) => {
      // Set up dialog handler to cancel
      page.on('dialog', dialog => {
        dialog.dismiss();
      });

      // Click back button
      const backButton = page.locator('#back-button');
      await backButton.click();

      // Should remain in session view
      await expect(page.locator('#session-view')).toBeVisible();
      await expect(page.locator('#home-view')).toBeHidden();
    });
  });

  test.describe('Summary View Navigation', () => {
    test('should show summary view elements when accessed', async ({ page }) => {
      // Manually navigate to summary view by calling JavaScript
      await page.evaluate(() => {
        if (window.app) {
          window.app.showView('summary');
        }
      });

      // Check if summary view is visible
      const summaryView = page.locator('#summary-view');
      await expect(summaryView).toBeVisible();

      // Check essential summary elements
      await expect(page.locator('.summary-title')).toBeVisible();
      await expect(page.locator('.summary-subtitle')).toBeVisible();
      await expect(page.locator('.stat-card')).toHaveCount(3);
      await expect(page.locator('#restart-button')).toBeVisible();
      await expect(page.locator('#home-button')).toBeVisible();
    });
  });

  test.describe('Screen Reader Announcements', () => {
    test('should announce view changes to screen readers', async ({ page }) => {
      const announcements = page.locator('#announcements');

      // Start session
      await page.locator('#start-routine').click();

      // Check that announcements are made
      await expect(announcements).toHaveAttribute('aria-live', 'polite');

      // Note: The actual announcement content is cleared after 3 seconds,
      // so we test the structure rather than content
      await expect(announcements).toHaveClass(/sr-only/);
    });

    test('should announce setting changes', async ({ page }) => {
      // Toggle a setting
      await page.locator('#toggle-music').click();

      // Announcements element should be present for screen readers
      const announcements = page.locator('#announcements');
      await expect(announcements).toBeVisible();
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should work properly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Home view should still be accessible
      await expect(page.locator('#home-view')).toBeVisible();
      await expect(page.locator('#start-routine')).toBeVisible();

      // Exercise list should be responsive
      const exerciseItems = page.locator('.exercise-item');
      await expect(exerciseItems.first()).toBeVisible();

      // Navigate to session view
      await page.locator('#start-routine').click();
      await expect(page.locator('#session-view')).toBeVisible();

      // Control panel should be accessible on mobile
      await expect(page.locator('#play-pause-button')).toBeVisible();
    });

    test('should maintain functionality on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // All functionality should work
      await expect(page.locator('#exercise-list')).toBeVisible();
      await page.locator('#start-routine').click();
      await expect(page.locator('#session-view')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle routine loading failures gracefully', async ({ page }) => {
      // Intercept the routine.json request and make it fail
      await page.route('**/routine.json', route => {
        route.abort('failed');
      });

      // Reload page
      await page.reload();

      // App should still load but show error state
      await expect(page.locator('#app')).toBeVisible();

      // Start button should be disabled or show error
      const startButton = page.locator('#start-routine');
      const isDisabled = await startButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    test('should handle missing DOM elements gracefully', async ({ page }) => {
      // Remove an element and ensure app doesn't crash
      await page.evaluate(() => {
        const element = document.getElementById('exercise-list');
        if (element) element.remove();
      });

      // App should still function
      await expect(page.locator('#app')).toBeVisible();
      await expect(page.locator('#start-routine')).toBeVisible();
    });
  });
});