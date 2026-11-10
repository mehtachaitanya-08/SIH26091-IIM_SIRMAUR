# Task Assignment — Worker (Milestone M2: Google Authentication & Demo Elimination)

## Objective
Implement Milestone M2: Google Authentication & Demo Elimination as specified in `PROJECT.md`.
Eliminate all demo modes, mock data, and hardcoded "Ramesh" profiles across the frontend and data stores. Implement real Google OAuth 2.0 login loading credentials via environment configuration (.env).

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2`

## Mandatory Input Files
Read before starting work:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\survey_report.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\handoff.md`

## File Ownership
You exclusively own and may create/modify:
- `frontend/src/services/googleAuth.js`
- `frontend/src/data/userDatabase.js`
- `frontend/src/App.jsx`
- `frontend/src/components/SetoDashboard.jsx`
- `.env` and `.env.example`
- `frontend/test/challenger2_empirical_test.js`
- `frontend/test/challenger_empirical_m1_verification.js`
- `frontend/dist-ssr/SetoDashboard.js`

## Specific Tasks
1. Implement `frontend/src/services/googleAuth.js`:
   - Implement real Google OAuth 2.0 via Google Identity Services (GIS) Token Client (`window.google.accounts.oauth2.initTokenClient`).
   - Load client ID from `import.meta.env.VITE_GOOGLE_CLIENT_ID`.
   - Provide `initGoogleAuth(onSuccess, onError)` and `triggerGoogleLogin()`.
   - Fetch real user profile from `https://www.googleapis.com/oauth2/v3/userinfo` or token claims on success.
   - If client ID is missing or offline, display clear, non-crashing error feedback. DO NOT fall back to fake profiles.
2. Update `frontend/src/data/userDatabase.js`:
   - Eliminate `SEED_USERS` containing hardcoded "Ramesh Kumar" and fake profiles.
   - In `authenticateByGoogle(googleProfile)`: Require genuine `googleProfile`. Reject null/undefined profiles with error.
   - Remove demo fallbacks in registration and custom login.
3. Update `frontend/src/App.jsx`:
   - Clear pre-filled login inputs (remove default '9876543210' and '2026').
   - Connect Google Sign-In button to `triggerGoogleLogin()`.
   - Remove demo fallback user in `handleCustomLogin()` (return error if unregistered).
   - Ensure dynamic user state propagation to all views.
4. Update `frontend/src/components/SetoDashboard.jsx`:
   - Replace hardcoded "Ramesh Kumar", "Welcome, Ramesh!", and "UP-STP-008129" with dynamic `currentUser` fields.
   - Dynamically bind user card, header greeting, verification modal, and DPR beneficiary to `currentUser`.
5. Update Environment Files:
   - Ensure `VITE_GOOGLE_CLIENT_ID` is defined in root `.env` and `.env.example`.
6. Test Alignment & SSR Rebuild:
   - Ensure test suites (`challenger2_empirical_test.js` and `challenger_empirical_m1_verification.js`) test dynamic greeting or pass user fixtures.
   - Rebuild SSR bundle: `cd frontend; npx vite build --ssr src/components/SetoDashboard.jsx --outDir dist-ssr`.
   - Verify `git grep -i "ramesh" frontend/src/` returns zero hardcoded active personas.
   - Verify `npm run build` passes cleanly.
   - Verify all tests pass (`cd frontend; node --test test/*.js`).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverables
Write your self-contained handoff report to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\handoff.md`
Report must document commands run, exact output, files created/modified, and verification results.


## 2026-11-10T12:32:39Z
[Message] sender=564b07bb-4b3a-4fd8-b571-c22f592e0ce5 priority=MESSAGE_PRIORITY_HIGH
You are a versatile implementation worker.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read the survey findings at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\survey_report.md
Read the handoff report at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Google Authentication via GIS, eliminate all demo modes, mock data, and hardcoded 'Ramesh' profiles across frontend and data stores, align test fixtures, rebuild SSR bundle, and verify builds and tests.
Write your self-contained handoff report to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\handoff.md
When finished, send a message to the caller with summary and artifact paths.
