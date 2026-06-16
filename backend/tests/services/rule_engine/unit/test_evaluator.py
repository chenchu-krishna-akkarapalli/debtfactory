"""Unit tests for the evaluator — eligibility scenarios over the sample matrix."""

from __future__ import annotations

from app.services.rule_engine.engine.evaluator import Evaluator
from app.services.rule_engine.schemas import ApplicantInput


def _applicant(applicants: list[dict], name: str) -> ApplicantInput:
    payload = next(a for a in applicants if a["name"] == name)
    return ApplicantInput(**{k: v for k, v in payload.items() if k != "name"})


def test_clean_high_cibil_eligible_for_multiple_banks(
    evaluator: Evaluator, applicants: list[dict]
) -> None:
    """CIBIL 720 + clean record + income 30k → eligible for multiple banks."""
    results = evaluator.evaluate(_applicant(applicants, "clean_high_cibil"))
    banks = {r.bank_name for r in results}
    assert "BOI" in banks
    assert len(banks) >= 2


def test_underage_excluded_everywhere(evaluator: Evaluator, applicants: list[dict]) -> None:
    """Age 17 → no rule matches (excluded everywhere)."""
    results = evaluator.evaluate(_applicant(applicants, "underage_excluded"))
    assert results == []


def test_pl_written_off_matches_only_write_off_tolerant_rules(
    evaluator: Evaluator, applicants: list[dict]
) -> None:
    """PL written off → only write-off-tolerant (BOM-style) rules match."""
    results = evaluator.evaluate(_applicant(applicants, "pl_written_off"))
    banks = {r.bank_name for r in results}
    # The clean-record banks (which require pl_write_off=false) must be absent.
    assert "BOI" not in banks
    assert "Indian Bank" not in banks


def test_low_income_below_threshold_excluded(evaluator: Evaluator, applicants: list[dict]) -> None:
    """Income below the 25k threshold → excluded from income-gated banks."""
    results = evaluator.evaluate(_applicant(applicants, "low_income_borderline"))
    assert results == []


def test_evaluate_detailed_per_parameter_trace(
    evaluator: Evaluator, applicants: list[dict]
) -> None:
    """Detailed evaluation returns a per-bank, per-parameter trace + confidence."""
    evals = evaluator.evaluate_detailed(_applicant(applicants, "clean_high_cibil"))
    assert evals, "expected at least one bank evaluation"

    # Sorted by confidence, highest first.
    scores = [e.confidence_score for e in evals]
    assert scores == sorted(scores, reverse=True)

    for e in evals:
        assert 0.0 <= e.confidence_score <= 1.0
        assert e.rules_total == len(e.rules)
        assert e.rules_passed == sum(1 for r in e.rules if r.status == "PASS")
        assert e.eligible == (e.rules_passed == e.rules_total)

    # clean_high_cibil (CIBIL 720, car loan, clean) is eligible for BOI at 100%.
    boi = next(e for e in evals if e.bank_name == "BOI")
    assert boi.eligible
    assert boi.confidence_score == 1.0


def test_evaluate_detailed_reports_failing_parameter(
    evaluator: Evaluator, applicants: list[dict]
) -> None:
    """A near-miss bank lists the exact parameter(s) that failed."""
    # Indian Bank needs CIBIL >= 725; clean_high_cibil has 720 -> one FAIL.
    evals = evaluator.evaluate_detailed(_applicant(applicants, "clean_high_cibil"))
    indian = next(e for e in evals if e.bank_name == "Indian Bank")
    assert not indian.eligible
    failing = [r.parameter for r in indian.rules if r.status == "FAIL"]
    assert "cibil_score" in failing
