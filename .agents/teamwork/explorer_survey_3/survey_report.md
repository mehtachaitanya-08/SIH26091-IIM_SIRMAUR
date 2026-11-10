# Comprehensive Survey Report: Production Dashboard Implementation & Landing Page Synchronization

**Milestone**: Requirement 3 — Production Dashboard Implementation & Landing Page Synchronization  
**Agent**: Explorer Survey 3 (`f12ea057-54db-4eca-95da-3a269d95f79d`)  
**State Folder**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3`  
**Date**: 2026-11-10T11:30:00Z  

---

## 1. Executive Summary

This survey report provides the architectural analysis and technical roadmap for **Requirement 3: Production Dashboard Implementation & Landing Page Synchronization** for GraminAI (SIH 2026: SIH26091 — MoSJE / NSFDC).

Currently, the entire dashboard implementation resides in a single monolithic file: `frontend/src/components/SetoDashboard.jsx` (939 lines). It is imported directly into `frontend/src/App.jsx` (line 17) and rendered as **Scene 6** (lines 1120–1122) at the bottom of the 6-scene scroll narrative. There is no separate standalone dashboard view or dedicated dashboard route. When a user authenticates via the header login modal, clicking their user profile pill merely scrolls down to `#dashboard-section` via `scrollToTarget('#dashboard-section')`.

Consequently, `SetoDashboard.jsx` currently serves two divergent functions:
1. **The Landing Page Mockup Dashboard**: A scroll-reveal preview designed to replicate the SETO diffused minimal aesthetic for visitors.
2. **The Main Platform Dashboard**: The operational environment where users calculate NSFDC loan structures, simulate monsoon cash flow seasonality, calculate moneylender debt relief, and inspect Lead-Bank DPRs.

To meet Requirement 3 ("Build the production dashboard components matching the design established in SetoDashboard.jsx. Ensure all edits, components, and layout updates made to the main dashboard are reflected in the mockup dashboard on the landing page"), the codebase must transition from a monolithic file to a **Single Source of Truth (SSOT) modular architecture**. By decomposing the dashboard into reusable, mode-aware subcomponents (`DashboardShell`, `NavRail`, `UserCard`, `CenterWorkspace`, `SeasonalitySimulator`, `NsfdcAmortizer`, `DebtLiberation`, `LeadBankDpr`, `CommandBar`, `ScenariosSidebar`, `StarBlossom`), any styling, layout, or parameter update made to the main dashboard is automatically and synchronously reflected in the landing page mockup without code duplication.

---

## 2. Current Dashboard Architecture (`SetoDashboard.jsx`)

### 2.1 File Location & Mounting Hierarchy
- **File**: `frontend/src/components/SetoDashboard.jsx` (939 lines, 47,421 bytes).
- **Imported in**: `frontend/src/App.jsx:17` (`import SetoDashboard from './components/SetoDashboard';`).
- **Rendered in**: `frontend/src/App.jsx:1122` (`<SetoDashboard language={language} currentUser={currentUser} />`).
- **Pre-rendered SSR artifact**: `frontend/dist-ssr/SetoDashboard.js` (54,397 bytes).
- **Tested in**:
  - `frontend/test/challenger2_empirical_test.js` (lines 33, 41–46, 63–76)
  - `frontend/test/challenger_empirical_m1_verification.js` (lines 28, 41–46, 113–120, 170–174, 268–272, 278–281, 291–295)
  - `frontend/test/render_check.mjs` (lines 3–15)

### 2.2 The 3-Column SETO Layout Breakdown

`SetoDashboard.jsx` implements a 3-column responsive grid enclosed within an outer container:

