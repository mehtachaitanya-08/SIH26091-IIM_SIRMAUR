"""
Universal Multi-Category Statutory Schemes Engine (backend/schemes.py)

Statutory Rule Engine implementing all 7 Central Government Schemes:
1. NSFDC (National Scheduled Castes Finance and Development Corporation — MoSJE)
   - Micro Credit Facility (MCF): up to ₹1.40L @ 6.5% p.a., 3-yr tenure, ₹15,000 / 10% equity.
   - Term Loan: up to ₹50L (90% loan, max ₹45L) @ 8.0% p.a., 5–10 yr tenure, min 10% equity.
   - Mahila Samridhi Yojana (MSY): Women up to ₹1.40L @ 4.0% p.a.
2. NSTFDC (National Scheduled Tribes Finance and Development Corporation — MoTA)
   - Term Loan: up to ₹50L (up to 90% loan) @ 6.0% p.a., min 10% equity.
   - Adivasi Mahila Sashaktikaran Yojana (AMSY): ST Women up to ₹2.0L (up to 90% loan) @ 4.0% p.a.
3. NBCFDC (National Backward Classes Finance and Development Corporation — MoSJE)
   - New Swarnima Scheme for Women: OBC/EBC Women up to ₹2.0L (up to 95% loan) @ 5.0% p.a., min 5% equity.
   - General Term Loan: up to ₹15.0L (up to 85% loan) @ 6.0%–7.0% p.a., min 15% equity.
4. PMEGP (Prime Minister's Employment Generation Programme — MoMSME / KVIC)
   - All categories eligible. Mfg up to ₹50L, Service up to ₹20L.
   - Margin money capital subsidy:
     * Rural Special: 35% subsidy, 5% own contribution.
     * Urban Special: 25% subsidy, 5% own contribution.
     * Rural General: 25% subsidy, 10% own contribution.
     * Urban General: 15% subsidy, 10% own contribution.
   - Bank MCLR interest (~9.5% p.a.), 5-yr tenure.
5. PM Vishwakarma (MoMSME / MoSD&E / MoF)
   - 18 traditional artisan trades (carpenter, blacksmith, potter, tailor, cobbler, etc.).
   - Tranche 1: up to ₹1.0L, Tranche 2: up to ₹2.0L.
   - Fixed concessional rate: 5.0% p.a. (8% Govt interest subvention).
   - ₹15,000 digital toolkit voucher grant, 0% promoter equity.
6. PM MUDRA Yojana (PMMY — DFS, MoF)
   - All micro-enterprises.
   - Shishu: up to ₹50k (0% equity, 100% loan @ 9.5%).
   - Kishore: ₹50k to ₹5.0L (15% equity, 85% loan @ 9.5%).
   - Tarun: ₹5.0L to ₹20.0L (15% equity, 85% loan @ 9.5%).
   - 100% collateral-free (CGFMU).
7. PMFME (Pradhan Mantri Formalisation of Micro food processing Enterprises — MoFPI)
   - Micro food processing units.
   - 35% credit-linked capital subsidy capped at ₹10 Lakhs.
   - Min 10% equity, balance bank loan @ 9.5%.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple, Union
import re

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field, model_validator

router = APIRouter(prefix="/api/schemes", tags=["schemes"])

# ---------------------------------------------------------------------------
# Traditional Artisan Crafts (PM Vishwakarma) & Food Processing Taxonomies
# ---------------------------------------------------------------------------

VISHWAKARMA_18_TRADES = [
    "carpenter", "suthar", "badhai",
    "boat builder",
    "armourer",
    "blacksmith", "lohar",
    "hammer and tool kit maker", "tool maker",
    "locksmith",
    "sculptor", "stone carver", "stone breaker", "moortikar",
    "goldsmith", "sonar", "sunar",
    "potter", "kumhaar", "kumbhar",
    "cobbler", "shoesmith", "footwear artisan", "charmakar", "mochi",
    "mason", "rajmistri", "mistry",
    "basket maker", "mat maker", "broom maker", "coir weaver", "tokri",
    "doll & toy maker", "toy maker", "doll maker",
    "barber", "naai", "nai",
    "garland maker", "malakar", "phool",
    "washerman", "dhobi",
    "tailor", "darzi",
    "fishing net maker"
]

ARTISAN_CODES = {"D18", "D19", "D20", "D21"}

FOOD_PROCESSING_CODES = {"D07", "D08", "D09", "D10", "D23"}

FOOD_PROCESSING_KEYWORDS = [
    "flour", "atta", "dal", "grain", "oil", "expeller", "mustard", "spice", "masala",
    "pickle", "papad", "dehydration", "bakery", "biscuit", "confectionery", "food",
    "agro-processing", "dairy", "milk", "cheese", "paneer", "honey", "juice", "jam",
    "jelly", "milling", "cold press", "processing", "fruit", "vegetable"
]

SERVICE_CODES = {"D03", "D15", "D16", "D17"}

SERVICE_KEYWORDS = [
    "service", "repair", "garage", "workshop", "recharge", "electric", "battery",
    "installation", "maintenance", "mechanic"
]


# ---------------------------------------------------------------------------
# Financial Calculation Helpers
# ---------------------------------------------------------------------------

def calculate_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> float:
    """Standard amortizing monthly Equated Monthly Instalment (EMI)."""
    if principal <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate_pct <= 0:
        return round(principal / tenure_months, 2)
    r = (annual_rate_pct / 100.0) / 12.0
    factor = (1.0 + r) ** tenure_months
    emi = principal * (r * factor) / (factor - 1.0)
    return round(emi, 2)


def is_trade_artisan(trade_name: Optional[str], trade_code: Optional[str], is_artisan_flag: bool) -> bool:
    if is_artisan_flag:
        return True
    if trade_code and trade_code.strip().upper() in ARTISAN_CODES:
        return True
    if trade_name:
        t_clean = trade_name.lower().strip()
        for kw in VISHWAKARMA_18_TRADES:
            if kw in t_clean:
                return True
    return False


def is_trade_food(trade_name: Optional[str], trade_code: Optional[str], is_food_flag: bool) -> bool:
    if is_food_flag:
        return True
    if trade_code and trade_code.strip().upper() in FOOD_PROCESSING_CODES:
        return True
    if trade_name:
        t_clean = trade_name.lower().strip()
        for kw in FOOD_PROCESSING_KEYWORDS:
            if re.search(rf"\b{re.escape(kw)}\b", t_clean):
                return True
    return False


def is_trade_service(trade_name: Optional[str], trade_code: Optional[str], activity_type: Optional[str]) -> bool:
    if activity_type and activity_type.lower().strip() in ("service", "services"):
        return True
    if trade_code and trade_code.strip().upper() in SERVICE_CODES:
        return True
    if trade_name:
        t_clean = trade_name.lower().strip()
        for kw in SERVICE_KEYWORDS:
            if kw in t_clean:
                return True
    return False


# ---------------------------------------------------------------------------
# Request & Response Schemas
# ---------------------------------------------------------------------------

class SchemeEvaluationRequest(BaseModel):
    caste_category: Optional[str] = "General"  # SC, ST, OBC, General, EWS, Minority
    gender: Optional[str] = "male"             # female, male, other
    is_rural: Optional[bool] = True
    annual_income: Optional[float] = 0.0
    project_cost: float
    trade_code: Optional[str] = None
    trade_name: Optional[str] = None
    is_artisan: Optional[bool] = False
    is_food_processing: Optional[bool] = False
    is_woman: Optional[bool] = None
    is_divyang: Optional[bool] = False
    state: Optional[str] = "Uttar Pradesh"
    district: Optional[str] = None
    activity_type: Optional[str] = "manufacturing"

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map legacy or alternative field names seamlessly
            if "annual_family_income" in data and "annual_income" not in data:
                data["annual_income"] = data["annual_family_income"]
            if "is_sc" in data and data.get("is_sc") and "caste_category" not in data:
                data["caste_category"] = "SC"
            if "location_type" in data and "is_rural" not in data:
                data["is_rural"] = str(data["location_type"]).lower() == "rural"
            if "isWoman" in data and "is_woman" not in data:
                data["is_woman"] = data["isWoman"]
            if "projectCost" in data and "project_cost" not in data:
                data["project_cost"] = data["projectCost"]
        return data


# ---------------------------------------------------------------------------
# Scheme Evaluators
# ---------------------------------------------------------------------------

def _eval_nsfdc(
    cost: float, income: float, is_sc: bool, is_woman: bool
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """NSFDC (MoSJE): Scheduled Castes."""
    eligible = []
    ineligible = []

    if not is_sc:
        ineligible.append({
            "scheme_code": "NSFDC",
            "scheme_name": "NSFDC Concessional Credit Schemes",
            "reason": "Applicant does not belong to Scheduled Castes (SC); NSFDC is strictly reserved for SC beneficiaries under MoSJE statutory guidelines."
        })
        return eligible, ineligible

    if income > 500000:
        ineligible.append({
            "scheme_code": "NSFDC",
            "scheme_name": "NSFDC Concessional Credit Schemes",
            "reason": f"Annual family income of ₹{income:,.0f} exceeds the statutory NSFDC ceiling of ₹5,00,000."
        })
        return eligible, ineligible

    if cost > 5000000:
        ineligible.append({
            "scheme_code": "NSFDC",
            "scheme_name": "NSFDC Concessional Credit Schemes",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds the statutory NSFDC maximum ceiling of ₹50,00,000."
        })
        return eligible, ineligible

    # 1. Mahila Samridhi Yojana (SC Women, up to ₹1.40L)
    if is_woman and cost <= 140000 and income <= 300000:
        loan = min(round(cost * 0.90, 2), 125000.0)
        equity = round(cost - loan, 2)
        emi = calculate_emi(loan, 4.0, 36)
        eligible.append({
            "scheme_code": "NSFDC_MAHILA_SAMRIDHI",
            "scheme_name": "NSFDC Mahila Samridhi Yojana (MSY)",
            "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
            "subsidy_amount": 0.0,
            "subsidy_rate_pct": 0.0,
            "promoter_equity": equity,
            "promoter_equity_pct": round((equity / cost) * 100, 1),
            "loan_principal": loan,
            "interest_rate_pa": 4.0,
            "tenure_months": 36,
            "moratorium_months": 3,
            "monthly_emi": emi,
            "strategic_benefit": "Highly concessional 4.0% interest rate exclusively for SC women entrepreneurs.",
            "tag": "STATUTORY: MoSJE NSFDC Mahila Samridhi Yojana Guidelines"
        })
    elif is_woman and cost > 140000:
        ineligible.append({
            "scheme_code": "NSFDC_MAHILA_SAMRIDHI",
            "scheme_name": "NSFDC Mahila Samridhi Yojana (MSY)",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds Mahila Samridhi Yojana statutory ceiling of ₹1,40,000."
        })

    # 2. Micro Credit Facility (MCF, up to ₹1.40L)
    if cost <= 140000 and income <= 300000:
        # At exactly ₹1.40L, equity is ₹15,000 (loan ₹1,25,000)
        if cost == 140000.0:
            loan = 125000.0
            equity = 15000.0
        else:
            loan = min(round(cost * 0.90, 2), 125000.0)
            equity = round(cost - loan, 2)
        emi = calculate_emi(loan, 6.5, 36)
        eligible.append({
            "scheme_code": "NSFDC_MICRO_CREDIT",
            "scheme_name": "NSFDC Micro Credit Facility (MCF)",
            "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
            "subsidy_amount": 0.0,
            "subsidy_rate_pct": 0.0,
            "promoter_equity": equity,
            "promoter_equity_pct": round((equity / cost) * 100, 1),
            "loan_principal": loan,
            "interest_rate_pa": 6.5,
            "tenure_months": 36,
            "moratorium_months": 3,
            "monthly_emi": emi,
            "strategic_benefit": "Concessional 6.5% interest rate with nominal own contribution under NSFDC micro credit.",
            "tag": "STATUTORY: MoSJE NSFDC Micro Credit Facility Guidelines"
        })

    # 3. Term Loan (up to ₹50L)
    loan = min(round(cost * 0.90, 2), 4500000.0)
    equity = round(cost - loan, 2)
    emi = calculate_emi(loan, 8.0, 84)
    eligible.append({
        "scheme_code": "NSFDC_TERM_LOAN",
        "scheme_name": "NSFDC Term Loan",
        "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
        "subsidy_amount": 0.0,
        "subsidy_rate_pct": 0.0,
        "promoter_equity": equity,
        "promoter_equity_pct": round((equity / cost) * 100, 1),
        "loan_principal": loan,
        "interest_rate_pa": 8.0,
        "tenure_months": 84,
        "moratorium_months": 6,
        "monthly_emi": emi,
        "strategic_benefit": "Concessional 8.0% interest rate with 7-year repayment window and up to 90% loan coverage.",
        "tag": "STATUTORY: MoSJE NSFDC Term Loan Guidelines"
    })

    return eligible, ineligible


def _eval_nstfdc(
    cost: float, is_st: bool, is_woman: bool
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """NSTFDC (MoTA): Scheduled Tribes."""
    eligible = []
    ineligible = []

    if not is_st:
        ineligible.append({
            "scheme_code": "NSTFDC",
            "scheme_name": "NSTFDC Concessional Credit Schemes",
            "reason": "Applicant does not belong to Scheduled Tribes (ST); NSTFDC is strictly reserved for ST beneficiaries under MoTA statutory guidelines."
        })
        return eligible, ineligible

    if cost > 5000000:
        ineligible.append({
            "scheme_code": "NSTFDC",
            "scheme_name": "NSTFDC Term Loan",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds statutory NSTFDC ceiling of ₹50,00,000."
        })
        return eligible, ineligible

    # 1. Adivasi Mahila Sashaktikaran Yojana (AMSY)
    if is_woman:
        if cost <= 200000:
            loan = round(cost * 0.90, 2)
            equity = round(cost * 0.10, 2)
            emi = calculate_emi(loan, 4.0, 60)
            eligible.append({
                "scheme_code": "NSTFDC_AMSY",
                "scheme_name": "NSTFDC Adivasi Mahila Sashaktikaran Yojana (AMSY)",
                "ministry": "Ministry of Tribal Affairs (MoTA)",
                "subsidy_amount": 0.0,
                "subsidy_rate_pct": 0.0,
                "promoter_equity": equity,
                "promoter_equity_pct": 10.0,
                "loan_principal": loan,
                "interest_rate_pa": 4.0,
                "tenure_months": 60,
                "moratorium_months": 6,
                "monthly_emi": emi,
                "strategic_benefit": "Highly concessional 4.0% interest rate and 90% financial assistance for ST women entrepreneurs.",
                "tag": "STATUTORY: MoTA NSTFDC Adivasi Mahila Sashaktikaran Yojana Guidelines"
            })
        else:
            ineligible.append({
                "scheme_code": "NSTFDC_AMSY",
                "scheme_name": "NSTFDC Adivasi Mahila Sashaktikaran Yojana (AMSY)",
                "reason": f"Project cost of ₹{cost:,.0f} exceeds AMSY ceiling of ₹2,00,000."
            })
    else:
        ineligible.append({
            "scheme_code": "NSTFDC_AMSY",
            "scheme_name": "NSTFDC Adivasi Mahila Sashaktikaran Yojana (AMSY)",
            "reason": "AMSY is exclusively reserved for Scheduled Tribe (ST) women entrepreneurs."
        })

    # 2. NSTFDC Term Loan
    loan = min(round(cost * 0.90, 2), 4500000.0)
    equity = round(cost - loan, 2)
    emi = calculate_emi(loan, 6.0, 60)
    eligible.append({
        "scheme_code": "NSTFDC_TERM_LOAN",
        "scheme_name": "NSTFDC Term Loan",
        "ministry": "Ministry of Tribal Affairs (MoTA)",
        "subsidy_amount": 0.0,
        "subsidy_rate_pct": 0.0,
        "promoter_equity": equity,
        "promoter_equity_pct": round((equity / cost) * 100, 1),
        "loan_principal": loan,
        "interest_rate_pa": 6.0,
        "tenure_months": 60,
        "moratorium_months": 6,
        "monthly_emi": emi,
        "strategic_benefit": "Concessional 6.0% interest rate with up to 90% loan assistance for Scheduled Tribes.",
        "tag": "STATUTORY: MoTA NSTFDC Term Loan Guidelines"
    })

    return eligible, ineligible


def _eval_nbcfdc(
    cost: float, income: float, is_obc: bool, is_woman: bool
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """NBCFDC (MoSJE): OBC and EBC."""
    eligible = []
    ineligible = []

    if not is_obc:
        ineligible.append({
            "scheme_code": "NBCFDC",
            "scheme_name": "NBCFDC Concessional Credit Schemes",
            "reason": "Applicant does not belong to Other Backward Classes (OBC) or Economically Backward Classes (EBC); NBCFDC is restricted to backward classes."
        })
        return eligible, ineligible

    if income > 300000:
        ineligible.append({
            "scheme_code": "NBCFDC",
            "scheme_name": "NBCFDC Concessional Credit Schemes",
            "reason": f"Annual family income of ₹{income:,.0f} exceeds the NBCFDC statutory limit of ₹3,00,000."
        })
        return eligible, ineligible

    # 1. New Swarnima Scheme for Women (up to ₹2.0L)
    if is_woman:
        if cost <= 200000:
            loan = round(cost * 0.95, 2)
            equity = round(cost * 0.05, 2)
            emi = calculate_emi(loan, 5.0, 60)
            eligible.append({
                "scheme_code": "NBCFDC_NEW_SWARNIMA",
                "scheme_name": "NBCFDC New Swarnima Scheme for Women",
                "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
                "subsidy_amount": 0.0,
                "subsidy_rate_pct": 0.0,
                "promoter_equity": equity,
                "promoter_equity_pct": 5.0,
                "loan_principal": loan,
                "interest_rate_pa": 5.0,
                "tenure_months": 60,
                "moratorium_months": 6,
                "monthly_emi": emi,
                "strategic_benefit": "Concessional 5.0% interest rate with 95% loan coverage and only 5% promoter equity for OBC/EBC women.",
                "tag": "STATUTORY: MoSJE NBCFDC New Swarnima Guidelines"
            })
        else:
            ineligible.append({
                "scheme_code": "NBCFDC_NEW_SWARNIMA",
                "scheme_name": "NBCFDC New Swarnima Scheme for Women",
                "reason": f"Project cost of ₹{cost:,.0f} exceeds New Swarnima ceiling of ₹2,00,000."
            })
    else:
        ineligible.append({
            "scheme_code": "NBCFDC_NEW_SWARNIMA",
            "scheme_name": "NBCFDC New Swarnima Scheme for Women",
            "reason": "New Swarnima is exclusively reserved for OBC/EBC women entrepreneurs."
        })

    # 2. General Term Loan (up to ₹15.0L)
    if cost <= 1500000:
        rate = 6.0 if cost <= 500000 else 7.0
        loan = round(cost * 0.85, 2)
        equity = round(cost * 0.15, 2)
        emi = calculate_emi(loan, rate, 60)
        eligible.append({
            "scheme_code": "NBCFDC_TERM_LOAN",
            "scheme_name": "NBCFDC General Term Loan",
            "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
            "subsidy_amount": 0.0,
            "subsidy_rate_pct": 0.0,
            "promoter_equity": equity,
            "promoter_equity_pct": 15.0,
            "loan_principal": loan,
            "interest_rate_pa": rate,
            "tenure_months": 60,
            "moratorium_months": 6,
            "monthly_emi": emi,
            "strategic_benefit": f"Concessional {rate:.1f}% interest rate with up to 85% project financing for OBC/EBC entrepreneurs.",
            "tag": "STATUTORY: MoSJE NBCFDC Term Loan Guidelines"
        })
    else:
        ineligible.append({
            "scheme_code": "NBCFDC_TERM_LOAN",
            "scheme_name": "NBCFDC General Term Loan",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds NBCFDC General Term Loan ceiling of ₹15,00,000."
        })

    return eligible, ineligible


def _eval_pmegp(
    cost: float, is_rural: bool, is_special: bool, is_service: bool
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """PMEGP (MoMSME / KVIC): Margin money capital subsidy."""
    eligible = []
    ineligible = []

    max_cost = 2000000.0 if is_service else 5000000.0
    if cost > max_cost:
        sector_str = "service" if is_service else "manufacturing"
        ineligible.append({
            "scheme_code": "PMEGP",
            "scheme_name": "Prime Minister's Employment Generation Programme (PMEGP)",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds PMEGP ceiling of ₹{max_cost/100000:.0f} Lakhs (₹{max_cost:,.0f}) for {sector_str} units."
        })
        return eligible, ineligible

    # Determine subsidy % and own contribution %
    if is_special:
        if is_rural:
            sub_pct = 35.0
            equity_pct = 5.0
            code = "PMEGP_RURAL_SPECIAL"
            tag_label = "Rural Special"
        else:
            sub_pct = 25.0
            equity_pct = 5.0
            code = "PMEGP_URBAN_SPECIAL"
            tag_label = "Urban Special"
    else:
        if is_rural:
            sub_pct = 25.0
            equity_pct = 10.0
            code = "PMEGP_RURAL_GENERAL"
            tag_label = "Rural General"
        else:
            sub_pct = 15.0
            equity_pct = 10.0
            code = "PMEGP_URBAN_GENERAL"
            tag_label = "Urban General"

    subsidy = round(cost * (sub_pct / 100.0), 2)
    equity = round(cost * (equity_pct / 100.0), 2)
    loan = round(cost - subsidy - equity, 2)
    emi = calculate_emi(loan, 9.5, 60)

    benefit = (
        f"Highest non-repayable capital subsidy of ₹{subsidy:,.0f} ({sub_pct:.0f}%) "
        f"requiring only ₹{equity:,.0f} personal equity required."
    )

    eligible.append({
        "scheme_code": code,
        "scheme_name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "ministry": "Ministry of MSME / KVIC",
        "subsidy_amount": subsidy,
        "subsidy_rate_pct": sub_pct,
        "promoter_equity": equity,
        "promoter_equity_pct": equity_pct,
        "loan_principal": loan,
        "interest_rate_pa": 9.5,
        "tenure_months": 60,
        "moratorium_months": 6,
        "monthly_emi": emi,
        "strategic_benefit": benefit,
        "tag": f"STATUTORY: MoMSME PMEGP 2026 Guidelines ({tag_label})"
    })

    return eligible, ineligible


def _eval_vishwakarma(
    cost: float, is_artisan: bool, trade_display: str
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """PM Vishwakarma: 18 traditional artisan trades."""
    eligible = []
    ineligible = []

    if not is_artisan:
        ineligible.append({
            "scheme_code": "PM_VISHWAKARMA",
            "scheme_name": "PM Vishwakarma Scheme",
            "reason": f"Trade '{trade_display}' is not one of the 18 traditional artisan crafts recognized under PM Vishwakarma."
        })
        return eligible, ineligible

    if cost > 300000:
        ineligible.append({
            "scheme_code": "PM_VISHWAKARMA",
            "scheme_name": "PM Vishwakarma Scheme",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds PM Vishwakarma maximum credit ceiling of ₹3,00,000 across Tranches 1 & 2."
        })
        return eligible, ineligible

    # Tranche 1: up to ₹1,00,000 (18 mo); Tranche 2: up to ₹2,00,000 (30 mo)
    tenure = 18 if cost <= 100000 else 30
    loan = cost
    equity = 0.0
    toolkit_grant = 15000.0
    emi = calculate_emi(loan, 5.0, tenure)

    eligible.append({
        "scheme_code": "PM_VISHWAKARMA",
        "scheme_name": "PM Vishwakarma Scheme",
        "ministry": "Ministry of Micro, Small and Medium Enterprises (MoMSME)",
        "subsidy_amount": toolkit_grant,
        "subsidy_rate_pct": round((toolkit_grant / cost) * 100, 1),
        "promoter_equity": equity,
        "promoter_equity_pct": 0.0,
        "loan_principal": loan,
        "interest_rate_pa": 5.0,
        "tenure_months": tenure,
        "moratorium_months": 0,
        "monthly_emi": emi,
        "strategic_benefit": "Fixed 5.0% concessional interest rate (8.0% Govt subvention), ₹15,000 digital toolkit voucher grant, and 0% promoter equity required.",
        "tag": "STATUTORY: MoMSME PM Vishwakarma Scheme Guidelines"
    })

    return eligible, ineligible


def _eval_mudra(cost: float) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """PM MUDRA (PMMY): Shishu, Kishore, Tarun."""
    eligible = []
    ineligible = []

    if cost > 2000000:
        ineligible.append({
            "scheme_code": "PM_MUDRA",
            "scheme_name": "Pradhan Mantri MUDRA Yojana (PMMY)",
            "reason": f"Project cost of ₹{cost:,.0f} exceeds PM MUDRA maximum ceiling of ₹20,00,000."
        })
        return eligible, ineligible

    if cost <= 50000:
        code = "MUDRA_SHISHU"
        name = "PM MUDRA (Shishu)"
        equity = 0.0
        equity_pct = 0.0
        loan = cost
        tenure = 36
    elif cost <= 500000:
        code = "MUDRA_KISHORE"
        name = "PM MUDRA (Kishore)"
        equity = round(cost * 0.15, 2)
        equity_pct = 15.0
        loan = round(cost * 0.85, 2)
        tenure = 60
    else:
        code = "MUDRA_TARUN"
        name = "PM MUDRA (Tarun)"
        equity = round(cost * 0.15, 2)
        equity_pct = 15.0
        loan = round(cost * 0.85, 2)
        tenure = 60

    emi = calculate_emi(loan, 9.5, tenure)

    eligible.append({
        "scheme_code": code,
        "scheme_name": name,
        "ministry": "Department of Financial Services, Ministry of Finance",
        "subsidy_amount": 0.0,
        "subsidy_rate_pct": 0.0,
        "promoter_equity": equity,
        "promoter_equity_pct": equity_pct,
        "loan_principal": loan,
        "interest_rate_pa": 9.5,
        "tenure_months": tenure,
        "moratorium_months": 0,
        "monthly_emi": emi,
        "strategic_benefit": "100% collateral-free institutional credit with zero asset hypothecation under CGFMU guarantee.",
        "tag": "STATUTORY: DFS MoF PMMY MUDRA Guidelines"
    })

    return eligible, ineligible


def _eval_pmfme(
    cost: float, is_food: bool, trade_display: str
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """PMFME (MoFPI): Micro food processing enterprises."""
    eligible = []
    ineligible = []

    if not is_food:
        ineligible.append({
            "scheme_code": "PMFME",
            "scheme_name": "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
            "reason": f"Trade '{trade_display}' is not a micro food processing activity covered under MoFPI PMFME guidelines."
        })
        return eligible, ineligible

    subsidy = min(round(cost * 0.35, 2), 1000000.0)
    sub_pct = round((subsidy / cost) * 100, 1)
    equity = round(cost * 0.10, 2)
    loan = round(cost - subsidy - equity, 2)
    emi = calculate_emi(loan, 9.5, 60)

    benefit = (
        f"35% capital subsidy of ₹{subsidy:,.0f} for food processing with specialized "
        "infrastructure and FSSAI compliance support."
    )

    eligible.append({
        "scheme_code": "PMFME_FOOD_PROCESSING",
        "scheme_name": "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
        "ministry": "Ministry of Food Processing Industries (MoFPI)",
        "subsidy_amount": subsidy,
        "subsidy_rate_pct": sub_pct,
        "promoter_equity": equity,
        "promoter_equity_pct": 10.0,
        "loan_principal": loan,
        "interest_rate_pa": 9.5,
        "tenure_months": 60,
        "moratorium_months": 6,
        "monthly_emi": emi,
        "strategic_benefit": benefit,
        "tag": "STATUTORY: MoFPI PMFME 2026 Guidelines"
    })

    return eligible, ineligible


# ---------------------------------------------------------------------------
# Comprehensive Evaluate Function
# ---------------------------------------------------------------------------

def evaluate(params: Union[SchemeEvaluationRequest, Dict[str, Any], Any] = None, **kwargs) -> Dict[str, Any]:
    """
    Evaluates statutory eligibility across all 7 central schemes:
    NSFDC, NSTFDC, NBCFDC, PMEGP, PM Vishwakarma, PM MUDRA, and PMFME.
    Returns:
      - eligible_schemes (sorted by financial benefit)
      - best_recommendation
      - ineligible_reasons
    """
    if params is None:
        raw = kwargs
    elif isinstance(params, SchemeEvaluationRequest):
        raw = params.model_dump()
        raw.update(kwargs)
    elif isinstance(params, dict):
        raw = dict(params)
        raw.update(kwargs)
    else:
        raw = getattr(params, "__dict__", {})
        raw.update(kwargs)

    req = SchemeEvaluationRequest(**raw)

    cost = float(req.project_cost)
    income = float(req.annual_income or 0.0)
    caste = (req.caste_category or "General").strip().upper()
    gender = (req.gender or "male").strip().lower()
    is_woman = req.is_woman if req.is_woman is not None else (gender == "female")
    is_rural = bool(req.is_rural)
    is_divyang = bool(req.is_divyang)

    is_sc = (caste == "SC")
    is_st = (caste == "ST")
    is_obc = (caste in ("OBC", "EBC"))
    is_special = is_sc or is_st or is_obc or is_woman or is_divyang or (caste == "MINORITY")

    trade_name = req.trade_name
    trade_code = req.trade_code
    trade_display = trade_name or trade_code or "Unspecified Enterprise"

    artisan_status = is_trade_artisan(trade_name, trade_code, bool(req.is_artisan))
    food_status = is_trade_food(trade_name, trade_code, bool(req.is_food_processing))
    service_status = is_trade_service(trade_name, trade_code, req.activity_type)

    eligible_schemes: List[Dict[str, Any]] = []
    ineligible_reasons: List[Dict[str, Any]] = []

    # 1. Evaluate NSFDC (SC)
    el, inel = _eval_nsfdc(cost, income, is_sc, is_woman)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # 2. Evaluate NSTFDC (ST)
    el, inel = _eval_nstfdc(cost, is_st, is_woman)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # 3. Evaluate NBCFDC (OBC/EBC)
    el, inel = _eval_nbcfdc(cost, income, is_obc, is_woman)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # 4. Evaluate PMEGP (All categories)
    el, inel = _eval_pmegp(cost, is_rural, is_special, service_status)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # 5. Evaluate PM Vishwakarma (18 crafts)
    el, inel = _eval_vishwakarma(cost, artisan_status, trade_display)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # 6. Evaluate PM MUDRA (All micro-enterprises)
    el, inel = _eval_mudra(cost)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # 7. Evaluate PMFME (Food processing)
    el, inel = _eval_pmfme(cost, food_status, trade_display)
    eligible_schemes.extend(el)
    ineligible_reasons.extend(inel)

    # Financial benefit sorting:
    # 1. Specialized statutory priority for artisan crafts under PM Vishwakarma
    # 2. Higher capital subsidy grant is best (-subsidy_amount)
    # 3. Lower promoter equity requirement is best (promoter_equity)
    # 4. Lower interest rate is best (interest_rate_pa)
    # 5. Lower monthly EMI is best (monthly_emi)
    eligible_schemes.sort(
        key=lambda s: (
            0 if (artisan_status and s["scheme_code"] == "PM_VISHWAKARMA") else 1,
            -s["subsidy_amount"],
            s["promoter_equity"],
            s["interest_rate_pa"],
            s["monthly_emi"]
        )
    )

    # Strategic Best Recommendation Formulation
    best_recommendation = None
    if eligible_schemes:
        top = eligible_schemes[0]
        code = top["scheme_code"]

        if "PMEGP" in code:
            rationale = (
                f"{top['scheme_name']} ({top.get('tag', 'PMEGP').split('(')[-1].rstrip(')')}) provides "
                f"the optimal outcome: an outright non-repayable grant of ₹{top['subsidy_amount']:,.0f} "
                f"({top['subsidy_rate_pct']:.0f}%) requiring only ₹{top['promoter_equity']:,.0f} personal equity."
            )
        elif code == "PM_VISHWAKARMA":
            rationale = (
                f"{top['scheme_name']} provides the optimal outcome: fixed concessional 5.0% interest rate "
                "(8.0% Govt interest subvention), ₹15,000 digital toolkit voucher grant, and 0% promoter equity required."
            )
        elif "PMFME" in code:
            rationale = (
                f"{top['scheme_name']} provides the optimal outcome: 35% capital subsidy of ₹{top['subsidy_amount']:,.0f} "
                "with specialized FSSAI and agro-food infrastructure support."
            )
        elif "SAMRIDHI" in code or "AMSY" in code or "SWARNIMA" in code:
            rationale = (
                f"{top['scheme_name']} provides the optimal outcome: highly concessional {top['interest_rate_pa']:.1f}% "
                "interest rate designed specifically for women micro-entrepreneurs."
            )
        elif "TERM_LOAN" in code:
            rationale = (
                f"{top['scheme_name']} provides concessional {top['interest_rate_pa']:.1f}% interest rate "
                f"with a structured repayment tenure of {top['tenure_months']} months."
            )
        elif "MUDRA" in code:
            rationale = (
                f"{top['scheme_name']} provides 100% collateral-free credit backed by CGFMU guarantee "
                "with zero collateral mortgage required."
            )
        else:
            rationale = f"{top['scheme_name']} offers the most advantageous statutory terms for your project."

        best_recommendation = {
            "scheme_code": top["scheme_code"],
            "scheme_name": top["scheme_name"],
            "rationale": rationale
        }

    return {
        "status": "success",
        "applicant": {
            "caste_category": caste,
            "gender": gender,
            "is_rural": is_rural,
            "annual_income": income,
            "project_cost": cost,
            "trade_code": trade_code,
            "trade_name": trade_name,
            "is_artisan": artisan_status,
            "is_food_processing": food_status,
        },
        "eligible_schemes": eligible_schemes,
        "best_recommendation": best_recommendation,
        "ineligible_reasons": ineligible_reasons,
    }


# ---------------------------------------------------------------------------
# FastAPI Router Endpoint
# ---------------------------------------------------------------------------

@router.post("/evaluate")
def evaluate_endpoint(req: SchemeEvaluationRequest):
    """
    Evaluates multi-category statutory schemes across NSFDC, NSTFDC, NBCFDC,
    PMEGP, PM Vishwakarma, PM MUDRA, and PMFME.
    """
    if req.project_cost <= 0:
        raise HTTPException(status_code=422, detail="project_cost must be greater than 0")
    try:
        return evaluate(req)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scheme evaluation failed: {exc}")
