```json frontmatter
{
  "spec_version": 1,
  "feature_id": "LL-CORE-001",
  "owner": "product",
  "title": "Japanese Longevity Exercises — Guided Web Experience",
  "status": "active",
  "related_documents": [
    "Design.md",
    "../japanese_longevity_exercise.pptx"
  ],
  "acceptance": [
    "User can start, pause, resume, skip, and restart the routine",
    "Sequence includes all 11 exercises in canonical order",
    "A pre-session 'home' screen shows a hero card, settings, and exercise preview",
    "An in-session view includes a sticky control dock and progress ring",
    "A summary screen appears after the 11th exercise",
    "All UI controls are keyboard accessible and screen-reader labeled"
  ],
  "nonfunc": {
    "accessibility": "WCAG 2.1 AA semantics and focus order",
    "performance": { "load_time_slow_3g_ms": 3000, "bundle_kb_max": 250 },
    "offline": true,
    "prepare_time_sec": [3, 5, 10],
    "privacy": "No PII; preferences stored locally only",
    "ui_consistency": "Pastel palette, pill-shaped controls, min 44x44px touch targets"
  }
}
```

# LiveLong Requirements Specification

This document defines the initial product requirements for the LiveLong web app, based on the canonical content in `japanese_longevity_exercise.pptx` and the JSON-first spec guidance in `MetadataSpecCodingGuide.md`.

---

## 1. Vision & Goals

- Provide a simple, accessible, and pleasant web experience that guides users through eleven gentle Japanese longevity exercises.
- Emphasize clarity, calm pacing, and safety cues suitable for older adults and caregivers.
- Keep implementation lightweight (vanilla web) with room to evolve into richer platforms later.

## 2. Users & Stakeholders

- Older adults seeking daily movement for strength, balance, independence.
- Caregivers/instructors who need a clear, step-by-step script and pacing.
- Product/design/engineering team maintaining content and accessibility.

## 3. Scope

In scope (v1):
- Canonical sequence of 11 exercises, each with title, short cues, and target duration.
- Start/Pause/Resume/Skip controls; progress across the session.
- A "prepare" state with a configurable duration (e.g., 3, 5, 10 seconds) between exercises.
- Settings for music, voice guidance, video, text size, and prepare time.
- Persistence of lightweight preferences in local storage only.

Out of scope (v1):
- Accounts, analytics, cloud sync, or data export.
- Custom routines or editing the exercise list.
- Advanced coaching, heart-rate integration, or camera-based form checks.

## 4. Content Canon (from PPTX)

Order and cues reflect slides and presenter notes in `japanese_longevity_exercise.pptx`.

1) Breathing — Kokyū Taiso
- Cues: Posture tall, hands on belly; inhale nose 4s, exhale mouth 6s; 10 breaths (~2 min).

2) Towel Twist — Tenugui Hibiki
- Cues: Hold towel shoulder‑width; twist right/left with relaxed shoulders; 10–15/side (~1.5 min).

3) Hand & Finger Mobility — Yubi Undō
- Cues: Open/close fists ×10; spread ×5; thumb taps each finger; 1–2 min.

4) Eye & Neck — Me no Taiso
- Cues: Eyes up/down/left/right ×2; circles; neck turns ×4/side; ~1.5 min.

5) Floor Sitting — Seiza Henka
- Cues: Stand → kneel/cross‑leg sit → stand; 3–5 reps (~2 min), support if needed.

6) Deep Squat — Shinku Zuwari
- Cues: Feet shoulder‑width; heels down; hold 3 breaths in squat; 5 reps (~2 min).

7) Gentle Resistance
- Cues: Light weights/bottles; curls + shoulder press; 8–10 reps each (~2 min).

8) Single‑Leg Standing — Ippon Ashi
- Cues: Near support; lift foot, hold 10s; 2 holds/side (~2 min).

9) Daily Stretching — Rajio Taiso
- Cues: Arm swings, side bends, light squats, heel raises, arm circles; 3‑min flow.

10) Slow Walking — Sanpo
- Cues: Inhale 2 steps, exhale 2 steps; upright posture; 4 min.

