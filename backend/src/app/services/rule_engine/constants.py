"""Rule Engine constants: the matrix column contract and defaults.

This module is the single place that maps the ``Bank_Eligibility_Matrix.xlsx``
column headers to the snake_case field names used on the Python boundary. Keep
the mapping here so parser/validator/builder all agree on names and so a column
rename is a one-line change.

The matrix is a GoRules JDM decision table: each input cell holds a ZEN
Expression Language condition (e.g. ``>= 675``, ``[21..70]``, ``"Bank Credit"``)
evaluated against the applicant field of the same column.
"""

from __future__ import annotations

from typing import Final

# Service-wide identifiers.
SERVICE_NAME: Final[str] = "rule_engine"
ROUTE_PREFIX: Final[str] = "/rule-engine"

# Where the parsed JDM build artifact is written / loaded from.
MATRIX_SHEET_NAME: Final[str] = "decision table"
JDM_OUTPUT_FILENAME: Final[str] = "bank_eligibility.jdm.json"

# Input columns: matrix header -> applicant field name. Order matters — it is the
# left-to-right column order of the decision table.
INPUT_COLUMN_TO_FIELD: Final[dict[str, str]] = {
    "CIBIL Score": "cibil_score",
    "CIBIL PL Score": "cibil_pl_score",
    "PL Write off": "pl_write_off",
    "Home Loan Write off": "home_loan_wo",
    "Consumer Loan  Write off": "consumer_loan_wo",
    "Agri Loan  Write off": "agri_loan_wo",
    "MSME Loan  Write off": "msme_loan_wo",
    "Auto Loan  Write off": "auto_loan_wo",
    "Credit Card Write Off": "cc_write_off",
    "Write Off Amount": "wo_amount",
    "DPD": "dpd",
    "Loan enquiry": "loan_enquiry",
    "Age": "age",
    "Age at Last EMI-Salaried": "age_last_emi_salaried",
    "Age at Last EMI-Self Employed": "age_last_emi_se",
    "Existing A/C Holder": "existing_account",
    "Existing Car Loan": "existing_car_loan",
    "Rented House-Salaried": "rented_house_salaried",
    "Rented House-Self Employed": "rented_house_self_employed",
    "Resi-Cum-Office-Owned": "resi_cum_office_owned",
    "Resi-Cum-Office-Both Rented": "resi_cum_office_rented",
    "Resi-Office-Separate-Both Rented": "resi_office_separate_rented",
    "Without a Guarantor": "without_guarantor",
    "With a Guarantor": "with_guarantor",
    "Unmarried": "unmarried",
    "NRI/PIO": "nri_pio",
    "Minimium Stay Period for NRI": "minimum_stay_period_nri",
    "Salaried": "salaried",
    "Agriculture": "agriculture",
    "Employment-Firm": "employment_firm",
    "Employment-Pvt Ltd": "employment_pvt_ltd",
    "Employment-Public Ltd": "employment_public_ltd",
    "Employment-Govt": "employment_govt",
    "Employment-PSU": "employment_psu",
    "Minimum work experience": "total_experience",
    "Work Experience in current company": "current_experience",
    "Salary payment mode-Cash": "salary_payment_mode_cash",
    "Salary payment mode- Bank Credit": "salary_payment_mode_bank_credit",
    "No Income Proof": "no_income_proof",
    "Rental Income-NON ITR": "rental_income_non_itr",
    "Rental Income-ITR": "rental_income_itr",
    "Rental Income-Not reflecting in Bank": "rental_income_not_reflecting",
    "Rental Income-reflecting in Bank": "rental_income_reflecting_in_bank",
    "Rental Income-Agreement-No ITR-Not in Bank": "rental_income_agreement_no_itr_no_bank",
    "Rental Income-Agreement-ITR-Not in Bank": "rental_income_agreement_itr_no_bank",
    "Rental Income-Agreement-No ITR-In Bank": "rental_income_agreement_no_itr_in_bank",
    "Minimum Salary": "minimum_salary",
    "Min Bus Income": "min_bus_income",
    "SE Current ITR": "se_current_itr",
    "SE Previous ITR": "se_previous_itr",
    "Self Employed": "self_employed",
    "Self employed ITR Filled": "self_employed_itr_filled",
    "Business ITR Years": "business_itr_years",
    "ITR Not Filed": "itr_not_filed",
    "Business Proof": "business_proof",
    "Propreitorship": "proprietorship",
    "Parternship Firm": "partnership_firm",
    "Private Limited": "private_limited",
    "Public Limited": "public_limited",
    "Currently Outstanding": "currently_outstanding",
    "EMI/Income": "emi_income",
    "HUF": "huf",
    "Form 16 Years": "form_16_years",
    "Co-Applicant Age-Brother": "co_applicant_age_brother",
    "Co-Applicant Age-Sister": "co_applicant_age_sister",
    "Co-Applicant Income-Brother": "co_applicant_income_brother",
    "Co-Applicant Income-Father": "co_applicant_income_father",
    "Co-Applicant Income-Mother": "co_applicant_income_mother",
    "Co-Applicant Income-Sister": "co_applicant_income_sister",
}

# Output columns: matrix header -> result field name.
OUTPUT_COLUMN_TO_FIELD: Final[dict[str, str]] = {
    "Bank Name": "bank_name",
    "Description": "description",
}

# Input columns whose decision-table FIELD is a computed ZEN expression instead of
# the raw applicant field. This lets a single cell encode a cross-field conditional
# that a plain unary test cannot.
INPUT_FIELD_EXPR: Final[dict[str, str]] = {
    "wo_amount": "(pl_write_off or cc_write_off) ? wo_amount : 0",
    "minimum_salary": "salaried ? income : 999999",
    "min_bus_income": "self_employed ? business_income : 999999",
    "minimum_stay_period_nri": "nri_pio ? minimum_stay_period_nri : 99",
    "self_employed_itr_filled": "self_employed ? self_employed_itr_filled : true",
    "business_proof": 'self_employed ? business_proof : "Mandatory"',
    "salary_payment_mode_bank_credit": "salaried ? salary_payment_mode_bank_credit : true",
    "salary_payment_mode_cash": "salaried ? salary_payment_mode_cash : false",
    "rented_house_self_employed": "self_employed ? rented_house_self_employed : false",
    # V4: profession-specific numeric limits waived for the other profession via sentinels.
    "cibil_pl_score": "cibil_pl_score > 0 ? cibil_pl_score : 999",
    "age_last_emi_salaried": "salaried ? age_last_emi_salaried : 0",
    "age_last_emi_se": "self_employed ? age_last_emi_se : 0",
    "se_current_itr": "self_employed ? se_current_itr : 999999",
    "se_previous_itr": "self_employed ? se_previous_itr : 999999",
    "business_itr_years": "self_employed ? business_itr_years : 99",
    "form_16_years": "salaried ? form_16_years : 99",
}

# Convenience views.
INPUT_FIELDS: Final[tuple[str, ...]] = tuple(INPUT_COLUMN_TO_FIELD.values())
OUTPUT_FIELDS: Final[tuple[str, ...]] = tuple(OUTPUT_COLUMN_TO_FIELD.values())
ALL_COLUMNS: Final[tuple[str, ...]] = (
    *INPUT_COLUMN_TO_FIELD.keys(),
    *OUTPUT_COLUMN_TO_FIELD.keys(),
)
