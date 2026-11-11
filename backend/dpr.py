"""
1-page English DPR (Detailed Project Report) PDF for a business and a project cost.

Every figure comes from the server: the verified loan logic (backend/loan.py), the verified
business data and advice rules (backend/businesses.py), and the gap list (backend/feasibility.py).
Each figure is printed with its tag ([S#] source / CALCULATED / ASSUMED). This is an advisory
document, not a loan sanction.

Fonts: DejaVu Sans (backend/fonts, licence in backend/fonts/LICENSE-DejaVu.txt), so the rupee sign prints.
"""

import io
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import Response
from pydantic import ValidationError
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from backend import businesses, dossier_figures, feasibility, loan
from backend.compat import NAMES, _body, _error, _validation_message, _whole_rupees
from backend.schemas import LoanRequest

router = APIRouter()

FONTS = Path(__file__).resolve().parent / "fonts"
pdfmetrics.registerFont(TTFont("DejaVu", str(FONTS / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONTS / "DejaVuSans-Bold.ttf")))

MAX_GAPS_SHOWN = 6


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


def _cut(s, n):
    """Shorten at a word boundary, marked with an ellipsis."""
    s = s.strip('"')
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0] + " …"


def _plain(s):
    """Dossier text without markdown marks (** and backticks) for print."""
    return s.replace("**", "").replace("`", "")


class _Page:
    """Tiny line-layout helper on one A4 page."""

    def __init__(self, c):
        self.c = c
        self.x = 15 * mm
        self.w = A4[0] - 30 * mm
        self.y = A4[1] - 15 * mm

    def text(self, s, size=8.5, bold=False, gap=1.25, indent=0):
        font = "DejaVu-Bold" if bold else "DejaVu"
        words, line = s.split(" "), ""
        for w in words:
            trial = (line + " " + w).strip()
            if pdfmetrics.stringWidth(trial, font, size) > self.w - indent:
                self.c.setFont(font, size)
                self.c.drawString(self.x + indent, self.y, line)
                self.y -= size * gap
                line = w
            else:
                line = trial
        if line:
            self.c.setFont(font, size)
            self.c.drawString(self.x + indent, self.y, line)
            self.y -= size * gap

    def heading(self, s):
        self.y -= 2
        self.text(s, size=10, bold=True)
        self.c.setLineWidth(0.4)
        self.c.line(self.x, self.y + 7, self.x + self.w, self.y + 7)
        self.y -= 2


def _dossier_block(pg, code, req, compact=False):
    """Section 4: the dossier's figures for the size matching the project cost (or the nearest, ASSUMED).
    compact=True (used only if the full page would overflow): sizes list and season line left out."""
    tag = f"[{code} dossier]"
    pg.heading("4. Dossier figures for this business")
    out = dossier_figures.cashflow(code, req)
    tier = out.get("tier")
    if tier is None:
        pg.text(f"Project cost by size: NOT FOUND. {out['reason']} {tag}", size=7.5, indent=4)
    else:
        sizes = "; ".join(f"{t['label']}: " + (inr(t['project_cost']['value']) if t['project_cost'].get('value') else "NOT FOUND")
                          for t in dossier_figures.figures(code)["tiers"])
        if not compact:
            pg.text(f"Sizes in the dossier: {sizes} {tag}", size=7.5, indent=4)
        pg.text(f"Size used: {tier['label']} ({inr(tier['project_cost']['value'])}) {tag}", size=7.5, indent=4)
        for a in out["assumptions"]:
            pg.text(f"{a['text']} [{a['tag']}]", size=7.5, indent=4)
        s = tier["surplus"]
        if s.get("value") is not None:
            per = "a year (Year 3, stabilised)" if s["period"] == "year" else "a month"
            pg.text(f"Surplus ({s['basis']}): {inr(s['value'])} {per} {tag}", size=7.5, indent=4)
        else:
            pg.text(f"Surplus: NOT FOUND {tag}", size=7.5, indent=4)
        if out.get("status") == "ok":
            yrs = ", ".join(f"Year {y['year']}: " + (f"{y['value']:.2f}" if y.get("value") is not None else "NOT FOUND")
                            for y in out["dscr"]["years"])
            pg.text(f"Cash-flow cover (DSCR) as printed in the dossier: {yrs} {tag}. It uses the dossier's own "
                    f"loan instalment, which can differ from section 3.", size=7.5, indent=4)
        else:
            pg.text(f"Cash-flow cover (DSCR): NOT FOUND. {out.get('reason', '')} {tag}", size=7.5, indent=4)
    season = dossier_figures.figures(code)["seasonality"]
    if compact:
        return
    if season.get("status") == "NOT FOUND":
        pg.text(f"Season pattern: NOT FOUND {tag}", size=7.5, indent=4)
    else:
        low = sorted(season["months"], key=lambda m: m["value"])[:3]
        pg.text("Leanest months: " + ", ".join(f"{m['month']} ({m['value']:.2f})" for m in low) + f" {tag}", size=7.5, indent=4)


