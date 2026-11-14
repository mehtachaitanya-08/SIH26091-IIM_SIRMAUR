"""
scripts/refresh_mandi_snapshot.py (14 Nov 2026): the owner runs it on a connection where data.gov.in answers (the
Windows laptop, by double-clicking refresh_prices.bat) to save the latest price of each crop to
data/mandi_snapshot.json, which the live site shows when it cannot reach data.gov.in itself.

Rules pinned here: it keeps, for each crop, the record with the NEWEST arrival date of the five data.gov.in returns
(owner's decision); a crop whose call fails keeps its old entry; if every crop fails the file is not touched at all;
the file is replaced in one step (never half-written); the key never appears in anything it prints or writes, not even
inside an exception message that carries the request address.
"""

import importlib.util
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path

import httpx
import pytest

from backend import mandi, mandi_snapshot

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("refresh_mandi_snapshot", ROOT / "scripts" / "refresh_mandi_snapshot.py")
script = importlib.util.module_from_spec(spec)
spec.loader.exec_module(script)

NOW = datetime(2026, 11, 14, 6, 0, tzinfo=timezone.utc)
KEY = "SECRETKEY123"


def rec(price, arrival, market="Agra"):
    return {"market": market, "modal_price": str(price), "arrival_date": arrival}


def five_records():
    return {"records": [rec(2500, "10/11/2026", "A"), rec(2700, "13/11/2026", "B"), rec(2600, "12/11/2026", "C")]}


class Talk:
    def __init__(self):
        self.lines = []

    def __call__(self, *a):
        self.lines.append(" ".join(str(x) for x in a))

    def text(self):
        return "\n".join(self.lines)


def run(tmp_path, get, key=KEY, existing=None):
    path = tmp_path / "mandi_snapshot.json"
    if existing is not None:
        path.write_text(existing, encoding="utf-8")
    talk = Talk()
    code, report = script.refresh(get=get, key=key, path=path, now=NOW, say=talk)
    return code, report, path, talk


class TestWhatItSaves:
    def test_for_every_crop_it_keeps_the_record_with_the_newest_arrival_date(self, tmp_path):
        code, report, path, _ = run(tmp_path, lambda url, params, timeout: five_records())
        assert code == 0
        data = json.loads(path.read_text(encoding="utf-8"))
        assert data["fetchedAt"] == "2026-11-14T06:00:00+00:00"
        assert set(data["entries"]) == {f"uttar pradesh|{c.lower()}" for c in script.CROPS}
        e = data["entries"]["uttar pradesh|wheat"]
        assert (e["modalPrice"], e["market"], e["arrivalDate"]) == (2700, "B", "13/11/2026")

    def test_records_with_no_price_or_a_bad_date_are_skipped(self, tmp_path):
        records = {"records": [rec("", "13/11/2026", "A"), rec(2500, "garbage", "B"), rec(2600, "12/11/2026", "C"),
                               rec(0, "14/11/2026", "D"), rec(-4, "14/11/2026", "E")]}
        code, _, path, _ = run(tmp_path, lambda url, params, timeout: records)
        e = json.loads(path.read_text(encoding="utf-8"))["entries"]["uttar pradesh|wheat"]
        assert (e["modalPrice"], e["market"]) == (2600, "C")

    def test_a_crop_with_no_usable_record_is_a_failure_not_an_invented_price(self, tmp_path):
        def get(url, params, timeout):
            if params["filters[commodity]"] == "Cotton":
                return {"records": [rec("", "13/11/2026")]}
            return five_records()
        code, report, path, talk = run(tmp_path, get)
        assert code == 0
        assert "uttar pradesh|cotton" not in json.loads(path.read_text(encoding="utf-8"))["entries"]
        assert "Cotton" in talk.text() and "Cotton" in " ".join(report["failed"])

    def test_it_asks_data_gov_in_the_way_the_server_does(self, tmp_path):
        seen = []

        def get(url, params, timeout):
            seen.append((url, dict(params), timeout))
            return five_records()
        run(tmp_path, get)
        url, params, timeout = seen[0]
        assert url == mandi.URL and timeout == mandi.TIMEOUT_S
        assert params["api-key"] == KEY and params["limit"] == 5 and params["format"] == "json"
        assert params["filters[state]"] == "Uttar Pradesh" and params["filters[commodity]"] in script.CROPS
        assert len(seen) == len(script.CROPS)

    def test_what_it_writes_is_what_the_server_reads_back(self, tmp_path, monkeypatch):
        _, _, path, _ = run(tmp_path, lambda url, params, timeout: five_records())
        monkeypatch.setattr(mandi_snapshot, "SNAPSHOT_FILE", path)
        monkeypatch.setattr(mandi_snapshot, "today_ist", lambda: date(2026, 11, 14))
        mandi_snapshot.reset()
        got = mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")
        assert got["modalPrice"] == 2700 and got["arrivalDate"] == "13/11/2026" and got["savedOn"] == "14/11/2026"
        assert mandi_snapshot.summary()["entries"] == len(script.CROPS)


