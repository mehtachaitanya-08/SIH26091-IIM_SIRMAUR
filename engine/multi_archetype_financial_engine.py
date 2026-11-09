"""
Multi-Archetype Deterministic Financial Engine (Mode A: Incubation & Mode B: Restructuring)
Zero-Hallucination Algorithmic Core for Rural Micro-Enterprises in India

Statutory & Economic Alignment:
- RBI Expert Committee Report on MSMEs (2019)
- MoMSME PMEGP & PM Vishwakarma Operational Guidelines
- MoFPI PMFME Operational Guidelines
- DAHD National Livestock Mission & KCC Animal Husbandry
- PMMY MUDRA Guidelines (Shishu, Kishor, Tarun)
"""

import math
from typing import Dict, List, Optional, Any


# ==============================================================================
# 1. CONSTANTS & ARCHETYPE TAXONOMY
# ==============================================================================

ARCHETYPES = {
    "archetype_1": {
        "id": "archetype_1",
        "name": "Agro-Processing & Food Value Addition",
        "sector": "Manufacturing",
        "schemes": ["PMFME", "PMEGP_MFG", "AIF"],
        "default_capex": 650000,
        "default_opex_monthly": 185000,
        "default_turnover_monthly": 245000,
        "seasonality_weights": [1.4, 1.3, 1.2, 0.8, 0.6, 0.5, 0.5, 0.7, 0.9, 1.3, 1.4, 1.4] # Peak post-harvest
    },
    "archetype_2": {
        "id": "archetype_2",
        "name": "Rural Retail, Kirana & Agri-Input Supply",
        "sector": "Trade",
        "schemes": ["MUDRA_KISHOR", "MUDRA_TARUN", "PM_SVANIDHI"],
        "default_capex": 175000,
        "default_opex_monthly": 13430,
        "default_turnover_monthly": 273000,
        "gross_margin_pct": 0.125,
        "seasonality_weights": [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 0.9, 0.8, 0.9, 1.3, 1.4, 1.1] # Peak festivals/harvest
    },
    "archetype_3": {
        "id": "archetype_3",
        "name": "Rural Technical Services & Machinery Repair",
        "sector": "Services",
        "schemes": ["PMEGP_SERV", "MUDRA_KISHOR"],
        "default_capex": 362000,
        "default_opex_monthly": 32800,
        "default_turnover_monthly": 94950,
        "seasonality_weights": [0.8, 0.9, 1.6, 1.7, 1.1, 1.5, 0.6, 0.5, 0.7, 1.2, 1.4, 1.0] # Peak sowing & harvesting
    },
    "archetype_4": {
        "id": "archetype_4",
        "name": "Livestock, Dairy & Allied Micro-Farming",
        "sector": "Allied Agriculture",
        "schemes": ["NLM", "KCC_LIVESTOCK", "AHIDF"],
        "default_capex": 258000,
        "default_opex_monthly": 4875,
        "default_turnover_monthly": 21330,
        "seasonality_weights": [1.0, 1.0, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.3, 1.2, 1.0] # Eid / festive spikes
    },
    "archetype_5": {
        "id": "archetype_5",
        "name": "Traditional Artisans & Crafts (PM Vishwakarma)",
        "sector": "Artisanal / Vishwakarma",
        "schemes": ["PM_VISHWAKARMA_T1", "PM_VISHWAKARMA_T2"],
        "default_capex": 100000,
        "default_opex_monthly": 6300,
        "default_turnover_monthly": 72000,
        "raw_material_ratio": 0.47,
        "seasonality_weights": [0.9, 0.9, 1.0, 1.1, 1.2, 0.8, 0.7, 0.9, 1.2, 1.4, 1.5, 1.0]
    },
    "archetype_6": {
        "id": "archetype_6",
        "name": "Circular Bio-Waste & Rural Green Micro-Units",
        "sector": "Green Manufacturing",
        "schemes": ["PMEGP_MFG", "AIF", "GOBAR_DHAN"],
        "default_capex": 121500,
        "default_opex_monthly": 8333,
        "default_turnover_monthly": 24400,
        "seasonality_weights": [1.0, 1.1, 1.3, 1.2, 1.0, 1.0, 1.1, 0.9, 0.9, 1.1, 1.2, 1.1]
    }
}


# ==============================================================================
# 2. MODE A: ENTERPRISE INCUBATION ENGINE
# ==============================================================================

