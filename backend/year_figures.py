"""
Year-by-year figures for the DPR (Phase 1, Stage 1a; owner's decisions 1-28, 12 Nov 2026).

The figures live in data/year_figures/Dxx.json, each with the text found on its dossier line or
government-profile page. Dossier figures are checked against their lines every time a file is loaded
(the same rule as dossier_figures._fig); PDF figures are checked by the tests (decision 17).

years(code, project_cost) returns Years 1-5 for one business, every cell tagged:
  - dossier businesses with Years 1-3 (D01-D03, D11-D14, D24): Years 4-5 repeat Year 3 (ASSUMED);
  - dossier businesses with one normal month (D04-D10, D23): x 12 for every year (ASSUMED);
  - government project profiles (D16, D19, D20, D21, D22): a reference unit, never rescaled;
  - D15, D17, D18: "to be filled with the bank".
Depreciation and tax for the dossier businesses follow the owner's rules (15% written-down value on
machinery, vehicles and tools; new-regime slabs + rebate + 4% cess); the government profiles keep their
printed figures, except D20, which prints no tax (decision 22).
"""

import json
from functools import lru_cache
from pathlib import Path

from backend import dossier_figures as dfig

DATA = Path(__file__).resolve().parent.parent / "data" / "year_figures"
YEARS = 5
DISCOUNT = 0.15
GAP_YEARS = [6, 7, 8]                 # FIDF asks for Years 2-8; shown as a gap, no reason printed (decision 1)
SUBSIDY_NOTE = "no subsidy in this NSFDC calculation"
TO_BE_FILLED = "to be filled with the bank"

COUNTED_GROUPS = {"machinery", "vehicle", "tools"}                    # decision 8
ALL_GROUPS = COUNTED_GROUPS | {"furniture_fittings", "civil_works", "stock", "working_capital",
                               "licences_deposits", "insurance", "livestock", "first_batch_inputs"}

DEP_RATE = 0.15
DEP_LABEL = ("ASSUMED: owner's choice, source Income-tax New Appendix I (15% WDV) and the D20 UP MSME "
             "profile p.7; the 2025 Act's own table not checked")
TAX_LABEL = ("ASSUMED: owner's choice, source Finance Bill 2026 memo p.7 (slabs, tax year 2026-27); "
             "rebate as confirmed for FY 2025-26, not re-checked under the Income-tax Act 2025")
# new regime, tax year 2026-27 (Finance Bill 2026 memo p.7): upper limit of each band and its rate
SLABS = [(400000, 0.0), (800000, 0.05), (1200000, 0.10), (1600000, 0.15), (2000000, 0.20), (2400000, 0.25),
         (float("inf"), 0.30)]
REBATE_LIMIT, REBATE_MAX, CESS = 1200000, 60000, 0.04
RELIEF_NOTE = ("marginal relief applied: tax capped at the income above ₹12 lakh (incometaxindia.gov.in "
               "rebate FAQ, read in search excerpts only)")
SPLIT_TAG = "CALCULATED with an ASSUMED fixed/variable split (owner's choice)"

CALC = "CALCULATED"
REPEAT3 = "assumed: same as Year 3"
ONE_MONTH = "assumed from one normal month"
SAME_YEAR = "assumed: same full-capacity year"
BASIS = ("Years 1-5 at 15%, each year discounted at its end; capital cost in Year 1, nothing left at the "
         "end of Year 5 (ASSUMED: owner's choice)")
IRR_BASIS = ("from the net benefit of Years 1-5; capital cost in Year 1, nothing left at the end of Year 5 "
             "(ASSUMED: owner's choice); without subsidy")

_dossier_lines = dfig._lines           # replaced in a test to prove a changed line is caught


# --------------------------------------------------------------------------- loading

def _figs(node):
    if isinstance(node, dict):
        if "as_written" in node and "line" in node:
            yield node
        for v in node.values():
            yield from _figs(v)
    elif isinstance(node, list):
        for v in node:
            yield from _figs(v)


