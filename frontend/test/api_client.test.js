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

// These tests run with no server (fetch to /api fails in Node), so they check offline behaviour:
// only the NSFDC loan is worked out in the browser (same rules as the server); everything else
// says offline and shows no figures (no backup to the old bundled dossier file).
describe('4. Frontend API Client Service & Offline Suite', () => {
  it('fetchHealth reports the server offline instead of a made-up engine registry', async () => {
    const health = await fetchHealth();
    assert.equal(health.status, 'offline');
    assert.equal(health.offline, true);
    assert.equal(health.engines, undefined);
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
    assert.ok(result.rejectionReasons[0].includes('above ₹5,00,000'));
  });

  it('evaluateModeA offline: no capex, subsidy or DSCR figures', async () => {
    const result = await evaluateModeA('archetype_1', 1.0);
    assert.equal(result.offline, true);
    assert.equal(result.capex, undefined);
    assert.equal(result.seasonalDscr, undefined);
  });

  it('restructureDebt offline: no figures and no Damdupat verdict', async () => {
    const result = await restructureDebt(120000, 3.0, 36);
    assert.equal(result.offline, true);
    assert.equal(result.oldMonthlyInterest, undefined);
    assert.equal(result.damdupatViolated, undefined);
  });

  it('restructureDebt offline for a short debt too (Damdupat is worked out by the server only)', async () => {
    const result = await restructureDebt(120000, 3.0, 10);
    assert.equal(result.offline, true);
    assert.equal(result.damdupatViolated, undefined);
  });

  it('fetchDossiers offline: empty list, marked offline', async () => {
    const result = await fetchDossiers();
    assert.deepEqual(result, { count: 0, dossiers: [], offline: true });
  });

  it('fetchDossier offline: code only, no capex or opex; unknown code is null', async () => {
    const d08 = await fetchDossier('D08');
    assert.equal(d08.code, 'D08');
    assert.equal(d08.offline, true);
    assert.equal(d08.capex, undefined);
    assert.equal(d08.opex, undefined);

    const nonExistent = await fetchDossier('D99');
    assert.equal(nonExistent, null);
  });
});
