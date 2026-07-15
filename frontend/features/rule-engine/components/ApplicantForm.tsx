import type { UseFormReturn } from "react-hook-form";
import { ChevronDown } from "lucide-react";

import { Grid, Stack } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

import type { ApplicantInput } from "../model/applicant.schema";
import { FIELD_GROUPS } from "../model/groups";
import { Field } from "./fields";

interface ApplicantFormProps {
  form: UseFormReturn<ApplicantInput>;
  openGroups: Record<string, boolean>;
  setOpenGroups: (
    val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
}

export function ApplicantForm({ form, openGroups, setOpenGroups }: ApplicantFormProps) {
  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Stack gap={4}>
      {FIELD_GROUPS.map((group) => {
        const isOpen = !!openGroups[group.title];

        return (
          <div
            key={group.title}
            className="overflow-hidden rounded-lg border border-border bg-surface-1 shadow-sm transition-all"
          >
            {/* Accordion Trigger Header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.title)}
              className="flex w-full items-center justify-between bg-surface-2 px-4 py-3 text-left hover:bg-elevated transition-colors"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-fg">
                {group.title}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-fg-subtle transition-transform duration-200",
                  isOpen ? "rotate-0" : "-rotate-90",
                )}
              />
            </button>

            {/* Accordion Content Panel */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                isOpen
                  ? "max-h-[1200px] border-t border-border/50 p-4 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden",
              )}
            >
              <Grid min="12.5rem" gap={3}>
                {group.fields.map((meta) => (
                  <Field key={meta.name} meta={meta} form={form} />
                ))}
              </Grid>
            </div>
          </div>
        );
      })}
    </Stack>
  );
}
