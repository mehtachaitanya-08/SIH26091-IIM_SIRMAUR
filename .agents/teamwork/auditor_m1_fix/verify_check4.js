import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(path.resolve('package.json'));
const reactPath = 'file:///' + require.resolve('react').replace(/\\/g, '/');
const reactDomServerPath = 'file:///' + require.resolve('react-dom/server').replace(/\\/g, '/');

const { default: React } = await import(reactPath);
const { renderToString } = await import(reactDomServerPath);

console.log('================================================================');
console.log('FORENSIC AUDIT: CHECK 4 DYNAMIC BEHAVIOR & INTEGRITY VERIFICATION');
console.log('================================================================');

// 1. Static Source Code Assertions
const setoSourcePath = path.resolve('src/components/SetoDashboard.jsx');
const setoCode = fs.readFileSync(setoSourcePath, 'utf8');

console.log('\n[Phase 1] Static Code Inspection:');
assert.strictEqual(setoCode.includes('prototypeEmi = 1140'), false, 'Hardcoded mock 1140 found!');
console.log('  ✔ Hardcoded "prototypeEmi = 1140" confirmed REMOVED.');

assert.ok(setoCode.includes('calculateEMI(p, 6.5, 36)'), 'Missing calculateEMI(p, 6.5, 36) invocation!');
console.log('  ✔ Genuine "calculateEMI(p, 6.5, 36)" confirmed INVOKED.');

assert.ok(setoCode.includes('filteredScenarios'), 'Missing filteredScenarios definition!');
assert.ok(setoCode.includes('filteredScenarios.map'), 'Missing filteredScenarios mapping!');
console.log('  ✔ Dynamic search filtering with filteredScenarios confirmed.');

assert.ok(setoCode.includes('debtMonthsActive'), 'Missing debtMonthsActive state!');
assert.ok(setoCode.includes('setDebtMonthsActive'), 'Missing setDebtMonthsActive setter!');
console.log('  ✔ Dynamic debt duration slider confirmed.');

// 2. Base SSR Render
import SetoDashboard from '../../../frontend/dist-ssr/SetoDashboard.js';

console.log('\n[Phase 2] Default Viewport SSR Render:');
const baseHtml = renderToString(React.createElement(SetoDashboard));
assert.ok(baseHtml.includes('The Entrepreneur Workspace'), 'Missing headline');
assert.ok(baseHtml.includes('Welcome, Ramesh!'), 'Missing greeting');
assert.ok(baseHtml.includes('D08 Mustard Oil Mill'), 'Missing D08 scenario');
assert.ok(baseHtml.includes('D18 Tailoring Workshop'), 'Missing D18 scenario');
assert.ok(baseHtml.includes('Sahukar Debt Relief'), 'Missing Sahukar scenario');
console.log('  ✔ Default home viewport renders all base elements cleanly.');

// 3. Dynamic State Mutation & DOM Value Verification
// Read compiled SSR bundle and create test variants
const ssrBundlePath = path.resolve('dist-ssr/SetoDashboard.js');
const bundleText = fs.readFileSync(ssrBundlePath, 'utf8');

