"""
Comprehensive Unit Test Suite for UdyamSetuAI Backend REST Server
Tests endpoints:
- GET /api/health
- GET /health
- POST /api/engine/nsfdc/calculate
- POST /api/engine/mode-a/evaluate
- POST /api/engine/mode-b/restructure
- GET /api/dossiers
- GET /api/dossiers/<code_or_query>
- OPTIONS preflight and CORS headers
- Error handling (400, 404, invalid JSON)

Zero external dependencies: Uses standard library unittest, http.server, and io.
"""

import io
import json
import os
import sys
import threading
import time
import unittest
import urllib.error
import urllib.request
from unittest.mock import MagicMock

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from engine.server import create_server, UdyamSetuAIRequestHandler


class WireSocket:
    """Mock socket passing real HTTP/1.1 wire protocol data to and from request handlers."""
    def __init__(self, data: bytes):
        self.rfile = io.BytesIO(data)
        self.wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        return self.rfile if "r" in mode else self.wfile

    def sendall(self, data: bytes):
        self.wfile.write(data)


class TestUdyamSetuAIServer(unittest.TestCase):
    """Rigorous unit and integration test suite for UdyamSetuAI REST API."""

    server = None
    server_thread = None
    can_socket_connect = False
    base_url = "http://127.0.0.1:8000"

    @classmethod
    def setUpClass(cls):
        """Start the server in a daemon thread and detect network environment."""
        try:
            cls.server = create_server(host="127.0.0.1", port=8000)
            cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
            cls.server_thread.start()
        except OSError:
            # Port might be in use or restricted; try ephemeral port
            try:
                cls.server = create_server(host="127.0.0.1", port=0)
                cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
                cls.server_thread.start()
                port = cls.server.server_address[1]
                cls.base_url = f"http://127.0.0.1:{port}"
            except Exception:
                cls.server = None

        # Check if environment permits outbound TCP socket connections to localhost
        cls.can_socket_connect = False
        if cls.server:
            try:
                with urllib.request.urlopen(f"{cls.base_url}/api/health", timeout=0.5) as resp:
                    if resp.status == 200:
                        cls.can_socket_connect = True
            except Exception:
                cls.can_socket_connect = False

    @classmethod
    def tearDownClass(cls):
        """Shut down the server instance cleanly."""
        if cls.server:
            try:
                cls.server.shutdown()
                cls.server.server_close()
            except Exception:
                pass

    def _send_request(self, method: str, path: str, body=None, headers=None):
        """
        Execute request either via live HTTP socket (if permitted by OS sandbox)
        or via HTTP wire protocol client into UdyamSetuAIRequestHandler.
        """
        req_headers = dict(headers or {})
        body_bytes = b""
        if body is not None:
            if isinstance(body, (dict, list)):
                body_bytes = json.dumps(body).encode("utf-8")
                if "Content-Type" not in req_headers:
                    req_headers["Content-Type"] = "application/json"
            elif isinstance(body, str):
                body_bytes = body.encode("utf-8")
            req_headers["Content-Length"] = str(len(body_bytes))

        if self.can_socket_connect:
            url = f"{self.base_url}{path}"
            req = urllib.request.Request(url, data=body_bytes if body_bytes else None, headers=req_headers, method=method)
            try:
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    status = resp.status
                    raw = resp.read().decode("utf-8", errors="replace")
                    try:
                        parsed = json.loads(raw)
                    except Exception:
                        parsed = None
                    return status, parsed, dict(resp.headers)
            except urllib.error.HTTPError as e:
                raw = e.read().decode("utf-8", errors="replace")
                try:
                    parsed = json.loads(raw)
                except Exception:
                    parsed = None
                return e.code, parsed, dict(e.headers)

        # Wire protocol test execution
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

        return status_code, parsed_json, headers_dict

    # -------------------------------------------------------------------------
    # 1. Health Endpoint Tests
    # -------------------------------------------------------------------------

    def test_01_health_endpoint(self):
        """GET /api/health returns 200 with engines and ISO timestamp."""
        status, data, _ = self._send_request("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["version"], "1.0.0")
        self.assertIn("timestamp", data)
        self.assertIn("engines", data)
        self.assertEqual(data["engines"]["nsfdc_calculator"], "2.0.0")
        self.assertEqual(data["engines"]["multi_archetype_financial_engine"], "2.0.0")
        self.assertEqual(data["engines"]["total_dossiers"], 24)

    def test_02_health_alias_endpoint(self):
        """GET /health alias returns 200 with matching structure."""
        status, data, _ = self._send_request("GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "ok")

    # -------------------------------------------------------------------------
    # 2. CORS Preflight Tests
    # -------------------------------------------------------------------------

    def test_03_cors_preflight(self):
        """OPTIONS request returns 204 with required CORS headers."""
        status, _, headers = self._send_request("OPTIONS", "/api/health")
        self.assertIn(status, (200, 204))
        # Header names are case-insensitive; the server sends "Access-Control-Allow-Origin" (the test looked
        # it up only in lower case, so it always read None: a test fault, fixed 13 Nov 2026).
        headers = {k.lower(): v for k, v in headers.items()}
        origin = headers.get("access-control-allow-origin")
        self.assertEqual(origin, "*")
        methods = headers.get("access-control-allow-methods")
        self.assertIn("POST", methods)
        self.assertIn("GET", methods)

    # -------------------------------------------------------------------------
    # 3. NSFDC Calculator Endpoint Tests
    # -------------------------------------------------------------------------

    def test_04_nsfdc_calculate_mcf(self):
        """POST /api/engine/nsfdc/calculate for MCF applies 90% loan capped at ₹1,25,000."""
        body = {
            "projectCost": 140000,
            "familyIncome": 120000,
            "isSc": True
        }
        status, data, _ = self._send_request("POST", "/api/engine/nsfdc/calculate", body=body)
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])
        self.assertEqual(data["tier"], "MCF")
        self.assertEqual(data["maxLoanAmount"], 125000.0)
        self.assertEqual(data["loanAmount"], 125000.0)
        self.assertEqual(data["promoterContribution"], 15000.0)
        self.assertEqual(data["interestRatePa"], 6.5)
        self.assertEqual(data["termYears"], 3)
        self.assertEqual(data["moratoriumQuarters"], 1)
        self.assertEqual(data["repaymentQuarters"], 11)
        self.assertEqual(len(data["amortizationSchedule"]), 12)
        q1 = data["amortizationSchedule"][0]
        self.assertTrue(q1["isMoratorium"])
        self.assertEqual(q1["principalPayment"], 0.0)
        self.assertGreater(q1["interestPayment"], 0.0)

    def test_05_nsfdc_calculate_term_loan(self):
        """POST /api/engine/nsfdc/calculate for Term Loan applies 90% loan @ 8.0%."""
        body = {
            "projectCost": 680000,
            "familyIncome": 250000,
            "isSc": True
        }
        status, data, _ = self._send_request("POST", "/api/engine/nsfdc/calculate", body=body)
        self.assertEqual(status, 200)
        self.assertTrue(data["isEligible"])
        self.assertEqual(data["tier"], "TERM_LOAN")
        self.assertEqual(data["maxLoanAmount"], 612000.0)
        self.assertEqual(data["promoterContribution"], 68000.0)
        self.assertEqual(data["interestRatePa"], 8.0)
        self.assertEqual(data["termYears"], 7)
        self.assertEqual(data["moratoriumQuarters"], 2)
        self.assertEqual(data["repaymentQuarters"], 26)
        self.assertEqual(len(data["amortizationSchedule"]), 28)
        self.assertTrue(data["amortizationSchedule"][0]["isMoratorium"])
        self.assertTrue(data["amortizationSchedule"][1]["isMoratorium"])
        self.assertFalse(data["amortizationSchedule"][2]["isMoratorium"])

    def test_06_nsfdc_income_ceiling_ineligible(self):
        """POST /api/engine/nsfdc/calculate rejects family income > ₹5,00,000."""
        body = {
            "projectCost": 120000,
            "familyIncome": 600000,
            "isSc": True
        }
        status, data, _ = self._send_request("POST", "/api/engine/nsfdc/calculate", body=body)
        self.assertEqual(status, 200)
        self.assertFalse(data["isEligible"])
        self.assertGreater(len(data["rejectionReasons"]), 0)
        self.assertGreater(len(data["recommendedAlternatives"]), 0)
        reasons_text = " ".join(data["rejectionReasons"])
        self.assertIn("exceeds statutory NSFDC ceiling", reasons_text)

    # -------------------------------------------------------------------------
    # 4. Mode A Incubation Appraisal Tests
    # -------------------------------------------------------------------------

    def test_07_mode_a_evaluate(self):
        """POST /api/engine/mode-a/evaluate returns CapEx, OpEx, seasonal DSCR, and PMEGP subsidy."""
        body = {
            "archetypeKey": "archetype_1",
            "scale": 1.0
        }
        status, data, _ = self._send_request("POST", "/api/engine/mode-a/evaluate", body=body)
        self.assertEqual(status, 200)
        self.assertIn("capex", data)
        self.assertIn("monthlyOpex", data)
        self.assertIn("revenue", data)
        self.assertIn("seasonalDscr", data)
        self.assertIn("grantSubsidy", data)
        self.assertEqual(len(data["seasonalDscr"]), 12)
        self.assertEqual(data["grantSubsidy"], 336000.0)

    def test_08_mode_a_evaluate_scaled(self):
        """POST /api/engine/mode-a/evaluate respects scale factor."""
        body = {
            "archetypeKey": "archetype_1",
            "scale": 1.5
        }
        status, data, _ = self._send_request("POST", "/api/engine/mode-a/evaluate", body=body)
        self.assertEqual(status, 200)
        self.assertGreater(data["capex"], 650000.0)
        self.assertGreater(data["grantSubsidy"], 336000.0)

    # -------------------------------------------------------------------------
    # 5. Mode B Debt Restructuring & Damdupat Tests
    # -------------------------------------------------------------------------

    def test_09_mode_b_restructure_damdupat_triggered(self):
        """POST /api/engine/mode-b/restructure detects Damdupat violation."""
        body = {
            "principal": 120000,
            "monthlyRatePct": 3.0,  # 3 senkda (36% APR) -> ₹3,600/month
            "durationMonths": 36    # 36 * 3,600 = ₹1,29,600 >= ₹1,20,000
        }
        status, data, _ = self._send_request("POST", "/api/engine/mode-b/restructure", body=body)
        self.assertEqual(status, 200)
        self.assertEqual(data["oldMonthlyInterest"], 3600.0)
        self.assertGreater(data["newMonthlyEmi"], 0.0)
        self.assertTrue(data["damdupatViolated"])
        self.assertIn("liberationMetrics", data)
        self.assertIn("refinancingPlan", data)

    def test_10_mode_b_restructure_damdupat_not_triggered(self):
        """POST /api/engine/mode-b/restructure flags false when interest paid < principal."""
        body = {
            "principal": 120000,
            "monthlyRatePct": 3.0,
            "durationMonths": 10    # 10 * 3,600 = ₹36,000 < ₹1,20,000
        }
        status, data, _ = self._send_request("POST", "/api/engine/mode-b/restructure", body=body)
        self.assertEqual(status, 200)
        self.assertFalse(data["damdupatViolated"])

    # -------------------------------------------------------------------------
    # 6. Dossiers Database Tests
    # -------------------------------------------------------------------------

    def test_11_get_all_dossiers(self):
        """GET /api/dossiers returns all 24 empirical dossiers."""
        status, data, _ = self._send_request("GET", "/api/dossiers")
        self.assertEqual(status, 200)
        self.assertEqual(data["count"], 24)
        self.assertEqual(len(data["dossiers"]), 24)
        codes = [d["code"] for d in data["dossiers"]]
        self.assertIn("D01", codes)
        self.assertIn("D08", codes)
        self.assertIn("D18", codes)
        self.assertIn("D24", codes)

    def test_12_get_dossier_by_code(self):
        """GET /api/dossiers/D08 returns Oil Expellers & Kachhi Ghani with CapEx and OpEx."""
        status, data, _ = self._send_request("GET", "/api/dossiers/D08")
        self.assertEqual(status, 200)
        self.assertEqual(data["code"], "D08")
        self.assertTrue("Oil Expellers" in data["name"] or "Kachhi Ghani" in data["name"])
        self.assertIn("title", data)
        self.assertIn("capex", data)
        self.assertIn("opex", data)

    def test_13_get_dossier_case_insensitive(self):
        """GET /api/dossiers/d18 works case-insensitively."""
        status, data, _ = self._send_request("GET", "/api/dossiers/d18")
        self.assertEqual(status, 200)
        self.assertEqual(data["code"], "D18")
        self.assertIn("Tailoring", data["name"])

    def test_14_get_dossier_not_found(self):
        """GET /api/dossiers/D99 returns 404 with availableCodes list."""
        status, data, _ = self._send_request("GET", "/api/dossiers/D99")
        self.assertEqual(status, 404)
        self.assertIn("not found", data["error"].lower())
        self.assertIn("availableCodes", data["details"])

    # -------------------------------------------------------------------------
    # 7. Error Handling Tests
    # -------------------------------------------------------------------------

    def test_15_invalid_json(self):
        """Malformed JSON request body returns 400."""
        status, data, _ = self._send_request(
            "POST",
            "/api/engine/nsfdc/calculate",
            body="{ invalid json"
        )
        self.assertEqual(status, 400)
        self.assertIn("Invalid JSON", data["error"])

    def test_16_not_found_route(self):
        """Request to unknown route returns 404."""
        status, data, _ = self._send_request("GET", "/api/unknown_engine/route")
        self.assertEqual(status, 404)
        self.assertIn("not found", data["error"].lower())

    def test_17_get_mandi_prices(self):
        """GET /api/mandi-prices returns Agmarknet spot commodity records."""
        status, data, _ = self._send_request("GET", "/api/mandi-prices?commodity=Mustard&state=Uttar+Pradesh")
        self.assertEqual(status, 200)
        self.assertEqual(data["commodity"], "Mustard")
        self.assertEqual(data["state"], "Uttar Pradesh")
        self.assertIn("modalPrice", data)
        self.assertGreater(data["modalPrice"], 0)
        self.assertIn("records", data)
        self.assertGreater(len(data["records"]), 0)


if __name__ == "__main__":
    unittest.main()
