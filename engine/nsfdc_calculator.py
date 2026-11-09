"""
NSFDC Dual-Tier Credit Financing & Statutory Amortization Engine
Statutory Mandate: Ministry of Social Justice and Empowerment (MoSJE) / NSFDC (SIH26091)
Zero-Hallucination Algorithmic Module for Scheduled Caste (SC) Micro-Entrepreneurs

Schemes Implemented:
1. Micro Credit Finance (MCF / Mahila Samriddhi Yojana - MSY):
   - Project Cost: Up to ₹1,40,000
   - Loan Share: Up to 90%, strictly capped at ₹1,25,000 (Equity is ₹15,000 at ₹1.40L, NOT 10%)
   - Interest Rate: 6.5% p.a.
   - Amortization: 3 years (12 quarters) with 3-month (1 quarter) moratorium -> 11 quarterly instalments
2. Term Loan Scheme:
   - Project Cost: Above ₹1,40,000 up to ₹50,00,000
   - Loan Share: Up to 90%, strictly capped at ₹45,00,000 (Beneficiary equity: min 10%)
   - Interest Rate: 8.0% p.a.
   - Amortization: 7 years (28 quarters) with 6-month (2 quarters) moratorium -> 26 quarterly instalments
"""

from dataclasses import dataclass, field
from enum import Enum
import math
from typing import Dict, List, Optional, Any


class NSFDCTier(str, Enum):
    MICRO_CREDIT_FINANCE = "MCF"
    TERM_LOAN = "TERM_LOAN"


@dataclass
class BeneficiaryProfile:
    """Beneficiary attributes for statutory eligibility and credit structuring."""
    is_sc: bool = True
    caste_category: str = "SC"
    annual_family_income: float = 0.0
    project_cost: float = 0.0
    promoter_equity_offered: Optional[float] = None
    domain_code: Optional[str] = None
    state: Optional[str] = None
    has_pmegp_past_5_yrs: bool = False


@dataclass
class EligibilityResult:
    """Outcome of statutory eligibility checks under MoSJE/NSFDC guidelines."""
    is_eligible: bool
    rejection_reasons: List[str] = field(default_factory=list)
    recommended_alternatives: List[str] = field(default_factory=list)
    applicable_tier: Optional[NSFDCTier] = None


@dataclass
class QuarterSchedule:
    """Amortization record for a single quarter."""
    quarter: int
    is_moratorium: bool
    opening_balance: float
    interest_payment: float
    principal_payment: float
    total_installment: float
    closing_balance: float


@dataclass
class LoanStructure:
    """Statutory loan structuring under NSFDC scheme guidelines."""
    tier: NSFDCTier
    scheme_name: str
    project_cost: float
    loan_amount: float
    promoter_equity: float
    promoter_equity_pct: float
    interest_rate_pa: float
    quarterly_interest_rate: float
    tenure_years: int
    total_quarters: int
    moratorium_quarters: int
    repayment_quarters: int


@dataclass
class AmortizationSchedule:
    """Full quarterly repayment schedule over loan lifecycle."""
    structure: LoanStructure
    quarters: List[QuarterSchedule]
    equated_quarterly_installment: float
    total_principal_paid: float
    total_interest_paid: float
    total_debt_service: float


