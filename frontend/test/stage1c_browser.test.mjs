/**
 * Stage 1c in a real browser (owner's decision 18, 13 Nov 2026): the DPR-tab form. Needs Playwright
 * (pre-installed in the cloud session, not a project package) and the server on http://127.0.0.1:8000
 * serving a fresh `npm run build`. Without either, these tests are SKIPPED and say why: never counted as passed.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import * as F from '../src/services/applicantForm.js';

const BASE = 'http://127.0.0.1:8000';
const require = createRequire(import.meta.url);
let chromium = null;
let skip = false;
try { ({ chromium } = require('playwright')); } catch { skip = 'Playwright is not installed here'; }
if (!skip) {
  try { const r = await fetch(`${BASE}/api/health`); if (!r.ok) skip = 'server on port 8000 did not answer'; } catch { skip = 'server on port 8000 is not running'; }
}

const user = { id: 'DEMO-1C01', name: 'Test User', phone: '9000000001', pin: '2026', category: 'Scheduled Caste (SC)',
  income: 120000, district: 'Agra', authProvider: 'local' };
const TYPED = ['MARK-SITE-5521', 'MARKP5521Q', '5521', 'MARK-PROM-5521'];

describe('Stage 1c: the DPR form in the browser', { skip }, () => {
  let browser;
  before(async () => { browser = await chromium.launch(); });
  after(async () => { if (browser) await browser.close(); });

  const open = async ({ signedIn = true, viewport = { width: 1400, height: 1000 } } = {}) => {
    const ctx = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(([u, s]) => {
      localStorage.clear(); sessionStorage.clear();
      localStorage.setItem('udyamsetuai_users_db_v1', JSON.stringify([u]));
      if (s) localStorage.setItem('udyamsetuai_active_session_v1', JSON.stringify(u));
    }, [user, signedIn]);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    return page;
  };
  const toTab = (page, name) => page.getByRole('button', { name }).first().click();
  const box = (page, key) => page.locator(`[data-applicant="${key}"]`).first();
  const openAll = async (page) => {
    for (const d of await page.locator('details[data-applicant-section]').all()) {
      if ((await d.getAttribute('open')) === null) await d.locator('summary').click();   // an open one reads ""
    }
  };
  const enterCost = async (page) => {
    await toTab(page, 'Your loan and repayments');
    await page.getByPlaceholder('e.g. total cost of machines and set-up').fill('140000');
    await page.waitForTimeout(1200);
  };
  const storageText = (page) => page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));

  it('pre-filled from My account; typed values are sent with the download and a real PDF comes back', async () => {
    const page = await open();
    await enterCost(page);
    await toTab(page, 'Download report (DPR)');
    assert.equal(await box(page, 'name').inputValue(), 'Test User');
    assert.equal(await box(page, 'district').inputValue(), 'Agra');
    await openAll(page);
    await box(page, 'siteAddress').fill('MARK-SITE-5521');
    await box(page, 'pan').fill('MARKP5521Q');
    await box(page, 'aadhaarLast4').fill('5521');
    await box(page, 'dateOfEstablishment').fill('2024-04-01');
    await box(page, 'isWoman').selectOption('yes');
    await box(page, 'promoters.0.name').fill('MARK-PROM-5521');
    await page.locator('[data-applicant="enclosures"][value="land documents"]').check();
    let sent = null;
    page.on('request', (r) => { if (r.url().endsWith('/api/dpr')) sent = JSON.parse(r.postData()); });
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download DPR PDF' }).click()]);
    assert.ok(sent, 'no /api/dpr request');
    assert.equal(sent.applicantName, undefined);
    assert.deepEqual(sent.applicant, {
      name: 'Test User', siteAddress: 'MARK-SITE-5521', district: 'Agra', pan: 'MARKP5521Q', aadhaarLast4: '5521',
      dateOfEstablishment: '01-04-2024', isWoman: true, promoters: [{ name: 'MARK-PROM-5521' }], enclosures: ['land documents'],
    });
    const pdf = fs.readFileSync(await download.path());
    assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
    const stored = await storageText(page);
    for (const v of TYPED) assert.ok(!stored.includes(v), `browser storage holds ${v}`);
  });

  it('a bad Aadhaar: no request, the message is shown', async () => {
    const page = await open();
    await enterCost(page);
    await toTab(page, 'Download report (DPR)');
    await box(page, 'aadhaarLast4').fill('12a4');
    let calls = 0;
    page.on('request', (r) => { if (r.url().endsWith('/api/dpr')) calls += 1; });
    await page.getByRole('button', { name: 'Download DPR PDF' }).click();
    await page.waitForTimeout(800);
    assert.equal(calls, 0);
    assert.ok(await page.getByRole('alert').filter({ hasText: 'Aadhaar' }).first().isVisible());
  });

  it('switching tabs keeps typed values; a reload empties them except the account pre-fill', async () => {
    const page = await open();
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    await box(page, 'siteAddress').fill('MARK-SITE-5521');
    await toTab(page, 'Feasibility');
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    assert.equal(await box(page, 'siteAddress').inputValue(), 'MARK-SITE-5521');
    await page.reload({ waitUntil: 'networkidle' });
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    assert.equal(await box(page, 'siteAddress').inputValue(), '');
    assert.equal(await box(page, 'name').inputValue(), 'Test User');
  });

  it('"Clear form" empties the boxes and puts the account name and district back', async () => {
    const page = await open();
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    await box(page, 'name').fill('Someone Else');
    await box(page, 'siteAddress').fill('MARK-SITE-5521');
    await page.getByRole('button', { name: 'Clear form' }).click();
    await openAll(page);
    assert.equal(await box(page, 'siteAddress').inputValue(), '');
    assert.equal(await box(page, 'name').inputValue(), 'Test User');
    assert.equal(await box(page, 'district').inputValue(), 'Agra');
  });

  it('a guest who signs in: typed values cleared, then the new user\'s pre-fill', async () => {
    const page = await open({ signedIn: false });
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    assert.equal(await box(page, 'name').inputValue(), '');
    await box(page, 'siteAddress').fill('MARK-SITE-5521');
    // sign in from the dashboard header
    await page.getByRole('button', { name: 'Login / Register' }).first().click();
    await page.getByPlaceholder('Enter 10-digit mobile number').first().fill(user.phone);
    await page.getByPlaceholder('Enter 4-digit PIN').first().fill(user.pin);
    await page.getByRole('button', { name: 'Sign In & Open Workspace' }).click();
    await page.waitForTimeout(800);
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    assert.equal(await box(page, 'siteAddress').inputValue(), '');
    assert.equal(await box(page, 'name').inputValue(), 'Test User');
    assert.equal(await box(page, 'district').inputValue(), 'Agra');
  });

  it('phone width (390 px): the form opens and every section folds out', async () => {
    const page = await open({ viewport: { width: 390, height: 844 } });
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    const sections = page.locator('details[data-applicant-section]');
    assert.ok((await sections.count()) >= 9);
    for (const d of await sections.all()) assert.notEqual(await d.getAttribute('open'), null);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `page scrolls sideways by ${overflow}px`);
  });

  // Review fixes (owner's rulings, 13 Nov 2026)
  it('finding 1: the full Aadhaar number typed or pasted is kept as typed and refused, never cut to its first 4', async () => {
    const page = await open();
    await enterCost(page);
    await toTab(page, 'Download report (DPR)');
    let calls = 0;
    page.on('request', (r) => { if (r.url().endsWith('/api/dpr')) calls += 1; });
    for (const full of ['123456789012', '1234 5678 9012']) {
      await box(page, 'aadhaarLast4').fill(full);
      assert.equal(await box(page, 'aadhaarLast4').inputValue(), full);
      await page.getByRole('button', { name: 'Download DPR PDF' }).click();
      await page.waitForTimeout(500);
      assert.ok(await page.getByRole('alert').filter({ hasText: 'last 4 digits' }).first().isVisible());
    }
    assert.equal(calls, 0);
  });

  it('findings 2 and 5: a long address is kept whole with its message; the Applicant line follows the name box', async () => {
    const page = await open();
    await toTab(page, 'Download report (DPR)');
    await openAll(page);
    const long = 'A'.repeat(133);
    await box(page, 'siteAddress').fill(long);
    assert.equal(await box(page, 'siteAddress').inputValue(), long);
    assert.ok(await page.getByText('133 / 120').first().isVisible());
    assert.ok(await page.getByText(/at most 120 characters/).first().isVisible());
    await box(page, 'name').fill('Form Name Here');
    assert.ok(await page.getByText('Form Name Here', { exact: false }).first().isVisible());
  });

  it('finding 4: a server error is titled as a server error, not as a form problem', async () => {
    const page = await open();
    await enterCost(page);
    await toTab(page, 'Download report (DPR)');
    await page.route('**/api/dpr', (r) => r.fulfill({ status: 500, contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal consistency check failed; no figures returned.', status: 500, timestamp: 'x' }) }));
    await page.getByRole('button', { name: 'Download DPR PDF' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Internal consistency check failed' }).first();
    await alert.waitFor();
    assert.ok((await alert.textContent()).includes('The server could not make the DPR:'));
    assert.ok(!(await alert.textContent()).includes('Not sent. Please fix:'));
  });
});

