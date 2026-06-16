"use client";

import { type UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";

import type { EvaluateResponse } from "@/lib/api/types";

import type { ApplicantInput } from "../model/applicant.schema";
import { EvaluateValidationError, evaluate } from "../api/evaluate";

/**
 * Live evaluation of an applicant.
 *
 * Latency tactics: debounce upstream (caller passes a deferred/debounced value),
 * `keepPreviousData` (no flicker between keystrokes), per-key `AbortController`
 * cancellation (only the latest result wins), and no retry on 422.
 */
export function useEvaluate(
  applicant: ApplicantInput,
  enabled: boolean,
): UseQueryResult<EvaluateResponse, Error> {
  return useQuery({
    queryKey: ["evaluate", applicant],
    queryFn: ({ signal }) => evaluate(applicant, signal),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    retry: (failureCount, error) =>
      !(error instanceof EvaluateValidationError) && failureCount < 1,
  });
}
