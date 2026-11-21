# File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/.claude/testing-rules.md
# Description: Mandatory testing rules for AI assistants working on this project
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-30

# AI ASSISTANT TESTING RULES - MANDATORY

**⚠️ THESE RULES ARE NON-NEGOTIABLE AND MUST BE FOLLOWED**

---

## 🔴 CRITICAL DIRECTIVES

### 1. GUI Testing is MANDATORY
- **EVERY UI component must have tests**
- **EVERY user interaction must be tested**
- **NO UI feature can be shipped without tests**
- **100% UI coverage is REQUIRED, not optional**

### 2. Testing Framework Rules
- **E2E/UI Testing:** Use ONLY Playwright
- **Component Testing:** Use React Testing Library
- **Unit Testing:** Use Jest
- **DO NOT switch frameworks without explicit written permission**
- **DO NOT suggest alternatives**
- **DO NOT use Cypress, Selenium, or any other E2E tool**

### 3. Test-First Development
- **Write tests BEFORE implementation**
- **Tests must pass before considering feature complete**
- **Failing tests block all merges/commits**

---

## 📋 What You MUST Test

### For EVERY UI Component:
1. Rendering with all prop combinations
2. User interactions (clicks, typing, swiping)
3. State changes
4. Error states
5. Loading states
6. Empty states
7. Accessibility (keyboard nav, screen readers)
8. Responsive behavior (all screen sizes)
9. Visual regression (screenshots)

### For EVERY Feature:
1. Happy path workflow
2. Error scenarios
3. Edge cases
4. Performance under load
5. Offline behavior
6. Data persistence
7. Security boundaries

---

## 🚫 VIOLATIONS

The following will be considered VIOLATIONS:

1. **Implementing UI without tests**
2. **Skipping tests "temporarily"**
3. **Commenting out failing tests**
4. **Reducing test coverage**
5. **Changing test frameworks**
6. **Not testing error cases**
7. **Not testing accessibility**
8. **Not testing responsive design**

---

## ✅ Your Responsibilities

When working on ANY UI feature, you MUST:

1. **Check for existing tests** before writing new ones
2. **Write Playwright E2E tests** for all workflows
3. **Write React Testing Library tests** for all components
4. **Ensure 100% coverage** for UI elements
5. **Test on multiple screen sizes**
6. **Test keyboard navigation**
7. **Test with screen readers**
8. **Include visual regression tests**
9. **Document test scenarios**
10. **Run ALL tests before committing**

---

## 📝 Test File Naming

### Required Structure:
```
web-app/
├── src/
│   └── components/
│       └── timer/
│           ├── TimerDisplay.tsx
│           └── TimerDisplay.test.tsx    # Component test
└── e2e/
    └── tests/
        └── timer/
            └── timer-display.spec.ts    # E2E test
```

### Naming Convention:
- Component tests: `ComponentName.test.tsx`
- E2E tests: `feature-name.spec.ts`
- Test descriptions: `should [action] when [condition]`

---

## 🎯 Coverage Thresholds

**These are MINIMUM requirements:**

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%
- UI Components: 100%
- User Workflows: 100%

**Tests fail if coverage drops below thresholds**

---

## 💡 Examples

### WRONG Approach:
```typescript
// ❌ Creating UI without tests
const TimerDisplay = () => {
  // Implementation without tests
};
export default TimerDisplay;
```

### CORRECT Approach:
```typescript
// ✅ Test first, then implement
// 1. Write TimerDisplay.test.tsx
// 2. Write timer-display.spec.ts
// 3. Then implement TimerDisplay.tsx
// 4. Ensure all tests pass
```

---

## 🔍 Before EVERY Session

1. **Read `TESTING_REQUIREMENTS.md`**
2. **Check existing test coverage**
3. **Plan tests for new features**
4. **Verify Playwright is configured**
5. **Ensure test scripts are in package.json**

---

## 📢 Important Reminders

- **The user has explicitly stated that GUI testing is critical**
- **Playwright is the mandated E2E testing tool**
- **Do not suggest or switch to other frameworks**
- **Every UI function must be tested without exception**
- **Test coverage is not optional**

---

## 🚨 If You're Unsure

When in doubt:
1. **Write more tests, not fewer**
2. **Test everything twice**
3. **Ask for clarification**
4. **Refer to TESTING_REQUIREMENTS.md**
5. **Remember: GUI testing is CRITICAL**

---

**Last Updated:** 2025-09-30
**Status:** ACTIVE AND ENFORCED
**Contact:** libor@arionetworks.com

**REMINDER: These rules apply to ALL AI assistants working on this project, including future sessions.**