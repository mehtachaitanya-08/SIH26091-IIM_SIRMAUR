/**
 * Comprehensive Node.js Verification Test for frontend/src/engine.js
 * Validates NSFDC statutory calculations, quarterly amortization, and compatibility.
 */

import assert from 'node:assert';
import {
  NSFDC_CONSTANTS,
  checkNSFDCEligibility,
  calculateEQI,
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  checkArtisanSchemeFit,
  evaluateIncubation,
  evaluateRestructuring
} from '../frontend/src/engine.js';

console.log("Starting verification of frontend/src/engine.js...");

// 1. Test Eligibility Gates
const nonSCElig = checkNSFDCEligibility({ isSC: false, annualFamilyIncome: 200000, projectCost: 100000 });
assert.strictEqual(nonSCElig.isEligible, false, "Non-SC must be rejected");
assert.ok(nonSCElig.rejectionReasons[0].includes("Scheduled Caste"), "Must state SC reason");

const obcElig = checkNSFDCEligibility({ isSC: true, casteCategory: "OBC", annualFamilyIncome: 200000, projectCost: 100000 });
assert.strictEqual(obcElig.isEligible, false, "OBC category must be rejected under SC mandate");

const highIncomeElig = checkNSFDCEligibility({ isSC: true, annualFamilyIncome: 550000, projectCost: 100000 });
assert.strictEqual(highIncomeElig.isEligible, false, "High income must be rejected");
assert.ok(highIncomeElig.rejectionReasons[0].includes("5,00,000"), "Must state income ceiling reason");

const exactCeilingElig = checkNSFDCEligibility({ isSC: true, annualFamilyIncome: 500000, projectCost: 100000 });
assert.strictEqual(exactCeilingElig.isEligible, true, "Exact ₹5,00,000 income boundary must pass");

const validElig = checkNSFDCEligibility({ isSC: true, annualFamilyIncome: 450000, projectCost: 140000 });
assert.strictEqual(validElig.isEligible, true, "Valid SC profile must pass");
assert.strictEqual(validElig.applicableTier, "MCF", "Up to ₹1.40L must be MCF");

const termLoanElig = checkNSFDCEligibility({ isSC: true, annualFamilyIncome: 450000, projectCost: 1000000 });
assert.strictEqual(termLoanElig.isEligible, true);
assert.strictEqual(termLoanElig.applicableTier, "TERM_LOAN");

const overLimitElig = checkNSFDCEligibility({ isSC: true, annualFamilyIncome: 450000, projectCost: 5500000 });
assert.strictEqual(overLimitElig.isEligible, false, "Over ₹50L project cost must be rejected");

// 2. Test MCF Loan Structuring at ₹1.40L cap
const mcfStruct = calculateNSFDCLoanStructure({ projectCost: 140000 });
assert.strictEqual(mcfStruct.tier, "MCF");
assert.strictEqual(mcfStruct.loanAmount, 125000, "Loan must be capped at 125,000");
assert.strictEqual(mcfStruct.promoterEquity, 15000, "Equity must be exactly 15,000");
assert.strictEqual(mcfStruct.promoterEquityPct, 10.71, "Equity pct must be 10.71%");
assert.strictEqual(mcfStruct.interestRatePA, 6.5);
assert.strictEqual(mcfStruct.totalQuarters, 12);
assert.strictEqual(mcfStruct.moratoriumQuarters, 1);
assert.strictEqual(mcfStruct.repaymentQuarters, 11);

// Test MCF below cap (₹1.00L)
const mcfBelowStruct = calculateNSFDCLoanStructure({ projectCost: 100000 });
assert.strictEqual(mcfBelowStruct.loanAmount, 90000);
assert.strictEqual(mcfBelowStruct.promoterEquity, 10000);
assert.strictEqual(mcfBelowStruct.promoterEquityPct, 10.0);

// 3. Test Amortization Schedule
const mcfSched = generateNSFDCAmortizationSchedule(mcfStruct);
assert.strictEqual(mcfSched.quarters.length, 12);
// Q1 is moratorium
assert.strictEqual(mcfSched.quarters[0].isMoratorium, true);
assert.strictEqual(mcfSched.quarters[0].interestPayment, 2031.25);
assert.strictEqual(mcfSched.quarters[0].principalPayment, 0);
assert.strictEqual(mcfSched.quarters[0].closingBalance, 125000);
// EQI ~ 12501.34
assert.ok(Math.abs(mcfSched.equatedQuarterlyInstallment - 12501.34) <= 0.05, `EQI should be 12501.34, got ${mcfSched.equatedQuarterlyInstallment}`);
// Last quarter closing balance is 0
assert.strictEqual(mcfSched.quarters[11].closingBalance, 0);
assert.strictEqual(mcfSched.totalPrincipalPaid, 125000);

