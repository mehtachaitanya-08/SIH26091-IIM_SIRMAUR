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
    const s = flowSteps({ code: 'D20', projectCost: '140000', familyIncome: '', isSc: true, loanReady: false });
    assert.deepStrictEqual(s.map((x) => x.tab), ['feasibility', 'amortizer', 'amortizer', 'simulator', 'dpr']);
    assert.deepStrictEqual(s.map((x) => x.done), [true, true, false, false, false]);
    const all = flowSteps({ code: 'D20', projectCost: '140000', familyIncome: '100000', isSc: true, loanReady: true });
    assert.deepStrictEqual(all.map((x) => x.done), [true, true, true, true, false]);
  });
});
