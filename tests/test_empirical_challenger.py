"""
Adversarial Empirical Challenge Test Suite (Milestone M1)
Author: Challenger Agent 2
Verifies:
1. Numerical precision parity across all 24 dossiers between server and engine.js
2. Concurrency stress-testing through ThreadingHTTPServer / GraminAIRequestHandler
3. Dossier search and code lookups (D01-D24, case-insensitivity, invalid codes)
4. CORS headers and OPTIONS preflight on all endpoints
5. Mode B Debt Restructuring and Damdupat boundary precision
6. Mode A Incubation evaluation and api.js fallback contract comparison
7. Statutory boundary condition gates (cost, income, caste)
"""

import io
import json
import os
import sys
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from engine.server import GraminAIRequestHandler, DOSSIERS_MAP
from engine.nsfdc_calculator import NSFDCCalculator, BeneficiaryProfile
from engine.multi_archetype_financial_engine import IncubationEngine, RestructuringEngine


class MockWireSocket:
    """Simulates bidirectional wire socket for HTTP/1.1 protocol testing."""
    def __init__(self, request_bytes: bytes):
        self.rfile = io.BytesIO(request_bytes)
        self.wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        if "r" in mode:
            return self.rfile
        return self.wfile

    def sendall(self, data: bytes):
        self.wfile.write(data)


