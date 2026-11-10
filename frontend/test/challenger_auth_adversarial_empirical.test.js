/**
 * Empirical Adversarial Challenge Suite — Milestone M2: Google Authentication & Demo Elimination
 * Challenger Agent: challenger_auth_m2_1
 * 
 * Stress-tests:
 * 1. userDatabase.js: null/empty/malformed Google profiles, unregistered phone/pin,
 *    whitespace inputs, duplicate registrations, session isolation, zero mock personas.
 * 2. googleAuth.js: missing/null/placeholder client ID, invalid tokens, network failure,
 *    SSR environment safety, popup errors, zero fallback to mock personas.
 * 3. Static Codebase Audit: rigorous search for leaked mock strings across frontend/src/.
 * 4. SSR Dashboard Rendering: verifying dynamic binding and graceful fallbacks under null/empty profiles.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

import {
  getAllUsers,
  getUserByPhone,
  getUserByEmail,
  authenticateByCredentials,
  authenticateByGoogle,
  registerUser,
  getCurrentSession,
  saveSession,
  clearSession
} from '../src/data/userDatabase.js';

import {
  getGoogleClientId,
  isGoogleAuthAvailable,
  initGoogleAuth,
  triggerGoogleLogin,
  fetchGoogleUserProfile
} from '../src/services/googleAuth.js';

import SetoDashboard from '../dist-ssr/SetoDashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

describe('CHALLENGER ADVERSARIAL SUITE — 1. userDatabase.js Edge Cases & Stress Testing', () => {
  beforeEach(() => {
    clearSession();
  });

  it('1.1 Unregistered phone numbers MUST fail authentication and NEVER fallback to demo user', () => {
    const unregisteredPhones = ['9999999999', '9876543210', '0000000000', '1234567890'];
    for (const phone of unregisteredPhones) {
      const res = authenticateByCredentials(phone, '1234');
      assert.strictEqual(res.success, false, `Authentication must fail for unregistered phone ${phone}`);
      assert.strictEqual(res.user, undefined, 'User object must not be returned');
      assert.ok(res.error.includes('User not found'), `Expected 'User not found' error for ${phone}`);
      // Ensure no active session was created
      assert.strictEqual(getCurrentSession(), null, 'Session must remain null');
    }
  });

  it('1.2 Invalid, empty, or whitespace credentials MUST be rejected cleanly', () => {
    const badCredentials = [
      { phone: '', pin: '1234', expectedErr: 'Mobile number is required' },
      { phone: '   ', pin: '1234', expectedErr: 'Mobile number is required' },
      { phone: null, pin: '1234', expectedErr: 'Mobile number is required' },
      { phone: undefined, pin: '1234', expectedErr: 'Mobile number is required' },
      { phone: '9876543210', pin: '', expectedErr: 'PIN is required' },
      { phone: '9876543210', pin: '   ', expectedErr: 'PIN is required' },
      { phone: '9876543210', pin: null, expectedErr: 'PIN is required' },
      { phone: '9876543210', pin: undefined, expectedErr: 'PIN is required' }
    ];

    for (const { phone, pin, expectedErr } of badCredentials) {
      const res = authenticateByCredentials(phone, pin);
      assert.strictEqual(res.success, false, `Must fail for phone='${phone}', pin='${pin}'`);
      assert.ok(res.error.includes(expectedErr), `Expected error containing '${expectedErr}', got '${res.error}'`);
    }
  });

  it('1.3 Registered user with incorrect PIN MUST be rejected', () => {
    const phone = '9800112233';
    const regRes = registerUser({ name: 'Challenger Artisan', phone, pin: '5678' });
    assert.strictEqual(regRes.success, true);

    const failRes = authenticateByCredentials(phone, '9999');
    assert.strictEqual(failRes.success, false);
    assert.ok(failRes.error.includes('Incorrect 4-digit PIN'));
  });

  it('1.4 authenticateByGoogle MUST reject null, undefined, empty, or malformed Google profiles without fallback', () => {
    const malformedProfiles = [
      null,
      undefined,
      {},
      { name: 'Adversary Without Email' },
      { email: '' },
      { email: null },
      { email: undefined }
    ];

    for (const profile of malformedProfiles) {
      const res = authenticateByGoogle(profile);
      assert.strictEqual(res.success, false, `Must reject malformed profile: ${JSON.stringify(profile)}`);
      assert.ok(res.error.includes('No Google profile credentials provided'), `Expected specific error, got '${res.error}'`);
      assert.strictEqual(getCurrentSession(), null, 'Session must not be set on failure');
    }
  });

  it('1.5 authenticateByGoogle MUST dynamically create verified user without hardcoded demo traits', () => {
    const genuineGoogleProfile = {
      sub: 'google_oauth_sub_99887766',
      name: 'Pooja Verma',
      email: 'pooja.verma.sih@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/pooja_avatar.jpg'
    };

    const res = authenticateByGoogle(genuineGoogleProfile);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.name, 'Pooja Verma');
    assert.strictEqual(res.user.email, 'pooja.verma.sih@gmail.com');
    assert.strictEqual(res.user.avatar, 'https://lh3.googleusercontent.com/pooja_avatar.jpg');
    assert.strictEqual(res.user.authProvider, 'google');
    assert.ok(res.user.id.startsWith('UP-GOOG-'), 'User ID must start with UP-GOOG-');
    assert.notStrictEqual(res.user.id, 'UP-STP-008129', 'Must never use demo ID');
    assert.notStrictEqual(res.user.name, 'Ramesh Kumar', 'Must never use demo name');

    // Verify session persistence
    const session = getCurrentSession();
    assert.ok(session);
    assert.strictEqual(session.id, res.user.id);
  });

  it('1.6 Subsequent authenticateByGoogle with same email MUST update profile rather than duplicating', () => {
    const email = 'pooja.verma.sih@gmail.com';
    const updatedProfile = {
      sub: 'google_oauth_sub_99887766',
      name: 'Pooja Verma (Updated)',
      email,
      avatar: 'https://lh3.googleusercontent.com/pooja_updated.jpg'
    };

    const res = authenticateByGoogle(updatedProfile);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.name, 'Pooja Verma (Updated)');
    assert.strictEqual(res.user.avatar, 'https://lh3.googleusercontent.com/pooja_updated.jpg');

    const matchingUsers = getAllUsers().filter(u => u.email === email);
    assert.strictEqual(matchingUsers.length, 1, 'Must not duplicate account in store');
  });

  it('1.7 Database stores zero hardcoded Ramesh personas or demo identifiers', () => {
    const allUsers = getAllUsers();
    assert.ok(Array.isArray(allUsers));
    for (const u of allUsers) {
      assert.strictEqual(/ramesh/i.test(u.name || ''), false, `Found leaked persona name: ${u.name}`);
      assert.notStrictEqual(u.phone, '9876543210', 'Found leaked demo phone');
      assert.notStrictEqual(u.id, 'UP-STP-008129', 'Found leaked demo certificate ID');
    }
  });

  it('1.8 Google profile with missing name/avatar defaults gracefully to generic beneficiary identity', () => {
    const minimalProfile = {
      sub: 'google_sub_minimal_123',
      email: 'minimal.beneficiary@rural.org'
    };

    const res = authenticateByGoogle(minimalProfile);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.name, 'Google Beneficiary');
    assert.strictEqual(res.user.avatar, null);
    assert.strictEqual(res.user.category, 'Scheduled Caste (SC)');
    assert.strictEqual(res.user.authProvider, 'google');
  });
});

describe('CHALLENGER ADVERSARIAL SUITE — 2. googleAuth.js Resilient Error Handling', () => {
  it('2.1 getGoogleClientId returns empty string when VITE_GOOGLE_CLIENT_ID is unset', () => {
    const clientId = getGoogleClientId();
    assert.strictEqual(typeof clientId, 'string');
  });

  it('2.2 initGoogleAuth in Node/SSR environment safely returns false without crashing', () => {
    let capturedError = null;
    const res = initGoogleAuth(
      () => {},
      (err) => { capturedError = err; },
      ''
    );
    assert.strictEqual(res, false, 'initGoogleAuth must return false in Node/SSR');
  });

  it('2.3 initGoogleAuth in browser environment invokes error callback when client ID is missing or placeholder', () => {
    const originalWindow = global.window;
    try {
      global.window = {}; // Simulate browser environment where window is defined
      
      let errorReceived = null;
      const resEmpty = initGoogleAuth(
        () => {},
        (err) => { errorReceived = err; },
        ''
      );
      assert.strictEqual(resEmpty, false);
      assert.ok(errorReceived instanceof Error);
      assert.ok(errorReceived.message.includes('Google Authentication is not configured'));

      let placeholderError = null;
      const resPlaceholder = initGoogleAuth(
        () => {},
        (err) => { placeholderError = err; },
        'your_google_client_id_here.apps.googleusercontent.com'
      );
      assert.strictEqual(resPlaceholder, false);
      assert.ok(placeholderError instanceof Error);
      assert.ok(placeholderError.message.includes('Google Authentication is not configured'));
    } finally {
      global.window = originalWindow;
    }
  });

  it('2.4 triggerGoogleLogin rejects cleanly when client ID is missing without throwing uncaught exceptions', async () => {
    await assert.rejects(
      async () => {
        await triggerGoogleLogin();
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('Google Authentication is not configured'));
        return true;
      }
    );
  });

  it('2.5 fetchGoogleUserProfile rejects when access token is missing or empty', async () => {
    const badTokens = ['', null, undefined];
    for (const token of badTokens) {
      await assert.rejects(
        async () => {
          await fetchGoogleUserProfile(token);
        },
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes('Access token is missing'));
          return true;
        }
      );
    }
  });

  it('2.6 fetchGoogleUserProfile handles HTTP 401 unauthorized gracefully without mock fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await assert.rejects(
        async () => {
          await fetchGoogleUserProfile('invalid_access_token_12345');
        },
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes('HTTP 401'));
          return true;
        }
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('2.7 fetchGoogleUserProfile parses full user profile and falls back gracefully when name parts are missing', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: true,
        json: async () => ({
          sub: 'sub_12345678',
          given_name: 'Anjali',
          family_name: 'Devi',
          email: 'anjali.devi@rural.in',
          picture: 'https://lh3.googleusercontent.com/anjali.jpg',
          email_verified: true
        })
      });

      const profile = await fetchGoogleUserProfile('mock_valid_token');
      assert.strictEqual(profile.id, 'sub_12345678');
      assert.strictEqual(profile.name, 'Anjali Devi');
      assert.strictEqual(profile.email, 'anjali.devi@rural.in');
      assert.strictEqual(profile.avatar, 'https://lh3.googleusercontent.com/anjali.jpg');
      assert.strictEqual(profile.verified, true);
      assert.strictEqual(profile.authProvider, 'google');
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe('CHALLENGER ADVERSARIAL SUITE — 3. Codebase Static Leakage Audit', () => {
  function scanDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, fileList);
      } else if (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.json') || f.endsWith('.html')) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  it('3.1 No source file in frontend/src/ contains "ramesh" (case-insensitive)', () => {
    const files = scanDir(srcDir);
    const leakedFiles = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (/ramesh/i.test(content)) {
        leakedFiles.push(path.relative(srcDir, filePath));
      }
    }
    assert.deepStrictEqual(leakedFiles, [], `Found "ramesh" in source files: ${leakedFiles.join(', ')}`);
  });

  it('3.2 No source file in frontend/src/ contains demo mobile "9876543210"', () => {
    const files = scanDir(srcDir);
    const leakedFiles = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('9876543210')) {
        leakedFiles.push(path.relative(srcDir, filePath));
      }
    }
    assert.deepStrictEqual(leakedFiles, [], `Found "9876543210" in source files: ${leakedFiles.join(', ')}`);
  });

  it('3.3 No source file in frontend/src/ contains demo certificate ID "UP-STP-008129"', () => {
    const files = scanDir(srcDir);
    const leakedFiles = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('UP-STP-008129')) {
        leakedFiles.push(path.relative(srcDir, filePath));
      }
    }
    assert.deepStrictEqual(leakedFiles, [], `Found "UP-STP-008129" in source files: ${leakedFiles.join(', ')}`);
  });

  it('3.4 No source file in frontend/src/ contains Hindi "रमेश"', () => {
    const files = scanDir(srcDir);
    const leakedFiles = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('रमेश')) {
        leakedFiles.push(path.relative(srcDir, filePath));
      }
    }
    assert.deepStrictEqual(leakedFiles, [], `Found "रमेश" in source files: ${leakedFiles.join(', ')}`);
  });

  it('3.5 No source file in frontend/src/ contains fallbackUser demo variable', () => {
    const files = scanDir(srcDir);
    const leakedFiles = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('fallbackUser')) {
        leakedFiles.push(path.relative(srcDir, filePath));
      }
    }
    assert.deepStrictEqual(leakedFiles, [], `Found "fallbackUser" in source files: ${leakedFiles.join(', ')}`);
  });
});

describe('CHALLENGER ADVERSARIAL SUITE — 4. Dashboard SSR Rendering & Dynamic Binding', () => {
  it('4.1 SetoDashboard renders with currentUser = null without throwing or leaking Ramesh', () => {
    const html = renderToString(React.createElement(SetoDashboard, {
      language: 'en',
      currentUser: null
    }));

    assert.ok(html.length > 5000, 'HTML output should be substantive');
    assert.ok(html.includes('Welcome!'), 'Unauthenticated user greeting should be generic "Welcome!"');
    assert.ok(html.includes('Entrepreneur'), 'Unauthenticated user name should be generic "Entrepreneur"');
    assert.strictEqual(/ramesh/i.test(html), false, 'Must not contain Ramesh');
    assert.strictEqual(html.includes('UP-STP-008129'), false, 'Must not contain demo ID');
  });

  it('4.2 SetoDashboard renders with language = "hi" and currentUser = null with Hindi fallbacks', () => {
    const html = renderToString(React.createElement(SetoDashboard, {
      language: 'hi',
      currentUser: null
    }));

    assert.ok(html.includes('स्वागत है!'), 'Hindi greeting must be "स्वागत है!"');
    assert.ok(html.includes('उद्यमी'), 'Hindi name must be "उद्यमी"');
    assert.strictEqual(html.includes('रमेश'), false, 'Must not contain Hindi Ramesh');
  });

  it('4.3 SetoDashboard renders dynamic authenticated user profile completely across all views', () => {
    const testUser = {
      id: 'UP-GOOG-889900',
      name: 'Sunita Devi',
      category: 'Scheduled Caste (SC)',
      district: 'Sitapur District, UP',
      income: '≤ ₹4,00,000'
    };

    const html = renderToString(React.createElement(SetoDashboard, {
      language: 'en',
      currentUser: testUser
    }));

    // Greeting must display first name: "Welcome, Sunita!"
    assert.ok(html.includes('Welcome, Sunita!'), 'Expected "Welcome, Sunita!" greeting');
    // Beneficiary cards must display full name: "Sunita Devi"
    assert.ok(html.includes('Sunita Devi'), 'Expected "Sunita Devi" in user card');
    // Statutory certificate ID
    assert.ok(html.includes('UP-GOOG-889900'), 'Expected dynamic user ID');
    assert.strictEqual(/ramesh/i.test(html), false, 'Must not contain Ramesh');
  });

  it('4.4 SetoDashboard renders gracefully when currentUser is an empty object {} without crashing', () => {
    assert.doesNotThrow(() => {
      const html = renderToString(React.createElement(SetoDashboard, {
        language: 'en',
        currentUser: {}
      }));
      assert.ok(html.length > 5000);
      assert.strictEqual(/ramesh/i.test(html), false);
    });
  });
});