```
+--------------------------------------------------------------------------------------------------+
| Section Header: "The Entrepreneur Workspace." (Instrument Serif / Cinzel)                        |
| Outer Enclosure: bg-[#E9ECEF] rounded-[32px] p-3 sm:p-6 border border-[#DEE2E6]                 |
|                                                                                                  |
| +-------------------------+-----------------------------------+--------------------------------+ |
| | COLUMN 1: LEFT NAV RAIL | COLUMN 2: CENTER WORKSPACE        | COLUMN 3: RIGHT SIDEBAR        | |
| | (lg:col-span-3)         | (lg:col-span-6)                   | (lg:col-span-3)                | |
| |                         |                                   |                                | |
| | - Brand: Logo + GraminAI| - Executive Console Header        | - Header: "Recent scenarios"   | |
| | - Nav Tabs (Home, Studio| - Quick Action Cards (Home tab)   | - Search Input Bar (dynamic)   | |
| |   Amortizer, Debt, DPR) | - Dynamic Viewport (Tab Routing): | - Scenario History List Cards: | |
| | - Notifications & Config|   * Seasonality Simulator         |   * D08 Mustard Oil Mill       | |
| | - Advisory Tools Tree   |   * NSFDC EQI Amortizer           |   * D18 Tailoring Workshop     | |
| |   (D08, D18, D15)       |   * Debt Liberation & Damdupat    |   * Sahukar Debt Relief        | |
| | - User Card (Avatar,    |   * 1-Page Lead-Bank DPR          | - "Create new simulation +"    | |
| |   Name, SC, Income,     | - Operational Command Bar         |   Action Button                | |
| |   Verification Badge)   |   (Input, chips, run button)      |                                | |
| +-------------------------+-----------------------------------+--------------------------------+ |
+--------------------------------------------------------------------------------------------------+
```

#### Detailed Breakdown by Column:

1. **Outer Shell & Container** (lines 183–235):
   - Outer wrapper: `<section id="dashboard-section" className="py-16 px-4 sm:px-8 max-w-[1500px] mx-auto font-sans">`
   - Heading: `<h2 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#111311] tracking-tight leading-[1.08]">`
   - Outer enclosure: `bg-[#E9ECEF] rounded-[32px] p-3 sm:p-6 border border-[#DEE2E6] shadow-sm`
   - 3-column grid container: `bg-white rounded-[24px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[760px] border border-[#E9ECEF]`

2. **Column 1: Left Navigation Rail** (`lg:col-span-3`, lines 239–393):
   - Background: `bg-[#F8F9FA] p-6 flex flex-col justify-between border-r border-[#E9ECEF]`.
   - Brand lockup: Image `/images/logo.png` (32x32) + Text `GraminAI` in `font-extrabold text-lg text-[#111311] font-sans-ui`.
   - Primary navigation list:
     - 5 tabs: `Home` (`home`), `Enterprise Studio` (`simulator`), `NSFDC Amortizer` (`amortizer`), `Debt Liberation` (`restructure`), `1-Page DPR` (`dpr`).
     - Active pill style: `bg-white text-[#111311] shadow-sm border border-[#E9ECEF] rounded-xl px-4 py-2.5 font-semibold text-xs`.
     - Inactive tab style: `text-[#686D65] hover:text-[#111311] hover:bg-white/60`.
     - 2 utility buttons: `Notifications` (shows badge `8`, onClick shows toast), `Settings` (onClick shows toast).
   - Collapsible Advisory Tools sub-tree:
     - Header: `Advisory Tools` with toggle `+`/`−` (`isAdvisoryOpen`).
     - Items: Iterates `PRESETS` (`D08`, `D18`, `D15`). Clicking an item sets `selectedDomainCode` and switches tab to `simulator`.
   - Bottom User Card:
     - Container: `bg-slate-100 rounded-2xl p-3.5 space-y-3 border border-slate-200 mt-6`.
     - User avatar: `/images/avatar_ramesh.jpg` with fallback to Unsplash photo.
     - User name: `{currentUser?.name || (language === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar')}`.
     - Subtitle: `SC · Income ≤ ₹5.00L`.
     - Verification button: `Statutory Verified` with emerald dot (`bg-[#0E7A53]`), opens `userModalOpen`.

