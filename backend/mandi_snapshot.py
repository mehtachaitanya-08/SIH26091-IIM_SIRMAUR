"""
Saved daily mandi prices, added 14 Nov 2026 at the owner's request.

WHY THIS FILE EXISTS. data.gov.in refuses connections from Render ("[Errno 111] Connection refused", seen live on
the deployed site), though it answers from the owner's laptop, so on the live site the Home price panel could only
say "Price could not be fetched right now". A small script (scripts/refresh_mandi_snapshot.py, run by double-clicking
refresh_prices.bat on a connection where data.gov.in works) saves the latest price of each crop to
data/mandi_snapshot.json. When the live call cannot be made, the server shows that saved price, labelled saved, with
its market and arrival date. It is never shown as live and never invented.

THE RULES (from the plan, audited three times before any code was written)
  - A saved price is used only when the live call could not be made (no key, or the call failed). When data.gov.in
    answered but had no record or no price, that answer stands: it is the gap, not a reason to show an old price.
  - The age is that of the ARRIVAL date, which is what the farmer would read as "the price of that day", not the
    day the file was made: a file made today can hold a price from three months ago. Dates are dd/mm/yyyy (the
    format data.gov.in uses), read strictly, compared in India time, at most MANDI_MAX_AGE_DAYS old (default 7)
    and never in the future. A missing or unreadable date means the entry is dropped, never today's date.
  - The file is untrusted input: size cap (256 KB), every entry checked (a finite positive price, a readable date),
    a bad entry is dropped, a bad file is ignored, and nothing here ever raises (the health route calls it).
  - State and crop are matched ignoring case and spaces, when the file is written and when it is read.

THE SLOW-PAGE GUARD. After a CONNECTION failure (refused, timed out, name not found) the server remembers it for
MANDI_RETRY_MINUTES (default 10) and serves the saved price straight away instead of making every Home page wait
for the 15 second live call. A 403 (a wrong key) is not a connection problem and never arms it, so a wrong key is
never hidden. The memory is global and lives in this process; it is read and written from FastAPI's worker threads,
so a lock guards it. Consequence: on the laptop, where live normally works, one transient timeout makes every crop
show its saved price for up to 10 minutes.

WHERE THE FILE LIVES. data/mandi_snapshot.json in the repo checkout (the same place year_figures.py reads its data).
On Render the checkout is read-only for the app, so it is read, and re-read when it changes, never written here. That
the Render checkout holds data/ was an assumption; /api/health shows `mandiSnapshot` so the owner can see which file
is deployed.
"""

import json
import math
import os
import re
import threading
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

DEFAULT_SNAPSHOT_FILE = Path(__file__).resolve().parents[1] / "data" / "mandi_snapshot.json"
SNAPSHOT_FILE = DEFAULT_SNAPSHOT_FILE        # tests point this at a temporary path (backend/tests/conftest.py)
MAX_BYTES = 256 * 1024
MAX_AGE_DAYS = 7
RETRY_MINUTES = 10
IST = timezone(timedelta(hours=5, minutes=30))
ARRIVAL = re.compile(r"^([0-9]{2})/([0-9]{2})/([0-9]{4})$")     # [0-9], not \d: \d also matches Arabic-Indic digits

_monotonic = time.monotonic                  # tests replace this to move the clock
_lock = threading.Lock()
_cache = {"sig": None, "data": None}
_failed_until = 0.0


def _setting(name, default):
    """A positive whole number from the environment, else the default (never zero, never 'off')."""
    try:
        n = int(os.environ.get(name, "").strip())
    except ValueError:
        return default
    return n if n > 0 else default


def today_ist():
    return datetime.now(IST).date()


def make_key(state, commodity):
    """'uttar pradesh|wheat': the same spelling is used to write the file and to look an entry up."""
    return f"{str(state).strip().casefold()}|{str(commodity).strip().casefold()}"


def parse_arrival(text):
    """A dd/mm/yyyy string as a date, or None. Strict: ISO dates, two-digit years, impossible dates and non-text are None."""
    if not isinstance(text, str):
        return None
    m = ARRIVAL.match(text.strip())
    if not m:
        return None
    try:
        return date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    except ValueError:
        return None


