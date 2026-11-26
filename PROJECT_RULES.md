# PROJECT_RULES.md

**Universal AI Assistant Development Guidelines**

This file defines how AI assistants (Claude Code, ChatGPT, etc.) must work on this project. These rules are mandatory for all AI systems to ensure consistent development standards.

---

## 0) Operating Mode

* **Treat this file as system rules for the entire session.**
* Always ask clarifying questions before generating solutions.
* **No placeholders or TODOs in code.** Always provide working, production-ready code.
* State all assumptions explicitly in an "Assumptions" section.
* Read context documents before starting any work:
  * `docs/REQUIREMENTS.md` - What we're building
  * `docs/SPECIFICATIONS.md` - Technical implementation details
  * `docs/DESIGN.md` - Architecture and design decisions
  * `docs/TODO.md` - Current tasks and priorities

---

## 1) Development Workflow

### Step 1 — Requirements Check
* Every feature/task starts by ensuring requirements are clear.
* **Read `docs/REQUIREMENTS.md`** to understand what's needed.
* Update requirements file if new requirements emerge.
* Confirm requirement source and status before proceeding.

### Step 2 — Design Update
* **Read `docs/DESIGN.md`** to understand current architecture.
* Update design document to reflect requirements before coding.
* If design changes during implementation, update `docs/DESIGN.md` again.
* Document all architectural decisions with reasoning.

### Step 3 — Implementation Plan
* **Check `docs/TODO.md`** for the current task.
* Create an implementation to-do list before starting code.
* Break down the task into small, testable increments.
* Track progress against this list during work.

### Step 4 — Test-Driven Development
* **Write tests BEFORE implementation.**
* For every feature, write corresponding unit tests.
* Tests must cover:
  * Happy path (expected behavior)
  * Edge cases (boundaries, empty inputs)
  * Error cases (invalid inputs, failures)
* Store tests for reuse in regression suites.

### Step 5 — Incremental Implementation
* Write code in small increments.
* Run tests after each implementation step.
* Fix until all tests pass before moving forward.
* Never commit failing tests.

### Step 6 — Regression Testing (Mandatory)
* **Run regression tests for the affected area.**
* Update regression test suites with latest passing tests.
* **Existing test suites must always be reused and extended** rather than creating redundant new ones.
* Regression testing must validate:
  * **SOLID principles** (Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion)
  * **Memory quality** (no leaks, proper cleanup, efficient lifecycle handling)

**Test Suite Locations:**
```
web-app/
  ├── src/**/__tests__/  # Jest + React Testing Library unit/component tests, next to the code
  ├── scripts/           # Live-browser UI suite and user-journey suite (real Chrome)
  └── e2e/tests/         # Playwright specs (cross-browser / mobile)
docs/TEST-CHECKLIST.md   # Step-by-step traceability and latest results for every suite
```

### Step 7 — Commit (Mandatory)
* **At least one commit per feature change is required.**
* Commit early and often, but never less than once per feature.
* Each commit must be atomic, descriptive, and scoped to a single logical change.

**Commit Message Format:**
```
<type>: <short description>

<detailed explanation>

Files changed:
- path/to/file1.py: [one-line explanation]
- path/to/file2.js: [one-line explanation]

Questions: libor@arionetworks.com
```

**Commit Types:**
* `feat`: New feature
* `fix`: Bug fix
* `docs`: Documentation only
* `test`: Adding or updating tests
* `refactor`: Code refactoring without behavior change
* `perf`: Performance improvement
* `chore`: Maintenance tasks (dependencies, config)

**Multi-File Commit Rules:**
* List every changed file in the commit description.
* For each file, provide a one-line explanation of what changed.
* Write so a junior engineer can understand and reproduce the change.

### Step 8 — Documentation Sync
* **Update `docs/TODO.md`**: Mark completed items, add new tasks discovered.
* **Update `docs/DESIGN.md`**: Reflect final implementation details.
* **Update `docs/REQUIREMENTS.md`**: If requirements changed during implementation.
* Confirm all docs reflect the final working state before moving to next feature.

---

## 2) Code Standards

### Language Standards
* **TypeScript (the app, `web-app/`)**: TypeScript 5, ES Modules, strict mode, React function components
* **Flutter (only `focus_productivity_timer/`, kept for a possible future native build)**: Null safety enabled
* Clear comments and docstrings (inputs, outputs, errors)
* Explicit error handling, no silent failures

