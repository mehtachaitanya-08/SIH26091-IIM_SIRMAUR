"""
Tests for backend/dossier_figures.py: headline figures for all 24 businesses, read from the
dossier .md files (research_dossiers/), which the team has decided are the data we use.

Every figure must be found, exactly as written, on the dossier line it cites, and carry that
line's own source tag (or say plainly that the line has none). Hand-checked expectations below
were read from the dossier files themselves (line numbers as of this commit).
"""

import json
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend import dossier_figures as dfig
from backend.app import app

client = TestClient(app)
REPO = Path(__file__).resolve().parents[2]
CODES = [f"D{i:02d}" for i in range(1, 25)]
PERSON_C = ["D15", "D16", "D17", "D18", "D19", "D20", "D21", "D22"]
MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November",
          "December", "January", "February", "March"]


def post(path, body):
    return client.post(path, content=json.dumps(body), headers={"content-type": "application/json"})


def line_of(code, n):
    path = next((REPO / "research_dossiers").glob(f"{code}_*_Dossier.md"))
    return path.read_text(encoding="utf8").split("\n")[n - 1]


def figures_in(f):
    """Every figure dict in a business's figures (anything with as_written and line)."""
    out = []
    def walk(x):
        if isinstance(x, dict):
            if "as_written" in x and "line" in x:
                out.append(x)
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(f)
    return out


# ---------------------------------------------------------------------------
# every figure is on its line, exactly as written, with that line's tag
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("code", CODES)
def test_every_figure_is_on_its_dossier_line(code):
    f = dfig.figures(code)
    assert f["code"] == code
    for x in figures_in(f):
        line = line_of(code, x["line"])
        assert x["as_written"] in line, (code, x)
        assert x["tag"] == f"{code} dossier", x  # the label shown to users (team's choice)
        tags = re.findall(r"\[S\d+[^\]]*\]", line)
        if x["source_tag"].startswith("["):
            assert x["source_tag"].split(" ")[0] in line, (code, x)
        else:
            assert x["source_tag"] == dfig.NO_TAG and not tags, (code, x)


@pytest.mark.parametrize("code", CODES)
def test_every_value_reads_exactly_from_as_written(code):
    for x in figures_in(dfig.figures(code)):
        digits = x["as_written"].replace("₹", "").replace(",", "").rstrip("x").strip()
        v = float(digits)
        if x.get("unit") == "INR lakh":
            v = round(v * 100000)
        assert x["value"] == v, x


@pytest.mark.parametrize("code", CODES)
def test_season_is_12_months_april_first_or_not_found(code):
    s = dfig.figures(code)["seasonality"]
    if s.get("status") == "NOT FOUND":
        assert s["reason"]
        return
    assert [m["month"] for m in s["months"]] == MONTHS
    assert all(m["value"] > 0 for m in s["months"])


# ---------------------------------------------------------------------------
# hand-checked figures (read from the dossier files)
# ---------------------------------------------------------------------------

def test_d08_tiers_surplus_season():
    f = dfig.figures("D08")
    costs = [(t["project_cost"]["value"], t["project_cost"]["line"], t["project_cost"]["source_tag"]) for t in f["tiers"]]
    assert costs == [(140000, 62, "[S8]"), (850000, 88, "[S8]")]
    assert f["tiers"][0]["surplus"]["status"] == "NOT FOUND"
    s = f["tiers"][1]["surplus"]
    assert (s["value"], s["line"], s["source_tag"], s["period"]) == (79150, 148, "[S8]", "month")
    assert f["tiers"][1]["annual_surplus"]["value"] == 949800
    assert f["tiers"][1]["annual_surplus"]["tag"].startswith("CALCULATED")
    assert [m["value"] for m in f["seasonality"]["months"]] == \
        [1.35, 1.30, 1.05, 0.80, 0.75, 0.80, 1.15, 1.25, 1.20, 1.00, 0.70, 0.65]
    assert {m["line"] for m in f["seasonality"]["months"]} == {179}


def test_d01_three_tiers_and_year3_surplus():
    f = dfig.figures("D01")
    assert [t["project_cost"]["value"] for t in f["tiers"]] == [140000, 350000, 850000]
    assert [t["project_cost"]["line"] for t in f["tiers"]] == [96, 122, 148]
    assert f["tiers"][0]["project_cost"]["source_tag"] == "[S1, S3]"
    assert f["tiers"][0]["project_cost"]["tag"] == "D01 dossier"
    assert [(t["surplus"]["value"], t["surplus"]["line"], t["surplus"]["period"]) for t in f["tiers"]] == \
        [(132000, 359, "year"), (216000, 388, "year"), (564000, 417, "year")]
    assert [m["value"] for m in f["seasonality"]["months"]] == \
        [1.10, 1.20, 1.00, 0.85, 0.75, 0.85, 1.15, 1.30, 1.15, 1.05, 0.75, 0.85]


def test_d02_and_d14_surplus_lines():
    assert [(t["surplus"]["value"], t["surplus"]["line"]) for t in dfig.figures("D02")["tiers"]] == \
        [(354840, 339), (723984, 365), (1494000, 415)]
    f = dfig.figures("D14")
    assert [t["project_cost"]["value"] for t in f["tiers"]] == [140000, 1050000]
    assert [(t["surplus"]["value"], t["surplus"]["line"]) for t in f["tiers"]] == [(94400, 356), (343000, 371)]