@lru_cache(maxsize=None)
def load(code):
    """The data file for one business, every dossier figure checked against its line."""
    data = json.loads((DATA / f"{code}.json").read_text(encoding="utf8"))
    lines = _dossier_lines(code) if data["kind"] != "government_profile" else None
    for f in _figs(data):
        if lines is None:
            continue
        n = f["line"]
        if n > len(lines) or f["as_written"] not in lines[n - 1]:
            raise dfig.DossierMismatch(f"{code} line {n} does not contain {f['as_written']!r}")
    return data


def has_data(code):
    return (DATA / f"{code}.json").exists()


# --------------------------------------------------------------------------- the rules

def tax(profit):
    """Income tax on a year's profit, as the person's only income (owner's rule)."""
    if profit <= 0:
        return {"value": 0, "tag": TAX_LABEL}
    t, lower = 0.0, 0
    for upper, rate in SLABS:
        if profit > lower:
            t += (min(profit, upper) - lower) * rate
        lower = upper
    note = None
    if profit <= REBATE_LIMIT:
        t = max(0.0, t - REBATE_MAX)
    elif t > profit - REBATE_LIMIT:
        t, note = profit - REBATE_LIMIT, RELIEF_NOTE
    c = {"value": round(t * (1 + CESS)), "tag": TAX_LABEL}
    if note:
        c["note"] = note
    return c


def wdv(base, years=YEARS, rate=DEP_RATE):
    """Depreciation on the value left each year (written-down value)."""
    out, left = [], float(base)
    for _ in range(years):
        d = round(left * rate, 2)
        left -= d
        out.append({"value": d, "tag": DEP_LABEL})
    return out


def present_worth(flows, rate=DISCOUNT):
    """Year 1 is discounted one full year (each year at its end)."""
    return sum(f / (1 + rate) ** t for t, f in enumerate(flows, start=1))


def benefit_cost_ratio(benefits, costs, rate=DISCOUNT):
    pc = present_worth(costs, rate)
    return None if pc == 0 else present_worth(benefits, rate) / pc


