/**
 * Owner's decisions after testing Home by hand (14 Nov 2026, evening):
 *  A the market-price panel speaks plain words. It showed "NOT FOUND" and
 *    "DATA_GOV_IN_API_KEY not set (environment or .env)": a server setting name in front of a
 *    farmer, with the text broken across lines. Until the data.gov.in key is added it now says
 *    "Live price not connected yet" and "Coming soon", and never makes up a price.
 *  A the chat button gets a "Ready to help" bubble: the owner could not find the chat at all.
 *    It shows until the chat is opened once (or closed with its x), and only while the server is up.
 * Review the same evening (findings 1-5, 8): a live price must never carry "NOT FOUND"; a failed
 * call must not be shown as "no price reported"; the price is the latest, not "today's"; the
 * first paint says "Checking…", not that the server is off; the tests render, not grep.
 * Needs the two SSR bundles (see stage3_website.test.js).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ProductionDashboard, { ChatLauncher, MandiPanel } from '../dist-ssr/prod/ProductionDashboard.js';
import { mandiPanelText } from '../src/services/mandiText.js';
import { CHAT_HINT } from '../src/services/chatText.js';

const user = { name: 'Asha Devi', category: 'SC', district: 'Agra', id: 'TEST-1F' };
const html = renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'home' }));
const panel = (data, key) => renderToString(React.createElement(MandiPanel, { mandiPriceData: data, mandiKeyConfigured: key }));
const chat = (props) => renderToString(React.createElement(ChatLauncher, props));

// What the server answers today, before the teammate adds the key (seen live on 14 Nov 2026).
const noKeyReply = {
  status: 'no_live_data', isLive: false, modalPrice: null, commodity: 'Wheat', state: 'Uttar Pradesh',
  apiKeyConfigured: false, reasonCode: 'no_key',
  reason: 'No live mandi price: DATA_GOV_IN_API_KEY is not set (environment or .env). NOT FOUND.'
};
const withKey = (reasonCode, reason) => ({ ...noKeyReply, apiKeyConfigured: true, reasonCode, reason });
const live = {
  status: 'success', isLive: true, modalPrice: 2275, commodity: 'Wheat', market: 'Agra', state: 'Uttar Pradesh',
  apiKeyConfigured: true, arrivalDate: '12/11/2026', tag: 'data.gov.in Agmarknet, live, arrival date 12/11/2026'
};
const all = (t) => Object.values(t).join(' | ');
const TECH = ['NOT FOUND', 'DATA_GOV_IN_API_KEY', '.env', 'environment', 'not set', 'server'];

describe('1f A: the market-price panel in plain words', () => {
  it('without the key: "not connected yet" and "Coming soon", no technical words', () => {
    const t = mandiPanelText(noKeyReply, false);
    assert.equal(t.priceMain, 'Live price not connected yet');
    assert.equal(t.badge, 'Coming soon');
    assert.equal(t.sourceNote, 'Coming soon');
    for (const bad of TECH) assert.ok(!all(t).toLowerCase().includes(bad.toLowerCase()), `"${bad}" in: ${all(t)}`);
  });

  it('the rendered panel without the key shows none of the technical words either', () => {
    const out = panel(noKeyReply, false);
    assert.ok(out.includes('Live price not connected yet') && out.includes('Coming soon'));
    for (const bad of TECH) assert.ok(!out.includes(bad), bad);
  });

  it('a live price shows with its arrival date and the Live badge', () => {
    const t = mandiPanelText(live, true);
    assert.equal(t.priceMain, '₹2,275');
    assert.ok(t.priceNote.includes('12/11/2026'), t.priceNote);
    assert.equal(t.badge, 'Live');
    assert.equal(t.commodity, 'Wheat (Agra)');
  });

  it('review 1: a live price whose record has no date never shows "NOT FOUND"', () => {
    // An older server builds its tag with "NOT FOUND" when the date is missing: the panel ignores the tag.
    const t = mandiPanelText({ ...live, arrivalDate: null, tag: 'data.gov.in Agmarknet, live, arrival date NOT FOUND' }, true);
    assert.equal(t.priceMain, '₹2,275');
    assert.ok(!all(t).includes('NOT FOUND'), all(t));
  });

  it('review 2: a failed call with the key set says it could not be fetched, not that no price was reported', () => {
    const t = mandiPanelText(withKey('call_failed', 'the data.gov.in call failed (timed out)'), true);
    assert.equal(t.priceMain, 'Price could not be fetched right now');
    assert.ok(!all(t).includes('No price reported') && !all(t).includes('Linked'), all(t));
  });

  it('review 2: an unknown reason with the key set is treated as a failed fetch, never blamed on the market', () => {
    assert.equal(mandiPanelText(withKey(undefined, 'something'), true).priceMain, 'Price could not be fetched right now');
  });

  it('review 2: only an empty answer from data.gov.in says no price was reported', () => {
    for (const code of ['no_records', 'no_price']) {
      const t = mandiPanelText(withKey(code, 'none'), true);
      assert.equal(t.priceMain, 'No price reported', code);
      assert.ok(!all(t).includes('not connected'), all(t));
    }
  });

  it('review 3: the title says "Latest", not "Today\'s"', () => {
    const t = mandiPanelText(live, true);
    assert.ok(t.title.startsWith('Latest mandi price'), t.title);
    assert.ok(!all(t).includes("Today's"));
  });

  it('review 4: while the key status is unknown and nothing says offline, it says "Checking…"', () => {
    assert.equal(mandiPanelText(null, null).sourceNote, 'Checking…');
    // price reply arrived before the health check: the reply's own key status is used
    assert.equal(mandiPanelText(noKeyReply, null).sourceNote, 'Coming soon');
  });

  it('review 4: when the page really is offline, it says not available, in plain words', () => {
    const t = mandiPanelText({ ...noKeyReply, apiKeyConfigured: undefined, offline: true, reasonCode: 'offline' }, null);
    assert.equal(t.priceMain, 'Price not available right now');
    assert.ok(!all(t).toLowerCase().includes('server'), all(t));
  });

  it('while loading it says Loading, never "No crop linked"', () => {
    const t = mandiPanelText(null, null);
    assert.equal(t.priceMain, 'Loading…');
    assert.ok(!all(t).includes('No crop linked'));
  });

  it('a business with no crop says so and shows no price', () => {
    const t = mandiPanelText({ status: 'no_crop', isLive: false, modalPrice: null }, false);
    assert.equal(t.commodity, 'No crop linked to this business');
    assert.ok(!/₹/.test(all(t)));
  });

  it('the state and the crop link stay marked as assumed', () => {
    assert.ok(mandiPanelText(noKeyReply, false).commodityNote.includes('(assumed)'));
  });

  it('Home renders the panel title, its source with a status, and none of the old setting text', () => {
    assert.ok(html.includes('Latest mandi price'));
    assert.ok(html.includes('Agmarknet, Government of India') && html.includes('Checking…'));
    for (const bad of ['DATA_GOV_IN_API_KEY', 'API Integration Status', 'NOT FOUND']) assert.ok(!html.includes(bad), bad);
  });
});

describe('1f A: the chat says it is ready to help', () => {
  it('the bubble text is in Hindi and English', () => {
    assert.ok(/Ready to help/.test(CHAT_HINT.en));
    assert.ok(/मदद के लिए तैयार/.test(CHAT_HINT.hi));
  });

  it('Home shows the bubble next to the closed chat button, with a close button', () => {
    assert.ok(html.includes('मदद / Ask AI'));
    assert.ok(html.includes('Ready to help') && html.includes('मदद के लिए तैयार'));
    assert.ok(html.includes('aria-label="Hide this tip"'));
  });

  it('the bubble does not show while the server is down', () => {
    const out = chat({ open: false, online: false });
    assert.ok(out.includes('मदद / Ask AI'));
    assert.ok(!out.includes('Ready to help'));
  });

  it('the bubble does not show over the open chat', () => {
    const out = chat({ open: true, online: true, language: 'en' });
    assert.ok(out.includes('role="dialog"'));
    assert.ok(!out.includes('Ready to help'));
  });

  it('review 5: the bubble is not a live "status" region (it holds buttons)', () => {
    const out = chat({ open: false, online: true });
    const bubble = out.slice(0, out.indexOf('Ready to help'));
    assert.ok(!bubble.includes('role="status"'), 'role="status" around the tip');
  });
});
