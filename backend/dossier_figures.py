"""
Headline figures for all 24 businesses, read from the dossier .md files in research_dossiers/.
The team has decided these dossiers are the data we use (not data/dossiers_db.json).

For each business:
- tiers: the dossier's sizes, each with its project cost and its yearly (or monthly) surplus
  before loan repayments, as the dossier writes it;
- seasonality: the dossier's 12 monthly multipliers, April first.

Every figure is {value, as_written, line, source_tag, tag}: the text exactly as written, the dossier
line it is on, that line's own source tag ("[S8]", "[S1, S3]", "[S5] p.5", or NO_TAG when the line has
none), and the label shown to users, which the team chose to be simply "<code> dossier" (e.g.
"D08 dossier"). Anything the dossier does not state is {"status": "NOT FOUND", "reason": ...}.
- dscr: the dossier's OWN printed Year 1/2/3 cash-flow cover for each size (team's choice: show the
  dossier's DSCR, not one worked out by the server). Only 8 dossiers print one; the rest are NOT FOUND.

How the figures are found:
- Tier costs and the season pattern: strict patterns for the dossiers' own table rows (see
  _tiers and _season). The patterns only accept a row if it is exactly in the expected form.
- Surplus: picked by hand (SURPLUS below: line number and the text as written), because the
  dossiers state it in different places and periods. Each pick is re-checked against its line
  on every load; a changed dossier raises DossierMismatch.

POST /api/dossiers/{code}/cashflow: picks the size for a project cost (same cost, or the nearest size,
labelled ASSUMED) and returns that size's dossier figures, including its printed DSCR.
"""

import re
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, Request
from pydantic import ValidationError

from backend.compat import NAMES, _body, _error, _is_sc, _validation_message, _whole_rupees
from backend.schemas import LoanRequest

router = APIRouter()

REPO = Path(__file__).resolve().parents[1]
DOSSIERS = REPO / "research_dossiers"
NO_TAG = "no source tag on this dossier line"
MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November",
          "December", "January", "February", "March"]
PERSON_C = {"D15", "D16", "D17", "D18", "D19", "D20", "D21", "D22"}

# Hand-picked surplus lines: code -> [(tier index, line, text as written, period)].
# year  = the dossier's Year 3 (stabilised) yearly surplus before loan repayments
# month = the dossier's "Net Monthly Surplus" (stated for its Term Loan size only)
SURPLUS = {
    "D01": [(0, 359, "₹1,32,000", "year"), (1, 388, "₹2,16,000", "year"), (2, 417, "₹5,64,000", "year")],
    "D02": [(0, 339, "₹3,54,840", "year"), (1, 365, "₹7,23,984", "year"), (2, 415, "₹14,94,000", "year")],
    "D03": [(0, 371, "₹3,44,880", "year"), (1, 393, "₹8,22,600", "year"), (2, 415, "₹16,30,800", "year")],
    "D11": [(0, 360, "₹79,600", "year"), (1, 390, "₹2,43,375", "year"), (2, 421, "₹4,73,296", "year")],
    "D12": [(0, 309, "₹1,05,360", "year"), (1, 334, "₹1,91,784", "year"), (2, 360, "₹6,89,896", "year")],
    "D13": [(0, 359, "₹1,19,286", "year"), (1, 387, "₹2,38,416", "year"), (2, 416, "₹5,69,040", "year")],
    "D14": [(0, 356, "₹94,400", "year"), (1, 371, "₹3,43,000", "year")],
    "D24": [(0, 302, "₹2,68,000", "year"), (1, 309, "₹4,21,700", "year"), (2, 317, "₹5,04,640", "year")],
    "D04": [(1, 142, "₹8,580", "month")],
    "D05": [(1, 140, "₹6,235", "month")],
    "D06": [(1, 141, "₹24,372", "month")],
    "D07": [(1, 157, "₹1,19,550", "month")],
    "D08": [(1, 148, "₹79,150", "month")],
    "D09": [(1, 155, "₹1,29,850", "month")],
    "D10": [(1, 150, "₹92,900", "month")],
    "D23": [(1, 154, "₹85,590", "month")],
}

# D14 prints its DSCR in a box table, one line per size: Year 1, Year 2, Year 3 as written.
DSCR_TABLE = {"D14": [(0, 360, ["2.60x", "1.76x", "1.90x"]), (1, 375, ["2.33x", "1.67x", "1.83x"])]}
MODEL = re.compile(r"#### Model ([A-C])")
YEAR_DSCR = re.compile(r"Year ([123]) DSCR")
DSCR_VALUE = re.compile(r"(\d+\.\d+)\s*(?:\\times|×|x\b)")

