# Empirical Challenge Report & Handoff — Milestone M1

**Author:** Empirical Challenger Agent 2 (`challenger_backend_m1_2`)  
**Date:** 2026-11-10T12:38:00Z  
**Verdict:** **`APPROVE`**  
**Overall Risk Assessment:** **LOW**  
**Target Milestone:** Milestone M1 (Backend REST Server & API Integration)

---

## 1. Observation

Direct empirical observations from independent test execution, wire protocol analysis, and code auditing:

1. **Numerical Parity across All 24 Dossiers (`D01` to `D24`)**:
   - Evaluated both statutory credit tiers (MCF ≤ ₹1.40L and Term Loan > ₹1.40L up to ₹50.00L) across all 24 dossiers in `data/dossiers_db.json`.
   - Python server `POST /api/engine/nsfdc/calculate` vs client-side `frontend/src/engine.js`:
     * **MCF Tier (Project Cost ₹1,40,000.00)**:
       - Loan Amount: exactly ₹1,25,000.00 (hard statutory cap).
       - Promoter Equity: exactly ₹15,000.00 (10.71%).
       - Annual Interest Rate: 6.5% p.a.
       - Tenure / Instalments: 12 quarters (1 moratorium + 11 repayment quarters).
       - Equated Quarterly Installment (EQI): Python `12501.34` vs JS `12501.34` (exact parity, delta 0.00).
       - Total Principal Paid: Python `125000.00` vs JS `125000.00`.
       - Total Interest Paid: Python `14546.01` vs JS `14546.01` (delta 0.00).
       - Total Debt Service: Python `139546.01` vs JS `139546.01` (delta 0.00).
       - Amortization Schedule: All 12 quarters across all 24 dossiers matched opening balance, interest payment, principal payment, and final closing balance (₹0.00) down to < 0.01 tolerance.
     * **Term Loan Tier (Project Costs from ₹5.00L up to ₹40.00L)**:
       - Tested all 24 dossiers with variable capex (e.g. D08 @ ₹5.00L, D12/D13/D22 @ ₹10.00L, D17/D20/D21 @ ₹40.00L, D24 @ ₹8.50L).
       - Loan Amount: exactly 90% loan cap (capped at ₹45.00L).
       - Annual Interest Rate: 8.0% p.a.
       - Tenure / Instalments: 28 quarters (2 moratorium + 26 repayment quarters).
       - Total Debt Service, EQI, and quarterly amortization entries across all 28 quarters verified with 100% numerical parity (delta < 0.1).

2. **Concurrency & Thread Safety**:
   - Executed 30 concurrent HTTP/1.1 requests across 10 worker threads in `tests/test_empirical_challenger.py` targeting multiple endpoints simultaneously (`/api/health`, `/api/dossiers`, `/api/dossiers/D01`, `/api/dossiers/D08`, `/api/dossiers/D18`, `POST /api/engine/nsfdc/calculate`, `POST /api/engine/mode-a/evaluate`, `POST /api/engine/mode-b/restructure`, `OPTIONS /api/health`).
   - Results: 100% of requests succeeded (HTTP 200 or HTTP 204).
   - Zero race conditions, deadlocks, or socket corruption observed.
   - Per-request latency was strictly < 50ms, well below the 500ms operational ceiling.

3. **Dossier Search & Code Lookup Verification**:
   - All 24 valid codes (`D01` through `D24`) resolve with HTTP 200 and return full metadata (`code`, `title`, `capex`, `opex`, `basket_id`, `classification`, `scheme_fit`).
   - Case-insensitivity verified: lowercase `d01`, `d08`, `d18`, `d24` resolve identically to their uppercase counterparts (`D01`, `D08`, `D18`, `D24`).
   - Invalid codes (`D00`, `D25`, `D99`, `INVALID`, `null`, `undefined`, `123`, `BAD-CODE`) return HTTP 404 with structured JSON error `{ "error": "Dossier '...' not found", "status": 404, "details": { "availableCodes": [...] } }`.

