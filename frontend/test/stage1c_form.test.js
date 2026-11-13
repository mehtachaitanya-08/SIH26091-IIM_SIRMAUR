/**
 * Stage 1c: the applicant form in the DPR tab (owner's decisions 1-18, 13 Nov 2026).
 * The form's own checks must equal the server's (backend/dpr.py parse_applicant); typed values are
 * sent with the download and never saved. Needs the two SSR bundles (see stage3_website.test.js).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { dprPayload } from '../src/services/api.js';
import ProductionDashboard from '../dist-ssr/prod/ProductionDashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(SRC, rel));

// Loaded this way so each test fails on its own (not the whole file) before the module exists.
let F = null;
try { F = await import('../src/services/applicantForm.js'); } catch { F = null; }
const need = () => assert.ok(F, 'src/services/applicantForm.js is missing');

const base = { code: 'D20', projectCost: 140000, familyIncome: 180000, isSc: true };

describe('1c-15: the form and the server stay in step', () => {
  const py = fs.readFileSync(path.join(__dirname, '../../backend/dpr.py'), 'utf8');
  const list = (name) => {
    const m = py.match(new RegExp(`^${name} = \\[([\\s\\S]*?)\\]`, 'm'));
    assert.ok(m, `${name} not found in backend/dpr.py`);
    return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  };

  it('same applicant keys, promoter keys, yes/no keys, enclosures and limits', () => {
    need();
    const text = F.FIELDS.filter((f) => f.kind !== 'yesno').map((f) => f.key);
    const yesno = F.FIELDS.filter((f) => f.kind === 'yesno').map((f) => f.key);
    assert.deepEqual([...text].sort(), [...list('TEXT_FIELDS')].sort());
    assert.deepEqual([...yesno].sort(), [...list('BOOL_FIELDS')].sort());
    assert.deepEqual(F.PROMOTER_FIELDS.filter((f) => f.kind !== 'yesno').map((f) => f.key).sort(), [...list('PROMOTER_TEXT')].sort());
    assert.deepEqual(F.PROMOTER_FIELDS.filter((f) => f.kind === 'yesno').map((f) => f.key).sort(), [...list('BOOL_FIELDS')].sort());
    assert.deepEqual(F.ENCLOSURES, list('ENCLOSURES'));
    const caps = py.match(/^TEXT_CAP, NAME_CAP = (\d+), (\d+)/m);
    assert.equal(F.TEXT_CAP, Number(caps[1]));
    assert.equal(F.NAME_CAP, Number(caps[2]));
    assert.equal(F.MAX_PROMOTERS, Number(py.match(/^MAX_PROMOTERS = (\d+)/m)[1]));
  });

  it('65 inputs with one promoter (44 text + 2 yes/no + 11 promoter + 8 enclosures)', () => {
    need();
    assert.equal(F.FIELDS.length + F.PROMOTER_FIELDS.length + F.ENCLOSURES.length, 65);
    for (const f of [...F.FIELDS, ...F.PROMOTER_FIELDS]) {
      assert.ok(f.en && f.hi, `${f.key} needs an English and a Hindi label`);
    }
  });
});

describe('1c-6: the checks are exactly the server\'s', () => {
  const ok = (v) => { need(); assert.deepEqual(F.checkApplicant({ ...F.emptyApplicant(), ...v }), []); };
  const bad = (v, key) => {
    need();
    const p = F.checkApplicant({ ...F.emptyApplicant(), ...v });
    assert.ok(p.length > 0 && p.some((x) => x.key === key), `expected a problem on ${key}: ${JSON.stringify(p)}`);
    assert.ok(p.every((x) => typeof x.message === 'string' && x.message.length > 0));
  };

  it('Aadhaar: exactly 4 digits 0-9, or empty', () => {
    ok({ aadhaarLast4: '1234' });
    ok({ aadhaarLast4: '' });
    bad({ aadhaarLast4: '12345' }, 'aadhaarLast4');
    bad({ aadhaarLast4: '123' }, 'aadhaarLast4');
    bad({ aadhaarLast4: '١٢٣٤' }, 'aadhaarLast4');      // Arabic-Indic digits
    bad({ aadhaarLast4: '१२३४' }, 'aadhaarLast4');      // Devanagari digits
    bad({ aadhaarLast4: '12ab' }, 'aadhaarLast4');
  });

  it('text up to 120 characters, the name up to 80, counted as the server counts', () => {
    ok({ district: 'x'.repeat(120), name: 'x'.repeat(80) });
    bad({ district: 'x'.repeat(121) }, 'district');
    bad({ name: 'x'.repeat(81) }, 'name');
    ok({ village: '😀'.repeat(120) });                   // 120 characters for Python, 240 for .length
  });

  it('promoters: up to 3, each Aadhaar checked the same way', () => {
    const p = (o = {}) => ({ ...F.emptyPromoter(), name: 'P', ...o });
    need();
    ok({ promoters: [p(), p(), p()] });
    bad({ promoters: [p(), p(), p(), p()] }, 'promoters');
    bad({ promoters: [p({ aadhaarLast4: '99' })] }, 'promoters.0.aadhaarLast4');
    bad({ promoters: [p({ name: 'x'.repeat(81) })] }, 'promoters.0.name');
  });

  it('enclosures: only the 8 checklist names', () => {
    need();
    ok({ enclosures: ['land documents', 'bankability'] });
    bad({ enclosures: ['a photo'] }, 'enclosures');
  });

  it('surrounding spaces do not count (they are trimmed before sending)', () => {
    ok({ name: ` ${'x'.repeat(80)} ` });
    ok({ aadhaarLast4: ' 1234 ' });
  });
});

describe('1c: what is sent', () => {
  it('trims, drops empty boxes, empty promoters and "not said"; dates DD-MM-YYYY', () => {
    need();
    const v = {
      ...F.emptyApplicant(),
      name: '  Asha Devi ', district: '', pan: 'ABCDE1234F', isWoman: 'yes', isMinority: '',
      dateOfEstablishment: '2024-04-01', date: '2026-11-13',
      promoters: [{ ...F.emptyPromoter(), name: 'Ravi', isMinority: 'no' }, F.emptyPromoter()],
      enclosures: ['land documents'],
    };
    assert.deepEqual(F.applicantPayload(v), {
      name: 'Asha Devi', pan: 'ABCDE1234F', isWoman: true, dateOfEstablishment: '01-04-2024', date: '13-11-2026',
      promoters: [{ name: 'Ravi', isMinority: false }], enclosures: ['land documents'],
    });
  });

  it('an empty form sends nothing', () => {
    need();
    assert.deepEqual(F.applicantPayload(F.emptyApplicant()), {});
  });

  it('account pre-fill: name and district only; "Clear form" keeps them; an edited box is kept on an account change', () => {
    need();
    const acct = { name: 'Asha Devi', district: 'Agra', mobile: '9000000000', income: 1 };
    const v = F.emptyApplicant(F.accountPrefill(acct));
    assert.equal(v.name, 'Asha Devi');
    assert.equal(v.district, 'Agra');
    assert.equal(v.mobile, '');                         // decision 4: name and district only
    // 14b: the account changes; the name box was edited, the district box was not
    const next = F.withAccount({ ...v, name: 'My own name' }, F.accountPrefill({ name: 'New', district: 'Etah' }), new Set(['name']));
    assert.equal(next.name, 'My own name');
    assert.equal(next.district, 'Etah');
  });

  it('dprPayload sends applicant only when it holds something; applicantName still works', () => {
    assert.deepEqual(dprPayload({ ...base, applicant: { name: 'Asha' } }), { ...base, answers: {}, applicant: { name: 'Asha' } });
    assert.deepEqual(dprPayload({ ...base, applicant: {} }), { ...base, answers: {} });
    assert.deepEqual(dprPayload({ ...base, applicantName: 'Old' }), { ...base, answers: {}, applicantName: 'Old' });
  });
});

describe('1c: the DPR tab shows the form (real dashboard)', () => {
  const user = { name: 'Asha Devi', category: 'SC', district: 'Agra', id: 'TEST-1C' };
  const html = renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'dpr' }));

  it('form sections, Aadhaar last 4 only, self-declared marks, Clear form', () => {
    for (const s of ['Applicant', 'Addresses', 'Promoters', 'Enclosures', 'Signing', 'Clear form',
      'last 4 digits only, never the full number', 'self-declared', 'Download DPR PDF']) {
      assert.ok(html.includes(s), s);
    }
  });

  it('every box is autocomplete="off"; the account name and district are pre-filled', () => {
    const inputs = html.match(/<(input|textarea|select)\b[^>]*>/g) || [];
    const formInputs = inputs.filter((t) => /data-applicant=/.test(t));
    assert.ok(formInputs.length >= 65, `found ${formInputs.length} form inputs`);
    for (const t of formInputs) assert.ok(/autocomplete="off"/i.test(t), t);
    assert.ok(formInputs.some((t) => /data-applicant="name"/.test(t) && /value="Asha Devi"/.test(t)));
    assert.ok(formInputs.some((t) => /data-applicant="district"/.test(t) && /value="Agra"/.test(t)));
  });

  it('Hindi mode labels are bilingual', () => {
    const hi = renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'dpr', language: 'hi' }));
    assert.ok(hi.includes('आधार') && hi.includes('Aadhaar'));
  });
});

describe('1c-16/17: preview shows no form; nothing is saved in the browser', () => {
  it('the form renders only when mode is production', () => {
    const src = read('components/dashboard/LeadBankDprView.jsx');
    assert.ok(src.includes("const showForm = mode === 'production';"));
    assert.ok(/\{showForm && \(\s*<DprApplicantForm/.test(src), 'DprApplicantForm must sit under showForm');
  });

  const strip = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

  it('the new files never touch browser storage', () => {
    for (const f of ['services/applicantForm.js', 'components/dashboard/DprApplicantForm.jsx']) {
      assert.ok(exists(f), `${f} is missing`);
      assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(read(f)), f);
    }
  });

  it('the dashboard uses localStorage only for the saved scenarios', () => {
    const code = strip(read('components/ProductionDashboard.jsx'));
    const uses = code.match(/localStorage\.\w+\([^)]*/g) || [];
    assert.deepEqual(uses.sort(), ['localStorage.getItem(SCENARIOS_KEY', 'localStorage.setItem(SCENARIOS_KEY, JSON.stringify({ v: 2, list: newScenarios }'].sort());
    assert.ok(!/sessionStorage/.test(code));
    assert.ok(code.includes('applicantPayload(') && code.includes('checkApplicant('));
    assert.ok(!/applicantName:/.test(code), 'decision 14: the dashboard no longer sends applicantName');
  });
});

