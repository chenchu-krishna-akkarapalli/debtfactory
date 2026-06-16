# Rule Engine Service

Eligibility decisioning over the **Bank Eligibility Matrix**, powered by
[`zen-engine`](https://gorules.io/) (GoRules JDM, MIT licensed).

## What it does

Given an applicant profile, returns every bank the applicant is **eligible** for.
The rules live in a spreadsheet (`data/Bank_Eligibility_Matrix.xlsx`) that is
treated as a GoRules **JDM decision table**: each row is a rule, each input cell
is a [ZEN Expression Language](https://gorules.io/docs/rules-engine/expression-language)
condition, and the output is the eligible **Bank Name**.

## Pipeline

```
data/Bank_Eligibility_Matrix.xlsx   (source of truth — never hand-edit the JDM)
        │  matrix_parser.parse()            -> list[MatrixRow]
        ▼
   rule_validator.validate_rows()           -> raises RuleValidationError on bad cells
        │
        ▼
   jdm_builder.build()                       -> GoRules JDM graph (dict / JSON)
        │  (persisted to decisions/bank_eligibility.jdm.json — a build artifact)
        ▼
   evaluator.Evaluator(zen.ZenEngine)        -> .evaluate(ApplicantInput) -> list[EligibilityResult]
        ▲
   service.py  ── called by ──  router.py    POST /rule-engine/evaluate
```

Regenerate the JDM artifact with `python scripts/generate_jdm.py` (or
`make jdm`). Do **not** edit `decisions/*.jdm.json` by hand — it is generated.

## Endpoints

| Method | Path                    | Purpose                                            |
| ------ | ----------------------- | -------------------------------------------------- |
| POST   | `/rule-engine/evaluate` | Applicant profile → eligible banks **+ per-parameter match trace**. |
| POST   | `/rule-engine/reload`   | Re-parse the matrix and rebuild the JDM at runtime.|

### `/evaluate` response

```jsonc
{
  "eligibility_status": "ELIGIBLE",      // "ELIGIBLE" | "NOT_ELIGIBLE" — derived from eligible_banks; branch the UI on this
  "eligible_banks": [{ "bank_name": "BOI", "description": null }],
  "matched_rule_count": 3,
  "evaluations": [                       // one per bank, sorted by confidence desc
    {
      "bank_name": "BOM",
      "eligible": false,
      "confidence_score": 0.9091,        // rules_passed / rules_total (NOT an ML probability)
      "rules_passed": 20, "rules_total": 22,
      "rules": [
        { "parameter": "pl_write_off", "rule": "true", "value": false, "status": "FAIL" }
      ]
    }
  ]
}
```

`confidence_score` is a deterministic "how close to eligible" ratio — each parameter
is tested individually via `zen.evaluate_unary_expression` (same semantics as the
decision table). Powers a real-time per-rule UI (PASS/FAIL + confidence bar).

## Matrix contract (column → field → example expression)

The mapping below is the single source of truth in code: see
[`constants.py`](constants.py) (`INPUT_COLUMN_TO_FIELD` / `OUTPUT_COLUMN_TO_FIELD`)
and the DTOs in [`schemas.py`](schemas.py). Snake_case is used on the Python
boundary; the engine keys are mapped in one place (`constants.py`).

### Input fields (applicant profile)

| Matrix column     | Field (`schemas.py`)  | Type    | Example cell expr |
| ----------------- | --------------------- | ------- | ----------------- |
| CIBIL Score       | `cibil_score`         | int     | `>= 675`          |
| PL Write Off      | `pl_write_off`        | bool    | `false`           |
| Home Loan WO      | `home_loan_wo`        | bool    | `false`           |
| Consumer Loan WO  | `consumer_loan_wo`    | bool    | `false`           |
| Agri Loan WO      | `agri_loan_wo`        | bool    | `false`           |
| MSME Loan WO      | `msme_loan_wo`        | bool    | `false`           |
| Auto Loan WO      | `auto_loan_wo`        | bool    | `false`           |
| CC Write Off      | `cc_write_off`        | bool    | `false`           |
| WO Amount         | `wo_amount`           | number  | `< 5000`          |
| Age               | `age`                 | int     | `[21..70]`        |
| Existing A/C      | `existing_account`    | bool    | `true`            |
| NRI/PIO           | `nri_pio`             | bool    | `false`           |
| Total Exp         | `total_experience`    | number  | `>= 2`            |
| Current Exp       | `current_experience`  | number  | `>= 1`            |
| Salary Mode       | `salary_mode`         | str     | `"Bank Credit"`   |
| Income            | `income`              | number  | `>= 25000`        |

### Output fields

| Matrix column | Field         | Type |
| ------------- | ------------- | ---- |
| Bank Name     | `bank_name`   | str  |
| Description   | `description` | str  |

A blank input cell means **no constraint** for that field on that rule. The hit
policy is "collect all matching rows", so an applicant can be eligible for
multiple banks at once.

## zen-engine usage (for implementers)

```python
import zen

engine = zen.ZenEngine()
decision = engine.create_decision(jdm_json_content)
result = decision.evaluate(applicant_dict)  # -> {"result": {...}}
```

## Layout

| File                       | Responsibility                                     |
| -------------------------- | -------------------------------------------------- |
| `router.py`                | HTTP surface (paths, status codes, models).        |
| `service.py`               | Orchestration: pipeline + JDM artifact lifecycle.  |
| `schemas.py`               | Pydantic DTOs (`ApplicantInput`, `EligibilityResult`). |
| `models.py`                | `EvaluationAudit` ORM model.                        |
| `constants.py`             | Matrix column ↔ field mapping; defaults.            |
| `config.py`                | `RuleEngineSettings` (`RULE_ENGINE_` prefix).       |
| `engine/matrix_parser.py`  | xlsx → `MatrixRow` rows.                             |
| `engine/rule_validator.py` | Row integrity checks.                               |
| `engine/jdm_builder.py`    | Rows → JDM graph.                                   |
| `engine/evaluator.py`      | `zen.ZenEngine` wrapper.                             |