11) Cognitive‑Motor Drill
- Cues: March + count aloud; clap every 2nd step; say days; ~2.5 min.

Closing: Congratulate, encourage daily gentle practice; music can help rhythm and enjoyment.

## 5. Functional Requirements

- Session Flow: App plays the above sequence once per session.
- Exercise View: Displays title (EN + transliteration), concise cues, target duration or reps.
- Media: Each exercise can optionally include images and/or a video demo. A user setting chooses video when available, with graceful fallback to images.
- Timer: Counts down for time‑based items; for rep‑based items, provide a simple progress affordance.
- Controls: Start/Pause/Resume/Skip/Restart Session. The Skip button intelligently advances past the prepare state or the current exercise.
- Progress: Show step index (e.g., 3/11) and remaining total time (approximate).
- Music: Global toggle to play a bundled calm loop at low volume; remember preference.
- Voice Guidance: Optional text‑to‑speech (TTS) reads cues at the start of each exercise; remember preference.
- Completion: Show a summary screen with total time, exercises completed, and a restart option.
- Persistence: Store preferences in `localStorage` (no external calls or PII).

- Resume In‑Progress: Persist active session state (exercise index, remaining time, reps) and restore after refresh/crash with a “Resume?” prompt.
- Reminders: Optional, local reminder notifications for daily/weekly practice windows (time, days of week); user can snooze/disable.
- PWA Install: Provide install prompt and app icons; verify installed PWA works offline and resumes state.
- Export/Import: Allow users to export/import local data (preferences, history, goals, achievements) as a JSON file.

- Exercise Picker: From the home preview list, user can "Start here" on any exercise, beginning the routine at that point with correct step index and remaining time. In-session, a compact menu allows jump to any exercise.

### Voice Guidance (TTS) Behavior
- Speak only at state transitions (Prepare start; Exercise start) — not continuously.
- Verbosity setting: Brief (default, title + first cue) vs Full (all cues).
- Speed setting: Slow / Normal / Fast; default Normal (~0.95–1.0 rate).
- Pause/Resume semantics: On Pause, stop current utterance; on Resume, speak the next item; Safari/iOS fallback uses cancel + requeue.

### Breathing Pacer
- Audio tick: Soft tick at inhale/exhale boundaries (e.g., inhale 4s, exhale 6s, repeat) respecting user sound settings.
- Visual pacer: Simple animation (wave or expanding/contracting circle) synchronized to inhale/exhale timing; reduced-motion shows a progress bar and text cues instead.

### Breathing Card
- A dedicated “Breathing Card” appears for breathing exercises, centered above cues.
- The card shows a large, soothing visual (wave or circle) that expands/contracts with the configured pace, plus text prompts “Inhale” / “Exhale”.
- Optionally supports an animated image (SVG/Lottie/GIF) asset if provided in metadata; otherwise uses CSS/SVG animation.
- Pacer controls: on/off toggle for tick sound; optional speed presets (e.g., 4–6s default, 3–5s, 5–7s).

### Breathing Modes & Presets
- Modes: support multi‑phase breathing cycles (inhale, hold1, exhale, hold2) and render holds visibly.
- Presets available from a picker on the Breathing Card:
  - Box Breathing (4‑4‑4‑4)
  - 4‑7‑8 Breathing (4‑7‑8‑0)
  - 5/5 Breathing (5‑0‑5‑0)
  - Triangle Breathing (4‑4‑4‑0)
  - Wim Hof (guided): 30 deep breaths (~1.5s in/1.5s out), exhale hold 60s, inhale hold 15s (advanced; optional)
- Users can select a preset or custom timings; selection persists locally.

### Gamification & Goals

- XP & Levels: Award XP per exercise and per session; track level using thresholds; show level chip and XP ring.
- Badges: Unlock tiered badges (bronze/silver/gold) for streaks, session count, consistency, and variety.
- Streaks: Daily practice streak with one‑day grace recovery per 7 days.
- Incremental Goals: Users can adopt small, progressive goals (e.g., “3 sessions this week” → “4 sessions next week”). Goals have types (daily/weekly/once), targets, start/end dates, and optional auto‑progression.
- Celebration: On new level or badge or goal completion, show an accessible celebration animation (confetti burst + badge card) with reduced‑motion fallback.

