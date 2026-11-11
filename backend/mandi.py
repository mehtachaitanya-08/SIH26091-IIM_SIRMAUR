"""
GET /api/mandi-prices: daily mandi prices from Open Government Data (data.gov.in, Agmarknet).

Moved here from the teammate's engine/server.py (same address, same live reply shape, same
data.gov.in resource and filters). Two changes:
- The key DATA_GOV_IN_API_KEY is read from the environment OR the repo's .env file (his server
  only read the environment, so a key written in .env was never used).
- Live data only. With no key, a failed call or no records, the reply is "no_live_data" with no
  price (his version returned 7 fixed prices labelled as verified benchmarks).
The key is never put in a reply or a log.
"""

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import APIRouter

router = APIRouter()
log = logging.getLogger("graminai.mandi")

ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"  # teammate's Agmarknet daily price resource
URL = f"https://api.data.gov.in/resource/{RESOURCE}"
PLACEHOLDER = "your_api_key_here"
TIMEOUT_S = 4.0


def _api_key():
    key = os.environ.get("DATA_GOV_IN_API_KEY", "").strip()
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("DATA_GOV_IN_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    return "" if key == PLACEHOLDER else key


def _get(url, params, timeout):
    r = httpx.get(url, params=params, timeout=timeout)
    r.raise_for_status()
    return r.json()


def _no_live(state, commodity, configured, reason):
    return {"status": "no_live_data", "isLive": False, "state": state, "commodity": commodity,
            "market": None, "modalPrice": None, "unit": "INR / Quintal", "records": [],
            "apiKeyConfigured": configured, "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/api/mandi-prices")
def mandi_prices(state: str = "Uttar Pradesh", commodity: str = "Mustard"):
    key = _api_key()
    if not key:
        return _no_live(state, commodity, False,
                        "No live mandi price: DATA_GOV_IN_API_KEY is not set (environment or .env). NOT FOUND.")
    params = {"api-key": key, "format": "json", "limit": 5,
              "filters[state]": state, "filters[commodity]": commodity}
    try:
        records = _get(URL, params, TIMEOUT_S).get("records", [])
    except Exception as exc:  # network, HTTP or JSON problem: say so, never invent a price
        reason = str(exc).replace(key, "***")[:200]
        log.info("mandi live call failed: %s", reason)
        return _no_live(state, commodity, True, f"No live mandi price: the data.gov.in call failed ({reason}). NOT FOUND.")
    if not records:
        return _no_live(state, commodity, True, "No live mandi price: data.gov.in returned no records for this crop and state. NOT FOUND.")
    first = records[0]
    try:
        modal = int(float(first.get("modal_price")))
    except (TypeError, ValueError):
        return _no_live(state, commodity, True, "No live mandi price: the record has no modal price. NOT FOUND.")
    return {"status": "success", "isLive": True, "state": state, "commodity": commodity,
            "market": first.get("market"), "modalPrice": modal, "unit": "INR / Quintal", "records": records,
            "apiKeyConfigured": True, "source": "data.gov.in Agmarknet API (live)",
            "tag": f"data.gov.in Agmarknet, live, arrival date {first.get('arrival_date', 'NOT FOUND')}",
            "timestamp": datetime.now(timezone.utc).isoformat()}
