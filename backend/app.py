"""
NSFDC loan server (FastAPI).

Start it from the repo root:
    backend/.venv/bin/uvicorn backend.app:app --port 8000
Interactive docs: http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend import loan
from backend.schemas import Applicant, CashflowRequest, LoanRequest

app = FastAPI(
    title="SIH26091 NSFDC Loan API",
    version="0.1.0",
    description="Eligibility, loan amount and quarterly repayment schedule under NSFDC's "
                "Micro Finance Scheme and Term Loan. Every number carries a tag: "
                "[S#] (source), USER INPUT, CALCULATED or ASSUMED.",
)


@app.exception_handler(RequestValidationError)
async def bad_input(request: Request, exc: RequestValidationError):
    # Do not echo the raw input back: values such as NaN or Infinity cannot be
    # written as JSON and would turn a 422 into a server crash.
    errors = [{"field": ".".join(str(p) for p in e.get("loc", ())), "problem": e.get("msg", "")}
              for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})


@app.exception_handler(loan.InternalCheckError)
async def internal_check(request: Request, exc: loan.InternalCheckError):
    return JSONResponse(status_code=500, content={
        "detail": "Internal consistency check failed; no figures returned.",
        "check": str(exc),
    })


@app.get("/health")
def health():
    return {"status": "ok", "version": app.version}


@app.post("/eligibility")
def eligibility(req: Applicant):
    e = loan.assess(req)
    tier = e["tier"]
    return {
        "status": e["status"],
        "scheme": loan.text(loan.SCHEME_NAME[tier], "[S1]") if tier else None,
        "reasons": e["reasons"],
        "alternatives": e["alternatives"],
        "sources": loan.SOURCES,
    }


@app.post("/loan")
def make_loan(req: LoanRequest):
    return loan.public(loan.build_loan(req))


@app.post("/cashflow")
def cashflow(req: CashflowRequest):
    try:
        return loan.build_cashflow(req)
    except loan.CashflowLengthError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
