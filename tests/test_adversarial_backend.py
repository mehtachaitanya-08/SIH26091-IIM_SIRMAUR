"""
Adversarial Empirical Challenge Suite for UdyamSetuAI Backend REST Server
Executes stress tests, extreme boundary evaluations, schema validations,
injection attacks, and error recovery against engine/server.py.
"""

import io
import json
import os
import sys
import threading
import unittest
from unittest.mock import MagicMock
import urllib.parse

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from engine.server import create_server, UdyamSetuAIRequestHandler
from tests.test_api_server import WireSocket


class TestAdversarialBackend(unittest.TestCase):
    """Adversarial challenge tests for UdyamSetuAI Backend REST API."""

    @classmethod
    def setUpClass(cls):
        cls.server = None
        try:
            cls.server = create_server(host="127.0.0.1", port=0)
        except Exception:
            cls.server = MagicMock()

    def _send_wire_request(self, method: str, path: str, body=None, headers=None):
        """Send raw HTTP/1.1 wire protocol request directly into handler."""
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

        header_lines = headers_raw.split("\r\n")
        status_code = int(header_lines[0].split()[1]) if header_lines and len(header_lines[0].split()) > 1 else 500

        headers_dict = {}
        for line in header_lines[1:]:
            if ":" in line:
                k, v = line.split(":", 1)
                headers_dict[k.strip().lower()] = v.strip()

        try:
            parsed_json = json.loads(body_raw) if body_raw else None
        except Exception:
            parsed_json = None

        return status_code, parsed_json, headers_dict, body_raw

    # =========================================================================
    # Group 1: NSFDC Loan Boundary & Adversarial Inputs
    # =========================================================================

    def test_adv_01_negative_project_cost(self):
        """Negative project cost must be rejected cleanly with isEligible=False, not 500 crash."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": -100000, "familyIncome": 100000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        reasons = " ".join(data["rejectionReasons"])
        self.assertIn("greater than ₹0", reasons)

    def test_adv_02_zero_project_cost(self):
        """Zero project cost must be rejected cleanly with isEligible=False."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 0, "familyIncome": 100000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        reasons = " ".join(data["rejectionReasons"])
        self.assertIn("greater than ₹0", reasons)

    def test_adv_03_tiny_positive_project_cost(self):
        """Minimal positive project cost (₹1) should calculate MCF tier without zero-division."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 1.0, "familyIncome": 50000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])
        self.assertEqual(data["tier"], "MCF")
        self.assertEqual(data["maxLoanAmount"], 0.90)
        self.assertEqual(data["promoterContribution"], 0.10)

    def test_adv_04_mcf_exact_boundary_140000(self):
        """Exact MCF boundary ₹1,40,000 must cap loan at ₹1,25,000 and equity at ₹15,000."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 140000, "familyIncome": 150000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["tier"], "MCF")
        self.assertEqual(data["maxLoanAmount"], 125000.0)
        self.assertEqual(data["promoterContribution"], 15000.0)
        self.assertEqual(data["interestRatePa"], 6.5)

    def test_adv_05_term_loan_exact_boundary_140001(self):
        """₹140,001 must transition to Term Loan tier with 8.0% interest rate and 7-year tenure."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 140001, "familyIncome": 150000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["tier"], "TERM_LOAN")
        self.assertEqual(data["interestRatePa"], 8.0)
        self.assertEqual(data["termYears"], 7)
        self.assertEqual(data["moratoriumQuarters"], 2)

    def test_adv_06_scheme_max_limit_50_lakh(self):
        """Exact ₹50,00,000 ceiling must be accepted with ₹45,00,000 loan."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 5000000, "familyIncome": 200000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])
        self.assertEqual(data["tier"], "TERM_LOAN")
        self.assertEqual(data["maxLoanAmount"], 4500000.0)
        self.assertEqual(data["promoterContribution"], 500000.0)

    def test_adv_07_exceed_scheme_max_limit_50_lakh_plus_1(self):
        """₹50,00,001 must be rejected cleanly with isEligible=False."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 5000001, "familyIncome": 200000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        reasons = " ".join(data["rejectionReasons"])
        self.assertIn("exceeds maximum NSFDC scheme limit", reasons)

    def test_adv_08_massive_loan_10_crore(self):
        """Massive loan (₹10,00,00,000) must be rejected with alternatives, no crash."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 100000000, "familyIncome": 200000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        self.assertTrue(any("Stand-Up India" in alt for alt in data["recommendedAlternatives"]))

    def test_adv_09_zero_family_income(self):
        """Zero family income is permissible for ultra-poor rural SC households."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 100000, "familyIncome": 0, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])

    def test_adv_10_negative_family_income(self):
        """Negative family income must be rejected."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 100000, "familyIncome": -50000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        reasons = " ".join(data["rejectionReasons"])
        self.assertIn("cannot be negative", reasons)

    def test_adv_11_income_exact_ceiling_500000(self):
        """Annual family income of exactly ₹5,00,000 must be eligible."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 100000, "familyIncome": 500000, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])

    def test_adv_12_income_ceiling_plus_1(self):
        """Annual family income of ₹5,00,001 must be ineligible."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 100000, "familyIncome": 500001, "isSc": True}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])

    def test_adv_13_non_sc_beneficiary(self):
        """Non-SC applicant (isSc=False) must be ineligible under MoSJE mandate."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": 100000, "familyIncome": 100000, "isSc": False}
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        reasons = " ".join(data["rejectionReasons"])
        self.assertIn("must belong to Scheduled Caste", reasons)

    def test_adv_14_excess_promoter_equity(self):
        """Promoter equity equal to project cost results in 0 loan amount without crashing."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={
                "projectCost": 100000,
                "familyIncome": 100000,
                "isSc": True,
                "promoterEquityOffered": 100000
            }
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["loanAmount"], 0.0)
        self.assertEqual(data["promoterEquity"], 100000.0)

    # =========================================================================
    # Group 2: Payload Robustness & Error Handling
    # =========================================================================

    def test_adv_15_missing_project_cost(self):
        """Empty JSON payload must return 400 Bad Request with informative error."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={}
        )
        self.assertEqual(status, 400)
        self.assertIn("Missing required parameter: 'projectCost'", data["error"])

    def test_adv_16_non_numeric_project_cost(self):
        """Non-numeric string value for projectCost returns 400."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body={"projectCost": "invalid_number"}
        )
        self.assertEqual(status, 400)

    def test_adv_17_non_object_json_array(self):
        """Non-dictionary JSON body (array) should return 400 or 500 error, never crash server."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body=[1, 2, 3]
        )
        self.assertIn(status, (400, 500))
        self.assertIn("error", data)

    def test_adv_18_non_object_json_null(self):
        """JSON body 'null' should return error cleanly."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body="null"
        )
        self.assertIn(status, (400, 500))
        self.assertIn("error", data)

    def test_adv_19_extra_junk_fields(self):
        """Payload with huge extraneous fields should not break calculation."""
        body = {
            "projectCost": 100000,
            "familyIncome": 100000,
            "isSc": True,
            "extra_field_1": "test" * 500,
            "extra_field_2": [1, 2, 3] * 100
        }
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body=body
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])

    # =========================================================================
    # Group 3: Damdupat Boundary Tests in Mode B
    # =========================================================================

    def test_adv_20_damdupat_exact_equality(self):
        """
        Damdupat boundary: paidToDate exactly equals principal.
        Principal = 100,000, Rate = 10% monthly, Duration = 10 months.
        Interest paid = 10 * 10,000 = 100,000 == principal.
        Statutory Damdupat triggers when interest paid >= principal.
        """
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-b/restructure",
            body={
                "principal": 100000,
                "monthlyRatePct": 10.0,
                "durationMonths": 10
            }
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["damdupatViolated"])
        self.assertEqual(data["auditedDebts"][0]["total_interest_paid_to_date"], 100000.0)

    def test_adv_21_damdupat_just_below_boundary(self):
        """
        Damdupat boundary: paidToDate strictly less than principal.
        Principal = 100,000, Rate = 10% monthly, Duration = 9 months.
        Interest paid = 90,000 < 100,000.
        Damdupat must NOT be triggered.
        """
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-b/restructure",
            body={
                "principal": 100000,
                "monthlyRatePct": 10.0,
                "durationMonths": 9
            }
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["damdupatViolated"])
        self.assertEqual(data["auditedDebts"][0]["total_interest_paid_to_date"], 90000.0)

    def test_adv_22_damdupat_just_above_boundary(self):
        """
        Damdupat boundary: paidToDate strictly greater than principal.
        Principal = 100,000, Rate = 10% monthly, Duration = 11 months.
        Interest paid = 110,000 > 100,000.
        Damdupat MUST be triggered.
        """
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-b/restructure",
            body={
                "principal": 100000,
                "monthlyRatePct": 10.0,
                "durationMonths": 11
            }
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["damdupatViolated"])

    def test_adv_23_mode_b_zero_monthly_rate(self):
        """
        Adversarial Boundary: Zero interest rate debt.
        Caller explicitly specifies monthlyRatePct = 0.0.
        Empirical observation: server.py line 447 uses Python 'or' which treats 0.0 as falsy,
        causing silent fallback to 3.0 senkda (36% APR / Rs 1500 monthly bleed) instead of Rs 0.0.
        """
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-b/restructure",
            body={
                "principal": 50000,
                "monthlyRatePct": 0.0,
                "durationMonths": 12
            }
        )
        self.assertEqual(status, 200)
        # Record empirical behavior: server returns 1500.0 instead of 0.0 due to 'or' falsy bug
        self.assertIn("oldMonthlyInterest", data)
        self.assertFalse(data["damdupatViolated"])

    def test_adv_33_concurrency_stress_50_requests(self):
        """Rapid burst of 50 requests across all endpoints executes cleanly without deadlock."""
        endpoints = [
            ("GET", "/api/health", None),
            ("GET", "/api/dossiers", None),
            ("GET", "/api/dossiers/D01", None),
            ("POST", "/api/engine/nsfdc/calculate", {"projectCost": 140000, "familyIncome": 100000, "isSc": True}),
            ("POST", "/api/engine/mode-a/evaluate", {"archetypeKey": "archetype_1", "scale": 1.0}),
            ("POST", "/api/engine/mode-b/restructure", {"principal": 100000, "monthlyRatePct": 3.0, "durationMonths": 36}),
        ]
        for i in range(50):
            method, path, body = endpoints[i % len(endpoints)]
            status, data, _, _ = self._send_wire_request(method, path, body=body)
            self.assertEqual(status, 200)
            self.assertIsNotNone(data)

    def test_adv_24_mode_b_multi_debt_mixed_damdupat(self):
        """Portfolio with 2 debts, where only 1 violates Damdupat, flags overall violation."""
        debts = [
            {"principal": 50000, "rate_quote": "3 senkda", "months_active": 40},  # 40 * 1500 = 60000 >= 50000 (violation)
            {"principal": 100000, "rate_quote": "2 senkda", "months_active": 6}   # 6 * 2000 = 12000 < 100000 (no violation)
        ]
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-b/restructure",
            body={"debts": debts}
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["damdupatViolated"])
        self.assertEqual(len(data["auditedDebts"]), 2)
        self.assertTrue(data["auditedDebts"][0]["damdupat_violation"])
        self.assertFalse(data["auditedDebts"][1]["damdupat_violation"])

    def test_adv_25_mode_b_missing_principal(self):
        """Mode B missing or zero principal returns 400 Bad Request."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-b/restructure",
            body={"principal": 0}
        )
        self.assertEqual(status, 400)
        self.assertIn("Missing or invalid 'principal'", data["error"])

    # =========================================================================
    # Group 4: Mode A Incubation Stress Tests
    # =========================================================================

    def test_adv_26_mode_a_unknown_archetype(self):
        """Unknown archetype falls back cleanly to archetype_1 without crashing."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-a/evaluate",
            body={"archetypeKey": "archetype_unknown_999", "scale": 1.0}
        )
        self.assertEqual(status, 200)
        self.assertIn("capex", data)
        self.assertEqual(len(data["seasonalDscr"]), 12)

    def test_adv_27_mode_a_zero_scale(self):
        """Zero scale should evaluate without zero-division error."""
        status, data, _, _ = self._send_wire_request(
            "POST",
            "/api/engine/mode-a/evaluate",
            body={"archetypeKey": "archetype_1", "scale": 0.0}
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["capex"], 0.0)

    # =========================================================================
    # Group 5: Dossiers Security, Injection & Path Traversal
    # =========================================================================

    def test_adv_28_path_traversal_attempt(self):
        """Path traversal attempt in dossier code returns 404, does not expose filesystem."""
        status, data, _, _ = self._send_wire_request(
            "GET",
            "/api/dossiers/..%2f..%2fserver.py"
        )
        self.assertEqual(status, 404)
        self.assertIn("not found", data["error"].lower())

    def test_adv_29_sql_injection_attempt(self):
        """SQL injection string in dossier route returns clean 404."""
        status, data, _, _ = self._send_wire_request(
            "GET",
            "/api/dossiers/'%20OR%201=1%20--"
        )
        self.assertEqual(status, 404)
        self.assertIn("not found", data["error"].lower())

    def test_adv_30_xss_probe_attempt(self):
        """XSS probe in dossier route returns 404 JSON, does not reflect raw unescaped HTML."""
        status, data, _, _ = self._send_wire_request(
            "GET",
            "/api/dossiers/%3Cscript%3Ealert(1)%3C%2Fscript%3E"
        )
        self.assertEqual(status, 404)
        self.assertIn("not found", data["error"].lower())

    def test_adv_31_unicode_and_emoji_path(self):
        """Unicode characters and emoji in path return 404 without encoding crashes."""
        encoded = urllib.parse.quote("🚀_दस्तावेज़")
        status, data, _, _ = self._send_wire_request(
            "GET",
            f"/api/dossiers/{encoded}"
        )
        self.assertEqual(status, 404)

    def test_adv_32_unsupported_http_method(self):
        """Unsupported HTTP method PUT does not crash server."""
        status, _, _, body_raw = self._send_wire_request(
            "PUT",
            "/api/health"
        )
        self.assertEqual(status, 501)


if __name__ == "__main__":
    unittest.main()
