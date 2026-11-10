"""
NSFDC loan logic for the server. It WRAPS the team's calculator
(engine/nsfdc_calculator.py) and does not change it. It adds three things:

1. Loan rounded DOWN to the whole rupee (the team's code keeps paise, e.g. 1,26,000.90).
   Done by handing the team's calculator the matching own contribution.
2. "accrue" moratorium (default, ASSUMED): interest in the pause quarters is added to
   the loan, compounding each quarter; the team's own schedule code then runs on the
   bigger balance. "pay" keeps the team's behaviour (interest paid in the pause).
3. A tag on every number: [S1] (NSFDC page), USER INPUT, CALCULATED or ASSUMED.
"""

from dataclasses import replace
from typing import List, Optional

from engine.nsfdc_calculator import (
    AmortizationSchedule,
    BeneficiaryProfile,
    NSFDCCalculator,
    NSFDCTier,
    QuarterSchedule,
)

from backend.sources import SOURCES, cite

CALC = NSFDCCalculator()

CALCULATED = "CALCULATED"
USER = "USER INPUT"

SCHEME_NAME = {
    NSFDCTier.MICRO_CREDIT_FINANCE: "Micro Finance Scheme (MFS)",
    NSFDCTier.TERM_LOAN: "Term Loan",
}
SCHEME_QUOTE = {
    NSFDCTier.MICRO_CREDIT_FINANCE: "micro_finance",
    NSFDCTier.TERM_LOAN: "term_loan",
}
LOAN_CAP = {
    NSFDCTier.MICRO_CREDIT_FINANCE: int(CALC.MCF_LOAN_CAP_INR),
    NSFDCTier.TERM_LOAN: int(CALC.TERM_LOAN_LOAN_CAP_INR),
}

ALTERNATIVES_TAG = (
    "ASSUMED: not sourced — suggestion text from the team's calculator "
    "(engine/nsfdc_calculator.py); check the scheme's own guidelines"
)


class InternalCheckError(RuntimeError):
    """Our numbers disagree with the team's calculator. Never expected; reported clearly if it happens."""


def check(ok, message):
    if not ok:
        raise InternalCheckError(message)


def num(value, tag):
    return {"value": value, "tag": tag}


def text(value, tag):
    return {"value": value, "tag": tag}


# ---------------------------------------------------------------------------
# Eligibility
# ---------------------------------------------------------------------------

def _profile(req, own_contribution: Optional[float] = None) -> BeneficiaryProfile:
    return BeneficiaryProfile(
        is_sc=req.is_sc,
        caste_category="SC" if req.is_sc else "NOT SC",
        annual_family_income=float(req.annual_family_income),
        project_cost=float(req.project_cost),
        promoter_equity_offered=own_contribution,
    )


def assess(req) -> dict:
    """Eligibility: status, reasons (NSFDC's own words), other schemes (ASSUMED)."""
    team = CALC.check_eligibility(_profile(req))

    reasons = []
    person_ok = True
    if not req.is_sc:
        person_ok = False
        reasons.append(dict(cite("community"), text="Applicant is not from a Scheduled Caste."))
    if req.annual_family_income > CALC.INCOME_CEILING_INR:
        person_ok = False
        reasons.append(dict(cite("income"), text="Annual family income is above ₹5,00,000."))
    if req.project_cost > CALC.MAX_PROJECT_COST_INR:
        reasons.append(dict(cite("term_loan"), text="Project cost is above ₹50,00,000, the Term Loan limit."))

    if not reasons:
        status = "eligible"
    elif person_ok:
        status = "not_covered"
    else:
        status = "not_eligible"

    # Our reading of the rules must agree with the team's calculator.
    check((status == "eligible") == team.is_eligible, "eligibility disagrees with engine/nsfdc_calculator.py")

    tier = None
    if status == "eligible":
        tier = NSFDCTier.MICRO_CREDIT_FINANCE if req.project_cost <= CALC.MCF_COST_CAP_INR else NSFDCTier.TERM_LOAN

    return {
        "status": status,
        "tier": tier,
        "reasons": reasons,
        "alternatives": [{"text": a, "tag": ALTERNATIVES_TAG} for a in team.recommended_alternatives],
    }


# ---------------------------------------------------------------------------
# Loan amount and schedule
# ---------------------------------------------------------------------------

