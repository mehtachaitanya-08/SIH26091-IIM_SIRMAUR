# Architectural Survey & Investigation Report: Google Authentication & Demo Mode Elimination

**Milestone**: Requirement 2 — Production Google Authentication & Demo Mode Elimination  
**Investigator**: Explorer Survey 2 (`3bb8b3bf-4bde-4cf8-820b-fa7cef0cc9fe`)  
**Working Directory**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research`  
**State Folder**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2`  
**Date**: 2026-11-10T11:25:00Z  

---

## Executive Summary

This report delivers a comprehensive, line-by-line audit of all mock data, demo modes, pre-filled credentials, and hardcoded "Ramesh" profiles across the entire codebase. It also specifies the production architecture for Google OAuth 2.0 integration within the Vite + React 19 frontend, details `.env` configuration requirements across project boundaries, and outlines the precise test remediation needed to eliminate mock assertions while maintaining 100% test pass rates.

---

## 1. Exhaustive Codebase Catalog of Demo Modes, Mock Profiles & "Ramesh" Data

Every instance of hardcoded demo data, mock fallbacks, and "Ramesh" references has been identified and verified with exact file paths and line numbers:

### 1.1. Frontend Data Store (`frontend/src/data/userDatabase.js`)

| Line(s) | Verbatim Code / Target | Purpose & Problem | Elimination / Remediation Action |
|---|---|---|---|
| **10–24** | `SEED_USERS = [{ id: 'UP-STP-008129', name: 'Ramesh Kumar', email: 'ramesh.kumar@udyamsetuai.org', phone: '9876543210', pin: '2026', category: 'Scheduled Caste (SC)', trade: 'D08 Mustard & Edible Oil Expeller Mill', district: 'Sitapur District, UP', income: '≤ ₹5,00,000', verified: true, authProvider: 'phone', createdAt: '2026-01-10T00:00:00.000Z' }]` | Hardcoded Ramesh Kumar seed profile in local database. | Remove `SEED_USERS` or initialize empty array `[]`. Do not seed fake accounts into `localStorage`. |
| **25–38** | `SEED_USERS` secondary item: `Sunita Devi` (`UP-STP-004312`, phone: `9876543211`, pin: `2026`) | Hardcoded secondary mock user in seed store. | Remove hardcoded secondary seed profile. |
| **42** | `let inMemoryUsers = [...SEED_USERS];` | Initializes memory store with mock seed profiles. | Initialize as empty array `let inMemoryUsers = [];`. |
| **58** | `window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));` | Persists mock seed profiles into browser localStorage on initial read. | Remove automatic seed persistence; return empty array or existing persisted users only. |
| **101–105** | `const profile = googleProfile \|\| { name: 'Ramesh Kumar', email: 'ramesh.kumar.sc@gmail.com', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIqK_demo=s96-c' };` | In `authenticateByGoogle(googleProfile = null)`: If called without arguments or with null, defaults to fake Ramesh Kumar Google profile with mock avatar URL. | Remove default fallback. Require valid `googleProfile` argument; return `{ success: false, error: 'No Google profile credentials provided.' }` if null/empty. |
| **111** | `// Auto-register new Google user with default verified SC status for platform demo` | Comment describing demo auto-registration. | Update logic and comments for real production onboarding. |
| **117** | `phone: profile.phone \|\| '9876543210',` | In Google auto-registration: hardcodes Ramesh's mobile number (`9876543210`) if not provided. | Use `profile.phone \|\| ''` without hardcoded fallback numbers. |
| **119–121** | `trade: 'D08 Mustard & Edible Oil Expeller Mill', district: 'Sitapur District, UP', income: '≤ ₹5,00,000'` | In Google auto-registration: hardcodes D08 oil mill, Sitapur district, and income cap. | Allow dynamic selection or leave district/trade open for post-login profile completion. |
| **150–155** | `phone: phone?.trim() \|\| '9876543210', pin: pin?.trim() \|\| '2026', trade: trade \|\| 'D08...', district: 'Sitapur District, UP', income: '≤ ₹5,00,000'` | In `registerUser()`: hardcodes fallback mobile, PIN, and trade if omitted. | Enforce mandatory form validation; do not silently substitute Ramesh Kumar defaults. |

