"""
Dashboard chatbot: POST /api/chat.

The AI (Groq, Llama) only understands the user and writes sentences. Every figure comes from
the server's own tools (verified loan logic, verified business data and rules, feasibility).

Number guard: every number in the AI's reply must appear in this conversation's tool results or
in the user's own messages, after format conversion (Indian commas, lakh/crore, Hindi digits,
per cent vs fraction, rounding to the rupee). Otherwise the reply is replaced with a plain summary
built from the tool results.

The server keeps no memory: the website sends the whole conversation each time.
Key: GROQ_API_KEY environment variable, or the gitignored root .env file (read fresh on every call,
so a key added later works without a restart). The key is never logged or returned.
"""

import asyncio
import json
import logging
import math
import os
import re
import time
from pathlib import Path

import httpx
from fastapi import APIRouter, Request

from backend import businesses, dossier_figures, feasibility, loan
from backend.compat import NAMES, _body, _error, _whole_rupees
from backend.schemas import LoanRequest

router = APIRouter()
log = logging.getLogger("udyamsetuai.chat")
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"   # gitignored; GROQ_API_KEY=...

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
# Checked against the team key's Groq model list on 11 Nov 2026: no Llama chat model is offered on it.
# Chosen by the team: OpenAI's open-weight 120B model, which called the chat's tools correctly for a Hindi request.
MODEL = "openai/gpt-oss-120b"
MAX_TOOL_ROUNDS = 5
# Groq's free tier on the team key allows 8,000 tokens a minute for this model, and every tool round
# re-sends the whole conversation, so the model gets only recent messages and compact tool results.
MAX_HISTORY = 8          # most recent user/assistant messages sent to the model
MAX_TOOL_CHARS = 2500    # each tool result, as compact JSON
MAX_ASSISTANT_CHARS = 500  # earlier assistant replies, shortened in the history sent to the model
MAX_RATE_WAIT_S = 30.0   # longest wait after a 429 before the one retry
MAX_TURNS = 30
TIMEOUT_S = 30.0

SYSTEM = """You are the UdyamSetuAI assistant for Scheduled Caste (SC) rural entrepreneurs in India, inside a loan-advice dashboard.
Your job: find the user's business, ask that business's yes/no questions, work out the NSFDC loan, explain results, and offer the 1-page DPR (bank report).

Hard rules:
1. NEVER state a number (amount, rate, count, year, percentage) unless it appears in a tool result in this conversation or the user said it. Do not do arithmetic yourself. If you need a figure, call a tool.
2. If an amount the user gives is ambiguous (total project cost, or their own money?), ASK which it is. Never guess.
2a. As soon as you know the project cost, the yearly family income and whether the user is SC, call calculate_loan immediately and give the loan before any business questions. If one of the three is missing, ask only for what is missing, then calculate. If the user gives a new amount, call calculate_loan again with it. If the loan is already known and the user asks something else, answer that; mention the payment at most once.
3. All 24 businesses are listed by list_businesses. Their figures (sizes, project cost, surplus, the dossier's own cash-flow cover, season) come from dossier_figures and are labelled with the business's dossier, e.g. "D08 dossier": say so. Only some businesses have yes/no questions; get_questions tells you. If a figure is NOT FOUND, say so.
3a. Never ask the user for a business code: users do not know codes. Ask what business they run, in their own words, and find it with list_businesses. Say the business name first, e.g. "Oil Expellers (D08 dossier)".
4. Use question ids and answer choices exactly as get_questions returns them.
5. Reply in the user's language (Hindi or English). Be short and plain: rural users, low literacy. Keep each reply under 80 words and ask at most 2 questions at a time.
6. Say when something is an assumption or NOT FOUND, as the tool results say.
7. To give the DPR, call dpr_link and tell the user to press the Download DPR button.
8. Use the dashboard's plain words: say "payment every 3 months", not "quarterly instalment"; say "pause (no payment)", not "moratorium". Never say "quarter" or "quarterly"; in Hindi say "हर 3 महीने", never "तिमाही". When you give the loan, give the payment every 3 months (paymentEvery3Months).
9. Do not list documents, other schemes or steps unless a tool result in this conversation gives them; if asked, say the dashboard does not have that list yet."""

