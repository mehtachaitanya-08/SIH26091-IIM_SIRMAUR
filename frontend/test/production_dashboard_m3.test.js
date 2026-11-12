/**
 * Milestone M3 Empirical Verification Test Suite
 * Validates Modular SSOT Dashboard Architecture, SETO Visual Tokens,
 * ProductionDashboard functionality, and synchronization with SetoDashboard.
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

describe('Milestone M3: Modular SSOT Dashboard & Synchronization Suite', () => {

  const componentsDir = path.resolve(__dirname, '../src/components/dashboard');

  describe('1. SSOT Subcomponent Integrity & File System Verification', () => {
    const requiredComponents = [
      'StarBlossom.jsx',
      'DashboardShell.jsx',
      'UserCard.jsx',
      'NavRail.jsx',
      'CenterWorkspace.jsx',
      'SeasonalitySimulatorView.jsx',
      'NsfdcAmortizerView.jsx',
      'DebtLiberationView.jsx',
      'LeadBankDprView.jsx',
      'CommandBar.jsx',
      'ScenariosSidebar.jsx',
      // StatutoryVerificationModal.jsx was removed on 11 Nov 2026 (made-up certificate ID).
      'HowItWorksView.jsx'
    ];

    for (const comp of requiredComponents) {
      it(`Modular subcomponent ${comp} exists on disk and is non-empty`, () => {
        const filePath = path.join(componentsDir, comp);
        assert.ok(fs.existsSync(filePath), `Missing ${comp} under src/components/dashboard/`);
        const stats = fs.statSync(filePath);
        assert.ok(stats.size > 200, `${comp} is suspiciously small (< 200 bytes)`);
      });
    }

    it('ProductionDashboard.jsx exists and imports api.js client', () => {
      const prodPath = path.resolve(__dirname, '../src/components/ProductionDashboard.jsx');
      assert.ok(fs.existsSync(prodPath), 'ProductionDashboard.jsx missing');
      const prodCode = fs.readFileSync(prodPath, 'utf8');
      assert.ok(prodCode.includes("from '../services/api'"), 'ProductionDashboard must import api.js service');
      assert.ok(prodCode.includes('calculateNSFDCLoan'), 'ProductionDashboard must call calculateNSFDCLoan');
      assert.ok(prodCode.includes('restructureDebt'), 'ProductionDashboard must call restructureDebt');
      assert.ok(prodCode.includes('fetchDossiers'), 'ProductionDashboard must call fetchDossiers');
      assert.ok(prodCode.includes('udyamsetuai_production_scenarios'), 'ProductionDashboard must support scenario persistence');
    });
  });

  describe('2. SETO Visual Styling Restoration (.diffused-backdrop & <StarBlossom />)', () => {
    it('DashboardShell incorporates .diffused-backdrop and soft-shadow classes', () => {
      const shellPath = path.join(componentsDir, 'DashboardShell.jsx');
      const shellCode = fs.readFileSync(shellPath, 'utf8');
      assert.ok(shellCode.includes('diffused-backdrop'), 'DashboardShell must render .diffused-backdrop class');
      assert.ok(shellCode.includes('soft-shadow'), 'DashboardShell must render .soft-shadow class');
      assert.ok(shellCode.includes('The Entrepreneur Workspace.'), 'DashboardShell must render statutory headline');
    });

    it('StarBlossom renders 4-pointed iridescent star SVG with radial gradient stops', () => {
      const starPath = path.join(componentsDir, 'StarBlossom.jsx');
      const starCode = fs.readFileSync(starPath, 'utf8');
      assert.ok(starCode.includes('iris-star-svg'), 'StarBlossom must use iris-star-svg class');
      assert.ok(starCode.includes('radialGradient'), 'StarBlossom must contain radialGradient');
      assert.ok(starCode.includes('#FFE4D6'), 'StarBlossom must include #FFE4D6 warm gradient stop');
      assert.ok(starCode.includes('#E86043'), 'StarBlossom must include #E86043 coral gradient stop');
      assert.ok(starCode.includes('#8B5CF6'), 'StarBlossom must include #8B5CF6 violet gradient stop');
      assert.ok(starCode.includes('#F59E0B'), 'StarBlossom must include #F59E0B amber gradient stop');
    });
  });

  describe('3. Dynamic Beneficiary & Subcomponent Source Code Contracts', () => {
    it('UserCard renders dynamic beneficiary details without Ramesh fallback', () => {
      const userCardPath = path.join(componentsDir, 'UserCard.jsx');
      const code = fs.readFileSync(userCardPath, 'utf8');
      assert.ok(code.includes('currentUser?.name'), 'UserCard must bind to currentUser.name');
      // Nothing about a user is checked, so the card claims no verification (11 Nov 2026).
      assert.ok(!code.includes('Profile Verified'), 'UserCard must not claim a verified profile');
      assert.ok(code.includes('self-declared'), 'UserCard must mark the user\'s own details as self-declared');
    });

    it('No verification popup and no made-up certificate ID anywhere in the dashboard', () => {
      // The popup showed "MoSJE/NSFDC/2026/<id>" as a certificate for every user; removed 11 Nov 2026.
      assert.ok(!fs.existsSync(path.join(componentsDir, 'StatutoryVerificationModal.jsx')));
      for (const f of fs.readdirSync(componentsDir)) {
        const code = fs.readFileSync(path.join(componentsDir, f), 'utf8');
        assert.ok(!code.includes('MoSJE/NSFDC/2026/'), `${f} still prints a certificate ID`);
      }
    });

    it('SeasonalitySimulatorView shows NOT FOUND, never a made-up curve or SAFE rating', () => {
      const simPath = path.join(componentsDir, 'SeasonalitySimulatorView.jsx');
      const code = fs.readFileSync(simPath, 'utf8');
      assert.ok(code.includes('Seasonality & Stress Simulator'));
      assert.ok(code.includes('NOT FOUND'));
      assert.ok(!code.includes('Solvency Rating: SAFE'));
    });

    it('NsfdcAmortizerView renders equated quarterly installments and moratorium rows', () => {
      const amortPath = path.join(componentsDir, 'NsfdcAmortizerView.jsx');
      const code = fs.readFileSync(amortPath, 'utf8');
      assert.ok(code.includes('NSFDC Statutory Amortizer'));
      assert.ok(code.includes('Moratorium'));
      assert.ok(code.includes('Amortizing'));
    });

    it('DebtLiberationView renders interactive sliders and Damdupat violation alert', () => {
      const debtPath = path.join(componentsDir, 'DebtLiberationView.jsx');
      const code = fs.readFileSync(debtPath, 'utf8');
      assert.ok(code.includes('Mode B · Informal Debt Refinancing'));
      assert.ok(code.includes('Rule of Damdupat Triggered:'));
      assert.ok(code.includes('Usurious Loans Act 1918'));
      assert.ok(code.includes('min={20000}'));
      assert.ok(code.includes('max={300000}'));
      assert.ok(code.includes('step={10000}'));
      assert.ok(code.includes('min={1}'));
      assert.ok(code.includes('max={48}'));
      assert.ok(code.includes('step={1}'));
    });

    it('LeadBankDprView renders Lead-Bank appraisal and download action', () => {
      const dprPath = path.join(componentsDir, 'LeadBankDprView.jsx');
      const code = fs.readFileSync(dprPath, 'utf8');
      assert.ok(code.includes('1-Page Detailed Project Report (DPR)'));
      assert.ok(code.includes('Download DPR PDF'));
      assert.ok(code.includes('not a loan sanction'));
    });
  });

  describe('4. Master Facade & Landing Page Synchronization', () => {
    it('SetoDashboard renders all 3 columns with StarBlossom and diffused canvas via SSR', () => {
      const html = renderToString(React.createElement(SetoDashboard));
      assert.ok(html.includes('diffused-backdrop'), 'SetoDashboard must include diffused-backdrop');
      assert.ok(html.includes('iris-star-svg'), 'SetoDashboard must render StarBlossom iris-star-svg');
      assert.ok(html.includes('Enterprise Advisory Console'), 'SetoDashboard must render Enterprise Advisory Console');
      assert.ok(html.includes('Recent scenarios'), 'SetoDashboard must render Recent scenarios sidebar');
    });

    it('SetoDashboard strictly adheres to offline isolation with zero network calls', () => {
      const setoPath = path.resolve(__dirname, '../src/components/SetoDashboard.jsx');
      const setoCode = fs.readFileSync(setoPath, 'utf8');
      assert.strictEqual(/\bfetch\s*\(/.test(setoCode), false);
      assert.strictEqual(/\baxios\b/.test(setoCode), false);
      assert.strictEqual(/\bXMLHttpRequest\b/.test(setoCode), false);
      assert.strictEqual(/\bWebSocket\b/.test(setoCode), false);
    });

    it('Codebase contains zero hardcoded mock Ramesh references in frontend/src/', () => {
      function scanDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(jsx?|tsx?)$/.test(file)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              // Ignore comments that explicitly mention test contract constraints
              if (line.includes('//') && line.includes('challenger')) return;
              assert.strictEqual(
                /\bramesh\b/i.test(line), 
                false, 
                `Found hardcoded "Ramesh" in ${fullPath}:${idx + 1} -> ${line.trim()}`
              );
            });
          }
        }
      }
      scanDir(path.resolve(__dirname, '../src'));
    });
  });
});