### Security & Configuration
* **No secrets in code.** Use environment variables or config files.
* Never hardcode API keys, passwords, or sensitive data.
* Use `.env` files (excluded from git) for local development.

### Code Quality
* Optimize for readability and maintainability before performance.
* Use business-friendly, descriptive names (e.g., `user_authentication.py`, not `auth.py`).
* Follow SOLID principles.
* Write self-documenting code; use comments for "why", not "what".

---

## 3) File Header Requirement (Mandatory)

**Every file must begin with a header comment containing:**
1. Full repo-relative filepath and filename.
2. One-paragraph description of the file's purpose and contents.

**Examples:**

```typescript
// File: web-app/src/services/timer/UnifiedTimerEngine.ts
// Description: Drives timer, series and breathing sessions from wall-clock timestamps so the
// countdown stays accurate across pause/resume and background tabs.
```

```typescript
// File: web-app/src/components/settings/SettingsView.tsx
// Description: Settings view for guide character, audio channels and haptics; persists
// preferences through the unified timer store.
```

**For files that don't support comments** (binary assets, images, compiled artifacts):
* Create a Markdown file named `<filename>-README.md` in the same directory.
* The README must contain:
  * Full filepath/filename of the associated file.
  * Description of the file's purpose and usage.

---

## 4) File Organization

### Directory Structure
```
LiveLong/
├── web-app/                # The app (Next.js 14 PWA); all npm scripts run here
│   ├── src/
│   │   ├── app/            # App Router entry
│   │   ├── components/     # Feature UI and modals (tests in __tests__/)
│   │   ├── data/           # Breathing patterns, exercise series
│   │   ├── lib/            # Vendored animation runtime
│   │   ├── services/       # Timer engine, audio, storage, repositories
│   │   ├── store/          # Zustand store
│   │   └── types/          # Shared types
│   ├── scripts/            # Live-browser UI and user-journey suites
│   ├── e2e/                # Playwright specs
│   └── public/             # PWA assets, animation and audio packs
├── focus_productivity_timer/  # Flutter prototype (kept, not active)
├── docs/
│   ├── TODO.md
│   ├── REQUIREMENTS.md
│   ├── SPECIFICATIONS.md
│   ├── DESIGN.md
│   └── TEST-CHECKLIST.md
├── .claude/                # Claude Code project instructions
├── PROJECT_RULES.md        # This file
├── CLAUDE.md / AGENTS.md / GEMINI.md  # Per-agent instructions
└── README.md
```

### Naming Conventions
* **Python files**: `snake_case.py`
* **JavaScript/TypeScript files**: `camelCase.js` or `kebab-case.js`
* **Test files**: `test_<feature>.py` or `<feature>.test.js`
* **Directories**: `lowercase_with_underscores` or `kebab-case`

---

## 5) Deliverables Format

For each task, output in this order:

1. **Requirements check**: Confirm requirement source and status.
2. **Design update**: Short summary of new/changed design elements.
3. **Implementation to-do list**: Bullet list of steps.
4. **File tree**: Repo-relative paths showing what will be created/modified.
5. **Code**: Full files in fenced blocks, each with required file header.
6. **Run steps**: Exact commands and environment setup.
7. **Tests**: Unit + regression examples, referencing existing suites.
8. **Validation**: How to confirm success (expected output, test results).
9. **Commit step**: At least one commit message with file-by-file descriptions.
10. **Docs sync**: Note changes needed in design/requirements/TODO docs.

---

## 6) Testing Standards

### CRITICAL: GUI Testing Requirements (MANDATORY)
* **ALL GUI functions must be tested WITHOUT EXCEPTION**
* **UI verification**: the live-browser suites in the real Chrome browser via `chrome-devtools-mcp`
  (`web-app/scripts/browser-ui-suite.js`, `web-app/scripts/browser-user-journeys.js`), tracked in
  `docs/TEST-CHECKLIST.md`
* **Cross-browser / mobile E2E**: Playwright (`web-app/e2e/tests/`)
* Do not change or drop either tool without explicit user approval
* **Coverage Requirement**: 100% of UI components and user interactions
* **Every UI feature must have corresponding tests before considered complete**
* **See `web-app/TESTING_REQUIREMENTS.md` for detailed requirements**

