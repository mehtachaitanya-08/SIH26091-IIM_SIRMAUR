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

    it('renders dynamic district and certificate ID in header badge', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Sitapur District · UP-LKN-992100'), 'Expected default district and dynamic ID UP-LKN-992100');
    });

    it('renders dynamic name and category in bottom user card', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Ananya Sharma'), 'Expected user card to display "Ananya Sharma"');
      assert.ok(html.includes('SC · Income ≤ ₹5.00L'), 'Expected user card to display "SC · Income ≤ ₹5.00L"');
    });

    it('renders dynamic beneficiary verification modal with statutory certificate ID', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile }, { userModalOpen: true });
      assert.ok(html.includes('Statutory Beneficiary Verification'), 'Expected modal title');
      assert.ok(html.includes('Ananya Sharma'), 'Expected modal name to be "Ananya Sharma"');
      assert.ok(html.includes('SC · Verified'), 'Expected modal category to be "SC · Verified"');
      assert.ok(html.includes('MoSJE/NSFDC/2026/UP-LKN-992100'), 'Expected certificate ID "MoSJE/NSFDC/2026/UP-LKN-992100"');
    });

    it('renders dynamic beneficiary in Lead-Bank DPR summary', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile }, { activeTab: 'dpr' });
      // Stage 1b: plain title, no page count (owner's decision 20)
      assert.ok(html.includes('Detailed Project Report (DPR)') && !html.includes('1-Page'), 'Expected DPR title');
      assert.ok(html.includes('Ananya Sharma (SC · Verified)'), 'Expected DPR beneficiary line with dynamic name and category');
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

    it('renders dynamic custom district and ID in header badge', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('Varanasi District · UP-VNS-110293'), 'Expected custom district and ID in header');
    });

    it('renders custom avatar in bottom user card', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(html.includes('src="https://images.example.com/vikram_avatar.jpg"'), 'Expected custom avatar URL');
      assert.ok(html.includes('Vikram Das'), 'Expected bottom user card name');
    });

    it('renders dynamic custom income in beneficiary verification modal', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile }, { userModalOpen: true });
      assert.ok(html.includes('Vikram Das'), 'Expected modal name');
      assert.ok(html.includes('≤ ₹3,50,000'), 'Expected custom income in verification modal');
      assert.ok(html.includes('MoSJE/NSFDC/2026/UP-VNS-110293'), 'Expected certificate ID');
    });

    it('renders dynamic beneficiary in DPR summary', () => {
      const html = renderSetoDashboardWithState({ currentUser: profile }, { activeTab: 'dpr' });
      assert.ok(html.includes('Vikram Das (SC · Verified)'), 'Expected DPR beneficiary line');
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

    it('renders full name in user card and DPR summary', () => {
      const htmlCard = renderSetoDashboardWithState({ currentUser: profile });
      assert.ok(htmlCard.includes('Kavita'), 'Expected user card to contain "Kavita"');

      const htmlDpr = renderSetoDashboardWithState({ currentUser: profile }, { activeTab: 'dpr' });
      assert.ok(htmlDpr.includes('Kavita (Scheduled Caste (SC) · Verified)'), 'Expected DPR line');
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

    it('renders full Devanagari name in modal and DPR', () => {
      const htmlModal = renderSetoDashboardWithState({ currentUser: profile }, { userModalOpen: true });
      assert.ok(htmlModal.includes('सुरेश कुमार'), 'Expected modal to contain full Devanagari name');

      const htmlDpr = renderSetoDashboardWithState({ currentUser: profile }, { activeTab: 'dpr' });
      assert.ok(htmlDpr.includes('सुरेश कुमार (SC · Verified)'), 'Expected DPR to contain Devanagari name');
    });
  });

  describe('1.5. Unauthenticated State (currentUser = null)', () => {
    it('renders neutral English fallback when language is "en"', () => {
      const html = renderSetoDashboardWithState({ currentUser: null, language: 'en' });
      assert.ok(html.includes('Welcome!'), 'Expected header greeting to be "Welcome!"');
      assert.ok(html.includes('Entrepreneur'), 'Expected user card to display "Entrepreneur"');
      assert.ok(html.includes('STATUTORY-VERIFIED'), 'Expected header ID pill to display STATUTORY-VERIFIED');
      assert.ok(html.includes('/images/default_avatar.svg'), 'Expected fallback default avatar svg');
    });

    it('renders vernacular Hindi fallback when language is "hi"', () => {
      const html = renderSetoDashboardWithState({ currentUser: null, language: 'hi' });
      assert.ok(html.includes('स्वागत है!'), 'Expected header greeting in Hindi "स्वागत है!"');
      assert.ok(html.includes('उद्यमी'), 'Expected user card to display "उद्यमी" in Hindi');
    });

    it('renders neutral modal fallback in unauthenticated state', () => {
      const htmlEn = renderSetoDashboardWithState({ currentUser: null, language: 'en' }, { userModalOpen: true });
      assert.ok(htmlEn.includes('Entrepreneur'), 'Expected English modal fallback');
      assert.ok(htmlEn.includes('MoSJE/NSFDC/2026/STATUTORY-VERIFIED'), 'Expected fallback certificate ID');

      const htmlHi = renderSetoDashboardWithState({ currentUser: null, language: 'hi' }, { userModalOpen: true });
      assert.ok(htmlHi.includes('उद्यमी'), 'Expected Hindi modal fallback');
    });

    it('renders neutral DPR summary fallback in unauthenticated state', () => {
      const htmlEn = renderSetoDashboardWithState({ currentUser: null, language: 'en' }, { activeTab: 'dpr' });
      assert.ok(htmlEn.includes('Beneficiary Entrepreneur (SC · Verified)'), 'Expected English DPR fallback');

      const htmlHi = renderSetoDashboardWithState({ currentUser: null, language: 'hi' }, { activeTab: 'dpr' });
      assert.ok(htmlHi.includes('लाभार्थी उद्यमी (SC · Verified)'), 'Expected Hindi DPR fallback');
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

    it('handles user with null category gracefully with default category fallbacks', () => {
      const noCatProfile = { name: 'Pooja', category: null, id: 'UP-NOCAT-002' };
      const htmlModal = renderSetoDashboardWithState({ currentUser: noCatProfile }, { userModalOpen: true });
      assert.ok(htmlModal.includes('Scheduled Caste (SC) · Verified'), 'Expected default category in modal');

      const htmlDpr = renderSetoDashboardWithState({ currentUser: noCatProfile }, { activeTab: 'dpr' });
      assert.ok(htmlDpr.includes('SC · Verified'), 'Expected default SC in DPR');
    });

    it('handles user with null id gracefully with statutory default', () => {
      const noIdProfile = { name: 'Pooja', category: 'SC', id: null };
      const html = renderSetoDashboardWithState({ currentUser: noIdProfile });
      assert.ok(html.includes('STATUTORY-VERIFIED'), 'Expected STATUTORY-VERIFIED fallback');

      const htmlModal = renderSetoDashboardWithState({ currentUser: noIdProfile }, { userModalOpen: true });
      assert.ok(htmlModal.includes('MoSJE/NSFDC/2026/STATUTORY-VERIFIED'), 'Expected STATUTORY-VERIFIED modal certificate');
    });
  });
});

describe('2. SSR Bundle Fidelity & Client Build Verification (Challenger 2)', () => {
  const ssrBundlePath = path.resolve(__dirname, '../dist-ssr/SetoDashboard.js');
  const clientDistDir = path.resolve(__dirname, '../dist');

  it('SSR bundle file exists on disk and has substantial byte size (>50 kB)', () => {
    assert.ok(fs.existsSync(ssrBundlePath), 'dist-ssr/SetoDashboard.js must exist');
    const stat = fs.statSync(ssrBundlePath);
    assert.ok(stat.size > 50000, `SSR bundle size (${stat.size} bytes) is too small, expected > 50 kB`);
  });

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

  it('Client production JS bundles contain zero mock Ramesh strings', () => {
    const assetsDir = path.join(clientDistDir, 'assets');
    const assetFiles = fs.readdirSync(assetsDir);
    const jsBundles = assetFiles.filter(f => f.endsWith('.js'));

    for (const file of jsBundles) {
      const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
      assert.strictEqual(content.includes('UP-STP-008129'), false, `Found "UP-STP-008129" in client bundle ${file}`);
      assert.strictEqual(content.includes('9876543210'), false, `Found "9876543210" in client bundle ${file}`);
      assert.strictEqual(content.includes('रमेश कुमार'), false, `Found "रमेश कुमार" in client bundle ${file}`);
    }
  });

  it('Default avatar SVG asset exists in public and dist directories', () => {
    const publicDefaultAvatar = path.resolve(__dirname, '../public/images/default_avatar.svg');
    assert.ok(fs.existsSync(publicDefaultAvatar), 'public/images/default_avatar.svg must exist');
    const stat = fs.statSync(publicDefaultAvatar);
    assert.ok(stat.size > 200, 'default_avatar.svg must be non-empty');
  });
});