3. **Column 2: Center Workspace** (`lg:col-span-6`, lines 398–821):
   - Background: `p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto`.
   - Executive console header:
     - Title: `Enterprise Advisory Console` (`text-xl sm:text-2xl font-bold text-[#111311] font-sans-ui`).
     - Subtitle: `Welcome, Ramesh! · MoSJE / NSFDC Concessional Credit Facility`.
     - Badge: `Sitapur District · UP-STP-008129` (`bg-emerald-50 text-[#0E7A53] border-emerald-200`).
   - Quick Action Cards (Home tab active):
     - 3 cards in grid (`sm:grid-cols-3 gap-4`):
       * `Simulate enterprise`: "Test 12-month seasonality & August lean-month cash flows."
       * `NSFDC amortizer`: "Calculate 11 or 26 quarterly instalments at 6.5% / 8.0%."
       * `Debt liberation`: "Refinance 3-senkda moneylender debt into bank credit."
   - Tab Viewport Modules:
     - `simulator` (lines 457–523): 12-month seasonal cash flow multipliers bar chart; highlights August lean dip (`m < 0.8 ? 'bg-orange-400' : 'bg-[#0E7A53]'`); displays Total Project Cost, Annual NOCF, and DSCR rating (`Solvency Rating: SAFE (DSCR 1.62x)`).
     - `amortizer` (lines 528–609): NSFDC equated quarterly repayment schedule table; displays Sanction Loan (90%), Promoter Margin (10%), and EQI; lists initial 6 quarters with Moratorium vs Amortizing badges.
     - `restructure` (lines 614–716): Mode B moneylender debt refinancing; interactive sliders for principal (range: ₹20k–₹300k, step: ₹10k), dialectal rate selector (2.5, 3.0, 4.0, 5.0 senkda), and active debt duration slider (range: 1–48 months, step: 1); renders dynamic cash relief (`monthlyCashRelief`) and Damdupat violation alert banner (`Usurious Loans Act 1918`).
     - `dpr` (lines 721–771): 1-Page Lead-Bank Detailed Project Report appraisal summary; displays enterprise name, beneficiary status, sanction loan, promoter equity, QR hash; includes "Download Bank-Sanction PDF" action button.
   - Bottom Command Bar (lines 773–819):
     - Input field for module keywords and queries (`cmd-input`).
     - Action chips: `Lead-Bank DPR`, `Quarterly EQI`, `Dialect Settings`.
     - `Run` button: Triggers keyword matching dispatch in `handleCommand()`.

4. **Column 3: Right Sidebar** (`lg:col-span-3`, lines 826–932):
   - Background: `bg-white p-6 border-l border-[#E9ECEF] flex flex-col justify-between`.
   - Header: `Recent scenarios` with `Refresh` button.
   - Search bar: Filter input bound to `searchQuery`; filters scenarios by name, subtitle, or ID; displays zero-match fallback when empty.
   - Scenario cards list:
     - Card 1: `D08 Mustard Oil Mill` (`₹6.80L Term Loan · 26 Qtrs`, `DSCR 1.62x`, `2h ago`).
     - Card 2: `D18 Tailoring Workshop` (`PM Vishwakarma 5% credit...`, `DSCR 2.14x`, image: `/images/scenario_tailoring.jpg`, `3h ago`).
     - Card 3: `Sahukar Debt Relief` (`₹1.20L @ 3 senkda → 6.5%`, `+₹2,460/mo relief`, `5h ago`).
     - Checkbox selection state tracked in `recentChecks`.
   - Bottom Action Button: `Create new simulation +` (`w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs`).

---

## 3. Mockup vs. Production Gap Analysis

The table below contrasts what is currently implemented in `SetoDashboard.jsx` against the requirements for production-grade behavior:

