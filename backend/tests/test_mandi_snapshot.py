"""
Saved daily mandi prices (owner's decision, 14 Nov 2026). data.gov.in refuses connections from Render ("Connection
refused", seen live), so the Home price panel could only say "could not be fetched". A small script run on the owner's
laptop (where data.gov.in works) saves the latest price of each crop to data/mandi_snapshot.json; when the live call
cannot be made, the server shows that saved price, labelled saved, with its market and arrival date, never as live.

The rules these tests pin (from the plan, audited three times):
  - only when the live call could not be made (no_key, call_failed); a live "no records" or "no price" stays a gap;
  - the age is that of the ARRIVAL date (dd/mm/yyyy, India time), at most 7 days, never in the future;
  - a saved reply is never live, never carries the live reason text, never invents a price;
  - the custom-trade feature keeps getting live-only replies;
  - after a CONNECTION failure the server remembers it for 10 minutes and skips the 15 s live call; a 403 (wrong key)
    must not arm that memory.
"""

import json
from datetime import date
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from backend import custom_trade, mandi, mandi_snapshot
from backend.app import app

client = TestClient(app)
TODAY = date(2026, 11, 14)
WHEAT = "uttar pradesh|wheat"


def entry(price=2700, arrival="13/11/2026", market="Bindki APMC"):
    return {"market": market, "modalPrice": price, "arrivalDate": arrival}


@pytest.fixture
def snap(tmp_path, monkeypatch):
    path = tmp_path / "snap.json"
    monkeypatch.setattr(mandi_snapshot, "SNAPSHOT_FILE", path)
    monkeypatch.setattr(mandi_snapshot, "today_ist", lambda: TODAY)
    mandi_snapshot.reset()

    def write(entries, fetched="2026-11-14T06:00:00+00:00"):
        path.write_text(json.dumps({"fetchedAt": fetched, "entries": entries}), encoding="utf-8")
        mandi_snapshot.reset()
        return path
    write.path = path
    return write


@pytest.fixture
def key_set(monkeypatch, tmp_path):
    monkeypatch.setenv("DATA_GOV_IN_API_KEY", "abc123")
    monkeypatch.setattr(mandi, "ENV_FILE", tmp_path / "missing.env")


@pytest.fixture
def no_key(monkeypatch, tmp_path):
    monkeypatch.delenv("DATA_GOV_IN_API_KEY", raising=False)
    monkeypatch.setattr(mandi, "ENV_FILE", tmp_path / "missing.env")


@pytest.fixture
def live(monkeypatch):
    """Replaces the data.gov.in call; counts how often it is made."""
    state = {"calls": 0, "result": None}

    def fake_get(url, params, timeout):
        state["calls"] += 1
        r = state["result"]
        if isinstance(r, Exception):
            raise r
        return r

    monkeypatch.setattr(mandi, "_get", fake_get)

    def set_result(r):
        state["result"] = r
    state["set"] = set_result
    return state


def ask(state="Uttar Pradesh", commodity="Wheat"):
    return client.get("/api/mandi-prices", params={"state": state, "commodity": commodity}).json()


