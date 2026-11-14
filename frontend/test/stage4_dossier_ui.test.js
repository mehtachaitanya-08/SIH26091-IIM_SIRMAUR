/**
 * Stage 4: dossier figures on the dashboard (size buttons, season bars, the dossier's own DSCR).
 * The helpers in src/services/dossierView.js turn server replies into what the screens show.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { tierOptions, defaultTierCost, seasonBars, dscrRows, flowSteps } from '../src/services/dossierView.js';

// Shapes as GET /api/dossiers/{code} and POST /api/dossiers/{code}/cashflow send them (checker keys removed).
const D08 = {
  code: 'D08',
  tiers: [
    { label: 'Micro Finance Tier', project_cost: { value: 140000, tag: 'D08 dossier', unit: 'INR' } },
    { label: 'Term Loan Tier', project_cost: { value: 850000, tag: 'D08 dossier', unit: 'INR' } }
  ],
  seasonality: {
    months: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
      .map((month, i) => ({ month, value: [1.35, 1.30, 1.05, 0.80, 0.75, 0.80, 1.15, 1.25, 1.20, 1.00, 0.70, 0.65][i], tag: 'D08 dossier' }))
  }
};
const D20 = {
  code: 'D20',
  tiers: [
    { label: 'Micro Finance size', project_cost: { status: 'NOT FOUND', value: null, reason: 'no total' } },
    { label: 'Term Loan size', project_cost: { value: 4384000, tag: 'D20 dossier', unit: 'INR lakh' } }
  ],
  seasonality: { status: 'NOT FOUND', value: null, reason: 'The dossier gives no month-by-month season multipliers.' }
};

describe('size buttons', () => {
  it('one per dossier size, Micro first, each with its cost and the dossier label', () => {
    assert.deepStrictEqual(tierOptions(D08), [
      { label: 'Micro Finance Tier', cost: 140000, tag: 'D08 dossier', disabled: false, reason: null },
      { label: 'Term Loan Tier', cost: 850000, tag: 'D08 dossier', disabled: false, reason: null }
    ]);
  });

  it('a size the dossier gives no cost for is shown NOT FOUND and cannot be picked', () => {
    const o = tierOptions(D20);
    assert.equal(o[0].disabled, true);
    assert.equal(o[0].cost, null);
    assert.equal(o[0].reason, 'no total');
  });

  it('starting cost: the first size that has one (Micro first); none when no size has a cost', () => {
    assert.equal(defaultTierCost(D08), 140000);
    assert.equal(defaultTierCost(D20), 4384000);
    assert.equal(defaultTierCost({ tiers: [] }), null);
    assert.equal(defaultTierCost(null), null);
  });
});

describe('season bars', () => {
  it('12 bars April first, height relative to the highest month, 3 leanest months marked', () => {
    const b = seasonBars(D08.seasonality);
    assert.equal(b.length, 12);
    assert.equal(b[0].month, 'April');
    assert.equal(b[0].heightPct, 100);
    assert.deepStrictEqual(b.filter((x) => x.lean).map((x) => x.month), ['August', 'February', 'March']);
    assert.ok(b.every((x) => x.tag === 'D08 dossier'));
  });

  it('NOT FOUND season gives no bars', () => {
    assert.equal(seasonBars(D20.seasonality), null);
    assert.equal(seasonBars(undefined), null);
  });
});

describe('DSCR rows', () => {
  it("the dossier's own printed Year 1-3 figures with the tag; a missing year is NOT FOUND", () => {
    const reply = {
      status: 'ok', tierMatch: 'exact', tier: { label: 'Intermediate Term Loan Tier' },
      dscr: { years: [{ year: 1, value: 2.84, tag: 'D01 dossier' }, { year: 2, value: null, status: 'NOT FOUND' }, { year: 3, value: 3.45, tag: 'D01 dossier' }] }
    };
    assert.deepStrictEqual(dscrRows(reply), {
      status: 'ok',
      rows: [{ year: 1, text: '2.84x', tag: 'D01 dossier' }, { year: 2, text: 'NOT FOUND', tag: null }, { year: 3, text: '3.45x', tag: 'D01 dossier' }]
    });
  });

  it('NOT FOUND, offline and missing replies', () => {
    assert.deepStrictEqual(dscrRows({ status: 'NOT FOUND', reason: 'no DSCR printed' }), { status: 'NOT FOUND', reason: 'no DSCR printed', rows: [] });
    assert.equal(dscrRows({ status: 'server_offline', offline: true }).status, 'offline');
    assert.equal(dscrRows(null).status, 'waiting');
  });
});

describe('step-by-step flow', () => {
  it('five steps in order, each opening a tab, done-marks from what the user has filled in', () => {
    const s = flowSteps({ businessPicked: true, costChosen: true, projectCost: '140000', familyIncome: '', isSc: true, loanReady: false });
    assert.deepStrictEqual(s.map((x) => x.tab), ['feasibility', 'amortizer', 'amortizer', 'simulator', 'dpr']);
    assert.deepStrictEqual(s.map((x) => x.done), [true, true, false, false, false]);
    const all = flowSteps({ businessPicked: true, costChosen: true, projectCost: '140000', familyIncome: '100000', isSc: true, loanReady: true });
    assert.deepStrictEqual(all.map((x) => x.done), [true, true, true, true, false]);
  });

  it('nothing is ticked on first load: the opening business and its pre-filled cost are not the user\'s choice', () => {
    // Steps 1 and 2 were ticked before anyone touched anything (teammate review, 11 Nov 2026).
    const first = flowSteps({ businessPicked: false, costChosen: false, projectCost: '140000', familyIncome: '', isSc: null, loanReady: false });
    assert.deepStrictEqual(first.map((x) => x.done), [false, false, false, false, false]);
  });
});

import { costOnBusinessLoad } from '../src/services/dossierView.js';
import fs from 'node:fs';

describe('size pre-fill never overwrites a cost someone chose', () => {
  it('fills the Micro size only when nobody has touched the cost box for this business', () => {
    assert.equal(costOnBusinessLoad({ origin: null, dossier: D08 }), '140000');
    assert.equal(costOnBusinessLoad({ origin: 'user', dossier: D08 }), null);   // typed before the dossier arrived
    assert.equal(costOnBusinessLoad({ origin: 'chat', dossier: D08 }), null);   // the chat gave a cost
    assert.equal(costOnBusinessLoad({ origin: null, dossier: { tiers: [] } }), '');
    assert.equal(costOnBusinessLoad({ origin: null, dossier: null }), '');
  });
});

describe('leftover claims', () => {
  const src = (p) => fs.readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
  it('no August-only lean-month claims; 6.5%/8% tagged; quarter counts not tagged as NSFDC wording', () => {
    for (const f of ['App.jsx', 'components/dashboard/CenterWorkspace.jsx', 'components/dashboard/HowItWorksView.jsx',
      'components/dashboard/EnginesPanel.jsx', 'components/dashboard/MandiPanel.jsx', 'components/SetoDashboard.jsx']) {
      assert.ok(!/August (monsoon )?lean-month/i.test(src(f)), f);
    }
    // The engines panel moved to the "How it works" tab (11 Nov 2026); its rates keep their [S1] tag.
    // Changed 14 Nov 2026: the panel is now one shared file (EnginesPanel.jsx), shown in "How it works"
    // and, on the owner's decision, on Home again.
    assert.ok(src('components/dashboard/EnginesPanel.jsx').includes('6.5%/8.0% [S1]'));
    assert.ok(src('components/dashboard/HowItWorksView.jsx').includes('<EnginesPanel />'));
    assert.ok(src('components/dashboard/CenterWorkspace.jsx').includes('<EnginesPanel />'));
    assert.ok(!src('components/SetoDashboard.jsx').includes("6.5% / 8.0%. [S1]'"));
  });
  it('surplus label states what it is net of; gaps title fits remaining questions; no dead not-yet-verified branch', () => {
    assert.ok(!src('components/dashboard/SeasonalitySimulatorView.jsx').includes('Surplus before loan repayments'));
    assert.ok(!src('components/dashboard/FeasibilityView.jsx').includes('not yet verified'));
    assert.ok(!src('components/dashboard/FeasibilityView.jsx').includes('VENDOR QUOTE NEEDED in official sources'));
  });
});
