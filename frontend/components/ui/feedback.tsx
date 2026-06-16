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

/** One rule line: icon + parameter (+ tested rule / value) + PASS/FAIL. */
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
  const fail = status === "FAIL";
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5",
        fail && "border-l-2 border-l-fail bg-fail-soft",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full",
            fail ? "bg-fail/20 text-fail" : "bg-pass/20 text-pass",
          )}
        >
          {fail ? <X size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
        </span>
        <span className="label-mono truncate text-fg">{parameter}</span>
        <span className="hidden font-mono text-[0.7rem] text-fg-subtle sm:inline">
          {rule} · {String(value)}
        </span>
      </div>
      <span className={cn("label-mono shrink-0", fail ? "text-fail" : "text-pass")}>{status}</span>
    </div>
  );
}