| Dimension | Current Implementation (`SetoDashboard.jsx`) | Static Mockup Characteristics | Production-Grade Requirements |
|---|---|---|---|
| **User Identity & Profile** | Accepts `currentUser` prop, but defaults to hardcoded "Ramesh Kumar" (lines 207, 378, 408, 747). Uses `/images/avatar_ramesh.jpg`. | Hardcoded profile data; certificate ID hardcoded as `UP-STP-008129`; district fixed to `Sitapur`. | Dynamically bind to authenticated Google OAuth profile (`currentUser.name`, `currentUser.email`, `currentUser.avatar`, `currentUser.district`). For unauthenticated visitors, display neutral/generic enterprise state without "Ramesh" hardcoding. |
| **Trade Dossier Selection** | Hardcoded `PRESETS` object with only 3 domains: `D08`, `D18`, `D15` (lines 14–45). | 21 of 24 empirical trade dossiers are inaccessible in the UI. | Import and render all 24 trade dossiers from `frontend/src/data/dossiers_db.json`. Provide searchable domain selector in Advisory Tools. |
| **Scenario Management** | Static `RECENT_SCENARIOS` array (lines 48–79) with 3 fixed items. | Scenarios are hardcoded in source; clicking "Refresh" or "Create new simulation" only fires toast notifications. | Persist scenarios in `localStorage` or backend database. Automatically append newly simulated or restructured scenarios to the user's history. |
| **Command Bar Execution** | `handleCommand()` performs local string matching for keywords (`stress`, `amort`, `debt`, `dpr`) and switches tabs. | Does not connect to any language model or natural language parser; only switches tabs and shows toasts. | Connect command bar to backend ML/AI service endpoint (`/api/advisory-query` or `/api/chat`) for intelligent query handling and parameter calibration. |
| **DPR PDF Export** | Static summary card with dummy SHA256 string (line 759). "Download Bank-Sanction PDF" button fires toast (line 764). | No actual PDF is generated or downloaded. | Client-side (e.g. `jspdf` / `html2canvas` / CSS print styles) or backend-generated 1-page Lead-Bank DPR PDF conforming to RBI Lead Bank Scheme appraisal format. |
| **Debt Restructuring Output** | Interactive mathematical model calculates monthly relief and Damdupat violation in real-time. | "Generate Legal Settlement Package ↗" button only fires a toast notification (line 710). | Generate downloadable legal notice document citing Section 3 of the Usurious Loans Act 1918 and Rule of Damdupat for bank or legal submission. |
| **Notifications & Settings** | Buttons display static badge "8" and fire local toast notifications (lines 310, 320). | Stubs without functionality. | Functional notification drawer displaying statutory deadline reminders (e.g., NSFDC subsidy cycles, bank camp dates) and configuration drawer. |
| **Network & Backend** | Zero network calls (enforced by `challenger2_empirical_test.js:41–46`). | Completely isolated client-only execution. | Connect to local backend and ML service endpoints via configurable API client service. |

---

## 4. Landing Page Mockup Dashboard vs. Main Dashboard

### 4.1 Structural Relationship in the Existing Codebase
In `frontend/src/App.jsx`, there is **no separate component or file** for the landing page mockup. Scene 6 directly mounts `SetoDashboard`:
```jsx
// frontend/src/App.jsx:1120-1122
{/* ============================================================== */}
{/* SCENE 6: SETO MINIMAL DASHBOARD MOCKUP CONTAINER              */}
{/* ============================================================== */}
<SetoDashboard language={language} currentUser={currentUser} />
```

### 4.2 Visual Divergence Between Original Prototype, Design Spec & `SetoDashboard.jsx`

An audit of `interactive_platform_prototype.html`, `frontend/src/index.css`, and commit history (`1d28406`) reveals key aesthetic differences:

1. **Outer Canvas Background**:
   - *Design Spec / Prototype* (`interactive_platform_prototype.html:126–130` & `index.css:128–132`):
     ```css
     .diffused-backdrop {
       background: radial-gradient(circle at 18% 22%, rgba(205, 220, 235, 0.65) 0%, transparent 45%),
                   radial-gradient(circle at 82% 80%, rgba(245, 185, 160, 0.5) 0%, transparent 45%),
                   #D4D8DD;
     }
     ```
   - *Current `SetoDashboard.jsx:231`*:
     Uses flat `bg-[#E9ECEF] rounded-[32px] p-3 sm:p-6 border border-[#DEE2E6] shadow-sm`.
   - *Analysis*: The subtle peach and slate radial gradient diffused canvas (`#D4D8DD`) is a core element of the SETO aesthetic specified in `ORIGINAL_REQUEST.md` line 36. It was replaced with flat grey during the Oxford pass.