class NSFDCCalculator:
    """
    Deterministic Financial Calculator for MoSJE / NSFDC dual-tier credit schemes.
    Strictly follows statutory rules from official guidelines (sih26091).
    """

    # Statutory Constants (effective 07 January 2026 / MoSJE NSFDC)
    INCOME_CEILING_INR: float = 500000.0  # ₹5.00 Lakh family income ceiling
    MAX_PROJECT_COST_INR: float = 5000000.0  # ₹50.00 Lakh upper boundary

    # Tier 1: Micro Credit Finance (MCF / MSY)
    MCF_COST_CAP_INR: float = 140000.0  # ₹1.40 Lakh
    MCF_LOAN_CAP_INR: float = 125000.0  # ₹1.25 Lakh
    MCF_INTEREST_RATE_PA: float = 6.5  # 6.5% p.a.
    MCF_TENURE_YEARS: int = 3  # 3 years (12 quarters)
    MCF_MORATORIUM_QUARTERS: int = 1  # 3-month moratorium (1 quarter)

    # Tier 2: Term Loan Scheme
    TERM_LOAN_LOAN_CAP_INR: float = 4500000.0  # ₹45.00 Lakh (90% of ₹50.00L)
    TERM_LOAN_INTEREST_RATE_PA: float = 8.0  # 8.0% p.a.
    TERM_LOAN_TENURE_YEARS: int = 7  # 7 years (28 quarters)
    TERM_LOAN_MORATORIUM_QUARTERS: int = 2  # 6-month moratorium (2 quarters)

    # General rules
    MAX_LOAN_SHARE_PCT: float = 0.90
    MIN_PROMOTER_EQUITY_PCT: float = 0.10

    # PM Vishwakarma Eligible Artisan Domains
    VISHWAKARMA_DOMAINS: Dict[str, str] = {
        "D18": "Tailor (Darzi) - Trade 17",
        "D19": "Carpenter (Suthar) - Trade 1",
        "D20": "Blacksmith (Lohar) - Trade 3",
        "D21": "Potter (Kumhar) - Trade 5"
    }

    @staticmethod
    def format_inr(amount: float) -> str:
        """Format an amount into Indian numbering representation (e.g. ₹5,00,000)."""
        rounded = int(round(amount))
        s = str(abs(rounded))
        if len(s) <= 3:
            res = s
        else:
            last3 = s[-3:]
            remaining = s[:-3]
            groups = []
            while len(remaining) > 2:
                groups.insert(0, remaining[-2:])
                remaining = remaining[:-2]
            if remaining:
                groups.insert(0, remaining)
            groups.append(last3)
            res = ",".join(groups)
        return f"-₹{res}" if amount < 0 else f"₹{res}"

    def check_eligibility(self, profile: BeneficiaryProfile) -> EligibilityResult:
        """
        Evaluate statutory eligibility against MoSJE / NSFDC mandate.
        Enforces caste certificate requirement, income ceiling, and project size boundaries.
        """
        rejection_reasons: List[str] = []
        alternatives: List[str] = []

        # 1. Caste community gate
        is_sc_member = profile.is_sc
        if profile.caste_category and profile.caste_category.strip().upper() not in ["SC", "SCHEDULED CASTE"]:
            is_sc_member = False

        if not is_sc_member:
            rejection_reasons.append(
                "Beneficiary must belong to Scheduled Caste (SC) community with valid caste certificate under MoSJE / NSFDC mandate."
            )
            alternatives.extend([
                "Pradhan Mantri Mudra Yojana (PMMY) - Shishu/Kishore/Tarun for non-SC micro-enterprises.",
                "PMEGP (Prime Minister Employment Generation Programme) - 15% to 35% margin money subsidy.",
                "PM SVANidhi for urban/peri-urban micro-vendors."
            ])

        # 2. Family income gate (ceiling: ₹5,00,000 / year)
        if profile.annual_family_income < 0:
            rejection_reasons.append("Annual family income cannot be negative.")
        elif profile.annual_family_income > self.INCOME_CEILING_INR:
            formatted_inc = self.format_inr(profile.annual_family_income)
            formatted_ceil = self.format_inr(self.INCOME_CEILING_INR)
            rejection_reasons.append(
                f"Annual family income ({formatted_inc}) exceeds statutory NSFDC ceiling of {formatted_ceil} (effective 07 Jan 2026)."
            )
            alternatives.extend([
                "PMEGP - No upper income ceiling for eligible individuals.",
                "PMMY (Mudra Scheme) - Commercial bank credit up to ₹10 Lakh without income ceiling.",
                "Commercial Bank MSME Loan / Stand-Up India."
            ])

        # 3. Project cost bounds
        if profile.project_cost <= 0:
            rejection_reasons.append("Project cost must be greater than ₹0.")
        elif profile.project_cost > self.MAX_PROJECT_COST_INR:
            formatted_cost = self.format_inr(profile.project_cost)
            formatted_max = self.format_inr(self.MAX_PROJECT_COST_INR)
            rejection_reasons.append(
                f"Project cost ({formatted_cost}) exceeds maximum NSFDC scheme limit of {formatted_max}."
            )
            alternatives.append("NABARD / SIDBI MSME Term Loan or Stand-Up India Scheme (₹10L–₹100L).")

        is_eligible = len(rejection_reasons) == 0
        applicable_tier = None
        if is_eligible:
            if profile.project_cost <= self.MCF_COST_CAP_INR:
                applicable_tier = NSFDCTier.MICRO_CREDIT_FINANCE
            else:
                applicable_tier = NSFDCTier.TERM_LOAN

        # Deduplicate alternatives
        dedup_alternatives = list(dict.fromkeys(alternatives))

        return EligibilityResult(
            is_eligible=is_eligible,
            rejection_reasons=rejection_reasons,
            recommended_alternatives=dedup_alternatives,
            applicable_tier=applicable_tier
        )

    def calculate_loan_structure(self, profile: BeneficiaryProfile) -> LoanStructure:
        """
        Structure loan and promoter equity strictly following NSFDC dual-tier rules:
        - At ₹1,40,000 project cost, loan is capped at ₹1,25,000 and equity is ₹15,000 (10.71%).
        - Above ₹1,40,000, 90% loan up to ₹45.00 Lakh at 8.0% p.a.
        """
        cost = round(float(profile.project_cost), 2)
        if cost <= 0:
            raise ValueError("Project cost must be greater than zero.")
        if cost > self.MAX_PROJECT_COST_INR:
            raise ValueError(f"Project cost ₹{cost:,.2f} exceeds NSFDC limit of ₹{self.MAX_PROJECT_COST_INR:,.2f}.")

        if cost <= self.MCF_COST_CAP_INR:
            # Tier 1: Micro Credit Finance (MCF / MSY)
            tier = NSFDCTier.MICRO_CREDIT_FINANCE
            scheme_name = "NSFDC Micro Credit Finance (MCF / Mahila Samriddhi Yojana)"
            rate_pa = self.MCF_INTEREST_RATE_PA
            tenure_years = self.MCF_TENURE_YEARS
            moratorium_quarters = self.MCF_MORATORIUM_QUARTERS
            total_quarters = tenure_years * 4  # 12 quarters
            repayment_quarters = total_quarters - moratorium_quarters  # 11 quarters

            # Statutory 90% rule capped at ₹1,25,000
            max_loan = min(round(cost * self.MAX_LOAN_SHARE_PCT, 2), self.MCF_LOAN_CAP_INR)

            if profile.promoter_equity_offered is not None:
                user_equity = round(float(profile.promoter_equity_offered), 2)
                min_required_equity = round(cost - max_loan, 2)
                equity = max(user_equity, min_required_equity)
                if equity >= cost:
                    equity = cost
                    loan = 0.0
                else:
                    loan = round(cost - equity, 2)
            else:
                loan = max_loan
                equity = round(cost - loan, 2)

        else:
            # Tier 2: Term Loan Scheme
            tier = NSFDCTier.TERM_LOAN
            scheme_name = "NSFDC Term Loan Scheme"
            rate_pa = self.TERM_LOAN_INTEREST_RATE_PA
            tenure_years = self.TERM_LOAN_TENURE_YEARS
            moratorium_quarters = self.TERM_LOAN_MORATORIUM_QUARTERS
            total_quarters = tenure_years * 4  # 28 quarters
            repayment_quarters = total_quarters - moratorium_quarters  # 26 quarters

            # Statutory 90% rule capped at ₹45.00 Lakh
            max_loan = min(round(cost * self.MAX_LOAN_SHARE_PCT, 2), self.TERM_LOAN_LOAN_CAP_INR)

            if profile.promoter_equity_offered is not None:
                user_equity = round(float(profile.promoter_equity_offered), 2)
                min_required_equity = round(cost - max_loan, 2)
                equity = max(user_equity, min_required_equity)
                if equity >= cost:
                    equity = cost
                    loan = 0.0
                else:
                    loan = round(cost - equity, 2)
            else:
                loan = max_loan
                equity = round(cost - loan, 2)

        equity_pct = round((equity / cost) * 100.0, 2)
        quarterly_rate = rate_pa / 400.0  # (rate_pa / 100) / 4

        return LoanStructure(
            tier=tier,
            scheme_name=scheme_name,
            project_cost=cost,
            loan_amount=loan,
            promoter_equity=equity,
            promoter_equity_pct=equity_pct,
            interest_rate_pa=rate_pa,
            quarterly_interest_rate=quarterly_rate,
            tenure_years=tenure_years,
            total_quarters=total_quarters,
            moratorium_quarters=moratorium_quarters,
            repayment_quarters=repayment_quarters
        )

    def generate_amortization_schedule(self, structure: LoanStructure) -> AmortizationSchedule:
        """
        Generate quarterly amortization table:
        - Moratorium quarters: Interest-only payment (principal amort = 0).
        - Repayment quarters: Equated Quarterly Instalment (EQI).
        - Final quarter: Clean zero-balance reconciliation.
        """
        P = structure.loan_amount
        r = structure.quarterly_interest_rate
        n = structure.repayment_quarters

        # Equated Quarterly Instalment (EQI) formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
        if P > 0 and r > 0 and n > 0:
            factor = math.pow(1.0 + r, n)
            eqi = round(P * (r * factor) / (factor - 1.0), 2)
        else:
            eqi = 0.0

        quarters_list: List[QuarterSchedule] = []
        balance = P
        total_interest = 0.0
        total_principal = 0.0

        for q in range(1, structure.total_quarters + 1):
            opening = balance

            if q <= structure.moratorium_quarters:
                # Statutory moratorium period: Interest serviced, principal deferred
                is_mora = True
                interest = round(opening * r, 2)
                principal = 0.0
                closing = opening
                installment = interest
            else:
                # Repayment period
                is_mora = False
                interest = round(opening * r, 2)

                if q == structure.total_quarters:
                    # Final quarter: Exact balance payoff to prevent cent rounding drift
                    principal = opening
                    closing = 0.0
                    installment = round(principal + interest, 2)
                else:
                    principal = round(eqi - interest, 2)
                    # Protect against negative principal or overpayment
                    if principal > opening:
                        principal = opening
                    closing = round(opening - principal, 2)
                    installment = round(principal + interest, 2)

            total_interest += interest
            total_principal += principal
            balance = closing

            quarters_list.append(QuarterSchedule(
                quarter=q,
                is_moratorium=is_mora,
                opening_balance=opening,
                interest_payment=interest,
                principal_payment=principal,
                total_installment=installment,
                closing_balance=closing
            ))

        total_debt_service = round(total_principal + total_interest, 2)

        return AmortizationSchedule(
            structure=structure,
            quarters=quarters_list,
            equated_quarterly_installment=eqi,
            total_principal_paid=round(total_principal, 2),
            total_interest_paid=round(total_interest, 2),
            total_debt_service=total_debt_service
        )

    def evaluate_dscr_stress(
        self,
        schedule: AmortizationSchedule,
        quarterly_cash_flows: List[float],
        benchmark_dscr: float = 1.25
    ) -> Dict[str, Any]:
        """
        Evaluate seasonal Debt Service Coverage Ratio (DSCR) for each quarter.
        Flags lean periods where DSCR falls below statutory bankability benchmark (1.25x).
        """
        quarterly_metrics: List[Dict[str, Any]] = []
        sub_benchmark_quarters: List[int] = []

        total_flow = 0.0
        total_service = 0.0

        # Evaluate the quarters provided (or all quarters if cash flows matches/exceeds)
        eval_count = len(quarterly_cash_flows) if quarterly_cash_flows else len(schedule.quarters)
        eval_count = min(eval_count, len(schedule.quarters))

        for i in range(eval_count):
            q_sched = schedule.quarters[i]
            flow = quarterly_cash_flows[i] if (quarterly_cash_flows and i < len(quarterly_cash_flows)) else 0.0

            debt_service = q_sched.total_installment
            dscr = round(flow / debt_service, 2) if debt_service > 0 else 999.0
            is_sub = dscr < benchmark_dscr

            if is_sub:
                sub_benchmark_quarters.append(q_sched.quarter)

            total_flow += flow
            total_service += debt_service

            quarterly_metrics.append({
                "quarter": q_sched.quarter,
                "cash_flow": flow,
                "debt_service": debt_service,
                "dscr": dscr,
                "is_sub_benchmark": is_sub,
                "is_moratorium": q_sched.is_moratorium
            })

        avg_dscr = round(total_flow / total_service, 2) if total_service > 0 else 999.0

        return {
            "quarterly_metrics": quarterly_metrics,
            "average_dscr": avg_dscr,
            "benchmark_dscr": benchmark_dscr,
            "sub_benchmark_quarters": sub_benchmark_quarters,
            "has_stress_warning": len(sub_benchmark_quarters) > 0,
            "risk_assessment": "HIGH_STRESS" if len(sub_benchmark_quarters) >= 2 else (
                "MODERATE_SEASONAL_DIP" if len(sub_benchmark_quarters) == 1 else "BANKABLE_SOLVENT"
            )
        }

    def check_artisan_scheme_fit(self, domain_code: str, has_pmegp_past_5_yrs: bool = False) -> Dict[str, Any]:
        """
        Check PM Vishwakarma fit for traditional artisan trades (D18, D19, D20, D21).
        Enforces statutory rule: Blocked if PMEGP availed in past 5 years.
        """
        code = domain_code.strip().upper()
        if code in self.VISHWAKARMA_DOMAINS:
            trade_desc = self.VISHWAKARMA_DOMAINS[code]
            if has_pmegp_past_5_yrs:
                return {
                    "is_pm_vishwakarma_eligible": False,
                    "trade_description": trade_desc,
                    "exclusion_reason": "Statutory exclusion: Beneficiary or family member availed PMEGP credit/subsidy within the past 5 years.",
                    "toolkit_voucher": 0.0,
                    "concessional_rate": 0.0
                }
            return {
                "is_pm_vishwakarma_eligible": True,
                "trade_description": trade_desc,
                "exclusion_reason": None,
                "toolkit_voucher": 15000.0,  # ₹15,000 modern toolkit e-voucher
                "training_stipend_per_day": 500.0,  # ₹500/day during basic 5-7 day training
                "concessional_rate": 5.0,  # 5.0% concessional interest rate
                "tranche_1_limit": 100000.0,  # ₹1,00,000 for 18 months
                "tranche_2_limit": 200000.0  # ₹2,00,000 for 30 months
            }

        return {
            "is_pm_vishwakarma_eligible": False,
            "trade_description": "Not covered under PM Vishwakarma 18 artisan trade list.",
            "exclusion_reason": "Domain is outside designated traditional artisan trades.",
            "toolkit_voucher": 0.0,
            "concessional_rate": 0.0
        }

    def generate_dpr_financial_summary(
        self,
        profile: BeneficiaryProfile,
        quarterly_cash_flows: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Produce a complete, audit-ready financial summary for Detailed Project Report (DPR).
        """
        eligibility = self.check_eligibility(profile)
        if not eligibility.is_eligible:
            return {
                "is_eligible": False,
                "eligibility_details": eligibility,
                "loan_structure": None,
                "amortization_schedule": None,
                "dscr_analysis": None
            }

        structure = self.calculate_loan_structure(profile)
        schedule = self.generate_amortization_schedule(structure)

        dscr_analysis = None
        if quarterly_cash_flows:
            dscr_analysis = self.evaluate_dscr_stress(schedule, quarterly_cash_flows)

        artisan_fit = None
        if profile.domain_code:
            artisan_fit = self.check_artisan_scheme_fit(
                profile.domain_code,
                has_pmegp_past_5_yrs=profile.has_pmegp_past_5_yrs
            )

        return {
            "is_eligible": True,
            "statutory_mandate": "MoSJE / NSFDC (SIH26091)",
            "eligibility_details": eligibility,
            "loan_structure": {
                "tier": structure.tier.value,
                "scheme_name": structure.scheme_name,
                "project_cost": structure.project_cost,
                "loan_amount": structure.loan_amount,
                "promoter_equity": structure.promoter_equity,
                "promoter_equity_pct": structure.promoter_equity_pct,
                "interest_rate_pa": structure.interest_rate_pa,
                "tenure_years": structure.tenure_years,
                "total_quarters": structure.total_quarters,
                "moratorium_quarters": structure.moratorium_quarters,
                "repayment_quarters": structure.repayment_quarters
            },
            "repayment_summary": {
                "equated_quarterly_installment": schedule.equated_quarterly_installment,
                "moratorium_interest_per_quarter": schedule.quarters[0].interest_payment,
                "total_principal_paid": schedule.total_principal_paid,
                "total_interest_paid": schedule.total_interest_paid,
                "total_debt_service": schedule.total_debt_service
            },
            "quarterly_schedule": [
                {
                    "quarter": q.quarter,
                    "is_moratorium": q.is_moratorium,
                    "opening_balance": q.opening_balance,
                    "interest_payment": q.interest_payment,
                    "principal_payment": q.principal_payment,
                    "total_installment": q.total_installment,
                    "closing_balance": q.closing_balance
                }
                for q in schedule.quarters
            ],
            "dscr_analysis": dscr_analysis,
            "artisan_scheme_fit": artisan_fit
        }
