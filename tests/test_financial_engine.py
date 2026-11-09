"""
Unit Tests for Multi-Archetype Deterministic Financial Engine (Mode A & Mode B)
"""

import unittest
from engine.multi_archetype_financial_engine import IncubationEngine, RestructuringEngine, ARCHETYPES

class TestFinancialEngine(unittest.TestCase):

    def test_emi_calculation(self):
        # 1 Lakh at 12% for 12 months -> EMI ~ ₹8,884.88
        emi = IncubationEngine.calculate_emi(100000, 12.0, 12)
        self.assertAlmostEqual(emi, 8884.88, delta=1.0)
        
        # 0 principal
        self.assertEqual(IncubationEngine.calculate_emi(0, 10.0, 12), 0.0)

    def test_mode_a_archetype_evaluations(self):
        # Test evaluation for all 6 archetypes
        for arch_id in ARCHETYPES.keys():
            res = IncubationEngine.evaluate_project(
                archetype_id=arch_id,
                promoter_category="special",
                location_type="rural"
            )
            self.assertEqual(res["archetype_id"], arch_id)
            self.assertIn("financial_summary", res)
            self.assertIn("dscr_metrics", res)
            self.assertIn("monthly_cash_flows", res)
            self.assertEqual(len(res["monthly_cash_flows"]), 12)
            self.assertGreater(res["financial_summary"]["total_project_cost"], 0)
            self.assertGreater(res["dscr_metrics"]["average_annual_dscr"], 0)

    def test_mode_a_pm_vishwakarma_rules(self):
        res = IncubationEngine.evaluate_project(
            archetype_id="archetype_5",
            promoter_category="special",
            location_type="rural"
        )
        scheme = res["scheme_details"]
        self.assertEqual(scheme["scheme_name"], "PM Vishwakarma (Tranche 1)")
        self.assertEqual(scheme["effective_interest_rate"], 5.0)
        self.assertEqual(scheme["toolkit_grant"], 15000.0)

    def test_mode_b_vernacular_quote_parsing(self):
        self.assertEqual(RestructuringEngine.parse_vernacular_quote("3 senkda"), 36.0)
        self.assertEqual(RestructuringEngine.parse_vernacular_quote("5 senkda"), 60.0)
        self.assertEqual(RestructuringEngine.parse_vernacular_quote("2 per 100"), 24.0)
        self.assertEqual(RestructuringEngine.parse_vernacular_quote("42%"), 42.0)

    def test_mode_b_debt_restructuring_portfolio(self):
        debts = [
            {"principal": 120000, "rate_quote": "3 senkda", "lender_type": "Village Mahajan", "months_active": 14},
            {"principal": 60000, "rate_quote": "4 senkda", "lender_type": "Fertilizer Dealer", "months_active": 8},
            {"principal": 20000, "rate_quote": "2 senkda", "lender_type": "Relative", "months_active": 6}
        ]
        
        result = RestructuringEngine.evaluate_portfolio(
            debts=debts,
            household_monthly_income=32000.0,
            refinancing_pathway="MUDRA_KISHOR",
            refinance_tenure_months=36
        )

        self.assertEqual(result["total_debt_consolidated"], 200000.0)
        # 120k @ 36% = 3600/mo, 60k @ 48% = 2400/mo, 20k @ 24% = 400/mo -> Total = 6400/mo
        self.assertEqual(result["current_monthly_interest_bleed"], 6400.0)
        
        # New EMI for 2L @ 9.5% for 36 mos is ~ ₹6,406
        refinance = result["refinancing_plan"]
        self.assertAlmostEqual(refinance["new_monthly_amortizing_emi"], 6406.0, delta=20.0)
        
        # Total formal interest is ~ ₹30,600 vs informal 3-year interest of ₹2,30,400 -> Massive savings!
        liberation = result["liberation_metrics"]
        self.assertGreater(liberation["cumulative_interest_saved"], 150000.0)
        self.assertTrue(result["legal_remedy_summary"]["damdupat_eligible_debts_count"] >= 0)

if __name__ == "__main__":
    unittest.main()

