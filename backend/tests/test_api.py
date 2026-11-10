"""
API tests for the NSFDC loan server (backend/app.py).

Every expected number below is worked out by hand in the comment beside it,
from the NSFDC FAQ page (research_dossiers/sources/_shared/NSFDC_devmosje_p15629.html),
NOT copied from the code's own output.

Run from the repo root:
    backend/.venv/bin/python -m pytest backend/tests -v
"""

import html
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend import sources

client = TestClient(app)

REPO = Path(__file__).resolve().parents[2]
NSFDC_HTML = REPO / "research_dossiers" / "sources" / "_shared" / "NSFDC_devmosje_p15629.html"


def eligible(cost, **extra):
    body = {"project_cost": cost, "is_sc": True, "annual_family_income": 180000}
    body.update(extra)
    return body


def val(field):
    """Every number in a reply is wrapped as {"value": x, "tag": "..."}."""
    return field["value"]


def hand_eqi(principal, annual_pct, n):
    # Equated quarterly instalment: P * r(1+r)^n / ((1+r)^n - 1), r = annual% / 400
    r = annual_pct / 400
    f = (1 + r) ** n
    return round(principal * r * f / (f - 1), 2)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Sources: every quote the server shows must exist word for word in the saved page
# ---------------------------------------------------------------------------

def _page_text():
    t = NSFDC_HTML.read_text(encoding="utf-8", errors="ignore")
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t)


def test_every_quote_is_in_the_saved_nsfdc_page():
    page = _page_text()
    assert len(sources.QUOTES) >= 5
    for key, q in sources.QUOTES.items():
        assert q in page, f"quote {key!r} not found word for word in the saved NSFDC page"


# ---------------------------------------------------------------------------
# Loan amounts (rounded DOWN to the rupee)
# ---------------------------------------------------------------------------

def test_140000_micro_finance_cap():
    # 90% of 1,40,000 = 1,26,000 > cap 1,25,000  -> loan 1,25,000, own 15,000
    d = client.post("/loan", json=eligible(140000, moratorium_interest="pay")).json()
    assert d["status"] == "eligible"
    L = d["loan"]
    assert val(L["scheme"]) == "Micro Finance Scheme (MFS)"
    assert val(L["loan_amount"]) == 125000
    assert val(L["own_contribution"]) == 15000
    assert val(L["interest_rate_pa"]) == 6.5
    assert val(L["total_quarters"]) == 12
    assert val(L["repayment_quarters"]) == 11
    assert len(d["schedule"]["rows"]) == 12


def test_140001_term_loan_rounded_down():
    # 1,40,001 x 0.9 = 1,26,000.90 -> rounded DOWN to 1,26,000; own = 14,001
    d = client.post("/loan", json=eligible(140001)).json()
    L = d["loan"]
    assert val(L["scheme"]) == "Term Loan"
    assert val(L["interest_rate_pa"]) == 8.0
    assert val(L["loan_amount"]) == 126000
    assert val(L["own_contribution"]) == 14001


def test_10_lakh_term_loan():
    d = client.post("/loan", json=eligible(1000000)).json()
    L = d["loan"]
    assert val(L["loan_amount"]) == 900000
    assert val(L["own_contribution"]) == 100000
    assert val(L["repayment_quarters"]) == 26


def test_50_lakh_is_max_and_50_lakh_plus_1_not_covered():
    d = client.post("/loan", json=eligible(5000000)).json()
    assert val(d["loan"]["loan_amount"]) == 4500000
    assert val(d["loan"]["own_contribution"]) == 500000

    r = client.post("/loan", json=eligible(5000001))
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "not_covered"
    assert d["loan"] is None
    assert any(sources.QUOTES["term_loan"] in x["quote"] for x in d["reasons"])


# ---------------------------------------------------------------------------
# Eligibility
# ---------------------------------------------------------------------------

def test_income_over_5_lakh_not_eligible_with_quote():
    d = client.post("/loan", json=eligible(140000, annual_family_income=500001)).json()
    assert d["status"] == "not_eligible"
    assert d["loan"] is None
    assert any(sources.QUOTES["income"] in x["quote"] for x in d["reasons"])


