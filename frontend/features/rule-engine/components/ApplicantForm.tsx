"use client";

import type { UseFormReturn } from "react-hook-form";

import { Grid, SectionLabel, Stack } from "@/components/ui/primitives";

import type { ApplicantInput } from "../model/applicant.schema";
import { FIELD_GROUPS } from "../model/groups";
import { Field } from "./fields";

export function ApplicantForm({ form }: { form: UseFormReturn<ApplicantInput> }) {
  const { register, formState } = form;

  return (
    <Stack gap={6}>
      {FIELD_GROUPS.map((group) => (
        <Stack key={group.title} gap={3}>
          <SectionLabel>{group.title}</SectionLabel>
          <Grid min="13rem" gap={3}>
            {group.fields.map((meta) => (
              <Field key={meta.name} meta={meta} register={register} errors={formState.errors} />
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  );
}
