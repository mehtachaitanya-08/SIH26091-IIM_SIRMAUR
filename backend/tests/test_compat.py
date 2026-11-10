"""
Tests for backend/compat.py: the teammate's /api addresses (the ones his website calls),
served from the verified data and the verified loan logic.

Hand figures are the same as Stage 1 (backend/tests/test_api.py):
  Rs 1,40,000 -> loan 1,25,000, own 15,000; pause interest 1,25,000 x 6.5%/4 = 2,031.25
  added to the loan; equal instalment on 1,27,031.25 over 11 quarters = 12,704.49.
  Rs 6,80,000 (his test case) -> loan 6,12,000, own 68,000, 28 rows, 26 repayments.
"""

import ast
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend import compat

client = TestClient(app)
REPO = Path(__file__).resolve().parents[2]
VERIFIED = ["D15", "D16", "D17", "D19", "D20", "D21", "D22"]
INVENTED_KEYS = {"capex", "cost", "revenue", "opex", "dscr", "seasonalityMultipliers"}


def post(path, body):
    return client.post(path, content=json.dumps(body), headers={"content-type": "application/json"})


# ---------------------------------------------------------------------------
# compat.py must never load the teammate's server (it reads the made-up dossier file at import)
# ---------------------------------------------------------------------------

def test_compat_never_imports_engine_server():
    tree = ast.parse((REPO / "backend" / "compat.py").read_text(encoding="utf-8"))
    names = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            names.append(node.module or "")
            names += [f"{node.module}.{a.name}" for a in node.names]
        elif isinstance(node, ast.Import):
            names += [a.name for a in node.names]
    assert not any(n == "engine.server" or n.startswith("engine.server.") for n in names), names
    src = (REPO / "backend" / "compat.py").read_text(encoding="utf-8")
    assert "dossiers_db" not in src.split('"""', 2)[-1]


# ---------------------------------------------------------------------------
# health
# ---------------------------------------------------------------------------

def test_health():
    d = client.get("/api/health").json()
    assert d["status"] == "ok"
    assert d["version"]
    assert "clientOnly" not in d


# ---------------------------------------------------------------------------
# dossiers list
# ---------------------------------------------------------------------------

def test_dossiers_list_24_named_no_invented_numbers():
    d = client.get("/api/dossiers").json()
    rows = d["dossiers"]
    assert d["count"] == 24 and len(rows) == 24
    assert [r["code"] for r in rows] == [f"D{i:02d}" for i in range(1, 25)]
    for r in rows:
        assert r["name"] and isinstance(r["name"], str)
        assert not (INVENTED_KEYS & set(r)), r
    assert sorted(r["code"] for r in rows if r["status"] == "verified") == VERIFIED
    by = {r["code"]: r for r in rows}
    assert by["D20"]["name"] == "Metal Smithy"
    assert by["D01"]["name"] == "Village FMCG Retail"
    assert by["D18"]["status"] == "not_yet_verified"


def test_name_list_matches_dossier_folder():
    on_disk = {}
    for p in (REPO / "research_dossiers").glob("D[0-9][0-9]_*_Dossier.md"):
        on_disk[p.name[:3]] = p.name[4:-len("_Dossier.md")].replace("_", " ")
    assert compat.NAMES == dict(sorted(on_disk.items()))


# ---------------------------------------------------------------------------
# one dossier
# ---------------------------------------------------------------------------

def test_one_verified_dossier_from_verified_data():
    d = client.get("/api/dossiers/D20").json()
    assert d["code"] == "D20" and d["status"] == "verified"
    assert d["title"] == d["name"] == "Metal Smithy"
    assert not (INVENTED_KEYS & set(d))
    assert d["sections"] and d["questions"] and d["sources"]
    assert '"line":' not in json.dumps(d)   # the internal dossier line number is never sent


@pytest.mark.parametrize("code", ["D08", "D18", "d18"])
def test_one_unverified_dossier_normal_reply(code):
    r = client.get(f"/api/dossiers/{code}")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "not_yet_verified"
    assert d["code"] == code.upper() and d["name"]
    assert not (INVENTED_KEYS & set(d)) and "sections" not in d


def test_one_dossier_unknown_code_his_error_format():
    r = client.get("/api/dossiers/D99")
    assert r.status_code == 404
    d = r.json()
    assert set(d) >= {"error", "status", "timestamp"} and d["status"] == 404