class IncubationEngine:
    """Computes project costs, deterministic scheme subsidies, seasonal cash flows, and DSCR."""

    @staticmethod
    def calculate_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> float:
        if principal <= 0 or tenure_months <= 0:
            return 0.0
        if annual_rate_pct <= 0:
            return round(principal / tenure_months, 2)
        r = (annual_rate_pct / 100.0) / 12.0
        emi = principal * (r * ((1 + r) ** tenure_months)) / (((1 + r) ** tenure_months) - 1)
        return round(emi, 2)

    @classmethod
    def evaluate_project(
        cls,
        archetype_id: str,
        state: str = "Uttar Pradesh",
        capex_override: Optional[float] = None,
        working_capital_override: Optional[float] = None,
        monthly_revenue_override: Optional[float] = None,
        monthly_opex_override: Optional[float] = None,
        promoter_category: str = "special",  # "special" (SC/ST/OBC/Women) or "general"
        location_type: str = "rural",        # "rural" or "urban"
        custom_loan_tenure_months: int = 60,
        base_interest_rate_pct: float = 9.5
    ) -> Dict[str, Any]:
        archetype = ARCHETYPES.get(archetype_id, ARCHETYPES["archetype_1"])
        
        # 1. Cost Decomposition
        capex = capex_override if capex_override is not None else float(archetype["default_capex"])
        base_opex = monthly_opex_override if monthly_opex_override is not None else float(archetype["default_opex_monthly"])
        base_revenue = monthly_revenue_override if monthly_revenue_override is not None else float(archetype["default_turnover_monthly"])
        
        # Default working capital = 1.5 months of opex
        working_capital = working_capital_override if working_capital_override is not None else (base_opex * 1.5)
        pre_operative = round(capex * 0.05, 2)  # 5% setup & licensing
        total_project_cost = round(capex + working_capital + pre_operative, 2)

        # 2. Scheme Matching & Subsidy Allocation
        matched_scheme = cls._match_optimal_scheme(
            archetype_id=archetype["id"],
            sector=archetype["sector"],
            total_project_cost=total_project_cost,
            promoter_category=promoter_category,
            location_type=location_type
        )

        subsidy_amount = matched_scheme["subsidy_amount"]
        promoter_equity = matched_scheme["promoter_equity"]
        loan_amount = matched_scheme["loan_amount"]
        effective_interest_rate = matched_scheme.get("effective_interest_rate", base_interest_rate_pct)
        loan_tenure_months = matched_scheme.get("tenure_months", custom_loan_tenure_months)

        monthly_emi = cls.calculate_emi(loan_amount, effective_interest_rate, loan_tenure_months)

        # 3. 12-Month Seasonality & Cash Flow Modeling
        weights = archetype["seasonality_weights"]
        monthly_cash_flows = []
        annual_nocf = 0.0

        for m_idx, w in enumerate(weights, 1):
            m_rev = round(base_revenue * w, 2)
            # Cost scaling: 70% fixed cost, 30% variable with seasonal load
            m_cost = round(base_opex * (0.7 + (0.3 * w)), 2)
            m_nocf = round(m_rev - m_cost, 2)
            annual_nocf += m_nocf
            m_dscr = round(m_nocf / monthly_emi, 2) if monthly_emi > 0 else 99.99
            
            monthly_cash_flows.append({
                "month": m_idx,
                "seasonality_factor": w,
                "gross_revenue": m_rev,
                "operating_cost": m_cost,
                "net_operating_cash_flow": m_nocf,
                "dscr": m_dscr
            })

        avg_annual_dscr = round((annual_nocf / 12.0) / monthly_emi, 2) if monthly_emi > 0 else 99.99
        min_lean_dscr = min(item["dscr"] for item in monthly_cash_flows)

        # Viability Rating
        if avg_annual_dscr >= 1.50 and min_lean_dscr >= 1.00:
            viability_grade = "HIGH_FEASIBILITY"
            viability_desc = "Safe for commercial bank credit. Substantial cash surplus across all seasons."
        elif avg_annual_dscr >= 1.20 and min_lean_dscr >= 0.85:
            viability_grade = "MODERATE_FEASIBILITY"
            viability_desc = "Meets MUDRA/PMEGP lending criteria. Suggest slight working capital reserve for lean months."
        else:
            viability_grade = "FINANCIAL_VULNERABILITY_ALERT"
            viability_desc = "High default risk during lean months. Consider tenure extension or higher promoter equity."

        return {
            "archetype_id": archetype["id"],
            "archetype_name": archetype["name"],
            "sector": archetype["sector"],
            "state": state,
            "financial_summary": {
                "capex": capex,
                "working_capital_buffer": working_capital,
                "pre_operative_expenses": pre_operative,
                "total_project_cost": total_project_cost,
                "promoter_equity": promoter_equity,
                "government_subsidy_grant": subsidy_amount,
                "bank_loan_principal": loan_amount,
                "interest_rate_pct": effective_interest_rate,
                "loan_tenure_months": loan_tenure_months,
                "monthly_emi": monthly_emi
            },
            "scheme_details": matched_scheme,
            "dscr_metrics": {
                "average_annual_dscr": avg_annual_dscr,
                "minimum_lean_month_dscr": min_lean_dscr,
                "annual_net_operating_cash_flow": round(annual_nocf, 2),
                "annual_debt_service": round(monthly_emi * 12, 2),
                "net_annual_family_surplus": round(annual_nocf - (monthly_emi * 12), 2),
                "viability_grade": viability_grade,
                "viability_description": viability_desc
            },
            "monthly_cash_flows": monthly_cash_flows
        }

    @classmethod
    def _match_optimal_scheme(
        cls,
        archetype_id: str,
        sector: str,
        total_project_cost: float,
        promoter_category: str,
        location_type: str
    ) -> Dict[str, Any]:
        """Deterministic rule tree matching the highest financial advantage for the rural entrepreneur."""
        is_rural = (location_type.lower() == "rural")
        is_special = (promoter_category.lower() in ["special", "sc", "st", "obc", "women", "ph", "minority"])

        # 1. PM Vishwakarma (Archetype 5)
        if archetype_id == "archetype_5":
            # Concessional 5% fixed loan + ₹15k grant
            loan_req = min(total_project_cost, 100000.0)
            return {
                "scheme_name": "PM Vishwakarma (Tranche 1)",
                "ministry": "Ministry of Micro, Small and Medium Enterprises (MoMSME)",
                "type": "Interest Subvention + Digital Toolkit Grant",
                "subsidy_rate_pct": 0.0,
                "toolkit_grant": 15000.0,
                "subsidy_amount": 15000.0,
                "promoter_equity": 0.0,
                "loan_amount": loan_req,
                "effective_interest_rate": 5.0,
                "tenure_months": 18,
                "statutory_note": "Includes ₹15,000 e-RUPI toolkit voucher + 100% CGTMSE collateral-free guarantee."
            }

        # 2. National Livestock Mission / KCC (Archetype 4)
        if archetype_id == "archetype_4":
            if total_project_cost <= 200000.0:
                # KCC Animal Husbandry (Net 4% with prompt repayment)
                return {
                    "scheme_name": "Kisan Credit Card (KCC) Animal Husbandry",
                    "ministry": "Ministry of Fisheries, Animal Husbandry and Dairying",
                    "type": "Interest Subvention (3% PRI rebate)",
                    "subsidy_rate_pct": 0.0,
                    "subsidy_amount": 0.0,
                    "promoter_equity": round(total_project_cost * 0.10, 2),
                    "loan_amount": round(total_project_cost * 0.90, 2),
                    "effective_interest_rate": 4.0,
                    "tenure_months": 36,
                    "statutory_note": "7% base interest with 3% prompt repayment incentive -> 4% net effective rate."
                }
            else:
                # NLM 50% Capital Subsidy
                subsidy = min(total_project_cost * 0.50, 2500000.0)
                equity = round(total_project_cost * 0.10, 2)
                loan = round(total_project_cost - subsidy - equity, 2)
                return {
                    "scheme_name": "National Livestock Mission (NLM)",
                    "ministry": "Department of Animal Husbandry & Dairying (DAHD)",
                    "type": "Capital Subsidy (50%)",
                    "subsidy_rate_pct": 50.0,
                    "subsidy_amount": subsidy,
                    "promoter_equity": equity,
                    "loan_amount": loan,
                    "effective_interest_rate": 9.5,
                    "tenure_months": 60,
                    "statutory_note": "50% direct capital subsidy credited to Bank Subsidy Reserve Fund."
                }

        # 3. PMEGP (Manufacturing / Processing / Services - Archetypes 1, 3, 6)
        if archetype_id in ["archetype_1", "archetype_3", "archetype_6"]:
            # Rural Special: 35% subsidy, 5% own contribution
            # Rural General: 25% subsidy, 10% own contribution
            if is_rural and is_special:
                sub_rate = 0.35
                own_rate = 0.05
            elif is_rural and not is_special:
                sub_rate = 0.25
                own_rate = 0.10
            elif not is_rural and is_special:
                sub_rate = 0.25
                own_rate = 0.05
            else:
                sub_rate = 0.15
                own_rate = 0.10

            subsidy = round(total_project_cost * sub_rate, 2)
            equity = round(total_project_cost * own_rate, 2)
            loan = round(total_project_cost - subsidy - equity, 2)

            return {
                "scheme_name": "Prime Minister's Employment Generation Programme (PMEGP)",
                "ministry": "Ministry of MSME / KVIC",
                "type": "Margin Money Capital Subsidy",
                "subsidy_rate_pct": round(sub_rate * 100, 1),
                "subsidy_amount": subsidy,
                "promoter_equity": equity,
                "loan_amount": loan,
                "effective_interest_rate": 9.5,
                "tenure_months": 60,
                "statutory_note": f"PMEGP {int(sub_rate*100)}% Margin Money Grant for {location_type.capitalize()} {promoter_category.capitalize()} category."
            }

        # 4. Rural Retail & Trading (Archetype 2) - PMMY MUDRA
        if total_project_cost <= 50000.0:
            scheme_name = "PMMY MUDRA (Shishu)"
            loan = total_project_cost
            equity = 0.0
        elif total_project_cost <= 500000.0:
            scheme_name = "PMMY MUDRA (Kishor)"
            equity = round(total_project_cost * 0.15, 2)
            loan = round(total_project_cost * 0.85, 2)
        else:
            scheme_name = "PMMY MUDRA (Tarun)"
            equity = round(total_project_cost * 0.15, 2)
            loan = round(total_project_cost * 0.85, 2)

        return {
            "scheme_name": scheme_name,
            "ministry": "Department of Financial Services, Ministry of Finance",
            "type": "Collateral-Free Institutional Term Loan / Cash Credit",
            "subsidy_rate_pct": 0.0,
            "subsidy_amount": 0.0,
            "promoter_equity": equity,
            "loan_amount": loan,
            "effective_interest_rate": 9.5,
            "tenure_months": 36,
            "statutory_note": "100% collateral-free credit backed by Credit Guarantee Fund for Micro Units (CGFMU)."
        }


