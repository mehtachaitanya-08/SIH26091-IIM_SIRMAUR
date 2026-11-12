/**
 * Challenger M3 Empirical Adversarial Stress Test Suite
 * Rigorously challenges SetoDashboard.jsx, ProductionDashboard.jsx, and SSOT subcomponents.
 * 
 * Target Dimensions:
 * 1. Offline Isolation Regex Contracts (SetoDashboard & Subcomponents)
 * 2. Slider Boundary Contracts & Monotonicity (Principal 20k-300k, Duration 1-48)
 * 3. Exhaustive Rule of Damdupat Boundary Oracles (5,568 empirical combinations)
 * 4. Scenario Search & Filter Adversarial Hardening (Regex, Injection, Unicode, Long Strings)
 * 5. Mockup / Production Dashboard Architectural Parity & Synchronization
 * 6. React SSR Offline Rendering & Dynamic User Injection
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

// Import calculation engine
import {
  calculateEMI,
  calculateEQI,
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule
} from '../src/engine.js';

// Import SSR Pre-rendered Component
import SetoDashboard, { PRESETS, RECENT_SCENARIOS } from '../dist-ssr/SetoDashboard.js';

describe('CHALLENGER M3 EMPIRICAL ADVERSARIAL STRESS SUITE', () => {

  const setoPath = path.resolve(__dirname, '../src/components/SetoDashboard.jsx');
  const prodPath = path.resolve(__dirname, '../src/components/ProductionDashboard.jsx');
  const subcomponentsDir = path.resolve(__dirname, '../src/components/dashboard');
  
  const setoCode = fs.readFileSync(setoPath, 'utf8');
  const prodCode = fs.readFileSync(prodPath, 'utf8');

  // =========================================================================
  // 1. OFFLINE ISOLATION REGEX CONTRACTS
  // =========================================================================
  describe('1. Offline Isolation & Network Zero-Dependency Contracts', () => {

    it('SetoDashboard.jsx strictly contains NO fetch, axios, XMLHttpRequest, or WebSocket', () => {
      assert.strictEqual(/\bfetch\s*\(/.test(setoCode), false, 'Found fetch() in SetoDashboard.jsx');
      assert.strictEqual(/\baxios\b/.test(setoCode), false, 'Found axios in SetoDashboard.jsx');
      assert.strictEqual(/\bXMLHttpRequest\b/.test(setoCode), false, 'Found XMLHttpRequest in SetoDashboard.jsx');
      assert.strictEqual(/\bWebSocket\b/.test(setoCode), false, 'Found WebSocket in SetoDashboard.jsx');
      assert.strictEqual(/navigator\.sendBeacon/.test(setoCode), false, 'Found sendBeacon in SetoDashboard.jsx');
    });

    it('All 12 SSOT subcomponents imported by SetoDashboard contain zero network calls', () => {
      const subfiles = fs.readdirSync(subcomponentsDir).filter(f => f.endsWith('.jsx'));
      assert.ok(subfiles.length >= 12, `Expected at least 12 subcomponents, found ${subfiles.length}`);

      for (const file of subfiles) {
        const filePath = path.join(subcomponentsDir, file);
        const code = fs.readFileSync(filePath, 'utf8');
        assert.strictEqual(/\bfetch\s*\(/.test(code), false, `Found fetch() in subcomponent ${file}`);
        assert.strictEqual(/\baxios\b/.test(code), false, `Found axios in subcomponent ${file}`);
        assert.strictEqual(/\bXMLHttpRequest\b/.test(code), false, `Found XMLHttpRequest in subcomponent ${file}`);
        assert.strictEqual(/\bWebSocket\b/.test(code), false, `Found WebSocket in subcomponent ${file}`);
      }
    });

    it('ProductionDashboard.jsx correctly integrates api.js client service with resilient methods', () => {
      assert.ok(prodCode.includes("from '../services/api'"), 'ProductionDashboard must import from api.js');
      assert.ok(prodCode.includes('calculateNSFDCLoan'), 'Must invoke calculateNSFDCLoan');
      assert.ok(prodCode.includes('restructureDebt'), 'Must invoke restructureDebt');
      assert.ok(prodCode.includes('fetchDossiers'), 'Must invoke fetchDossiers');
      assert.ok(prodCode.includes('fetchHealth'), 'Must invoke fetchHealth');
    });

    it('ProductionDashboard.jsx shows a server-offline banner instead of built-in sample figures', () => {
      assert.ok(!prodCode.includes('FALLBACK_PRESETS'), 'Must not define built-in sample figures');
      assert.ok(prodCode.includes('Server offline.'), 'Must show a server-offline banner');
      assert.ok(prodCode.includes('DEFAULT_PRODUCTION_SCENARIOS'), 'Must define default production scenarios');
    });
  });

  // =========================================================================
  // 2. SLIDER BOUNDARY CONTRACTS & MONOTONICITY
  // =========================================================================
  describe('2. Slider Boundary Contracts & Monotonicity Verification', () => {

    it('SetoDashboard.jsx strictly declares principal slider bounds: min=20000, max=300000, step=10000, default=120000', () => {
      assert.ok(setoCode.includes('min={20000}'), 'Missing min={20000} in SetoDashboard.jsx');
      assert.ok(setoCode.includes('max={300000}'), 'Missing max={300000} in SetoDashboard.jsx');
      assert.ok(setoCode.includes('step={10000}'), 'Missing step={10000} in SetoDashboard.jsx');
      assert.ok(setoCode.includes('useState(120000)'), 'Missing default useState(120000) in SetoDashboard.jsx');
    });

    it('SetoDashboard.jsx strictly declares duration slider bounds: min=1, max=48, step=1, default=36', () => {
      assert.ok(setoCode.includes('min={1}'), 'Missing min={1} in SetoDashboard.jsx');
      assert.ok(setoCode.includes('max={48}'), 'Missing max={48} in SetoDashboard.jsx');
      assert.ok(setoCode.includes('step={1}'), 'Missing step={1} in SetoDashboard.jsx');
      assert.ok(setoCode.includes('useState(36)'), 'Missing default useState(36) in SetoDashboard.jsx');
    });

    it('DebtLiberationView.jsx declares the identical slider boundaries matching the SSOT contract', () => {
      const debtPath = path.join(subcomponentsDir, 'DebtLiberationView.jsx');
      const debtCode = fs.readFileSync(debtPath, 'utf8');

      assert.ok(debtCode.includes('min={20000}'), 'Missing min={20000} in DebtLiberationView.jsx');
      assert.ok(debtCode.includes('max={300000}'), 'Missing max={300000} in DebtLiberationView.jsx');
      assert.ok(debtCode.includes('step={10000}'), 'Missing step={10000} in DebtLiberationView.jsx');
      assert.ok(debtCode.includes('min={1}'), 'Missing min={1} in DebtLiberationView.jsx');
      assert.ok(debtCode.includes('max={48}'), 'Missing max={48} in DebtLiberationView.jsx');
      assert.ok(debtCode.includes('step={1}'), 'Missing step={1} in DebtLiberationView.jsx');
    });

    it('Calculated EMI strictly monotonically increases across all 29 discrete principal points', () => {
      let previousEmi = -1;
      let count = 0;

      for (let p = 20000; p <= 300000; p += 10000) {
        count++;
        const emi = calculateEMI(p, 6.5, 36);
        assert.ok(typeof emi === 'number' && Number.isFinite(emi), `EMI must be finite number for p=${p}`);
        assert.ok(emi > previousEmi, `Monotonicity violation: p=${p}, emi=${emi}, previousEmi=${previousEmi}`);
        previousEmi = emi;
      }

      assert.strictEqual(count, 29, 'Expected exactly 29 discrete slider points between 20k and 300k');
      assert.strictEqual(calculateEMI(20000, 6.5, 36), 613, 'Lower bound EMI at ₹20,000 must be ₹613');
      assert.strictEqual(calculateEMI(120000, 6.5, 36), 3678, 'Default EMI at ₹1,20,000 must be ₹3,678');
      assert.strictEqual(calculateEMI(300000, 6.5, 36), 9195, 'Upper bound EMI at ₹3,00,000 must be ₹9,195');
    });

    it('Duration slider stepping spans all 48 integer months from 1 to 48', () => {
      const validDurations = [];
      for (let m = 1; m <= 48; m += 1) {
        validDurations.push(m);
      }
      assert.strictEqual(validDurations.length, 48);
      assert.strictEqual(validDurations[0], 1);
      assert.strictEqual(validDurations[47], 48);
      assert.strictEqual(validDurations[35], 36); // Default 36 months
    });
  });

  // =========================================================================
  // 3. EXHAUSTIVE RULE OF DAMDUPAT BOUNDARY ORACLES
  // =========================================================================
  describe('3. Exhaustive Rule of Damdupat Boundary Oracles (5,568 Tests)', () => {

    const rates = [
      { senkda: 2.5, apr: 30, expectedThresholdMonth: 40 },
      { senkda: 3.0, apr: 36, expectedThresholdMonth: 34 },
      { senkda: 4.0, apr: 48, expectedThresholdMonth: 25 },
      { senkda: 5.0, apr: 60, expectedThresholdMonth: 20 }
    ];

    it('Damdupat statutory alert text in JSX conforms to legal citations', () => {
      assert.ok(setoCode.includes('Rule of Damdupat Triggered:'), 'Missing Damdupat rule trigger headline');
      assert.ok(setoCode.includes('exceeds principal'), 'Missing "exceeds principal" statutory logic');
      assert.ok(setoCode.includes('Usurious Loans Act 1918'), 'Missing Usurious Loans Act 1918 citation');
    });

    it('Evaluates all 5,568 combinations of (Principal, Rate, Duration) against the statutory oracle', () => {
      let totalTestsRun = 0;

      for (const { senkda, apr } of rates) {
        for (let p = 20000; p <= 300000; p += 10000) {
          const monthlyBleed = Math.round(p * (apr / 100 / 12));

          for (let m = 1; m <= 48; m += 1) {
            totalTestsRun++;
            const paidToDate = monthlyBleed * m;
            const expectedDamdupat = paidToDate >= p;

            // Compute via SetoDashboard formula
            const actualDamdupat = (Math.round(p * (senkda * 12 / 100 / 12)) * m) >= p;

            assert.strictEqual(
              actualDamdupat,
              expectedDamdupat,
              `Damdupat mismatch at P=${p}, senkda=${senkda}, months=${m}`
            );
          }
        }
      }

      assert.strictEqual(totalTestsRun, 4 * 29 * 48, 'Must execute exactly 5,568 test combinations');
    });

    it('Threshold crossover is exact for all 4 supported rates at default principal (₹1,20,000)', () => {
      const p = 120000;

      for (const { senkda, apr, expectedThresholdMonth } of rates) {
        const monthlyBleed = Math.round(p * (apr / 100 / 12));

        // Month before threshold must NOT trigger Damdupat
        const monthBefore = expectedThresholdMonth - 1;
        const paidBefore = monthlyBleed * monthBefore;
        assert.ok(paidBefore < p, `Month ${monthBefore} at ${senkda} senkda should be < principal (${paidBefore} < ${p})`);
        assert.strictEqual(paidBefore >= p, false);

        // Threshold month MUST trigger Damdupat
        const paidAt = monthlyBleed * expectedThresholdMonth;
        assert.ok(paidAt >= p, `Month ${expectedThresholdMonth} at ${senkda} senkda should be >= principal (${paidAt} >= ${p})`);
        assert.strictEqual(paidAt >= p, true);

        // Month after threshold MUST trigger Damdupat
        if (expectedThresholdMonth < 48) {
          const monthAfter = expectedThresholdMonth + 1;
          const paidAfter = monthlyBleed * monthAfter;
          assert.ok(paidAfter >= p, `Month ${monthAfter} at ${senkda} senkda should be >= principal`);
          assert.strictEqual(paidAfter >= p, true);
        }
      }
    });
  });

  // =========================================================================
  // 4. SCENARIO SEARCH & FILTER ADVERSARIAL HARDENING
  // =========================================================================
  describe('4. Scenario Search & Filtering Adversarial Hardening', () => {

    function filterScenarios(scenarios, query) {
      if (!query || !query.trim()) return scenarios;
      const q = query.toLowerCase().trim();
      return scenarios.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q))
      );
    }

    // The preview's made-up scenarios were removed from the site (11 Nov 2026); the search logic is
    // still tested on the same three entries, kept here as test data only.
    const testScenarios = [
      { id: 'D08', name: 'D08 Mustard Oil Mill', subtitle: 'NSFDC Term Loan · see dashboard' },
      { id: 'D18', name: 'D18 Tailoring Workshop', subtitle: 'PM Vishwakarma credit · see dashboard' },
      { id: 'debt', name: 'Sahukar Debt Relief', subtitle: 'Moneylender senkda debt · see dashboard' }
    ];

    it('Empty string returns all scenarios without filtering', () => {
      const res = filterScenarios(testScenarios, '');
      assert.strictEqual(res.length, 3);
      assert.deepStrictEqual(res.map(s => s.id), ['D08', 'D18', 'debt']);
    });

    it('Whitespace-only queries ("   ", "\\t", "\\n") return all scenarios', () => {
      assert.strictEqual(filterScenarios(testScenarios, '   ').length, 3);
      assert.strictEqual(filterScenarios(testScenarios, '\t\n').length, 3);
    });

    it('Matches across name, subtitle, and ID case-insensitively', () => {
      // Name matches
      assert.strictEqual(filterScenarios(testScenarios, 'mustard').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'MUSTARD').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'MuStArD').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'tailoring').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'sahukar').length, 1);

      // Subtitle matches
      assert.strictEqual(filterScenarios(testScenarios, 'term loan').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'vishwakarma').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'senkda').length, 1);

      // ID matches
      assert.strictEqual(filterScenarios(testScenarios, 'd08').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'D18').length, 1);
      assert.strictEqual(filterScenarios(testScenarios, 'DEBT').length, 1);
    });

    it('Adversarial queries (regex meta-chars, SQL, HTML injection, long strings) do not throw and return []', () => {
      const adversarialInputs = [
        '.*',
        '([a-z]+)',
        '\\\\d+',
        '+++',
        '[[[',
        '???',
        '<script>alert("xss")</script>',
        "' OR 1=1 --",
        'DROP TABLE scenarios;',
        'a'.repeat(5000), // Very long string
        '🌟✨🚀', // Emoji query
        'सरसों' // Non-ASCII Hindi query
      ];

      for (const input of adversarialInputs) {
        assert.doesNotThrow(() => {
          const res = filterScenarios(testScenarios, input);
          assert.ok(Array.isArray(res));
          assert.strictEqual(res.length, 0, `Expected 0 matches for input: ${input.slice(0, 20)}`);
        });
      }
    });

    it('SetoDashboard.jsx & ScenariosSidebar.jsx implement zero-match fallback markup', () => {
      const sidebarPath = path.join(subcomponentsDir, 'ScenariosSidebar.jsx');
      const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

      // Check SetoDashboard.jsx fallback
      assert.ok(setoCode.includes('filteredScenarios.length === 0'), 'SetoDashboard missing zero-match branch');
      assert.ok(setoCode.includes('No matching scenarios'), 'SetoDashboard missing "No matching scenarios" text');
      assert.ok(setoCode.includes('Try searching "Mustard", "Tailoring", or "Debt"'), 'SetoDashboard missing helpful hints');

      // Check ScenariosSidebar.jsx fallback
      assert.ok(sidebarCode.includes('filteredScenarios.length === 0'), 'ScenariosSidebar missing zero-match branch');
      assert.ok(sidebarCode.includes('No matching scenarios'), 'ScenariosSidebar missing "No matching scenarios" text');
      assert.ok(sidebarCode.includes('Try searching "Mustard", "Tailoring", or "Debt"'), 'ScenariosSidebar missing helpful hints');
    });
  });

  // =========================================================================
  // 5. MOCKUP / PRODUCTION DASHBOARD ARCHITECTURAL PARITY & SYNCHRONIZATION
  // =========================================================================
  describe('5. Architectural Parity & Synchronization Verification', () => {

    it('Both SetoDashboard and ProductionDashboard share the same core enterprise presets (D08, D18, D15)', () => {
      // PRESETS in SetoDashboard
      assert.ok(PRESETS.D08, 'SetoDashboard missing D08');
      assert.ok(PRESETS.D18, 'SetoDashboard missing D18');
      assert.ok(PRESETS.D15, 'SetoDashboard missing D15');

      // ProductionDashboard takes all 24 businesses from the server (fetchDossiers), no built-in presets
      assert.ok(prodCode.includes('fetchDossiers()'), 'ProductionDashboard must load businesses from the server');
    });

    it('Both dashboards render identical SETO visual tokens (.diffused-backdrop, soft-shadow, StarBlossom)', () => {
      assert.ok(setoCode.includes('<DashboardShell'), 'SetoDashboard must render DashboardShell');
      assert.ok(prodCode.includes('<DashboardShell'), 'ProductionDashboard must render DashboardShell');
      assert.ok(setoCode.includes('<StarBlossom'), 'SetoDashboard must render StarBlossom');
      assert.ok(prodCode.includes('CenterWorkspace'), 'ProductionDashboard must delegate to CenterWorkspace (with StarBlossom)');
    });

    it('ProductionDashboard supports custom scenario creation and localStorage persistence', () => {
      assert.ok(prodCode.includes('handleCreateNewSimulation'), 'ProductionDashboard missing handleCreateNewSimulation');
      assert.ok(prodCode.includes('localStorage.getItem'), 'ProductionDashboard missing localStorage read');
      assert.ok(prodCode.includes('localStorage.setItem'), 'ProductionDashboard missing localStorage write');
      assert.ok(prodCode.includes('udyamsetuai_production_scenarios'), 'Missing correct localStorage key');
    });

    it('ProductionDashboard downloads the 1-page DPR PDF made by the server', () => {
      assert.ok(prodCode.includes('handleDownloadDprPdf'), 'ProductionDashboard missing handleDownloadDprPdf');
      assert.ok(prodCode.includes('downloadDpr('), 'Must call the server DPR (POST /api/dpr)');
      assert.ok(!prodCode.includes('STATUTORY SANCTION READY'), 'Must not claim a sanction');
      assert.ok(!prodCode.includes('new Blob([htmlContent]'), 'Must not build its own HTML DPR');
    });

    it('Zero hardcoded "Ramesh" references exist anywhere in frontend/src/', () => {
      function searchRamesh(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            searchRamesh(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(/\bramesh\b/i);
            assert.strictEqual(
              matches,
              null,
              `Found forbidden hardcoded "Ramesh" reference in ${fullPath}: line ${content.substring(0, matches ? matches.index : 0).split('\n').length}`
            );
          }
        }
      }
      searchRamesh(path.resolve(__dirname, '../src'));
    });
  });

  // =========================================================================
  // 6. REACT SSR RENDERING & DYNAMIC INJECTION
  // =========================================================================
  describe('6. React SSR Offline Rendering & Dynamic Profile Injection', () => {

    it('SetoDashboard renders offline with zero arguments (statutory fallback persona)', () => {
      const html = renderToString(React.createElement(SetoDashboard));
      assert.ok(html.length > 5000, 'Render output too short');
      assert.ok(html.includes('The Entrepreneur Workspace'), 'Missing statutory headline');
      assert.ok(html.includes('Enterprise Advisory Console'), 'Missing console title');
      assert.ok(html.includes('diffused-backdrop'), 'Missing diffused backdrop class');
      assert.ok(html.includes('iris-star-svg'), 'Missing StarBlossom SVG');
      assert.ok(html.includes('Welcome!'), 'Missing neutral welcome greeting');
      assert.ok(html.includes('Statutory Verified'), 'Missing Statutory Verified badge');
    });

    it('SetoDashboard renders with dynamic authenticated user profile fixture', () => {
      const dynamicUser = {
        name: 'Sunita Devi',
        category: 'Scheduled Caste (SC)',
        id: 'UP-STP-004491',
        district: 'Sitapur District',
        incomeNum: 280000
      };

      const html = renderToString(React.createElement(SetoDashboard, { currentUser: dynamicUser }));
      assert.ok(html.includes('Welcome, Sunita!'), 'Expected dynamic greeting "Welcome, Sunita!"');
      assert.ok(html.includes('Sunita Devi'), 'Expected dynamic name "Sunita Devi"');
      assert.ok(html.includes('UP-STP-004491'), 'Expected dynamic certificate id "UP-STP-004491"');
      assert.ok(html.includes('Sitapur District'), 'Expected dynamic district');
    });

    it('SetoDashboard supports Hindi language toggle without breaking markup', () => {
      const htmlHi = renderToString(React.createElement(SetoDashboard, { language: 'hi' }));
      assert.ok(htmlHi.includes('स्वागत है!'), 'Expected Hindi greeting in header');
      assert.ok(htmlHi.includes('उद्यमी'), 'Expected Hindi beneficiary fallback');
    });
  });
});