class PageOverflow(RuntimeError):
    pass


def build_pdf(code, req, answers, applicant=None, notes=()) -> bytes:
    """One page. If the full layout would overflow, it is rebuilt once with fewer gap lines and a shorter
    dossier block (the full lists stay in the feasibility report)."""
    try:
        return _build_pdf(code, req, answers, applicant, notes, compact=False)
    except PageOverflow:
        return _build_pdf(code, req, answers, applicant, notes, compact=True)


def _build_pdf(code, req, answers, applicant=None, notes=(), compact=False) -> bytes:
    has_rules = businesses.check_code(code)  # raises UnknownCode; True = has yes/no questions
    adv = businesses.advice(code, answers)   # raises BadAnswer (the 17 without questions accept no answers)
    out = loan.build_loan(req)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    c.setTitle(f"DPR {code} {NAMES[code]}")
    pg = _Page(c)

    pg.text(f"Detailed Project Report (1 page) — {NAMES[code]} ({code})", size=13, bold=True)
    pg.text(f"Prepared {date.today().isoformat()} by the GraminAI advisory server. Advisory document only: "
            f"this is not a loan sanction. Tags: [S#] = official source (list below), CALCULATED = worked out "
            f"from tagged figures, ASSUMED = our stated assumption, USER INPUT = entered by the applicant, "
            f"{code} dossier = figure from the team's research dossier for this business.", size=7.5)

    pg.heading("1. Applicant and business")
    if applicant:
        pg.text(f"Applicant: {applicant} [USER INPUT]")
    pg.text(f"Business: {NAMES[code]} ({code})" + (f" — {businesses._load(code)['name']}" if has_rules else ""))
    pg.text(f"Scheduled Caste: {'yes' if req.is_sc else 'no'} [USER INPUT, self-declared; certificate to be shown to the SCA]"
            f"   ·   Annual family income: {inr(req.annual_family_income)} [USER INPUT]"
            f"   ·   Project cost: {inr(req.project_cost)} [USER INPUT]")
    for n in notes:
        pg.text(f"Note: {n['text']} [{n['tag']}]", size=7.5)

    pg.heading("2. Eligibility (NSFDC)")
    if out["status"] != "eligible":
        pg.text("Not eligible." if out["status"] == "not_eligible" else "Not covered by the NSFDC loan schemes.", bold=True)
        for r in out["reasons"]:
            pg.text(f"• {r['text']} NSFDC: \"{r['quote']}\" {r['tag']}", size=7.5, indent=6)
    else:
        L, S = out["loan"], out["summary"]
        pg.text(f"Eligible on the answers given: SC (self-declared), family income within ₹5.00 lakh, project within "
                f"₹50.00 lakh [S1]. Scheme: {L['scheme']['value']} {L['scheme']['tag']}.")

        pg.heading("3. Means of finance and repayment")
        rows = [
            ("Project cost", inr(L["project_cost"]["value"]), "USER INPUT"),
            ("NSFDC loan (90% of cost, within the cap [S1], rounded down (ASSUMED))", inr(L["loan_amount"]["value"]), "CALCULATED"),
            ("Own contribution", f"{inr(L['own_contribution']['value'])} ({L['own_contribution_pct']['value']}%)", "CALCULATED"),
            ("Interest rate", f"{L['interest_rate_pa']['value']}% p.a.", L["interest_rate_pa"]["tag"]),
            ("Tenure", f"{L['tenure_years']['value']} years ({L['total_quarters']['value']} quarters)", "ASSUMED: NSFDC says 'within'"),
            ("Pause (moratorium)", f"{L['moratorium_quarters']['value']} quarter(s), interest added to the loan "
             f"({inr(S['interest_added_during_pause']['value'])})", "S1 for the pause; how its interest is handled is ASSUMED"),
            ("Repayment", f"{L['repayment_quarters']['value']} quarterly instalments of "
             f"{inr(S['equated_quarterly_instalment']['value'])}", "CALCULATED"),
            ("Total paid over the loan", inr(S["total_paid"]["value"]), "CALCULATED"),
            ("Total interest cost", inr(S["total_interest_cost"]["value"]), "CALCULATED"),
        ]
        for label, value, tag in rows:
            pg.text(f"{label}: {value}  {_t(tag)}", indent=4)
        sched = out["schedule"]["rows"]
        last = sched[-1]
        m = L["moratorium_quarters"]["value"]
        pause = "Q1" if m == 1 else f"Q1–Q{m}"
        pg.text(f"Quarterly summary: {pause} no payment (pause); "
                f"Q{L['moratorium_quarters']['value'] + 1}–Q{last['quarter'] - 1} {inr(sched[-2]['payment'])} each; "
                f"Q{last['quarter']} {inr(last['payment'])} (final, clears the balance). [CALCULATED]", size=7.5, indent=4)
        for w in out["warnings"]:
            pg.text(f"Warning: {w['text']} {_t(w['tag'])}", size=7.5, indent=4)

    _dossier_block(pg, code, req, compact=compact)

    pg.heading("5. Checks for this business")
    if not has_rules:
        pg.text(businesses.NO_QUESTIONS, size=7.5)
    else:
        done = [r for r in adv["results"] if r["status"] == "result"]
        if not done:
            pg.text("No questions answered yet (answer them in the dashboard to include pollution category, scheme fit and risks).", size=7.5)
        for r in done:
            cat = f"{r['category']}: " if r.get("category") and not r["text"].startswith(r["category"]) else ""
            ev = "; ".join(f"\"{_cut(e['quote'], 110)}\" {e['tag']}{(' ' + e['page']) if e.get('page') else ''}" for e in r["evidence"][:1])
            pg.text(f"• {cat}{r['text']} {_t(r['tag'])}{' (unverified)' if r['unverified'] else ''}"
                    + (f" — {ev}" if ev else ""), size=7.5, indent=4)
        dk = [r for r in adv["results"] if r["status"] == "dont_know"]
        for r in dk:
            pg.text(f"• You said 'don't know': {r['ask']}", size=7.5, indent=4)

    g = feasibility.report(code)["gaps"]
    pg.heading(f"6. Gaps: {len(g)} items NOT FOUND or still open in the dossier")
    shown = 2 if compact else MAX_GAPS_SHOWN
    for x in g[:shown]:
        pg.text(f"• [{x['section']}] {_cut(_plain(x['reason']), 150)}", size=7, indent=4)
    if len(g) > shown:
        pg.text(f"…and {len(g) - shown} more: see the feasibility report (/api/feasibility/{code}).", size=7, indent=4)

    pg.heading("Sources")
    s1 = out["sources"]["[S1]"]
    pg.text(f"[S1] {s1['document']} — {s1['url']} ({s1['note']})", size=7)
    pg.text(f"{code} dossier: {dossier_figures.figures(code)['dossier']} (team research dossier).", size=7)
    if has_rules:
        used = {e["tag"] for r in (adv["results"] if adv else []) if r["status"] == "result" for e in r["evidence"]}
        for s in businesses._load(code)["sources"]:
            if s["tag"] in used and s["tag"] != "[S1]":
                pg.text(f"{s['tag']} {s['title']} — {s['issuer']} — {s['url']}", size=7)

    if pg.y < 12 * mm:
        raise PageOverflow("DPR content does not fit on one page")
    c.showPage()
    c.save()
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
        applicant = body.get("applicantName")
        applicant = str(applicant)[:80] if applicant else None
        pdf = build_pdf(code, req, answers, applicant, notes)
    except businesses.BadAnswer as exc:
        return _error(str(exc), 400)
    except PageOverflow as exc:
        return _error(str(exc), 500)
    except ValidationError as exc:  # before ValueError: pydantic's error is a ValueError
        return _error(_validation_message(exc), 400)
    except ValueError as exc:
        return _error(str(exc), 400)
    except loan.InternalCheckError as exc:
        return _error("Internal consistency check failed; no figures returned.", 500, details=str(exc))
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="DPR_{code}.pdf"'})
