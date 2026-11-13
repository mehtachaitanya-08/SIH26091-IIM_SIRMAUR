"""
English DPR (Detailed Project Report) PDF for a business and a project cost (Phase 1, Stage 1b;
owner's decisions 1-30, 12 Nov 2026).

Page 1 is a summary in plain words. Then every section of the two bank forms the owner chose, FIDF and
AIF, each once, in one merged order (NSFDC wording where a form names its own scheme). Figures come from
the server only: the verified loan logic (backend/loan.py), the year-by-year figures (backend/year_figures.py),
the research files through the feasibility report (backend/feasibility.py) and the business checks
(backend/businesses.py). Each figure carries its tag. The applicant's own details (Stage 1c form) are printed
as sent and never stored or logged; Aadhaar is the last 4 digits only. Open items stay in the dashboard's
Feasibility tab: the DPR prints no raw gap list. This is an advisory document, not a loan sanction.

Fonts: DejaVu Sans (backend/fonts, licence in backend/fonts/LICENSE-DejaVu.txt), so the rupee sign prints.
"""

import io
import re
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

from fastapi import APIRouter, Request
from fastapi.responses import Response
from pydantic import ValidationError
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from backend import businesses, dossier_figures, feasibility, loan, year_figures
from backend.compat import NAMES, _body, _error, _validation_message, _whole_rupees
from backend.schemas import LoanRequest

router = APIRouter()

FONTS = Path(__file__).resolve().parent / "fonts"
pdfmetrics.registerFont(TTFont("DejaVu", str(FONTS / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONTS / "DejaVuSans-Bold.ttf")))

TITLE = "Detailed Project Report (DPR)"
BLANK = "________________"                  # a line for the applicant to fill in by hand
BLANK_SHORT = "________"                    # the same in narrow table columns, so it never breaks (review finding 8)
GROUP_NAMES = {"machinery": "Machinery", "tools": "Tools", "vehicle": "Vehicle", "civil_works": "Civil works",
               "furniture_fittings": "Furniture and fittings", "licences_deposits": "Licences and deposits",
               "first_batch_inputs": "First batch inputs", "livestock": "Livestock", "stock": "Stock",
               "working_capital": "Working capital", "insurance": "Insurance"}   # cost groups in plain words
WORD_CAP = 200                              # research text per section (decision 4)
FULL_TEXT = "full text: Feasibility tab"


# --------------------------------------------------------------------------- formatting

def inr(x) -> str:
    """Indian grouping: 125000 -> ₹1,25,000; 12704.49 -> ₹12,704.49."""
    neg = x < 0
    x = abs(x)
    whole = int(x)
    paise = round((x - whole) * 100)
    if paise == 100:
        whole, paise = whole + 1, 0
    s = str(whole)
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        s = ",".join(groups + [tail])
    out = f"₹{s}" + (f".{paise:02d}" if paise else "")
    return ("-" if neg else "") + out


def _t(tag):
    """Show a tag once in square brackets: "[S1]" stays, "CALCULATED" becomes "[CALCULATED]"."""
    return tag if tag.startswith("[") and tag.endswith("]") else f"[{tag}]"


# Maths codes in the research files written for a screen (review finding 1): turned into plain symbols.
SYMBOLS = {"rightarrow": "→", "to": "→", "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "times": "×", "approx": "≈",
           "cdot": "·", "circ": "°", "alpha": "α", "beta": "β", "phi": "φ", "theta": "θ", "psi": "ψ", "sum": "Σ"}


def _maths(s):
    """'$\\frac{₹90,690}{₹39,535.27} = \\mathbf{2.29×}$' -> '₹90,690 / ₹39,535.27 = 2.29×'. Text without '$' or a
    backslash is left as written (web addresses keep their underscores)."""
    if "$" not in s and "\\" not in s:
        return s
    s = re.sub(r"\\([%$&#_])", r"\1", s)                                  # \% -> %
    s = re.sub(r"\^\\circ", "°", s)
    for _ in range(4):                                                  # nested braces, inside out
        s = re.sub(r"\\(?:text|mathbf|mathrm|textbf|mathit|operatorname)\{([^{}]*)\}", r"\1", s)
        s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"\1 / \2", s)
        s = re.sub(r"\\xrightarrow\{([^{}]*)\}", r"→ (\1)", s)
        s = re.sub(r"[_^]\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\([a-zA-Z]+)", lambda m: SYMBOLS.get(m.group(1), m.group(1)), s)
    s = re.sub(r"(?<=[A-Za-z)])[_^](?=[0-9A-Za-z])", "", s)              # C_6 -> C6
    return s.replace("$", "").replace("{", "").replace("}", "")


def _plain(s):
    """Research text without markdown marks or maths codes, for print."""
    s = s.replace("**", "").replace("`", "")
    s = _maths(s).replace("*", "")
    s = re.sub(r"^\s*(?:[\-#]+\s+)", "", s)
    return re.sub(r"\s{2,}", " ", s).strip()


ST = {
    "title": ParagraphStyle("title", fontName="DejaVu-Bold", fontSize=14, leading=18, spaceAfter=4),
    "h": ParagraphStyle("h", fontName="DejaVu-Bold", fontSize=10.5, leading=13, spaceBefore=8, spaceAfter=3,
                        keepWithNext=1),                 # never alone at a page foot (review finding 8)
    "p": ParagraphStyle("p", fontName="DejaVu", fontSize=8.5, leading=11, spaceAfter=2),
    "s": ParagraphStyle("s", fontName="DejaVu", fontSize=7.2, leading=9, spaceAfter=1.5),
    "cell": ParagraphStyle("cell", fontName="DejaVu", fontSize=7, leading=8.5),
    "cellb": ParagraphStyle("cellb", fontName="DejaVu-Bold", fontSize=7, leading=8.5),
}


def P(text, style="p"):
    return Paragraph(escape(str(text)), ST[style])


