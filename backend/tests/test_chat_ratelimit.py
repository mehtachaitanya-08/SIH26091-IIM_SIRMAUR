"""
Rate limits on the chat (14 Nov 2026, owner's request). Every chat question is a paid-for call on the
team's one Groq key, and that key's free tier allows 8,000 tokens a minute, so one visitor asking
questions in a loop, or a crowd, would leave the chat dead for everybody.

Two limits, both kept in memory (they reset when the server restarts, and each server has its own):
  - per visitor: 10 questions in 10 minutes (CHAT_LIMIT_PER_VISITOR / CHAT_WINDOW_SECONDS),
  - site-wide: 500 questions in any 24 hours (CHAT_DAILY_CAP).
Only a question that would really reach Groq counts: one refused for a bad request, or one answered
"AI offline" because there is no key, costs nothing and is not counted.
"""

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend import chat, ratelimit
from backend.app import app

client = TestClient(app)


def limits():
    return ratelimit.ChatLimits()


# ---------------------------------------------------------------------------
# the counting rules, with a clock the test controls
# ---------------------------------------------------------------------------

class TestPerVisitorWindow:
    def test_the_first_ten_are_allowed_and_the_eleventh_is_not(self):
        lim = limits()
        for i in range(10):
            assert lim.take("a", now=1000 + i)[0] is True, i
        allowed, wait, scope = lim.take("a", now=1010)
        assert (allowed, scope) == (False, "visitor")
        # the first question was at t=1000, so a slot frees at t=1600: 590 s after t=1010
        assert wait == 590

    def test_a_slot_frees_when_the_window_slides_past_the_oldest_question(self):
        lim = limits()
        for i in range(10):
            lim.take("a", now=1000 + i)
        assert lim.take("a", now=1599)[0] is False         # the t=1000 question is still inside the window
        assert lim.take("a", now=1600.5)[0] is True        # now it has expired: one slot is back
        assert lim.take("a", now=1600.6)[0] is False       # the t=1001 question has not: only one came back

    def test_another_visitor_is_not_affected(self):
        lim = limits()
        for i in range(10):
            lim.take("a", now=1000 + i)
        assert lim.take("a", now=1010)[0] is False
        assert lim.take("b", now=1010)[0] is True

    def test_the_wait_is_never_zero(self):
        lim = limits()
        for i in range(10):
            lim.take("a", now=1000)
        assert lim.take("a", now=1599.9)[1] >= 1


class TestSiteWideDailyCap:
    def test_the_cap_blocks_every_visitor_until_the_oldest_question_is_a_day_old(self, monkeypatch):
        monkeypatch.setenv("CHAT_DAILY_CAP", "3")
        lim = limits()
        for i, who in enumerate(["a", "b", "c"]):
            assert lim.take(who, now=1000 + i)[0] is True
        allowed, wait, scope = lim.take("d", now=2000)
        assert (allowed, scope) == (False, "daily")
        assert wait == 1000 + 86400 - 2000 + 0          # until the t=1000 question is a day old
        assert lim.take("d", now=1000 + 86400 + 1)[0] is True

    def test_a_refused_question_does_not_use_up_the_site_wide_cap(self, monkeypatch):
        # One spammer, refused again and again by the per-visitor limit, must not burn the cap
        # that every other visitor shares.
        monkeypatch.setenv("CHAT_DAILY_CAP", "100")
        lim = limits()
        for i in range(10):
            lim.take("spammer", now=1000 + i)
        for i in range(50):
            assert lim.take("spammer", now=1020 + i)[0] is False
        used = 0
        while lim.take(f"v{used}", now=1100)[0]:
            used += 1
        assert used == 90        # 100 minus the spammer's 10 allowed ones, not minus 60

    def test_a_question_refused_by_the_cap_does_not_use_up_the_visitors_own_allowance(self, monkeypatch):
        monkeypatch.setenv("CHAT_DAILY_CAP", "1")
        lim = limits()
        assert lim.take("a", now=1000)[0] is True
        for i in range(30):
            assert lim.take("b", now=1001 + i)[2] == "daily"
        monkeypatch.setenv("CHAT_DAILY_CAP", "500")      # the cap is lifted: b still has all ten
        assert all(lim.take("b", now=1100 + i)[0] for i in range(10))