# --------------------------------------------------------------------------- the reader
class TestTheSnapshotReader:
    def test_a_good_entry_comes_back_with_its_market_dates_and_age(self, snap):
        snap({WHEAT: entry()})
        got = mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")
        assert got == {"modalPrice": 2700, "market": "Bindki APMC", "arrivalDate": "13/11/2026",
                       "savedOn": "14/11/2026", "ageDays": 1,
                       "marketsCount": None, "lowPrice": None, "highPrice": None}     # an old-format entry: no range claimed

    def test_a_middle_price_comes_back_with_how_many_markets_and_its_range(self, snap):
        snap({WHEAT: {**entry(price=8900, market=None), "marketsCount": 5, "lowPrice": 6364, "highPrice": 10600}})
        got = mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")
        assert (got["modalPrice"], got["marketsCount"], got["lowPrice"], got["highPrice"], got["market"]) == (8900, 5, 6364, 10600, None)

    @pytest.mark.parametrize("bad", [
        {"marketsCount": 0}, {"marketsCount": -2}, {"marketsCount": "5"}, {"marketsCount": True}, {"marketsCount": 5.5},
        {"lowPrice": 9000},                       # the middle price must lie between low and high
        {"highPrice": 8000},
        {"lowPrice": "x", "highPrice": None}, {"lowPrice": 0}, {"highPrice": 0}])
    def test_a_range_that_does_not_make_sense_is_dropped_but_the_price_stays(self, snap, bad):
        good = {**entry(price=8900, market=None), "marketsCount": 5, "lowPrice": 6364, "highPrice": 10600}
        snap({WHEAT: {**good, **bad}})
        got = mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")
        assert got["modalPrice"] == 8900
        assert got["lowPrice"] is None and got["highPrice"] is None
        if "marketsCount" in bad:
            assert got["marketsCount"] is None

    def test_the_fetch_date_is_the_india_date_not_the_utc_date(self, snap):
        snap({WHEAT: entry()}, fetched="2026-11-13T20:00:00+00:00")           # 01:30 on 14 Nov in India
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["savedOn"] == "14/11/2026"

    def test_state_and_crop_match_whatever_the_case_or_spaces(self, snap):
        snap({"  Uttar Pradesh | WHEAT ": entry()})
        assert mandi_snapshot.saved_price("uttar pradesh", "Wheat")["modalPrice"] == 2700
        assert mandi_snapshot.saved_price("UTTAR PRADESH ", " wheat")["modalPrice"] == 2700

    def test_an_entry_the_file_does_not_have_is_not_invented(self, snap):
        snap({WHEAT: entry()})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Cotton") is None
        assert mandi_snapshot.saved_price("Bihar", "Wheat") is None

    @pytest.mark.parametrize("content", ["", "not json", "[]", "{}", '{"entries": []}', '{"entries": "x"}', '"text"', "null"])
    def test_a_missing_or_corrupt_file_gives_nothing_and_never_raises(self, snap, content):
        snap.path.write_text(content, encoding="utf-8")
        mandi_snapshot.reset()
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None
        assert mandi_snapshot.summary() is None

    def test_no_file_at_all_is_fine(self, snap):
        assert not snap.path.exists()
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    def test_a_huge_file_is_ignored(self, snap):
        snap({WHEAT: entry(), "x|y": {"pad": "a" * 300_000}})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    @pytest.mark.parametrize("bad", [0, -5, "2700", True, None, float("nan"), float("inf"), [2700]])
    def test_an_entry_with_no_usable_price_is_dropped(self, snap, bad):
        snap({WHEAT: entry(price=bad), "uttar pradesh|maize": entry(price=2100)})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Maize")["modalPrice"] == 2100     # the good one survives

    def test_a_price_that_rounds_to_zero_is_dropped(self, snap):
        snap({WHEAT: entry(price=0.4), "uttar pradesh|maize": entry(price=0.6)})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None          # 0.4 would have been shown as Rs 0

    def test_each_entry_carries_its_own_saved_on_date_so_a_kept_entry_is_not_made_to_look_fresh(self, snap):
        old = dict(entry(), fetchedAt="2026-11-12T06:00:00+00:00")
        snap({WHEAT: old, "uttar pradesh|maize": entry(price=2100)}, fetched="2026-11-14T06:00:00+00:00")
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["savedOn"] == "12/11/2026"
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Maize")["savedOn"] == "14/11/2026"    # no own stamp: the file's

    @pytest.mark.parametrize("bad_date", ["", None, "2026-11-13", "13-11-2026", "13/11/26", "31/02/2026", "yesterday", 13112026,
                                          "١٣/١١/٢٠٢٦"])
    def test_an_entry_with_no_parseable_arrival_date_is_dropped_never_given_todays_date(self, snap, bad_date):
        snap({WHEAT: entry(arrival=bad_date)})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    def test_a_price_up_to_seven_days_old_by_arrival_date_is_shown_and_eight_is_not(self, snap):
        snap({WHEAT: entry(arrival="07/11/2026")})                    # 7 days before 14 Nov
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["ageDays"] == 7
        snap({WHEAT: entry(arrival="06/11/2026")})                    # 8 days
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    def test_the_age_is_the_arrival_dates_even_when_the_file_was_fetched_today(self, snap):
        snap({WHEAT: entry(arrival="10/08/2026")}, fetched="2026-11-14T06:00:00+00:00")
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    def test_a_future_arrival_date_is_not_shown(self, snap):
        snap({WHEAT: entry(arrival="15/11/2026")})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    def test_the_oldest_age_can_be_changed_by_the_host(self, snap, monkeypatch):
        snap({WHEAT: entry(arrival="10/11/2026")})                    # 4 days
        monkeypatch.setenv("MANDI_MAX_AGE_DAYS", "3")
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None
        monkeypatch.setenv("MANDI_MAX_AGE_DAYS", "14")
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["ageDays"] == 4
        monkeypatch.setenv("MANDI_MAX_AGE_DAYS", "lots")              # a bad value is the default, never "no limit"
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["ageDays"] == 4
        snap({WHEAT: entry(arrival="01/01/2026")})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat") is None

    def test_a_changed_file_is_read_again_without_a_restart(self, snap):
        snap({WHEAT: entry(price=2700)})
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["modalPrice"] == 2700
        snap.path.write_text(json.dumps({"fetchedAt": "2026-11-14T06:00:00+00:00", "entries": {WHEAT: entry(price=27000)}}),
                             encoding="utf-8")                        # no reset(): the reader must notice by itself
        assert mandi_snapshot.saved_price("Uttar Pradesh", "Wheat")["modalPrice"] == 27000

    def test_the_summary_says_when_the_file_was_fetched_and_how_many_entries_it_holds(self, snap):
        snap({WHEAT: entry(), "uttar pradesh|maize": entry(price=2100)})
        assert mandi_snapshot.summary() == {"fetchedAt": "2026-11-14T06:00:00+00:00", "entries": 2}

    def test_the_default_file_is_data_mandi_snapshot_json_in_the_repo(self):
        repo = Path(mandi_snapshot.__file__).resolve().parents[1]
        assert mandi_snapshot.DEFAULT_SNAPSHOT_FILE == repo / "data" / "mandi_snapshot.json"
        assert mandi_snapshot.DEFAULT_SNAPSHOT_FILE.parent.is_dir()     # data/ exists in the checkout


