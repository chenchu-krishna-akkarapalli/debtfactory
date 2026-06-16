"""Rule Engine request/response DTOs (Pydantic v2).

These encode the applicant-profile contract from the Bank Eligibility Matrix.
Field names are the snake_case boundary names defined in :mod:`constants`; they
are mapped to the engine's expected keys in one place before evaluation.

Stubs: shapes are fully declared (so implementers know the exact contract) but no
business validation/logic is added beyond field types.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field


class ApplicantInput(BaseModel):
    """Applicant profile evaluated against every bank rule.

    Each field corresponds to one input column of the decision table. See
    ``README.md`` for the matrix mapping and example ZEN expressions.
    """

    model_config = ConfigDict(extra="forbid")

    cibil_score: int = Field(..., description="CIBIL credit score, e.g. 720.")
    pl_write_off: bool = Field(False, description="Personal loan written off.")
    home_loan_wo: bool = Field(False, description="Home loan written off.")
    consumer_loan_wo: bool = Field(False, description="Consumer loan written off.")
    agri_loan_wo: bool = Field(False, description="Agri loan written off.")
    msme_loan_wo: bool = Field(False, description="MSME loan written off.")
    auto_loan_wo: bool = Field(False, description="Auto loan written off.")
    cc_write_off: bool = Field(False, description="Credit card written off.")
    wo_amount: float = Field(0, description="Total written-off amount.")
    age: int = Field(..., description="Applicant age in years.")
    existing_account: bool = Field(False, description="Holds an existing account.")
    nri_pio: bool = Field(False, description="NRI / PIO status.")
    total_experience: float = Field(0, description="Total work experience (years).")
    current_experience: float = Field(0, description="Current job experience (years).")
    salary_mode: str = Field(..., description='Salary credit mode, e.g. "Bank Credit".')
    income: float = Field(..., description="Monthly net income.")

    # BRE sheet additions. Exact-match booleans: the applicant value must equal
    # the bank's Yes/No cell for the rule to match (same semantics as write-offs).
    existing_car_loan: bool = Field(False, description="Applicant has an existing car loan.")
    rented_house_self_employed: bool = Field(
        False, description="Self-employed applicant living in a rented house."
    )
    agriculture: bool = Field(False, description="Agriculture profession.")
    no_income_proof: bool = Field(False, description="Applicant has no income proof.")
    rental_income_non_itr: bool = Field(False, description="Rental income not declared in ITR.")
    rental_income_not_reflecting: bool = Field(
        False, description="Rental income not reflecting in bank statements."
    )
    itr_not_filed: bool = Field(False, description="Applicant has not filed ITR.")


class EligibilityResult(BaseModel):
    """A single bank the applicant is eligible for."""

    bank_name: str = Field(..., description="Eligible bank name, e.g. BOI.")
    description: str | None = Field(None, description="Optional rule note.")


RuleValue = bool | int | float | str | None


class RuleMatch(BaseModel):
    """Pass/fail of one applicant parameter against one bank's rule cell."""

    parameter: str = Field(..., description="Applicant field, e.g. 'cibil_score'.")
    rule: str = Field(..., description="The ZEN condition tested, e.g. '>= 675'.")
    value: RuleValue = Field(..., description="The applicant's value for the field.")
    status: Literal["PASS", "FAIL"] = Field(..., description="Match outcome.")


class BankEvaluation(BaseModel):
    """Per-bank breakdown: every parameter's match plus a confidence score.

    ``confidence_score`` is ``rules_passed / rules_total`` for the bank — a
    deterministic 'how close to eligible' ratio, not a statistical probability.
    """

    bank_name: str
    eligible: bool = Field(..., description="True iff every rule passes.")
    confidence_score: float = Field(..., description="rules_passed / rules_total (0..1).")
    rules_passed: int
    rules_total: int
    rules: list[RuleMatch]


EligibilityStatus = Literal["ELIGIBLE", "NOT_ELIGIBLE"]


class EvaluateResponse(BaseModel):
    """Response for ``POST /rule-engine/evaluate``."""

    eligible_banks: list[EligibilityResult]
    matched_rule_count: int = Field(..., description="Number of rules that matched.")
    evaluations: list[BankEvaluation] = Field(
        default_factory=list,
        description="Per-bank, per-parameter match + confidence, sorted by confidence desc.",
    )

    @computed_field(  # type: ignore[prop-decorator]
        description="Overall verdict, derived from eligible_banks — for easy UI branching.",
    )
    @property
    def eligibility_status(self) -> EligibilityStatus:
        """``ELIGIBLE`` if any bank matched, else ``NOT_ELIGIBLE``."""
        return "ELIGIBLE" if self.eligible_banks else "NOT_ELIGIBLE"


class ReloadResponse(BaseModel):
    """Response for ``POST /rule-engine/reload``."""

    rows_parsed: int
    jdm_path: str
    reloaded: bool = True
