"""
Verified business data (data/businesses/Dxx.json) and the yes/no advice rules.

- The data files are built from Person C's verified dossiers and checked by backend/check_data.py.
- Only the businesses in VERIFIED are served; the rest of D01-D24 answer "not_yet_verified".
- Nothing here reads the team's data/dossiers_db.json.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import Dict

from pydantic import BaseModel, ConfigDict, Field, StrictStr

DATA = Path(__file__).resolve().parents[1] / "data" / "businesses"

ALL_CODES = [f"D{i:02d}" for i in range(1, 25)]
VERIFIED = ["D15", "D16", "D17", "D19", "D20", "D21", "D22"]

# Keys used only by the checker; never sent to the app.
INTERNAL_KEYS = {"line", "tag_line", "same_as", "text_numbers", "cell", "dossier", "quote_line"}


class AdviceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answers: Dict[StrictStr, StrictStr] = Field(
        default_factory=dict,
        description='Question id -> chosen answer, e.g. {"D20.pickling": "yes"}. Unanswered questions are listed, never guessed.',
    )


class UnknownCode(KeyError):
    pass


class BadAnswer(ValueError):
    pass


def _strip(node):
    if isinstance(node, dict):
        return {k: _strip(v) for k, v in node.items() if k not in INTERNAL_KEYS}
    if isinstance(node, list):
        return [_strip(v) for v in node]
    return node


@lru_cache(maxsize=None)
def _load(code: str) -> dict:
    return json.loads((DATA / f"{code}.json").read_text(encoding="utf-8"))


def check_code(code: str):
    if code not in ALL_CODES:
        raise UnknownCode(code)
    return code in VERIFIED


def listing() -> dict:
    rows = []
    for code in ALL_CODES:
        if code in VERIFIED:
            rows.append({"code": code, "status": "verified", "name": _load(code)["name"]})
        else:
            rows.append({"code": code, "status": "not_yet_verified"})
    return {"businesses": rows}


def detail(code: str) -> dict:
    if not check_code(code):
        return {"code": code, "status": "not_yet_verified"}
    d = _load(code)
    return {
        "code": d["code"],
        "status": "verified",
        "name": d["name"],
        "name_hi": d.get("name_hi", ""),
        "sections": _strip(d["sections"]),
        "questions": [_public_question(q) for q in d["questions"]],
        "sources": _strip(d["sources"]),
    }


def _public_question(q):
    return {"id": q["id"], "text": q["text"], "hi": q.get("hi", ""), "choices": q["choices"]}


# ---------------------------------------------------------------------------
# Advice
# ---------------------------------------------------------------------------

def _outcome(rule, o, answers):
    out = {
        "rule": rule["id"],
        "status": "result",
        "category": o.get("category"),
        "text": o["text"],
        "hi": o.get("hi", ""),
        "dossier_text": o.get("dossier_text"),
        "tag": o.get("tag", rule.get("tag")),
        "page": o.get("page"),
        "unverified": bool(o.get("unverified", False)),
        "evidence": _strip(o.get("evidence", [])),
        "notes": _strip([n for n in o.get("notes", [])
                         if all(answers.get(k) == v for k, v in (n.get("when") or {}).items())]),
        "advice": _strip(o.get("advice", [])),
    }
    for n in out["notes"]:
        n.pop("when", None)
    return out


def _run(rule, answers):
    rid = rule["id"]
    ask = rule.get("dont_know_text") or ("Confirm with " + rule.get("dont_know_ask", "the scheme office") + ".")
    if rule["kind"] == "choice":
        q = rule["question"]
        a = answers.get(q)
        if a is None:
            return {"rule": rid, "status": "not_answered", "blocking_question": q}
        if a == "dont_know":
            return {"rule": rid, "status": "dont_know", "question": q, "ask": ask}
        o = rule["cases"].get(a)
        if o is None:
            return {"rule": rid, "status": "no_warning", "question": q}
        return _outcome(rule, o, answers)
    if rule["kind"] == "always":
        return _outcome(rule, rule["outcome"], answers)
    if rule["kind"] == "chain":
        for step in rule["steps"]:
            q = step["question"]
            a = answers.get(q)
            if a is None:
                return {"rule": rid, "status": "not_answered", "blocking_question": q}
            if a == "dont_know":
                return {"rule": rid, "status": "dont_know", "question": q, "ask": ask}
            if a == step["when"]:
                return _outcome(rule, step, answers)
        if rule.get("otherwise"):
            return _outcome(rule, rule["otherwise"], answers)
        return {"rule": rid, "status": "no_warning"}
    raise ValueError(f"unknown rule kind {rule['kind']!r}")


def advice(code: str, answers: dict) -> dict:
    if not check_code(code):
        return {"code": code, "status": "not_yet_verified"}
    d = _load(code)
    questions = {q["id"]: q for q in d["questions"]}
    for k, v in answers.items():
        if k not in questions:
            raise BadAnswer(f"{k!r} is not a question for {code}")
        if v not in questions[k]["choices"]:
            raise BadAnswer(f"{v!r} is not one of {questions[k]['choices']} for {k!r}")
    results = [_run(r, answers) for r in d["rules"]]
    return {
        "code": code,
        "status": "verified",
        "results": results,
        "unanswered": [q for q in questions if q not in answers],
        "questions": [_public_question(q) for q in d["questions"]],
    }