# --------------------------------------------------------------------------- the failure memory
class TestTheFailureMemory:
    @pytest.fixture
    def clock(self, monkeypatch):
        t = {"now": 1000.0}
        monkeypatch.setattr(mandi_snapshot, "_monotonic", lambda: t["now"])
        return t

    def test_a_connection_failure_is_remembered_for_ten_minutes(self, clock):
        assert mandi_snapshot.recently_failed() is False
        mandi_snapshot.note_connection_failure()
        assert mandi_snapshot.recently_failed() is True
        clock["now"] += 599
        assert mandi_snapshot.recently_failed() is True
        clock["now"] += 2
        assert mandi_snapshot.recently_failed() is False

    def test_a_success_clears_it(self, clock):
        mandi_snapshot.note_connection_failure()
        mandi_snapshot.note_success()
        assert mandi_snapshot.recently_failed() is False

    def test_the_time_can_be_changed_by_the_host(self, clock, monkeypatch):
        monkeypatch.setenv("MANDI_RETRY_MINUTES", "1")
        mandi_snapshot.note_connection_failure()
        clock["now"] += 61
        assert mandi_snapshot.recently_failed() is False

    def test_reset_clears_it(self, clock):
        mandi_snapshot.note_connection_failure()
        mandi_snapshot.reset()
        assert mandi_snapshot.recently_failed() is False


