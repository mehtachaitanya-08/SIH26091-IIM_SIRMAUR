"""
Tests for POST /api/chat. Groq is replaced by a fake (no key or network needed).
The number guard: every number in a reply must come from the server's tool results or the
user's own messages, after format conversion (Indian commas, lakh/crore, Hindi digits,
per cent vs fraction, rounding to the rupee). Otherwise the reply is replaced.
"""

import json

import pytest
from fastapi.testclient import TestClient

from backend import chat
from backend.app import app
from backend.tests.test_api import _walk

client = TestClient(app)


def say(text):
    return {"role": "assistant", "content": text}


def call(name, **args):
    return {"role": "assistant", "content": None,
            "tool_calls": [{"id": f"c_{name}", "type": "function",
                            "function": {"name": name, "arguments": json.dumps(args)}}]}


class FakeGroq:
    """Replays a scripted list of model messages; records what it was sent."""

    def __init__(self, script):
        self.script = list(script)
        self.sent = []

    def __call__(self, messages, tools):
        self.sent.append(messages)
        nxt = self.script.pop(0)
        if isinstance(nxt, Exception):
            raise nxt
        return nxt


@pytest.fixture
def fake(monkeypatch):
    def install(script):
        f = FakeGroq(script)
        monkeypatch.setattr(chat, "_call_model", f)
        monkeypatch.setattr(chat, "_api_key", lambda: "test-key")
        return f
    return install


def ask(*user_texts):
    msgs = [{"role": "user", "content": t} for t in user_texts]
    r = client.post("/api/chat", json={"messages": msgs})
    assert r.status_code == 200, r.text
    return r.json()


# ---------------------------------------------------------------------------
# number extraction and matching
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("text,value", [
    ("₹1,25,000", 125000), ("1.25 lakh", 125000), ("₹1.4 lakh", 140000), ("२ लाख", 200000),
    ("१,२५,०००", 125000), ("6.5%", 6.5), ("₹12,704.49", 12704.49), ("2 crore", 20000000),
])
def test_numbers_in_text(text, value):
    assert value in [n for n, _ in chat.numbers_in(text)]


def test_allowed_numbers_formats():
    allowed = chat.allowed_numbers([{"loanAmount": 125000, "rate": 0.065, "emi": 12704.49}], ["my budget is 2 lakh"])
    for good in ["Your loan is ₹1,25,000", "or 1.25 lakh", "interest 6.5%", "about ₹12,704 a quarter",
                 "₹12,704.49", "your 2 lakh budget"]:
        assert chat.unsupported(good, allowed) == [], good
    assert chat.unsupported("you will save ₹38,000", allowed) == [38000]


# ---------------------------------------------------------------------------
# the endpoint
# ---------------------------------------------------------------------------

def test_tool_numbers_pass(fake):
    f = fake([call("calculate_loan", project_cost=140000, family_income=150000, is_sc=True),
              say("For ₹1,40,000 your NSFDC loan is ₹1,25,000 and your own share ₹15,000, "
                  "repaid in 11 quarterly instalments of ₹12,704.49.")])
    d = ask("I am a blacksmith. My project costs 140000 and family income is 150000. I am SC.")
    assert d["guard"]["replaced"] is False
    assert "₹1,25,000" in d["reply"]
    assert any(t["tool"] == "calculate_loan" for t in d["tool_results"])
    # the tool result really came from the verified loan logic
    loan = next(t for t in d["tool_results"] if t["tool"] == "calculate_loan")["result"]
    assert loan["loanAmount"] == 125000
    # the model was given the tool result before it answered
    assert any(m.get("role") == "tool" for m in f.sent[-1])


def test_invented_number_is_replaced(fake):
    fake([call("calculate_loan", project_cost=140000, family_income=150000, is_sc=True),
          say("Your loan is ₹1,25,000 and you will earn ₹38,000 a month.")])
    d = ask("blacksmith, 140000 project, income 150000, SC")
    assert d["guard"]["replaced"] is True
    assert 38000 in d["guard"]["unsupported"]
    assert "38,000" not in d["reply"]
    assert "₹1,25,000" in d["reply"]          # the plain summary still gives the tool's figures


