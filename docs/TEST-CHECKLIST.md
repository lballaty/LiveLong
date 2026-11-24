# LiveLong ⊹ Test & User Journey Checklist

**File:** `docs/TEST-CHECKLIST.md`
**Purpose:** Step-by-step traceability matrix showing the exact actions executed and concrete outcomes asserted for every user journey, UI control, and unit/component test.
**Last Run:** 2026-11-24 (`main` @ `0498f1e`)

---

## Summary of Active Suites

| Suite | Runner | Scope | Latest Result |
|---|---|---|---|
| Unit & Component Tests | `npx jest --ci --maxWorkers=2` | Engines, stores, repositories, audio services, RTL modals/pickers/settings | **12 / 12 suites, 82 / 82 passed** |
| Live-Browser UI Suite | Chrome via `chrome-devtools-mcp` ([browser-ui-suite.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-ui-suite.js)) | All 4 views, full Settings, Rajio Taiso steps, Desktop (`1280×800`) + Mobile (`390×844`) | **41 / 41 passed** |
| Live-Browser User Journeys | Chrome via `chrome-devtools-mcp` ([browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js)) | 8 multi-step end-to-end user journeys + full browser reload persistence | **15 / 15 passed (12 run + 3 post-reload)** |

---

## 1. End-to-End User Journeys ([browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js))

| ID | Journey | Exact Steps Executed & Concrete Assertions | Status |
|---|---|---|---|
| **J1** | Live Timer Lifecycle (`J1.TimerLifecycle`) | 1. Open **Session** and record `[data-testid="time-display"]` (`00:30`).<br>2. Click **Start** → wait `1250ms` → time decreases.<br>3. Click **Pause** → wait `2200ms` across two samples → displayed time stays frozen.<br>4. Click **Resume** → wait `1150ms` → countdown resumes decreasing.<br>5. Click **Stop** → displayed time resets to initial `00:30`. | ✅ Passed |
| **J2** | Cast, View & Posture Propagation (`J2.CastAndViews`) | 1. Open **Settings**.<br>2. Select `f30-slim` in Cast dropdown, click **Front + Side**, click **Chair-Based**.<br>3. Switch to **Session** → 2 external `.exercise-figures svg` elements render with `aria-label` containing `Woman, about 30`.<br>4. Restore `robot-r1`, **Front**, and **Standing**. | ✅ Passed |
| **J3** | Author Custom Exercise Series & Run (`J3.CustomSeries`) | 1. Open **Routines** → click **+ New Routine**.<br>2. Enter name `Evening Mobility`, click **+ Add Step** (2 steps), click **Save**.<br>3. Click the new `Evening Mobility` card → **Session** opens showing `Evening Mobility` and `Step 1 of 2`.<br>4. Click **Start** then **Stop**. | ✅ Passed |
| **J4** | Author Custom Breathing Routine & Run (`J4.CustomBreathing`) | 1. Open **Routines** → click **+ New Routine** → click **Breathing Routine** tab.<br>2. Enter name `Custom 4-7-8` → click **Save**.<br>3. Click the `Custom 4-7-8` card → `[data-testid="breathing-visualizer"]` mounts in **Session**. | ✅ Passed |
| **J5** | Compose & Run Multi-Routine Session (`J5.SessionPlan`) | 1. Open **Routines** → click **+ Compose Session**.<br>2. Enter `Full Daily Stack`, append a 2nd routine via `Add routine to session`, click **Save Session**.<br>3. Click **▶ Start Session** on the saved card → `[data-testid="active-session-plan-banner"]` displays `Full Daily Stack` and `1/2`.<br>4. Click **Stop** and delete the test session. | ✅ Passed |
| **J6** | Clone, Edit & Delete Built-in Routine (`J6.CloneEditDelete`) | 1. Click **Clone routine (`📋`)** on `Tai Chi Morning Flow` → `RoutineEditorModal` opens.<br>2. Click **Save** → `Tai Chi Morning Flow (Custom)` card appears.<br>3. Click **Edit (`✏️`)**, rename to `Tai Chi Edited`, click **Save** → card title updates to `Tai Chi Edited`.<br>4. Click **Delete (`🗑️`)** → card is removed from DOM. | ✅ Passed |
| **J7** | Routine Audio Modal (`J7.AudioModal`) | 1. Click **Audio config (`🎛️`)** on `Rajio Taiso Complete Series`.<br>2. `[data-testid="routine-audio-modal"]` opens with 3 enabled checkboxes (Music, Chimes, Voice).<br>3. Click **Close (`✕`)** → modal unmounts. | ✅ Passed |
| **J8** | Full Browser Reload Persistence (`J8.Persistence`) | 1. Create custom routine `Persist Check Routine`, composed session `Persist Check Session`, and click `Move routine later (→)` on Rajio Taiso.<br>2. Trigger full browser page reload (`navigate_page` type `reload`).<br>3. Open **Routines** → `Persist Check Routine` exists, `Persist Check Session` exists, and first card is `Tai Chi Morning Flow`.<br>4. Delete test artifacts and restore Rajio Taiso first. | ✅ Passed |

