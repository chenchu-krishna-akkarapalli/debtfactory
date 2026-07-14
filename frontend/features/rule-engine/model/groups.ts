import type { ApplicantInput } from "./applicant.schema";
import { BUSINESS_PROOF_OPTIONS } from "./applicant.schema";

export type FieldName = keyof ApplicantInput;

export type FieldMeta =
  | { name: FieldName; label: string; kind: "number"; min?: number; max?: number; step?: number }
  | { name: FieldName; label: string; kind: "toggle" }
  | { name: FieldName; label: string; kind: "select"; options: readonly string[] };

export interface FieldGroup {
  title: string;
  fields: FieldMeta[];
}

/** Field layout for the applicant form, grouped for scannability. */
export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "Credit Profile",
    fields: [
      { name: "cibil_score", label: "CIBIL Score", kind: "number", min: 300, max: 900, step: 1 },
      { name: "cibil_pl_score", label: "CIBIL PL Score", kind: "number", min: 0, max: 900, step: 1 },
      { name: "wo_amount", label: "Write-off Amount", kind: "number", min: 0, step: 100 },
      { name: "dpd", label: "Days Past Due (DPD)", kind: "number", min: 0, step: 1 },
      { name: "loan_enquiry", label: "Recent Loan Enquiry", kind: "toggle" },
      { name: "currently_outstanding", label: "Currently Outstanding Loans", kind: "toggle" },
    ],
  },
  {
    title: "Demographics & Status",
    fields: [
      { name: "age", label: "Age", kind: "number", min: 18, max: 100, step: 1 },
      { name: "age_last_emi_salaried", label: "Age at Last EMI (Salaried)", kind: "number", min: 0, max: 100, step: 1 },
      { name: "age_last_emi_se", label: "Age at Last EMI (Self Employed)", kind: "number", min: 0, max: 100, step: 1 },
      { name: "existing_account", label: "Existing A/C Holder", kind: "toggle" },
      { name: "unmarried", label: "Unmarried", kind: "toggle" },
      { name: "nri_pio", label: "NRI / PIO", kind: "toggle" },
      { name: "minimum_stay_period_nri", label: "NRI Stay Period (yrs)", kind: "number", min: 0, step: 1 },
      { name: "huf", label: "HUF (Hindu Undivided Family)", kind: "toggle" },
    ],
  },
  {
    title: "Residence & Office",
    fields: [
      { name: "rented_house_salaried", label: "Rented House (Salaried)", kind: "toggle" },
      { name: "rented_house_self_employed", label: "Rented House (SE)", kind: "toggle" },
      { name: "resi_cum_office_owned", label: "Resi-cum-Office Owned", kind: "toggle" },
      { name: "resi_cum_office_rented", label: "Resi-cum-Office Both Rented", kind: "toggle" },
      { name: "resi_office_separate_rented", label: "Resi & Office Separate, Both Rented", kind: "toggle" },
      { name: "without_guarantor", label: "Without Guarantor", kind: "toggle" },
      { name: "with_guarantor", label: "With Guarantor", kind: "toggle" },
    ],
  },
  {
    title: "Employment Details",
    fields: [
      { name: "salaried", label: "Salaried", kind: "toggle" },
      { name: "self_employed", label: "Self Employed", kind: "toggle" },
      { name: "total_experience", label: "Total Experience (yrs)", kind: "number", min: 0, max: 60, step: 0.5 },
      { name: "current_experience", label: "Current Co. Exp (yrs)", kind: "number", min: 0, max: 60, step: 0.5 },
      { name: "salary_payment_mode_bank_credit", label: "Salary: Bank Credit", kind: "toggle" },
      { name: "salary_payment_mode_cash", label: "Salary: Cash", kind: "toggle" },
    ],
  },
  {
    title: "Organization & Business Types",
    fields: [
      { name: "employment_firm", label: "Firm Employee", kind: "toggle" },
      { name: "employment_pvt_ltd", label: "Pvt Ltd Employee", kind: "toggle" },
      { name: "employment_public_ltd", label: "Public Ltd Employee", kind: "toggle" },
      { name: "employment_govt", label: "Govt Employee", kind: "toggle" },
      { name: "employment_psu", label: "PSU Employee", kind: "toggle" },
      { name: "proprietorship", label: "Proprietorship Business", kind: "toggle" },
      { name: "partnership_firm", label: "Partnership Firm Business", kind: "toggle" },
      { name: "private_limited", label: "Pvt Ltd Business", kind: "toggle" },
      { name: "public_limited", label: "Public Ltd Business", kind: "toggle" },
    ],
  },
  {
    title: "Income & Financials",
    fields: [
      { name: "income", label: "Monthly Salary", kind: "number", min: 0, step: 1000 },
      { name: "business_income", label: "Annual Business Income", kind: "number", min: 0, step: 5000 },
      { name: "se_current_itr", label: "SE Current Year ITR", kind: "number", min: 0, step: 10000 },
      { name: "se_previous_itr", label: "SE Previous Year ITR", kind: "number", min: 0, step: 10000 },
      { name: "business_itr_years", label: "Business ITR Years", kind: "number", min: 0, max: 10, step: 1 },
      { name: "emi_income", label: "EMI / Income Ratio", kind: "number", min: 0, max: 1, step: 0.01 },
      { name: "form_16_years", label: "Form 16 (Years)", kind: "number", min: 0, max: 10, step: 1 },
    ],
  },
  {
    title: "Documentation & Proof",
    fields: [
      { name: "no_income_proof", label: "No Income Proof", kind: "toggle" },
      { name: "business_proof", label: "Business Proof Requirement", kind: "select", options: BUSINESS_PROOF_OPTIONS },
      { name: "self_employed_itr_filled", label: "Self Employed ITR Filed", kind: "toggle" },
      { name: "itr_not_filed", label: "ITR Not Filed", kind: "toggle" },
    ],
  },
  {
    title: "Rental Income Details",
    fields: [
      { name: "rental_income_itr", label: "Rental Income - ITR declared", kind: "toggle" },
      { name: "rental_income_non_itr", label: "Rental Income - Non ITR", kind: "toggle" },
      { name: "rental_income_reflecting_in_bank", label: "Rental reflecting in Bank", kind: "toggle" },
      { name: "rental_income_not_reflecting", label: "Rental NOT reflecting in Bank", kind: "toggle" },
    ],
  },
  {
    title: "Write-offs & Defaults",
    fields: [
      { name: "pl_write_off", label: "PL Write-off", kind: "toggle" },
      { name: "home_loan_wo", label: "Home Loan WO", kind: "toggle" },
      { name: "consumer_loan_wo", label: "Consumer Loan WO", kind: "toggle" },
      { name: "agri_loan_wo", label: "Agri Loan WO", kind: "toggle" },
      { name: "msme_loan_wo", label: "MSME Loan WO", kind: "toggle" },
      { name: "auto_loan_wo", label: "Auto Loan WO", kind: "toggle" },
      { name: "cc_write_off", label: "CC Write-off", kind: "toggle" },
    ],
  },
  {
    title: "Other Profile Flags",
    fields: [
      { name: "existing_car_loan", label: "Existing Car Loan", kind: "toggle" },
      { name: "agriculture", label: "Agriculture Profession", kind: "toggle" },
    ],
  },
  {
    title: "Co-Applicant for Age",
    fields: [
      { name: "co_applicant_age_brother", label: "Brother", kind: "toggle" },
      { name: "co_applicant_age_sister", label: "Sister", kind: "toggle" },
    ],
  },
  {
    title: "Co-Applicant for Income",
    fields: [
      { name: "co_applicant_income_brother", label: "Brother", kind: "toggle" },
      { name: "co_applicant_income_father", label: "Father", kind: "toggle" },
      { name: "co_applicant_income_mother", label: "Mother", kind: "toggle" },
      { name: "co_applicant_income_sister", label: "Sister", kind: "toggle" },
    ],
  },
];