def test_income_exactly_5_lakh_is_eligible():
    d = client.post("/eligibility", json=eligible(140000, annual_family_income=500000)).json()
    assert d["status"] == "eligible"


def test_not_sc_not_eligible_with_quote():
    d = client.post("/eligibility", json=eligible(140000, is_sc=False)).json()
    assert d["status"] == "not_eligible"
    assert any(sources.QUOTES["community"] in x["quote"] for x in d["reasons"])
    # other schemes are offered, but marked as not sourced
    assert d["alternatives"]
    assert all(a["tag"].startswith("ASSUMED") for a in d["alternatives"])


# ---------------------------------------------------------------------------
# Moratorium (pause): interest PAID vs interest ADDED to the loan (accrue)
# ---------------------------------------------------------------------------

def test_pay_mode_matches_team_calculator():
    # Interest paid in the pause quarter: 1,25,000 x 6.5%/4 = 2,031.25
    d = client.post("/loan", json=eligible(140000, moratorium_interest="pay")).json()
    rows = d["schedule"]["rows"]
    assert rows[0]["is_moratorium"] is True
    assert rows[0]["payment"] == 2031.25
    assert rows[1]["payment"] == hand_eqi(125000, 6.5, 11) == 12501.34


def test_accrue_is_the_default_micro_finance():
    # Q1 interest 2,031.25 is ADDED: balance 1,27,031.25; EQI on that over 11 quarters
    d = client.post("/loan", json=eligible(140000)).json()
    assert d["moratorium_interest"] == "accrue"
    rows = d["schedule"]["rows"]
    assert rows[0]["is_moratorium"] is True
    assert rows[0]["payment"] == 0
    assert rows[0]["interest_added"] == 2031.25
    assert rows[0]["closing_balance"] == 127031.25
    assert rows[1]["payment"] == hand_eqi(127031.25, 6.5, 11) == 12704.49
    assert rows[-1]["closing_balance"] == 0
    s = d["summary"]
    assert val(s["interest_added_during_pause"]) == 2031.25
    assert val(s["balance_after_pause"]) == 127031.25
    # balance after the pause is above the 1,25,000 cap -> warning, not a block
    assert any(w["code"] == "balance_over_cap_after_pause" for w in d["warnings"])


def test_accrue_term_loan_compounds_over_two_quarters():
    # 9,00,000 x 1.02 = 9,18,000 ; x 1.02 = 9,36,360 ; EQI over 26 quarters at 2%
    d = client.post("/loan", json=eligible(1000000)).json()
    rows = d["schedule"]["rows"]
    assert len(rows) == 28
    assert rows[0]["closing_balance"] == 918000
    assert rows[1]["closing_balance"] == 936360
    assert rows[2]["payment"] == hand_eqi(936360, 8.0, 26) == 46536.37
    assert rows[-1]["closing_balance"] == 0
    assert not any(w["code"] == "balance_over_cap_after_pause" for w in d["warnings"])


def hand_schedule(balance, annual_pct, n):
    """Pen-and-paper loop, written separately from the code: each quarter
    interest = balance x rate/4 (to the paisa); principal = instalment - interest;
    the last quarter clears whatever is left."""
    r = annual_pct / 400
    eqi = hand_eqi(balance, annual_pct, n)
    payments, interest_total = [], 0.0
    for q in range(1, n + 1):
        interest = round(balance * r, 2)
        principal = balance if q == n else round(eqi - interest, 2)
        payments.append(round(principal + interest, 2))
        interest_total += interest
        balance = round(balance - principal, 2)
    return payments, round(interest_total, 2)


def test_accrue_totals_match_hand_calculation():
    # Pause: 1,25,000 -> 1,27,031.25 (2,031.25 added). Then 11 instalments on 1,27,031.25.
    payments, interest = hand_schedule(127031.25, 6.5, 11)
    assert payments[0] == 12704.49 and payments[-1] == 12704.46
    assert interest == 12718.11
    assert round(sum(payments), 2) == 139749.36  # = 1,25,000 + 2,031.25 + 12,718.11

    d = client.post("/loan", json=eligible(140000)).json()
    rows = d["schedule"]["rows"]
    s = d["summary"]
    assert [r["payment"] for r in rows[1:]] == payments
    assert val(s["total_paid"]) == 139749.36
    assert val(s["interest_in_instalments"]) == 12718.11
    assert val(s["interest_added_during_pause"]) == 2031.25
    assert val(s["total_interest_cost"]) == 14749.36  # 1,39,749.36 - 1,25,000
    # principal repaid adds up to the balance after the pause
    assert round(sum(r["principal"] for r in rows), 2) == 127031.25


