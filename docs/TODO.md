# TODO

**Canonical Task & Gap Tracker for LiveLong ⊹ (`web-app/`)**

> **Source-of-Truth Note:** `docs/TODO.md` is the single canonical tracker for this repository.
> - `web-app/TODO.md` is a historical sprint log from 2025-09-30 and is **superseded** by this file.
> - The root `TestRepo` bootstrap has been fully removed: empty `cache/`, `cloud/`, `database/`, `vectordb/` on 2026-11-24; `src/`, `tests/`, root `package.json` and `package-lock.json` on 2026-11-25 (`b866bf3`). All app code is in `web-app/`.
> - `focus_productivity_timer/` (Flutter prototype) is superseded as the active app but **retained** for a possible future native Flutter build (operator decision, 2026-11-24).

---

## 📊 Verified Baseline (`2026-11-23`, branch `main`)

- `npm --prefix web-app run type-check`: **PASS** — 0 TypeScript errors
- `npm --prefix web-app run lint`: **PASS** — 0 ESLint errors (3 pre-existing React Hook warnings)
- `cd web-app && npx jest --ci --maxWorkers=2`: **PASS** — 7/7 suites, 74/74 tests passing
- `cd web-app && npx playwright test e2e/tests/profiles/profile-manager.spec.ts e2e/tests/timer/timer-basic.spec.ts --project=chromium`: **PASS** — 12/12 tests passing

---

## ✅ Completed: Routine & Session Editor + Review Controls (`done`)
- [x] (`done`) Extend `unified-profile.types.ts` with `SessionPlan`, `SessionPlanItem`, and `SeriesStep` cue/voiceScript fields; verify all built-in exercise steps declare `cueId` and `animation`
- [x] (`done`) Add `jumpToStep` / `nextStep` / `prevStep` review controls in `UnifiedTimerEngine.ts` and `duplicateProfile`, full `series`/`breathing` editing, and `SessionPlan` CRUD + queue runner in `unifiedTimerStore.ts`
- [x] (`done`) Build `RoutineEditorModal.tsx` (`Simple` | `Series` | `Breathing`), `SessionComposerModal.tsx` (multi-routine playlists), and Session HUD step review + cue preview controls
- [x] (`done`) Wire `/animations/<pack>/` drop-in probe in `ExerciseAnimationPlayer.tsx` and external cue/animation readiness status in `SettingsView.tsx`
- [x] (`done`) Add Jest + Playwright tests for routine editing, session composition, and step review controls (74/74 Jest, 12/12 Playwright passing)

---

## ✅ Completed (Closed)
- [x] Pivot from Flutter prototype (`focus_productivity_timer/`) and Node bootstrap to Next.js 14 PWA (`web-app/`)
- [x] Implement IndexedDB persistence (`IndexedDBService`, `ProfileRepository`, `SessionRepository`) and `localStorage` persistence (`unifiedTimerStore`)
- [x] Implement unified profile system (`UnifiedProfile`, `UnifiedTimerEngine`, `UnifiedTimerDisplay`, `UnifiedProfileManager`)
- [x] Implement breathing patterns (`Box Breathing`, `4-7-8`, `Deep Breathing`, `Wim Hof`) and Japanese longevity series (`Rajio Taiso`, `Tai Chi`, `Shinrin-yoku`, `Ikigai`, `Zazen`)
- [x] Configure Playwright (`web-app/playwright.config.ts`) and author E2E specs under `web-app/e2e/tests/`
- [x] Generate `/icon-192.png`, `/icon-192x192.png`, and `/icon-512.png` in `web-app/public/`
- [x] Build 4-view LiveLong PWA shell (`Session`, `Routines`, `Progress`, `Settings`), 3-channel audio mixer (`Chimes` / `Script` / `Music`), selectable `Woman` / `Man` voice cues, and mastered `.mp3` music loops (`morning-exercise.mp3`, `zen-garden.mp3`, `calm-breath.mp3`, `focus-flow.mp3`)
- [x] Reconcile `docs/` (`REQUIREMENTS.md`, `DESIGN.md`, `SPECIFICATIONS.md`, `TODO.md`) with actual `web-app/` state

---

## 🔗 Cross-Fleet Bundle Integration (`animation` & `openScriptAudio`)

### `animation` Repo (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/animation`)
- [x] Integrate `rajio-taiso-0.1.0-draft.1` (`exercise-figures-runtime.js` + `neck-arm-stretch`, `chest-expansion`, `side-bends`, `trunk-twists`, characters `robot-r1` default, `m25-athletic`, `f30-slim`, `f72-stooped`)
- [x] Integrate `rajio-taiso-0.1.0-draft.2` (updated `exercise-figures-runtime.js`, sideways `arm-swings`, chair-supported `leg-swings`)
- [ ] (`waiting on upstream`) Integrate next `rajio-taiso` draft with `chair` variants and remaining 3 cast members (`m50-heavier`, `f50-fuller`, `m75-slim`)
- [ ] (`waiting on upstream`) Integrate remaining series animation packs (`tai-chi-morning-series`, `shinrin-yoku-series`)

