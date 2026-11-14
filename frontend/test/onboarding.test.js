/**
 * Unit & Integration Tests: Milestone 1 Guided Onboarding Intake Modal & Dashboard Hydration
 * Validates phone validation, demographic categories, bilingual rendering,
 * applicant prefill seeding, and state hydration logic.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';

import {
  OnboardingModal,
  sanitizePhone,
  validatePhone,
  CATALOG_TRADES,
  CASTE_CATEGORIES,
  MAJOR_STATES,
  COST_PRESETS,
  translateSector,
  getFilteredTrades,
  validateIncome,
  clampIncome
} from '../dist-ssr/prod/ProductionDashboard.js';

import {
  registerUser,
  updateUser,
  getCurrentSession,
  getUserByPhone,
  CATEGORY_SC,
  CATEGORY_NOT_SC,
  CATEGORY_ST,
  CATEGORY_OBC,
  CATEGORY_GENERAL,
  CATEGORY_EWS,
  CATEGORY_MINORITY,
  VALID_CATEGORIES,
  normalizeCategory,
  getOnboardingStatus,
  getOnboardingProfile,
  saveOnboardingProfile
} from '../src/data/userDatabase.js';

import { accountPrefill, emptyApplicant } from '../src/services/applicantForm.js';

describe('1. Phone Number Validation & Sanitization', () => {
  it('accepts valid 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
    assert.equal(validatePhone('9876543210'), true);
    assert.equal(validatePhone('8123456789'), true);
    assert.equal(validatePhone('7000000000'), true);
    assert.equal(validatePhone('6999999999'), true);
  });

  it('sanitizes mobile numbers with +91 country code and formatting whitespace', () => {
    assert.equal(sanitizePhone('+91 98765 43210'), '9876543210');
    assert.equal(validatePhone('+91 98765 43210'), true);
    assert.equal(sanitizePhone('+91-88888-99999'), '8888899999');
    assert.equal(validatePhone('+91-88888-99999'), true);
  });

  it('sanitizes mobile numbers with leading 0', () => {
    assert.equal(sanitizePhone('09876543210'), '9876543210');
    assert.equal(validatePhone('09876543210'), true);
  });

  it('rejects mobile numbers starting with 0-5', () => {
    assert.equal(validatePhone('5876543210'), false);
    assert.equal(validatePhone('4876543210'), false);
    assert.equal(validatePhone('1876543210'), false);
    assert.equal(validatePhone('0876543210'), false);
  });

  it('rejects numbers that are too short or too long', () => {
    assert.equal(validatePhone('987654321'), false);       // 9 digits
    assert.equal(validatePhone('98765432100'), false);     // 11 digits
    assert.equal(validatePhone(''), false);
    assert.equal(validatePhone(null), false);
    assert.equal(validatePhone(undefined), false);
  });
});

describe('2. Demographic Caste Category Constants & Normalization', () => {
  it('exports all 7 statutory categories in VALID_CATEGORIES', () => {
    assert.equal(VALID_CATEGORIES.length, 7);
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_SC));
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_NOT_SC));
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_ST));
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_OBC));
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_GENERAL));
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_EWS));
    assert.ok(VALID_CATEGORIES.includes(CATEGORY_MINORITY));
  });

  it('normalizeCategory maps code and full strings bidirectionally', () => {
    const sc = normalizeCategory('SC');
    assert.deepEqual(sc, { code: 'SC', full: CATEGORY_SC });

    const st = normalizeCategory('ST');
    assert.deepEqual(st, { code: 'ST', full: CATEGORY_ST });

    const obc = normalizeCategory(CATEGORY_OBC);
    assert.deepEqual(obc, { code: 'OBC', full: CATEGORY_OBC });

    const gen = normalizeCategory('General');
    assert.deepEqual(gen, { code: 'General', full: CATEGORY_GENERAL });

    const ews = normalizeCategory('EWS');
    assert.deepEqual(ews, { code: 'EWS', full: CATEGORY_EWS });

    const min = normalizeCategory('Minority');
    assert.deepEqual(min, { code: 'Minority', full: CATEGORY_MINORITY });

    assert.equal(normalizeCategory(null), null);
    assert.equal(normalizeCategory('Unknown'), null);
  });
});

describe('3. Extended userDatabase.js Registration & Updates', () => {
  let counter = 100;

  it('registerUser registers ST, OBC, EWS, Minority beneficiaries with demographic fields', () => {
    counter += 1;
    const phone = `97777000${counter}`;
    const res = registerUser({
      name: 'Rameshwar Kol',
      phone,
      pin: '5555',
      casteCategory: 'ST',
      state: 'Madhya Pradesh',
      district: 'Mandla',
      annualIncome: 140000,
      isWoman: false,
      isArtisan: true,
      isDivyang: false,
      trade: 'D20 Metal Smithy'
    });

    assert.equal(res.success, true);
    assert.equal(res.user.name, 'Rameshwar Kol');
    assert.equal(res.user.casteCategory, 'ST');
    assert.equal(res.user.category, CATEGORY_ST);
    assert.equal(res.user.state, 'Madhya Pradesh');
    assert.equal(res.user.district, 'Mandla');
    assert.equal(res.user.annualIncome, 140000);
    assert.equal(res.user.income, 140000);
    assert.equal(res.user.isArtisan, true);
    assert.equal(res.user.isWoman, false);
  });

  it('updateUser updates state, trade, annualIncome, isWoman, isArtisan, isDivyang', () => {
    counter += 1;
    const phone = `97777000${counter}`;
    const reg = registerUser({
      name: 'Pooja Vishwakarma',
      phone,
      pin: '3333',
      casteCategory: 'OBC'
    });
    assert.equal(reg.success, true);
    const id = reg.user.id;

    const upRes = updateUser(id, {
      name: 'Pooja Devi',
      state: 'Uttar Pradesh',
      district: 'Gorakhpur',
      trade: 'D18 Tailoring',
      annualIncome: 210000,
      isWoman: true,
      isArtisan: true,
      isDivyang: false
    });

    assert.equal(upRes.success, true);
    assert.equal(upRes.user.name, 'Pooja Devi');
    assert.equal(upRes.user.state, 'Uttar Pradesh');
    assert.equal(upRes.user.district, 'Gorakhpur');
    assert.equal(upRes.user.trade, 'D18 Tailoring');
    assert.equal(upRes.user.annualIncome, 210000);
    assert.equal(upRes.user.income, 210000);
    assert.equal(upRes.user.isWoman, true);
    assert.equal(upRes.user.isArtisan, true);
    assert.equal(upRes.user.isDivyang, false);
  });

  it('updateUser with casteCategory updates both casteCategory and category', () => {
    counter += 1;
    const phone = `97777000${counter}`;
    const reg = registerUser({ name: 'Farooq', phone, pin: '4444', casteCategory: 'General' });
    const id = reg.user.id;

    const upRes = updateUser(id, { casteCategory: 'Minority' });
    assert.equal(upRes.success, true);
    assert.equal(upRes.user.casteCategory, 'Minority');
    assert.equal(upRes.user.category, CATEGORY_MINORITY);
  });
});

describe('4. Extended applicantForm.js accountPrefill Seeding', () => {
  it('seeds name, district, state, category, isWoman, isMinority into applicant prefill', () => {
    const user = {
      name: 'Sunita Sharma',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      casteCategory: 'OBC',
      isWoman: true,
      isArtisan: true
    };

    const prefill = accountPrefill(user);
    assert.equal(prefill.name, 'Sunita Sharma');
    assert.equal(prefill.district, 'Varanasi');
    assert.equal(prefill.state, 'Uttar Pradesh');
    assert.equal(prefill.category, 'OBC');
    assert.equal(prefill.isWoman, 'yes');
    assert.equal(prefill.isArtisan, true);

    const applicant = emptyApplicant(prefill);
    assert.equal(applicant.name, 'Sunita Sharma');
    assert.equal(applicant.district, 'Varanasi');
    assert.equal(applicant.state, 'Uttar Pradesh');
    assert.equal(applicant.isWoman, 'yes');
  });

  it('seeds Minority category to isMinority: "yes"', () => {
    const user = {
      name: 'Zahida Begum',
      district: 'Moradabad',
      casteCategory: 'Minority',
      isWoman: true
    };
    const prefill = accountPrefill(user);
    assert.equal(prefill.isMinority, 'yes');
    assert.equal(prefill.isWoman, 'yes');
  });
});

describe('5. OnboardingModal 24 Trade Catalog & Structure', () => {
  it('contains all 24 pre-researched catalog trades D01 to D24', () => {
    assert.equal(CATALOG_TRADES.length, 24);
    for (let i = 1; i <= 24; i++) {
      const code = `D${String(i).padStart(2, '0')}`;
      const trade = CATALOG_TRADES.find((t) => t.code === code);
      assert.ok(trade, `Trade ${code} missing in catalog`);
      assert.ok(trade.nameEn && trade.nameHi, `${code} missing bilingual names`);
      assert.ok(trade.sectorEn && trade.sectorHi, `${code} missing sector`);
      assert.ok(trade.tier, `${code} missing tier string`);
    }
  });

  it('contains 6 comprehensive socio-demographic caste categories', () => {
    assert.equal(CASTE_CATEGORIES.length, 6);
    const codes = CASTE_CATEGORIES.map((c) => c.code);
    assert.deepEqual(codes, ['SC', 'ST', 'OBC', 'General', 'EWS', 'Minority']);
  });

  it('contains major state list and realistic cost presets', () => {
    assert.ok(MAJOR_STATES.includes('Uttar Pradesh'));
    assert.ok(MAJOR_STATES.includes('Bihar'));
    assert.ok(MAJOR_STATES.includes('Madhya Pradesh'));
    assert.equal(COST_PRESETS.length, 6);
    assert.equal(COST_PRESETS[0].value, 100000);
    assert.equal(COST_PRESETS[1].value, 140000);
  });
});

describe('6. OnboardingModal Bilingual SSR Rendering', () => {
  it('renders null when isOpen is false', () => {
    const html = renderToString(React.createElement(OnboardingModal, { isOpen: false }));
    assert.equal(html, '');
  });

  it('renders Hindi UI by default with step labels and intake title', () => {
    const html = renderToString(React.createElement(OnboardingModal, {
      isOpen: true,
      initialLanguage: 'hi'
    }));
    assert.ok(html.includes('अपनी प्रोफ़ाइल बनाएँ'));
    assert.ok(html.includes('1. पहचान'));
    assert.ok(html.includes('आवेदक का पूरा नाम'));
    assert.ok(html.includes('10 अंकों का मोबाइल नंबर'));
  });

  it('renders English UI when initialLanguage is "en"', () => {
    const html = renderToString(React.createElement(OnboardingModal, {
      isOpen: true,
      initialLanguage: 'en'
    }));
    assert.ok(html.includes('Set up your profile'));
    assert.ok(html.includes('1. Identity'));
    assert.ok(html.includes('Full Legal Name'));
    assert.ok(html.includes('10-Digit Mobile Number'));
  });
});

describe('7. Profile Persistence & Dashboard Hydration Handshake', () => {
  it('saveOnboardingProfile and getOnboardingProfile persist and restore full intake profile', () => {
    const mockProfile = {
      name: 'Shyam Sundar',
      phone: '9888877777',
      preferredLanguage: 'hi',
      casteCategory: 'OBC',
      isWoman: false,
      isArtisan: true,
      isDivyang: false,
      annualIncome: 240000,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      locationType: 'rural',
      isRural: true,
      projectCost: 450000,
      promoterEquity: 45000,
      hasMoneylenderDebt: true,
      debtPrincipal: 60000,
      debtRateQuote: '3 senkda',
      debtMonthsActive: 10,
      tradeCode: 'D08',
      tradeName: 'Oil Expellers',
      customTradeIdea: '',
      isCustomTrade: false
    };

    saveOnboardingProfile(mockProfile);
    assert.equal(getOnboardingStatus(), 'true');
    const loaded = getOnboardingProfile();
    assert.ok(loaded);
    assert.equal(loaded.name, 'Shyam Sundar');
    assert.equal(loaded.tradeCode, 'D08');
    assert.equal(loaded.projectCost, 450000);
    assert.equal(loaded.casteCategory, 'OBC');
    assert.equal(loaded.district, 'Varanasi');
    assert.equal(loaded.hasMoneylenderDebt, true);
  });
});

describe('8. Sector Filter Language Synchronization & Catalog Blankout Immunity', () => {
  it('translateSector maps sectors bidirectionally between Hindi and English', () => {
    assert.equal(translateSector('खुदरा व व्यापार', 'en'), 'Retail & Trading');
    assert.equal(translateSector('Retail & Trading', 'hi'), 'खुदरा व व्यापार');

    assert.equal(translateSector('कृषि प्रसंस्करण', 'en'), 'Agro-Processing');
    assert.equal(translateSector('Agro-Processing', 'hi'), 'कृषि प्रसंस्करण');

    assert.equal(translateSector('पशुपालन व पोल्ट्री', 'en'), 'Livestock & Poultry');
    assert.equal(translateSector('Livestock & Poultry', 'hi'), 'पशुपालन व पोल्ट्री');

    assert.equal(translateSector('मशीनरी व सेवाएं', 'en'), 'Machinery & Services');
    assert.equal(translateSector('Machinery & Services', 'hi'), 'मशीनरी व सेवाएं');

    assert.equal(translateSector('शिल्प व कारीगरी', 'en'), 'Crafts & Fabrication');
    assert.equal(translateSector('Crafts & Fabrication', 'hi'), 'शिल्प व कारीगरी');

    assert.equal(translateSector('हरित व चक्रीय', 'en'), 'Green & Circular');
    assert.equal(translateSector('Green & Circular', 'hi'), 'हरित व चक्रीय');
  });

  it('translateSector safely handles "All", empty strings, and unknown inputs', () => {
    assert.equal(translateSector('All', 'en'), 'All');
    assert.equal(translateSector('All', 'hi'), 'All');
    assert.equal(translateSector('', 'en'), 'All');
    assert.equal(translateSector(null, 'hi'), 'All');
    assert.equal(translateSector(undefined, 'en'), 'All');
    assert.equal(translateSector('NonExistentSector', 'hi'), 'All');
  });

  it('getFilteredTrades never blanks out when switching language with an active sector filter', () => {
    // 1. In Hindi, filter by "खुदरा व व्यापार" -> 5 trades
    const hindiMatches = getFilteredTrades(CATALOG_TRADES, 'खुदरा व व्यापार', 'hi');
    assert.equal(hindiMatches.length, 5);
    hindiMatches.forEach((t) => assert.equal(t.sectorHi, 'खुदरा व व्यापार'));

    // 2. Language toggles to English with filter still "खुदरा व व्यापार" -> MUST NOT BLANK OUT TO 0
    const toggleToEnglishMatches = getFilteredTrades(CATALOG_TRADES, 'खुदरा व व्यापार', 'en');
    assert.equal(toggleToEnglishMatches.length, 5);
    toggleToEnglishMatches.forEach((t) => assert.equal(t.sectorEn, 'Retail & Trading'));

    // 3. Translated filter in English matches exactly the same trades
    const translatedFilter = translateSector('खुदरा व व्यापार', 'en');
    assert.equal(translatedFilter, 'Retail & Trading');
    const englishMatches = getFilteredTrades(CATALOG_TRADES, translatedFilter, 'en');
    assert.equal(englishMatches.length, 5);

    // 4. In English, filter by "Agro-Processing" -> 5 trades
    const agroEnglishMatches = getFilteredTrades(CATALOG_TRADES, 'Agro-Processing', 'en');
    assert.equal(agroEnglishMatches.length, 5);

    // 5. Language toggles to Hindi with filter still "Agro-Processing" -> MUST NOT BLANK OUT TO 0
    const toggleToHindiMatches = getFilteredTrades(CATALOG_TRADES, 'Agro-Processing', 'hi');
    assert.equal(toggleToHindiMatches.length, 5);
    toggleToHindiMatches.forEach((t) => assert.equal(t.sectorHi, 'कृषि प्रसंस्करण'));
  });

  it('getFilteredTrades returns full catalog for "All" or unknown filter values', () => {
    assert.equal(getFilteredTrades(CATALOG_TRADES, 'All', 'hi').length, 24);
    assert.equal(getFilteredTrades(CATALOG_TRADES, 'All', 'en').length, 24);
    assert.equal(getFilteredTrades(CATALOG_TRADES, 'UnknownFilter', 'en').length, 24);
    assert.equal(getFilteredTrades(CATALOG_TRADES, '', 'hi').length, 24);
    assert.equal(getFilteredTrades(CATALOG_TRADES, null, 'en').length, 24);
  });
});

describe('9. Annual Income Non-Negative Validation & Clamping', () => {
  it('validateIncome strictly rejects negative income values', () => {
    assert.equal(validateIncome(-1), false);
    assert.equal(validateIncome(-50000), false);
    assert.equal(validateIncome('-50000'), false);
    assert.equal(validateIncome('-0.5'), false);
    assert.equal(validateIncome(-Infinity), false);
    assert.equal(validateIncome('invalid_text'), false);
    assert.equal(validateIncome(NaN), false);
  });

  it('validateIncome accepts 0, positive integers, and empty/unfilled values', () => {
    assert.equal(validateIncome(0), true);
    assert.equal(validateIncome('0'), true);
    assert.equal(validateIncome(180000), true);
    assert.equal(validateIncome('250000'), true);
    assert.equal(validateIncome(5000000), true);
    assert.equal(validateIncome(''), true);
    assert.equal(validateIncome(null), true);
    assert.equal(validateIncome(undefined), true);
  });

  it('clampIncome guarantees a non-negative number >= 0', () => {
    assert.equal(clampIncome(-50000), 0);
    assert.equal(clampIncome('-1000'), 0);
    assert.equal(clampIncome('invalid'), 0);
    assert.equal(clampIncome(null), 0);
    assert.equal(clampIncome(undefined), 0);
    assert.equal(clampIncome(NaN), 0);
    assert.equal(clampIncome(-0), 0);
    assert.equal(clampIncome(0), 0);
    assert.equal(clampIncome('0'), 0);
    assert.equal(clampIncome(180000), 180000);
    assert.equal(clampIncome('240000'), 240000);
  });

  it('clamped income persists cleanly to updateUser without throwing rejection error', () => {
    const reg = registerUser({
      name: 'Adversarial Income Test',
      phone: '9666600099',
      pin: '7777',
      casteCategory: 'General'
    });
    assert.equal(reg.success, true);
    const id = reg.user.id;

    // Simulate negative income input clamped by OnboardingModal before updateUser
    const negativeInput = -50000;
    const clamped = clampIncome(negativeInput);
    assert.equal(clamped, 0);

    const updateRes = updateUser(id, {
      annualIncome: clamped,
      income: clamped
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.user.annualIncome, 0);
    assert.equal(updateRes.user.income, 0);
  });
});
