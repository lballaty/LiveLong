/**
 * LiveLong App - Main Application Logic
 * Senior-friendly Japanese longevity exercises
 */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  console.log('LiveLong App initializing...');

  // Hide loading overlay and show app
  const loadingOverlay = document.getElementById('loading');
  const app = document.getElementById('app');

  if (loadingOverlay && app) {
    loadingOverlay.style.display = 'none';
    loadingOverlay.setAttribute('aria-hidden', 'true');

    app.style.display = 'flex';
    app.setAttribute('aria-hidden', 'false');
  }

  // Initialize basic functionality
  initializeSettings();

  console.log('LiveLong App initialized successfully');
}

function initializeSettings() {
  // Basic setting toggle handlers (no functionality yet, just UI state)
  const settingToggles = document.querySelectorAll('.setting-toggle[role="switch"]');

  settingToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const currentPressed = this.getAttribute('aria-pressed') === 'true';
      this.setAttribute('aria-pressed', !currentPressed);
    });

    // Ensure proper keyboard support
    toggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Text size select handler
  const textSizeSelect = document.getElementById('text-size');
  if (textSizeSelect) {
    textSizeSelect.addEventListener('change', function() {
      const body = document.body;

      // Remove existing text size classes
      body.classList.remove('text-large', 'text-extra-large');

      // Add new class based on selection
      if (this.value === 'large') {
        body.classList.add('text-large');
      } else if (this.value === 'extra-large') {
        body.classList.add('text-extra-large');
      }
    });
  }
}

// Announce messages to screen readers
function announceToScreenReader(message) {
  const announcements = document.getElementById('announcements');
  if (announcements) {
    announcements.textContent = message;

    // Clear after 3 seconds to avoid cluttering
    setTimeout(() => {
      announcements.textContent = '';
    }, 3000);
  }
}