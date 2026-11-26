# Requirements

## 1. Functional Requirements

### Core Features
- [x] **Focus Timers**: Support Pomodoro (25 min), Deep Work (90 min), and custom duration setups (`web-app/src/types/unified-profile.types.ts`, `UnifiedTimerDisplay`, `UnifiedProfileManager`).
- [x] **Breathing Exercises**: Implement visual guides and patterns for Box Breathing (4-4-4-4), 4-7-8 Relaxation, Deep Breathing, and Wim Hof (`web-app/src/data/breathing-patterns.ts`, `breathing-profiles.ts`, `BreathingVisualizer.tsx`).
- [x] **Longevity Practices**: Provide structured exercise series for Rajio Taiso, Tai Chi Morning, Shinrin-yoku, Ikigai Reflection, and Zazen Sitting (`web-app/src/data/japanese-exercise-series.ts`).
- [x] **Profile & Session Persistence**: Store custom/default profiles and completed sessions locally via IndexedDB (`IndexedDBService`, `ProfileRepository`, `SessionRepository`) and `localStorage` (`unifiedTimerStore`).
- [x] **Routine & Session Editor**: Create, clone, and edit `simple`, `series`, and `breathing` routines (steps, timings, scripts, cues, animations, music) and compose multi-routine `SessionPlan` playlists (`RoutineEditorModal.tsx`, `SessionComposerModal.tsx`, `unifiedTimerStore.ts`).
- [x] **Routine Review & Asset Readiness**: Step jump/prev/next controls and cue preview for rapid routine verification, plus drop-in detection for `/audio/cues/<voiceId>/manifest.json` and `/animations/<pack>/` (`UnifiedTimerDisplay.tsx`, `ExerciseAnimationPlayer.tsx`, `SettingsView.tsx`).

### User Stories
- [x] As a user, I want to start a Pomodoro timer so that I can focus on my tasks for 25 minutes uninterrupted.
- [x] As a user, I want to follow a breathing visualizer so that I can destress using the 4-7-8 technique.
- [x] As a user, I want to be able to install this app on my phone as a PWA so that I can use it offline and access it quickly. *(Closed in `f0d67cc`: `next-pwa` `public/sw.js`, `manifest.json`, `offline.html`, `/icon-192.png`, `/icon-192x192.png`, and `/icon-512.png` are present; production build, `/sw.js` activation, and offline reload verified in Chrome.)*

## 2. Non-Functional Requirements

### Performance
- [~] The app should load quickly and smoothly handle timer intervals without drift. *(Partially closed: `timer-worker.js` and timestamp-based elapsed calculations exist and `J1.TimerLifecycle` passes; long-duration background drift profiling pending.)*
- [ ] UI animations (especially for breathing exercises) must run at a smooth 60fps. *(Not yet verified in browser profiling or real iPhone/iPad Safari.)*

### Reliability & Accessibility
- [x] The application must work offline once installed (PWA). *(Closed in `f0d67cc`: `/sw.js` activation and offline PWA reload verified in Chrome.)*
- [ ] Colors and contrast must support accessibility standards. *(Not yet audited.)*

### Maintainability & Build Health
- [x] TypeScript type-checking (`npm run type-check`) passes cleanly. *(Closed: 0 TypeScript errors.)*
- [x] ESLint (`npm run lint`) passes cleanly. *(Closed: 0 ESLint errors; 3 pre-existing warnings in `BreathingVisualizer.tsx` and `IconPicker.tsx`.)*
- [x] Code coverage > 80% and all unit tests passing. *(Closed in `f0d67cc`: 20/20 Jest suites, 102/102 tests passing; 80.2% statements, 82.48% lines.)*
- [x] Single consolidated timer/profile architecture without competing parallel engines/stores. *(Closed in `f0d67cc`: legacy engines/stores/displays removed; only unused `useTimer.ts` / `useTimerStore.ts` remain to audit.)*

---

**Status**: Reconciled after `f0d67cc` & `73415ca`
**Last Updated**: 2026-11-26
