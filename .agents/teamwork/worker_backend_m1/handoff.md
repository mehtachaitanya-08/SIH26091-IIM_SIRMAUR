# Handoff Report: Milestone M1 — Backend REST Server & API Integration

**Author:** Worker Backend M1 (`worker_backend_m1`)  
**Date:** 2026-11-10T11:58:00Z  
**Status:** COMPLETED  
**Target Milestone:** Milestone M1 (Backend REST Server & API Integration)

---

## 1. Observation

Direct observations from codebase inspection, tool executions, and test runs:

1. **Existing Backend Computational Engines**:
   - `engine/nsfdc_calculator.py` (533 lines): Concessional Micro Credit Finance (MCF ≤ ₹1.40L @ 6.5%, capped at ₹1.25L, 11 quarterly instalments) and Term Loan Scheme (up to ₹50.00L @ 8.0%, capped at ₹45.00L, 26 quarterly instalments).
   - `engine/multi_archetype_financial_engine.py` (483 lines): `IncubationEngine.evaluate_project()` for 6 archetypes (PMEGP/PMFME subsidies, seasonal DSCR); `RestructuringEngine.evaluate_portfolio()` for informal moneylender debt refinancing and Damdupat legal violation detection.
   - `data/dossiers_db.json` (7,937 lines): 24 empirical Scheduled Caste micro-enterprise dossiers (`D01` to `D24`).
   - Prior test baseline: `python -m unittest discover tests` executed 18 tests in 0.003s with 100% pass rate.

2. **Network Environment & Windows Sandbox Constraint**:
   - The environment provides Python 3.12 with standard library modules.
   - Outbound network calls via raw TCP socket `connect()` to arbitrary localhost ports inside the sandbox return:
     `PermissionError: [WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions`
   - However, server sockets can bind and listen cleanly on `127.0.0.1:8000` via `socket.bind(('127.0.0.1', 8000))` and `socket.listen(1)`.
   - Therefore, a dual-mode test harness was constructed in `tests/test_api_server.py` that starts `ThreadingHTTPServer` on a background daemon thread, checks socket connectivity, and uses standard HTTP/1.1 wire protocol execution into `UdyamSetuAIRequestHandler` for sandbox test automation.

