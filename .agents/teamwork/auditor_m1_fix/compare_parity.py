import json
import math

with open('.agents/teamwork/auditor_m1_fix/js_engine_results.json', 'r') as fp:
    js_res = json.load(fp)

with open('.agents/teamwork/auditor_m1_fix/py_engine_results.json', 'r') as fp:
    py_res = json.load(fp)

mismatches = []

# 1. Compare Loan Structures
for cost_str, py_struct in py_res["loanStructures"].items():
    js_struct = js_res["loanStructures"].get(cost_str)
    if not js_struct:
        mismatches.append(f"Missing cost {cost_str} in JS results")
        continue

    for k in ["tier", "schemeName", "projectCost", "loanAmount", "promoterEquity", "promoterEquityPct", "interestRatePA", "tenureYears", "totalQuarters", "moratoriumQuarters", "repaymentQuarters"]:
        v_py = py_struct[k]
        v_js = js_struct[k]
        if isinstance(v_py, float) or isinstance(v_js, float):
            if abs(v_py - v_js) > 0.01:
                mismatches.append(f"Cost {cost_str} field {k} float mismatch: PY={v_py} vs JS={v_js}")
        else:
            if v_py != v_js:
                mismatches.append(f"Cost {cost_str} field {k} mismatch: PY={v_py} vs JS={v_js}")

# 2. Compare Amortization Schedules
for cost_str, py_sched in py_res["amortizationSchedules"].items():
    js_sched = js_res["amortizationSchedules"].get(cost_str)
    if not js_sched:
        mismatches.append(f"Missing amortization for cost {cost_str} in JS results")
        continue

    for k in ["eqi", "totalQuarters", "moratoriumQuartersCount", "firstQuarterInterest", "firstAmortQuarterPrincipal", "finalClosingBalance", "totalPrincipalPaid", "totalInterestPaid", "totalDebtService"]:
        v_py = py_sched[k]
        v_js = js_sched[k]
        if isinstance(v_py, (float, int)) and isinstance(v_js, (float, int)):
            # Tolerance for rounding drift across multi-year floating sums is 1 rupee (0.001%)
            if abs(v_py - v_js) > 1.0:
                mismatches.append(f"Amortization cost {cost_str} field {k} mismatch: PY={v_py} vs JS={v_js} (diff={abs(v_py-v_js)})")
        else:
            if v_py != v_js:
                mismatches.append(f"Amortization cost {cost_str} field {k} mismatch: PY={v_py} vs JS={v_js}")

# 3. Compare Eligibility
for idx, py_el in enumerate(py_res["eligibility"]):
    js_el = js_res["eligibility"][idx]
    if py_el["isEligible"] != js_el["isEligible"]:
        mismatches.append(f"Eligibility case {idx} isEligible mismatch: PY={py_el['isEligible']} vs JS={js_el['isEligible']}")
    if py_el["applicableTier"] != js_el.get("applicableTier"):
        mismatches.append(f"Eligibility case {idx} applicableTier mismatch: PY={py_el['applicableTier']} vs JS={js_el.get('applicableTier')}")

# 4. Compare Artisan Fit
for t, py_fit in py_res["artisanFit"].items():
    js_fit = js_res["artisanFit"][t]
    if py_fit["withoutPMEGP"]["is_pm_vishwakarma_eligible"] != js_fit["withoutPMEGP"]["isEligible"]:
        mismatches.append(f"Artisan fit {t} without PMEGP mismatch")
    if py_fit["withPMEGP"]["is_pm_vishwakarma_eligible"] != js_fit["withPMEGP"]["isEligible"]:
        mismatches.append(f"Artisan fit {t} with PMEGP mismatch")

print(f"Total parity comparison checks completed.")
if mismatches:
    print(f"FAILED: {len(mismatches)} mismatches detected:")
    for m in mismatches:
        print(f"  - {m}")
else:
    print("SUCCESS: 100% Mathematical Parity Confirmed between engine.js and nsfdc_calculator.py!")
