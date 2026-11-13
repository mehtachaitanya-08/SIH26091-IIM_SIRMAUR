// Retired 13 Nov 2026 (owner's ruling: retire tests that check things removed on purpose): this file's tests
// that still expected the old landing mock-up (made-up certificate IDs, "STATUTORY-VERIFIED", the verification
// popup, the fixed "SC · Income ≤ ₹5.00L" line, the old header/slider/sidebar layout, a 50 kB bundle-size floor,
// Google sign-in) or that banned the demo account kept on purpose for judges (mobile 9876543210, PIN 2026)
// were deleted. The remaining tests in this file still run.
/**
 * Empirical Verification & Stress Test Suite for Milestone M2:
 * Dynamic Profile Rendering across All Views & SSR Bundle Fidelity
 * Challenger 2 (Adversarial Critic & Specialist)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Bundled SSR SetoDashboard Component
import SetoDashboard from '../dist-ssr/SetoDashboard.js';

/**
 * Helper to render SetoDashboard with controlled internal state.
 * Allows inspecting viewports like Modal and DPR that are toggled by internal state.
 * Normalizes React 19 hydration comments (<!-- -->) for robust DOM text content assertions.
 */
function renderSetoDashboardWithState(props = {}, stateOverrides = {}) {
  const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  let rawHtml = '';

  const Wrapper = () => {
    const origUseState = internals.H.useState;
    internals.H.useState = (initialState) => {
      // Override activeTab if specified ('home', 'dpr', 'simulator', etc.)
      if (typeof initialState === 'string' && ['home', 'simulator', 'amortizer', 'restructure', 'dpr'].includes(initialState)) {
        if (stateOverrides.activeTab) {
          return [stateOverrides.activeTab, () => {}];
        }
      }
      // Override userModalOpen if specified (boolean)
      if (initialState === false && stateOverrides.userModalOpen !== undefined) {
        return [stateOverrides.userModalOpen, () => {}];
      }
      return origUseState(initialState);
    };

    return React.createElement(SetoDashboard, props);
  };

  rawHtml = renderToString(React.createElement(Wrapper));
  // Strip React hydration comment markers <!-- --> to accurately test rendered DOM text
  return rawHtml.replace(/<!--.*?-->/g, '');
}

describe('1. Dynamic Profile Rendering Across All Views (Empirical Challenger 2)', () => {

  describe('1.1. Profile 1: Ananya Sharma (SC, UP-LKN-992100)', () => {
    const profile = {
      name: 'Ananya Sharma',
      category: 'SC',
      id: 'UP-LKN-992100'
    };

    it('renders dynamic header greeting with first name', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Welcome, Ananya!'), 'Expected header greeting to be "Welcome, Ananya!"');
    });




  });

  describe('1.2. Profile 2: Vikram Das with custom district, income, and avatar', () => {
    const profile = {
      name: 'Vikram Das',
      category: 'SC',
      id: 'UP-VNS-110293',
      district: 'Varanasi District',
      income: '≤ ₹3,50,000',
      avatar: 'https://images.example.com/vikram_avatar.jpg'
    };

    it('renders dynamic header greeting with first name', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Welcome, Vikram!'), 'Expected header greeting to be "Welcome, Vikram!"');
    });




  });

  describe('1.3. Profile 3: Single-word name (Kavita)', () => {
    const profile = {
      name: 'Kavita',
      category: 'Scheduled Caste (SC)',
      id: 'UP-KNP-550122'
    };

    it('extracts single name cleanly without trailing spaces or errors in header', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Welcome, Kavita!'), 'Expected header greeting to be "Welcome, Kavita!"');
    });

  });

  describe('1.4. Profile 4: Devanagari script user (सुरेश कुमार)', () => {
    const profile = {
      name: 'सुरेश कुमार',
      category: 'SC',
      id: 'UP-AGR-883901'
    };

    it('splits Devanagari name correctly for header greeting', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Welcome, सुरेश!'), 'Expected header greeting to split Devanagari first name "सुरेश"');
    });

  });

  describe('1.5. Unauthenticated State (currentUser = null)', () => {

    it('renders vernacular Hindi fallback when language is "hi"', () => {
      const html = renderSetoDashboardWithState({ currentUser: null, language: 'hi' });
      assert.ok(html.includes('स्वागत है!'), 'Expected header greeting in Hindi "स्वागत है!"');
      assert.ok(html.includes('उद्यमी'), 'Expected user card to display "उद्यमी" in Hindi');
    });


  });

  describe('1.6. Adversarial Profile Edge Cases', () => {
    it('handles user with empty name string gracefully without crashing', () => {
      const emptyNameProfile = { name: '', category: 'SC', id: 'UP-EMPTY-001' };
      const html = renderSetoDashboardWithState({ currentUser: emptyNameProfile, language: 'en' });
      // Empty string is falsy so it should fallback to "Welcome!"
      assert.ok(html.includes('Welcome!'), 'Falsy name should fall back to default greeting');
      assert.ok(html.includes('Entrepreneur'), 'Falsy name in user card should fall back to Entrepreneur');
    });


  });
});

describe('2. SSR Bundle Fidelity & Client Build Verification (Challenger 2)', () => {
  const ssrBundlePath = path.resolve(__dirname, '../dist-ssr/SetoDashboard.js');
  const clientDistDir = path.resolve(__dirname, '../dist');


  it('SSR bundle contains no legacy mock references or hardcoded Ramesh strings', () => {
    const bundleContent = fs.readFileSync(ssrBundlePath, 'utf8');
    assert.strictEqual(bundleContent.includes('Ramesh Kumar'), false, 'Found "Ramesh Kumar" in dist-ssr bundle');
    assert.strictEqual(bundleContent.includes('UP-STP-008129'), false, 'Found "UP-STP-008129" in dist-ssr bundle');
    assert.strictEqual(bundleContent.includes('9876543210'), false, 'Found "9876543210" in dist-ssr bundle');
    assert.strictEqual(bundleContent.includes('रमेश कुमार'), false, 'Found "रमेश कुमार" in dist-ssr bundle');
  });

  it('Client production build directory exists and contains index.html and assets', () => {
    assert.ok(fs.existsSync(clientDistDir), 'dist/ directory must exist');
    const indexHtmlPath = path.join(clientDistDir, 'index.html');
    assert.ok(fs.existsSync(indexHtmlPath), 'dist/index.html must exist');
    const assetsDir = path.join(clientDistDir, 'assets');
    assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');

    const assetFiles = fs.readdirSync(assetsDir);
    const jsBundles = assetFiles.filter(f => f.endsWith('.js'));
    const cssBundles = assetFiles.filter(f => f.endsWith('.css'));
    assert.ok(jsBundles.length >= 1, 'Client build must produce at least one JS bundle');
    assert.ok(cssBundles.length >= 1, 'Client build must produce at least one CSS bundle');
  });


  it('Default avatar SVG asset exists in public and dist directories', () => {
    const publicDefaultAvatar = path.resolve(__dirname, '../public/images/default_avatar.svg');
    assert.ok(fs.existsSync(publicDefaultAvatar), 'public/images/default_avatar.svg must exist');
    const stat = fs.statSync(publicDefaultAvatar);
    assert.ok(stat.size > 200, 'default_avatar.svg must be non-empty');
  });
});
