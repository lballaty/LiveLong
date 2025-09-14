# LiveLong Future Features

This file tracks potential features and enhancements for future versions of the LiveLong application.

## High Priority / Next Up

- **Wire `#paused-overlay`**: Connect the overlay to the pause/resume logic in `src/main.js` to satisfy e2e tests.
- **"Start Here" from Preview**: Enable starting the session from a specific exercise by clicking on it in the home screen preview list.
- **Linear Routine Progress Bar**: Add a linear progress bar at the top or bottom of the session view to show overall routine progress.
- **Web App Manifest + Icons**: Create a `manifest.json` file and add necessary app icons for PWA functionality.
- **PWA Install Prompt**: Implement logic to handle the `beforeinstallprompt` event to allow users to install the app.

---

## Medium Priority

- **Implement Goals Engine**: Add logic to track and display user progress against goals defined in `src/data/goals.json`.
- **Implement Achievements Engine**: Add logic for XP, levels, and badges based on `src/data/achievements.json`.
- **Polish Breathing Pacer**:
  - Implement animation variants for "Box" and "Triangle" styles.
  - Add a volume slider for the pacer tick sound.
  - Allow user to select pacer visual style (e.g., circle, wave).
- **Polish TTS Controls**:
  - Add UI for selecting speech rate (Slow/Normal/Fast) and verbosity (Brief/Full).
  - Improve TTS pacing to better align with exercise phases.
- **External Media Embeds**: Support embedding media from sources like YouTube (in privacy-enhanced mode) with a local image/video fallback for offline use.
- **Internationalization (i18n)**: Abstract all user-facing strings into a resource file to allow for future translations.
- **In-Session Jump Menu**: Add a menu during the session to allow jumping to any exercise.

## Low Priority / Future Vision

- **Resume In-Progress Session**: Persist active session state to `localStorage` and prompt user to resume on page load.
- **Local Reminders**: Implement local notifications for daily/weekly practice reminders.
- **Export/Import Data**: Allow users to export/import their local data (preferences, history, goals, achievements) as a JSON file.
- **Custom Routines**: Allow users to create, save, and load their own exercise sequences.
- **Advanced Theming**: Allow users to select from a few different color palettes beyond just light/dark.
- **User Accounts & Cloud Sync**: Add user accounts to sync preferences and progress across devices.
- **Advanced Analytics**: Track workout history, streaks, and other metrics (requires backend and privacy considerations).
- **Safari Transpile Fallback**: If supporting Safari < 14, provide a transpiled build.

---

## Completed (v2 Redesign & Features)

- **UI Redesign v2 (Pastel/Pill Aesthetic)**: A comprehensive redesign to create a soft, pastel, pill-shaped, and "carded" aesthetic.
- **Breathing Pacer (First Pass)**: Implemented circle-style visual pacer, phase labels, audio tick toggle, and preset picker.
- **Breathing Presets & Modes (First Pass)**: Data structure and UI for selecting different breathing patterns (e.g., Calm, Box) is in place.
- **Start/Stop Scripts**: Robust shell scripts for starting, stopping, and testing the application.
- **Service Worker & Offline Shell**: Basic offline functionality is in place.
- **Placeholder Assets & Dev Notes**: Project includes placeholder SVGs and detailed developer guidance in the README.