def H(text):
    return Paragraph(escape(text), ST["h"])


def _table(rows, widths, header=True):
    data = [[c if isinstance(c, Paragraph) else Paragraph(escape(str(c)), ST["cellb" if (header and i == 0) else "cell"])
             for c in row] for i, row in enumerate(rows)]
    t = Table(data, colWidths=[w * mm for w in widths], repeatRows=1 if header else 0)
    style = [("GRID", (0, 0), (-1, -1), 0.3, colors.grey), ("VALIGN", (0, 0), (-1, -1), "TOP"),
             ("LEFTPADDING", (0, 0), (-1, -1), 2.5), ("RIGHTPADDING", (0, 0), (-1, -1), 2.5),
             ("TOPPADDING", (0, 0), (-1, -1), 1.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5)]
    if header:
        style.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EEF2EE")))
    t.setStyle(TableStyle(style))
    return t


def _pairs(rows):
    """A two-column label/value table."""
    return _table([("Item", "Value")] + list(rows), [62, 118])


# --------------------------------------------------------------------------- applicant fields (Stage 1c form)

TEXT_FIELDS = [
    "name", "entityType", "legalStatus", "registrationNo", "dateOfEstablishment", "gstin", "pan", "aadhaarLast4",
    "registeredAddress", "siteAddress", "village", "block", "district", "state", "pin", "mobile", "email",
    "experience", "turnoverHistory", "existingLoans", "gstReturns",
    "objective", "infrastructureCategory", "processFlow", "constructionTimeline", "startDate", "milestones", "layout",
    "landArea", "landTitle", "leaseDetails", "coordinates", "changeOfLandUse", "distanceStateHighway",
    "distanceNationalHighway", "water", "power",
    "rawMaterial", "catchment", "employment", "renewableEnergy", "suppliers", "place", "date",
]
BOOL_FIELDS = ["isWoman", "isMinority"]
APPLICANT_FIELDS = set(TEXT_FIELDS) | set(BOOL_FIELDS) | {"promoters", "enclosures"}
PROMOTER_TEXT = ["name", "aadhaarLast4", "pan", "qualification", "netWorth", "din", "creditRating", "shareholding", "mobile"]
PROMOTER_FIELDS = set(PROMOTER_TEXT) | set(BOOL_FIELDS)
MAX_PROMOTERS = 3                            # decision 30
TEXT_CAP, NAME_CAP = 120, 80                 # decision 24
ENCLOSURES = ["Aadhaar or registration", "land documents", "cost abstract", "civil-works estimates",
              "machinery quotations", "economic viability report", "layouts", "bankability"]   # FIDF checklist


def _check_fields(d, allowed, texts, where):
    if not isinstance(d, dict):
        raise ValueError(f"'{where}' must be an object")
    unknown = sorted(set(d) - allowed)
    if unknown:
        raise ValueError(f"'{where}' has unknown field(s): {', '.join(unknown)}")
    for k in texts:
        if k in d and d[k] is not None:
            v = d[k]
            if not isinstance(v, str):
                raise ValueError(f"'{where}.{k}' must be text")
            cap = NAME_CAP if k == "name" else TEXT_CAP
            if len(v) > cap:
                raise ValueError(f"'{where}.{k}' is longer than {cap} characters")
    for k in BOOL_FIELDS:
        if k in d and d[k] is not None and not isinstance(d[k], bool):
            raise ValueError(f"'{where}.{k}' must be true or false")
    a = d.get("aadhaarLast4")
    if a not in (None, "") and not (isinstance(a, str) and re.fullmatch(r"[0-9]{4}", a)):   # English digits only
        raise ValueError(f"'{where}.aadhaarLast4' must be exactly the last 4 digits of the Aadhaar number")


def parse_applicant(raw):
    """The applicant's own details, checked. Printed on the PDF; never stored or logged."""
    if raw in (None, {}):
        return {}
    _check_fields(raw, APPLICANT_FIELDS, TEXT_FIELDS, "applicant")
    promoters = raw.get("promoters")
    promoters = [] if promoters is None else promoters
    if not isinstance(promoters, list):              # "" or {} refused too (review finding 9)
        raise ValueError("'applicant.promoters' must be a list")
    if len(promoters) > MAX_PROMOTERS:
        raise ValueError(f"'applicant.promoters' may hold at most {MAX_PROMOTERS} promoters")
    for p in promoters:
        _check_fields(p, PROMOTER_FIELDS, PROMOTER_TEXT, "applicant.promoters[]")
    encl = raw.get("enclosures")
    encl = [] if encl is None else encl
    if not isinstance(encl, list) or not all(isinstance(e, str) for e in encl):
        raise ValueError("'applicant.enclosures' must be a list of checklist items")
    names = {e.lower(): e for e in ENCLOSURES}
    bad = [e for e in encl if e.lower() not in names]
    if bad:
        raise ValueError(f"'applicant.enclosures' has unknown item(s): {', '.join(bad)}")
    return dict(raw, promoters=promoters, enclosures=[names[e.lower()] for e in encl])


def _v(a, key):
    v = a.get(key)
    return v if v not in (None, "") else BLANK


def _sd(v):
    return BLANK if v in (None, "") else f"{v} (self-declared)"


def _aadhaar(v):
    return BLANK if v in (None, "") else f"XXXX-XXXX-{v} (self-declared)"


def _yn(v):
    return BLANK if v is None else ("yes" if v else "no")


# --------------------------------------------------------------------------- research text (feasibility report)

BOX = set("─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬━┃▼▲►◄")


CALLOUT = re.compile(r"^\s*>\s*\[!\w+\]")     # "> [!CRITICAL]": a note for the team writing DPRs, not for the bank


