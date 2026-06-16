/**
 * Response contract for POST /rule-engine/evaluate.
 *
 * Mirror of the backend Pydantic models. Regenerate from the live OpenAPI when it
 * changes:  npx openapi-typescript http://localhost:8000/openapi.json -o lib/api/schema.d.ts
 */

export type EligibilityStatus = "ELIGIBLE" | "NOT_ELIGIBLE";
export type RuleStatus = "PASS" | "FAIL";

export interface EligibleBank {
  bank_name: string;
  description: string | null;
}

export interface RuleMatch {
  parameter: string;
  rule: string;
  value: boolean | number | string | null;
  status: RuleStatus;
}

export interface BankEvaluation {
  bank_name: string;
  eligible: boolean;
  confidence_score: number; // rules_passed / rules_total, 0..1
  rules_passed: number;
  rules_total: number;
  rules: RuleMatch[];
}

export interface EvaluateResponse {
  eligibility_status: EligibilityStatus;
  eligible_banks: EligibleBank[];
  matched_rule_count: number;
  evaluations: BankEvaluation[]; // sorted by confidence desc
}

export interface ApiValidationError {
  error: {
    code: string;
    message: string;
    details?: { errors?: Array<{ loc: (string | number)[]; msg: string; type: string }> };
  };
}
