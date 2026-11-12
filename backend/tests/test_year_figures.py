"""
Stage 1a (Phase 1, DPR): year-by-year figures for every business, checked against the research files,
and the calculations the DPR needs (owner's decisions 1-28, 12 Nov 2026).

- Every dossier figure in data/year_figures/Dxx.json must be on its dossier line, as written.
- Every government-profile figure must be on its PDF page (read with pypdf), with its row label.
- The fill rules, the tax and depreciation rules and the calculations are checked against hand-worked cases.
"""

import json
import re
import subprocess
from pathlib import Path

import pytest

from backend import dossier_figures as dfig
from backend import year_figures as yf

REPO = Path(__file__).resolve().parents[2]
DATA = REPO / "data" / "year_figures"
SOURCES = REPO / "research_dossiers" / "sources"
CODES = [f"D{n:02d}" for n in range(1, 25)]
NO_FIGURES = ["D15", "D17", "D18"]          # decision 26: no data file
WITH_DATA = [c for c in CODES if c not in NO_FIGURES]

DEP_LABEL = ("ASSUMED: owner's choice, source Income-tax New Appendix I (15% WDV) and the D20 UP MSME "
             "profile p.7; the 2025 Act's own table not checked")
TAX_LABEL = ("ASSUMED: owner's choice, source Finance Bill 2026 memo p.7 (slabs, tax year 2026-27); "
             "rebate as confirmed for FY 2025-26, not re-checked under the Income-tax Act 2025")


def lakh(x):
    return round(x * 100000)


def read_number(text):
    """'₹1,32,000' -> 132000; '-₹34,975' -> -34975; '2.29' -> 2.29; '43.21%' -> 43.21; '-' -> 0."""
    t = text.replace("₹", "").replace(",", "").replace("%", "").strip()
    if t == "-":
        return 0          # government profiles print "-" for nil
    neg = t.startswith("-") or (t.startswith("(") and t.endswith(")"))
    t = t.strip("-()").strip()
    v = float(t)
    return -v if neg else v


def figures(node, out=None):
    """Every dict in a data file that holds an as-written source figure."""
    out = [] if out is None else out
    if isinstance(node, dict):
        if "as_written" in node and ("line" in node or "page" in node):
            out.append(node)
        for v in node.values():
            figures(v, out)
    elif isinstance(node, list):
        for v in node:
            figures(v, out)
    return out


_PDF_TEXT = {}


def pdf_page(file, page):
    from pypdf import PdfReader
    if file not in _PDF_TEXT:
        _PDF_TEXT[file] = [p.extract_text() or "" for p in PdfReader(str(SOURCES / file)).pages]
    return " ".join(_PDF_TEXT[file][page - 1].split())


# --------------------------------------------------------------------------- the data files

def test_one_file_per_business_with_figures():
    have = sorted(p.stem for p in DATA.glob("D*.json"))
    assert have == WITH_DATA


@pytest.mark.parametrize("code", WITH_DATA)
def test_every_figure_is_on_its_source_line_or_page(code):
    data = json.loads((DATA / f"{code}.json").read_text(encoding="utf8"))
    lines = dfig._lines(code)
    figs = figures(data)
    assert figs, f"{code}: no figures"
    for f in figs:
        if "line" in f:
            line = lines[f["line"] - 1]
            assert f["as_written"] in line, f"{code} line {f['line']} lacks {f['as_written']!r}"
        else:
            text = pdf_page(f["file"], f["page"])
            want = " ".join((f["row"] + " " + " ".join(f["values_as_written"])).split())
            assert want in text, f"{code} {f['file']} p.{f['page']} lacks {want!r}"
            assert f["as_written"] in f["values_as_written"]
        if f.get("value") is not None and f.get("unit") != "text":
            v = read_number(f["as_written"])
            if f.get("written_in") == "lakh":
                v = lakh(v)
            assert f["value"] == pytest.approx(v), f"{code} {f}"


