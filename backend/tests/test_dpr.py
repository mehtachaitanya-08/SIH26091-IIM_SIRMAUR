"""
Tests for POST /api/dpr: the multi-page DPR (Detailed Project Report) PDF, English with Hindi (Phase 1, Stage 1b;
owner's decisions 1-30, 12 Nov 2026). Page 1 is a plain-words summary; then every section of the two bank
forms (FIDF and AIF), each once. Every figure comes from the server's verified loan logic, the Stage 1a
year figures and the research files. The PDF text is read back with pypdf.
"""

import inspect
import io
import json

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader

from backend import dpr as dpr_mod
from backend import loan, year_figures
from backend.app import app
from backend.dpr import inr
from backend.schemas import LoanRequest

client = TestClient(app)

HEADINGS = [
    "Summary in plain words",
    "1. Applicant and promoters", "2. Project summary", "3. Introduction", "4. Benefits and justification",
    "5. Objectives", "6. Project and operating model", "7. Land and site", "8. Technical details and machinery",
    "9. Process flow chart", "10. Organisation, management and employment", "11. Experience and existing banking",
    "12. Cost of project and operating cost", "13. Means of finance", "14. Estimates of output and its value",
    "15. Year-by-year figures", "16. Project worth and cost-benefit", "17. Financial parameters",
    "18. Credit facility and repayment schedule", "19. Collateral", "20. Approvals, pollution and risks",
    "21. Raw material and catchment", "22. Demand and marketing", "23. Renewable energy",
    "24. Suppliers of plant and machinery", "25. Expected outcomes", "26. Construction timeline",
    "27. Milestones (first 12 months)", "28. Layout", "29. Enclosures checklist", "30. Declaration", "Sources",
]


def dpr(body):
    return client.post("/api/dpr", content=json.dumps(body), headers={"content-type": "application/json"})


def text_of(resp):
    assert resp.status_code == 200, resp.text[:300]
    assert resp.headers["content-type"] == "application/pdf"
    reader = PdfReader(io.BytesIO(resp.content))
    # PDF lines wrap, so compare with all whitespace runs turned into single spaces
    return reader, " ".join(" ".join(p.extract_text() for p in reader.pages).split())


def page_text(reader, n):
    return " ".join(reader.pages[n].extract_text().split())


BASE = {"code": "D20", "projectCost": 140000, "familyIncome": 180000, "isSc": True}


# Changed from the old single-page check (owner's decision: no page limit any more): page 1 is the plain summary.
def test_d20_140000_multi_page_with_verified_figures():
    r = dpr(dict(BASE, answers={"D20.pickling": "yes"}))
    reader, t = text_of(r)
    assert len(reader.pages) >= 4
    assert "Summary in plain words" in page_text(reader, 0)
    # "11 quarterly" reworded to the plain words used everywhere (a payment every 3 months)
    for want in ["₹1,25,000", "₹15,000", "6.5%", "11 payments, one every 3 months", "[S1]", "Metal Smithy",
                 "D20", "₹12,704.49", "₹2,031.25", "Red. Drop pickling"]:
        assert want in t, want
    assert "not a loan sanction" in t.lower()   # never claims to be a sanction


def test_every_section_heading_once_and_in_order():
    _, t = text_of(dpr(BASE))
    at = [t.find(h) for h in HEADINGS]
    assert all(i >= 0 for i in at), [h for h, i in zip(HEADINGS, at) if i < 0]
    assert at == sorted(at), "headings out of order"
    assert "Detailed Project Report (DPR)" in t


# Changed: "NOT FOUND" used to prove the gap list was shown. The owner removed the raw gap list
# (open items stay in the Feasibility tab), so now the list must NOT be there.
def test_no_raw_gap_list():
    _, t = text_of(dpr(BASE))
    assert "items NOT FOUND or still open" not in t
    assert "Feasibility tab" in t


def test_not_eligible_still_a_full_pdf_with_reason():
    reader, t = text_of(dpr({"code": "D20", "projectCost": 140000, "familyIncome": 500001, "isSc": True}))
    assert "Not eligible" in t and "₹5.00 Lakhs" in t
    assert len(reader.pages) >= 4 and "no NSFDC loan" in t


def test_business_without_questions_still_gets_loan_and_dossier_figures():
    _, t = text_of(dpr({"code": "D18", "projectCost": 140000, "familyIncome": 100000, "isSc": True}))
    assert "not yet verified" not in t and "₹1,25,000" in t and "D18 dossier" in t


@pytest.mark.parametrize("code", ["D15", "D17", "D18"])
def test_businesses_without_year_figures_say_to_be_filled(code):
    _, t = text_of(dpr({"code": code, "projectCost": 140000, "familyIncome": 100000, "isSc": True}))
    assert "to be filled with the bank" in t


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
    # Changed: was " …" (long gap reasons cut). The gap list is gone; long research text is cut at a
    # sentence end and points to the Feasibility tab (decision 4).
    assert "full text: Feasibility tab" in t


# Removed: test_dpr_too_long_is_rebuilt_compact_on_one_page and
# test_dpr_page_overflow_even_compact_is_a_clean_error. There is no page limit any more, so there is
# no overflow and no compact rebuild to test.