# Stage A: the chat panel sends the language the user picked; rule 10 is added to the rules.
# Stage A follow-up (12 Nov 2026): it may also send what the dashboard already shows (the
# "context"), added as rule 11, because the chat asked a user for income and SC status that
# My account already held. With neither (older callers), the prompt is exactly SYSTEM.
LANGUAGES = {"hi": "Hindi", "en": "English"}

# The only context fields accepted. The business name is looked up here from NAMES, never taken
# from the browser, so no text a browser sends ends up inside the AI's instructions.
CONTEXT_FIELDS = ("code", "projectCost", "familyIncome", "isSc")
# Review, 12 Nov 2026: a 400-digit whole number crashed the server (500, OverflowError in
# math.isfinite) instead of being refused. Nothing real is above 1 lakh crore rupees (10^12).
MAX_CONTEXT_RUPEES = 10 ** 12


def _finite_number(v):
    # True/False are ints in Python, and json.loads accepts NaN and Infinity: refuse all three.
    # The size check comes first: it compares a huge int exactly, where isfinite would overflow.
    return (isinstance(v, (int, float)) and not isinstance(v, bool)
            and abs(v) <= MAX_CONTEXT_RUPEES and math.isfinite(v))


def check_context(raw):
    """The dashboard's context, checked: (context dict, None) or (None, error text).
    No context (missing or null) is an empty one. A business code the server does not know is
    dropped, not refused: a website and server out of step must not stop the whole chat."""
    if raw is None:
        return {}, None
    if not isinstance(raw, dict):
        return None, "'context' must be an object"
    unknown = sorted(set(raw) - set(CONTEXT_FIELDS))
    if unknown:
        return None, f"'context' has unknown field(s): {', '.join(unknown)}"
    ctx = {}
    if "code" in raw:
        code = raw["code"].strip().upper() if isinstance(raw["code"], str) else None
        if code in NAMES:
            ctx["code"] = code
    if "projectCost" in raw:
        if not _finite_number(raw["projectCost"]) or raw["projectCost"] <= 0:
            return None, "'context.projectCost' must be a number above 0, up to 10^12"
        ctx["projectCost"] = raw["projectCost"]
    if "familyIncome" in raw:
        if not _finite_number(raw["familyIncome"]) or raw["familyIncome"] < 0:
            return None, "'context.familyIncome' must be a number of 0 or more, up to 10^12"
        ctx["familyIncome"] = raw["familyIncome"]
    if "isSc" in raw:
        if not isinstance(raw["isSc"], bool):
            return None, "'context.isSc' must be true or false"
        ctx["isSc"] = raw["isSc"]
    return ctx, None


def _plain(v):
    # Rupees to the paisa, never computer notation: 1e-05 was written as "1e-05" (review, 12 Nov 2026).
    return f"{v:.2f}".rstrip("0").rstrip(".")


def _context_line(ctx):
    known = []
    if "code" in ctx:
        known.append(f"business {NAMES[ctx['code']]} ({ctx['code']})")
    if "projectCost" in ctx:
        known.append(f"total project cost {_plain(ctx['projectCost'])} rupees")
    if "familyIncome" in ctx:
        known.append(f"yearly family income {_plain(ctx['familyIncome'])} rupees")
    if "isSc" in ctx:
        known.append(f"Scheduled Caste: {'yes' if ctx['isSc'] else 'no'}")
    return ("\n11. What the dashboard already has (the user's own entries, self-declared): "
            + "; ".join(known) + ". Use these; do not ask for them again.")


def system_prompt(language=None, context=None):
    prompt = SYSTEM
    if language in LANGUAGES:
        script = " (Devanagari script)" if language == "hi" else ""
        prompt += f"\n10. The user chose {LANGUAGES[language]}: answer only in {LANGUAGES[language]}{script}, whatever language they type in."
    if context:
        prompt += _context_line(context)
    return prompt


# ---------------------------------------------------------------------------
# tools (each returns plain JSON from the server's own modules)
# ---------------------------------------------------------------------------

def _t_list_businesses():
    return {"businesses": [{"code": c, "name": NAMES[c], "status": "verified",
                            "has_questions": c in businesses.VERIFIED}
                           for c in businesses.ALL_CODES]}


# Keys only for checking figures against the dossier: never sent to the model (line numbers would
# otherwise become "allowed" numbers for the number guard).
_HIDDEN = {"line", "as_written", "source_tag", "dossier", "raw"}


