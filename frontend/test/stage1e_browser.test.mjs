/**
 * Fix 1 in a real browser (owner's decision, 14 Nov 2026): no Home block has more than 24 px of empty
 * space above it, at 1024x768 and at phone width (390 px). Saves screenshots for the owner.
 * Needs Playwright (pre-installed in the cloud session, not a project package) and the server on
 * http://127.0.0.1:8000 serving a fresh `npm run build`; otherwise SKIPPED, never counted as passed.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const BASE = 'http://127.0.0.1:8000';
const require = createRequire(import.meta.url);
let chromium = null;
let skip = false;
try { ({ chromium } = require('playwright')); } catch { skip = 'Playwright is not installed here'; }
if (!skip) {
  try { const r = await fetch(`${BASE}/api/health`); if (!r.ok) skip = 'server on port 8000 did not answer'; } catch { skip = 'server on port 8000 is not running'; }
}
const user = { id: 'DEMO-1E01', name: 'Test User', phone: '9000000001', pin: '2026', category: 'Scheduled Caste (SC)',
  income: 120000, district: 'Agra', authProvider: 'local' };

describe('Stage 1e: Home has no big empty gaps', { skip }, () => {
  let browser;
  before(async () => { browser = await chromium.launch(); });
  after(async () => { if (browser) await browser.close(); });

  for (const [w, h] of [[1024, 768], [390, 844]]) {
    it(`at ${w}px wide, no block has more than 24 px of empty space above it`, async () => {
      const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate((u) => { localStorage.clear(); localStorage.setItem('udyamsetuai_users_db_v1', JSON.stringify([u]));
        localStorage.setItem('udyamsetuai_active_session_v1', JSON.stringify(u)); }, user);
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
      const gaps = await page.evaluate(() => {
        const main = [...document.querySelectorAll('main')].find((e) => e.className.includes('lg:col-span-6'));
        const kids = [...main.children].map((c) => c.getBoundingClientRect()).filter((b) => b.height > 0);
        return kids.slice(1).map((b, i) => Math.round(b.top - kids[i].bottom));
      });
      assert.ok(gaps.every((g) => g <= 24), `gaps: ${gaps.join(', ')} px`);
      assert.ok(gaps.length >= 4, `blocks: ${gaps.length + 1}`);         // header, cards, steps, 2 panels
      await page.screenshot({ path: path.join(os.tmpdir(), `udyamsetuai_home_${w}.png`), fullPage: true });
    });
  }
});
