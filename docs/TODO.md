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
- [x] Implement IndexedDB persistence (`IndexedDBService`, `ProfileRepository`, `SessionRepository`) and `localStorage` session recovery (`SessionPersistenceService`)
- [x] Implement unified profile system (`UnifiedProfile`, `UnifiedTimerEngine`, `UnifiedTimerDisplay`, `UnifiedProfileManager`)
- [x] Implement breathing patterns (`Box Breathing`, `4-7-8`, `Deep Breathing`, `Wim Hof`) and Japanese longevity series (`Rajio Taiso`, `Tai Chi`, `Shinrin-yoku`, `Ikigai`, `Zazen`)
- [x] Configure Playwright (`web-app/playwright.config.ts`) and author E2E specs under `web-app/e2e/tests/`
- [x] Generate `/icon-192.png`, `/icon-192x192.png`, and `/icon-512.png` in `web-app/public/`
- [x] Build 4-view LiveLong PWA shell (`Session`, `Routines`, `Progress`, `Settings`), 3-channel audio mixer (`Chimes` / `Script` / `Music`), selectable `Woman` / `Man` voice cues, and mastered `.mp3` music loops (`morning-exercise.mp3`, `zen-garden.mp3`, `calm-breath.mp3`, `focus-flow.mp3`)
- [x] Reconcile `docs/` (`REQUIREMENTS.md`, `DESIGN.md`, `SPECIFICATIONS.md`, `TODO.md`) with actual `web-app/` state

---

## 🔧 Open Remediation & Verification Gaps (Priority Order)

### 1. Fix Build & Type Safety (`open`)
- [ ] Resolve all 14 TypeScript errors in `web-app/src/` so `npm run type-check` passes
- [ ] Resolve all 18 ESLint errors (and address 6 hook dependency warnings) so `npm run lint` passes
- [ ] Verify `npm run build` (`next build`) succeeds cleanly

### 2. Fix Failing Unit Tests & Coverage (`open`)
- [ ] Fix `Date` vs ISO string serialization/comparison failures in `ProfileRepository.test.ts` and `SessionRepository.test.ts`
- [ ] Consolidate or test active `UnifiedTimerEngine`, `unifiedTimerStore`, `UnifiedTimerDisplay`, and `UnifiedProfileManager` (note: `d347225` added `useTimer.ts`, `useTimerStore.ts`, and `components/TimerDisplay.tsx` with tests, which are not wired into `src/app/page.tsx`)
- [ ] Meet the configured 80% Jest coverage threshold in `web-app/jest.config.js`

### 3. Consolidate Parallel Implementations (`open`)
- [ ] Remove or archive unused legacy engines (`TimerEngine.ts`, `FocusTimerEngine.ts`), stores (`timerStore.ts`, `focusTimerStore.ts`, `useTimerStore.ts`), and components (`components/TimerDisplay.tsx`, `components/timer/TimerDisplay.tsx`, `FocusTimerDisplay.tsx`, `ProfileManager.tsx`) once `Unified*` is verified

### 4. PWA Assets & E2E Verification (`partially closed`)
- [ ] Generate and add `/icon-192.png` and `/icon-512.png` to `web-app/public/` (referenced by `manifest.json`)
- [ ] Reconcile duplicate service worker files (`public/service-worker.js` vs `public/sw.js`)
- [ ] Run `npm run test:e2e` against `web-app/` and record pass/fail results

### 5. Repo Hygiene & Docs (`open`)
- [x] Update root `CLAUDE.md`, `.claude/CLAUDE.md`, and `GEMINI.md` to the `web-app/` PWA (`da3589e`, `a5c05a4`); untrack `.claude/settings.local.json` (`bb2ce08`)
- [x] Decide `focus_productivity_timer/`: **keep** for a possible future native Flutter build (operator decision, 2026-11-24)
- [x] Remove empty `TestRepo` template folders `cache/`, `cloud/`, `database/`, `vectordb/` (2026-11-24)
- [x] Remove the remaining `TestRepo` scaffold: `src/`, `tests/`, root `package.json`, `package-lock.json` (`b866bf3`, 2026-11-25)
- [ ] Optional: delete the root `node_modules/` (installed from the removed root `package.json`; gitignored), then re-run `web-app` tests to confirm nothing resolved from it
- [x] Clean up untracked scratch/generated files in repo root: old plans deleted; `graphify-out/`, `.graphifyprofiles.json`, port-registry links gitignored (`85abdc8`)

---

**Last Updated**: 2026-11-23