def _public(x):
    if isinstance(x, dict):
        return {k: _public(v) for k, v in x.items() if k not in _HIDDEN}
    if isinstance(x, list):
        return [_public(v) for v in x]
    return x


def _t_dossier_figures(code, project_cost=None):
    code = str(code).strip().upper()
    if code not in NAMES:
        return {"error": f"unknown code {code}"}
    f = dossier_figures.figures(code)
    if project_cost is None:
        return _public({"code": code, "name": NAMES[code], "tiers": f["tiers"], "seasonality": f["seasonality"]})
    notes = []
    cost = _whole_rupees(project_cost, "project_cost", notes)
    out = dossier_figures.cashflow(code, LoanRequest(project_cost=cost, is_sc=True, annual_family_income=0))
    out["assumptions"] = notes + out.get("assumptions", [])
    return _public(out)


def _t_business_summary(code):
    code = str(code).strip().upper()
    if code not in NAMES:
        return {"error": f"unknown code {code}"}
    if code not in businesses.VERIFIED:
        f = dossier_figures.figures(code)
        return _public({"code": code, "name": NAMES[code], "status": "verified", "questions": [],
                        "tiers": [{"label": t["label"], "project_cost": t["project_cost"]} for t in f["tiers"]]})
    d = businesses._load(code)
    return {"code": code, "name": NAMES[code], "description": d["name"], "status": "verified",
            "sections": [s["title"] for s in d["sections"]],
            "questions": [q["id"] for q in d["questions"]]}


def _t_get_questions(code):
    code = str(code).strip().upper()
    if code not in NAMES:
        return {"code": code, "status": "unknown"}
    if code not in businesses.VERIFIED:
        return {"code": code, "questions": [], "note": businesses.NO_QUESTIONS}
    return {"code": code, "questions": businesses.detail(code)["questions"]}


def _t_run_advice(code, answers=None):
    code = str(code).strip().upper()
    try:
        out = businesses.advice(code, answers or {})
    except businesses.UnknownCode:
        return {"error": f"unknown code {code}"}
    except businesses.BadAnswer as exc:
        return {"error": str(exc)}
    if out.get("status") != "verified":
        return out
    keep = ("rule", "status", "category", "text", "tag", "unverified", "ask", "blocking_question")
    return {"code": code, "results": [{k: r.get(k) for k in keep if r.get(k) is not None} for r in out["results"]],
            "unanswered": out["unanswered"]}


def _t_calculate_loan(project_cost, family_income, is_sc):
    notes = []
    cost = _whole_rupees(project_cost, "project_cost", notes)
    income = _whole_rupees(family_income, "family_income", notes)
    if not isinstance(is_sc, bool):
        raise ValueError("is_sc must be true or false")
    out = loan.build_loan(LoanRequest(project_cost=cost, is_sc=is_sc, annual_family_income=income))
    if out["status"] != "eligible":
        return {"isEligible": False, "status": out["status"],
                "projectCost": cost, "familyIncome": income, "isSc": is_sc,
                "reasons": [{"text": r["text"], "quote": r["quote"], "tag": r["tag"]} for r in out["reasons"]],
                "tags": {"projectCost": "USER INPUT", "familyIncome": "USER INPUT", "isSc": "USER INPUT"},
                "notes": notes}
    L, S = out["loan"], out["summary"]
    return {
        "isEligible": True,
        "scheme": L["scheme"]["value"],
        "projectCost": cost,
        "familyIncome": income,
        "isSc": is_sc,
        "loanAmount": L["loan_amount"]["value"],
        "ownContribution": L["own_contribution"]["value"],
        "interestRatePa": L["interest_rate_pa"]["value"],
        "tenureYears": L["tenure_years"]["value"],
        # Plain field names (12 Nov 2026): the AI copied "pauseQuarters" into a reply as "First 2
        # quarters: pause", against rule 8. A quarter is 3 months, so pauseMonths is pausePayments x 3.
        "pausePayments": L["moratorium_quarters"]["value"],
        "pauseMonths": L["moratorium_quarters"]["value"] * 3,
        "numberOfPayments": L["repayment_quarters"]["value"],
        "paymentEvery3Months": S["equated_quarterly_instalment"]["value"],
        "interestAddedDuringPause": S["interest_added_during_pause"]["value"],
        "totalPaid": S["total_paid"]["value"],
        "tags": {"projectCost": "USER INPUT", "familyIncome": "USER INPUT", "isSc": "USER INPUT",
                 "loanAmount": L["loan_amount"]["tag"],
                 "ownContribution": L["own_contribution"]["tag"], "interestRatePa": L["interest_rate_pa"]["tag"],
                 "tenureYears": L["tenure_years"]["tag"], "pausePayments": L["moratorium_quarters"]["tag"],
                 # no digit in this label: the guard also accepts numbers written in labels
                 "pauseMonths": "CALCULATED (pause payments times three)",
                 "numberOfPayments": L["repayment_quarters"]["tag"], "paymentEvery3Months": "CALCULATED",
                 "interestAddedDuringPause": "CALCULATED (pause handling ASSUMED)", "totalPaid": "CALCULATED"},
        "warnings": [w["text"] for w in out["warnings"]],
        "notes": notes,
    }


