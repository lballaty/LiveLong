```json frontmatter
{
  "spec_version": 1,
  "feature_id": "LL-CORE-001",
  "owner": "engineering",
  "title": "LiveLong Web App — Architecture & Design",
  "status": "active",
  "requires": ["docs/Requirements.md"],
  "nonfunc": {
    "accessibility": "WCAG 2.1 AA",
    "performance": { "load_time_slow_3g_ms": 3000, "bundle_kb_max": 250 },
    "offline": true,
    "privacy": "No PII"
  }
}
```

# Design Overview

LiveLong is a static, client‑side web app (vanilla HTML/CSS/JS) that guides users through eleven Japanese longevity exercises. The app reads a JSON routine definition and renders a timed session with optional video or image media, ambient music, TTS cues, and persisted preferences. A service worker enables offline use after the first load.

---

## Architecture

- Delivery: Static assets served by any HTTP server; no backend required.
- Entry: `index.html` with semantic landmarks and ARIA attributes.
- UI: Minimal DOM structure with settings, exercise view, timer, controls, and progress.
- UI: The UI is split into three main views managed by the application class:
  - `home-view`: A pre-session screen with a hero card, settings, and exercise preview.
  - `session-view`: The active workout screen with media, cues, and a sticky control dock.
  - `summary-view`: A post-session screen displaying workout stats.
- Logic: A `LiveLongApp` class in `src/main.js` encapsulates the state machine, view management, media handling, preferences, and accessibility hooks.
- Data: Routine spec in `src/data/routine.json` validated by `schema/routine.schema.json`.
- Gamification: Achievements engine (XP/levels/badges) and Goals engine subscribe to app events.
- Offline: `sw.js` caches core assets and updates opportunistically.

---

## Visual Design

The application adopts a soft, modern aesthetic characterized by a pastel color palette, rounded shapes, and a "carded" layout.

- **Palette**: A light, calming palette based on lavender, mint, and blush tones. A corresponding dark theme is also available. Colors are defined as CSS custom properties for consistency.
- **Typography**: A clean, sans-serif font is used for readability. Headings have a slightly heavier weight and tighter letter-spacing.
- **Layout**: The main content is constrained to a mobile-first width (~480px) and centered on the page.
- **Cards & Pills**: UI elements are presented in "cards" with large corner radii (16-24px) and soft, neumorphic shadows. Interactive controls like toggles and buttons are styled as rounded "pills".
- **Control Dock**: The primary in-session controls are housed in a sticky, floating dock at the bottom of the screen, using a backdrop-blur effect for a modern, layered feel.
- **Motion**: Animations are minimal and purposeful, respecting the `prefers-reduced-motion` media query. Focus states are clear and high-contrast.

Key Files
- `index.html`: Container markup and controls.
- `src/styles.css`: Responsive and accessible styles; reduced motion friendly.
- `src/main.js`: State machine, timers, media, TTS, music, persistence.
- `src/data/routine.json`: Canonical exercise list and media metadata.
- `schema/routine.schema.json`: Routine JSON Schema.
- `sw.js`: Service worker with cache‑first strategy.

---

## Data Model

- Routine JSON structure defined in `schema/routine.schema.json`:
  - `exercises[].type`: `time` or `reps`.
  - `duration_sec` required for `time`; `target_reps` for `reps`.
  - Optional `media.images[]` and/or `media.video { src, poster? }`.
- Achievements defined in `src/data/achievements.json` validated by `schema/achievements.schema.json`.
- Goals suggestions in `src/data/goals.json` validated by `schema/goals.schema.json`.
- Source of truth for content and ordering; rendering is metadata‑driven.

---

## State Machine

State is managed within the `LiveLongApp` class in `src/main.js`.
- `state.appStatus`: The primary state (`idle`, `preparing`, `exercising`, `complete`).
- `state.currentIndex`: The index of the current or upcoming exercise.
- `state.remainingSec`: Ticks down for both `preparing` and `exercising` states.
- `state.totalRemainingSec`: The total time for the entire routine, including all prepare times.
- `state.timerId`: The handle for the 1-second `setInterval`.
- `state.isRunning`, `state.isPaused`: Flags for control availability and timer state.

Transitions
- `idle` (Home View) → (Start) → `preparing` (Session View)
- `preparing` → (Timer ends) → `exercising`
- `exercising` → (Timer ends or Reps complete) → `preparing` (for next exercise)
- `preparing` → (Skip) → `exercising` (skips countdown)
- `exercising` → (Skip) → `preparing` (for next exercise)
- `preparing` (last exercise) → (Timer ends) → `exercising` (last exercise)
- `exercising` (last exercise) → (Timer ends) → `complete`
- `complete` (Summary View) → (Restart) → `preparing` (Session View)
- `session-view` → (Back) → `idle` (Home View)

Timers & Reps
- A 1s interval (`_tick`) updates `remainingSec` and handles transitions between states.
- Reps UI increments `repCount` and advances automatically at target.

---

## Media Handling

- The `prefs.video` boolean toggles video preference.
- For each exercise:
  1. If video is preferred and `media.video.src` is defined, the `<video>` element's `src` is set. An `onerror` handler provides a graceful fallback.
  2. If video is not used, and `media.images` exist, the `<img>` element is shown.
  3. If no media is available, the media area is hidden. The new UI does not include image navigation; it only shows the first image.
- The `onerror` fallback for video will attempt to show images if the video file fails to load.

---

## Audio & TTS

