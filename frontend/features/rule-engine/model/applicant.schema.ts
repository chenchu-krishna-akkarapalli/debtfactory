import { z } from "zod";

/** Applicant contract for POST /rule-engine/evaluate (23 fields, snake_case). */
export const applicantSchema = z.object({
  cibil_score: z.number().int().min(300).max(900),
  pl_write_off: z.boolean(),
  home_loan_wo: z.boolean(),
  consumer_loan_wo: z.boolean(),
  agri_loan_wo: z.boolean(),
  msme_loan_wo: z.boolean(),
  auto_loan_wo: z.boolean(),
  cc_write_off: z.boolean(),
  wo_amount: z.number().min(0),
  age: z.number().int().min(18).max(100),
  existing_account: z.boolean(),
  nri_pio: z.boolean(),
  total_experience: z.number().min(0).max(60),
  current_experience: z.number().min(0).max(60),
  salary_mode: z.string().min(1),
  income: z.number().min(0),
  existing_car_loan: z.boolean(),
  rented_house_self_employed: z.boolean(),
  agriculture: z.boolean(),
  no_income_proof: z.boolean(),
  rental_income_non_itr: z.boolean(),
  rental_income_not_reflecting: z.boolean(),
  itr_not_filed: z.boolean(),
});

export type ApplicantInput = z.infer<typeof applicantSchema>;

/** A sensible, eligible-by-default starting applicant. */
export const DEFAULT_APPLICANT: ApplicantInput = {
  cibil_score: 750,
  pl_write_off: false,
  home_loan_wo: false,
  consumer_loan_wo: false,
  agri_loan_wo: false,
  msme_loan_wo: false,
  auto_loan_wo: false,
  cc_write_off: false,
  wo_amount: 0,
  age: 30,
  existing_account: true,
  nri_pio: false,
  total_experience: 5,
  current_experience: 2,
  salary_mode: "Bank Credit",
  income: 50000,
  existing_car_loan: true,
  rented_house_self_employed: false,
  agriculture: false,
  no_income_proof: false,
  rental_income_non_itr: false,
  rental_income_not_reflecting: false,
  itr_not_filed: false,
};

export const SALARY_MODES = ["Bank Credit", "Cash", "Cheque"] as const;