# Tier totals: "| **TOTAL** | **<size> CapEx** | ... | **₹X** | ... | `[S1, S3]` |"  (D01-style dossiers)
TOTAL_A = re.compile(r"^\| \*\*TOTAL\*\* \| \*\*(?P<label>[^*]*CapEx)\*\* \|.*?\| \*\*(?P<w>₹[\d,]+)\*\* \|")
# "| **Total** | **Total Project Cost (<size>)** | ... | **₹X** | [S8] |"  (D04-style dossiers)
TOTAL_B = re.compile(r"^\| \*\*Total\*\* \| \*\*Total Project Cost \((?P<label>[^)]+)\)\*\* \|.*?\| \*\*(?P<w>₹[\d,]+)\*\* \|")
# Person C dossiers: "| | **Total project cost** | **43.84** | [S5] p.5 |" (lakh)
TOTAL_C = re.compile(r"^\| \| \*\*Total project cost\*\* \| \*\*(?P<w>[\d.]+)\*\* \|")
SEASON_ROW = re.compile(r"^\| \*\*M(?P<m>\d{2})\*\* \| (?P<month>[A-Za-z]+) \| \*\*(?P<w>\d+\.\d+)\*\* \|")
SEASON_ARRAY = re.compile(r"Seasonality Array:\*\* `\[(?P<w>[\d., ]+)\]`")
TAG = re.compile(r"\[(S\d+(?:,\s*S\d+)*)\](\s*p\.\s?[\d–-]+)?")


class DossierMismatch(RuntimeError):
    """A dossier line no longer says what the figures were read from."""


def _path(code):
    return next(DOSSIERS.glob(f"{code}_*_Dossier.md"))


def _lines(code):
    return _path(code).read_text(encoding="utf8").split("\n")


def _tag(line):
    m = TAG.search(line)
    if not m:
        return NO_TAG
    return f"[{m.group(1)}]" + (f" {m.group(2).strip()}" if m.group(2) else "")


def _rupees(w):
    return int(w.replace("₹", "").replace(",", ""))


_CODE = {"current": None}


def _fig(value, w, n, line, **extra):
    if w not in line:
        raise DossierMismatch(f"line {n} does not contain {w!r}")
    return dict(value=value, as_written=w, line=n, source_tag=_tag(line), tag=f"{_CODE['current']} dossier", **extra)


def _not_found(reason):
    return {"status": "NOT FOUND", "value": None, "reason": reason}


def _tiers(code, lines):
    if code in PERSON_C:
        micro = {"label": "Micro Finance size", "project_cost": _not_found(
            "The dossier lists item prices for this size but prints no total project cost.")}
        term = {"label": "Term Loan size", "project_cost": _not_found(
            "The dossier prints no total project cost for this size.")}
        for n, line in enumerate(lines, 1):
            m = TOTAL_C.match(line)
            if m:
                w = m.group("w")
                term["project_cost"] = _fig(round(float(w) * 100000), w, n, line, unit="INR lakh")
        return [micro, term]
    tiers = []
    for n, line in enumerate(lines, 1):
        m = TOTAL_A.match(line) or TOTAL_B.match(line)
        if m:
            tiers.append({"label": m.group("label").strip(),
                          "project_cost": _fig(_rupees(m.group("w")), m.group("w"), n, line, unit="INR")})
    return tiers


def _season(code, lines):
    rows = []
    for n, line in enumerate(lines, 1):
        m = SEASON_ROW.match(line)
        if m:
            rows.append(_fig(float(m.group("w")), m.group("w"), n, line, month=m.group("month")))
    if not rows:
        for n, line in enumerate(lines, 1):
            m = SEASON_ARRAY.search(line)
            if m:
                parts = [p.strip() for p in m.group("w").split(",")]
                rows = [_fig(float(p), p, n, line, month=MONTHS[i]) for i, p in enumerate(parts)]
                break
    if not rows:
        return _not_found("The dossier gives no month-by-month season multipliers.")
    if [r["month"] for r in rows] != MONTHS:
        raise DossierMismatch(f"{code}: season rows are not April to March: {[r['month'] for r in rows]}")
    return {"months": rows, "tag": "as on each dossier line"}


def _dscr(code, lines, n_tiers):
    """Each size's printed Year 1/2/3 DSCR: the first value per year in its "#### Model X" block."""
    found = [dict() for _ in range(n_tiers)]
    for idx, n, ws in DSCR_TABLE.get(code, []):
        for year, w in enumerate(ws, 1):
            found[idx][year] = _fig(float(w.rstrip("x")), w, n, lines[n - 1], year=year)
    model = None
    for n, line in enumerate(lines, 1):
        m = MODEL.match(line)
        if m:
            model = "ABC".index(m.group(1))
            continue
        if line.startswith("## ") or line.startswith("### "):
            model = None
        if model is None or model >= n_tiers:
            continue
        for y in YEAR_DSCR.finditer(line):
            v = DSCR_VALUE.search(line[y.end():])
            year = int(y.group(1))
            if v and year not in found[model]:
                found[model][year] = _fig(float(v.group(1)), v.group(1), n, line, year=year)
    out = []
    for f in found:
        if f:
            out.append({"years": [f[y] if y in f else dict(_not_found("The dossier prints no DSCR for this year."), year=y)
                                  for y in (1, 2, 3)]})
        else:
            out.append(_not_found("The dossier prints no cash-flow cover (DSCR) for this size."))
    return out