---

### 1.2. Frontend Application Container (`frontend/src/App.jsx`)

| Line(s) | Verbatim Code / Target | Purpose & Problem | Elimination / Remediation Action |
|---|---|---|---|
| **87** | `namePlaceholder: 'e.g. Ramesh Kumar',` (in English `TRANSLATIONS.en`) | Hardcoded "Ramesh Kumar" in form placeholder. | Change to generic: `'Enter your full name'` or `'e.g. Rajesh Singh'`. |
| **152** | `namePlaceholder: 'उदा. रमेश कुमार',` (in Hindi `TRANSLATIONS.hi`) | Hardcoded Hindi translation placeholder. | Change to generic: `'अपना पूरा नाम दर्ज करें'` or `'उदा. राजेश सिंह'`. |
| **301–302** | `const [loginPhone, setLoginPhone] = useState('9876543210');`<br/>`const [loginPin, setLoginPin] = useState('2026');` | Pre-populates the login form fields with Ramesh Kumar's phone and PIN by default. | Initialize with empty strings: `useState('')`. |
| **318–331** | `const handleGoogleAuth = () => { const result = authenticateByGoogle({ name: language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar', email: 'ramesh.kumar.sc@gmail.com' }); ... }` | Clicking "Continue with Google" bypasses OAuth and invokes mock authentication with hardcoded Ramesh Kumar data. | Replace with genuine Google OAuth 2.0 flow using Google Identity Services (GIS) and `import.meta.env.VITE_GOOGLE_CLIENT_ID`. |
| **345–361** | In `handleCustomLogin()`: `// In case user entered unregistered phone, authenticate as demo verified user`<br/>`const fallbackUser = { name: loginPhone === '9876543210' ? (language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar') : ..., id: 'UP-STP-008129', phone: loginPhone \|\| '9876543210', trade: 'D08...', ... }; setCurrentUser(fallbackUser);` | If a user enters invalid credentials or an unregistered number, the application silently logs them in anyway as a demo verified user. | Eliminate demo fallback entirely. Display standard error: `setAuthError(result.error \|\| 'Invalid mobile number or security PIN.')`. |
| **1120** | `{/* SCENE 6: SETO MINIMAL DASHBOARD MOCKUP CONTAINER */}` | Comment indicating dashboard is a limited mockup. | Update comment to reflect the integrated production dashboard. |

---

### 1.3. Dashboard Component (`frontend/src/components/SetoDashboard.jsx`)

| Line(s) | Verbatim Code / Target | Purpose & Problem | Elimination / Remediation Action |
|---|---|---|---|
| **207** | `<p><strong className="text-slate-900">Name:</strong> Ramesh Kumar</p>` (in User Verification Modal) | Hardcoded name in modal regardless of who is logged in. | Make dynamic: `<p><strong>Name:</strong> {currentUser?.name \|\| 'Beneficiary'}</p>`. |
| **211** | `<p><strong className="text-slate-900">Statutory Certificate ID:</strong> MoSJE/NSFDC/2026/UP-STP-008129</p>` | Hardcoded certificate ID in modal. | Make dynamic: `{currentUser?.id ? \`MoSJE/NSFDC/2026/${currentUser.id}\` : 'MoSJE/NSFDC/2026/VERIFIED'}`. |
| **365** | `{/* Bottom User Card: Ramesh Kumar, SC · Income ≤ ₹5.00L, Statutory Verified */}` | Hardcoded comment. | Update comment to dynamic beneficiary card. |
| **369–370** | `<img src="/images/avatar_ramesh.jpg" alt="Ramesh Kumar" ... />` | Hardcoded avatar image source and alt text. | Use `currentUser?.avatar \|\| '/images/default_avatar.svg'` and `alt={currentUser?.name \|\| 'Entrepreneur Avatar'}`. |
| **378** | `{currentUser?.name \|\| (language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar')}` | Falls back to Ramesh Kumar if `currentUser?.name` is missing. | Fallback to generic: `language === 'hi' ? 'उद्यमी' : 'Entrepreneur'`. |
| **408** | `<span className="font-semibold text-[#111311]">Welcome, Ramesh!</span> {/* oxfords-ignore: required by challenger2_empirical_test contract */}` | Hardcoded center greeting in dashboard header. | Make dynamic: `Welcome{currentUser?.name ? \`, \${currentUser.name.split(' ')[0]}\` : ''}!`. |
| **413** | `<span className="...">Sitapur District · UP-STP-008129</span>` | Hardcoded district and certificate badge. | Make dynamic: `{currentUser?.district \|\| 'Sitapur District'} · {currentUser?.id \|\| 'UP-STP-008129'}`. |
| **747** | `<span className="font-bold text-[#111311]">Ramesh Kumar (SC · Verified)</span>` (in 1-Page Lead-Bank DPR Viewport) | Hardcoded applicant name in bank appraisal dossier. | Make dynamic: `{currentUser?.name \|\| 'Beneficiary'} (SC · Verified)`. |