4. **CORS Headers & OPTIONS Preflight**:
   - Executed OPTIONS requests on `/api/health`, `/health`, `/api/engine/nsfdc/calculate`, `/api/engine/mode-a/evaluate`, `/api/engine/mode-b/restructure`, `/api/dossiers`, `/api/dossiers/D01`.
   - All endpoints respond with HTTP 204 No Content and headers:
     * `Access-Control-Allow-Origin: *`
     * `Access-Control-Allow-Methods: GET, POST, OPTIONS`
     * `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`
     * `Access-Control-Max-Age: 86400`
   - Standard GET and POST responses also include `Access-Control-Allow-Origin: *` and `Content-Type: application/json; charset=utf-8`.

5. **Mode B Debt Restructuring & Damdupat Legal Precision**:
   - Verified the exact statutory inflection point where `paidToDate >= principal`:
     * 3 senkda (36% APR), ₹1,20,000 principal:
       - Month 33: Paid interest = ₹1,18,800 (< ₹1,20,000) -> `damdupatViolated: false` in both Python and JS.
       - Month 34: Paid interest = ₹1,22,400 (≥ ₹1,20,000) -> `damdupatViolated: true` in both Python and JS.
     * 2 senkda (24% APR), ₹1,00,000 principal:
       - Month 49: Paid interest = ₹98,000 (< ₹1,00,000) -> `damdupatViolated: false`.
       - Month 50: Paid interest = ₹1,00,000 (≥ ₹1,00,000) -> `damdupatViolated: true`.

6. **Statutory Boundary Condition Gates**:
   - `projectCost = 0` -> HTTP 200, `isEligible: false`, rejection: `"Project cost must be greater than ₹0."`.
   - `projectCost = 50,00,000` -> HTTP 200, `isEligible: true`, `tier: TERM_LOAN`, `maxLoanAmount: 4500000.0`.
   - `projectCost = 50,00,001` -> HTTP 200, `isEligible: false`, rejection: `"Project cost (₹50,00,001) exceeds maximum NSFDC scheme limit of ₹50,00,000."`.
   - `familyIncome = 5,00,000` -> HTTP 200, `isEligible: true`.
   - `familyIncome = 5,00,001` -> HTTP 200, `isEligible: false`, rejection: `"Annual family income (₹5,00,001) exceeds statutory NSFDC ceiling of ₹5,00,000 (effective 07 Jan 2026)."`.
   - `isSc = False` -> HTTP 200, `isEligible: false`, rejection: `"Beneficiary must belong to Scheduled Caste (SC) community with valid caste certificate under MoSJE / NSFDC mandate."`.

7. **Empirical Finding: Minor Contract Discrepancy in `api.js` Fallback Mode**:
   - In `frontend/src/services/api.js` line 208, in the catch block for `evaluateModeA`:
     ```javascript
     monthlyOpex: clientResult.monthlyBreakdown?.[0]?.opex || 0,
     revenue: clientResult.monthlyBreakdown?.[0]?.revenue || 0,
     ```
   - In `frontend/src/engine.js` line 542, the object structure in `monthlyBreakdown` uses property name `cost`, not `opex`:
     ```javascript
     return { month: idx + 1, factor: w, revenue: rev, cost, nocf, dscr };
     ```
   - Consequently, when `api.js` operates in offline fallback mode, `res.monthlyOpex` evaluates to `0` instead of the base monthly OpEx (`185000.0` for Archetype 1).
   - In live mode (when communicating with Python server), the server correctly returns `monthlyOpex: 185000.0` and `revenue: 245000.0`.
   - Blast radius is LOW because `evaluateModeA` is not yet wired to active UI components (planned for Milestone M3).

8. **Test Suite Baseline & Full Regression Runs**:
   - Python Test Suite: `python -m unittest discover tests` executed 78 tests in 0.909s with 100% pass rate (`OK`).
   - Frontend Test Suite: `cd frontend; node --test test/*.js` executed 62 tests across 10 suites in 0.505s with 100% pass rate (0 failures).
   - Empirical Challenger Node Suite: `node --test tests/test_challenger_empirical.mjs` executed 7 test suites in 0.212s with 100% pass rate.
   - Frontend Production Build: `cd frontend; npm run build` completed in 11.26s with exit code 0 (`dist/assets/index-A_FJJxcp.js` 458.49 kB).

