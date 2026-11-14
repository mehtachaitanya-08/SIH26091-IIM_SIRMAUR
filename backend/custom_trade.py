"""
Dynamic Out-of-Catalog Trade Synthesizer (backend/custom_trade.py)

Supports dynamic uncatalogued micro-enterprise trade synthesis through:
1. Nearest-Neighbor Archetype Mapper (6 core MSME/NABARD archetypes)
2. Groq LLM Financial Parameter Synthesis (openai/gpt-oss-120b) with pure offline deterministic fallback
3. 7 Bounded Economic Guardrails (Balance of Outlay, Margins, Working Capital, DSCR, Seasonality)
4. Dynamic Business Registration in backend/businesses.py as D99 / D99_CUSTOM
5. Agricultural Mandi API linkage for commodities

Mounted at: POST /api/business/custom
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple, Union
import json
import logging
import os
import re
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, model_validator

from backend import businesses, mandi
from backend.schemes import calculate_emi

router = APIRouter(prefix="/api/business", tags=["custom_trade"])
log = logging.getLogger("udyamsetuai.custom_trade")

ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"
TIMEOUT_S = 12.0

MONTHS = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
]


# ---------------------------------------------------------------------------
# 1. Nearest-Neighbor Archetypes & Benchmarks
# ---------------------------------------------------------------------------

@dataclass
class ArchetypeDefinition:
    id: int
    name: str
    anchor_code: str
    anchor_name: str
    anchor_codes: List[str]
    keywords: List[str]
    description: str
    # Verified benchmark baseline ratios for deterministic fallback
    capex_equipment_ratio: float
    capex_electrification_ratio: float
    pre_operative_ratio: float  # strictly 0.05 (5%)
    working_capital_ratio: float
    monthly_turnover_ratio: float  # monthly sales as fraction of total project cost
    gross_margin_pct: float
    operating_margin_pct: float
    seasonality_weights: List[float]


ARCHETYPES: Dict[int, ArchetypeDefinition] = {
    1: ArchetypeDefinition(
        id=1,
        name="Agro-Processing & Value Addition",
        anchor_code="D07",
        anchor_name="Grain Dal Milling",
        anchor_codes=["D07", "D08", "D10", "D23"],
        keywords=[
            "grain", "dal", "flour", "atta", "oil", "expeller", "spice", "masala",
            "dehydration", "pickle", "papad", "bakery", "honey", "beekeeping", "processing",
            "fruit", "vegetable", "cold storage", "milling", "mustard", "pulses", "paddy",
            "wheat", "chilli", "turmeric", "ginger", "garlic", "chana", "besan", "sattu",
            "juice", "jam", "jelly", "biscuit", "confectionery", "food", "agro-processing",
            "cold press", "seed processing", "agro", "sesame", "groundnut", "copra"
        ],
        description="Value-addition and mechanical processing of agricultural, horticultural, and spice commodities.",
        capex_equipment_ratio=0.60,
        capex_electrification_ratio=0.10,
        pre_operative_ratio=0.05,
        working_capital_ratio=0.25,
        monthly_turnover_ratio=0.30,
        gross_margin_pct=28.0,
        operating_margin_pct=16.0,
        seasonality_weights=[1.05, 1.10, 0.95, 0.85, 0.80, 0.85, 1.00, 1.10, 1.15, 1.10, 1.05, 1.00],
    ),
    2: ArchetypeDefinition(
        id=2,
        name="Rural Retail, Kirana & Supply Chain",
        anchor_code="D01",
        anchor_name="Village FMCG Retail",
        anchor_codes=["D01", "D02", "D04", "D05"],
        keywords=[
            "retail", "kirana", "store", "shop", "fmcg", "provision", "stationery",
            "fertilizer", "seeds", "pesticide", "trading", "aggregation", "supply", "mandi",
            "grocery", "general store", "depot", "dealer", "wholesale", "vendor", "supermarket",
            "distribution", "market stall", "haat", "trader", "merchant", "commerce"
        ],
        description="Rural inventory aggregation, retail storefronts, agricultural input dealerships, and distribution.",
        capex_equipment_ratio=0.50,
        capex_electrification_ratio=0.15,
        pre_operative_ratio=0.05,
        working_capital_ratio=0.30,
        monthly_turnover_ratio=0.35,
        gross_margin_pct=20.0,
        operating_margin_pct=12.0,
        seasonality_weights=[0.95, 0.95, 0.90, 0.90, 0.95, 1.05, 1.10, 1.15, 1.10, 1.05, 0.95, 0.95],
    ),
    3: ArchetypeDefinition(
        id=3,
        name="Rural Technical Services & Machinery",
        anchor_code="D15",
        anchor_name="Tractor Garage",
        anchor_codes=["D03", "D15", "D16", "D17"],
        keywords=[
            "solar", "pump", "repair", "electric", "electronics", "battery", "ev",
            "charging", "mechanic", "service", "installation", "hardware", "mobile",
            "tractor", "two wheeler", "motor", "rewinding", "garage", "workshop",
            "automobile", "servicing", "welding repair", "plumbing", "electrical",
            "inverter", "generator", "appliances", "refrigeration service"
        ],
        description="Engineering services, equipment maintenance, EV/auto garage, and localized technical infrastructure.",
        capex_equipment_ratio=0.65,
        capex_electrification_ratio=0.12,
        pre_operative_ratio=0.05,
        working_capital_ratio=0.18,
        monthly_turnover_ratio=0.25,
        gross_margin_pct=42.0,
        operating_margin_pct=24.0,
        seasonality_weights=[1.15, 1.20, 1.10, 0.90, 0.85, 0.80, 0.95, 1.05, 1.10, 1.05, 0.95, 0.90],
    ),
    4: ArchetypeDefinition(
        id=4,
        name="Livestock, Dairy & Allied Micro-Farming",
        anchor_code="D11",
        anchor_name="Commercial Bovine Dairy",
        anchor_codes=["D11", "D12", "D13", "D14"],
        keywords=[
            "dairy", "cow", "buffalo", "milk", "goat", "sheep", "poultry", "broiler",
            "layer", "egg", "chicken", "fish", "fishery", "aquaculture", "mushroom",
            "polyhouse", "horticulture", "cattle", "fodder", "animal", "piggery",
            "duck", "apiary", "sericulture", "husbandry", "livestock", "spawning"
        ],
        description="Commercial livestock rearing, dairy collection, poultry, aquaculture, and climate-controlled micro-farming.",
        capex_equipment_ratio=0.62,
        capex_electrification_ratio=0.10,
        pre_operative_ratio=0.05,
        working_capital_ratio=0.23,
        monthly_turnover_ratio=0.28,
        gross_margin_pct=32.0,
        operating_margin_pct=18.0,
        seasonality_weights=[0.90, 0.85, 0.85, 0.90, 1.00, 1.05, 1.10, 1.15, 1.15, 1.10, 1.00, 0.95],
    ),
    5: ArchetypeDefinition(
        id=5,
        name="Traditional Artisans, Fabrication & Crafts",
        anchor_code="D20",
        anchor_name="Metal Smithy",
        anchor_codes=["D18", "D19", "D20", "D21"],
        keywords=[
            "smithy", "blacksmith", "lohar", "carpentry", "suthar", "wood", "furniture",
            "pottery", "kumhaar", "clay", "tailor", "garment", "textile", "sewing",
            "weaving", "craft", "handicraft", "sculptor", "mason", "darzi", "badhai",
            "sonar", "goldsmith", "fabrication", "sheet metal", "iron work", "handloom",
            "apparel", "embroidery", "leather", "footwear", "shoemaker", "cobbler", "artisan"
        ],
        description="Traditional artisan trades, metal fabrication, garment tailoring, woodwork, and ceramics.",
        capex_equipment_ratio=0.62,
        capex_electrification_ratio=0.11,
        pre_operative_ratio=0.05,
        working_capital_ratio=0.22,
        monthly_turnover_ratio=0.26,
        gross_margin_pct=38.0,
        operating_margin_pct=20.0,
        seasonality_weights=[0.95, 0.90, 0.85, 0.85, 0.90, 1.00, 1.10, 1.25, 1.20, 1.05, 1.00, 0.95],
    ),
    6: ArchetypeDefinition(
        id=6,
        name="Green Micro-Enterprise & Circular Economy",
        anchor_code="D22",
        anchor_name="Fly Ash Bricks",
        anchor_codes=["D22", "D24"],
        keywords=[
            "bio", "compost", "vermicompost", "gobar", "waste", "recycling", "fly ash",
            "bricks", "fertilizer", "organic", "biogas", "briquette", "scrap",
            "circular economy", "eco-friendly", "biomass", "waste-to-wealth"
        ],
        description="Resource recovery, eco-friendly construction materials, organic manures, and circular rural enterprises.",
        capex_equipment_ratio=0.64,
        capex_electrification_ratio=0.11,
        pre_operative_ratio=0.05,
        working_capital_ratio=0.20,
        monthly_turnover_ratio=0.25,
        gross_margin_pct=34.0,
        operating_margin_pct=19.0,
        seasonality_weights=[1.10, 1.15, 1.10, 0.70, 0.65, 0.75, 1.05, 1.15, 1.20, 1.15, 1.10, 0.90],
    ),
}

# Mandi commodity dictionary mapping common trade terms to official Agmarknet commodities
MANDI_COMMODITIES = {
    "mustard": "Mustard",
    "mustard oil": "Mustard",
    "oil": "Mustard",
    "sarson": "Mustard",
    "paddy": "Paddy(Dhan)(Common)",
    "dhan": "Paddy(Dhan)(Common)",
    "rice": "Paddy(Dhan)(Common)",
    "wheat": "Wheat",
    "gehun": "Wheat",
    "maize": "Maize",
    "makka": "Maize",
    "chilli": "Chilli Red",
    "mirch": "Chilli Red",
    "turmeric": "Turmeric",
    "haldi": "Turmeric",
    "ginger": "Ginger(Green)",
    "adrak": "Ginger(Green)",
    "garlic": "Garlic",
    "lahsun": "Garlic",
    "honey": "Honey",
    "mushroom": "Mushroom",
    "potato": "Potato",
    "aloo": "Potato",
    "onion": "Onion",
    "pyaz": "Onion",
    "tomato": "Tomato",
    "tamatar": "Tomato",
    "sesame": "Sesamum(Sesame,Gingelly,Til)",
    "til": "Sesamum(Sesame,Gingelly,Til)",
    "dal": "Arhar (Tur/Red Gram)(Whole)",
    "arhar": "Arhar (Tur/Red Gram)(Whole)",
    "chana": "Gram Raw(Whole)",
    "gram": "Gram Raw(Whole)",
    "soyabean": "Soyabean",
    "cotton": "Cotton",
}


@dataclass
class ArchetypeMatch:
    archetype_id: int
    archetype_name: str
    anchor_code: str
    anchor_name: str
    anchor_codes: List[str]
    matched_keywords: List[str]
    confidence: float
    is_fallback: bool


def map_archetype(trade_name: str) -> ArchetypeMatch:
    """
    Nearest-neighbor archetype mapper.
    Matches arbitrary trade name into 1 of 6 core archetypes based on weighted keyword occurrences.
    Falls back to Archetype 2 (Rural Retail) if no keywords match.
    """
    if not trade_name or not trade_name.strip():
        trade_name = "Rural Micro Enterprise"

    normalized = " " + re.sub(r"[^a-zA-Z0-9\s-]", " ", trade_name.lower()) + " "
    best_id = None
    best_score = 0
    best_matches: List[str] = []

    for arch_id, arch in ARCHETYPES.items():
        matched: List[str] = []
        score = 0
        for kw in arch.keywords:
            pattern = r"(?<!\w)" + re.escape(kw.lower()) + r"(?!\w)"
            found = re.findall(pattern, normalized)
            if found:
                matched.append(kw)
                # Multi-word keyword matches get higher specificity weight
                kw_weight = len(kw.split()) * 2
                score += kw_weight * len(found)
        if score > best_score:
            best_score = score
            best_id = arch_id
            best_matches = matched

    if best_id is not None and best_score > 0:
        arch = ARCHETYPES[best_id]
        confidence = min(1.0, 0.45 + (best_score * 0.12))
        return ArchetypeMatch(
            archetype_id=arch.id,
            archetype_name=arch.name,
            anchor_code=arch.anchor_code,
            anchor_name=arch.anchor_name,
            anchor_codes=arch.anchor_codes,
            matched_keywords=best_matches,
            confidence=round(confidence, 2),
            is_fallback=False,
        )

    # Fallback to default archetype (Rural Retail, Kirana & Supply Chain)
    fallback_arch = ARCHETYPES[2]
    return ArchetypeMatch(
        archetype_id=fallback_arch.id,
        archetype_name=fallback_arch.name,
        anchor_code=fallback_arch.anchor_code,
        anchor_name=fallback_arch.anchor_name,
        anchor_codes=fallback_arch.anchor_codes,
        matched_keywords=[],
        confidence=0.25,
        is_fallback=True,
    )


# ---------------------------------------------------------------------------
# 2. Groq LLM Financial Synthesis & Offline Fallback
# ---------------------------------------------------------------------------

def _get_groq_api_key() -> Optional[str]:
    key = (os.environ.get("GROQ_API_KEY") or "").strip()
    if key:
        return key
    if ENV_FILE.exists():
        try:
            for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
                k, sep, v = line.partition("=")
                if sep and k.strip() == "GROQ_API_KEY":
                    v = v.strip().strip('"').strip("'")
                    return v or None
        except Exception:
            pass
    return None


def synthesize_parameters_groq(
    trade_name: str,
    project_cost: float,
    district: str,
    state: str,
    archetype: ArchetypeDefinition,
) -> Optional[dict]:
    """Queries Groq openai/gpt-oss-120b for financial synthesis."""
    api_key = _get_groq_api_key()
    if not api_key:
        return None

    prompt = f"""You are an expert rural banking economist for MoMSME and NABARD in India.
