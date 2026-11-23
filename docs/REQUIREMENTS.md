# Requirements

## 1. Functional Requirements

### Core Features
- [x] **Focus Timers**: Support Pomodoro (25 min), Deep Work (90 min), and custom duration setups (`web-app/src/types/unified-profile.types.ts`, `UnifiedTimerDisplay`, `UnifiedProfileManager`).
- [x] **Breathing Exercises**: Implement visual guides and patterns for Box Breathing (4-4-4-4), 4-7-8 Relaxation, Deep Breathing, and Wim Hof (`web-app/src/data/breathing-patterns.ts`, `breathing-profiles.ts`, `BreathingVisualizer.tsx`).
- [x] **Longevity Practices**: Provide structured exercise series for Rajio Taiso, Tai Chi Morning, Shinrin-yoku, Ikigai Reflection, and Zazen Sitting (`web-app/src/data/japanese-exercise-series.ts`).
- [x] **Profile & Session Persistence**: Store custom/default profiles and completed sessions locally via IndexedDB (`IndexedDBService`, `ProfileRepository`, `SessionRepository`) and `localStorage` (`SessionPersistenceService`).
- [x] **Routine & Session Editor**: Create, clone, and edit `simple`, `series`, and `breathing` routines (steps, timings, scripts, cues, animations, music) and compose multi-routine `SessionPlan` playlists (`RoutineEditorModal.tsx`, `SessionComposerModal.tsx`, `unifiedTimerStore.ts`).
- [x] **Routine Review & Asset Readiness**: Step jump/prev/next controls and cue preview for rapid routine verification, plus drop-in detection for `/audio/cues/<voiceId>/manifest.json` and `/animations/<pack>/` (`UnifiedTimerDisplay.tsx`, `ExerciseAnimationPlayer.tsx`, `SettingsView.tsx`).

### User Stories
- [x] As a user, I want to start a Pomodoro timer so that I can focus on my tasks for 25 minutes uninterrupted.
- [x] As a user, I want to follow a breathing visualizer so that I can destress using the 4-7-8 technique.
- [~] As a user, I want to be able to install this app on my phone as a PWA so that I can use it offline and access it quickly. *(Partially closed: `next-pwa`, `manifest.json`, `service-worker.js`, and `offline.html` are present, but `manifest.json` references `/icon-192.png` and `/icon-512.png` which are missing from `web-app/public/`.)*

## 2. Non-Functional Requirements

### Performance
- [~] The app should load quickly and smoothly handle timer intervals without drift. *(Partially closed: `timer-worker.js` and timestamp-based elapsed calculations exist; runtime E2E verification pending.)*
- [ ] UI animations (especially for breathing exercises) must run at a smooth 60fps. *(Not yet verified in E2E/browser profiling.)*

### Reliability & Accessibility
- [ ] The application must work offline once installed (PWA). *(Blocked on missing PNG icons and E2E verification of `e2e/tests/pwa/service-worker.spec.ts`.)*
- [ ] Colors and contrast must support accessibility standards. *(Not yet audited.)*

### Maintainability & Build Health
- [ ] TypeScript type-checking (`npm run type-check`) passes cleanly. *(Open: currently 14 TS errors across 7 files.)*
- [ ] ESLint (`npm run lint`) passes cleanly. *(Open: currently 18 errors and 6 warnings.)*
- [ ] Code coverage > 80% and all unit tests passing. *(Open: currently 2/4 Jest suites failing — 11/37 tests failing — and global coverage is 8.84% statements / 9.27% lines.)*
- [ ] Single consolidated timer/profile architecture without competing parallel engines/stores. *(Open: legacy and unified implementations coexist.)*

---

**Status**: Updated for Routine & Session Editor + Review Controls
**Last Updated**: 2026-11-23
