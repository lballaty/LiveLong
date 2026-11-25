# Design Document

## 1. Architecture Overview

### System Architecture
LiveLong ⊹ is a frontend-first Progressive Web App (PWA) located in `web-app/`, built with **Next.js 14 (App Router)**, **React 18**, **TypeScript 5**, and **Tailwind CSS 3.4**. It uses **IndexedDB** (via `idb`) and `localStorage` for offline-capable persistence, **Zustand** for state management, and `next-pwa` / Web Workers for offline caching and background timing without requiring a backend API.

> **Source-of-Truth Shift:** This repository previously contained a `TestRepo` Node.js/Supabase bootstrap (`src/`, `tests/`, `cache/`, `cloud/`, `database/`, `vectordb/`) and a Flutter prototype (`focus_productivity_timer/`). Both are **superseded** by `web-app/`. The Flutter prototype is **retained** (operator decision, 2026-11-24) as the starting point for a possible future native Flutter build; it is not maintained alongside `web-app/`.

### Design Principles
- **Offline-First**: Core timer, breathing, and longevity series work without network connectivity.
- **Component-Based UI**: Reusable React/Tailwind components for timers, breathing visualizers, and profile management.
- **Test-Driven Quality**: Jest + React Testing Library + `fake-indexeddb` for unit tests, Playwright for cross-browser and mobile E2E tests.

## 2. Component Design

### Active Entrypoint (`web-app/src/app/page.tsx`)
- Renders `UnifiedTimerDisplay` (`web-app/src/components/timer/UnifiedTimerDisplay.tsx`) as a 4-view PWA shell (**Practice**, **Practices**, **Progress**, **Settings**), backed by:
  - `UnifiedTimerEngine` (`web-app/src/services/timer/UnifiedTimerEngine.ts`)
  - `useUnifiedTimerStore` (`web-app/src/store/unifiedTimerStore.ts`)
  - `UnifiedProfileManager` (`web-app/src/components/profiles/UnifiedProfileManager.tsx`)
  - `ExerciseAnimationPlayer` (`web-app/src/components/exercises/ExerciseAnimationPlayer.tsx`) — host slot for the `animation` fleet's `exercise-figures-runtime.js` + JSON packs (`characterId` cast of 6, `standing`/`chair` variant, `front`/`side`/`both` views)
  - `BreathingVisualizer` (`web-app/src/components/breathing/BreathingVisualizer.tsx`) — embedded and driven by `UnifiedTimerEngine` for breathing practices
  - `AudioCueService` (`web-app/src/services/audio/AudioCueService.ts`) — Web Audio API chimes + optional pre-rendered `/audio/cues/<voiceId>/manifest.json` voice clips (`woman` / `man`) with Web Speech API fallback
  - `BackgroundMusicService` (`web-app/src/services/audio/BackgroundMusicService.ts`) — looping `.mp3` music tracks (`/audio/music/*.mp3`) and custom user audio uploads with independent volume/mute
  - `RoutineEditorModal` & `SessionComposerModal` (`web-app/src/components/profiles/`) — create, clone, and edit `simple`, `series`, and `breathing` routines, plus compose multi-routine `SessionPlan` playlists
  - `ProgressView` (`web-app/src/components/progress/ProgressView.tsx`) & `SettingsView` (`web-app/src/components/settings/SettingsView.tsx`)
  - `UnifiedProfile` & `SessionPlan` types (`web-app/src/types/unified-profile.types.ts`)

### Supporting Modules
- **Breathing Visualizer**: `web-app/src/components/breathing/BreathingVisualizer.tsx` with patterns in `src/data/breathing-patterns.ts` and `src/data/breathing-profiles.ts`.
- **Longevity Exercise Series**: `web-app/src/data/japanese-exercise-series.ts` (Rajio Taiso, Tai Chi, Shinrin-yoku, Ikigai, Zazen).
- **Background Worker**: `web-app/public/timer-worker.js` and `BackgroundTimerWorkerService.ts` to mitigate browser background throttling.

### Consolidation Status (Closed 2026-11-25)
The earlier parallel engines/stores/displays (`TimerEngine.ts`, `FocusTimerEngine.ts`, `timerStore.ts`, `focusTimerStore.ts`, `components/TimerDisplay.tsx`, `components/timer/TimerDisplay.tsx`, `FocusTimerDisplay.tsx`, `ProfileManager.tsx`) have been removed. All active UI and timer logic runs through `UnifiedTimerEngine`, `unifiedTimerStore`, `UnifiedTimerDisplay`, and `UnifiedProfileManager`.

## 3. Data Flow

1. User selects a unified profile (`simple`, `series`, or `breathing`) or launches a composed `SessionPlan` (ordered queue of `SessionPlanItem` routines) in `UnifiedTimerDisplay`.
2. UI dispatches actions to `unifiedTimerStore`, which coordinates `UnifiedTimerEngine` (including review step-scrub controls `jumpToStep` / `nextStep` / `prevStep`), `AudioCueService`, and `BackgroundMusicService`.
3. Custom routines, `SessionPlan`s, per-profile music mappings, and user preferences persist to `localStorage` and IndexedDB (`IndexedDBService` -> `ProfileRepository` / `SessionRepository`).
4. UI re-renders from Zustand store updates.

### External Asset Drop-In Contracts
- **Voice Bundles (`openScriptAudio`):** Drop `/audio/cues/<voiceId>/manifest.json` (`woman` / `man`) and audio clips under `web-app/public/audio/cues/`. When absent, `AudioCueService` falls back cleanly to Web Speech API synthesis.
- **Animation Packs (`animation`):** Drop pack bundles under `web-app/public/animations/<pack>/` (manifest/frames/bundle). When absent, `ExerciseAnimationPlayer` renders the built-in animated robot SVG (`standing`/`chair`, `front`/`side`/`both`).

## 4. Data Storage

- **IndexedDB (`IndexedDBService`)**:
  - `profiles` object store (indexed by `category`, `updatedAt`)
  - `sessions` object store (indexed by `profileId`, `date`, `status`)
- **`localStorage` (`SessionPersistenceService`)**:
  - Active timer recovery state across page reloads/backgrounding.

## 5. Deployment Design

### PWA Configuration
- `web-app/next.config.js` wraps Next.js with `next-pwa` (disabled in `development`, enabled in production builds).
- `web-app/public/manifest.json` defines app metadata, shortcuts (`/?quick=focus`, `/?quick=rajio-taiso`, `/?quick=deep-breathing`), and icon paths (`/icon-192.png`, `/icon-512.png`), all generated in `web-app/public/`.

---

**Status**: Implemented & Verified (Routine & Session Editor, Review Controls, External Asset Contracts)
**Last Updated**: 2026-11-23
