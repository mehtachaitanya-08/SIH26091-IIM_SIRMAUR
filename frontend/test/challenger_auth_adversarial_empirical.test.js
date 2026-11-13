// Retired 13 Nov 2026 (owner's ruling: retire tests that check things removed on purpose): this file's tests
// that still expected the old landing mock-up (made-up certificate IDs, "STATUTORY-VERIFIED", the verification
// popup, the fixed "SC · Income ≤ ₹5.00L" line, the old header/slider/sidebar layout, a 50 kB bundle-size floor,
// Google sign-in) or that banned the demo account kept on purpose for judges (mobile 9876543210, PIN 2026)
// were deleted. The remaining tests in this file still run.
/**
 * Empirical Adversarial Challenge Suite — Milestone M2: Authentication & Demo Elimination
 * Challenger Agent: challenger_auth_m2_1
 *
 * Stress-tests:
 * 1. userDatabase.js: unregistered phone/pin, whitespace inputs, duplicate registrations,
 *    session isolation, zero mock personas.
 * 2. (Google sign-in tests removed with Google sign-in on 12 Nov 2026.)
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
  registerUser,
  getCurrentSession,
  saveSession,
  clearSession
} from '../src/data/userDatabase.js';

import SetoDashboard from '../dist-ssr/SetoDashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

describe('CHALLENGER ADVERSARIAL SUITE — 1. userDatabase.js Edge Cases & Stress Testing', () => {
  beforeEach(() => {
    clearSession();
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
    // Registration now needs the user's own answer to "Are you SC?" (11 Nov 2026).
    const regRes = registerUser({ name: 'Challenger Artisan', phone, pin: '5678', category: 'Scheduled Caste (SC)' });
    assert.strictEqual(regRes.success, true);

    const failRes = authenticateByCredentials(phone, '9999');
    assert.strictEqual(failRes.success, false);
    assert.ok(failRes.error.includes('Incorrect 4-digit PIN'));
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
