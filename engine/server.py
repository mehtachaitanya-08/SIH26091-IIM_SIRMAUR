"""
GraminAI Backend REST API Server
Zero-Dependency Python HTTP Service exposing deterministic calculation engines:
- Statutory NSFDC Dual-Tier Credit Calculator (engine/nsfdc_calculator.py)
- Multi-Archetype Financial Engine: Mode A Incubation & Mode B Restructuring (engine/multi_archetype_financial_engine.py)
- Verified Empirical Rural MSME Dossiers Database (data/dossiers_db.json)

Zero external dependencies: Uses Python standard library http.server and socketserver.
"""

from datetime import datetime, timezone
import json
import logging
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

# Ensure project root and engine directory are in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

try:
    from engine.nsfdc_calculator import (
        NSFDCCalculator,
        BeneficiaryProfile,
        NSFDCTier,
        LoanStructure,
        AmortizationSchedule
    )
    from engine.multi_archetype_financial_engine import (
        IncubationEngine,
        RestructuringEngine,
        ARCHETYPES
    )
except ImportError:
    from nsfdc_calculator import (
        NSFDCCalculator,
        BeneficiaryProfile,
        NSFDCTier,
        LoanStructure,
        AmortizationSchedule
    )
    from multi_archetype_financial_engine import (
        IncubationEngine,
        RestructuringEngine,
        ARCHETYPES
    )

logger = logging.getLogger("GraminAI.Server")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Load Dossiers Database
DOSSIERS_PATH = os.path.join(PROJECT_ROOT, "data", "dossiers_db.json")

