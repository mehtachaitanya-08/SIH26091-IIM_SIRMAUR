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

describe('Adversarial Frontend API Client & Fallback Validation', () => {

  // -------------------------------------------------------------------------
  // 1. Contract Compliance on Fallback
  // -------------------------------------------------------------------------

  it('calculateNSFDCLoan fallback conforms strictly to PROJECT.md interface contract', async () => {
    const res = await calculateNSFDCLoan(140000, 100000, { isSc: true });
    assert.equal(res._fallback, true);
    assert.equal(typeof res.tier, 'string');
    assert.equal(typeof res.maxLoanAmount, 'number');
    assert.equal(typeof res.promoterContribution, 'number');
    assert.equal(typeof res.termYears, 'number');
    assert.equal(typeof res.quarterlyInterestRate, 'number');
    assert.equal(typeof res.moratoriumQuarters, 'number');
    assert.ok(Array.isArray(res.amortizationSchedule));
    assert.equal(res.amortizationSchedule.length, 12);
  });

  it('evaluateModeA fallback conforms strictly to PROJECT.md interface contract', async () => {
    const res = await evaluateModeA('archetype_1', 1.0);
    assert.equal(res._fallback, true);
    assert.equal(typeof res.capex, 'number');
    assert.equal(typeof res.monthlyOpex, 'number');
    assert.equal(typeof res.revenue, 'number');
    assert.ok(Array.isArray(res.seasonalDscr));
    assert.equal(res.seasonalDscr.length, 12);
    assert.equal(typeof res.grantSubsidy, 'number');
  });

  it('restructureDebt fallback conforms strictly to PROJECT.md interface contract', async () => {
    const res = await restructureDebt(100000, 3.0, 36);
    assert.equal(res._fallback, true);
    assert.equal(typeof res.oldMonthlyInterest, 'number');
    assert.equal(typeof res.newMonthlyEmi, 'number');
    assert.equal(typeof res.monthlySavings, 'number');
    assert.equal(typeof res.damdupatViolated, 'boolean');
  });

  it('fetchDossiers fallback conforms strictly to PROJECT.md interface contract', async () => {
    const res = await fetchDossiers();
    assert.equal(res._fallback, true);
    assert.equal(typeof res.count, 'number');
    assert.ok(Array.isArray(res.dossiers));
    assert.equal(res.count, 24);
  });

  it('fetchDossier fallback conforms strictly to PROJECT.md interface contract', async () => {
    const res = await fetchDossier('D01');
    assert.equal(res._fallback, true);
    assert.equal(typeof res.code, 'string');
    assert.equal(typeof res.title, 'string');
    assert.equal(typeof res.capex, 'number');
    assert.equal(typeof res.opex, 'number');
  });

  // -------------------------------------------------------------------------
  // 2. Boundary Values & Ineligibility Handling
  // -------------------------------------------------------------------------

  it('calculateNSFDCLoan handles negative cost cleanly without throwing', async () => {
    const res = await calculateNSFDCLoan(-50000, 100000);
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.length > 0);
    assert.ok(res.rejectionReasons.some(r => r.includes('greater than ₹0')));
  });

  it('calculateNSFDCLoan handles zero cost cleanly', async () => {
    const res = await calculateNSFDCLoan(0, 100000);
    assert.equal(res.isEligible, false);
  });

  it('calculateNSFDCLoan handles cost > ₹50L cleanly', async () => {
    const res = await calculateNSFDCLoan(6000000, 100000);
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.some(r => r.includes('exceeds maximum NSFDC')));
  });

  it('calculateNSFDCLoan handles income > ₹5L cleanly', async () => {
    const res = await calculateNSFDCLoan(100000, 600000);
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.some(r => r.includes('exceeds') && r.includes('ceiling')));
  });

  it('calculateNSFDCLoan handles non-SC cleanly', async () => {
    const res = await calculateNSFDCLoan(100000, 100000, { isSc: false });
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.some(r => r.includes('Scheduled Caste')));
  });

  // -------------------------------------------------------------------------
  // 3. Damdupat Mathematical Precision
  // -------------------------------------------------------------------------

  it('restructureDebt Damdupat triggers when interest paid strictly equals principal', async () => {
    // 100,000 principal, 10% / month for 10 months = 100,000 interest paid
    const res = await restructureDebt(100000, 10.0, 10);
    assert.equal(res.damdupatViolated, true);
  });

  it('restructureDebt Damdupat does NOT trigger when interest paid is just below principal', async () => {
    // 100,000 principal, 10% / month for 9 months = 90,000 interest paid
    const res = await restructureDebt(100000, 10.0, 9);
    assert.equal(res.damdupatViolated, false);
  });

  it('restructureDebt Damdupat triggers when interest paid exceeds principal', async () => {
    // 100,000 principal, 10% / month for 11 months = 110,000 interest paid
    const res = await restructureDebt(100000, 10.0, 11);
    assert.equal(res.damdupatViolated, true);
  });

  // -------------------------------------------------------------------------
  // 4. Dossier Code Edge Cases & Injections
  // -------------------------------------------------------------------------

  it('fetchDossier works case-insensitively', async () => {
    const dUpper = await fetchDossier('D08');
    const dLower = await fetchDossier('d08');
    assert.ok(dUpper);
    assert.ok(dLower);
    assert.equal(dUpper.code, dLower.code);
    assert.equal(dUpper.name, dLower.name);
  });

  it('fetchDossier returns null for non-existent dossier', async () => {
    const res = await fetchDossier('D99');
    assert.equal(res, null);
  });

  it('fetchDossier throws error for empty code', async () => {
    await assert.rejects(async () => {
      await fetchDossier('');
    }, /required/);
  });

  it('fetchDossier throws error for null code', async () => {
    await assert.rejects(async () => {
      await fetchDossier(null);
    }, /required/);
  });

  it('fetchDossier safely returns null for traversal injection path', async () => {
    const res = await fetchDossier('../../../etc/passwd');
    assert.equal(res, null);
  });

  it('fetchDossier safely returns null for SQL injection probe', async () => {
    const res = await fetchDossier("' OR 1=1 --");
    assert.equal(res, null);
  });

});