@lru_cache(maxsize=None)
def figures(code):
    if code not in NAMES:
        raise KeyError(code)
    lines = _lines(code)
    _CODE["current"] = code
    tiers = _tiers(code, lines)
    for t in tiers:
        t["surplus"] = _not_found("The dossier states no yearly or monthly surplus for this size.")
    for idx, n, w, period in SURPLUS.get(code, []):
        if idx >= len(tiers):
            raise DossierMismatch(f"{code}: surplus for size {idx + 1}, but the dossier has {len(tiers)} sizes")
        t = tiers[idx]
        t["surplus"] = _fig(_rupees(w), w, n, lines[n - 1], period=period, unit="INR")
        if period == "month":
            t["annual_surplus"] = {"value": t["surplus"]["value"] * 12,
                                   "tag": "CALCULATED: the dossier's monthly surplus x 12"}
        else:
            t["annual_surplus"] = {"value": t["surplus"]["value"],
                                   "tag": "the dossier's Year 3 (stabilised) yearly figure"}
    for t, d in zip(tiers, _dscr(code, lines, len(tiers))):
        t["dscr"] = d
    return {"code": code, "name": NAMES[code], "dossier": str(_path(code).relative_to(REPO)),
            "tiers": tiers, "seasonality": _season(code, lines)}


def all_figures():
    return {c: figures(c) for c in NAMES}


# ---------------------------------------------------------------------------
# cash-flow cover (DSCR)
# ---------------------------------------------------------------------------

def pick_tier(f, cost):
    """Same-cost tier; otherwise the nearest by cost (ASSUMED). None if no size has a cost."""
    priced = [t for t in f["tiers"] if t["project_cost"].get("value")]
    if not priced:
        return None, None
    exact = [t for t in priced if t["project_cost"]["value"] == cost]
    if exact:
        return exact[0], "exact"
    return min(priced, key=lambda t: (abs(t["project_cost"]["value"] - cost), t["project_cost"]["value"])), "nearest"


def _tied(f, cost):
    gaps = sorted(abs(t["project_cost"]["value"] - cost) for t in f["tiers"] if t["project_cost"].get("value"))
    return len(gaps) > 1 and gaps[0] == gaps[1]


def cashflow(code, req):
    """The dossier's figures for the size matching the user's cost (or the nearest size, ASSUMED)."""
    f = figures(code)
    tier, match = pick_tier(f, req.project_cost)
    if tier is None:
        return {"code": code, "status": "NOT FOUND", "assumptions": [],
                "reason": "The dossier gives no project cost for any size."}
    assumptions = []
    if match == "nearest":
        assumptions.append({"tag": "ASSUMED", "text": (
            f"Your cost ₹{req.project_cost:,} is not one of the dossier's sizes: the figures of the nearest size "
            f"({tier['label']}, ₹{tier['project_cost']['value']:,}) are shown."
            + (" Two sizes are equally near; the smaller one is used." if _tied(f, req.project_cost) else ""))})
    out = {"code": code, "tier": tier, "tierMatch": match, "seasonality": f["seasonality"],
           "assumptions": assumptions}
    if tier["dscr"].get("status") == "NOT FOUND":
        return dict(out, status="NOT FOUND", reason=tier["dscr"]["reason"])
    out["notes"] = [{"tag": f"{code} dossier", "text": (
        "This cash-flow cover is the dossier's own figure. It uses the dossier's own loan instalment, "
        "which can differ from the NSFDC loan worked out on this dashboard.")}]
    return dict(out, status="ok", dscr=tier["dscr"])


@router.post("/api/dossiers/{code}/cashflow")
async def dossier_cashflow(code: str, request: Request):
    code = code.strip().upper()
    if code not in NAMES:
        return _error(f"Dossier '{code}' not found", 404, details={"availableCodes": list(NAMES)})
    body, err = await _body(request)
    if err:
        return err
    notes = []
    try:
        if "projectCost" not in body:
            raise ValueError("Missing required parameter: 'projectCost'")
        cost = _whole_rupees(body["projectCost"], "projectCost", notes)
        income = _whole_rupees(body.get("familyIncome", 0), "familyIncome", notes)
        is_sc = _is_sc(body, notes)
        req = LoanRequest(project_cost=cost, is_sc=is_sc, annual_family_income=income)
    except ValidationError as exc:  # before ValueError: pydantic's error is a ValueError
        return _error(_validation_message(exc), 400)
    except ValueError as exc:
        return _error(str(exc), 400)
    try:
        out = cashflow(code, req)
    except DossierMismatch as exc:
        return _error(f"The dossier changed since its figures were checked: {exc}", 500)
    out["assumptions"] = notes + out.get("assumptions", [])
    return out
