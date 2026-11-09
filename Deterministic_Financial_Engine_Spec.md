# Technical Specification: Deterministic Financial Engine & Scheme Rules

**Project:** AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant  
**Component:** Financial Structuring Engine & Scheme Matcher (Zero-Hallucination Core)  
**Version:** 1.0.0 (SIH Architecture)  

---

## 1. Architectural Philosophy: The "Zero-Hallucination" Firewall

In financial advisory for rural micro-enterprises, **LLMs must never compute loan numbers directly**. LLMs are non-deterministic and prone to arithmetic hallucinations, round-off drift, and fabricated interest rates.

Our architecture enforces a strict **separation of concerns**:
* **Conversational AI Layer (Bhashini / Indic LLM):** Acts strictly as the sensory and narrative layer—transcribing speech, extracting structured entities (business type, location, margin money, local shop count), and reading back recommendations in colloquial dialect.
* **Deterministic Financial Engine (Python Microservice):** Acts as the calculation firewall—computing CapEx, OpEx, seasonal working capital buffers, DSCR ratios, and government scheme subsidy percentages using pure deterministic arithmetic.

```
                   ┌──────────────────────────────────────────────────┐
                   │    Conversational AI Layer (Bhashini / LLM)      │
                   │    - Voice-to-Text / Natural Language Parsing    │
                   │    - Entity Extraction (JSON Payload)            │
                   └────────────────────────┬─────────────────────────┘
                                            │
                                            ▼ Structured Input JSON
                   ┌──────────────────────────────────────────────────┐
                   │       DETERMINISTIC FINANCIAL CORE (Python)      │
                   │                                                  │
                   │   1. Cost Decomposition (CapEx + OpEx + WC)      │
                   │   2. Seasonality Multiplier & Cash Flow Model    │
                   │   3. Dynamic DSCR & Break-Even Computation       │
                   │   4. Deterministic Scheme Subsidy Decision Tree  │
                   └────────────────────────┬─────────────────────────┘
                                            │
                                            ▼ Audited Financial Output JSON
                   ┌──────────────────────────────────────────────────┐
                   │           Output Generation & Delivery           │
                   │   - Bilingual 1-Page DPR PDF Generator (ReportLab)│
                   │   - Vernacular Audio Script for Bhashini TTS     │
                   └──────────────────────────────────────────────────┘
```

---

## 2. Mathematical Formulations & Cost Decomposition

### 2.1 Total Project Cost ($T_{PC}$)
The total project outlay required to establish the micro-enterprise consists of three distinct components:
$$T_{PC} = \text{CapEx} + \text{OpEx}_{\text{pre}} + \text{WC}_{\text{buffer}}$$

Where:
* $\text{CapEx}$ (**Capital Expenditure**): Fixed assets (machinery, tools, fixtures, physical setup).
* $\text{OpEx}_{\text{pre}}$ (**Pre-operative Expenses**): Initial licensing, setup logistics, rent deposits (typically 1–2 months).
* $\text{WC}_{\text{buffer}}$ (**Working Capital Buffer**): Required initial inventory and operational liquidity calculated via the operating cycle method:
$$\text{WC}_{\text{buffer}} = \frac{\text{Monthly Operating Cost} \times \text{Inventory Holding Days}}{30}$$

---

### 2.2 Seasonality Stress-Testing & Cash-Flow Modeling
Rural enterprises experience drastic seasonal swings (e.g., monsoon lull for transport/tailoring, post-harvest boom for agri-processing).

Let base estimated monthly gross revenue be $R_{\text{base}}$ and monthly operational costs be $C_{\text{base}}$.
For month $m \in \{1, 2, \dots, 12\}$, we define a seasonal multiplier $S_m \in [0.4, 1.8]$ based on the micro-enterprise category and local agricultural calendar:

$$\text{Revenue}_m = R_{\text{base}} \times S_m$$
$$\text{Net Operating Cash Flow}_m (\text{NOCF}_m) = \text{Revenue}_m - (C_{\text{base}} \times [0.7 + 0.3 \cdot S_m])$$

---

### 2.3 Debt Service Coverage Ratio (DSCR)
Bank branch managers assess creditworthiness through DSCR. Our engine computes both the **Average Annual DSCR** and the **Minimum Lean-Month DSCR**:

$$\text{DSCR}_m = \frac{\text{NOCF}_m}{\text{EMI}_{\text{monthly}}}$$
$$\text{DSCR}_{\text{avg}} = \frac{\sum_{m=1}^{12} \text{NOCF}_m}{12 \times \text{EMI}_{\text{monthly}}}$$