def _t_feasibility(code):
    code = str(code).strip().upper()
    try:
        r = feasibility.report(code)
    except businesses.UnknownCode:
        return {"error": f"unknown code {code}"}
    if r["status"] != "verified":
        return r
    return {"code": code, "sections": [s["title"] for s in r["sections"]],
            "gapCount": len(r["gaps"]),
            "firstGaps": [g["reason"][:120] for g in r["gaps"][:5]],
            "link": f"/api/feasibility/{code}"}


def _t_dpr_link(code, project_cost, family_income, is_sc, answers=None):
    code = str(code).strip().upper()
    if code not in NAMES:
        return {"error": f"unknown code {code}"}
    return {"action": "download_dpr", "endpoint": "/api/dpr",
            "body": {"code": code, "projectCost": project_cost, "familyIncome": family_income,
                     "isSc": is_sc, "answers": answers or {}}}


TOOLS = {
    "list_businesses": (_t_list_businesses, "List all 24 business codes with name and verified status.", {}),
    "business_summary": (_t_business_summary, "Short summary of one business (code like D20).",
                         {"code": {"type": "string"}}),
    "get_questions": (_t_get_questions, "The yes/no questions for a verified business, with answer choices.",
                      {"code": {"type": "string"}}),
    "run_advice": (_t_run_advice, "Run a business's rules on the user's answers (question id -> choice).",
                   {"code": {"type": "string"}, "answers": {"type": "object"}}),
    "calculate_loan": (_t_calculate_loan, "NSFDC eligibility and loan for a project cost, family income and SC status.",
                       {"project_cost": {"type": "number"}, "family_income": {"type": "number"},
                        "is_sc": {"type": "boolean"}}),
    "dossier_figures": (_t_dossier_figures, "A business's dossier figures: sizes with project cost, surplus, the dossier's own "
                        "cash-flow cover (DSCR) and season. Give project_cost to get the matching (or nearest) size.",
                        {"code": {"type": "string"}, "project_cost": {"type": "number"}}),
    "feasibility": (_t_feasibility, "Feasibility report summary (sections and gaps) for a verified business.",
                    {"code": {"type": "string"}}),
    "dpr_link": (_t_dpr_link, "Prepare the 1-page DPR download for the user.",
                 {"code": {"type": "string"}, "project_cost": {"type": "number"}, "family_income": {"type": "number"},
                  "is_sc": {"type": "boolean"}, "answers": {"type": "object"}}),
}
REQUIRED = {"dossier_figures": ["code"], "business_summary": ["code"], "get_questions": ["code"], "run_advice": ["code"],
            "calculate_loan": ["project_cost", "family_income", "is_sc"], "feasibility": ["code"],
            "dpr_link": ["code", "project_cost", "family_income", "is_sc"]}


def tool_specs():
    return [{"type": "function", "function": {
        "name": name, "description": desc,
        "parameters": {"type": "object", "properties": props, "required": REQUIRED.get(name, [])}}}
        for name, (_, desc, props) in TOOLS.items()]


def run_tool(name, raw_args):
    if name not in TOOLS:
        return {"error": f"unknown tool {name}"}
    try:
        args = json.loads(raw_args or "{}")
        if not isinstance(args, dict):
            raise ValueError("arguments must be an object")
        return TOOLS[name][0](**args)
    except loan.InternalCheckError as exc:
        return {"error": f"internal check failed: {exc}"}
    except Exception as exc:  # any odd argument from the model goes back to it as an error, never crashes the chat
        return {"error": f"bad arguments for {name}: {type(exc).__name__}: {exc}"[:300]}


