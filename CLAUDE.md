# ApplyOrNotAgent

PERM labor certification database with employer search and natural language chat queries.

## Project Structure
```
ApplyOrNotAgent/
├── Raw/                    # Raw DOL Excel files (not in git)
├── RawLCA/                 # Raw LCA CSV files (not in git)
├── static/index.html       # Legacy frontend — employer search UI (served at /legacy)
├── app.py                  # FastAPI backend (search + chat endpoints)
├── chat.py                 # LLM → SQL pipeline + safety layer + SSE streaming
├── load_perm_data.py       # Excel → SQLite loader (incremental)
├── load_lca_data.py        # LCA CSV → SQLite loader
├── build_employer_index.py # FEIN-based entity resolution
├── perm.db                 # SQLite database (not in git)
├── frontend/               # React + Vite + Tailwind chat UI
│   ├── src/App.tsx         # Main layout: header + chat + input
│   ├── src/api.ts          # Fetch helpers + SSE consumer
│   ├── src/types.ts        # TypeScript interfaces
│   ├── src/hooks/          # useChat, useStats
│   ├── src/components/     # ChatPanel, MessageBubble, EmployerCard, etc.
│   └── src/utils/          # formatters
└── CLAUDE.md
```

## Commands
```bash
# Load/reload PERM data (incremental — skips already-loaded FYs)
python load_perm_data.py

# Run backend (port 8001)
uvicorn app:app --port 8001

# Run frontend dev server (port 5174, proxies /api → 8001)
cd frontend && npm run dev

# Build frontend for production (served by FastAPI at /)
cd frontend && npm run build

# Type-check frontend
cd frontend && npx tsc --noEmit
```

## API Endpoints
- `GET /api/search?q=<employer>&limit=50` — fuzzy employer search
- `GET /api/employer/<name>?limit=100` — exact employer lookup
- `GET /api/employer-search?q=<employer>&limit=50` — FEIN-based entity search
- `GET /api/stats` — DB summary
- `POST /api/chat` — NL chat → SQL → SSE stream (body: `{ messages: [{role, content}] }`)
- `GET /` — SPA (from frontend/dist if built, else legacy)
- `GET /legacy` — original employer search UI

## Chat Architecture
```
User question (NL) → POST /api/chat → gpt-4o-mini → SQL → SQLite (read-only) → SSE stream → React UI
```
SSE events: `thinking` → `sql` → `result` → `done`
Safety: read-only SQLite, DDL/DML blocklist, LIMIT 200 enforcement, 5s timeout

## Database Schema
3 tables (all TEXT columns except noted):
- `perm` (~609K rows): FISCAL_YEAR, CASE_NUMBER, CASE_STATUS, EMPLOYER_NAME, EMPLOYER_FEIN, JOB_TITLE, SOC_CODE, SOC_TITLE, WAGE_FROM, WAGE_TO, WAGE_UNIT, WORKSITE_CITY, WORKSITE_STATE, DECISION_DATE, ...
- `lca` (~2.5M rows): same + VISA_CLASS, PREVAILING_WAGE, PW_UNIT, PW_WAGE_LEVEL, TOTAL_WORKER_POSITIONS, H1B_DEPENDENT, ...
- `employer` (FEIN PK): CANONICAL_NAME, CITY, STATE, FILING_COUNT (INT), LCA_FILING_COUNT (INT), NAME_VARIANTS (pipe-separated)

## Data Source
DOL PERM disclosure: https://www.dol.gov/agencies/eta/foreign-labor/performance

## Deployment Plan
- Supabase (Postgres) to replace SQLite
- Vercel for frontend
- Railway for agentic search API