def irr(flows):
    """The rate at which the yearly amounts are worth nothing today; None if never defined."""
    if not (any(f < 0 for f in flows) and any(f > 0 for f in flows)):
        return None
    npv = lambda r: sum(f / (1 + r) ** t for t, f in enumerate(flows))
    lo, hi = -0.99, 100.0
    if npv(lo) * npv(hi) > 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        if npv(lo) * npv(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


def payback(flows):
    """Years until the running total of the yearly amounts turns positive; None if not within the years."""
    cum = 0.0
    for t, f in enumerate(flows, start=1):
        if cum + f >= 0:
            return (t - 1) + (-cum / f if f else 0)
        cum += f
    return None


def loan_years(amount, rate_pct, moratorium_quarters=0, repayment_quarters=0, schedule="quarterly",
               years=YEARS, moratorium_periods=None, repayment_periods=None):
    """Yearly payment, interest and principal of a loan: interest only during the pause, then equal
    instalments (the same pattern the dossiers' printed payments follow)."""
    per_year = 12 if schedule == "monthly" else 4
    m = moratorium_periods if moratorium_periods is not None else moratorium_quarters
    n = repayment_periods if repayment_periods is not None else repayment_quarters
    i = rate_pct / 100 / per_year
    emi = amount * i / (1 - (1 + i) ** -n) if n else 0
    bal, out = float(amount), []
    for y in range(years):
        pay = intr = 0.0
        for k in range(y * per_year + 1, (y + 1) * per_year + 1):
            if bal <= 1e-9:
                continue
            it = bal * i
            if k <= m:
                p = it
            else:
                p = min(emi, bal + it)
                bal -= p - it
            pay += p
            intr += it
        out.append({"payment": pay, "interest": intr, "principal": pay - intr})
    return out


# --------------------------------------------------------------------------- building the table

def _cell(value, tag, note=None):
    c = {"value": value, "tag": tag}
    if note:
        c["note"] = note
    return c


def _gap(reason, tag="NOT FOUND"):
    return {"value": None, "reason": reason, "tag": tag}


def _rep(cell, n=YEARS):
    """n separate copies of one cell (each year its own object)."""
    return [dict(cell) for _ in range(n)]


def _source_tag(code, fig):
    if "page" in fig:
        return f"UP MSME project profile p.{fig['page']}"
    return f"{code} dossier"


def _finish(code, size, rows, capital, break_even, avg_dscr, no_turnover=False, extra_summary=None):
    """Cost and benefit rows, tax, and the summary, shared by every kind of business."""
    gross = [c["value"] for c in rows["gross_benefit"]]
    surplus = [c["value"] for c in rows["surplus_before_loan"]]
    rows["recurring_cost"] = [_cell(g - s, CALC, "gross benefit minus the surplus before loan payments")
                              for g, s in zip(gross, surplus)]
    if capital is None or capital.get("value") is None:
        reason = (capital or {}).get("reason", "project cost not printed")
        rows["capital_cost"] = [_gap(reason)] + _rep(_cell(0, "ASSUMED: all capital cost in Year 1"), YEARS - 1)
    else:
        rows["capital_cost"] = [capital] + _rep(_cell(0, "ASSUMED: all capital cost in Year 1"), YEARS - 1)
    total, net = [], []
    for t in range(YEARS):
        cap = rows["capital_cost"][t]["value"]
        if cap is None:
            total.append(_gap("capital cost not known"))
            net.append(_gap("capital cost not known"))
        else:
            tc = rows["recurring_cost"][t]["value"] + cap
            total.append(_cell(tc, CALC, "recurring cost + capital cost"))
            net.append(_cell(gross[t] - tc, CALC, "gross benefit - total cost"))
    rows["total_cost"], rows["net_benefit"] = total, net
    rows["turnover"] = (_rep(_gap("not in research file")) if no_turnover
                        else [dict(c) for c in rows["gross_benefit"]])

    summary = {}
    if any(c["value"] is None for c in total):
        why = rows["capital_cost"][0]["reason"]
        for k in ("pw_benefits", "pw_costs", "npw", "bcr", "irr", "payback"):
            summary[k] = _gap(why)
    else:
        costs = [c["value"] for c in total]
        flows = [c["value"] for c in net]
        pwb, pwc = present_worth(gross), present_worth(costs)
        summary["pw_benefits"] = _cell(pwb, CALC, BASIS)
        summary["pw_costs"] = _cell(pwc, CALC, BASIS)
        summary["npw"] = _cell(pwb - pwc, CALC, BASIS)
        summary["bcr"] = _cell(benefit_cost_ratio(gross, costs), CALC, BASIS)
        r = irr(flows)
        summary["irr"] = (_cell(r, CALC, IRR_BASIS) if r is not None
                          else _gap("not defined: the yearly amounts never change sign", CALC))
        if flows[0] >= 0:          # Year 1's surplus already covers the capital cost
            p = rows["capital_cost"][0]["value"] / surplus[0]
            summary["payback"] = _cell(p, CALC, "within Year 1: capital cost / Year 1 surplus before loan payments")
        else:
            p = payback(flows)
            summary["payback"] = (_cell(p, CALC, "years until the running net benefit turns positive")
                                  if p is not None else _gap("not paid back within 5 years", CALC))
    summary["avg_dscr"] = avg_dscr
    summary["break_even"] = break_even
    summary.update(extra_summary or {})
    order = ["turnover", "gross_benefit", "recurring_cost", "capital_cost", "total_cost", "net_benefit",
             "surplus_before_loan", "interest", "depreciation", "profit_before_tax", "tax",
             "profit_after_tax", "debt_service", "dscr"]
    return {"code": code, "status": "ok", "size": size, "years": list(range(1, YEARS + 1)),
            "rows": {k: rows[k] for k in order}, "summary": summary,
            "gap_years": GAP_YEARS, "subsidy_note": SUBSIDY_NOTE}


def _tax_rows(rows):
    pbt = [c["value"] for c in rows["profit_before_tax"]]
    taxes = []
    for t, p in enumerate(pbt):
        c = tax(p)
        notes = []
        if p <= 0:
            notes.append("loss year: nil tax, no loss carried forward (ASSUMED: owner's choice)")
        if t > 0:
            notes.append("2026-27 slabs assumed unchanged")
        if notes:
            c["note"] = "; ".join(notes)
        taxes.append(c)
    rows["tax"] = taxes
    rows["profit_after_tax"] = [_cell(p - x["value"], CALC, "profit before tax - tax") for p, x in zip(pbt, taxes)]


def _pick(sizes, project_cost):
    exact = [s for s in sizes if s["capex_total"]["value"] == project_cost]
    if exact:
        return exact[0], True
    return min(sizes, key=lambda s: abs(s["capex_total"]["value"] - project_cost)), False


def _depreciation(size):
    base = sum(c["value"] for c in size["capex_lines"] if c["counted"])
    dep = wdv(base)
    for c in dep:
        c["note"] = f"15% a year on the value left of ₹{base:,.0f} of machinery, vehicles and tools"
    return dep


CAPEX_TAG = ("ASSUMED: owner's choice (decision 8): machinery, vehicles and tools are depreciated at 15%; "
             "each line's group is our reading of the dossier's description")


def _capex(size):
    return [{"item": c["item"], "value": c["value"], "group": c["group"], "counted": c["counted"]}
            for c in size["capex_lines"]]


def _loan(size):
    ln = size["loan"]
    return loan_years(ln["amount"]["value"], ln["rate_pct"]["value"], schedule=ln["schedule"],
                      moratorium_periods=ln["moratorium_periods"], repayment_periods=ln["repayment_periods"])


def _three_years(code, data, project_cost):
    size, exact = _pick(data["sizes"], project_cost)
    tag = f"{code} dossier"
    gm_note = data.get("note") if "gross margin" in data.get("note", "") else None
    ys = [size["years"][str(y)] for y in (1, 2, 3)]
    sched = _loan(size)
    rows = {"gross_benefit": [], "surplus_before_loan": [], "debt_service": [], "dscr": []}
    for t in range(YEARS):
        src = ys[min(t, 2)]
        rep = t >= 3
        rows["gross_benefit"].append(_cell(src["benefit"]["value"], REPEAT3 if rep else tag, gm_note))
        rows["surplus_before_loan"].append(_cell(src["surplus"]["value"], REPEAT3 if rep else tag))
        if not rep:
            rows["debt_service"].append(_cell(src["debt"]["value"], tag))
            d = src["dscr"]
            rows["dscr"].append(_cell(d["value"], tag) if d else
                                _gap("not printed in the dossier (Year 1 is a loss)"))
        else:
            pay = sched[t]["payment"]
            rows["debt_service"].append(_cell(round(pay, 2), CALC, "from the dossier's own loan terms"))
            s = rows["surplus_before_loan"][t]["value"]
            rows["dscr"].append(_cell(s / pay, CALC, "surplus before loan payments / debt service")
                                if pay > 0 else _gap("no loan payment this year: the loan is repaid", CALC))
    rows["interest"] = [_cell(round(p["interest"], 2), CALC, "split from the dossier's own loan (rate and terms)")
                        for p in sched]
    rows["depreciation"] = _depreciation(size)
    rows["profit_before_tax"] = [
        _cell(s["value"] - i["value"] - d["value"], CALC, "surplus before loan - interest - depreciation")
        for s, i, d in zip(rows["surplus_before_loan"], rows["interest"], rows["depreciation"])]
    _tax_rows(rows)
    printed = [c["value"] for c in rows["dscr"][:3] if c["value"] is not None]
    avg = (_cell(sum(printed) / len(printed), CALC, f"average of the printed years ({len(printed)})")
           if printed else _gap("no DSCR printed"))
    be = size["break_even_pct"]
    s = {"label": size["label"], "capex_total": size["capex_total"]["value"],
         "basis": tag if exact else f"nearest researched size (ASSUMED), {tag}",
         "capex_lines": _capex(size), "capex_lines_tag": CAPEX_TAG}
    return _finish(code, s, rows, _cell(size["capex_total"]["value"], tag), _cell(be["value"], tag, "% of capacity, as printed"),
                   avg, no_turnover=data.get("no_turnover", False))


def _one_month(code, data, project_cost):
    size = data["sizes"][0]
    tag = f"{code} dossier"
    exact = size["capex_total"]["value"] == project_cost
    m = size["month"]
    sched = _loan(size)
    benefit = m["revenue"]["value"] * 12
    surplus = (m["net_surplus"]["value"] + m["bank_interest"]["value"]) * 12
    rows = {
        "gross_benefit": _rep(_cell(benefit, ONE_MONTH, m["revenue"].get("label"))),
        "surplus_before_loan": _rep(_cell(surplus, CALC + ": (the dossier's net monthly surplus + its printed monthly "
                                          "bank interest) x 12; " + ONE_MONTH)),
        "debt_service": [_cell(round(p["payment"], 2), CALC, "from the dossier's own loan and terms") for p in sched],
        "interest": [_cell(round(p["interest"], 2), CALC, "worked out from the dossier's own loan terms") for p in sched],
    }
    rows["dscr"] = [_cell(surplus / p["payment"], CALC, "surplus before loan payments / debt service")
                    if p["payment"] > 0 else _gap("no loan payment this year", CALC) for p in sched]
    rows["depreciation"] = _depreciation(size)
    rows["profit_before_tax"] = [
        _cell(surplus - i["value"] - d["value"], CALC, "surplus before loan - interest - depreciation")
        for i, d in zip(rows["interest"], rows["depreciation"])]
    _tax_rows(rows)
    ds = [c["value"] for c in rows["dscr"] if c["value"] is not None]
    avg = (_cell(sum(ds) / len(ds), CALC, f"average of the calculated Years 1-5 ({len(ds)} years with a loan payment)")
           if ds else _gap("no loan payment"))
    be = size["break_even_pct"]
    s = {"label": size["label"], "capex_total": size["capex_total"]["value"],
         "basis": tag if exact else f"nearest researched size (ASSUMED), {tag}",
         "capex_lines": _capex(size), "capex_lines_tag": CAPEX_TAG}
    return _finish(code, s, rows, _cell(size["capex_total"]["value"], tag), _cell(be["value"], tag, "% of capacity, as printed"),
                   avg, no_turnover=data.get("no_turnover", False))


def _row(code, figs, repeat_tag=None):
    if len(figs) == 1:
        return [_cell(figs[0]["value"], _source_tag(code, figs[0]))] + \
               _rep(_cell(figs[0]["value"], repeat_tag), YEARS - 1)
    return [_cell(f["value"], _source_tag(code, f)) for f in figs[:YEARS]]


def _government(code, data):
    r = data["rows"]
    one_year = len(r["gross_sale"]) == 1
    rows = {"gross_benefit": _row(code, r["gross_sale"], SAME_YEAR),
            "profit_before_tax": _row(code, r["net_profit"], SAME_YEAR)}
    if one_year:                                   # D20
        dep = r["depreciation_plant"][0]["value"] + r["depreciation_furniture"][0]["value"]
        rows["depreciation"] = [_cell(dep, CALC, "sum of the printed depreciation lines (p.7)")] + \
            _rep(_cell(dep, SAME_YEAR, "sum of the printed depreciation lines (p.7)"), YEARS - 1)
        rows["interest"] = _row(code, r["finance_cost"], SAME_YEAR)
    else:
        rows["depreciation"] = _row(code, r["depreciation"])
        if "interest_term_loan" in r:
            rows["interest"] = [_cell(a["value"] + b["value"], CALC, "sum of the printed interest lines")
                                for a, b in zip(r["interest_term_loan"], r["interest_working_capital"])]
        else:
            rows["interest"] = _rep(_cell(0, CALC, "the profile has no loan and prints no interest: taken as nil"))
    rows["surplus_before_loan"] = [
        _cell(p["value"] + i["value"] + d["value"], CALC, "printed net profit + interest + depreciation")
        for p, i, d in zip(rows["profit_before_tax"], rows["interest"], rows["depreciation"])]
    if "tax" in r:
        rows["tax"] = _row(code, r["tax"])
        rows["profit_after_tax"] = _row(code, r["profit_after_tax"])
    else:                                          # D20: owner's slabs rule on the printed profit (decision 22)
        _tax_rows(rows)

    repay = data["rows"].get("repayment")
    if data.get("debt_service_printed"):           # D19 prints its own debt service (p.13)
        rows["debt_service"] = _row(code, data["debt_service_printed"])
        rows["dscr"] = _row(code, data["dscr_printed"])
    elif repay:
        tl = r["interest_term_loan"]
        rows["debt_service"] = [_cell(a["value"] + b["value"], CALC, "printed term-loan interest + repayment")
                                for a, b in zip(tl, repay)]
        if data.get("dscr_printed"):
            rows["dscr"] = _row(code, data["dscr_printed"])
        else:
            rows["dscr"] = []
            for t in range(YEARS):
                num = rows["profit_after_tax"][t]["value"] + rows["depreciation"][t]["value"] + tl[t]["value"]
                den = rows["debt_service"][t]["value"]
                rows["dscr"].append(_cell(num / den, CALC, "(profit after tax + depreciation + term-loan interest) "
                                          "/ (term-loan interest + repayment)") if den else _gap("no loan payment", CALC))
    else:
        why = data.get("repayment_reason") or data.get("loan_reason") or "no loan printed"
        rows["debt_service"] = _rep(_gap(why))
        rows["dscr"] = _rep(_gap(why))

    if data.get("avg_dscr_printed"):
        avg = _cell(data["avg_dscr_printed"]["value"], _source_tag(code, data["avg_dscr_printed"]))
    elif all(c["value"] is not None for c in rows["dscr"]):
        avg = _cell(sum(c["value"] for c in rows["dscr"]) / YEARS, CALC,
                    "average of the 5 yearly DSCRs, calculated from the printed rows")
    else:
        avg = _gap(rows["dscr"][0].get("reason", "no DSCR"))
    be = data.get("break_even_pct")
    sp = data.get("break_even_split")
    if be:
        be = _cell(be["value"], _source_tag(code, be))
    elif sp:
        fixed = sum(x["fig"]["value"] for x in sp["fixed"])
        variable = sum(x["fig"]["value"] for x in sp["variable"])
        if sp.get("stock_build_up"):                # Year 1 stock build-up taken out, as the profile's profit does
            variable -= sp["stock_build_up"]["value"]
        note = (f"fixed costs ÷ (sales − variable costs net of Year 1 stock build-up), Year 1, as % of that "
                f"year's sales; {sp['tag']}"
                + (f"; {sp['note']}" if sp.get("note") else ""))
        be = _cell(fixed / (sp["sales"]["value"] - variable) * 100, SPLIT_TAG, note)
    else:
        be = _gap(data.get("break_even_reason", "not printed"))
    cap = data.get("capital_cost")
    capital = (_cell(cap["value"], _source_tag(code, cap), cap.get("note")) if cap
               else {"value": None, "reason": data.get("capital_cost_reason")})
    tl = data.get("term_loan")
    label = (f"reference unit, term loan ₹{tl['as_written']} lakh" if code == "D16"
             else f"reference unit: {data['title']}")
    size = {"label": label, "basis": "reference unit, UP MSME project profile (never rescaled)",
            "capex_total": cap["value"] if cap else None}
    extra = {}
    if data.get("payback_printed"):
        pb = data["payback_printed"]
        extra["payback_printed"] = _cell(pb["value"], _source_tag(code, pb), "years, as printed in the profile")
    return _finish(code, size, rows, capital, be, avg, extra_summary=extra)


def years(code, project_cost):
    """Years 1-5 for one business at the applicant's project cost (rupees)."""
    if code not in dfig.NAMES:
        raise KeyError(code)
    if not has_data(code):
        return {"code": code, "status": "to_be_filled", "message": TO_BE_FILLED}
    data = load(code)
    if data["kind"] == "three_years":
        return _three_years(code, data, project_cost)
    if data["kind"] == "one_month":
        return _one_month(code, data, project_cost)
    return _government(code, data)