def _price(v):
    """A whole-rupee price above zero, or None. Rounded BEFORE the zero check: 0.4 must not pass and come out as Rs 0."""
    if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
        return None
    n = int(round(v))
    return n if n > 0 else None


def _saved_on(fetched):
    """The India-time date of the fetch, as dd/mm/yyyy, or None when the stamp cannot be read."""
    if not isinstance(fetched, str):
        return None
    try:
        when = datetime.fromisoformat(fetched.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    return when.astimezone(IST).strftime("%d/%m/%Y")


def _range(e, price):
    """(marketsCount, lowPrice, highPrice) of an entry whose price is the middle of several markets (15 Nov 2026).
    Each is None when missing or not sensible (an old-format entry has none); the entry itself is never dropped for it.
    A range is kept only when low <= price <= high, so the panel never shows a middle outside its own range."""
    count = e.get("marketsCount")
    if isinstance(count, bool) or not isinstance(count, int) or not 1 <= count <= 1000:
        count = None
    low, high = _price(e.get("lowPrice")), _price(e.get("highPrice"))
    if count is None or low is None or high is None or not low <= price <= high:
        low = high = None
    return count, low, high


def _parse(path):
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    if not isinstance(raw, dict) or not isinstance(raw.get("entries"), dict):
        return None
    entries = {}
    for raw_key, e in raw["entries"].items():
        parts = str(raw_key).split("|")
        if len(parts) != 2 or not isinstance(e, dict):
            continue
        price = _price(e.get("modalPrice"))
        arrival = parse_arrival(e.get("arrivalDate"))
        if price is None or arrival is None:
            continue
        market = e.get("market")
        count, low, high = _range(e, price)
        entries[make_key(parts[0], parts[1])] = {
            "price": price, "arrival": arrival, "arrivalDate": e["arrivalDate"].strip(),
            "marketsCount": count, "lowPrice": low, "highPrice": high,
            "market": market if isinstance(market, str) and market.strip() else None,
            # an entry's own stamp wins: an entry the script KEPT from an older run must not look as fresh as the file
            "savedOn": _saved_on(e.get("fetchedAt")) or _saved_on(raw.get("fetchedAt"))}
    fetched = raw.get("fetchedAt") if isinstance(raw.get("fetchedAt"), str) else None
    return {"fetchedAt": fetched, "entries": entries}


def load():
    """The checked contents of the snapshot file, or None. Cached until the file changes. Never raises."""
    try:
        path = SNAPSHOT_FILE
        st = path.stat()
        if st.st_size > MAX_BYTES:
            return None
        sig = (str(path), st.st_mtime_ns, st.st_size)
        with _lock:
            if _cache["sig"] == sig:
                return _cache["data"]
        data = _parse(path)
        with _lock:
            _cache["sig"] = sig
            _cache["data"] = data
        return data
    except Exception:       # the health route and the price route must never fail because of this file
        return None


def saved_price(state, commodity):
    """The saved price for this state and crop if it is fresh enough by ARRIVAL date, else None."""
    snap = load()
    if not snap:
        return None
    e = snap["entries"].get(make_key(state, commodity))
    if not e:
        return None
    age = (today_ist() - e["arrival"]).days
    if age < 0 or age > _setting("MANDI_MAX_AGE_DAYS", MAX_AGE_DAYS):
        return None
    return {"modalPrice": e["price"], "market": e["market"], "arrivalDate": e["arrivalDate"],
            "savedOn": e["savedOn"], "ageDays": age,
            "marketsCount": e["marketsCount"], "lowPrice": e["lowPrice"], "highPrice": e["highPrice"]}


def summary():
    """For /api/health: when the loaded file was made and how many usable entries it holds, or None."""
    snap = load()
    if not snap:
        return None
    return {"fetchedAt": snap["fetchedAt"], "entries": len(snap["entries"])}


def note_connection_failure():
    global _failed_until
    with _lock:
        _failed_until = _monotonic() + _setting("MANDI_RETRY_MINUTES", RETRY_MINUTES) * 60


def note_success():
    global _failed_until
    with _lock:
        _failed_until = 0.0


def recently_failed():
    with _lock:
        return _monotonic() < _failed_until


def reset():
    """Forget the cache and the failure memory (tests)."""
    global _failed_until
    with _lock:
        _cache["sig"] = None
        _cache["data"] = None
        _failed_until = 0.0
