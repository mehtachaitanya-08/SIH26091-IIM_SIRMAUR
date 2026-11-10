import React from '../../../frontend/node_modules/react/index.js';
import { renderToString } from '../../../frontend/node_modules/react-dom/server.node.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Financial Engine
import {
  calculateEMI,
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule
} from '../../../frontend/src/engine.js';

// Import Compiled SSR Component
import SetoDashboard from '../../../frontend/dist-ssr/SetoDashboard.js';

console.log('--- TEST 1: SOURCE CODE AUDIT ---');
const srcPath = path.resolve(__dirname, '../../../frontend/src/components/SetoDashboard.jsx');
const src = fs.readFileSync(srcPath, 'utf8');

// Assert removal of prototypeEmi = 1140
assert.strictEqual(src.includes('prototypeEmi = 1140'), false, 'FATAL: Found hardcoded prototypeEmi = 1140 in SetoDashboard.jsx');
assert.strictEqual(src.includes('prototypeEmi = 1140;'), false, 'FATAL: Found hardcoded prototypeEmi = 1140; in SetoDashboard.jsx');

// Assert genuine calculateEMI call
assert.ok(src.includes('const prototypeEmi = calculateEMI(p, 6.5, 36);'), 'FATAL: Missing authentic calculateEMI(p, 6.5, 36) call');
assert.ok(src.includes('calculateEMI'), 'calculateEMI must be imported and used');

// Assert dynamic search filtering
assert.ok(src.includes('filteredScenarios'), 'Missing filteredScenarios memo');
assert.ok(src.includes('filteredScenarios.map'), 'Must render filteredScenarios.map');
assert.ok(src.includes('No matching scenarios'), 'Must have empty state feedback');

// Assert dynamic tenure slider & Damdupat reachability
assert.ok(src.includes('debtMonthsActive'), 'Missing debtMonthsActive state');
assert.ok(src.includes('setDebtMonthsActive'), 'Missing setDebtMonthsActive handler');
assert.ok(src.includes('damdupatViolated'), 'Missing damdupatViolated condition check');
assert.ok(src.includes('Rule of Damdupat Triggered'), 'Missing Damdupat warning banner');
console.log('Test 1 PASSED: Source code assertions verified.');

console.log('--- TEST 2: DEFAULT SSR RENDERING ---');
const defaultHtml = renderToString(React.createElement(SetoDashboard));
assert.ok(defaultHtml.includes('The Entrepreneur Workspace'), 'Missing headline in SSR');
assert.ok(defaultHtml.includes('Welcome, Ramesh!'), 'Missing greeting in SSR');
assert.ok(defaultHtml.includes('D08 Mustard Oil Mill'), 'Missing D08 scenario in default list');
assert.ok(defaultHtml.includes('D18 Tailoring Workshop'), 'Missing D18 scenario in default list');
assert.ok(defaultHtml.includes('Sahukar Debt Relief'), 'Missing Sahukar scenario in default list');
console.log('Test 2 PASSED: Default SSR HTML rendered correctly.');

console.log('--- TEST 3: TAB & STATE RENDERING TESTS VIA REACT HOOK INSTRUMENTATION ---');

// In React 19 SSR, useState returns [initialState, dispatch].
// We can intercept React.useState to inject different scenarios.
function renderWithStateOverrides(overrides) {
  const origUseState = React.useState;
  try {
    React.useState = function(initial) {
      if (typeof initial === 'string' && initial === 'home' && overrides.activeTab !== undefined) {
        return [overrides.activeTab, () => {}];
      }
      if (typeof initial === 'number' && initial === 120000 && overrides.debtPrincipal !== undefined) {
        return [overrides.debtPrincipal, () => {}];
      }
      if (typeof initial === 'number' && initial === 3.0 && overrides.debtRateSenkda !== undefined) {
        return [overrides.debtRateSenkda, () => {}];
      }
      if (typeof initial === 'number' && initial === 36 && overrides.debtMonthsActive !== undefined) {
        return [overrides.debtMonthsActive, () => {}];
      }
      if (typeof initial === 'string' && initial === '' && overrides.searchQuery !== undefined) {
        return [overrides.searchQuery, () => {}];
      }
      return origUseState.call(React, initial);
    };

    return renderToString(React.createElement(SetoDashboard));
  } finally {
    React.useState = origUseState;
  }
}