- Music preference `LL_music` controls ambient sound:
  - The app attempts to load `src/assets/audio/calm-loop.mp3`. If it fails or times out, it falls back to a procedurally generated ambient sound using the Web Audio API.
- Voice guidance (`prefs.tts`) uses the Web Speech API. A queue-based system speaks the exercise title and each cue sequentially, applying a `.speaking` CSS class to the corresponding element for a visual indicator.
- Autoplay policy: audio starts only after Start button (user gesture).

---

## Accessibility

- Semantics: `header`, `main`, `footer`; control labels and `aria-live` regions for timer/status/media.
- Keyboard: All controls, including those in the sticky dock, are focusable with visible focus states and a logical tab order.
- Screen readers: Status updates via `aria-live`; TTS optional and user‑controlled.
- Text scaling: Preferences add root classes to increase text size (125%, 150%).
- Reduced motion: Avoid animated transitions; respect `prefers-reduced-motion`.
- Media: Images include alt; video uses poster when available; no auto‑play with sound.

---

## Performance

- Budget: Initial load < 3s on slow 3G; total JS < 250 KB.
- Strategies:
  - No framework; minimal DOM work each tick.
  - Lazy media: no preloading heavy assets; check existence on demand.
  - Cache core files in `sw.js`; rely on HTTP caching for media.
  - Keep images optimized (≤ 200 KB typical, responsive sizes) and video ~720p, ≤ 10–20 MB.

---

## Offline & Caching

- `sw.js` pre‑caches `index.html`, CSS, JS, and `src/data/routine.json`.
- Cache‑first with network update; media requests are network‑first to avoid bloating cache.
- Safe to refresh while offline after the first load.

---

## Preferences & Persistence

- Stored in `localStorage`:
  - `LL_music`, `LL_tts`, `LL_textSize`, `LL_video`, `LL_prepareTime`.
- Applied on init; changes persist immediately.

---

## Error Handling & Resilience

- Routine load failures announce via status and console.
- Media missing: silently falls back to available type or hides media area.
- Audio/TTS failures caught and ignored without blocking UI.

---

## Validation & Tooling

- Routine JSON validated against `schema/routine.schema.json` (recommend CI step with `ajv`).
- Achievements JSON validated against `schema/achievements.schema.json`.
- Goals JSON validated against `schema/goals.schema.json`.
- Requirements traceability: Each functional/non‑functional requirement has a corresponding design section above.

---

## Testing Plan

- Manual checks:
  - View transitions (Home → Session → Summary → Home).
  - All interactions in the sticky control dock (Play/Pause, Next, Prev, Restart) and their keyboard operability.
  - Timer and progress ring correctness.
  - Reps increment and auto‑advance.
  - Media toggle behavior with and without assets present.
  - Preferences persistence across reloads.
  - Offline reload after first visit.
- Accessibility review with screen reader (VoiceOver/NVDA) and keyboard‑only navigation.

---

## Risks & Mitigations

- Autoplay restrictions: Require user gesture; keep audio muted on video by default.
- TTS variability: Provide graceful no‑op when unsupported.
- Media size: Document budgets; compress assets before adding.
- Browser differences: Target evergreen browsers; feature‑detect APIs and fallback.

---

## Goals Engine

- Purpose: Track user‑adopted incremental goals (daily/weekly/one‑time) with targets and optional auto‑progression.
- Data: `src/data/goals.json` defines suggested goals; user‑selected goals and progress persist in `localStorage` under `LL_goals_v1`.
- Types: `daily_minutes`, `weekly_sessions`, `session_count`, `streak_days`.
- Progress: Computed from session history; history persisted as compact records `{date, sessionsCompleted, minutes}`.
- Auto‑progression: When a goal completes and has `nextTarget`, roll to the next target within the same goal family.
- UI: Home shows current goals as pill cards with small progress bars; completion triggers celebration.
- Validation: `schema/goals.schema.json` for file structure; levels and XP policies live in `src/data/achievements.json` (future).

## Achievements Engine

- Purpose: Provide intrinsic motivation with gentle rewards (XP, levels, badges) and track streaks.
- Data: `src/data/achievements.json` controls XP policy, level thresholds, and badge definitions.
- Events: Listens to `exercise_complete`, `session_complete`, `day_open`, `goal_complete`.
- XP: Adds per‑exercise and per‑session XP; applies streak bonuses; respects optional daily cap; persists in `localStorage` (`LL_xp_v1`).
- Levels: Derived from XP and the `levels[]` thresholds; persists level snapshot and progress.
- Badges: Unlocks tiers when triggers meet thresholds; non‑repeatable badges unlock once, repeatable may unlock per window (e.g., weekly variety); stored in `LL_badges_v1`.
- Streaks: Maintains a day‑by‑day log to compute current streak; supports 1‑day grace per 7 days for older users.
- UI: Level chip on the hero/home; XP ring progress; badge grid page/modal; toasts on unlock; celebration animation hooks.

## Celebration Animation

- Triggered on: level up, badge unlock, goal completion, and long streak milestones.
- Visuals: Confetti burst (Canvas or CSS particles), a badge/level card with gentle scale‑in, and a subtle glow behind.
- Duration: ≤ 2 seconds, user‑dismissible via a close button or clicking outside.
- Performance: Use GPU‑accelerated transforms; batch DOM changes; throttle confetti count on low‑end devices.
- Accessibility: Respect `prefers-reduced-motion` → replace with static card and sound off by default; announce via `aria-live`.
