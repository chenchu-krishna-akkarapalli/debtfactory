"use client";

import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/cn";

import type { ApplicantInput } from "../model/applicant.schema";
import type { FieldMeta } from "../model/groups";

const inputCls =
  "w-full rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-fg outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/40";

const TOGGLE_DESCRIPTIONS: Record<string, { yes: string; no: string }> = {
  pl_write_off: {
    yes: "Personal loan written off (Critical credit event).",
    no: "No written-off personal loans (Standard profile).",
  },
  home_loan_wo: {
    yes: "Home loan written off (Critical credit event).",
    no: "No written-off home loans (Standard profile).",
  },
  consumer_loan_wo: {
    yes: "Consumer loan written off (Credit event).",
    no: "No written-off consumer loans (Standard profile).",
  },
  agri_loan_wo: {
    yes: "Agri loan written off (Credit event).",
    no: "No written-off agri loans (Standard profile).",
  },
  msme_loan_wo: {
    yes: "MSME loan written off (Credit event).",
    no: "No written-off MSME loans (Standard profile).",
  },
  auto_loan_wo: {
    yes: "Auto loan written off (Credit event).",
    no: "No written-off auto loans (Standard profile).",
  },
  cc_write_off: {
    yes: "Credit card written off (Credit event).",
    no: "No written-off credit cards (Standard profile).",
  },
  loan_enquiry: {
    yes: "Recent loan enquiries registered (Risk factor).",
    no: "No recent loan enquiries (Ideal baseline).",
  },
  currently_outstanding: {
    yes: "Has outstanding defaults (High risk factor).",
    no: "No active default outstanding (Ideal baseline).",
  },
  existing_account: {
    yes: "Existing customer with target bank (Benefits apply).",
    no: "New customer to target bank.",
  },
  existing_car_loan: {
    yes: "Currently has an active car loan.",
    no: "No active car loan.",
  },
  rented_house_salaried: {
    yes: "Salaried tenant living in a rented house.",
    no: "Salaried tenant living in owned/other house.",
  },
  rented_house_self_employed: {
    yes: "Self-employed tenant living in a rented house.",
    no: "Self-employed tenant living in owned/other house.",
  },
  unmarried: {
    yes: "Applicant is unmarried.",
    no: "Applicant is married / other.",
  },
  nri_pio: {
    yes: "NRI / PIO applicant (Special criteria apply).",
    no: "Domestic resident applicant.",
  },
  salaried: {
    yes: "Applicant is Salaried.",
    no: "Applicant is not Salaried (Self-Employed).",
  },
  agriculture: {
    yes: "Engaged in agriculture profession.",
    no: "Not engaged in agriculture profession.",
  },
  employment_firm: { yes: "Employed in a Partnership/Proprietorship.", no: "Not employed in a Firm." },
  employment_pvt_ltd: { yes: "Employed in a Private Limited company.", no: "Not employed in Pvt Ltd." },
  employment_public_ltd: { yes: "Employed in a Public Limited company.", no: "Not employed in Public Ltd." },
  employment_govt: { yes: "Employed in Government service.", no: "Not employed in Govt." },
  employment_psu: { yes: "Employed in a Public Sector Undertaking.", no: "Not employed in PSU." },
  no_income_proof: { yes: "No official proof of income available.", no: "Official income proof available." },
  rental_income_non_itr: { yes: "Rental income exists but not declared in ITR.", no: "No non-ITR rental income." },
  rental_income_itr: { yes: "Rental income declared in ITR.", no: "No ITR rental income." },
  rental_income_not_reflecting: { yes: "Rental income does not reflect in bank statements.", no: "Rental income reflects in bank." },
  rental_income_reflecting_in_bank: { yes: "Rental income reflects in bank statements.", no: "No bank-reflecting rental income." },
  rental_income_agreement_no_itr_no_bank: {
    yes: "Rental with agreement, ITR not filed, not reflecting in bank.",
    no: "Not applicable.",
  },
  rental_income_agreement_itr_no_bank: {
    yes: "Rental with agreement, ITR filed, not reflecting in bank.",
    no: "Not applicable.",
  },
  rental_income_agreement_no_itr_in_bank: {
    yes: "Rental with agreement, ITR not filed, reflecting in bank.",
    no: "Not applicable.",
  },
  self_employed: { yes: "Applicant is Self-Employed.", no: "Applicant is not Self-Employed (Salaried)." },
  self_employed_itr_filled: { yes: "Filed ITR for business income.", no: "ITR not filed for business income." },
  itr_not_filed: { yes: "ITR not filed (No tax returns).", no: "ITR filed (Tax returns available)." },
  proprietorship: { yes: "Business type: Proprietorship.", no: "Not Proprietorship." },
  partnership_firm: { yes: "Business type: Partnership Firm.", no: "Not Partnership Firm." },
  private_limited: { yes: "Business type: Private Limited.", no: "Not Private Limited." },
  public_limited: { yes: "Business type: Public Limited.", no: "Not Public Limited." },
  resi_cum_office_owned: {
    yes: "Residence and office are the same and owned.",
    no: "Residence and office are not same-owned.",
  },
  resi_cum_office_rented: {
    yes: "Residence and office are the same and both rented.",
    no: "Residence/office are not both rented at same location.",
  },
  resi_office_separate_rented: {
    yes: "Residence and office are separate, both rented.",
    no: "Residence/office are not separate-rented.",
  },
  without_guarantor: {
    yes: "Applying without a guarantor.",
    no: "Not applying without guarantor.",
  },
  with_guarantor: {
    yes: "Applying with a guarantor.",
    no: "No guarantor provided.",
  },
  huf: {
    yes: "Hindu Undivided Family entity.",
    no: "Not a HUF entity.",
  },
  co_applicant_age_brother: {
    yes: "Brother available as co-applicant for age.",
    no: "Brother not available as co-applicant.",
  },
  co_applicant_age_sister: {
    yes: "Sister available as co-applicant for age.",
    no: "Sister not available as co-applicant.",
  },
  co_applicant_income_brother: {
    yes: "Brother available as co-applicant for income.",
    no: "Brother not available for income co-applicant.",
  },
  co_applicant_income_father: {
    yes: "Father available as co-applicant for income.",
    no: "Father not available for income co-applicant.",
  },
  co_applicant_income_mother: {
    yes: "Mother available as co-applicant for income.",
    no: "Mother not available for income co-applicant.",
  },
  co_applicant_income_sister: {
    yes: "Sister available as co-applicant for income.",
    no: "Sister not available for income co-applicant.",
  },
};