# Laptop test, 12 Nov 2026: asked "What will my payment be?" with cost, income and SC all on the
# dashboard, the chat said the amount was not available. The server keeps nothing between messages
# and the AI did not call the calculator again, although rule 2a tells it to. So when the context
# holds all three, the server works the loan out itself and hands it over as an answered call,
# added at the end of the conversation it sends (normally right after the user's latest message).
# It is kept out of the 5-call limit and out of what the website gets (the website jumps to the
# loan tab on a calculate_loan result), but the number guard and both fallback replies use it.
SERVER_LOAN_ID = "server_loan"


def _server_loan(context):
    """(arguments, result) of the server's own loan calculation, or (None, None)."""
    if not context or not all(k in context for k in ("projectCost", "familyIncome", "isSc")):
        return None, None
    args = json.dumps({"project_cost": context["projectCost"], "family_income": context["familyIncome"],
                       "is_sc": context["isSc"]})
    res = run_tool("calculate_loan", args)          # run_tool turns any failure into {"error": ...}
    if not isinstance(res, dict) or "error" in res:
        return None, None                            # carry on without it, as before
    return args, res


# ---------------------------------------------------------------------------
# number guard
# ---------------------------------------------------------------------------

HINDI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
# A number not glued to letters, tags or other digits: "D20", "[S7]", "Q2" and "p.27" are codes, not amounts.
NUM = re.compile(r"(?<![A-Za-z\[\]\d.,])(-)?(\d[\d,]*(?:\.\d+)?)(?![A-Za-z]*\d*\])\s*(lakh|lac|crore|cr|लाख|करोड़|%)?", re.I)
EN_WORDS = (r"one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|"
            r"seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand")
EN_UNITS = r"lakhs?|crores?|thousand|hundred|percent|per cent|rupees|years?|months?|quarters?|instal?ments?|installments?"
HI_WORDS = r"एक|दो|तीन|चार|पांच|पाँच|छह|छः|सात|आठ|नौ|दस|बीस|तीस|चालीस|पचास|सौ|हज़ार|हजार"
HI_UNITS = r"लाख|करोड़|हज़ार|हजार|सौ|प्रतिशत|रुपये|रुपए|साल|वर्ष|महीने|किस्त|किस्तें"
NUM_WORDS = re.compile(rf"\b(?:{EN_WORDS})\s+(?:{EN_UNITS})\b|(?:{HI_WORDS})\s*(?:{HI_UNITS})", re.I)


def numbers_in(text):
    """Every number in a text as (value, raw). Lakh/crore multiply; Hindi digits converted; sign kept."""
    t = str(text).translate(HINDI_DIGITS)
    out = []
    for m in NUM.finditer(t):
        sign, raw, unit = m.group(1), m.group(2).rstrip(","), (m.group(3) or "").lower()
        try:
            v = float(raw.replace(",", ""))
        except ValueError:
            continue
        if unit in ("lakh", "lac", "लाख"):
            v *= 100000
        elif unit in ("crore", "cr", "करोड़"):
            v *= 10000000
        if sign:
            v = -v
        out.append((round(v, 4), m.group(0)))
    return out


def _walk_values(node, acc):
    if isinstance(node, bool):
        return
    if isinstance(node, (int, float)):
        acc.add(round(float(node), 4))
    elif isinstance(node, str):
        for v, _ in numbers_in(node):
            acc.add(v)
    elif isinstance(node, dict):
        for k, v in node.items():
            _walk_values(k, acc)
            _walk_values(v, acc)
    elif isinstance(node, list):
        for v in node:
            _walk_values(v, acc)


def allowed_numbers(tool_results, user_texts):
    base = set()
    _walk_values(tool_results, base)
    for t in user_texts:
        for v, _ in numbers_in(t):
            base.add(v)
    allowed = set()
    for v in base:
        allowed.update({v, round(v, 2), float(math.floor(v)), float(round(v))})
        if 0 < v < 1:
            allowed.add(round(v * 100, 4))       # fraction -> per cent (0.065 -> 6.5)
        if v >= 1000:
            allowed.add(round(v / 100000, 4))    # rupees -> lakh (written without the word)
    return allowed