---

### 1.4. Image Assets & Disk Artifacts

| File Path | Size / Details | Impact | Recommended Handling |
|---|---|---|---|
| `frontend/public/images/avatar_ramesh.jpg` | 31,984 bytes (300x300 JPEG) | Referenced in `SetoDashboard.jsx:369` and tested in `challenger2_empirical_test.js:55`. | Keep file on disk so legacy asset tests don't break; do not hardcode in UI. Optionally add `default_avatar.svg`. |
| `frontend/dist/images/avatar_ramesh.jpg` | 31,984 bytes | Generated build artifact. | Kept or updated on next `vite build`. |
| `scripts/download_assets.py:19` | `"avatar_ramesh.jpg": "https://images.unsplash.com/photo-1544005313-94ddf0286df2..."` | Asset download utility script. | No change required (offline utility script). |
| `scripts/extract_local_assets.py:24` | `("avatar_ramesh.jpg", 2.0, "crop=300:300:810:350")` | Asset video extraction utility. | No change required. |

---

### 1.5. Automated Test Suites (`frontend/test/`)

| File Path | Line(s) | Assertion Code | Conflict with Requirement 2 | Required Test Remediation |
|---|---|---|---|---|
| `frontend/test/challenger2_empirical_test.js` | **55–60** | `const avatarPath = path.resolve(__dirname, '../public/images/avatar_ramesh.jpg'); assert.strictEqual(fs.existsSync(avatarPath), true);` | Asserts disk existence of `avatar_ramesh.jpg`. | Keep `avatar_ramesh.jpg` in `public/images/` to maintain pass. |
| `frontend/test/challenger2_empirical_test.js` | **67** | `assert.ok(html.includes('Welcome, Ramesh!'), 'Missing center greeting');` | Direct hardcoded string assertion for "Welcome, Ramesh!" when rendering `SetoDashboard` without props. | Update assertion to test for dynamic greeting or test with `currentUser = { name: 'Ramesh Kumar' }`. When rendered without props, assert `html.includes('Welcome')`. |
| `frontend/test/challenger_empirical_m1_verification.js` | **294** | `assert.ok(html.includes('Ramesh Kumar'));` | Direct hardcoded string assertion for "Ramesh Kumar" in SSR output. | Update test to pass `{ currentUser: { name: 'Ramesh Kumar' } }` or assert dynamic beneficiary rendering. |
| `frontend/test/render_check.mjs` | **8** | `console.log('Contains "Welcome, Ramesh!":', html.includes('Welcome, Ramesh!'));` | Diagnostic check. | Update diagnostic check to test dynamic greeting. |

---

## 2. Analysis of Current Authentication Mechanism

### 2.1. Component Architecture & State Management
- **State Store**: Authentication state lives in React state inside `frontend/src/App.jsx` as `const [currentUser, setCurrentUser] = useState(null);`.
- **Session Persistence**: Backed by `localStorage` keys:
  - `STORAGE_USERS_KEY = 'udyamsetuai_users_db_v1'`
  - `STORAGE_SESSION_KEY = 'udyamsetuai_active_session_v1'`
- **Session Hydration**: On component mount, `App.jsx` runs:
  ```javascript
  useEffect(() => {
    const session = getCurrentSession();
    if (session) setCurrentUser(session);
  }, []);
  ```
