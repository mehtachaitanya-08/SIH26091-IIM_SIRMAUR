"""
The teammate's /api addresses (the ones his website calls), served from VERIFIED sources.

His website (frontend/src/services/api.js) expects these shapes from engine/server.py.
This module keeps the shapes and his error format {error, status, timestamp}, but:
- dossiers come from data/businesses (verified) through backend/businesses.py,
  never from the made-up data/dossiers_db.json; no capex/opex/revenue/dscr/seasonality
  is sent, because those are NOT FOUND for a village-size unit;
- the NSFDC loan comes from backend/loan.py (rounded down to the rupee; pause interest
  added to the loan, ASSUMED); pause rows show interest paid 0 plus interestAddedToLoan;
- Mode A and Mode B call his engine (engine/multi_archetype_financial_engine.py) with his
  request handling (copied from engine/server.py, credited below) and are tagged ASSUMED.

This file must never import engine.server: that module loads the made-up dossier file
as soon as it is imported (backend/tests/test_compat.py checks this).
"""

import json
import math
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from backend import businesses, loan
from backend.schemas import LoanRequest
from engine.multi_archetype_financial_engine import ARCHETYPES, IncubationEngine, RestructuringEngine

router = APIRouter()

VERSION = "1.0.0"

# The 24 business names, from the dossier file names in research_dossiers/
# (D01_Village_FMCG_Retail_Dossier.md -> "Village FMCG Retail"). A test checks this matches the folder.
NAMES = {
    "D01": "Village FMCG Retail",
    "D02": "Periodic Haat Mobile Trade",
    "D03": "Rural Electronics Recharge",
    "D04": "Seeds Fertiliser",
    "D05": "Animal Feed",
    "D06": "Farm Hardware Drip",
    "D07": "Grain Dal Milling",
    "D08": "Oil Expellers",
    "D09": "Spice Grinding",
    "D10": "Horticultural Dehydration",
    "D11": "Commercial Bovine Dairy",
    "D12": "Commercial Goat Meat Husbandry",
    "D13": "Commercial Broiler Poultry",
    "D14": "Inland Freshwater Aquaculture",
    "D15": "Tractor Garage",
    "D16": "Motor Rewinding",
    "D17": "Auto EV Workshop",
    "D18": "Tailoring",
    "D19": "Carpentry",
    "D20": "Metal Smithy",
    "D21": "Pottery",
    "D22": "Fly Ash Bricks",
    "D23": "Vermicompost",
    "D24": "Rural Freight Custom Hiring",
}

MODE_A_TAG = "ASSUMED: team's archetype engine (engine/multi_archetype_financial_engine.py), invented defaults, not verified"
MODE_B_TAG = "ASSUMED: team's Mode B engine (engine/multi_archetype_financial_engine.py), not verified"


def _error(message, status_code, details=None):
    body = {"error": message, "status": status_code, "timestamp": datetime.now(timezone.utc).isoformat()}
    if details:
        body["details"] = details
    return JSONResponse(status_code=status_code, content=body)


async def _body(request: Request):
    """Read the raw body the way his server does; returns (dict, None) or (None, error response)."""
    raw = await request.body()
    if not raw or not raw.strip():
        return None, _error("Request body is empty", 400)
    try:
        data = json.loads(raw)
    except (ValueError, UnicodeDecodeError) as exc:
        return None, _error("Invalid JSON in request body", 400, details=str(exc))
    if not isinstance(data, dict):
        return None, _error("Request body must be a JSON object", 400)
    return data, None


def _whole_rupees(value, name, notes):
    """His page may send paise; round DOWN to the rupee and say so (ASSUMED). Reject non-numbers."""
    if isinstance(value, bool):
        raise ValueError(f"'{name}' must be a number")
    try:
        x = float(value)
    except OverflowError:
        raise ValueError(f"'{name}' is too large")
    except (TypeError, ValueError):
        raise ValueError(f"'{name}' must be a number")
    if not math.isfinite(x):
        raise ValueError(f"'{name}' must be a finite number")
    if abs(x) > 10 ** 12:
        raise ValueError(f"'{name}' is too large")
    whole = math.floor(x)
    if whole != x:
        notes.append({"tag": "ASSUMED", "text": f"{name} {x} was rounded down to the whole rupee ({whole})."})
    return int(whole)


