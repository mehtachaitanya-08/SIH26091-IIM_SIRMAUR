"""
The chat assistant's three weak spots from the owner's live test (14 Nov 2026), checked with a FAKE model:
there is no Groq key in the cloud, so nothing here proves the real model now behaves. The owner's laptop
agent re-runs the live questions (see the live check list in the commit).
  W1  "Which months are weakest?": the season data now carries the weakest months with % vs an average month
      (the number guard used to block "-25%"), and the tool descriptions say which tool holds season data.
  W2  "Will my loan definitely be approved?": the reply always says the bank decides (owner's choice B).
  W3  a count the server supplied (24 businesses) is no longer replaced by the number guard (owner's choice B).
"""

from fastapi.testclient import TestClient

from backend import chat
from backend.app import app
from backend.compat import NAMES
from backend.tests.test_chat import FakeGroq, call, say  # noqa: F401  (the existing fake model)

import pytest

client = TestClient(app)
NO_SEASON = ["D15", "D16", "D17", "D18", "D19", "D20", "D21", "D22"]


@pytest.fixture
def fake(monkeypatch):
    def install(script):
        f = FakeGroq(script)
        monkeypatch.setattr(chat, "_call_model", f)
        monkeypatch.setattr(chat, "_api_key", lambda: "test-key")
        return f
    return install


def ask(text, language=None):
    body = {"messages": [{"role": "user", "content": text}]}
    if language:
        body["language"] = language
    r = client.post("/api/chat", json=body)
    assert r.status_code == 200, r.text
    return r.json()


# --------------------------------------------------------------------------- W1
def test_w1_weakest_months_for_every_business_or_the_dossiers_own_gap():
    for code in NAMES:
        r = chat._t_dossier_figures(code)
        if code in NO_SEASON:
            assert "weakestMonths" not in r and r["seasonality"].get("status") == "NOT FOUND", code
            continue
        w = r["weakestMonths"]
        assert len(w) >= 3 and all(isinstance(m["vsAverageMonthPct"], int) and m["tag"] for m in w), code
    d01 = {m["month"]: m["vsAverageMonthPct"] for m in chat._t_dossier_figures("D01")["weakestMonths"]}
    # July, March and September are tied at 0.85 in the D01 dossier, so all three are listed (ties included)
    assert d01 == {"August": -25, "February": -25, "July": -15, "March": -15, "September": -15}


def test_w1_tool_descriptions_say_which_tool_holds_season_data():
    specs = {s["function"]["name"]: s["function"]["description"] for s in chat.tool_specs()}
    assert "weakest months" in specs["dossier_figures"].lower() and "season" in specs["dossier_figures"].lower()
    assert "no figures" in specs["feasibility"].lower() and "dossier_figures" in specs["feasibility"]
    assert "weakestMonths" in chat.SYSTEM


def test_w1_feasibility_reply_steers_the_model_to_dossier_figures(fake):
    f = fake([call("feasibility", code="D01"), say("Please see the dashboard.")])
    ask("I run a village grocery shop. Which months are weakest for me?")
    tool_msgs = [m["content"] for m in f.sent[-1] if m.get("role") == "tool"]
    assert any("dossier_figures" in t and "no figures" in t for t in tool_msgs)


def test_w1_weakest_months_with_percentages_pass_the_number_guard(fake):
    fake([call("dossier_figures", code="D01"),
          say("Village FMCG Retail (D01 dossier): your weakest months are August -25%, February -25% and July -15% "
              "compared with an average month.")])
    d = ask("I run a village grocery shop. Which months are weakest for me?")
    assert d["guard"]["replaced"] is False and "-25%" in d["reply"]


def test_w1_a_made_up_percentage_is_still_replaced(fake):
    fake([call("dossier_figures", code="D01"), say("August is -30% versus an average month.")])
    d = ask("Which months are weakest for my grocery shop?")
    assert d["guard"]["replaced"] is True
    assert "August -25%" in d["reply"]                                    # the safe summary now gives them


# --------------------------------------------------------------------------- W2
def test_w2_approval_question_gets_the_bank_decides_sentence_in_english(fake):
    fake([say("Sure! To check your loan eligibility, I need to know the type of business you run.")])
    d = ask("Will my loan definitely be approved if I apply?")
    assert d["reply"].endswith(chat.APPROVAL_NOTE["en"])


