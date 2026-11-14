/**
 * Privacy Policy, consent and the restyled onboarding form (14 Nov 2026).
 * - onboarding answers are kept per account, so one person's caste/income never pre-fills another's;
 * - the policy names the Indian laws it follows and the rights, duties and limits it states;
 * - the onboarding form has no emoji or "AI" badges, pre-selects no caste, and asks for consent.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { OnboardingModal, MAJOR_STATES } from '../dist-ssr/prod/ProductionDashboard.js';
import {
  getOnboardingStatus,
  getOnboardingProfile,
  saveOnboardingProfile,
  registerUser,
  updateUser,
  consentRecord
} from '../src/data/userDatabase.js';
import {
  POLICY_VERSION,
  POLICY_SECTIONS_EN,
  POLICY_SUMMARY_HI,
  CONTACT
} from '../src/content/privacyPolicy.js';

const policyText = POLICY_SECTIONS_EN
  .flatMap((s) => [s.title, ...s.blocks.flatMap((b) => (b.list ? b.list : [b.p]))])
  .join('\n');

describe('onboarding answers are kept per account', () => {
  it('one account\'s profile is not visible to another account', () => {
    saveOnboardingProfile({ name: 'Asha', casteCategory: 'SC', annualIncome: 90000 }, 'REG-111111');
    assert.equal(getOnboardingStatus('REG-111111'), 'true');
    assert.equal(getOnboardingProfile('REG-111111').name, 'Asha');
    assert.equal(getOnboardingStatus('REG-222222'), null);
    assert.equal(getOnboardingProfile('REG-222222'), null);
  });

  it('a guest (no id) keeps the old single key', () => {
    saveOnboardingProfile({ name: 'Guest' });
    assert.equal(getOnboardingStatus(), 'true');
    assert.equal(getOnboardingProfile().name, 'Guest');
  });
});

describe('consent is recorded with the policy version', () => {
  it('registerUser stores the consent record', () => {
    const r = registerUser({ name: 'Consent Test', phone: '9555500011', pin: '1234', category: 'Not SC',
      privacyConsent: consentRecord(POLICY_VERSION) });
    assert.equal(r.success, true);
    assert.equal(r.user.privacyConsent.version, POLICY_VERSION);
    assert.ok(!Number.isNaN(Date.parse(r.user.privacyConsent.acceptedAt)));
  });

  it('updateUser stores the sensitive-data consent and accepts "prefer not to say" (null) for category', () => {
    const r = registerUser({ name: 'Consent Two', phone: '9555500012', pin: '1234', category: 'Not SC' });
    const u = updateUser(r.user.id, { casteCategory: null, sensitiveDataConsent: consentRecord(POLICY_VERSION) });
    assert.equal(u.success, true);
    assert.equal(u.user.casteCategory, null);
    assert.equal(u.user.sensitiveDataConsent.version, POLICY_VERSION);
  });
});

describe('the Privacy Policy text', () => {
  it('names the Indian laws it follows', () => {
    for (const law of [
      'Digital Personal Data Protection Act, 2023',
      'Digital Personal Data Protection Rules, 2025',
      'Information Technology Act, 2000',
      'Sensitive Personal Data or Information) Rules, 2011',
      'Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021',
      'CERT-In',
      'Aadhaar',
      'Consumer Protection Act, 2019',
      'Prevention of Atrocities) Act, 1989',
      'Rights of Persons with Disabilities Act, 2016'
    ]) assert.ok(policyText.includes(law), `policy should name: ${law}`);
  });

  it('states the DPDP rights, duties, children, breach and grievance sections', () => {
    for (const s of ['Section 6', 'Section 7', 'Section 9', 'Sections 11 to 14', 'Section 15', 'Section 16',
      'Section 8(5)', 'Section 13(3)', 'Data Protection Board of India', '₹10,000']) {
      assert.ok(policyText.includes(s), `policy should mention ${s}`);
    }
  });

  it('limits liability only as far as the law allows, and says statutory rights are not limited', () => {
    assert.ok(policyText.includes('To the maximum extent permitted by applicable law'));
    assert.ok(policyText.includes('Nothing in this policy excludes or limits any right you have'));
    assert.ok(policyText.includes('not a loan sanction'));
    assert.ok(policyText.includes('indemnify'));
  });

  it('matches what the code does: no full Aadhaar, browser-only accounts, Groq for chat', () => {
    assert.ok(policyText.includes('never the full number'));
    assert.ok(policyText.includes('localStorage'));
    assert.ok(policyText.includes('Groq'));
  });

  it('has a Hindi summary and contact fields', () => {
    assert.ok(POLICY_SUMMARY_HI.length >= 10);
    assert.ok(CONTACT.grievanceOfficer && CONTACT.email && CONTACT.jurisdictionCity);
  });
});

describe('the onboarding form', () => {
  const html = (lang, step = 1) => renderToString(React.createElement(OnboardingModal, { isOpen: true, initialLanguage: lang }));

  it('has no emoji, check-mark glyphs or AI badges', () => {
    for (const lang of ['en', 'hi']) {
      const h = html(lang);
      assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(h), `no emoji (${lang})`);
      for (const bad of ['✓', '✨', 'WE<', 'PMV<', 'PwD<', 'RUR<', 'URB<', 'DEBT<', 'synthesizer', 'एआई']) {
        assert.ok(!h.includes(bad), `should not include ${bad} (${lang})`);
      }
    }
  });

  it('uses the landing page typography', () => {
    const h = html('en');
    assert.ok(h.includes('font-editorial'));
    assert.ok(h.includes('font-mono-num'));
    assert.ok(h.includes('Step 1 of 4'));
  });

  it('lists all 28 states and 8 Union Territories', () => {
    assert.equal(MAJOR_STATES.length, 36);
    for (const s of ['Delhi', 'Goa', 'Tripura', 'Jammu and Kashmir', 'Puducherry']) assert.ok(MAJOR_STATES.includes(s));
  });
});
