"""
Feasibility report for a verified business, built by rules from data/businesses only.

Sections (dossier section in brackets): market (1), pricing (4), season (5), compliance (6),
SWOT and competition (8). Gaps: every NOT FOUND / VENDOR QUOTE NEEDED line from all sections,
with the dossier's own words as the reason. Nothing is computed or estimated here.

The 7 businesses with a checked data file use it (as before). The other 17 (team decision: their
dossier .md files are verified data) are built from the dossier itself: every line of sections
1, 4, 5, 6 and 8 copied exactly, tagged "<code> dossier"; gaps = the lines of the dossier's
"10. REMAINING QUESTIONS & GAPS" section plus any line saying NOT FOUND.
"""

import re

from fastapi import APIRouter

from backend import businesses
from backend.compat import NAMES, _error

router = APIRouter()

SECTIONS = [  # (report id, data section id)
    ("market", "classification"),
    ("pricing", "unit_economics"),
    ("season", "seasonality"),
    ("compliance", "compliance"),
    ("swot_competition", "risks"),
]


def gaps(code: str):
    """Every gap line in the verified data, in dossier order."""
    out = []
    for sec in businesses._load(code)["sections"]:
        for it in sec["items"]:
            if it.get("status"):
                out.append({"section": sec["id"], "status": it["status"], "value": None,
                            "reason": it["reason"], "unverified": bool(it.get("unverified")),
                            "hi": it.get("hi", "")})
    return out


NUMBERS = {1: "market", 4: "pricing", 5: "season", 6: "compliance", 8: "swot_competition"}
SECTION = re.compile(r"^#{1,2} (\d+)[a-z]?\.\s+(.*)$")
TOP = re.compile(r"^#{1,2} \S")
SEPARATOR = re.compile(r"^\|?\s*:?-{3,}")


def _clean(s):
    return s.replace("**", "").replace("`", "").strip()


def _item(code, n, raw, lines):
    it = {"line": n, "raw": raw, "tag": f"{code} dossier", "hi": ""}
    if raw.startswith("|"):
        it["cells"] = [_clean(c) for c in raw.strip("|").split("|")]
        nxt = lines[n].strip() if n < len(lines) else ""
        if SEPARATOR.match(nxt):
            it["header"] = True
    else:
        it["text"] = _clean(raw.lstrip("#").strip()) if raw.startswith("#") else _clean(raw)
        if raw.startswith("#"):
            it["header"] = True
    return it


def _ranges(lines):
    """{section number: (title, first line, last line)} for the top-level numbered sections."""
    starts = []
    for n, line in enumerate(lines, 1):
        m = SECTION.match(line)
        if m and line.startswith("#") and not re.match(r"^#{1,2} \d+\.\d", line):
            starts.append((int(m.group(1)), m.group(2).strip(), n))
    out = {}
    for i, (num, title, n) in enumerate(starts):
        end = len(lines)
        for k in range(n, len(lines)):
            line = lines[k]
            if TOP.match(line) and not (SECTION.match(line) and int(SECTION.match(line).group(1)) == num):
                end = k
                break
        if num not in out:
            out[num] = (title, n, end)
    return out


def _strip_checker_keys(x):
    if isinstance(x, dict):
        return {k: _strip_checker_keys(v) for k, v in x.items() if k not in ("line", "raw")}
    if isinstance(x, list):
        return [_strip_checker_keys(v) for v in x]
    return x


def from_dossier(code: str, internal: bool = False) -> dict:
    """internal=True keeps each item's dossier line and raw text (for the tests); never sent."""
    from backend.dossier_figures import _lines  # the same dossier reader as the figures
    lines = _lines(code)
    ranges = _ranges(lines)
    sections = []
    for num, rid in NUMBERS.items():
        title, first, last = ranges.get(num, (None, None, None))
        items = []
        if first:
            for n in range(first + 1, last + 1):
                raw = lines[n - 1].strip()
                if not raw or SEPARATOR.match(raw) or raw.startswith("```") or raw == "---":
                    continue
                items.append(_item(code, n, raw, lines))
        sections.append({"id": rid, "title": f"{num}. {_clean(title)}" if title else f"{num}. NOT FOUND in the dossier",
                         "title_hi": "", "items": items})
    gaps = []
    for num, rid in NUMBERS.items():
        for it in next(s for s in sections if s["id"] == rid)["items"]:
            if "NOT FOUND" in it["raw"]:
                gaps.append({"section": rid, "status": "NOT FOUND", "value": None, "line": it["line"],
                             "raw": it["raw"], "reason": _clean(it["raw"].lstrip("#")), "unverified": False, "hi": ""})
    if 10 in ranges:
        _, first, last = ranges[10]
        for n in range(first + 1, last + 1):
            raw = lines[n - 1].strip()
            if raw and not SEPARATOR.match(raw) and not raw.startswith("```") and raw != "---":
                gaps.append({"section": "remaining_questions", "status": "REMAINING QUESTION", "value": None,
                             "line": n, "raw": raw, "reason": _clean(raw.lstrip("#")), "unverified": False, "hi": ""})
    out = {
        "code": code,
        "status": "verified",
        "name": NAMES[code],
        "name_hi": "",
        "sections": sections,
        "gaps": gaps,
        "sources": [],
        "method": "Copied line by line from the business's research dossier (research_dossiers/), tagged "
                  f"'{code} dossier'; gaps are the dossier's remaining questions and NOT FOUND lines.",
    }
    return out if internal else _strip_checker_keys(out)


def report(code: str) -> dict:
    if not businesses.check_code(code):
        return from_dossier(code)
    d = businesses._load(code)
    by_id = {s["id"]: s for s in d["sections"]}
    return {
        "code": code,
        "status": "verified",
        "name": d["name"],
        "name_hi": d.get("name_hi", ""),
        "sections": [dict(businesses._strip(by_id[src]), id=rid) for rid, src in SECTIONS],
        "gaps": gaps(code),
        "sources": businesses._strip(d["sources"]),
        "method": "Built by rules from the verified dossier data only; every number keeps its tag; "
                  "gaps are listed as NOT FOUND / VENDOR QUOTE NEEDED.",
    }


@router.get("/api/feasibility/{code}")
def feasibility(code: str):
    try:
        return report(code.strip().upper())
    except businesses.UnknownCode:
        return _error(f"No business code {code!r}; codes are D01 to D24", 404)