describe('Stage 1c: review findings 8 and 9', { skip }, () => {
  let browser;
  before(async () => { browser = await chromium.launch(); });
  after(async () => { if (browser) await browser.close(); });

  it('finding 8: an account change updates only unedited boxes; "Clear form" resets that tracking', async () => {
    const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((u) => { localStorage.clear(); localStorage.setItem('udyamsetuai_users_db_v1', JSON.stringify([u]));
      localStorage.setItem('udyamsetuai_active_session_v1', JSON.stringify(u)); }, user);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Download report (DPR)' }).first().click();
    const box = (key) => page.locator(`[data-applicant="${key}"]`).first();
    const account = async (changes) => {
      await page.getByTitle('My account').first().click();
      const dlg = page.getByRole('dialog', { name: 'My account' });
      for (const [label, v] of Object.entries(changes)) await dlg.getByLabel(label, { exact: true }).fill(v);
      await dlg.getByRole('button', { name: 'Save' }).click();
      await dlg.getByRole('button', { name: 'Close' }).click();
    };
    await box('name').fill('Edited Name');
    await account({ District: 'Etah' });
    assert.equal(await box('name').inputValue(), 'Edited Name');     // edited: kept
    assert.equal(await box('district').inputValue(), 'Etah');        // not edited: follows the account
    await page.getByRole('button', { name: 'Clear form' }).click();
    assert.equal(await box('name').inputValue(), 'Test User');
    await account({ Name: 'Renamed User', District: 'Mathura' });
    assert.equal(await box('name').inputValue(), 'Renamed User');    // tracking was reset by Clear form
    assert.equal(await box('district').inputValue(), 'Mathura');
  });

  // Finding 9: the browser's check and the real server must give the same answer for each value.
  // (Enclosures are not compared: they come only from the 8 tick boxes, and unknown names are never sent.)
  it('finding 9: the browser check and the real server agree on every case', async () => {
    const p = (o) => ({ ...F.emptyPromoter(), name: 'P', ...o });
    const cases = {
      'Aadhaar 1234': { aadhaarLast4: '1234' }, 'Aadhaar 12345': { aadhaarLast4: '12345' },
      'Aadhaar Arabic digits': { aadhaarLast4: '١٢٣٤' }, 'Aadhaar Devanagari digits': { aadhaarLast4: '१२३४' },
      'Aadhaar full, spaced': { aadhaarLast4: '1234 5678 9012' }, 'name 80': { name: 'x'.repeat(80) },
      'name 81': { name: 'x'.repeat(81) }, 'district 120': { district: 'x'.repeat(120) },
      'district 121': { district: 'x'.repeat(121) }, 'emoji 120': { village: '😀'.repeat(120) },
      'emoji 121': { village: '😀'.repeat(121) }, 'Hindi 120': { village: 'क'.repeat(120) },
      '3 promoters': { promoters: [p(), p(), p()] }, '4 promoters': { promoters: [p(), p(), p(), p()] },
      'promoter Aadhaar 99': { promoters: [p({ aadhaarLast4: '99' })] },
      'promoter name 81': { promoters: [p({ name: 'y'.repeat(81) })] },
    };
    const differ = [];
    for (const [label, v] of Object.entries(cases)) {
      const values = { ...F.emptyApplicant(), ...v };
      const browserOk = F.checkApplicant(values).length === 0;
      const r = await fetch(`${BASE}/api/dpr`, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: 'D20', projectCost: 140000, familyIncome: 180000, isSc: true, applicant: F.applicantPayload(values) }) });
      const serverOk = r.status === 200;
      if (browserOk !== serverOk) differ.push(`${label}: browser ${browserOk ? 'accepts' : 'refuses'}, server ${r.status}`);
    }
    assert.deepEqual(differ, []);
  });
});