def load_dossiers():
    """Load empirical dossiers database from disk."""
    if not os.path.exists(DOSSIERS_PATH):
        logger.warning(f"Dossiers database not found at {DOSSIERS_PATH}")
        return {}, {}
    try:
        with open(DOSSIERS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            metadata = data.get("metadata", {})
            dossiers = data.get("dossiers", {})
            return metadata, dossiers
    except Exception as e:
        logger.error(f"Failed to load dossiers database: {e}")
        return {}, {}

DOSSIERS_METADATA, DOSSIERS_MAP = load_dossiers()
DOSSIERS_LIST = list(DOSSIERS_MAP.values())


class GraminAIRequestHandler(BaseHTTPRequestHandler):
    """Zero-dependency HTTP request handler for GraminAI calculation engines."""

    server_version = "GraminAI-HTTP/1.0.0"

    def log_message(self, format, *args):
        """Clean standard request logging."""
        logger.info(f"{self.client_address[0]} - {args[0]} {args[1]}")

    def _set_cors_headers(self, status_code=200, content_type="application/json"):
        """Attach standard CORS and content type headers."""
        self.send_response(status_code)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def _send_json(self, data, status_code=200):
        """Serialize and send JSON payload."""
        payload = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self._set_cors_headers(status_code=status_code, content_type="application/json")
        self.wfile.write(payload)

    def _send_error(self, message, status_code=400, details=None):
        """Send formatted JSON error response."""
        err_body = {
            "error": message,
            "status": status_code,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        if details:
            err_body["details"] = details
        self._send_json(err_body, status_code=status_code)

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_GET(self):
        """Handle GET requests."""
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"

        # 1. Healthcheck
        if path in ("/api/health", "/health"):
            self._handle_health()
            return

        # 2. All dossiers
        if path in ("/api/dossiers", "/dossiers"):
            self._handle_get_dossiers()
            return

        # 3. Specific dossier by code
        if path.startswith("/api/dossiers/") or path.startswith("/dossiers/"):
            parts = path.split("/")
            code = unquote(parts[-1]).strip().upper()
            self._handle_get_dossier_by_code(code)
            return

        self._send_error(f"Route not found: {self.path}", status_code=404)

    def do_POST(self):
        """Handle POST requests."""
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        # Read JSON body
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            self._send_error("Request body is empty", status_code=400)
            return

        try:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(raw_body)
        except json.JSONDecodeError as e:
            self._send_error("Invalid JSON in request body", status_code=400, details=str(e))
            return
        except Exception as e:
            self._send_error("Failed to read request body", status_code=400, details=str(e))
            return

        # Route endpoints
        if path in ("/api/engine/nsfdc/calculate", "/engine/nsfdc/calculate"):
            self._handle_nsfdc_calculate(body)
            return

        if path in ("/api/engine/mode-a/evaluate", "/engine/mode-a/evaluate"):
            self._handle_mode_a_evaluate(body)
            return

        if path in ("/api/engine/mode-b/restructure", "/engine/mode-b/restructure"):
            self._handle_mode_b_restructure(body)
            return

        self._send_error(f"Route not found: {self.path}", status_code=404)

    # -------------------------------------------------------------------------
    # Route Handlers
    # -------------------------------------------------------------------------

    def _handle_health(self):
        """Return service health status and engine versions."""
        self._send_json({
            "status": "ok",
            "version": "1.0.0",
            "service": "GraminAI Deterministic Financial Engine",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "engines": {
                "nsfdc_calculator": "2.0.0",
                "multi_archetype_financial_engine": "2.0.0",
                "dossiers_db": "2.0.0",
                "total_dossiers": len(DOSSIERS_MAP)
            }
        })

    def _handle_get_dossiers(self):
        """Return list of all 24 empirical dossiers."""
        self._send_json({
            "count": len(DOSSIERS_LIST),
            "dossiers": DOSSIERS_LIST,
            "metadata": DOSSIERS_METADATA
        })

    def _handle_get_dossier_by_code(self, code: str):
        """Return a single dossier by code (e.g. D01, D08)."""
        dossier = DOSSIERS_MAP.get(code)
        if not dossier:
            for k, v in DOSSIERS_MAP.items():
                if k.upper() == code:
                    dossier = v
                    break

        if not dossier:
            self._send_error(
                f"Dossier '{code}' not found",
                status_code=404,
                details={"availableCodes": list(DOSSIERS_MAP.keys())}
            )
            return

        # Augment with top-level convenience attributes matching PROJECT.md interface contract
        out = dict(dossier)
        mcf_tier = dossier.get("capex_financing", {}).get("micro_finance_tier", {})
        term_tier = dossier.get("capex_financing", {}).get("term_loan_tier", {})
        capex_val = mcf_tier.get("project_cost") or term_tier.get("project_cost") or 0.0
        opex_val = dossier.get("opex_and_working_capital", {}).get("monthly_cash_opex", 0.0)

        out["title"] = dossier.get("name")
        out["capex"] = capex_val
        out["opex"] = opex_val
        self._send_json(out)

    def _handle_nsfdc_calculate(self, body: dict):
        """
        Execute deterministic statutory NSFDC credit calculations.
        Accepts: { projectCost, familyIncome, isSc, promoterEquityOffered }
        """
        try:
            raw_cost = body.get("projectCost", body.get("project_cost"))
            if raw_cost is None:
                self._send_error("Missing required parameter: 'projectCost'", status_code=400)
                return
            project_cost = float(raw_cost)

            raw_income = body.get("familyIncome", body.get("family_income", body.get("annual_family_income", 0.0)))
            family_income = float(raw_income)

            is_sc = bool(body.get("isSc", body.get("is_sc", True)))
            promoter_equity = body.get("promoterEquityOffered", body.get("promoter_equity_offered"))
            if promoter_equity is not None:
                promoter_equity = float(promoter_equity)

            calc = NSFDCCalculator()
            profile = BeneficiaryProfile(
                is_sc=is_sc,
                annual_family_income=family_income,
                project_cost=project_cost,
                promoter_equity_offered=promoter_equity
            )

            eligibility = calc.check_eligibility(profile)

            if not eligibility.is_eligible:
                self._send_json({
                    "isEligible": False,
                    "is_eligible": False,
                    "rejectionReasons": eligibility.rejection_reasons,
                    "rejection_reasons": eligibility.rejection_reasons,
                    "recommendedAlternatives": eligibility.recommended_alternatives,
                    "recommended_alternatives": eligibility.recommended_alternatives,
                    "projectCost": project_cost,
                    "familyIncome": family_income
                })
                return

            structure = calc.calculate_loan_structure(profile)
            schedule = calc.generate_amortization_schedule(structure)

            amort_list = []
            for q in schedule.quarters:
                amort_list.append({
                    "quarter": q.quarter,
                    "isMoratorium": q.is_moratorium,
                    "is_moratorium": q.is_moratorium,
                    "openingBalance": q.opening_balance,
                    "opening_balance": q.opening_balance,
                    "interestPayment": q.interest_payment,
                    "interest_payment": q.interest_payment,
                    "principalPayment": q.principal_payment,
                    "principal_payment": q.principal_payment,
                    "totalInstallment": q.total_installment,
                    "total_installment": q.total_installment,
                    "closingBalance": q.closing_balance,
                    "closing_balance": q.closing_balance
                })

            response_data = {
                "isEligible": True,
                "is_eligible": True,
                "tier": structure.tier.value,
                "schemeName": structure.scheme_name,
                "scheme_name": structure.scheme_name,
                "projectCost": structure.project_cost,
                "project_cost": structure.project_cost,
                "maxLoanAmount": structure.loan_amount,
                "loanAmount": structure.loan_amount,
                "loan_amount": structure.loan_amount,
                "promoterContribution": structure.promoter_equity,
                "promoterEquity": structure.promoter_equity,
                "promoter_equity": structure.promoter_equity,
                "promoterEquityPct": structure.promoter_equity_pct,
                "promoter_equity_pct": structure.promoter_equity_pct,
                "interestRatePa": structure.interest_rate_pa,
                "interest_rate_pa": structure.interest_rate_pa,
                "quarterlyInterestRate": structure.quarterly_interest_rate,
                "quarterly_interest_rate": structure.quarterly_interest_rate,
                "termYears": structure.tenure_years,
                "tenureYears": structure.tenure_years,
                "tenure_years": structure.tenure_years,
                "totalQuarters": structure.total_quarters,
                "total_quarters": structure.total_quarters,
                "moratoriumQuarters": structure.moratorium_quarters,
                "moratorium_quarters": structure.moratorium_quarters,
                "repaymentQuarters": structure.repayment_quarters,
                "repayment_quarters": structure.repayment_quarters,
                "equatedQuarterlyInstallment": schedule.equated_quarterly_installment,
                "equated_quarterly_installment": schedule.equated_quarterly_installment,
                "totalPrincipalPaid": schedule.total_principal_paid,
                "total_principal_paid": schedule.total_principal_paid,
                "totalInterestPaid": schedule.total_interest_paid,
                "total_interest_paid": schedule.total_interest_paid,
                "totalDebtService": schedule.total_debt_service,
                "total_debt_service": schedule.total_debt_service,
                "amortizationSchedule": amort_list,
                "amortization_schedule": amort_list
            }
            self._send_json(response_data)

        except ValueError as ve:
            self._send_error(str(ve), status_code=400)
        except Exception as e:
            logger.exception("Error in NSFDCCalculate")
            self._send_error(f"Calculation failed: {str(e)}", status_code=500)

    def _handle_mode_a_evaluate(self, body: dict):
        """
        Execute Mode A incubation project appraisal across archetypes.
        Accepts: { archetypeKey, scale, state, capexOverride, monthlyOpexOverride, monthlyRevenueOverride }
        """
        try:
            archetype_key = body.get("archetypeKey") or body.get("archetype_key") or body.get("archetypeId") or body.get("archetype_id") or "archetype_1"
            scale = float(body.get("scale", 1.0))
            state = body.get("state", "Uttar Pradesh")
            capex_override = body.get("capexOverride") or body.get("capex_override")
            working_capital_override = body.get("workingCapitalOverride") or body.get("working_capital_override")
            monthly_revenue_override = body.get("monthlyRevenueOverride") or body.get("monthly_revenue_override")
            monthly_opex_override = body.get("monthlyOpexOverride") or body.get("monthly_opex_override")
            promoter_category = body.get("promoterCategory") or body.get("promoter_category") or "special"
            location_type = body.get("locationType") or body.get("location_type") or "rural"
            custom_loan_tenure_months = int(body.get("customLoanTenureMonths") or body.get("custom_loan_tenure_months") or 60)
            base_interest_rate_pct = float(body.get("baseInterestRatePct") or body.get("base_interest_rate_pct") or 9.5)

            arch_def = ARCHETYPES.get(archetype_key, ARCHETYPES.get("archetype_1", {}))
            if scale != 1.0:
                if capex_override is None and "default_capex" in arch_def:
                    capex_override = arch_def["default_capex"] * scale
                if monthly_opex_override is None and "default_opex_monthly" in arch_def:
                    monthly_opex_override = arch_def["default_opex_monthly"] * scale
                if monthly_revenue_override is None and "default_turnover_monthly" in arch_def:
                    monthly_revenue_override = arch_def["default_turnover_monthly"] * scale

            eval_res = IncubationEngine.evaluate_project(
                archetype_id=archetype_key,
                state=state,
                capex_override=float(capex_override) if capex_override is not None else None,
                working_capital_override=float(working_capital_override) if working_capital_override is not None else None,
                monthly_revenue_override=float(monthly_revenue_override) if monthly_revenue_override is not None else None,
                monthly_opex_override=float(monthly_opex_override) if monthly_opex_override is not None else None,
                promoter_category=promoter_category,
                location_type=location_type,
                custom_loan_tenure_months=custom_loan_tenure_months,
                base_interest_rate_pct=base_interest_rate_pct
            )

            fin_sum = eval_res.get("financial_summary", {})
            scheme_det = eval_res.get("scheme_details", {})
            dscr_met = eval_res.get("dscr_metrics", {})
            monthly_flows = eval_res.get("monthly_cash_flows", [])
            seasonal_dscr = [m.get("dscr", 0.0) for m in monthly_flows]

            monthly_opex = monthly_opex_override or (arch_def.get("default_opex_monthly", 0.0) * scale)
            monthly_rev = monthly_revenue_override or (arch_def.get("default_turnover_monthly", 0.0) * scale)

            response_data = {
                "capex": fin_sum.get("capex", 0.0),
                "totalProjectCost": fin_sum.get("total_project_cost", 0.0),
                "monthlyOpex": monthly_opex,
                "revenue": monthly_rev,
                "seasonalDscr": seasonal_dscr,
                "grantSubsidy": scheme_det.get("subsidy_amount", 0.0),
                "promoterEquity": fin_sum.get("promoter_equity", 0.0),
                "bankLoanPrincipal": fin_sum.get("bank_loan_principal", 0.0),
                "monthlyEmi": fin_sum.get("monthly_emi", 0.0),
                "archetypeId": eval_res.get("archetype_id"),
                "archetypeName": eval_res.get("archetype_name"),
                "sector": eval_res.get("sector"),
                "state": eval_res.get("state"),
                "financialSummary": fin_sum,
                "financial_summary": fin_sum,
                "schemeDetails": scheme_det,
                "scheme_details": scheme_det,
                "dscrMetrics": dscr_met,
                "dscr_metrics": dscr_met,
                "monthlyCashFlows": monthly_flows,
                "monthly_cash_flows": monthly_flows
            }
            self._send_json(response_data)

        except ValueError as ve:
            self._send_error(str(ve), status_code=400)
        except Exception as e:
            logger.exception("Error in ModeAEvaluate")
            self._send_error(f"Mode A evaluation failed: {str(e)}", status_code=500)

    def _handle_mode_b_restructure(self, body: dict):
        """
        Execute Mode B Moneylender debt restructuring and Damdupat legal audit.
        Accepts: { principal, monthlyRatePct, durationMonths, householdMonthlyIncome, refinancingPathway }
        or: { debts: [ ... ] }
        """
        try:
            debts = body.get("debts")
            principal = float(body.get("principal", 0.0))
            monthly_rate_pct = float(body.get("monthlyRatePct") or body.get("monthly_rate_pct") or 3.0)
            duration_months = int(body.get("durationMonths") or body.get("duration_months") or body.get("monthsActive") or body.get("months_active") or 36)
            household_income = float(body.get("householdMonthlyIncome") or body.get("household_monthly_income") or body.get("householdIncome") or 35000.0)
            pathway = body.get("refinancingPathway") or body.get("refinancing_pathway") or body.get("pathway") or "MUDRA_KISHOR"
            tenure_months = int(body.get("refinanceTenureMonths") or body.get("refinance_tenure_months") or body.get("tenureMonths") or 36)

            if not debts:
                if principal <= 0:
                    self._send_error("Missing or invalid 'principal' amount", status_code=400)
                    return
                rate_quote = body.get("rateQuote") or body.get("rate_quote") or f"{monthly_rate_pct} senkda"
                debts = [{
                    "principal": principal,
                    "rate_quote": rate_quote,
                    "lender_type": body.get("lenderType", "Village Moneylender"),
                    "collateral": body.get("collateral", "None"),
                    "months_active": duration_months
                }]

            portfolio_result = RestructuringEngine.evaluate_portfolio(
                debts=debts,
                household_monthly_income=household_income,
                refinancing_pathway=pathway,
                refinance_tenure_months=tenure_months
            )

            audited = portfolio_result.get("audited_debts", [])
            damdupat_violated = any(d.get("damdupat_violation", False) for d in audited)

            plan = portfolio_result.get("refinancing_plan", {})
            metrics = portfolio_result.get("liberation_metrics", {})
            legal = portfolio_result.get("legal_remedy_summary", {})

            old_monthly_interest = portfolio_result.get("current_monthly_interest_bleed", 0.0)
            new_monthly_emi = plan.get("new_monthly_amortizing_emi", 0.0)
            monthly_savings = metrics.get("monthly_cash_flow_relief", 0.0)

            response_data = {
                "oldMonthlyInterest": old_monthly_interest,
                "old_monthly_interest": old_monthly_interest,
                "newMonthlyEmi": new_monthly_emi,
                "new_monthly_emi": new_monthly_emi,
                "monthlySavings": monthly_savings,
                "monthly_savings": monthly_savings,
                "damdupatViolated": damdupat_violated,
                "damdupat_violated": damdupat_violated,
                "totalDebtConsolidated": portfolio_result.get("total_debt_consolidated", 0.0),
                "weightedInformalAprPct": portfolio_result.get("weighted_informal_apr_pct", 0.0),
                "auditedDebts": audited,
                "audited_debts": audited,
                "refinancingPlan": plan,
                "refinancing_plan": plan,
                "liberationMetrics": metrics,
                "liberation_metrics": metrics,
                "legalRemedySummary": legal,
                "legal_remedy_summary": legal
            }
            self._send_json(response_data)

        except ValueError as ve:
            self._send_error(str(ve), status_code=400)
        except Exception as e:
            logger.exception("Error in ModeBRestructure")
            self._send_error(f"Mode B restructuring failed: {str(e)}", status_code=500)


def create_server(host: str = "127.0.0.1", port: int = 8000) -> ThreadingHTTPServer:
    """Create and return a configured ThreadingHTTPServer instance."""
    server_address = (host, port)
    server = ThreadingHTTPServer(server_address, GraminAIRequestHandler)
    return server


def run_server(host: str = "127.0.0.1", port: int = 8000):
    """Run the GraminAI server with graceful keyboard interrupt handling."""
    server = create_server(host, port)
    logger.info(f"GraminAI Backend Server listening on http://{host}:{port}")
    logger.info(f"Loaded {len(DOSSIERS_MAP)} verified empirical micro-enterprise dossiers")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("\nShutdown signal received. Stopping server...")
    finally:
        server.server_close()
        logger.info("Server closed successfully.")


if __name__ == "__main__":
    port_env = int(os.environ.get("PORT", 8000))
    host_env = os.environ.get("HOST", "127.0.0.1")
    run_server(host=host_env, port=port_env)
