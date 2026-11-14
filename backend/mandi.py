"""
GET /api/mandi-prices: daily mandi prices from Open Government Data (data.gov.in, Agmarknet).

Moved here from the teammate's engine/server.py (same address, same live reply shape, same
data.gov.in resource and filters). Two changes:
- The key DATA_GOV_IN_API_KEY is read from the environment OR the repo's .env file (his server
  only read the environment, so a key written in .env was never used).
- Live data only. With no key, a failed call or no records, the reply is "no_live_data" with no
  price (his version returned 7 fixed prices labelled as verified benchmarks).
The key is never put in a reply or a log.

WHY EACH REPLY CARRIES A reasonCode (review, 14 Nov 2026): with the key set, a failed call and
an empty answer looked the same to the dashboard, so a wrong key would have been shown to a
farmer as "no price reported". The codes are no_key, call_failed, key_rejected (HTTP 401/403, added the same day:
never answered with a saved price), no_records and no_price; the
"reason" text stays for logs and older pages. A live price carries its arrivalDate, and its tag
no longer ends in "NOT FOUND" when data.gov.in leaves the date out.

SAVED PRICES (14 Nov 2026). lookup_live is the live lookup and nothing else. The route /api/mandi-prices wraps it:
when the live call cannot be made (no key, or it failed) and backend/mandi_snapshot.py has a fresh saved price for the
crop, the reply is status "saved" (never isLive). backend/custom_trade.py calls lookup_live directly and so never
receives a saved price. See backend/mandi_snapshot.py for the rules and why.
"""

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import APIRouter

from backend import mandi_snapshot

router = APIRouter()
log = logging.getLogger("udyamsetuai.mandi")

ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"  # teammate's Agmarknet daily price resource
URL = f"https://api.data.gov.in/resource/{RESOURCE}"
PLACEHOLDER = "your_api_key_here"
TIMEOUT_S = 15.0


def _api_key():
    key = os.environ.get("DATA_GOV_IN_API_KEY", "").strip()
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("DATA_GOV_IN_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    return "" if key == PLACEHOLDER else key


HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) UdyamSetuAI/1.0"}


def _get(url, params, timeout):
    r = httpx.get(url, params=params, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.json()


def _no_live(state, commodity, configured, reason_code, reason):
    return {"status": "no_live_data", "isLive": False, "state": state, "commodity": commodity,
            "market": None, "modalPrice": None, "unit": "INR / Quintal", "records": [],
            "apiKeyConfigured": configured, "reasonCode": reason_code, "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat()}


def lookup_live(state, commodity):
    """The live data.gov.in lookup and nothing else: no saved price, ever. The route below adds the fallback;
    backend/custom_trade.py calls THIS, so a custom dossier or the chat never receives a saved price as if it were
    a price (plan audit, 14 Nov 2026). A connection failure here is remembered (backend/mandi_snapshot.py)."""
    key = _api_key()
    if not key:
        return _no_live(state, commodity, False, "no_key",
                        "No live mandi price: DATA_GOV_IN_API_KEY is not set (environment or .env). NOT FOUND.")
    params = {"api-key": key, "format": "json", "limit": 5,
              "filters[state]": state, "filters[commodity]": commodity}
    try:
        records = _get(URL, params, TIMEOUT_S).get("records", [])
        mandi_snapshot.note_success()
    except Exception as exc:  # network, HTTP or JSON problem: say so, never invent a price
        if isinstance(exc, httpx.TransportError):     # refused, timed out, no such host: NOT a 403 (a wrong key)
            mandi_snapshot.note_connection_failure()
        if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code in (401, 403):
            # A rejected key is its own reason and NEVER falls back to a saved price (review of 14 Nov 2026): a revoked
            # key would otherwise show a week of saved prices and nobody would notice it was dead.
            log.warning("data.gov.in rejected the API key (HTTP %s)", exc.response.status_code)
            return _no_live(state, commodity, True, "key_rejected",
                            "No live mandi price: data.gov.in did not accept the API key. NOT FOUND.")
        reason = str(exc).replace(key, "***")[:200]
        log.info("mandi live call failed: %s", reason)
        return _no_live(state, commodity, True, "call_failed",
                        f"No live mandi price: the data.gov.in call failed ({reason}). NOT FOUND.")
    if not records:
        return _no_live(state, commodity, True, "no_records",
                        "No live mandi price: data.gov.in returned no records for this crop and state. NOT FOUND.")
    first = records[0]
    try:
        modal = int(float(first.get("modal_price")))
    except (TypeError, ValueError):
        return _no_live(state, commodity, True, "no_price", "No live mandi price: the record has no modal price. NOT FOUND.")
    arrival = first.get("arrival_date") or None
    return {"status": "success", "isLive": True, "state": state, "commodity": commodity,
            "market": first.get("market"), "modalPrice": modal, "unit": "INR / Quintal", "records": records,
            "apiKeyConfigured": True, "source": "data.gov.in Agmarknet API (live)", "arrivalDate": arrival,
            "tag": f"data.gov.in Agmarknet, live, arrival date {arrival}" if arrival else "data.gov.in Agmarknet, live",
            "timestamp": datetime.now(timezone.utc).isoformat()}


# Owner's decision 5 (14 Nov 2026): a site with no key set (Render before the key is added) still shows a saved price.
# Flip this to False to show the plain "not connected" gap in that case instead.
SAVED_WHEN_NO_KEY = True


def _saved_reply(state, commodity, saved, configured, failure):
    """A saved price. Deliberately NOT shaped like a live reply: isLive is false, there is no reasonCode or reason
    text (live reasons can carry exception text), no records and no tag. `liveFailure` says why live was not used."""
    return {"status": "saved", "isLive": False, "state": state, "commodity": commodity,
            "market": saved["market"], "modalPrice": saved["modalPrice"], "unit": "INR / Quintal", "records": [],
            "apiKeyConfigured": configured, "arrivalDate": saved["arrivalDate"], "savedOn": saved["savedOn"],
            "ageDays": saved["ageDays"], "liveFailure": failure,
            # the price is the middle of this many markets' prices on the arrival date (None for an old-format entry)
            "marketsCount": saved["marketsCount"], "lowPrice": saved["lowPrice"], "highPrice": saved["highPrice"],
            "source": "Saved copy of data.gov.in Agmarknet prices (not live)",
            "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/api/mandi-prices")
def mandi_prices(state: str = "Uttar Pradesh", commodity: str = "Mustard"):
    saved = mandi_snapshot.saved_price(state, commodity)
    if saved and mandi_snapshot.recently_failed() and _api_key():
        # A connection failure a few minutes ago: do not make this page wait for the slow live call again.
        return _saved_reply(state, commodity, saved, True, "call_failed")
    live = lookup_live(state, commodity)
    if live.get("isLive") or not saved:
        return live
    code = live.get("reasonCode")
    # Only when the live call could not be made. A live answer of "no records" / "no price" stands as the gap.
    if code == "call_failed" or (code == "no_key" and SAVED_WHEN_NO_KEY):
        return _saved_reply(state, commodity, saved, live.get("apiKeyConfigured"), code)
    return live
