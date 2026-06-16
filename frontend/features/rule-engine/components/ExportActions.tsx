"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import type { EvaluateResponse } from "@/lib/api/types";
import { cn } from "@/lib/cn";

import type { ApplicantInput } from "../model/applicant.schema";
import { exportRuleMatchToExcel, exportRuleMatchToPdf } from "../export/exporters";

const BTN =
  "label-mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-fg-muted transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40";

export function ExportActions({
  data,
  applicant,
}: {
  data?: EvaluateResponse;
  applicant: ApplicantInput | null;
}) {
  const [busy, setBusy] = useState<"pdf" | "xlsx" | null>(null);
  const disabled = !data;

  async function run(kind: "pdf" | "xlsx") {
    if (!data) return;
    setBusy(kind);
    try {
      if (kind === "pdf") await exportRuleMatchToPdf(data, applicant);
      else await exportRuleMatchToExcel(data, applicant);
    } catch (err) {
      console.error("export failed", err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={cn(BTN)}
        disabled={disabled || busy !== null}
        onClick={() => run("pdf")}
      >
        <FileDown size={13} /> {busy === "pdf" ? "..." : "PDF"}
      </button>
      <button
        type="button"
        className={cn(BTN)}
        disabled={disabled || busy !== null}
        onClick={() => run("xlsx")}
      >
        <FileSpreadsheet size={13} /> {busy === "xlsx" ? "..." : "Excel"}
      </button>
    </div>
  );
}