# ==============================================================================
# 3. MODE B: FINANCIAL RESTRUCTURING & INFORMAL DEBT RELIEF ENGINE
# ==============================================================================

class RestructuringEngine:
    """Algorithmic refinancing and consolidation of predatory informal moneylender debt into formal credit."""

    @staticmethod
    def parse_vernacular_quote(quote_str: str) -> float:
        """Parses dialectal quotes like '3 senkda', '5 per 100', '36%' into annual simple APR."""
        clean = quote_str.strip().lower()
        if "senkda" in clean or "saikda" in clean or "per 100" in clean or "/100" in clean:
            # Extract number
            nums = [float(s) for s in clean.split() if s.replace('.', '', 1).isdigit()]
            if nums:
                monthly_rate = nums[0]
                return round(monthly_rate * 12.0, 2)
        if "%" in clean:
            val = float(clean.replace('%', '').strip())
            # If <= 10, typically user means monthly rate (e.g. 3% / month)
            if val <= 10.0 and ("mo" in clean or "month" in clean or "mahina" in clean):
                return round(val * 12.0, 2)
            return round(val, 2)
        try:
            val = float(clean)
            if val <= 10.0:  # User entered monthly percent
                return round(val * 12.0, 2)
            return round(val, 2)
        except ValueError:
            return 36.0  # Safe default: standard rural moneylender rate (3 senkda)

    @classmethod
    def evaluate_portfolio(
        cls,
        debts: List[Dict[str, Any]],
        household_monthly_income: float = 35000.0,
        refinancing_pathway: str = "MUDRA_KISHOR", # "MUDRA_KISHOR", "KCC", "DAY_NRLM_SHG", "PM_VISHWAKARMA"
        refinance_tenure_months: int = 36
    ) -> Dict[str, Any]:
        """
        Analyzes a portfolio of informal and formal debts, computes the monthly interest bleed,
        structures an institutional consolidation package, and calculates cash flow liberation metrics.
        """
        if not debts:
            raise ValueError("Debt portfolio cannot be empty.")

        total_principal = 0.0
        total_monthly_interest_bleed = 0.0
        weighted_apr_accumulator = 0.0
        audited_debts = []

        for d in debts:
            p = float(d.get("principal", 0.0))
            raw_rate = str(d.get("rate_quote", "3 senkda"))
            apr = cls.parse_vernacular_quote(raw_rate)
            lender_type = d.get("lender_type", "Village Moneylender")
            pledged_collateral = d.get("collateral", "None")
            months_active = int(d.get("months_active", 12))

            monthly_interest = round(p * ((apr / 100.0) / 12.0), 2)
            total_interest_paid_to_date = round(monthly_interest * months_active, 2)

            # Legal Damdupat check: Has borrower already paid more than 100% of principal in interest?
            damdupat_triggered = total_interest_paid_to_date >= p

            audited_debts.append({
                "lender_type": lender_type,
                "principal": p,
                "raw_quote": raw_rate,
                "annual_apr_pct": apr,
                "monthly_interest_bleed": monthly_interest,
                "months_active": months_active,
                "total_interest_paid_to_date": total_interest_paid_to_date,
                "pledged_collateral": pledged_collateral,
                "damdupat_violation": damdupat_triggered
            })

            total_principal += p
            total_monthly_interest_bleed += monthly_interest
            weighted_apr_accumulator += (p * apr)

        weighted_apr = round(weighted_apr_accumulator / total_principal, 2) if total_principal > 0 else 0.0

        # Refinancing Parameter Setup
        refinance_profiles = {
            "MUDRA_KISHOR": {"name": "PMMY MUDRA (Kishor / Tarun)", "rate": 9.5, "max_limit": 1000000.0},
            "KCC": {"name": "KCC Allied Agriculture / Livestock", "rate": 4.0, "max_limit": 200000.0},
            "DAY_NRLM_SHG": {"name": "DAY-NRLM / SHG Bank Linkage", "rate": 7.0, "max_limit": 250000.0},
            "PM_VISHWAKARMA": {"name": "PM Vishwakarma Concessional Credit", "rate": 5.0, "max_limit": 200000.0}
        }

        selected_profile = refinance_profiles.get(refinancing_pathway, refinance_profiles["MUDRA_KISHOR"])
        formal_rate = selected_profile["rate"]
        
        # Calculate new formal amortizing EMI
        formal_monthly_emi = IncubationEngine.calculate_emi(total_principal, formal_rate, refinance_tenure_months)
        total_formal_repayment = round(formal_monthly_emi * refinance_tenure_months, 2)
        total_formal_interest = round(total_formal_repayment - total_principal, 2)

        # Baseline Status Quo: If kept at informal rate for same tenure (interest only + lump sum principal)
        informal_total_interest_over_tenure = round(total_monthly_interest_bleed * refinance_tenure_months, 2)
        informal_total_outflow = round(informal_total_interest_over_tenure + total_principal, 2)

        # Cash Flow Liberation Metrics
        monthly_cash_relief = round(total_monthly_interest_bleed - formal_monthly_emi, 2)
        total_interest_saved = round(informal_total_interest_over_tenure - total_formal_interest, 2)
        
        cflr_pct = round((monthly_cash_relief / household_monthly_income) * 100, 1) if household_monthly_income > 0 else 0.0
        debt_to_income_before = round((total_monthly_interest_bleed / household_monthly_income) * 100, 1) if household_monthly_income > 0 else 0.0
        debt_to_income_after = round((formal_monthly_emi / household_monthly_income) * 100, 1) if household_monthly_income > 0 else 0.0

        return {
            "total_debt_consolidated": total_principal,
            "weighted_informal_apr_pct": weighted_apr,
            "current_monthly_interest_bleed": total_monthly_interest_bleed,
            "audited_debts": audited_debts,
            "refinancing_plan": {
                "pathway_code": refinancing_pathway,
                "pathway_name": selected_profile["name"],
                "formal_interest_rate_pct": formal_rate,
                "tenure_months": refinance_tenure_months,
                "new_monthly_amortizing_emi": formal_monthly_emi,
                "total_repayment_over_tenure": total_formal_repayment,
                "total_formal_interest": total_formal_interest
            },
            "liberation_metrics": {
                "monthly_cash_flow_relief": monthly_cash_relief,
                "cumulative_interest_saved": total_interest_saved,
                "cash_flow_liberation_ratio_pct": cflr_pct,
                "debt_service_to_income_before_pct": debt_to_income_before,
                "debt_service_to_income_after_pct": debt_to_income_after,
                "household_monthly_income": household_monthly_income
            },
            "legal_remedy_summary": {
                "damdupat_eligible_debts_count": sum(1 for d in audited_debts if d["damdupat_violation"]),
                "governing_acts": [
                    "The Usurious Loans Act, 1918 (Judicial Reopening of Unfair Contracts)",
                    "State Money-Lenders Act (Mandatory Registration & Interest Caps 12-18% simple)",
                    "Rule of Damdupat (Total interest collected cannot exceed initial principal)"
                ],
                "settlement_guidance": "Disburse bank refinancing directly to lenders in exchange for written No-Dues Certificates and immediate return of all pledged security."
            }
        }