# ---------------------------------------------------------------------------
# NSFDC loan
# ---------------------------------------------------------------------------

def test_loan_140000_verified_logic_his_keys():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "familyIncome": 120000, "isSc": True}).json()
    assert d["isEligible"] is True and d["is_eligible"] is True
    assert d["tier"] == "MCF"
    assert d["loanAmount"] == d["loan_amount"] == d["maxLoanAmount"] == 125000
    assert d["promoterContribution"] == d["promoterEquity"] == 15000
    assert d["interestRatePa"] == 6.5
    assert d["quarterlyInterestRate"] == pytest.approx(0.01625)   # a fraction, as in his contract
    assert d["termYears"] == 3 and d["repaymentQuarters"] == 11 and d["moratoriumQuarters"] == 1
    rows = d["amortizationSchedule"]
    assert rows == d["amortization_schedule"] and len(rows) == 12
    q1 = rows[0]
    assert q1["isMoratorium"] is True
    assert q1["interestPayment"] == 0 and q1["totalInstallment"] == 0
    assert q1["interestAddedToLoan"] == 2031.25
    assert rows[1]["totalInstallment"] == 12704.49
    assert d["equatedQuarterlyInstallment"] == 12704.49
    assert "_fallback" not in d
    assert any(a["tag"].startswith("ASSUMED") for a in d["assumptions"])


def test_loan_680000_his_test_case():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 680000}).json()
    assert d["tier"] == "TERM_LOAN"
    assert d["loanAmount"] == 612000 and d["promoterContribution"] == 68000
    assert d["interestRatePa"] == 8.0 and d["termYears"] == 7
    assert d["moratoriumQuarters"] == 2 and d["repaymentQuarters"] == 26
    assert len(d["amortizationSchedule"]) == 28


def test_loan_paise_rounded_down_with_note_but_old_address_stays_strict():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000.5, "familyIncome": 100000.75}).json()
    assert d["projectCost"] == 140000 and d["loanAmount"] == 125000
    assert any("rounded down" in a["text"] and a["tag"].startswith("ASSUMED") for a in d["assumptions"])
    r = post("/loan", {"project_cost": 140000.5, "is_sc": True, "annual_family_income": 1})
    assert r.status_code == 422


def test_loan_not_eligible_is_normal_reply():
    r = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "familyIncome": 500001})
    assert r.status_code == 200
    d = r.json()
    assert d["isEligible"] is False and d["is_eligible"] is False
    assert d["rejectionReasons"] and "loanAmount" not in d
    r = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": False})
    assert r.json()["isEligible"] is False


@pytest.mark.parametrize("body,code", [
    ({}, 400),
    ({"projectCost": "abc"}, 400),
    ({"projectCost": -5}, 400),
    ({"projectCost": 0}, 400),
    ({"projectCost": 1e30}, 400),
])
def test_loan_bad_input_his_error_format(body, code):
    r = post("/api/engine/nsfdc/calculate", body)
    assert r.status_code == code
    d = r.json()
    assert set(d) >= {"error", "status", "timestamp"} and d["status"] == code


def test_loan_bad_json_his_error_format():
    r = client.post("/api/engine/nsfdc/calculate", content="{not json", headers={"content-type": "application/json"})
    assert r.status_code == 400
    assert r.json()["error"] == "Invalid JSON in request body"
    r = client.post("/api/engine/nsfdc/calculate", content="", headers={"content-type": "application/json"})
    assert r.status_code == 400
    assert r.json()["error"] == "Request body is empty"


# ---------------------------------------------------------------------------
# Mode B and Mode A: his engine, tagged ASSUMED
# ---------------------------------------------------------------------------

def test_mode_b_his_values_tagged_assumed():
    d = post("/api/engine/mode-b/restructure", {"principal": 120000, "monthlyRatePct": 3.0, "durationMonths": 36}).json()
    assert d["oldMonthlyInterest"] == 3600
    assert d["damdupatViolated"] is True and d["damdupat_violated"] is True
    assert "newMonthlyEmi" in d and "liberationMetrics" in d and "refinancingPlan" in d
    assert d["tags"]["source"].startswith("ASSUMED")
    d = post("/api/engine/mode-b/restructure", {"principal": 120000, "monthlyRatePct": 3.0, "durationMonths": 10}).json()
    assert d["damdupatViolated"] is False


