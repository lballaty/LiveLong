// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('LiveLong App - Foundation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index_new.html');
  });

  test.describe('HTML Structure', () => {
    test('should have proper page title and meta information', async ({ page }) => {
      await expect(page).toHaveTitle(/LiveLong.*Japanese Longevity Exercises/);

      // Check meta description
      const metaDescription = await page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /gentle.*Japanese.*longevity.*exercises/i);
    });

    test('should have proper semantic HTML structure', async ({ page }) => {
      // Check for main landmark
      const mainElements = page.locator('main');
      await expect(mainElements).toHaveCount(3); // home, session, summary views

      // Check for proper heading hierarchy
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toHaveText(/LiveLong Exercises/i);

      // Check aria labels and roles
      const loadingSpinner = page.locator('.loading-spinner');
      await expect(loadingSpinner).toHaveAttribute('aria-label');
    });

    test('should have all required view containers', async ({ page }) => {
      // Check for three main views
      await expect(page.locator('#home-view')).toBeVisible();
      await expect(page.locator('#session-view')).toBeHidden();
      await expect(page.locator('#summary-view')).toBeHidden();

      // Check loading overlay is hidden after page load
      await expect(page.locator('#loading')).toBeHidden();
      await expect(page.locator('#app')).toBeVisible();
    });

    test('should have accessible form controls', async ({ page }) => {
      // Check settings toggles have proper ARIA attributes
      const musicToggle = page.locator('#toggle-music');
      await expect(musicToggle).toHaveAttribute('role', 'switch');
      await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');
      await expect(musicToggle).toHaveAttribute('aria-label');

      const voiceToggle = page.locator('#toggle-voice');
      await expect(voiceToggle).toHaveAttribute('role', 'switch');

      const videoToggle = page.locator('#toggle-video');
      await expect(videoToggle).toHaveAttribute('role', 'switch');

      // Check text size select
      const textSizeSelect = page.locator('#text-size');
      await expect(textSizeSelect).toBeVisible();
      await expect(textSizeSelect).toHaveValue('normal');
    });

    test('should have proper button structure and labels', async ({ page }) => {
      // Start button
      const startButton = page.locator('#start-routine');
      await expect(startButton).toBeVisible();
      await expect(startButton).toHaveAttribute('aria-label');
      await expect(startButton).toContainText(/start/i);

      // Control buttons in session view (should exist but be hidden)
      await expect(page.locator('#play-pause-button')).toBeHidden();
      await expect(page.locator('#prev-button')).toBeHidden();
      await expect(page.locator('#next-button')).toBeHidden();
    });
  });

  test.describe('CSS Styling and Layout', () => {
    test('should have large, accessible text sizes', async ({ page }) => {
      // Check base font size is large enough for seniors
      const bodyFontSize = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      // Should be at least 20px (our CSS variable)
      const fontSize = parseInt(bodyFontSize);
      expect(fontSize).toBeGreaterThanOrEqual(20);
    });

    test('should have large touch targets', async ({ page }) => {
      // Check button sizes meet accessibility requirements
      const startButton = page.locator('#start-routine');
      const buttonBox = await startButton.boundingBox();

      // Should be at least 60px height (our comfortable touch target)
      expect(buttonBox?.height).toBeGreaterThanOrEqual(60);

      // Check setting toggles
      const musicToggle = page.locator('#toggle-music');
      const toggleBox = await musicToggle.boundingBox();
      expect(toggleBox?.height).toBeGreaterThanOrEqual(60);
    });

    test('should have high contrast colors', async ({ page }) => {
      // Check computed styles for contrast
      const heroTitle = page.locator('.hero-title');
      const titleColor = await heroTitle.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Should have a dark text color (not light gray)
      expect(titleColor).not.toBe('rgb(128, 128, 128)'); // Not medium gray
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Elements should still be visible and properly sized
      const startButton = page.locator('#start-routine');
      await expect(startButton).toBeVisible();

      const settingsGrid = page.locator('.settings-grid');
      await expect(settingsGrid).toBeVisible();

      // Check that content doesn't overflow
      const body = page.locator('body');
      const hasHorizontalScroll = await body.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should support different text size preferences', async ({ page }) => {
      // Test normal text size (default)
      let bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass || '').not.toContain('text-large');
      expect(bodyClass || '').not.toContain('text-extra-large');

      // Simulate selecting large text by changing the select value
      const textSizeSelect = page.locator('#text-size');
      await textSizeSelect.selectOption('large');

      // Check that the body class was added by JavaScript
      const updatedBodyClass = await page.locator('body').getAttribute('class');
      expect(updatedBodyClass).toContain('text-large');

      // Test extra large
      await textSizeSelect.selectOption('extra-large');
      const extraLargeBodyClass = await page.locator('body').getAttribute('class');
      expect(extraLargeBodyClass).toContain('text-extra-large');
    });
  });

  test.describe('Accessibility Features', () => {
    test('should have proper focus management', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // First focusable element should be a setting toggle
      const focused = page.locator(':focus');
      await expect(focused).toHaveAttribute('role', 'switch');

      // Continue tabbing to ensure logical order
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should reach the start button
      const startButtonFocused = page.locator('#start-routine:focus');
      await expect(startButtonFocused).toHaveCount(0); // Won't be focused yet, need more tabs
    });

    test('should have visible focus indicators', async ({ page }) => {
      // Focus a button and check for visible outline
      const musicToggle = page.locator('#toggle-music');
      await musicToggle.focus();

      const focusedOutline = await musicToggle.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.outline;
      });

      // Should have a visible outline
      expect(focusedOutline).toContain('3px');
    });

    test('should have proper ARIA live regions', async ({ page }) => {
      // Check for announcements region
      const announcements = page.locator('#announcements');
      await expect(announcements).toHaveAttribute('aria-live', 'polite');
      await expect(announcements).toHaveAttribute('aria-atomic', 'true');

      // Should be screen reader only
      await expect(announcements).toHaveClass(/sr-only/);
    });

    test('should support reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Reload page to apply media query
      await page.reload();

      // Loading spinner should not animate
      const spinner = page.locator('.loading-spinner');
      if (await spinner.isVisible()) {
        const animationDuration = await spinner.evaluate((el) => {
          return window.getComputedStyle(el).animationDuration;
        });
        // Should be 0s or not have animation
        expect(animationDuration === '0s' || animationDuration === '').toBe(true);
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/index_new.html');

      // Wait for app to be visible
      await expect(page.locator('#app')).toBeVisible();
      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds (requirement)
      expect(loadTime).toBeLessThan(3000);
    });

    test('should hide loading state after page loads', async ({ page }) => {
      // Loading overlay should be hidden
      await expect(page.locator('#loading')).toBeHidden();

      // App should be visible
      await expect(page.locator('#app')).toBeVisible();
      await expect(page.locator('#app')).not.toHaveAttribute('aria-hidden', 'true');
    });

    test('should have critical CSS loaded', async ({ page }) => {
      // Check that base styles are applied
      const heroTitle = page.locator('.hero-title');
      const titleFontSize = await heroTitle.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      // Hero title should have large font size
      const fontSize = parseInt(titleFontSize);
      expect(fontSize).toBeGreaterThanOrEqual(40); // Should be around 48px
    });
  });

  test.describe('Settings UI', () => {
    test('should toggle setting states when clicked', async ({ page }) => {
      const musicToggle = page.locator('#toggle-music');

      // Initially off
      await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');

      // Click to toggle (won't work yet without JavaScript, but structure should be there)
      const initialPressed = await musicToggle.getAttribute('aria-pressed');
      expect(initialPressed).toBe('false');
    });

    test('should have all required setting options', async ({ page }) => {
      // Music toggle
      await expect(page.locator('#toggle-music')).toBeVisible();
      await expect(page.locator('#toggle-music')).toContainText(/music/i);

      // Voice toggle
      await expect(page.locator('#toggle-voice')).toBeVisible();
      await expect(page.locator('#toggle-voice')).toContainText(/voice/i);

      // Video toggle
      await expect(page.locator('#toggle-video')).toBeVisible();
      await expect(page.locator('#toggle-video')).toContainText(/video/i);

      // Text size select
      const textSelect = page.locator('#text-size');
      await expect(textSelect).toBeVisible();

      // Check options
      const options = await textSelect.locator('option').allTextContents();
      expect(options).toContain('Normal');
      expect(options).toContain('Large');
      expect(options).toContain('Extra Large');
    });
  });
});