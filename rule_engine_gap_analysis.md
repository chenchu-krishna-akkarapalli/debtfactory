# Rule Engine Gap Analysis (V4 Matrix vs. Frontend/Backend Schemas)

> [!NOTE]
> **RESOLVED (2026-07-15).** All 25 previously ignored parameters are now evaluated:
> * 22 V4 columns added to `Bank_Eligibility_Matrix.xlsx` (values sourced from `BRE sheet Ver 4(Sheet1).csv`).
> * 22 mappings added to `INPUT_COLUMN_TO_FIELD` and 7 gating expressions to `INPUT_FIELD_EXPR` in `backend/src/app/services/rule_engine/constants.py` (profession-specific limits waived via sentinels: `999` for CIBIL PL score, `0` for age-at-last-EMI, `999999`/`99` for ITR amounts/years).
> * 15 V4 boolean fields registered in `_BOOL_FIELDS` in `rule_validator.py`.
> * Frontend `feedback.tsx` renders sentinel values as WAIVED.
> * Verified: `/rule-engine/reload` parses 8 rows; all 8 bank presets pass; all 69 input parameters appear in evaluation output.
> * Open item: BOB "SE Current ITR: Less than 300000 (Condition)" left unconstrained pending business clarification.
> The table below describes the state **before** these fixes.

This document maps and analyzes the parameters across the business rules spreadsheet (`BRE sheet Ver 4(Sheet1).csv`), the live GoRules matrix (`Bank_Eligibility_Matrix.xlsx`), the backend mappings (`constants.py`), and the frontend form schema (`applicant.schema.ts`). 

---

## 🔍 Executive Summary

