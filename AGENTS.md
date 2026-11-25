# AGENTS.md — LiveLong ⊹

**LiveLong project facts for Codex CLI and cross-harness agents.**

General cross-agent rules (file reservation, git hygiene, credentials, verification) live in `/Users/liborballaty/.ai-dev-dotfiles/memories/agentic-operating-standard.md`.

---

## 🔒 Before Any Write

Reserve every shared or canonical file before editing it, and release it when done:

```bash
queuectl reserve --agent "$QUEUECTL_AGENT" --working-on "<what>" --files <absolute paths>
queuectl release --token <token>
```

If you are in the `livelong` fleet, read your inbox at `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/` (newest-first) and report status to your `.status.md` file.

---

## 📋 Project

- **LiveLong ⊹**: longevity practice timer (focus, guided breathing, exercise series such as Rajio Taiso, Tai Chi, Shinrin-yoku, Ikigai, Zazen).
- **Active app:** `web-app/`, an offline-first Progressive Web App with no backend.
- **Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4, Zustand, IndexedDB via `idb`, `next-pwa`.
- **Architecture:** Build on the `Unified*` implementation (`UnifiedTimerEngine`, `unifiedTimerStore`, `UnifiedTimerDisplay`, `UnifiedProfileManager`). See `docs/DESIGN.md` for canonical architecture.
- **Removed:** the original `TestRepo` scaffold is gone (2026-11-25). There is no root `package.json`; all app code and npm scripts are in `web-app/`.
- **Kept for later:** `focus_productivity_timer/` (Flutter prototype) is retained for a possible future native Flutter build. It is not the active app; do not change it unless the task is that Flutter build.

---

## 🔗 External Fleet Bundle Dependencies (`animation` & `openScriptAudio`)

- **`animation` repo** (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/animation`):
  - Supplies `exercise-figures-runtime.js` (`web-app/src/lib/animations/`) and exercise/character JSON packs (`web-app/public/animations/`).
  - Inbound deliveries: `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/_inbound-from-animation.md`
  - Report defects/results: `~/.ai-dev-dotfiles/.coordination/fleets/animation/mailbox/_inbound-from-livelong.md`
- **`openScriptAudio` repo** (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/openScriptAudio`):
  - Supplies per-cue voice packs (`web-app/public/audio/cues/<voiceId>/manifest.json` + `.mp3` clips with `variants` + `@n` naming).
  - Inbound deliveries: `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/_inbound-from-openscriptaudio.md`
  - Report defects/results: `~/.ai-dev-dotfiles/.coordination/fleets/openscriptaudio/mailbox/_inbound-from-livelong.md`
- **Controller rule:** Validate, integrate, and test (Jest/RTL + live Chrome UI & user journey suites) any new bundle delivery automatically without asking first. Report bundle defects directly to the owning fleet lead to fix, and notify the operator when ready for user testing.

---

## 🧪 Testing & Verification

- **Unit & Component Tests:** Jest + React Testing Library + `fake-indexeddb` (`cd web-app && npx jest --ci --maxWorkers=2`).
- **UI & User Journey Tests:** Run against the actual Chrome browser on this device (`chrome-devtools-mcp`) using `web-app/scripts/browser-ui-suite.js` and `web-app/scripts/browser-user-journeys.js` (tracked in `docs/TEST-CHECKLIST.md`). Use actual-browser testing rather than Playwright for UI verification.
- **Type-check & Lint:** `npm --prefix web-app run type-check` and `npm --prefix web-app run lint`.
- **Commits:** Path-form commits (`git commit <path>... -m "..."`), no `Co-Authored-By` trailers.

---

**Last Updated:** 2026-11-24