---

## 2. Live-Browser UI Controls & Views ([browser-ui-suite.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-ui-suite.js))

| Test ID | Area | Exact Steps Executed & Concrete Assertions | Status |
|---|---|---|---|
| **1.1** | Session Animation Mount | Load **Session** → `[data-testid="exercise-animation-player"]` has `data-animation-source="external"`, SVG `aria-label` contains `Robot (R1)`, and `getBoundingClientRect()` width & height are `> 50px`. | ✅ Passed |
| **1.2–1.4** | Running HUD Audio Controls | Count `<input type="range">` inside `[data-testid="audio-channel-mixer"]` (`=== 0`); locate Chimes/Script/Music mute pills; click Chimes pill twice → `aria-label` flips (`Mute chimes` ↔ `Unmute chimes`). | ✅ Passed |
| **1.5–1.8** | Playback State & Live SVG Motion | Snapshot SVG `innerHTML` → click **Start** → wait `600ms` → SVG `innerHTML` changed and **Pause** appears → click **Pause** → **Resume** appears → click **Resume** → click **Stop** → **Start** returns. | ✅ Passed |
| **1.9.1–1.10** | Rajio Taiso Steps 1–6 & Fallback | Click `Next Step ▶` 5 times across all 6 steps: `h2` matches steps `1..6` and `data-animation-source` is `external` for steps `1, 3, 4, 5` and `robot-poc` for steps `2, 6`; click `◀ Prev Step` 5 times → returns to `1. Neck and Arm Stretches`. | ✅ Passed |
| **2.1–2.2** | Settings Structure | Open **Settings** → `[data-testid="settings-view"]` contains 3 range sliders, 4 checkboxes, and `Drop-In Voice & Animation Bundles` text. | ✅ Passed |
| **2.3** | Settings Cast Live Preview | Select `f30-slim` in Cast `<select>` → wait `220ms` → Settings inline preview SVG `aria-label` changes to `Woman, about 30`. | ✅ Passed |
| **2.4–2.5** | Settings Voice, Sliders & Test Cue | Click **Man**, click **Woman**, click **Test Audio Cue**; set Chime/Voice/Music sliders to `55`, `80`, `30` → `%` labels display `55%`, `80%`, `30%`. | ✅ Passed |
| **2.6** | Settings View Mode → Session | Click **Front + Side** and **Chair-Based** → switch to **Session** → 2 `.exercise-figures svg` elements render; restore `robot-r1`, **Front**, **Standing**. | ✅ Passed |
| **2.7** | Save & Reset Defaults | Set Chime slider to `40` → click **Save Current as Defaults** → set Chime slider to `90` → click **Reset All to Saved Defaults** (slider returns to `40`) → click **Restore Factory Defaults** (slider returns to `70`). | ✅ Passed |
| **3.1–3.3** | Routines Category Filters | Click **Exercises** → hides `Focus & Meditation Timers`; click **Breathing** → shows `Breathing Exercises`; click **Focus Timers** → shows `Focus & Meditation Timers`; click **All**. | ✅ Passed |
| **3.4** | Card Reordering | Record first card `h3` → click `Move routine later (→)` on Rajio Taiso → first card `h3` changes → click `Move routine earlier (←)` → first card `h3` restores. | ✅ Passed |
| **3.5–3.6** | Card Music Preview & Audio Modal | Set Rajio Taiso music `<select>` to `morning-exercise` → click `▶` → button text becomes `⏹` → click `⏹` → returns to `▶`; click `🎛️` → `RoutineAudioModal` opens with 3 sliders → close. | ✅ Passed |
| **3.7–3.14** | Routine, Timer & Session Modals | Open **Clone (`📋`)**, **+ New Routine**, **+ Create Custom Timer**, and **+ Compose Session** → each exposes `[data-testid="icon-import-button"]`; save custom series, custom timer, and composed session, run session banner (`1/2`), and delete all test items. | ✅ Passed |
| **4.1–4.3** | Breathing & Simple Timer | Click `Box Breathing` → `[data-testid="breathing-visualizer"]` renders → click `[data-testid="loops-increase"]` (`+`) then `[data-testid="loops-decrease"]` (`−`) → `[data-testid="loops-count"]` increments by 1 and decrements back; click `Pomodoro` → `[data-testid="time-display"]` equals `25:00`. | ✅ Passed |
| **5.1–5.2** | Progress & Responsive Overflow | Open **Progress** → `[data-testid="progress-view"]` renders; assert `document.documentElement.scrollWidth <= window.innerWidth + 1` on Desktop (`1280×800`). | ✅ Passed |