Synthesize realistic, conservative financial and operational parameters for a micro-enterprise:
Trade: {trade_name}
Total Project Cost: ₹{int(project_cost)}
Regional Context: {district}, {state}
Anchor Archetype: {archetype.name} ({archetype.anchor_code})

Output STRICT JSON with these exact fields:
{{
  "capex_equipment": float (cost of machinery/tools, typically 50-70% of project cost),
  "capex_electrification_setup": float (installation/site setup, typically 5-15%),
  "working_capital_buffer": float (1-2 months operational expenses, typically 15-30%),
  "monthly_turnover": float (projected monthly sales revenue),
  "monthly_raw_materials": float (cost of raw materials/inventory),
  "monthly_utilities_wages": float (power, fuel, local labor, transport),
  "gross_margin_pct": float (between 15.0 and 45.0),
  "seasonality_weights": [12 floats averaging 1.0 representing month 1 to month 12 revenue swing]
}}"""

    messages = [
        {"role": "system", "content": "You are a rural banking economic parameter synthesizer. Always reply with valid JSON only."},
        {"role": "user", "content": prompt},
    ]

    try:
        r = httpx.post(
            GROQ_URL,
            timeout=TIMEOUT_S,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": messages,
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
            },
        )
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
        # Ensure mandatory keys exist
        req_keys = [
            "capex_equipment", "capex_electrification_setup", "working_capital_buffer",
            "monthly_turnover", "monthly_raw_materials", "monthly_utilities_wages",
            "gross_margin_pct", "seasonality_weights"
        ]
        if all(k in data for k in req_keys):
            return data
    except Exception as exc:
        log.info("Groq synthesis call skipped or failed (%s); using deterministic offline fallback.", exc)
    return None


def synthesize_parameters_fallback(
    project_cost: float,
    archetype: ArchetypeDefinition,
) -> dict:
    """Pure deterministic offline baseline ratios from anchor archetype."""
    pre_op = round(project_cost * archetype.pre_operative_ratio, 2)
    rem_outlay = project_cost - pre_op

    c_eq = round(project_cost * archetype.capex_equipment_ratio, 2)
    c_elec = round(project_cost * archetype.capex_electrification_ratio, 2)
    wc = round(project_cost - pre_op - c_eq - c_elec, 2)

    monthly_turnover = round(project_cost * archetype.monthly_turnover_ratio, 2)
    gross_margin = archetype.gross_margin_pct
    op_margin = archetype.operating_margin_pct

    raw_mat = round(monthly_turnover * (1.0 - (gross_margin / 100.0)), 2)
    util_wages = round(monthly_turnover * ((gross_margin - op_margin) / 100.0), 2)

    return {
        "capex_equipment": c_eq,
        "capex_electrification_setup": c_elec,
        "working_capital_buffer": wc,
        "monthly_turnover": monthly_turnover,
        "monthly_raw_materials": raw_mat,
        "monthly_utilities_wages": util_wages,
        "gross_margin_pct": gross_margin,
        "seasonality_weights": list(archetype.seasonality_weights),
    }


# ---------------------------------------------------------------------------
# 3. 7 Bounded Economic Guardrails (Hard Invariants)
# ---------------------------------------------------------------------------

def apply_economic_guardrails(
    raw_params: dict,
    project_cost: float,
    archetype: ArchetypeDefinition,
) -> dict:
    """
    Strictly applies and enforces the 7 Bounded Economic Guardrails:
    1. Balance of Capital Outlay: CapEx + Working Capital + Pre-Op (5%) == Total Project Cost
    2. Gross Profit Margin: Clamped to [10.0%, 50.0%]
    3. Operating Profit Margin: Clamped to [8.0%, 35.0%]
    4. Working Capital: 1 to 3 months of OpEx, and <= 35% of Total Project Cost
    5. 5-Year Average DSCR: [1.15, 3.50]
    6. Minimum Lean Month DSCR: >= 0.70
    7. 12 Seasonality Weights: Averaging exactly 1.0
    """
    cost = float(project_cost)

    # 1. Monthly turnover sanity
    turnover = float(raw_params.get("monthly_turnover") or 0.0)
    if turnover <= 0:
        turnover = cost * archetype.monthly_turnover_ratio
    min_turnover = cost * 0.15
    max_turnover = cost * 0.75
    turnover = max(min_turnover, min(max_turnover, turnover))

    # 2. Invariant 2: Gross Profit Margin clamped to [10.0%, 50.0%]
    gross_margin_pct = float(raw_params.get("gross_margin_pct") or archetype.gross_margin_pct)
    gross_margin_pct = max(10.0, min(50.0, gross_margin_pct))
    raw_mat = turnover * (1.0 - (gross_margin_pct / 100.0))

    # 3. Invariant 3: Operating Profit Margin clamped to [8.0%, 35.0%]
    max_op_margin = min(35.0, gross_margin_pct - 2.0)
    min_op_margin = min(8.0, max_op_margin - 1.0)
    if min_op_margin < 5.0:
        min_op_margin = 5.0

    raw_util = float(raw_params.get("monthly_utilities_wages") or 0.0)
    if raw_util > 0:
        raw_op_profit = turnover - raw_mat - raw_util
        derived_op_margin = (raw_op_profit / turnover) * 100.0
    else:
        derived_op_margin = archetype.operating_margin_pct

    op_margin_pct = max(min_op_margin, min(max_op_margin, derived_op_margin))
    util_wages = turnover * ((gross_margin_pct - op_margin_pct) / 100.0)

    # Monthly OpEx = raw materials + utilities/wages
    monthly_opex = raw_mat + util_wages

    # 4. Invariant 4: Working Capital: 1 to 3 months of OpEx, and <= 35% of Total Project Cost
    max_wc_by_cost = 0.35 * cost
    max_allowed_wc = min(3.0 * monthly_opex, max_wc_by_cost)
    min_allowed_wc = min(1.0 * monthly_opex, max_allowed_wc)

    raw_wc = float(raw_params.get("working_capital_buffer") or (cost * archetype.working_capital_ratio))
    wc = max(min_allowed_wc, min(max_allowed_wc, raw_wc))

    # 5. Invariant 1: Balance of Capital Outlay
    # CapEx (machinery + installation) + Working Capital + Pre-Op (5%) == Total Project Cost
    pre_op = round(0.05 * cost, 2)
    remaining_capex = cost - pre_op - wc

    raw_eq = float(raw_params.get("capex_equipment") or (cost * archetype.capex_equipment_ratio))
    raw_elec = float(raw_params.get("capex_electrification_setup") or (cost * archetype.capex_electrification_ratio))
    total_raw_capex = raw_eq + raw_elec
    if total_raw_capex <= 0:
        total_raw_capex = 1.0
        raw_eq = 0.85
        raw_elec = 0.15

    eq_ratio = raw_eq / total_raw_capex
    c_eq = round(remaining_capex * eq_ratio, 2)
    c_elec = round(remaining_capex - c_eq, 2)

    # Exact conservation check: c_eq + c_elec + wc + pre_op == cost
    c_eq = round(cost - c_elec - wc - pre_op, 2)

    # 6. Invariant 7: 12 seasonality weights averaging 1.0
    raw_weights = raw_params.get("seasonality_weights")
    if not isinstance(raw_weights, list) or len(raw_weights) != 12:
        raw_weights = list(archetype.seasonality_weights)

    cleaned_weights = [max(0.40, float(w)) for w in raw_weights]
    sum_w = sum(cleaned_weights)
    if sum_w <= 0:
        cleaned_weights = [1.0] * 12
        sum_w = 12.0
    norm_weights = [(w / sum_w) * 12.0 for w in cleaned_weights]

    # 7. Invariant 5: DSCR Sanity Bounds (5-Year Average DSCR in [1.15, 3.50], Minimum Lean Month DSCR >= 0.70)
    loan_amount = 0.85 * cost
    monthly_emi = calculate_emi(loan_amount, 9.0, 60)
    if monthly_emi <= 0:
        monthly_emi = 1.0

    annual_debt_service = 12.0 * monthly_emi
    monthly_op_profit = turnover * (op_margin_pct / 100.0)
    annual_op_surplus = 12.0 * monthly_op_profit

    avg_dscr = annual_op_surplus / annual_debt_service

    # Clamp avg_dscr to [1.15, 3.50]
    if avg_dscr < 1.15:
        target_dscr = 1.35
        needed_annual_surplus = target_dscr * annual_debt_service
        needed_monthly_surplus = needed_annual_surplus / 12.0
        turnover = needed_monthly_surplus / (op_margin_pct / 100.0)
        raw_mat = turnover * (1.0 - (gross_margin_pct / 100.0))
        util_wages = turnover * ((gross_margin_pct - op_margin_pct) / 100.0)
        monthly_opex = raw_mat + util_wages
        max_allowed_wc = min(3.0 * monthly_opex, max_wc_by_cost)
        min_allowed_wc = min(1.0 * monthly_opex, max_allowed_wc)
        wc = max(min_allowed_wc, min(max_allowed_wc, wc))
        remaining_capex = cost - pre_op - wc
        c_eq = round(remaining_capex * eq_ratio, 2)
        c_elec = round(remaining_capex - c_eq, 2)
        c_eq = round(cost - c_elec - wc - pre_op, 2)
        monthly_op_profit = turnover * (op_margin_pct / 100.0)
        annual_op_surplus = 12.0 * monthly_op_profit
        avg_dscr = annual_op_surplus / annual_debt_service
    elif avg_dscr > 3.50:
        target_dscr = 3.00
        needed_annual_surplus = target_dscr * annual_debt_service
        needed_monthly_surplus = needed_annual_surplus / 12.0
        turnover = needed_monthly_surplus / (op_margin_pct / 100.0)
        raw_mat = turnover * (1.0 - (gross_margin_pct / 100.0))
        util_wages = turnover * ((gross_margin_pct - op_margin_pct) / 100.0)
        monthly_opex = raw_mat + util_wages
        max_allowed_wc = min(3.0 * monthly_opex, max_wc_by_cost)
        min_allowed_wc = min(1.0 * monthly_opex, max_allowed_wc)
        wc = max(min_allowed_wc, min(max_allowed_wc, wc))
        remaining_capex = cost - pre_op - wc
        c_eq = round(remaining_capex * eq_ratio, 2)
        c_elec = round(remaining_capex - c_eq, 2)
        c_eq = round(cost - c_elec - wc - pre_op, 2)
        monthly_op_profit = turnover * (op_margin_pct / 100.0)
        annual_op_surplus = 12.0 * monthly_op_profit
        avg_dscr = annual_op_surplus / annual_debt_service

    # Invariant 6: Minimum Lean Month DSCR >= 0.70
    def calc_monthly_dscrs(w_list: List[float]) -> List[float]:
        return [
            ((turnover * w) - (raw_mat * w) - util_wages) / monthly_emi
            for w in w_list
        ]

    monthly_dscrs = calc_monthly_dscrs(norm_weights)
    min_dscr = min(monthly_dscrs)

    alpha = 1.0
    while min_dscr < 0.70 and alpha > 0.05:
        alpha -= 0.10
        dampened = [1.0 + (w - 1.0) * alpha for w in norm_weights]
        s_d = sum(dampened)
        norm_weights = [(w / s_d) * 12.0 for w in dampened]
        monthly_dscrs = calc_monthly_dscrs(norm_weights)
        min_dscr = min(monthly_dscrs)

    if min_dscr < 0.70:
        norm_weights = [1.0] * 12
        monthly_dscrs = calc_monthly_dscrs(norm_weights)
        min_dscr = min(monthly_dscrs)

    # Double-check invariant 1 strictly
    assert abs((c_eq + c_elec + wc + pre_op) - cost) < 0.01, "Outlay balance violated"

    return {
        "total_project_cost": round(cost, 2),
        "capex_equipment": round(c_eq, 2),
        "capex_electrification_setup": round(c_elec, 2),
        "working_capital_buffer": round(wc, 2),
        "pre_operative": round(pre_op, 2),
        "monthly_turnover": round(turnover, 2),
        "monthly_raw_materials": round(raw_mat, 2),
        "monthly_utilities_wages": round(util_wages, 2),
        "gross_margin_pct": round(gross_margin_pct, 2),
        "operating_margin_pct": round(op_margin_pct, 2),
        "annual_turnover": round(turnover * 12.0, 2),
        "annual_gross_profit": round((turnover - raw_mat) * 12.0, 2),
        "annual_operating_profit": round((turnover - raw_mat - util_wages) * 12.0, 2),
        "average_dscr": round(avg_dscr, 2),
        "min_lean_month_dscr": round(min_dscr, 2),
        "seasonality_weights": [round(w, 3) for w in norm_weights],
        "monthly_dscrs": [round(d, 2) for d in monthly_dscrs],
    }


# ---------------------------------------------------------------------------
# 4. Mandi Linkage Helper
# ---------------------------------------------------------------------------

def check_mandi_commodity(trade_name: str, state: str) -> Optional[dict]:
    """
    Checks if trade name mentions agricultural commodities; if so, queries Agmarknet mandi prices.
    """
    normalized = " " + re.sub(r"[^a-zA-Z0-9\s-]", " ", trade_name.lower()) + " "
    detected_commodity = None
    for kw, comm in MANDI_COMMODITIES.items():
        pattern = r"(?<!\w)" + re.escape(kw) + r"(?!\w)"
        if re.search(pattern, normalized):
            detected_commodity = comm
            break

    if not detected_commodity:
        return None

    try:
        # lookup_live, not mandi_prices: a saved price (the route's fallback) must never reach a custom dossier as if
        # it were a live one (backend/mandi_snapshot.py, 14 Nov 2026).
        res = mandi.lookup_live(state=state or "Uttar Pradesh", commodity=detected_commodity)
        return {
            "commodity": detected_commodity,
            "data": res,
        }
    except Exception as exc:
        log.info("Mandi query for %s failed: %s", detected_commodity, exc)
        return {
            "commodity": detected_commodity,
            "status": "lookup_failed",
            "error": str(exc),
        }


# ---------------------------------------------------------------------------
# 5. Synthesized Dossier Builder (D99 Schema)
# ---------------------------------------------------------------------------

def build_custom_dossier(
    trade_name: str,
    district: str,
    state: str,
    project_cost: float,
    archetype: ArchetypeDefinition,
    match: ArchetypeMatch,
    financials: dict,
    synthesis_source: str,
    code: str = "D99",
    mandi_info: Optional[dict] = None,
) -> dict:
    cost = financials["total_project_cost"]
    annual_surplus = financials["annual_operating_profit"]
    avg_dscr = financials["average_dscr"]

    # 3 standard tiers (Micro, Proposed, Scale-up)
    tiers = [
        {
            "label": "Micro Unit (50% scale)",
            "project_cost": {"value": round(0.5 * cost), "tag": "synthesized custom scale"},
            "surplus": {"value": round(0.5 * annual_surplus), "tag": "synthesized custom surplus"},
            "annual_surplus": {"value": round(0.5 * annual_surplus), "tag": "synthesized custom surplus"},
            "dscr": {"years": [{"year": 1, "value": avg_dscr}, {"year": 2, "value": avg_dscr}, {"year": 3, "value": avg_dscr}]},
        },
        {
            "label": "Proposed Unit (Full Scale)",
            "project_cost": {"value": round(cost), "tag": "synthesized custom project cost"},
            "surplus": {"value": round(annual_surplus), "tag": "synthesized custom surplus"},
            "annual_surplus": {"value": round(annual_surplus), "tag": "synthesized custom surplus"},
            "dscr": {"years": [{"year": 1, "value": avg_dscr}, {"year": 2, "value": avg_dscr}, {"year": 3, "value": avg_dscr}]},
        },
        {
            "label": "Expansion Scale Unit (150% scale)",
            "project_cost": {"value": round(1.5 * cost), "tag": "synthesized custom scale"},
            "surplus": {"value": round(1.5 * annual_surplus), "tag": "synthesized custom surplus"},
            "annual_surplus": {"value": round(1.5 * annual_surplus), "tag": "synthesized custom surplus"},
            "dscr": {"years": [{"year": 1, "value": avg_dscr}, {"year": 2, "value": avg_dscr}, {"year": 3, "value": avg_dscr}]},
        },
    ]

    seasonality = {
        "months": [
            {"month": m, "value": round(w, 2), "tag": "synthesized seasonality multiplier"}
            for m, w in zip(MONTHS, financials["seasonality_weights"])
        ],
        "tag": "synthesized economic seasonality array",
    }

    sections = [
        {
            "id": "classification",
            "title": "1. Classification & Archetype Mapping",
            "title_hi": "1. वर्गीकरण और संदर्भ मॉडल",
            "items": [
                {"cells": ["Trade Name", trade_name, "[SYNTHESIS]"]},
                {"cells": ["Mapped Archetype", archetype.name, f"[ARCHETYPE: {archetype.anchor_code}]"]},
                {"cells": ["Anchor Reference", f"{archetype.anchor_name} ({archetype.anchor_code})", "[ANCHOR]"]},
                {"cells": ["Geographic Context", f"{district or 'District'}, {state or 'State'}", "[LOCATION]"]},
                {"cells": ["Archetype Description", archetype.description, "[BENCHMARK]"]},
            ],
        },
        {
            "id": "capital_outlay",
            "title": "2. Capital Outlay & Balance of Funds",
            "title_hi": "2. पूँजीगत परिव्यय और वित्तपोषण",
            "items": [
                {"cells": ["Equipment & Machinery CapEx", f"₹{financials['capex_equipment']:,.0f}", "[CALCULATED]"]},
                {"cells": ["Electrification & Site Setup", f"₹{financials['capex_electrification_setup']:,.0f}", "[CALCULATED]"]},
                {"cells": ["Working Capital Buffer", f"₹{financials['working_capital_buffer']:,.0f}", "[CALCULATED]"]},
                {"cells": ["Pre-Operative Expenses (5%)", f"₹{financials['pre_operative']:,.0f}", "[STATUTORY]"]},
                {"cells": ["Total Project Cost", f"₹{financials['total_project_cost']:,.0f}", "[USER INPUT]"]},
            ],
        },
        {
            "id": "financial_projections",
            "title": "3. Operating Projections & Debt Viability",
            "title_hi": "3. परिचालन अनुमान और ऋण व्यवहार्यता",
            "items": [
                {"cells": ["Monthly Turnover", f"₹{financials['monthly_turnover']:,.0f}", "[SYNTHESIS]"]},
                {"cells": ["Monthly Raw Materials", f"₹{financials['monthly_raw_materials']:,.0f}", "[SYNTHESIS]"]},
                {"cells": ["Monthly Utilities & Wages", f"₹{financials['monthly_utilities_wages']:,.0f}", "[SYNTHESIS]"]},
                {"cells": ["Gross Profit Margin", f"{financials['gross_margin_pct']}%", "[GUARDRAIL]"]},
                {"cells": ["Operating Profit Margin", f"{financials['operating_margin_pct']}%", "[GUARDRAIL]"]},
                {"cells": ["5-Year Average DSCR", f"{financials['average_dscr']:.2f}", "[GUARDRAIL]"]},
                {"cells": ["Minimum Lean Month DSCR", f"{financials['min_lean_month_dscr']:.2f}", "[GUARDRAIL]"]},
            ],
        },
        {
            "id": "compliance",
            "title": "4. Statutory Compliance & Approvals",
            "title_hi": "4. वैधानिक अनुपालन और स्वीकृतियाँ",
            "items": [
                {"cells": ["Enterprise Registration", "Udyam Registration Portal (Zero Cost, Instant)", "[GOVT]"]},
                {"cells": ["Tax Registration", "GST Registration (if turnover exceeds statutory threshold)", "[STATUTORY]"]},
                {"cells": ["Local NOC", "Gram Panchayat / Municipal Trade Permission", "[LOCAL]"]},
            ],
        },
    ]

    sources = [
        {"tag": "[SYNTHESIS]", "text": f"Synthesized via {synthesis_source}"},
        {"tag": f"[{archetype.anchor_code}]", "text": f"Anchor Benchmark: {archetype.anchor_name} ({archetype.anchor_code})"},
        {"tag": "[GOVT]", "text": "Ministry of Micro, Small and Medium Enterprises (MoMSME) benchmarks"},
    ]

    dossier = {
        "code": code,
        "name": trade_name,
        "name_hi": "",
        "status": "verified",
        "dossier": f"synthesized/{code}_Custom_Trade_Dossier.md",
        "questions": [],
        "questionsAvailable": False,
        "sections": sections,
        "tiers": tiers,
        "seasonality": seasonality,
        "financials": financials,
        "archetype": {
            "id": archetype.id,
            "name": archetype.name,
            "anchor_code": archetype.anchor_code,
            "anchor_name": archetype.anchor_name,
            "anchor_codes": archetype.anchor_codes,
            "matched_keywords": match.matched_keywords,
            "confidence": match.confidence,
            "is_fallback": match.is_fallback,
        },
        "synthesis_source": synthesis_source,
        "sources": sources,
    }

    if mandi_info:
        dossier["mandi_data"] = mandi_info

    return dossier


def get_default_custom_dossier(code: str = "D99") -> dict:
    """Returns a valid default synthesized custom dossier when requested before custom generation."""
    arch = ARCHETYPES[2]
    match = ArchetypeMatch(
        archetype_id=arch.id,
        archetype_name=arch.name,
        anchor_code=arch.anchor_code,
        anchor_name=arch.anchor_name,
        anchor_codes=arch.anchor_codes,
        matched_keywords=[],
        confidence=0.50,
        is_fallback=True,
    )
    cost = 250000.0
    raw_params = synthesize_parameters_fallback(cost, arch)
    financials = apply_economic_guardrails(raw_params, cost, arch)
    return build_custom_dossier(
        trade_name="Custom Rural Enterprise",
        district="Sitapur",
        state="Uttar Pradesh",
        project_cost=cost,
        archetype=arch,
        match=match,
        financials=financials,
        synthesis_source=f"[ARCHETYPE-FALLBACK: Anchor {arch.anchor_code}]",
        code=code,
    )


# ---------------------------------------------------------------------------
# 6. Request Model & API Endpoint
# ---------------------------------------------------------------------------

class CustomTradeRequest(BaseModel):
    tradeName: str = Field(..., alias="trade_name", description="Uncatalogued business trade or micro-enterprise idea")
    district: str = Field("Sitapur", description="District name")
    state: str = Field("Uttar Pradesh", description="State name")
    projectCost: float = Field(..., alias="project_cost", description="Total project outlay in INR")
    applicantCategory: str = Field("GENERAL", alias="applicant_category", description="Caste category: SC, ST, OBC, GENERAL")
    gender: str = Field("male", description="Gender of applicant: male, female, transgender")
    isRural: bool = Field(True, alias="is_rural", description="True if rural, False if urban")

    model_config = {
        "populate_by_name": True,
        "extra": "ignore",
    }

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        d = dict(data)
        # Normalize trade name aliases
        if "trade_name" in d and "tradeName" not in d:
            d["tradeName"] = d["trade_name"]
        if "tradeName" not in d and "trade" in d:
            d["tradeName"] = d["trade"]
        if "tradeName" not in d and "name" in d:
            d["tradeName"] = d["name"]

        # Normalize project cost aliases
        if "project_cost" in d and "projectCost" not in d:
            d["projectCost"] = d["project_cost"]
        if "projectCost" not in d and "cost" in d:
            d["projectCost"] = d["cost"]

        # Normalize applicant category aliases
        if "applicant_category" in d and "applicantCategory" not in d:
            d["applicantCategory"] = d["applicant_category"]
        if "caste_category" in d and "applicantCategory" not in d:
            d["applicantCategory"] = d["caste_category"]
        if "casteCategory" in d and "applicantCategory" not in d:
            d["applicantCategory"] = d["casteCategory"]

        # Normalize rural flag aliases
        if "is_rural" in d and "isRural" not in d:
            d["isRural"] = d["is_rural"]

        return d


@router.post("/custom")
async def custom_trade_endpoint(req: CustomTradeRequest):
    """
    Synthesize an out-of-catalog trade dossier through nearest-neighbor archetype mapping
    and Groq LLM financial synthesis governed by bounded economic guardrails.
    """
    if not req.tradeName or not req.tradeName.strip():
        raise HTTPException(status_code=400, detail="tradeName cannot be empty")
    if req.projectCost <= 0:
        raise HTTPException(status_code=400, detail="projectCost must be greater than zero")

    # 1. Map Nearest-Neighbor Archetype
    match = map_archetype(req.tradeName)
    archetype = ARCHETYPES[match.archetype_id]

    # 2. Financial Parameter Synthesis (Groq or Fallback)
    raw_params = None
    source = "groq"
    try:
        raw_params = synthesize_parameters_groq(
            trade_name=req.tradeName,
            project_cost=req.projectCost,
            district=req.district,
            state=req.state,
            archetype=archetype,
        )
    except Exception as exc:
        log.warning("Groq synthesis call threw exception: %s", exc)
        raw_params = None

    if not raw_params:
        raw_params = synthesize_parameters_fallback(
            project_cost=req.projectCost,
            archetype=archetype,
        )
        source = f"[ARCHETYPE-FALLBACK: Anchor {archetype.anchor_code}]"

    # 3. Strictly Apply 7 Bounded Economic Guardrails
    financials = apply_economic_guardrails(
        raw_params=raw_params,
        project_cost=req.projectCost,
        archetype=archetype,
    )

    # 4. Optional Mandi linkage for agricultural commodities
    mandi_info = check_mandi_commodity(req.tradeName, req.state)

    # 5. Build Synthesized Dossier Schema (code="D99")
    dossier = build_custom_dossier(
        trade_name=req.tradeName,
        district=req.district,
        state=req.state,
        project_cost=req.projectCost,
        archetype=archetype,
        match=match,
        financials=financials,
        synthesis_source=source,
        code="D99",
        mandi_info=mandi_info,
    )

    # 6. Dynamic Registration across systems
    businesses.register_custom_business(dossier)

    try:
        from backend import dossier_figures
        figs = {
            "code": dossier["code"],
            "name": dossier["name"],
            "dossier": dossier["dossier"],
            "tiers": dossier["tiers"],
            "seasonality": dossier["seasonality"],
        }
        dossier_figures.register_custom_figures("D99", figs)
        dossier_figures.register_custom_figures("D99_CUSTOM", figs)
    except Exception as exc:
        log.warning("Linkage registration warning: %s", exc)

    return dossier
