import json
import os

NEW_PARAMS_DEFAULTS = {
    "dpd": 0,
    "loan_enquiry": False,
    "rented_house_salaried": False,
    "unmarried": False,
    "minimum_stay_period_nri": 0,
    "salaried": True,
    "employment_firm": False,
    "employment_pvt_ltd": True,
    "employment_public_ltd": False,
    "employment_govt": False,
    "employment_psu": False,
    "salary_payment_mode_cash": False,
    "salary_payment_mode_bank_credit": True,
    "rental_income_itr": True,
    "rental_income_reflecting_in_bank": True,
    "business_income": 0,
    "self_employed": False,
    "self_employed_itr_filled": False,
    "business_proof": "Mandatory",
    "proprietorship": False,
    "partnership_firm": False,
    "private_limited": False,
    "public_limited": False,
    "currently_outstanding": False,
    "emi_income": 0,
}


def update_request_body(body_str):
    try:
        payload = json.loads(body_str)
    except Exception:
        return body_str

    updated = {}

    # 1. Copy all original keys
    for k, v in payload.items():
        if k == "salary_mode":
            updated[k] = v
            if "salary_payment_mode_bank_credit" not in payload:
                updated["salary_payment_mode_bank_credit"] = v == "Bank Credit"
            if "salary_payment_mode_cash" not in payload:
                updated["salary_payment_mode_cash"] = v == "Cash"
            continue
        updated[k] = v

    # 2. Derive profile settings
    # Check if self_employed is True or if rented_house_self_employed is True
    is_self_employed = updated.get("self_employed")
    if is_self_employed is None:
        is_self_employed = updated.get("rented_house_self_employed") is True

    if is_self_employed:
        updated["self_employed"] = True
        updated["salaried"] = False
        if "business_income" not in updated or updated["business_income"] == 0:
            updated["business_income"] = 150000
        if "self_employed_itr_filled" not in updated:
            updated["self_employed_itr_filled"] = True
    else:
        # If not self_employed, it could be salaried
        # unless it is BOM which does not specify but defaults to salaried
        updated["self_employed"] = False
        updated["salaried"] = True
        updated["business_income"] = 0
        updated["self_employed_itr_filled"] = False

    # Check if NRI
    has_no_stay = (
        "minimum_stay_period_nri" not in updated or updated["minimum_stay_period_nri"] == 0
    )
    if updated.get("nri_pio") is True and has_no_stay:
        updated["minimum_stay_period_nri"] = 2

    # 3. Add other missing defaults
    for k, v in NEW_PARAMS_DEFAULTS.items():
        if k not in updated:
            updated[k] = v

    return json.dumps(updated, indent=2)


def update_collection(path):
    print(f"Updating collection {path}")
    if not os.path.exists(path):
        print("File not found")
        return

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    def process_items(items):
        for item in items:
            if "item" in item:
                process_items(item["item"])
            if "request" in item:
                req = item["request"]
                if "body" in req and req["body"].get("mode") == "raw":
                    raw_body = req["body"].get("raw", "")
                    if raw_body:
                        req["body"]["raw"] = update_request_body(raw_body)

    if "item" in data:
        process_items(data["item"])

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Done!")


if __name__ == "__main__":
    update_collection("postman/DebtFactory-RuleEngine.postman_collection.json")
    update_collection("postman/RuleEngine-NotEligible.postman_collection.json")