// 4. Test Term Loan Structuring at ₹10.00L
const termStruct = calculateNSFDCLoanStructure({ projectCost: 1000000 });
assert.strictEqual(termStruct.tier, "TERM_LOAN");
assert.strictEqual(termStruct.loanAmount, 900000);
assert.strictEqual(termStruct.promoterEquity, 100000);
assert.strictEqual(termStruct.interestRatePA, 8.0);
assert.strictEqual(termStruct.totalQuarters, 28);
assert.strictEqual(termStruct.moratoriumQuarters, 2);
assert.strictEqual(termStruct.repaymentQuarters, 26);

const termSched = generateNSFDCAmortizationSchedule(termStruct);
assert.strictEqual(termSched.quarters[0].isMoratorium, true);
assert.strictEqual(termSched.quarters[0].interestPayment, 18000);
assert.strictEqual(termSched.quarters[1].isMoratorium, true);
assert.strictEqual(termSched.quarters[1].interestPayment, 18000);
assert.ok(Math.abs(termSched.equatedQuarterlyInstallment - 44729.31) <= 0.1, `EQI should be ~44729.31, got ${termSched.equatedQuarterlyInstallment}`);
assert.strictEqual(termSched.quarters[27].closingBalance, 0);
assert.strictEqual(termSched.totalPrincipalPaid, 900000);

// Test Term Loan at max cap (₹50.00L)
const termMaxStruct = calculateNSFDCLoanStructure({ projectCost: 5000000 });
assert.strictEqual(termMaxStruct.loanAmount, 4500000);
assert.strictEqual(termMaxStruct.promoterEquity, 500000);

// 5. Test Artisan Cross-Scheme Fit
const vishElig = checkArtisanSchemeFit("D18", false);
assert.strictEqual(vishElig.isEligible, true);
assert.strictEqual(vishElig.toolkitVoucher, 15000);
assert.strictEqual(vishElig.concessionalRate, 5.0);

const vishBlocked = checkArtisanSchemeFit("D18", true);
assert.strictEqual(vishBlocked.isEligible, false);
assert.ok(vishBlocked.exclusionReason.includes("PMEGP"));

// Non-artisan trade
const nonArtisan = checkArtisanSchemeFit("D01", false);
assert.strictEqual(nonArtisan.isEligible, false);

// 6. Test evaluateIncubation with SC Category
const incRes = evaluateIncubation({
  archetypeId: "archetype_2",
  state: "Uttar Pradesh",
  capex: 100000,
  promoterCategory: "sc",
  locationType: "rural",
  annualFamilyIncome: 250000
});
assert.ok(incRes.schemeName.includes("NSFDC"));
assert.ok(incRes.nsfdcDetails !== null);
assert.strictEqual(incRes.nsfdcDetails.isEligible, true);
assert.ok(incRes.nsfdcDetails.quarters.length > 0);

// Test evaluateIncubation with OBC (Non-SC must NOT get NSFDC)
const obcIncRes = evaluateIncubation({
  archetypeId: "archetype_2",
  state: "Uttar Pradesh",
  capex: 100000,
  promoterCategory: "obc",
  locationType: "rural",
  annualFamilyIncome: 250000
});
assert.strictEqual(obcIncRes.nsfdcDetails.isEligible, false);
assert.ok(!obcIncRes.schemeName.includes("NSFDC"));
assert.ok(obcIncRes.nsfdcDetails.rejectionReasons.some(r => r.includes("Scheduled Caste")));

// Test evaluateIncubation with SC but Income > ₹5,00,000 (Statutory Income Ceiling Rejection)
const highIncRes = evaluateIncubation({
  archetypeId: "archetype_2",
  state: "Uttar Pradesh",
  capex: 100000,
  promoterCategory: "sc",
  locationType: "rural",
  annualFamilyIncome: 600000
});
assert.strictEqual(highIncRes.nsfdcDetails.isEligible, false);
assert.ok(!highIncRes.schemeName.includes("NSFDC"));
assert.ok(highIncRes.nsfdcDetails.rejectionReasons.some(r => r.includes("5,00,000")));

console.log("All frontend/src/engine.js tests PASSED successfully!");
