# LiveLong ⊹

A productivity timer inspired by Japanese longevity wisdom, combining traditional focus techniques with breathing exercises and wellness practices.

## ✨ Features

### 🍅 **Classic Focus Timers**
- Pomodoro (25 min) - Classic productivity technique
- Deep Work (90 min) - Extended focus sessions
- Custom durations - Flexible timing with minutes and seconds

### 🏯 **Japanese Longevity Exercises**
- **Rajio Taiso Complete Series** - Traditional Japanese radio calisthenics, with animated guide figures
- **Tai Chi Morning Flow** - Gentle flowing movements
- **Shinrin-yoku Practice** - Forest bathing meditation
- **Custom series** - Author your own step-by-step routines with guided voice cues

### 🫁 **Breathing Exercises with Visual Guides**
- **Box Breathing** - Equal four-count breathing (4-4-4-4)
- **4-7-8 Relaxation** - Calming extended exhale
- **Deep Breathing** - Simple stress relief breathing
- **Wim Hof Breathing** - Energising breath rounds
- **Immersive Experience** - Breathing visualizer with background animations and audio cues

### 📱 **Progressive Web App (PWA)**
- Install on mobile devices
- Offline functionality
- Native app experience
- Quick action shortcuts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Development Scripts

```bash
# Start development server (with automatic cleanup + browser opening)
./start.sh

# Start with deep cache reset (clears npm cache too)
./start.sh reset

# Stop all processes and cleanup
./stop.sh

# Run comprehensive tests
./test.sh
```

### Manual Commands

```bash
# Install dependencies
npm --prefix web-app install

# Start development server (port 9000)
npm --prefix web-app run dev

# Build for production
npm --prefix web-app run build

# Run unit & component tests
npm --prefix web-app run test:ci
```

All app code and npm scripts live in `web-app/`; there is no root `package.json`.

---

## 🤖 AI-Assisted Development

This project is configured for autonomous development with multiple AI assistants.

### Using Claude Code ⚡ (Autonomous)

1. **Open project in Claude Code**
2. **Read CLAUDE.md** for quick start prompt
3. **Copy and paste the prompt** - Claude will:
   - Read all documentation
   - Work through TODO.md systematically
   - Write tests before implementation
   - Commit automatically with proper format
   - Update documentation as it progresses

**One-liner to start:**
```
Read CLAUDE.md and follow the quick start instructions.
```

### Using Google Gemini 🔷 (Autonomous)

1. **Open Google Gemini** (AI Studio or API)
2. **Share project files** or connect to repository
3. **Read GEMINI.md** for quick start prompt
4. **Copy and paste the prompt** - Gemini will:
   - Follow .gemini/config.yaml workflow
   - Work through TODO.md systematically
   - Write tests before implementation
   - Ask for approval before commits
   - Coordinate with other AIs via TODO.md

**One-liner to start:**
```
Read GEMINI.md and follow the quick start instructions.
```

### Using ChatGPT 🤝 (Guided)

1. **Share PROJECT_RULES.md** with the assistant
2. **Tell it:** "Follow PROJECT_RULES.md for all development. Start with docs/TODO.md."
3. **Assistant will ask before changes** (no auto-commit)
4. **You approve each change** before it's applied

### 🤝 Multi-AI Coordination

Several agents (Claude Code, Codex, Antigravity/Gemini) can work on LiveLong at once:

- **Task tracker:** `docs/TODO.md`
- **Fleet coordination:** agents launched through the `-w` wrappers join the `livelong` fleet; assignments and
  status flow through `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/`.
- **File reservation:** reserve every file with `queuectl` before editing it, and release it when done.
- **Worktrees:** workers use their own worktree (`~/.ai-dev-dotfiles/tools/setup-worktree.sh`); the primary
  checkout is the lead's integration surface.
- **Per-agent instructions:** `CLAUDE.md` (Claude Code), `AGENTS.md` (Codex), `GEMINI.md` (Gemini / Antigravity).

---

## 📋 Key Files

### Configuration
- **`.gemini/config.yaml`** - Gemini workflow configuration
- **`CLAUDE.md`** - Quick start guide for Claude Code
- **`AGENTS.md`** - Project facts for Codex agents
- **`GEMINI.md`** - Project facts for Gemini / Antigravity agents
- **`PROJECT_RULES.md`** - Universal development rules for all AI assistants

Claude Code permissions come from the global settings in `~/.ai-dev-dotfiles`; `.claude/settings.local.json`
is personal and gitignored.

