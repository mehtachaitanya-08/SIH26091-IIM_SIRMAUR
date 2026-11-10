# BRIEFING — 2026-11-10T11:28:00Z

## Mission
Catalog all demo modes, mock data, and hardcoded "Ramesh" profiles across frontend and data stores; investigate Google OAuth 2.0 implementation requirements and .env configuration.

## 🔒 My Identity
- Archetype: explorer
- Roles: read-only investigation, survey, synthesis
- Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
- State folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2
- Original parent: 564b07bb-4b3a-4fd8-b571-c22f592e0ce5
- Milestone: Survey: Production Google Authentication & Demo Mode Elimination

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT edit source code files outside of `.agents/teamwork/explorer_survey_2/`
- Every finding must have complete evidence chain (exact file paths, line numbers)
- Write survey report to `survey_report.md` and 5-component handoff report to `handoff.md`

## Current Parent
- Conversation ID: 564b07bb-4b3a-4fd8-b571-c22f592e0ce5
- Updated: 2026-11-10T11:28:00Z

## Investigation State
- **Explored paths**:
  - `frontend/src/data/userDatabase.js` (lines 10-39, 42, 58, 100-137, 150-155)
  - `frontend/src/App.jsx` (lines 87, 152, 301-302, 318-331, 345-361, 1120, 1192-1206)
  - `frontend/src/components/SetoDashboard.jsx` (lines 207-212, 365, 369-370, 378, 408, 413, 747)
  - `frontend/public/images/avatar_ramesh.jpg`
  - `frontend/test/challenger2_empirical_test.js` & `challenger_empirical_m1_verification.js`
  - `frontend/vite.config.js`, `frontend/package.json`, `.env`, `.env.example`
- **Key findings**:
  - Demo modes and hardcoded profiles identified across 4 main files.
  - Current Google login passes a hardcoded Ramesh Kumar object to `authenticateByGoogle()`; no OAuth flow exists.
  - Fallback in `handleCustomLogin()` silently logs users into demo mode on credential failure.
  - Native Google Identity Services (GIS) SDK (`window.google.accounts.oauth2.initTokenClient`) is recommended over `@react-oauth/google` due to React 19 compatibility and zero npm overhead.
  - `frontend/vite.config.js` requires `envDir: '../'` to access root `.env` variables (`VITE_GOOGLE_CLIENT_ID`).
  - Existing test suites explicitly assert `'Welcome, Ramesh!'` and `'Ramesh Kumar'`, requiring updated test expectations and SSR bundle re-compilation (`npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr`).
- **Unexplored areas**: None for Scope 2 (Survey complete).

## Key Decisions Made
- Completed survey report in `survey_report.md` and 5-component handoff in `handoff.md`.
- Recommended Native Google Identity Services (GIS) Token Client flow for production implementation.

## Artifact Index
- DISPATCH.md — Task assignment and instructions
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat and progress log
- survey_report.md — Detailed survey analysis report
- handoff.md — 5-component handoff report