2. **Top Center 4-Pointed Iridescent Star SVG Blossom**:
   - *Design Spec / Prototype* (`interactive_platform_prototype.html:624–636` & `index.css:148–165`):
     Pulsating 4-pointed iridescent star SVG (`iris-star-svg`) with radial gradient stops (`#FFE4D6`, `#E86043`, `#8B5CF6`, `#F59E0B`) and drop shadows.
   - *Current `SetoDashboard.jsx:401–417`*:
     Replaced with an executive rectangular console header (`Enterprise Advisory Console` / `Welcome, Ramesh!`).
   - *Analysis*: The iridescent star blossom is explicitly mandated in Acceptance Criteria (line 55: "center workspace with 4-pointed iridescent star blossom"). It can be seamlessly integrated above or within the executive console header without compromising professionalism.

3. **Neumorphic Elevation Tokens**:
   - `.soft-shadow`, `.soft-card-shadow`, and `.soft-inner-shadow` are defined in `index.css:135–145` and provide the soft tactile feel of the SETO design language. `SetoDashboard.jsx` currently uses basic Tailwind `shadow-sm` and `border-[#E9ECEF]`.

---

## 5. Component Modularization & Synchronization Plan

To satisfy the requirement that **"all edits, components, and layout updates made to the main dashboard are reflected in the mockup dashboard on the landing page"**, the system must avoid code duplication. 

### 5.1 Proposed Component Directory Architecture

```
frontend/src/components/
├── SetoDashboard.jsx                      <-- Public Facade / Synchronized Entrypoint
│
└── dashboard/                             <-- Atomic Dashboard Module Library
    ├── DashboardShell.jsx                 <-- 3-Column SETO grid, ambient diffused backdrop, layout tokens
    ├── NavRail.jsx                        <-- Left navigation rail (brand, tabs, advisory tools, user card)
    ├── UserCard.jsx                       <-- Dynamic user card with statutory verification badge
    ├── CenterWorkspace.jsx                <-- Center workspace container with tab routing & command bar
    │   ├── StarBlossom.jsx                <-- 4-pointed iridescent star SVG blossom
    │   ├── ExecutiveHeader.jsx            <-- Executive console title, user greeting, district badge
    │   ├── QuickActionCards.jsx           <-- 3 quick action cards (Simulate, Amortizer, Debt)
    │   ├── SeasonalitySimulatorView.jsx   <-- 12-month seasonality chart & August lean-trough stress test
    │   ├── NsfdcAmortizerView.jsx         <-- NSFDC quarterly repayment schedule table & EQI
    │   ├── DebtLiberationView.jsx         <-- Mode B moneylender refinancing & Damdupat alert
    │   ├── LeadBankDprView.jsx            <-- 1-page Lead-Bank DPR appraisal card & PDF download
    │   └── CommandBar.jsx                 <-- Operational command input bar, action chips, run button
    ├── ScenariosSidebar.jsx               <-- Right sidebar panel (search, scenario list, new simulation button)
    ├── StatutoryVerificationModal.jsx     <-- Beneficiary verification popup dialog
    └── ProductionDashboard.jsx            <-- Standalone / Authenticated full-screen dashboard wrapper
```

### 5.2 Single Source of Truth (SSOT) Architecture

Both the **Landing Page Mockup** (Scene 6) and the **Main Production Dashboard** (Full Workspace) will consume the **exact same UI subcomponents** from `frontend/src/components/dashboard/`:

```
                           +----------------------------------------+
                           |   Single Source of Truth Subcomponents |
                           |    (frontend/src/components/dashboard/) |
                           +----------------------------------------+
                                         /            \
                                        /              \
                                       v                v
            +---------------------------------+  +---------------------------------+
            | Landing Page Mockup (Scene 6)   |  | Main Production Dashboard       |
            | - mode="mockup"                 |  | - mode="production"             |
            | - Offline-safe, zero net calls  |  | - Connected to Backend & ML     |
            | - Pre-populated featured data   |  | - Dynamic Google OAuth profile  |
            | - Embedded in scroll container  |  | - Persistent scenario store     |
            | - Preserves test contracts      |  | - Real PDF generation & export  |
            +---------------------------------+  +---------------------------------+
```

### 5.3 Mode-Aware Parameterization Contract

Every subcomponent accepts a `mode` prop (`"mockup"` | `"production"`):

