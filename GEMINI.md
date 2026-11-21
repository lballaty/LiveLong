# GEMINI.md

**Quick Start Guide for Google Gemini**

This file provides a streamlined prompt for starting autonomous development with Google Gemini.

---

## 🚀 Start Development

Copy and paste this into Google Gemini:

```
Read PROJECT_RULES.md and understand all development rules.
Then read docs/TODO.md, docs/REQUIREMENTS.md, docs/SPECIFICATIONS.md, and docs/DESIGN.md.

Your configuration is in .gemini/settings.json and .gemini/config.yaml.
Follow the workflow defined there.

Work through the TODO list systematically:
1. For each task, write tests first
2. Implement the feature
3. Run all tests (unit + regression)
4. Commit with proper format from config.yaml
5. Update TODO.md and other docs as needed
6. Move to next task

Key rules:
- NEVER commit secrets (check .gemini/config.yaml forbidden patterns)
- Always use environment variables for credentials
- Test migrations locally before committing
- Ask before deploying or destructive operations
- Update TODO.md as source of truth for multi-AI coordination

Continue iterating until all TODO items are complete or you need clarification.
```

---

## 📋 Project Context

- **Project**: LiveLong ⊹ (longevity practice timer: focus, breathing, and exercise series)
- **Active app**: `web-app/`, an offline-first Next.js 14 / React 18 / TypeScript PWA (see `docs/DESIGN.md`)
- **Superseded**: the original `TestRepo` scaffold (`src/`, `tests/`, `cache/`, `cloud/`, `database/`, `vectordb/`) and the Flutter prototype (`focus_productivity_timer/`)
- **Created**: 2025-09-30

---

## 🎯 Your Capabilities in This Repo

Based on `.gemini/settings.json` configuration:

✅ **Autonomous operations:**
- Read any file
- Edit code files (py, js, ts, sql, md, txt, json, yaml)
- Write new files
- Run tests (pytest, jest, npm test)
- Run linters (eslint, flake8, black, mypy)
- Git operations (status, log, diff, add, commit)
- Install dependencies (npm install, pip install)
- Run cloud CLI commands
- Database queries (SELECT, CREATE, ALTER)

❌ **Forbidden operations:**
- Force push
- Hard reset
- Editing secret files (.env, *.key, *secret*, *password*)
- Destructive database ops without confirmation

🚫 **Require confirmation:**
- Git push/pull/merge
- Deploy functions
- Database migrations apply
- DROP, DELETE, TRUNCATE operations

---

## 📚 Documentation Files

- **PROJECT_RULES.md** - Complete development workflow (mandatory reading)
- **docs/TODO.md** - Current task list (source of truth for multi-AI coordination)
- **docs/REQUIREMENTS.md** - What we're building
- **docs/SPECIFICATIONS.md** - Technical implementation details
- **docs/DESIGN.md** - Architecture and design decisions
- **database/README.md** - Database security & migration guide
- **vectordb/README.md** - Vector DB setup (ChromaDB, pgvector)
- **cache/redis/README.md** - Redis patterns & best practices
- **cloud/functions/README.md** - Cloud function deployment

---

## 🔧 Common Commands

### Testing
```bash
# Python
pytest                    # Run all tests
pytest --cov              # With coverage
pytest tests/unit/        # Unit tests only

# Node.js
npm test                  # Run all tests
npm run test:coverage     # With coverage
npm run test:unit         # Unit tests only
```

### Linting
```bash
# Python
black src/                # Format code
flake8 src/               # Check style
mypy src/                 # Type checking

# Node.js
npm run lint              # ESLint
```

### Database Operations
```bash
# Migrations
npx supabase migration new create_table
npx supabase migration up

# PostgreSQL
psql $DATABASE_URL -c "SELECT * FROM users;"
```

### Vector Database
```bash
# ChromaDB
docker run -d -p 8000:8000 chromadb/chroma
curl http://localhost:8000/api/v1/heartbeat
```

### Redis
```bash
# Test connection
redis-cli ping
redis-cli info memory
```

### Git
```bash
git status
git log --oneline -10
git diff
git add .
git commit -m "..."      # Use format from .gemini/config.yaml
```

---

## ✅ Validation Before Moving On

For each completed task, verify (from `.gemini/config.yaml`):
- ✅ Tests written and passing
- ✅ Code follows SOLID principles
- ✅ File headers present (required format in config)
- ✅ Committed with proper format
- ✅ TODO.md updated (critical for multi-AI coordination)
- ✅ Docs synced (DESIGN.md, REQUIREMENTS.md if needed)
- ✅ **If database work**: Migrations tested, no secrets in files
- ✅ **If cloud functions**: Tested locally, uses environment variables
- ✅ **If vector DB work**: Collections configured, embeddings tested
- ✅ **If Redis used**: Cache keys have TTLs, patterns documented

---

## 🤝 Multi-AI Coordination

This project uses multiple AI assistants (Claude Code, ChatGPT, Gemini).

**Handoff Protocol** (from `.gemini/config.yaml`):
1. **Before stopping work:**
   - Update TODO.md with current state
   - Commit all changes
   - Document any blockers or questions
   - Note which task you were working on

2. **When starting work:**
   - Check git log for recent changes
   - Read TODO.md for current state
   - Check for notes from other assistants
   - Continue from documented state

3. **Source of Truth:**
   - `docs/TODO.md` is the shared source of truth
   - Always update it after completing tasks
   - Mark items as [in progress] when starting
   - Mark items as [done] when complete
   - Add [blocked: reason] if stuck

---

## 🗄️ Database Work Workflow

When working with database (from `.gemini/config.yaml`):

1. **Migrations:**
   - Format: `YYYYMMDDHHMMSS_description.sql`
   - Include UP and DOWN scripts
   - Test locally before committing

2. **Security:**
   - ✅ No hardcoded credentials
   - ✅ All secrets in environment variables
   - ✅ Scan for secrets before commit

3. **Vector DB:**
   - Development: ChromaDB
   - Production: pgvector
   - Default dimensions: 1536

4. **Redis:**
   - Always set TTL
   - Use key prefixes
   - Default TTL: 3600 seconds

---

## 🆘 When to Stop and Ask

(From `.gemini/notifications.notifyOn`):
- Requirements are ambiguous
- Design decision needed
- Breaking change required
- Security issue detected
- Tests fail
- Need to deploy
- Destructive database operation

---

## 🔐 Security Rules

(From `.gemini/security`):
- **Scan before commit**: Check for secrets
- **Forbidden patterns**: api_key, password, secret, token, credential
- **Never commit**: Hardcoded passwords, API keys, private keys
- **Always use**: Environment variables for all credentials

---

## 💡 Tips for Effective Use

1. **Start by reading configs:**
   - `.gemini/settings.json` - Your permissions
   - `.gemini/config.yaml` - Workflow and rules
   - `PROJECT_RULES.md` - Development standards

2. **Follow the workflow:**
   - Read context → Check TODO → Tests → Implement → Commit → Update docs

3. **Coordinate with other AIs:**
   - Always update TODO.md
   - Check git log before starting
   - Document your progress

4. **Security first:**
   - Never hardcode secrets
   - Use environment variables
   - Scan before commit

---

**Last Updated**: 2025-09-30
**Configuration**: .gemini/settings.json, .gemini/config.yaml
