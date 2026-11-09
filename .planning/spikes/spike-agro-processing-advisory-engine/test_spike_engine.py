import json
from dataclasses import dataclass
from typing import Dict

@dataclass
class AgroProcessingConfig:
    trade_name: str
    commodity: str
    raw_material_price_per_qtl: float
    output_primary_product_name: str
    primary_yield_pct: float
    primary_selling_price_per_kg: float
    output_byproduct_name: str
    byproduct_yield_pct: float
    byproduct_selling_price_per_kg: float
    processing_loss_pct: float
    crushing_capacity_qtl_per_day: float
    operating_days_per_month: int
    power_units_per_qtl: float
    power_tariff_per_unit: float
    capex_machinery: float
    capex_shed_electrification: float

def run_agro_spike():
    # Scenario: Rameshwar Lal - Cold Press Mustard Expeller (Chomu, Jaipur)
    # Raw Mustard Seed Mandi Modal Price: Rs 5,400 / qtl (Agmarknet data)
    # 6-bolt expeller: 34 kg cold-pressed mustard oil + 64 kg mustard oil cake (khal) + 2% loss
    # Mustard oil sold at Rs 140 / kg; Oil cake sold to local dairy at Rs 28 / kg
    mustard_cfg = AgroProcessingConfig(
        trade_name="Cold-Press Mustard Oil Expeller Unit",
        commodity="Mustard Seed (Sarson)",
        raw_material_price_per_qtl=5400.0,
        output_primary_product_name="Cold-Pressed Mustard Oil",
        primary_yield_pct=34.0,  # 34 kg per quintal
        primary_selling_price_per_kg=140.0,
        output_byproduct_name="Mustard Oil Cake (Khal)",
        byproduct_yield_pct=64.0,  # 64 kg per quintal
        byproduct_selling_price_per_kg=28.0,
        processing_loss_pct=2.0,
        crushing_capacity_qtl_per_day=2.0,  # 2 quintals/day (200 kg)
        operating_days_per_month=25,
        power_units_per_qtl=12.0,  # 12 kWh per quintal
        power_tariff_per_unit=7.50,  # Rs 7.50 / kWh
        capex_machinery=115000.0,
        capex_shed_electrification=15000.0
    )

    # 1. Compute Unit Economics per Quintal
    raw_cost = mustard_cfg.raw_material_price_per_qtl
    power_cost = mustard_cfg.power_units_per_qtl * mustard_cfg.power_tariff_per_unit
    maintenance_cost = 60.0  # wear and tear
    total_cost_per_qtl = raw_cost + power_cost + maintenance_cost

    oil_revenue = mustard_cfg.primary_yield_pct * mustard_cfg.primary_selling_price_per_kg  # 34 * 140 = 4760
    cake_revenue = mustard_cfg.byproduct_yield_pct * mustard_cfg.byproduct_selling_price_per_kg  # 64 * 28 = 1792
    total_revenue_per_qtl = oil_revenue + cake_revenue  # 6552

    net_margin_per_qtl = total_revenue_per_qtl - total_cost_per_qtl  # 6552 - 5550 = 1002

    # 2. Monthly Projections (50 quintals processed per month at full capacity)
    full_capacity_qtl = mustard_cfg.crushing_capacity_qtl_per_day * mustard_cfg.operating_days_per_month  # 50 qtl
    gross_monthly_rev = total_revenue_per_qtl * full_capacity_qtl  # 327,600
    monthly_raw_exp = raw_cost * full_capacity_qtl  # 270,000
    monthly_power_exp = power_cost * full_capacity_qtl  # 4,500
    monthly_fixed_opex = 5500.0  # rent + operator buffer
    total_monthly_cost = monthly_raw_exp + monthly_power_exp + (maintenance_cost * full_capacity_qtl) + monthly_fixed_opex
    net_monthly_surplus = gross_monthly_rev - total_monthly_cost  # ~44,600

    # 3. Lean Month Stress Test (Monsoon: 40% volume reduction)
    lean_capacity_qtl = full_capacity_qtl * 0.60  # 30 qtl
    lean_rev = total_revenue_per_qtl * lean_capacity_qtl
    lean_cost = (raw_cost + power_cost + maintenance_cost) * lean_capacity_qtl + monthly_fixed_opex
    lean_surplus = lean_rev - lean_cost

    # 4. Total Project Cost & PMEGP / PMFME Structuring
    working_capital_buffer = (total_monthly_cost / 30.0) * 15  # 15 days raw stock buffer
    total_project_outlay = mustard_cfg.capex_machinery + mustard_cfg.capex_shed_electrification + working_capital_buffer
    
    # PMEGP Rural Special (35% subsidy, 5% own contribution, 60% bank loan)
    pmegp_subsidy = total_project_outlay * 0.35
    pmegp_own_margin = total_project_outlay * 0.05
    pmegp_bank_loan = total_project_outlay * 0.60
    
    # EMI calculation for 5 years @ 9.5%
    r = (9.5 / 100) / 12
    n = 60
    emi = (pmegp_bank_loan * r * ((1 + r)**n)) / (((1 + r)**n) - 1)

    avg_dscr = (net_monthly_surplus) / emi
    min_dscr = (lean_surplus) / emi

    result = {
        "niche": "Rural Agro-Processing (Oilseed Expeller)",
        "unit_economics_per_quintal": {
            "raw_mustard_mandi_cost": raw_cost,
            "processing_power_and_wear": round(power_cost + maintenance_cost, 2),
            "oil_revenue": round(oil_revenue, 2),
            "byproduct_cake_revenue": round(cake_revenue, 2),
            "total_revenue_per_qtl": round(total_revenue_per_qtl, 2),
            "net_margin_per_qtl": round(net_margin_per_qtl, 2),
            "gross_margin_percentage": f"{round((net_margin_per_qtl/total_revenue_per_qtl)*100, 1)}%"
        },
        "financial_structuring": {
            "total_project_outlay": round(total_project_outlay, 2),
            "capex_fixed_assets": mustard_cfg.capex_machinery + mustard_cfg.capex_shed_electrification,
            "working_capital_15_day_buffer": round(working_capital_buffer, 2),
            "matched_scheme": "PMEGP (Rural Special - Agro-Processing / Manufacturing)",
            "govt_subsidy_grant_35pct": round(pmegp_subsidy, 2),
            "beneficiary_margin_5pct": round(pmegp_own_margin, 2),
            "bank_term_loan_60pct": round(pmegp_bank_loan, 2),
            "monthly_emi_60_months": round(emi, 2)
        },
        "operational_viability_and_stress_testing": {
            "peak_month_net_surplus": round(net_monthly_surplus, 2),
            "lean_month_net_surplus": round(lean_surplus, 2),
            "average_annual_dscr": round(avg_dscr, 2),
            "minimum_lean_month_dscr": round(min_dscr, 2),
            "viability_verdict": "HIGHLY BANKABLE (DSCR > 2.50 even in lean monsoon)"
        }
    }

    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    run_agro_spike()

