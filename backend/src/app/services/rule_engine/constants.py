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
    "Existing A/C Holder": "existing_account",
    "Existing Car Loan": "existing_car_loan",
    "Rented House-Salaried": "rented_house_salaried",
    "Rented House-Self Employed": "rented_house_self_employed",
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
    "Minimum Salary": "minimum_salary",
    "Min Bus Income": "min_bus_income",
    "Self Employed": "self_employed",
    "Self employed ITR Filled": "self_employed_itr_filled",
    "ITR Not Filed": "itr_not_filed",
    "Business Proof": "business_proof",
    "Propreitorship": "proprietorship",
    "Parternship Firm": "partnership_firm",
    "Private Limited": "private_limited",
    "Public Limited": "public_limited",
    "Currently Outstanding": "currently_outstanding",
    "EMI/Income": "emi_income",
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
}

# Convenience views.
INPUT_FIELDS: Final[tuple[str, ...]] = tuple(INPUT_COLUMN_TO_FIELD.values())
OUTPUT_FIELDS: Final[tuple[str, ...]] = tuple(OUTPUT_COLUMN_TO_FIELD.values())
ALL_COLUMNS: Final[tuple[str, ...]] = (
    *INPUT_COLUMN_TO_FIELD.keys(),
    *OUTPUT_COLUMN_TO_FIELD.keys(),
)
