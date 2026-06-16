import type { ApplicantInput } from "./applicant.schema";

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
    title: "Credit",
    fields: [
      { name: "cibil_score", label: "CIBIL Score", kind: "number", min: 300, max: 900, step: 1 },
      { name: "wo_amount", label: "Write-off Amount", kind: "number", min: 0, step: 100 },
    ],
  },
  {
    title: "Demographics",
    fields: [
      { name: "age", label: "Age", kind: "number", min: 18, max: 100, step: 1 },
      { name: "existing_account", label: "Existing A/C Holder", kind: "toggle" },
      { name: "nri_pio", label: "NRI / PIO", kind: "toggle" },
    ],
  },
  {
    title: "Employment & Income",
    fields: [
      { name: "total_experience", label: "Total Experience (yrs)", kind: "number", min: 0, max: 60, step: 0.5 },
      { name: "current_experience", label: "Current Co. Exp (yrs)", kind: "number", min: 0, max: 60, step: 0.5 },
      { name: "salary_mode", label: "Salary Mode", kind: "select", options: ["Bank Credit", "Cash", "Cheque"] },
      { name: "income", label: "Monthly Income", kind: "number", min: 0, step: 1000 },
    ],
  },
  {
    title: "Write-offs",
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
    title: "BRE Flags",
    fields: [
      { name: "existing_car_loan", label: "Existing Car Loan", kind: "toggle" },
      { name: "rented_house_self_employed", label: "Rented House (SE)", kind: "toggle" },
      { name: "agriculture", label: "Agriculture", kind: "toggle" },
      { name: "no_income_proof", label: "No Income Proof", kind: "toggle" },
      { name: "rental_income_non_itr", label: "Rental Income (Non-ITR)", kind: "toggle" },
      { name: "rental_income_not_reflecting", label: "Rental Not Reflecting", kind: "toggle" },
      { name: "itr_not_filed", label: "ITR Not Filed", kind: "toggle" },
    ],
  },
];