export function Field({
  meta,
  form,
}: {
  meta: FieldMeta;
  form: UseFormReturn<ApplicantInput>;
}) {
  const { register, formState, setValue, watch } = form;
  const error = formState.errors[meta.name]?.message as string | undefined;

  if (meta.kind === "toggle") {
    const value = watch(meta.name) as boolean | undefined;
    const isChecked = !!value;
    const desc = TOGGLE_DESCRIPTIONS[meta.name]?.[isChecked ? "yes" : "no"];

    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-border bg-surface-2 p-3">
        <span className="label-mono text-xs font-semibold text-fg">{meta.label}</span>
        <div className="grid grid-cols-2 gap-1 rounded bg-elevated p-0.5">
          <button
            type="button"
            onClick={() =>
              setValue(meta.name, true, { shouldValidate: true, shouldDirty: true })
            }
            className={cn(
              "rounded py-1 text-center font-mono text-[0.68rem] font-bold uppercase transition-all",
              isChecked
                ? "bg-accent text-accent-fg shadow-sm"
                : "text-fg-muted hover:text-fg hover:bg-surface-2",
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() =>
              setValue(meta.name, false, { shouldValidate: true, shouldDirty: true })
            }
            className={cn(
              "rounded py-1 text-center font-mono text-[0.68rem] font-bold uppercase transition-all",
              !isChecked
                ? "bg-surface-3 text-fg shadow-sm"
                : "text-fg-muted hover:text-fg hover:bg-surface-2",
            )}
          >
            No
          </button>
        </div>
        {desc ? (
          <p className="text-[0.62rem] leading-normal text-fg-subtle transition-all">
            {desc}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={meta.name} className="label-mono text-xs font-semibold">
        {meta.label}
      </label>
      {meta.kind === "select" ? (
        <select id={meta.name} className={inputCls} {...register(meta.name)}>
          {meta.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={meta.name}
          type="number"
          inputMode="decimal"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          className={cn(inputCls, error && "border-fail focus:border-fail focus:ring-fail/40")}
          {...register(meta.name, { valueAsNumber: true })}
        />
      )}
      {error ? <span className="text-[0.7rem] text-fail">{error}</span> : null}
    </div>
  );
}
