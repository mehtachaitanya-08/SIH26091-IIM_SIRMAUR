/**
 * The website side of the chat's rate limit (14 Nov 2026, owner's request). The server answers HTTP 429
 * with how long to wait and which limit was hit ("visitor" or "daily"). The website must:
 *  - turn that into a plain-words notice in the chosen language (Hindi and English when none is chosen),
 *  - give the question back in the box (the same as when the server is off), never lose it,
 *  - never show a status code, a setting name, or "rate limit".
 */
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { chatNotice } from '../src/services/chatText.js';
import { sendChat } from '../src/services/api.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const reply = (status, body) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
  json: async () => body
});

describe('1g the notice for a refused question', () => {
  it('says how long to wait, in minutes rounded up, in English', () => {
    assert.match(chatNotice('rateLimited', 'en', { retryAfterSeconds: 90, scope: 'visitor' }), /wait about 2 minutes/);
    assert.match(chatNotice('rateLimited', 'en', { retryAfterSeconds: 30, scope: 'visitor' }), /wait about 1 minute and/);
    assert.match(chatNotice('rateLimited', 'en', { retryAfterSeconds: 600, scope: 'visitor' }), /10 minutes/);
  });

  it('says it in Hindi, and in both languages before one is chosen', () => {
    const hi = chatNotice('rateLimited', 'hi', { retryAfterSeconds: 120, scope: 'visitor' });
    assert.ok(/मिनट/.test(hi) && !/[A-Za-z]{4,}/.test(hi.replace(/\d+/g, '')), hi);
    const both = chatNotice('rateLimited', null, { retryAfterSeconds: 120, scope: 'visitor' });
    assert.ok(/मिनट/.test(both) && /minutes/.test(both), both);
    assert.ok(both.indexOf('मिनट') < both.indexOf('minutes'), 'Hindi first, as the other notices');
  });

  it('a long daily wait says "tomorrow", not a wait in minutes', () => {
    const en = chatNotice('rateLimited', 'en', { retryAfterSeconds: 40000, scope: 'daily' });
    assert.match(en, /today's limit/);
    assert.match(en, /tomorrow/);
    assert.ok(!/minute/.test(en), en);
    assert.match(chatNotice('rateLimited', 'hi', { retryAfterSeconds: 40000, scope: 'daily' }), /कल/);
  });

  it('review 4: a short daily wait says the minutes, never "tomorrow" (the daily cap slides)', () => {
    const en = chatNotice('rateLimited', 'en', { retryAfterSeconds: 600, scope: 'daily' });
    assert.match(en, /wait about 10 minutes/);
    assert.ok(!/tomorrow/.test(en), en);
    const hi = chatNotice('rateLimited', 'hi', { retryAfterSeconds: 600, scope: 'daily' });
    assert.ok(/10 मिनट/.test(hi) && !/कल /.test(hi), hi);
  });

  it('the edge between "minutes" and "tomorrow" is two hours, the same as the server', () => {
    assert.ok(!/tomorrow/.test(chatNotice('rateLimited', 'en', { retryAfterSeconds: 7200, scope: 'daily' })));
    assert.match(chatNotice('rateLimited', 'en', { retryAfterSeconds: 7201, scope: 'daily' }), /tomorrow/);
  });

  it('review 3: when the assistant is busy it says so and gives the wait', () => {
    const en = chatNotice('rateLimited', 'en', { retryAfterSeconds: 40, scope: 'busy' });
    assert.match(en, /busy/);
    assert.match(en, /wait about 1 minute and/);
    assert.match(chatNotice('rateLimited', 'hi', { retryAfterSeconds: 40, scope: 'busy' }), /व्यस्त/);
  });

  it('tells the person their question is kept, and that the loan calculator still works', () => {
    for (const scope of ['visitor', 'daily', 'busy']) {
      const en = chatNotice('rateLimited', 'en', { retryAfterSeconds: 100, scope });
      assert.match(en, /saved in the box/);
      assert.match(en, /loan calculator still works/);
    }
  });

  it('never shows a status code, a setting name or "rate limit"', () => {
    for (const lang of ['en', 'hi', null]) {
      for (const scope of ['visitor', 'daily', 'busy']) {
        const t = chatNotice('rateLimited', lang, { retryAfterSeconds: 100, scope });
        for (const bad of ['429', 'rate limit', 'rate-limit', 'CHAT_', 'Groq', 'token']) assert.ok(!t.includes(bad), `${bad} in: ${t}`);
      }
    }
  });

  it('a missing or odd wait still gives a sensible message', () => {
    assert.match(chatNotice('rateLimited', 'en', {}), /wait about 1 minute/);
    assert.match(chatNotice('rateLimited', 'en', { retryAfterSeconds: 'soon', scope: 'visitor' }), /wait about 1 minute/);
    assert.match(chatNotice('rateLimited', 'en'), /wait about 1 minute/);
  });

  it('the older notices are unchanged', () => {
    assert.equal(chatNotice('error', 'en'), 'Something went wrong with the chat.');
    assert.equal(chatNotice('nope', 'en'), null);
  });
});

describe('1g sendChat turns the server\'s refusal into something the dashboard can act on', () => {
  it('HTTP 429 becomes status "rate_limited" with the wait and the scope, and no reply', async () => {
    globalThis.fetch = reply(429, { error: 'wait', status: 429, details: { retryAfterSeconds: 120, scope: 'visitor' } });
    const res = await sendChat([{ role: 'user', content: 'hi' }], 'en');
    assert.deepEqual(res, { status: 'rate_limited', reply: null, retryAfterSeconds: 120, scope: 'visitor' });
  });

  it('a daily-cap refusal keeps its scope', async () => {
    globalThis.fetch = reply(429, { error: 'busy', status: 429, details: { retryAfterSeconds: 30000, scope: 'daily' } });
    assert.equal((await sendChat([{ role: 'user', content: 'hi' }], 'hi')).scope, 'daily');
  });

  it('a 429 with no details is still a rate-limit answer, never a crash', async () => {
    globalThis.fetch = reply(429, { error: 'wait', status: 429 });
    const res = await sendChat([{ role: 'user', content: 'hi' }], 'en');
    assert.equal(res.status, 'rate_limited');
    assert.equal(res.reply, null);
  });

  it('a normal answer passes through untouched', async () => {
    globalThis.fetch = reply(200, { status: 'ok', reply: 'Namaste', tool_results: [] });
    assert.deepEqual(await sendChat([{ role: 'user', content: 'hi' }], 'en'), { status: 'ok', reply: 'Namaste', tool_results: [] });
  });

  it('other errors still throw: a refusal must not hide a real failure', async () => {
    globalThis.fetch = reply(400, { error: "'messages' must be a list", status: 400 });
    await assert.rejects(() => sendChat([], 'en'), /must be a list/);
  });

  it('a server that is off is still reported as off', async () => {
    globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
    const res = await sendChat([{ role: 'user', content: 'hi' }], 'en');
    assert.equal(res.offline, true);
  });
});
