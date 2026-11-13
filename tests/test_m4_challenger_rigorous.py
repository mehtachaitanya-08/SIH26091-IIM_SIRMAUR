"""
Milestone M4: Challenger 1 Rigorous Empirical Verification Suite
Adversarial stress-testing of backend REST service (engine/server.py)
Covering:
- Wire protocol fidelity across all 6 REST endpoints
- Statutory NSFDC credit boundaries (MCF, Term Loan, Promoter Equity, Income Ceiling)
- Multi-archetype incubation engine across all 6 empirical archetypes
- Moneylender debt restructuring and Rule of Damdupat mathematical exactness
- Full 24-dossier catalog validation (schema, capex, opex, augmented fields)
- Malformed payloads, SQL injection, script tags, Unicode paths, and error formatting
"""

import io
import json
import os
import sys
import unittest
from unittest.mock import MagicMock

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from engine.server import create_server, UdyamSetuAIRequestHandler, DOSSIERS_MAP, DOSSIERS_LIST
from tests.test_api_server import WireSocket


class TestM4ChallengerRigorous(unittest.TestCase):
    """Empirical Challenger 1 Test Suite for Milestone M4."""

    @classmethod
    def setUpClass(cls):
        try:
            cls.server = create_server(host="127.0.0.1", port=0)
        except Exception:
            cls.server = MagicMock()

    def _send_wire(self, method: str, path: str, body=None, headers=None):
        req_headers = dict(headers or {})
        body_bytes = b""
        if body is not None:
            if isinstance(body, (dict, list)):
                body_bytes = json.dumps(body).encode("utf-8")
                if "Content-Type" not in req_headers:
                    req_headers["Content-Type"] = "application/json"
            elif isinstance(body, (str, bytes)):
                body_bytes = body.encode("utf-8") if isinstance(body, str) else body
            req_headers["Content-Length"] = str(len(body_bytes))

        wire_lines = [f"{method} {path} HTTP/1.1", "Host: 127.0.0.1"]
        for k, v in req_headers.items():
            wire_lines.append(f"{k}: {v}")
        wire_raw = ("\r\n".join(wire_lines) + "\r\n\r\n").encode("utf-8") + body_bytes

        mock_socket = WireSocket(wire_raw)
        server_stub = self.server or MagicMock()
        _ = UdyamSetuAIRequestHandler(mock_socket, ("127.0.0.1", 54321), server_stub)

        response_bytes = mock_socket.wfile.getvalue()
        parts = response_bytes.split(b"\r\n\r\n", 1)
        headers_raw = parts[0].decode("utf-8", errors="replace")
        body_raw = parts[1].decode("utf-8", errors="replace") if len(parts) > 1 else ""

        status_line = headers_raw.splitlines()[0] if headers_raw else "HTTP/1.1 500"
        status_code = int(status_line.split(" ")[1])

        resp_headers = {}
        for line in headers_raw.splitlines()[1:]:
            if ":" in line:
                k, v = line.split(":", 1)
                resp_headers[k.strip().lower()] = v.strip()

        resp_json = {}
        if body_raw:
            try:
                resp_json = json.loads(body_raw)
            except Exception:
                resp_json = {"raw": body_raw}

        return status_code, resp_json, resp_headers

    # 1. CORS Preflight & Header Conformance
    def test_01_options_preflight_headers(self):
        status, body, headers = self._send_wire("OPTIONS", "/api/engine/nsfdc/calculate")
        self.assertEqual(status, 204)
        self.assertEqual(headers.get("access-control-allow-origin"), "*")
        self.assertIn("POST", headers.get("access-control-allow-methods", ""))
        self.assertIn("content-type", headers.get("access-control-allow-headers", "").lower())

    # 2. Health Endpoint Contract
    def test_02_health_contract_and_metadata(self):
        status, body, headers = self._send_wire("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        self.assertEqual(body.get("version"), "1.0.0")
        self.assertIn("timestamp", body)
        self.assertIn("engines", body)
        engines = body["engines"]
        self.assertIn("nsfdc_calculator", engines)
        self.assertIn("multi_archetype_financial_engine", engines)
        self.assertEqual(engines.get("total_dossiers"), 24)

    # 3. Statutory NSFDC Micro Credit Finance (MCF) Math
    def test_03_nsfdc_mcf_mathematics(self):
        # MCF: Project Cost <= Rs. 1,40,000
        # Mandate: Max Loan Rs. 1,25,000, 6.5% p.a., 3 years tenure, 1 quarter moratorium.
        # Updated 13 Nov 2026: the pause is 1 quarter in the verified loan rules (backend/loan.py, [S1]), not 2;
        # payments are equal instalments, so the principal part grows each quarter (it is not a flat 12,500).
        status, body, _ = self._send_wire("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 140000,
            "familyIncome": 120000,
            "isSc": True
        })
        self.assertEqual(status, 200)
        self.assertTrue(body["isEligible"])
        self.assertEqual(body["tier"], "MCF")
        self.assertEqual(body["maxLoanAmount"], 125000)
        self.assertEqual(body["promoterContribution"], 15000)
        self.assertAlmostEqual(body["interestRatePa"], 6.5)
        self.assertEqual(body["termYears"], 3)
        self.assertEqual(body["moratoriumQuarters"], 1)
        self.assertEqual(body["totalQuarters"], 12)
        self.assertEqual(body["repaymentQuarters"], 11)

        # Verify amortization schedule
        schedule = body["amortizationSchedule"]
        self.assertEqual(len(schedule), 12)
        # Moratorium quarters: principal payment must be 0
        self.assertTrue(schedule[0]["isMoratorium"])
        self.assertEqual(schedule[0]["principalPayment"], 0.0)
        # Repayment quarters: principal paid each quarter, growing as interest falls (equal instalments)
        rest = schedule[1:]
        for q in rest:
            self.assertFalse(q["isMoratorium"])
            self.assertGreater(q["principalPayment"], 0.0)
        self.assertAlmostEqual(sum(q["principalPayment"] for q in rest), 125000.0, places=0)
        # Final closing balance should be 0
        self.assertAlmostEqual(schedule[-1]["closingBalance"], 0.0, places=2)

    # 4. Statutory NSFDC Term Loan Math
    def test_04_nsfdc_term_loan_mathematics(self):
        # Term Loan: Project Cost > Rs. 1,40,000 up to Rs. 50,00,000
        # Mandate: 90% loan, 10% promoter equity, 8.0% p.a., 7 years tenure, 2 quarters moratorium.
        # Updated 13 Nov 2026: NSFDC's own text says "Repayment is within 7 years (including a 6-month
        # moratorium" ([S1], backend/loan.py), not 5.
        status, body, _ = self._send_wire("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 2000000,  # Rs. 20 Lakh
            "familyIncome": 300000,
            "isSc": True
        })
        self.assertEqual(status, 200)
        self.assertTrue(body["isEligible"])
        self.assertEqual(body["tier"], "TERM_LOAN")
        self.assertEqual(body["maxLoanAmount"], 1800000)  # 90% of 20L
        self.assertEqual(body["promoterContribution"], 200000)  # 10% of 20L
        self.assertAlmostEqual(body["interestRatePa"], 8.0)
        self.assertEqual(body["termYears"], 7)
        self.assertEqual(body["moratoriumQuarters"], 2)
        self.assertEqual(body["totalQuarters"], 28)
        self.assertEqual(body["repaymentQuarters"], 26)

        schedule = body["amortizationSchedule"]
        self.assertEqual(len(schedule), 28)
        self.assertAlmostEqual(schedule[-1]["closingBalance"], 0.0, places=2)

    # 5. Income Ceiling Rejections (Statutory Rs. 5.00 Lakh Cap)
    def test_05_income_ceiling_edge_cases(self):
        # Exactly at limit: Rs. 5,00,000 should pass
        status, body, _ = self._send_wire("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 100000,
            "familyIncome": 500000,
            "isSc": True
        })
        self.assertEqual(status, 200)
        self.assertTrue(body["isEligible"])

        # Exactly 1 Rupee over limit: Rs. 5,00,001 should FAIL
        status, body, _ = self._send_wire("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 100000,
            "familyIncome": 500001,
            "isSc": True
        })
        self.assertEqual(status, 200)
        self.assertFalse(body["isEligible"])
        self.assertTrue(any("income" in r.lower() for r in body["rejectionReasons"]))

    # 6. Mode A Evaluation for All Archetypes
    def test_06_all_six_archetypes_mode_a(self):
        archetypes = [
            "poultry_broiler_1000",
            "goat_rearing_10_1",
            "mini_flour_mill_500kg",
            "readymade_garment_5stitch",
            "leather_footwear_unit",
            "organic_vermicompost_100t"
        ]
        for arch in archetypes:
            status, body, _ = self._send_wire("POST", "/api/engine/mode-a/evaluate", {
                "archetypeKey": arch,
                "scale": 1.0
            })
            self.assertEqual(status, 200, f"Archetype {arch} failed with status {status}")
            self.assertIn("capex", body)
            self.assertIn("monthlyOpex", body)
            self.assertIn("revenue", body)
            self.assertIn("grantSubsidy", body)
            self.assertIn("seasonalDscr", body)
            # Updated 13 Nov 2026: the reply now gives the 12 monthly values as plain numbers in month
            # order, not {month, dscr} objects.
            self.assertEqual(len(body["seasonalDscr"]), 12)
            for m in body["seasonalDscr"]:
                self.assertIsInstance(m, (int, float))

    # 7. Mode B Moneylender Restructuring & Rule of Damdupat
    def test_07_mode_b_damdupat_exactness(self):
        # Updated 13 Nov 2026: the server never read "interestPaidToDate"; it works out the interest from the
        # rate and the months (as the website sends them). At 3% a month on Rs. 1,00,000, 33 months is
        # 99% of the loan (not more than it) and 34 months is 102% (more than the loan: Damdupat).
        status, body, _ = self._send_wire("POST", "/api/engine/mode-b/restructure", {
            "principal": 100000, "monthlyRatePct": 3.0, "durationMonths": 33})
        self.assertEqual(status, 200)
        self.assertFalse(body["damdupatViolated"])
        status, body, _ = self._send_wire("POST", "/api/engine/mode-b/restructure", {
            "principal": 100000, "monthlyRatePct": 3.0, "durationMonths": 34})
        self.assertEqual(status, 200)
        self.assertTrue(body["damdupatViolated"])
        self.assertIsInstance(body["monthlySavings"], (int, float))

    # 8. Complete 24-Dossier Schema Validation
    def test_08_all_24_dossiers_verified(self):
        status, body, _ = self._send_wire("GET", "/api/dossiers")
        self.assertEqual(status, 200)
        self.assertEqual(body["count"], 24)
        dossiers = body["dossiers"]
        self.assertEqual(len(dossiers), 24)

        seen_codes = set()
        for d in dossiers:
            code = d.get("id") or d.get("code")
            self.assertTrue(bool(code), "Dossier missing id/code")
            seen_codes.add(code)
            self.assertIn("name", d)
            # Updated 13 Nov 2026: the list names each business's group as "basket_name" (no "category").
            self.assertIn("basket_name", d)

            # Test individual dossier endpoint by code
            d_status, d_body, _ = self._send_wire("GET", f"/api/dossiers/{code}")
            self.assertEqual(d_status, 200, f"GET /api/dossiers/{code} returned {d_status}")
            self.assertIn("title", d_body)
            self.assertIn("capex", d_body)
            self.assertIn("opex", d_body)
            self.assertGreater(d_body["capex"], 0, f"Dossier {code} capex <= 0")

        self.assertEqual(len(seen_codes), 24)

    # 9. Adversarial Injection Probes & Boundary Attacks
    def test_09_security_and_injection_probes(self):
        # Path traversal attack
        status, body, _ = self._send_wire("GET", "/api/dossiers/../../engine/server.py")
        self.assertEqual(status, 404)

        # SQL Injection attempt: refused, as a bad request (400) or not found (404) (updated 13 Nov 2026:
        # the server now refuses the malformed address with 400, which is also safe)
        status, body, _ = self._send_wire("GET", "/api/dossiers/' OR 1=1 --")
        self.assertIn(status, (400, 404))

        # XSS Script Injection
        status, body, _ = self._send_wire("GET", "/api/dossiers/<script>alert(1)</script>")
        self.assertEqual(status, 404)

        # Unicode & Emoji in URL
        status, body, _ = self._send_wire("GET", "/api/dossiers/%F0%9F%A6%89")
        self.assertEqual(status, 404)

        # Non-existent HTTP verb
        status, body, _ = self._send_wire("PATCH", "/api/health")
        self.assertIn(status, [404, 405, 501])

        # Massive payload body
        huge_str = "A" * 100000
        status, body, _ = self._send_wire("POST", "/api/engine/nsfdc/calculate", {
            "projectCost": 100000,
            "hugeField": huge_str
        })
        self.assertEqual(status, 200)


if __name__ == "__main__":
    unittest.main()
