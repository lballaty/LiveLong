# File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/TESTING_REQUIREMENTS.md
# Description: Mandatory testing requirements for the Focus & Productivity Timer PWA
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-30

# TESTING REQUIREMENTS - CRITICAL DOCUMENT

**⚠️ IMPORTANT: These testing requirements are MANDATORY and NON-NEGOTIABLE**

---

## 🔴 CRITICAL REQUIREMENTS

### GUI Testing is MANDATORY
- **ALL GUI functions must be tested WITHOUT EXCEPTION**
- **100% UI component coverage is REQUIRED**
- **Every user interaction must have a corresponding test**
- **No UI feature can be considered complete without tests**

### Technology Stack (DO NOT CHANGE)
- **UI & User-Journey Verification:** live-browser suites in the real Chrome browser via `chrome-devtools-mcp`
  (`scripts/browser-ui-suite.js`, `scripts/browser-user-journeys.js`); steps and latest results in
  `docs/TEST-CHECKLIST.md`
- **Cross-browser & Mobile E2E:** Playwright (no switching to Cypress, Selenium, etc.)
- **Component Testing:** React Testing Library
- **Unit Testing:** Jest
- **NO technology changes without explicit user approval**

---

## 📋 Test Coverage Requirements

### 1. Unit Tests (Jest)
**Coverage Target:** 80% minimum

Must test:
- All business logic functions
- Data transformations
- Utility functions
- Custom hooks
- Store actions and selectors
- Repository methods
- Service layer functions

### 2. Component Tests (React Testing Library)
**Coverage Target:** 100% of components

Must test for EVERY component:
- Rendering with different props
- User interactions (clicks, inputs, gestures)
- State changes
- Error states
- Loading states
- Empty states
- Accessibility (ARIA attributes, keyboard navigation)
- Responsive behavior

### 3. E2E Tests (live-browser journeys + Playwright)
**Coverage Target:** 100% of user workflows

Every user workflow is verified in real Chrome by `scripts/browser-user-journeys.js` and every view and control
by `scripts/browser-ui-suite.js` (results in `docs/TEST-CHECKLIST.md`). Playwright specs add cross-browser
(Chromium, Firefox, WebKit) and mobile-emulation coverage of the scenarios below.

#### Required Test Scenarios

##### Timer Functionality (ALL must be tested)
- [ ] Start timer with default profile
- [ ] Start timer with custom profile
- [ ] Pause running timer
- [ ] Resume paused timer
- [ ] Stop timer before completion
- [ ] Complete full timer session
- [ ] Timer continues when app backgrounded
- [ ] Timer survives page refresh
- [ ] Multiple timers in sequence
- [ ] Break timer activation
- [ ] Long break after N sessions
- [ ] Timer notifications
- [ ] Timer sound effects
- [ ] Visual countdown display
- [ ] Progress bar animation
- [ ] Time display formatting

##### Profile Management (ALL must be tested)
- [ ] Create new profile with all fields
- [ ] Create profile with minimal fields
- [ ] Edit existing profile
- [ ] Delete profile
- [ ] Delete profile currently in use
- [ ] Duplicate profile
- [ ] Search profiles
- [ ] Filter profiles by category
- [ ] Sort profiles
- [ ] Profile validation errors
- [ ] Profile quick-select
- [ ] Profile favorites
- [ ] Profile templates

##### Statistics & Analytics (ALL must be tested)
- [ ] View today's statistics
- [ ] View weekly statistics
- [ ] View monthly statistics
- [ ] Custom date range selection
- [ ] Statistics charts interaction
- [ ] Export statistics data
- [ ] Completion rate calculation
- [ ] Streak tracking
- [ ] Most productive hours
- [ ] Statistics filtering by profile
- [ ] Statistics refresh
- [ ] Empty statistics state

##### Navigation (ALL must be tested)
- [ ] Bottom navigation tabs
- [ ] Tab switching
- [ ] Active tab indicators
- [ ] Navigation with gestures
- [ ] Back button behavior
- [ ] Deep linking
- [ ] Route protection

##### Settings (ALL must be tested)
- [ ] Toggle dark mode
- [ ] Change notification settings
- [ ] Sound settings
- [ ] Vibration settings
- [ ] AI coaching toggle
- [ ] Data export
- [ ] Data import
- [ ] Clear all data
- [ ] About page
- [ ] Privacy settings

##### PWA Features (ALL must be tested)
- [ ] Install prompt display
- [ ] App installation on iOS
- [ ] App installation on Android
- [ ] Offline functionality
- [ ] Data sync when online
- [ ] Service worker updates
- [ ] Cache management
- [ ] Push notifications
- [ ] App shortcuts
- [ ] Share functionality

##### Responsive Design (ALL screen sizes)
- [ ] iPhone SE (375px)
- [ ] iPhone 14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1920px)
- [ ] Portrait orientation
- [ ] Landscape orientation
- [ ] Safe area handling
- [ ] Touch targets (min 44x44px)