def test_d20_person_c_layout():
    f = dfig.figures("D20")
    micro, term = f["tiers"]
    assert micro["project_cost"]["status"] == "NOT FOUND"
    assert (term["project_cost"]["value"], term["project_cost"]["line"], term["project_cost"]["unit"]) == (4384000, 140, "INR lakh")
    assert term["project_cost"]["source_tag"].startswith("[S5]")
    assert f["seasonality"]["status"] == "NOT FOUND"
    assert all(t["surplus"]["status"] == "NOT FOUND" for t in f["tiers"])


@pytest.mark.parametrize("code", [c for c in PERSON_C if c != "D20"])
def test_other_person_c_dossiers_print_no_total(code):
    f = dfig.figures(code)
    assert [t["project_cost"].get("status") for t in f["tiers"]] == ["NOT FOUND", "NOT FOUND"]
    assert f["seasonality"]["status"] == "NOT FOUND"


def test_tier_counts():
    expected = {c: 3 for c in ["D01", "D02", "D03", "D11", "D12", "D13", "D24"]}
    expected.update({c: 2 for c in ["D04", "D05", "D06", "D07", "D08", "D09", "D10", "D14", "D23"] + PERSON_C})
    assert {c: len(dfig.figures(c)["tiers"]) for c in CODES} == expected


def test_a_changed_dossier_line_is_caught(monkeypatch):
    real = dfig._lines
    def edited(code):
        lines = list(real(code))
        if code == "D08":
            lines[147] = lines[147].replace("₹79,150", "₹79,999")
        return lines
    monkeypatch.setattr(dfig, "_lines", edited)
    dfig.figures.cache_clear()
    try:
        with pytest.raises(dfig.DossierMismatch):
            dfig.figures("D08")
    finally:
        dfig.figures.cache_clear()


# ---------------------------------------------------------------------------
# cash-flow cover (DSCR): the dossier's own printed figures (team's choice)
# ---------------------------------------------------------------------------

def dscr_years(t):
    return [(y["value"], y["line"]) if y.get("value") is not None else None for y in t["dscr"]["years"]]


def test_printed_dscr_per_size():
    f = dfig.figures("D01")
    assert [dscr_years(t) for t in f["tiers"]] == [
        [(2.29, 344), (2.25, 352), (2.64, 361)], [(2.84, 373), (2.76, 381), (3.45, 390)],
        [(2.96, 402), (2.94, 410), (3.71, 419)]]
    # D24's biggest size: the first scenario (C1, standalone NSFDC Term Loan), not the subsidised C2
    assert dscr_years(dfig.figures("D24")["tiers"][2]) == [(0.95, 315), (1.27, 316), (1.88, 317)]
    # D14 prints its DSCR in a table
    assert [dscr_years(t) for t in dfig.figures("D14")["tiers"]] == [
        [(2.60, 360), (1.76, 360), (1.90, 360)], [(2.33, 375), (1.67, 375), (1.83, 375)]]
    # D12 has no Year 1 DSCR (no meat sold in year 1)
    assert dscr_years(dfig.figures("D12")["tiers"][0])[0] is None


@pytest.mark.parametrize("code", ["D04", "D05", "D06", "D07", "D08", "D09", "D10", "D23",
                                  "D15", "D16", "D17", "D18", "D19", "D20", "D21", "D22"])
def test_dossiers_without_a_printed_dscr(code):
    assert all(t["dscr"]["status"] == "NOT FOUND" for t in dfig.figures(code)["tiers"])


def test_cashflow_exact_size_gives_the_dossiers_dscr():
    d = post("/api/dossiers/D01/cashflow", {"projectCost": 350000, "familyIncome": 200000, "isSc": True}).json()
    assert d["status"] == "ok" and d["tierMatch"] == "exact"
    assert [y["value"] for y in d["dscr"]["years"]] == [2.84, 2.76, 3.45]
    assert all(y["tag"] == "D01 dossier" for y in d["dscr"]["years"])
    assert any("own loan instalment" in n["text"] for n in d["notes"])


def test_cashflow_nearest_size_is_assumed():
    d = post("/api/dossiers/D01/cashflow", {"projectCost": 700000, "familyIncome": 200000, "isSc": True}).json()
    assert d["tierMatch"] == "nearest" and d["tier"]["project_cost"]["value"] == 850000
    assert any(a["tag"] == "ASSUMED" and "nearest" in a["text"] for a in d["assumptions"])
    # exactly half-way (6,00,000 is 2,50,000 from both 3,50,000 and 8,50,000): the smaller size, said so
    d = post("/api/dossiers/D01/cashflow", {"projectCost": 600000, "familyIncome": 200000, "isSc": True}).json()
    assert d["tier"]["project_cost"]["value"] == 350000
    assert any("equally near" in a["text"] for a in d["assumptions"])


def test_cashflow_not_found():
    d = post("/api/dossiers/D08/cashflow", {"projectCost": 850000, "familyIncome": 200000, "isSc": True}).json()
    assert d["status"] == "NOT FOUND" and d["reason"]
    d = post("/api/dossiers/D16/cashflow", {"projectCost": 140000, "familyIncome": 200000, "isSc": True}).json()
    assert d["status"] == "NOT FOUND"


def test_cashflow_bad_input_and_unknown_code():
    assert post("/api/dossiers/D99/cashflow", {"projectCost": 1, "familyIncome": 1, "isSc": True}).status_code == 404
    r = post("/api/dossiers/D08/cashflow", {"projectCost": 0, "familyIncome": 1, "isSc": True})
    assert r.status_code == 400 and "error" in r.json()
