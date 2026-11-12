/** Stage A, chat panel: safe bold drawing, starter questions, notices per language, language sent to the server. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { boldParts, STARTERS, chatNotice, CHAT_UI } from '../src/services/chatText.js';
import { sendChat, chatContext } from '../src/services/api.js';
import React from 'react';
import { renderToString } from 'react-dom/server';
// Built by: npx vite build --ssr src/components/ProductionDashboard.jsx --outDir dist-ssr/prod
import ProductionDashboard from '../dist-ssr/prod/ProductionDashboard.js';

describe('bold drawing: **x** becomes bold, nothing else is drawn as page code', () => {
  it('splits **bold** from plain text and drops the stars', () => {
    assert.deepStrictEqual(boldParts('Loan **₹1,25,000** for you'),
      [{ text: 'Loan ', bold: false }, { text: '₹1,25,000', bold: true }, { text: ' for you', bold: false }]);
  });
  it('a lone ** never shows on screen', () => {
    const parts = boldParts('half **open and ** stray **');
    assert.ok(parts.every((p) => !p.text.includes('**')));
  });
  it('page code from the AI stays plain text (React escapes it; no HTML is built)', () => {
    assert.deepStrictEqual(boldParts('<img src=x onerror=alert(1)>'), [{ text: '<img src=x onerror=alert(1)>', bold: false }]);
  });
  it('empty or missing text -> nothing', () => {
    assert.deepStrictEqual(boldParts(''), []);
    assert.deepStrictEqual(boldParts(null), []);
  });
});

describe('starter questions', () => {
  it('3 per language, none with a number in it', () => {
    for (const lang of ['hi', 'en']) {
      assert.equal(STARTERS[lang].length, 3);
      for (const q of STARTERS[lang]) assert.ok(!/[0-9०-९]/.test(q), q);
    }
  });
  it('Hindi starters are in Hindi', () => {
    for (const q of STARTERS.hi) assert.ok(/[ऀ-ॿ]/.test(q), q);
  });
});

describe('notices follow the chosen language', () => {
  it('Hindi only, English only, or both when no language is chosen yet', () => {
    const hi = chatNotice('serverOffline', 'hi');
    const en = chatNotice('serverOffline', 'en');
    const both = chatNotice('serverOffline', null);
    assert.ok(/[ऀ-ॿ]/.test(hi) && !/[a-z]{4}/.test(hi.replace(/AI|GROQ_API_KEY|DPR/g, '')));
    assert.ok(!/[ऀ-ॿ]/.test(en));
    assert.ok(both.includes(hi) && both.includes(en));
  });
  it('every notice exists in both languages', () => {
    for (const k of ['aiOff', 'keyRejected', 'serverOffline', 'error']) {
      assert.ok(chatNotice(k, 'hi') && chatNotice(k, 'en'), k);
    }
  });
  it('panel words exist in both languages', () => {
    assert.deepStrictEqual(Object.keys(CHAT_UI.hi).sort(), Object.keys(CHAT_UI.en).sort());
  });
});

describe('sendChat sends the language', () => {
  it('posts {messages, language}; no language -> the field is left out', async () => {
    const bodies = [];
    globalThis.fetch = async (url, opts) => { bodies.push(JSON.parse(opts.body)); return new Response('{"status":"ok","reply":"x"}', { status: 200 }); };
    await sendChat([{ role: 'user', content: 'hi' }], 'hi');
    await sendChat([{ role: 'user', content: 'hi' }]);
    assert.equal(bodies[0].language, 'hi');
    assert.ok(!('language' in bodies[1]));
  });
});

// Stage A follow-up, browser test of 12 Nov 2026: the chat asked for income and SC status that
// My account already held. Only the user's own entries are sent.
describe('chatContext: only what the user entered goes to the chat', () => {
  const all = { code: 'D01', businessPicked: true, projectCost: '140000', costChosen: true, familyIncome: '150000', isSc: true };
  it('everything entered -> all four fields, as numbers', () => {
    assert.deepStrictEqual(chatContext(all), { code: 'D01', projectCost: 140000, familyIncome: 150000, isSc: true });
  });
  it('the default-highlighted business is not sent', () => {
    assert.ok(!('code' in chatContext({ ...all, businessPicked: false })));
  });
  it('a cost the user did not choose (filled from the research file) is not sent', () => {
    assert.ok(!('projectCost' in chatContext({ ...all, costChosen: false })));
  });
  it('a chosen but cleared or zero cost is not sent (the server would refuse 0)', () => {
    for (const projectCost of ['', '0', '-5', 'abc']) assert.ok(!('projectCost' in chatContext({ ...all, projectCost })), projectCost);
  });
  it('an empty income box is not sent; an income of 0 is', () => {
    assert.ok(!('familyIncome' in chatContext({ ...all, familyIncome: '' })));
    assert.equal(chatContext({ ...all, familyIncome: '0' }).familyIncome, 0);
  });
  it('an unanswered SC question is not sent; "no" is', () => {
    assert.ok(!('isSc' in chatContext({ ...all, isSc: null })));
    assert.equal(chatContext({ ...all, isSc: false }).isSc, false);
  });
  it('a number above the server\'s limit (10^12) is left out, so the chat is not refused', () => {
    const c = chatContext({ ...all, projectCost: '2e12', familyIncome: '5e12' });
    assert.ok(!('projectCost' in c) && !('familyIncome' in c));
    assert.equal(chatContext({ ...all, familyIncome: '1000000000000' }).familyIncome, 1e12);
  });
  it('nothing known -> null', () => {
    assert.equal(chatContext({ code: 'D01', businessPicked: false, projectCost: '', costChosen: false, familyIncome: '', isSc: null }), null);
  });
});

// Review finding, owner's ruling "fix now" (12 Nov 2026): a question typed on the front page is
// sent in the dashboard's first render, before an effect could fill the income box, so it went
// without the saved income. The box must hold it from the first render (server render = first render).
describe('the saved income is in the loan box from the first render', () => {
  it('signed in with a saved yearly income -> the income box already shows it', () => {
    const user = { id: 'u1', name: 'Asha Devi', category: null, income: 150000 };
    const html = renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'amortizer' }));
    assert.match(html, /placeholder="whole family, per year"[^>]*value="150000"|value="150000"[^>]*placeholder="whole family, per year"/);
  });
  it('no saved income -> the box starts empty', () => {
    const html = renderToString(React.createElement(ProductionDashboard, { currentUser: { id: 'u2', name: 'Kavita' }, initialTab: 'amortizer' }));
    assert.doesNotMatch(html, /placeholder="whole family, per year"[^>]*value="\d/);
  });
});

describe('sendChat sends the context only when it has something in it', () => {
  it('context given -> in the body; null or {} -> left out', async () => {
    const bodies = [];
    globalThis.fetch = async (url, opts) => { bodies.push(JSON.parse(opts.body)); return new Response('{"status":"ok","reply":"x"}', { status: 200 }); };
    const msgs = [{ role: 'user', content: 'hi' }];
    await sendChat(msgs, 'en', { familyIncome: 150000 });
    await sendChat(msgs, 'en', null);
    await sendChat(msgs, 'en', {});
    assert.deepStrictEqual(bodies[0].context, { familyIncome: 150000 });
    assert.ok(!('context' in bodies[1]) && !('context' in bodies[2]));
  });
});