def test_mode_b_missing_principal():
    r = post("/api/engine/mode-b/restructure", {"monthlyRatePct": 3.0})
    assert r.status_code == 400 and r.json()["error"] == "Missing or invalid 'principal' amount"


def test_mode_a_his_values_tagged_assumed():
    d = post("/api/engine/mode-a/evaluate", {"archetypeKey": "archetype_1", "scale": 1.0}).json()
    assert d["grantSubsidy"] == 336000.0
    assert len(d["seasonalDscr"]) == 12
    assert d["tags"]["source"].startswith("ASSUMED")
    d = post("/api/engine/mode-a/evaluate", {"archetypeKey": "archetype_1", "scale": 1.5}).json()
    assert d["capex"] > 650000


def test_unknown_api_path_his_error_format():
    r = client.get("/api/nope")
    assert r.status_code == 404
    assert set(r.json()) >= {"error", "status", "timestamp"}


# ---------------------------------------------------------------------------
# Review fixes (each failed before its fix)
# ---------------------------------------------------------------------------

def test_engine_server_not_loaded_at_runtime():
    import sys
    import backend.app  # noqa: F401
    assert "engine.server" not in sys.modules


@pytest.mark.parametrize("value,eligible", [("false", False), ("False", False), (False, False),
                                            ("true", True), (True, True)])
def test_is_sc_text_values(value, eligible):
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": value}).json()
    assert d["isEligible"] is eligible


@pytest.mark.parametrize("value", ["maybe", None, 0, 1])
def test_is_sc_odd_values_rejected(value):
    r = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": value})
    assert r.status_code == 400 and "isSc" in r.json()["error"]


def test_is_sc_missing_is_assumed_and_says_so():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000}).json()
    assert d["isEligible"] is True
    assert any("isSc" in a["text"] and a["tag"].startswith("ASSUMED") for a in d["assumptions"])


def test_totals_add_up():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": True}).json()
    assert d["totalPrincipalPaid"] == 125000
    assert round(d["totalPrincipalPaid"] + d["totalInterestPaid"], 2) == d["totalDebtService"] == 139749.36


def test_alternatives_tagged_assumed():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": False}).json()
    assert d["recommendedAlternatives"]
    assert d["tags"]["recommendedAlternatives"].startswith("ASSUMED")


@pytest.mark.parametrize("raw", ['{"projectCost": 1' + "0" * 400 + '}', '{"projectCost": 1e400}'])
def test_huge_numbers_clean_400(raw):
    r = client.post("/api/engine/nsfdc/calculate", content=raw, headers={"content-type": "application/json"})
    assert r.status_code == 400 and set(r.json()) >= {"error", "status", "timestamp"}


def test_validation_message_is_plain_and_uses_his_names():
    r = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "familyIncome": -1, "isSc": True})
    e = r.json()["error"]
    assert r.status_code == 400 and "familyIncome" in e and "pydantic" not in e and "\n" not in e


@pytest.mark.parametrize("method,path", [("GET", "/api/health/"), ("GET", "/api/dossiers/"),
                                         ("GET", "/api/dossiers/D20/"), ("POST", "/api/engine/nsfdc/calculate/")])
def test_trailing_slash_works_like_his_server(method, path):
    r = client.request(method, path, content=json.dumps({"projectCost": 140000, "isSc": True}),
                       headers={"content-type": "application/json"})
    assert r.status_code == 200, (path, r.status_code)


def test_promoter_equity_offered_rejected_clearly_but_null_ok():
    assert post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": True,
                                                "promoterEquityOffered": None}).status_code == 200
    r = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": True, "promoterEquityOffered": 20000})
    assert r.status_code == 400 and "promoterEquityOffered" in r.json()["error"]


def test_every_number_in_loan_reply_has_a_tag():
    d = post("/api/engine/nsfdc/calculate", {"projectCost": 140000, "isSc": True}).json()
    nums = [k for k, v in d.items() if isinstance(v, (int, float)) and not isinstance(v, bool)]
    assert nums and all(k in d["tags"] for k in nums), [k for k in nums if k not in d["tags"]]