// --------------------------------------------------------------------------- review fixes (owner's rulings, 13 Nov 2026)

describe('1c review fixes', () => {
  const user = { name: 'Asha Devi', category: 'SC', district: 'Agra', id: 'TEST-1C' };
  const html = renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'dpr' }));
  const hiHtml = renderToString(React.createElement(ProductionDashboard, { currentUser: user, initialTab: 'dpr', language: 'hi' }));
  const tag = (h, key) => (h.match(new RegExp(`<(?:input|textarea)\\b[^>]*data-applicant="${key.replace(/\./g, '\\.')}"[^>]*>`)) || [''])[0];

  it('finding 1: the Aadhaar box takes up to 14 characters, so a full number is seen (and refused), not cut to its first 4', () => {
    assert.match(tag(html, 'aadhaarLast4'), /maxlength="14"/i);
    assert.match(tag(html, 'promoters.0.aadhaarLast4'), /maxlength="14"/i);
    need();
    for (const full of ['123456789012', '1234 5678 9012']) {
      assert.ok(F.checkApplicant({ ...F.emptyApplicant(), aadhaarLast4: full }).some((p) => p.key === 'aadhaarLast4'), full);
    }
  });

  it('findings 2-3: text boxes are never cut silently; a live count shows', () => {
    for (const key of ['name', 'district', 'siteAddress', 'promoters.0.name']) {
      assert.ok(!/maxlength=/i.test(tag(html, key)), `${key} still has a hidden cut-off`);
    }
    assert.ok(html.includes('9 / 80'), 'live count for the pre-filled name (Asha Devi = 9 of 80)');
    assert.ok(html.includes('0 / 120'));
  });

  it('finding 3: an over-long account name is pre-filled whole and shows its message at once', () => {
    const long = 'N'.repeat(90);
    const h = renderToString(React.createElement(ProductionDashboard, { currentUser: { ...user, name: long }, initialTab: 'dpr' }));
    assert.ok(h.includes(`value="${long}"`));
    assert.ok(h.includes('at most 80 characters'));
  });

  it('finding 4: form problems and server errors get different headings', () => {
    need();
    assert.equal(F.problemTitle([{ key: 'aadhaarLast4', message: 'x' }]), 'Not sent. Please fix:');
    assert.equal(F.problemTitle([{ key: 'server', message: 'x' }]), 'The server could not make the DPR:');
  });

  it('finding 5: the "Applicant:" line shows the form\'s name box', () => {
    const src = read('components/dashboard/LeadBankDprView.jsx');
    assert.ok(/applicant\?\.name/.test(src), 'the Applicant line must read the form name');
  });

  it('finding 6: Hindi mode is bilingual beyond the labels; the email label is plain on screen', () => {
    for (const s of ['साफ़ करें / Clear form', 'प्रवर्तक जोड़ें', 'हटाएँ / Remove', 'केवल अंतिम 4 अंक', 'स्व-घोषित', 'कभी सहेजा नहीं जाता']) {
      assert.ok(hiHtml.includes(s), s);
    }
    need();
    for (const p of F.checkApplicant({ ...F.emptyApplicant(), aadhaarLast4: '12', district: 'x'.repeat(121) })) {
      assert.ok(p.hi && /[ऀ-ॿ]/.test(p.hi), `no Hindi message for ${p.key}`);
    }
    assert.equal(F.FIELDS.find((x) => x.key === 'email').en, 'Email');
  });
});