def _item_lines(items):
    """Research items as printable lines: only rows holding a value; NOT FOUND cells, frame lines and
    formula lines skipped (decision 28); "> [!...]" notes for the team skipped with their quoted lines."""
    out = []
    in_note = False
    for it in items:
        raw = it.get("text", "")
        if raw and CALLOUT.match(raw):
            in_note = True
            continue
        if in_note and raw.lstrip().startswith(">"):
            continue
        in_note = False
        if it.get("header") and "cells" in it:
            continue
        if "cells" in it:
            cells = [_plain(c) for c in it["cells"]]
            cells = [c for c in cells if c and "NOT FOUND" not in c and c not in ("—", "-", "–")]
            if len(cells) >= 2 or (cells and len(cells[0].split()) > 3):
                out.append(" — ".join(cells))
            continue
        t = raw
        if not t or any(ch in BOX for ch in t) or t.strip().startswith("$$") or "NOT FOUND" in t:
            continue
        t = _plain(re.sub(r"^\s*>\s?", "", t))                          # a quoted line: its words only
        if t:
            out.append(t)
    return out


SENTENCE_END = re.compile(r"[.!?](?=\s|$)")


def _capped(lines, cap=WORD_CAP):
    """About `cap` words, cut at a sentence end (decision 4; review finding 5), never mid-sentence: at the
    last full stop within the cap; with none, after the last whole line that fits; with none, the whole
    first line. Always points to the full text."""
    lines = [l.strip() for l in lines if l and l.strip()]
    text = " ".join(lines)
    if len(text.split()) > cap:
        cut = " ".join(text.split()[:cap])
        ends = [m.end() for m in SENTENCE_END.finditer(cut)]
        fit, n = [], 0
        for l in lines:
            n += len(l.split())
            if n > cap:
                break
            fit.append(l)
        whole = " ".join(fit)
        if ends and ends[-1] >= len(whole):
            text = cut[: ends[-1]]
        else:
            text = whole or lines[0]
    return f"{text} ({FULL_TEXT})" if text else ""


def _section(feas, sid):
    for s in feas.get("sections", []):
        if s.get("id") == sid:
            return s.get("items", [])
    return []


def _strengths(feas):
    """SWOT strengths only: the rows after a 'Strength' heading, up to the next heading."""
    items = _section(feas, "swot_competition")
    for i, it in enumerate(items):
        label = it.get("text") or (it.get("cells") or [""])[0]
        if "strength" in label.lower():
            rest = []
            for nxt in items[i + 1:]:
                lab = (nxt.get("text") or (nxt.get("cells") or [""])[0]).lower()
                if nxt.get("header") or any(w in lab for w in ("weakness", "opportunit", "threat")):
                    break
                rest.append(nxt)
            if "cells" in it and len(it["cells"]) > 1:
                rest = [it] + rest
            return _item_lines(rest)
    return []


TAG_GROUP = re.compile(r"\[((?:S\d+[,;\s]*)+)\]")
SRC_ROW = re.compile(r"^\|\s*[`*]*\[?S(\d+)\]?[`*]*\s*\|(.*)$")       # | [S8] | title | issuer | url | ...
SRC_BOLD = re.compile(r"^\s*\*\*\[S(\d+)\]\s*(.*)$")                 # **[S5] "Pottery Products"** (undated)


def _research(code, lines, cited):
    """Research text for one section; the [Sn] tags it prints are collected for the Sources list (finding 6)."""
    text = _capped(lines)
    for grp in TAG_GROUP.findall(text):
        cited.update(int(n) for n in re.findall(r"S(\d+)", grp))
    return P(f"{text} [{code} research file]") if text else P(BLANK)


def research_sources(code):
    """The research file's own source list, {n: 'title — issuer — url'} as written there (first entry per tag)."""
    out = {}
    for line in dossier_figures._lines(code):
        m = SRC_ROW.match(line)
        if m:
            cells = [_plain(c) for c in m.group(2).split("|")]
            text = " — ".join(c for c in cells[:3] if c)
        else:
            m = SRC_BOLD.match(line)
            text = _plain(m.group(2)) if m else ""
        if m and text and int(m.group(1)) not in out:
            out[int(m.group(1))] = text
    return out


# --------------------------------------------------------------------------- loan helpers

def repayment_by_year(out):
    """The quarterly schedule from loan.build_loan added up by loan year (loan.py itself is not touched)."""
    years = {}
    for r in out["schedule"]["rows"]:
        y = (r["quarter"] - 1) // 4 + 1
        d = years.setdefault(y, {"year": y, "pause_quarters": 0, "interest": 0.0, "interest_added": 0.0,
                                 "principal": 0.0, "payment": 0.0, "closing_balance": 0.0})
        d["pause_quarters"] += 1 if r["is_moratorium"] else 0
        d["interest"] += r["interest"]
        d["interest_added"] += r.get("interest_added") or 0
        d["principal"] += r["principal"]
        d["payment"] += r["payment"]
        d["closing_balance"] = r["closing_balance"]
    return [years[k] for k in sorted(years)]


def _research_loan(code, yfs):
    """The loan behind the year table's debt service and DSCR (decision 3)."""
    if yfs.get("status") != "ok":
        return None
    data = year_figures.load(code)
    if data["kind"] == "government_profile":
        tl = data.get("term_loan")
        return f"reference unit's own loan, {inr(tl['value'])}" if tl else None
    for s in data["sizes"]:
        if s["label"] == yfs["size"]["label"]:
            return f"research file's own loan, {inr(s['loan']['amount']['value'])}"
    return None


# --------------------------------------------------------------------------- the year table

KEYS = {"D": "research file", "P": "UP MSME project profile page", "C": "calculated", "A": "assumed", "—": "not available"}
ROW_LABELS = [
    ("turnover", "Turnover"), ("gross_benefit", "Gross benefit (value of output)"),
    ("recurring_cost", "Recurring (running) cost"), ("capital_cost", "Capital cost"), ("total_cost", "Total cost"),
    ("net_benefit", "Net benefit"), ("surplus_before_loan", "Surplus before loan payments"),
    ("interest", "Interest"), ("depreciation", "Depreciation"), ("profit_before_tax", "Profit before tax"),
    ("tax", "Tax"), ("profit_after_tax", "Profit after tax"), ("debt_service", "Loan payments"),
    ("dscr", "Can it repay? (DSCR, earned per ₹1 of loan payment)"),
]