| Component | `mode="mockup"` Behavior | `mode="production"` Behavior |
|---|---|---|
| `DashboardShell` | Enclosed within landing page section padding and scroll anchor (`#dashboard-section`). | Full-bleed or standalone workspace viewport container. |
| `NavRail` | Renders presets and default user card. Tool switching operates in-memory. | Renders full 24-trade dossier taxonomy; binds user card to active Google OAuth session. |
| `UserCard` | Displays verified SC status with neutral/default name or active session name. | Displays authenticated Google user name, email, district, certificate ID. |
| `CenterWorkspace` | Includes 4-pointed iridescent star blossom and quick cards; operates on client-side engine. | Connects command bar to `/api/advisory-query`; executes ML model inference. |
| `CommandBar` | Dispatches client-side tab switching; provides immediate UI feedback via toasts. | Dispatches queries to backend NLP/ML advisory endpoints; auto-configures parameters. |
| `ScenariosSidebar` | Displays curated recent scenarios with live search filtering. | Persists scenarios to `localStorage` / backend database; allows creating/deleting records. |
| `LeadBankDprView` | Renders statutory appraisal card; preview mode. | Generates and triggers actual downloadable PDF file. |

---

## 6. Regression Risk Assessment & Test Harness Safeguards

### 6.1 Critical Test Constraints

Automated verification tests in `frontend/test/` enforce strict syntax and runtime assertions that MUST NOT be broken:

1. **Offline Independence Constraint** (`frontend/test/challenger2_empirical_test.js:41–46`):
   ```javascript
   assert.strictEqual(/\bfetch\s*\(/.test(setoCode), false, 'Found unexpected fetch() call in SetoDashboard.jsx');
   assert.strictEqual(/\baxios\b/.test(setoCode), false, 'Found unexpected axios import/call in SetoDashboard.jsx');
   assert.strictEqual(/\bXMLHttpRequest\b/.test(setoCode), false, 'Found unexpected XMLHttpRequest in SetoDashboard.jsx');
   assert.strictEqual(/\bWebSocket\b/.test(setoCode), false, 'Found unexpected WebSocket in SetoDashboard.jsx');
   ```
   *Impact*: `SetoDashboard.jsx` (and any file inspected as `setoCode`) must NOT directly call `fetch()`, `axios`, or `XMLHttpRequest`. Network calls for production functionality must be abstracted into dedicated API client modules (e.g. `frontend/src/services/apiClient.js`) that are imported conditionally or only in `ProductionDashboard.jsx`.

2. **Literal String Assertions in `SetoDashboard.jsx`** (`frontend/test/challenger_empirical_m1_verification.js`):
   The test suite inspects the raw file content (`fs.readFileSync(setoPath, 'utf8')`) for specific tokens:
   - `min={20000}`
   - `max={300000}`
   - `step={10000}`
   - `useState(120000)`
   - `min={1}`
   - `max={48}`
   - `step={1}`
   - `useState(36)`
   - `debtRefinanceData.damdupatViolated`
   - `Rule of Damdupat Triggered:`
   - `Usurious Loans Act 1918`
   - `exceeds principal`
   - `filteredScenarios.length === 0`
   - `No matching scenarios`
   - `Try searching "Mustard", "Tailoring", or "Debt"`
   - `const prototypeEmi = 1140` must NOT exist.
   *Impact*: When modularizing, these exact slider attributes, state initializers, and warning strings must remain intact within the component hierarchy, and `SetoDashboard.jsx` must either contain or directly re-export/compose them so that file-reading assertions pass without failure.

3. **SSR String Inclusions** (`frontend/test/challenger2_empirical_test.js:63–76` & `render_check.mjs`):
   ```javascript
   const html = renderToString(React.createElement(SetoDashboard));
   assert.ok(html.includes('The Entrepreneur Workspace'));
   assert.ok(html.includes('GraminAI'));
   assert.ok(html.includes('Simulate enterprise'));
   assert.ok(html.includes('NSFDC amortizer'));
   assert.ok(html.includes('Debt liberation'));
   assert.ok(html.includes('Recent scenarios'));
   assert.ok(html.includes('D08 Mustard Oil Mill'));
   assert.ok(html.includes('D18 Tailoring Workshop'));
   assert.ok(html.includes('Sahukar Debt Relief'));
   ```
   *Impact*: The SSR-rendered markup of `SetoDashboard` must continue to contain these exact strings when rendered in default (unauthenticated) mode.