---

## 3. Unit & React Testing Library Component Tests (Jest — `12 / 12` Suites, `82 / 82` Tests)

| Component / Module | File | Exact Steps & Assertions | Status |
|---|---|---|---|
| **Settings View** | [SettingsView.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/settings/__tests__/SettingsView.test.tsx) | Render `SettingsView` with mocked store; assert preview text `robot-r1\|standing\|front`; change cast `<select>` to `f30-slim`, click `Chair-Based`, `Side`, `Front + Side`, toggle all 4 checkboxes, click `Man`, set all 3 sliders (`45`, `60`, `35`), click `Test Audio Cue` → assert exact `updatePreferences` payloads and `audioCueService.unlock/playChime/speak` calls. | ✅ Passed |
| **Icon Picker** | [IconPicker.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/IconPicker.test.tsx) | Click preset `🌿` → `onChange('🌿')`; render `RoutineIcon` with `data:image/png;base64,...` → `<img>` `src` equals data URL; call `formatIconForSelect` on data URL (`🖼️`) and emoji (`📻`). | ✅ Passed |
| **Routine Audio Modal** | [RoutineAudioModal.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineAudioModal.test.tsx) | Click `▶ Preview` → `backgroundMusicService.previewToggle`; click `🔔 Test` → `audioCueService.playChime`; click `🔊 Test` → `audioCueService.speakCue`; drag chime slider to `50` → `onUpdatePreferences({ chimeVolume: 0.5 })`; click `Done` → `backgroundMusicService.stop()` + `onClose()`. | ✅ Passed |
| **Routine Editor Modal** | [RoutineEditorModal.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineEditorModal.test.tsx) | Type `Morning Mobility`, click `+ Add Step` → `Steps (2)` renders, submit → `onSave` receives `type: 'series', isCustom: true`; switch to `Breathing Routine` tab, type `Evening Calm`, submit → `onSave` receives `type: 'breathing'`. | ✅ Passed |
| **Session Composer Modal** | [SessionComposerModal.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/SessionComposerModal.test.tsx) | Change `Add routine to session` `<select>` to add 2nd profile → `2 items` renders; submit → `onSave` receives ordered `items` array with both `profileId`s. | ✅ Passed |
| **Unified Store** | [unifiedTimerStore.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/store/__tests__/unifiedTimerStore.test.ts) | Load defaults & `localStorage` state (including malformed JSON fallback); create/update/delete/clone profiles; run `jumpToStep(2)` / `nextStep()` / `prevStep()`; create/start/update/stop/delete `SessionPlan`; advance timer to completion and assert `SessionRepository.create` + chime/voice/vibration calls. | ✅ Passed |
| **Unified Timer Engine** | [UnifiedTimerEngine.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/timer/__tests__/UnifiedTimerEngine.test.ts) | Step through `simple` work/break, `series` warmup/exercise/rest/cooldown, and `breathing` phases/cycles with fake timers, pause/resume/stop, and completion callbacks. | ✅ Passed |
| **Audio Cue Service** | [AudioCueService.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/__tests__/AudioCueService.test.ts) | Play chimes (`start`, `phase`, `rest`, `complete`), resolve voice manifests, select non-repeating `variants` clips, and fall back to Web Speech API when manifest is absent. | ✅ Passed |
| **Repositories & Legacy Store/Hook** | [ProfileRepository.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/repositories/__tests__/ProfileRepository.test.ts), [SessionRepository.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/repositories/__tests__/SessionRepository.test.ts), [useTimer.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/hooks/__tests__/useTimer.test.ts), [useTimerStore.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/store/__tests__/useTimerStore.test.ts) | IndexedDB profile/session CRUD, date-range queries, statistics aggregation, and timer hook/store state transitions. | ✅ Passed |