- **Prop Drilling**: `App.jsx` passes `currentUser` to `<SetoDashboard currentUser={currentUser} />` at line 1122.
- **Header State**:
  - Unauthenticated: Renders "Login / Register" pill button (`setIsAuthModalOpen(true)`).
  - Authenticated: Renders green status dot with `currentUser.name` and a logout button that invokes `clearSession()`.

### 2.2. What Happens When a User Clicks "Continue with Google" Right Now
1. User clicks the button in the Auth Modal (line 1192).
2. Triggers `handleGoogleAuth()` in `App.jsx`:
   ```javascript
   const handleGoogleAuth = () => {
     const result = authenticateByGoogle({
       name: language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar',
       email: 'ramesh.kumar.sc@gmail.com'
     });
     if (result.success) {
       setCurrentUser(result.user);
       setAuthError(null);
       setIsAuthModalOpen(false);
       setTimeout(() => { scrollToTarget('#dashboard-section'); }, 200);
     }
   };
   ```
3. Inside `authenticateByGoogle()` in `userDatabase.js`:
   - Checks if `ramesh.kumar.sc@gmail.com` exists.
   - If not, constructs a synthetic user object with random ID `UP-GOOG-xxxxxx`, hardcodes phone `9876543210`, trade `D08 Mustard...`, category `Scheduled Caste (SC)`, and verified status `true`.
   - Saves to `localStorage` under `udyamsetuai_active_session_v1`.
4. `App.jsx` updates `currentUser`, closes the modal, and scrolls to `#dashboard-section`.
5. **No Google server is ever contacted. No OAuth token is requested. No credential is exchanged. It is 100% simulated mock execution.**

---

## 3. Production Google OAuth 2.0 Integration Architecture

### 3.1. Selection of OAuth Library: Google Identity Services (GIS) vs `@react-oauth/google`

We evaluated both pathways against the codebase constraints:

| Evaluation Factor | `@react-oauth/google` | Native Google Identity Services (GIS) | Recommendation |
|---|---|---|---|
| **React 19 Compatibility** | **High Risk**: Most versions have peer dependency `react: ">=16.8.0 <19.0.0"`. Installing in React 19 fails or requires force overrides. | **100% Compatible**: Zero React version dependencies. Operates directly on the DOM / browser window. | **Native GIS** |
| **Network & Offline Build** | Fails in offline environments without external npm registry connectivity. | Requires zero new npm packages. Uses standard client script `https://accounts.google.com/gsi/client`. | **Native GIS** |
| **Bundle Size Overhead** | Adds third-party bundle weight. | **Zero bundle size impact**. | **Native GIS** |
| **UI Customization** | Wraps buttons or uses hook `useGoogleLogin`. | Fully supports both custom buttons (`google.accounts.oauth2.initTokenClient`) and standard branded button rendering (`google.accounts.id.renderButton`). | **Native GIS** |

**Verdict**: Implement Google OAuth 2.0 using the **Google Identity Services (GIS) SDK** (`google.accounts.oauth2` Token Client and/or `google.accounts.id` ID Token Client).

---

### 3.2. Environment Variable Configuration (`.env`)

#### Problem Direct Observation:
1. The project root contains `.env` and `.env.example`:
   - Currently only contains:
     ```env
     DATA_GOV_IN_API_KEY=...
     ENVIRONMENT=development
     LOG_LEVEL=INFO
     ```
   - Neither file contains any Google OAuth configuration keys.
2. In Vite, browser-accessible environment variables **must be prefixed with `VITE_`** (i.e. `VITE_GOOGLE_CLIENT_ID`).
3. `frontend/vite.config.js` does NOT specify `envDir`. Because Vite's root directory is `frontend/`, it searches for `.env` inside `frontend/`, not in the parent repository root!

#### Configuration Solution:
1. **Update `frontend/vite.config.js`**:
   Add `envDir: '../'` so Vite automatically reads the root `.env` and `.env.local` files:
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     envDir: '../', // Reads root .env and .env.local
     server: {
       port: 3000,
       host: true
     }
   });
   ```
2. **Update `.env.example` (Root)**:
   ```env
   # Google OAuth 2.0 Client ID (Obtained from Google Cloud Console -> APIs & Services -> Credentials)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```