### Documentation
- **`docs/TODO.md`** - Current tasks and priorities
- **`docs/REQUIREMENTS.md`** - What we're building
- **`docs/SPECIFICATIONS.md`** - Technical implementation details
- **`docs/DESIGN.md`** - Architecture and design decisions (canonical)
- **`docs/TEST-CHECKLIST.md`** - Test and user-journey traceability, with latest results

### Project Structure
```
LiveLong/
├── web-app/                   # The app: Next.js 14 PWA
│   ├── src/
│   │   ├── app/               # App Router entry
│   │   ├── components/        # Session, Routines, Progress, Settings UI and modals
│   │   ├── data/              # Breathing patterns and exercise series
│   │   ├── lib/               # Vendored animation runtime (from the animation repo)
│   │   ├── services/          # Timer engine, audio, storage, repositories
│   │   ├── store/             # Zustand store (unifiedTimerStore)
│   │   └── types/             # Shared TypeScript types
│   ├── scripts/               # Live-browser UI and user-journey suites
│   ├── e2e/                   # Playwright specs (cross-browser / mobile)
│   └── public/                # PWA manifest, icons, service worker, animation & audio packs
├── focus_productivity_timer/  # Flutter prototype, kept for a possible future native build
├── docs/                      # Requirements, specifications, design, TODO, test checklist
├── CLAUDE.md / AGENTS.md / GEMINI.md  # Per-agent instructions
├── PROJECT_RULES.md           # Development rules
└── README.md                  # This file
```

---

## 🎯 Development Workflow

All AI assistants (Claude Code, Gemini, ChatGPT) follow this workflow:

1. **Read context** (REQUIREMENTS, SPECIFICATIONS, DESIGN, TODO)
2. **Check TODO.md** for next task
3. **Write tests first** (TDD approach)
4. **Implement feature**
5. **Run all tests** (unit + regression)
6. **Commit with proper format**
7. **Update docs** (TODO, DESIGN, etc.)
8. **Move to next task**

### Multi-AI Handoff Protocol
When switching between AI assistants:
1. Ensure all changes are committed
2. Update TODO.md with current state
3. Document any blockers or open questions
4. Next AI reads git log and TODO.md to continue

---

## 🧪 Testing

### Run Tests
```bash
npm --prefix web-app run type-check   # TypeScript
npm --prefix web-app run lint         # ESLint
npm --prefix web-app run test:ci      # Jest + React Testing Library, with coverage
npm --prefix web-app run test:e2e     # Playwright (cross-browser / mobile)
```

**UI and user-journey verification** runs in the real Chrome browser on this device via `chrome-devtools-mcp`,
using `web-app/scripts/browser-ui-suite.js` and `web-app/scripts/browser-user-journeys.js`. Steps and latest
results are tracked in `docs/TEST-CHECKLIST.md`.

### Test Coverage Goals
- **Minimum**: 80% statement coverage (enforced by `web-app/jest.config.js`)
- **Critical paths**: 100% coverage
- **All edge cases**: Tested

---

## 📝 Git Commit Format

All commits follow this format:

```
<type>: <short description>

<detailed explanation if needed>

Files changed:
- path/to/file1: [what changed]
- path/to/file2: [what changed]

Questions: libor@arionetworks.com
```

**Types**: feat, fix, docs, test, refactor, perf, chore

---

## 🔒 Security

- No secrets in code (use `.env` files)
- `.env` files are git-ignored
- Environment variables for configuration
- All sensitive data encrypted

---

## 📞 Contact

**Questions or Issues**: libor@arionetworks.com

---

## 📊 Project Status

- **Status**: Active development (offline-first PWA in `web-app/`)
- **Created**: 2025-09-30
- **AI Ready**: ✅ Claude Code, Codex, Gemini / Antigravity (autonomous) + ChatGPT (guided)
- **Multi-AI Coordination**: ✅ `livelong` fleet mailbox + `queuectl` file reservation; tasks in `docs/TODO.md`

---

## 🚦 Next Steps

1. **Check current work**: `docs/TODO.md` (open items are mostly waiting on upstream animation and voice packs)
2. **Start development**: Choose your AI assistant:
   - **Claude Code**: Open in Claude, say "Read CLAUDE.md and start"
   - **Codex**: Reads `AGENTS.md` automatically
   - **Gemini / Antigravity**: Say "Read GEMINI.md and start"
   - **ChatGPT**: Share PROJECT_RULES.md, say "Follow these rules"
3. **Coordinate**: Reserve files before editing; report status through the fleet mailbox

**Happy coding with your AI team! 🎉**
