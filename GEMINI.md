# GEMINI.md

**LiveLong project facts for Gemini CLI and Antigravity agents.**

This file holds only what is specific to this repo. General rules (file reservation, commits, secrets, verification, when to stop and ask) live in the global operating standard. Antigravity does not load that standard automatically, so read it at session start:

`/Users/liborballaty/.ai-dev-dotfiles/memories/agentic-operating-standard.md`

---

## 🔒 Before Any Write

Reserve every file before editing it, and release it when done:

```bash
queuectl reserve --agent "$QUEUECTL_AGENT" --working-on "<what>" --files <absolute paths>
queuectl release --token <token>
```

If you are in the `livelong` fleet, read your inbox at `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/` and report to your `.status.md` file.

---

## 📋 Project

- **LiveLong ⊹**: longevity practice timer (focus, guided breathing, exercise series such as Rajio Taiso, Tai Chi, Shinrin-yoku, Ikigai, Zazen).
- **Active app:** `web-app/`, an offline-first Progressive Web App with no backend.
- **Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4, Zustand, IndexedDB via `idb`, `next-pwa`.
- **Tests:** Jest + React Testing Library + `fake-indexeddb` (unit/component), plus live-browser UI & User Journey suites (`web-app/scripts/browser-ui-suite.js`, `web-app/scripts/browser-user-journeys.js`) run against the actual Chrome browser on this device via `chrome-devtools-mcp` (see `docs/TEST-CHECKLIST.md`). Use actual-browser testing rather than Playwright for UI verification.
- **External Fleet Bundle Dependencies:**
  - **`animation` repo** (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/animation`): supplies `exercise-figures-runtime.js` (`web-app/src/lib/animations/`) and exercise/character JSON packs (`web-app/public/animations/`). Inbound deliveries arrive in `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/_inbound-from-animation.md`; report defects/results to `~/.ai-dev-dotfiles/.coordination/fleets/animation/mailbox/_inbound-from-livelong.md`.
  - **`openScriptAudio` repo** (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/openScriptAudio`): supplies per-cue voice packs (`web-app/public/audio/cues/<voiceId>/manifest.json` + `.mp3` clips with `variants` + `@n` naming). Inbound deliveries arrive in `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/_inbound-from-openscriptaudio.md`; report defects/results to `~/.ai-dev-dotfiles/.coordination/fleets/openscriptaudio/mailbox/_inbound-from-livelong.md`.
  - **Controller rule:** Validate, integrate, and test (Jest/RTL + live Chrome UI & journey suites) any new bundle delivery automatically without asking first; bounce defects directly to the owning fleet lead, and notify the operator when ready for user testing.
- **Superseded, do not build on:** the remaining `TestRepo` scaffold (`src/`, `tests/`, root `package.json`).
- **Kept for later:** the Flutter prototype (`focus_productivity_timer/`) is retained as the starting point for a possible future native Flutter build. It is not the active app; do not change it unless the task is that Flutter build.

Build on the `Unified*` implementation (`UnifiedTimerEngine`, `unifiedTimerStore`, `UnifiedTimerDisplay`, `UnifiedProfileManager`). Older parallel engines, stores, and displays still exist; `docs/DESIGN.md` → *Known Architectural Consolidation Gap* lists them.

---

## 📚 Canonical Docs

- `docs/DESIGN.md` - architecture (canonical)
- `docs/REQUIREMENTS.md`, `docs/SPECIFICATIONS.md` - what and how
- `docs/TODO.md` - task list
- `PROJECT_RULES.md` - development workflow
- `.claude/testing-rules.md`, `web-app/TESTING_REQUIREMENTS.md` - testing rules (apply to all agents)

---

## 🔧 Commands

```bash
npm --prefix web-app install
npm --prefix web-app run dev              # port 9000; ask before starting
npm --prefix web-app run build
npm --prefix web-app run lint
npm --prefix web-app run type-check
npm --prefix web-app run test:ci          # Jest
npm --prefix web-app run test:e2e         # Playwright
npm --prefix web-app run test:e2e:mobile
```

## ✅ Done Means

Type-check, lint, Jest, and Playwright pass; behaviour verified in a browser with no console errors; offline still works; `docs/TODO.md` and affected docs updated; path-form commit (`git commit <path>... -m "..."`).

---

**Last Updated**: 2026-11-24
