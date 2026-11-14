/**
 * Fixes after the owner's Windows laptop check (14 Nov 2026). Owner's decisions:
 *  1 Home: bring back the government market-price panel (A) and "03 Engines Active" (B) as they were,
 *    the example cards with the tailoring photo (C) and an honest district badge (D); not
 *    "data.gov.in connected" or "Statutory Profile Verified" (E, F). The two empty gaps close.
 *  2 the "Server offline" banner names start.bat / start.command.
 * Needs the two SSR bundles (see stage3_website.test.js).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ProductionDashboard from '../dist-ssr/prod/ProductionDashboard.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const render = (user) => renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'home' }));
const withDistrict = { name: 'Asha Devi', category: 'SC', district: 'Agra', id: 'TEST-1E' };
const noDistrict = { name: 'Asha Devi', category: 'SC', id: 'TEST-1E' };

describe('1e Home: the old panels back, honestly', () => {
  const html = render(withDistrict);

  it('A: the government market-price panel, with the key status and no dataset ID', () => {
    for (const s of ['Open Government Data', 'Commodity &amp; Market', 'Modal Spot Price', 'API Integration Status',
      'DATA_GOV_IN_API_KEY', 'Agmarknet (data.gov.in)']) assert.ok(html.includes(s), s);
  });

  it('review: while the price is loading the panel says so, never "No crop linked"', () => {
    // The server render has not asked data.gov.in yet: exactly the "loading" moment (D01 is linked to a crop).
    assert.ok(html.includes('Loading…'));
    assert.ok(!html.includes('No crop linked to this business'));
  });

  it('B: the "03 Engines Active" panel on Home, with the verified NSFDC rates', () => {
    assert.ok(html.includes('03 Engines Active') && html.includes('6.5%/8.0% [S1]'));
  });

  it('C: the example cards with the real tailoring photo, above the saved scenarios', () => {
    for (const s of ['Examples to start from', 'D20 Metal Smithy', 'D18 Tailoring Workshop', 'Moneylender debt relief',
      '/images/scenario_tailoring.jpg', 'Recent scenarios']) assert.ok(html.includes(s), s);
    assert.ok(html.indexOf('Examples to start from') < html.indexOf('Recent scenarios'));
  });

  it('D: the badge shows the user\'s own district, self-declared; none without one', () => {
    assert.ok(html.includes('Agra (self-declared)'));
    assert.ok(!/>Agra</.test(html), 'the district shows nowhere without "(self-declared)"');
    assert.ok(!render(noDistrict).includes('(self-declared)</span>'));
  });

  it('E/F stay out: no false "connected" or "verified" claims, no default district', () => {
    for (const s of ['data.gov.in connected', 'Profile Verified', 'STATUTORY-VERIFIED', 'Sitapur']) assert.ok(!html.includes(s), s);
  });

  it('the two empty gaps: the centre column stacks its blocks at the top', () => {
    const main = read('components/dashboard/CenterWorkspace.jsx').match(/<main className="([^"]+)"/)[1];
    assert.ok(!main.includes('justify-between') && main.includes('justify-start'), main);
  });

  it('examples are never saved with the user\'s own scenarios', () => {
    const code = read('components/ProductionDashboard.jsx');
    assert.ok(/EXAMPLE_SCENARIOS/.test(code));
    assert.ok(!/setItem\(SCENARIOS_KEY[^)]*EXAMPLE/.test(code));
  });
});

describe('1e banner: the "Server offline" message works on Windows too', () => {
  it('names start.bat and start.command, not a Linux-only command', () => {
    const code = read('components/ProductionDashboard.jsx');
    assert.ok(code.includes('start.bat') && code.includes('start.command'));
    assert.ok(!code.includes('backend/.venv/bin/uvicorn'));
  });
});