### `openScriptAudio` Repo (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/openScriptAudio`)
- [x] Implement `/audio/cues/<voiceId>/manifest.json` loader, `variants` + `@n` non-repeating selection, `Woman`/`Man` voice toggle, and 3-channel mixer
- [ ] (`waiting on upstream`) Integrate 13-cue Box Breathing `woman` & `man` voice packs once upstream delivery lands in `_inbound-from-openscriptaudio.md` (upstream TTS licensing check resolved 2026-11-24; `woman` v3 + `man` v1 built in `openScriptAudio/runs/`)
- [ ] (`waiting on upstream`) Integrate Rajio Taiso and remaining longevity series voice cue packs

---

## 🔧 Open Remediation & Verification Gaps (Priority Order)

### 1. Build & Type Safety (`closed`)
- [x] Resolve all TypeScript errors in `web-app/src/` (`npm run type-check` passes cleanly)
- [x] Resolve all ESLint errors (`npm run lint` passes with 0 errors)
- [x] Verify `npm run build` (`next build`) succeeds cleanly

### 2. Unit Tests & Coverage (`closed`)
- [x] Fix `Date` vs ISO string serialization/comparison in `ProfileRepository.test.ts` and `SessionRepository.test.ts`
- [x] Add Jest + RTL tests for `UnifiedTimerEngine`, `unifiedTimerStore`, `AudioCueService`, `BackgroundMusicService`, `SettingsView`, `ProgressView`, `BreathingVisualizer`, `ExerciseAnimationPlayer`, `UnifiedTimerDisplay`, `UnifiedProfileManager`, `RoutineEditorModal`, `SessionComposerModal`, `RoutineAudioModal`, `IconPicker`, and `app/page.tsx`
- [x] `npm --prefix web-app run test:ci` passes with coverage thresholds met (**20/20 suites, 102/102 tests; 80.2% statements, 82.48% lines**)

### 3. Consolidate Parallel Implementations (`closed`)
- [x] Legacy engines (`TimerEngine.ts`, `FocusTimerEngine.ts`), stores (`timerStore.ts`, `focusTimerStore.ts`), unused PWA/storage/worker dead files (`PWAStatusIndicator.tsx`, `useServiceWorker.ts`, `useSessionPersistence.ts`, `ServiceWorkerRegistration.ts`, `SessionPersistenceService.ts`, `BackgroundTimerWorkerService.ts`), and components (`TimerDisplay.tsx`, `FocusTimerDisplay.tsx`, `ProfileManager.tsx`) removed; `DESIGN.md` updated

### 4. PWA Assets & E2E Verification (`closed`)
- [x] Generate `/icon-192.png`, `/icon-192x192.png`, and `/icon-512.png` in `web-app/public/`
- [x] Reconcile duplicate service worker files: removed legacy `public/service-worker.js` in favor of `next-pwa` `public/sw.js` and added `buildExcludes: [/app-build-manifest\.json$/]` in `web-app/next.config.js` so SW precache/activation succeeds
- [x] Run live-browser UI & User Journey suites (`web-app/scripts/browser-ui-suite.js`, `web-app/scripts/browser-user-journeys.js`, tracked in `docs/TEST-CHECKLIST.md`)
- [x] Verify production build (`npm --prefix web-app run build`), `/sw.js` activation, and offline PWA reload in Chrome (`41/41` UI checks + offline reload verified)

### 5. Repo Hygiene & Docs (`closed`)
- [x] Update root `CLAUDE.md`, `.claude/CLAUDE.md`, and `GEMINI.md` to the `web-app/` PWA (`da3589e`, `a5c05a4`); untrack `.claude/settings.local.json` (`bb2ce08`)
- [x] Decide `focus_productivity_timer/`: **keep** for a possible future native Flutter build (operator decision, 2026-11-24)
- [x] Remove empty `TestRepo` template folders `cache/`, `cloud/`, `database/`, `vectordb/` (2026-11-24)
- [x] Remove the remaining `TestRepo` scaffold: `src/`, `tests/`, root `package.json`, `package-lock.json` (`b866bf3`, 2026-11-25)
- [x] Delete the root `node_modules/` (installed from the removed root `package.json`; gitignored), and re-run `web-app` checks (`type-check`, `lint`, `test:ci`) confirming nothing resolved from it (2026-11-25)
- [x] Clean up untracked scratch/generated files in repo root: old plans deleted; `graphify-out/`, `.graphifyprofiles.json`, port-registry links gitignored (`85abdc8`)

---

**Last Updated**: 2026-11-26
