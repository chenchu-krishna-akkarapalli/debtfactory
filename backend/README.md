# Loan Platform Backend

A **feature-sliced modular monolith**: one FastAPI application hosting four
self-contained feature services, built so multiple teams ship in parallel with
**minimal merge conflicts**.

| Service | Path | Status |
| ------- | ---- | ------ |
| Rule Engine | `src/app/services/rule_engine` | ✅ **implemented** — zen-engine eligibility decisioning |
| Auth | `src/app/services/auth` | 🟡 stubbed + DB schema |
| Domain Logs | `src/app/services/domain_logs` | 🟡 stubbed + DB schema |
| OCR Jobs | `src/app/services/ocr_jobs` | 🟡 stubbed (Celery + Redis) |

**Stack:** FastAPI · SQLAlchemy (async) · Pydantic v2 · PostgreSQL 16 · Redis 7 ·
zen-engine (GoRules JDM) · Celery · Docker · **Python 3.12**.

---

## Quickstart

> **Python 3.12 only** (the project pins `>=3.12,<3.13`). 3.13 will run the code
> but blocks `pip install -e .`.

```powershell
# 1. Virtual env on Python 3.12
py -3.12 -m venv .venv        # or: & "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -m venv .venv
.venv\Scripts\activate         # Unix: source .venv/bin/activate

# 2. Install deps + the app itself (editable install => no PYTHONPATH ever)
pip install -r requirements/base.in
pip install -r requirements/dev.in -c requirements/base.in
pip install -r requirements/services/rule_engine.in -c requirements/base.in
pip install -e .

# 3. Bring up the data stores (Postgres + Redis + Adminer UI)
copy .env.example .env         # Unix: cp .env.example .env
docker compose -f compose.yaml -f compose.dev.yaml up -d db redis adminer

# 4. Apply database migrations
python scripts\migrate_sql.py

# 5. Run the API
uvicorn app.main:create_app --factory --reload
# → http://localhost:8000   ·   docs → http://localhost:8000/docs
```

> Full walkthrough (testing, Rule Engine, team workflow):
> [`docs/workflow.md`](docs/workflow.md). New here? Start with
> [`TEAM_ONBOARDING.md`](TEAM_ONBOARDING.md).

---

## Docker & the database UI

| Service | Container | Host port | Notes |
| ------- | --------- | --------- | ----- |
| Postgres | `loan-platform-db-1` | **5433** → 5432 | host 5432 is often taken by a native Postgres |
| Redis | `loan-platform-redis-1` | **6379** | |
| Adminer (DB web UI) | `loan-platform-adminer-1` | **8081** → 8080 | browse the DB in your browser |