# "1-page DPR" / "1-पेज" names the report, it is not a figure (owner's decision, 12 Nov 2026).
# Only a lone 1 (or १) right before "page"/"पेज"/"पृष्ठ"; every other number is still checked.
ONE_PAGE = re.compile(r"(?<![\d.,])[1१]\s*[-\u2010\u2011\u2013]?\s*(?=(?:page|पेज|पृष्ठ))", re.I)
# Rule 8's own words, "every 3 months" / "हर 3 महीने", are not a figure (review finding, owner's
# ruling 12 Nov 2026). Only this exact phrase; any other 3 is still checked.
EVERY_3_MONTHS = re.compile(r"\b(every)\s+3\s+(months?)\b|(हर)\s*[3३]\s*(महीने|महीनों)", re.I)
LIST_MARKER = re.compile(r"(?m)^(\s*(?:\*\*)?)\d{1,2}[.)](?=\s)")


def unsupported(text, allowed):
    """Numbers in the AI's text that the tools or the user did not give. Number words always count as unsupported.
    List numbering at the start of a line ("1." or "2)") is not a figure; everything after it is still checked."""
    text = LIST_MARKER.sub(lambda m: m.group(1) + "•", str(text))
    text = ONE_PAGE.sub("one-", text)
    text = EVERY_3_MONTHS.sub("every quarter", text)  # removed before checking; never shown to the user
    bad = [m.group(0) for m in NUM_WORDS.finditer(text)]
    for v, _ in numbers_in(text):
        if v in allowed or round(v, 2) in allowed:
            continue
        bad.append(int(v) if v == int(v) else v)
    return bad


def _plain_summary(tool_results, language=None):
    """A safe reply built only from the tools' own words and figures."""
    if language == "hi":
        return _plain_summary_hi(tool_results)
    lines = []
    for t in tool_results:
        r = t["result"]
        if t["tool"] == "calculate_loan" and r.get("isEligible"):
            from backend.dpr import inr
            lines.append(f"{r['scheme']}: loan {inr(r['loanAmount'])}, your share {inr(r['ownContribution'])}, "
                         f"{r['interestRatePa']}% a year, {r['numberOfPayments']} payments of "
                         f"{inr(r['paymentEvery3Months'])}, one every 3 months.")
        elif t["tool"] == "calculate_loan" and r.get("isEligible") is False:
            lines += [x["text"] for x in r.get("reasons", [])]
        elif t["tool"] == "run_advice":
            lines += [x["text"] for x in r.get("results", []) if x.get("status") == "result"]
        elif t["tool"] == "dossier_figures" and r.get("tier"):
            from backend.dpr import inr
            pc = r["tier"]["project_cost"]
            if pc.get("value"):
                lines.append(f"{r['code']} dossier, {r['tier']['label']}: project cost {inr(pc['value'])}.")
            if r.get("status") == "ok":
                yrs = [f"Year {y['year']}: ₹{y['value']}" for y in r["dscr"]["years"] if y.get("value") is not None]
                lines.append(f"Earnings for every ₹1 of loan payment ({r['code']} research file): {', '.join(yrs)}.")
            elif r.get("reason"):
                lines.append(f"Can the business repay: NOT FOUND ({r['reason']})")
    if not lines:
        lines = ["I can only give figures that the server has calculated. Please tell me your business and project cost."]
    return " ".join(lines)


def _plain_summary_hi(tool_results):
    """The same safe reply in Hindi (Stage A). The tools' own reason texts are in English and are
    passed through as they are: nothing is machine-translated."""
    from backend.dpr import inr
    lines = []
    for t in tool_results:
        r = t["result"]
        if t["tool"] == "calculate_loan" and r.get("isEligible"):
            lines.append(f"{r['scheme']}: लोन {inr(r['loanAmount'])}, आपका हिस्सा {inr(r['ownContribution'])}, "
                         f"ब्याज {r['interestRatePa']}% सालाना, हर 3 महीने पर {inr(r['paymentEvery3Months'])} की "
                         f"{r['numberOfPayments']} किस्तें।")
        elif t["tool"] == "calculate_loan" and r.get("isEligible") is False:
            lines.append("NSFDC लोन नहीं मिल सकता:")
            lines += [x["text"] for x in r.get("reasons", [])]
        elif t["tool"] == "run_advice":
            lines += [x["text"] for x in r.get("results", []) if x.get("status") == "result"]
        elif t["tool"] == "dossier_figures" and r.get("tier"):
            pc = r["tier"]["project_cost"]
            if pc.get("value"):
                lines.append(f"{r['code']} रिसर्च फ़ाइल, {r['tier']['label']}: प्रोजेक्ट लागत {inr(pc['value'])}।")
            if r.get("status") == "ok":
                yrs = [f"वर्ष {y['year']}: ₹{y['value']}" for y in r["dscr"]["years"] if y.get("value") is not None]
                lines.append(f"कर्ज़ की हर ₹1 किस्त पर व्यवसाय की कमाई (रिसर्च फ़ाइल): {', '.join(yrs)}।")
            elif r.get("reason"):
                lines.append(f"कर्ज़ चुकाने की क्षमता: जानकारी नहीं है ({r['reason']})")
    if not lines:
        lines = ["मैं सिर्फ़ वही आँकड़े बता सकता हूँ जो सर्वर ने निकाले हैं। कृपया अपना व्यवसाय और प्रोजेक्ट की लागत बताइए।"]
    return " ".join(lines)


