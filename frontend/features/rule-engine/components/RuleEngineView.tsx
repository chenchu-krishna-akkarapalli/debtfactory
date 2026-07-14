"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Landmark, SlidersHorizontal, ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { ConsoleGrid, Panel } from "@/components/layout/shell";

import { type ApplicantInput, DEFAULT_APPLICANT, applicantSchema } from "../model/applicant.schema";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useEvaluate } from "../hooks/useEvaluate";
import { ApplicantForm } from "./ApplicantForm";
import { BankChips } from "./BankChips";
import { ExportActions } from "./ExportActions";
import { RuleMatchPanel } from "./RuleMatchPanel";
import { FIELD_GROUPS } from "../model/groups";

export function RuleEngineView() {
  const form = useForm<ApplicantInput>({
    resolver: zodResolver(applicantSchema),
    defaultValues: DEFAULT_APPLICANT,
    mode: "onChange",
  });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Credit Profile": true,
    "Demographics & Status": true,
  });

  // useWatch re-renders on every edit (compiler-safe); debounce + validate before the call.
  const values = useWatch({ control: form.control, defaultValue: DEFAULT_APPLICANT });
  const debounced = useDebouncedValue(values, 250);
  const parsed = applicantSchema.safeParse(debounced);
  // When invalid, pass the default (query is disabled, so the value is unused).
  const query = useEvaluate(parsed.success ? parsed.data : DEFAULT_APPLICANT, parsed.success);

  const eligible = new Set((query.data?.eligible_banks ?? []).map((b) => b.bank_name));

  const isAnyOpen = Object.values(openGroups).some(Boolean);

  const toggleAllGroups = () => {
    const nextState = !isAnyOpen;
    const next: Record<string, boolean> = {};
    FIELD_GROUPS.forEach((group) => {
      next[group.title] = nextState;
    });
    setOpenGroups(next);
  };

  return (
    <ConsoleGrid>
      <Panel title="Banks" icon={<Landmark size={15} />}>
        <BankChips eligible={eligible} onPick={(preset) => form.reset(preset)} />
      </Panel>
      <Panel
        title="Applicant"
        icon={<SlidersHorizontal size={15} />}
        actions={
          <button
            type="button"
            onClick={toggleAllGroups}
            className="flex items-center justify-center rounded-md p-1.5 text-fg-subtle hover:bg-elevated hover:text-fg transition-colors"
            title={isAnyOpen ? "Collapse All Sections" : "Expand All Sections"}
          >
            {isAnyOpen ? <ChevronsDownUp size={16} /> : <ChevronsUpDown size={16} />}
          </button>
        }
      >
        <ApplicantForm form={form} openGroups={openGroups} setOpenGroups={setOpenGroups} />
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