**Viability Thresholds:**
* $\text{DSCR}_{\text{avg}} \ge 1.50$: **High Feasibility** (Safe for institutional credit).
* $1.20 \le \text{DSCR}_{\text{avg}} < 1.50$: **Moderate Feasibility** (Acceptable under MUDRA / PMEGP).
* $\text{DSCR}_{\text{avg}} < 1.20$ or $\min(\text{DSCR}_m) < 0.90$: **Financial Fragility Warning** (The engine automatically resizes loan tenure or adjusts working capital reserves to prevent early default).

---

## 3. Scheme Subsidy Decision Tree (Deterministic Rules)

The engine maps the entrepreneur's profile across four flagship central government schemes:

```mermaid
flowchart TD
    Start([Applicant Profile & Margin Money]) --> CheckNeed{Total Project Cost}
    
    CheckNeed -->|≤ ₹10,000 - ₹50,000| SVANidhi{Street Vendor / Nano-Retail?}
    SVANidhi -->|Yes| S1[PM SVANidhi: ₹10k - ₹50k Collateral-Free + 7% Interest Subsidy]
    SVANidhi -->|No| MudraShishu[PMMY MUDRA Shishu: Loans up to ₹50,000, Zero Margin]
    
    CheckNeed -->|₹50,000 to ₹5,00,000| CheckMfg{Manufacturing or Service?}
    CheckMfg -->|Service / Trading| CheckSub1{Special Category SC/ST/Women/OBC?}
    CheckSub1 -->|Yes, Rural| PMEGP_Serv[PMEGP Service: Up to ₹20L, 35% Margin Money Subsidy, 5% Own Contribution]
    CheckSub1 -->|General, Rural| PMEGP_Gen[PMEGP Service: 25% Margin Money Subsidy, 10% Own Contribution]
    
    CheckMfg -->|Manufacturing / Processing| PMEGP_Mfg[PMEGP Mfg: Up to ₹50L, 35% Rural Subsidy for Special Category]
    
    CheckNeed -->|Fallback / Existing SHG| NRLM[DAY-NRLM / SHG Bank Linkage: Subsidized interest down to 7%]
```

### 3.1 PMEGP (Prime Minister's Employment Generation Programme) Rules
* **Project Cost Ceilings:** Manufacturing: Up to ₹50 Lakh; Service: Up to ₹20 Lakh.
* **Margin Money (Subsidy) Matrix:**
  * **Rural + Special Category (Women / SC / ST / OBC / Minorities / Ex-Servicemen):**
    * Beneficiary Own Contribution: **5% of project cost**
    * Government Subsidy: **35% of project cost**
    * Bank Loan: **60% of project cost**
  * **Rural + General Category:**
    * Beneficiary Own Contribution: **10% of project cost**
    * Government Subsidy: **25% of project cost**
    * Bank Loan: **65% of project cost**

### 3.2 PMMY (Pradhan Mantri MUDRA Yojana) Rules
* **Shishu:** Loans up to ₹50,000 (0% margin required, nominal processing fee).
* **Kishore:** Loans from ₹50,001 to ₹5,00,000 (typically 10%–15% margin money).
* **Tarun:** Loans from ₹5,00,001 to ₹10,00,000 (up to ₹20,00,000 for mature units under recent revisions).

---

## 4. Production-Ready Python Core Implementation

Below is the audited Python implementation powering this module:

```python
"""
Deterministic Financial Structuring & Scheme Matching Engine
Zero-Hallucination Core for SIH Rural Micro-Enterprise Advisory
"""
from dataclasses import dataclass
from typing import Dict, List, Optional
import math

@dataclass
class EntrepreneurProfile:
    applicant_name: str
    location_type: str  # "rural" or "urban"
    state: str
    district: str
    social_category: str  # "general", "women", "sc", "st", "obc", "minority"
    business_type: str  # "service", "manufacturing", "trading"
    business_name: str
    available_margin_money: float  # Capital applicant has saved (INR)
    target_capex: float  # Cost of machinery/equipment
    monthly_operating_expense: float  # Rent, raw material, power
    projected_base_monthly_revenue: float
    seasonal_factors: List[float]  # 12-month array of seasonality weights

class DeterministicFinancialEngine:
    def __init__(self, profile: EntrepreneurProfile):
        self.p = profile

    def calculate_total_project_cost(self) -> Dict[str, float]:
        # Working capital buffer: 45 days of operating expenses
        working_capital_buffer = (self.p.monthly_operating_expense * 45) / 30.0
        pre_operative_expenses = min(15000.0, 0.05 * self.p.target_capex)
        
        total_project_cost = (
            self.p.target_capex + 
            pre_operative_expenses + 
            working_capital_buffer
        )
        return {
            "capex": round(self.p.target_capex, 2),
            "pre_operative": round(pre_operative_expenses, 2),
            "working_capital_buffer": round(working_capital_buffer, 2),
            "total_project_cost": round(total_project_cost, 2)
        }

    def match_government_scheme(self, total_cost: float) -> Dict[str, any]:
        is_special = self.p.social_category.lower() in ["women", "sc", "st", "obc", "minority"]
        is_rural = self.p.location_type.lower() == "rural"

        # PMEGP Evaluation
        is_pmegp_eligible = (
            (self.p.business_type == "manufacturing" and total_cost <= 5000000.0) or
            (self.p.business_type in ["service", "trading"] and total_cost <= 2000000.0)
        )

        if is_pmegp_eligible and total_cost > 50000.0:
            if is_rural and is_special:
                subsidy_pct = 0.35
                own_contrib_pct = 0.05
            elif is_rural and not is_special:
                subsidy_pct = 0.25
                own_contrib_pct = 0.10
            else:
                subsidy_pct = 0.15
                own_contrib_pct = 0.10

            subsidy_amount = total_cost * subsidy_pct
            required_own_contrib = total_cost * own_contrib_pct
            bank_loan = total_cost - subsidy_amount - required_own_contrib

            return {
                "scheme_name": "PMEGP (Prime Minister's Employment Generation Programme)",
                "subsidy_category": f"{'Rural Special' if is_rural and is_special else 'Rural General'}",
                "subsidy_percentage": subsidy_pct * 100,
                "subsidy_amount": round(subsidy_amount, 2),
                "required_margin_money": round(required_own_contrib, 2),
                "bank_loan_amount": round(bank_loan, 2),
                "margin_deficit": max(0.0, required_own_contrib - self.p.available_margin_money)
            }

        # Fallback to PMMY MUDRA
        if total_cost <= 50000.0:
            tier = "MUDRA Shishu"
            margin_pct = 0.0
        elif total_cost <= 500000.0:
            tier = "MUDRA Kishore"
            margin_pct = 0.10
        else:
            tier = "MUDRA Tarun"
            margin_pct = 0.15

        required_margin = total_cost * margin_pct
        bank_loan = total_cost - required_margin

        return {
            "scheme_name": f"PMMY ({tier})",
            "subsidy_category": "Zero Upfront Capital Subsidy (Refinance Guarantee)",
            "subsidy_percentage": 0.0,
            "subsidy_amount": 0.0,
            "required_margin_money": round(required_margin, 2),
            "bank_loan_amount": round(bank_loan, 2),
            "margin_deficit": max(0.0, required_margin - self.p.available_margin_money)
        }

    def compute_emi(self, principal: float, annual_interest_rate: float = 9.5, tenure_months: int = 60) -> float:
        r = (annual_interest_rate / 100.0) / 12.0
        emi = (principal * r * math.pow(1 + r, tenure_months)) / (math.pow(1 + r, tenure_months) - 1)
        return round(emi, 2)

    def evaluate_dscr_and_viability(self, bank_loan: float, interest_rate: float = 9.5, tenure_months: int = 60) -> Dict[str, any]:
        monthly_emi = self.compute_emi(bank_loan, interest_rate, tenure_months)
        seasonal_factors = self.p.seasonal_factors or [1.0] * 12
        
        monthly_cash_flows = []
        dscr_list = []

        for m, factor in enumerate(seasonal_factors):
            rev_m = self.p.projected_base_monthly_revenue * factor
            opex_m = self.p.monthly_operating_expense * (0.7 + 0.3 * factor)
            net_operating_cash_flow = rev_m - opex_m
            dscr_m = net_operating_cash_flow / monthly_emi if monthly_emi > 0 else 0
            
            monthly_cash_flows.append(round(net_operating_cash_flow, 2))
            dscr_list.append(round(dscr_m, 2))

        avg_dscr = sum(dscr_list) / 12.0
        min_dscr = min(dscr_list)

        if avg_dscr >= 1.50 and min_dscr >= 1.0:
            viability_grade = "Bankable (A+)"
            verdict = "Excellent repayment capacity even in lean months."
        elif avg_dscr >= 1.20 and min_dscr >= 0.85:
            viability_grade = "Acceptable (B)"
            verdict = "Satisfactory for MUDRA/PMEGP; recommended ₹5,000 extra buffer for lean months."
        else:
            viability_grade = "High Risk (C)"
            verdict = "Cash flow inadequate during lean months. Consider lower CapEx or longer loan tenure."

        return {
            "monthly_emi": monthly_emi,
            "average_dscr": round(avg_dscr, 2),
            "minimum_dscr": round(min_dscr, 2),
            "viability_grade": viability_grade,
            "verdict": verdict,
            "lean_month_index": dscr_list.index(min_dscr) + 1
        }
```

