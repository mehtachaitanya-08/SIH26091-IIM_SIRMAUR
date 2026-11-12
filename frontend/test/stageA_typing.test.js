/**
 * Stage A, typing glitch: replies to old values are ignored, and calls wait for typing to stop.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeLatest, TYPING_PAUSE_MS } from '../src/services/latest.js';

describe('only the newest reply is used', () => {
  it('a reply to an older request is ignored; the newest one is kept', () => {
    const latest = makeLatest();
    const first = latest.next();   // typing "1"
    const second = latest.next();  // typing "10"
    assert.equal(latest.isCurrent(first), false);
    assert.equal(latest.isCurrent(second), true);
  });

  it('each tracker counts on its own (loan, cash-flow and debt calls do not mix)', () => {
    const loan = makeLatest();
    const debt = makeLatest();
    const l = loan.next();
    debt.next(); debt.next();
    assert.equal(loan.isCurrent(l), true);
  });

  it('the pause before calling the server is 0.4 s', () => {
    assert.equal(TYPING_PAUSE_MS, 400);
  });
});