@pytest.mark.parametrize("code", WITH_DATA)
def test_every_capex_line_has_a_depreciation_group(code):
    data = json.loads((DATA / f"{code}.json").read_text(encoding="utf8"))
    for size in data.get("sizes", []):
        for item in size.get("capex_lines", []):
            assert item["group"] in yf.ALL_GROUPS, item
            assert item["counted"] == (item["group"] in yf.COUNTED_GROUPS)


def test_a_changed_dossier_line_is_caught(monkeypatch):
    real = dfig._lines("D01")
    fake = list(real)
    fig = next(f for f in figures(json.loads((DATA / "D01.json").read_text(encoding="utf8"))) if "line" in f)
    fake[fig["line"] - 1] = "this line was changed"
    monkeypatch.setattr(yf, "_dossier_lines", lambda code: fake if code == "D01" else real)
    yf.load.cache_clear()
    try:
        with pytest.raises(dfig.DossierMismatch):
            yf.load("D01")
    finally:
        yf.load.cache_clear()


# --------------------------------------------------------------------------- the rules

@pytest.mark.parametrize("profit, tax", [
    (-34975, 0),          # loss year: nil, no carry-forward (decision 24)
    (300000, 0),          # under 4 lakh: nil slab
    (1100000, 0),         # slab tax 50,000, rebate takes it to nil
    (1200000, 0),         # the rebate edge: slab tax 60,000, rebate 60,000
    (1300000, 78000),     # 20,000 + 40,000 + 15,000 = 75,000, no rebate, + 4% cess
    # D20's printed profit, ₹28.57 lakh: 20,000 + 40,000 + 60,000 + 80,000 + 1,00,000 + 30% of 4,57,000
    (2857000, round((20000 + 40000 + 60000 + 80000 + 100000 + 0.30 * 457000) * 1.04)),
])
def test_tax(profit, tax):
    assert yf.tax(profit)["value"] == tax
    assert yf.tax(profit)["tag"] == TAX_LABEL


def test_depreciation_written_down_value():
    rows = yf.wdv(100000, years=3)
    assert [r["value"] for r in rows] == [15000, 12750, 10837.5]
    assert all(r["tag"] == DEP_LABEL for r in rows)


def test_present_worth_irr_payback_bcr():
    # capital 100 in Year 1 (decision 13), each year discounted at its end (decision 27)
    flows = [-100, 60, 60]
    assert yf.present_worth(flows, 0.15) == pytest.approx(-100 / 1.15 + 60 / 1.15 ** 2 + 60 / 1.15 ** 3)
    assert yf.irr(flows) == pytest.approx(0.1307, abs=1e-4)
    assert yf.irr([10, 20]) is None                      # never changes sign: not defined
    assert yf.payback(flows) == pytest.approx(2 + 40 / 60)
    assert yf.payback([-100, 10, 10]) is None
    benefits, costs = [0, 80, 80], [100, 20, 20]
    assert yf.benefit_cost_ratio(benefits, costs, 0.15) == pytest.approx(
        yf.present_worth(benefits, 0.15) / yf.present_worth(costs, 0.15))


def test_loan_schedule_matches_the_dossiers_printed_payments():
    # D01 Model A: ₹1,25,000 @ 6.5%, 3-month pause, 11 quarters; printed 39,535.27 / 50,005.36 / 50,005.36
    pay = yf.loan_years(125000, 6.5, moratorium_quarters=1, repayment_quarters=11)
    assert [round(p["payment"], 2) for p in pay[:3]] == pytest.approx([39535.27, 50005.36, 50005.36], abs=2)
    assert pay[3]["payment"] == 0 and pay[4]["payment"] == 0          # repaid by Month 36 (decision 18)
    # D01 Model B: ₹3,15,000 @ 8%, 6-month pause, 26 quarters; printed 43,910.52 / 62,621.03
    pay = yf.loan_years(315000, 8.0, moratorium_quarters=2, repayment_quarters=26)
    assert [p["payment"] for p in pay[:2]] == pytest.approx([43910.52, 62621.03], rel=1e-3)
    assert pay[4]["payment"] > 0
    assert all(p["interest"] + p["principal"] == pytest.approx(p["payment"]) for p in pay)