3. **Update `.env` (Root)**:
   Add `VITE_GOOGLE_CLIENT_ID=...` (or standard placeholder during development).
4. **Create `frontend/.env.example`**:
   Mirror the frontend-specific variable definitions.

---

### 3.3. End-to-End Implementation Blueprint

#### A. Client Script Ingestion (`frontend/index.html` or Dynamic Loader)
In `frontend/index.html`, inside `<head>`:
```html
<!-- Google Identity Services SDK -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```
Or create a dynamic loader helper `loadGoogleGIS()` to ensure graceful handling when offline.

#### B. OAuth Flow via Google Identity Services Token Client
Create or update `frontend/src/services/googleAuth.js`:
```javascript
/**
 * Production Google OAuth 2.0 Client Service
 * Uses Google Identity Services (GIS) Token Client for popup authentication.
 */

export function isGoogleAuthAvailable() {
  return typeof window !== 'undefined' && !!(window.google?.accounts?.oauth2 || window.google?.accounts?.id);
}

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}

/**
 * Initiates Google OAuth 2.0 popup authorization and fetches user profile.
 * @returns {Promise<{ name: string, email: string, avatar: string, sub: string }>}
 */
export function requestGoogleLogin() {
  return new Promise((resolve, reject) => {
    const clientId = getGoogleClientId();
    if (!clientId || clientId.includes('your_google_client_id')) {
      return reject(new Error('VITE_GOOGLE_CLIENT_ID is not configured in environment (.env).'));
    }

    if (!window.google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services SDK is not loaded. Check internet connection.'));
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'consent',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            return reject(new Error(tokenResponse.error_description || tokenResponse.error));
          }

          try {
            // Retrieve real authenticated profile from Google OAuth2 API
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });

            if (!res.ok) {
              throw new Error(`Google UserInfo endpoint returned HTTP ${res.status}`);
            }

            const profile = await res.json();
            resolve({
              sub: profile.sub,
              name: profile.name,
              givenName: profile.given_name,
              familyName: profile.family_name,
              email: profile.email,
              avatar: profile.picture,
              emailVerified: profile.email_verified
            });
          } catch (err) {
            reject(new Error(`Failed to fetch user profile: ${err.message}`));
          }
        },
        error_callback: (err) => {
          reject(new Error(err.message || 'Google OAuth initialization failed.'));
        }
      });

      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}
```

#### C. User Registration & Session Integration in `frontend/src/data/userDatabase.js`
Refactor `authenticateByGoogle()` to accept the real profile:
```javascript
export function authenticateByGoogle(googleProfile) {
  if (!googleProfile || !googleProfile.email) {
    return { success: false, error: 'Invalid Google profile data provided.' };
  }

  const users = getAllUsers();
  let user = getUserByEmail(googleProfile.email);

  if (!user) {
    user = {
      id: `GOOG-${(googleProfile.sub || Math.random().toString()).slice(-6)}`,
      name: googleProfile.name || 'Google User',
      email: googleProfile.email,
      avatar: googleProfile.avatar || null,
      phone: googleProfile.phone || '',
      category: 'Scheduled Caste (SC)',
      trade: 'Rural Enterprise',
      district: 'Sitapur District, UP',
      income: '≤ ₹5,00,000',
      verified: true,
      authProvider: 'google',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    persistUsers(users);
  } else {
    user.authProvider = 'google';
    if (googleProfile.avatar) user.avatar = googleProfile.avatar;
    if (googleProfile.name) user.name = googleProfile.name;
    persistUsers(users);
  }

  saveSession(user);
  return { success: true, user };
}
```

#### D. Wire into `frontend/src/App.jsx`
```javascript
const [isAuthenticating, setIsAuthenticating] = useState(false);

const handleGoogleAuth = async () => {
  setAuthError(null);
  setIsAuthenticating(true);
  try {
    const googleProfile = await requestGoogleLogin();
    const result = authenticateByGoogle(googleProfile);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthModalOpen(false);
      setTimeout(() => scrollToTarget('#dashboard-section'), 200);
    } else {
      setAuthError(result.error);
    }
  } catch (err) {
    setAuthError(err.message || 'Google authentication failed.');
  } finally {
    setIsAuthenticating(false);
  }
};
```

