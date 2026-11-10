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

// Run with no server: only the NSFDC loan is worked out in the browser (same rules as the
// server, marked offline: true); everything else says offline and shows no figures.
describe('Adversarial Frontend API Client & Offline Validation', () => {

  // -------------------------------------------------------------------------
  // 1. Contract Compliance on Fallback
  // -------------------------------------------------------------------------

  it('calculateNSFDCLoan offline conforms strictly to PROJECT.md interface contract', async () => {
    const res = await calculateNSFDCLoan(140000, 100000, { isSc: true });
    assert.equal(res.offline, true);
    assert.equal(typeof res.tier, 'string');
    assert.equal(typeof res.maxLoanAmount, 'number');
    assert.equal(typeof res.promoterContribution, 'number');
    assert.equal(typeof res.termYears, 'number');
    assert.equal(typeof res.quarterlyInterestRate, 'number');
    assert.equal(typeof res.moratoriumQuarters, 'number');
    assert.ok(Array.isArray(res.amortizationSchedule));
    assert.equal(res.amortizationSchedule.length, 12);
  });

  it('evaluateModeA offline returns no figures', async () => {
    const res = await evaluateModeA('archetype_1', 1.0);
    assert.equal(res.offline, true);
    assert.ok(!Object.values(res).some(v => typeof v === 'number'));
  });

  it('restructureDebt offline returns no figures', async () => {
    const res = await restructureDebt(100000, 3.0, 36);
    assert.equal(res.offline, true);
    assert.ok(!Object.values(res).some(v => typeof v === 'number'));
  });

  it('fetchDossiers offline returns an empty list marked offline', async () => {
    const res = await fetchDossiers();
    assert.equal(res.offline, true);
    assert.equal(res.count, 0);
    assert.ok(Array.isArray(res.dossiers));
  });

  it('fetchDossier offline returns the code only, marked offline', async () => {
    const res = await fetchDossier('D01');
    assert.equal(res.offline, true);
    assert.equal(res.code, 'D01');
    assert.equal(res.capex, undefined);
  });

  // -------------------------------------------------------------------------
  // 2. Boundary Values & Ineligibility Handling
  // -------------------------------------------------------------------------

  // Negative or zero cost is an input error (the server answers 400 with this message), not an eligibility result.
  it('calculateNSFDCLoan rejects negative cost with the server\'s message', async () => {
    await assert.rejects(() => calculateNSFDCLoan(-50000, 100000), { message: "'projectCost': Input should be greater than 0" });
  });

  it('calculateNSFDCLoan rejects zero cost with the server\'s message', async () => {
    await assert.rejects(() => calculateNSFDCLoan(0, 100000), { message: "'projectCost': Input should be greater than 0" });
  });

  it('calculateNSFDCLoan handles cost > ₹50L cleanly', async () => {
    const res = await calculateNSFDCLoan(6000000, 100000);
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.some(r => r.includes('above ₹50,00,000')));
  });

  it('calculateNSFDCLoan handles income > ₹5L cleanly', async () => {
    const res = await calculateNSFDCLoan(100000, 600000);
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.some(r => r.includes('above ₹5,00,000')));
  });

  it('calculateNSFDCLoan handles non-SC cleanly', async () => {
    const res = await calculateNSFDCLoan(100000, 100000, { isSc: false });
    assert.equal(res.isEligible, false);
    assert.ok(res.rejectionReasons.some(r => r.includes('Scheduled Caste')));
  });

  // -------------------------------------------------------------------------
  // 3. Damdupat: worked out by the server only (team's engine, tagged ASSUMED there)
  // -------------------------------------------------------------------------

  for (const months of [9, 10, 11]) {
    it(`restructureDebt offline gives no Damdupat verdict (${months} months)`, async () => {
      const res = await restructureDebt(100000, 10.0, months);
      assert.equal(res.offline, true);
      assert.equal(res.damdupatViolated, undefined);
    });
  }

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
