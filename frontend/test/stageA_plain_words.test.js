/** Stage A, plain words: size names, season percent and the repay sentence. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tierOptions, plainSizes, seasonPercent, repayLine, flowSteps } from '../src/services/dossierView.js';

const tiers = (costs) => ({ tiers: costs.map((c, i) => ({ label: `File size ${i}`, project_cost: c == null ? { status: 'NOT FOUND', value: null } : { value: c, tag: 'D01 dossier' } })) });

describe('size names are ranked inside each business', () => {
  it('3 sizes -> Small / Medium / Large; the file\'s own name is kept', () => {
    const s = plainSizes(tierOptions(tiers([1, 2, 3])));
    assert.deepStrictEqual(s.map((x) => x.plainLabel), ['Small', 'Medium', 'Large']);
    assert.deepStrictEqual(s.map((x) => x.originalLabel), ['File size 0', 'File size 1', 'File size 2']);
  });
  it('2 sizes -> Small / Large', () => {
    assert.deepStrictEqual(plainSizes(tierOptions(tiers([1, 2]))).map((x) => x.plainLabel), ['Small', 'Large']);
  });
  it('a size with no cost says "cost not in research file" (D21: Small has none)', () => {
    const s = plainSizes(tierOptions(tiers([null, 280000, 841000])));
    assert.deepStrictEqual(s.map((x) => [x.plainLabel, x.costText]),
      [['Small', 'cost not in research file'], ['Medium', null], ['Large', null]]);
  });
  it('nothing in, nothing out', () => {
    assert.deepStrictEqual(plainSizes(undefined), []);
  });
});

describe('season as whole percent against an average month', () => {
  it('above, below and equal to average', () => {
    assert.equal(seasonPercent(1.1), '+10%');
    assert.equal(seasonPercent(0.75), '−25%');
    assert.equal(seasonPercent(1.0), '0%');
    assert.equal(seasonPercent(1.004), '0%');
    assert.equal(seasonPercent(1.35), '+35%');
  });
  it('not a number -> null (nothing made up)', () => {
    assert.equal(seasonPercent(null), null);
    assert.equal(seasonPercent(NaN), null);
  });
});

describe('the repay sentence', () => {
  it('uses the research file\'s figure, 2 decimals', () => {
    assert.equal(repayLine({ year: 1 }, 2.84), 'Year 1: earns ₹2.84 for every ₹1 of loan payment');
  });
  it('a missing year says so', () => {
    assert.equal(repayLine({ year: 2 }, null), 'Year 2: not in research file');
  });
});

describe('step labels', () => {
  it('steps 4 and 5 in plain words', () => {
    const s = flowSteps({ businessPicked: false, costChosen: false, projectCost: '', familyIncome: '', isSc: null, loanReady: false });
    assert.equal(s[3].label, 'See your loan and good and bad months');
    assert.equal(s[4].label, 'Download report (DPR)');
  });
});