# ---------------------------------------------------------------------------
# health and dossiers
# ---------------------------------------------------------------------------

@router.get("/api/health")
def health():
    return {
        "status": "ok",
        "version": VERSION,
        "service": "UdyamSetuAI verified backend (backend/app.py)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engines": {
            "nsfdc_calculator": "verified (backend/loan.py)",
            "dossiers": "verified (research_dossiers .md files, team decision; checked figures in backend/dossier_figures.py)",
            "verified_dossiers": len(NAMES),
            "total_dossiers": len(NAMES),
        },
        "mandiKeyConfigured": _mandi_key_set(),
    }


def _mandi_key_set():
    from backend import mandi  # yes/no only; the key itself is never sent
    return bool(mandi._api_key())


FIELD_NAMES = {"project_cost": "projectCost", "annual_family_income": "familyIncome", "is_sc": "isSc"}


def _validation_message(exc):
    """One plain line, in his field names (no library text or links)."""
    parts = []
    for e in exc.errors():
        field = FIELD_NAMES.get(str(e["loc"][-1]) if e.get("loc") else "", str(e.get("loc", [""])[-1]))
        parts.append(f"'{field}': {e['msg'].splitlines()[0]}")
    return "; ".join(parts)


def _is_sc(body, notes):
    """Only true/false (or the text "true"/"false"). Missing -> true, said as ASSUMED (his contract's default)."""
    if "isSc" not in body and "is_sc" not in body:
        notes.append({"tag": "ASSUMED", "text": "isSc was not sent, so the applicant is taken as Scheduled Caste (as in the website's default)."})
        return True
    v = body.get("isSc", body.get("is_sc"))
    if isinstance(v, bool):
        return v
    if isinstance(v, str) and v.strip().lower() in ("true", "false"):
        return v.strip().lower() == "true"
    raise ValueError("'isSc' must be true or false")


def _row(code):
    return {"code": code, "name": NAMES[code], "title": NAMES[code], "status": "verified",
            "questionsAvailable": code in businesses.VERIFIED}


_CHECKER_ONLY = {"line", "as_written", "source_tag"}  # used to check figures against the dossier; never sent


def _public(x):
    if isinstance(x, dict):
        return {k: _public(v) for k, v in x.items() if k not in _CHECKER_ONLY}
    if isinstance(x, list):
        return [_public(v) for v in x]
    return x


def _figures(code):
    from backend import dossier_figures  # imported here: dossier_figures itself imports this module
    return _public(dossier_figures.figures(code))


@router.get("/api/dossiers")
def dossiers():
    rows = []
    for c in businesses.ALL_CODES:
        f = _figures(c)
        rows.append(dict(_row(c), tiers=[{"label": t["label"], "project_cost": t["project_cost"]} for t in f["tiers"]]))
    return {
        "count": len(rows),
        "dossiers": rows,
        "metadata": {
            "verified": list(businesses.ALL_CODES),
            "withQuestions": list(businesses.VERIFIED),
            "note": "Figures are from each business's research dossier (research_dossiers/), tagged '<code> dossier'. "
                    "Full figures: GET /api/dossiers/{code}.",
        },
    }


@router.get("/api/dossiers/{code}")
def dossier(code: str):
    code = code.strip().upper()
    if code not in NAMES:
        return _error(f"Dossier '{code}' not found", 404, details={"availableCodes": list(NAMES)})
    f = _figures(code)
    out = dict(_row(code), tiers=f["tiers"], seasonality=f["seasonality"], dossier=f["dossier"])
    d = businesses.detail(code)
    out.update({k: v for k, v in d.items() if k not in ("code", "status", "name")})
    return out


# ---------------------------------------------------------------------------
# NSFDC loan (verified logic, his keys)
# ---------------------------------------------------------------------------

