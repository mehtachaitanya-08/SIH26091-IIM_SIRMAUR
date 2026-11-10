/**
 * Stage 3 website checks: the dashboard shows only verified server figures.
 *
 * Before running, build the two server-side-render bundles the render tests import:
 *   npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr --emptyOutDir
 *   npx vite build --ssr src/components/ProductionDashboard.jsx --outDir dist-ssr/prod
 * Then: node --test test/
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

import api, {
  fetchHealth,
  calculateNSFDCLoan,
  evaluateModeA,
  restructureDebt,
  fetchDossiers,
  fetchDossier,
  fetchFeasibility,
  downloadDpr,
  sendChat,
  chatRoute,
  dprPayload
} from '../src/services/api.js';
import { offlineNsfdcLoan } from '../src/services/nsfdcLoan.js';
import SetoDashboard from '../dist-ssr/SetoDashboard.js';
import ProductionDashboard from '../dist-ssr/prod/ProductionDashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const answers = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/nsfdc_server_answers.json'), 'utf8'));

// ---------------------------------------------------------------------------
// fetch stand-ins
// ---------------------------------------------------------------------------
const realFetch = globalThis.fetch;
let calls = [];
function serverReplies(handler) {
  calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url, opts, body: opts.body ? JSON.parse(opts.body) : undefined });
    return handler(url, opts);
  };
}
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const serverDown = () => serverReplies(async () => { throw new TypeError('fetch failed'); });
// What the Vite dev proxy answers when nothing listens on port 8000: an empty 500 (no JSON).
const proxyDown = () => serverReplies(async () => new Response('', { status: 500 }));

afterEach(() => { globalThis.fetch = realFetch; });

// ---------------------------------------------------------------------------
// 1. Offline loan maths = the verified server, exactly
// ---------------------------------------------------------------------------
describe('1. Browser loan maths gives the verified server\'s whole reply on every fixture case', () => {
  const twin = (k) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  for (const c of answers.cases) {
    it(`input ${JSON.stringify(c.input)}`, () => {
      if (c.httpStatus !== 200) {
        assert.throws(() => offlineNsfdcLoan(c.input), { message: c.expected.error });
        return;
      }
      const got = offlineNsfdcLoan(c.input);
      assert.equal(got.offline, true);
      // every key the server sends (warnings, notes, sources, other schemes, quotes, tags...), nothing more except "offline"
      const camel = Object.fromEntries(Object.entries(got).filter(([k]) => !c.snakeTwins.includes(k) && k !== 'offline'));
      if (camel.amortizationSchedule) {
        camel.amortizationSchedule = camel.amortizationSchedule.map((row) => Object.fromEntries(Object.entries(row).filter(([k]) => !k.includes('_'))));
      }
      assert.deepStrictEqual(camel, c.expected);
      for (const t of c.snakeTwins) {
        const k = Object.keys(got).find((x) => twin(x) === t);
        assert.ok(k, `no camelCase key for ${t}`);
        if (k === 'amortizationSchedule') {
          got[t].forEach((row, i) => { for (const [rk, rv] of Object.entries(got[k][i])) assert.deepStrictEqual(row[twin(rk)], rv); });
        } else {
          assert.deepStrictEqual(got[t], got[k], t);
        }
      }
    });
  }

  it('paise are rounded down to the rupee with an ASSUMED note, as the server does', () => {
    const got = offlineNsfdcLoan({ projectCost: 140000.5, familyIncome: 100000, isSc: true });
    assert.equal(got.projectCost, 140000);
    assert.equal(got.loanAmount, 125000);
    assert.ok(got.assumptions.some((a) => a.tag === 'ASSUMED' && /rounded down/i.test(a.text)));
  });

  it('SC answer missing: taken as SC with the same ASSUMED note as the server; "true"/"false" text accepted', () => {
    const got = offlineNsfdcLoan({ projectCost: 140000, familyIncome: 100000 });
    assert.equal(got.loanAmount, 125000);
    assert.ok(got.assumptions.some((a) => a.tag === 'ASSUMED' && a.text.startsWith('isSc was not sent')));
    assert.equal(offlineNsfdcLoan({ projectCost: 140000, familyIncome: 100000, isSc: 'false' }).isEligible, false);
    assert.throws(() => offlineNsfdcLoan({ projectCost: 140000, familyIncome: 100000, isSc: 'maybe' }), { message: "'isSc' must be true or false" });
  });

  it('every number key carries a tag', () => {
    const got = offlineNsfdcLoan({ projectCost: 140000, familyIncome: 100000, isSc: true });
    for (const k of ['loanAmount', 'promoterEquity', 'interestRatePa', 'equatedQuarterlyInstallment', 'totalDebtService', 'amortizationSchedule']) {
      assert.ok(got.tags[k], `tag for ${k}`);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. API client: no backup to the made-up file; offline is reported, not hidden
// ---------------------------------------------------------------------------
describe('2. API client', () => {
  it('no longer imports the bundled dossier file or engine.js', () => {
    const code = read('services/api.js');
    assert.ok(!code.includes('dossiers_db.json'), 'api.js still imports dossiers_db.json');
    assert.ok(!code.includes("from '../engine"), 'api.js still imports engine.js');
    assert.ok(!code.includes('_fallback'), 'api.js still marks results as _fallback');
  });

  it('server up: returns the server reply untouched and sends only cost, income and isSc', async () => {
    serverReplies(async () => json(200, { isEligible: true, loanAmount: 125000 }));
    const res = await calculateNSFDCLoan(140000, 100000, { isSc: true });
    assert.deepStrictEqual(res, { isEligible: true, loanAmount: 125000 });
    assert.equal(calls[0].url, '/api/engine/nsfdc/calculate');
    assert.deepStrictEqual(calls[0].body, { projectCost: 140000, familyIncome: 100000, isSc: true });
  });

  for (const [name, down] of [['network error', serverDown], ['dev proxy 500', proxyDown]]) {
    it(`server offline (${name}): loan still worked out in the browser, marked offline, verified numbers`, async () => {
      down();
      const res = await calculateNSFDCLoan(140000, 100000, { isSc: true });
      assert.equal(res.offline, true);
      assert.equal(res.loanAmount, 125000);
      assert.equal(res.promoterEquity, 15000);
      assert.equal(res.equatedQuarterlyInstallment, 12704.49);
      assert.equal(res.amortizationSchedule[0].totalInstallment, 0);
      assert.equal(res.amortizationSchedule[0].interestAddedToLoan, 2031.25);
    });
  }

  it('a server crash (500 with plain text) is reported as a server error, not hidden as offline', async () => {
    serverReplies(async () => new Response('Internal Server Error', { status: 500, headers: { 'Content-Type': 'text/plain' } }));
    await assert.rejects(() => calculateNSFDCLoan(140000, 100000, { isSc: true }), (err) => err.name === 'ServerError' && /500/.test(err.message));
  });

  for (const code of [502, 503, 504]) {
    it(`gateway error ${code} counts as offline`, async () => {
      serverReplies(async () => new Response('Bad Gateway', { status: code }));
      assert.equal((await calculateNSFDCLoan(140000, 100000, { isSc: true })).offline, true);
    });
  }

  it('a real server error (400 with an error message) is shown, not replaced by browser maths', async () => {
    serverReplies(async () => json(400, { error: "'projectCost': Input should be greater than 0", status: 400 }));
    await assert.rejects(() => calculateNSFDCLoan(0, 100000, { isSc: true }), { message: "'projectCost': Input should be greater than 0" });
  });

  it('health offline: status "offline", no made-up engine list', async () => {
    serverDown();
    const res = await fetchHealth();
    assert.equal(res.status, 'offline');
    assert.equal(res.offline, true);
    assert.equal(res.engines, undefined);
  });

  it('dossiers offline: empty list marked offline (no bundled numbers)', async () => {
    serverDown();
    const res = await fetchDossiers();
    assert.deepStrictEqual(res, { count: 0, dossiers: [], offline: true });
  });

  it('one dossier offline: code only, marked offline', async () => {
    serverDown();
    const res = await fetchDossier('d20');
    assert.deepStrictEqual(res, { code: 'D20', status: 'server_offline', offline: true });
  });

  it('a code that cannot exist (not D01-D24) is null without asking the server', async () => {
    serverReplies(async () => json(200, { code: 'X' }));
    for (const bad of ['D99', 'D00', '../../../etc/passwd', "' OR 1=1 --"]) assert.equal(await fetchDossier(bad), null, bad);
    assert.equal(calls.length, 0);
  });

  it('Mode A and Mode B offline: no numbers at all', async () => {
    serverDown();
    for (const res of [await evaluateModeA('archetype_1'), await restructureDebt(120000, 3, 36)]) {
      assert.equal(res.offline, true);
      assert.ok(!Object.values(res).some((v) => typeof v === 'number'), JSON.stringify(res));
    }
  });

  it('feasibility: GET /api/feasibility/{code}; offline marked', async () => {
    serverReplies(async () => json(200, { code: 'D20', status: 'verified', sections: [], gaps: [] }));
    const ok = await fetchFeasibility('d20');
    assert.equal(calls[0].url, '/api/feasibility/D20');
    assert.equal(ok.status, 'verified');
    serverDown();
    assert.deepStrictEqual(await fetchFeasibility('D20'), { code: 'D20', status: 'server_offline', offline: true });
  });

  it('DPR: POSTs to /api/dpr and returns the PDF blob; a server error message comes through', async () => {
    serverReplies(async () => new Response(new Uint8Array([37, 80, 68, 70]), { status: 200, headers: { 'Content-Type': 'application/pdf' } }));
    const blob = await downloadDpr({ code: 'D20', projectCost: 140000, familyIncome: 100000, isSc: true });
    assert.equal(calls[0].url, '/api/dpr');
    assert.deepStrictEqual(calls[0].body, { code: 'D20', projectCost: 140000, familyIncome: 100000, isSc: true });
    assert.equal(blob.type, 'application/pdf');
    serverReplies(async () => json(400, { error: "'isSc' must be true or false", status: 400 }));
    await assert.rejects(() => downloadDpr({ code: 'D20' }), { message: "'isSc' must be true or false" });
    serverDown();
    await assert.rejects(() => downloadDpr({ code: 'D20' }), /server is offline/i);
  });

  it('chat: sends the whole conversation; offline gives status server_offline and no reply', async () => {
    serverReplies(async () => json(200, { status: 'ok', reply: 'D20', tool_results: [] }));
    const msgs = [{ role: 'user', content: 'I am a blacksmith' }];
    const res = await sendChat(msgs);
    assert.equal(calls[0].url, '/api/chat');
    assert.deepStrictEqual(calls[0].body, { messages: msgs });
    assert.equal(res.reply, 'D20');
    serverDown();
    assert.deepStrictEqual(await sendChat(msgs), { status: 'server_offline', reply: null, offline: true });
  });

  it('chat: only the last 30 messages are sent (the server accepts 1 to 30)', async () => {
    serverReplies(async () => json(200, { status: 'ok', reply: 'ok', tool_results: [] }));
    const msgs = Array.from({ length: 41 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
    await sendChat(msgs);
    assert.equal(calls[0].body.messages.length, 30);
    assert.deepStrictEqual(calls[0].body.messages, msgs.slice(-30));
  });

  it('DPR payload: chat answers are sent only for the business they were given for', () => {
    const base = { code: 'D20', projectCost: 140000, familyIncome: 100000, isSc: true };
    assert.deepStrictEqual(dprPayload({ ...base, answers: { code: 'D15', answers: { 'D15.q1': 'yes' } } }), { ...base, answers: {} });
    assert.deepStrictEqual(dprPayload({ ...base, answers: { code: 'D20', answers: { 'D20.q1': 'yes' } } }), { ...base, answers: { 'D20.q1': 'yes' } });
    assert.deepStrictEqual(dprPayload({ ...base, answers: null, applicantName: 'Asha' }), { ...base, answers: {}, applicantName: 'Asha' });
  });

  it('default export lists every function', () => {
    for (const f of ['fetchHealth', 'calculateNSFDCLoan', 'evaluateModeA', 'restructureDebt', 'fetchDossiers',
      'fetchDossier', 'fetchFeasibility', 'downloadDpr', 'sendChat', 'chatRoute', 'dprPayload']) {
      assert.equal(typeof api[f], 'function', f);
    }
  });
});


describe('2b. Chat routing from tool results', () => {
  it('a business found by the assistant becomes the selected business', () => {
    assert.deepStrictEqual(chatRoute([{ tool: 'business_summary', result: { code: 'D20', name: 'Blacksmith' } }]), { code: 'D20' });
  });
  it('a loan worked out by the assistant fills the cost box and opens the loan tab', () => {
    const r = chatRoute([{ tool: 'calculate_loan', result: { isEligible: true, projectCost: 140000, familyIncome: 200000, isSc: true, loanAmount: 125000 } }]);
    assert.deepStrictEqual(r, { tab: 'amortizer', loanInputs: { projectCost: 140000, familyIncome: 200000, isSc: true } });
    const notEligible = chatRoute([{ tool: 'calculate_loan', result: { isEligible: false, projectCost: 140000, familyIncome: 600000, isSc: true } }]);
    assert.deepStrictEqual(notEligible.loanInputs, { projectCost: 140000, familyIncome: 600000, isSc: true });
  });
  it('feasibility opens the feasibility tab; DPR link opens the DPR tab with its inputs', () => {
    assert.deepStrictEqual(chatRoute([{ tool: 'feasibility', result: { code: 'D20', sections: [] } }]), { code: 'D20', tab: 'feasibility' });
    const body = { code: 'D15', projectCost: 90000, familyIncome: 100000, isSc: true, answers: { q1: 'yes' } };
    assert.deepStrictEqual(chatRoute([{ tool: 'dpr_link', result: { action: 'download_dpr', endpoint: '/api/dpr', body } }]),
      { code: 'D15', tab: 'dpr', loanInputs: { projectCost: 90000, familyIncome: 100000, isSc: true }, answers: { q1: 'yes' } });
  });
  it('tool errors and junk are ignored', () => {
    assert.deepStrictEqual(chatRoute([{ tool: 'feasibility', result: { error: 'unknown code D99' } }, { tool: 'x', result: { code: 'HACK' } }]), {});
    assert.deepStrictEqual(chatRoute(undefined), {});
  });
});

// ---------------------------------------------------------------------------
// 3. Dashboard source: invented defaults gone
// ---------------------------------------------------------------------------
const INVENTED = ['FALLBACK_PRESETS', '680000', '|| 100000', '|| 200000', '|| 1.65', '|| 350000', 'DSCR 1.62x', 'DSCR 2.14x',
  '+₹2,460', '₹6.80L', 'STATUTORY SANCTION', 'SHA256', '290bfbc47a9d3e8', 'RBI LEAD BANK', 'RBI Lead Bank'];

describe('3. No invented numbers or claims in the dashboard source', () => {
  const files = ['components/ProductionDashboard.jsx', 'components/SetoDashboard.jsx', 'components/dashboard/ScenariosSidebar.jsx',
    'components/dashboard/LeadBankDprView.jsx', 'components/dashboard/SeasonalitySimulatorView.jsx',
    'components/dashboard/NsfdcAmortizerView.jsx'];
  for (const f of files) {
    it(f, () => {
      const code = read(f);
      const found = INVENTED.filter((s) => code.includes(s));
      assert.deepStrictEqual(found, [], `${f} still contains: ${found.join(', ')}`);
    });
  }

  it('rate shown from interestRatePa, not quarterlyInterestRate × 4', () => {
    const code = read('components/ProductionDashboard.jsx');
    assert.ok(!code.includes('quarterlyInterestRate * 4'));
    assert.ok(code.includes('interestRatePa'));
  });

  it('default business is D20 (dashboard, demo user, registration form)', () => {
    assert.ok(read('components/ProductionDashboard.jsx').includes("useState('D20')"));
    assert.ok(read('data/userDatabase.js').includes("trade: 'D20"));
    assert.match(read('App.jsx'), /useState\('D20 /);
  });

  it('DPR download goes to the server PDF', () => {
    const code = read('components/ProductionDashboard.jsx');
    assert.ok(code.includes('downloadDpr('));
    assert.ok(!code.includes('new Blob([htmlContent]'));
  });
});

// ---------------------------------------------------------------------------
// 4. What the dashboard actually renders (first paint, before any server reply)
// ---------------------------------------------------------------------------
const user = { name: 'Asha Devi', category: 'SC', incomeNum: 120000, district: 'Sitapur', id: 'TEST-1' };
const render = (props) => renderToString(React.createElement(ProductionDashboard, { currentUser: user, ...props }));
// The user card shows NSFDC's income ceiling (₹5,00,000 [S1]): a sourced rule, the only rupee figure allowed before input.
const SOURCED_CEILING = 'Income ≤ ₹5.00L';
const withoutCeiling = (html) => html.split(SOURCED_CEILING).join('');

describe('4. Production dashboard render', () => {
  it('home: D20 selected, Feasibility tab, chat box, no invented figures', () => {
    const html = render();
    assert.ok(html.includes('D20'));
    assert.ok(html.includes('Feasibility'));
    assert.ok(html.includes('Ask GraminAI'), 'chat box placeholder missing');
    for (const s of INVENTED) assert.ok(!html.includes(s), `renders "${s}"`);
  });

  it('amortizer before a cost is entered: NOT FOUND and a project cost box, no loan figures', () => {
    const html = render({ initialTab: 'amortizer' });
    assert.ok(html.includes('NOT FOUND'));
    assert.ok(html.includes('Project cost'));
    assert.ok(/type="number"/.test(html));
    assert.ok(!withoutCeiling(html).includes('₹'), 'shows a rupee figure with no cost entered');
  });

  it('simulator: cash flow, cover (DSCR) and season curve are NOT FOUND, never a SAFE rating', () => {
    const html = render({ initialTab: 'simulator' });
    assert.ok(html.includes('NOT FOUND'));
    assert.ok(!html.includes('SAFE'));
    assert.ok(!/\d\.\d+x/.test(html), 'shows a multiplier');
  });

  it('DPR tab: server PDF button, advisory wording, no hash', () => {
    const html = render({ initialTab: 'dpr' });
    assert.ok(html.includes('Download DPR PDF'));
    assert.ok(html.includes('not a loan sanction'));
    assert.ok(!html.includes('SHA256'));
  });

  it('debt tab: no built-in debt; NOT FOUND until the user enters their own', () => {
    const html = render({ initialTab: 'restructure' });
    assert.ok(html.includes('NOT FOUND'));
    assert.ok(!withoutCeiling(html).includes('₹'), 'shows a rupee figure before any debt is entered');
  });

  it('feasibility tab renders its view', () => {
    const html = render({ initialTab: 'feasibility' });
    assert.ok(html.includes('Feasibility report'));
  });
});

describe('5. Landing mock-up keeps its look but shows no figures', () => {
  it('no rupee amounts, multipliers or DSCR values', () => {
    const html = renderToString(React.createElement(SetoDashboard));
    assert.ok(html.includes('D08 Mustard Oil Mill'), 'mock-up items kept');
    assert.ok(!/₹\s?\d/.test(withoutCeiling(html)), 'mock-up shows a rupee amount');
    assert.ok(!/DSCR \d/.test(html), 'mock-up shows a DSCR value');
    assert.ok(html.includes('see dashboard'));
  });
});