class TestWhatItNeverDoes:
    OLD = json.dumps({"fetchedAt": "2026-11-10T06:00:00+00:00", "entries": {
        "uttar pradesh|paddy": {"market": "Old", "modalPrice": 1900, "arrivalDate": "09/11/2026"}}})

    def test_every_saved_entry_is_stamped_and_a_kept_one_keeps_its_old_stamp(self, tmp_path):
        # A kept entry must not be made to look as fresh as the file: it keeps the date it was really saved
        # (an older file with no per-entry stamp gets that file's own fetch date).
        def get(url, params, timeout):
            if params["filters[commodity]"] == "Paddy":
                raise httpx.ConnectError("refused")
            return five_records()
        _, _, path, _ = run(tmp_path, get, existing=self.OLD)
        entries = json.loads(path.read_text(encoding="utf-8"))["entries"]
        assert entries["uttar pradesh|paddy"]["fetchedAt"] == "2026-11-10T06:00:00+00:00"
        assert entries["uttar pradesh|wheat"]["fetchedAt"] == "2026-11-14T06:00:00+00:00"

    def test_a_crop_that_fails_keeps_its_old_entry(self, tmp_path):
        def get(url, params, timeout):
            if params["filters[commodity]"] == "Paddy":
                raise httpx.ConnectError("[Errno 111] Connection refused")
            return five_records()
        code, report, path, talk = run(tmp_path, get, existing=self.OLD)
        assert code == 0
        entries = json.loads(path.read_text(encoding="utf-8"))["entries"]
        assert entries["uttar pradesh|paddy"]["modalPrice"] == 1900              # kept, not blanked
        assert entries["uttar pradesh|wheat"]["modalPrice"] == 2700
        assert "Paddy" in talk.text() and "kept" in talk.text().lower()

    def test_when_every_crop_fails_the_old_file_is_left_byte_for_byte_alone(self, tmp_path):
        def get(url, params, timeout):
            raise httpx.ConnectError("[Errno 111] Connection refused")
        path = tmp_path / "mandi_snapshot.json"
        path.write_bytes(self.OLD.encode("utf-8"))
        before = path.read_bytes()
        code, _, _, talk = run(tmp_path, get)
        assert code == 1 and path.read_bytes() == before
        assert "nothing was written" in talk.text().lower()

    def test_when_every_crop_fails_and_there_was_no_file_none_is_made(self, tmp_path):
        def get(url, params, timeout):
            raise httpx.ConnectError("refused")
        code, _, path, _ = run(tmp_path, get)
        assert code == 1 and not path.exists()

    def test_the_key_never_appears_in_anything_it_prints_or_writes_even_inside_an_error(self, tmp_path):
        def get(url, params, timeout):
            if params["filters[commodity]"] == "Gram":
                raise RuntimeError(f"failed for https://api.data.gov.in/resource/x?api-key={KEY}&format=json {KEY}")
            return five_records()
        code, report, path, talk = run(tmp_path, get)
        everything = talk.text() + path.read_text(encoding="utf-8") + json.dumps(report)
        assert KEY not in everything and "api-key=" + KEY not in everything
        assert "Gram" in talk.text()                                              # the failure itself is still reported

    def test_the_key_is_not_printed_on_a_clean_run_either(self, tmp_path):
        _, report, path, talk = run(tmp_path, lambda url, params, timeout: five_records())
        assert KEY not in talk.text() + path.read_text(encoding="utf-8") + json.dumps(report)

    def test_no_key_means_no_calls_and_a_plain_message(self, tmp_path):
        calls = []
        code, _, path, talk = run(tmp_path, lambda *a: calls.append(a) or five_records(), key="")
        assert code == 1 and calls == [] and not path.exists()
        assert "DATA_GOV_IN_API_KEY" in talk.text()

    def test_it_replaces_the_file_in_one_step_and_leaves_no_temporary_file(self, tmp_path):
        _, _, path, _ = run(tmp_path, lambda url, params, timeout: five_records(), existing=self.OLD)
        assert sorted(p.name for p in tmp_path.iterdir()) == ["mandi_snapshot.json"]
        json.loads(path.read_text(encoding="utf-8"))                              # complete, valid JSON


class TestTheHelpers:
    def test_redact_removes_the_key_and_any_api_key_in_an_address(self):
        text = f"boom https://x/y?api-key={KEY}&format=json and {KEY} and api-key=OTHER99 end"
        out = script.redact(text, KEY)
        assert KEY not in out and "OTHER99" not in out and "api-key=***" in out

    def test_redact_copes_with_an_empty_key(self):
        assert script.redact("fine", "") == "fine"

    def test_pick_record_prefers_the_newest_date_and_the_first_on_a_tie(self):
        got = script.pick_record([rec(1, "13/11/2026", "first"), rec(2, "13/11/2026", "second"), rec(3, "12/11/2026", "older")])
        assert got["market"] == "first"
        assert script.pick_record([]) is None and script.pick_record([rec("x", "13/11/2026")]) is None


class TestTheCropListMatchesTheDashboard:
    def test_the_crops_are_the_ones_the_dashboard_asks_for(self):
        # A drift alarm: if someone changes the dashboard's business-to-crop map, the refresh list must follow, or
        # a crop would silently have no saved price. It reads the dashboard's source text on purpose.
        src = (ROOT / "frontend" / "src" / "components" / "ProductionDashboard.jsx").read_text(encoding="utf-8")
        block = re.search(r"const commodityMap = \{(.*?)\};", src, re.S).group(1)
        crops = set(re.findall(r"D\d\d: '(\w+)'", block))
        assert crops and crops == set(script.CROPS)
        assert script.STATE == "Uttar Pradesh"
        assert re.search(r"fetchMandiPrices\('Uttar Pradesh'", src)


class TestTheDoubleClickFile:
    def test_refresh_prices_bat_runs_the_script_and_holds_no_key(self):
        bat = (ROOT / "refresh_prices.bat").read_text(encoding="utf-8", errors="replace")
        assert "refresh_mandi_snapshot.py" in bat and "backend\\.venv\\Scripts\\python.exe" in bat
        assert "pause" in bat.lower()
        assert not re.search(r"[0-9a-f]{40,}", bat)                                # no key-like value
        assert "DATA_GOV_IN_API_KEY" in bat                                       # it only reads the saved Windows setting
