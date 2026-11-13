"""
Tests for POST /api/dpr: the multi-page English DPR (Detailed Project Report) PDF (Phase 1, Stage 1b;
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
    assert "19. Collateral not applicable: no NSFDC loan" in t
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
