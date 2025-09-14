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

## Low Priority / Future Vision

- **Custom Routines**: Allow users to create, save, and load their own exercise sequences.
- **Accounts — Phase 1 (Local Profiles)**: Multiple profiles on one device; optional PIN lock; no backend.
- **Accounts — Phase 2 (Cloud Sync)**: Optional passwordless login (magic link or passkeys) to sync across devices.
- **Advanced Analytics**: Track workout history, streaks, and other metrics (requires backend and privacy considerations).
- **Integrations**: Consider integrations with health platforms or wearables.
