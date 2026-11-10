# Task Assignment — Worker (Milestone M1: Backend REST Server & API Integration)

## Objective
Implement Milestone M1: Backend REST Server & API Integration as specified in `PROJECT.md`.
Expose Python calculation engines via a zero-dependency HTTP server, configure Vite proxy, and implement the frontend API client.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1`

## Mandatory Input Files
Read before starting work:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_1\survey_report.md`

## File Ownership
You exclusively own and may create/modify:
- `engine/server.py`
- `tests/test_api_server.py`
- `frontend/vite.config.js`
- `frontend/src/services/api.js`
- `scripts/run_backend.py`

Do NOT modify existing calculation engines (`engine/nsfdc_calculator.py`, `engine/multi_archetype_financial_engine.py`) or existing frontend UI components in this milestone.

## Specific Tasks
1. Implement `engine/server.py`:
   - Use Python's standard library `http.server.ThreadingHTTPServer` and `http.server.BaseHTTPRequestHandler` (zero external dependencies).
   - Implement JSON REST endpoints matching Interface Contracts in `PROJECT.md`:
     * `GET /api/health`: returns `{ status: "ok", version: "1.0.0", timestamp: ... }`
     * `POST /api/engine/nsfdc/calculate`: reads JSON `{ projectCost, familyIncome }`, calls `engine/nsfdc_calculator.py`, returns calculation.
     * `POST /api/engine/mode-a/evaluate`: reads JSON `{ archetypeKey, scale }`, calls `engine/multi_archetype_financial_engine.py`, returns evaluation.
     * `POST /api/engine/mode-b/restructure`: reads JSON `{ principal, monthlyRatePct, durationMonths }`, calls restructuring engine, returns result.
     * `GET /api/dossiers`: returns all 24 dossiers from `data/dossiers_db.json`.
     * `GET /api/dossiers/<code_or_query>`: returns specific dossier by code.
   - Support CORS headers (Access-Control-Allow-Origin: *, Access-Control-Allow-Methods: GET, POST, OPTIONS, Access-Control-Allow-Headers: Content-Type).
   - Handle OPTIONS preflight requests cleanly.
2. Implement `tests/test_api_server.py`:
   - Unit tests using Python's `unittest` that launch the server in a daemon thread, test all endpoints (`/api/health`, `/api/engine/nsfdc/calculate`, `/api/engine/mode-a/evaluate`, `/api/engine/mode-b/restructure`, `/api/dossiers`), assert status 200, valid JSON schemas, and mathematical correctness.
3. Update `frontend/vite.config.js`:
   - Add proxy configuration routing `/api` to `http://127.0.0.1:8000`.
   - Add `envDir: '../'` so Vite resolves environment variables from root `.env`.
4. Implement `frontend/src/services/api.js`:
   - Export asynchronous client functions: `fetchHealth()`, `calculateNSFDCLoan(projectCost, familyIncome)`, `evaluateModeA(archetypeKey, scale)`, `restructureDebt(principal, monthlyRatePct, durationMonths)`, `fetchDossiers()`, `fetchDossier(code)`.
   - Implement graceful offline fallback to `frontend/src/engine.js` if the backend request fails (network error / offline), ensuring client-side resilience.
5. Verification:
   - Run `python -m unittest tests/test_api_server.py` and confirm 100% pass.
   - Run `npm run build` in `frontend/` and confirm clean exit code 0.
   - Run existing frontend tests: `cd frontend; node --test test/*.js`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverables
Write your self-contained handoff report to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\handoff.md`
Report must document commands run, exact output, files created/modified, and verification results.


## 2026-11-10T11:39:22Z
Received dispatch from 564b07bb-4b3a-4fd8-b571-c22f592e0ce5:
You are a versatile implementation worker.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read the survey findings at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_1\survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement engine/server.py, tests/test_api_server.py, frontend/vite.config.js, frontend/src/services/api.js, and scripts/run_backend.py.
Run tests and build to verify.
Write your self-contained handoff report to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\handoff.md
When finished, send a message to the caller with summary and artifact paths.