def test_year_table_matches_the_year_figures_and_carries_the_full_labels():
    _, t = text_of(dpr({"code": "D01", "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
    y = year_figures.years("D01", 350000)
    for c in y["rows"]["gross_benefit"][:3]:
        assert inr(c["value"]) in t
    assert "research file's own loan" in t                # decision 3
    assert " ".join(year_figures.DEP_LABEL.split()) in t   # decision 23, word for word
    assert " ".join(year_figures.TAX_LABEL.split()) in t
    assert "no subsidy in this NSFDC calculation" in t
    assert "assumed: same as Year 3" in t


def test_repayment_by_year_adds_up_to_the_loan_total():
    out = loan.build_loan(LoanRequest(project_cost=350000, is_sc=True, annual_family_income=200000))
    years = dpr_mod.repayment_by_year(out)
    assert sum(y["payment"] for y in years) == pytest.approx(out["summary"]["total_paid"]["value"], abs=1)
    _, t = text_of(dpr({"code": "D01", "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
    assert inr(years[1]["payment"]) in t


# Changed after review finding 3 (owner: fix now): it read "not eligible under Term Loan" and never said NSFDC.
@pytest.mark.parametrize("cost,want", [(140000, "not eligible under the NSFDC Micro Finance Scheme (MFS)."),
                                       (350000, "not eligible under the NSFDC Term Loan scheme.")])
def test_declaration_names_the_nsfdc_scheme_not_aif(cost, want):
    _, t = text_of(dpr(dict(BASE, projectCost=cost)))
    assert want in t
    assert "Agriculture Infrastructure Fund" not in t
    assert "Certify that the information / contents as above furnished by me / us are true" in t


def test_collateral_and_milestones():
    _, t = text_of(dpr(BASE))
    assert "not applicable: the loan is below ₹2 crore" in t
    assert "no payment (pause)" in t


# --------------------------------------------------------------------------- applicant fields (Stage 1c form)

FULL = {
    "name": "Asha Devi", "entityType": "Proprietorship", "pan": "ABCDE1234F", "gstin": "09ABCDE1234F1Z5",
    "registrationNo": "UDYAM-UP-00-0000000", "aadhaarLast4": "1234", "district": "Agra", "state": "Uttar Pradesh",
    "objective": "Make farm tools for the village", "isWoman": True,
    "promoters": [{"name": "Ravi Kumar", "aadhaarLast4": "5678", "pan": "ZZZZZ9999Z", "isMinority": False}],
    "enclosures": ["land documents", "machinery quotations"], "place": "Agra",
}


def test_applicant_fields_printed_masked_and_self_declared():
    _, t = text_of(dpr(dict(BASE, applicant=FULL)))
    assert "XXXX-XXXX-1234" in t and "XXXX-XXXX-5678" in t
    assert "ABCDE1234F (self-declared)" in t and "ZZZZZ9999Z (self-declared)" in t
    assert "Make farm tools for the village" in t and "Agra" in t


def test_new_applicant_name_wins_over_applicant_name():
    _, t = text_of(dpr(dict(BASE, applicantName="Old Name", applicant={"name": "New Name"})))
    assert "New Name" in t and "Old Name" not in t


@pytest.mark.parametrize("applicant", [
    {"aadhaarLast4": "12345"},                       # not exactly 4 digits
    {"aadhaarLast4": "12ab"},
    {"aadhaarLast4": "123456789012"},                # the full number is refused (decision 2)
    {"favouriteColour": "blue"},                     # unknown key
    {"promoters": [{"name": str(i)} for i in range(4)]},   # more than 3 promoters
    {"promoters": [{"aadhaarLast4": "99"}]},         # a promoter's Aadhaar checked the same way
    {"promoters": [{"nickname": "x"}]},              # unknown promoter key
    {"enclosures": ["a photo"]},                     # only the 8 FIDF checklist names
    {"isWoman": "yes"},                              # yes/no must be true/false
    {"district": "x" * 121},                         # text up to 120 characters
    {"name": "x" * 81},                              # the name up to 80
    {"promoters": "Ravi"},                           # a list, not text
])
def test_bad_applicant_fields_are_refused(applicant):
    r = dpr(dict(BASE, applicant=applicant))
    assert r.status_code == 400 and set(r.json()) >= {"error", "status", "timestamp"}


# Widened after review (D): the server's entry file is checked too, not only dpr.py.
def test_applicant_fields_are_never_logged():
    from backend import app as app_mod, compat
    for mod in (dpr_mod, app_mod, compat):
        src = inspect.getsource(mod)
        for banned in ("import logging", "getLogger", "log.", "logger", "print("):
            assert banned not in src, (mod.__name__, banned)


# --------------------------------------------------------------------------- review fixes (owner's rulings, 12 Nov 2026)

def _codes():
    from backend.compat import NAMES
    return list(NAMES)


# Finding 1: no maths codes, markdown marks or developer callouts from the research files on the PDF.
# Review (D): no NOT FOUND anywhere, for every business, not only one phrase absent.
@pytest.mark.parametrize("code", _codes())
def test_no_raw_markup_or_not_found_on_any_dpr(code):
    _, t = text_of(dpr({"code": code, "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
    for bad in ("$", "\\text", "\\frac", "\\mathbf", "\\rightarrow", "\\le", "[!", "GATE G01", "*", "NOT FOUND"):
        assert bad not in t, (code, bad, t[max(0, t.find(bad) - 60): t.find(bad) + 60])


def test_maths_codes_become_plain_words():
    assert dpr_mod._plain("$\\le ₹12\\text{ Lakh}$") == "≤ ₹12 Lakh"
    assert dpr_mod._plain("Year 1 DSCR: $\\frac{₹90,690}{₹39,535.27} = \\mathbf{2.29×}$") == "Year 1 DSCR: ₹90,690 / ₹39,535.27 = 2.29×"
    assert dpr_mod._plain("₹11,22,660 $\\rightarrow$ Gross") == "₹11,22,660 → Gross"
    assert dpr_mod._plain("$> 10^\\circ\\text{C}$") == "> 10°C"
    assert dpr_mod._plain("the *MoSPI Survey* says") == "the MoSPI Survey says"


# Finding 2: the surplus row rests on one normal month x 12, so it is A (assumed), not D.
def test_surplus_from_one_month_is_keyed_assumed():
    y = year_figures.years("D04", 1000000)
    assert {dpr_mod._key(c) for c in y["rows"]["surplus_before_loan"]} == {"A"}
    _, t = text_of(dpr({"code": "D04", "projectCost": 1000000, "familyIncome": 200000, "isSc": True}))
    assert f"Surplus before loan payments {inr(round(y['rows']['surplus_before_loan'][0]['value']))} A" in t


# Review (D): every cell's key follows its tag, for every business with year figures.
def test_every_year_cell_key_follows_its_tag():
    for code in _codes():
        y = year_figures.years(code, 350000)
        if y.get("status") != "ok":
            continue
        for name, row in y["rows"].items():
            for c in row:
                tag, k = c.get("tag", ""), dpr_mod._key(c)
                if c.get("value") is None:
                    assert k == "—"
                elif "assumed" in tag.lower():
                    assert k == "A", (code, name, tag)
                elif tag.startswith("CALCULATED"):
                    assert k == "C", (code, name, tag)
                elif "dossier" in tag:
                    assert k == "D", (code, name, tag)
                elif "UP MSME" in tag:
                    assert k == "P", (code, name, tag)


# Finding 4: the yearly repayment table adds up row by row: payment + interest added to the loan = interest + principal.
def test_repayment_years_add_up_row_by_row_and_print_the_added_interest():
    out = loan.build_loan(LoanRequest(project_cost=350000, is_sc=True, annual_family_income=200000))
    years = dpr_mod.repayment_by_year(out)
    bal = out["loan"]["loan_amount"]["value"]
    for y in years:
        assert y["payment"] + y["interest_added"] == pytest.approx(y["interest"] + y["principal"], abs=0.05)
        assert y["closing_balance"] <= bal + y["interest_added"] + 0.01
        bal = y["closing_balance"]
    assert years[-1]["closing_balance"] == pytest.approx(0, abs=0.01)
    assert sum(y["interest_added"] for y in years) == pytest.approx(out["summary"]["interest_added_during_pause"]["value"], abs=0.01)
    _, t = text_of(dpr({"code": "D01", "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
    assert "Interest added to the loan (pause)" in t
    y1 = years[0]
    assert (f"Year 1 {y1['pause_quarters']} {inr(y1['interest'])} {inr(y1['interest_added'])} {inr(y1['principal'])} "
            f"{inr(y1['payment'])} {inr(y1['closing_balance'])}") in t


# Finding 5: research text is cut at a sentence end (or after a whole line), never mid-sentence.
def test_capped_text_never_cuts_mid_sentence():
    full = f" ({dpr_mod.FULL_TEXT})"
    assert dpr_mod._capped(["First line ends here.", "Second " + "word " * 300 + "end."], cap=50) == "First line ends here." + full
    # no full stop inside the cap: cut after the last whole line
    assert dpr_mod._capped(["A whole line", "word " * 300], cap=50) == "A whole line" + full
    # one long line with no full stop at all: the whole line, never "…"
    long_line = ("word " * 300).strip()
    assert dpr_mod._capped([long_line], cap=50) == long_line + full
    # short text is untouched
    assert dpr_mod._capped(["Short text"], cap=50) == "Short text" + full


@pytest.mark.parametrize("code", _codes())
def test_research_text_on_the_dpr_ends_at_a_sentence_or_line(code):
    feas = dpr_mod.feasibility.report(code)
    for sid in ("market", "pricing", "compliance", "swot_competition"):
        lines = dpr_mod._item_lines(dpr_mod._section(feas, sid))
        out = dpr_mod._capped(lines)
        if not out:
            continue
        body = out[: -len(f" ({dpr_mod.FULL_TEXT})")]
        assert not body.endswith("…"), (code, sid)        # the research files themselves quote with "…" inside
        whole = " ".join(lines)
        assert whole.startswith(body), (code, sid)                     # only leading text, nothing rewritten
        assert body == whole or body.endswith((".", "!", "?")) or any(
            body == " ".join(lines[:i]) for i in range(1, len(lines) + 1)), (code, sid, body[-80:])


def _research_tags(code):
    import re
    feas = dpr_mod.feasibility.report(code)
    texts = [dpr_mod._capped(dpr_mod._item_lines(dpr_mod._section(feas, sid)))
             for sid in ("market", "pricing", "compliance", "swot_competition")]
    texts.append(dpr_mod._capped(dpr_mod._strengths(feas)))
    tags = set()
    for grp in re.findall(r"\[((?:S\d+[,;\s]*)+)\]", " ".join(texts)):
        tags |= set(re.findall(r"S\d+", grp))
    return tags


# Finding 6: every [Sn] tag printed from a research file is listed under Sources, with its line from that file.
@pytest.mark.parametrize("code", ["D01", "D04", "D11", "D16", "D20", "D21", "D22", "D24"])
def test_every_research_source_tag_printed_is_listed(code):
    _, t = text_of(dpr({"code": code, "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
    sources = t[t.rindex(" Sources "):]
    tags = _research_tags(code)
    assert tags, code
    for s in tags:
        assert f"[{code} research file {s}]" in sources, (code, s)
    assert "these numbers are the research file's own" in sources


# Finding 7: page 1 always says the Year 1-5 figures are for the reference size, not the applicant's project.
@pytest.mark.parametrize("code", ["D20", "D21", "D01"])
def test_page_one_says_whose_year_figures_these_are(code):
    reader, _ = text_of(dpr({"code": code, "projectCost": 140000, "familyIncome": 180000, "isSc": True}))
    p1 = page_text(reader, 0)
    assert "These Year 1-5 figures are for" in p1 and "not your ₹1,40,000 project" in p1


# Finding 8: wording that read wrong.
def test_reference_unit_label_under_the_year_table_and_no_doubled_phrases():
    for code in ("D16", "D19", "D20", "D21", "D22"):
        _, t = text_of(dpr({"code": code, "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
        y = year_figures.years(code, 350000)
        if y["size"]["basis"].startswith("reference unit"):
            assert "Reference unit: from the UP MSME project profile, ₹" in t and " lakh: " in t, code
        assert "project profile (UP MSME project profile" not in t
        assert "(reference unit, UP MSME project profile (never rescaled))" not in t
        assert "[CALCULATED, [" not in t


def test_cost_groups_print_in_plain_words():
    raw = {"civil_works", "first_batch_inputs", "furniture_fittings", "licences_deposits", "working_capital"}
    for code in ("D01", "D11", "D12", "D14"):
        _, t = text_of(dpr({"code": code, "projectCost": 2000000, "familyIncome": 200000, "isSc": True}))
        assert not [g for g in raw if g in t], code
    assert set(dpr_mod.GROUP_NAMES) >= raw | {"tools", "livestock", "stock", "vehicle", "machinery", "insurance"}


def test_not_eligible_loan_sections_say_no_loan():
    _, t = text_of(dpr({"code": "D20", "projectCost": 140000, "familyIncome": 600000, "isSc": True}))
    assert "may differ" not in t and "the loan is below ₹2 crore" not in t
    # Changed in Stage 1d (owner's ruling, 13 Nov 2026): the Hindi heading line now sits between the English
    # heading and its text, so the two are checked separately, and in order.
    head = t.index("19. Collateral")
    assert t.index("not applicable: no NSFDC loan (see page 1).", head) < t.index("20. Approvals", head)
    assert t.count("no NSFDC loan (see page 1)") >= 3


def test_a_loan_of_zero_rupees_is_not_shown_as_payments_of_zero():
    _, t = text_of(dpr({"code": "D20", "projectCost": 1, "familyIncome": 100000, "isSc": True}))
    assert "of about ₹0" not in t and "the loan works out to ₹0" in t


def test_headings_stay_with_their_text():
    assert dpr_mod.ST["h"].keepWithNext


# Finding 9: applicant checks.
@pytest.mark.parametrize("applicant", [
    {"aadhaarLast4": "١٢٣٤"},            # Arabic-Indic digits
    {"aadhaarLast4": "१२३४"},             # Devanagari digits
    {"promoters": ""}, {"promoters": {}}, {"enclosures": ""}, {"enclosures": {}},
])
def test_more_bad_applicant_fields_are_refused(applicant):
    r = dpr(dict(BASE, applicant=applicant))
    assert r.status_code == 400 and set(r.json()) >= {"error", "status", "timestamp"}


# Review (D): tests that were missing.
def test_every_numbered_heading_appears_exactly_once():
    _, t = text_of(dpr(BASE))
    for h in HEADINGS[1:-1]:
        assert t.count(h) == 1, h


def test_ticked_enclosure_prints_yes_and_unticked_a_blank():
    _, t = text_of(dpr(dict(BASE, applicant=FULL)))
    assert "land documents yes" in t and "machinery quotations yes" in t
    assert f"cost abstract {dpr_mod.BLANK}" in t


def test_markup_in_applicant_text_prints_as_typed():
    _, t = text_of(dpr(dict(BASE, applicant={"name": "<b>A&B</b>"})))
    assert "<b>A&B</b>" in t


def test_old_applicant_name_alone_still_prints():
    _, t = text_of(dpr(dict(BASE, applicantName="Only Old Name")))
    assert "Only Old Name" in t


def test_top_level_woman_and_minority_print_for_the_lead_promoter():
    _, t = text_of(dpr(dict(BASE, applicant={"isWoman": True, "isMinority": False})))
    assert "Lead promoter woman / minority yes / no" in t


# Found while checking the fix for finding 1: the maths clean-up must not touch web addresses or plain text.
def test_plain_text_and_web_addresses_are_left_as_written():
    url = "https://mospi.gov.in/uploads/publications_reports/nic_2008_17apr09.pdf"
    assert dpr_mod._plain(url) == url
    assert dpr_mod._plain("C_6 in a {set} of words") == "C_6 in a {set} of words"
    defs = dpr_mod.research_sources("D20")
    assert any("publications_reports" in v for v in defs.values())


# Stage 1c, decision 13 (owner, 13 Nov 2026): a running check, not only a source scan. Marked values go
# through a real request; the program's own log (every logger, DEBUG and up) and its printed output
# must hold none of them. Limit: this does not cover the web server's request log, which records the
# address and status, never the request body.
def test_applicant_values_never_reach_the_log_when_a_dpr_is_made(caplog, capsys):
    import logging
    marks = {"name": "MARK-NAME-7731", "pan": "MARKP7731Q", "aadhaarLast4": "7731", "district": "MARK-DIST-7731",
             "promoters": [{"name": "MARK-PROM-7731", "aadhaarLast4": "4417"}]}
    with caplog.at_level(logging.DEBUG):
        # Review finding 10: prove the capture works before trusting "nothing logged" (one known line
        # through the root logger, a backend logger and the web server's logger).
        for name in ("", "backend.dpr", "uvicorn.error"):
            logging.getLogger(name).warning("CAPTURE-CHECK-%s", name or "root")
        assert all(f"CAPTURE-CHECK-{n}" in caplog.text for n in ("root", "backend.dpr", "uvicorn.error"))
        _, t = text_of(dpr(dict(BASE, applicant=marks)))
        bad = dpr(dict(BASE, applicant=dict(marks, aadhaarLast4="MARK-BAD-7731")))
    assert "MARK-NAME-7731" in t                           # the values did reach the PDF
    assert bad.status_code == 400
    out = capsys.readouterr()
    logged = caplog.text + out.out + out.err
    for v in ("MARK-NAME-7731", "MARKP7731Q", "MARK-DIST-7731", "MARK-PROM-7731", "MARK-BAD-7731", "XXXX-XXXX-7731"):
        assert v not in logged, v


# =========================================================================== Stage 1d: Hindi in the PDF
# Owner's decisions 1-18, 13 Nov 2026. Hindi read back with pypdf is jumbled (shaped letters are reordered),
# so these checks look at WHICH FONT drew each piece of text (pypdf's text visitor) and at the shaping data.

import re as _re
from pathlib import Path as _Path

DEVA = _re.compile(r"[ऀ-ॿ]")
FONTS_DIR = _Path(__file__).resolve().parents[1] / "fonts"


def pieces(resp):
    """[(font name, text)] for every piece of text drawn in the PDF."""
    assert resp.status_code == 200, resp.text[:300]
    out = []
    for page in PdfReader(io.BytesIO(resp.content)).pages:
        page.extract_text(visitor_text=lambda t, cm, tm, fd, fs: out.append(((fd or {}).get("/BaseFont", ""), t))
                          if t and t.strip() else None)
    return out


def _deva_only_in_noto(ps):
    bad = [(f, t) for f, t in ps if DEVA.search(t) and "NotoSansDevanagari" not in f]
    assert not bad, bad[:5]


def test_1d_fonts_licence_and_pin_are_in_place():
    sizes = {"NotoSansDevanagari-Regular.ttf": 243520, "NotoSansDevanagari-Bold.ttf": 250176}
    for name, size in sizes.items():
        assert (FONTS_DIR / name).stat().st_size == size, name
    lic = (FONTS_DIR / "LICENSE-NotoSansDevanagari-OFL.txt").read_text(encoding="utf8")
    assert "SIL Open Font License" in lic and "243520" in lic and "250176" in lic and "raw.githubusercontent.com" in lic
    req = (_Path(__file__).resolve().parents[1] / "requirements.txt").read_text(encoding="utf8")
    assert _re.search(r"^uharfbuzz==0\.56\.4\s*$", req, _re.M)


def test_1d_hindi_typed_by_the_applicant_is_drawn_in_noto_never_boxes():
    ps = pieces(dpr(dict(BASE, applicant={"name": "सुरेश कुमार", "village": "रामपुर", "district": "आगरा"})))
    _deva_only_in_noto(ps)
    assert any("NotoSansDevanagari" in f and DEVA.search(t) for f, t in ps)


def test_1d_hindi_is_shaped_and_english_is_not():
    from reportlab.pdfbase.ttfonts import ShapedStr, shapeStr
    from reportlab.pdfbase import pdfmetrics
    assert dpr_mod.ST["hi"].shaping and dpr_mod.ST["hih"].shaping
    assert isinstance(shapeStr("कि", dpr_mod.HI_FONT, 10), ShapedStr)
    for name in ("title", "h", "p", "s", "cell", "cellb"):
        assert not getattr(dpr_mod.ST[name], "shaping", 0), name
    twin = pdfmetrics.getFont(dpr_mod.PLAIN_FONT)
    assert isinstance(twin, dpr_mod.PlainTTFont)
    with pytest.raises(AttributeError):
        twin.hbFont(10)


# Review (owner: fix now): all 24 businesses, not 10.
@pytest.mark.parametrize("code", sorted(__import__("backend.compat", fromlist=["NAMES"]).NAMES))
def test_1d_no_joined_english_letters_anywhere(code):
    _, t = text_of(dpr({"code": code, "projectCost": 350000, "familyIncome": 200000, "isSc": True}))
    for lig in ("ﬁ", "ﬂ", "ﬀ", "ﬃ", "ﬄ", "ﬆ", "ﬅ", "₨"):
        assert lig not in t, (code, lig)


def test_1d_english_inside_hindi_uses_the_unshaped_twin():
    ps = pieces(dpr(dict(BASE, applicant={"village": "रामपुर Street", "district": "D20-का", "place": "राम&श्याम"})))
    _deva_only_in_noto(ps)
    assert any("DejaVuSans-Plain" in f and "Street" in t for f, t in ps)
    assert any("DejaVuSans-Plain" in f and "&" in t for f, t in ps)          # decision 18: & is not in Noto
    assert any("DejaVuSans-Plain" in f and "D20-" in t for f, t in ps)        # decision 2
    assert not any("NotoSansDevanagari" in f and _re.search(r"[A-Za-z&]", t) for f, t in ps)
    _, t = text_of(dpr(dict(BASE, applicant={"village": "रामपुर Street"})))
    assert "ﬆ" not in t and "Street" in t


def test_1d_every_numbered_heading_has_its_hindi_line_with_no_english_letters():
    assert set(dpr_mod.HEADINGS_HI) == set(HEADINGS)
    for en, hi in dpr_mod.HEADINGS_HI.items():
        assert DEVA.search(hi), en
        assert not _re.search(r"[A-Za-z]", hi), (en, hi)                     # decision 17: no bold twin needed
    ps = pieces(dpr(BASE))
    bold_hi = [t for f, t in ps if "NotoSansDevanagari-Bold" in f]
    assert len(bold_hi) >= len(HEADINGS)
    _deva_only_in_noto(ps)


NUM = _re.compile(r"\d+(?:,\d+)*(?:\.\d+)?")


@pytest.mark.parametrize("body", [
    dict(BASE),
    {"code": "D20", "projectCost": 140000, "familyIncome": 600000, "isSc": False},   # not eligible, most reasons
    {"code": "D20", "projectCost": 1, "familyIncome": 100000, "isSc": True},          # ₹0 loan
    {"code": "D15", "projectCost": 140000, "familyIncome": 100000, "isSc": True},     # no year figures
    {"code": "D01", "projectCost": 350000, "familyIncome": 200000, "isSc": True},
])
def test_1d_page_one_hindi_column_uses_only_the_english_numbers(body):
    r = dpr(body)
    assert r.status_code == 200, r.text[:300]                                       # builds, even the longest
    out = loan.build_loan(LoanRequest(project_cost=body["projectCost"], is_sc=body["isSc"],
                                      annual_family_income=body["familyIncome"]))
    yfs = year_figures.years(body["code"], body["projectCost"])
    pairs = dpr_mod.summary_pairs(body["code"], LoanRequest(project_cost=body["projectCost"], is_sc=body["isSc"],
                                  annual_family_income=body["familyIncome"]), out, yfs,
                                  dpr_mod._research_loan(body["code"], yfs), [])
    assert pairs and all(DEVA.search(hi) for _, hi in pairs)
    for en, hi in pairs:
        assert set(NUM.findall(hi)) <= set(NUM.findall(en)), (en, hi)
    _deva_only_in_noto(pieces(r))


def test_1d_declaration_has_a_hindi_translation_marked_english_governs():
    _, t = text_of(dpr(BASE))
    assert "translation; English governs" in t
    assert DEVA.search(dpr_mod.DECLARATION_HI)
    assert "Certify that the information / contents as above furnished by me / us are true" in t


def test_1d_without_the_hindi_tools_an_english_pdf_with_a_note(monkeypatch):
    from reportlab.pdfbase import ttfonts
    monkeypatch.setattr(ttfonts, "uharfbuzz", None)                                 # switched off for real
    r = dpr(dict(BASE, applicant={"name": "सुरेश कुमार"}))
    reader, t = text_of(r)
    assert "Hindi could not be printed on this server" in page_text(reader, 0)
    assert "[Hindi text: cannot print on this server]" in t
    assert not DEVA.search(t)                                                       # never boxes, never unshaped Hindi
    assert "Summary in plain words" in t


# --------------------------------------------------------------------------- Stage 1d review fixes (owner, 13 Nov 2026)

def _plain_text(markup):
    return _re.sub(r"<[^>]+>", "", markup).replace("&amp;", "&")


@pytest.mark.parametrize("body,en,hi", [
    (dict(BASE, projectCost=350000), "the NSFDC Term Loan scheme", "NSFDC Term Loan योजना"),
    (BASE, "the NSFDC Micro Finance Scheme (MFS)", "NSFDC Micro Finance Scheme (MFS)"),
    ({"code": "D20", "projectCost": 140000, "familyIncome": 600000, "isSc": True}, "the NSFDC loan schemes", "NSFDC ऋण योजनाओं"),
    ({"code": "D20", "projectCost": 1, "familyIncome": 100000, "isSc": True}, "the NSFDC loan schemes", "NSFDC ऋण योजनाओं"),
])
def test_1d_fix1_declaration_scheme_names_in_both_languages(body, en, hi):
    out = loan.build_loan(LoanRequest(project_cost=body["projectCost"], is_sc=body["isSc"],
                                      annual_family_income=body["familyIncome"]))
    assert dpr_mod.scheme_names(out) == (en, hi)
    text = DECLARATION_TEXT = dpr_mod.DECLARATION_HI.format(scheme_hi=hi, name="……")   # name slot added 14 Nov (Fix 7.1)
    assert "योजना s" not in text and "loan योजना" not in text
    assert "अंग्रेज़ी पाठ ही मान्य होगा" in text and "रहूँगा/रहूँगी/रहेंगे" in text


def _most_reasons():
    return {"code": "D20", "projectCost": 99999999, "familyIncome": 900000, "isSc": False}


def test_1d_fix2_reasons_are_separate_small_lines_each_with_a_short_hindi_reason():
    b = _most_reasons()
    req = LoanRequest(project_cost=b["projectCost"], is_sc=b["isSc"], annual_family_income=b["familyIncome"])
    out = loan.build_loan(req)
    assert len(out["reasons"]) == 3
    pairs = dpr_mod.summary_pairs("D20", req, out, year_figures.years("D20", b["projectCost"]),
                                  dpr_mod._research_loan("D20", year_figures.years("D20", b["projectCost"])),
                                  [{"text": "projectCost 99999999.5 rounded down to the whole rupee.", "tag": "ASSUMED"}])
    bullets = [(en, hi) for en, hi in pairs if en.startswith("•")]
    assert len(bullets) == 3
    want = ["अनुसूचित जाति से नहीं", "वार्षिक पारिवारिक आय ₹5,00,000 से अधिक", "परियोजना लागत ₹50,00,000"]
    for (en, hi), w in zip(bullets, want):
        assert w in hi, (en, hi)
    for en, hi in pairs:                                                   # notes rows included this time
        assert set(NUM.findall(hi)) <= set(NUM.findall(en)), (en, hi)
    assert dpr(b).status_code == 200


def test_1d_fix3_figures_in_hindi_lines_use_one_font_and_no_stray_space():
    assert _plain_text(dpr_mod._hi_markup("व्यवसाय: D01।")) == "व्यवसाय: D01।"
    m = dpr_mod._hi_markup("₹1,96,896।")
    assert _plain_text(m) == "₹1,96,896।"
    assert f'<font name="{dpr_mod.PLAIN_FONT}">₹1,96,896' in m                # digits and ₹ in the English font
    for f, t in pieces(dpr(BASE)):
        if "NotoSansDevanagari-Regular" in f:
            assert not _re.search(r"[0-9₹]", t), t                          # never Noto digits in Hindi lines


def test_1d_fix3_hindi_title_has_no_english_letters():
    out = loan.build_loan(LoanRequest(project_cost=140000, is_sc=True, annual_family_income=180000))
    yfs = year_figures.years("D20", 140000)
    flow = dpr_mod._summary("D20", LoanRequest(project_cost=140000, is_sc=True, annual_family_income=180000),
                            out, yfs, dpr_mod._research_loan("D20", yfs), [])
    hindi_title = _plain_text(flow[1].text)
    assert DEVA.search(hindi_title) and not _re.search(r"[A-Za-z]", hindi_title), hindi_title


def test_1d_fix4_rare_devanagari_prints_in_noto():
    ps = pieces(dpr(dict(BASE, applicant={"village": "ꣲꣳ ᳚"})))
    assert any("NotoSansDevanagari" in f and "ꣲ" in t for f, t in ps)
    assert not any("DejaVu" in f and _re.search("[\ua8e0-\ua8ff\u1cd0-\u1cff]", t) for f, t in ps)


def test_1d_shaped_hindi_has_the_i_sign_before_its_letter():
    from reportlab.pdfbase.ttfonts import shapeStr
    s = str(shapeStr("कि", dpr_mod.HI_FONT, 10))
    assert len(s) == 2 and s[1] == "क" and s[0] != "क"                    # "ि" is drawn first


def test_1d_each_hindi_heading_comes_right_after_its_english_heading():
    ps = pieces(dpr(BASE))
    seen = 0
    for i, (f, t) in enumerate(ps):
        if "DejaVuSans-Bold" in f and t.strip() in HEADINGS:
            nxt = next((g for g, u in ps[i + 1:] if u.strip()), "")
            assert "NotoSansDevanagari-Bold" in nxt, t
            seen += 1
    assert seen == len(HEADINGS)


def test_1d_without_the_noto_font_an_english_pdf_with_a_note(monkeypatch):
    monkeypatch.setattr(dpr_mod, "NOTO_CHARS", set())                     # as when the font file fails to load
    reader, t = text_of(dpr(dict(BASE, applicant={"name": "सुरेश कुमार"})))
    assert "Hindi could not be printed on this server" in page_text(reader, 0)
    assert not DEVA.search(t) and "[Hindi text: cannot print on this server]" in t


def test_1d_review_wording():
    assert dpr_mod.HEADINGS_HI["21. Raw material and catchment"] == "21. कच्चा माल और आसपास का क्षेत्र (कैचमेंट)"
    assert dpr_mod.HEADINGS_HI["20. Approvals, pollution and risks"].startswith("20. स्वीकृतियाँ")
    assert dpr_mod.HEADINGS_HI["9. Process flow chart"] == "9. प्रक्रिया प्रवाह चार्ट"
    req = LoanRequest(project_cost=140000, is_sc=True, annual_family_income=180000)
    yfs = year_figures.years("D20", 140000)
    hi = " ".join(h for _, h in dpr_mod.summary_pairs("D20", req, loan.build_loan(req), yfs,
                                                     dpr_mod._research_loan("D20", yfs), []))
    assert "आपके द्वारा दर्ज" in hi and "छोटा-बड़ा नहीं किया गया" in hi and "बदली नहीं गई" not in hi
    yfs1 = year_figures.years("D01", 350000)
    req1 = LoanRequest(project_cost=350000, is_sc=True, annual_family_income=200000)
    hi1 = " ".join(h for _, h in dpr_mod.summary_pairs("D01", req1, loan.build_loan(req1), yfs1,
                                                      dpr_mod._research_loan("D01", yfs1), []))
    assert "आकार वाली इकाई के हैं" in hi1
    web = (_Path(__file__).resolve().parents[2] / "frontend/src/services/applicantForm.js").read_text(encoding="utf8")
    assert "'आसपास का क्षेत्र (कैचमेंट)'" in web and "'सेवा क्षेत्र'" not in web


def test_1d_gap_above_the_date_line():
    src = inspect.getsource(dpr_mod._build)
    i = src.index("DECLARATION_HI.format")
    assert "Spacer(" in src[i: src.index('"Date: ', i)]


# Found while checking review fix 3 on the rendered page: "।" after a Hindi word got a stray space.
def test_1d_danda_after_a_hindi_word_has_no_space():
    for w in ("हैं।", "नहीं।", "(ब्रेक-ईवन)।", "हाँ॥"):
        assert _plain_text(dpr_mod._hi_markup(w)) == w, w


# =========================================================================== 14 Nov 2026: owner's Fix 4 and Fix 7
D01_HINDI = {"code": "D01", "projectCost": 140000, "familyIncome": 180000, "isSc": True}


def test_fix4_the_pdf_says_every_3_months_never_quarters():
    _, t = text_of(dpr(dict(BASE, projectCost=350000)))
    assert "quarter" not in t.lower().replace("equated quarterly", ""), t[t.lower().find("quarter") - 80: t.lower().find("quarter") + 40]
    assert "periods of 3 months" in t and "Pause (3-month periods)" in t


def test_fix7_1_the_declaration_carries_the_typed_name_in_both_languages():
    _, t = text_of(dpr(dict(D01_HINDI, applicant={"name": "Asha Devi"})))
    assert "I Asha Devi certify that the information" in t
    assert dpr_mod.DECLARATION_HI.startswith("अनुवाद") and "{name}" in dpr_mod.DECLARATION_HI
    _, t2 = text_of(dpr(D01_HINDI))                                        # no name typed: the blank stays
    assert "I ……………………………Certify that" in t2


def test_fix7_2_sources_line_uses_forward_slashes():
    _, t = text_of(dpr(D01_HINDI))
    assert "research_dossiers/D01_Village_FMCG_Retail_Dossier.md" in t and "research_dossiers\\" not in t


def test_fix7_3_every_note_under_the_year_table_names_its_row():
    y = year_figures.years("D01", 140000)
    labels = tuple(lbl for _, lbl in dpr_mod.ROW_LABELS)
    notes = dpr_mod._year_notes(y)
    assert notes and all(n.startswith(labels) for n in notes), [n for n in notes if not n.startswith(labels)][:3]


def test_fix7_4_milestones_mark_pay_only_when_a_payment_falls_due():
    out = loan.build_loan(LoanRequest(project_cost=140000, is_sc=True, annual_family_income=180000))
    row = dpr_mod.milestone_row(out)
    pause = out["loan"]["moratorium_quarters"]["value"] * 3
    assert row[:pause] == ["pause"] * pause
    assert [m for m, v in enumerate(row, 1) if v == "pay"] == [m for m in range(pause + 1, 13) if m % 3 == 0]


def test_fix7_5_demand_section_is_not_a_copy_of_the_introduction():
    _, t = text_of(dpr(D01_HINDI))
    intro = t[t.index("3. Introduction"): t.index("4. Benefits")]
    demand = t[t.index("22. Demand and marketing"): t.index("23. Renewable energy")]
    first_words = " ".join(intro.split()[8:20])
    assert first_words not in demand, first_words
    assert "harvest" in demand.lower()


def test_fix7_6_excerpts_never_end_on_a_dossier_heading():
    from backend import feasibility
    for code in ("D01", "D04", "D12", "D20"):
        feas = feasibility.report(code)
        for sid in ("market", "pricing", "season", "compliance", "swot_competition"):
            heads = [it["text"] for it in dpr_mod._section(feas, sid) if it.get("header") and it.get("text")]
            lines = dpr_mod._item_lines(dpr_mod._section(feas, sid))
            assert not any(h and _plain_text(dpr_mod._plain(h)) in lines for h in heads), (code, sid)
    _, t = text_of(dpr(D01_HINDI))
    assert "Zero Default Across Tiers" not in t


# 14 Nov 2026, owner's Fix 8 decision for D18 (option 1): instead of a bare "to be filled with the bank", a
# worksheet of what the bank must fill, with only the figures the D18 research file itself prints.
def test_fix8_d18_worksheet_lists_the_inputs_and_only_dossier_figures():
    _, t = text_of(dpr({"code": "D18", "projectCost": 140000, "familyIncome": 100000, "isSc": True}))
    assert "Worksheet to fill with the bank" in t
    for item in ("Stitching charge per garment", "Garments per machine per day", "Rent", "Electricity",
                 "Thread, needles, buttons, consumables", "Single needle lock stitch machine with motor"):
        assert item in t, item
    dossier = next((_Path(__file__).resolve().parents[2] / "research_dossiers").glob("D18_*.md")).read_text(encoding="utf8")
    for fig in ("47,300", "52,000", "9,930"):
        assert f"₹{fig}" in t and fig in dossier, fig                     # every figure is the research file's own
    rows = dpr_mod.WORKSHEETS["D18"]
    assert all(r[1] is None or r[2] for r in rows), "a figure without its tag"
