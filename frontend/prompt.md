# Build Prompt — Rule Engine Page (`/`)

> **Goal of this milestone:** stand up the Rule Engine page at route `/` that
> drives the backend `POST /rule-engine/evaluate` endpoint in real time, on a
> clean **global + layout** design architecture. Build the *scaffolding* (tokens,
> globals, layout primitives, design-system shells, typed API client, state/handler
> skeleton). Leave full visual polish of leaf components to the **Stitch** pass.
>
> Read [`Skill.md`](./Skill.md) first (engineering standards) and
> [`docs/design-system.md`](./docs/design-system.md) (tokens + box layout).
> Follow [`plan.md`](./plan.md) for the build order.

## Scope (in / out)

**In scope (this milestone):**
- `app/globals.css` — Tailwind v4 `@theme` design tokens + base layer (**global**).
- `app/layout.tsx`, `app/providers.tsx` — root layout, fonts, providers (**global**).
- `components/layout/*` — `AppShell`, `Container`, `PageGrid`, `Panel` (**layout**).
- `components/ui/*` — design-system primitives: `Box`, `Stack`, `Cluster`, `Grid`,
  `Card`, `SectionLabel`, `StatusBadge`, `ConfidenceBar`, `RuleRow` (presentational shells).
- `lib/*` — `cn()`, query client, env, **generated** API types + a typed `evaluate()` client.
- `features/rule-engine/*` — the page feature skeleton: form schema/types, the
  `useEvaluate` hook (debounced + cancelable), state wiring, and the two panels
  (`ApplicantForm`, `RuleMatchPanel`) composed in `app/page.tsx`.

**Out of scope (defer to Stitch pass / later):**
- Pixel-final styling of each leaf (Stitch provides the visual truth → map onto tokens/primitives).
- Auth, routing beyond `/`, persistence, multi-page nav, other services.

## The backend contract (source of truth)

`POST {API}/rule-engine/evaluate` — **generate** TS types from the live OpenAPI at
`http://localhost:8000/openapi.json`; the shapes below are for reference only.

### Request — `ApplicantInput` (23 fields, snake_case, `extra="forbid"`)

```jsonc
{
  "cibil_score": 750, "pl_write_off": false, "home_loan_wo": false,
  "consumer_loan_wo": false, "agri_loan_wo": false, "msme_loan_wo": false,
  "auto_loan_wo": false, "cc_write_off": false, "wo_amount": 0, "age": 30,
  "existing_account": true, "nri_pio": false, "total_experience": 5,
  "current_experience": 2, "salary_mode": "Bank Credit", "income": 50000,
  "existing_car_loan": true, "rented_house_self_employed": false,
  "agriculture": false, "no_income_proof": false, "rental_income_non_itr": false,
  "rental_income_not_reflecting": false, "itr_not_filed": false
}
```
Field types: numbers (`cibil_score`, `wo_amount`, `age`, `total_experience`,
`current_experience`, `income`); string (`salary_mode`, e.g. `"Bank Credit"`);
the rest are booleans. **Send `Content-Type: application/json`.**

### Response — `EvaluateResponse` (HTTP 200)

```jsonc
{
  "eligibility_status": "ELIGIBLE",          // "ELIGIBLE" | "NOT_ELIGIBLE" — branch the UI on this
  "eligible_banks": [{ "bank_name": "BOI", "description": null }],
  "matched_rule_count": 3,
  "evaluations": [                            // one per bank, sorted by confidence DESC
    {
      "bank_name": "BOM",
      "eligible": false,
      "confidence_score": 0.9091,             // rules_passed / rules_total (0..1) — NOT an ML probability
      "rules_passed": 20, "rules_total": 22,
      "rules": [
        { "parameter": "pl_write_off", "rule": "true", "value": false, "status": "FAIL" }
      ]
    }
  ]
}
```

### Errors
- **422** `{ "error": { "code": "validation_error", "message": "...", "details": { "errors": [...] } } }`
  — malformed/incomplete input. Surface inline on the offending field.
- A **rejected applicant is 200**, not an error: `eligibility_status: "NOT_ELIGIBLE"`,
  `eligible_banks: []`. Render the rejection state from `evaluations[]` (the FAILs explain why).

## Page spec — `/` (maps to the Stitch mockup)

A two-pane console: **left = applicant inputs**, **right = REAL-TIME RULE MATCH**.
As the user edits inputs, the right pane updates live (debounced).

- **Header:** product title + a small "live" status.
- **Left panel — Applicant form:** the 23 inputs grouped (Credit, Demographics,
  Employment & Income, Write-offs, BRE flags). Numbers, a select for `salary_mode`,
  toggles for booleans. Inline validation (zod), no submit button required (live).
- **Right panel — Rule match:**
  - **Eligibility status** banner driven by `eligibility_status`.
  - **Eligible banks** list (chips) from `eligible_banks`.
  - **Bank selector** (the `evaluations`, sorted by confidence) → selecting a bank shows:
    - **ConfidenceBar** (`confidence_score`), `rules_passed / rules_total`.
    - **Rule rows**: each `rules[]` item → `parameter` + `PASS`/`FAIL` (+ the `rule` tested and the applicant `value`). FAIL rows are tinted/highlighted.
- **States:** first-load skeleton; live-updating (no flicker, `keepPreviousData`);
  `NOT_ELIGIBLE` (show top near-miss banks + their FAIL reasons); `422` (inline field errors).

## Design direction (from the mockup, finalized by Stitch)

Dark "terminal/console" theme · near-black canvas · **orange accent** for the
confidence bar · monospace, uppercase, letter-spaced labels · PASS = success
(green), FAIL = danger (red) with a tinted row + left accent border · soft rounded
cards, hairline borders. Exact values are tokens in [`docs/design-system.md`](./docs/design-system.md);
the **Stitch export is the visual source of truth** — map its HTML/CSS onto the tokens
and layout primitives rather than hand-rolling new styles.

## Stitch workflow (when the MCP is connected)

> The Stitch MCP is added by **you** in the terminal, then restart Claude Code:
> `claude mcp add stitch --transport http --header "X-Goog-Api-Key: <YOUR_KEY>" https://stitch.googleapis.com/mcp`
> **Keep the key out of chat / version control.**

1. Generate/fetch the Rule Engine screen design via the Stitch MCP tools.
2. Extract its palette, type, spacing → **reconcile into `app/globals.css` `@theme`**
   (update token values; do not introduce ad-hoc hex).
3. Map Stitch's blocks onto the existing **layout primitives** (`PageGrid`, `Panel`,
   `Card`, `Stack`, `RuleRow`, `ConfidenceBar`) — extend, don't duplicate.
4. Keep all behavior (form, debounce, evaluate, state) intact; Stitch only changes the skin.

## Acceptance criteria

- [ ] `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm run test` all green.
- [ ] `/` renders the two-pane layout from **layout primitives + tokens only** (zero raw hex).
- [ ] Editing any field triggers a **debounced** evaluate; the rule-match panel updates
      without flicker and without blocking typing.
- [ ] Response types are **generated** from the backend OpenAPI (no hand-written DTOs).
- [ ] `ELIGIBLE`, `NOT_ELIGIBLE`, loading, and `422` states all render correctly.
- [ ] Stale in-flight requests are cancelled; only the latest result is shown.
- [ ] Design tokens + layout primitives are documented and reused (no per-component styling forks).
