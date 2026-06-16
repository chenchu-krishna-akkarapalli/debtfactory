"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { cn } from "@/lib/cn";

import type { ApplicantInput } from "../model/applicant.schema";
import type { FieldMeta } from "../model/groups";

const inputCls =
  "w-full rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-fg outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/40";

export function Field({
  meta,
  register,
  errors,
}: {
  meta: FieldMeta;
  register: UseFormRegister<ApplicantInput>;
  errors: FieldErrors<ApplicantInput>;
}) {
  const error = errors[meta.name]?.message as string | undefined;

  if (meta.kind === "toggle") {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5">
        <span className="label-mono text-fg">{meta.label}</span>
        <input type="checkbox" className="peer sr-only" {...register(meta.name)} />
        <span className="relative h-5 w-9 shrink-0 rounded-full bg-elevated transition-colors peer-checked:bg-accent after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-fg after:transition-transform peer-checked:after:translate-x-4" />
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={meta.name} className="label-mono">
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
