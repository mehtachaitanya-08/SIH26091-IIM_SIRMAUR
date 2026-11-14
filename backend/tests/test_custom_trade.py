"""
Comprehensive Unit & Integration Test Suite for Out-of-Catalog Trade Synthesizer
(backend/tests/test_custom_trade.py)

Covers:
1. Nearest-Neighbor Archetype Mapper (all 6 archetypes, keywords, fallback, case-insensitivity)
2. 7 Bounded Economic Guardrails (Balance of Outlay, Margin clamping, Working Capital ceiling, DSCR bounds, Seasonality)
3. Offline Deterministic Fallback Behavior (Groq missing/error)
4. Groq Synthesis Mock Integration
5. FastAPI Endpoint POST /api/business/custom (camelCase and snake_case aliases, error handling, routing order)
6. Dynamic Business Registration in backend/businesses.py (check_code, get_business, detail, compat dossier)
"""

import math
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend import businesses, compat, dossier_figures
from backend.custom_trade import (
    ARCHETYPES,
    ArchetypeDefinition,
    apply_economic_guardrails,
    build_custom_dossier,
    get_default_custom_dossier,
    map_archetype,
    synthesize_parameters_fallback,
    synthesize_parameters_groq,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def _clean_custom_state():
    businesses.clear_custom_businesses()
    dossier_figures.clear_custom_figures()
    yield
    businesses.clear_custom_businesses()
    dossier_figures.clear_custom_figures()


# ===========================================================================
# 1. Archetype Mapping Tests (All 6 Archetypes + Fallback)
# ===========================================================================

def test_archetype_mapping_agro_processing():
    """Archetype 1: Agro-Processing & Value Addition (Anchor: D07)."""
    match1 = map_archetype("Grain dal milling and pulse processing unit")
    assert match1.archetype_id == 1
    assert match1.anchor_code == "D07"
    assert "Agro-Processing" in match1.archetype_name
    assert not match1.is_fallback
    assert any(k in match1.matched_keywords for k in ["grain", "dal", "milling", "processing"])

    match2 = map_archetype("Cold-pressed mustard oil expeller and spice grinding")
    assert match2.archetype_id == 1
    assert match2.anchor_code == "D07"


def test_archetype_mapping_rural_retail():
    """Archetype 2: Rural Retail, Kirana & Supply Chain (Anchor: D01)."""
    match = map_archetype("Village FMCG retail store and general grocery kirana")
    assert match.archetype_id == 2
    assert match.anchor_code == "D01"
    assert "Retail" in match.archetype_name
    assert not match.is_fallback
    assert any(k in match.matched_keywords for k in ["retail", "store", "kirana", "fmcg", "grocery"])

    match_fert = map_archetype("Agriculture fertilizer and seeds supply dealership")
    assert match_fert.archetype_id == 2
    assert match_fert.anchor_code == "D01"


def test_archetype_mapping_technical_services():
    """Archetype 3: Rural Technical Services & Machinery (Anchor: D15)."""
    match = map_archetype("Solar water pump repair & micro-installation")
    assert match.archetype_id == 3
    assert match.anchor_code == "D15"
    assert "Technical Services" in match.archetype_name
    assert not match.is_fallback
    assert any(k in match.matched_keywords for k in ["solar", "pump", "repair", "installation"])

    match_ev = map_archetype("Two-wheeler electric motor rewinding and EV charging garage")
    assert match_ev.archetype_id == 3
    assert match_ev.anchor_code == "D15"


def test_archetype_mapping_livestock_allied():
    """Archetype 4: Livestock, Dairy & Allied Micro-Farming (Anchor: D11)."""
    match = map_archetype("Commercial bovine dairy cow farm and milk chilling")
    assert match.archetype_id == 4
    assert match.anchor_code == "D11"
    assert "Livestock" in match.archetype_name
    assert not match.is_fallback
    assert any(k in match.matched_keywords for k in ["dairy", "cow", "milk"])

    match_poultry = map_archetype("Broiler poultry farm and oyster mushroom cultivation")
    assert match_poultry.archetype_id == 4
    assert match_poultry.anchor_code == "D11"


def test_archetype_mapping_traditional_artisans():
    """Archetype 5: Traditional Artisans, Fabrication & Crafts (Anchor: D20)."""
    match = map_archetype("Metal smithy, iron grill welding fabrication, and lohar forge")
    assert match.archetype_id == 5
    assert match.anchor_code == "D20"
    assert "Artisans" in match.archetype_name
    assert not match.is_fallback
    assert any(k in match.matched_keywords for k in ["smithy", "fabrication", "lohar"])

    match_wood = map_archetype("Custom wood furniture carpentry and darzi tailoring")
    assert match_wood.archetype_id == 5
    assert match_wood.anchor_code == "D20"


def test_archetype_mapping_green_micro_enterprise():
    """Archetype 6: Green Micro-Enterprise & Circular Economy (Anchor: D22)."""
    match = map_archetype("Vermicompost bio-fertilizer and organic waste recycling")
    assert match.archetype_id == 6
    assert match.anchor_code == "D22"
    assert "Green" in match.archetype_name
    assert not match.is_fallback
    assert any(k in match.matched_keywords for k in ["vermicompost", "bio", "waste", "recycling", "organic"])

    match_brick = map_archetype("Fly ash bricks and circular eco-friendly materials")
    assert match_brick.archetype_id == 6
    assert match_brick.anchor_code == "D22"


def test_archetype_mapping_unmapped_fallback():
    """Unmapped / arbitrary novel trade falls back to default archetype without error."""
    match = map_archetype("Autonomous interplanetary drone logistics satellite terminal")
    assert match.is_fallback is True
    assert match.archetype_id == 2  # Retail / standard micro-enterprise default
    assert match.anchor_code == "D01"
    assert match.confidence <= 0.30


def test_archetype_mapping_case_and_punctuation_resilience():
    """Case-insensitive and resilient to punctuation, symbols, and irregular spacing."""
    match = map_archetype("  !!!SOLAR-POWERED WATER PUMP REPAIR & WORKSHOP???  ")
    assert match.archetype_id == 3
    assert not match.is_fallback


# ===========================================================================
# 2. Bounded Economic Guardrails Tests (7 Hard Invariants)
# ===========================================================================

def test_guardrails_capital_outlay_conservation():
    """Invariant 1: CapEx + Working Capital + Pre-Op (5%) == Total Project Cost exactly."""
    cost = 350000.0
    arch = ARCHETYPES[1]
    raw = synthesize_parameters_fallback(cost, arch)
    res = apply_economic_guardrails(raw, cost, arch)

    total_sum = (
        res["capex_equipment"]
        + res["capex_electrification_setup"]
        + res["working_capital_buffer"]
        + res["pre_operative"]
    )
    assert abs(total_sum - cost) < 0.01
    assert res["pre_operative"] == round(cost * 0.05, 2)


def test_guardrails_gross_profit_margin_clamping():
    """Invariant 2: Gross profit margin strictly clamped to [10.0%, 50.0%]."""
    cost = 200000.0
    arch = ARCHETYPES[2]

    # Too low margin (5%) -> clamped up to 10.0%
    raw_low = synthesize_parameters_fallback(cost, arch)
    raw_low["gross_margin_pct"] = 5.0
    res_low = apply_economic_guardrails(raw_low, cost, arch)
    assert res_low["gross_margin_pct"] >= 10.0

    # Too high margin (75%) -> clamped down to 50.0%
    raw_high = synthesize_parameters_fallback(cost, arch)
    raw_high["gross_margin_pct"] = 75.0
    res_high = apply_economic_guardrails(raw_high, cost, arch)
    assert res_high["gross_margin_pct"] <= 50.0


def test_guardrails_operating_profit_margin_clamping():
    """Invariant 3: Operating profit margin strictly clamped to [8.0%, 35.0%]."""
    cost = 300000.0
    arch = ARCHETYPES[3]

    # Too low operating margin -> clamped up to >= 8.0%
    raw_low = synthesize_parameters_fallback(cost, arch)
    raw_low["monthly_utilities_wages"] = raw_low["monthly_turnover"] * 0.8
    res_low = apply_economic_guardrails(raw_low, cost, arch)
    assert res_low["operating_margin_pct"] >= 8.0

    # Too high operating margin -> clamped down to <= 35.0%
    raw_high = synthesize_parameters_fallback(cost, arch)
    raw_high["monthly_utilities_wages"] = 1.0  # tiny expense
    res_high = apply_economic_guardrails(raw_high, cost, arch)
    assert res_high["operating_margin_pct"] <= 35.0


def test_guardrails_working_capital_ceiling():
    """
    Invariant 4: Working capital buffer must be:
    - Between 1 and 3 months of monthly OpEx
    - Less than or equal to 35% of Total Project Cost
    """
    cost = 400000.0
    arch = ARCHETYPES[1]
    raw = synthesize_parameters_fallback(cost, arch)
    raw["working_capital_buffer"] = cost * 0.80  # attempt 80% working capital!

    res = apply_economic_guardrails(raw, cost, arch)
    assert res["working_capital_buffer"] <= 0.35 * cost

    monthly_opex = res["monthly_raw_materials"] + res["monthly_utilities_wages"]
    assert res["working_capital_buffer"] <= round(3.0 * monthly_opex, 2) + 1.0


def test_guardrails_dscr_bounds_and_lean_month():
    """
    Invariant 5:
    - 5-Year Average DSCR in [1.15, 3.50]
    - Minimum Lean Month DSCR >= 0.70
    """
    cost = 250000.0
    arch = ARCHETYPES[4]

    # Extreme seasonal swing that would crash lean month DSCR
    raw = synthesize_parameters_fallback(cost, arch)
    raw["seasonality_weights"] = [0.10, 0.10, 0.10, 0.20, 1.5, 2.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0.5]

    res = apply_economic_guardrails(raw, cost, arch)
    assert 1.15 <= res["average_dscr"] <= 3.50
    assert res["min_lean_month_dscr"] >= 0.70


def test_guardrails_seasonality_weights_averaging_one():
    """Invariant 7: 12 seasonality weights average exactly 1.0 (sum is 12.0)."""
    cost = 500000.0
    arch = ARCHETYPES[5]
    raw = synthesize_parameters_fallback(cost, arch)
    # Non-normalized input
    raw["seasonality_weights"] = [2.5] * 12
    res = apply_economic_guardrails(raw, cost, arch)

    weights = res["seasonality_weights"]
    assert len(weights) == 12
    avg_weight = sum(weights) / 12.0
    assert abs(avg_weight - 1.0) < 0.05
    assert abs(sum(weights) - 12.0) < 0.2


# ===========================================================================
# 3. Offline Deterministic Fallback & Groq Mock Tests
# ===========================================================================

def test_offline_fallback_when_groq_key_missing():
    """Without Groq API key, pure deterministic fallback is engaged with valid benchmark tags."""
    arch = ARCHETYPES[3]
    with patch("backend.custom_trade._get_groq_api_key", return_value=None):
        groq_result = synthesize_parameters_groq("Solar pump repair", 250000.0, "Sitapur", "UP", arch)
        assert groq_result is None

        # Fallback synthesis generates complete parameter dictionary
        fallback = synthesize_parameters_fallback(250000.0, arch)
        assert "capex_equipment" in fallback
        assert "working_capital_buffer" in fallback
        assert len(fallback["seasonality_weights"]) == 12


def test_groq_mock_successful_synthesis():
    """When Groq returns valid JSON, it is parsed and passed to economic guardrails."""
    mock_groq_response = {
        "capex_equipment": 140000.0,
        "capex_electrification_setup": 25000.0,
        "working_capital_buffer": 60000.0,
        "monthly_turnover": 75000.0,
        "monthly_raw_materials": 45000.0,
        "monthly_utilities_wages": 12000.0,
        "gross_margin_pct": 32.0,
        "seasonality_weights": [1.0] * 12,
    }

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "choices": [{"message": {"content": str(mock_groq_response).replace("'", '"')}}]
    }
    mock_resp.raise_for_status.return_value = None

    with patch("backend.custom_trade._get_groq_api_key", return_value="gsk_test_key"):
        with patch("httpx.post", return_value=mock_resp):
            data = synthesize_parameters_groq("Custom Trade", 250000.0, "Sitapur", "UP", ARCHETYPES[1])
            assert data is not None
            assert data["capex_equipment"] == 140000.0