def _key(c):
    if c.get("value") is None:
        return "—"
    tag = c.get("tag", "")
    # any assumption first (review finding 2): assumption labels cite sources too, and the surplus row's
    # "CALCULATED: (the dossier's ...) x 12; assumed from one normal month" rests on one month
    if "assumed" in tag.lower():
        return "A"
    if "dossier" in tag:
        return "D"
    if "UP MSME" in tag:
        return "P"
    if tag.startswith("CALCULATED"):
        return "C"
    return "A"


def _cellv(name, c):
    if c.get("value") is None:
        return "—"
    v = c["value"]
    return f"{v:.2f}" if name == "dscr" else inr(round(v))


def _year_rows(yfs, names, research_loan):
    rows = [["Row", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]]
    for name, label in ROW_LABELS:
        if name not in names:
            continue
        if name in ("debt_service", "dscr", "interest") and research_loan:
            label = f"{label} ({research_loan})"
        rows.append([label] + [f"{_cellv(name, c)} {_key(c)}" for c in yfs["rows"][name]])
    return rows


def _year_notes(yfs):
    """The full labels word for word under the table (decision 23)."""
    seen, out = set(), []
    for name, row in yfs["rows"].items():
        for c in row:
            for s in (c.get("tag", ""), c.get("note", ""), c.get("reason", "")):
                if s and s not in seen and (s.startswith(("ASSUMED", "assumed", "CALCULATED:")) or c.get("note") == s
                                            or c.get("reason") == s):
                    seen.add(s)
                    out.append(s)
    return out


def _ref_title(code):
    """'UP MSME project profile: Grills and Gates (...)' -> 'Grills and Gates (...)' (no doubled phrase)."""
    return year_figures.load(code)["title"].split(": ", 1)[-1]


def _is_ref(yfs):
    return yfs.get("status") == "ok" and yfs["size"]["basis"].startswith("reference unit")


def _size_text(code, yfs):
    if _is_ref(yfs):
        return f"the reference unit from the UP MSME project profile, never rescaled: {_ref_title(code)}"
    return f"{yfs['size']['label']} ({yfs['size']['basis']})"


def _ref_label(code, yfs):
    """Decision 23: 'from the UP MSME project profile, ₹X lakh', under the year table."""
    cap = yfs["size"].get("capex_total")
    amount = f", ₹{cap / 100000:.2f} lakh" if cap else ""
    return f"Reference unit: from the UP MSME project profile{amount}: {_ref_title(code)}."


# --------------------------------------------------------------------------- the document

def _summary(code, req, out, yfs, research_loan, notes):
    f = [Paragraph(escape(f"{TITLE} — {NAMES[code]} ({code})"), ST["title"]),
         P(f"Prepared {date.today().isoformat()} by the UdyamSetuAI advisory server. Advisory document only: "
           f"this is not a loan sanction.", "s"),
         H("Summary in plain words")]
    f.append(P(f"Business: {NAMES[code]} ({code}). Project cost you entered: {inr(req.project_cost)}. "
               f"Scheduled Caste: {'yes' if req.is_sc else 'no'} (self-declared). "
               f"Yearly family income: {inr(req.annual_family_income)}."))
    if out["status"] != "eligible":
        f.append(P(("Not eligible for an NSFDC loan." if out["status"] == "not_eligible"
                    else "Not covered by the NSFDC loan schemes.") + " Reasons:"))
        for r in out["reasons"]:
            f.append(P(f"• {r['text']} NSFDC: \"{r['quote']}\" {r['tag']}", "s"))
        f.append(P("So this report shows no NSFDC loan; the business sections follow for the bank."))
    elif out["loan"]["loan_amount"]["value"] <= 0:
        f.append(P("NSFDC loan: the loan works out to ₹0 at this project cost, so this report shows no NSFDC loan payments."))
    else:
        L, S = out["loan"], out["summary"]
        f.append(P(f"NSFDC loan: {inr(L['loan_amount']['value'])} ({L['scheme']['value']}, {L['interest_rate_pa']['value']}% a year). "
                   f"Your own money: {inr(L['own_contribution']['value'])}. "
                   f"After a pause with no payment, you pay {L['repayment_quarters']['value']} payments, one every 3 months, "
                   f"of about {inr(S['equated_quarterly_instalment']['value'])}."))
    if yfs.get("status") == "ok":
        pat = [c["value"] for c in yfs["rows"]["profit_after_tax"]]
        s = yfs["summary"]
        line = "Profit after tax, Years 1-5: " + ", ".join("—" if v is None else inr(round(v)) for v in pat) + "."
        if s["avg_dscr"].get("value") is not None:
            line += f" On average the business earns ₹{s['avg_dscr']['value']:.2f} for every ₹1 of loan payment."
        if s["break_even"].get("value") is not None:
            line += f" It breaks even at about {s['break_even']['value']:.0f}% of capacity."
        f.append(P(line))
        # review finding 7: always said, not only when an average DSCR exists
        f.append(P(f"These Year 1-5 figures are for {_size_text(code, yfs)}, not your {inr(req.project_cost)} project"
                   + (f"; their loan payments use the {research_loan}, which can differ from your NSFDC loan"
                      if research_loan else "") + "."))
    else:
        f.append(P(f"Year-by-year figures: {year_figures.TO_BE_FILLED}."))
    for n in notes:
        f.append(P(f"Note: {n['text']} [{n['tag']}]", "s"))
    f.append(P("Open items for this business (things the research files do not hold yet) are listed in the "
               "dashboard's Feasibility tab, not in this report.", "s"))
    f.append(P("Tags: [S#] official source (list at the end), CALCULATED worked out from tagged figures, ASSUMED our "
               "stated assumption, USER INPUT entered by the applicant, \"Dxx dossier\" / research file = the team's "
               "research file for this business, self-declared = typed by the applicant, not checked.", "s"))
    return f