## 6. Accessibility

- Semantics: Use landmarks (`header`, `main`, `footer`), roles, and labels for all controls.
- Keyboard: Full keyboard operability, visible focus states, logical tab order.
- Screen Readers: Each exercise view has an `aria-live` region for status; TTS option uses Web Speech API when available.
- Text Size: Setting to enlarge body text (e.g., 125%, 150%) without layout breakage.
- Motion Sensitivity: Avoid flashing/animated transitions; respect `prefers-reduced-motion`.
- Media: Provide alt text for images and a poster for videos when available; controls are keyboard-accessible; no auto-play with sound (muted or user-initiated).
- Contrast & Touch Targets: Maintain contrast ≥ 4.5:1 for text; hit targets ≥ 44×44px.
- Focus Management: Logical tab order, visible focus, and focus return after modals/celebrations.
- Captions: Optional short captions/subtitles for videos; descriptive poster images.
- Pacer & Motion: Breathing pacer respects `prefers-reduced-motion` and has a non-animated fallback with textual “Inhale/Exhale” prompts.
 - Celebrations: Provide a reduced‑motion mode where animation is replaced by a static “Congrats” card; ensure toasts are `aria-live="polite"` and dismissible.

## 7. Non‑Functional Requirements

- Performance: First load under 3s on slow 3G; total JS < 250 KB.
 - Performance Detail: LCP < 2.5s on mid‑tier mobile; avoid main thread long tasks > 50ms; keep interaction latency < 100ms.
- Reliability: Works offline after first load (static assets cached).
- SW Updates: Service worker uses a soft‑prompt update flow after cache refresh.
- Privacy: No accounts; no external tracking; only local preferences.
- Browser Support: Evergreen Chrome/Edge/Firefox/Safari; graceful degradation where APIs absent (e.g., TTS).
- Media Budget: Optimize demo media (e.g., H.264 MP4, ~720p ≤ 10–20 MB per clip) and images (≤ 200 KB typical) to keep load reasonable.
- Security: Strict CSP, no `eval`, SRI for any external assets, sanitize dynamic content.
- Observability (Opt‑In): Basic event logs (session start/complete, goal progress) behind explicit user consent; off by default.
- Dev Experience: Document how to bypass/clear SW cache during development; provide placeholder assets to avoid 404s; if supporting Safari < 14, provide a transpiled build (no optional chaining).
 - Animation Budget: Celebration effects render under 16ms per frame on mid‑range devices; GPU‑accelerate via transforms; avoid long‑running timers.

## 8. Data Model (Proposed JSON)

An exercise list can be represented as JSON to support metadata‑driven rendering and future validation.

```json
{
  "spec_version": 1,
  "routine_id": "jpn-longevity-001",
  "title": "Japanese Longevity Exercises",
  "exercises": [
    {
      "id": "breathing",
      "name": "Breathing — Kokyū Taiso",
      "type": "time",
      "duration_sec": 120,
      "cues": [
        "Posture tall, hands on belly",
        "Inhale nose 4s, exhale mouth 6s",
        "10 calm breaths"
      ]
    }
    // ... remaining 10 entries in canonical order ...
  ]
}
```

- Validates against `schema/routine.schema.json` via JSON Schema (draft 2020-12).

Media fields:
- Optional `media.images`: array of image paths (ordered).
- Optional `media.video`: object with `src` and optional `poster`.

Gamification data:
- Achievements: `src/data/achievements.json` validated by `schema/achievements.schema.json` defines XP, levels, badges, and triggers.
- Goals: `src/data/goals.json` validated by `schema/goals.schema.json` defines suggested incremental goals and auto‑progression.

## 9. Acceptance Criteria (Detail)

