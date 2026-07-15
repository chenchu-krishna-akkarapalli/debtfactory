import { type ApplicantInput, DEFAULT_APPLICANT } from "./applicant.schema";

/** Every bank the matrix can return, in display order. */
export const ALL_BANKS = [
  "BOI",
  "Indian Bank",
  "IOB",
  "BOB",
  "HDFC",
  "AXIS",
  "Kotak",
  "BOM",
] as const;

export type BankName = (typeof ALL_BANKS)[number];

const LENIENT = {
  rented_house_self_employed: true,
  agriculture: true,
  no_income_proof: true,
  rental_income_non_itr: true,
  rental_income_not_reflecting: true,
  itr_not_filed: true,
} satisfies Partial<ApplicantInput>;

/**
 * A qualifying applicant profile per bank (verified against the V4 engine).
 *
 * V4 changes: BOM no longer accepts PL write-off; CIBIL thresholds raised.
 */
export const BANK_PRESETS: Record<BankName, ApplicantInput> = {
  BOI: { ...DEFAULT_APPLICANT },
  "Indian Bank": { ...DEFAULT_APPLICANT },
  IOB: { ...DEFAULT_APPLICANT, existing_car_loan: false },
  BOB: {
    ...DEFAULT_APPLICANT,
    existing_car_loan: false,
    rented_house_self_employed: true,
    self_employed: true,
    salaried: false,
    business_income: 150000,
    se_current_itr: 300000,
    se_previous_itr: 300000,
    business_itr_years: 2,
    self_employed_itr_filled: true,
  },
  HDFC: {
    ...DEFAULT_APPLICANT,
    ...LENIENT,
    self_employed: true,
    salaried: false,
    business_income: 150000,
    se_current_itr: 300000,
    se_previous_itr: 100000,
    business_itr_years: 2,
    self_employed_itr_filled: true,
  },
  AXIS: {
    ...DEFAULT_APPLICANT,
    ...LENIENT,
    self_employed: true,
    salaried: false,
    business_income: 150000,
    se_current_itr: 300000,
    se_previous_itr: 100000,
    business_itr_years: 2,
    self_employed_itr_filled: true,
  },
  Kotak: {
    ...DEFAULT_APPLICANT,
    ...LENIENT,
    self_employed: true,
    salaried: false,
    business_income: 150000,
    se_current_itr: 300000,
    se_previous_itr: 100000,
    business_itr_years: 2,
    self_employed_itr_filled: true,
  },
  BOM: {
    ...DEFAULT_APPLICANT,
    cibil_score: 660,
    cc_write_off: true,
    wo_amount: 3000,
    age: 40,
    with_guarantor: true,
    resi_cum_office_rented: true,
  },
};