There is a significant mismatch between the fields defined in the frontend form & backend Pydantic schemas and the fields actually evaluated by the GoRules engine:
* **70 parameters** are defined in the frontend schema ([applicant.schema.ts](file:///c:/Projects/debtdactory/frontend/features/rule-engine/model/applicant.schema.ts)).
* **47 parameters** are mapped in the backend constants ([constants.py](file:///c:/Projects/debtdactory/backend/src/app/services/rule_engine/constants.py)).
* **Only 29 parameters** are actively constrained in the live rules engine ([Bank_Eligibility_Matrix.xlsx](file:///c:/Projects/debtdactory/backend/src/app/services/rule_engine/data/Bank_Eligibility_Matrix.xlsx)).
* **25 parameters** are defined in the schemas but **never evaluated by the engine** (they are completely ignored).
* **0 hardcoded evaluation rules** exist in the frontend UI. The frontend relies 100% on the backend `POST /rule-engine/evaluate` endpoint.

> [!WARNING]
> Users are currently filling out **25 fields** in the UI form (including Co-applicant details, HUF, Form 16, and various Residence statuses) that have **absolutely no impact** on their loan eligibility evaluations.

---

## 📊 Parameter Status Matrix

Below is a complete row-by-row mapping of parameters from the business sheet ([BRE sheet Ver 4(Sheet1).csv](file:///c:/Projects/debtdactory/backend/BRE%20sheet%20Ver%204(Sheet1).csv)):

| CSV Row | Business Parameter Name | Excel Column Header | Backend Field Name | Frontend Schema Key | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2** | CIBIL Score | `CIBIL Score` | `cibil_score` | `cibil_score` | **Fully Evaluated** |
| **3** | CIBIL PL Score | _None_ | `cibil_pl_score` | `cibil_pl_score` | 🚫 **Ignored** (Missing from Excel) |
| **4** | PL Write off | `PL Write off` | `pl_write_off` | `pl_write_off` | **Fully Evaluated** |
| **5** | Home Loan Write off | `Home Loan Write off` | `home_loan_wo` | `home_loan_wo` | **Fully Evaluated** |
| **6** | Consumer Loan Write off | `Consumer Loan  Write off` | `consumer_loan_wo` | `consumer_loan_wo` | **Fully Evaluated** |
| **7** | Agri Loan Write off | `Agri Loan  Write off` | `agri_loan_wo` | `agri_loan_wo` | **Fully Evaluated** |
| **8** | MSME Loan Write off | `MSME Loan  Write off` | `msme_loan_wo` | `msme_loan_wo` | **Fully Evaluated** |
| **9** | Auto Loan Write off | `Auto Loan  Write off` | `auto_loan_wo` | `auto_loan_wo` | **Fully Evaluated** |
| **10** | Credit Card Write Off | `Credit Card Write Off` | `cc_write_off` | `cc_write_off` | **Fully Evaluated** |
| **11** | Write Off Amount | `Write Off Amount` | `wo_amount` | `wo_amount` | **Fully Evaluated** (Computed in backend) |
| **12** | DPD | `DPD` | `dpd` | `dpd` | **Fully Evaluated** |
| **13** | Loan enquiry | `Loan enquiry` | `loan_enquiry` | `loan_enquiry` | **Fully Evaluated** |
| **14** | Currently Outstanding | `Currently Outstanding` | `currently_outstanding` | `currently_outstanding` | **Fully Evaluated** |
| **15** | Min Age Criterial | `Age` | `age` | `age` | **Fully Evaluated** (Mapped to `age`) |
| **16** | Age at last EMI Salaried | _None_ | `age_last_emi_salaried` | `age_last_emi_salaried` | 🚫 **Ignored** (Missing from Excel) |
| **18** | Age at last EMI Self Employeed | _None_ | `age_last_emi_se` | `age_last_emi_se` | 🚫 **Ignored** (Missing from Excel) |
| **19** | Existing A/C Holder | `Existing A/C Holder` | `existing_account` | `existing_account` | **Fully Evaluated** |
| **20** | Existing Car Loan | `Existing Car Loan` | `existing_car_loan` | `existing_car_loan` | **Fully Evaluated** |
| **21** | Rented House-Salaried | `Rented House-Salaried` | `rented_house_salaried` | `rented_house_salaried` | **Fully Evaluated** |
| **22** | Resi - Cum Office - One Owned | _None_ | `resi_cum_office_owned` | `resi_cum_office_owned` | 🚫 **Ignored** (Missing from Excel) |
| **23** | Resi - Cum Office -Both Rented | _None_ | `resi_cum_office_rented` | `resi_cum_office_rented` | 🚫 **Ignored** (Missing from Excel) |
| **24** | Without a Gaurantor | _None_ | `without_guarantor` | `without_guarantor` | 🚫 **Ignored** (Missing from Excel) |
| **25** | With a Gaurantor | _None_ | `with_guarantor` | `with_guarantor` | 🚫 **Ignored** (Missing from Excel) |
| **26** | Resi-Office-Separate-Both Rented | _None_ | `resi_office_separate_rented` | `resi_office_separate_rented` | 🚫 **Ignored** (Missing from Excel) |
| **27** | Unmarried | `Unmarried` | `unmarried` | `unmarried` | **Fully Evaluated** |
| **28** | NRI/PIO | `NRI/PIO` | `nri_pio` | `nri_pio` | **Fully Evaluated** |
| **29** | Minimium Stay Period for NRI | `Minimium Stay Period for NRI` | `minimum_stay_period_nri` | `minimum_stay_period_nri` | **Fully Evaluated** (Computed in backend) |
| **30** | Agriculture | `Agriculture` | `agriculture` | `agriculture` | **Fully Evaluated** |
| **31** | Employment-Firm | `Employment-Firm` | `employment_firm` | `employment_firm` | **Fully Evaluated** |
| **32** | Employment-Pvt Ltd | `Employment-Pvt Ltd` | `employment_pvt_ltd` | `employment_pvt_ltd` | **Fully Evaluated** |
| **33** | Employment-Public Ltd | `Employment-Public Ltd` | `employment_public_ltd` | `employment_public_ltd` | **Fully Evaluated** |
| **34** | Employment-Govt | `Employment-Govt` | `employment_govt` | `employment_govt` | **Fully Evaluated** |
| **35** | Employment-PSU | `Employment-PSU` | `employment_psu` | `employment_psu` | **Fully Evaluated** |
| **36** | Minimum work experience | `Minimum work experience` | `total_experience` | `total_experience` | **Fully Evaluated** |
| **37** | Work Experience in current co. | `Work Experience in current company` | `current_experience` | `current_experience` | **Fully Evaluated** |
| **38** | Salary payment mode-Cash | `Salary payment mode-Cash` | `salary_payment_mode_cash` | `salary_payment_mode_cash` | **Fully Evaluated** (Computed in backend) |
| **39** | Salary payment mode- Bank Credit | `Salary payment mode- Bank Credit` | `salary_payment_mode_bank_credit` | `salary_payment_mode_bank_credit` | **Fully Evaluated** (Computed in backend) |
| **40** | No Income Proof | `No Income Proof` | `no_income_proof` | `no_income_proof` | **Fully Evaluated** |
| **41** | Rental Income: Agreement/No ITR/No Bank | _None_ | `rental_income_agreement_no_itr_no_bank` | `rental_income_agreement_no_itr_no_bank` | 🚫 **Ignored** (Decomposed in Excel) |
| **42** | Rental Income: Agreement/ITR/No Bank | _None_ | `rental_income_agreement_itr_no_bank` | `rental_income_agreement_itr_no_bank` | 🚫 **Ignored** (Decomposed in Excel) |
| **43** | Rental Income: Agreement/No ITR/Bank | _None_ | `rental_income_agreement_no_itr_in_bank` | `rental_income_agreement_no_itr_in_bank` | 🚫 **Ignored** (Decomposed in Excel) |
| **44** | Minimum Salary per month | `Minimum Salary` | `minimum_salary` | `income` | **Fully Evaluated** (Computed in backend) |
| **45** | Self Employed Current ITR | _None_ | `se_current_itr` | `se_current_itr` | 🚫 **Ignored** (Missing from Excel) |
| **46** | Self Employed Previous ITR | _None_ | `se_previous_itr` | `se_previous_itr` | 🚫 **Ignored** (Missing from Excel) |
| **47** | Self Employed | `Self Employed` | `self_employed` | `self_employed` | **Fully Evaluated** |
| **48** | Self employed ITR Filled | `Self employed ITR Filled` | `self_employed_itr_filled` | `self_employed_itr_filled` | **Fully Evaluated** (Computed in backend) |
| **49** | ITR Not Filed | `ITR Not Filed` | `itr_not_filed` | `itr_not_filed` | **Fully Evaluated** |
| **50** | Business ITR | _None_ | `business_itr_years` | `business_itr_years` | 🚫 **Ignored** (Missing from Excel) |
| **51** | Business Proof | `Business Proof` | `business_proof` | `business_proof` | **Fully Evaluated** (Computed in backend) |
| **52** | Propreitorship | `Propreitorship` | `proprietorship` | `proprietorship` | **Fully Evaluated** |
| **53** | Parternship Firm | `Parternship Firm` | `partnership_firm` | `partnership_firm` | **Fully Evaluated** |
| **54** | Private Limited | `Private Limited` | `private_limited` | `private_limited` | **Fully Evaluated** |
| **55** | Public Limited | `Public Limited` | `public_limited` | `public_limited` | **Fully Evaluated** |
| **56** | EMI/Income | `EMI/Income` | `emi_income` | `emi_income` | **Fully Evaluated** |
| **57** | HUF | _None_ | `huf` | `huf` | 🚫 **Ignored** (Missing from Excel) |
| **58** | Form 16 | _None_ | `form_16_years` | `form_16_years` | 🚫 **Ignored** (Missing from Excel) |
| **60-61**| Co-Applicant for Age | _None_ | _Multiple keys_ | _Multiple keys_ | 🚫 **Ignored** (Missing from Excel) |
| **63-66**| Co-Applicant for Income | _None_ | _Multiple keys_ | _Multiple keys_ | 🚫 **Ignored** (Missing from Excel) |

---

## 🧩 Details of Ignored Parameters

These parameters are accepted by the schemas, but completely **ignored** during evaluations:

1. **CIBIL PL Score** (`cibil_pl_score`): No bank rules are defined for this.
2. **Age at Last EMI** (`age_last_emi_salaried` and `age_last_emi_se`): Defined in the schema but no rules constrain these fields.
3. **Residence/Office Ownership & Rented combos** (`resi_cum_office_owned`, `resi_cum_office_rented`, `resi_office_separate_rented`): The CSV sheet has rules for these, but they were omitted from the Excel matrix.
4. **Guarantor requirements** (`without_guarantor`, `with_guarantor`): Excel decision table doesn't evaluate guarantor flags.
5. **Business/ITR Financial Details** (`se_current_itr`, `se_previous_itr`, `business_itr_years`, `form_16_years`): Although self-employed parameters are critical in the business sheet, the Excel matrix only evaluates the simple binary `Self Employed` and `Self employed ITR Filled` flags, plus a combined `Min Bus Income` (from `business_income`). Detailed ITR amounts are not validated.
6. **Co-applicant Details**: All age and income co-applicant flags (Brother, Sister, Father, Mother) are not present in the Excel matrix.
7. **HUF (Hindu Undivided Family)**: Completely ignored by the engine.

---

## 🔄 Decomposed / Computed Parameters (How they actually map)

Some fields look like gaps but are handled via backend-computed formulas (`INPUT_FIELD_EXPR`):

* **Salary/Income** (`income`):
  * Mapped to Excel column `Minimum Salary`.
  * Computed expression: `salaried ? income : 999999`.
* **Business Income** (`business_income`):
  * Mapped to Excel column `Min Bus Income`.
  * Computed expression: `self_employed ? business_income : 999999`.
* **Rental Income**:
  * The business sheet specifies agreement types (Rows 41–43).
  * The Excel sheet decomposes these into four simple binary flags: `NON ITR`, `ITR`, `Not reflecting in Bank`, and `reflecting in Bank`.
  * The agreement-based fields (`rental_income_agreement_...`) in the schema are completely ignored.

---