##### Accessibility (ALL must be tested)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] ARIA labels
- [ ] Color contrast
- [ ] Text scaling
- [ ] Reduced motion support

##### Error Handling (ALL must be tested)
- [ ] Network errors
- [ ] Database errors
- [ ] Form validation errors
- [ ] Permission denied errors
- [ ] Storage quota exceeded
- [ ] Invalid data handling
- [ ] Error recovery

##### Performance (ALL must be tested)
- [ ] Initial load time < 3s
- [ ] Time to interactive < 5s
- [ ] Smooth animations (60 FPS)
- [ ] Memory usage < 100MB
- [ ] No memory leaks
- [ ] Large dataset handling (1000+ sessions)

---

## 🛠️ Playwright Configuration Requirements

### Test Structure (current)
```
e2e/
└── tests/
    ├── breathing/breathing-visualizer.spec.ts
    ├── japanese-exercises/japanese-exercise-series.spec.ts
    ├── persistence/session-tracking.spec.ts
    ├── profiles/profile-manager.spec.ts
    ├── pwa/service-worker.spec.ts
    ├── timer/timer-background.spec.ts
    ├── timer/timer-basic.spec.ts
    ├── timer/timer-duration.spec.ts
    ├── timer/timer-mobile.spec.ts
    └── ui-enhancements/enhanced-profile-ui.spec.ts
playwright.config.ts
```

Not yet covered by a dedicated spec: statistics, navigation, settings, PWA installation and accessibility.
Accessibility is currently covered by React Testing Library role/label queries (for example
`RoutineEditorModal.test.tsx`) and the live-browser suites.

### Required Playwright Features
- Visual regression testing (screenshots)
- Multiple browser testing (Chromium, Firefox, WebKit)
- Mobile device emulation
- Network conditions simulation
- Offline mode testing
- Geolocation testing
- Timezone testing
- Parallel test execution
- Test retries for flaky tests
- HTML test reports
- Video recording for failures
- Trace viewer for debugging

### Test Patterns
```typescript
// Every UI test must follow this pattern
test.describe('Component/Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should [action] when [condition]', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });

  test('should handle [error case]', async ({ page }) => {
    // Test error scenarios
  });

  test('should be accessible', async ({ page }) => {
    // Test accessibility
  });

  test('should work on mobile', async ({ page }) => {
    // Test mobile behavior
  });
});
```

---

## 📊 Test Execution Requirements

### Continuous Integration
- Tests must run on every commit
- Tests must run before merge
- Failing tests block deployment
- Test results must be reported

### Local Development
- Developers must run tests before committing
- Pre-commit hooks for testing
- Fast test execution (< 5 minutes for unit/component)
- Parallel test execution

### Test Commands
Run from `web-app/` (or prefix with `npm --prefix web-app` from the repo root):

```bash
# Unit & component tests (Jest + RTL), CI mode with coverage; enforces the 80% threshold
npm run test:ci

# Unit tests only / coverage report / watch mode
npm run test:unit
npm run test:coverage
npm test

# E2E tests (Playwright): all projects, mobile projects, interactive UI, report
npm run test:e2e
npm run test:e2e:mobile
npm run test:e2e:ui
npm run test:e2e:report
```

Live-browser UI and user-journey suites run in real Chrome through `chrome-devtools-mcp`
(`scripts/browser-ui-suite.js`, `scripts/browser-user-journeys.js`); see `docs/TEST-CHECKLIST.md`.

---

## 🚫 VIOLATIONS

The following constitute testing violations:

1. **Shipping UI features without tests**
2. **Skipping or disabling tests without documentation**
3. **Changing testing frameworks without explicit approval**
4. **Reducing test coverage below thresholds**
5. **Not testing error cases**
6. **Not testing accessibility**
7. **Not testing responsive design**
8. **Not updating tests when features change**

---

## ✅ Test Review Checklist

Before ANY PR/merge:

- [ ] All new UI components have tests
- [ ] All user interactions are tested
- [ ] All error cases are handled
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass
- [ ] E2E tests cover the full workflow
- [ ] Test coverage meets requirements
- [ ] Tests run in CI/CD pipeline
- [ ] No tests are skipped or disabled
- [ ] Documentation updated

---

## 📚 Resources

### Playwright Documentation
- [Official Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Testing Best Practices
- Test user behavior, not implementation
- Keep tests independent and isolated
- Use data-testid attributes for reliable selectors
- Mock external dependencies
- Test the happy path and edge cases
- Write descriptive test names
- Keep tests maintainable

---

**Last Updated:** 2025-09-30
**Status:** ACTIVE - These requirements are in effect immediately
**Enforcement:** MANDATORY - No exceptions without written approval

**Questions:** libor@arionetworks.com