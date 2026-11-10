"""
Feasibility report for a verified business, built by rules from data/businesses only.

Sections (dossier section in brackets): market (1), pricing (4), season (5), compliance (6),
SWOT and competition (8). Gaps: every NOT FOUND / VENDOR QUOTE NEEDED line from all sections,
with the dossier's own words as the reason. Nothing is computed or estimated here.
"""

from fastapi import APIRouter

from backend import businesses
from backend.compat import _error

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


def report(code: str) -> dict:
    if not businesses.check_code(code):
        return {"code": code, "status": "not_yet_verified"}
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
