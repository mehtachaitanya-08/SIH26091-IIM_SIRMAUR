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

from backend import businesses, feasibility, loan
from backend.compat import NAMES, _body, _error, _whole_rupees
from backend.schemas import LoanRequest

router = APIRouter()
log = logging.getLogger("graminai.chat")
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"   # gitignored; GROQ_API_KEY=...

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"  # NOT YET CONFIRMED: to be checked against Groq's model list once the key is added
MAX_TOOL_ROUNDS = 5
MAX_TURNS = 30
TIMEOUT_S = 30.0

SYSTEM = """You are the GraminAI assistant for Scheduled Caste (SC) rural entrepreneurs in India, inside a loan-advice dashboard.
Your job: find the user's business, ask that business's yes/no questions, work out the NSFDC loan, explain results, and offer the 1-page DPR (bank report).

Hard rules:
1. NEVER state a number (amount, rate, count, year, percentage) unless it appears in a tool result in this conversation or the user said it. Do not do arithmetic yourself. If you need a figure, call a tool.
2. If an amount the user gives is ambiguous (total project cost, or their own money?), ASK which it is. Never guess.
3. Verified businesses are listed by list_businesses with status "verified". For any other business, say its details are "not yet verified", but you can still calculate the NSFDC loan (the loan rules do not depend on the business).
4. Use question ids and answer choices exactly as get_questions returns them.
5. Reply in the user's language (Hindi or English). Be short and plain: rural users, low literacy.
6. Say when something is an assumption or NOT FOUND, as the tool results say.
7. To give the DPR, call dpr_link and tell the user to press the Download DPR button."""


# ---------------------------------------------------------------------------
# tools (each returns plain JSON from the server's own modules)
# ---------------------------------------------------------------------------

def _t_list_businesses():
    return {"businesses": [{"code": c, "name": NAMES[c],
                            "status": "verified" if c in businesses.VERIFIED else "not_yet_verified"}
                           for c in businesses.ALL_CODES]}


def _t_business_summary(code):
    code = str(code).strip().upper()
    if code not in NAMES:
        return {"error": f"unknown code {code}"}
    if code not in businesses.VERIFIED:
        return {"code": code, "name": NAMES[code], "status": "not_yet_verified"}
    d = businesses._load(code)
    return {"code": code, "name": NAMES[code], "description": d["name"], "status": "verified",
            "sections": [s["title"] for s in d["sections"]],
            "questions": [q["id"] for q in d["questions"]]}


def _t_get_questions(code):
    code = str(code).strip().upper()
    if code not in businesses.VERIFIED:
        return {"code": code, "status": "not_yet_verified" if code in NAMES else "unknown"}
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
                "reasons": [{"text": r["text"], "quote": r["quote"], "tag": r["tag"]} for r in out["reasons"]],
                "notes": notes}
    L, S = out["loan"], out["summary"]
    return {
        "isEligible": True,
        "scheme": L["scheme"]["value"],
        "projectCost": cost,
        "loanAmount": L["loan_amount"]["value"],
        "ownContribution": L["own_contribution"]["value"],
        "interestRatePa": L["interest_rate_pa"]["value"],
        "tenureYears": L["tenure_years"]["value"],
        "pauseQuarters": L["moratorium_quarters"]["value"],
        "repaymentQuarters": L["repayment_quarters"]["value"],
        "quarterlyInstalment": S["equated_quarterly_instalment"]["value"],
        "interestAddedDuringPause": S["interest_added_during_pause"]["value"],
        "totalPaid": S["total_paid"]["value"],
        "tags": {"projectCost": "USER INPUT", "loanAmount": L["loan_amount"]["tag"],
                 "ownContribution": L["own_contribution"]["tag"], "interestRatePa": L["interest_rate_pa"]["tag"],
                 "tenureYears": L["tenure_years"]["tag"], "pauseQuarters": L["moratorium_quarters"]["tag"],
                 "repaymentQuarters": L["repayment_quarters"]["tag"], "quarterlyInstalment": "CALCULATED",
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
    "feasibility": (_t_feasibility, "Feasibility report summary (sections and gaps) for a verified business.",
                    {"code": {"type": "string"}}),
    "dpr_link": (_t_dpr_link, "Prepare the 1-page DPR download for the user.",
                 {"code": {"type": "string"}, "project_cost": {"type": "number"}, "family_income": {"type": "number"},
                  "is_sc": {"type": "boolean"}, "answers": {"type": "object"}}),
}
REQUIRED = {"business_summary": ["code"], "get_questions": ["code"], "run_advice": ["code"],
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


def unsupported(text, allowed):
    """Numbers in the AI's text that the tools or the user did not give. Number words always count as unsupported."""
    bad = [m.group(0) for m in NUM_WORDS.finditer(str(text))]
    for v, _ in numbers_in(text):
        if v in allowed or round(v, 2) in allowed:
            continue
        bad.append(int(v) if v == int(v) else v)
    return bad


def _plain_summary(tool_results):
    """A safe reply built only from the tools' own words and figures."""
    lines = []
    for t in tool_results:
        r = t["result"]
        if t["tool"] == "calculate_loan" and r.get("isEligible"):
            from backend.dpr import inr
            lines.append(f"{r['scheme']}: loan {inr(r['loanAmount'])}, your share {inr(r['ownContribution'])}, "
                         f"{r['interestRatePa']}% a year, {r['repaymentQuarters']} quarterly instalments of "
                         f"{inr(r['quarterlyInstalment'])}.")
        elif t["tool"] == "calculate_loan" and r.get("isEligible") is False:
            lines += [x["text"] for x in r.get("reasons", [])]
        elif t["tool"] == "run_advice":
            lines += [x["text"] for x in r.get("results", []) if x.get("status") == "result"]
    if not lines:
        lines = ["I can only give figures that the server has calculated. Please tell me your business and project cost."]
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
                         "temperature": 0.2, "max_tokens": 600})
    r.raise_for_status()
    return r.json()["choices"][0]["message"]


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
            try:
                wait = float(exc.response.headers.get("retry-after", "2"))
            except ValueError:
                wait = 2.0
            time.sleep(min(max(wait, 0.5), 5.0))
    except Exception as exc:
        log.warning("Groq call failed (%s); retrying once", type(exc).__name__)
    return _call_model(messages, tools)  # a second failure propagates


OFFLINE = ("The AI assistant is offline right now. You can still use the dashboard: choose your business, "
           "answer its questions, and use the loan calculator.")


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

    if not _api_key():
        return {"status": "ai_offline", "reply": OFFLINE, "tool_results": [], "guard": {"replaced": False}, "model": None}

    messages = [{"role": "system", "content": SYSTEM}] + convo
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
                messages.append({"role": "tool", "tool_call_id": c.get("id", ""), "content": json.dumps(res)[:6000]})
    except KeyRejected:
        return {"status": "ai_key_rejected", "reply": "The AI key was rejected. Ask the team to check GROQ_API_KEY. "
                "You can still use the dashboard's loan calculator.", "tool_results": results,
                "guard": {"replaced": False}, "model": MODEL}
    except Exception as exc:
        log.warning("chat failed: %s", type(exc).__name__)
        return {"status": "ai_offline", "reply": OFFLINE, "tool_results": results, "guard": {"replaced": False}, "model": MODEL}

    if reply is None:
        reply = _plain_summary(results)
    bad = unsupported(reply, allowed_numbers([r["result"] for r in results], user_texts))
    guard = {"replaced": bool(bad), "unsupported": bad}
    if bad:
        reply = _plain_summary(results)
    return {"status": "ok", "reply": reply, "tool_results": results, "guard": guard, "model": MODEL}