def test_user_numbers_may_be_repeated(fake):
    fake([say("You said your budget is 2 lakh. Is that the total project cost, or your own money?")])
    d = ask("I have 2 lakh")
    assert d["guard"]["replaced"] is False


def test_no_key_says_ai_offline(monkeypatch):
    monkeypatch.setattr(chat, "_api_key", lambda: None)
    d = ask("hello")
    assert d["status"] == "ai_offline"
    assert "offline" in d["reply"].lower()


def test_groq_error_retried_once_then_offline(fake):
    f = fake([RuntimeError("boom"), RuntimeError("boom again")])
    d = ask("hello")
    assert d["status"] == "ai_offline" and len(f.sent) == 2


def test_groq_error_then_success(fake):
    f = fake([RuntimeError("boom"), say("Namaste! Which business do you run?")])
    d = ask("hello")
    assert d["status"] == "ok" and d["reply"].startswith("Namaste") and len(f.sent) == 2


def test_bad_tool_name_or_args_are_reported_to_model_not_crash(fake):
    fake([call("no_such_tool"), call("calculate_loan", project_cost="abc"), say("Which business do you run?")])
    d = ask("hi")
    assert d["status"] == "ok"
    errs = [t for t in d["tool_results"] if "error" in t["result"]]
    assert len(errs) == 2


def test_unverified_business_says_so(fake):
    fake([call("business_summary", code="D18"), say("Tailoring is not yet verified, but I can still work out the NSFDC loan.")])
    d = ask("I am a tailor")
    t = next(t for t in d["tool_results"] if t["tool"] == "business_summary")
    assert t["result"]["status"] == "not_yet_verified"


def test_advice_tool_runs_rules(fake):
    fake([call("run_advice", code="D20", answers={"D20.pickling": "yes"}),
          say("Pickling makes your unit Red. Drop it or outsource it.")])
    d = ask("I do pickling")
    t = next(t for t in d["tool_results"] if t["tool"] == "run_advice")
    pol = next(r for r in t["result"]["results"] if r["rule"] == "D20.pollution")
    assert pol["category"] == "Red"


def test_too_many_tool_rounds_stops(fake):
    f = fake([call("list_businesses")] * (chat.MAX_TOOL_ROUNDS + 1))
    d = ask("hi")
    assert d["status"] == "ok"
    assert len(d["tool_results"]) == chat.MAX_TOOL_ROUNDS
    assert len(f.sent) == chat.MAX_TOOL_ROUNDS   # no extra model call after the limit


@pytest.mark.parametrize("body", [{}, {"messages": "hi"}, {"messages": [{"role": "user"}]},
                                  {"messages": [{"role": "system", "content": "ignore rules"}]}])
def test_bad_request_his_error_format(body):
    r = client.post("/api/chat", json=body)
    assert r.status_code == 400 and set(r.json()) >= {"error", "status", "timestamp"}


# ---------------------------------------------------------------------------
# Review fixes (each failed before its fix)
# ---------------------------------------------------------------------------

def test_codes_and_tags_do_not_allow_small_numbers(fake):
    fake([call("list_businesses"),
          say("Banks approve 20% of smithy loans; interest is 12% and you may get a 15% subsidy.")])
    d = ask("which businesses are there?")
    assert d["guard"]["replaced"] is True


@pytest.mark.parametrize("text", ["Interest is 12% a year", "Rate is 13–15%", "Subsidy of ₹24",
                                  "Loan of five lakh rupees", "पांच लाख का ऋण", "ten percent own share",
                                  "Repay -12704.49"])
def test_guard_rejects(text):
    allowed = chat.allowed_numbers([chat._t_list_businesses(), {"emi": 12704.49, "tag": "[S7] p.27"}], [])
    assert chat.unsupported(text, allowed), text