4. **"Ramesh" Reference Conflict & Harmonization**:
   - `challenger2_empirical_test.js:67` asserts `assert.ok(html.includes('Welcome, Ramesh!'))`.
   - `challenger_empirical_m1_verification.js:294` asserts `assert.ok(html.includes('Ramesh Kumar'))`.
   - Requirement 2 mandates: "All demo toggles, mock data, and hardcoded 'Ramesh' profile references are eliminated from the codebase."
   - *Resolution Strategy*: When Google OAuth is authenticated, `currentUser.name` is displayed. In default/mockup mode, provide a configurable default user prop or harmonize the test suite alongside the Requirement 2 worker to assert dynamic user greeting (`Welcome, ${user.name}`) while ensuring existing tests pass.

---

## 7. Actionable Implementation Roadmap for Milestone 3

### Step 1: Create Modular Component Library (`frontend/src/components/dashboard/`)
Extract the atomic components from `SetoDashboard.jsx` into clean, focused files:
1. `DashboardShell.jsx`: Implements the 3-column grid container, `.diffused-backdrop` outer canvas, and responsive breakpoint rules.
2. `StarBlossom.jsx`: Implements the 4-pointed iridescent star SVG blossom with `@keyframes pulseStar` drop shadows.
3. `ExecutiveHeader.jsx`: Implements the console header, user welcome greeting, and district status badge.
4. `QuickActionCards.jsx`: Implements the 3 action cards for Home tab.
5. `SeasonalitySimulatorView.jsx`: Implements the 12-month seasonality chart and August lean trough stress test.
6. `NsfdcAmortizerView.jsx`: Implements the NSFDC EQI quarterly repayment table.
7. `DebtLiberationView.jsx`: Implements the Mode B moneylender refinancing sliders, Damdupat check, and legal alert.
8. `LeadBankDprView.jsx`: Implements the 1-page DPR appraisal card with QR hash and PDF download trigger.
9. `CommandBar.jsx`: Implements the command bar input, action chips, and run trigger.
10. `NavRail.jsx`: Implements the left navigation rail, active pill transitions, advisory tools tree, and user card.
11. `ScenariosSidebar.jsx`: Implements the right sidebar with search query filtering and scenario cards.
12. `StatutoryVerificationModal.jsx`: Implements the statutory beneficiary verification modal.

### Step 2: Refactor `SetoDashboard.jsx` as the Master Synchronized Facade
Compose `SetoDashboard.jsx` from the modular components above, passing `mode="mockup"` by default. Ensure all literal strings, bounds, and CSS classes required by `challenger_empirical_m1_verification.js` and `challenger2_empirical_test.js` remain fully satisfied.

### Step 3: Implement `ProductionDashboard.jsx` for Authenticated Workspace
Create `ProductionDashboard.jsx` configured with `mode="production"`:
- Binds to live authenticated user session from Google OAuth (`currentUser`).
- Connects to backend API services for live ML model inference and AI query processing.
- Supports all 24 trade dossiers from `frontend/src/data/dossiers_db.json`.
- Implements real PDF generation for the 1-page Lead-Bank DPR.
- Persists user scenarios dynamically to `localStorage` / backend.

### Step 4: Synchronize Routing in `App.jsx`
- Keep `SetoDashboard` mounted at `#dashboard-section` (Scene 6) for landing page visitors.
- When an authenticated user logs in or clicks their profile in the header, provide access to the production dashboard view (either seamlessly inline or via dedicated view toggle).

### Step 5: Verification & Build Validation
- Run `npm run build` in `frontend/` to verify zero bundling or syntax errors.
- Run `node --test test/*.js` in `frontend/` to verify that all 34 existing test cases pass.
- Update SSR bundle (`dist-ssr/SetoDashboard.js`) if needed to maintain complete SSR parity.

---

*Report prepared by Explorer Survey 3 — Ready for synthesis and Milestone 3 execution.*
