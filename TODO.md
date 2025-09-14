# LiveLong Future Features

This file tracks potential features and enhancements for future versions of the LiveLong application.

## High Priority / Next Up

- **Celebration Animation**: Add accessible celebration on achievement unlock (confetti + badge/level card). Respect `prefers-reduced-motion`.
- **Incremental Goals**: Implement user‑adopted goals using `src/data/goals.json`; persist progress and support auto‑progression.
- **Visual Progress Bar**: Add a progress bar at the top or bottom of the card that fills as the user progresses through the total routine time.
- **Resume In‑Progress Session**: Persist exercise index, remaining time, and reps; prompt to resume on reload.
- **Local Reminders**: Schedule daily/weekly practice reminders with snooze/disable controls.
- **PWA Install & Icons**: Add install prompt, app icons, and verify offline behavior when installed.
- **Export/Import Data**: Local JSON backup/restore for preferences, history, goals, achievements.
- **Dev Fundamentals (Stability Pass)**:
  - Add placeholder assets to stop 404s (hero image, breathing/towel images, silent loop or WebAudio-only default).
  - Dev guidance to bypass/clear Service Worker cache (README section + script snippet).
  - Safari compatibility decision: require Safari ≥ 14 OR add a minimal transpiled build removing optional chaining.
- **Timer & Controls Reliability**: Verify tick loop runs on Start; ensure Pause/Resume actually halts/continues countdown; add lightweight debug logging toggle.
- **TTS Pacing & Preferences**: Speak only on state changes (prepare/exercise start). Add preferences for rate (Slow/Normal/Fast) and verbosity (Brief/Full). Ensure Pause cancels/holds and Resume requeues reliably (Safari-friendly).
- **Breathing Pacer (Audio + Visual)**: Add soft ticks at inhale/exhale boundaries and a synchronized “breath wave”/circle animation; respect reduce-motion and sound preferences.
- **Breathing Presets & Modes**: Support Box (4‑4‑4‑4), 4‑7‑8, 5/5, Triangle (4‑4‑4), and Wim Hof guided. Read from `src/data/pacer-presets.json`; expose a preset picker on the Breathing Card; persist choice.
- **Exercise Picker (Start Here)**: In the home preview list, add a “Start here” action per exercise; recompute remaining time and step count.

## Medium Priority

- **Achievements Engine**: Wire XP, levels, streak, and badges; expose toasts and badge grid.
- **Internationalization (i18n)**: Abstract all user-facing strings into a resource file to allow for future translations.
- **Advanced Theming**: Allow users to select from a few different color palettes beyond just light/dark.
- **"Workout Paused" Overlay**: Show a clear overlay on the screen when the workout is paused.
- **Accessibility Enhancements**: Enforce 4.5:1 contrast, 44×44px targets, focus management, and add video captions.
- **Security Hardening**: Add strict CSP, SRI for externals, audit for `eval`/dangerous constructs.
- **Observability (Opt‑In)**: Lightweight event logging for sessions, goals; gated by user consent.
- **Media Licensing Tracker**: Track usage rights/attribution for images and videos.
- **SW Update UX**: Implement soft‑prompt for new versions after cache refresh.
- **Exercise Jump Menu**: In-session list menu to jump directly to any exercise, with correct time/progress recalculation.
- **Pacer Controls**: Volume slider and on/off for tick; alternate pacer styles (wave/circle).
- **Box/Triangle Animations**: Add SVG animations for box path (with holds at corners) and triangle path.
- **TTS Voice Selection**: Allow choosing from available voices; remember per device.

## Low Priority / Future Vision

- **Custom Routines**: Allow users to create, save, and load their own exercise sequences.
- **Accounts — Phase 1 (Local Profiles)**: Multiple profiles on one device; optional PIN lock; no backend.
- **Accounts — Phase 2 (Cloud Sync)**: Optional passwordless login (magic link or passkeys) to sync across devices.
- **Advanced Analytics**: Track workout history, streaks, and other metrics (requires backend and privacy considerations).
- **Integrations**: Consider integrations with health platforms or wearables.