def _build(code, req, answers, a, notes):
    has_rules = businesses.check_code(code)
    adv = businesses.advice(code, answers)
    out = loan.build_loan(req)
    yfs = year_figures.years(code, req.project_cost)
    feas = feasibility.report(code)
    ok = yfs.get("status") == "ok"
    eligible = out["status"] == "eligible"
    has_loan = eligible and out["loan"]["loan_amount"]["value"] > 0     # review finding 8: no "payments of ₹0"
    research_loan = _research_loan(code, yfs)
    cited = set()                                  # [Sn] tags printed from the research file (finding 6)
    F = _summary(code, req, out, yfs, research_loan, notes)
    F.append(PageBreak())

    # 1. Applicant and promoters (AIF 1-3; FIDF 1)
    F.append(H("1. Applicant and promoters"))
    F.append(_pairs([
        ("Name of the applicant", _v(a, "name")), ("Entity type", _v(a, "entityType")),
        ("Legal status", _v(a, "legalStatus")), ("Registration (Udyam / CIN)", _sd(a.get("registrationNo"))),
        ("Date of establishment", _v(a, "dateOfEstablishment")), ("GSTIN", _sd(a.get("gstin"))),
        ("PAN", _sd(a.get("pan"))), ("Aadhaar", _aadhaar(a.get("aadhaarLast4"))),
        ("Registered address", _v(a, "registeredAddress")), ("Site address", _v(a, "siteAddress")),
        ("Village / block", f"{_v(a, 'village')} / {_v(a, 'block')}"),
        ("District / state / PIN", f"{_v(a, 'district')} / {_v(a, 'state')} / {_v(a, 'pin')}"),
        ("Mobile", _v(a, "mobile")), ("Email (added by us; not asked by either form)", _v(a, "email")),
        ("Lead promoter Scheduled Caste", f"{'yes' if req.is_sc else 'no'} [USER INPUT, self-declared; certificate to be shown to the SCA]"),
        ("Lead promoter woman / minority", f"{_yn(a.get('isWoman'))} / {_yn(a.get('isMinority'))}"),
    ]))
    # one two-column table per promoter (up to 3, decision 30): long values never break mid-word
    for i, p in enumerate(a.get("promoters") or [{}], start=1):
        F.append(Spacer(1, 3))
        F.append(P(f"Promoter {i}", "s"))
        F.append(_pairs([("Name", _v(p, "name")), ("Aadhaar", _aadhaar(p.get("aadhaarLast4"))), ("PAN", _sd(p.get("pan"))),
                         ("Qualification", _v(p, "qualification")), ("Net worth", _v(p, "netWorth")),
                         ("DIN (company director number)", _v(p, "din")), ("Credit rating", _v(p, "creditRating")),
                         ("Shareholding", _v(p, "shareholding")), ("Mobile", _v(p, "mobile")),
                         ("Woman / minority", f"{_yn(p.get('isWoman'))} / {_yn(p.get('isMinority'))}")]))

    # 2. Project summary (FIDF 1)
    F.append(H("2. Project summary"))
    rows = [("Project", f"{NAMES[code]} ({code})"),
            ("Unit size used for the figures", _size_text(code, yfs) if ok else year_figures.TO_BE_FILLED),
            ("Total project cost", f"{inr(req.project_cost)} [USER INPUT]")]
    if has_loan:
        L = out["loan"]
        rows += [("Eligible cost (NSFDC loan)", f"{inr(L['loan_amount']['value'])} [CALCULATED; {L['scheme']['tag'].strip('[]')}]"),
                 ("Own share", f"{inr(L['own_contribution']['value'])} ({L['own_contribution_pct']['value']}%) [CALCULATED]"),
                 ("Duration of the loan", f"{L['tenure_years']['value']} years [ASSUMED: NSFDC says 'within']")]
    else:
        rows.append(("NSFDC loan", "no NSFDC loan (see page 1)"))
    rows.append(("Location (village, block, district, state)",
                 f"{_v(a, 'village')}, {_v(a, 'block')}, {_v(a, 'district')}, {_v(a, 'state')}"))
    F.append(_pairs(rows))

    # 3-6: research text (decisions 4, 14, 28, 29) and the applicant's objective (decision 5)
    F.append(H("3. Introduction"))
    F.append(_research(code, _item_lines(_section(feas, "market")), cited))
    F.append(H("4. Benefits and justification"))
    F.append(_research(code, _strengths(feas), cited))
    F.append(H("5. Objectives"))
    F.append(P(_v(a, "objective") + (" [USER INPUT]" if a.get("objective") else "")))
    F.append(H("6. Project and operating model"))
    F.append(P(f"Category of infrastructure: {_v(a, 'infrastructureCategory')}"))
    F.append(_research(code, _item_lines(_section(feas, "pricing")), cited))

    # 7. Land and site (AIF 8; FIDF 5 site)
    F.append(H("7. Land and site"))
    F.append(_pairs([("Land area", _v(a, "landArea")), ("Title / ownership", _v(a, "landTitle")),
                     ("Lease details", _v(a, "leaseDetails")), ("Coordinates", _v(a, "coordinates")),
                     ("Change of land use", _v(a, "changeOfLandUse")),
                     ("Distance to state highway", _v(a, "distanceStateHighway")),
                     ("Distance to national highway", _v(a, "distanceNationalHighway")),
                     ("Water", _v(a, "water")), ("Power", _v(a, "power"))]))

    # 8-9. Technical details and machinery; process flow chart (AIF 9; FIDF 5)
    F.append(H("8. Technical details and machinery"))
    lines = (yfs.get("size") or {}).get("capex_lines") or []
    mach = [c for c in lines if c["counted"]]
    if mach:
        F.append(_table([["Machinery, vehicles and tools", "Group", "Value"]] +
                        [[c["item"], GROUP_NAMES.get(c["group"], c["group"]), f"{inr(c['value'])} D"] for c in mach], [110, 30, 40]))
    elif ok:
        F.append(P(f"Itemised machinery: see {_size_text(code, yfs)}; the capital cost is in section 12."))
    else:
        F.append(P(year_figures.TO_BE_FILLED))
    F.append(H("9. Process flow chart"))
    F.append(P(_v(a, "processFlow")))

    # 10-11. Organisation, employment; experience and banking (FIDF 6; AIF 4-6, 15)
    F.append(H("10. Organisation, management and employment"))
    F.append(_pairs([("Employment (people)", _v(a, "employment")), ("Organisation and management", BLANK)]))
    F.append(H("11. Experience and existing banking"))
    F.append(_pairs([("Relevant experience", _v(a, "experience")), ("Year-wise turnover", _v(a, "turnoverHistory")),
                     ("Existing loans and credit facilities", _v(a, "existingLoans")), ("GST returns", _v(a, "gstReturns"))]))

    # 12. Cost of project (FIDF 7A, AIF 11a) and operating cost (FIDF 7B)
    F.append(H("12. Cost of project and operating cost"))
    if lines:
        F.append(_table([["Item", "Units", "Quantity", "Rate", "Group", "Total"]] +
                        [[c["item"], BLANK_SHORT, BLANK_SHORT, BLANK_SHORT, GROUP_NAMES.get(c["group"], c["group"]),
                          f"{inr(c['value'])} D"] for c in lines] +
                        [["Total (as printed in the research file)", "", "", "", "", f"{inr(yfs['size']['capex_total'])} D"]],
                        [62, 18, 18, 18, 30, 34]))
        F.append(P(year_figures.CAPEX_TAG, "s"))
    elif ok:
        cap = yfs["rows"]["capital_cost"][0]
        F.append(P(f"Capital cost: {'—' if cap['value'] is None else inr(cap['value'])} {_t(cap['tag'])}"
                   + (f" ({cap['note']})" if cap.get("note") else "")))
    else:
        F.append(P(f"Capital cost: {year_figures.TO_BE_FILLED}."))
    if ok:
        F.append(Spacer(1, 3))
        F.append(_table(_year_rows(yfs, {"recurring_cost"}, research_loan), [60, 24, 24, 24, 24, 24]))

    # 13. Means of finance (FIDF 10, AIF 11b)
    F.append(H("13. Means of finance"))
    if has_loan:
        L = out["loan"]
        F.append(_pairs([
            ("Total project cost", f"{inr(L['project_cost']['value'])} [USER INPUT]"),
            ("NSFDC loan (90% of cost, within the cap [S1], rounded down (ASSUMED))", f"{inr(L['loan_amount']['value'])} [CALCULATED]"),
            ("Own contribution", f"{inr(L['own_contribution']['value'])} ({L['own_contribution_pct']['value']}%) [CALCULATED]"),
            ("Subsidy", "none: " + year_figures.SUBSIDY_NOTE)]))
    else:
        F.append(P("no NSFDC loan (see page 1)."))

    # 14-17. Output, year figures, project worth, financial parameters (FIDF 8A-8C, AIF 11c-11d)
    F.append(H("14. Estimates of output and its value"))
    if ok:
        F.append(_table(_year_rows(yfs, {"turnover", "gross_benefit"}, research_loan), [60, 24, 24, 24, 24, 24]))
    else:
        F.append(P(year_figures.TO_BE_FILLED))
    F.append(H("15. Year-by-year figures"))
    if ok:
        F.append(_table(_year_rows(yfs, {k for k, _ in ROW_LABELS}, research_loan), [60, 24, 24, 24, 24, 24]))
        F.append(P("Key: " + "; ".join(f"{k} = {v}" for k, v in KEYS.items()) + ". Years 6-8: —.", "s"))
        for n in _year_notes(yfs):
            F.append(P(n, "s"))
        if _is_ref(yfs):
            F.append(P(_ref_label(code, yfs), "s"))
        if research_loan:
            F.append(P(f"Interest, loan payments and DSCR in this table use the {research_loan}"
                       + ("; the NSFDC loan above may differ." if has_loan else "; there is no NSFDC loan for this applicant."), "s"))
        F.append(P(year_figures.SUBSIDY_NOTE, "s"))
    else:
        F.append(P(year_figures.TO_BE_FILLED))

    F.append(H("16. Project worth and cost-benefit"))
    if ok:
        F.append(_table(_year_rows(yfs, {"capital_cost", "recurring_cost", "total_cost", "gross_benefit", "net_benefit"},
                                   research_loan), [60, 24, 24, 24, 24, 24]))
        s = yfs["summary"]

        def sv(k, pct=False, ratio=False):
            c = s[k]
            if c.get("value") is None:
                return f"— ({c.get('reason')})"
            v = c["value"]
            txt = f"{v * 100:.1f}%" if pct else (f"{v:.2f}" if ratio else inr(round(v)))
            return f"{txt} {_t(c['tag'])}"
        F.append(_pairs([("Present worth of costs at 15%", sv("pw_costs")), ("Present worth of benefits at 15%", sv("pw_benefits")),
                         ("Net present worth", sv("npw")), ("Benefit-cost ratio", sv("bcr", ratio=True)),
                         ("IRR (without subsidy)", sv("irr", pct=True)), ("Payback (years)", sv("payback", ratio=True))]))
        F.append(P(year_figures.BASIS, "s"))
    else:
        F.append(P(year_figures.TO_BE_FILLED))

    F.append(H("17. Financial parameters"))
    if ok:
        s = yfs["summary"]
        rows = [("IRR without subsidy", sv("irr", pct=True)), ("IRR with subsidy", "not applicable: " + year_figures.SUBSIDY_NOTE),
                ("Average DSCR", sv("avg_dscr", ratio=True) + (f" ({research_loan})" if research_loan else "")),
                ("Break-even (% of capacity)", "—" if s["break_even"].get("value") is None
                 else f"{s['break_even']['value']:.1f}% {_t(s['break_even']['tag'])}")]
        if "payback_printed" in s:
            rows.append(("Payback printed in the profile", f"{s['payback_printed']['value']:g} years {_t(s['payback_printed']['tag'])}"))
        if has_loan:
            L = out["loan"]
            rows.append(("Debt : equity (NSFDC loan : own money)",
                         f"{L['loan_amount']['value'] / L['own_contribution']['value']:.2f} : 1 [CALCULATED]"
                         if L["own_contribution"]["value"] else "—"))
        rows.append(("Fixed assets coverage", "— (not in any source)"))
        F.append(_pairs(rows))
    else:
        F.append(P(year_figures.TO_BE_FILLED))

    # 18-19. Credit facility and repayment; collateral (AIF 11e-11g)
    F.append(H("18. Credit facility and repayment schedule"))
    if has_loan:
        L, S = out["loan"], out["summary"]
        F.append(_pairs([
            ("Scheme", f"{L['scheme']['value']} {L['scheme']['tag']}"),
            ("Interest rate", f"{L['interest_rate_pa']['value']}% a year {_t(L['interest_rate_pa']['tag'])}"),
            ("Tenure", f"{L['tenure_years']['value']} years ({L['total_quarters']['value']} quarters) [ASSUMED: NSFDC says 'within']"),
            ("Pause (no payment)", f"{L['moratorium_quarters']['value']} quarter(s); interest added to the loan "
             f"{inr(S['interest_added_during_pause']['value'])} [S1 for the pause; how its interest is handled is ASSUMED]"),
            ("Repayment", f"{L['repayment_quarters']['value']} payments, one every 3 months, of "
             f"{inr(S['equated_quarterly_instalment']['value'])} [CALCULATED]"),
            ("Total paid over the loan", f"{inr(S['total_paid']['value'])} [CALCULATED]"),
            ("Total interest cost", f"{inr(S['total_interest_cost']['value'])} [CALCULATED]")]))
        for w in out["warnings"]:
            F.append(P(f"Warning: {w['text']} {_t(w['tag'])}", "s"))
        F.append(Spacer(1, 3))
        # review finding 4: the pause interest added to the loan gets its own column, so each row adds up
        F.append(_table([["Loan year", "Pause quarters", "Interest", "Interest added to the loan (pause)", "Principal",
                          "Payment", "Balance at year end"]] +
                        [[f"Year {y['year']}", str(y["pause_quarters"]), inr(y["interest"]), inr(y["interest_added"]),
                          inr(y["principal"]), inr(y["payment"]), inr(y["closing_balance"])] for y in repayment_by_year(out)],
                        [18, 18, 26, 30, 26, 26, 36]))
        F.append(P("Yearly totals of the quarterly schedule [CALCULATED]. Each year: payment + interest added to the loan "
                   "= interest + principal. Every 3-month payment is listed in the dashboard.", "s"))
    else:
        F.append(P("no NSFDC loan (see page 1)."))
    F.append(H("19. Collateral"))
    F.append(P("not applicable: the loan is below ₹2 crore (NSFDC projects are capped at ₹50 lakh [S1])." if has_loan
               else "not applicable: no NSFDC loan (see page 1)."))

    # 20. Approvals, pollution and risks (AIF 11h, 17; FIDF 6)
    F.append(H("20. Approvals, pollution and risks"))
    F.append(P("Approvals:", "s"))
    F.append(_research(code, _item_lines(_section(feas, "compliance")), cited))
    if has_rules:
        done = [r for r in adv["results"] if r["status"] == "result"]
        if not done:
            F.append(P("Checks: no questions answered yet (answer them in the dashboard to include pollution category, scheme fit and risks).", "s"))
        for r in done:
            cat = f"{r['category']}: " if r.get("category") and not r["text"].startswith(r["category"]) else ""
            F.append(P(f"• {cat}{r['text']} {_t(r['tag'])}{' (unverified)' if r['unverified'] else ''}", "s"))
        for r in [r for r in adv["results"] if r["status"] == "dont_know"]:
            F.append(P(f"• You said 'don't know': {r['ask']}", "s"))
    else:
        F.append(P(businesses.NO_QUESTIONS, "s"))
    F.append(P("Risks:", "s"))
    F.append(_research(code, _item_lines(_section(feas, "swot_competition")), cited))

    # 21-24 (AIF 12-14, 16, 18)
    F.append(H("21. Raw material and catchment"))
    F.append(_pairs([("Raw material available in the catchment", _v(a, "rawMaterial")), ("Catchment", _v(a, "catchment"))]))
    F.append(H("22. Demand and marketing"))
    F.append(_research(code, _item_lines(_section(feas, "market")), cited))
    season = dossier_figures.figures(code)["seasonality"]
    if season.get("status") != "NOT FOUND" and season.get("months"):
        low = sorted(season["months"], key=lambda m: m["value"])[:3]
        F.append(P("Weakest months: " + ", ".join(f"{m['month']} ({round((m['value'] - 1) * 100):+d}% vs an average month)"
                                                 for m in low) + f" [{code} dossier]", "s"))
    F.append(H("23. Renewable energy"))
    F.append(P(_v(a, "renewableEnergy")))
    F.append(H("24. Suppliers of plant and machinery"))
    F.append(P(_v(a, "suppliers")))

    # 25. Expected outcomes (FIDF 9)
    F.append(H("25. Expected outcomes"))
    if ok:
        F.append(_table(_year_rows(yfs, {"net_benefit", "profit_after_tax"}, research_loan), [60, 24, 24, 24, 24, 24]))
    F.append(P(f"Employment: {_v(a, 'employment')}"))

    # 26-28. Construction timeline, milestones, layout (AIF 10; FIDF 11-12)
    F.append(H("26. Construction timeline"))
    F.append(_pairs([("Construction timeline", _v(a, "constructionTimeline")), ("Start date", _v(a, "startDate"))]))
    F.append(H("27. Milestones (first 12 months)"))
    grid = [["Activity"] + [f"M{m}" for m in range(1, 13)]]
    if has_loan:
        pause_months = out["loan"]["moratorium_quarters"]["value"] * 3
        grid.append(["Loan repayment"] + ["pause" if m <= pause_months else "pay" for m in range(1, 13)])
    grid += [[BLANK] + [""] * 12 for _ in range(3)]
    F.append(_table(grid, [40] + [11.6] * 12))
    F.append(P("pause = no payment (pause), from the loan terms [S1]; pay = a payment falls due every 3 months. "
               f"The other rows are for the applicant. Applicant's milestones: {_v(a, 'milestones')}", "s"))
    F.append(H("28. Layout"))
    F.append(P(_v(a, "layout")))

    # 29-30. Enclosures checklist (FIDF 14) and declaration (AIF, reworded for NSFDC)
    F.append(H("29. Enclosures checklist"))
    ticked = set(a.get("enclosures") or [])
    F.append(_table([["Enclosure", "Attached"]] + [[e, "yes" if e in ticked else BLANK] for e in ENCLOSURES], [120, 60]))
    F.append(H("30. Declaration"))
    if has_loan:                                   # review finding 3: name NSFDC and the scheme
        name = out["loan"]["scheme"]["value"]
        scheme = f"the NSFDC {name}" + ("" if "Scheme" in name else " scheme")
    else:
        scheme = "the NSFDC loan schemes"
    F.append(P("I ……………………………Certify that the information / contents as above furnished by me / us are true to the "
               "best of my / our knowledge and belief and nothing material has been concealed. In case, any information "
               "furnished in the application is found false, my / our application may be rejected out at any stage by "
               f"the Bank and not eligible under {scheme}."))
    F.append(P(f"Date: {_v(a, 'date')}    Place: {_v(a, 'place')}    Signature of the Applicant: {BLANK}"))

    F.append(H("Sources"))
    s1 = out["sources"]["[S1]"]
    F.append(P(f"[S1] {s1['document']} — {s1['url']} ({s1['note']})", "s"))
    F.append(P(f"{code} dossier: {dossier_figures.figures(code)['dossier']} (team research file).", "s"))
    if _is_ref(yfs):
        F.append(P(_ref_label(code, yfs), "s"))
    if cited:
        F.append(P(f"Sources cited in the {code} research file (these numbers are the research file's own, not the "
                   f"[S1] above):", "s"))
        defs = research_sources(code)
        for n in sorted(cited):
            F.append(P(f"[{code} research file S{n}] {defs.get(n, 'defined in the research file, see the Feasibility tab')}", "s"))
    if has_rules:
        used = {e["tag"] for r in adv["results"] if r["status"] == "result" for e in r["evidence"]}
        for src in businesses._load(code)["sources"]:
            if src["tag"] in used and src["tag"] != "[S1]":
                F.append(P(f"{src['tag']} {src['title']} — {src['issuer']} — {src['url']}", "s"))
    return F