**Open the database in a browser:** in Docker Desktop click the **`8081`** port (or
open <http://localhost:8081>) and log in — **System** `PostgreSQL`, **Server** `db`,
**User** `loan`, **Password** `loan`, **Database** `loan_platform`. (Use `db`, not
`localhost` — Adminer runs inside Docker.)

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up -d db redis adminer   # start stores
docker compose -f compose.yaml -f compose.dev.yaml down                     # stop
docker compose -f compose.yaml -f compose.dev.yaml down -v                  # stop + wipe data
```

---

## Database migrations (plain SQL)

Migrations are **`.sql` files** applied by an idempotent runner (tracked in a
`schema_migrations` table). See [`docs/knowledge/Database Migrations.md`](docs/knowledge/Database%20Migrations.md).

```powershell
python scripts\migrate_sql.py --status                 # applied vs pending
python scripts\migrate_sql.py                          # apply pending *.up.sql
python scripts\migrate_sql.py --down auth/0001_init    # roll back one
```

Files live in `migrations/sql/<service>/NNNN_<name>.{up,down}.sql`. Auth + Domain
Logs schemas exist today.

---

## Rule Engine

Turns `Bank_Eligibility_Matrix.xlsx` (**8 banks, 23 input params**) into eligibility
decisions via **GoRules zen-engine**. Regenerate the JDM artifact with
`python scripts/generate_jdm.py`.

```powershell
curl -X POST http://localhost:8000/rule-engine/evaluate `
  -H "Content-Type: application/json" `
  -d '{
    "cibil_score": 750, "pl_write_off": false, "home_loan_wo": false,
    "consumer_loan_wo": false, "agri_loan_wo": false, "msme_loan_wo": false,
    "auto_loan_wo": false, "cc_write_off": false, "wo_amount": 0, "age": 30,
    "existing_account": true, "nri_pio": false, "total_experience": 5,
    "current_experience": 2, "salary_mode": "Bank Credit", "income": 50000,
    "existing_car_loan": true, "rented_house_self_employed": false,
    "agriculture": false, "no_income_proof": false, "rental_income_non_itr": false,
    "rental_income_not_reflecting": false, "itr_not_filed": false
  }'
```

The 7 BRE flags are **exact-match**, which partitions banks into disjoint groups:

| Group | Banks | Profile |
| ----- | ----- | ------- |
| A | BOI, Indian Bank, IOB | car loan + strict docs |
| B | BOB | no car loan + self-employed renting |
| C | HDFC, AXIS, Kotak | full lenient-doc profile |
| D | BOM | PL **and** CC written off |

- **Verified test data:** [`docs/test_scenarios.md`](docs/test_scenarios.md)
- **Postman collection:** `postman/DebtFactory-RuleEngine.postman_collection.json` (import → Run)
- **Service contract:** [`src/app/services/rule_engine/README.md`](src/app/services/rule_engine/README.md)

---

## Testing & quality gates

```powershell
pytest -q                          # full suite
pytest tests/services/rule_engine/ -v
ruff check src tests scripts       # lint
black --check src tests scripts    # format
mypy src                           # types (strict)
```

These four gates are exactly what [CI](#team-workflow--cicd) enforces on every PR.

---

## Project layout

```
src/app/
├── main.py            # app factory; mounts health + auto-discovered routers
├── api/               # router auto-discovery, health/readiness
├── core/              # config, database, logging, errors, middleware
├── common/            # shared schemas + utils (the only cross-service sharing)
└── services/<slice>/  # one self-contained vertical slice per feature
migrations/sql/        # plain-SQL migrations (per service)
scripts/migrate_sql.py # the migration runner
postman/               # importable API test collection
docs/knowledge/        # Obsidian knowledge vault
```

See [`docs/architecture.md`](docs/architecture.md) for the rationale.

---

## Team workflow & CI/CD

**Trunk-based development**, short-lived branches, Conventional Commits, per-service
ownership. Adding a service touches **zero** shared files (routers/settings are
auto-discovered).

👉 **Start here for Git + CI/CD:** [`docs/ci_cd_guide.md`](docs/ci_cd_guide.md) —
first push, branch protection, the PR pipeline, reading CI failures, and deploys.

```
branch  →  push  →  PR  →  CI (ruff·black·mypy·pytest·migrations)  →  review  →  squash-merge  →  CD
```

---

## Documentation map

| Doc | What |
| --- | ---- |
| [`TEAM_ONBOARDING.md`](TEAM_ONBOARDING.md) | 5-phase checklist for new developers |
| [`docs/workflow.md`](docs/workflow.md) | Complete runbook (setup, testing, Rule Engine) |
| [`docs/ci_cd_guide.md`](docs/ci_cd_guide.md) | Git + CI/CD for the team ⭐ |
| [`docs/git_workflow.md`](docs/git_workflow.md) | Branch/commit/merge conventions |
| [`docs/architecture.md`](docs/architecture.md) | Design rationale & request lifecycle |
| [`docs/service_template.md`](docs/service_template.md) | Add a new service (no shared files) |
| [`docs/knowledge/`](docs/knowledge/Index.md) | Obsidian knowledge vault (decisions, troubleshooting) |
