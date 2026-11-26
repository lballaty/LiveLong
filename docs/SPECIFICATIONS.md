# Technical Specifications

## 1. System Overview

LiveLong ⊹ (`web-app/`) is a standalone Progressive Web App requiring no backend API for its core functionality. It is designed for static or Node-based Next.js hosting (e.g., Vercel, Netlify, GitHub Pages static export).

## 2. Technology Stack (Verified in `web-app/package.json`)
- **Framework**: Next.js `14.2.0` (App Router), React `^18.2.0`, TypeScript `^5`
- **Styling**: Tailwind CSS `^3.4.0`, `lucide-react` `^0.330.0`, `clsx` `^2.1.0`
- **State & Storage**: Zustand `^4.5.0`, IndexedDB via `idb` `^8.0.0`, `date-fns` `^3.3.0`
- **PWA**: `next-pwa` `^5.6.0`
- **Testing & Quality**: Jest `^29.7.0`, `@testing-library/react` `^14.2.0`, `fake-indexeddb` `^6.2.2`, Playwright `^1.55.1`, ESLint `^8` (`eslint-config-next`), Prettier `^3.2.0`
- **Default Dev/Test Port**: `9000` (`next dev -p 9000` and `playwright.config.ts`)

## 3. Data Models

Canonical TypeScript interfaces live in:
- `web-app/src/types/unified-profile.types.ts`: `UnifiedProfile` (`type: 'simple' | 'series' | 'breathing'`), `SeriesStep` (with optional `cueId`, `voiceScript`, `animation`), `BreathingPhase`, `SessionPlan`, `SessionPlanItem`, `PracticePreferences`
- `web-app/src/types/profile.types.ts`: `Profile`, `ProfileCategory`, `ExerciseSeries`, `ExerciseStep`, `BreathingPattern`, `Session`, `IProfileRepository`, `ISessionRepository`
- `web-app/src/types/timer.types.ts`: `TimerState`, `TimerConfig`, `TimerData`, `TimerEvent`, `ITimerController`

> **Consolidation Note (Closed `2026-11-25`, `f0d67cc`):** The earlier parallel legacy files (`ProfileManager.tsx`, `FocusTimerDisplay.tsx`, `TimerEngine.ts`, `FocusTimerEngine.ts`, `focusTimerStore.ts`, `timerStore.ts`) were removed. `npm --prefix web-app run type-check` passes with 0 errors.

## 4. Business Logic

### Timer Execution Flow
1. User selects a profile (`simple`, `series`, or `breathing`) in `UnifiedTimerDisplay`.
2. `UnifiedTimerEngine` manages countdowns and phase transitions using timestamp-based elapsed tracking to prevent drift when backgrounded.
3. Upon completion, audio/haptic notifications fire and `SessionRepository` / `unifiedTimerStore` record the session.

## 5. Verification Commands (`web-app/`)
- Type-check: `npm run type-check` (`tsc --noEmit`)
- Lint: `npm run lint` (`next lint`)
- Unit tests + coverage: `npm run test:ci` (`jest --ci --coverage --maxWorkers=2`)
- Live-browser UI & User Journeys: `scripts/browser-ui-suite.js` and `scripts/browser-user-journeys.js` (Chrome via `chrome-devtools-mcp`)
- E2E specs (Playwright): `npm run test:e2e` (`playwright test`)

---

**Status**: Reconciled after `f0d67cc` & `73415ca`
**Last Updated**: 2026-11-26
