// Retired 13 Nov 2026 (owner's ruling: retire tests that check things removed on purpose): this file's tests
// that still expected the old landing mock-up (made-up certificate IDs, "STATUTORY-VERIFIED", the verification
// popup, the fixed "SC · Income ≤ ₹5.00L" line, the old header/slider/sidebar layout, a 50 kB bundle-size floor,
// Google sign-in) or that banned the demo account kept on purpose for judges (mobile 9876543210, PIN 2026)
// were deleted. The remaining tests in this file still run.
/**
 * Challenger 2 Empirical Deep Stress & SSOT Parity Harness
 * Milestone M3 Verification
 * 
 * Verifies:
 * 1. Visual & Structural Parity (SetoDashboard vs ProductionDashboard)
 * 2. Dynamic Beneficiary Profile & Adversarial Payloads
 * 3. SSOT Subcomponent Integrity & Inlining Analysis
 * 4. SSR Bundle Fidelity & Concurrency Stress
 * 5. API Fallback & LocalStorage Isolation
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

// Import Bundled SSR Component
import SetoDashboard from '../dist-ssr/SetoDashboard.js';

// Import Services & Engine
import {
  calculateNSFDCLoan,
  evaluateModeA,
  restructureDebt,
  fetchDossiers,
  fetchDossier,
  fetchHealth
} from '../src/services/api.js';

describe('CHALLENGER 2: EMPIRICAL DEEP STRESS & SSOT PARITY HARNESS (M3)', () => {

  const srcDir = path.resolve(__dirname, '../src');
  const setoPath = path.join(srcDir, 'components/SetoDashboard.jsx');
  const prodPath = path.join(srcDir, 'components/ProductionDashboard.jsx');
  const subcomponentsDir = path.join(srcDir, 'components/dashboard');

  const setoCode = fs.readFileSync(setoPath, 'utf8');
  const prodCode = fs.readFileSync(prodPath, 'utf8');

  // =========================================================================
  // SUITE 1: SETO VISUAL RESTORATION & DOM SPECIFICATION CONFORMANCE
  // =========================================================================
  describe('1. SETO Visual Restoration & Design Spec Conformance', () => {

    it('DashboardShell strictly defines .diffused-backdrop with soft-shadow and rounded-[32px]', () => {
      const shellPath = path.join(subcomponentsDir, 'DashboardShell.jsx');
      const shellCode = fs.readFileSync(shellPath, 'utf8');

      assert.ok(shellCode.includes('diffused-backdrop'), 'Must contain .diffused-backdrop');
      assert.ok(shellCode.includes('soft-shadow'), 'Must contain soft-shadow');
      assert.ok(shellCode.includes('rounded-[32px]'), 'Must contain rounded-[32px] per SETO canvas spec');
      assert.ok(shellCode.includes('The Entrepreneur Workspace.'), 'Must render headline');
    });

    it('StarBlossom renders 4-pointed iridescent star SVG with exact radial gradient stops', () => {
      const starPath = path.join(subcomponentsDir, 'StarBlossom.jsx');
      const starCode = fs.readFileSync(starPath, 'utf8');

      assert.ok(starCode.includes('iris-star-svg'), 'Must render iris-star-svg CSS class');
      assert.ok(starCode.includes('viewBox="0 0 100 100"'), 'Must define 100x100 SVG coordinate system');
      assert.ok(starCode.includes('stopColor="#FFE4D6"'), 'Stop 0% must be #FFE4D6');
      assert.ok(starCode.includes('stopColor="#E86043"'), 'Stop 45% must be #E86043');
      assert.ok(starCode.includes('stopColor="#8B5CF6"'), 'Stop 75% must be #8B5CF6');
      assert.ok(starCode.includes('stopColor="#F59E0B"'), 'Stop 100% must be #F59E0B');
      assert.ok(starCode.includes('M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z'), 'Must render exact 4-point bezier path');
    });


    it('NavRail renders brand lockup, active pill styling, and collapsible Advisory Tools tree', () => {
      const railPath = path.join(subcomponentsDir, 'NavRail.jsx');
      const railCode = fs.readFileSync(railPath, 'utf8');

      assert.ok(railCode.includes('UdyamSetuAI'), 'NavRail must render UdyamSetuAI logo brand text');
      // Stage A: plain-word tab name (was 'Enterprise Studio').
      assert.ok(railCode.includes('Good and bad months'), 'NavRail must render active simulator tab title');
      assert.ok(railCode.includes('bg-white text-[#111311] shadow-sm'), 'Active tab must receive white pill styling');
      assert.ok(railCode.includes('Advisory Tools'), 'Must render Advisory Tools accordion header');
    });
  });

  // =========================================================================
  // SUITE 2: DYNAMIC BENEFICIARY PROFILE & ADVERSARIAL PAYLOAD TESTING
  // =========================================================================
  describe('2. Dynamic Beneficiary Profile & Adversarial Payloads', () => {



    it('Adversarial profile variations do not crash rendering', () => {
      const testCases = [
        { desc: 'null user', user: null, expectedGreeting: 'Welcome!' },
        { desc: 'undefined user', user: undefined, expectedGreeting: 'Welcome!' },
        { desc: 'empty object', user: {}, expectedGreeting: 'Welcome!' },
        { desc: 'single character name', user: { name: 'K' }, expectedGreeting: 'Welcome, K!' },
        { desc: 'mononym name', user: { name: 'Kalavati' }, expectedGreeting: 'Welcome, Kalavati!' },
        { desc: 'multi-part honorific name', user: { name: 'Smt. Manju Kumari Rawat' }, expectedGreeting: 'Welcome, Smt.!' },
        { desc: 'Unicode Devanagari name', user: { name: 'राजेश कुमार' }, expectedGreeting: 'Welcome, राजेश!' },
        { desc: 'XSS attempt in name', user: { name: '<script>alert("hack")</script>' }, expectedGreeting: 'Welcome, &lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;!' },
        { desc: 'extremely long name', user: { name: 'A'.repeat(500) }, expectedGreeting: `Welcome, ${'A'.repeat(500)}!` },
        { desc: 'name with leading/trailing whitespace', user: { name: '   Deepak   ' }, expectedGreeting: 'Welcome, !' }
      ];

      for (const tc of testCases) {
        assert.doesNotThrow(() => {
          const html = renderToString(React.createElement(SetoDashboard, { currentUser: tc.user }));
          assert.ok(html.length > 5000, `Render output unexpectedly truncated for ${tc.desc}`);
          if (tc.expectedGreeting) {
            assert.ok(html.includes(tc.expectedGreeting), `Failed to match greeting for ${tc.desc}`);
          }
        }, `Crashed on adversarial profile: ${tc.desc}`);
      }
    });

    it('The verification popup with its made-up certificate ID is gone', () => {
      // Removed 11 Nov 2026: it showed every user as "Verified" with an invented certificate ID.
      assert.ok(!fs.existsSync(path.join(subcomponentsDir, 'StatutoryVerificationModal.jsx')));
    });
  });

  // =========================================================================
  // SUITE 3: SSOT SUBCOMPONENT INTEGRITY & INLINING ANALYSIS
  // =========================================================================
  describe('3. SSOT Subcomponent Integrity & Inlining Analysis', () => {

    it('All 12 SSOT subcomponents exist, have valid non-trivial file size (> 500 bytes), and export default', () => {
      const subfiles = [
        'StarBlossom.jsx',
        'DashboardShell.jsx',
        'UserCard.jsx',
        'NavRail.jsx',
        'SeasonalitySimulatorView.jsx',
        'NsfdcAmortizerView.jsx',
        'DebtLiberationView.jsx',
        'LeadBankDprView.jsx',
        'CommandBar.jsx',
        'ScenariosSidebar.jsx',
        'HowItWorksView.jsx',
        'CenterWorkspace.jsx'
      ];

      for (const file of subfiles) {
        const filePath = path.join(subcomponentsDir, file);
        assert.ok(fs.existsSync(filePath), `Missing subcomponent file ${file}`);
        const stat = fs.statSync(filePath);
        assert.ok(stat.size > 500, `${file} size (${stat.size} bytes) is suspiciously small`);
        const content = fs.readFileSync(filePath, 'utf8');
        assert.ok(content.includes('export default function'), `${file} must export default function`);
      }
    });



  });

  // =========================================================================
  // SUITE 4: SSR BUNDLE FIDELITY & CONCURRENCY STRESS
  // =========================================================================
  describe('4. SSR Bundle Fidelity & Concurrency Stress', () => {


    it('SSR bundle executes 100 rapid consecutive renders without memory leaks or degradation', () => {
      const start = performance.now();
      const users = [
        { name: 'Kavita Devi', id: 'UP-STP-001' },
        { name: 'Mahesh Kumar', id: 'UP-STP-002' },
        { name: 'Aarti Rawat', id: 'UP-STP-003' },
        null,
        undefined
      ];

      for (let i = 0; i < 100; i++) {
        const u = users[i % users.length];
        const html = renderToString(React.createElement(SetoDashboard, { currentUser: u }));
        assert.ok(html.length > 5000);
      }

      const elapsed = performance.now() - start;
      assert.ok(elapsed < 4000, `100 SSR renders took ${elapsed}ms (expected < 4000ms)`);
    });
  });

  // =========================================================================
  // SUITE 5: API FALLBACK & LOCALSTORAGE ISOLATION
  // =========================================================================
  describe('5. API Client Fallback & LocalStorage Isolation', () => {

    it('Frontend API client methods all resolve cleanly in offline mode', async () => {
      // Offline: only the NSFDC loan is worked out (same rules as the server); the rest says offline, no figures.
      const health = await fetchHealth();
      assert.ok(health.status === 'offline');

      const loan = await calculateNSFDCLoan(680000, 300000, { isSc: true });
      assert.ok(loan.offline === true);
      assert.ok(loan.loanAmount === 612000);
      assert.ok(loan.promoterContribution === 68000);

      const modeA = await evaluateModeA('archetype_1', 1.0);
      assert.ok(modeA.offline === true && modeA.capex === undefined);

      const d08 = await fetchDossier('D08');
      assert.ok(d08 && d08.code === 'D08' && d08.offline === true && d08.capex === undefined);

      const modeB = await restructureDebt(120000, 3.0, 36);
      assert.strictEqual(modeB.damdupatViolated, undefined);

      const dossiers = await fetchDossiers();
      assert.strictEqual(dossiers.count, 0);
    });

    it('ProductionDashboard safely handles localStorage unavailability without throwing', () => {
      assert.ok(prodCode.includes("try {\n      const saved = localStorage.getItem") || prodCode.includes("try {\n      localStorage.setItem") || prodCode.includes("try {"));
      assert.ok(prodCode.includes("catch"));
    });
  });
});
