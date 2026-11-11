"""
All 24 businesses served as verified (team decision: the dossier .md files are the data).
The 7 keep their yes/no questions; the other 17 have figures but no questions yet.
"""

import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader

from backend import businesses, chat, dossier_figures as dfig, feasibility
from backend.app import app

client = TestClient(app)
REPO = Path(__file__).resolve().parents[2]
CODES = [f"D{i:02d}" for i in range(1, 25)]
WITH_QUESTIONS = ["D15", "D16", "D17", "D19", "D20", "D21", "D22"]
OTHERS = [c for c in CODES if c not in WITH_QUESTIONS]


def post(path, body):
    return client.post(path, content=json.dumps(body), headers={"content-type": "application/json"})


def dossier_lines(code):
    return next((REPO / "research_dossiers").glob(f"{code}_*_Dossier.md")).read_text(encoding="utf8").split("\n")


# /api and /businesses -------------------------------------------------------

def test_api_dossiers_all_verified_with_sizes():
    d = client.get("/api/dossiers").json()
    assert d["count"] == 24 and all(r["status"] == "verified" for r in d["dossiers"])
    d08 = next(r for r in d["dossiers"] if r["code"] == "D08")
    assert [t["project_cost"]["value"] for t in d08["tiers"]] == [140000, 850000]
    assert d08["questionsAvailable"] is False
    assert next(r for r in d["dossiers"] if r["code"] == "D20")["questionsAvailable"] is True


@pytest.mark.parametrize("code", ["D01", "D08", "D18", "D20"])
def test_api_dossier_detail_has_figures(code):
    d = client.get(f"/api/dossiers/{code}").json()
    assert d["status"] == "verified"
    assert d["tiers"] and "seasonality" in d
    assert d["dossier"].startswith("research_dossiers/")


def test_health_counts_all_24():
    e = client.get("/api/health").json()["engines"]
    assert e["verified_dossiers"] == 24 and "research_dossiers" in e["dossiers"]


@pytest.mark.parametrize("code", OTHERS)
def test_businesses_others_verified_without_questions(code):
    d = client.get(f"/businesses/{code}").json()
    assert d["status"] == "verified" and d["questions"] == [] and d["note"]
    a = post(f"/businesses/{code}/advice", {"answers": {}}).json()
    assert a["status"] == "verified" and a["results"] == [] and a["questions"] == []
    assert post(f"/businesses/{code}/advice", {"answers": {"x": "yes"}}).status_code == 422


def test_businesses_listing_all_verified():
    rows = client.get("/businesses").json()["businesses"]
    assert len(rows) == 24 and all(r["status"] == "verified" for r in rows)


# feasibility ------------------------------------------------------------------

@pytest.mark.parametrize("code", OTHERS)
def test_feasibility_for_the_others_copies_dossier_lines(code):
    r = client.get(f"/api/feasibility/{code}").json()
    assert r["status"] == "verified"
    assert [s["id"] for s in r["sections"]] == ["market", "pricing", "season", "compliance", "swot_competition"]
    assert '"line"' not in json.dumps(r) and '"raw"' not in json.dumps(r)   # never sent
    lines = dossier_lines(code)
    internal = feasibility.from_dossier(code, internal=True)   # the same report with its checker keys
    for s in internal["sections"]:
        assert s["items"], (code, s["id"])
        for it in s["items"]:
            assert lines[it["line"] - 1].strip() == it["raw"], (code, it)
            assert it["tag"] == f"{code} dossier"
    for g in internal["gaps"]:
        assert lines[g["line"] - 1].strip() == g["raw"]
        assert g["status"] in ("NOT FOUND", "REMAINING QUESTION")


def test_feasibility_gaps_come_from_section_10():
    r = client.get("/api/feasibility/D01").json()
    assert r["gaps"] and all(g["section"] == "remaining_questions" or g["status"] == "NOT FOUND" for g in r["gaps"])
    assert any(g["section"] == "remaining_questions" for g in r["gaps"])


@pytest.mark.parametrize("code", WITH_QUESTIONS)
def test_feasibility_for_the_seven_unchanged(code):
    assert feasibility.report(code)["sections"] and feasibility.report(code)["status"] == "verified"


# chat -------------------------------------------------------------------------

def test_chat_tools_cover_all_24():
    assert all(b["status"] == "verified" for b in chat._t_list_businesses()["businesses"])
    s = chat._t_business_summary("D08")
    assert s["status"] == "verified" and s["tiers"][1]["project_cost"]["value"] == 850000
    assert chat._t_get_questions("D08") == {"code": "D08", "questions": [], "note": businesses.NO_QUESTIONS}


def test_chat_dossier_tool_hides_line_numbers_from_the_number_guard():
    r = chat.run_tool("dossier_figures", json.dumps({"code": "D01", "project_cost": 350000}))
    text = json.dumps(r)
    for key in ('"line"', '"as_written"', '"source_tag"', '"dossier"'):
        assert key not in text, key
    assert r["dscr"]["years"][0]["value"] == 2.84
    allowed = chat.allowed_numbers([{"tool": "dossier_figures", "result": r}], [])
    assert 373.0 not in allowed  # D01 line 373 holds that DSCR; the line number must not become "allowed"


def test_chat_prompt_no_longer_says_not_yet_verified():
    assert "not yet verified" not in chat.SYSTEM


# DPR --------------------------------------------------------------------------

def pdf_text(code, cost):
    r = post("/api/dpr", {"code": code, "projectCost": cost, "familyIncome": 200000, "isSc": True})
    assert r.status_code == 200, r.text
    pages = PdfReader(io.BytesIO(r.content)).pages
    return len(pages), " ".join(" ".join(p.extract_text().split()) for p in pages)


@pytest.mark.parametrize("code,cost", [("D01", 350000), ("D08", 850000), ("D24", 1500000), ("D20", 140000), ("D18", 140000)])
def test_dpr_one_page_with_dossier_figures(code, cost):
    n, text = pdf_text(code, cost)
    assert n == 1
    assert f"{code} dossier" in text
    assert "not yet verified" not in text


def test_dpr_d01_shows_its_printed_dscr():
    _, text = pdf_text("D01", 350000)
    assert "2.84" in text and "₹3,50,000" in text


def test_dpr_long_name_decimal_amounts_and_all_answers_still_one_page():
    qs = businesses.detail("D20")["questions"]
    answers = {q["id"]: q["choices"][0] for q in qs}
    r = post("/api/dpr", {"code": "D20", "projectCost": 140000.75, "familyIncome": 100000.5, "isSc": True,
                          "answers": answers, "applicantName": "A" * 40 + " " + "B" * 39})
    assert r.status_code == 200, r.text
    assert len(PdfReader(io.BytesIO(r.content)).pages) == 1