def _both(out, camel, snake, value):
    out[camel] = value
    out[snake] = value


@router.post("/api/engine/nsfdc/calculate")
async def nsfdc_calculate(request: Request):
    body, err = await _body(request)
    if err:
        return err
    notes = []
    try:
        raw_cost = body.get("projectCost", body.get("project_cost"))
        if raw_cost is None:
            return _error("Missing required parameter: 'projectCost'", 400)
        cost = _whole_rupees(raw_cost, "projectCost", notes)
        raw_income = body.get("familyIncome", body.get("family_income", body.get("annual_family_income", 0)))
        income = _whole_rupees(raw_income, "familyIncome", notes)
        is_sc = _is_sc(body, notes)
        if body.get("promoterEquityOffered", body.get("promoter_equity_offered")) is not None:
            raise ValueError("'promoterEquityOffered' is not supported: the loan is always the NSFDC maximum "
                             "(90% within the cap, rounded down) and own money is the rest. Send null or leave it out.")
        req = LoanRequest(project_cost=cost, is_sc=is_sc, annual_family_income=income)
    except ValidationError as exc:  # before ValueError: pydantic's error is a ValueError
        return _error(_validation_message(exc), 400)
    except ValueError as exc:
        return _error(str(exc), 400)

    try:
        out = loan.build_loan(req)
    except loan.InternalCheckError as exc:
        return _error("Internal consistency check failed; no figures returned.", 500, details=str(exc))

    if out["status"] != "eligible":
        reasons = [r.get("text") or r.get("quote") for r in out["reasons"]]
        alts = [a["text"] for a in out["alternatives"]]
        res = {"isEligible": False, "is_eligible": False, "status": out["status"],
               "rejectionReasons": reasons, "rejection_reasons": reasons,
               "recommendedAlternatives": alts, "recommended_alternatives": alts,
               "projectCost": cost, "familyIncome": income,
               "reasonQuotes": out["reasons"], "assumptions": notes,
               "tags": {"projectCost": "USER INPUT", "familyIncome": "USER INPUT",
                        "recommendedAlternatives": loan.ALTERNATIVES_TAG}}
        return res

    combined = out["_combined"]
    st = combined.structure
    L = out["loan"]
    S = out["summary"]
    rows = []
    for r in out["schedule"]["rows"]:
        paid_interest = round(r["interest"] - r["interest_added"], 2)
        row = {"quarter": r["quarter"]}
        _both(row, "isMoratorium", "is_moratorium", r["is_moratorium"])
        _both(row, "openingBalance", "opening_balance", r["opening_balance"])
        _both(row, "interestPayment", "interest_payment", paid_interest)
        _both(row, "interestAddedToLoan", "interest_added_to_loan", r["interest_added"])
        _both(row, "principalPayment", "principal_payment", r["principal"])
        _both(row, "totalInstallment", "total_installment", r["payment"])
        _both(row, "closingBalance", "closing_balance", r["closing_balance"])
        rows.append(row)

    loan_amt = L["loan_amount"]["value"]
    own = L["own_contribution"]["value"]
    res = {"isEligible": True, "is_eligible": True, "tier": st.tier.value}
    _both(res, "schemeName", "scheme_name", L["scheme"]["value"])
    _both(res, "projectCost", "project_cost", cost)
    res["maxLoanAmount"] = loan_amt
    _both(res, "loanAmount", "loan_amount", loan_amt)
    res["promoterContribution"] = own
    _both(res, "promoterEquity", "promoter_equity", own)
    _both(res, "promoterEquityPct", "promoter_equity_pct", L["own_contribution_pct"]["value"])
    _both(res, "interestRatePa", "interest_rate_pa", L["interest_rate_pa"]["value"])
    _both(res, "quarterlyInterestRate", "quarterly_interest_rate", st.quarterly_interest_rate)  # already a fraction: rate / 400
    res["termYears"] = L["tenure_years"]["value"]
    _both(res, "tenureYears", "tenure_years", L["tenure_years"]["value"])
    _both(res, "totalQuarters", "total_quarters", L["total_quarters"]["value"])
    _both(res, "moratoriumQuarters", "moratorium_quarters", L["moratorium_quarters"]["value"])
    _both(res, "repaymentQuarters", "repayment_quarters", L["repayment_quarters"]["value"])
    _both(res, "equatedQuarterlyInstallment", "equated_quarterly_installment", S["equated_quarterly_instalment"]["value"])
    _both(res, "interestAddedDuringPause", "interest_added_during_pause", S["interest_added_during_pause"]["value"])
    # principal = the loan itself; interest = everything paid above it (incl. pause interest added to the loan)
    _both(res, "totalPrincipalPaid", "total_principal_paid", loan_amt)
    _both(res, "totalInterestPaid", "total_interest_paid", S["total_interest_cost"]["value"])
    _both(res, "totalDebtService", "total_debt_service", S["total_paid"]["value"])
    _both(res, "amortizationSchedule", "amortization_schedule", rows)
    calc = "CALCULATED"
    res["tags"] = {
        "projectCost": "USER INPUT",
        "maxLoanAmount": L["loan_amount"]["tag"], "loanAmount": L["loan_amount"]["tag"],
        "promoterContribution": L["own_contribution"]["tag"], "promoterEquity": L["own_contribution"]["tag"],
        "promoterEquityPct": calc,
        "interestRatePa": L["interest_rate_pa"]["tag"], "quarterlyInterestRate": f"{calc}: interestRatePa / 400",
        "termYears": L["tenure_years"]["tag"], "tenureYears": L["tenure_years"]["tag"],
        "totalQuarters": L["total_quarters"]["tag"], "moratoriumQuarters": L["moratorium_quarters"]["tag"],
        "repaymentQuarters": L["repayment_quarters"]["tag"],
        "equatedQuarterlyInstallment": calc, "interestAddedDuringPause": "CALCULATED (pause handling ASSUMED)",
        "totalPrincipalPaid": calc, "totalInterestPaid": calc, "totalDebtService": calc,
        "amortizationSchedule": calc,
    }
    # the snake_case twin of each key carries the same tag
    for k in list(res["tags"]):
        twin = re.sub(r"(?<!^)(?=[A-Z])", "_", k).lower()
        if twin in res:
            res["tags"][twin] = res["tags"][k]
    res["rule"] = L["rule"]
    res["ninetyPctRule"] = L["ninety_pct_rule"]
    res["warnings"] = out["warnings"]
    res["assumptions"] = notes + out["assumptions"]
    res["notes"] = out["notes"]
    res["sources"] = out["sources"]
    return res