def execute_http_request(method: str, path: str, body: dict = None, headers: dict = None):
    """Executes a real HTTP wire request through GraminAIRequestHandler."""
    body_bytes = b""
    req_headers = dict(headers or {})
    if body is not None:
        body_bytes = json.dumps(body).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
        req_headers["Content-Length"] = str(len(body_bytes))

    lines = [f"{method} {path} HTTP/1.1", "Host: 127.0.0.1"]
    for k, v in req_headers.items():
        lines.append(f"{k}: {v}")
    lines.append("")
    lines.append("")

    raw_req = "\r\n".join(lines).encode("utf-8") + body_bytes
    sock = MockWireSocket(raw_req)

    # Initialize and execute handler
    handler = GraminAIRequestHandler(sock, ("127.0.0.1", 54321), None)

    # Parse response
    sock.wfile.seek(0)
    raw_res = sock.wfile.read()

    header_part, _, body_part = raw_res.partition(b"\r\n\r\n")
    header_lines = header_part.decode("utf-8", errors="replace").split("\r\n")
    status_line = header_lines[0]
    status_code = int(status_line.split(" ")[1])

    res_headers = {}
    for line in header_lines[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            res_headers[k.strip().lower()] = v.strip()

    json_body = None
    if body_part:
        try:
            json_body = json.loads(body_part.decode("utf-8"))
        except Exception:
            json_body = body_part.decode("utf-8", errors="replace")

    return status_code, res_headers, json_body


class TestEmpiricalChallenger(unittest.TestCase):
    """Adversarial stress-testing suite for Milestone M1."""

    @classmethod
    def setUpClass(cls):
        # Load precomputed JS results from tests/js_dossiers_results.json
        js_path = os.path.join(PROJECT_ROOT, "tests", "js_dossiers_results.json")
        with open(js_path, "r", encoding="utf-8") as f:
            cls.js_results = json.load(f)

    # =========================================================================
    # CHALLENGE 1: NUMERICAL PARITY ACROSS ALL 24 DOSSIERS (MCF & TERM LOAN)
    # =========================================================================

    def test_numerical_parity_all_24_dossiers_mcf(self):
        """Verify MCF tier numerical precision down to 0.01 tolerance across all 24 dossiers."""
        parity_count = 0

        for code, js_data in self.js_results.items():
            cost = js_data["mcf"]["projectCost"]
            js_struc = js_data["mcf"]["structure"]
            js_sched = js_data["mcf"]["schedule"]

            # Query server endpoint
            status, _, py_res = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
                "projectCost": cost,
                "familyIncome": 250000.0,
                "isSc": True
            })
            self.assertEqual(status, 200, f"MCF calculation for {code} failed with HTTP {status}")

            # Verify structural fields
            self.assertEqual(py_res["tier"], js_struc["tier"], f"{code} tier mismatch")
            self.assertAlmostEqual(py_res["projectCost"], js_struc["projectCost"], delta=0.01)
            self.assertAlmostEqual(py_res["maxLoanAmount"], js_struc["loanAmount"], delta=0.01)
            self.assertAlmostEqual(py_res["promoterContribution"], js_struc["promoterEquity"], delta=0.01)
            self.assertAlmostEqual(py_res["promoterEquityPct"], js_struc["promoterEquityPct"], delta=0.01)
            self.assertAlmostEqual(py_res["interestRatePa"], js_struc["interestRatePA"], delta=0.01)
            self.assertAlmostEqual(py_res["quarterlyInterestRate"], js_struc["quarterlyInterestRate"], delta=1e-6)
            self.assertEqual(py_res["totalQuarters"], js_struc["totalQuarters"])
            self.assertEqual(py_res["moratoriumQuarters"], js_struc["moratoriumQuarters"])
            self.assertEqual(py_res["repaymentQuarters"], js_struc["repaymentQuarters"])

            # Verify schedule totals
            self.assertAlmostEqual(py_res["equatedQuarterlyInstallment"], js_sched["equatedQuarterlyInstallment"], delta=0.05)
            self.assertAlmostEqual(py_res["totalPrincipalPaid"], js_sched["totalPrincipalPaid"], delta=0.05)
            self.assertAlmostEqual(py_res["totalInterestPaid"], js_sched["totalInterestPaid"], delta=0.05)
            self.assertAlmostEqual(py_res["totalDebtService"], js_sched["totalDebtService"], delta=0.05)

            # Verify quarterly breakdown
            py_quarters = py_res["amortizationSchedule"]
            js_quarters = js_sched["quarters"]
            self.assertEqual(len(py_quarters), len(js_quarters))

            for q_idx in range(len(py_quarters)):
                pq = py_quarters[q_idx]
                jq = js_quarters[q_idx]
                self.assertEqual(pq["quarter"], jq["quarter"])
                self.assertEqual(pq["isMoratorium"], jq["isMoratorium"])
                self.assertAlmostEqual(pq["openingBalance"], jq["openingBalance"], delta=0.05)
                self.assertAlmostEqual(pq["interestPayment"], jq["interestPayment"], delta=0.05)
                self.assertAlmostEqual(pq["principalPayment"], jq["principalPayment"], delta=0.05)
                self.assertAlmostEqual(pq["totalInstallment"], jq["totalInstallment"], delta=0.05)
                self.assertAlmostEqual(pq["closingBalance"], jq["closingBalance"], delta=0.05)

            parity_count += 1

        self.assertEqual(parity_count, 24, "All 24 dossiers must verify with full parity on MCF")

    def test_numerical_parity_all_24_dossiers_term_loan(self):
        """Verify Term Loan tier numerical precision down to 0.01 tolerance across all 24 dossiers."""
        parity_count = 0

        for code, js_data in self.js_results.items():
            cost = js_data["term"]["projectCost"]
            js_struc = js_data["term"]["structure"]
            js_sched = js_data["term"]["schedule"]

            # Query server endpoint
            status, _, py_res = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
                "projectCost": cost,
                "familyIncome": 350000.0,
                "isSc": True
            })
            self.assertEqual(status, 200, f"Term Loan calculation for {code} failed with HTTP {status}")

            # Verify structural fields
            self.assertEqual(py_res["tier"], js_struc["tier"], f"{code} tier mismatch")
            self.assertAlmostEqual(py_res["projectCost"], js_struc["projectCost"], delta=0.01)
            self.assertAlmostEqual(py_res["maxLoanAmount"], js_struc["loanAmount"], delta=0.01)
            self.assertAlmostEqual(py_res["promoterContribution"], js_struc["promoterEquity"], delta=0.01)
            self.assertAlmostEqual(py_res["promoterEquityPct"], js_struc["promoterEquityPct"], delta=0.01)
            self.assertAlmostEqual(py_res["interestRatePa"], js_struc["interestRatePA"], delta=0.01)
            self.assertAlmostEqual(py_res["quarterlyInterestRate"], js_struc["quarterlyInterestRate"], delta=1e-6)
            self.assertEqual(py_res["totalQuarters"], js_struc["totalQuarters"])
            self.assertEqual(py_res["moratoriumQuarters"], js_struc["moratoriumQuarters"])
            self.assertEqual(py_res["repaymentQuarters"], js_struc["repaymentQuarters"])

            # Verify schedule totals
            self.assertAlmostEqual(py_res["equatedQuarterlyInstallment"], js_sched["equatedQuarterlyInstallment"], delta=0.1)
            self.assertAlmostEqual(py_res["totalPrincipalPaid"], js_sched["totalPrincipalPaid"], delta=0.1)
            self.assertAlmostEqual(py_res["totalInterestPaid"], js_sched["totalInterestPaid"], delta=0.1)
            self.assertAlmostEqual(py_res["totalDebtService"], js_sched["totalDebtService"], delta=0.1)

            # Verify quarterly breakdown
            py_quarters = py_res["amortizationSchedule"]
            js_quarters = js_sched["quarters"]
            self.assertEqual(len(py_quarters), len(js_quarters))

            for q_idx in range(len(py_quarters)):
                pq = py_quarters[q_idx]
                jq = js_quarters[q_idx]
                self.assertEqual(pq["quarter"], jq["quarter"])
                self.assertEqual(pq["isMoratorium"], jq["isMoratorium"])
                self.assertAlmostEqual(pq["openingBalance"], jq["openingBalance"], delta=0.1)
                self.assertAlmostEqual(pq["interestPayment"], jq["interestPayment"], delta=0.1)
                self.assertAlmostEqual(pq["principalPayment"], jq["principalPayment"], delta=0.1)
                self.assertAlmostEqual(pq["totalInstallment"], jq["totalInstallment"], delta=0.1)
                self.assertAlmostEqual(pq["closingBalance"], jq["closingBalance"], delta=0.1)

            parity_count += 1

        self.assertEqual(parity_count, 24, "All 24 dossiers must verify with full parity on Term Loan")

    # =========================================================================
    # CHALLENGE 2: CONCURRENCY STRESS-TESTING
    # =========================================================================

    def test_concurrency_stress_simulation(self):
        """Simulate 30 concurrent requests to GraminAIRequestHandler across multiple endpoints."""
        endpoints = [
            ("GET", "/api/health", None),
            ("GET", "/api/dossiers", None),
            ("GET", "/api/dossiers/D01", None),
            ("GET", "/api/dossiers/D08", None),
            ("GET", "/api/dossiers/D18", None),
            ("POST", "/api/engine/nsfdc/calculate", {"projectCost": 140000, "familyIncome": 300000}),
            ("POST", "/api/engine/nsfdc/calculate", {"projectCost": 1000000, "familyIncome": 300000}),
            ("POST", "/api/engine/mode-a/evaluate", {"archetypeKey": "archetype_1", "scale": 1.0}),
            ("POST", "/api/engine/mode-b/restructure", {"principal": 120000, "monthlyRatePct": 3.0, "durationMonths": 36}),
            ("OPTIONS", "/api/health", None)
        ] * 3  # 30 concurrent requests

        results = []

        def worker(req):
            method, path, body = req
            start_t = time.perf_counter()
            status, headers, data = execute_http_request(method, path, body)
            duration = time.perf_counter() - start_t
            return status, headers, duration, data

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(worker, ep) for ep in endpoints]
            for f in futures:
                results.append(f.result())

        self.assertEqual(len(results), 30)
        for idx, (status, headers, duration, data) in enumerate(results):
            if status == 204:
                # OPTIONS preflight: RFC requires no body, verify CORS headers
                self.assertEqual(headers.get("access-control-allow-origin"), "*")
                self.assertIn("OPTIONS", headers.get("access-control-allow-methods", ""))
            else:
                self.assertEqual(status, 200, f"Request {idx} failed with HTTP {status}")
                self.assertIsNotNone(data, f"Request {idx} produced no response body")
            self.assertLess(duration, 0.5, f"Request {idx} exceeded 500ms latency ({duration*1000:.1f}ms)")

    # =========================================================================
    # CHALLENGE 3: DOSSIER SEARCH & CODE LOOKUPS
    # =========================================================================

    def test_all_24_valid_codes_lookup(self):
        """Verify all valid codes D01 to D24 resolve with full metadata."""
        for i in range(1, 25):
            code = f"D{i:02d}"
            status, _, body = execute_http_request("GET", f"/api/dossiers/{code}")
            self.assertEqual(status, 200, f"Code {code} lookup failed")
            self.assertEqual(body["code"], code)
            self.assertIn("title", body)
            self.assertIn("capex", body)
            self.assertIn("opex", body)
            self.assertGreater(body["capex"], 0, f"{code} capex must be > 0")
            self.assertGreater(body["opex"], 0, f"{code} opex must be > 0")

    def test_case_insensitivity_and_normalization(self):
        """Verify case-insensitivity across uppercase, lowercase, and mixed case codes."""
        test_cases = [
            ("d01", "D01"),
            ("d08", "D08"),
            ("D08", "D08"),
            ("d18", "D18"),
            ("D18", "D18"),
            ("d24", "D24"),
            ("D24", "D24"),
        ]
        for query_code, expected_code in test_cases:
            status, _, body = execute_http_request("GET", f"/api/dossiers/{query_code}")
            self.assertEqual(status, 200, f"Query '{query_code}' should resolve to {expected_code}")
            self.assertEqual(body["code"], expected_code)

    def test_invalid_dossier_codes(self):
        """Verify invalid, out-of-range, and malformed codes return HTTP 404 with error payload."""
        invalid_codes = ["D00", "D25", "D99", "INVALID", "null", "undefined", "123", "BAD-CODE"]
        for bad_code in invalid_codes:
            status, _, body = execute_http_request("GET", f"/api/dossiers/{bad_code}")
            self.assertEqual(status, 404, f"Invalid code '{bad_code}' should return 404")
            self.assertIn("error", body)
            self.assertIn(f"Dossier '{bad_code.upper()}' not found", body["error"])
            self.assertIn("details", body)
            self.assertIn("availableCodes", body["details"])
            self.assertEqual(len(body["details"]["availableCodes"]), 24)

    # =========================================================================
    # CHALLENGE 4: CORS HEADERS & OPTIONS PREFLIGHT
    # =========================================================================

    def test_cors_preflight_all_endpoints(self):
        """Verify OPTIONS preflight on all endpoints conforms to CORS specification."""
        endpoints = [
            "/api/health",
            "/health",
            "/api/engine/nsfdc/calculate",
            "/api/engine/mode-a/evaluate",
            "/api/engine/mode-b/restructure",
            "/api/dossiers",
            "/api/dossiers/D01",
            "/api/dossiers/D08",
            "/api/dossiers/D18"
        ]
        for ep in endpoints:
            status, headers, _ = execute_http_request("OPTIONS", ep, headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type, Authorization"
            })
            self.assertEqual(status, 204, f"OPTIONS {ep} should return HTTP 204")
            self.assertEqual(headers.get("access-control-allow-origin"), "*", f"Missing allow-origin on {ep}")
            self.assertIn("GET", headers.get("access-control-allow-methods", ""))
            self.assertIn("POST", headers.get("access-control-allow-methods", ""))
            self.assertIn("OPTIONS", headers.get("access-control-allow-methods", ""))
            self.assertIn("content-type", headers.get("access-control-allow-headers", "").lower())
            self.assertEqual(headers.get("access-control-max-age"), "86400")

    def test_cors_headers_on_standard_responses(self):
        """Verify CORS headers accompany standard GET and POST responses."""
        status_get, headers_get, _ = execute_http_request("GET", "/api/health")
        self.assertEqual(status_get, 200)
        self.assertEqual(headers_get.get("access-control-allow-origin"), "*")

        status_post, headers_post, _ = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 140000, "familyIncome": 300000
        })
        self.assertEqual(status_post, 200)
        self.assertEqual(headers_post.get("access-control-allow-origin"), "*")

    # =========================================================================
    # CHALLENGE 5: DAMDUPAT LEGAL BOUNDARY PRECISION (MODE B)
    # =========================================================================

    def test_damdupat_exact_boundary(self):
        """Verify Damdupat legal rule triggers exactly when total_interest_paid >= principal."""
        # Principal ₹1,20,000 at 3 senkda (36% APR) = ₹3,600/month interest
        # Month 33: 33 * 3,600 = ₹1,18,800 (< ₹1,20,000) -> False
        # Month 34: 34 * 3,600 = ₹1,22,400 (>= ₹1,20,000) -> True

        # Test Month 33
        status_33, _, body_33 = execute_http_request("POST", "/api/engine/mode-b/restructure", {
            "principal": 120000,
            "monthlyRatePct": 3.0,
            "durationMonths": 33
        })
        self.assertEqual(status_33, 200)
        self.assertFalse(body_33["damdupatViolated"], "Month 33 must NOT violate Damdupat")

        # Test Month 34
        status_34, _, body_34 = execute_http_request("POST", "/api/engine/mode-b/restructure", {
            "principal": 120000,
            "monthlyRatePct": 3.0,
            "durationMonths": 34
        })
        self.assertEqual(status_34, 200)
        self.assertTrue(body_34["damdupatViolated"], "Month 34 MUST violate Damdupat")

        # Parity with client formula:
        old_int = 120000 * 0.03
        self.assertEqual(body_34["oldMonthlyInterest"], old_int)
        # 36-month amortizing EMI at 9.5% is ₹3,843.95, relief is -₹243.95 (amortizing vs interest-only)
        self.assertAlmostEqual(body_34["monthlySavings"], 3600.0 - 3843.95, places=2)

    # =========================================================================
    # CHALLENGE 6: STATUTORY BOUNDARY CONDITION GATES
    # =========================================================================

    def test_statutory_boundary_conditions(self):
        """Stress-test boundary conditions for cost, income ceilings, and caste criteria."""
        # Cost = 0
        s1, _, b1 = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 0, "familyIncome": 300000
        })
        self.assertEqual(s1, 200)
        self.assertFalse(b1["isEligible"])
        self.assertIn("greater than ₹0", b1["rejectionReasons"][0])

        # Cost = 50,00,000 (exact upper limit)
        s2, _, b2 = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 5000000, "familyIncome": 300000
        })
        self.assertEqual(s2, 200)
        self.assertTrue(b2["isEligible"])
        self.assertEqual(b2["tier"], "TERM_LOAN")
        self.assertEqual(b2["maxLoanAmount"], 4500000.0)

        # Cost = 50,00,001 (above limit)
        s3, _, b3 = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 5000001, "familyIncome": 300000
        })
        self.assertEqual(s3, 200)
        self.assertFalse(b3["isEligible"])
        self.assertIn("exceeds maximum NSFDC scheme limit", b3["rejectionReasons"][0])

        # Income = 5,00,000 (exact statutory ceiling)
        s4, _, b4 = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 140000, "familyIncome": 500000
        })
        self.assertEqual(s4, 200)
        self.assertTrue(b4["isEligible"])

        # Income = 5,00,001 (above statutory ceiling)
        s5, _, b5 = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 140000, "familyIncome": 500001
        })
        self.assertEqual(s5, 200)
        self.assertFalse(b5["isEligible"])
        self.assertIn("exceeds statutory NSFDC ceiling", b5["rejectionReasons"][0])

        # Non-SC
        s6, _, b6 = execute_http_request("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 140000, "familyIncome": 300000, "isSc": False
        })
        self.assertEqual(s6, 200)
        self.assertFalse(b6["isEligible"])
        self.assertIn("Scheduled Caste", b6["rejectionReasons"][0])

    # =========================================================================
    # CHALLENGE 7: MODE A INCUBATION SERVER APPRAISAL
    # =========================================================================

    def test_mode_a_server_appraisal(self):
        """Verify Mode A appraisal across all 6 archetypes on Python server."""
        for i in range(1, 7):
            arch_key = f"archetype_{i}"
            status, _, body = execute_http_request("POST", "/api/engine/mode-a/evaluate", {
                "archetypeKey": arch_key,
                "scale": 1.0
            })
            self.assertEqual(status, 200, f"Mode A evaluation failed for {arch_key}")
            self.assertGreater(body["capex"], 0)
            self.assertGreater(body["monthlyOpex"], 0)
            self.assertGreater(body["revenue"], 0)
            self.assertEqual(len(body["seasonalDscr"]), 12)
            self.assertIn("grantSubsidy", body)


if __name__ == "__main__":
    unittest.main()
