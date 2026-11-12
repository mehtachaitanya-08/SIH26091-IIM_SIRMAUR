/**
 * Google sign-in was removed on 12 Nov 2026 (owner: "no need for it"; it never had a real client
 * ID). These checks stop it coming back by accident. They read source text: App.jsx is not built
 * for the tests, and its sign-in box is not drawn on first load, so the screen is checked in a browser.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');

function sourceFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.(js|jsx|mjs)$/.test(name)) out.push(full);
  }
  return out;
}

describe('Google sign-in stays removed', () => {
  it('googleAuth.js no longer exists', () => {
    assert.equal(fs.existsSync(path.join(SRC, 'services/googleAuth.js')), false);
  });

  it('no source file uses the Google sign-in functions or its client ID setting', () => {
    for (const file of sourceFiles(SRC)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const word of ['authenticateByGoogle', 'triggerGoogleLogin', 'VITE_GOOGLE_CLIENT_ID']) {
        assert.ok(!text.includes(word), `${path.relative(SRC, file)} still mentions ${word}`);
      }
    }
  });

  it('the sign-in box in App.jsx has no Google button', () => {
    const app = fs.readFileSync(path.join(SRC, 'App.jsx'), 'utf8');
    assert.ok(!app.includes('continueGoogle'), 'App.jsx still has the continueGoogle text key');
    assert.ok(!app.includes('Continue with Google'), 'App.jsx still says "Continue with Google"');
  });
});
