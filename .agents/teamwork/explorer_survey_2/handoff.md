# Handoff Report — Explorer Survey 2: Authentication & Demo Elimination

**Milestone**: Requirement 2 — Production Google Authentication & Demo Mode Elimination  
**Agent**: Explorer Survey 2 (`3bb8b3bf-4bde-4cf8-820b-fa7cef0cc9fe`)  
**State Folder**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2`  
**Date**: 2026-11-10T11:27:00Z  

---

## 1. Observation

### 1.1. Hardcoded Demo & Ramesh Profile Occurrences
1. `frontend/src/data/userDatabase.js`:
   - Lines 10–39: `const SEED_USERS = [{ id: 'UP-STP-008129', name: 'Ramesh Kumar', email: 'ramesh.kumar@udyamsetuai.org', phone: '9876543210', pin: '2026', ... }, { id: 'UP-STP-004312', name: 'Sunita Devi', ... }];`
   - Line 42: `let inMemoryUsers = [...SEED_USERS];`
   - Line 58: `window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));`
   - Lines 100–105:
     ```javascript
     export function authenticateByGoogle(googleProfile = null) {
       const profile = googleProfile || {
         name: 'Ramesh Kumar',
         email: 'ramesh.kumar.sc@gmail.com',
         avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIqK_demo=s96-c'
       };
     ```
   - Line 111: `// Auto-register new Google user with default verified SC status for platform demo`
   - Line 117: `phone: profile.phone || '9876543210',`
   - Lines 119–121: `trade: 'D08 Mustard & Edible Oil Expeller Mill', district: 'Sitapur District, UP', income: '≤ ₹5,00,000'`
   - Lines 150–155: `phone: phone?.trim() || '9876543210', pin: pin?.trim() || '2026', trade: trade || 'D08...', district: 'Sitapur District, UP', income: '≤ ₹5,00,000'`

2. `frontend/src/App.jsx`:
   - Line 87: `namePlaceholder: 'e.g. Ramesh Kumar',`
   - Line 152: `namePlaceholder: 'उदा. रमेश कुमार',`
   - Lines 301–302:
     ```javascript
     const [loginPhone, setLoginPhone] = useState('9876543210');
     const [loginPin, setLoginPin] = useState('2026');
     ```
   - Lines 318–331:
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
   - Lines 345–361:
     ```javascript
     // In case user entered unregistered phone, authenticate as demo verified user
     const fallbackUser = {
       name: loginPhone === '9876543210' 
         ? (language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar')
         : (language === 'hi' ? 'पंजीकृत उद्यमी' : 'Registered Entrepreneur'),
       category: 'Scheduled Caste (SC)',
       trade: 'D08 Mustard & Edible Oil Expeller Mill',
       phone: loginPhone || '9876543210',
       id: 'UP-STP-008129',
       income: '≤ ₹5,00,000'
     };
     setCurrentUser(fallbackUser);
     ```

3. `frontend/src/components/SetoDashboard.jsx`:
   - Lines 207–211: In User Verification Modal:
     `<p><strong className="text-slate-900">Name:</strong> Ramesh Kumar</p>`
     `<p><strong className="text-slate-900">Statutory Certificate ID:</strong> MoSJE/NSFDC/2026/UP-STP-008129</p>`
   - Line 365: `{/* Bottom User Card: Ramesh Kumar, SC · Income ≤ ₹5.00L, Statutory Verified */}`
   - Lines 369–370: `<img src="/images/avatar_ramesh.jpg" alt="Ramesh Kumar" ... />`
   - Line 378: `{currentUser?.name || (language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar')}`
   - Line 408: `<span className="font-semibold text-[#111311]">Welcome, Ramesh!</span> {/* oxfords-ignore: required by challenger2_empirical_test contract */} · MoSJE / NSFDC Concessional Credit Facility`
   - Line 413: `Sitapur District · UP-STP-008129`
   - Line 747: `<span className="font-bold text-[#111311]">Ramesh Kumar (SC · Verified)</span>`

4. Public Images on Disk:
   - `frontend/public/images/avatar_ramesh.jpg` (31,984 bytes)

5. Environment Variable Files:
   - `.env` and `.env.example` exist at project root (`c:\Users\LENOVO\Desktop\IPL 2 Project Research\`).
   - Neither file contains `VITE_GOOGLE_CLIENT_ID`.
   - `frontend/vite.config.js` does NOT specify `envDir: '../'`, meaning Vite does not read the parent `.env` unless configured or duplicated in `frontend/`.

6. Dependencies & Build:
   - `frontend/package.json` specifies `"react": "^19.0.0"`.
   - `npm run build` succeeds cleanly in 12.55s.
   - All 18 tests in `frontend/test/challenger_empirical_m1_verification.js` and all 16 tests in `frontend/test/challenger2_empirical_test.js` pass.
   - `challenger2_empirical_test.js:67` asserts `assert.ok(html.includes('Welcome, Ramesh!'));`.
   - `challenger_empirical_m1_verification.js:294` asserts `assert.ok(html.includes('Ramesh Kumar'));`.

---

## 2. Logic Chain

1. **Mock Authentication Diagnosis** (from Observation 1.1, 1.2):
   - When a user clicks "Continue with Google" in the modal, `handleGoogleAuth()` in `App.jsx` bypasses any external OAuth service and immediately calls `authenticateByGoogle()` with hardcoded parameters `{ name: 'Ramesh Kumar', email: 'ramesh.kumar.sc@gmail.com' }`.
   - In `userDatabase.js`, `authenticateByGoogle()` defaults to this fake profile and seeds `localStorage` with a mock user.
   - Additionally, entering any arbitrary unregistered phone in the login form triggers the fallback in `handleCustomLogin()` (lines 345–361), logging the user in as "Ramesh Kumar" (`UP-STP-008129`).
   - Hence, authentication is purely simulated with mock data.

2. **Dashboard Isolation & Hardcoded Rendering** (from Observation 1.3):
   - Although `App.jsx` passes `currentUser` to `SetoDashboard.jsx`, the component only uses `currentUser?.name` in one place (line 378).
   - In three other critical views (the Beneficiary Verification modal, the center workspace header greeting, and the 1-Page Lead-Bank DPR), the name is hardcoded to "Ramesh Kumar" or "Welcome, Ramesh!".
   - Therefore, even if a user logs in via a real authentication provider, the dashboard continues displaying the hardcoded Ramesh Kumar persona.

3. **Google OAuth 2.0 Integration Pathway** (from Observation 1.5, 1.6):
   - Because the frontend runs on React 19 (`^19.0.0`), utilizing `@react-oauth/google` poses dependency conflict risks and requires external npm downloads that fail in restricted offline environments.
   - Conversely, Google Identity Services (GIS) via `https://accounts.google.com/gsi/client` operates via standard browser APIs (`window.google.accounts.oauth2.initTokenClient`), requiring zero npm packages, zero bundle overhead, and seamlessly supports custom UI buttons.
   - To make the client ID accessible to Vite in the browser, `VITE_GOOGLE_CLIENT_ID` must be configured, and `frontend/vite.config.js` must be given `envDir: '../'` to access the root `.env` file.

4. **Test Suite Compatibility Requirement** (from Observation 1.6):
   - Existing tests (`challenger2_empirical_test.js` and `challenger_empirical_m1_verification.js`) import the pre-bundled SSR artifact `frontend/dist-ssr/SetoDashboard.js` and explicitly test for the strings `'Welcome, Ramesh!'` and `'Ramesh Kumar'` (which were required by Milestone 1 specifications).
   - If a worker removes these strings without updating the test expectations or providing proper fixture props, the regression test suite will fail.
   - Furthermore, whenever `SetoDashboard.jsx` is edited, `npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr` must be re-run so that `dist-ssr` matches the source code.

---

## 3. Caveats

1. **Live Google Cloud Credentials**:
   - In an offline development or test environment without an active internet connection to `accounts.google.com`, live OAuth popups cannot communicate with Google's authorization servers. The application must display informative, non-crashing error feedback (e.g. *"Google Authentication is not configured or offline"*) rather than silently falling back to mock data.
2. **Preservation of Non-Frontend Research Dossiers**:
   - Files such as `WhatsApp_Flow_and_1Page_DPR_Wireframe.md`, `generate_1page_dpr_pdf.py`, and `build_sih_master_report_docx.py` contain references to persona "Rameshwar Lal" in historical case study documentation. These are narrative research dossiers and should not be modified, as Requirement 2 specifies eliminating demo modes and mock profiles across frontend and active data stores.
3. **Local Asset Preservation**:
   - `avatar_ramesh.jpg` in `frontend/public/images/` should remain present on disk to avoid breaking `challenger2_empirical_test.js:57` file-existence assertions, while `SetoDashboard.jsx` is updated to prioritize `currentUser?.avatar`.

---

## 4. Conclusion

1. **Authentication Refactoring**:
   - Implement real Google OAuth 2.0 using the **Google Identity Services (GIS) Token Client** (`window.google.accounts.oauth2.initTokenClient`).
   - Read credentials from `import.meta.env.VITE_GOOGLE_CLIENT_ID`.
   - Update `frontend/vite.config.js` with `envDir: '../'` to load the root `.env`.
   - Add `VITE_GOOGLE_CLIENT_ID` to `.env` and `.env.example`.
2. **Demo & Mock Elimination**:
   - Remove `SEED_USERS` in `userDatabase.js`.
   - Remove default fake profile arguments in `authenticateByGoogle()`.
   - Remove demo user fallback in `handleCustomLogin()`.
   - Clear pre-filled input states in `App.jsx`.
   - Make user avatar, name, certificate ID, header greeting, and DPR beneficiary fields dynamically read from `currentUser`.
3. **Test Suite Alignment**:
   - Update `challenger2_empirical_test.js` and `challenger_empirical_m1_verification.js` to assert dynamic greetings or provide user fixtures during SSR testing.
   - Rebuild SSR bundle via `npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr` after modifications.

---

## 5. Verification Method

To independently verify the findings and any future implementation:

1. **Search Verification for Eliminated Identifiers**:
   ```powershell
   git grep -n -i "ramesh" frontend/src/
   git grep -n -i "9876543210" frontend/src/
   git grep -n -i "UP-STP-008129" frontend/src/
   ```
   *Expected outcome after fix*: Zero matches in active UI and logic.

2. **Frontend Production Build**:
   ```powershell
   cd frontend
   npm run build
   ```
   *Expected outcome*: Exit code 0, clean bundling.

3. **SSR Bundle & Test Suite Execution**:
   ```powershell
   cd frontend
   npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr
   node --test test/challenger2_empirical_test.js
   node --test test/challenger_empirical_m1_verification.js
   ```
   *Expected outcome*: 100% passing tests (zero failures).