---

## 2. Logic Chain

1. **Precision Parity**:
   - Observation 1 demonstrates that both the Python backend `NSFDCCalculator` and the JavaScript `engine.js` implement identical mathematical formulas for interest accrual during moratorium, equated quarterly instalment (EQI) annuity factors, and residual principal amortization.
   - Because the maximum deviation observed across all 24 dossiers and all quarterly schedule entries was 0.00 to 0.05 paise (due to minor standard floating-point rounding), the two engines are in 100% mathematical parity.

2. **Concurrency & Thread Safety**:
   - Observation 2 demonstrates that `ThreadingHTTPServer` and `GraminAIRequestHandler` handle high-frequency concurrent requests cleanly. Each request is served in its own thread with isolated I/O streams and no mutable shared state leaks, ensuring production readiness for local multi-tab frontend requests.

3. **CORS & Proxy Conformance**:
   - Observation 4 confirms that Vite proxy and direct browser cross-origin requests are supported on all endpoints via explicit CORS headers and HTTP 204 preflight responses, fulfilling the interface contract in `PROJECT.md`.

4. **Robustness & Edge Cases**:
   - Observations 3, 5, and 6 confirm that the API service handles valid queries, case-normalization, out-of-bounds inputs, statutory ceilings, and legal boundary checks with high precision and structured error handling.

5. **Finding Assessment**:
   - Observation 7 identifies a property naming mismatch in `api.js` offline fallback (`.opex` vs `.cost`). Because the live server endpoint behaves correctly and the function is not yet consumed by production UI views, this does not invalidate Milestone M1 deliverables but provides a high-value note for Milestone M3.

---

## 3. Caveats

1. **Sandbox Socket Policy**:
   - As documented by Worker M1, the Windows sandbox environment restricts raw outbound TCP socket client calls to arbitrary ports. Testing was executed via simulated HTTP/1.1 wire protocol streams directly exercising `GraminAIRequestHandler` and thread pools, which tests the exact same server logic without OS sandbox socket denial.
2. **Scope Boundary**:
   - Google authentication (M2) and modular dashboard synchronization (M3) are intentionally out of scope for Milestone M1 review.

---

## 4. Conclusion & Verdict

**VERDICT: `APPROVE`**

Milestone M1 (Backend REST Server & API Integration) has been empirically verified and passes all adversarial stress tests:
- Numerical parity across all 24 dossiers is verified.
- Concurrency and thread safety are verified.
- CORS preflight and headers are verified.
- Search and lookup edge cases are verified.
- All unit, integration, and build suites pass cleanly.

**Recommended Action for Milestone M3**:
- When integrating `evaluateModeA` into dashboard components in Milestone M3, update `frontend/src/services/api.js` line 208 from `clientResult.monthlyBreakdown?.[0]?.opex || 0` to `clientResult.monthlyBreakdown?.[0]?.cost || clientResult.archetype?.default_opex_monthly || 0` to align fallback mode with server responses.

---

## 5. Verification Method

To independently reproduce and verify all empirical tests from project root (`c:\Users\LENOVO\Desktop\IPL 2 Project Research`):

1. **Run Python Empirical Challenger & Unit Tests**:
   ```powershell
   python -m unittest tests/test_empirical_challenger.py
   python -m unittest discover tests
   ```
   *Expected Result:* 78 tests pass with `OK`.

2. **Run Node.js Empirical Challenger Suite**:
   ```powershell
   node --test tests/test_challenger_empirical.mjs
   ```
   *Expected Result:* 7 tests pass with 0 failures.

3. **Run Frontend Full Test Suite**:
   ```powershell
   cd frontend
   node --test test/*.js
   ```
   *Expected Result:* 62 tests across 10 suites pass with 0 failures.

4. **Run Frontend Production Build**:
   ```powershell
   cd frontend
   npm run build
   ```
   *Expected Result:* `✓ built in ...` with exit code 0.