# --------------------------------------------------------------------------- the route
class TestTheRouteFallsBackOnlyWhenTheLiveCallCannotBeMade:
    def test_a_failed_call_with_a_fresh_entry_gives_the_saved_price(self, snap, key_set, live):
        snap({WHEAT: entry()})
        live["set"](RuntimeError("timed out"))
        d = ask()
        assert d["status"] == "saved" and d["isLive"] is False
        assert d["modalPrice"] == 2700 and d["market"] == "Bindki APMC"
        assert d["arrivalDate"] == "13/11/2026" and d["savedOn"] == "14/11/2026" and d["ageDays"] == 1
        assert d["liveFailure"] == "call_failed"
        assert d["apiKeyConfigured"] is True and d["records"] == [] and d["unit"] == "INR / Quintal"

    def test_a_middle_price_reply_carries_the_count_and_range_for_the_panel(self, snap, key_set, live):
        snap({WHEAT: {**entry(price=8900, market=None), "marketsCount": 5, "lowPrice": 6364, "highPrice": 10600}})
        live["set"](RuntimeError("timed out"))
        d = ask()
        assert d["modalPrice"] == 8900 and d["market"] is None
        assert (d["marketsCount"], d["lowPrice"], d["highPrice"]) == (5, 6364, 10600)
        assert "tag" not in d and "reason" not in d

    def test_a_saved_reply_has_no_reason_text_no_reasoncode_and_never_the_key(self, snap, key_set, live):
        snap({WHEAT: entry()})
        live["set"](RuntimeError("failed for https://x?api-key=abc123"))
        raw = client.get("/api/mandi-prices", params={"state": "Uttar Pradesh", "commodity": "Wheat"}).text
        d = json.loads(raw)
        assert "reason" not in d and "reasonCode" not in d and "tag" not in d
        assert "abc123" not in raw and "api-key" not in raw

    def test_no_key_with_a_fresh_entry_also_gives_the_saved_price(self, snap, no_key, live):
        snap({WHEAT: entry()})
        d = ask()
        assert d["status"] == "saved" and d["apiKeyConfigured"] is False and d["liveFailure"] == "no_key"
        assert live["calls"] == 0

    def test_no_key_can_be_switched_to_show_the_gap_instead(self, snap, no_key, live, monkeypatch):
        snap({WHEAT: entry()})
        monkeypatch.setattr(mandi, "SAVED_WHEN_NO_KEY", False)
        d = ask()
        assert d["status"] == "no_live_data" and d["reasonCode"] == "no_key"

    def test_an_entry_too_old_by_arrival_date_gives_todays_gap(self, snap, key_set, live):
        snap({WHEAT: entry(arrival="01/11/2026")})
        live["set"](RuntimeError("timed out"))
        d = ask()
        assert d["status"] == "no_live_data" and d["reasonCode"] == "call_failed" and d["modalPrice"] is None

    def test_a_crop_the_file_does_not_have_gives_todays_gap(self, snap, key_set, live):
        snap({WHEAT: entry()})
        live["set"](RuntimeError("timed out"))
        assert ask(commodity="Cotton")["status"] == "no_live_data"

    @pytest.mark.parametrize("answer,code", [({"records": []}, "no_records"), ({"records": [{"modal_price": ""}]}, "no_price")])
    def test_when_data_gov_in_answered_with_no_price_the_gap_stays_the_saved_price_is_not_used(self, snap, key_set, live, answer, code):
        snap({WHEAT: entry()})
        live["set"](answer)
        d = ask()
        assert d["status"] == "no_live_data" and d["reasonCode"] == code and d["modalPrice"] is None

    def test_when_live_works_the_live_price_is_shown_and_the_file_is_ignored(self, snap, key_set, live):
        snap({WHEAT: entry(price=1111)})
        live["set"]({"records": [{"market": "Agra", "modal_price": "2275", "arrival_date": "14/11/2026"}]})
        d = ask()
        assert d["status"] == "success" and d["isLive"] is True and d["modalPrice"] == 2275 and d["market"] == "Agra"

    def test_a_saved_reply_is_never_live(self, snap, key_set, live):
        snap({WHEAT: entry()})
        live["set"](httpx.ConnectError("[Errno 111] Connection refused"))
        assert ask()["isLive"] is False