# --------------------------------------------------------------------------- the year tables

ROWS = ["gross_benefit", "recurring_cost", "capital_cost", "total_cost", "net_benefit", "surplus_before_loan",
        "interest", "depreciation", "profit_before_tax", "tax", "profit_after_tax", "debt_service", "dscr"]


def cells(t):
    for name, row in t["rows"].items():
        for c in row:
            yield name, c


@pytest.mark.parametrize("code", CODES)
@pytest.mark.parametrize("pick", [0, 1, -1])
def test_every_cell_is_tagged_and_five_years_long(code, pick):
    costs = [140000, 850000, 5000000]
    t = yf.years(code, costs[pick])
    if code in NO_FIGURES:
        assert t["status"] == "to_be_filled" and t["message"] == "to be filled with the bank"
        return
    assert t["status"] == "ok"
    assert t["gap_years"] == [6, 7, 8] and "reason" not in t     # decision 1: gap, no reason printed
    assert t["subsidy_note"] == "no subsidy in this NSFDC calculation"
    for name, row in t["rows"].items():
        assert len(row) == 5, name
    for name, c in cells(t):
        assert c.get("tag"), (code, name, c)
        assert c.get("value") is not None or c.get("reason"), (code, name, c)
    for k, c in t["summary"].items():
        assert c.get("tag") and (c.get("value") is not None or c.get("reason")), (code, k, c)


def test_d01_model_b_years():
    t = yf.years("D01", 350000)
    assert t["size"]["label"].startswith("Model B")
    g = t["rows"]["gross_benefit"]
    assert [c["value"] for c in g] == [2646000, 3024000, 3360000, 3360000, 3360000]
    assert g[0]["tag"] == "D01 dossier" and g[3]["tag"] == "assumed: same as Year 3"
    assert t["rows"]["capital_cost"][0]["value"] == 350000 and t["rows"]["capital_cost"][1]["value"] == 0
    assert [c["value"] for c in t["rows"]["dscr"][:3]] == [2.84, 2.76, 3.45]
    assert t["summary"]["avg_dscr"]["value"] == pytest.approx((2.84 + 2.76 + 3.45) / 3)
    assert t["summary"]["break_even"]["value"] == 49.54
    assert t["rows"]["depreciation"][0]["tag"] == DEP_LABEL
    assert t["rows"]["tax"][0]["tag"] == TAX_LABEL


def test_d01_small_size_loan_ends_in_year_3():
    t = yf.years("D01", 140000)
    assert [c["value"] for c in t["rows"]["debt_service"][3:]] == [0, 0]


def test_d11_model_a_uses_the_careful_versions():
    t = yf.years("D11", 140000)
    assert t["rows"]["dscr"][1]["value"] == 1.22          # cash alone (decision 4)
    assert t["rows"]["dscr"][2]["value"] == 1.59          # bought feed
    assert t["rows"]["recurring_cost"][2]["value"] == 83000


def test_d24_large_size_is_c1():
    t = yf.years("D24", 1500000)
    assert t["rows"]["gross_benefit"][0]["value"] == 780000
    assert t["rows"]["dscr"][0]["value"] == 0.95


def test_d04_normal_month_times_twelve_and_small_applicant_gets_term_size():
    t = yf.years("D04", 140000)
    assert "nearest researched size (ASSUMED)" in t["size"]["basis"]
    g = t["rows"]["gross_benefit"]
    assert all(c["value"] == 450000 * 12 for c in g)
    assert all(c["tag"] == "assumed from one normal month" for c in g)
    # surplus before loan = (net monthly surplus + printed monthly interest) x 12 (decision 9)
    s = t["rows"]["surplus_before_loan"][0]
    assert s["value"] == (8580 + 6000) * 12 and s["tag"].startswith("CALCULATED")
    assert t["summary"]["break_even"]["value"] == 35.6


