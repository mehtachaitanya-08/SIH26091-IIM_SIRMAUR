"""
Unit Tests for NSFDC Dual-Tier Credit Calculator & SC Eligibility Rules
Statutory Authority: MoSJE / NSFDC (SIH26091)
- Micro Credit Finance (MSY / MCF): <= ₹1.40L project cost, loan cap ₹1.25L @ 6.5%, 11 quarterly instalments
- Term Loan Scheme: > ₹1.40L up to ₹50.00L, 90% loan cap @ 8.0%, 26 quarterly instalments
"""

import unittest
from engine.nsfdc_calculator import (
    NSFDCCalculator,
    BeneficiaryProfile,
    NSFDCTier,
    EligibilityResult,
    LoanStructure,
    AmortizationSchedule
)


class TestNSFDCCalculator(unittest.TestCase):

    def setUp(self):
        self.calc = NSFDCCalculator()

    # --------------------------------------------------------------------------
    # 1. Eligibility Gates Tests
    # --------------------------------------------------------------------------

    def test_sc_eligibility_rejection_non_sc(self):
        """Non-SC applicant must be rejected with clear statutory reason and alternatives."""
        profile = BeneficiaryProfile(
            is_sc=False,
            caste_category="General",
            annual_family_income=250000.0,
            project_cost=100000.0
        )
        res = self.calc.check_eligibility(profile)
        self.assertFalse(res.is_eligible)
        self.assertTrue(any("Scheduled Caste" in r for r in res.rejection_reasons))
        self.assertTrue(len(res.recommended_alternatives) > 0)
        # Should recommend PMMY (Mudra) or PMEGP
        self.assertTrue(any("PMMY" in a or "Mudra" in a or "PMEGP" in a for a in res.recommended_alternatives))

        # Test is_sc=False without caste_category specified
        profile_false_only = BeneficiaryProfile(
            is_sc=False,
            annual_family_income=250000.0,
            project_cost=100000.0
        )
        res_false = self.calc.check_eligibility(profile_false_only)
        self.assertFalse(res_false.is_eligible)

        # Test caste_category="OBC"
        profile_obc = BeneficiaryProfile(
            is_sc=True,
            caste_category="OBC",
            annual_family_income=250000.0,
            project_cost=100000.0
        )
        res_obc = self.calc.check_eligibility(profile_obc)
        self.assertFalse(res_obc.is_eligible)

    def test_income_eligibility_rejection_over_5l(self):
        """Income > ₹5,00,000 must be rejected per 07 Jan 2026 MoSJE/NSFDC ceiling."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=500001.0,
            project_cost=140000.0
        )
        res = self.calc.check_eligibility(profile)
        self.assertFalse(res.is_eligible)
        self.assertTrue(any("5,00,000" in r for r in res.rejection_reasons))
        self.assertTrue(any("PMEGP" in a or "PMMY" in a for a in res.recommended_alternatives))

    def test_income_at_exact_5l_boundary_passes(self):
        """Annual family income of exactly ₹5,00,000 must be accepted."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=500000.0,
            project_cost=140000.0
        )
        res = self.calc.check_eligibility(profile)
        self.assertTrue(res.is_eligible)
        self.assertEqual(len(res.rejection_reasons), 0)

    def test_negative_income_rejected(self):
        """Negative family income must be rejected as invalid input."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=-50000.0,
            project_cost=140000.0
        )
        res = self.calc.check_eligibility(profile)
        self.assertFalse(res.is_eligible)
        self.assertTrue(any("negative" in r.lower() for r in res.rejection_reasons))

    def test_project_cost_boundary_mcf_to_term_loan(self):
        """Boundary check: 140000.0 is MCF, 140000.01 is Term Loan."""
        p_mcf = BeneficiaryProfile(project_cost=140000.0)
        s_mcf = self.calc.calculate_loan_structure(p_mcf)
        self.assertEqual(s_mcf.tier, NSFDCTier.MICRO_CREDIT_FINANCE)

        p_tl = BeneficiaryProfile(project_cost=140000.01)
        s_tl = self.calc.calculate_loan_structure(p_tl)
        self.assertEqual(s_tl.tier, NSFDCTier.TERM_LOAN)

    def test_promoter_equity_exceeding_cost_yields_zero_loan(self):
        """When promoter offers 100% or more equity, loan amount must safely be 0 without error."""
        profile = BeneficiaryProfile(
            project_cost=100000.0,
            promoter_equity_offered=120000.0
        )
        structure = self.calc.calculate_loan_structure(profile)
        self.assertEqual(structure.loan_amount, 0.0)
        self.assertEqual(structure.promoter_equity, 100000.0)
        schedule = self.calc.generate_amortization_schedule(structure)
        self.assertEqual(schedule.equated_quarterly_installment, 0.0)
        self.assertEqual(schedule.total_debt_service, 0.0)

    def test_project_cost_exceeding_50l_rejected(self):
        """Project cost > ₹50,00,000 exceeds maximum NSFDC scheme limit."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=300000.0,
            project_cost=5500000.0
        )
        res = self.calc.check_eligibility(profile)
        self.assertFalse(res.is_eligible)
        self.assertTrue(any("50,00,000" in r for r in res.rejection_reasons))

    # --------------------------------------------------------------------------
    # 2. Micro Credit Finance (MCF / MSY) Tier Tests
    # --------------------------------------------------------------------------

    def test_micro_credit_finance_at_140k_cap(self):
        """
        Critical statutory test:
        At ₹1,40,000 project cost:
        - 90% is ₹1,26,000, BUT loan is strictly capped at ₹1,25,000.
        - Promoter equity is ₹15,000 (NOT 10% / ₹14,000).
        - Concessional rate: 6.5% p.a.
        - Tenure: 3 years = 12 quarters.
        - Moratorium: 3 months = 1 quarter.
        - Repayment: 11 quarterly instalments.
        - Q1 Moratorium interest: ₹1,25,000 * (0.065 / 4) = ₹2,031.25.
        - EQI: P * (r*(1+r)^n)/((1+r)^n - 1) = ₹12,501.34.
        """
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=180000.0,
            project_cost=140000.0
        )
        structure = self.calc.calculate_loan_structure(profile)

        self.assertEqual(structure.tier, NSFDCTier.MICRO_CREDIT_FINANCE)
        self.assertEqual(structure.project_cost, 140000.0)
        self.assertEqual(structure.loan_amount, 125000.0)
        self.assertEqual(structure.promoter_equity, 15000.0)
        self.assertEqual(structure.promoter_equity_pct, 10.71)
        self.assertEqual(structure.interest_rate_pa, 6.5)
        self.assertEqual(structure.tenure_years, 3)
        self.assertEqual(structure.total_quarters, 12)
        self.assertEqual(structure.moratorium_quarters, 1)
        self.assertEqual(structure.repayment_quarters, 11)

        # Generate schedule and verify hand-checked numbers
        schedule = self.calc.generate_amortization_schedule(structure)
        self.assertEqual(len(schedule.quarters), 12)

        # Quarter 1 is moratorium (interest only)
        q1 = schedule.quarters[0]
        self.assertTrue(q1.is_moratorium)
        self.assertAlmostEqual(q1.opening_balance, 125000.0, places=2)
        self.assertAlmostEqual(q1.interest_payment, 2031.25, places=2)
        self.assertEqual(q1.principal_payment, 0.0)
        self.assertAlmostEqual(q1.total_installment, 2031.25, places=2)
        self.assertAlmostEqual(q1.closing_balance, 125000.0, places=2)

        # Quarters 2-12 are equated quarterly instalments (~₹12,501.34)
        q2 = schedule.quarters[1]
        self.assertFalse(q2.is_moratorium)
        self.assertAlmostEqual(q2.total_installment, 12501.34, places=1)

        # Last quarter brings closing balance to 0.00
        q12 = schedule.quarters[11]
        self.assertAlmostEqual(q12.closing_balance, 0.0, places=2)
        self.assertAlmostEqual(schedule.total_principal_paid, 125000.0, places=2)

    def test_micro_credit_finance_below_cap(self):
        """Under ₹1.40L, 90% loan rule applies normally if <= ₹1.25L."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=120000.0,
            project_cost=100000.0
        )
        structure = self.calc.calculate_loan_structure(profile)

        self.assertEqual(structure.tier, NSFDCTier.MICRO_CREDIT_FINANCE)
        self.assertEqual(structure.loan_amount, 90000.0)
        self.assertEqual(structure.promoter_equity, 10000.0)
        self.assertEqual(structure.promoter_equity_pct, 10.0)
        self.assertEqual(structure.interest_rate_pa, 6.5)

        schedule = self.calc.generate_amortization_schedule(structure)
        # Moratorium interest: 90000 * (0.065/4) = 1462.50
        self.assertAlmostEqual(schedule.quarters[0].interest_payment, 1462.50, places=2)
        # EQI: 90000 * (0.01625 * (1.01625)^11) / ((1.01625)^11 - 1) = 9000.97
        self.assertAlmostEqual(schedule.equated_quarterly_installment, 9000.97, places=1)
        self.assertAlmostEqual(schedule.quarters[-1].closing_balance, 0.0, places=2)

    # --------------------------------------------------------------------------
    # 3. Term Loan Scheme Tier Tests
    # --------------------------------------------------------------------------

    def test_term_loan_scheme_10l_example(self):
        """
        Term Loan Scheme test at ₹10,00,000 project cost:
        - Loan: 90% = ₹9,00,000 (below ₹45.00L cap).
        - Promoter equity: 10% = ₹1,00,000.
        - Concessional rate: 8.0% p.a.
        - Tenure: 7 years = 28 quarters.
        - Moratorium: 6 months = 2 quarters.
        - Repayment: 26 quarterly instalments.
        - Quarterly rate: 0.08 / 4 = 0.02.
        - Moratorium interest (Q1, Q2): ₹9,00,000 * 0.02 = ₹18,000.00 each.
        - EQI over 26 quarters: ₹44,729.31.
        """
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=350000.0,
            project_cost=1000000.0
        )
        structure = self.calc.calculate_loan_structure(profile)

        self.assertEqual(structure.tier, NSFDCTier.TERM_LOAN)
        self.assertEqual(structure.project_cost, 1000000.0)
        self.assertEqual(structure.loan_amount, 900000.0)
        self.assertEqual(structure.promoter_equity, 100000.0)
        self.assertEqual(structure.interest_rate_pa, 8.0)
        self.assertEqual(structure.tenure_years, 7)
        self.assertEqual(structure.total_quarters, 28)
        self.assertEqual(structure.moratorium_quarters, 2)
        self.assertEqual(structure.repayment_quarters, 26)

        schedule = self.calc.generate_amortization_schedule(structure)
        self.assertEqual(len(schedule.quarters), 28)

        # Quarters 1 & 2 are moratorium
        self.assertTrue(schedule.quarters[0].is_moratorium)
        self.assertAlmostEqual(schedule.quarters[0].interest_payment, 18000.0, places=2)
        self.assertTrue(schedule.quarters[1].is_moratorium)
        self.assertAlmostEqual(schedule.quarters[1].interest_payment, 18000.0, places=2)

        # EQI: 44,729.31
        self.assertAlmostEqual(schedule.equated_quarterly_installment, 44729.31, delta=1.0)
        self.assertAlmostEqual(schedule.quarters[2].total_installment, 44729.31, delta=1.0)

        # Last quarter brings closing balance to 0.00
        self.assertAlmostEqual(schedule.quarters[-1].closing_balance, 0.0, places=2)
        self.assertAlmostEqual(schedule.total_principal_paid, 900000.0, places=2)

    def test_term_loan_at_50l_maximum_cap(self):
        """At ₹50.00 Lakh max project cost, loan is 90% = ₹45,00,000, equity = ₹5,00,000."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=450000.0,
            project_cost=5000000.0
        )
        structure = self.calc.calculate_loan_structure(profile)

        self.assertEqual(structure.tier, NSFDCTier.TERM_LOAN)
        self.assertEqual(structure.loan_amount, 4500000.0)
        self.assertEqual(structure.promoter_equity, 500000.0)
        self.assertEqual(structure.interest_rate_pa, 8.0)
        schedule = self.calc.generate_amortization_schedule(structure)
        self.assertAlmostEqual(schedule.quarters[-1].closing_balance, 0.0, places=2)

    # --------------------------------------------------------------------------
    # 4. Seasonal DSCR & Stress Testing
    # --------------------------------------------------------------------------

    def test_dscr_calculation_and_stress_testing(self):
        """Verify dynamic Debt Service Coverage Ratio computation and lean-quarter flagging."""
        profile = BeneficiaryProfile(
            is_sc=True,
            caste_category="SC",
            annual_family_income=200000.0,
            project_cost=140000.0
        )
        structure = self.calc.calculate_loan_structure(profile)
        schedule = self.calc.generate_amortization_schedule(structure)

        # Simulate Year 1 quarterly cash flows (Net Operating Income / EBITDA)
        # Q1: 30000, Q2: 35000, Q3 (Monsoon lean): 12000, Q4 (Festive peak): 45000
        quarterly_ebitda = [30000.0, 35000.0, 12000.0, 45000.0]
        stress_res = self.calc.evaluate_dscr_stress(schedule, quarterly_ebitda)

        self.assertEqual(len(stress_res["quarterly_metrics"]), 4)
        # Q1 debt service is moratorium interest 2031.25 -> DSCR = 30000 / 2031.25 = 14.77
        self.assertAlmostEqual(stress_res["quarterly_metrics"][0]["dscr"], 30000.0 / 2031.25, delta=0.1)
        # Q3 debt service is EQI ~12501.34 -> DSCR = 12000 / 12501.34 = 0.96 (< 1.25 standard)
        self.assertLess(stress_res["quarterly_metrics"][2]["dscr"], 1.25)
        self.assertTrue(stress_res["quarterly_metrics"][2]["is_sub_benchmark"])
        self.assertTrue(stress_res["has_stress_warning"])

    # --------------------------------------------------------------------------
    # 5. Cross-Scheme Artisan & Conflict Rules
    # --------------------------------------------------------------------------

    def test_pm_vishwakarma_artisan_cross_scheme_routing(self):
        """Tailor (D18), Carpenter (D19), Metal Smith (D20), Potter (D21) trigger PM Vishwakarma benefits."""
        artisan_domains = ["D18", "D19", "D20", "D21"]
        for domain in artisan_domains:
            benefits = self.calc.check_artisan_scheme_fit(domain_code=domain, has_pmegp_past_5_yrs=False)
            self.assertTrue(benefits["is_pm_vishwakarma_eligible"])
            self.assertEqual(benefits["toolkit_voucher"], 15000.0)
            self.assertEqual(benefits["concessional_rate"], 5.0)

        # If PMEGP availed in past 5 years -> Vishwakarma blocked by statutory exclusion rule
        blocked = self.calc.check_artisan_scheme_fit(domain_code="D18", has_pmegp_past_5_yrs=True)
        self.assertFalse(blocked["is_pm_vishwakarma_eligible"])
        self.assertIn("PMEGP", blocked["exclusion_reason"])


if __name__ == "__main__":
    unittest.main()