def test_term_loan_50_lakh_over_cap_warning():
    # 45,00,000 x 1.02 x 1.02 = 46,81,800 > cap 45,00,000 -> warning
    d = client.post("/loan", json=eligible(5000000)).json()
    assert d["schedule"]["rows"][1]["closing_balance"] == 4681800
    assert any(w["code"] == "balance_over_cap_after_pause" for w in d["warnings"])


def test_zero_loan_warns():
    # cost 1: 90% of 1 rounded down = 0 -> nothing to borrow
    d = client.post("/loan", json=eligible(1)).json()
    assert val(d["loan"]["loan_amount"]) == 0
    assert any(w["code"] == "loan_is_zero" for w in d["warnings"])


def test_ninety_percent_rule_and_pause_tag():
    d = client.post("/loan", json=eligible(1000000)).json()
    assert sources.QUOTES["ninety_pct"] in d["loan"]["ninety_pct_rule"]["quote"]
    assert d["loan"]["moratorium_quarters"]["tag"].startswith("CALCULATED")
    assert "6-month" in d["loan"]["moratorium_quarters"]["tag"]


# ---------------------------------------------------------------------------
# Tags: every number in every reply must carry a tag
# ---------------------------------------------------------------------------

ALLOWED_TAG = re.compile(r"^(\[S\d+\]|USER INPUT|CALCULATED|ASSUMED)")