### Test Coverage Requirements
* **Unit tests**: All business logic functions (80% minimum statement coverage, enforced by Jest)
* **Component tests**: ALL React/UI components (React Testing Library)
* **E2E tests**: ALL user workflows in the live-browser journey suite; Playwright for cross-browser/mobile
* **Integration tests**: API endpoints, database operations, external services
* **Edge cases**: Error handling, boundary conditions, null/undefined values
* **Accessibility tests**: WCAG compliance for all UI components
* **Performance tests**: For critical paths (mandatory for timer accuracy)

### Test Commands
```bash
npm --prefix web-app run type-check     # TypeScript
npm --prefix web-app run lint           # ESLint
npm --prefix web-app run test:ci        # Jest, CI mode with coverage
npm --prefix web-app run test:unit      # Jest, unit tests only
npm --prefix web-app run test:e2e       # Playwright
npm --prefix web-app run build          # Production build
```

### Test Quality Requirements
* Tests must be independent (no shared state between tests).
* Use fixtures/mocks for external dependencies.
* Test names must clearly describe what they test.
* Each test should have a single assertion focus.

---

## 7) Validation Checklist

Before marking any task as complete, verify:

* ✅ Requirements updated in `docs/REQUIREMENTS.md`
* ✅ Design reflects implementation in `docs/DESIGN.md`
* ✅ Code compiles/runs without errors
* ✅ All unit tests pass
* ✅ All regression tests pass
* ✅ SOLID principles validated
* ✅ Memory quality validated (no leaks)
* ✅ At least one commit per feature created
* ✅ Multi-file changes documented file-by-file
* ✅ All files have required headers OR `<filename>-README.md`
* ✅ Existing test suites reused/extended (no redundant tests)
* ✅ No secrets in code
* ✅ `docs/TODO.md` updated (completed items marked, new tasks added)
* ✅ Documentation synced before moving to next feature

---

## 8) AI Assistant Specific Instructions

### For Claude Code
* Permissions come from the global Claude Code settings in `~/.ai-dev-dotfiles` and the session's launch
  mode; `.claude/settings.local.json` is personal and gitignored.
* Work through `docs/TODO.md` systematically.
* Commit frequently as you complete features.
* Follow all steps in the workflow above.
* Ask for clarification if requirements are ambiguous.

### For ChatGPT / Other Assistants
* Always ask before making file changes.
* Provide complete file contents when suggesting changes.
* Reference line numbers when discussing existing code.
* Flag when you need human review.
* Follow all steps in the workflow above.

### Cross-Assistant Continuity
* `docs/TODO.md` is the source of truth for current state.
* Check `git log` for recent changes before starting work.
* Read `docs/DESIGN.md` for architectural context.
* Never assume - always verify against documentation.
* Reserve every file with `queuectl` before editing it, and release it when done.
* In the `livelong` fleet, assignments and status go through
  `~/.ai-dev-dotfiles/.coordination/fleets/livelong/mailbox/`; workers use their own worktree.

---

## 9) Never Do This

* ❌ Commit without running tests
* ❌ Skip documentation updates
* ❌ Use generic variable names (x, y, temp, data)
* ❌ Leave commented-out code in commits
* ❌ Hardcode configuration values
* ❌ Ignore `docs/TODO.md` updates
* ❌ Make assumptions without checking docs
* ❌ Create redundant test suites instead of extending existing ones
* ❌ Skip file headers
* ❌ Bundle multiple unrelated changes in one commit
* ❌ Ship UI features without comprehensive tests
* ❌ Change testing frameworks without explicit user approval
* ❌ Skip GUI testing for any component or interaction

---

## 10) Questions & Issues

**Primary Contact**: libor@arionetworks.com

### When to Ask
* Requirements are ambiguous or conflicting
* Design decision needed for architectural change
* Breaking change required
* Security concern identified
* Performance issue detected
* Unclear how to extend existing test suites

### How to Ask
Include in commit message or `docs/TODO.md`:
```
Questions: libor@arionetworks.com
- [Specific question about X]
- [Trade-off decision needed for Y]
- [Clarification needed on Z requirement]
```

---

**Last Updated**: 2026-11-26
**Project**: LiveLong ⊹
**Status**: Active Development
**Applies to**: Claude Code, Codex, Gemini / Antigravity, ChatGPT, and all AI development assistants