class TestPerMinuteTokenGuard:
    """Review finding 3 (14 Nov 2026): the question count alone did not protect Groq's per-minute token
    ceiling, because one question can make up to about 12 Groq calls. Groq reports the tokens each call
    used; the limiter adds them up over the last 60 seconds and refuses new questions while the total is
    at the budget (default 6,000 of the 8,000 a minute the team key's free tier allows, leaving room for
    the question already in flight)."""

    def test_below_the_budget_questions_are_allowed(self):
        lim = limits()
        lim.note_tokens(5999, now=1000)
        assert lim.take("a", now=1001)[0] is True

    def test_at_the_budget_a_new_question_waits_until_enough_tokens_are_a_minute_old(self):
        lim = limits()
        lim.note_tokens(3000, now=1000)
        lim.note_tokens(3500, now=1010)
        allowed, wait, scope = lim.take("a", now=1020)
        assert (allowed, scope) == (False, "busy")
        # once the 3,000 tokens from t=1000 are a minute old (t=1060) only 3,500 remain: 40 s from t=1020
        assert wait == 40

    def test_the_wait_counts_only_as_many_old_calls_as_it_must(self):
        lim = limits()
        for i in range(4):
            lim.note_tokens(2000, now=1000 + i * 10)       # 8,000 in the last minute
        # 6,000 is the budget: the two oldest (t=1000 and t=1010) must age out, so the wait is until t=1070
        assert lim.take("a", now=1035) == (False, 35, "busy")

    def test_the_tokens_age_out_after_a_minute(self):
        lim = limits()
        lim.note_tokens(3000, now=1000)
        lim.note_tokens(3500, now=1010)
        assert lim.take("a", now=1061)[0] is True            # the t=1000 call is now over a minute old

    def test_a_question_refused_as_busy_uses_up_neither_the_visitors_nor_the_daily_allowance(self, monkeypatch):
        monkeypatch.setenv("CHAT_DAILY_CAP", "10")
        lim = limits()
        lim.note_tokens(6000, now=1000)
        for i in range(30):
            assert lim.take("a", now=1001 + i)[2] == "busy"
        for i in range(10):                                  # a minute later all ten, and the whole cap, are still there
            assert lim.take("a", now=1100 + i)[0] is True, i

    def test_the_budget_can_be_changed_and_a_bad_value_falls_back(self, monkeypatch):
        monkeypatch.setenv("CHAT_TOKENS_PER_MINUTE", "1000")
        lim = limits()
        lim.note_tokens(1000, now=1000)
        assert lim.take("a", now=1001)[2] == "busy"
        monkeypatch.setenv("CHAT_TOKENS_PER_MINUTE", "lots")
        assert lim.take("a", now=1001)[0] is True            # 1,000 is under the 6,000 default

    @pytest.mark.parametrize("junk", [None, 0, -5, 12.5, "800", True, [], {}])
    def test_a_reply_without_a_usable_token_count_is_ignored_not_trusted(self, junk):
        lim = limits()
        lim.note_tokens(junk, now=1000)
        assert lim.take("a", now=1001)[0] is True
        assert len(lim._tokens) == 0

    def test_the_counts_stay_exact_when_several_threads_use_the_limiter_at_once(self):
        # chat.py runs the blocking Groq call off the event loop, so tokens are noted from worker threads
        # while questions are counted on the loop. This proves the counting is right under that mix; it
        # cannot prove the lock itself is needed (Python's own thread switching hides a missing lock in a
        # test this small, a reviewer's note of 14 Nov 2026).
        import threading
        lim = limits()
        out = []

        def worker():
            for _ in range(5):
                out.append(lim.take("a", now=1000)[0])
                lim.note_tokens(10, now=1000)

        threads = [threading.Thread(target=worker) for _ in range(8)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        assert out.count(True) == 10 and out.count(False) == 30


class TestRefusalWords:
    """Review finding 4: the daily cap is a sliding window, so its wait can be a few minutes. "Try
    tomorrow" is said only when the wait is really long (over two hours)."""

    def body(self, scope, wait, lang):
        import json
        r = ratelimit.refusal(scope, wait, lang)
        return json.loads(r.body)["error"], r

    def test_a_short_daily_wait_says_the_minutes_not_tomorrow(self):
        en, r = self.body("daily", 600, "en")
        assert "wait about 10 minutes" in en and "tomorrow" not in en
        hi, _ = self.body("daily", 600, "hi")
        assert "10 मिनट" in hi and "कल" not in hi.replace("कैलकुलेटर", "")

    def test_a_long_daily_wait_says_tomorrow(self):
        en, _ = self.body("daily", 40000, "en")
        assert "tomorrow" in en and "minute" not in en
        hi, _ = self.body("daily", 40000, "hi")
        assert "कल" in hi

    def test_the_edge_is_two_hours(self):
        assert "tomorrow" not in self.body("daily", ratelimit.LONG_WAIT_S, "en")[0]
        assert "tomorrow" in self.body("daily", ratelimit.LONG_WAIT_S + 1, "en")[0]

    def test_the_api_still_reports_the_scope_and_the_real_wait(self):
        import json
        _, r = self.body("daily", 600, "en")
        d = json.loads(r.body)["details"]
        assert d == {"retryAfterSeconds": 600, "scope": "daily"}
        assert r.headers["retry-after"] == "600" and r.status_code == 429

    def test_a_busy_refusal_says_so_in_both_languages(self):
        en, r = self.body("busy", 40, "en")
        assert "busy" in en and "wait about 1 minute and" in en and "loan calculator still works" in en
        hi, _ = self.body("busy", 40, "hi")
        assert "व्यस्त" in hi and "1 मिनट" in hi
        for bad in ("429", "token", "Groq", "limit", "rate"):
            assert bad not in en, bad


class TestSettingsFromTheEnvironment:
    def test_a_host_can_change_the_limits_without_a_code_change(self, monkeypatch):
        monkeypatch.setenv("CHAT_LIMIT_PER_VISITOR", "2")
        monkeypatch.setenv("CHAT_WINDOW_SECONDS", "60")
        lim = limits()
        assert lim.take("a", now=0)[0] and lim.take("a", now=1)[0]
        assert lim.take("a", now=2) == (False, 58, "visitor")
        assert lim.take("a", now=61)[0] is True

    @pytest.mark.parametrize("bad", ["", "abc", "0", "-5", "2.5"])
    def test_a_bad_setting_falls_back_to_the_default_never_to_no_limit(self, monkeypatch, bad):
        monkeypatch.setenv("CHAT_LIMIT_PER_VISITOR", bad)
        lim = limits()
        assert all(lim.take("a", now=i)[0] for i in range(10))
        assert lim.take("a", now=10)[0] is False


class TestMemoryStaysSmall:
    def test_visitors_who_have_gone_quiet_are_forgotten(self, monkeypatch):
        monkeypatch.setattr(ratelimit, "MAX_TRACKED_VISITORS", 50)
        lim = limits()
        for i in range(200):
            lim.take(f"v{i}", now=1000)
        lim.take("late", now=1000 + 601)       # all the earlier ones are now outside the window
        assert len(lim._visitors) <= 51


class TestWhoIsAsking:
    def req(self, host="10.0.0.1", forwarded=None):
        headers = {"x-forwarded-for": forwarded} if forwarded is not None else {}
        return SimpleNamespace(headers=headers, client=SimpleNamespace(host=host))

    def test_on_a_plain_server_the_forwarding_header_is_ignored(self, monkeypatch):
        monkeypatch.delenv("RENDER", raising=False)
        monkeypatch.delenv("TRUST_PROXY_HEADERS", raising=False)
        assert ratelimit.visitor_key(self.req(forwarded="1.2.3.4")) == "10.0.0.1"

    def test_without_a_cloudflare_header_the_last_forwarded_address_is_the_fallback(self, monkeypatch):
        # FALLBACK ONLY. The first version assumed Render appends the real address at the END of
        # X-Forwarded-For. The live test of 14 Nov 2026 showed it does not: 13 questions with 13
        # different made-up headers were all allowed. This is what the code does when Cloudflare's own
        # header is missing; see TestCloudflareNamesTheVisitorOnRender for the real rule.
        monkeypatch.setenv("RENDER", "true")
        assert ratelimit.visitor_key(self.req(forwarded="9.9.9.9, 8.8.8.8, 1.2.3.4")) == "1.2.3.4"
        assert ratelimit.visitor_key(self.req(forwarded="1.2.3.4")) == "1.2.3.4"

    def test_behind_a_proxy_with_no_header_it_still_has_an_identity(self, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        assert ratelimit.visitor_key(self.req(forwarded=None)) == "10.0.0.1"
        assert ratelimit.visitor_key(SimpleNamespace(headers={}, client=None)) == "unknown"


class TestCloudflareNamesTheVisitorOnRender:
    """The live test of 14 Nov 2026 (13 chat questions, each with a different made-up X-Forwarded-For, none
    refused) showed a visitor can pick their own identity through that header on Render. Render's responses
    carry `Server: cloudflare`, and Cloudflare sets CF-Connecting-IP itself, overwriting anything a visitor
    sends, so on Render that header is the visitor's real address."""

    def req(self, headers=None, host="10.0.0.1"):
        return SimpleNamespace(headers=headers or {}, client=SimpleNamespace(host=host))

    def test_on_render_the_cloudflare_header_wins_over_a_made_up_forwarding_header(self, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        r = self.req({"cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "9.9.9.9, 8.8.8.8"})
        assert ratelimit.visitor_key(r) == "203.0.113.7"

    def test_two_questions_from_one_visitor_with_different_made_up_headers_are_one_visitor(self, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        a = ratelimit.visitor_key(self.req({"cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "1.1.1.1"}))
        b = ratelimit.visitor_key(self.req({"cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "2.2.2.2"}))
        assert a == b == "203.0.113.7"

    def test_ipv6_addresses_work_as_they_come(self, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        assert ratelimit.visitor_key(self.req({"cf-connecting-ip": "2001:db8::1"})) == "2001:db8::1"

    def test_off_render_the_cloudflare_header_is_ignored_anyone_could_write_it(self, monkeypatch):
        monkeypatch.delenv("RENDER", raising=False)
        monkeypatch.delenv("TRUST_PROXY_HEADERS", raising=False)
        assert ratelimit.visitor_key(self.req({"cf-connecting-ip": "203.0.113.7"})) == "10.0.0.1"

    @pytest.mark.parametrize("blank", ["", "   "])
    def test_a_blank_cloudflare_header_falls_back_to_the_forwarded_address(self, monkeypatch, blank):
        monkeypatch.setenv("RENDER", "true")
        assert ratelimit.visitor_key(self.req({"cf-connecting-ip": blank, "x-forwarded-for": "1.2.3.4"})) == "1.2.3.4"

    def test_an_absurdly_long_header_cannot_be_used_to_fill_the_memory_with_long_keys(self, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        assert len(ratelimit.visitor_key(self.req({"cf-connecting-ip": "a" * 5000}))) == 64

    def test_another_host_can_name_its_own_trusted_header(self, monkeypatch):
        monkeypatch.delenv("RENDER", raising=False)
        monkeypatch.setenv("TRUST_PROXY_HEADERS", "1")
        monkeypatch.setenv("CLIENT_IP_HEADER", "X-Real-IP")                # any capitalisation
        assert ratelimit.visitor_key(self.req({"x-real-ip": "198.51.100.4", "x-forwarded-for": "1.1.1.1"})) == "198.51.100.4"

    def test_a_proxy_host_with_no_header_named_still_uses_the_forwarded_address(self, monkeypatch):
        monkeypatch.delenv("RENDER", raising=False)
        monkeypatch.setenv("TRUST_PROXY_HEADERS", "1")
        monkeypatch.delenv("CLIENT_IP_HEADER", raising=False)
        assert ratelimit.visitor_key(self.req({"x-forwarded-for": "5.5.5.5, 6.6.6.6"})) == "6.6.6.6"

    def test_a_named_header_that_is_absent_falls_back_to_the_forwarded_address_then_the_connection(self, monkeypatch):
        monkeypatch.delenv("RENDER", raising=False)
        monkeypatch.setenv("TRUST_PROXY_HEADERS", "1")
        monkeypatch.setenv("CLIENT_IP_HEADER", "x-real-ip")
        assert ratelimit.visitor_key(self.req({"x-forwarded-for": "5.5.5.5"})) == "5.5.5.5"
        assert ratelimit.visitor_key(self.req({})) == "10.0.0.1"

    def test_the_missing_cloudflare_header_is_logged_once_not_on_every_question(self, monkeypatch, caplog):
        monkeypatch.setenv("RENDER", "true")
        monkeypatch.setattr(ratelimit, "_warned_no_client_header", False)
        with caplog.at_level("WARNING", logger="udyamsetuai.ratelimit"):
            for _ in range(5):
                ratelimit.visitor_key(self.req({"x-forwarded-for": "1.2.3.4"}))
        warnings = [r for r in caplog.records if "CF-Connecting-IP" in r.getMessage()]
        assert len(warnings) == 1
        assert "1.2.3.4" not in warnings[0].getMessage()          # an address is personal data: not in the log line


# ---------------------------------------------------------------------------
# the real endpoint, with Groq replaced by a stand-in that counts its calls
# ---------------------------------------------------------------------------

@pytest.fixture
def groq(monkeypatch):
    monkeypatch.delenv("RENDER", raising=False)
    monkeypatch.delenv("TRUST_PROXY_HEADERS", raising=False)
    calls = []

    def fake(messages, tools):
        calls.append(1)
        return {"role": "assistant", "content": "Namaste. Tell me which business you run."}

    monkeypatch.setattr(chat, "_call_model", fake)
    monkeypatch.setattr(chat, "_api_key", lambda: "test-key")
    return calls


def ask(text="hello", language=None, headers=None):
    body = {"messages": [{"role": "user", "content": text}]}
    if language:
        body["language"] = language
    return client.post("/api/chat", json=body, headers=headers or {})


class TestTheChatEndpoint:
    def test_the_eleventh_question_is_refused_before_it_reaches_groq(self, groq):
        for i in range(10):
            assert ask().status_code == 200, i
        r = ask()
        assert r.status_code == 429
        assert len(groq) == 10, "the refused question must not have been sent to Groq"
        d = r.json()
        assert d["details"]["scope"] == "visitor"
        assert 1 <= d["details"]["retryAfterSeconds"] <= 600
        assert r.headers["retry-after"] == str(d["details"]["retryAfterSeconds"])

    def test_the_refusal_is_in_plain_words_in_the_asked_language(self, groq):
        for _ in range(10):
            ask()
        en = ask(language="en").json()["error"]
        hi = ask(language="hi").json()["error"]
        assert "wait about" in en and "loan calculator still works" in en
        assert "मिनट" in hi and "लोन कैलकुलेटर" in hi
        for bad in ("429", "rate", "token", "Groq", "GROQ_API_KEY", "test-key"):
            assert bad not in en, bad

    def test_a_refusal_never_contains_the_api_key(self, groq, monkeypatch):
        monkeypatch.setattr(chat, "_api_key", lambda: "secret-groq-key-xyz")
        for _ in range(10):
            ask()
        assert "secret-groq-key-xyz" not in ask().text

    def test_the_site_wide_cap_stops_a_crowd_of_different_visitors(self, groq, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        monkeypatch.setenv("CHAT_DAILY_CAP", "3")
        for ip in ("1.1.1.1", "2.2.2.2", "3.3.3.3"):
            assert ask(headers={"X-Forwarded-For": ip}).status_code == 200
        r = ask(headers={"X-Forwarded-For": "4.4.4.4"})
        assert r.status_code == 429 and r.json()["details"]["scope"] == "daily"
        assert len(groq) == 3
        assert "tomorrow" in ask(language="en", headers={"X-Forwarded-For": "5.5.5.5"}).json()["error"]
        assert "कल" in ask(language="hi", headers={"X-Forwarded-For": "5.5.5.5"}).json()["error"]

    def test_on_render_a_made_up_forwarding_header_does_not_dodge_the_limit(self, groq, monkeypatch):
        # The live bug of 14 Nov 2026, as a test: one visitor (one Cloudflare address), a different made-up
        # X-Forwarded-For on every question. Before the fix all 13 were allowed.
        monkeypatch.setenv("RENDER", "true")
        for i in range(10):
            r = ask(headers={"CF-Connecting-IP": "203.0.113.7", "X-Forwarded-For": f"10.9.8.{i}"})
            assert r.status_code == 200, i
        r = ask(headers={"CF-Connecting-IP": "203.0.113.7", "X-Forwarded-For": "10.9.8.99"})
        assert r.status_code == 429 and r.json()["details"]["scope"] == "visitor"
        assert len(groq) == 10

    def test_on_render_two_real_visitors_have_separate_allowances_whatever_they_write(self, groq, monkeypatch):
        monkeypatch.setenv("RENDER", "true")
        for _ in range(10):
            assert ask(headers={"CF-Connecting-IP": "203.0.113.7"}).status_code == 200
        assert ask(headers={"CF-Connecting-IP": "203.0.113.7"}).status_code == 429
        # a second visitor is not affected, even if they write the first visitor's address in X-Forwarded-For
        assert ask(headers={"CF-Connecting-IP": "198.51.100.9", "X-Forwarded-For": "203.0.113.7"}).status_code == 200

    def test_behind_render_each_visitor_has_their_own_allowance(self, groq, monkeypatch):
        # the fallback path: Cloudflare sent no CF-Connecting-IP, so the last forwarded address is used
        monkeypatch.setenv("RENDER", "true")
        for _ in range(10):
            assert ask(headers={"X-Forwarded-For": "1.1.1.1"}).status_code == 200
        assert ask(headers={"X-Forwarded-For": "1.1.1.1"}).status_code == 429
        assert ask(headers={"X-Forwarded-For": "2.2.2.2"}).status_code == 200
        # a visitor who writes a made-up address in front of the real one is still the same visitor
        assert ask(headers={"X-Forwarded-For": "7.7.7.7, 1.1.1.1"}).status_code == 429

    def test_on_a_plain_server_a_made_up_forwarding_header_does_not_dodge_the_limit(self, groq):
        for i in range(10):
            assert ask(headers={"X-Forwarded-For": f"9.9.9.{i}"}).status_code == 200
        assert ask(headers={"X-Forwarded-For": "8.8.8.8"}).status_code == 429

    def test_questions_that_cost_nothing_are_not_counted(self, groq, monkeypatch):
        for _ in range(15):                                         # a bad request: nothing is sent
            assert client.post("/api/chat", json={"messages": []}).status_code == 400
        monkeypatch.setattr(chat, "_api_key", lambda: "")           # no key: "AI offline", no Groq call
        for _ in range(15):
            r = ask()
            assert r.status_code == 200 and r.json()["status"] == "ai_offline"
        monkeypatch.setattr(chat, "_api_key", lambda: "test-key")
        for i in range(10):
            assert ask().status_code == 200, i                      # all ten are still available
        assert ask().status_code == 429

    def test_while_the_minute_is_full_of_tokens_new_questions_wait_and_never_reach_groq(self, groq):
        ratelimit.chat_limits.note_tokens(6000)
        r = ask(language="en")
        assert r.status_code == 429 and r.json()["details"]["scope"] == "busy"
        assert 1 <= r.json()["details"]["retryAfterSeconds"] <= 60
        assert "busy" in r.json()["error"] and len(groq) == 0
        assert "व्यस्त" in ask(language="hi").json()["error"]

    def test_the_model_call_reports_the_tokens_it_used_to_the_limiter(self, monkeypatch):
        monkeypatch.setattr(chat, "_api_key", lambda: "test-key")
        reply = {"choices": [{"message": {"role": "assistant", "content": "hi"}}], "usage": {"total_tokens": 4321}}
        monkeypatch.setattr(chat.httpx, "post", lambda *a, **k: SimpleNamespace(raise_for_status=lambda: None, json=lambda: reply))
        assert chat._call_model([], [])["content"] == "hi"
        assert sum(n for _, n in ratelimit.chat_limits._tokens) == 4321

    def test_a_model_reply_with_no_usage_figure_still_works(self, monkeypatch):
        monkeypatch.setattr(chat, "_api_key", lambda: "test-key")
        reply = {"choices": [{"message": {"role": "assistant", "content": "hi"}}]}
        monkeypatch.setattr(chat.httpx, "post", lambda *a, **k: SimpleNamespace(raise_for_status=lambda: None, json=lambda: reply))
        assert chat._call_model([], [])["content"] == "hi"
        assert len(ratelimit.chat_limits._tokens) == 0

    def test_the_limits_apply_only_to_the_chat(self, groq):
        for _ in range(11):
            ask()
        assert client.get("/api/health").status_code == 200
        assert client.post("/api/engine/nsfdc/calculate",
                           json={"projectCost": 140000, "familyIncome": 150000, "isSc": True}).status_code == 200