def _footer(c, doc):
    c.saveState()
    c.setFont("DejaVu", 7)
    c.drawString(15 * mm, 8 * mm, f"{TITLE} — advisory document only, not a loan sanction")
    c.drawRightString(A4[0] - 15 * mm, 8 * mm, f"Page {doc.page}")
    c.restoreState()


def build_pdf(code, req, answers, applicant=None, notes=()) -> bytes:
    a = applicant if isinstance(applicant, dict) else ({"name": applicant} if applicant else {})
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm, topMargin=14 * mm,
                            bottomMargin=14 * mm, title=f"DPR {code} {NAMES[code]}")
    doc.build(_build(code, req, answers, a, list(notes)), onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()


@router.post("/api/dpr")
async def dpr(request: Request):
    body, err = await _body(request)
    if err:
        return err
    notes = []
    code = str(body.get("code", "")).strip().upper()
    if code not in NAMES:
        return _error(f"Dossier '{code}' not found", 404, details={"availableCodes": list(NAMES)})
    try:
        for key in ("projectCost", "familyIncome", "isSc"):
            if key not in body:
                raise ValueError(f"Missing required parameter: '{key}'")
        cost = _whole_rupees(body["projectCost"], "projectCost", notes)
        income = _whole_rupees(body["familyIncome"], "familyIncome", notes)
        if not isinstance(body["isSc"], bool):
            raise ValueError("'isSc' must be true or false")
        req = LoanRequest(project_cost=cost, is_sc=body["isSc"], annual_family_income=income)
        answers = body.get("answers") or {}
        if not isinstance(answers, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in answers.items()):
            raise ValueError("'answers' must map question ids to answer strings")
        applicant = parse_applicant(body.get("applicant"))
        old = body.get("applicantName")
        if old and not applicant.get("name"):          # the new field wins (decision 25)
            applicant["name"] = str(old)[:NAME_CAP]
        pdf = build_pdf(code, req, answers, applicant, notes)
    except businesses.BadAnswer as exc:
        return _error(str(exc), 400)
    except ValidationError as exc:  # before ValueError: pydantic's error is a ValueError
        return _error(_validation_message(exc), 400)
    except ValueError as exc:
        return _error(str(exc), 400)
    except loan.InternalCheckError as exc:
        return _error("Internal consistency check failed; no figures returned.", 500, details=str(exc))
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="DPR_{code}.pdf"'})