- Sequence Integrity: The 11 exercises render in the order defined above.
- Controls: Keyboard and pointer input can start/pause/skip; labels read correctly in screen readers.
- Music Toggle: Default off; when on, loops quietly and pauses with session pause.
- TTS: When enabled and supported, reads the exercise title and each cue sequentially, highlighting the active cue. Fallback is silent with no errors.
- Media Preference: If “Video demo” is enabled and the exercise has a valid video, show the `<video>` with controls; otherwise show images if present; if neither exists, hide media area.
- Media Navigation: When multiple images exist, Prev/Next buttons navigate and are keyboard-accessible; images include descriptive alt text.
- Persistence: Refreshing the page preserves all settings (music, TTS, video, text size, prepare time).
- Completion: After the last exercise, a summary view appears with stats and a restart CTA.
 - Resume: Reloading during a session offers to resume from last position; accepting restores exercise index and remaining time within 1s accuracy.
 - Reminders: User can schedule and receive local notifications at selected times/days; disabling stops future notifications.
- PWA: Install prompt appears in supported browsers; installed app runs offline and resumes state.
- Export/Import: Export produces a single JSON; import merges or replaces data as chosen, with confirmation and validation.
- XP & Levels: XP increments reflect actions; levels update immediately when threshold crosses.
- Badges: Unlock exactly once per badge tier; unlock UI lists newly earned badges.
- Goals: User can select from suggested goals and see progress; when a goal completes, celebration triggers and goal moves to “completed”; auto‑progressed goals roll to next target.
- Celebrations: Confetti and badge card appear for ≤ 2s, are dismissible, and respect `prefers-reduced-motion` by showing a static card only.
- Exercise Picker: "Start here" begins at the chosen exercise; jump menu navigates to any exercise; time remaining and step count update correctly.
- TTS: With Brief mode, only title + first cue spoken at exercise start; with Full mode, all cues are spoken once; Pause halts voice; Resume continues with next item; speech rate matches the chosen setting.
- Breathing Pacer: Audio ticks align with inhale/exhale boundaries; visual pacer motion matches timing; reduced-motion shows static cues without animation.
- Breathing Card: For breathing exercises, the card renders by default, displays current phase text, follows configured inhale/exhale durations within ±100ms over a cycle, and hides when leaving the exercise.
- Presets: Selecting a preset updates the sequence immediately and accurately (e.g., Box 4‑4‑4‑4 shows two holds of 4s); phase labels update (“Hold” visible during holds). Preset choice persists across reloads.

## 13. Accounts & Identity (Optional, Future Phases)

- Phase 0 — No Login: All data local; export/import provides backup and portability.
- Phase 1 — Local Profiles: Multiple profiles per device with optional PIN lock; no network or cloud.
- Phase 2 — Cloud Sync (Opt‑In): Passwordless email magic link or passkeys; sync preferences, history, goals, achievements across devices.

Acceptance (Accounts)
- Optional: App fully usable without sign‑in; “Sign in to sync” is optional.
- Passwordless: No passwords; email link or platform passkeys only.
- Data Scope: Clear list of synced fields; delete account removes server data within SLA.
- Multi‑Device: Conflict resolution is last‑write‑wins with UTC timestamps; local use never blocked by network failures.

## 14. Data & Privacy

- PII Minimization: No health or sensitive data by default; allow optional nickname/avatar only.
- Consent: Analytics/telemetry strictly opt‑in; consent stored with timestamp and scope.
- Retention: Define local and server retention (if accounts) and erasure workflows.
- User Controls: Export JSON, delete local data, delete server data (if accounts), and revoke consents.

## 10. Risks & Open Questions

- Audio Policy: Autoplay restrictions may block initial playback; require explicit user gesture before enabling music/TTS.
- TTS Availability: Web Speech API coverage varies; need clean fallback.
- Durations vs. Reps: Some exercises specify reps; timer UX should still feel consistent.
- Images: PPTX references images; decide on final asset set and licenses before shipping.

## 11. Implementation Notes (v1)

- Start with the current vanilla scaffold (`index.html`, `src/`); no framework required.
- Add a small JSON file for the routine and render dynamically.
- Use `aria-live` for status updates; ensure all control buttons have `aria-label`s.
- Consider a minimal service worker for offline caching of static assets.

## 12. Traceability

- Source content: `japanese_longevity_exercise.pptx` slides 1–14 and associated notes.
- Spec process and metadata guidance: `MetadataSpecCodingGuide.md`.
