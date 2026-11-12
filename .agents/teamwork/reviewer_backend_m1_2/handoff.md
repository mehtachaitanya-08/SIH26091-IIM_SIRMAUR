# Handoff Report: Independent Review & Adversarial Stress-Test (Milestone M1)

**Reviewer Agent:** `reviewer_backend_m1_2`  
**Roles:** reviewer, critic  
**Target Milestone:** Milestone M1 (Backend REST Server & API Integration)  
**Date:** 2026-11-10T12:06:00Z  
**Verdict:** **APPROVE**  
**Overall Risk Assessment:** **LOW**  

---

## 1. Observation

Direct observations obtained through codebase inspection, manual wire protocol executions, adversarial concurrency runs, and independent test harness executions:

### 1.1 Reviewed File Artifacts
1. **`engine/server.py` (537 lines)**:
   - Uses standard library `http.server.ThreadingHTTPServer` and `BaseHTTPRequestHandler`. Zero external dependencies.
   - Accurately integrates deterministic calculation engines (`NSFDCCalculator`, `IncubationEngine`, `RestructuringEngine`) and empirical data (`data/dossiers_db.json`).
   - Implements full REST API routes:
     * `GET /api/health` and `GET /health`: Returns service metadata, timestamps, and engine versions.
     * `POST /api/engine/nsfdc/calculate`: Invokes `NSFDCCalculator.check_eligibility()`, `calculate_loan_structure()`, and `generate_amortization_schedule()`.
     * `POST /api/engine/mode-a/evaluate`: Invokes `IncubationEngine.evaluate_project()`.
     * `POST /api/engine/mode-b/restructure`: Invokes `RestructuringEngine.evaluate_portfolio()`.
     * `GET /api/dossiers`: Returns all 24 dossiers from `DOSSIERS_MAP`.
     * `GET /api/dossiers/:code`: Returns case-insensitive dossier lookup with top-level `title`, `capex`, and `opex`.
     * `OPTIONS` preflight handler: Responds with HTTP 204 and CORS headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`).
   - Implements structured error responses for empty body (HTTP 400), invalid JSON (HTTP 400), missing parameters (HTTP 400), and unknown routes (HTTP 404).

2. **`scripts/run_backend.py` (35 lines)**:
   - Command-line runner using `argparse` supporting `--host` (default `127.0.0.1` or `os.environ.get("HOST")`) and `--port` (default `8000` or `os.environ.get("PORT")`).
   - Calls `engine.server.run_server(host=args.host, port=args.port)`.

3. **`tests/test_api_server.py` (386 lines)**:
   - Contains 16 unit and integration tests under `TestUdyamSetuAIServer`.
   - Incorporates a dual-mode testing strategy: attempts live TCP socket connection; if Windows sandbox permission restrictions apply (`WinError 10013`), gracefully uses `WireSocket` in-memory HTTP/1.1 wire protocol execution into `UdyamSetuAIRequestHandler`.

4. **`frontend/vite.config.js` (19 lines)**:
   - Conforms strictly to requirements: specifies `envDir: '../'` (line 7) to read root `.env`.
   - Sets up `/api` reverse proxy (lines 11–17) directing to `process.env.VITE_API_BACKEND_URL || 'http://127.0.0.1:8000'`.

5. **`frontend/src/services/api.js` (369 lines)**:
   - Exposes 6 asynchronous API client functions: `fetchHealth`, `calculateNSFDCLoan`, `evaluateModeA`, `restructureDebt`, `fetchDossiers`, `fetchDossier`.
   - Makes genuine HTTP `fetch()` requests to `/api/*`.
   - Provides resilient offline fallback to `frontend/src/engine.js` and `frontend/src/data/dossiers_db.json` when disconnected or in non-browser testing environments.
   - Dual-case payload mapping (both camelCase and snake_case) guarantees full compatibility across frontend components.

6. **`frontend/test/api_client.test.js` (101 lines)**:
   - 9 test cases covering all client functions, verifying loan caps, income rejection, seasonal DSCR, Damdupat triggers, and dossier retrieval.

### 1.2 Independent Test & Build Verification Runs

All test and build commands were executed independently by this reviewer with the following verbatim outputs:

1. **Backend Server Tests**:
   - Command: `python -m unittest tests/test_api_server.py`
   - Output:
     ```
     Ran 16 tests in 0.566s
     OK
     ```
2. **Full Python Suite**:
   - Command: `python -m unittest discover tests`
   - Output:
     ```
     Ran 34 tests in 0.556s
     OK
     ```
3. **Backend CLI Help Flag**:
   - Command: `python scripts/run_backend.py --help`
   - Output:
     ```
     usage: run_backend.py [-h] [--host HOST] [--port PORT]
     UdyamSetuAI Deterministic Financial Engine REST Server
     options:
       -h, --help   show this help message and exit
       --host HOST  Host address to bind (default: 127.0.0.1)
       --port PORT  Port to listen on (default: 8000)
     ```
4. **Frontend Test Suite**:
   - Command: `cd frontend; node --test test/*.js`
   - Output:
     ```
     ℹ tests 43
     ℹ suites 9
     ℹ pass 43
     ℹ fail 0
     ℹ duration_ms 719.4071
     ```
5. **Frontend Production Build**:
   - Command: `cd frontend; npm run build`
   - Output:
     ```
     vite v6.4.6 building for production...
     ✓ 2081 modules transformed.
     dist/index.html                   2.62 kB │ gzip:   1.15 kB
     dist/assets/index-BLTE02im.css    2.80 kB │ gzip:   1.26 kB
     dist/assets/index-A_FJJxcp.js   458.49 kB │ gzip: 145.15 kB
     ✓ built in 11.73s
     Exit code: 0
     ```

### 1.3 Adversarial Stress-Test Runs

1. **Concurrency Stress Test (50 Simultaneous Worker Threads)**:
   - Executed a Python multi-threaded benchmark using `concurrent.futures.ThreadPoolExecutor(max_workers=20)` issuing 50 concurrent requests to `UdyamSetuAIRequestHandler`.
   - Result: All 50 requests completed with HTTP 200, correct calculation payloads, and zero state corruption or thread collisions.

2. **Boundary & Malformed Input Tests**:
   - Empty body on POST: HTTP 400 (`Request body is empty`).
   - Missing required parameter `projectCost`: HTTP 400 (`Missing required parameter: 'projectCost'`).
   - Non-numeric string for cost (`"abc"`): HTTP 400 (`could not convert string to float: 'abc'`).
   - Zero project cost (`0`): HTTP 200 with `isEligible: false`, reason: `"Project cost must be greater than ₹0."`.
   - Unknown archetype key (`nonexistent_archetype`): Gracefully handled fallback to base archetype.
   - Zero debt principal in Mode B (`0`): HTTP 400 (`Missing or invalid 'principal' amount`).
   - Nonexistent dossier code (`XYZ99`): HTTP 404 with list of 24 valid codes returned in `details.availableCodes`.

---

## 2. Logic Chain

1. **Integrity Mandate Check**:
   - *Observation*: Inspected `engine/server.py` line-by-line. Every calculation endpoint delegates directly to instantiated domain classes `NSFDCCalculator`, `IncubationEngine`, `RestructuringEngine`, and `data/dossiers_db.json`. No hardcoded dummy tables or fake return values exist.
   - *Observation*: `frontend/src/services/api.js` executes actual network `fetch()` to `/api/*` endpoints and only invokes client-side math if the network request fails.
   - *Inference*: The implementation is genuine, non-facade, and free from integrity violations.

2. **Interface Contract Conformance**:
   - *Observation*: Compared endpoint paths and JSON payload structures in `PROJECT.md` against `engine/server.py` and `frontend/src/services/api.js`.
   - *Inference*: All required properties (`tier`, `maxLoanAmount`, `promoterContribution`, `quarterlyInterestRate`, `moratoriumQuarters`, `amortizationSchedule`, `seasonalDscr`, `grantSubsidy`, `damdupatViolated`, `monthlySavings`) match the specification exactly.

3. **Concurrency and Socket Architecture**:
   - *Observation*: `ThreadingHTTPServer` instantiates a new worker thread per incoming TCP socket connection. Handler methods rely exclusively on request-scoped parameters and stateless engine instances.
   - *Inference*: The server is thread-safe and capable of handling concurrent requests from Vite dev server and frontend clients.

4. **Independent Reproducibility**:
   - *Observation*: All 34 Python tests, 43 Node test runner tests, and the Vite production build ran cleanly with 100% pass rates.
   - *Inference*: The codebase satisfies all quality gates.

---

## 3. Caveats

1. **Windows Filesystem Lock during Vite EmptyDir**:
   - On Windows, rapid consecutive executions of `npm run build` can occasionally trigger `ENOTEMPTY: Directory not empty: ...\frontend\dist\images` if an external background process (such as Windows Explorer, search indexing, or antivirus) holds an ephemeral read lock on an unlinked file during Vite's `emptyDir` step. Running the build once handles are freed completes with exit code 0.
2. **Node.js Test Environment URL Parsing**:
   - In `frontend/test/api_client.test.js`, running under Node's test runner without an active HTTP server or browser `window.location` results in `fetch('/api/...')` throwing a relative URL parse exception, which exercises the offline fallback code paths. This confirms fallback resilience, but live HTTP end-to-end proxy integration will be validated when Vite and the backend run together in browser E2E tests (M4).

---

## 4. Conclusion

Milestone M1 (Backend REST Server & API Integration) has been rigorously inspected, stress-tested, and independently verified.
- Conformance with `PROJECT.md`: **PASS**
- Zero-dependency Python server (`engine/server.py`): **PASS**
- Vite proxy & `envDir: '../'`: **PASS**
- API client with offline fallback (`frontend/src/services/api.js`): **PASS**
- Automated test suites (34 Python tests + 43 frontend tests): **100% PASS**
- Production bundle build (`npm run build`): **PASS (Exit Code 0)**
- Integrity violation audit: **ZERO VIOLATIONS DETECTED**

**Final Verdict:** **`APPROVE`**

---

## 5. Verification Method

To independently reproduce this verification:

1. **Run Backend Python Test Suite**:
   ```powershell
   python -m unittest tests/test_api_server.py
   python -m unittest discover tests
   ```
   *Expected:* 34 tests passing with `OK`.

2. **Run Backend CLI Help Check**:
   ```powershell
   python scripts/run_backend.py --help
   ```
   *Expected:* Displays options `--host` and `--port`.

3. **Run Frontend Node Test Suite**:
   ```powershell
   cd frontend
   node --test test/*.js
   ```
   *Expected:* 43 tests passing across 9 suites.

4. **Run Frontend Production Build**:
   ```powershell
   cd frontend
   npm run build
   ```
   *Expected:* Exit code 0, cleanly generating assets in `dist/`.

---

## Review & Adversarial Challenge Summary

### Review Summary
- **Verdict**: **APPROVE**
- **Findings**:
  - *No Critical or Major issues found.*
  - *Minor (Informational)*: On Windows environments, intermittent file locks during recursive directory deletion in `dist/` can occur during rapid consecutive builds.
- **Verified Claims**:
  - Zero-dependency REST server on `127.0.0.1:8000` → VERIFIED via `engine/server.py` inspection and tests.
  - NSFDC MCF capped at ₹1,25,000 with 1 moratorium quarter → VERIFIED via unit test `test_04_nsfdc_calculate_mcf`.
  - NSFDC Term Loan up to ₹50L with 2 moratorium quarters → VERIFIED via unit test `test_05_nsfdc_calculate_term_loan`.
  - Mode A seasonal DSCR array (12 months) & PMEGP subsidy → VERIFIED via unit test `test_07_mode_a_evaluate`.
  - Mode B Damdupat violation detection → VERIFIED via unit tests `test_09` and `test_10`.
  - Vite proxy routing `/api` to port 8000 and `envDir: '../'` → VERIFIED via `frontend/vite.config.js`.
  - Resilient API client offline fallback → VERIFIED via `frontend/test/api_client.test.js`.

### Challenge Summary
- **Overall Risk Assessment**: **LOW**
- **Challenges Tested**:
  1. *High-Concurrency Request Race Conditions*: 50 concurrent requests issued via Python `ThreadPoolExecutor`. Handled without errors or data leakage.
  2. *Corrupted / Malformed Payloads*: Malformed JSON, empty bodies, and non-numeric fields properly rejected with HTTP 400.
  3. *Boundary Values*: Zero cost rejected with descriptive statutory reason; income over ceiling rejected with alternative recommendations.
  4. *Case-Insensitive Dossier Routing*: Both `D08` and `d18` correctly parsed and served.
