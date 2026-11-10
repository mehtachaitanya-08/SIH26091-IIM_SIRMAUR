# Task Assignment — Worker (Milestone M3: Modular Dashboard & Synchronization)

## Objective
Implement Milestone M3: Modular Dashboard Architecture & Landing Page Synchronization as specified in `PROJECT.md`.
Modularize the dashboard into a Single Source of Truth (SSOT) subcomponent library under `frontend/src/components/dashboard/`, restore the SETO visual styling (`.diffused-backdrop` and `<StarBlossom />`), create `ProductionDashboard.jsx` connected to the backend API services, and maintain `SetoDashboard.jsx` as the synchronized Scene 6 mockup facade.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_dashboard_m3`

## Mandatory Input Files
Read before starting work:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3\survey_report.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3\handoff.md`

## File Ownership
You exclusively own and may create/modify:
- `frontend/src/components/dashboard/*` (all new subcomponents)
- `frontend/src/components/SetoDashboard.jsx`
- `frontend/src/components/ProductionDashboard.jsx`
- `frontend/src/App.jsx`
- `frontend/test/challenger2_empirical_test.js`
- `frontend/test/challenger_empirical_m1_verification.js`
- `frontend/dist-ssr/SetoDashboard.js`

## Specific Tasks
1. Build SSOT Modular Subcomponents in `frontend/src/components/dashboard/`:
   - `DashboardShell.jsx`: Ambient canvas with `.diffused-backdrop`, rounded 3-column container (`rounded-[28px]` or `rounded-[32px]`), border, soft shadow.
   - `NavRail.jsx`: Brand lockup (GraminAI + official logo), navigation tabs (`home`, `simulator`, `amortizer`, `restructure`, `dpr`) with active white pill, collapsible Advisory Tools, bottom `UserCard`.
   - `UserCard.jsx`: Dynamic user card with avatar, `currentUser?.name`, category, and statutory verification badge opening modal.
   - `CenterWorkspace.jsx`: Executive header, 4-pointed iridescent star blossom (`<StarBlossom />`), quick action cards, and viewport switching.
   - `StarBlossom.jsx`: Reusable SVG 4-pointed iridescent star blossom with pulse/glow keyframes.
   - `SeasonalitySimulatorView.jsx`: 12-month seasonality bar chart with August lean-month dip (`< 0.8` warning color), project cost, NOCF, dynamic DSCR.
   - `NsfdcAmortizerView.jsx`: NSFDC quarterly EQI table showing loan amount, margin money, and quarterly repayment schedule.
   - `DebtLiberationView.jsx`: Mode B moneylender debt refinancing with interactive sliders (`min={20000} max={300000} step={10000}`, duration `min={1} max={48} step={1}`), vernacular interest rates (3 senkda to 6 senkda), and Damdupat legal violation alert.
   - `LeadBankDprView.jsx`: 1-page Lead-Bank DPR summary card with bank-sanction PDF download button.
   - `CommandBar.jsx`: Floating bottom command bar with input field, mic icon, action chips, and Run button.
   - `ScenariosSidebar.jsx`: Right sidebar with "Recent scenarios", search input filtering scenarios, scenario cards (D08, D18, Debt Relief), and `Create new simulation +` button.
   - `StatutoryVerificationModal.jsx`: Dynamic modal showing beneficiary's verified SC status, certificate ID, and statutory scheme provisions.
2. Synchronize `SetoDashboard.jsx` (Mockup Facade):
   - Refactor `SetoDashboard.jsx` to render the modular subcomponents with `mode="mockup"`.
   - Ensure it remains offline-safe with zero network calls to satisfy `challenger2_empirical_test.js` isolation requirements.
   - Preserve all slider tokens (`min={20000}`, `max={300000}`, `step={10000}`, `useState(120000)`, `min={1}`, `max={48}`, `step={1}`, `useState(36)`, etc.) to satisfy `challenger_empirical_m1_verification.js`.
3. Implement `ProductionDashboard.jsx` (Production Mode):
   - Wraps the exact same layout and subcomponents with `mode="production"`.
   - Connects calculations to `frontend/src/services/api.js` (calling backend endpoints `/api/engine/nsfdc/calculate`, `/api/engine/mode-a/evaluate`, `/api/engine/mode-b/restructure`, `/api/dossiers`).
   - Automatically falls back to client-side `engine.js` if the backend is offline.
   - Connects live Google OAuth `currentUser` and persistent scenarios.
4. Landing Page Synchronization:
   - Ensure Scene 6 on the landing page in `App.jsx` continues to render `SetoDashboard.jsx` with full visual parity to `ProductionDashboard.jsx`.
   - When an authenticated user clicks their profile in the persistent header, allow viewing the live production dashboard or navigating seamlessly to `#dashboard-section`.
5. SSR Rebuild & Verification:
   - Rebuild SSR bundle: `cd frontend; npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr`.
   - Verify `git grep -i "ramesh" frontend/src/` returns 0 matches.
   - Run all frontend tests: `cd frontend; node --test test/*.js` (must pass 100%).
   - Run all backend tests: `python -m unittest discover tests/` (must pass 100%).
   - Run production build: `cd frontend; npm run build` (must complete cleanly with exit code 0).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverables
Write your self-contained handoff report to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_dashboard_m3\handoff.md`
Report must document commands run, exact output, files created/modified, and verification results.


## 2026-11-10T13:09:25Z
You are a versatile implementation worker.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_dashboard_m3
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_dashboard_m3\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read the survey findings at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3\survey_report.md
Read the handoff report at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement the modular SSOT dashboard components under frontend/src/components/dashboard/, restore .diffused-backdrop and <StarBlossom />, create ProductionDashboard.jsx with api.js connectivity, refactor SetoDashboard.jsx as synchronized facade, rebuild SSR bundle, and verify builds and tests.
Write your self-contained handoff report to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_dashboard_m3\handoff.md
When finished, send a message to the caller with summary and artifact paths.