def test_d03_benefit_is_gross_margin():
    t = yf.years("D03", 140000)
    assert t["rows"]["gross_benefit"][0]["value"] == 273110
    assert "gross margin" in t["rows"]["gross_benefit"][0]["note"]


def test_d19_reference_unit_printed_figures():
    t = yf.years("D19", 140000)
    assert "reference unit" in t["size"]["basis"]
    assert [c["value"] for c in t["rows"]["gross_benefit"]] == [lakh(x) for x in [78.30, 96.87, 114.10, 132.27, 151.44]]
    assert [c["value"] for c in t["rows"]["dscr"]] == [2.77, 2.42, 3.06, 3.86, 5.03]
    assert t["summary"]["avg_dscr"]["value"] == 3.38
    assert [c["value"] for c in t["rows"]["tax"]] == [0, 0, lakh(0.15), lakh(0.48), lakh(0.89)]
    assert "p.9" in t["rows"]["tax"][2]["tag"]
    assert t["summary"]["break_even"]["value"] == 29


def test_d20_one_year_repeated_and_tax_by_the_owners_rule():
    t = yf.years("D20", 140000)
    g = t["rows"]["gross_benefit"]
    assert all(c["value"] == lakh(266.63) for c in g)
    assert g[1]["tag"] == "assumed: same full-capacity year"
    assert t["rows"]["profit_before_tax"][0]["value"] == lakh(28.57)
    assert t["rows"]["tax"][0]["value"] == yf.tax(lakh(28.57))["value"]
    assert t["rows"]["tax"][0]["tag"] == TAX_LABEL


def test_d21_pottery_has_no_loan_so_dscr_is_a_gap():
    t = yf.years("D21", 140000)
    assert all(c["value"] is None and c["reason"] for c in t["rows"]["dscr"])
    assert t["rows"]["gross_benefit"][0]["value"] == lakh(9.24)


def test_d16_reference_unit_claims_no_size():
    t = yf.years("D16", 140000)
    assert "term loan ₹5.23 lakh" in t["size"]["label"]


def test_nothing_in_research_dossiers_changed():
    out = subprocess.run(["git", "status", "--porcelain", "research_dossiers"], cwd=REPO,
                         capture_output=True, text=True).stdout
    assert out == ""


# --------------------------------------------------------------------------- review findings, owner's rulings (12 Nov 2026)

TOKEN = re.compile(r"-?₹?\d[\d,]*(?:\.\d+)?%?")


def check_position(code, f, lines):
    """The figure is in its own column: the n-th number on its line, or the n-th value of its PDF row."""
    if "line" in f:
        if f.get("unit") == "text":
            return
        toks = TOKEN.findall(lines[f["line"] - 1])
        assert toks[f["position"]] == f["as_written"], (code, f["line"], f["as_written"], f["position"], toks)
    else:
        assert f["values_as_written"][f["index"]] == f["as_written"], (code, f)


@pytest.mark.parametrize("code", WITH_DATA)
def test_every_figure_is_in_its_own_column(code):
    data = json.loads((DATA / f"{code}.json").read_text(encoding="utf8"))
    lines = dfig._lines(code)
    for f in figures(data):
        check_position(code, f, lines)


def test_a_swapped_year_is_caught():
    data = json.loads((DATA / "D14.json").read_text(encoding="utf8"))
    lines = dfig._lines("D14")
    y = data["sizes"][0]["years"]
    a, b = y["1"]["benefit"], y["2"]["benefit"]                 # same line (D14 L353), Years 1 and 2
    a["as_written"], b["as_written"] = b["as_written"], a["as_written"]
    with pytest.raises(AssertionError):
        check_position("D14", a, lines)


def test_payback_when_year_1_already_pays_back():
    t = yf.years("D07", 850000)
    p = t["summary"]["payback"]
    assert p["value"] == pytest.approx(850000 / ((119550 + 5100) * 12))
    assert p["value"] > 0


