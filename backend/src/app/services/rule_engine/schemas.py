"""Rule Engine request/response DTOs (Pydantic v2).

These encode the applicant-profile contract from the Bank Eligibility Matrix.
Field names are the snake_case boundary names defined in :mod:`constants`; they
are mapped to the engine's expected keys in one place before evaluation.

Stubs: shapes are fully declared (so implementers know the exact contract) but no
business validation/logic is added beyond field types.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator


class ApplicantInput(BaseModel):
    """Applicant profile evaluated against every bank rule.

    Each field corresponds to one input column of the decision table. See
    ``README.md`` for the matrix mapping and example ZEN expressions.
    """

    model_config = ConfigDict(extra="forbid", strict=True)

    cibil_score: int = Field(..., description="CIBIL credit score, e.g. 720.")
    cibil_pl_score: int = Field(0, description="CIBIL PL score.")
    pl_write_off: bool = Field(False, description="Personal loan written off.")
    home_loan_wo: bool = Field(False, description="Home loan written off.")
    consumer_loan_wo: bool = Field(False, description="Consumer loan written off.")
    agri_loan_wo: bool = Field(False, description="Agri loan written off.")
    msme_loan_wo: bool = Field(False, description="MSME loan written off.")
    auto_loan_wo: bool = Field(False, description="Auto loan written off.")
    cc_write_off: bool = Field(False, description="Credit card written off.")
    wo_amount: float = Field(0, description="Total written-off amount.")
    dpd: int = Field(0, description="Days Past Due (DPD) on outstanding accounts.")
    loan_enquiry: bool = Field(False, description="Recent loan enquiries in bureau history.")
    age: int = Field(..., description="Applicant age in years.")
    age_last_emi_salaried: int = Field(60, description="Age at last EMI for salaried applicant.")
    age_last_emi_se: int = Field(65, description="Age at last EMI for self-employed applicant.")
    existing_account: bool = Field(False, description="Holds an existing account with the bank.")
    existing_car_loan: bool = Field(False, description="Applicant has an existing car loan.")
    rented_house_salaried: bool = Field(
        False, description="Salaried applicant living in a rented house."
    )
    rented_house_self_employed: bool = Field(
        False, description="Self-employed applicant living in a rented house."
    )
    resi_cum_office_owned: bool = Field(True, description="Residence and office are same and owned.")
    resi_cum_office_rented: bool = Field(
        False, description="Residence and office are same and both rented."
    )
    resi_office_separate_rented: bool = Field(
        False, description="Residence and office are separate, both rented."
    )
    without_guarantor: bool = Field(False, description="Applying without a guarantor.")
    with_guarantor: bool = Field(False, description="Applying with a guarantor.")
    unmarried: bool = Field(False, description="Applicant is unmarried.")
    nri_pio: bool = Field(False, description="NRI / PIO status.")
    minimum_stay_period_nri: int = Field(
        0, description="Minimum stay period in current country for NRI (years)."
    )
    salaried: bool = Field(False, description="Applicant is salaried.")
    agriculture: bool = Field(False, description="Agriculture profession.")
    employment_firm: bool = Field(
        False, description="Employed in a partnership or proprietorship firm."
    )
    employment_pvt_ltd: bool = Field(False, description="Employed in a Private Limited company.")
    employment_public_ltd: bool = Field(False, description="Employed in a Public Limited company.")
    employment_govt: bool = Field(False, description="Employed in Government service.")
    employment_psu: bool = Field(False, description="Employed in a Public Sector Undertaking.")
    total_experience: float = Field(0, description="Total work experience (years).")
    current_experience: float = Field(0, description="Current job experience (years).")
    salary_payment_mode_cash: bool = Field(False, description="Salary paid by cash.")
    salary_payment_mode_bank_credit: bool = Field(False, description="Salary paid by bank credit.")
    no_income_proof: bool = Field(False, description="Applicant has no income proof.")
    rental_income_non_itr: bool = Field(False, description="Rental income not declared in ITR.")
    rental_income_itr: bool = Field(False, description="Rental income declared in ITR.")
    rental_income_not_reflecting: bool = Field(
        False, description="Rental income not reflecting in bank statements."
    )
    rental_income_reflecting_in_bank: bool = Field(
        False, description="Rental income reflecting in bank statements."
    )
    rental_income_agreement_no_itr_no_bank: bool = Field(
        False, description="Rental with agreement, ITR not filed, not reflecting in bank."
    )
    rental_income_agreement_itr_no_bank: bool = Field(
        False, description="Rental with agreement, ITR filed, not reflecting in bank."
    )
    rental_income_agreement_no_itr_in_bank: bool = Field(
        False, description="Rental with agreement, ITR not filed, reflecting in bank."
    )
    income: float = Field(..., description="Monthly net income (salary).")
    business_income: float = Field(0, description="Annual business income.")
    se_current_itr: float = Field(0, description="Self-employed current year ITR amount.")
    se_previous_itr: float = Field(0, description="Self-employed previous year ITR amount.")
    business_itr_years: int = Field(0, description="Number of years business ITR filed.")
    self_employed: bool = Field(False, description="Applicant is self-employed.")
    self_employed_itr_filled: bool = Field(
        False, description="Self-employed applicant has filed ITR."
    )
    itr_not_filed: bool = Field(False, description="Applicant has not filed ITR.")
    business_proof: str = Field(
        "", description="Business proof status (e.g. 'Mandatory', 'Optional')."
    )
    proprietorship: bool = Field(False, description="Proprietorship business type.")
    partnership_firm: bool = Field(False, description="Partnership firm business type.")
    private_limited: bool = Field(False, description="Private limited business type.")
    public_limited: bool = Field(False, description="Public limited business type.")
    currently_outstanding: bool = Field(False, description="Has currently outstanding loans.")
    emi_income: float = Field(0, description="EMI to Income ratio.")
    huf: bool = Field(False, description="Hindu Undivided Family entity.")
    form_16_years: int = Field(2, description="Number of years Form 16 available.")
    co_applicant_age_brother: bool = Field(False, description="Brother as co-applicant for age.")
    co_applicant_age_sister: bool = Field(False, description="Sister as co-applicant for age.")
    co_applicant_income_brother: bool = Field(
        False, description="Brother as co-applicant for income."
    )
    co_applicant_income_father: bool = Field(
        False, description="Father as co-applicant for income."
    )
    co_applicant_income_mother: bool = Field(
        False, description="Mother as co-applicant for income."
    )
    co_applicant_income_sister: bool = Field(
        False, description="Sister as co-applicant for income."
    )

    # Legacy / compatibility properties
    salary_mode: Literal["Bank Credit", "Cash"] | None = Field(
        None, description="Legacy salary credit mode."
    )

    @model_validator(mode="before")
    @classmethod
    def map_legacy_fields(cls, data: dict[str, Any]) -> dict[str, Any]:
        if isinstance(data, dict):
            salary_mode = data.get("salary_mode")
            if salary_mode is not None:
                if "salary_payment_mode_bank_credit" not in data:
                    data["salary_payment_mode_bank_credit"] = salary_mode == "Bank Credit"
                if "salary_payment_mode_cash" not in data:
                    data["salary_payment_mode_cash"] = salary_mode == "Cash"

            cash = data.get("salary_payment_mode_cash", False)
            bank = data.get("salary_payment_mode_bank_credit", False)
            if cash and bank:
                msg = "salary_payment_mode_cash and salary_payment_mode_bank_credit cannot both be true"
                raise ValueError(msg)
        return data


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
