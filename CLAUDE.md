# CLAUDE.md

**Quick Start Guide for Claude Code**

This file provides a streamlined prompt for starting autonomous development with Claude Code.

---

## 🚀 Start Development

Copy and paste this into Claude Code:

```
Read PROJECT_RULES.md and understand all development rules.
Then read docs/TODO.md, docs/REQUIREMENTS.md, docs/SPECIFICATIONS.md, and docs/DESIGN.md.

Work through the TODO list systematically:
1. For each task, write tests first
2. Implement the feature
3. Run all tests (unit + regression + E2E)
4. Commit with proper format
5. Update TODO.md and other docs as needed
6. Move to next task

Continue iterating until all TODO items are complete or you need clarification.
```

---

## 📋 Project Context

- **Project**: LiveLong ⊹ (longevity practice timer: focus, breathing, and exercise series)
- **Active app**: `web-app/`, an offline-first Progressive Web App
- **Stack**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4, Zustand, IndexedDB via `idb`, `next-pwa`
- **Tests**: Jest + React Testing Library + `fake-indexeddb` (unit/component), plus live-browser UI & User Journey suites (`web-app/scripts/browser-ui-suite.js`, `web-app/scripts/browser-user-journeys.js`) run in the actual Chrome browser on this device (`docs/TEST-CHECKLIST.md`).
- **External Fleet Bundle Dependencies**:
  - **`animation` repo** (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/animation`): supplies `exercise-figures-runtime.js` (`web-app/src/lib/animations/`) + exercise/character JSON packs (`web-app/public/animations/`). Inbound: `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/_inbound-from-animation.md`; reply: `~/.ai-dev-dotfiles/.coordination/fleets/animation/mailbox/_inbound-from-livelong.md`.
  - **`openScriptAudio` repo** (`/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/openScriptAudio`): supplies voice guidance cue packs (`web-app/public/audio/cues/<voiceId>/manifest.json` + `.mp3` clips). Inbound: `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/_inbound-from-openscriptaudio.md`; reply: `~/.ai-dev-dotfiles/.coordination/fleets/openscriptaudio/mailbox/_inbound-from-livelong.md`.
  - **Controller rule**: Validate, integrate, and test new bundle deliveries automatically; report bundle defects directly to the owning fleet lead and notify the operator when ready for testing.
- **Backend**: none. All data is local to the browser.
- **Created**: 2025-09-30

**Removed:** the original `TestRepo` scaffold is gone (2026-11-25). There is no root `package.json`; all app code and npm scripts are in `web-app/`.

**Kept for later:** the Flutter prototype (`focus_productivity_timer/`) is retained as the starting point for a possible future native Flutter build. It is not the active app; do not change it unless the task is that Flutter build.

`docs/DESIGN.md` is the canonical architecture record, including the open consolidation gap (parallel timer engines, stores, and displays in `web-app/src/`).

---

## 🎯 Permissions

Permissions are not defined in this repo. They come from the global Claude Code settings managed in `~/.ai-dev-dotfiles` (`.claude/config/settings.base.json` rendered by `apply-config.py`) and from the session's launch mode. `.claude/settings.local.json` is personal and untracked; do not commit it.

Always ask first before:
- Starting long-running servers (`npm run dev`, `npm start`)
- Git push, pull, merge, or branch switching
- Deleting files or directories

Never:
- Force push or hard reset
- Read, edit, or commit secret files (`.env`, `*.key`, `*secret*`, `*password*`, `credentials.*`)

---

## 📚 Documentation Files

- **PROJECT_RULES.md** - Complete development workflow and standards (mandatory reading)
- **docs/TODO.md** - Current task list and priorities
- **docs/REQUIREMENTS.md** - What we're building
- **docs/SPECIFICATIONS.md** - Technical implementation details
- **docs/DESIGN.md** - Architecture and design decisions (canonical)
- **.claude/CLAUDE.md** - Engineering standards for the web app
- **.claude/testing-rules.md** - Mandatory testing rules
- **web-app/TESTING_REQUIREMENTS.md** - Test suite requirements

---

## 🔧 Common Commands

All app commands run in `web-app/`:

```bash
npm --prefix web-app install          # Install dependencies
npm --prefix web-app run dev          # Dev server on port 9000 (ask first)
npm --prefix web-app run build        # Production build
npm --prefix web-app run lint         # ESLint
npm --prefix web-app run type-check   # tsc --noEmit
npm --prefix web-app run test:ci      # Jest, CI mode with coverage
npm --prefix web-app run test:e2e     # Playwright E2E
npm --prefix web-app run test:e2e:mobile  # Playwright, mobile projects
```

Git:

```bash
git status                            # Check status
git log --oneline -10                 # Recent commits
git diff                              # View changes
git commit <path>... -m "..."         # Path-form commit only
```

---

## ✅ Validation Before Moving On

For each completed task, verify:
- ✅ Tests written and passing (Jest and Playwright)
- ✅ `type-check` and `lint` clean for the files you touched
- ✅ Behaviour verified in a real or headless browser, with no console errors
- ✅ Offline behaviour still works
- ✅ File headers present
- ✅ Committed with proper format
- ✅ TODO.md updated
- ✅ Docs synced (DESIGN.md, REQUIREMENTS.md if needed)

---

## 🆘 When to Stop and Ask

- Requirements are ambiguous
- Design decision needed
- Breaking change required
- Security concern, or secrets found in code
- Need to push code
- Need to start a server
- Need to delete files

---

**Last Updated**: 2026-11-21

---

## File Reservation

File reservation is required before first write.

- If `/Users/liborballaty/.codex/memories/AGENT-WORK-QUEUE.md` exists, use it as the authoritative coordination queue before editing any file.
- If the global queue is unavailable, use the repo-local fallback queue when the repo defines one.
- Use `queuectl reserve`, `queuectl verify`, `queuectl renew`, and `queuectl release` when queue tooling is available.
- Claim the exact files you will modify before the first write.
- Do not edit shared or canonical files without an active claim.
- Keep claims narrow, short-lived, and limited to actual write scope.
- If a required file is already claimed, do not overlap edits; continue with disjoint work if possible and re-check later.

