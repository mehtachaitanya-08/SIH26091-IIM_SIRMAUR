"""
Tests for GET /api/feasibility/{code}: a report built by rules from the verified data only.
Sections: market (dossier section 1), pricing (4), season (5), compliance (6), SWOT and
competition (8); gaps = every NOT FOUND / VENDOR QUOTE NEEDED line from all sections.
"""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.tests.test_api import _walk

client = TestClient(app)
DATA = Path(__file__).resolve().parents[2] / "data" / "businesses"
VERIFIED = ["D15", "D16", "D17", "D19", "D20", "D21", "D22"]
WANT = {"market": "classification", "pricing": "unit_economics", "season": "seasonality",
        "compliance": "compliance", "swot_competition": "risks"}


def raw(code):
    return json.loads((DATA / f"{code}.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("code", VERIFIED)
def test_sections_match_the_verified_data_exactly(code):
    d = client.get(f"/api/feasibility/{code}").json()
    src = {s["id"]: s for s in raw(code)["sections"]}
    assert d["status"] == "verified"
    assert [s["id"] for s in d["sections"]] == list(WANT)
    for s in d["sections"]:
        orig = src[WANT[s["id"]]]
        assert s["title"] == orig["title"]
        texts = [i.get("cells") or i.get("text") for i in s["items"]]
        assert texts == [i.get("cells") or i.get("text") for i in orig["items"]]


@pytest.mark.parametrize("code", VERIFIED)
def test_gaps_are_every_gap_line_from_all_sections(code):
    d = client.get(f"/api/feasibility/{code}").json()
    want = [(s["id"], i.get("reason")) for s in raw(code)["sections"] for i in s["items"] if i.get("status")]
    got = [(g["section"], g["reason"]) for g in d["gaps"]]
    assert got == want and len(got) > 0
    assert all(g["status"] in ("NOT FOUND", "VENDOR QUOTE NEEDED") and g["value"] is None for g in d["gaps"])


@pytest.mark.parametrize("code", VERIFIED)
def test_every_number_tagged_and_no_internal_keys(code):
    d = client.get(f"/api/feasibility/{code}").json()
    assert "tag" not in d
    assert [p for p, t in _walk(d) if t is None] == []
    assert '"line":' not in json.dumps(d) and '"text_numbers"' not in json.dumps(d)


def test_d20_contains_the_red_pickling_row_and_sources():
    d = client.get("/api/feasibility/D20").json()
    comp = next(s for s in d["sections"] if s["id"] == "compliance")
    assert any("Pickling or other metal surface treatment" in " ".join(i.get("cells", [])) for i in comp["items"])
    assert d["sources"] and all(s["tag"].startswith("[S") for s in d["sources"])


@pytest.mark.parametrize("code", ["D01", "D18"])
def test_unverified(code):
    r = client.get(f"/api/feasibility/{code}")
    assert r.status_code == 200 and r.json() == {"code": code, "status": "not_yet_verified"}


def test_unknown_code_404_his_format():
    r = client.get("/api/feasibility/D99")
    assert r.status_code == 404 and set(r.json()) >= {"error", "status", "timestamp"}


def test_lowercase_code_works():
    assert client.get("/api/feasibility/d20").json()["code"] == "D20"