async function renderVariant(replacements) {
  let code = bundleText;
  for (const [target, repl] of Object.entries(replacements)) {
    assert.ok(code.includes(target), `Target string not found in bundle: ${target}`);
    code = code.replace(target, repl);
  }
  const tempPath = path.resolve(`dist-ssr/temp_test_${Date.now()}_${Math.random().toString(36).substring(7)}.js`);
  fs.writeFileSync(tempPath, code);
  try {
    const mod = await import(`file://${tempPath}`);
    return renderToString(React.createElement(mod.default));
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

console.log('\n[Phase 3] Restructure Viewport DOM Calculations:');

// Test 3.1: Restructure tab at default ₹1,20,000, 36 months, 3 senkda
const htmlRestructureDefault = await renderVariant({
  'useState("home")': 'useState("restructure")'
});
assert.ok(htmlRestructureDefault.includes('Moneylender Consolidation Calculator'), 'Header not found');
assert.ok(htmlRestructureDefault.includes('3,678'), 'Expected ₹3,678 EMI not found');
assert.strictEqual(htmlRestructureDefault.includes('1,140'), false, 'Hardcoded 1,140 detected in DOM!');
assert.ok(htmlRestructureDefault.includes('Rule of Damdupat Triggered'), 'Damdupat warning should be active');
assert.ok(htmlRestructureDefault.includes('1,29,600'), 'Total paid ₹1,29,600 not found in Damdupat warning');
console.log('  ✔ Restructure default: EMI dynamically renders ₹3,678 / mo (calculated from calculateEMI).');
console.log('  ✔ Restructure default: Damdupat warning actively triggered at 36 months (108% principal paid).');

// Test 3.2: Restructure tab with short tenure (16 months) -> Damdupat must be inactive
const htmlRestructure16m = await renderVariant({
  'useState("home")': 'useState("restructure")',
  'useState(36)': 'useState(16)'
});
assert.ok(htmlRestructure16m.includes('3,678'), 'EMI should still be ₹3,678');
assert.strictEqual(htmlRestructure16m.includes('Rule of Damdupat Triggered'), false, 'Damdupat warning should NOT be triggered at 16 months!');
console.log('  ✔ Restructure 16 months: Damdupat warning dynamically suppressed when paid < principal.');

// Test 3.3: Restructure tab with high principal (₹3,00,000)
const htmlRestructure300k = await renderVariant({
  'useState("home")': 'useState("restructure")',
  'useState(12e4)': 'useState(300000)'
});
assert.ok(htmlRestructure300k.includes('9,195'), 'Expected ₹9,195 EMI for ₹3.00L principal');
assert.strictEqual(htmlRestructure300k.includes('1,140'), false, 'Hardcoded 1,140 detected in DOM!');
console.log('  ✔ Restructure ₹3,00,000: EMI scales dynamically to ₹9,195 / mo (NOT ₹1,140).');

// Test 3.4: Dynamic search filtering
console.log('\n[Phase 4] Dynamic Search Filter DOM Assertions:');

const htmlSearchMustard = await renderVariant({
  'const [searchQuery, setSearchQuery] = useState("")': 'const [searchQuery, setSearchQuery] = useState("Mustard")'
});
assert.ok(htmlSearchMustard.includes('D08 Mustard Oil Mill'), 'Mustard should match');
assert.strictEqual(htmlSearchMustard.includes('D18 Tailoring Workshop'), false, 'Tailoring should be filtered out');
assert.strictEqual(htmlSearchMustard.includes('Sahukar Debt Relief'), false, 'Sahukar should be filtered out');
console.log('  ✔ searchQuery="Mustard": isolates D08 and filters out D18 and Sahukar.');

const htmlSearchTailor = await renderVariant({
  'const [searchQuery, setSearchQuery] = useState("")': 'const [searchQuery, setSearchQuery] = useState("Tailor")'
});
assert.ok(htmlSearchTailor.includes('D18 Tailoring Workshop'), 'Tailoring should match');
assert.strictEqual(htmlSearchTailor.includes('D08 Mustard Oil Mill'), false, 'Mustard should be filtered out');
assert.strictEqual(htmlSearchTailor.includes('Sahukar Debt Relief'), false, 'Sahukar should be filtered out');
console.log('  ✔ searchQuery="Tailor": isolates D18 and filters out D08 and Sahukar.');

const htmlSearchEmpty = await renderVariant({
  'const [searchQuery, setSearchQuery] = useState("")': 'const [searchQuery, setSearchQuery] = useState("NonExistentKeywordXYZ")'
});
assert.ok(htmlSearchEmpty.includes('No matching scenarios'), 'Empty state feedback missing');
assert.strictEqual(htmlSearchEmpty.includes('D08 Mustard Oil Mill'), false, 'D08 should be filtered out');
assert.strictEqual(htmlSearchEmpty.includes('D18 Tailoring Workshop'), false, 'D18 should be filtered out');
console.log('  ✔ searchQuery="NonExistentKeywordXYZ": displays "No matching scenarios" empty state.');

console.log('\n[Phase 5] Other Viewports (Amortizer, Simulator, DPR):');

const htmlAmortizer = await renderVariant({
  'useState("home")': 'useState("amortizer")'
});
assert.ok(htmlAmortizer.includes('NSFDC Statutory Amortizer'), 'Amortizer header missing');
assert.ok(htmlAmortizer.includes('30,416') || htmlAmortizer.includes('30,420'), 'D08 EQI missing');
assert.ok(htmlAmortizer.includes('Moratorium'), 'Moratorium badge missing');
assert.ok(htmlAmortizer.includes('Amortizing'), 'Amortizing badge missing');
console.log('  ✔ Amortizer viewport renders genuine quarterly schedule & EQI.');

const htmlDPR = await renderVariant({
  'useState("home")': 'useState("dpr")'
});
assert.ok(htmlDPR.includes('RBI Lead Bank Scheme Standard (1969)'), 'DPR header missing');
assert.ok(htmlDPR.includes('Ramesh Kumar (SC · Verified)'), 'DPR beneficiary missing');
assert.ok(htmlDPR.includes('6,12,000'), 'DPR sanction loan missing');
console.log('  ✔ DPR viewport renders authentic Lead-Bank appraisal details.');

console.log('\n================================================================');
console.log('CHECK 4 EMPIRICAL VERIFICATION COMPLETE: ALL 12 CHECKS PASSED');
console.log('================================================================');
