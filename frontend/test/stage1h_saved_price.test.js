/**
 * The saved-price state of Home's market-price panel (14 Nov 2026, owner's decision). When the live site cannot reach
 * data.gov.in the server answers status "saved": the latest saved price with its market and arrival date. The panel
 * must show it plainly as SAVED: never "Live", never in the live green, the market and the date next to the price, the
 * saved-on date and "not today's price" in English and Hindi, and it must win over the "not connected" and "could not
 * be fetched" wording that the same situation used to produce. A saved reply that is incomplete shows nothing claimed.
 * Needs the SSR bundles rebuilt first (npm run build:ssr, or the two vite commands in stage3_website.test.js): the
 * MandiPanel render below imports from the ignored dist-ssr folder.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MandiPanel } from '../dist-ssr/prod/ProductionDashboard.js';
import { mandiPanelText } from '../src/services/mandiText.js';

const saved = {
  status: 'saved', isLive: false, state: 'Uttar Pradesh', commodity: 'Wheat', market: 'Bindki APMC', modalPrice: 2700,
  unit: 'INR / Quintal', records: [], apiKeyConfigured: false, arrivalDate: '13/11/2026', savedOn: '14/11/2026',
  ageDays: 1, liveFailure: 'call_failed'
};
const all = (t) => Object.values(t).filter((v) => typeof v === 'string').join(' | ');

describe('1h the saved price on the panel', () => {
  it('shows the price with its market and arrival date, and the saved-on date', () => {
    const t = mandiPanelText(saved, false);
    assert.equal(t.priceMain, '₹2,700');
    assert.ok(t.priceNote.includes('Bindki APMC') && t.priceNote.includes('13 Nov 2026'), t.priceNote);
    assert.ok(t.sourceNote.includes('14 Nov 2026'), t.sourceNote);
    assert.equal(t.saved, true);
    assert.equal(t.live, false);
  });

  it('says "saved" and "not today\'s price", in English and Hindi', () => {
    const t = mandiPanelText(saved, true);
    assert.ok(/Saved price/.test(t.badge) && /[ऀ-ॿ]/.test(t.badge), t.badge);
    assert.ok(/not today's price/i.test(t.sourceNote) && /[ऀ-ॿ]/.test(t.sourceNote), t.sourceNote);
  });

  it('never says Live, connected or could-not-fetch', () => {
    for (const key of [true, false, null]) {
      const text = all(mandiPanelText(saved, key));
      for (const bad of ['Live', 'live from', 'connected', 'could not be fetched', 'Could not reach', 'Coming soon', 'Checking']) {
        assert.ok(!text.includes(bad), `"${bad}" in: ${text}`);
      }
    }
  });

  it('wins over the key status and over every failure code the same situation used to show', () => {
    const reference = all(mandiPanelText(saved, true));
    for (const key of [true, false, null]) {
      for (const extra of [{}, { reasonCode: 'no_key' }, { reasonCode: 'call_failed' }, { offline: true }, { liveFailure: 'no_key' }]) {
        assert.equal(all(mandiPanelText({ ...saved, ...extra }, key)), reference, JSON.stringify({ key, extra }));
      }
    }
  });

  it('does not repeat the market in the crop line, and keeps the (assumed) notes', () => {
    const t = mandiPanelText(saved, true);
    assert.equal(t.commodity, 'Wheat');
    assert.ok(t.commodityNote.includes('(assumed)'));
  });

  it('a missing market says so instead of leaving a gap', () => {
    assert.ok(mandiPanelText({ ...saved, market: null }, true).priceNote.includes('Market not named'));
  });

  it('a missing saved-on date drops that date but still says it is not today\'s price', () => {
    const t = mandiPanelText({ ...saved, savedOn: null }, true);
    assert.ok(!/from \d/.test(t.sourceNote) && /not today's price/i.test(t.sourceNote), t.sourceNote);
  });

  it('review: no arrival date, or one that cannot be read, means no price and no date claim', () => {
    for (const arrivalDate of [undefined, null, '', '2026-11-13', '13/13/2026', 'yesterday']) {
      const t = mandiPanelText({ ...saved, arrivalDate }, true);
      assert.ok(!all(t).includes('₹') && t.saved !== true, `${arrivalDate}: ${all(t)}`);
    }
  });

  it('review: a price that is not a positive number is not shown', () => {
    for (const modalPrice of [0, -1, '2700', null, NaN]) {
      const t = mandiPanelText({ ...saved, modalPrice }, true);
      assert.ok(!all(t).includes('₹') && t.saved !== true, `${modalPrice}`);
    }
  });

  it('review: a rejected key shows the plain unavailable wording, never a price and never "saved"', () => {
    const t = mandiPanelText({ status: 'no_live_data', isLive: false, commodity: 'Wheat', apiKeyConfigured: true, reasonCode: 'key_rejected' }, true);
    assert.equal(t.priceMain, 'Price not available right now');
    assert.ok(!all(t).includes('₹') && t.saved !== true && !/key|403|reject/i.test(all(t)), all(t));
  });

  it('the old states are untouched', () => {
    assert.equal(mandiPanelText({ status: 'no_live_data', isLive: false, commodity: 'Wheat', apiKeyConfigured: false, reasonCode: 'no_key' }, false).priceMain,
      'Live price not connected yet');
    assert.equal(mandiPanelText({ status: 'no_live_data', isLive: false, commodity: 'Wheat', apiKeyConfigured: true, reasonCode: 'call_failed' }, true).priceMain,
      'Price could not be fetched right now');
    assert.equal(mandiPanelText({ status: 'success', isLive: true, commodity: 'Wheat', modalPrice: 2275, market: 'Agra', arrivalDate: '14/11/2026' }, true).badge, 'Live');
  });
});

describe('1h the rendered panel', () => {
  const html = renderToString(React.createElement(MandiPanel, { mandiPriceData: saved, mandiKeyConfigured: false }));

  it('shows the saved price, its market and its date', () => {
    for (const s of ['₹2,700', 'Bindki APMC', '13 Nov 2026', 'Saved price', 'Wheat']) assert.ok(html.includes(s), s);
  });

  it('is never drawn in the live green, and never says Live', () => {
    assert.ok(!html.includes('bg-emerald-600'), 'a green dot');
    assert.ok(!html.includes('text-[#0E7A53]'), 'the live price colour');
    assert.ok(!/>Live</.test(html));
  });
});
