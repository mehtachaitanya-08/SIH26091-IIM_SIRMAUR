# Forensic Audit Task Assignment — Auditor (Milestone M4: Final System Audit)

## Objective
Perform independent forensic integrity auditing of the entire codebase and repository state for the GraminAI production dashboard delivery.
Verify zero cheating, zero facade implementations, zero hardcoded test strings, genuine Google Identity Services integration, genuine backend REST service, and complete synchronization between the production dashboard and Scene 6 mockup.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\auditor_e2e_m4`

## Mandatory Input Files
Read before starting audit:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\orchestrator_dashboard\GATE_STATUS.md`

## Audit Verifications
1. Git Upstream Integrity:
   - Verify `git status` and commit history confirm alignment with `origin/main`.
2. Mock / Demo Elimination Forensics:
   - Execute static grep across `frontend/src/` for any remnants of "Ramesh", "9876543210", "UP-STP-008129", or fake demo profiles.
   - Inspect `frontend/src/data/userDatabase.js` — confirm `SEED_USERS` is empty array (`[]`) and zero default credentials exist.
   - Inspect `frontend/src/App.jsx` — confirm login inputs are blank by default and no bypass switch exists.
3. Authentication Authenticity:
   - Inspect `frontend/src/services/googleAuth.js` — confirm real Google Identity Services (GIS) token client initialization (`google.accounts.oauth2.initTokenClient`), proper `.env` variable handling (`VITE_GOOGLE_CLIENT_ID`), and error callback handling.
4. Backend REST Architecture:
   - Inspect `engine/server.py` — verify genuine `ThreadingHTTPServer` implementation invoking real calculation functions (`calculate_nsfdc_schedule`, `evaluate_archetype_economy`, etc.) without dummy or hardcoded responses.
   - Inspect `frontend/src/services/api.js` — verify proper fetch calls to `/api/...` and deterministic client engine fallback.
5. Dashboard Synchronization & Code Structure:
   - Inspect `frontend/src/components/dashboard/` — verify all 12 modular subcomponents (`DashboardShell.jsx`, `StarBlossom.jsx`, `NavRail.jsx`, `CenterWorkspace.jsx`, `ScenariosSidebar.jsx`, `CommandBar.jsx`, etc.) are genuine Single Source of Truth components.
   - Inspect `frontend/src/components/SetoDashboard.jsx` and `frontend/src/components/ProductionDashboard.jsx` — confirm both import and use the shared subcomponents, maintaining visual and functional synchronization.
6. Execution & Build Verification:
   - Run `python -m unittest discover tests/` and verify all tests pass.
   - Run `cd frontend; node --test test/*.js` and verify all tests pass.
   - Run `cd frontend; npm run build` and verify clean build.

## Deliverables
Write your forensic audit report and verdict (`CLEAN` or `INTEGRITY VIOLATION`) to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\auditor_e2e_m4\handoff.md`
Send a completion message to the orchestrator with your verdict.

