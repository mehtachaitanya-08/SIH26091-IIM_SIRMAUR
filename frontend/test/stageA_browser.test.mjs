/**
 * Stage A, in a real browser (review findings, owner's ruling 12 Nov 2026): the typing fix and the
 * account pre-fill. Needs Playwright (pre-installed in the cloud session, not a project package) and
 * the server on http://127.0.0.1:8000 serving a fresh `npm run build`. Without either, these tests
 * are SKIPPED and say why: they are never counted as passed.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const BASE = 'http://127.0.0.1:8000';
const require = createRequire(import.meta.url);
let chromium = null;
let skip = false;
try { ({ chromium } = require('playwright')); } catch { skip = 'Playwright is not installed here'; }
if (!skip) {
  try { const r = await fetch(`${BASE}/api/health`); if (!r.ok) skip = 'server on port 8000 did not answer'; } catch { skip = 'server on port 8000 is not running'; }
}

const user = { id: 'DEMO-0001', name: 'Test User', phone: '9876543210', pin: '2026', category: 'Scheduled Caste (SC)', income: 120000, authProvider: 'local' };

describe('Stage A in the browser', { skip }, () => {
  let browser;
  before(async () => { browser = await chromium.launch(); });
  after(async () => { if (browser) await browser.close(); });

  const open = async (tab) => {
    const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((u) => { localStorage.clear(); localStorage.setItem('udyamsetuai_users_db_v1', JSON.stringify([u])); localStorage.setItem('udyamsetuai_active_session_v1', JSON.stringify(u)); }, user);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: tab }).first().click();
    return page;
  };

  it('account pre-fill: an empty loan income box is filled from My account; the debt income box is not', async () => {
    const page = await open('Your loan and repayments');
    assert.equal(await page.getByPlaceholder('whole family, per year').inputValue(), '120000');
    await page.getByRole('button', { name: 'Pay off a moneylender loan' }).first().click();
    assert.equal(await page.locator('#debt-income').inputValue(), '');
  });

  it('typing fast: no loan call while typing, one call 0.4 s after the last key', async () => {
    const page = await open('Your loan and repayments');
    const cost = page.getByPlaceholder('e.g. total cost of machines and set-up');
    await cost.fill('');
    await page.waitForTimeout(800);
    const calls = [];
    page.on('request', (r) => { if (r.url().includes('/api/engine/nsfdc/calculate')) calls.push(JSON.parse(r.postData()).projectCost); });
    await cost.pressSequentially('100000', { delay: 60 });
    assert.equal(calls.length, 0, 'a loan call was made while typing');
    await page.waitForTimeout(1500);
    assert.deepEqual(calls, [100000]);
  });

  it('a late reply to an older cost is ignored; the newest cost\'s loan stays on screen', async () => {
    const page = await open('Your loan and repayments');
    let release;
    const held = new Promise((r) => { release = r; });
    let heldOne = false;
    await page.route('**/api/engine/nsfdc/calculate', async (route) => {
      const body = JSON.parse(route.request().postData());
      if (body.projectCost === 140000 && !heldOne) { heldOne = true; const resp = await route.fetch(); await held; await route.fulfill({ response: resp }); }
      else await route.continue();
    });
    const cost = page.getByPlaceholder('e.g. total cost of machines and set-up');
    await cost.fill('');
    await page.waitForTimeout(700);
    await cost.fill('140000');            // older cost: its reply is held back
    await page.waitForTimeout(700);
    assert.ok(heldOne, 'the 1,40,000 call was not made');
    await cost.fill('100000');            // newest cost: answered at once
    const loan = page.getByText('NSFDC loan:').locator('..');
    await page.waitForFunction(() => document.body.innerText.includes('₹90,000'), null, { timeout: 5000 });
    release();                            // the older reply now arrives late
    await page.waitForTimeout(800);
    const shown = await loan.innerText();
    assert.match(shown, /₹90,000/);       // the server's loan for ₹1,00,000 (90%) is still shown
    assert.doesNotMatch(shown, /1,25,000/); // not the late reply for ₹1,40,000
  });
});
