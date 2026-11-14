"""
Unit and Integration Tests for Universal Multi-Category Schemes Engine (backend/schemes.py).

Verifies:
1. All 7 Central Government Schemes:
   - NSFDC (SC): MCF, Term Loan, Mahila Samridhi Yojana
   - NSTFDC (ST): Term Loan, Adivasi Mahila Sashaktikaran Yojana
   - NBCFDC (OBC/EBC): General Term Loan, New Swarnima
   - PMEGP: Rural Special (35%), Urban Special (25%), Rural General (25%), Urban General (15%)
   - PM Vishwakarma: 18 traditional crafts, 5% concessional credit, ₹15,000 toolkit voucher grant
   - PM MUDRA: Shishu, Kishore, Tarun (100% collateral-free)
   - PMFME: 35% capital subsidy capped at ₹10 Lakhs for micro-food units
2. Multi-scheme financial benefit ranking and best strategic recommendation.
3. FastAPI endpoint POST /api/schemes/evaluate (including route order before compat.router).
4. Groq chat tool `evaluate_schemes` integration.
"""

import json
import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend import chat, schemes

client = TestClient(app)


# ==============================================================================
# 1. NSFDC SCHEME TESTS (Scheduled Castes)
# ==============================================================================

def test_nsfdc_micro_credit_eligible():
    """SC entrepreneur, cost ₹1.40L, income ₹1.80L -> MCF eligible."""
    res = schemes.evaluate(
        caste_category="SC",
        annual_income=180000,
        project_cost=140000,
        gender="male",
        is_rural=True
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSFDC_MICRO_CREDIT" in codes
    mcf = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NSFDC_MICRO_CREDIT")
    assert mcf["loan_principal"] == 125000.0
    assert mcf["promoter_equity"] == 15000.0
    assert mcf["interest_rate_pa"] == 6.5
    assert mcf["tenure_months"] == 36
    assert mcf["monthly_emi"] > 0


def test_nsfdc_term_loan_eligible():
    """SC entrepreneur, cost ₹10.0L -> Term Loan eligible with 90% loan and 10% equity."""
    res = schemes.evaluate(
        caste_category="SC",
        annual_income=250000,
        project_cost=1000000,
        gender="male"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSFDC_TERM_LOAN" in codes
    tl = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NSFDC_TERM_LOAN")
    assert tl["loan_principal"] == 900000.0
    assert tl["promoter_equity"] == 100000.0
    assert tl["interest_rate_pa"] == 8.0
    assert tl["tenure_months"] == 84


def test_nsfdc_mahila_samridhi_eligible():
    """SC woman entrepreneur, cost ₹1.40L -> Mahila Samridhi Yojana (4.0% interest)."""
    res = schemes.evaluate(
        caste_category="SC",
        annual_income=150000,
        project_cost=140000,
        gender="female"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSFDC_MAHILA_SAMRIDHI" in codes
    msy = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NSFDC_MAHILA_SAMRIDHI")
    assert msy["loan_principal"] == 125000.0
    assert msy["interest_rate_pa"] == 4.0


def test_nsfdc_male_not_eligible_for_mahila_samridhi():
    """SC male entrepreneur -> MSY rejected in ineligible_reasons."""
    res = schemes.evaluate(
        caste_category="SC",
        annual_income=150000,
        project_cost=140000,
        gender="male"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSFDC_MAHILA_SAMRIDHI" not in codes


def test_nsfdc_non_sc_rejected():
    """OBC or General applicant -> NSFDC rejected citing SC statutory requirement."""
    res = schemes.evaluate(
        caste_category="OBC",
        annual_income=150000,
        project_cost=140000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("NSFDC" in c for c in codes)
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "NSFDC")
    assert "Scheduled Castes" in inel["reason"]


def test_nsfdc_income_over_5_lakh_rejected():
    """SC applicant with income ₹5,50,000 -> exceeds NSFDC ₹5L ceiling."""
    res = schemes.evaluate(
        caste_category="SC",
        annual_income=550000,
        project_cost=1000000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("NSFDC" in c for c in codes)
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "NSFDC")
    assert "5,00,000" in inel["reason"]


def test_nsfdc_cost_over_50_lakh_rejected():
    """SC applicant with cost ₹55 Lakhs -> exceeds NSFDC ₹50L ceiling."""
    res = schemes.evaluate(
        caste_category="SC",
        annual_income=200000,
        project_cost=5500000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("NSFDC" in c for c in codes)


# ==============================================================================
# 2. NSTFDC SCHEME TESTS (Scheduled Tribes)
# ==============================================================================

def test_nstfdc_term_loan_eligible():
    """ST applicant, cost ₹6.0L -> NSTFDC Term Loan eligible @ 6.0%."""
    res = schemes.evaluate(
        caste_category="ST",
        project_cost=600000,
        gender="male"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSTFDC_TERM_LOAN" in codes
    tl = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NSTFDC_TERM_LOAN")
    assert tl["loan_principal"] == 540000.0  # 90%
    assert tl["promoter_equity"] == 60000.0   # 10%
    assert tl["interest_rate_pa"] == 6.0
    assert tl["tenure_months"] == 60


def test_nstfdc_adivasi_mahila_eligible():
    """ST woman applicant, cost ₹1.50L -> AMSY eligible @ 4.0%."""
    res = schemes.evaluate(
        caste_category="ST",
        project_cost=150000,
        gender="female"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSTFDC_AMSY" in codes
    amsy = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NSTFDC_AMSY")
    assert amsy["loan_principal"] == 135000.0  # 90%
    assert amsy["interest_rate_pa"] == 4.0


def test_nstfdc_non_st_rejected():
    """SC applicant -> NSTFDC rejected citing ST statutory guidelines."""
    res = schemes.evaluate(
        caste_category="SC",
        project_cost=500000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("NSTFDC" in c for c in codes)
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "NSTFDC")
    assert "Scheduled Tribes" in inel["reason"]


def test_nstfdc_male_not_eligible_for_amsy():
    """ST male applicant -> AMSY rejected in ineligible_reasons."""
    res = schemes.evaluate(
        caste_category="ST",
        project_cost=150000,
        gender="male"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NSTFDC_AMSY" not in codes
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "NSTFDC_AMSY")
    assert "women" in inel["reason"].lower()


# ==============================================================================
# 3. NBCFDC SCHEME TESTS (OBC / EBC)
# ==============================================================================

def test_nbcfdc_new_swarnima_eligible():
    """OBC woman applicant, income ₹2.0L, cost ₹1.80L -> New Swarnima eligible @ 5.0%."""
    res = schemes.evaluate(
        caste_category="OBC",
        annual_income=200000,
        project_cost=180000,
        gender="female"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NBCFDC_NEW_SWARNIMA" in codes
    sw = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NBCFDC_NEW_SWARNIMA")
    assert sw["loan_principal"] == 171000.0  # 95%
    assert sw["promoter_equity"] == 9000.0   # 5%
    assert sw["interest_rate_pa"] == 5.0


def test_nbcfdc_general_term_loan_eligible():
    """OBC applicant, income ₹2.50L, cost ₹10.0L -> NBCFDC Term Loan eligible @ 7.0%."""
    res = schemes.evaluate(
        caste_category="OBC",
        annual_income=250000,
        project_cost=1000000,
        gender="male"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "NBCFDC_TERM_LOAN" in codes
    tl = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NBCFDC_TERM_LOAN")
    assert tl["loan_principal"] == 850000.0  # 85%
    assert tl["promoter_equity"] == 150000.0 # 15%
    assert tl["interest_rate_pa"] == 7.0


def test_nbcfdc_term_loan_under_5_lakh_has_6_pct_rate():
    """OBC applicant, cost ₹4.0L -> interest rate is 6.0%."""
    res = schemes.evaluate(
        caste_category="OBC",
        annual_income=200000,
        project_cost=400000
    )
    tl = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "NBCFDC_TERM_LOAN")
    assert tl["interest_rate_pa"] == 6.0


def test_nbcfdc_income_over_3_lakh_rejected():
    """OBC applicant with income ₹3,50,000 -> exceeds NBCFDC ₹3L ceiling."""
    res = schemes.evaluate(
        caste_category="OBC",
        annual_income=350000,
        project_cost=500000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("NBCFDC" in c for c in codes)
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "NBCFDC")
    assert "3,00,000" in inel["reason"]


def test_nbcfdc_general_category_rejected():
    """General category applicant -> NBCFDC rejected."""
    res = schemes.evaluate(
        caste_category="General",
        annual_income=150000,
        project_cost=500000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("NBCFDC" in c for c in codes)


# ==============================================================================
# 4. PMEGP SCHEME TESTS (Margin Money Subsidy Calculations)
# ==============================================================================

def test_pmegp_rural_special_35_pct_subsidy():
    """Rural Special (SC/ST/OBC/Woman), cost ₹10.0L -> exactly 35% margin money subsidy."""
    res = schemes.evaluate(
        caste_category="SC",
        project_cost=1000000,
        is_rural=True
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PMEGP_RURAL_SPECIAL" in codes
    p = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PMEGP_RURAL_SPECIAL")
    assert p["subsidy_amount"] == 350000.0   # 35%
    assert p["subsidy_rate_pct"] == 35.0
    assert p["promoter_equity"] == 50000.0   # 5%
    assert p["promoter_equity_pct"] == 5.0
    assert p["loan_principal"] == 600000.0   # 60%
    assert p["interest_rate_pa"] == 9.5
    # Verification of amortizing monthly EMI on ₹6,00,000 @ 9.5% for 60 months
    expected_emi = schemes.calculate_emi(600000.0, 9.5, 60)
    assert p["monthly_emi"] == expected_emi


def test_pmegp_urban_special_25_pct_subsidy():
    """Urban Special (SC/ST/OBC/Woman in urban area), cost ₹10.0L -> 25% subsidy, 5% equity."""
    res = schemes.evaluate(
        caste_category="OBC",
        project_cost=1000000,
        is_rural=False
    )
    p = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PMEGP_URBAN_SPECIAL")
    assert p["subsidy_amount"] == 250000.0   # 25%
    assert p["promoter_equity"] == 50000.0   # 5%
    assert p["loan_principal"] == 700000.0   # 70%


def test_pmegp_rural_general_25_pct_subsidy():
    """Rural General category, cost ₹10.0L -> 25% subsidy, 10% equity."""
    res = schemes.evaluate(
        caste_category="General",
        project_cost=1000000,
        is_rural=True,
        gender="male"
    )
    p = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PMEGP_RURAL_GENERAL")
    assert p["subsidy_amount"] == 250000.0   # 25%
    assert p["promoter_equity"] == 100000.0  # 10%
    assert p["loan_principal"] == 650000.0   # 65%


def test_pmegp_urban_general_15_pct_subsidy():
    """Urban General category, cost ₹10.0L -> 15% subsidy, 10% equity."""
    res = schemes.evaluate(
        caste_category="General",
        project_cost=1000000,
        is_rural=False,
        gender="male"
    )
    p = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PMEGP_URBAN_GENERAL")
    assert p["subsidy_amount"] == 150000.0   # 15%
    assert p["promoter_equity"] == 100000.0  # 10%
    assert p["loan_principal"] == 750000.0   # 75%


def test_pmegp_cost_over_50_lakh_rejected():
    """Manufacturing project cost ₹55 Lakhs -> exceeds PMEGP ₹50L ceiling."""
    res = schemes.evaluate(
        caste_category="SC",
        project_cost=5500000
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("PMEGP" in c for c in codes)
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "PMEGP")
    assert "50 Lakhs" in inel["reason"]


def test_pmegp_service_over_20_lakh_rejected():
    """Service enterprise with cost ₹25 Lakhs -> exceeds PMEGP ₹20L ceiling."""
    res = schemes.evaluate(
        caste_category="SC",
        project_cost=2500000,
        activity_type="service"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("PMEGP" in c for c in codes)


# ==============================================================================
# 5. PM VISHWAKARMA SCHEME TESTS (18 Crafts & Subvention)
# ==============================================================================

def test_pm_vishwakarma_artisan_eligible():
    """Artisan trade (Carpentry D19), cost ₹1.0L -> 5.0% concessional credit + ₹15k grant."""
    res = schemes.evaluate(
        project_cost=100000,
        trade_code="D19",
        trade_name="Carpentry & Furniture"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PM_VISHWAKARMA" in codes
    v = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PM_VISHWAKARMA")
    assert v["interest_rate_pa"] == 5.0
    assert v["subsidy_amount"] == 15000.0    # ₹15,000 digital toolkit voucher
    assert v["promoter_equity"] == 0.0       # 0% equity
    assert v["tenure_months"] == 18
    assert v["loan_principal"] == 100000.0


def test_pm_vishwakarma_first_loan_is_tranche_1_only():
    """Blacksmith (D20), cost ₹2.5L -> the first loan is Tranche 1 (₹1L, 18 months); Tranche 2 only
    after it is repaid, so the rest (₹1.5L) is the applicant's own share (review, 14 Nov 2026)."""
    res = schemes.evaluate(
        project_cost=250000,
        trade_code="D20",
        trade_name="Metal Smithy"
    )
    v = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PM_VISHWAKARMA")
    assert v["loan_principal"] == 100000.0
    assert v["promoter_equity"] == 150000.0
    assert v["interest_rate_pa"] == 5.0
    assert v["tenure_months"] == 18
    assert "Tranche 2" in v["strategic_benefit"]
    assert "5 years" in v["conditions"]


def test_pm_vishwakarma_flag_override():
    """Custom trade with is_artisan=True qualifies for PM Vishwakarma."""
    res = schemes.evaluate(
        project_cost=100000,
        trade_name="Custom Handicraft Artisan",
        is_artisan=True
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PM_VISHWAKARMA" in codes


def test_pm_vishwakarma_non_artisan_rejected():
    """Kirana store (D01) -> rejected from PM Vishwakarma citing artisan craft criteria."""
    res = schemes.evaluate(
        project_cost=100000,
        trade_code="D01",
        trade_name="Kirana Store"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PM_VISHWAKARMA" not in codes
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "PM_VISHWAKARMA")
    assert "artisan" in inel["reason"].lower()


def test_pm_vishwakarma_cost_over_3_lakh_rejected():
    """Artisan requesting ₹4,00,000 -> exceeds PM Vishwakarma ₹3L ceiling."""
    res = schemes.evaluate(
        project_cost=400000,
        trade_code="D19",
        is_artisan=True
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PM_VISHWAKARMA" not in codes


# ==============================================================================
# 6. PM MUDRA YOJANA TESTS (Shishu, Kishore, Tarun)
# ==============================================================================

def test_mudra_shishu_under_50k():
    """Cost ₹40,000 -> MUDRA Shishu (100% loan, 0% equity)."""
    res = schemes.evaluate(project_cost=40000)
    m = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "MUDRA_SHISHU")
    assert m["loan_principal"] == 40000.0
    assert m["promoter_equity"] == 0.0
    assert m["interest_rate_pa"] == 9.5


def test_mudra_kishore_up_to_5_lakh():
    """Cost ₹3,00,000 -> MUDRA Kishore (85% loan, 15% equity)."""
    res = schemes.evaluate(project_cost=300000)
    m = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "MUDRA_KISHORE")
    assert m["loan_principal"] == 255000.0  # 85%
    assert m["promoter_equity"] == 45000.0   # 15%


def test_mudra_tarun_up_to_10_lakh():
    """Cost ₹8,00,000 -> MUDRA Tarun (85% loan, 15% equity)."""
    res = schemes.evaluate(project_cost=800000)
    m = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "MUDRA_TARUN")
    assert m["loan_principal"] == 680000.0  # 85%
    assert m["promoter_equity"] == 120000.0  # 15%


def test_mudra_tarun_plus_10_to_20_lakh():
    """Cost ₹15,00,000 -> MUDRA Tarun Plus, only after repaying an earlier Tarun loan."""
    res = schemes.evaluate(project_cost=1500000)
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "MUDRA_TARUN" not in codes
    m = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "MUDRA_TARUN_PLUS")
    assert m["loan_principal"] == 1275000.0  # 85%
    assert m["promoter_equity"] == 225000.0  # 15%
    assert "repaid" in m["conditions"]


def test_mudra_cost_over_20_lakh_rejected():
    """Cost ₹25,00,000 -> exceeds MUDRA ₹20L ceiling."""
    res = schemes.evaluate(project_cost=2500000)
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert not any("MUDRA" in c for c in codes)


# ==============================================================================
# 7. PMFME SCHEME TESTS (Micro Food Processing)
# ==============================================================================

def test_pmfme_food_processing_eligible():
    """Micro food unit (Mustard Oil Expeller D08), cost ₹4.5L -> 35% subsidy."""
    res = schemes.evaluate(
        project_cost=450000,
        trade_code="D08",
        trade_name="Mustard Oil Expeller"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PMFME_FOOD_PROCESSING" in codes
    f = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PMFME_FOOD_PROCESSING")
    assert f["subsidy_amount"] == 157500.0   # 35% of 4.5L
    assert f["subsidy_rate_pct"] == 35.0
    assert f["promoter_equity"] == 45000.0   # 10%
    assert f["loan_principal"] == 247500.0   # 450000 - 157500 - 45000 = 247500
    assert f["monthly_emi"] == 5197.96


def test_pmfme_subsidy_capped_at_10_lakh():
    """Food processing unit with cost ₹35 Lakhs -> 35% is ₹12.25L, capped at ₹10.0L."""
    res = schemes.evaluate(
        project_cost=3500000,
        is_food_processing=True
    )
    f = next(s for s in res["eligible_schemes"] if s["scheme_code"] == "PMFME_FOOD_PROCESSING")
    assert f["subsidy_amount"] == 1000000.0  # Capped at ₹10 Lakhs


def test_pmfme_non_food_processing_rejected():
    """Carpentry (D19) -> rejected from PMFME citing food processing requirement."""
    res = schemes.evaluate(
        project_cost=450000,
        trade_code="D19",
        trade_name="Carpentry"
    )
    codes = [s["scheme_code"] for s in res["eligible_schemes"]]
    assert "PMFME_FOOD_PROCESSING" not in codes
    inel = next(r for r in res["ineligible_reasons"] if r["scheme_code"] == "PMFME")
    assert "food processing" in inel["reason"].lower()


# ==============================================================================
# 8. MULTI-SCHEME RANKING & STRATEGIC RECOMMENDATION TESTS
# ==============================================================================

def test_multi_scheme_ranking_by_financial_benefit():
    """
    Rural SC Woman requesting ₹4,50,000 for Mustard Oil Expeller (D08).
    Subsidized schemes (PMEGP, PMFME) must rank before 0-subsidy schemes (NSFDC, MUDRA).
    """
    res = schemes.evaluate(
        caste_category="SC",
        gender="female",
        is_rural=True,
        annual_income=180000,
        project_cost=450000,
        trade_code="D08",
        trade_name="Mustard Oil Expeller"
    )
    el = res["eligible_schemes"]
    assert len(el) >= 4

    # Top two schemes must be PMEGP and PMFME (both have 35% subsidy = ₹1,57,500)
    top_codes = [el[0]["scheme_code"], el[1]["scheme_code"]]
    assert "PMEGP_RURAL_SPECIAL" in top_codes
    assert "PMFME_FOOD_PROCESSING" in top_codes
    assert el[0]["subsidy_amount"] == 157500.0

    # Best recommendation must recommend PMEGP Rural Special
    rec = res["best_recommendation"]
    assert rec is not None
    assert rec["scheme_code"] == "PMEGP_RURAL_SPECIAL"
    assert "157,500" in rec["rationale"] or "1.58" in rec["rationale"] or "35%" in rec["rationale"]


def test_vishwakarma_recommended_for_artisan():
    """For an artisan requesting ₹1.0L, PM Vishwakarma must be recommended due to 5% rate + ₹15k grant."""
    res = schemes.evaluate(
        caste_category="OBC",
        project_cost=100000,
        trade_code="D20",
        trade_name="Metal Smithy",
        is_artisan=True
    )
    rec = res["best_recommendation"]
    assert rec is not None
    assert rec["scheme_code"] == "PM_VISHWAKARMA"
    assert "5.0%" in rec["rationale"]
    assert "15,000" in rec["rationale"]


def test_no_eligible_schemes_above_one_crore():
    """Cost ₹1,00,00,000 -> all central micro-enterprise schemes are ineligible."""
    res = schemes.evaluate(project_cost=10000000)
    assert res["eligible_schemes"] == []
    assert res["best_recommendation"] is None
    assert len(res["ineligible_reasons"]) > 0


# ==============================================================================
# 9. FASTAPI ENDPOINT TESTS (POST /api/schemes/evaluate)
# ==============================================================================

def test_api_schemes_evaluate_endpoint():
    """Verify POST /api/schemes/evaluate returns HTTP 200 with complete evaluation."""
    payload = {
        "caste_category": "SC",
        "gender": "female",
        "is_rural": True,
        "annual_income": 180000,
        "project_cost": 450000,
        "state": "Uttar Pradesh",
        "district": "Sitapur",
        "trade_code": "D08",
        "trade_name": "Mustard Oil Expeller",
        "is_artisan": False,
        "is_food_processing": True
    }
    r = client.post("/api/schemes/evaluate", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "success"
    assert len(d["eligible_schemes"]) > 0
    assert d["best_recommendation"] is not None
    assert len(d["ineligible_reasons"]) > 0


def test_api_schemes_evaluate_routing_order_not_trapped_by_compat():
    """
    CRITICAL: Confirm /api/schemes/evaluate is handled by schemes.router
    and is NOT intercepted by compat.py catch-all (which returns 404).
    """
    payload = {"project_cost": 200000, "caste_category": "General"}
    r = client.post("/api/schemes/evaluate", json=payload)
    assert r.status_code == 200
    assert "eligible_schemes" in r.json()
    assert r.json().get("detail") != "Route not found: /api/schemes/evaluate"


def test_api_schemes_evaluate_negative_cost_rejected():
    """project_cost <= 0 returns HTTP 422."""
    r = client.post("/api/schemes/evaluate", json={"project_cost": -100})
    assert r.status_code == 422


# ==============================================================================
# 10. GROQ CHAT TOOL INTEGRATION TESTS (evaluate_schemes)
# ==============================================================================

def test_chat_tool_specs_includes_evaluate_schemes():
    """Verify evaluate_schemes tool is registered in chat.tool_specs()."""
    specs = chat.tool_specs()
    names = [s["function"]["name"] for s in specs]
    assert "evaluate_schemes" in names
    tool = next(s for s in specs if s["function"]["name"] == "evaluate_schemes")
    props = tool["function"]["parameters"]["properties"]
    assert "caste_category" in props
    assert "project_cost" in props


def test_chat_run_tool_evaluate_schemes():
    """Verify running evaluate_schemes tool through chat.run_tool returns valid figures."""
    args = json.dumps({
        "project_cost": 450000,
        "caste_category": "SC",
        "gender": "female",
        "trade_name": "Mustard Oil Expeller",
        "is_food_processing": True,
        "is_rural": True
    })
    res = chat.run_tool("evaluate_schemes", args)
    assert res.get("status") == "success"
    assert res.get("projectCost") == 450000
    assert res.get("eligibleCount", 0) >= 3
    assert len(res["topSchemes"]) >= 1
    top = res["topSchemes"][0]
    assert "subsidyAmount" in top
    assert "monthlyEmi" in top
    assert "loanPrincipal" in top
    assert res["bestRecommendation"] is not None


def test_chat_run_tool_evaluate_schemes_missing_cost():
    """evaluate_schemes without project_cost returns clean error without crashing."""
    res = chat.run_tool("evaluate_schemes", json.dumps({"caste_category": "SC"}))
    assert "error" in res or res.get("status") != "success"


# ==============================================================================
# 11. REVIEW FIXES (14 Nov 2026)
# ==============================================================================

def test_vermicompost_is_not_food_processing():
    """D23 Vermicompost is not a food-processing unit: no PMFME subsidy."""
    res = schemes.evaluate(project_cost=300000, trade_code="D23", trade_name="Vermicompost")
    assert "PMFME_FOOD_PROCESSING" not in [s["scheme_code"] for s in res["eligible_schemes"]]


def test_dairy_farming_is_not_food_processing():
    """D11 dairy farming (not milk processing) does not get PMFME; paneer making does."""
    farm = schemes.evaluate(project_cost=500000, trade_code="D11", trade_name="Commercial Bovine Dairy")
    assert "PMFME_FOOD_PROCESSING" not in [s["scheme_code"] for s in farm["eligible_schemes"]]
    paneer = schemes.evaluate(project_cost=500000, trade_name="Paneer and ghee making")
    assert "PMFME_FOOD_PROCESSING" in [s["scheme_code"] for s in paneer["eligible_schemes"]]


def test_vegetable_selling_is_not_food_processing():
    res = schemes.evaluate(project_cost=100000, trade_name="Fruit and vegetable vendor")
    assert "PMFME_FOOD_PROCESSING" not in [s["scheme_code"] for s in res["eligible_schemes"]]


def test_artisan_keywords_match_whole_words_only():
    """'nai' in 'Chennai' or 'mistry' in 'chemistry' must not make a trade an artisan craft."""
    assert schemes.is_trade_artisan("Chennai snacks stall", None, False) is False
    assert schemes.is_trade_artisan("Chemistry tuition", None, False) is False
    assert schemes.is_trade_artisan("Village barber (nai) shop", None, False) is True
    assert schemes.is_trade_artisan("Potters cooperative", None, False) is True


def test_missing_income_is_flagged_not_assumed_zero():
    """No income given: NSFDC is still listed, but a note says the income limit was not checked."""
    res = schemes.evaluate(caste_category="SC", project_cost=140000)
    assert res["applicant"]["annual_income"] is None
    assert any("income was not given" in n for n in res["notes"])
    given = schemes.evaluate(caste_category="SC", project_cost=140000, annual_income=100000)
    assert not any("income was not given" in n for n in given["notes"])


def test_every_result_says_advisory_only():
    res = schemes.evaluate(project_cost=200000)
    assert any("not a loan sanction" in n for n in res["notes"])


def test_chat_tool_passes_divyang_and_notes():
    """A General-category divyang applicant counts as PMEGP special category (35% rural)."""
    res = chat.run_tool("evaluate_schemes", json.dumps({
        "project_cost": 400000, "caste_category": "General", "is_rural": True, "is_divyang": True}))
    assert res["status"] == "success"
    codes = [s["schemeCode"] for s in res["topSchemes"]]
    assert "PMEGP_RURAL_SPECIAL" in codes
    assert res["annualIncome"] is None
    assert any("not a loan sanction" in n for n in res["notes"])
