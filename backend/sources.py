"""
Source register for the loan server.

Every quote below is copied word for word from the saved NSFDC FAQ page:
    research_dossiers/sources/_shared/NSFDC_devmosje_p15629.html
backend/tests/test_api.py fails if any quote is not found in that file.

Note: the page was saved from the Government dev-site copy (devmosje.negd.in),
because nsfdc.nic.in did not load when the research was done.
"""

S1 = {
    "tag": "[S1]",
    "document": "NSFDC — Frequently Asked Questions (MoSJE portal)",
    "url": "https://devmosje.negd.in/?p=15629",
    "note": "Dev-site copy of the MoSJE/NSFDC FAQ page; saved copy in research_dossiers/sources/_shared/NSFDC_devmosje_p15629.html",
}

SOURCES = {"[S1]": S1}

QUOTES = {
    "community": (
        "Community Requirement: Must belong to the Scheduled Caste (SC) community and possess "
        "a valid Caste Certificate issued by the competent authority."
    ),
    "income": (
        "Income Ceiling: Annual family income from all sources must not exceed ₹5.00 Lakhs "
        "(applicable to both rural and urban areas, effective January 7, 2026)."
    ),
    "ninety_pct": "In all schemes, NSFDC provides up to 90% of the project cost.",
    "micro_finance": (
        "Micro Finance Scheme (MFS): Provides micro-credit for small business activities for units "
        "costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% "
        "p.a. for the beneficiary. Repayment is in quarterly installments within 3 years (including a "
        "3-month moratorium)."
    ),
    "term_loan": (
        "Term Loan: Designed for larger income-generating projects costing more than ₹1.40 lakh and "
        "up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a. "
        "for the beneficiary. Repayment is within 7 years (including a 6-month moratorium, which is "
        "extended to 12 months for plantation and construction activities)."
    ),
}


def cite(key: str) -> dict:
    """A reason or rule shown to the user, with its exact quote and tag."""
    return {"tag": S1["tag"], "quote": QUOTES[key], "url": S1["url"]}