# ---------------------------------------------------------------------------
# Groq
# ---------------------------------------------------------------------------

def _api_key():
    """The key from the environment, else from the .env file, read fresh each call."""
    key = (os.environ.get("GROQ_API_KEY") or "").strip()
    if key:
        return key
    try:
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            k, sep, v = line.partition("=")
            if sep and k.strip() == "GROQ_API_KEY":
                v = v.strip().strip('"').strip("'")
                return v or None
    except OSError:
        pass
    return None


class KeyRejected(Exception):
    pass


def _call_model(messages, tools):
    r = httpx.post(GROQ_URL, timeout=TIMEOUT_S,
                   headers={"Authorization": f"Bearer {_api_key()}", "Content-Type": "application/json"},
                   json={"model": MODEL, "messages": messages, "tools": tools, "tool_choice": "auto",
                         "temperature": 0.2, "max_tokens": 600, "reasoning_effort": "low"})
    r.raise_for_status()
    return r.json()["choices"][0]["message"]


def _rate_limit_wait(headers):
    """Seconds to wait after a 429: Groq's retry-after, else its token reset time ("12.5s", "1m3.2s"), capped."""
    def seconds(v):
        m = re.fullmatch(r"(?:(\d+)m)?(\d+(?:\.\d+)?)s", str(v).strip())
        if m:
            return int(m.group(1) or 0) * 60 + float(m.group(2))
        return float(v)
    for key in ("retry-after", "x-ratelimit-reset-tokens"):
        if headers.get(key):
            try:
                return min(max(seconds(headers[key]), 0.5), MAX_RATE_WAIT_S)
            except ValueError:
                pass
    return 2.0


def _model_with_retry(messages, tools):
    """One retry. A rejected key (401/403) is not retried; a rate limit (429) waits a little first."""
    try:
        return _call_model(messages, tools)
    except httpx.HTTPStatusError as exc:
        code = exc.response.status_code
        if code in (401, 403):
            log.warning("Groq rejected the API key (HTTP %s)", code)
            raise KeyRejected() from exc
        log.warning("Groq HTTP %s; retrying once", code)
        if code == 429:
            time.sleep(_rate_limit_wait(exc.response.headers))
    except Exception as exc:
        log.warning("Groq call failed (%s); retrying once", type(exc).__name__)
    return _call_model(messages, tools)  # a second failure propagates


OFFLINE = ("The AI assistant is offline right now. You can still use the dashboard: choose your business, "
           "answer its questions, and use the loan calculator.")
OFFLINE_HI = ("AI सहायक अभी बंद है। आप डैशबोर्ड फिर भी इस्तेमाल कर सकते हैं: अपना व्यवसाय चुनें, "
              "उसके सवालों के जवाब दें, और लोन कैलकुलेटर इस्तेमाल करें।")
KEY_REJECTED = ("The AI key was rejected. Ask the team to check GROQ_API_KEY. "
                "You can still use the dashboard's loan calculator.")
KEY_REJECTED_HI = ("AI की चाबी (key) नहीं मानी गई। टीम से GROQ_API_KEY जाँचने को कहें। "
                   "लोन कैलकुलेटर फिर भी चलता है।")