class TestTheSlowPageGuard:
    @pytest.fixture
    def clock(self, monkeypatch):
        t = {"now": 1000.0}
        monkeypatch.setattr(mandi_snapshot, "_monotonic", lambda: t["now"])
        return t

    def test_after_a_connection_failure_the_next_request_skips_the_slow_live_call(self, snap, key_set, live, clock):
        snap({WHEAT: entry()})
        live["set"](httpx.ConnectError("[Errno 111] Connection refused"))
        assert ask()["status"] == "saved" and live["calls"] == 1
        assert ask()["status"] == "saved" and live["calls"] == 1         # served from the file, no second live call
        clock["now"] += 601
        assert ask()["status"] == "saved" and live["calls"] == 2         # the memory expired: live is tried again

    def test_a_timeout_also_arms_it(self, snap, key_set, live, clock):
        snap({WHEAT: entry()})
        live["set"](httpx.ReadTimeout("timed out"))
        ask()
        ask()
        assert live["calls"] == 1

    def test_a_403_wrong_key_does_not_arm_it_so_a_wrong_key_is_never_hidden(self, snap, key_set, live, clock):
        snap({WHEAT: entry()})
        request = httpx.Request("GET", "https://api.data.gov.in/x")
        live["set"](httpx.HTTPStatusError("403", request=request, response=httpx.Response(403, request=request)))
        ask()
        ask()
        assert live["calls"] == 2

    @pytest.mark.parametrize("status", [401, 403])
    def test_a_rejected_key_shows_the_gap_not_a_saved_price_so_the_owner_notices(self, snap, key_set, live, status):
        # Review of 14 Nov 2026: a revoked key answers 403, which was classed call_failed and so would have shown a
        # week of saved prices with nobody the wiser. A rejected key is its own reason and never falls back.
        snap({WHEAT: entry()})
        request = httpx.Request("GET", "https://api.data.gov.in/x?api-key=abc123")
        live["set"](httpx.HTTPStatusError("rejected", request=request, response=httpx.Response(status, request=request)))
        raw = client.get("/api/mandi-prices", params={"state": "Uttar Pradesh", "commodity": "Wheat"}).text
        d = json.loads(raw)
        assert d["status"] == "no_live_data" and d["reasonCode"] == "key_rejected" and d["modalPrice"] is None
        assert d["isLive"] is False and "abc123" not in raw

    @pytest.mark.parametrize("status", [429, 500, 503])
    def test_a_busy_or_broken_data_gov_in_uses_the_saved_price_like_any_other_failed_call(self, snap, key_set, live, status):
        snap({WHEAT: entry()})
        request = httpx.Request("GET", "https://api.data.gov.in/x")
        live["set"](httpx.HTTPStatusError("busy", request=request, response=httpx.Response(status, request=request)))
        assert ask()["status"] == "saved"

    def test_a_plain_error_that_is_not_a_connection_problem_does_not_arm_it(self, snap, key_set, live, clock):
        snap({WHEAT: entry()})
        live["set"](RuntimeError("timed out"))                           # what the older tests raise
        ask()
        ask()
        assert live["calls"] == 2

    def test_a_live_success_clears_it(self, snap, key_set, live, clock):
        snap({WHEAT: entry()})
        live["set"](httpx.ConnectError("refused"))
        ask()
        clock["now"] += 601
        live["set"]({"records": [{"market": "Agra", "modal_price": "2275", "arrival_date": "14/11/2026"}]})
        assert ask()["status"] == "success"
        assert mandi_snapshot.recently_failed() is False

    def test_it_never_skips_live_for_a_crop_the_file_does_not_have(self, snap, key_set, live, clock):
        snap({WHEAT: entry()})
        live["set"](httpx.ConnectError("refused"))
        ask()                                                            # arms the memory (Wheat has a saved price)
        assert ask(commodity="Cotton")["status"] == "no_live_data"
        assert live["calls"] == 2                                        # Cotton still tried live: no saved price to serve

    def test_a_missing_key_never_uses_the_memory(self, snap, no_key, live, clock):
        snap({WHEAT: entry()})
        mandi_snapshot.note_connection_failure()
        assert ask()["liveFailure"] == "no_key"


class TestTheOtherUserOfThePriceStaysLiveOnly:
    def test_custom_trade_never_receives_a_saved_price_as_if_it_were_a_price(self, snap, key_set, live):
        snap({"uttar pradesh|mustard": entry(price=6000)})
        live["set"](httpx.ConnectError("refused"))
        out = custom_trade.check_mandi_commodity("Mustard oil seed expeller", "Uttar Pradesh")
        assert out["commodity"] == "Mustard"
        assert out["data"]["status"] == "no_live_data" and out["data"]["modalPrice"] is None
        assert "saved" not in json.dumps(out).lower()

    def test_the_custom_trade_still_calls_the_live_only_function(self, snap, key_set, live, monkeypatch):
        seen = []
        monkeypatch.setattr(mandi, "lookup_live", lambda state, commodity: seen.append((state, commodity)) or {"status": "x"})
        custom_trade.check_mandi_commodity("Mustard oil seed expeller", "Uttar Pradesh")
        assert seen == [("Uttar Pradesh", "Mustard")]


class TestTheHealthLine:
    def test_health_shows_which_snapshot_is_loaded(self, snap):
        snap({WHEAT: entry()})
        d = client.get("/api/health").json()
        assert d["status"] == "ok" and d["mandiSnapshot"] == {"fetchedAt": "2026-11-14T06:00:00+00:00", "entries": 1}

    def test_health_shows_null_when_there_is_no_file_and_never_fails_on_a_corrupt_one(self, snap):
        assert client.get("/api/health").json()["mandiSnapshot"] is None
        snap.path.write_text("{{{ broken", encoding="utf-8")
        mandi_snapshot.reset()
        r = client.get("/api/health")
        assert r.status_code == 200 and r.json()["mandiSnapshot"] is None