# ===========================================================================
# 4. FastAPI Endpoint POST /api/business/custom Tests
# ===========================================================================

def test_api_custom_trade_camel_case_payload():
    """Endpoint handles standard camelCase payload."""
    payload = {
        "tradeName": "Solar water pump repair & micro-installation",
        "district": "Sitapur",
        "state": "Uttar Pradesh",
        "projectCost": 250000,
        "applicantCategory": "SC",
        "gender": "male",
        "isRural": True,
    }
    resp = client.post("/api/business/custom", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["code"] == "D99"
    assert data["status"] == "verified"
    assert data["name"] == "Solar water pump repair & micro-installation"
    assert data["archetype"]["id"] == 3
    assert data["archetype"]["anchor_code"] == "D15"
    assert len(data["tiers"]) == 3
    assert len(data["seasonality"]["months"]) == 12
    assert "financials" in data
    assert data["financials"]["total_project_cost"] == 250000.0
    assert 1.15 <= data["financials"]["average_dscr"] <= 3.50
    assert data["financials"]["min_lean_month_dscr"] >= 0.70


def test_api_custom_trade_snake_case_payload():
    """Endpoint accepts snake_case aliases transparently."""
    payload = {
        "trade_name": "Cold pressed mustard oil extraction & packaging",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "project_cost": 400000,
        "applicant_category": "OBC",
        "gender": "female",
        "is_rural": True,
    }
    resp = client.post("/api/business/custom", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["code"] == "D99"
    assert data["archetype"]["id"] == 1
    assert data["archetype"]["anchor_code"] == "D07"
    assert data["financials"]["total_project_cost"] == 400000.0


def test_api_custom_trade_empty_trade_name_rejected():
    """Empty or whitespace tradeName raises 400 Bad Request."""
    payload = {"tradeName": "   ", "projectCost": 100000}
    resp = client.post("/api/business/custom", json=payload)
    assert resp.status_code == 400


def test_api_custom_trade_negative_cost_rejected():
    """Zero or negative project cost raises 400 Bad Request."""
    payload = {"tradeName": "Dairy unit", "projectCost": -50000}
    resp = client.post("/api/business/custom", json=payload)
    assert resp.status_code == 400


def test_api_custom_trade_routing_order_not_trapped_by_compat():
    """Verifies route is registered before compat.router catch-all."""
    resp = client.post("/api/business/custom", json={"tradeName": "Kirana Store", "projectCost": 150000})
    assert resp.status_code == 200
    # If it was trapped by compat.py catch-all, it would return 404 with {"error": "Route not found: /api/business/custom"}
    assert resp.json().get("error") is None


# ===========================================================================
# 5. Dynamic Business Registration & Linkage Tests
# ===========================================================================

def test_dynamic_registration_businesses_check_code():
    """businesses.check_code('D99') returns False without raising UnknownCode once registered."""
    # Before registration, D99 is unknown
    with pytest.raises(businesses.UnknownCode):
        businesses.check_code("D99")

    # Register custom business
    d = get_default_custom_dossier("D99")
    businesses.register_custom_business(d)

    assert businesses.check_code("D99") is False
    assert businesses.check_code("D99_CUSTOM") is False

    with pytest.raises(businesses.UnknownCode):
        businesses.check_code("D999_NON_EXISTENT")


def test_dynamic_registration_get_business():
    """businesses.get_business('D99') returns valid custom synthesized dossier."""
    dossier = businesses.get_business("D99")
    assert dossier is not None
    assert dossier["code"] == "D99"
    assert dossier["status"] == "verified"
    assert "sections" in dossier
    assert "tiers" in dossier
    assert "seasonality" in dossier


def test_dynamic_registration_get_businesses_endpoint():
    """GET /businesses/D99 returns HTTP 200 with custom synthesized dossier once registered."""
    d = get_default_custom_dossier("D99")
    businesses.register_custom_business(d)
    resp = client.get("/businesses/D99")
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == "D99"
    assert data["status"] == "verified"


def test_dynamic_registration_compat_dossier_endpoint():
    """GET /api/dossiers/D99 returns HTTP 200 with tiers and seasonality."""
    # First trigger synthesis to register custom figures
    client.post("/api/business/custom", json={"tradeName": "Bio fertilizer unit", "projectCost": 300000})

    resp = client.get("/api/dossiers/D99")
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == "D99"
    assert "tiers" in data
    assert "seasonality" in data


def test_mandi_linkage_triggered_on_agricultural_commodity():
    """Custom trade with agricultural commodity (Mustard) triggers Mandi linkage."""
    payload = {
        "tradeName": "Mustard oil seed expeller and packaging",
        "district": "Sitapur",
        "state": "Uttar Pradesh",
        "projectCost": 300000,
    }
    resp = client.post("/api/business/custom", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "mandi_data" in data
    assert data["mandi_data"]["commodity"] == "Mustard"
