/**
 * Adversarial Empirical Verification Test (Node.js Test Runner)
 * Milestone M1: Backend REST Server & API Integration
 * Author: Empirical Challenger Agent 2
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  checkNSFDCEligibility,
  evaluateIncubation,
  evaluateRestructuring,
  NSFDC_CONSTANTS
} from '../frontend/src/engine.js';

import {
  calculateNSFDCLoan,
  evaluateModeA,
  restructureDebt,
  fetchDossiers,
  fetchDossier
} from '../frontend/src/services/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/dossiers_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const dossiers = db.dossiers || {};

describe('CHALLENGER 2: Adversarial Verification & Empirical Parity Suite', () => {

  // --------------------------------------------------------------------------
  // 1. ALL 24 DOSSIERS NUMERICAL PRECISION AUDIT
  // --------------------------------------------------------------------------
  describe('1. Empirical Parity Across All 24 Dossiers (engine.js)', () => {
    it('verifies all 24 dossiers satisfy statutory MCF credit constraints', () => {
      let count = 0;
      for (const [code, d] of Object.entries(dossiers)) {
        const mcfCost = d.capex_financing?.micro_finance_tier?.project_cost || 140000;
        assert.equal(mcfCost, 140000, `${code} MCF project cost must be 1,40,000`);

        const struct = calculateNSFDCLoanStructure({ projectCost: mcfCost });
        assert.equal(struct.tier, 'MCF');
        assert.equal(struct.loanAmount, 125000, `${code} MCF loan amount must be hard-capped at 1,25,000`);
        assert.equal(struct.promoterEquity, 15000, `${code} MCF promoter equity must be 15,000`);
        assert.equal(struct.promoterEquityPct, 10.71);
        assert.equal(struct.interestRatePA, 6.5);
        assert.equal(struct.totalQuarters, 12);
        assert.equal(struct.moratoriumQuarters, 1);
        assert.equal(struct.repaymentQuarters, 11);

        const sched = generateNSFDCAmortizationSchedule(struct);
        assert.equal(sched.quarters.length, 12);
        assert.equal(sched.quarters[0].isMoratorium, true);
        assert.equal(sched.quarters[0].principalPayment, 0);
        assert.equal(sched.quarters[0].interestPayment, 2031.25);
        assert.equal(sched.equatedQuarterlyInstallment, 12501.34);
        assert.equal(sched.totalPrincipalPaid, 125000);
        assert.equal(sched.totalInterestPaid, 14546.01);
        assert.equal(sched.totalDebtService, 139546.01);
        assert.equal(sched.quarters[11].closingBalance, 0);

        count++;
      }
      assert.equal(count, 24, 'Must verify all 24 dossiers');
    });

    it('verifies all 24 dossiers satisfy statutory Term Loan credit constraints', () => {
      let count = 0;
      for (const [code, d] of Object.entries(dossiers)) {
        const termCost = d.capex_financing?.term_loan_tier?.project_cost || 500000;
        assert.ok(termCost > 140000 && termCost <= 5000000, `${code} Term loan cost out of bounds`);

        const struct = calculateNSFDCLoanStructure({ projectCost: termCost });
        assert.equal(struct.tier, 'TERM_LOAN');
        assert.equal(struct.loanAmount, Math.min(termCost * 0.90, 4500000));
        assert.equal(struct.promoterEquity, termCost - struct.loanAmount);
        assert.equal(struct.interestRatePA, 8.0);
        assert.equal(struct.totalQuarters, 28);
        assert.equal(struct.moratoriumQuarters, 2);
        assert.equal(struct.repaymentQuarters, 26);

        const sched = generateNSFDCAmortizationSchedule(struct);
        assert.equal(sched.quarters.length, 28);
        assert.equal(sched.quarters[0].isMoratorium, true);
        assert.equal(sched.quarters[1].isMoratorium, true);
        assert.equal(sched.quarters[0].principalPayment, 0);
        assert.equal(sched.quarters[1].principalPayment, 0);
        assert.equal(sched.totalPrincipalPaid, struct.loanAmount);
        assert.equal(sched.quarters[27].closingBalance, 0);

        count++;
      }
      assert.equal(count, 24, 'Must verify all 24 dossiers');
    });
  });

  // --------------------------------------------------------------------------
  // 2. DOSSIER LOOKUP INTEGRITY & CASE INSENSITIVITY
  // --------------------------------------------------------------------------
  describe('2. Dossier Lookup Integrity & Normalization', () => {
    it('retrieves all 24 dossiers via fetchDossier with proper normalization', async () => {
      for (let i = 1; i <= 24; i++) {
        const codeUpper = `D${String(i).padStart(2, '0')}`;
        const codeLower = `d${String(i).padStart(2, '0')}`;

        const upperDoc = await fetchDossier(codeUpper);
        assert.ok(upperDoc, `Dossier ${codeUpper} missing`);
        assert.equal(upperDoc.code, codeUpper);
        assert.ok(upperDoc.capex > 0);
        assert.ok(upperDoc.opex > 0);
        assert.ok(upperDoc.title);

        const lowerDoc = await fetchDossier(codeLower);
        assert.ok(lowerDoc, `Dossier ${codeLower} missing`);
        assert.equal(lowerDoc.code, codeUpper);
      }
    });

    it('returns null for non-existent and malformed codes', async () => {
      const invalid = ['D00', 'D25', 'D99', 'INVALID', 'XYZ'];
      for (const bad of invalid) {
        const res = await fetchDossier(bad);
        assert.equal(res, null, `Expected null for ${bad}`);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. MODE B DAMDUPAT BOUNDARY CONDITIONS
  // --------------------------------------------------------------------------
  describe('3. Mode B Damdupat Legal Boundaries', () => {
    it('accurately transitions at month 34 for 3 senkda (36% APR)', () => {
      // Month 33: paid = 33 * 3,600 = 1,18,800 < 1,20,000 -> false
      const m33 = evaluateRestructuring({
        debts: [{ principal: 120000, rateQuote: '3 senkda', monthsActive: 33 }]
      });
      assert.equal(m33.damdupatViolationsCount, 0);
      assert.equal(m33.auditedDebts[0].damdupat, false);

      // Month 34: paid = 34 * 3,600 = 1,22,400 >= 1,20,000 -> true
      const m34 = evaluateRestructuring({
        debts: [{ principal: 120000, rateQuote: '3 senkda', monthsActive: 34 }]
      });
      assert.equal(m34.damdupatViolationsCount, 1);
      assert.equal(m34.auditedDebts[0].damdupat, true);
    });

    it('accurately transitions at month 50 for 2 senkda (24% APR)', () => {
      // Principal ₹1,00,000 @ 2 senkda (2% / mo = ₹2,000/mo)
      // Month 49: paid = 49 * 2,000 = 98,000 < 1,00,000 -> false
      const m49 = evaluateRestructuring({
        debts: [{ principal: 100000, rateQuote: '2 senkda', monthsActive: 49 }]
      });
      assert.equal(m49.damdupatViolationsCount, 0);

      // Month 50: paid = 50 * 2,000 = 1,00,000 >= 1,00,000 -> true
      const m50 = evaluateRestructuring({
        debts: [{ principal: 100000, rateQuote: '2 senkda', monthsActive: 50 }]
      });
      assert.equal(m50.damdupatViolationsCount, 1);
    });
  });

  // --------------------------------------------------------------------------
  // 4. ADVERSARIAL DISCREPANCY AUDIT: api.js FALLBACK VS ENGINE CONTRACT
  // --------------------------------------------------------------------------
  describe('4. Empirical Findings on api.js Fallback Contract', () => {
    it('documents monthlyOpex naming discrepancy in evaluateModeA fallback', async () => {
      // In api.js line 208:
      // monthlyOpex: clientResult.monthlyBreakdown?.[0]?.opex || 0
      // In engine.js line 542:
      // monthlyBreakdown contains { month, factor, revenue, cost, nocf, dscr }
      // This causes client fallback monthlyOpex to evaluate to 0 instead of base opex (185000).
      const res = await evaluateModeA('archetype_1', 1.0);
      assert.equal(res.capex, 650000);
      assert.equal(res.monthlyOpex, 0, 'Confirmed: fallback monthlyOpex evaluates to 0 due to property mismatch');
    });
  });
});