def _walk(node, tag=None, path="$"):
    if isinstance(node, dict):
        t = node.get("tag", tag)
        if "quote" in node:
            # a quote's tag covers the words, not numbers: none may hide in here
            t = None
        if "tag" in node:
            assert ALLOWED_TAG.match(node["tag"]), f"bad tag {node['tag']!r} at {path}"
        for k, v in node.items():
            yield from _walk(v, t, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from _walk(v, tag, f"{path}[{i}]")
    elif isinstance(node, (int, float)) and not isinstance(node, bool):
        yield path, tag


@pytest.mark.parametrize("url,body", [
    ("/loan", eligible(140000)),
    ("/loan", eligible(140000, moratorium_interest="pay")),
    ("/loan", eligible(1000000)),
    ("/loan", eligible(5000001)),
    ("/eligibility", eligible(140000, is_sc=False)),
    ("/cashflow", dict(eligible(140000), quarterly_cash_flows=[20000, 15000, 18000, 25000])),
])
def test_every_number_has_a_tag(url, body):
    d = client.post(url, json=body).json()
    # A tag on the whole reply would cover every number and make this test meaningless
    assert "tag" not in d
    untagged = [p for p, t in _walk(d) if t is None]
    assert untagged == [], f"numbers without a tag: {untagged[:10]}"


# ---------------------------------------------------------------------------
# Cash-flow cover (DSCR) per quarter
# ---------------------------------------------------------------------------

def test_cashflow_one_typical_year_repeated():
    # 4 quarterly figures = one typical year, repeated over all 12 quarters (ASSUMED)
    body = dict(eligible(140000), quarterly_cash_flows=[20000, 15000, 18000, 25000])
    d = client.post("/cashflow", json=body).json()
    q = d["quarters"]
    assert len(q) == 12
    # Pause quarter in accrue mode: nothing to pay -> no cover figure, not 999
    assert q[0]["debt_service"] == 0 and q[0]["dscr"] is None
    # Quarter 2: cash 15,000 / instalment 12,704.49 = 1.18 -> below 1.25
    assert q[1]["cash_flow"] == 15000
    assert q[1]["dscr"] == round(15000 / 12704.49, 2) == 1.18
    assert q[1]["below_benchmark"] is True
    assert d["benchmark_dscr"]["tag"].startswith("ASSUMED")
    assert any(a["tag"].startswith("ASSUMED") and "repeated" in a["text"] for a in d["assumptions"])


def test_cashflow_average_ignores_pause_quarters():
    # Term Loan 10 lakh, accrue: Q1-Q2 pause (nothing to pay), Q3-Q28 instalments.
    # Pattern [10L, 10L, 40k, 40k] repeated -> quarters 3..28 hold 1,25,60,000 of cash.
    # Payments: 26 instalments (25 x 46,536.37 + last). Average = cash / payments = 10.38
    body = dict(eligible(1000000), quarterly_cash_flows=[1000000, 1000000, 40000, 40000])
    d = client.post("/cashflow", json=body).json()
    payments, _ = hand_schedule(936360, 8.0, 26)
    flows = ([1000000, 1000000, 40000, 40000] * 7)[:28]
    assert sum(flows[2:]) == 12560000
    assert round(sum(flows[2:]) / sum(payments), 2) == 10.38
    assert val(d["average_dscr"]) == 10.38


def test_cashflow_full_28_quarters_term_loan():
    flows = [50000] * 28
    d = client.post("/cashflow", json=dict(eligible(1000000), quarterly_cash_flows=flows)).json()
    q = d["quarters"]
    assert len(q) == 28
    assert q[0]["dscr"] is None and q[1]["dscr"] is None   # pause
    assert q[2]["dscr"] == round(50000 / 46536.37, 2) == 1.07
    assert not any("repeated" in a["text"] for a in d["assumptions"])


def test_cashflow_zero_loan_shows_no_placeholder():
    # cost 1 -> loan 0 -> nothing to pay at all: no 999, no risk label
    body = dict(eligible(1), quarterly_cash_flows=[-100, -100, -100, -100])
    d = client.post("/cashflow", json=body).json()
    assert d["average_dscr"] is None
    assert d["risk_assessment"] is None
    assert all(x["dscr"] is None for x in d["quarters"])


def test_cashflow_wrong_length_rejected():
    body = dict(eligible(140000), quarterly_cash_flows=[1, 2, 3])
    assert client.post("/cashflow", json=body).status_code == 422


# ---------------------------------------------------------------------------
# Bad input -> 422, never a crash
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("cost", ["abc", "140000", -1, 0, 140000.5, True, None])
def test_bad_project_cost_rejected(cost):
    r = client.post("/loan", json=eligible(cost))
    assert r.status_code == 422


def test_nan_and_infinity_rejected():
    for raw in ('NaN', 'Infinity'):
        payload = '{"project_cost": %s, "is_sc": true, "annual_family_income": 1}' % raw
        r = client.post("/loan", content=payload, headers={"content-type": "application/json"})
        assert r.status_code == 422


def test_unknown_moratorium_mode_rejected():
    r = client.post("/loan", json=eligible(140000, moratorium_interest="waive"))
    assert r.status_code == 422


def test_absurdly_large_numbers_rejected_not_crash():
    huge = "1" + "0" * 400
    for field in ("project_cost", "annual_family_income"):
        body = {"project_cost": 140000, "is_sc": True, "annual_family_income": 1}
        raw = __import__("json").dumps(body).replace(f'"{field}": {body[field]}', f'"{field}": {huge}')
        r = client.post("/loan", content=raw, headers={"content-type": "application/json"})
        assert r.status_code == 422, field
    raw = ('{"project_cost": 140000, "is_sc": true, "annual_family_income": 1, '
           '"quarterly_cash_flows": [%s, 1, 1, 1]}' % huge)
    r = client.post("/cashflow", content=raw, headers={"content-type": "application/json"})
    assert r.status_code == 422
    # limit is ₹100 crore: exactly 100 crore income is accepted (just not eligible)
    ok = client.post("/eligibility", json=eligible(140000, annual_family_income=10**9))
    assert ok.status_code == 200
    assert client.post("/eligibility", json=eligible(140000, annual_family_income=10**9 + 1)).status_code == 422


def test_negative_income_rejected():
    r = client.post("/loan", json=eligible(140000, annual_family_income=-5))
    assert r.status_code == 422
