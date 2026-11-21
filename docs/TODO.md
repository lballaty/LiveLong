# TODO

**Canonical Task & Gap Tracker for LiveLong ⊹ (`web-app/`)**

> **Source-of-Truth Note:** `docs/TODO.md` is the single canonical tracker for this repository.
> - `web-app/TODO.md` is a historical sprint log from 2025-09-30 and is **superseded** by this file.
> - `focus_productivity_timer/` (Flutter prototype) and root `TestRepo` bootstrap files (`package.json`, `src/`, `tests/`, `cache/`, `cloud/`, `database/`, `vectordb/`) are **superseded** by `web-app/`.

---

## 📊 Verified Baseline (`2026-11-21`, branch `feature/unified-profile-system` @ `d347225` + local changes)

- `npm --prefix web-app run type-check`: **PASS** — 0 TypeScript errors
- `npm --prefix web-app run lint`: **PASS** — 0 ESLint errors (6 pre-existing React Hook warnings)
- `npm --prefix web-app run build`: **PASS** — Next.js 14 production build + `next-pwa` service worker compiled cleanly
- `cd web-app && npx jest --ci --maxWorkers=2`: **PASS** — 4/4 suites, 37/37 tests passing (note: `test:ci` 80% global coverage threshold still not met until `Unified*` unit tests are added)
- `cd web-app && npx playwright test e2e/tests/timer/timer-basic.spec.ts --project=chromium`: **PASS** — 4/4 smoke tests passing (`UnifiedTimerDisplay` 4-view navigation, Rajio Taiso animation slot, standing/chair + front/side/both toggles, start/pause/resume/stop)

---

## ✅ Completed (Closed)
- [x] Pivot from Flutter prototype (`focus_productivity_timer/`) and Node bootstrap to Next.js 14 PWA (`web-app/`)
- [x] Implement IndexedDB persistence (`IndexedDBService`, `ProfileRepository`, `SessionRepository`) and `localStorage` session recovery (`SessionPersistenceService`)
- [x] Implement unified profile system (`UnifiedProfile`, `UnifiedTimerEngine`, `UnifiedTimerDisplay`, `UnifiedProfileManager`)
- [x] Implement breathing patterns (`Box Breathing`, `4-7-8`, `Deep Breathing`, `Wim Hof`) and Japanese longevity series (`Rajio Taiso`, `Tai Chi`, `Shinrin-yoku`, `Ikigai`, `Zazen`)
- [x] Configure Playwright (`web-app/playwright.config.ts`) and author 10 E2E spec files under `web-app/e2e/tests/`
- [x] Fix all 14 TypeScript errors, 18 ESLint errors, and Jest repository test failures (`type-check`, `lint`, `next build`, and 37/37 Jest tests passing)
- [x] Generate `/icon-192.png`, `/icon-192x192.png`, and `/icon-512.png` in `web-app/public/`
- [x] Build 4-view LiveLong PWA shell (`Practice`, `Practices`, `Progress`, `Settings`), wire `BreathingVisualizer`, `AudioCueService` (Web Audio + Web Speech), `SessionRepository` progress tracking, and `ExerciseAnimationPlayer` slot for `animation` fleet bundles
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
- [ ] Update root `CLAUDE.md` and `GEMINI.md` (still reference `TestRepo`, `pytest`, `Supabase`, `ChromaDB`, `Redis`)
- [ ] Decide whether to archive/remove legacy `TestRepo` root directories (`src/`, `tests/`, `cache/`, `cloud/`, `database/`, `vectordb/`) and `focus_productivity_timer/`
- [ ] Clean up untracked scratch/generated files in repo root (`plans/plan-reconciliation.yaml` still references old `TestRepo` path)

---

**Last Updated**: 2026-11-21