def _structure(req, tier):
    cost = req.project_cost
    loan = min(cost * 9 // 10, LOAN_CAP[tier])  # whole-rupee maths: rounded DOWN
    own = cost - loan
    structure = CALC.calculate_loan_structure(_profile(req, own_contribution=float(own)))
    check(structure.tier == tier, "scheme disagrees with engine/nsfdc_calculator.py")
    check(structure.loan_amount == loan, f"loan {structure.loan_amount} disagrees with rounded-down {loan}")
    return structure, loan, own


def _schedule(structure, mode):
    """Returns (pause_rows, repayment AmortizationSchedule, combined AmortizationSchedule)."""
    r = structure.quarterly_interest_rate
    m = structure.moratorium_quarters

    if mode == "pay":
        sched = CALC.generate_amortization_schedule(structure)
        return [], sched, sched

    # accrue: interest added to the balance each pause quarter (compounding)
    balance = structure.loan_amount
    pause: List[QuarterSchedule] = []
    for q in range(1, m + 1):
        interest = round(balance * r, 2)
        closing = round(balance + interest, 2)
        pause.append(QuarterSchedule(
            quarter=q, is_moratorium=True, opening_balance=balance,
            interest_payment=interest, principal_payment=0.0,
            total_installment=0.0, closing_balance=closing,
        ))
        balance = closing

    after_pause = replace(
        structure,
        loan_amount=balance,
        moratorium_quarters=0,
        total_quarters=structure.repayment_quarters,
    )
    repay = CALC.generate_amortization_schedule(after_pause)
    shifted = [replace(row, quarter=row.quarter + m) for row in repay.quarters]
    combined = AmortizationSchedule(
        structure=structure,
        quarters=pause + shifted,
        equated_quarterly_installment=repay.equated_quarterly_installment,
        total_principal_paid=repay.total_principal_paid,
        total_interest_paid=repay.total_interest_paid,
        total_debt_service=repay.total_debt_service,
    )
    return pause, repay, combined


def _assumptions(mode, tier):
    a = [
        "Loan rounded down to the whole rupee.",
        "Repaid over exactly 3 years (Micro Finance) or 7 years (Term Loan); NSFDC says 'within'.",
        "Each instalment is equal (equated quarterly instalment), with the last one settling the exact balance.",
    ]
    if tier == NSFDCTier.TERM_LOAN:
        a.append("Term Loan repaid in quarterly instalments; the NSFDC page states 'quarterly' only for Micro Finance.")
    if mode == "accrue":
        a.append("Interest during the pause is added to the loan, compounding each quarter. "
                 "The NSFDC page does not say how pause interest is handled (NOT FOUND).")
    else:
        a.append("Interest during the pause is paid each quarter. "
                 "The NSFDC page does not say how pause interest is handled (NOT FOUND).")
    return [{"text": t, "tag": "ASSUMED"} for t in a]


def build_loan(req) -> dict:
    e = assess(req)
    out = {
        "status": e["status"],
        "moratorium_interest": req.moratorium_interest,
        "reasons": e["reasons"],
        "alternatives": e["alternatives"],
        "loan": None,
        "schedule": None,
        "summary": None,
        "warnings": [],
        "assumptions": [],
        "notes": [],
        "sources": SOURCES,
        "_combined": None,
    }
    if e["status"] != "eligible":
        return out

    tier = e["tier"]
    structure, loan, own = _structure(req, tier)
    pause, repay, combined = _schedule(structure, req.moratorium_interest)

    rows = []
    for q in combined.quarters:
        accrue_pause = q.is_moratorium and req.moratorium_interest == "accrue"
        rows.append({
            "quarter": q.quarter,
            "is_moratorium": q.is_moratorium,
            "opening_balance": round(q.opening_balance, 2),
            "interest": q.interest_payment,
            "interest_added": q.interest_payment if accrue_pause else 0.0,
            "principal": q.principal_payment,
            "payment": q.total_installment,
            "closing_balance": q.closing_balance,
        })

    pause_rows = [x for x in rows if x["is_moratorium"]]
    repay_rows = [x for x in rows if not x["is_moratorium"]]
    total_paid = round(sum(x["payment"] for x in rows), 2)
    added = round(sum(x["interest_added"] for x in pause_rows), 2)
    paid_in_pause = round(sum(x["payment"] for x in pause_rows), 2)
    balance_after_pause = pause_rows[-1]["closing_balance"] if pause_rows else loan
    cap = LOAN_CAP[tier]
    quote_key = SCHEME_QUOTE[tier]
    s1 = SOURCES["[S1]"]["tag"]

    out["loan"] = {
        "scheme": text(SCHEME_NAME[tier], s1),
        "project_cost": num(req.project_cost, USER),
        "loan_amount": num(loan, f"{CALCULATED}: lower of 90% of project cost and the cap {s1}, rounded down (ASSUMED)"),
        "loan_cap": num(cap, s1),
        "own_contribution": num(own, f"{CALCULATED}: project cost minus loan"),
        "own_contribution_pct": num(round(own * 100 / req.project_cost, 2), CALCULATED),
        "interest_rate_pa": num(structure.interest_rate_pa, s1),
        "tenure_years": num(structure.tenure_years, "ASSUMED: NSFDC says 'within' this many years"),
        "moratorium_quarters": num(
            structure.moratorium_quarters,
            f"{CALCULATED}: {structure.moratorium_quarters * 3}-month pause {s1} ÷ 3",
        ),
        "total_quarters": num(structure.total_quarters, "ASSUMED: tenure x 4"),
        "repayment_quarters": num(structure.repayment_quarters, CALCULATED),
        "rule": cite(quote_key),
        "ninety_pct_rule": cite("ninety_pct"),
    }
    out["schedule"] = {"tag": CALCULATED, "rows": rows}
    out["summary"] = {
        "equated_quarterly_instalment": num(repay.equated_quarterly_installment, CALCULATED),
        "interest_paid_during_pause": num(paid_in_pause, CALCULATED),
        "interest_added_during_pause": num(added, CALCULATED),
        "balance_after_pause": num(balance_after_pause, CALCULATED),
        "interest_in_instalments": num(round(sum(x["interest"] for x in repay_rows), 2), CALCULATED),
        "total_paid": num(total_paid, CALCULATED),
        "total_interest_cost": num(round(total_paid - loan, 2), CALCULATED),
    }
    if loan == 0:
        out["warnings"].append({
            "code": "loan_is_zero",
            "tag": "CALCULATED",
            "text": "At this project cost, 90% rounded down to the rupee is ₹0: there is nothing to borrow.",
        })
    if balance_after_pause > cap:
        out["warnings"].append({
            "code": "balance_over_cap_after_pause",
            "tag": "ASSUMED",
            "text": "With pause interest added, the balance owed is above the scheme's maximum loan. "
                    "Confirm with your State Channelising Agency (SCA) how pause interest is handled.",
        })
    out["assumptions"] = _assumptions(req.moratorium_interest, tier)
    if tier == NSFDCTier.TERM_LOAN:
        out["notes"].append(dict(
            cite("term_loan"),
            text="For plantation and construction activities the pause is 12 months, not 6. "
                 "Not applied here; ask your SCA if your activity counts.",
        ))
    out["_combined"] = combined
    return out


def public(out: dict) -> dict:
    return {k: v for k, v in out.items() if not k.startswith("_")}


# ---------------------------------------------------------------------------
# Cash-flow cover (DSCR)
# ---------------------------------------------------------------------------

BENCHMARK = 1.25
BENCHMARK_TAG = ("ASSUMED: 1.25 cover line used by the team's calculator as a bank benchmark; "
                 "not set by NSFDC")
RISK_TAG = ("ASSUMED: team's risk labels (2+ quarters below 1.25 = HIGH_STRESS, "
            "1 = MODERATE_SEASONAL_DIP); not set by NSFDC")


class CashflowLengthError(ValueError):
    pass


def build_cashflow(req) -> dict:
    out = build_loan(req)
    combined = out.pop("_combined")
    result = {
        "status": out["status"],
        "moratorium_interest": out["moratorium_interest"],
        "reasons": out["reasons"],
        "alternatives": out["alternatives"],
        "loan": out["loan"],
        "quarters": [],
        "benchmark_dscr": num(BENCHMARK, BENCHMARK_TAG),
        "average_dscr": None,
        "risk_assessment": None,
        "assumptions": out["assumptions"],
        "warnings": out["warnings"],
        "sources": out["sources"],
    }
    if combined is None:
        return result

    n = len(combined.quarters)
    flows = list(req.quarterly_cash_flows)
    if len(flows) == 4:
        flows = (flows * ((n + 3) // 4))[:n]
        result["assumptions"] = result["assumptions"] + [{
            "tag": "ASSUMED",
            "text": "The 4 quarterly figures given are one typical year, repeated for every year of the loan.",
        }]
    elif len(flows) != n:
        raise CashflowLengthError(f"Give 4 quarterly figures (one typical year) or exactly {n} (one per loan quarter).")

    dscr = CALC.evaluate_dscr_stress(combined, [float(f) for f in flows], benchmark_dscr=BENCHMARK)

    quarters = []
    for q, f in zip(dscr["quarterly_metrics"], flows):
        no_payment = q["debt_service"] == 0
        quarters.append({
            "tag": f"{CALCULATED} (cash flow = USER INPUT)",
            "quarter": q["quarter"],
            "is_moratorium": q["is_moratorium"],
            "cash_flow": f,
            "debt_service": q["debt_service"],
            "dscr": None if no_payment else q["dscr"],
            "below_benchmark": False if no_payment else q["is_sub_benchmark"],
            "note": "No payment due this quarter." if no_payment else None,
        })
    result["quarters"] = quarters
    # Average only over quarters with something to pay: pause quarters in "accrue" mode
    # pay nothing, and counting their cash made the average look better than it is.
    paying = [x for x in quarters if x["debt_service"] > 0]
    if paying:
        avg = round(sum(x["cash_flow"] for x in paying) / sum(x["debt_service"] for x in paying), 2)
        result["average_dscr"] = num(avg, f"{CALCULATED}: total cash / total payments, over quarters with a payment")
        result["risk_assessment"] = text(dscr["risk_assessment"], RISK_TAG)
    # else: nothing to pay at all (₹0 loan): no cover figure and no risk label
    return result
