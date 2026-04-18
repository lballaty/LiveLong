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
3. Run all tests (unit + regression)
4. Commit with proper format
5. Update TODO.md and other docs as needed
6. Move to next task

Continue iterating until all TODO items are complete or you need clarification.
```

---

## 📋 Project Context

- **Project**: TestRepo
- **Template**: node
- **Created**: 2025-09-30

---

## 🎯 Your Capabilities in This Repo

You have full autonomy via `.claude/settings.local.json`:

✅ **Can do without asking:**
- Read any file
- Edit code files (py, js, ts, sql, md, txt, json, yaml)
- Write new files
- Run tests (pytest, jest, npm test)
- Run linters (eslint, flake8, black, mypy)
- Git operations (status, log, diff, add, commit)
- Install dependencies (npm install, pip install)
- Run Supabase CLI commands (list, status, inspect)
- Execute psql queries (SELECT, CREATE, ALTER)

❌ **Must ask first:**
- Starting servers (npm start)
- Git push/pull/merge operations
- Git checkout (branch switching)
- Supabase deployments (db push, functions deploy)
- Destructive database operations (DROP, DELETE, TRUNCATE)
- Database resets

🚫 **Never allowed:**
- Force push
- Hard reset
- Editing/writing secret files (.env, *.key, *secret*, *password*, credentials.*)
- rm -rf on root

🔒 **Security Rules:**
- Never include secrets in migrations, schemas, or edge functions
- Always use environment variables for credentials
- Document required secrets in .env.example only
- All secrets must be loaded from environment at runtime

---

## 📚 Documentation Files

- **PROJECT_RULES.md** - Complete development workflow and standards (mandatory reading)
- **docs/TODO.md** - Current task list and priorities
- **docs/REQUIREMENTS.md** - What we're building
- **docs/SPECIFICATIONS.md** - Technical implementation details
- **docs/DESIGN.md** - Architecture and design decisions
- **database/README.md** - Database migration and security guidelines
- **vectordb/README.md** - Vector database setup (ChromaDB, pgvector)
- **cache/redis/README.md** - Redis caching patterns and best practices
- **cloud/functions/README.md** - Cloud function deployment guide

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
# Supabase local development
npx supabase start        # Start local Supabase
npx supabase status       # Check status
npx supabase stop         # Stop local Supabase

# Migrations
npx supabase migration new create_users_table  # Create new migration
npx supabase migration up                      # Apply migrations
npx supabase db reset                          # Reset database (asks first)

# Cloud Functions
npx supabase functions serve function_name     # Test locally
npx supabase functions deploy function_name    # Deploy (asks first)

# Secrets (never in code!)
npx supabase secrets set API_KEY=value         # Set secret
npx supabase secrets list                      # List secrets (hidden values)
```

### Vector Database Operations
```bash
# ChromaDB (local)
docker run -d -p 8000:8000 chromadb/chroma    # Start ChromaDB
curl http://localhost:8000/api/v1/heartbeat   # Check health

# Supabase pgvector
# Enable in your database:
# CREATE EXTENSION IF NOT EXISTS vector;
```

### Redis Operations
```bash
# Local Redis
docker run -d -p 6379:6379 redis:alpine       # Start Redis
redis-cli ping                                 # Test connection (should return PONG)
redis-cli monitor                              # Monitor commands (dev only)
redis-cli info memory                          # Check memory usage

# Flush cache (dev only - destructive!)
redis-cli FLUSHDB                              # Clear current database
```

### Git
```bash
git status                # Check status
git log --oneline -10     # Recent commits
git diff                  # View changes
git add .                 # Stage all
git commit -m "..."       # Commit
```

---

## ✅ Validation Before Moving On

For each completed task, verify:
- ✅ Tests written and passing
- ✅ Code follows SOLID principles
- ✅ File headers present
- ✅ Committed with proper format
- ✅ TODO.md updated
- ✅ Docs synced (DESIGN.md, REQUIREMENTS.md if needed)
- ✅ **If database work**: Migrations tested, no secrets in files
- ✅ **If cloud functions**: Tested locally, uses environment variables
- ✅ **If vector DB work**: Collections configured, embeddings tested
- ✅ **If Redis used**: Cache keys have TTLs, patterns documented

---

## 🗄️ Database Work Workflow

When working with database:

1. **Schema Changes:**
   - Update `database/schemas/` with new schema
   - Create timestamped migration in `database/migrations/`
   - Include both UP and DOWN migration scripts
   - Test migration locally: `npx supabase migration up`
   - Test rollback: `npx supabase migration down`
   - Test migration up again to ensure idempotency

2. **Cloud Functions:**
   - Create/update in `cloud/functions/`
   - Use `process.env.get()` or `Deno.env.get()` for all secrets
   - Test locally before deploying
   - Add proper error handling and auth checks
   - Document required environment variables

3. **Vector Database:**
   - **Local development**: Use ChromaDB
   - **Production**: Use Supabase pgvector
   - Store embeddings with appropriate dimensions
   - Create indexes for similarity search
   - Test search quality and performance
   - Document embedding model used (e.g., OpenAI ada-002, sentence-transformers)

4. **Redis Caching:**
   - Use appropriate data structures (strings, hashes, sets)
   - Always set TTLs on cache keys
   - Use key prefixes (`cache:`, `session:`, `ratelimit:`, `embedding:`)
   - Implement cache invalidation strategy
   - Monitor memory usage

5. **Security Checklist:**
   - ✅ No hardcoded credentials
   - ✅ All secrets in environment variables
   - ✅ Documented in .env.example
   - ✅ Migration files contain no secrets
   - ✅ Cloud functions use env vars
   - ✅ Vector DB credentials not in code
   - ✅ Redis password not in code

6. **Before Deployment:**
   - All tests pass
   - Migrations tested locally
   - Cloud functions tested locally
   - Vector DB collections created
   - Redis cache configured
   - Rollback plan documented
   - Ask user before deploying

---

## 🆘 When to Stop and Ask

- Requirements are ambiguous
- Design decision needed
- Breaking change required
- Security concern
- Need to push code
- Need to start server
- **Need to deploy database changes**
- **Need to deploy cloud functions**
- **Destructive database operation (DROP, DELETE, TRUNCATE)**
- **Found secrets in code that shouldn't be there**
- **Vector DB setup needed (collection creation, index configuration)**
- **Redis configuration change needed**

---

**Last Updated**: 2025-09-30

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

