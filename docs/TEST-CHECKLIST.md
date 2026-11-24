# LiveLong ⊹ Test & User Journey Checklist

**File:** `docs/TEST-CHECKLIST.md`
**Purpose:** Traceability matrix mapping every UI flow, component, and end-to-end user journey to the exact test suite and test case that verifies it.
**Last Verified:** 2026-11-24 (`main` @ `2c5e7b9`)

---

## Summary of Active Suites

| Suite | Runner | Scope | Latest Verified Result |
|---|---|---|---|
| Unit & Component Tests | `npx jest --ci --maxWorkers=2` | Engines, stores, repositories, audio services, RTL modals/pickers/settings | **12 / 12 suites, 82 / 82 passed** |
| Live-Browser UI Suite | Chrome via `chrome-devtools-mcp` ([browser-ui-suite.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-ui-suite.js)) | All 4 views, full Settings, Rajio Taiso steps, responsive Desktop (`1280×800`) + Mobile (`390×844`) | **40 / 40 passed** |
| Live-Browser User Journeys | Chrome via `chrome-devtools-mcp` ([browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js)) | 8 multi-step end-to-end user journeys + full reload persistence | **15 / 15 passed (12 run + 3 post-reload)** |

---

## 1. End-to-End User Journeys (`browser-user-journeys.js`)

