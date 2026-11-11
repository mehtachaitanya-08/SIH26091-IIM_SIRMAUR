"""
Tests for POST /api/dpr: a 1-page English DPR PDF. Every figure comes from the server's
verified loan logic and data. The PDF text is read back with pypdf.
"""

import io
import json

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader

from backend.app import app

client = TestClient(app)


def dpr(body):
    return client.post("/api/dpr", content=json.dumps(body), headers={"content-type": "application/json"})


def text_of(resp):
    assert resp.status_code == 200, resp.text[:300]
    assert resp.headers["content-type"] == "application/pdf"
    reader = PdfReader(io.BytesIO(resp.content))
    # PDF lines wrap, so compare with all whitespace runs turned into single spaces
    return reader, " ".join(" ".join(p.extract_text() for p in reader.pages).split())


def test_d20_140000_one_page_with_verified_figures():
    r = dpr({"code": "D20", "projectCost": 140000, "familyIncome": 180000, "isSc": True,
             "answers": {"D20.pickling": "yes"}})
    reader, t = text_of(r)
    assert len(reader.pages) == 1
    for want in ["₹1,25,000", "₹15,000", "6.5%", "11 quarterly", "[S1]", "Metal Smithy", "D20",
                 "₹12,704.49", "₹2,031.25", "Red. Drop pickling"]:
        assert want in t, want
    assert "NOT FOUND" in t                     # gaps are shown
    assert "not a loan sanction" in t.lower()   # never claims to be a sanction


def test_not_eligible_still_a_pdf_with_reason():
    _, t = text_of(dpr({"code": "D20", "projectCost": 140000, "familyIncome": 500001, "isSc": True}))
    assert "Not eligible" in t and "₹5.00 Lakhs" in t


def test_business_without_questions_still_gets_loan_and_dossier_figures():
    _, t = text_of(dpr({"code": "D18", "projectCost": 140000, "familyIncome": 100000, "isSc": True}))
    assert "not yet verified" not in t and "₹1,25,000" in t and "D18 dossier" in t


@pytest.mark.parametrize("body,status", [
    ({"code": "D99", "projectCost": 140000}, 404),
    ({"code": "D20"}, 400),
    ({"code": "D20", "projectCost": "abc", "familyIncome": 1, "isSc": True}, 400),
    ({"code": "D20", "projectCost": 140000, "familyIncome": 1, "isSc": True, "answers": {"D20.pickling": "maybe"}}, 400),
])
def test_bad_input_his_error_format(body, status):
    r = dpr(body)
    assert r.status_code == status and set(r.json()) >= {"error", "status", "timestamp"}
    if "abc" in json.dumps(body):
        assert "projectCost" in r.json()["error"] and "must be a number" in r.json()["error"]
    if "maybe" in json.dumps(body):
        assert "maybe" in r.json()["error"]


def test_dpr_wording_fixes():
    _, t = text_of(dpr({"code": "D20", "projectCost": 140000.75, "familyIncome": 180000, "isSc": True}))
    assert "rounded down to the whole rupee" in t          # paise note printed
    assert "rounded down (ASSUMED)" in t                   # loan line says so
    assert "self-declared" in t                            # SC from a tick box, not a checked certificate
    assert "valid caste certificate" not in t.replace("certificate to be shown", "")
    assert " …" in t                                       # long gap reasons cut at a word, marked


def test_dpr_page_overflow_is_a_clean_error(monkeypatch):
    from backend import dpr as dpr_mod
    monkeypatch.setattr(dpr_mod, "MAX_GAPS_SHOWN", 400)
    r = dpr({"code": "D20", "projectCost": 140000, "familyIncome": 1, "isSc": True})
    assert r.status_code == 500 and set(r.json()) >= {"error", "status", "timestamp"}