def test_one_month_average_dscr_is_years_1_to_5():
    t = yf.years("D04", 1000000)
    d = [c["value"] for c in t["rows"]["dscr"]]
    assert t["summary"]["avg_dscr"]["value"] == pytest.approx(sum(d) / 5)


# Year 1 stock build-up (printed closing stock; opening stock is nil in Year 1) is taken out of the
# variable costs, as the profiles' own profit does (owner's ruling, 12 Nov 2026).
@pytest.mark.parametrize("code, fixed, variable, stock, sales", [
    ("D16", [1.58, 0.40, 0.45, 0.24, 0.59], [9.90, 0.43, 0, 3.43, 0.40], 1.78, 20.01),
    ("D21", [1.08, 0.28, 0.13], [6.05, 0.50, 0.51, 0.09], 0.61, 9.24),
    ("D22", [10.80, 3.30, 2.34, 3.00, 4.13], [69.58, 5.94, 0.29, 13.86, 1.10], 6.96, 110.16),
    ("D20", [8.40, 5.3525, 0.53, 0.05, 3.92], [217.75, 2.0777], 0, 266.63),
])
def test_break_even_with_the_owners_split(code, fixed, variable, stock, sales):
    be = yf.years(code, 0)["summary"]["break_even"]
    assert be["value"] == pytest.approx(sum(fixed) / (sales - (sum(variable) - stock)) * 100, abs=0.01)
    assert be["value"] < 100
    assert "ASSUMED fixed/variable split" in be["tag"]


@pytest.mark.parametrize("code, capital", [("D16", 5.31), ("D21", 1.00), ("D22", 30.48)])
def test_government_capital_cost_is_the_printed_fixed_assets(code, capital):
    t = yf.years(code, 0)
    c = t["rows"]["capital_cost"][0]
    assert c["value"] == lakh(capital) and "working capital not included" in c["note"]
    assert t["summary"]["npw"]["value"] is not None


def test_turnover_row():
    for code in ("D03", "D07"):
        row = yf.years(code, 850000)["rows"]["turnover"]
        assert all(c["value"] is None and c["reason"] == "not in research file" for c in row)
    t = yf.years("D01", 350000)
    assert [c["value"] for c in t["rows"]["turnover"]] == [c["value"] for c in t["rows"]["gross_benefit"]]


def test_small_fixes():
    t = yf.years("D01", 350000)
    assert t["size"]["capex_lines_tag"].startswith("ASSUMED")
    assert {c["group"] for c in t["size"]["capex_lines"]} <= yf.ALL_GROUPS
    assert "15%" not in t["summary"]["irr"]["note"]
    assert t["rows"]["gross_benefit"][3] is not t["rows"]["gross_benefit"][4]
    assert "p.7" in yf.years("D21", 0)["rows"]["tax"][0]["tag"]
    assert "calculated" in yf.years("D16", 0)["summary"]["avg_dscr"]["note"]
    assert yf.years("D20", 0)["rows"]["depreciation"][1]["tag"] == "assumed: same full-capacity year"
    d19 = yf.years("D19", 0)
    assert [c["value"] for c in d19["rows"]["debt_service"]] == [lakh(x) for x in [1.56, 2.20, 2.03, 1.86, 1.68]]
    assert "p.13" in d19["rows"]["debt_service"][1]["tag"]
    assert d19["summary"]["payback_printed"]["value"] == 5 and "p.3" in d19["summary"]["payback_printed"]["tag"]


def test_marginal_relief_just_above_12_lakh():
    c = yf.tax(1210000)              # slab tax 61,500; capped at the 10,000 above ₹12 lakh; + 4% cess
    assert c["value"] == 10400
    assert "marginal relief" in c["note"]
    assert yf.tax(1300000)["value"] == 78000      # slab tax 75,000 < 1,00,000 above ₹12 lakh: no relief
