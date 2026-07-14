"""Stage 4: evaluate applicants against the JDM via zen-engine.

Wraps ``zen.ZenEngine``. The zen-engine API used here:

.. code-block:: python

    import zen
    engine = zen.ZenEngine()
    decision = engine.create_decision(jdm_dict)
    result = decision.evaluate(applicant_dict)  # -> {"result": [...]}

With the ``collect`` hit policy the decision table returns a list of output
objects — one per matching rule — which we adapt into ``EligibilityResult``.
"""

from __future__ import annotations

from typing import Any

import zen

from app.services.rule_engine.constants import INPUT_FIELD_EXPR, INPUT_FIELDS
from app.services.rule_engine.engine.jdm_builder import JdmGraph
from app.services.rule_engine.engine.matrix_parser import MatrixRow
from app.services.rule_engine.exceptions import EvaluationError
from app.services.rule_engine.schemas import (
    ApplicantInput,
    BankEvaluation,
    EligibilityResult,
    RuleMatch,
)


class Evaluator:
    """Holds a loaded JDM decision and evaluates applicants against it."""

    def __init__(self, jdm: JdmGraph, rows: list[MatrixRow]) -> None:
        """Load ``jdm`` into a ``zen.ZenEngine`` decision.

        ``rows`` (the parsed matrix) are kept so :meth:`evaluate_detailed` can
        report a per-parameter pass/fail trace, not just the matching banks.
        """
        self._jdm = jdm
        self._rows = rows
        try:
            self._engine = zen.ZenEngine()
            # zen-engine accepts a JDM mapping at runtime; its type hint is narrower.
            self._decision = self._engine.create_decision(jdm)  # type: ignore[arg-type]
        except Exception as exc:
            raise EvaluationError(
                f"Failed to load JDM into zen-engine: {exc}",
            ) from exc

    def evaluate(self, applicant: ApplicantInput) -> list[EligibilityResult]:
        """Return every bank the applicant is eligible for.

        Args:
            applicant: Validated applicant profile.

        Returns:
            One :class:`EligibilityResult` per matching rule (possibly empty).

        Raises:
            EvaluationError: if zen-engine evaluation fails.
        """
        context = applicant.model_dump()
        try:
            response = self._decision.evaluate(context)
        except Exception as exc:
            raise EvaluationError(
                f"zen-engine evaluation failed: {exc}",
                details={"applicant": context},
            ) from exc

        return [self._to_result(item) for item in _extract_rows(response)]

    def evaluate_detailed(self, applicant: ApplicantInput) -> list[BankEvaluation]:
        """Return a per-bank, per-parameter pass/fail trace + confidence score.

        For each bank rule, every constrained cell is evaluated individually with
        the same ZEN unary semantics the decision table uses. ``confidence_score``
        is ``rules_passed / rules_total`` (a deterministic 'how close to eligible'
        ratio). The list is sorted by confidence, highest first.

        Raises:
            EvaluationError: if a cell expression cannot be evaluated.
        """
        context = applicant.model_dump()
        evaluations: list[BankEvaluation] = []

        for row in self._rows:
            bank = row.outputs.get("bank_name", "").strip().strip('"')
            matches: list[RuleMatch] = []
            passed = 0
            for field_name in INPUT_FIELDS:
                value = context.get(field_name)
                cell = row.inputs.get(field_name, "")

                field_expr = INPUT_FIELD_EXPR.get(field_name)
                try:
                    subject = (
                        zen.evaluate_expression(field_expr, context) if field_expr else value
                    )
                except Exception:
                    subject = value

                if not cell:
                    ok = True
                else:
                    try:
                        ok = bool(zen.evaluate_unary_expression(cell, {"$": subject}))
                    except Exception as exc:
                        raise EvaluationError(
                            f"Failed to evaluate rule {cell!r} for {field_name!r}: {exc}",
                            details={"bank": bank, "parameter": field_name},
                        ) from exc

                passed += int(ok)
                matches.append(
                    RuleMatch(
                        parameter=field_name,
                        rule=cell,
                        value=subject,
                        status="PASS" if ok else "FAIL",
                    )
                )

            total = len(INPUT_FIELDS)
            evaluations.append(
                BankEvaluation(
                    bank_name=bank,
                    eligible=(total > 0 and passed == total),
                    confidence_score=round(passed / total, 4) if total else 1.0,
                    rules_passed=passed,
                    rules_total=total,
                    rules=matches,
                )
            )

        evaluations.sort(key=lambda e: e.confidence_score, reverse=True)
        return evaluations

    @staticmethod
    def _to_result(item: dict[str, Any]) -> EligibilityResult:
        description = item.get("description")
        return EligibilityResult(
            bank_name=str(item.get("bank_name", "")),
            description=str(description) if description not in (None, "") else None,
        )


def _extract_rows(response: Any) -> list[dict[str, Any]]:
    """Normalize a zen-engine response into a list of output dicts.

    ``collect`` yields ``{"result": [ {...}, ... ]}``; a single-hit policy would
    yield ``{"result": {...}}``. Handle both, plus a bare list/dict.
    """
    payload = response.get("result", response) if isinstance(response, dict) else response

    if payload is None:
        return []
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    if isinstance(payload, dict):
        return [payload]
    return []
