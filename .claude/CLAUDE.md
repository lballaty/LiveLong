# LiveLong ⊹ - Project Development Standards

## Project Overview
LiveLong is an offline-first Progressive Web App for longevity practice: focus timers, guided breathing, and exercise series (Rajio Taiso, Tai Chi, Shinrin-yoku, Ikigai, Zazen). The app lives in `web-app/` and runs entirely in the browser with no backend.

The earlier Flutter prototype (`focus_productivity_timer/`) and the `TestRepo` Node/Supabase scaffold are **superseded**. Do not follow Flutter, SQLite, or Supabase patterns from them. `docs/DESIGN.md` is the canonical architecture record.

## Tech Stack (ENFORCED)

- **Framework:** Next.js 14 (App Router), React 18, TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **State:** Zustand
- **Persistence:** IndexedDB via `idb`, plus `localStorage` for small settings
- **Offline:** `next-pwa` service worker; `web-app/public/timer-worker.js` for background timing
- **Audio:** Web Audio API chimes and optional Web Speech API voice cues (`AudioCueService`)
- **Tests:** Jest + React Testing Library + `fake-indexeddb` (unit/integration), Playwright (E2E, desktop and mobile)

Do not add a backend, a server database, or a new state library without a design decision recorded in `docs/DESIGN.md`.

## Directory Structure

```
web-app/
├── src/
│   ├── app/          # Next.js App Router entry (page.tsx renders UnifiedTimerDisplay)
│   ├── components/   # Feature UI: breathing, exercises, profiles, progress, pwa, settings, timer
│   ├── data/         # Static practice data (breathing patterns/profiles, exercise series)
│   ├── hooks/        # React hooks
│   ├── services/     # audio, database, pwa, repositories, storage, timer
│   ├── store/        # Zustand stores
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Helpers
├── e2e/              # Playwright: tests/, fixtures/, helpers/
└── public/           # PWA manifest, icons, timer worker
```

Unit tests sit next to the code in `__tests__/` folders.

## Active Implementation (build on these)

The 4-view shell (Practice, Practices, Progress, Settings) runs on the `Unified*` path:
- `services/timer/UnifiedTimerEngine.ts`
- `store/unifiedTimerStore.ts`
- `components/timer/UnifiedTimerDisplay.tsx`
- `components/profiles/UnifiedProfileManager.tsx`
- `types/unified-profile.types.ts`

Older parallel engines, stores, displays, and profile managers still exist. `docs/DESIGN.md` → *Known Architectural Consolidation Gap* lists them. Do not extend the legacy paths; extend the `Unified*` path, and remove legacy code only as an explicit, tested consolidation task.

## Coding Standards

- Descriptive, intention-revealing names (`remainingDurationSeconds`, not `rem`).
- Every new file starts with a header comment: File, Description, Author, Created.
- Function components with typed props; no `any` in new code.
- Keep timer accuracy independent of render frequency: derive remaining time from timestamps, not tick counts.
- Persist through the repository/service layer (`services/repositories`, `services/storage`), not directly from components.
- Errors must be surfaced to the user with a clear message and recorded through the app's logging path; never swallow them silently.

## Testing Requirements (ENFORCED)

Follow `.claude/testing-rules.md` and `web-app/TESTING_REQUIREMENTS.md`. Minimum before any commit:

```bash
npm --prefix web-app run type-check
npm --prefix web-app run lint
npm --prefix web-app run test:ci
npm --prefix web-app run test:e2e
```

Required coverage areas:
- **Timer accuracy:** countdown stays correct across pause/resume and backgrounding.
- **Offline:** all core features work with no network.
- **Persistence:** sessions and profiles survive reloads (IndexedDB).
- **Mobile:** Playwright mobile projects pass (`test:e2e:mobile`).

## Performance Standards

- First load fast on a mid-range phone; no layout shift in the timer view.
- Smooth animations (target 60 FPS); pause non-essential animation when the tab is hidden.
- IndexedDB reads/writes for typical operations under 100 ms.

## Quality Gates (ENFORCED)

Before any commit:
1. Type-check, lint, unit, and E2E tests pass.
2. Behaviour verified in a real or headless browser with no console errors.
3. Offline functionality verified.
4. Docs updated when behaviour or architecture changes.
