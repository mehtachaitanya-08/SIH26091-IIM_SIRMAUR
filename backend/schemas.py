"""
Strict input checks for the loan server.

- Whole rupees only (StrictInt): "140000" (text), 140000.5, true, NaN and Infinity are rejected (422).
- No negative money.
- Upper limit ₹100 crore on every money figure: larger numbers cannot be
  converted for the calculator and used to crash the server (500).
"""

from typing import Annotated, List, Literal

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictInt

MAX_RUPEES = 10**9  # ₹100 crore — an input-sanity limit, not an NSFDC rule
QuarterCash = Annotated[StrictInt, Field(ge=-MAX_RUPEES, le=MAX_RUPEES)]


class Applicant(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_cost: StrictInt = Field(..., gt=0, le=MAX_RUPEES, description="Total project cost, whole rupees")
    is_sc: StrictBool = Field(..., description="Belongs to a Scheduled Caste, with a valid caste certificate")
    annual_family_income: StrictInt = Field(..., ge=0, le=MAX_RUPEES, description="Annual family income from all sources, whole rupees")


class LoanRequest(Applicant):
    moratorium_interest: Literal["accrue", "pay"] = Field(
        "accrue",
        description=(
            "accrue = interest during the pause is added to the loan (ASSUMED default); "
            "pay = interest is paid each pause quarter"
        ),
    )


class CashflowRequest(LoanRequest):
    quarterly_cash_flows: List[QuarterCash] = Field(
        ...,
        description=(
            "Cash left to repay the loan, per quarter, whole rupees. Either 4 figures "
            "(one typical year, repeated for every year of the loan) or one figure per loan quarter."
        ),
    )
