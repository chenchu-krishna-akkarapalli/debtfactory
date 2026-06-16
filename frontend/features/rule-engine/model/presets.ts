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

// The "lenient documentation" profile that HDFC / AXIS / Kotak require.
const LENIENT = {
  rented_house_self_employed: true,
  agriculture: true,
  no_income_proof: true,
  rental_income_non_itr: true,
  rental_income_not_reflecting: true,
  itr_not_filed: true,
} satisfies Partial<ApplicantInput>;

/**
 * A qualifying applicant profile per bank (verified against the engine).
 *
 * No single applicant is eligible for all banks (BOM requires write-offs the
 * others forbid), so these presets let a demo load any bank instantly.
 */
export const BANK_PRESETS: Record<BankName, ApplicantInput> = {
  // Group A — clean credit + car loan + strict docs.
  BOI: { ...DEFAULT_APPLICANT },
  "Indian Bank": { ...DEFAULT_APPLICANT },
  IOB: { ...DEFAULT_APPLICANT },
  // BOB — no car loan + self-employed renting.
  BOB: { ...DEFAULT_APPLICANT, existing_car_loan: false, rented_house_self_employed: true },
  // Group C — full lenient-documentation profile.
  HDFC: { ...DEFAULT_APPLICANT, ...LENIENT },
  AXIS: { ...DEFAULT_APPLICANT, ...LENIENT },
  Kotak: { ...DEFAULT_APPLICANT, ...LENIENT },
  // BOM — write-off recovery product: PL + CC written off, amount < 5000.
  BOM: {
    ...DEFAULT_APPLICANT,
    cibil_score: 660,
    pl_write_off: true,
    cc_write_off: true,
    wo_amount: 3000,
    age: 40,
  },
};
