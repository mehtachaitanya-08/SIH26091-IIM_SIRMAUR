# Handoff Report — Explorer Survey 3: Dashboard Architecture & Landing Page Synchronization

**Milestone**: Requirement 3 — Production Dashboard Implementation & Landing Page Synchronization  
**Agent**: Explorer Survey 3 (`f12ea057-54db-4eca-95da-3a269d95f79d`)  
**State Folder**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3`  
**Date**: 2026-11-10T11:32:00Z  
**Type**: Hard Handoff (Investigation Complete)

---

## 1. Observation

### 1.1 Existing Dashboard Files & Mounting Points
- **Single Monolithic Dashboard File**: `frontend/src/components/SetoDashboard.jsx` (939 lines, 47,421 bytes). There are no other dashboard components in `frontend/src/components/`.
- **Mounting in Landing Page**: In `frontend/src/App.jsx:17`:
  ```javascript
  import SetoDashboard from './components/SetoDashboard';
  ```
  Rendered at lines 1120–1122 as Scene 6:
  ```jsx
  {/* ============================================================== */}
  {/* SCENE 6: SETO MINIMAL DASHBOARD MOCKUP CONTAINER              */}
  {/* ============================================================== */}
  <SetoDashboard language={language} currentUser={currentUser} />
  ```
- **Navigation / Routing**: `frontend/src/App.jsx:654–662`. There is no `react-router` installed. Clicking the authenticated user profile in the header triggers `scrollToTarget('#dashboard-section')`.

### 1.2 Dashboard 3-Column Layout & Structural Elements
- **Outer Shell**:
  - `SetoDashboard.jsx:183`: `<section id="dashboard-section" className="py-16 px-4 sm:px-8 max-w-[1500px] mx-auto font-sans">`
  - `SetoDashboard.jsx:231`: `<div className="bg-[#E9ECEF] rounded-[32px] p-3 sm:p-6 border border-[#DEE2E6] shadow-sm">`
  - `SetoDashboard.jsx:234`: `<div className="bg-white rounded-[24px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[760px] border border-[#E9ECEF]">`
- **Column 1: Left Nav Rail** (`lg:col-span-3`, lines 239–393):
  - Brand lockup: Image `/images/logo.png` + "UdyamSetuAI" (lines 243–250).
  - Navigation tabs: `home`, `simulator`, `amortizer`, `restructure`, `dpr` with active white pill (`bg-white text-[#111311] shadow-sm border border-[#E9ECEF]`).
  - Collapsible Advisory Tools: toggled by `isAdvisoryOpen`, iterates `PRESETS` (`D08`, `D18`, `D15`) (lines 337–362).
  - Bottom User Card: Avatar `/images/avatar_ramesh.jpg`, user name `{currentUser?.name || (language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar')}`, `SC · Income ≤ ₹5.00L`, button `Statutory Verified` opening `userModalOpen` (lines 365–391).
- **Column 2: Center Workspace** (`lg:col-span-6`, lines 398–821):
  - Executive Header: "Enterprise Advisory Console", "Welcome, Ramesh! · MoSJE / NSFDC Concessional Credit Facility", "Sitapur District · UP-STP-008129" (lines 401–417).
  - Star Blossom: The 4-pointed iridescent star SVG blossom (`iris-star-svg`) from `interactive_platform_prototype.html:624–636` is absent from `SetoDashboard.jsx` (removed in commit `1d28406`).
  - Home Quick Cards: "Simulate enterprise", "NSFDC amortizer", "Debt liberation" (lines 421–452).
  - Viewports:
    - `simulator`: 12-month seasonality chart with August dip (`m < 0.8 ? 'bg-orange-400' : 'bg-[#0E7A53]'`), project cost, NOCF, DSCR (lines 457–523).
    - `amortizer`: NSFDC EQI quarterly repayment table showing loan amount, margin, and initial 6 quarters (lines 528–609).
    - `restructure`: Mode B moneylender debt refinancing with sliders: `min={20000} max={300000} step={10000}`, dialectal rate selector, and duration `min={1} max={48} step={1}`, with Damdupat violation alert (lines 614–716).
    - `dpr`: 1-page DPR summary card and dummy "Download Bank-Sanction PDF" button (lines 721–771).
  - Command Bar: Input field, action chips (`Lead-Bank DPR`, `Quarterly EQI`, `Dialect Settings`), `Run` button (lines 773–819).
- **Column 3: Right Sidebar** (`lg:col-span-3`, lines 826–932):
  - "Recent scenarios" header with "Refresh" button (lines 829–837).
  - Dynamic search input bound to `searchQuery` filtering `RECENT_SCENARIOS` (lines 840–849).
  - Scenario cards: D08, D18 (with image `/images/scenario_tailoring.jpg`), Debt Relief (lines 858–919).
  - Action button: `Create new simulation +` (lines 922–931).

### 1.3 Static vs Production Gaps
- Hardcoded presets: Only 3 domains in `PRESETS` (`SetoDashboard.jsx:14–45`), while `frontend/src/data/dossiers_db.json` has all 24 domains (D01–D24).
- Hardcoded mock data: "Ramesh Kumar" is hardcoded in verification modal (line 207), user card fallback (line 378), header (line 408), and DPR (line 747).
- Command bar: Only executes local string matching in `handleCommand()` (lines 155–176); does not connect to backend/ML endpoints.
- DPR export: "Download Bank-Sanction PDF" only displays a toast notification (line 764); no PDF file is generated.
- Scenario persistence: `RECENT_SCENARIOS` is a static constant (lines 48–79); simulations cannot be saved or persisted.

### 1.4 Test Contracts & Constraints
- `cd frontend; node --test test/*.js` executes 34 tests across 8 suites, all passing in ~630ms.
- `challenger2_empirical_test.js:41–46` strictly asserts `/\bfetch\s*\(/`, `/\baxios\b/`, `/\bXMLHttpRequest\b/`, and `/\bWebSocket\b/` are FALSE in `SetoDashboard.jsx`.
- `challenger_empirical_m1_verification.js` strictly inspects `SetoDashboard.jsx` for exact tokens: `min={20000}`, `max={300000}`, `step={10000}`, `useState(120000)`, `min={1}`, `max={48}`, `step={1}`, `useState(36)`, `debtRefinanceData.damdupatViolated`, `Rule of Damdupat Triggered:`, `Usurious Loans Act 1918`, `exceeds principal`, `filteredScenarios.length === 0`, `No matching scenarios`, `Try searching "Mustard", "Tailoring", or "Debt"`.
- `challenger2_empirical_test.js:63–76` tests React SSR render of `dist-ssr/SetoDashboard.js`, asserting inclusion of `'Welcome, Ramesh!'`, `'UdyamSetuAI'`, `'Simulate enterprise'`, `'NSFDC amortizer'`, `'Debt liberation'`, `'Recent scenarios'`, `'D08 Mustard Oil Mill'`, `'D18 Tailoring Workshop'`, `'Sahukar Debt Relief'`.

---

## 2. Logic Chain

1. **Current State Diagnosis**:
   - `SetoDashboard.jsx` is currently doing double-duty as both the landing page scroll mockup (Scene 6) and the sole dashboard in the app (Observation 1.1).
   - Because `challenger2_empirical_test.js` enforces that `SetoDashboard.jsx` cannot have runtime fetch/axios calls (Observation 1.4), adding direct backend API calls to `SetoDashboard.jsx` would immediately fail existing tests.

2. **Synchronization Strategy**:
   - Creating two completely separate, independent dashboard implementations (one for mockup, one for production) would cause immediate layout, styling, and parameter drift.
   - Therefore, a Single Source of Truth (SSOT) modular architecture under `frontend/src/components/dashboard/` is required:
     - Atomic subcomponents (`DashboardShell`, `NavRail`, `UserCard`, `CenterWorkspace`, `SeasonalitySimulatorView`, `NsfdcAmortizerView`, `DebtLiberationView`, `LeadBankDprView`, `CommandBar`, `ScenariosSidebar`, `StarBlossom`, `StatutoryVerificationModal`).
     - `SetoDashboard.jsx` acts as the synchronized facade/mockup entrypoint (`mode="mockup"`), offline-safe, with zero network calls, satisfying all test harness regexes and string assertions.
     - `ProductionDashboard.jsx` wraps the exact same layout and subcomponents with `mode="production"`, binding to live Google OAuth credentials, backend API endpoints, persistent scenarios, and real PDF generation.
   - Any layout, CSS, or component update made to the subcomponents instantly applies to both the landing page mockup and the production dashboard.

3. **Visual Alignment with SETO Design Spec**:
   - The SETO aesthetic specified in `ORIGINAL_REQUEST.md` requires the diffused ambient canvas (`#D4D8DD` with radial gradients) and 4-pointed iridescent star SVG blossom (Observation 1.2).
   - Both elements already have pre-defined CSS rules in `frontend/src/index.css` (`.diffused-backdrop`, `.iris-star-svg`, `@keyframes pulseStar`).
   - Integrating `.diffused-backdrop` into `DashboardShell` and `<StarBlossom />` into `CenterWorkspace` restores 100% fidelity to the original SETO visual standard.

---

## 3. Caveats

1. **Test Suite Literal Token Binding**: `frontend/test/challenger_empirical_m1_verification.js` reads `SetoDashboard.jsx` directly using `fs.readFileSync`. When modularizing, the exact slider attributes (`min={20000}`, `useState(120000)`, `min={1}`, `useState(36)`, etc.) must remain either directly in `SetoDashboard.jsx` or in directly imported submodules re-exported so the test continues to pass.
2. **SSR Bundle Parity**: `frontend/dist-ssr/SetoDashboard.js` is imported by `challenger2_empirical_test.js` and `render_check.mjs`. Any changes to `SetoDashboard.jsx` require regenerating or updating `dist-ssr/SetoDashboard.js` to ensure SSR rendering tests pass.
3. **Google Auth Handshake**: The production dashboard will receive `currentUser` populated by Google OAuth (being surveyed by Explorer Survey 2). In mockup mode, `currentUser` defaults cleanly without failing.

---

## 4. Conclusion

The dashboard architecture can be cleanly refactored into a synchronized, production-grade system without breaking existing tests or diverging between the landing page mockup and main dashboard:
1. Decompose `SetoDashboard.jsx` into atomic, reusable subcomponents in `frontend/src/components/dashboard/`.
2. Keep `SetoDashboard.jsx` as the master synchronized offline-safe facade for Scene 6 (`mode="mockup"`).
3. Create `ProductionDashboard.jsx` (`mode="production"`) for authenticated users, wired to backend API services, real Google OAuth profiles, all 24 trade dossiers, persistent scenarios, and real PDF generation.
4. Restore the SETO diffused ambient canvas (`.diffused-backdrop`) and 4-pointed iridescent star blossom (`<StarBlossom />`).

---

## 5. Verification Method

To independently verify all findings and validate future implementation:

1. **Verify Existing Tests**:
   ```powershell
   cd frontend
   node --test test/*.js
   ```
   *Expected*: All 34 tests pass cleanly.

2. **Verify Production Build**:
   ```powershell
   cd frontend
   npm run build
   ```
   *Expected*: Vite builds to `dist/` with exit code 0.

3. **Verify SSR Render Check**:
   ```powershell
   cd frontend
   node test/render_check.mjs
   ```
   *Expected*: `RENDER SUCCESS! HTML byte length: > 5000`.

4. **Verify Offline Isolation Regex**:
   Check `frontend/src/components/SetoDashboard.jsx` for absence of `fetch`, `axios`, `XMLHttpRequest`:
   ```powershell
   Select-String -Path frontend\src\components\SetoDashboard.jsx -Pattern "fetch\(|axios|XMLHttpRequest"
   ```
   *Expected*: No matches found.

5. **Detailed Survey Report**:
   Inspect the complete survey report at:
   `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3\survey_report.md`
