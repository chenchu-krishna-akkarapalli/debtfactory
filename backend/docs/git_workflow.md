# Git Workflow

**Trunk-based development with short-lived feature branches.**

## Branches

- **`main`** — always deployable; protected. Merges only via PR with green CI and
  at least one CODEOWNER approval.
- **`develop`** *(optional)* — integration/staging gate if the team wants one.
- **Feature branches** — `feat/<service>/<ticket>-<slug>`, e.g.
  `feat/rule-engine/RUL-12-matrix-parser`.

Other prefixes: `fix/`, `chore/`, `docs/`, `refactor/`, `test/`.

## Scope a branch to one service

Wherever possible, a branch touches a **single** `src/app/services/<service>/`
directory. This is what makes the feature-sliced layout pay off — two teams
editing two service folders never collide.

## Commits — Conventional Commits

Format: `type(scope): subject`, enforced by a `commit-msg` pre-commit hook.

```
feat(rule-engine): add xlsx matrix parser
fix(auth): reject expired refresh tokens
docs(domain-logs): document SSE heartbeat
chore(ocr-jobs): bump celery to 5.4
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`.

## Merging

- **Rebase** your feature branch on `main` before merge.
- **Squash-merge** to keep history linear and one commit per PR.
- Delete the branch after merge.

## Database migrations

- Generate Alembic revisions under **your service's branch label** only:
  `migrations/versions/<service>/`.
- Never create a cross-service revision or rebase another team's migration head.
- The entrypoint runs `alembic upgrade heads` (plural) to apply every branch.

## CI gates

- `ruff`, `black --check`, `mypy src` must pass.
- `pytest` must pass; the **changed** service must keep coverage ≥ 80%.
- Unchanged services are skipped via path filters — one team's PR doesn't wait on
  the whole monorepo.