| ID | User Journey / Workflow | What Is Tested | Test Reference | Status |
|---|---|---|---|---|
| **J1** | Live Timer Lifecycle | Start → real countdown tick → Pause → holds steady → Resume → continues ticking → Stop → resets | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J1.TimerLifecycle`) | ✅ Passed |
| **J2** | Cast, View & Posture Switching | Settings cast (`Woman ~30`) + `Front + Side` + `Chair` → Session renders 2 external SVGs | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J2.CastAndViews`) | ✅ Passed |
| **J3** | Author Custom Exercise Series & Run | Create 2-step `Evening Mobility` in `RoutineEditorModal`, launch in Session (`Step 1 of 2`), Start & Stop | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J3.CustomSeries`) | ✅ Passed |
| **J4** | Author Custom Breathing Routine & Run | Create `Custom 4-7-8` via Breathing tab, launch in Session, render `BreathingVisualizer` | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J4.CustomBreathing`) | ✅ Passed |
| **J5** | Compose & Run Multi-Routine Session | Build 2-routine `Full Daily Stack` in `SessionComposerModal`, start session, verify `active-session-plan-banner` (`1/2`) | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J5.SessionPlan`) | ✅ Passed |
| **J6** | Clone, Edit & Delete Built-in Routine | Clone `Tai Chi Morning Flow` (`📋`), edit title (`✏️`), save, verify update, delete (`🗑️`) | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J6.CloneEditDelete`) | ✅ Passed |
| **J7** | Routine Audio Modal Configuration | Open `🎛️` on Rajio Taiso, verify Music, Chimes, and Voice toggles & sliders | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J7.AudioModal`) | ✅ Passed |
| **J8** | Full Browser Reload Persistence | Save custom routine + composed session + reordered cards → reload browser → verify all 3 survive | [browser-user-journeys.js](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js) (`J8.PersistenceSetup`, `J8.Persistence`) | ✅ Passed |

---

## 2. UI Controls, Views & Responsive Flows (`browser-ui-suite.js`)

| Area | Flow / Control | Desktop (`1280×800`) & Mobile (`390×844`) Check | Test Reference | Status |
|---|---|---|---|---|
| **Session HUD** | External `Robot (R1)` SVG mount & sizing | `data-animation-source="external"`, `Robot (R1)`, SVG `> 50×50px` | `browser-ui-suite.js` (`1.1`) | ✅ Passed |
| **Session HUD** | Decluttered running view | `0` volume sliders in HUD; 3 compact mute pills (`Chimes`, `Script`, `Music`) + ARIA toggle | `browser-ui-suite.js` (`1.2`–`1.4`) | ✅ Passed |
| **Session HUD** | Live animation & playback controls | `Start` animates SVG; `Pause` / `Resume` / `Stop` button states | `browser-ui-suite.js` (`1.5`–`1.8`) | ✅ Passed |
| **Rajio Taiso** | All 6 steps + fallback boundary | Steps `1, 3, 4, 5` = `external`; Steps `2, 6` = `robot-poc`; `Prev Step` returns to 1 | `browser-ui-suite.js` (`1.9.1`–`1.10`) | ✅ Passed |
| **Settings** | Cast, posture, views, voices, volumes, toggles & live preview | 3 audio sliders, 4 toggles (Chimes, Script, Music, Haptic), Cast selector → live preview, `Woman`/`Man` voice, `Test Audio Cue`, `%` readouts, `Front`/`Side`/`Front + Side`, `Standing`/`Chair-Based` | `browser-ui-suite.js` (`2.1`–`2.6`) + [SettingsView.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/settings/__tests__/SettingsView.test.tsx) | ✅ Passed |
| **Routines** | Category filters | `Exercises`, `Breathing`, `Focus Timers`, `All` isolate matching sections | `browser-ui-suite.js` (`3.1`–`3.3`) | ✅ Passed |
| **Routines** | Card reordering | `←` / `→` buttons swap and restore card order | `browser-ui-suite.js` (`3.4`) | ✅ Passed |
| **Routines** | Music & Chime preview + Audio modal | Music select + `▶` / `⏹` preview toggle + `🎛️` `RoutineAudioModal` (`3` sliders) | `browser-ui-suite.js` (`3.5`–`3.6`) | ✅ Passed |
| **Routines** | Modals & Icon Import | `Clone`, `+ New Routine`, `+ Create Custom Timer`, `+ Compose Session` all expose `+ Import Icon` | `browser-ui-suite.js` (`3.7`–`3.14`) | ✅ Passed |
| **Breathing & Focus** | BreathingVisualizer & Loops / Pomodoro | `Box Breathing` renders `BreathingVisualizer` + loop `-`/`+`; `Pomodoro` shows `25:00` | `browser-ui-suite.js` (`4.1`–`4.3`) | ✅ Passed |
| **Progress & Layout** | ProgressView & Responsive Overflow | `ProgressView` renders; `scrollWidth <= innerWidth` on Desktop and Mobile | `browser-ui-suite.js` (`5.1`–`5.2`) | ✅ Passed |

---

## 3. Unit & React Testing Library Component Tests (Jest)

| Layer | File | What Is Tested | Status |
|---|---|---|---|
| **Settings View** | [SettingsView.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/settings/__tests__/SettingsView.test.tsx) | Cast selector, `Standing`/`Chair-Based`, `Front`/`Side`/`Front + Side`, live preview sync, all 4 checkboxes, `Woman`/`Man` voice, 3 volume sliders, `Test Audio Cue` | ✅ Passed |
| **Icon Picker & Renderer** | [IconPicker.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/IconPicker.test.tsx) | Preset emoji selection, `+ Import Icon` trigger, `data:image/` `<img>` rendering, `<select>` label formatting | ✅ Passed |
| **Routine Audio Modal** | [RoutineAudioModal.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineAudioModal.test.tsx) | Music preview toggle, chime test, voice cue test, volume slider updates, stops music on close | ✅ Passed |
| **Routine Editor Modal** | [RoutineEditorModal.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineEditorModal.test.tsx) | Creating custom `Exercise Series` (+ adding steps) and switching to `Breathing Routine` tab | ✅ Passed |
| **Session Composer Modal** | [SessionComposerModal.test.tsx](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/SessionComposerModal.test.tsx) | Adding routines to a `SessionPlan` sequence and saving | ✅ Passed |
| **Unified Store** | [unifiedTimerStore.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/store/__tests__/unifiedTimerStore.test.ts) | Profile loading, `localStorage` persistence, cloning, `jumpToStep`/`nextStep`/`prevStep`, `SessionPlan` CRUD, session completion | ✅ Passed |
| **Unified Timer Engine** | [UnifiedTimerEngine.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/timer/__tests__/UnifiedTimerEngine.test.ts) | Simple, series, and breathing phase transitions, pause/resume/stop | ✅ Passed |
| **Audio Cue Service** | [AudioCueService.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/__tests__/AudioCueService.test.ts) | Chime synthesis, voice manifest lookup, `variants` non-repeating selection, Web Speech fallback | ✅ Passed |
| **Repositories & Legacy Store/Hook** | [ProfileRepository.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/repositories/__tests__/ProfileRepository.test.ts), [SessionRepository.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/repositories/__tests__/SessionRepository.test.ts), [useTimer.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/hooks/__tests__/useTimer.test.ts), [useTimerStore.test.ts](file:///Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/store/__tests__/useTimerStore.test.ts) | IndexedDB CRUD/stats and timer hook/store behavior | ✅ Passed |