3. **Backend Service Implementation (`engine/server.py`)**:
   - Zero external dependencies: Uses Python standard library `http.server.ThreadingHTTPServer` and `BaseHTTPRequestHandler`.
   - Endpoints implemented:
     * `GET /api/health` & `GET /health`: Returns `{ status: "ok", version: "1.0.0", timestamp, engines: { ... } }`.
     * `POST /api/engine/nsfdc/calculate`: Accepts `{ projectCost, familyIncome, isSc, promoterEquityOffered }`, evaluates statutory eligibility, structures dual-tier loan, and produces quarterly amortization schedule.
     * `POST /api/engine/mode-a/evaluate`: Accepts `{ archetypeKey, scale, state, capexOverride, monthlyOpexOverride, monthlyRevenueOverride }`, executes `IncubationEngine.evaluate_project()`, and returns CapEx, OpEx, revenue, 12-month seasonal DSCR, and PMEGP/PMFME subsidies.
     * `POST /api/engine/mode-b/restructure`: Accepts `{ principal, monthlyRatePct, durationMonths, householdMonthlyIncome, refinancingPathway }`, executes `RestructuringEngine.evaluate_portfolio()`, evaluates Damdupat legal rule (`paidToDate >= principal`), and calculates monthly cash flow savings.
     * `GET /api/dossiers`: Returns `{ count: 24, dossiers: [ ... ], metadata }`.
     * `GET /api/dossiers/:code`: Returns specific dossier by case-insensitive code (`D01`..`D24`) with top-level `title`, `capex`, `opex`.
     * CORS headers: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`.
     * OPTIONS preflight: Responds with HTTP 204 and CORS headers.

4. **Backend Runner Script (`scripts/run_backend.py`)**:
   - CLI script accepting `--host` (default `127.0.0.1`) and `--port` (default `8000`), launching `engine.server.run_server()`.

5. **Frontend Vite Configuration (`frontend/vite.config.js`)**:
   - Added `envDir: '../'` to allow Vite to resolve environment variables from root `.env`.
   - Added proxy configuration routing `/api` requests to `process.env.VITE_API_BACKEND_URL || 'http://127.0.0.1:8000'`.

6. **Frontend API Client Service (`frontend/src/services/api.js`)**:
   - Exports 6 asynchronous client functions:
     * `fetchHealth()`
     * `calculateNSFDCLoan(projectCost, familyIncome, options)`
     * `evaluateModeA(archetypeKey, scale, options)`
     * `restructureDebt(principal, monthlyRatePct, durationMonths, options)`
     * `fetchDossiers()`
     * `fetchDossier(code)`
   - Graceful offline fallback: If `/api` network requests fail, functions fall back to client-side evaluation using `frontend/src/engine.js` (`calculateNSFDCLoanStructure`, `generateNSFDCAmortizationSchedule`, `checkNSFDCEligibility`, `evaluateIncubation`, `evaluateRestructuring`) and `frontend/src/data/dossiers_db.json`.

7. **Verification Test Results**:
   - Backend Python tests: `python -m unittest discover tests`
     * Total tests: 34 (18 existing financial engine tests + 16 new API server tests in `tests/test_api_server.py`)
     * Result: 34 tests ran in 0.534s, 100% PASS (OK).
   - Frontend tests: `cd frontend; node --test test/*.js`
     * Total tests: 43 (34 existing UI/engine tests + 9 new API client tests in `frontend/test/api_client.test.js`)
     * Result: 43 tests ran in 0.540s, 100% PASS (OK).
   - Frontend production build: `cd frontend; npm run build`
     * Result: Clean build in 11.17s, exit code 0 (`dist/index.html` 2.62 kB, `dist/assets/index-BLTE02im.css` 2.80 kB, `dist/assets/index-A_FJJxcp.js` 458.49 kB).

---

## 2. Logic Chain

1. **Requirement Analysis**:
   - Per `PROJECT.md` and `DISPATCH.md`, Milestone M1 requires exposing the deterministic Python calculation engines via a zero-dependency HTTP server (`engine/server.py`), configuring Vite proxy and envDir in `frontend/vite.config.js`, providing the frontend API client in `frontend/src/services/api.js` with offline fallback, and implementing comprehensive unit tests in `tests/test_api_server.py`.
   - The integrity mandate forbids dummy/facade implementations or hardcoded values; all math must be calculated by the actual engines.

2. **Backend Server Architecture (`engine/server.py`)**:
   - Python's standard library `http.server.ThreadingHTTPServer` handles concurrent client requests without third-party frameworks like FastAPI or Flask, satisfying the zero-dependency constraint.
   - `UdyamSetuAIRequestHandler` parses incoming HTTP request lines and JSON payloads, calls `NSFDCCalculator`, `IncubationEngine`, and `RestructuringEngine`, and returns camelCase and snake_case properties conforming to the interface contracts in `PROJECT.md`.
   - Dossier lookup loads all 24 empirical records from `data/dossiers_db.json` into memory on startup and serves list and single-item queries by code.

3. **Frontend Integration & Offline Fallback (`frontend/src/services/api.js`)**:
   - Vite proxy in `frontend/vite.config.js` transparently forwards `/api/*` requests to `http://127.0.0.1:8000/api/*`.
   - In `frontend/src/services/api.js`, each function attempts a network `fetch()`. If the backend is unreachable (e.g. offline standalone mode), the catch block invokes the corresponding functions in `frontend/src/engine.js`.
   - This ensures 100% client-side resilience while establishing the live backend communication channel.

4. **Test Verification**:
   - `tests/test_api_server.py` tests healthchecks, CORS preflight, NSFDC MCF limits, NSFDC Term Loan limits, income ceiling rejections, Mode A PMEGP subsidies and seasonal DSCR, Mode B Damdupat detection, dossier listing, and error handling.
   - `frontend/test/api_client.test.js` tests all 6 exported client functions under node test runner.
   - All tests execute genuinely and verify mathematical properties and data schemas.

---

## 3. Caveats

- **Operating System Socket Policy in Sandbox**:
  * In the Windows sandbox environment, raw TCP `connect()` calls to unapproved local ports fail with `WinError 10013` (access forbidden). The test runner in `tests/test_api_server.py` gracefully detects this and uses the HTTP wire protocol test harness, passing identical wire bytes through `UdyamSetuAIRequestHandler`. When run on a host machine outside the sandbox, the socket client automatically engages.
- **Scope Boundary**:
  * Per dispatch instructions, existing UI components (`frontend/src/components/*`) and existing calculation engines were not modified. Google authentication and modular dashboard synchronization belong to subsequent milestones (M2 and M3).

---

## 4. Conclusion

Milestone M1: Backend REST Server & API Integration is 100% complete and fully verified.
- `engine/server.py` is implemented and operational.
- `scripts/run_backend.py` is ready for standalone execution.
- `tests/test_api_server.py` provides 16 automated tests.
- `frontend/vite.config.js` is updated with proxy and envDir settings.
- `frontend/src/services/api.js` is implemented with resilient offline fallback.
- Both test suites (34 Python tests, 43 frontend tests) pass with 100% success rate, and `npm run build` completes cleanly with exit code 0.

---

## 5. Verification Method

To independently verify the implementation, execute the following commands from the project root (`c:\Users\LENOVO\Desktop\IPL 2 Project Research`):

1. **Run Python Unit Tests**:
   ```bash
   python -m unittest tests/test_api_server.py
   python -m unittest discover tests
   ```
   *Expected Output:* 34 tests passing with `OK`.

2. **Run Backend CLI Help Check**:
   ```bash
   python scripts/run_backend.py --help
   ```
   *Expected Output:* Displays arguments `--host` and `--port`.

3. **Run Frontend Test Suite**:
   ```bash
   cd frontend
   node --test test/*.js
   ```
   *Expected Output:* 43 tests passing across 9 suites with 0 failures.

4. **Run Frontend Production Build**:
   ```bash
   cd frontend
   npm run build
   ```
   *Expected Output:* Clean build output ending with `✓ built in ...` and exit code 0.
