import { Check, X } from "lucide-react";

import type { EligibilityStatus, RuleStatus } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type BadgeKind = RuleStatus | EligibilityStatus;

const BADGE: Record<BadgeKind, { text: string; cls: string }> = {
  PASS: { text: "PASS", cls: "text-pass bg-pass-soft" },
  FAIL: { text: "FAIL", cls: "text-fail bg-fail-soft" },
  ELIGIBLE: { text: "ELIGIBLE", cls: "text-pass bg-pass-soft" },
  NOT_ELIGIBLE: { text: "NOT ELIGIBLE", cls: "text-fail bg-fail-soft" },
};

export function StatusBadge({ status, className }: { status: BadgeKind; className?: string }) {
  const b = BADGE[status];
  const pass = status === "PASS" || status === "ELIGIBLE";
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.7rem]",
        b.cls,
        className,
      )}
    >
      {pass ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
      {b.text}
    </span>
  );
}

/** Confidence/match bar: track + accent fill + right-aligned %. */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;
  return (
    <div className={cn("rounded-md border border-border bg-surface-2 p-4", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label-mono">confidence_score</span>
        <span className="font-mono text-lg font-semibold text-fg tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const PARAMETER_LABELS: Record<string, string> = {
  cibil_score: "CIBIL Score Check",
  pl_write_off: "Personal Loan Write-Off Status",
  home_loan_wo: "Home Loan Write-Off Status",
  consumer_loan_wo: "Consumer Loan Write-Off Status",
  agri_loan_wo: "Agri Loan Write-Off Status",
  msme_loan_wo: "MSME Loan Write-Off Status",
  auto_loan_wo: "Auto Loan Write-Off Status",
  cc_write_off: "Credit Card Write-Off Status",
  wo_amount: "Total Write-Off Amount Check",
  dpd: "Days Past Due (DPD) Limit",
  loan_enquiry: "Recent Loan Enquiries Check",
  age: "Applicant Age Restriction",
  existing_account: "Existing Account Holder benefits",
  existing_car_loan: "Existing Car Loan Check",
  rented_house_salaried: "Rented House (Salaried) eligibility",
  rented_house_self_employed: "Rented House (Self-Employed) eligibility",
  unmarried: "Unmarried Status Allowed check",
  nri_pio: "NRI / PIO Status allowed check",
  minimum_stay_period_nri: "NRI Minimum Stay Period",
  salaried: "Salaried Profession check",
  agriculture: "Agricultural Income allowance",
  employment_firm: "Employment Type: Firm allowed",
  employment_pvt_ltd: "Employment Type: Pvt Ltd allowed",
  employment_public_ltd: "Employment Type: Public Ltd allowed",
  employment_govt: "Employment Type: Govt allowed",
  employment_psu: "Employment Type: PSU allowed",
  total_experience: "Minimum Total Experience",
  current_experience: "Current Job Experience",
  salary_payment_mode_cash: "Salary Mode: Cash Allowed",
  salary_payment_mode_bank_credit: "Salary Mode: Bank Credit",
  no_income_proof: "No Income Proof Allowed check",
  rental_income_non_itr: "Rental Income: Non-ITR allowance",
  rental_income_itr: "Rental Income: ITR Declared",
  rental_income_not_reflecting: "Rental Income: Not Reflecting in Bank",
  rental_income_reflecting_in_bank: "Rental Income: Reflecting in Bank",
  minimum_salary: "Minimum Salary requirement",
  min_bus_income: "Minimum Business Income requirement",
  self_employed: "Self-Employed Profession check",
  self_employed_itr_filled: "Self-Employed ITR Filed check",
  itr_not_filed: "ITR Not Filed Allowed check",
  business_proof: "Business Proof Requirement",
  proprietorship: "Business Type: Proprietorship",
  partnership_firm: "Business Type: Partnership Firm",
  private_limited: "Business Type: Private Limited Co.",
  public_limited: "Business Type: Public Limited Co.",
  currently_outstanding: "Active Outstanding defaults check",
  emi_income: "EMI to Income Ratio Check",
  cibil_pl_score: "CIBIL PL Score Check",
  age_last_emi_salaried: "Age at Last EMI (Salaried)",
  age_last_emi_se: "Age at Last EMI (Self Employed)",
  resi_cum_office_owned: "Resi-cum-Office Owned Status",
  resi_cum_office_rented: "Resi-cum-Office Both Rented Status",
  resi_office_separate_rented: "Resi & Office Separate, Both Rented",
  without_guarantor: "Without Guarantor Allowed",
  with_guarantor: "With Guarantor Allowed",
  se_current_itr: "SE Current Year ITR Amount",
  se_previous_itr: "SE Previous Year ITR Amount",
  business_itr_years: "Business ITR Filing Years",
  huf: "HUF (Hindu Undivided Family) Status",
  form_16_years: "Form 16 Available (Years)",
  co_applicant_age_brother: "Co-Applicant for Age: Brother",
  co_applicant_age_sister: "Co-Applicant for Age: Sister",
  co_applicant_income_brother: "Co-Applicant for Income: Brother",
  co_applicant_income_father: "Co-Applicant for Income: Father",
  co_applicant_income_mother: "Co-Applicant for Income: Mother",
  co_applicant_income_sister: "Co-Applicant for Income: Sister",
};

function formatMetric(parameter: string, valStr: string): string {
  const val = Number(valStr);
  if (isNaN(val)) return valStr;
  if (
    parameter === "wo_amount" ||
    parameter === "minimum_salary" ||
    parameter === "min_bus_income" ||
    parameter === "se_current_itr" ||
    parameter === "se_previous_itr"
  ) {
    return `₹${val.toLocaleString("en-IN")}`;
  }
  if (
    parameter === "total_experience" ||
    parameter === "current_experience" ||
    parameter === "minimum_stay_period_nri" ||
    parameter === "business_itr_years" ||
    parameter === "form_16_years"
  ) {
    return `${val} Yr${val === 1 ? "" : "s"}`;
  }
  if (parameter === "emi_income") {
    return `${(val * 100).toFixed(0)}%`;
  }
  return valStr;
}

export interface TranslatedRule {
  label: string;
  benchmark: string;
  actual: string;
  isWaived: boolean;
}

export function translateRule(
  parameter: string,
  rule: string,
  value: boolean | number | string | null,
): TranslatedRule {
  const label = PARAMETER_LABELS[parameter] || parameter;
  const isNull =
    value === null || value === undefined || String(value).toLowerCase() === "null";

  let isWaived = false;
  if (isNull) {
    isWaived = true;
  } else if (parameter === "minimum_salary" && Number(value) >= 999999) {
    isWaived = true;
  } else if (parameter === "min_bus_income" && Number(value) >= 999999) {
    isWaived = true;
  } else if (parameter === "minimum_stay_period_nri" && Number(value) >= 99) {
    isWaived = true;
  }

  let actual = "";
  if (isWaived) {
    actual = "N/A (Waived / Exemption)";
  } else if (typeof value === "boolean") {
    actual = value ? "Yes" : "No";
  } else if (
    parameter === "wo_amount" ||
    parameter === "minimum_salary" ||
    parameter === "min_bus_income" ||
    parameter === "se_current_itr" ||
    parameter === "se_previous_itr"
  ) {
    actual = `₹${Number(value).toLocaleString("en-IN")}`;
  } else if (
    parameter === "total_experience" ||
    parameter === "current_experience" ||
    parameter === "minimum_stay_period_nri" ||
    parameter === "business_itr_years" ||
    parameter === "form_16_years"
  ) {
    actual = `${value} Year${value === 1 ? "" : "s"}`;
  } else if (parameter === "emi_income") {
    actual = `${(Number(value) * 100).toFixed(0)}%`;
  } else {
    actual = String(value);
  }

  let benchmark = rule;
  if (isWaived) {
    benchmark = "Waived under current profile";
  } else {
    const ruleTrim = rule.trim();
    if (ruleTrim === "") {
      benchmark = "No Constraint (Any Value Allowed)";
    } else if (ruleTrim === "true") {
      benchmark = "Required (Yes)";
    } else if (ruleTrim === "false") {
      benchmark = "Must be Clear (No)";
    } else if (ruleTrim.startsWith(">=")) {
      const num = ruleTrim.replace(">=", "").trim();
      benchmark = `Minimum ${formatMetric(parameter, num)}`;
    } else if (ruleTrim.startsWith("<=")) {
      const num = ruleTrim.replace("<=", "").trim();
      benchmark = `Maximum ${formatMetric(parameter, num)}`;
    } else if (ruleTrim.startsWith("<")) {
      const num = ruleTrim.replace("<", "").trim();
      benchmark = `Under ${formatMetric(parameter, num)}`;
    } else if (ruleTrim.startsWith(">")) {
      const num = ruleTrim.replace(">", "").trim();
      benchmark = `Over ${formatMetric(parameter, num)}`;
    } else if (ruleTrim.startsWith("[") && ruleTrim.endsWith("]")) {
      const range = ruleTrim.slice(1, -1).split("..");
      if (range.length === 2) {
        benchmark = `Range: ${range[0]} to ${range[1]}`;
      }
    } else if (ruleTrim.startsWith('"') && ruleTrim.endsWith('"')) {
      benchmark = `Must be ${ruleTrim.slice(1, -1)}`;
    }
  }

  return { label, benchmark, actual, isWaived };
}

/** One rule line: styled card containing plain-language rule translation. */
export function RuleRow({
  parameter,
  rule,
  value,
  status,
}: {
  parameter: string;
  rule: string;
  value: boolean | number | string | null;
  status: RuleStatus;
}) {
  const { label, benchmark, actual, isWaived } = translateRule(parameter, rule, value);
  const fail = status === "FAIL";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-surface-1 p-3.5 shadow-sm transition-all",
        fail && "border-l-4 border-l-fail bg-fail-soft/10",
        isWaived && "border-l-4 border-l-amber-500/50 bg-amber-500/[0.03]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6rem]",
              fail
                ? "bg-fail/20 text-fail"
                : isWaived
                  ? "bg-amber-500/20 text-amber-600"
                  : "bg-pass/20 text-pass",
            )}
          >
            {fail ? (
              <X size={12} strokeWidth={3} />
            ) : isWaived ? (
              <span className="font-bold">~</span>
            ) : (
              <Check size={12} strokeWidth={3} />
            )}
          </span>
          <span className="truncate text-sm font-medium text-fg">{label}</span>
          <span className="hidden font-mono text-[0.65rem] text-fg-subtle md:inline">
            ({parameter})
          </span>
        </div>
        <span
          className={cn(
            "label-mono shrink-0 rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase",
            fail
              ? "text-fail bg-fail-soft"
              : isWaived
                ? "text-amber-600 bg-amber-500/10"
                : "text-pass bg-pass-soft",
          )}
        >
          {fail ? "REJECTED" : isWaived ? "WAIVED" : "PASSED"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 pt-2 text-[0.72rem] text-fg-muted border-t border-border/40 font-mono sm:grid-cols-2">
        <div>
          <span className="text-fg-subtle">Target Limit:</span> {benchmark}
        </div>
        <div>
          <span className="text-fg-subtle">Actual Profile:</span> {actual}
        </div>
      </div>
    </div>
  );
}
