import sys
import os
import json
import math

sys.path.insert(0, os.path.abspath('engine'))
from nsfdc_calculator import (
    NSFDCCalculator,
    BeneficiaryProfile,
    NSFDCTier
)

calc = NSFDCCalculator()
test_costs = [50000, 100000, 140000, 150000, 680000, 2500000, 5000000]

py_results = {
    "loanStructures": {},
    "amortizationSchedules": {},
    "eligibility": [],
    "artisanFit": {}
}

for cost in test_costs:
    prof = BeneficiaryProfile(project_cost=cost)
    struct = calc.calculate_loan_structure(prof)
    sched = calc.generate_amortization_schedule(struct)

    py_results["loanStructures"][str(cost)] = {
        "tier": struct.tier.value,
        "schemeName": struct.scheme_name,
        "projectCost": struct.project_cost,
        "loanAmount": struct.loan_amount,
        "promoterEquity": struct.promoter_equity,
        "promoterEquityPct": struct.promoter_equity_pct,
        "interestRatePA": struct.interest_rate_pa,
        "tenureYears": struct.tenure_years,
        "totalQuarters": struct.total_quarters,
        "moratoriumQuarters": struct.moratorium_quarters,
        "repaymentQuarters": struct.repayment_quarters
    }

    py_results["amortizationSchedules"][str(cost)] = {
        "eqi": sched.equated_quarterly_installment,
        "totalQuarters": len(sched.quarters),
        "moratoriumQuartersCount": sum(1 for q in sched.quarters if q.is_moratorium),
        "firstQuarterInterest": sched.quarters[0].interest_payment,
        "firstAmortQuarterPrincipal": sched.quarters[struct.moratorium_quarters].principal_payment,
        "finalClosingBalance": sched.quarters[-1].closing_balance,
        "totalPrincipalPaid": sched.total_principal_paid,
        "totalInterestPaid": sched.total_interest_paid,
        "totalDebtService": sched.total_debt_service
    }

eligibility_cases = [
    BeneficiaryProfile(is_sc=True, annual_family_income=300000, project_cost=140000),
    BeneficiaryProfile(is_sc=False, annual_family_income=300000, project_cost=140000),
    BeneficiaryProfile(is_sc=True, annual_family_income=550000, project_cost=140000),
    BeneficiaryProfile(is_sc=True, annual_family_income=300000, project_cost=6000000)
]

for c in eligibility_cases:
    res = calc.check_eligibility(c)
    py_results["eligibility"].append({
        "isEligible": res.is_eligible,
        "applicableTier": res.applicable_tier.value if res.applicable_tier else None
    })

trades = ['D18', 'D19', 'D20', 'D21', 'D08', 'D15']
for t in trades:
    py_results["artisanFit"][t] = {
        "withoutPMEGP": calc.check_artisan_scheme_fit(t, False),
        "withPMEGP": calc.check_artisan_scheme_fit(t, True)
    }

with open('.agents/teamwork/auditor_m1_fix/py_engine_results.json', 'w') as fp:
    json.dump(py_results, fp, indent=2)

print("Python engine results exported.")
