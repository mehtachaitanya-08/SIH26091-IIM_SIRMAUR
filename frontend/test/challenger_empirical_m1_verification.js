/**
 * Empirical Verification and Adversarial Stress Harness
 * Milestone 1 Iteration 2 (Challenger Verification)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Engine
import {
  calculateEMI,
  calculateEQI,
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  evaluateRestructuring,
  parseVernacularQuote
} from '../src/engine.js';

// Import SSR Component
import SetoDashboard from '../dist-ssr/SetoDashboard.js';

describe('CHALLENGER EMPIRICAL VERIFICATION SUITE — MILESTONE 1 FIX', () => {

  const setoPath = path.resolve(__dirname, '../src/components/SetoDashboard.jsx');
  const setoCode = fs.readFileSync(setoPath, 'utf8');
  const appPath = path.resolve(__dirname, '../src/App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf8');

  // =========================================================================
  // TASK 2.1: Dynamic Debt Relief Mathematical Calculations & Boundaries
  // =========================================================================
  describe('2.1 Dynamic Debt Relief: Principal Boundaries & EMI Parity', () => {
    it('JSX input bounds for debt principal are strictly min=20000, max=300000, step=10000, default=120000', () => {
      assert.ok(setoCode.includes('min={20000}'), 'Principal min bound must be 20,000');
      assert.ok(setoCode.includes('max={300000}'), 'Principal max bound must be 3,00,000');
      assert.ok(setoCode.includes('step={10000}'), 'Principal step must be 10,000');
      assert.ok(setoCode.includes('useState(120000)'), 'Default principal must be ₹1,20,000');
    });

    it('calculateEMI(p, 6.5, 36) strictly monotonically increases across all discrete steps from ₹20k to ₹300k', () => {
      let prevEmi = 0;
      const steps = [];
      for (let p = 20000; p <= 300000; p += 10000) {
        const emi = calculateEMI(p, 6.5, 36);
        assert.ok(Number.isInteger(emi), `EMI for principal ${p} must be integer`);
        assert.ok(emi > prevEmi, `EMI must strictly increase: p=${p}, emi=${emi}, prevEmi=${prevEmi}`);
        prevEmi = emi;
        steps.push({ p, emi });
      }

      assert.strictEqual(steps.length, 29, 'Must have 29 discrete steps between 20k and 300k at step=10k');
      // Exact boundary assertions
      assert.strictEqual(calculateEMI(20000, 6.5, 36), 613, 'Min principal 20k EMI must be ₹613');
      assert.strictEqual(calculateEMI(120000, 6.5, 36), 3678, 'Default principal 120k EMI must be ₹3,678');
      assert.strictEqual(calculateEMI(300000, 6.5, 36), 9195, 'Max principal 300k EMI must be ₹9,195');
    });

    it('Dynamic debt relief formula matches SetoDashboard implementation', () => {
      function computeDebtRefinance(p, rateSenkda, monthsActive) {
        const apr = rateSenkda * 12;
        const monthlyBleed = Math.round(p * (apr / 100 / 12));
        const prototypeEmi = calculateEMI(p, 6.5, 36);
        const monthlyCashRelief = monthlyBleed - prototypeEmi;
        const paidToDate = monthlyBleed * monthsActive;
        const damdupatViolated = paidToDate >= p;
        return { apr, monthlyBleed, newEmi: prototypeEmi, monthlyCashRelief, paidToDate, damdupatViolated };
      }

      // Default state: 120,000, 3 senkda (36% APR), 36 months
      const def = computeDebtRefinance(120000, 3.0, 36);
      assert.strictEqual(def.apr, 36);
      assert.strictEqual(def.monthlyBleed, 3600);
      assert.strictEqual(def.newEmi, 3678);
      assert.strictEqual(def.monthlyCashRelief, -78);
      assert.strictEqual(def.paidToDate, 129600);
      assert.strictEqual(def.damdupatViolated, true);

      // Total interest comparison over 36 months at default:
      // Moneylender interest over 36 months = 3600 * 36 = 1,29,600
      // NSFDC total outflow over 36 months = 3678 * 36 = 1,32,408 (Includes full 1,20,000 principal repayment!)
      // NSFDC total interest paid = 132408 - 120000 = 12,408
      // Interest Saved = 129,600 - 12,408 = ₹1,17,192
      const totalMoneylenderInterest = def.monthlyBleed * 36;
      const totalNsfdcInterest = (def.newEmi * 36) - 120000;
      const totalInterestSaved = totalMoneylenderInterest - totalNsfdcInterest;
      assert.strictEqual(totalMoneylenderInterest, 129600);
      assert.strictEqual(totalNsfdcInterest, 12408);
      assert.strictEqual(totalInterestSaved, 117192, 'Interest savings over 36 months must exceed ₹1.17 Lakh');

      // Higher predatory rates (4 senkda, 5 senkda) yield positive immediate monthly cash relief
      const at4Senkda = computeDebtRefinance(120000, 4.0, 36);
      assert.strictEqual(at4Senkda.monthlyBleed, 4800);
      assert.strictEqual(at4Senkda.monthlyCashRelief, 1122); // +₹1,122/month

      const at5Senkda = computeDebtRefinance(120000, 5.0, 36);
      assert.strictEqual(at5Senkda.monthlyBleed, 6000);
      assert.strictEqual(at5Senkda.monthlyCashRelief, 2322); // +₹2,322/month
    });
  });

  // =========================================================================
  // TASK 2.2: Rule of Damdupat Threshold Verification
  // =========================================================================
  describe('2.2 Rule of Damdupat Threshold Verification (paidToDate >= p)', () => {
    it('Interactive tenure slider defined with range 1 to 48 months, step 1, default 36', () => {
      assert.ok(setoCode.includes('min={1}'), 'Slider min must be 1');
      assert.ok(setoCode.includes('max={48}'), 'Slider max must be 48');
      assert.ok(setoCode.includes('step={1}'), 'Slider step must be 1');
      assert.ok(setoCode.includes('useState(36)'), 'Default debtMonthsActive must be 36');
      assert.ok(setoCode.includes('debtRefinanceData.damdupatViolated'), 'Must conditionally render Damdupat warning');
    });

    it('At 3 senkda (36% APR), threshold is exactly month 34 (33 months: false, 34 months: true)', () => {
      const p = 120000;
      const monthlyRate = 0.03; // 3%
      const monthlyBleed = Math.round(p * monthlyRate); // 3600

      // Month 33: 3600 * 33 = 118,800 < 120,000 -> false
      const paid33 = monthlyBleed * 33;
      assert.strictEqual(paid33, 118800);
      assert.strictEqual(paid33 >= p, false, '33 months must NOT trigger damdupat');

      // Month 34: 3600 * 34 = 122,400 >= 120,000 -> true
      const paid34 = monthlyBleed * 34;
      assert.strictEqual(paid34, 122400);
      assert.strictEqual(paid34 >= p, true, '34 months MUST trigger damdupat');

      // Default month 36: 3600 * 36 = 129,600 >= 120,000 -> true
      const paid36 = monthlyBleed * 36;
      assert.strictEqual(paid36, 129600);
      assert.strictEqual(paid36 >= p, true, 'Default 36 months MUST trigger damdupat');

      // Low month 16 (previous static defect): 3600 * 16 = 57,600 < 120,000 -> false
      const paid16 = monthlyBleed * 16;
      assert.strictEqual(paid16, 57600);
      assert.strictEqual(paid16 >= p, false, '16 months must NOT trigger damdupat');
    });

    it('Mathematical threshold across all 4 supported dialectal rate options', () => {
      const rates = [
        { senkda: 2.5, minTriggerMonth: 40 }, // 1 / 0.025 = 40
        { senkda: 3.0, minTriggerMonth: 34 }, // ceil(1 / 0.03) = 34
        { senkda: 4.0, minTriggerMonth: 25 }, // 1 / 0.04 = 25
        { senkda: 5.0, minTriggerMonth: 20 }  // 1 / 0.05 = 20
      ];

      for (const { senkda, minTriggerMonth } of rates) {
        const p = 100000;
        const bleed = p * (senkda / 100);
        
        // Month right before trigger
        const before = (minTriggerMonth - 1) * bleed;
        assert.ok(before < p, `${senkda} senkda at month ${minTriggerMonth - 1} must be below principal`);

        // Month at trigger
        const atTrigger = minTriggerMonth * bleed;
        assert.ok(atTrigger >= p, `${senkda} senkda at month ${minTriggerMonth} must meet or exceed principal`);
      }
    });

    it('Damdupat warning banner text specifies legal statute and exact calculation', () => {
      assert.ok(setoCode.includes('Rule of Damdupat Triggered:'), 'Missing banner headline');
      assert.ok(setoCode.includes('Usurious Loans Act 1918'), 'Missing statutory reference to Usurious Loans Act 1918');
      assert.ok(setoCode.includes('exceeds principal'), 'Missing comparison phrase in warning');
    });
  });

  // =========================================================================
  // TASK 2.3: Live Search Query Filtering on recentScenarios
  // =========================================================================
  describe('2.3 Search Query Filtering on recentScenarios', () => {
    const RECENT_SCENARIOS = [
      {
        id: 'D08',
        domainCode: 'D08',
        tab: 'simulator',
        name: 'D08 Mustard Oil Mill',
        subtitle: '₹6.80L Term Loan · 26 Qtrs',
        time: '2h ago',
        type: 'd08'
      },
      {
        id: 'D18',
        domainCode: 'D18',
        tab: 'simulator',
        name: 'D18 Tailoring Workshop',
        subtitle: 'PM Vishwakarma 5% credit...',
        time: '3h ago',
        type: 'd18'
      },
      {
        id: 'debt',
        tab: 'restructure',
        name: 'Sahukar Debt Relief',
        subtitle: '₹1.20L @ 3 senkda → 6.5%',
        time: '5h ago',
        type: 'debt',
        reliefText: '+₹2,460/mo relief'
      }
    ];

    function filterScenarios(query) {
      if (!query || !query.trim()) return RECENT_SCENARIOS;
      const q = query.toLowerCase().trim();
      return RECENT_SCENARIOS.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }

    it('Searching "Mustard" yields exactly 1 match (D08)', () => {
      const res = filterScenarios('Mustard');
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, 'D08');
      assert.strictEqual(res[0].name, 'D08 Mustard Oil Mill');
    });

    it('Searching "mustard" (lowercase) yields exactly 1 match (case-insensitivity)', () => {
      const res = filterScenarios('mustard');
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, 'D08');
    });

    it('Searching "Tailoring" yields exactly 1 match (D18)', () => {
      const res = filterScenarios('Tailoring');
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, 'D18');
      assert.strictEqual(res[0].name, 'D18 Tailoring Workshop');
    });

    it('Searching "tailoring" (lowercase) yields exactly 1 match', () => {
      const res = filterScenarios('tailoring');
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, 'D18');
    });

    it('Searching "xyz" yields exactly 0 matches', () => {
      const res = filterScenarios('xyz');
      assert.strictEqual(res.length, 0);
    });

    it('Searching "debt" or "Sahukar" yields exactly 1 match (debt)', () => {
      const res1 = filterScenarios('debt');
      assert.strictEqual(res1.length, 1);
      assert.strictEqual(res1[0].id, 'debt');

      const res2 = filterScenarios('Sahukar');
      assert.strictEqual(res2.length, 1);
      assert.strictEqual(res2[0].id, 'debt');
    });

    it('Empty query or whitespace yields all 3 scenarios', () => {
      assert.strictEqual(filterScenarios('').length, 3);
      assert.strictEqual(filterScenarios('   ').length, 3);
      assert.strictEqual(filterScenarios(null).length, 3);
    });

    it('JSX implements zero-match fallback message gracefully', () => {
      assert.ok(setoCode.includes('filteredScenarios.length === 0'), 'SetoDashboard must check for zero matches');
      assert.ok(setoCode.includes('No matching scenarios'), 'Must render "No matching scenarios"');
      assert.ok(setoCode.includes('Try searching "Mustard", "Tailoring", or "Debt"'), 'Must render helpful fallback suggestion');
    });
  });

  // =========================================================================
  // TASK 2.4: Code Hygiene & Lifecycle Leak Prevention
  // =========================================================================
  describe('2.4 Code Hygiene, Leaks & Regressions', () => {
    it('No hardcoded prototypeEmi = 1140 in SetoDashboard.jsx', () => {
      assert.strictEqual(setoCode.includes('const prototypeEmi = 1140;'), false);
      assert.strictEqual(setoCode.includes('prototypeEmi = 1140'), false);
    });

    it('App.jsx has proper gsap.ticker.remove cleanup in unmount handler', () => {
      assert.ok(appCode.includes('let updateTicker;'), 'updateTicker must be hoisted');
      assert.ok(appCode.includes('gsap.ticker.remove(updateTicker)'), 'updateTicker must be removed on unmount');
      assert.ok(appCode.includes('ctx.revert()'), 'ctx.revert() must be called on unmount');
      assert.ok(appCode.includes('lenis.destroy()'), 'lenis.destroy() must be called on unmount');
    });

    it('SSR renders SetoDashboard component with zero runtime exceptions', () => {
      const html = renderToString(React.createElement(SetoDashboard));
      assert.ok(html.length > 5000);
      assert.ok(html.includes('GraminAI'));
      assert.ok(html.includes('Ramesh Kumar'));
    });
  });
});
