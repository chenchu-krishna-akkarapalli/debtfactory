"use client";

import { Check, X } from "lucide-react";

import { Stack } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

import type { ApplicantInput } from "../model/applicant.schema";
import { ALL_BANKS, BANK_PRESETS, type BankName } from "../model/presets";

/**
 * Vertical rail of all banks. Eligible banks (for the current applicant) are
 * highlighted; clicking a chip loads a profile that qualifies for that bank.
 */
export function BankChips({
  eligible,
  onPick,
}: {
  eligible: Set<string>;
  onPick: (preset: ApplicantInput, bank: BankName) => void;
}) {
  return (
    <Stack gap={3}>
      <div className="flex flex-col gap-1.5">
        {ALL_BANKS.map((bank) => {
          const isEligible = eligible.has(bank);
          return (
            <button
              key={bank}
              type="button"
              onClick={() => onPick(BANK_PRESETS[bank], bank)}
              aria-pressed={isEligible}
              className={cn(
                "label-mono inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                isEligible
                  ? "border-pass/40 bg-pass-soft text-pass"
                  : "border-border bg-surface-2 text-fg-muted hover:border-accent/40 hover:text-fg",
              )}
            >
              {isEligible ? (
                <Check size={13} strokeWidth={3} className="shrink-0" />
              ) : (
                <X size={13} strokeWidth={3} className="shrink-0 opacity-40" />
              )}
              <span className="truncate">{bank}</span>
            </button>
          );
        })}
      </div>
      <p className="px-1 text-[0.7rem] leading-relaxed text-fg-subtle">
        Click a bank to load a profile that qualifies for it.
      </p>
    </Stack>
  );
}
