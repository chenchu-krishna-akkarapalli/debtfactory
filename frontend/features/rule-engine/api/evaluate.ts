import type { ApiValidationError, EvaluateResponse } from "@/lib/api/types";
import { API_BASE } from "@/lib/env";

import type { ApplicantInput } from "../model/applicant.schema";

/** Thrown on a 422 from the backend (malformed input). Carries the field errors. */
export class EvaluateValidationError extends Error {
  constructor(public readonly body: ApiValidationError | null) {
    super("validation_error");
    this.name = "EvaluateValidationError";
  }
}

/** POST an applicant to the rule engine. `signal` lets React Query cancel stale calls. */
export async function evaluate(
  applicant: ApplicantInput,
  signal?: AbortSignal,
): Promise<EvaluateResponse> {
  const res = await fetch(`${API_BASE}/rule-engine/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicant),
    signal,
  });

  if (res.status === 422) {
    const body = (await res.json().catch(() => null)) as ApiValidationError | null;
    throw new EvaluateValidationError(body);
  }
  if (!res.ok) {
    throw new Error(`evaluate failed (${res.status})`);
  }
  return (await res.json()) as EvaluateResponse;
}