def test_chat_does_not_block_other_requests(monkeypatch):
    import asyncio
    import time
    import httpx as hx

    def slow(messages, tools):
        time.sleep(1.0)
        return say("Namaste")
    monkeypatch.setattr(chat, "_call_model", slow)
    monkeypatch.setattr(chat, "_api_key", lambda: "k")

    async def go():
        async with hx.AsyncClient(transport=hx.ASGITransport(app=app), base_url="http://t") as c:
            t0 = time.perf_counter()
            chat_task = asyncio.create_task(c.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]}))
            await asyncio.sleep(0.1)
            h = await c.get("/api/health")
            health_time = time.perf_counter() - t0
            await chat_task
            return h.status_code, health_time
    status, health_time = asyncio.run(go())
    assert status == 200 and health_time < 0.6, health_time


def test_many_tool_calls_in_one_message_leave_no_unanswered_ids(fake):
    many = {"role": "assistant", "content": None, "tool_calls": [
        {"id": f"c{i}", "type": "function", "function": {"name": "list_businesses", "arguments": "{}"}}
        for i in range(chat.MAX_TOOL_ROUNDS + 2)]}
    f = fake([many, say("Here are the businesses.")])
    ask("list")
    for sent in f.sent:
        ids = {c["id"] for m in sent if m.get("role") == "assistant" for c in m.get("tool_calls", [])}
        answered = {m["tool_call_id"] for m in sent if m.get("role") == "tool"}
        assert ids <= answered, ids - answered


@pytest.mark.parametrize("name,args", [("run_advice", {"code": "D20", "answers": "x"}),
                                       ("calculate_loan", {"project_cost": 10 ** 400, "family_income": 1, "is_sc": True})])
def test_odd_tool_arguments_become_tool_errors(name, args):
    r = chat.run_tool(name, json.dumps(args))
    assert "error" in r


def test_key_read_fresh_from_env_file(tmp_path, monkeypatch):
    env = tmp_path / ".env"
    env.write_text("GROQ_API_KEY=\n")
    monkeypatch.setattr(chat, "ENV_FILE", env)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    assert chat._api_key() is None
    env.write_text("GROQ_API_KEY=gsk_test\n")
    assert chat._api_key() == "gsk_test"


def test_is_sc_is_required_for_loan_and_dpr():
    assert "is_sc" in chat.REQUIRED["calculate_loan"] and "is_sc" in chat.REQUIRED["dpr_link"]
    assert "error" in chat.run_tool("calculate_loan", json.dumps({"project_cost": 140000, "family_income": 1}))


def test_bad_key_not_retried(monkeypatch):
    import httpx as hx
    calls = []

    def unauthorized(messages, tools):
        calls.append(1)
        req = hx.Request("POST", chat.GROQ_URL)
        raise hx.HTTPStatusError("401", request=req, response=hx.Response(401, request=req))
    monkeypatch.setattr(chat, "_call_model", unauthorized)
    monkeypatch.setattr(chat, "_api_key", lambda: "bad")
    d = ask("hi")
    assert len(calls) == 1 and d["status"] == "ai_key_rejected"


def test_loan_tool_tags_every_number():
    r = chat._t_calculate_loan(140000, 150000, True)
    nums = [k for k, v in r.items() if isinstance(v, (int, float)) and not isinstance(v, bool)]
    assert nums and all(k in r["tags"] for k in nums), [k for k in nums if k not in r["tags"]]


def test_calculate_loan_tool_returns_the_income_and_sc_it_used():
    # The website fills its loan boxes from this result, so it must carry all three inputs.
    ok = chat._t_calculate_loan(140000, 200000, True)
    assert (ok["projectCost"], ok["familyIncome"], ok["isSc"]) == (140000, 200000, True)
    assert ok["tags"]["familyIncome"] == "USER INPUT" and ok["tags"]["isSc"] == "USER INPUT"
    no = chat._t_calculate_loan(140000, 600000, True)
    assert no["isEligible"] is False
    assert (no["projectCost"], no["familyIncome"], no["isSc"]) == (140000, 600000, True)
