import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  fetchHealth,
  calculateNSFDCLoan,
  evaluateModeA,
  restructureDebt,
  fetchDossiers,
  fetchDossier
} from '../src/services/api.js';

describe('4. Frontend API Client Service & Resilient Fallback Suite', () => {
  it('fetchHealth returns operational status and calculation engine registry', async () => {
    const health = await fetchHealth();
    assert.equal(health.status, 'ok');
    assert.equal(health.version, '1.0.0');
    assert.ok(health.timestamp, 'Timestamp must be present');
    assert.ok(health.engines, 'Engines metadata must be present');
    assert.equal(health.engines.total_dossiers, 24);
  });

  it('calculateNSFDCLoan structures MCF credit strictly capped at ₹1,25,000 for ₹1,40,000 project', async () => {
    const result = await calculateNSFDCLoan(140000, 120000, { isSc: true });
    assert.equal(result.isEligible, true);
    assert.equal(result.tier, 'MCF');
    assert.equal(result.maxLoanAmount, 125000);
    assert.equal(result.promoterContribution, 15000);
    assert.equal(result.interestRatePa, 6.5);
    assert.equal(result.moratoriumQuarters, 1);
    assert.equal(result.termYears, 3);
    assert.equal(result.repaymentQuarters, 11);
    assert.equal(result.amortizationSchedule.length, 12);
    // Quarter 1 is moratorium
    assert.equal(result.amortizationSchedule[0].isMoratorium, true);
    assert.equal(result.amortizationSchedule[0].principalPayment, 0);
  });

  it('calculateNSFDCLoan structures Term Loan at 90% up to ₹50L with 2 moratorium quarters', async () => {
    const result = await calculateNSFDCLoan(680000, 250000, { isSc: true });
    assert.equal(result.isEligible, true);
    assert.equal(result.tier, 'TERM_LOAN');
    assert.equal(result.maxLoanAmount, 612000);
    assert.equal(result.promoterContribution, 68000);
    assert.equal(result.interestRatePa, 8.0);
    assert.equal(result.moratoriumQuarters, 2);
    assert.equal(result.termYears, 7);
    assert.equal(result.repaymentQuarters, 26);
    assert.equal(result.amortizationSchedule.length, 28);
  });

  it('calculateNSFDCLoan rejects beneficiaries exceeding ₹5.00 Lakh income ceiling', async () => {
    const result = await calculateNSFDCLoan(120000, 600000, { isSc: true });
    assert.equal(result.isEligible, false);
    assert.ok(result.rejectionReasons.length > 0);
    assert.ok(result.rejectionReasons[0].includes('exceeds'));
  });

  it('evaluateModeA evaluates enterprise capex, opex, subsidy, and 12-month seasonal DSCR', async () => {
    const result = await evaluateModeA('archetype_1', 1.0);
    assert.equal(result.capex, 650000);
    assert.equal(result.grantSubsidy, 336000); // 35% PMEGP
    assert.equal(result.seasonalDscr.length, 12);
    assert.ok(typeof result.seasonalDscr[0] === 'number');
  });

  it('restructureDebt accurately detects Damdupat violation when paidToDate >= principal', async () => {
    const result = await restructureDebt(120000, 3.0, 36);
    assert.equal(result.oldMonthlyInterest, 3600);
    assert.equal(result.damdupatViolated, true); // 36 * 3600 = 129,600 >= 120,000
    assert.ok(result.newMonthlyEmi > 0);
    assert.ok(result.monthlySavings !== undefined);
  });

  it('restructureDebt does not flag Damdupat when interest paid < principal', async () => {
    const result = await restructureDebt(120000, 3.0, 10);
    assert.equal(result.damdupatViolated, false); // 10 * 3600 = 36,000 < 120,000
  });

  it('fetchDossiers returns complete catalog of 24 empirical micro-enterprises', async () => {
    const result = await fetchDossiers();
    assert.equal(result.count, 24);
    assert.equal(result.dossiers.length, 24);
    const codes = result.dossiers.map(d => d.code);
    assert.ok(codes.includes('D01'));
    assert.ok(codes.includes('D08'));
    assert.ok(codes.includes('D18'));
    assert.ok(codes.includes('D24'));
  });

  it('fetchDossier retrieves specific dossier with capex, opex, and title', async () => {
    const d08 = await fetchDossier('D08');
    assert.ok(d08);
    assert.equal(d08.code, 'D08');
    assert.ok(d08.capex > 0);
    assert.ok(d08.opex > 0);

    const nonExistent = await fetchDossier('D99');
    assert.equal(nonExistent, null);
  });
});