# ---------------------------------------------------------------------------
# Mode A and Mode B: request handling copied from engine/server.py (teammate's code),
# results tagged ASSUMED. Only the error replies are rebuilt here.
# ---------------------------------------------------------------------------

@router.post("/api/engine/mode-a/evaluate")
async def mode_a(request: Request):
    body, err = await _body(request)
    if err:
        return err
    try:
        archetype_key = body.get("archetypeKey") or body.get("archetype_key") or body.get("archetypeId") or body.get("archetype_id") or "archetype_1"
        scale = float(body.get("scale", 1.0))
        state = body.get("state", "Uttar Pradesh")
        capex_override = body.get("capexOverride") or body.get("capex_override")
        working_capital_override = body.get("workingCapitalOverride") or body.get("working_capital_override")
        monthly_revenue_override = body.get("monthlyRevenueOverride") or body.get("monthly_revenue_override")
        monthly_opex_override = body.get("monthlyOpexOverride") or body.get("monthly_opex_override")
        promoter_category = body.get("promoterCategory") or body.get("promoter_category") or "special"
        location_type = body.get("locationType") or body.get("location_type") or "rural"
        custom_loan_tenure_months = int(body.get("customLoanTenureMonths") or body.get("custom_loan_tenure_months") or 60)
        base_interest_rate_pct = float(body.get("baseInterestRatePct") or body.get("base_interest_rate_pct") or 9.5)

        arch_def = ARCHETYPES.get(archetype_key, ARCHETYPES.get("archetype_1", {}))
        if scale != 1.0:
            if capex_override is None and "default_capex" in arch_def:
                capex_override = arch_def["default_capex"] * scale
            if monthly_opex_override is None and "default_opex_monthly" in arch_def:
                monthly_opex_override = arch_def["default_opex_monthly"] * scale
            if monthly_revenue_override is None and "default_turnover_monthly" in arch_def:
                monthly_revenue_override = arch_def["default_turnover_monthly"] * scale

        eval_res = IncubationEngine.evaluate_project(
            archetype_id=archetype_key,
            state=state,
            capex_override=float(capex_override) if capex_override is not None else None,
            working_capital_override=float(working_capital_override) if working_capital_override is not None else None,
            monthly_revenue_override=float(monthly_revenue_override) if monthly_revenue_override is not None else None,
            monthly_opex_override=float(monthly_opex_override) if monthly_opex_override is not None else None,
            promoter_category=promoter_category,
            location_type=location_type,
            custom_loan_tenure_months=custom_loan_tenure_months,
            base_interest_rate_pct=base_interest_rate_pct,
        )

        fin_sum = eval_res.get("financial_summary", {})
        scheme_det = eval_res.get("scheme_details", {})
        dscr_met = eval_res.get("dscr_metrics", {})
        monthly_flows = eval_res.get("monthly_cash_flows", [])
        seasonal_dscr = [m.get("dscr", 0.0) for m in monthly_flows]

        monthly_opex = monthly_opex_override or (arch_def.get("default_opex_monthly", 0.0) * scale)
        monthly_rev = monthly_revenue_override or (arch_def.get("default_turnover_monthly", 0.0) * scale)

        return {
            "capex": fin_sum.get("capex", 0.0),
            "totalProjectCost": fin_sum.get("total_project_cost", 0.0),
            "monthlyOpex": monthly_opex,
            "revenue": monthly_rev,
            "seasonalDscr": seasonal_dscr,
            "grantSubsidy": scheme_det.get("subsidy_amount", 0.0),
            "promoterEquity": fin_sum.get("promoter_equity", 0.0),
            "bankLoanPrincipal": fin_sum.get("bank_loan_principal", 0.0),
            "monthlyEmi": fin_sum.get("monthly_emi", 0.0),
            "archetypeId": eval_res.get("archetype_id"),
            "archetypeName": eval_res.get("archetype_name"),
            "sector": eval_res.get("sector"),
            "state": eval_res.get("state"),
            "financialSummary": fin_sum,
            "financial_summary": fin_sum,
            "schemeDetails": scheme_det,
            "scheme_details": scheme_det,
            "dscrMetrics": dscr_met,
            "dscr_metrics": dscr_met,
            "monthlyCashFlows": monthly_flows,
            "monthly_cash_flows": monthly_flows,
            "tags": {"source": MODE_A_TAG},
        }
    except (ValueError, TypeError) as ve:
        return _error(str(ve), 400)
    except Exception as e:  # as his server, except odd types (e.g. scale: null) give 400 here, 500 there
        return _error(f"Mode A evaluation failed: {str(e)}", 500)