def test_w2_approval_question_in_hindi(fake):
    fake([say("आप कौन सा व्यवसाय करते हैं?")])
    d = ask("क्या मेरा लोन पक्का मंज़ूर होगा?", language="hi")
    assert d["reply"].endswith(chat.APPROVAL_NOTE["hi"])


def test_w2_not_added_twice_and_not_added_to_other_questions(fake):
    fake([say("What business do you run? " + chat.APPROVAL_NOTE["en"])])
    d = ask("Is a sanction guaranteed?")
    assert d["reply"].count(chat.APPROVAL_NOTE["en"]) == 1
    fake([say("What business do you run?")])
    assert chat.APPROVAL_NOTE["en"] not in ask("What loan can I get for a grocery shop?")["reply"]


@pytest.mark.parametrize("text,hit", [
    ("Will my loan definitely be approved?", True), ("Is the sanction guaranteed?", True),
    ("क्या लोन स्वीकृत होगा?", True), ("गारंटी है क्या?", True),
    ("What is the loan for a tailoring shop?", False), ("I run a grocery shop in Agra", False),
    ("Which months are weakest?", False),
    ("I sell approved seeds", True),   # accepted false trigger: harmless, the sentence is still true
    # review fixes: common phrasings caught; "definitely" alone no longer triggers
    ("Will I get the loan?", True), ("क्या मुझे लोन मिलेगा?", True), ("loan pakka milega?", True),
    ("Are sanctions quick?", True), ("Is the loan sure?", True),
    ("I definitely want a shop", False), ("I am sure I run a grocery shop", False),
])
def test_w2_word_list(text, hit):
    assert chat.asks_about_approval(text) is hit


# --------------------------------------------------------------------------- W3
def test_w3_the_business_count_from_the_server_is_allowed(fake):
    fake([call("list_businesses"), say("I can help with 24 businesses, for example Village FMCG Retail.")])
    d = ask("How many businesses can you help me with, and which are they?")
    assert d["guard"]["replaced"] is False and "24 businesses" in d["reply"]


def test_w3_a_made_up_count_is_still_replaced(fake):
    fake([call("list_businesses"), say("I can help with 25 businesses.")])
    d = ask("How many businesses can you help me with?")
    assert d["guard"]["replaced"] is True and "25" not in d["reply"]


# --------------------------------------------------------------------------- review fixes (14 Nov 2026)
def test_review_a_count_is_never_allowed_as_money_rate_or_years():
    # D01's figures give the counts 12 (months) and 5 (weakest months); list_businesses gives 24. None of
    # these numbers is in the tools as a figure, so only the count rule could let them through.
    tools = [chat._t_dossier_figures("D01"), chat._t_list_businesses()]
    allowed = chat.allowed_numbers(tools, [])
    assert {("count", 12.0), ("count", 5.0), ("count", 24.0)} <= allowed and not {5.0, 12.0, 24.0} & allowed
    for bad in ("The interest is 12 percent", "12 per cent", "12 rupees", "₹12", "12/-", "१२ रुपये", "१२ प्रतिशत",
                "रु 12", "loan for 5 years", "rate 12", "in 5 years", "Subsidy of ₹24"):
        assert chat.unsupported(bad, allowed), bad
    for good in ("I can help with 24 businesses", "all 12 months", "24 व्यवसाय"):
        assert chat.unsupported(good, allowed) == [], good


def test_review_natural_wording_of_the_weakest_months_passes(fake):
    fake([call("dossier_figures", code="D01"),
          say("August and February are 25% below an average month; July is 15% below. August −25%.")])
    d = ask("Which months are weakest for my grocery shop?")
    assert d["guard"]["replaced"] is False, d["guard"]


def test_review_hindi_question_without_a_language_gets_the_hindi_sentence(fake):
    fake([say("आप कौन सा व्यवसाय करते हैं?")])
    d = ask("क्या मेरा लोन पक्का मंज़ूर होगा?")
    assert d["reply"].endswith(chat.APPROVAL_NOTE["hi"])


def test_review_the_sentence_is_added_after_a_guard_fallback(fake):
    fake([call("list_businesses"), say("Approval is 99 percent sure.")])
    d = ask("Will my loan be approved?")
    assert d["guard"]["replaced"] is True and d["reply"].endswith(chat.APPROVAL_NOTE["en"])


def test_review_rule_numbers_are_not_repeated():
    import re
    nums = re.findall(r"(?m)^(\d+[a-z]?)\. ", chat.system_prompt("hi", {"code": "D01"}))
    assert len(nums) == len(set(nums)), nums
