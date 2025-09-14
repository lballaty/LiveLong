# LiveLong Future Features

This file tracks potential features and enhancements for future versions of the LiveLong application.

## High Priority / Next Up

- **Visual Progress Bar**: Add a progress bar at the top or bottom of the card that fills as the user progresses through the total routine time.

---

## Future Sprints / Epics

### UI Redesign v2 (Pastel/Pill Aesthetic)

A comprehensive redesign to create a soft, pastel, pill-shaped, and "carded" aesthetic.

#### `index.html` (Done)

- **Hero + Greeting (pre-session)**: Add a top "hero session card" under the header with a greeting, routine title/subtitle, a large rounded image/video banner, and a prominent "Start" CTA.
- **Info Chips**: Add three pill-shaped info chips below the hero banner (e.g., "Beginner", "~12 min", "Balance+Strength").
- **Settings as Pills**: Convert Music, Voice, and Video toggles into pill chips with icons and labels.
- **Text Size Control**: Convert the text size dropdown into a compact segmented control pill (100 / 125 / 150).
- **Exercise List Preview**: Before the session starts, show a short list of 3-5 upcoming exercises as rounded list items with thumbnails and durations.
- **In-Session Top Bar**: Replace the current title with a minimal bar: circular "Back" button (left), circular "Music" button (right), and a centered exercise title.
- **Media Area**: Make the media container a large, rounded rectangle (16-24px radius) and ensure video/images fill it using `object-fit: cover`.
- **Sticky Control Dock**: Replace the current controls with a sticky, neumorphic, rounded "control dock" floating at the bottom.
- **Dock Controls**: Center a large play/pause pill, flanked by circular Prev/Next buttons.
- **Progress & Timer**: Add a circular progress ring to the dock showing % complete and step count. Move the main timer into the dock.
- **Rep UI**: Integrate the "Rep +" button as a compact circular button near the play/pause toggle.
- **Accessibility**: Ensure all new icon buttons have descriptive `aria-label`s.

#### `src/styles.css` (Done)

- **Design Tokens**: Introduce CSS variables for a pastel palette (`--lavender`, `--mint`, `--blush`, etc.), new radii (`--r-lg: 24px`, `--r-pill: 999px`), and soft shadows.
- **Global Styles**: Set a light lavender gradient background. Update typography for a softer feel (larger weights, tighter letter-spacing). Constrain main width to ~420-480px.
- **Cards & Pills**: Implement a softer, neumorphic style for `.card`. Add utility classes for `.pill`, `.chip`, `.icon-btn`.
- **Hero Card**: Style the `.hero` section with a gradient background and an embedded media banner.
- **Control Dock**: Style the `.control-dock` as a sticky/fixed element with backdrop blur, soft shadow, and safe-area padding.
- **Progress Ring**: Implement a `.progress-ring` using a `conic-gradient` based on a `--progress` CSS variable.
- **Focus & Motion**: Add high-contrast focus outlines to all interactive elements and respect `prefers-reduced-motion`.

#### `src/main.js` (Done)

- **View States**: Add `mode-home` (pre-session) and `mode-session` body classes. Toggle between them to show/hide the hero view vs. the in-session UI.
- **Controls Logic**: Map existing Start/Pause/Skip/Restart logic to the new control dock buttons.
- **Progress Ring Update**: On each tick, compute the completion percentage and update the `--progress` CSS variable on the ring element.
- **Icon Toggles**: Connect the new Music/Voice/Video icon buttons to the existing preference logic, toggling an `.is-on` class.
- **Accessibility**: Ensure all state changes are announced to `aria-live` regions and the new UI is fully keyboard navigable.

#### `docs/` (Done)

- **Design.md**: Add a "Visual Design" section describing the new pastel palette, card shadows, pill controls, and motion guidelines.
- **Requirements.md**: Add acceptance criteria for the new UI components (sticky dock, hero card, progress ring, etc.) and accessibility standards (touch target size, contrast).

#### `Assets` (Done)

- **Icons**: Add new inline SVGs for Back, Music, Voice, Play/Pause, Prev/Next.
- **Media Posters**: Create pastel-friendly poster images for the hero and media cards.

---

## Medium Priority

- **Internationalization (i18n)**: Abstract all user-facing strings into a resource file to allow for future translations.
- **Advanced Theming**: Allow users to select from a few different color palettes beyond just light/dark.

## Low Priority / Future Vision

- **Custom Routines**: Allow users to create, save, and load their own exercise sequences.
- **User Accounts & Cloud Sync**: Add user accounts to sync preferences and progress across devices.
- **Advanced Analytics**: Track workout history, streaks, and other metrics (requires backend and privacy considerations).
- **Integrations**: Consider integrations with health platforms or wearables.