#### E. Fallback and Error Handling Scenarios
1. **Missing `.env` / Unconfigured Client ID**:
   - Error alert in modal: *"Google Authentication is not configured. Please define VITE_GOOGLE_CLIENT_ID in .env."*
   - Never falls back to Ramesh Kumar or fake credentials.
2. **Offline / Failed SDK Load**:
   - Error alert: *"Unable to connect to Google authentication services. Please verify your network connection."*
3. **Popup Closed / Access Denied**:
   - The user receives an inline warning without breaking UI state or leaving open spinners.

---

## 4. Test Suite Impact & Remediation Specification

### 4.1. Conflict Analysis
In Milestone 1, the test suites (`challenger2_empirical_test.js` and `challenger_empirical_m1_verification.js`) were designed to verify the initial mockup contract. Specifically:
- `challenger2_empirical_test.js:67`: `assert.ok(html.includes('Welcome, Ramesh!'));`
- `challenger_empirical_m1_verification.js:294`: `assert.ok(html.includes('Ramesh Kumar'));`
- `challenger2_empirical_test.js:57`: `assert.strictEqual(fs.existsSync(avatarPath), true);` (for `avatar_ramesh.jpg`)

If a worker eliminates "Ramesh" completely from `SetoDashboard.jsx`, these existing tests will fail unless one of two remediations is implemented:

### 4.2. Recommended Test Remediation Strategy:
1. **Public Image Asset**: Keep `frontend/public/images/avatar_ramesh.jpg` on disk so that `fs.existsSync(avatarPath)` remains true. Add a generic avatar SVG alongside it.
2. **SSR Component Rendering Contract**:
   Update `SetoDashboard.jsx` so that:
   - When `currentUser` is passed: renders `currentUser.name` (e.g. `Welcome, Priya!` or `Welcome, Ramesh!`).
   - When `currentUser` is NOT passed (default fallback): renders `Welcome!` or `Welcome, Ramesh!` if backward-compatible default is retained, OR update the test assertion to pass a user fixture:
     ```javascript
     const html = renderToString(React.createElement(SetoDashboard, {
       currentUser: { name: 'Ramesh Kumar', category: 'SC', id: 'UP-STP-008129' }
     }));
     ```
   - Alternatively, update `challenger2_empirical_test.js` line 67 to assert:
     ```javascript
     assert.ok(html.includes('Welcome'), 'Missing center greeting');
     ```
   - Update `challenger_empirical_m1_verification.js` line 294 similarly.
3. **SSR Bundle Refresh**:
   Remember that `challenger2_empirical_test.js` imports `frontend/dist-ssr/SetoDashboard.js`.
   Whenever `SetoDashboard.jsx` is updated, the worker must execute:
   ```bash
   cd frontend
   npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr
   cd ..
   ```
   before running the test suite!

---

## 5. Summary of Recommended Actions for Implementation

1. **Environment Variables**:
   - Add `VITE_GOOGLE_CLIENT_ID` to `.env` and `.env.example`.
   - Add `envDir: '../'` to `frontend/vite.config.js`.
2. **Data Stores & Seed Removal**:
   - Clear `SEED_USERS` in `frontend/src/data/userDatabase.js`.
   - Remove fake Ramesh Kumar default parameters from `authenticateByGoogle()`.
   - Remove hardcoded fallbacks from `registerUser()`.
3. **UI & Forms Refactoring**:
   - Clear pre-filled `'9876543210'` and `'2026'` states in `frontend/src/App.jsx`.
   - Remove demo user fallback in `handleCustomLogin()`.
   - Implement real Google Identity Services popup auth in `handleGoogleAuth()`.
   - Make all user card, header greeting, modal, and DPR references in `SetoDashboard.jsx` dynamic based on `currentUser`.
4. **Build & Test Verification**:
   - Build SSR bundle: `npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr`.
   - Run production client build: `npm run build`.
   - Run full test suite: `node --test frontend/test/*.js`.
