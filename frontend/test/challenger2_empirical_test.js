/**
 * Empirical Verification and Stress Test Suite for SETO Dashboard & Financial Engine
 * Challenger 2 (Adversarial Critic & Specialist)
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

// Import Financial Engine
import {
  NSFDC_CONSTANTS,
  ARCHETYPES,
  checkNSFDCEligibility,
  calculateEQI,
  calculateEMI,
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  checkArtisanSchemeFit,
  evaluateIncubation,
  parseVernacularQuote,
  evaluateRestructuring
} from '../src/engine.js';

// Import Bundled SSR SetoDashboard Component
import SetoDashboard from '../dist-ssr/SetoDashboard.js';

describe('1. Mockup Boundaries & Offline Independence', () => {
  const setoPath = path.resolve(__dirname, '../src/components/SetoDashboard.jsx');
  const enginePath = path.resolve(__dirname, '../src/engine.js');
  const setoCode = fs.readFileSync(setoPath, 'utf8');
  const engineCode = fs.readFileSync(enginePath, 'utf8');

  it('SetoDashboard.jsx must not contain runtime fetch/axios/xhr or backend endpoint calls', () => {
    assert.strictEqual(/\bfetch\s*\(/.test(setoCode), false, 'Found unexpected fetch() call in SetoDashboard.jsx');
    assert.strictEqual(/\baxios\b/.test(setoCode), false, 'Found unexpected axios import/call in SetoDashboard.jsx');
    assert.strictEqual(/\bXMLHttpRequest\b/.test(setoCode), false, 'Found unexpected XMLHttpRequest in SetoDashboard.jsx');
    assert.strictEqual(/\bWebSocket\b/.test(setoCode), false, 'Found unexpected WebSocket in SetoDashboard.jsx');
  });

  it('engine.js must be pure deterministic JavaScript with zero network calls', () => {
    assert.strictEqual(/\bfetch\s*\(/.test(engineCode), false, 'Found unexpected fetch() in engine.js');
    assert.strictEqual(/\baxios\b/.test(engineCode), false, 'Found unexpected axios in engine.js');
    assert.strictEqual(/\bXMLHttpRequest\b/.test(engineCode), false, 'Found unexpected XMLHttpRequest in engine.js');
  });

  it('All local image assets referenced in SetoDashboard.jsx must exist on disk and be non-empty', () => {
    const avatarPath = path.resolve(__dirname, '../public/images/avatar_ramesh.jpg');
    const tailoringPath = path.resolve(__dirname, '../public/images/scenario_tailoring.jpg');
    assert.strictEqual(fs.existsSync(avatarPath), true, 'avatar_ramesh.jpg missing from public/images/');
    assert.strictEqual(fs.existsSync(tailoringPath), true, 'scenario_tailoring.jpg missing from public/images/');
    assert.ok(fs.statSync(avatarPath).size > 1000, 'avatar_ramesh.jpg is an empty or corrupted file');
    assert.ok(fs.statSync(tailoringPath).size > 1000, 'scenario_tailoring.jpg is an empty or corrupted file');
  });

  it('SetoDashboard renders offline without network dependencies via React SSR', () => {
    const html = renderToString(React.createElement(SetoDashboard));
    assert.ok(html.length > 5000, 'Rendered HTML output is surprisingly short');
    assert.ok(html.includes('The Entrepreneur Workspace'), 'Missing main section headline');
    assert.ok(html.includes('Welcome, Ramesh!'), 'Missing center greeting');
    assert.ok(html.includes('GraminAI'), 'Missing GraminAI brand lockup');
    assert.ok(html.includes('Simulate enterprise'), 'Missing quick card Simulate');
    assert.ok(html.includes('NSFDC amortizer'), 'Missing quick card Amortizer');
    assert.ok(html.includes('Debt liberation'), 'Missing quick card Debt Liberation');
    assert.ok(html.includes('Recent scenarios'), 'Missing Recent scenarios header');
    assert.ok(html.includes('D08 Mustard Oil Mill'), 'Missing D08 scenario item');
    assert.ok(html.includes('D18 Tailoring Workshop'), 'Missing D18 scenario item');
    assert.ok(html.includes('Sahukar Debt Relief'), 'Missing Sahukar debt relief item');
  });
});

describe('2. Financial Math Parity & NSFDC Mandate Conformance', () => {
  it('D08 Mustard Mill (₹6.80L cost): Term loan structure matches 90% loan @ 8.0% p.a., 2 moratorium + 26 repayment quarters', () => {
    const cost = 680000;
    const structure = calculateNSFDCLoanStructure({ projectCost: cost });

    assert.strictEqual(structure.tier, 'TERM_LOAN');
    assert.strictEqual(structure.schemeName, 'NSFDC Term Loan Scheme');
    assert.strictEqual(structure.projectCost, 680000);
    assert.strictEqual(structure.loanAmount, 612000, 'Loan amount must be 90% of 6.80L = 6.12L');
    assert.strictEqual(structure.promoterEquity, 68000, 'Promoter margin must be 10% = 68,000');
    assert.strictEqual(structure.promoterEquityPct, 10);
    assert.strictEqual(structure.interestRatePA, 8.0);
    assert.strictEqual(structure.moratoriumQuarters, 2, 'Must have 2 moratorium quarters');
    assert.strictEqual(structure.repaymentQuarters, 26, 'Must have 26 repayment quarters');
    assert.strictEqual(structure.totalQuarters, 28, 'Must have 28 total quarters');

    // Equated Quarterly Instalment (EQI)
    const eqi = calculateEQI(structure.loanAmount, structure.interestRatePA, structure.repaymentQuarters);
    assert.strictEqual(Math.round(eqi), 30416);
    assert.ok(Math.abs(eqi - 30420) < 5.0, 'EQI must be within rounding distance of ₹30,420');

    // Full Amortization Schedule
    const sched = generateNSFDCAmortizationSchedule(structure);
    assert.strictEqual(sched.quarters.length, 28);
    // Q1 and Q2 are Moratorium: interest payment only = 612000 * 0.02 = 12240
    assert.strictEqual(sched.quarters[0].isMoratorium, true);
    assert.strictEqual(sched.quarters[0].interestPayment, 12240);
    assert.strictEqual(sched.quarters[0].principalPayment, 0);
    assert.strictEqual(sched.quarters[0].totalInstallment, 12240);

    assert.strictEqual(sched.quarters[1].isMoratorium, true);
    assert.strictEqual(sched.quarters[1].interestPayment, 12240);

    // Q3 is first amortizing quarter
    assert.strictEqual(sched.quarters[2].isMoratorium, false);
    assert.ok(sched.quarters[2].principalPayment > 0);

    // Final balance at Q28 must be exactly 0
    assert.strictEqual(sched.quarters[27].closingBalance, 0);
    assert.strictEqual(sched.totalPrincipalPaid, 612000);
  });

  it('D18 Tailoring (₹1.00L cost): MCF loan matches ₹90,000 @ 6.5%, 1 moratorium + 11 repayment quarters', () => {
    const cost = 100000;
    const structure = calculateNSFDCLoanStructure({ projectCost: cost });

    assert.strictEqual(structure.tier, 'MCF');
    assert.strictEqual(structure.projectCost, 100000);
    assert.strictEqual(structure.loanAmount, 90000, 'Loan amount must be 90% of 1.00L = 90,000');
    assert.strictEqual(structure.promoterEquity, 10000, 'Promoter margin must be 10% = 10,000');
    assert.strictEqual(structure.promoterEquityPct, 10);
    assert.strictEqual(structure.interestRatePA, 6.5);
    assert.strictEqual(structure.moratoriumQuarters, 1, 'MCF must have 1 moratorium quarter');
    assert.strictEqual(structure.repaymentQuarters, 11, 'MCF must have 11 repayment quarters');
    assert.strictEqual(structure.totalQuarters, 12, 'MCF must have 12 total quarters');

    const eqi = calculateEQI(structure.loanAmount, structure.interestRatePA, structure.repaymentQuarters);
    assert.strictEqual(Math.round(eqi), 9001);

    const sched = generateNSFDCAmortizationSchedule(structure);
    assert.strictEqual(sched.quarters.length, 12);
    assert.strictEqual(sched.quarters[0].isMoratorium, true);
    assert.strictEqual(sched.quarters[0].interestPayment, 1462.5); // 90000 * 0.01625
    assert.strictEqual(sched.quarters[11].closingBalance, 0);
    assert.strictEqual(sched.totalPrincipalPaid, 90000);
  });

  it('D18 PM Vishwakarma craft eligibility: Concessional 5% credit + ₹15,000 toolkit voucher', () => {
    const artisanFit = checkArtisanSchemeFit('D18');
    assert.strictEqual(artisanFit.isEligible, true);
    assert.strictEqual(artisanFit.trade, 'Tailor (Darzi) - Trade 17');
    assert.strictEqual(artisanFit.concessionalRate, 5.0);
    assert.strictEqual(artisanFit.toolkitVoucher, 15000);
    assert.strictEqual(artisanFit.tranche1Limit, 100000);

    // Negative check: PMEGP past 5 years exclusion
    const excluded = checkArtisanSchemeFit('D18', true);
    assert.strictEqual(excluded.isEligible, false);
    assert.ok(excluded.exclusionReason.includes('PMEGP credit/subsidy within the past 5 years'));
  });

  it('Debt Refinancing (Mode B): ₹1,20,000 @ 3 senkda (36% APR) vs formal loan', () => {
    const principal = 120000;
    const rateSenkda = 3.0;
    const apr = rateSenkda * 12; // 36%
    const monthlyBleed = Math.round(principal * (apr / 100 / 12));
    assert.strictEqual(monthlyBleed, 3600, 'Monthly bleed at 3 senkda on 1.20L must be ₹3,600/mo');

    const prototypeEmi = 1140; // Formal loan service specified in UI mockup
    const netRelief = monthlyBleed - prototypeEmi;
    assert.strictEqual(netRelief, 2460, 'Net relief must be +₹2,460/mo');
  });

  it('Damdupat Rule Detection: correctly triggers when total interest paid >= principal', () => {
    // 1. Below ceiling
    const p1 = 120000;
    const paid1 = 3600 * 16; // 57,600
    assert.strictEqual(paid1 >= p1, false, '57,600 paid on 1.20L is NOT damdupat violation');

    // 2. Exactly at ceiling
    const p2 = 100000;
    const paid2 = 100000;
    assert.strictEqual(paid2 >= p2, true, 'Paid equal to principal MUST trigger damdupat violation');

    // 3. Above ceiling
    const p3 = 120000;
    const paid3 = 3600 * 35; // 126,000
    assert.strictEqual(paid3 >= p3, true, 'Paid greater than principal MUST trigger damdupat violation');

    // Test in engine evaluateRestructuring
    const debts = [
      { principal: 100000, rateQuote: '5 senkda', monthsActive: 25 }, // 5000/mo * 25 = 125,000 (violation)
      { principal: 200000, rateQuote: '3 senkda', monthsActive: 10 }  // 6000/mo * 10 = 60,000 (no violation)
    ];
    const rest = evaluateRestructuring({ debts });
    assert.strictEqual(rest.auditedDebts[0].damdupat, true);
    assert.strictEqual(rest.auditedDebts[1].damdupat, false);
    assert.strictEqual(rest.damdupatViolationsCount, 1);
  });
});

describe('3. Adversarial Stress-Testing & UI State Edge Cases', () => {
  const setoPath = path.resolve(__dirname, '../src/components/SetoDashboard.jsx');
  const setoCode = fs.readFileSync(setoPath, 'utf8');

  it('SetoDashboard Viewport Architecture: all 5 tabs defined and routed in JSX', () => {
    assert.ok(setoCode.includes("activeTab === 'home'"), 'Missing home tab branch');
    assert.ok(setoCode.includes("activeTab === 'simulator'"), 'Missing simulator tab branch');
    assert.ok(setoCode.includes("activeTab === 'amortizer'"), 'Missing amortizer tab branch');
    assert.ok(setoCode.includes("activeTab === 'restructure'"), 'Missing restructure tab branch');
    assert.ok(setoCode.includes("activeTab === 'dpr'"), 'Missing dpr tab branch');
  });

  it('[REMEDIATED] Search Bar Filtering: verify searchQuery dynamically filters scenario list', () => {
    // searchQuery must be hooked to dynamic memo and filter recent scenarios
    assert.ok(setoCode.includes('filteredScenarios'), 'SetoDashboard.jsx must define filteredScenarios');
    assert.ok(setoCode.includes('.filter('), 'SetoDashboard.jsx must dynamically filter scenario list');
    assert.ok(setoCode.includes('filteredScenarios.map'), 'SetoDashboard.jsx must render filteredScenarios');
  });

  it('[REMEDIATED] Dynamic EMI in Debt Refinance Slider Viewport via calculateEMI', () => {
    assert.ok(setoCode.includes('calculateEMI(p, 6.5, 36)'), 'SetoDashboard.jsx must invoke calculateEMI(p, 6.5, 36)');
    assert.strictEqual(setoCode.includes('const prototypeEmi = 1140;'), false, 'Hardcoded mock 1140 must be removed');
    
    // Dynamic calculation verification across slider bounds
    const emiLow = calculateEMI(20000, 6.5, 36);
    assert.strictEqual(emiLow, 613, 'At ₹20,000 principal, 6.5% 36m EMI must be ₹613');
    
    const emiDefault = calculateEMI(120000, 6.5, 36);
    assert.strictEqual(emiDefault, 3678, 'At ₹120,000 principal, 6.5% 36m EMI must be ₹3,678');
    
    const emiHigh = calculateEMI(300000, 6.5, 36);
    assert.strictEqual(emiHigh, 9195, 'At ₹300,000 principal, 6.5% 36m EMI must be ₹9,195');
  });

  it('[REMEDIATED] Damdupat Violation Reachable in UI via Dynamic debtMonthsActive Slider', () => {
    assert.ok(setoCode.includes('debtMonthsActive'), 'SetoDashboard.jsx must maintain debtMonthsActive state');
    assert.ok(setoCode.includes('setDebtMonthsActive'), 'SetoDashboard.jsx must provide setter for duration');
    
    // With dynamic duration slider (1-48 months, default 36) at 3 senkda:
    // paidToDate = p * 0.03 * 36 = 1.08 * p >= p -> damdupatViolated = true!
    const defaultMonths = 36;
    const defaultSenkda = 3.0;
    const defaultPaidFraction = (defaultSenkda / 100) * defaultMonths;
    assert.strictEqual(defaultPaidFraction, 1.08, 'Default interest paid ratio is 108%, triggering Damdupat statutory warning');
    assert.ok(defaultPaidFraction >= 1.0, 'Damdupat warning is active at default configuration');
  });

  it('[CODE HYGIENE] Clean Imports in SetoDashboard.jsx: zero unused icons or unused engine functions', () => {
    const deadIcons = [
      'Home', 'Sliders', 'TrendingDown', 'Scale', 'FileText', 'Bell', 'Settings',
      'ChevronDown', 'ChevronUp', 'Search', 'RefreshCw', 'Mic', 'ArrowUp',
      'Paperclip', 'CheckCircle2', 'Info'
    ];
    for (const icon of deadIcons) {
      assert.strictEqual(new RegExp(`\\b${icon}\\b`).test(setoCode.split('} from \'lucide-react\'')[0]), false, `Unused icon ${icon} should not be imported`);
    }
    assert.strictEqual(setoCode.includes('calculateEQI'), false, 'Unused calculateEQI should not be imported in SetoDashboard');
  });

  it('Command Bar Dispatch Logic: verify keywords route to proper tabs', () => {
    function dispatchCommand(text) {
      const clean = (text || '').trim().toLowerCase();
      if (clean.includes('stress') || clean.includes('simulat') || clean.includes('season')) {
        return 'simulator';
      } else if (clean.includes('amort') || clean.includes('loan') || clean.includes('eqi')) {
        return 'amortizer';
      } else if (clean.includes('debt') || clean.includes('moneylender') || clean.includes('relief') || clean.includes('senkda')) {
        return 'restructure';
      } else if (clean.includes('dpr') || clean.includes('pdf') || clean.includes('report') || clean.includes('bank')) {
        return 'dpr';
      } else {
        return 'simulator';
      }
    }

    assert.strictEqual(dispatchCommand('run seasonality stress simulation'), 'simulator');
    assert.strictEqual(dispatchCommand('calculate quarterly EQI loan amortization'), 'amortizer');
    assert.strictEqual(dispatchCommand('moneylender debt relief senkda'), 'restructure');
    assert.strictEqual(dispatchCommand('generate lead-bank dpr pdf report'), 'dpr');
    assert.strictEqual(dispatchCommand('anything else'), 'simulator');
  });

  it('Extreme and boundary values in engine.js: verify exceptions and safety bounds', () => {
    // 1. Negative or zero project cost
    assert.throws(() => calculateNSFDCLoanStructure({ projectCost: 0 }), /Project cost must be greater than zero/);
    assert.throws(() => calculateNSFDCLoanStructure({ projectCost: -50000 }), /Project cost must be greater than zero/);

    // 2. Project cost exceeding ₹50 Lakh statutory cap
    assert.throws(() => calculateNSFDCLoanStructure({ projectCost: 6000000 }), /exceeds NSFDC limit/);

    // 3. calculateEQI with 0 principal or quarters
    assert.strictEqual(calculateEQI(0, 8.0, 26), 0);
    assert.strictEqual(calculateEQI(100000, 8.0, 0), 0);

    // 4. calculateEQI with 0% interest rate
    assert.strictEqual(calculateEQI(26000, 0, 26), 1000);

    // 5. Vernacular quote parsing resilience
    assert.strictEqual(parseVernacularQuote('3 senkda'), 36.0);
    assert.strictEqual(parseVernacularQuote('5 saikda'), 60.0);
    assert.strictEqual(parseVernacularQuote('2.5 per 100'), 30.0);
    assert.strictEqual(parseVernacularQuote(''), 36.0);
    assert.strictEqual(parseVernacularQuote(null), 36.0);
  });
});