@router.post("/api/engine/mode-b/restructure")
async def mode_b(request: Request):
    body, err = await _body(request)
    if err:
        return err
    try:
        debts = body.get("debts")
        principal = float(body.get("principal", 0.0))
        monthly_rate_pct = float(body.get("monthlyRatePct") or body.get("monthly_rate_pct") or 3.0)
        duration_months = int(body.get("durationMonths") or body.get("duration_months") or body.get("monthsActive") or body.get("months_active") or 36)
        # No usable income -> no income-based figures. His engine's default of 35,000 a month was
        # used for every user, so three "share of income" ratios were worked out from an income
        # nobody entered (teammate review, 11 Nov 2026). Zero, negative, NaN and infinity count as
        # not entered too: the engine prints "0%" for them, a share of an income that is not there,
        # and NaN cannot be sent back as JSON at all (review, 11 Nov 2026).
        raw_income = next((body.get(k) for k in ("householdMonthlyIncome", "household_monthly_income", "householdIncome")
                           if body.get(k) is not None and body.get(k) != ""), None)
        household_income = None if raw_income is None else float(raw_income)
        if household_income is not None and not (math.isfinite(household_income) and household_income > 0):
            household_income = None
        pathway = body.get("refinancingPathway") or body.get("refinancing_pathway") or body.get("pathway") or "MUDRA_KISHOR"
        tenure_months = int(body.get("refinanceTenureMonths") or body.get("refinance_tenure_months") or body.get("tenureMonths") or 36)

        if not debts:
            if principal <= 0:
                return _error("Missing or invalid 'principal' amount", 400)
            rate_quote = body.get("rateQuote") or body.get("rate_quote") or f"{monthly_rate_pct} senkda"
            debts = [{
                "principal": principal,
                "rate_quote": rate_quote,
                "lender_type": body.get("lenderType", "Village Moneylender"),
                "collateral": body.get("collateral", "None"),
                "months_active": duration_months,
            }]

        portfolio_result = RestructuringEngine.evaluate_portfolio(
            debts=debts,
            household_monthly_income=household_income if household_income is not None else 0.0,
            refinancing_pathway=pathway,
            refinance_tenure_months=tenure_months,
        )

        audited = portfolio_result.get("audited_debts", [])
        damdupat_violated = any(d.get("damdupat_violation", False) for d in audited)
        plan = portfolio_result.get("refinancing_plan", {})
        metrics = dict(portfolio_result.get("liberation_metrics", {}))
        if household_income is None:
            for k in ("cash_flow_liberation_ratio_pct", "debt_service_to_income_before_pct",
                      "debt_service_to_income_after_pct", "household_monthly_income"):
                metrics[k] = None
            metrics["income_note"] = "NOT FOUND: household monthly income not entered"
        legal = portfolio_result.get("legal_remedy_summary", {})
        old_monthly_interest = portfolio_result.get("current_monthly_interest_bleed", 0.0)
        new_monthly_emi = plan.get("new_monthly_amortizing_emi", 0.0)
        monthly_savings = metrics.get("monthly_cash_flow_relief", 0.0)

        return {
            "oldMonthlyInterest": old_monthly_interest,
            "old_monthly_interest": old_monthly_interest,
            "newMonthlyEmi": new_monthly_emi,
            "new_monthly_emi": new_monthly_emi,
            "monthlySavings": monthly_savings,
            "monthly_savings": monthly_savings,
            "damdupatViolated": damdupat_violated,
            "damdupat_violated": damdupat_violated,
            "totalDebtConsolidated": portfolio_result.get("total_debt_consolidated", 0.0),
            "weightedInformalAprPct": portfolio_result.get("weighted_informal_apr_pct", 0.0),
            "auditedDebts": audited,
            "audited_debts": audited,
            "refinancingPlan": plan,
            "refinancing_plan": plan,
            "liberationMetrics": metrics,
            "liberation_metrics": metrics,
            "legalRemedySummary": legal,
            "legal_remedy_summary": legal,
            "tags": {"source": MODE_B_TAG},
        }
    except (ValueError, TypeError) as ve:
        return _error(str(ve), 400)
    except Exception as e:  # as his server, except odd types (e.g. principal: [1]) give 400 here, 500 there
        return _error(f"Mode B restructuring failed: {str(e)}", 500)


# ---------------------------------------------------------------------------
# Unknown /api paths: his 404 format. This router must be included LAST in backend/app.py.
# ---------------------------------------------------------------------------

@router.api_route("/api/{rest:path}", methods=["GET", "POST"], include_in_schema=False)
def not_found(rest: str, request: Request):
    # His server strips a trailing slash; send those on to the same path without it (307 keeps the body).
    if rest.endswith("/") and rest.strip("/"):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=f"/api/{rest.rstrip('/')}", status_code=307)
    return _error(f"Route not found: /api/{rest}", 404)