@router.post("/api/chat")
async def chat_endpoint(request: Request):
    body, err = await _body(request)
    if err:
        return err
    msgs = body.get("messages")
    if not isinstance(msgs, list) or not msgs or len(msgs) > MAX_TURNS:
        return _error(f"'messages' must be a list of 1 to {MAX_TURNS} messages", 400)
    convo = []
    for m in msgs:
        if not isinstance(m, dict) or m.get("role") not in ("user", "assistant") or not isinstance(m.get("content"), str):
            return _error("each message needs role 'user' or 'assistant' and text content", 400)
        convo.append({"role": m["role"], "content": m["content"][:2000]})
    user_texts = [m["content"] for m in convo if m["role"] == "user"]
    language = body.get("language")
    if language is not None and (not isinstance(language, str) or language not in LANGUAGES):
        return _error("'language' must be 'hi' or 'en'", 400)
    context = None
    if "context" in body:
        context, bad_context = check_context(body["context"])
        if bad_context:
            return _error(bad_context, 400)
    offline = OFFLINE_HI if language == "hi" else OFFLINE

    if not _api_key():
        return {"status": "ai_offline", "reply": offline, "tool_results": [], "guard": {"replaced": False}, "model": None}

    history = [dict(m, content=m["content"][:MAX_ASSISTANT_CHARS] + ("…" if len(m["content"]) > MAX_ASSISTANT_CHARS else ""))
               if m["role"] == "assistant" else m for m in convo[-MAX_HISTORY:]]
    messages = [{"role": "system", "content": system_prompt(language, context)}] + history
    loan_args, server_loan = _server_loan(context)
    if server_loan is not None:
        messages.append({"role": "assistant", "content": "", "tool_calls": [{
            "id": SERVER_LOAN_ID, "type": "function",
            "function": {"name": "calculate_loan", "arguments": loan_args}}]})
        messages.append({"role": "tool", "tool_call_id": SERVER_LOAN_ID,
                         "content": json.dumps(server_loan, separators=(",", ":"), ensure_ascii=False)[:MAX_TOOL_CHARS]})
    tools = tool_specs()
    results = []
    reply = None
    try:
        for _ in range(MAX_TOOL_ROUNDS + 1):
            if len(results) >= MAX_TOOL_ROUNDS:
                break  # limit reached: no further model call
            # the Groq call blocks; run it off the event loop so other requests are served meanwhile
            msg = await asyncio.to_thread(_model_with_retry, messages, tools)
            calls = msg.get("tool_calls") or []
            if not calls:
                reply = msg.get("content") or ""
                break
            calls = calls[:MAX_TOOL_ROUNDS - len(results)]  # only calls we will answer are sent back
            messages.append({"role": "assistant", "content": msg.get("content") or "", "tool_calls": calls})
            for c in calls:
                name = c.get("function", {}).get("name")
                res = run_tool(name, c.get("function", {}).get("arguments"))
                results.append({"tool": name, "result": res})
                messages.append({"role": "tool", "tool_call_id": c.get("id", ""),
                                 "content": json.dumps(res, separators=(",", ":"), ensure_ascii=False)[:MAX_TOOL_CHARS]})
    except KeyRejected:
        return {"status": "ai_key_rejected", "reply": KEY_REJECTED_HI if language == "hi" else KEY_REJECTED, "tool_results": results,
                "guard": {"replaced": False}, "model": MODEL}
    except Exception as exc:
        log.warning("chat failed: %s", type(exc).__name__)
        return {"status": "ai_offline", "reply": offline, "tool_results": results, "guard": {"replaced": False}, "model": MODEL}

    # The fallback replies show the loan once: the AI's own calculation if it got one (the user may
    # have typed a new amount), otherwise the server's.
    ai_loan = any(r["tool"] == "calculate_loan" and isinstance(r["result"], dict) and "isEligible" in r["result"]
                  for r in results)
    summary_from = results if ai_loan or server_loan is None else [{"tool": "calculate_loan", "result": server_loan}] + results
    if reply is None:
        reply = _plain_summary(summary_from, language)
    # The context's numbers are the user's own entries, so the reply may repeat them. They go in
    # as numbers, not text: a huge value written as text ("1e+21") would wrongly allow 1 and 21.
    # The server's loan figures are allowed too (owner's decision G-5, 12 Nov 2026).
    known = [r["result"] for r in results] + [context or {}] + ([server_loan] if server_loan is not None else [])
    bad = unsupported(reply, allowed_numbers(known, user_texts))
    guard = {"replaced": bool(bad), "unsupported": bad}
    if bad:
        reply = _plain_summary(summary_from, language)
    return {"status": "ok", "reply": reply, "tool_results": results, "guard": guard, "model": MODEL}