// 3.1 Restructure Tab at default (₹1,20,000, 36 months):
// EMI = calculateEMI(120000, 6.5, 36) = 3678
// Paid = 120000 * 0.03 * 36 = 129600 >= 120000 -> Damdupat triggered!
const restructureHtmlDefault = renderWithStateOverrides({ activeTab: 'restructure' });

assert.ok(restructureHtmlDefault.includes('Moneylender Consolidation Calculator'), 'Restructure tab header not found');
assert.ok(restructureHtmlDefault.includes('3,678'), 'Expected concessional EMI ₹3,678 not found in DOM!');
assert.strictEqual(restructureHtmlDefault.includes('1,140'), false, 'FATAL: Found hardcoded 1,140 in restructure tab DOM!');
assert.ok(restructureHtmlDefault.includes('Rule of Damdupat Triggered'), 'Damdupat warning should be triggered at 36 months');
assert.ok(restructureHtmlDefault.includes('1,29,600'), 'Total paid ₹1,29,600 not found in Damdupat warning');
console.log('Test 3.1 PASSED: Restructure tab renders genuine EMI (₹3,678) and active Damdupat warning.');

// 3.2 Restructure Tab with short duration (16 months):
// Paid = 3600 * 16 = 57600 < 120000 -> Damdupat should NOT be triggered
const restructureHtml16m = renderWithStateOverrides({ activeTab: 'restructure', debtMonthsActive: 16 });
assert.strictEqual(restructureHtml16m.includes('Rule of Damdupat Triggered'), false, 'Damdupat warning should NOT appear at 16 months');
console.log('Test 3.2 PASSED: Damdupat warning dynamically disappears when duration drops below threshold.');

// 3.3 Restructure Tab with higher principal (₹3,00,000):
// EMI = calculateEMI(300000, 6.5, 36) = 9195
const restructureHtml300k = renderWithStateOverrides({ activeTab: 'restructure', debtPrincipal: 300000 });
assert.ok(restructureHtml300k.includes('9,195'), 'Expected concessional EMI ₹9,195 for ₹3,00,000 principal not found in DOM!');
assert.strictEqual(restructureHtml300k.includes('1,140'), false, 'Found hardcoded 1,140 in DOM with ₹3,00,000 principal!');
console.log('Test 3.3 PASSED: Restructure tab dynamically scales EMI to ₹9,195 at ₹3,00,000 principal.');

// 3.4 Search Query Filtering: "Mustard"
const searchMustardHtml = renderWithStateOverrides({ searchQuery: 'Mustard' });
assert.ok(searchMustardHtml.includes('D08 Mustard Oil Mill'), 'Mustard mill must be in filtered results');
assert.strictEqual(searchMustardHtml.includes('D18 Tailoring Workshop'), false, 'Tailoring workshop must be filtered out');
assert.strictEqual(searchMustardHtml.includes('Sahukar Debt Relief'), false, 'Sahukar debt relief must be filtered out');
console.log('Test 3.4 PASSED: searchQuery="Mustard" accurately isolates D08 scenario.');

// 3.5 Search Query Filtering: "NonExistentTrade" -> Empty State
const searchEmptyHtml = renderWithStateOverrides({ searchQuery: 'NonExistentTrade' });
assert.ok(searchEmptyHtml.includes('No matching scenarios'), 'Empty state must be displayed');
assert.strictEqual(searchEmptyHtml.includes('D08 Mustard Oil Mill'), false, 'D08 should not be displayed in empty state');
console.log('Test 3.5 PASSED: Empty search result displays "No matching scenarios" feedback.');

console.log('\n--- ALL CHECK 4 DOM TESTS PASSED EMPIRICALLY ---');
