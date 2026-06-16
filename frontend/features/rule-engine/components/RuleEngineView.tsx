"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Landmark, SlidersHorizontal } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { ConsoleGrid, Panel } from "@/components/layout/shell";

import { type ApplicantInput, DEFAULT_APPLICANT, applicantSchema } from "../model/applicant.schema";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useEvaluate } from "../hooks/useEvaluate";
import { ApplicantForm } from "./ApplicantForm";
import { BankChips } from "./BankChips";
import { ExportActions } from "./ExportActions";
import { RuleMatchPanel } from "./RuleMatchPanel";

export function RuleEngineView() {
  const form = useForm<ApplicantInput>({
    resolver: zodResolver(applicantSchema),
    defaultValues: DEFAULT_APPLICANT,
    mode: "onChange",
  });

  // useWatch re-renders on every edit (compiler-safe); debounce + validate before the call.
  const values = useWatch({ control: form.control, defaultValue: DEFAULT_APPLICANT });
  const debounced = useDebouncedValue(values, 250);
  const parsed = applicantSchema.safeParse(debounced);
  // When invalid, pass the default (query is disabled, so the value is unused).
  const query = useEvaluate(parsed.success ? parsed.data : DEFAULT_APPLICANT, parsed.success);

  const eligible = new Set((query.data?.eligible_banks ?? []).map((b) => b.bank_name));

  return (
    <ConsoleGrid>
      <Panel title="Banks" icon={<Landmark size={15} />}>
        <BankChips eligible={eligible} onPick={(preset) => form.reset(preset)} />
      </Panel>
      <Panel title="Applicant" icon={<SlidersHorizontal size={15} />}>
        <ApplicantForm form={form} />
      </Panel>
      <Panel
        title="Real-time Rule Match"
        icon={<Activity size={15} />}
        actions={<ExportActions data={query.data} applicant={parsed.success ? parsed.data : null} />}
      >
        <RuleMatchPanel query={query} />
      </Panel>
    </ConsoleGrid>
  );
}
