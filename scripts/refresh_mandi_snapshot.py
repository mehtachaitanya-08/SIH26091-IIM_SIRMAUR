"""
Refresh data/mandi_snapshot.json: the saved mandi prices the live site shows when it cannot reach data.gov.in itself.

WHY THIS FILE EXISTS (14 Nov 2026). data.gov.in refuses connections from Render, so the deployed site cannot fetch
prices, though it works from the owner's laptop. Run this on a connection where data.gov.in answers (double-click
refresh_prices.bat on the laptop). It asks for each crop the dashboard uses, takes the rows of the NEWEST arrival
date among the five data.gov.in returns, keeps the MIDDLE of their modal prices (with the low and high, and how many
markets: owner's decision, 15 Nov 2026, because one market's price can be far from the rest), and writes the file. Then commit and push data/mandi_snapshot.json and redeploy
on Render: the site reads the file from its checkout (backend/mandi_snapshot.py explains the rules).

RULES. It asks the way the server does (the same address, filters, User-Agent and timeout, imported from
backend/mandi.py, not copied). A crop whose call fails keeps its old saved entry; if every crop fails nothing is
written and the old file stays byte for byte as it was. The file is replaced in one step (a temporary file, then
os.replace), never left half written. The key is never printed or written, not even inside an error message that
carries the request address (redact). No price is ever invented: a crop with no usable record is a failure.
"""

import json
import os
import re
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend import mandi, mandi_snapshot  # noqa: E402

STATE = "Uttar Pradesh"
# The six crops the dashboard asks for (frontend/src/components/ProductionDashboard.jsx, commodityMap). A test fails
# if that map and this list ever differ.
CROPS = ["Wheat", "Paddy", "Maize", "Gram", "Cotton", "Mustard"]


def redact(text, key):
    """Remove the key, and any api-key=... in a request address, from a piece of text."""
    text = re.sub(r"(api-key=)[^&\s]+", r"\1***", str(text), flags=re.I)
    if key:
        text = text.replace(key, "***")
    return text


def pick_record(records):
    """The MIDDLE price of the rows that share the newest arrival date (owner's decision, 15 Nov 2026: "middle of five").
    Only rows with a usable price and a readable dd/mm/yyyy date count. Returns {market, modalPrice, arrivalDate,
    marketsCount, lowPrice, highPrice}; an even count gives the average of the two middle prices, rounded up. The market
    is named only when one market gave the price. None when no row qualifies."""
    usable = []
    for r in records or []:
        if not isinstance(r, dict):
            continue
        try:
            price = mandi_snapshot._price(float(str(r.get("modal_price")).strip()))
        except ValueError:
            continue
        arrival = mandi_snapshot.parse_arrival(r.get("arrival_date"))
        if price is None or arrival is None:
            continue
        market = r.get("market")
        usable.append((arrival, price, market if isinstance(market, str) and market.strip() else None,
                       r["arrival_date"].strip()))
    if not usable:
        return None
    newest = max(u[0] for u in usable)
    day = [u for u in usable if u[0] == newest]
    prices = sorted(u[1] for u in day)
    n = len(prices)
    middle = prices[n // 2] if n % 2 else (prices[n // 2 - 1] + prices[n // 2] + 1) // 2
    return {"market": day[0][2] if n == 1 else None, "modalPrice": middle, "arrivalDate": day[0][3],
            "marketsCount": n, "lowPrice": prices[0], "highPrice": prices[-1]}


def _read_existing(path):
    """(entries, fetchedAt) of the file as it is now, or ({}, None). An old entry with no stamp of its own is given the
    file's fetch date, so that KEEPING it never makes it look as fresh as this run (review, 14 Nov 2026)."""
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}, None
    entries = raw.get("entries") if isinstance(raw, dict) else None
    if not isinstance(entries, dict):
        return {}, None
    fetched = raw.get("fetchedAt") if isinstance(raw.get("fetchedAt"), str) else None
    stamped = {}
    for k, e in entries.items():
        stamped[k] = dict(e, fetchedAt=e.get("fetchedAt") or fetched) if isinstance(e, dict) and (e.get("fetchedAt") or fetched) else e
    return stamped, fetched


def _write_atomically(path, doc):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=".mandi_snapshot.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2, sort_keys=True)
            f.write("\n")
        os.replace(tmp, str(path))
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def refresh(get=None, key=None, path=None, now=None, say=print):
    """Ask data.gov.in for every crop and update the file. Returns (exit_code, report): 0 when at least one crop was
    saved, 1 when nothing could be refreshed (and then nothing is written)."""
    get = get or mandi._get
    key = mandi._api_key() if key is None else key
    path = Path(path or mandi_snapshot.DEFAULT_SNAPSHOT_FILE)
    now = now or datetime.now(timezone.utc)
    report = {"saved": [], "kept": [], "failed": []}
    if not key:
        say("No data.gov.in key found. Put it in the Windows setting DATA_GOV_IN_API_KEY (or the .env file) and try again.")
        return 1, report

    old, _ = _read_existing(path)
    entries = dict(old)
    fetched_iso = now.astimezone(timezone.utc).replace(microsecond=0).isoformat()
    for crop in CROPS:
        k = mandi_snapshot.make_key(STATE, crop)
        params = {"api-key": key, "format": "json", "limit": 5,
                  "filters[state]": STATE, "filters[commodity]": crop}
        try:
            picked = pick_record(get(mandi.URL, params, mandi.TIMEOUT_S).get("records", []))
            if picked is None:
                raise ValueError("no record with a price and a readable arrival date")
        except Exception as exc:    # a failed crop must never stop the others, and never leak the key
            why = redact(f"{type(exc).__name__}: {exc}", key)[:160]
            report["failed"].append(f"{crop}: {why}")
            if k in old:
                report["kept"].append(crop)
                say(f"{crop}: could not refresh ({why}); kept the old saved price")
            else:
                say(f"{crop}: could not refresh ({why}); nothing saved for it")
            continue
        entries[k] = {"state": STATE, "commodity": crop, **picked, "fetchedAt": fetched_iso}
        report["saved"].append(crop)
        where = (picked["market"] or "an unnamed market") if picked["marketsCount"] == 1 else (
            f"the middle of {picked['marketsCount']} reported prices (Rs {picked['lowPrice']} to Rs {picked['highPrice']})")
        say(f"{crop}: saved Rs {picked['modalPrice']} per quintal, {where}, arrival {picked['arrivalDate']}")

    if not report["saved"]:
        say("No crop could be refreshed: nothing was written, and the old file (if there is one) is unchanged.")
        return 1, report
    _write_atomically(path, {
        "fetchedAt": fetched_iso,
        "source": "data.gov.in Agmarknet daily prices, refreshed by scripts/refresh_mandi_snapshot.py",
        "entries": entries})
    say(f"Saved {len(report['saved'])} of {len(CROPS)} crops to {path}")
    return 0, report


def main():
    try:
        sys.stdout.reconfigure(errors="replace")
    except (AttributeError, ValueError):
        pass
    code, _ = refresh()
    if code == 0:
        print("Done. Next: send data/mandi_snapshot.json to GitHub (commit and push), then redeploy on Render.")
    return code


if __name__ == "__main__":
    sys.exit(main())
