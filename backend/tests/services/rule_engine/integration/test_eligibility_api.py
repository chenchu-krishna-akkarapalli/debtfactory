"""Integration tests for POST /rule-engine/evaluate and /reload."""

from __future__ import annotations

from httpx import AsyncClient

_VALID_APPLICANT = {
    "cibil_score": 730,
    "age": 30,
    "salary_mode": "Bank Credit",
    "income": 30000,
    "total_experience": 5,
    "current_experience": 2,
    "existing_account": True,
    "wo_amount": 0,
    # BRE flags: exact-match. existing_car_loan must be true to match BOI/IOB/Indian.
    "existing_car_loan": True,
}


async def test_evaluate_returns_200_with_bank_list(client: AsyncClient) -> None:
    """A valid applicant payload returns 200 + a list of eligible banks."""
    response = await client.post("/rule-engine/evaluate", json=_VALID_APPLICANT)
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["eligible_banks"], list)
    assert body["matched_rule_count"] == len(body["eligible_banks"])
    assert body["matched_rule_count"] >= 1
    assert {"BOI"} <= {b["bank_name"] for b in body["eligible_banks"]}
    assert body["eligibility_status"] == "ELIGIBLE"


async def test_not_eligible_status(client: AsyncClient) -> None:
    """A zero-bank applicant returns 200 with eligibility_status == NOT_ELIGIBLE."""
    payload = {**_VALID_APPLICANT, "cibil_score": 500}  # below every threshold
    response = await client.post("/rule-engine/evaluate", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["eligible_banks"] == []
    assert body["matched_rule_count"] == 0
    assert body["eligibility_status"] == "NOT_ELIGIBLE"


async def test_wo_amount_only_gated_when_writeoff(client: AsyncClient) -> None:
    """BOI's WO Amount < 5000 cap applies ONLY when there is a PL/CC write-off."""

    async def banks_for(**overrides: object) -> set[str]:
        payload = {**_VALID_APPLICANT, **overrides}
        resp = await client.post("/rule-engine/evaluate", json=payload)
        return {b["bank_name"] for b in resp.json()["eligible_banks"]}

    # Clean applicant + high WO amount -> BOI still eligible (cap does not apply).
    assert "BOI" in await banks_for(wo_amount=9000)
    # CC write-off + high WO amount -> BOI excluded (cap now applies).
    assert "BOI" not in await banks_for(cc_write_off=True, wo_amount=9000)
    # CC write-off + low WO amount -> BOI eligible again.
    assert "BOI" in await banks_for(cc_write_off=True, wo_amount=3000)


async def test_evaluate_includes_per_parameter_evaluations(client: AsyncClient) -> None:
    """Response carries a per-bank, per-parameter match trace + confidence score."""
    response = await client.post("/rule-engine/evaluate", json=_VALID_APPLICANT)
    body = response.json()

    evals = body["evaluations"]
    assert len(evals) >= 1
    # Sorted by confidence, highest first.
    scores = [e["confidence_score"] for e in evals]
    assert scores == sorted(scores, reverse=True)

    top = evals[0]
    for key in (
        "bank_name",
        "eligible",
        "confidence_score",
        "rules_passed",
        "rules_total",
        "rules",
    ):
        assert key in top
    assert top["rules_total"] == len(top["rules"])
    assert 0.0 <= top["confidence_score"] <= 1.0

    rule = top["rules"][0]
    assert set(rule) == {"parameter", "rule", "value", "status"}
    assert rule["status"] in ("PASS", "FAIL")


async def test_existing_car_loan_flag_excludes_bob(client: AsyncClient) -> None:
    """BRE exact-match: BOB requires no car loan; with a car loan BOB is excluded."""
    response = await client.post("/rule-engine/evaluate", json=_VALID_APPLICANT)
    banks = {b["bank_name"] for b in response.json()["eligible_banks"]}
    assert "BOB" not in banks  # BOB's Existing Car Loan = No


async def test_lenient_doc_profile_matches_hdfc_axis_kotak(client: AsyncClient) -> None:
    """All BRE 'lenient' flags true -> only HDFC/AXIS/Kotak (exact-match)."""
    payload = {
        **_VALID_APPLICANT,
        "cibil_score": 720,
        "age": 40,
        "rented_house_self_employed": True,
        "agriculture": True,
        "no_income_proof": True,
        "rental_income_non_itr": True,
        "rental_income_not_reflecting": True,
        "itr_not_filed": True,
    }
    response = await client.post("/rule-engine/evaluate", json=payload)
    banks = {b["bank_name"] for b in response.json()["eligible_banks"]}
    assert banks == {"HDFC", "AXIS", "Kotak"}


async def test_evaluate_returns_422_on_malformed_payload(client: AsyncClient) -> None:
    """A malformed payload (missing required fields) returns 422."""
    response = await client.post("/rule-engine/evaluate", json={"cibil_score": 700})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


async def test_evaluate_invalid_json_returns_422_not_500(client: AsyncClient) -> None:
    """A malformed JSON body returns a clean 422, not a 500.

    Regression: the validation-error handler used to crash on the raw request
    ``bytes`` that Pydantic includes for a JSON decode error.
    """
    response = await client.post(
        "/rule-engine/evaluate",
        content=b'{"cibil_score": 750, "age": 30,}',  # trailing comma = invalid JSON
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["details"]["errors"][0]["type"] == "json_invalid"


async def test_reload_rebuilds_jdm(client: AsyncClient) -> None:
    """POST /rule-engine/reload re-parses the matrix and returns row count."""
    response = await client.post("/rule-engine/reload")
    assert response.status_code == 200
    body = response.json()
    assert body["reloaded"] is True
    assert body["rows_parsed"] >= 1
    assert body["jdm_path"].endswith(".json")
