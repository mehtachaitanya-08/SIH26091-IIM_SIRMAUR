"""
Tests for the business data (data/businesses/*.json), its two checkers, and the
/businesses endpoints. Run from the repo root:
    backend/.venv/bin/python -m pytest backend/tests -v
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend import businesses
from backend.tests.test_api import ALLOWED_TAG, _walk

client = TestClient(app)
REPO = Path(__file__).resolve().parents[2]
DATA = REPO / "data" / "businesses"
PY = sys.executable

VERIFIED = businesses.VERIFIED
UNVERIFIED = [c for c in businesses.ALL_CODES if c not in VERIFIED]


def run_check_data(*files, cwd=REPO):
    return subprocess.run([PY, "-I", str(REPO / "backend" / "check_data.py"), *map(str, files)],
                          capture_output=True, text=True, cwd=cwd)


# ---------------------------------------------------------------------------
# The code list
# ---------------------------------------------------------------------------

def test_code_list_matches_dossier_files():
    on_disk = sorted({p.name[:3] for p in (REPO / "research_dossiers").glob("D[0-9][0-9]_*.md")})
    assert businesses.ALL_CODES == on_disk == [f"D{i:02d}" for i in range(1, 25)]


def _code_without_docstrings(path):
    import ast
    tree = ast.parse(path.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        body = getattr(node, "body", None)
        if isinstance(body, list) and body and isinstance(body[0], ast.Expr) \
                and isinstance(getattr(body[0], "value", None), ast.Constant) and isinstance(body[0].value.value, str):
            body.pop(0)
    return ast.unparse(tree)


def test_nothing_reads_the_team_dossiers_db():
    for p in (REPO / "backend").glob("*.py"):
        assert "dossiers_db" not in _code_without_docstrings(p), p
    for p in DATA.glob("*.json"):
        assert "dossiers_db" not in p.read_text(encoding="utf-8"), p


# ---------------------------------------------------------------------------
# The data checker passes on every verified business ...
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("code", VERIFIED)
def test_check_data_passes(code):
    r = run_check_data(DATA / f"{code}.json")
    assert r.returncode == 0, r.stdout[-3000:]
    assert r.stdout.strip().endswith("0 problem(s)")


# ---------------------------------------------------------------------------
# ... and fails when anything is broken (on temporary copies; real files untouched)
# ---------------------------------------------------------------------------

def _first(d, pred):
    for sec in d["sections"]:
        for it in sec["items"]:
            if pred(it):
                return it
    raise AssertionError("no matching item")


def _break(code, tmp_path, mutate):
    """Copy repo layout pieces the checker needs into tmp, mutate the data, run the checker."""
    (tmp_path / "data" / "businesses").mkdir(parents=True)
    (tmp_path / "backend").mkdir()
    shutil.copy(REPO / "backend" / "check_data.py", tmp_path / "backend" / "check_data.py")
    (tmp_path / "research_dossiers").symlink_to(REPO / "research_dossiers")
    shutil.copy(DATA / "skip_list.json", tmp_path / "data" / "businesses" / "skip_list.json")
    d = json.loads((DATA / f"{code}.json").read_text(encoding="utf-8"))
    mutate(d)
    f = tmp_path / "data" / "businesses" / f"{code}.json"
    f.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    return subprocess.run([PY, "-I", str(tmp_path / "backend" / "check_data.py"), str(f)],
                          capture_output=True, text=True, cwd=tmp_path)


def _with_figure(it):
    return bool(it.get("figures"))


def _with_page(it):
    return any(f.get("page") for f in it.get("figures", []))


def _change_number(d):
    f = _first(d, _with_figure)["figures"][0]
    f["value"] = float(f["value"]) + 1


def _change_page(d):
    f = next(f for f in _first(d, _with_page)["figures"] if f.get("page"))
    f["page"] = f["page"] + "9"


def _change_quote_word(d):
    it = _first(d, lambda i: "cells" in i and any(len(c.split()) > 3 for c in i["cells"]))
    k = next(k for k, c in enumerate(it["cells"]) if len(c.split()) > 3)
    words = it["cells"][k].split(" ")
    words[1] = words[1] + "x"
    it["cells"][k] = " ".join(words)


def _shift_line(d):
    _first(d, _with_figure)["line"] += 1


def _drop_status(d):
    it = _first(d, lambda i: i.get("status"))
    del it["status"]


def _misspell_saved(d):
    d["sources"][0]["saved"] = d["sources"][0]["saved"] + "x"


def _drop_item(d):
    for sec in d["sections"]:
        if sec["items"]:
            sec["items"].pop(0)
            return


def _rule(d, rid):
    return next(r for r in d["rules"] if r["id"] == rid)


def _red_to_green(d):
    _rule(d, "D20.pollution")["steps"][0]["category"] = "Green"


def _delete_pollution_rule(d):
    d["rules"] = [r for r in d["rules"] if r["id"] != "D20.pollution"]


def _swap_chain_steps(d):
    st = _rule(d, "D20.pollution")["steps"]
    st[0], st[1] = st[1], st[0]


def _flip_when(d):
    _rule(d, "D20.pollution")["steps"][0]["when"] = "no"


def _drop_unverified_flag(d):
    _rule(d, "D20.pollution")["otherwise"].pop("unverified")


def _fake_quote(d):
    # our own dossier sentence presented as a source quote
    ev = _rule(d, "D20.pollution")["steps"][0]["evidence"][0]
    ev["quote"] = "It may also be blocked for 5 years by an earlier government business loan"
    ev["line"] = 332
    ev["page"] = "p.3"
    ev["tag"] = "[S14]"


def _page_prefix(d):
    _rule(d, "D20.pollution")["steps"][0]["evidence"][0]["page"] = "p.2"  # line says p.27


def _hide_money_as_quote(d):
    it = _first(d, lambda i: any(f["as_written"].startswith("₹") for f in i.get("figures", [])))
    f = next(f for f in it["figures"] if f["as_written"].startswith("₹"))
    it["figures"].remove(f)
    it.setdefault("text_numbers", []).append({"token": f["as_written"].lstrip("₹"), "kind": "quote"})


def _retag_item(d):
    it = _first(d, lambda i: i.get("tag") == "[S5]")
    it["tag"] = "[S7]"


def _wrong_unit(d):
    it = _first(d, lambda i: any(f["unit"] == "%" for f in i.get("figures", [])))
    next(f for f in it["figures"] if f["unit"] == "%")["unit"] = "INR"


@pytest.mark.parametrize("mutate", [_change_number, _change_page, _change_quote_word, _shift_line,
                                    _drop_status, _misspell_saved, _drop_item,
                                    _red_to_green, _delete_pollution_rule, _swap_chain_steps, _flip_when,
                                    _drop_unverified_flag, _fake_quote, _page_prefix, _hide_money_as_quote,
                                    _retag_item, _wrong_unit])
def test_check_data_catches_each_break(tmp_path, mutate):
    r = _break("D20", tmp_path, mutate)
    assert r.returncode == 1, f"{mutate.__name__} was not caught:\n{r.stdout[-1500:]}"


def test_check_dossier_catches_a_changed_quote(tmp_path):
    src = REPO / "research_dossiers" / "D20_Metal_Smithy_Dossier.md"
    (tmp_path / "research_dossiers").mkdir()
    (tmp_path / "research_dossiers" / "sources").symlink_to(REPO / "research_dossiers" / "sources")
    text = src.read_text(encoding="utf-8")
    # check_dossier.py checks the quotes in the Source log, so break one there (row S5)
    head, log = text.split("## Source log", 1)
    broken = head + "## Source log" + log.replace('"Total : 351000"', '"Total : 351001"', 1)
    assert broken != text
    f = tmp_path / "research_dossiers" / src.name
    f.write_text(broken, encoding="utf-8")
    r = subprocess.run([PY, "-I", str(REPO / "backend" / "check_dossier.py"), str(f)],
                       capture_output=True, text=True)
    if "No module named 'pymupdf'" in r.stderr:
        pytest.skip("pymupdf not installed (backend/requirements-checker.txt)")
    assert "PROBLEM" in r.stdout and "0 problem(s)" not in r.stdout, r.stdout[-500:] + r.stderr[-500:]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

def test_list_all_24():
    d = client.get("/businesses").json()
    rows = d["businesses"]
    assert [r["code"] for r in rows] == businesses.ALL_CODES
    for r in rows:
        if r["code"] in VERIFIED:
            assert r["status"] == "verified" and r["name"]
        else:  # team decision: all 24 dossiers are verified; these have no yes/no questions yet
            assert r == {"code": r["code"], "status": "verified", "questions_available": False}


@pytest.mark.parametrize("code", ["D01", "D18"])
def test_no_questions_yet(code):
    # team decision: verified (dossier figures), but no yes/no questions built yet
    assert client.get(f"/businesses/{code}").json() == {"code": code, "status": "verified", "questions": [],
                                                        "note": businesses.NO_QUESTIONS}
    r = client.post(f"/businesses/{code}/advice", json={"answers": {}})
    assert r.status_code == 200
    assert r.json()["status"] == "verified" and r.json()["results"] == []


@pytest.mark.parametrize("code", ["D99", "d20", "D0", "20"])
def test_unknown_code_404(code):
    assert client.get(f"/businesses/{code}").status_code == 404
    assert client.post(f"/businesses/{code}/advice", json={"answers": {}}).status_code == 404


@pytest.mark.parametrize("code", VERIFIED)
def test_verified_reply_has_no_line_numbers_and_every_number_tagged(code):
    d = client.get(f"/businesses/{code}").json()
    assert d["status"] == "verified"
    assert "tag" not in d
    flat = json.dumps(d)
    assert '"line"' not in flat and '"text_numbers"' not in flat
    untagged = [p for p, t in _walk(d) if t is None]
    assert untagged == [], untagged[:10]


@pytest.mark.parametrize("code", VERIFIED)
def test_text_with_digits_is_tagged_or_a_gap(code):
    """A line whose digits include a figure must carry a tag or a gap status. Lines whose digits are
    only pages, codes, dates, row labels or quoted source text (declared in the data file and
    checked by check_data.py) need no figure tag."""
    raw = json.loads((DATA / f"{code}.json").read_text(encoding="utf-8"))
    for sec in raw["sections"]:
        for it in sec["items"]:
            words = " ".join(it.get("cells", [])) or it.get("text", "")
            if not re.search(r"\d", re.sub(r"\[S\d+\]", "", words)):
                continue
            if it.get("figures"):
                assert it.get("tag") or it.get("status"), (sec["id"], it["line"], words[:80])
            else:
                assert it.get("text_numbers"), (sec["id"], it["line"], words[:80])
            if it.get("tag"):
                assert ALLOWED_TAG.match(it["tag"]), (it["line"], it["tag"])


# ---------------------------------------------------------------------------
# Advice rules
# ---------------------------------------------------------------------------

def advice(code, **answers):
    r = client.post(f"/businesses/{code}/advice", json={"answers": answers})
    assert r.status_code == 200, r.text
    return r.json()


def _pollution(d):
    return next(x for x in d["results"] if x["rule"] == "D20.pollution")


def test_d20_pickling_is_red_with_cpcb_quote():
    d = advice("D20", **{"D20.pickling": "yes"})
    p = _pollution(d)
    assert p["status"] == "result"
    assert p["category"] == "Red"
    assert any("101.1 Industry or process involving metal surface treatment" in q["quote"]
               and q["tag"] == "[S7]" and q.get("page") == "p.27" for q in p["evidence"])


def test_d20_dont_know_stops_the_chain():
    d = advice("D20", **{"D20.pickling": "dont_know"})
    p = _pollution(d)
    assert p["status"] == "dont_know"
    assert p.get("category") is None
    assert "State" in p["ask"]


def test_d20_unanswered_lists_question_and_guesses_nothing():
    d = advice("D20")
    p = _pollution(d)
    assert p["status"] == "not_answered"
    assert p["blocking_question"] == "D20.pickling"
    assert p.get("category") is None


def test_d20_all_no_is_white_with_confirm():
    d = advice("D20", **{"D20.pickling": "no", "D20.hot_forging_or_casting": "no",
                         "D20.grills_heat_treat_or_spray": "no"})
    p = _pollution(d)
    assert p["category"] == "White"
    assert p["unverified"] is True
    assert "Confirm with the State board" in p["text"]


def test_d20_grills_in_maharashtra_note():
    base = {"D20.pickling": "no", "D20.hot_forging_or_casting": "no", "D20.grills_heat_treat_or_spray": "yes"}
    assert _pollution(advice("D20", **base))["category"] == "Green"
    mh = _pollution(advice("D20", **base, state="maharashtra"))
    assert mh["category"] == "Green"
    assert any("(Without Painting)" in n["text"] for n in mh["notes"])
    other = _pollution(advice("D20", **base, state="other"))
    assert not any("(Without Painting)" in n["text"] for n in other["notes"])


@pytest.mark.parametrize("code", VERIFIED)
def test_lender_mfi_warns_amy_uny(code):
    d = advice(code, lender_type="mfi")
    w = next(x for x in d["results"] if x["rule"] == "lender")
    assert w["status"] == "result"
    assert "13–15%" in w["text"]
    assert any(q["tag"] == "[S1]" for q in w["evidence"])


def test_d19_vishwakarma_possibly_blocked():
    d = advice("D19", **{"govt_business_loan_5y": "yes"})
    v = next(x for x in d["results"] if x["rule"] == "D19.pm_vishwakarma")
    assert v["status"] == "result"
    assert v["unverified"] is True
    assert "possibly blocked" in v["text"].lower()
    assert v["tag"] == "[S14]" and v["page"] == "p.3"
    # the evidence is the scheme's own words, not our dossier's sentence
    assert any(q["tag"] == "[S14]" and q["quote"].startswith("No loans should have been availed")
               for q in v["evidence"])
    assert any("District Project Management Unit" in a["text"] and a["tag"].startswith("ASSUMED")
               for a in v["advice"])


def test_unknown_question_or_answer_rejected():
    r = client.post("/businesses/D20/advice", json={"answers": {"D20.nonsense": "yes"}})
    assert r.status_code == 422
    r = client.post("/businesses/D20/advice", json={"answers": {"D20.pickling": "maybe"}})
    assert r.status_code == 422
    r = client.post("/businesses/D20/advice", json={"answers": {"D19.wood_seasoning": "yes"}})
    assert r.status_code == 422


@pytest.mark.parametrize("code", VERIFIED)
@pytest.mark.parametrize("pick", [0, 1, -1])
def test_advice_reply_every_number_tagged(code, pick):
    """Answer every question (first, second, last choice) so that every outcome is walked."""
    qs = client.get(f"/businesses/{code}").json()["questions"]
    d = advice(code, **{q["id"]: q["choices"][pick] for q in qs})
    assert "tag" not in d
    assert [p for p, t in _walk(d) if t is None] == []
    for r in d["results"]:
        if r["status"] == "result":
            assert r["tag"] and ALLOWED_TAG.match(r["tag"]), r


@pytest.mark.parametrize("code", VERIFIED)
def test_questions_offer_dont_know_and_fixed_state_choices(code):
    for q in client.get(f"/businesses/{code}").json()["questions"]:
        assert "dont_know" in q["choices"], q
        if q["id"] == "state":
            assert q["choices"] == ["maharashtra", "other", "dont_know"]
