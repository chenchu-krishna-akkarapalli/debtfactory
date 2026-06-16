"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ConfidenceBar, RuleRow, StatusBadge } from "@/components/ui/feedback";
import { Cluster, SectionLabel, Stack } from "@/components/ui/primitives";
import type { BankEvaluation, EvaluateResponse } from "@/lib/api/types";
import { cn } from "@/lib/cn";

import { EvaluateValidationError } from "../api/evaluate";

function EligibleBanks({ banks }: { banks: EvaluateResponse["eligible_banks"] }) {
  if (banks.length === 0) {
    return <span className="font-mono text-sm text-fg-muted">No eligible banks.</span>;
  }
  return (
    <Cluster gap={2}>
      {banks.map((b) => (
        <span
          key={b.bank_name}
          className="label-mono rounded-md border border-pass/30 bg-pass-soft px-2.5 py-1 text-pass"
        >
          {b.bank_name}
        </span>
      ))}
    </Cluster>
  );
}

function BankTabs({
  evaluations,
  selected,
  onSelect,
}: {
  evaluations: BankEvaluation[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <Cluster gap={2}>
      {evaluations.map((e) => (
        <button
          key={e.bank_name}
          type="button"
          onClick={() => onSelect(e.bank_name)}
          className={cn(
            "label-mono rounded-md border px-2.5 py-1 transition-colors",
            e.bank_name === selected
              ? "border-accent/50 bg-accent-soft text-accent"
              : "border-border bg-surface-2 text-fg-muted hover:text-fg",
          )}
        >
          {e.bank_name} · {Math.round(e.confidence_score * 100)}%
        </button>
      ))}
    </Cluster>
  );
}

function Skeleton() {
  return (
    <Stack gap={3}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-surface-2" />
      ))}
    </Stack>
  );
}

export function RuleMatchPanel({
  query,
}: {
  query: UseQueryResult<EvaluateResponse, Error>;
}) {
  const { data, error, isLoading } = query;
  const [selected, setSelected] = useState<string | null>(null);

  const activeBank = useMemo<BankEvaluation | undefined>(() => {
    if (!data) return undefined;
    return data.evaluations.find((e) => e.bank_name === selected) ?? data.evaluations[0];
  }, [data, selected]);

  if (error instanceof EvaluateValidationError) {
    return <p className="font-mono text-sm text-fail">Fix the highlighted fields to evaluate.</p>;
  }
  if (error) {
    return (
      <p className="font-mono text-sm text-fail">Could not reach the rule engine. Is the backend up?</p>
    );
  }
  if (isLoading || !data) {
    return <Skeleton />;
  }

  return (
    <Stack gap={6}>
      <Cluster justify="between">
        <SectionLabel>eligibility_status</SectionLabel>
        <StatusBadge status={data.eligibility_status} />
      </Cluster>

      {activeBank ? <ConfidenceBar value={activeBank.confidence_score} /> : null}

      <Stack gap={2}>
        <SectionLabel>eligible_banks · {data.matched_rule_count}</SectionLabel>
        <EligibleBanks banks={data.eligible_banks} />
      </Stack>

      <Stack gap={2}>
        <SectionLabel>rule match by bank</SectionLabel>
        <BankTabs
          evaluations={data.evaluations}
          selected={activeBank?.bank_name ?? ""}
          onSelect={setSelected}
        />
      </Stack>

      {activeBank ? (
        <Stack gap={2}>
          <Cluster justify="between">
            <SectionLabel>{activeBank.bank_name}</SectionLabel>
            <span className="label-mono">
              {activeBank.rules_passed}/{activeBank.rules_total} pass
            </span>
          </Cluster>
          <Stack gap={2}>
            {activeBank.rules.map((r) => (
              <RuleRow
                key={r.parameter}
                parameter={r.parameter}
                rule={r.rule}
                value={r.value}
                status={r.status}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
