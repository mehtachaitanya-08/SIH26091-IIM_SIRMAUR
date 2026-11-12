/** Stage A, chat panel: safe bold drawing, starter questions, notices per language, language sent to the server. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { boldParts, STARTERS, chatNotice, CHAT_UI } from '../src/services/chatText.js';
import { sendChat } from '../src/services/api.js';

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
