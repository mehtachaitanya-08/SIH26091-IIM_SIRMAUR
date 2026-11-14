"""
Two defects that only the REAL model showed (laptop run with the Groq key, 14 Nov 2026), after the cloud agent's
fix had passed every test written with a fake model. The sentences below are the model's actual words.

  1. "Which months are weakest for me?" got three different answers; one said "August, February and July (each
     about 25% below the average month)": July is 15%, not 25%, and two answers dropped March. The number guard
     only checks that each NUMBER exists in the tools, not that it sits next to the right MONTH. So the server now
     writes the months sentence itself, from the tool's own figures, whenever the reply talks about months.
  2. "How many businesses can you help me with?" was still replaced by the fallback: the model wrote
     "I can help with **24** rural businesses". The cloud agent's count rule wanted the counted word right after
     the number, and the model put bold marks and "rural" in between.
"""

import re

import pytest
from fastapi.testclient import TestClient

from backend import chat
from backend.app import app
from backend.tests.test_chat import FakeGroq, call, say

client = TestClient(app)
MONTH = re.compile(r"January|February|March|April|May|June|July|August|September|October|November|December")
MONTH_HI = {"अगस्त": "August", "फ़रवरी": "February", "जुलाई": "July", "मार्च": "March", "सितंबर": "September"}
D01_WEAKEST = {"August": 25, "February": 25, "July": 15, "March": 15, "September": 15}   # % below an average month


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


def pct_by_month(text):
    """{month: percent} read back out of a sentence: each ';'-part names months and ONE percent."""
    out = {}
    for part in text.split(";"):
        months = MONTH.findall(part)
        found = re.findall(r"(\d+)% (?:below|above)", part)
        for m in months:
            out[m] = int(found[0]) if found else None
    return out


# --------------------------------------------------------------------------- 1. the months sentence
class TestTheServerWritesTheMonthsSentence:
    def d01(self):
        return chat._t_dossier_figures("D01")

    def test_every_month_is_paired_with_its_own_percent_and_ties_are_kept(self):
        text = chat.weak_months_text(self.d01(), "en")
        assert text.startswith("Village FMCG Retail (D01 dossier): the weakest months are ")
        assert pct_by_month(text) == D01_WEAKEST
        assert text.count("25% below an average month") == 1 and text.count("15% below an average month") == 1

    def test_in_hindi_with_hindi_month_names(self):
        text = chat.weak_months_text(self.d01(), "hi")
        assert "सबसे कमज़ोर महीने" in text and "औसत महीने से 25% कम" in text and "औसत महीने से 15% कम" in text
        for hi in MONTH_HI:
            assert hi in text
        assert not MONTH.search(text), text

    def test_a_month_at_or_above_the_average_is_not_called_below(self):
        r = {"code": "D99", "name": "Test Shop", "weakestMonths": [
            {"month": "May", "vsAverageMonthPct": 0}, {"month": "June", "vsAverageMonthPct": 5},
            {"month": "July", "vsAverageMonthPct": 5}]}
        text = chat.weak_months_text(r, "en")
        assert "May, no different from an average month" in text
        assert "June and July, 5% above an average month" in text
        assert "below" not in text

    def test_a_single_month_and_two_months_read_naturally(self):
        one = chat.weak_months_text({"code": "D99", "name": "Test Shop", "weakestMonths": [
            {"month": "May", "vsAverageMonthPct": -10, "belowAveragePct": 10}]}, "en")
        assert "the weakest months are May, 10% below an average month." in one
        two = chat.weak_months_text({"code": "D99", "name": "Test Shop", "weakestMonths": [
            {"month": "May", "vsAverageMonthPct": -10}, {"month": "June", "vsAverageMonthPct": -10}]}, "en")
        assert "May and June, 10% below" in two

    @pytest.mark.parametrize("lang", ["en", "hi"])
    def test_the_sentence_passes_the_number_guard_by_itself(self, lang):
        r = self.d01()
        text = chat.weak_months_text(r, lang)
        assert chat.unsupported(text, chat.allowed_numbers([r], [])) == []


class TestTheRealModelsWrongOrIncompleteAnswersAreReplaced:
    Q = "I run a village grocery shop. Which months are weakest for me?"

    def test_the_wrong_pairing_the_real_model_wrote_is_replaced(self, fake):
        # the model's actual words in the laptop run: July was given the 25% that belongs to August and February
        fake([call("list_businesses"), call("dossier_figures", code="D01"),
              say("**Village FMCG Retail (D01 dossier)**\n\nThe weakest months are **August**, **February** and **July** "
                  "(each about 25 % below the average month).")])
        d = ask(self.Q)
        assert "each about 25" not in d["reply"]
        assert pct_by_month(d["reply"]) == D01_WEAKEST                      # July 15, and March and September are back
        assert d["guard"].get("monthsFromServer") is True

    def test_the_incomplete_answer_that_dropped_march_is_replaced(self, fake):
        fake([call("dossier_figures", code="D01"),
              say("The weakest months are August, February, July and September. In these months the sales are about "
                  "25 % lower than an average month (July about 15 % lower).")])
        assert pct_by_month(ask(self.Q)["reply"]) == D01_WEAKEST

    def test_a_correct_answer_is_also_the_servers_own_sentence(self, fake):
        fake([call("dossier_figures", code="D01"), say("August and February are 25% below an average month.")])
        d = ask(self.Q)
        assert d["reply"] == chat.weak_months_text(chat._t_dossier_figures("D01"), "en")

    def test_a_season_question_with_no_month_names_in_the_reply_still_gets_it(self, fake):
        fake([call("dossier_figures", code="D01"), say("Sales dip at some times of the year.")])
        assert pct_by_month(ask("When is my grocery shop business slow?")["reply"]) == D01_WEAKEST

    def test_in_hindi_the_reply_is_the_hindi_sentence(self, fake):
        fake([call("dossier_figures", code="D01"), say("सबसे कमज़ोर महीने अगस्त, फ़रवरी और जुलाई हैं, तीनों में 25% कम।")])
        d = ask("मेरी किराना दुकान के सबसे कमज़ोर महीने कौन से हैं?", language="hi")
        assert "औसत महीने से 25% कम" in d["reply"] and "औसत महीने से 15% कम" in d["reply"]

    def test_with_a_loan_in_the_same_answer_both_come_from_the_server(self, fake):
        fake([call("calculate_loan", project_cost=140000, family_income=150000, is_sc=True),
              call("dossier_figures", code="D01"),
              say("Your loan is ₹1,25,000. Your weakest months are August, February and July, each 25% below.")])
        d = ask("Grocery shop, cost 140000, income 150000, SC. My loan and my weakest months?")
        assert "1,25,000" in d["reply"] and pct_by_month(d["reply"]) == D01_WEAKEST

    def test_a_loan_answer_that_only_says_every_3_months_is_left_alone(self, fake):
        fake([call("dossier_figures", code="D01"), say("Tell me your project cost.")])
        assert ask("I run a grocery shop, what loan can I get every 3 months?")["reply"] == "Tell me your project cost."

    def test_the_modal_verb_may_does_not_trigger_it(self, fake):
        fake([call("dossier_figures", code="D01"), say("May I ask how big your shop is?")])
        assert ask("I run a grocery shop")["reply"] == "May I ask how big your shop is?"

    def test_a_business_with_no_month_data_is_never_given_a_made_up_sentence(self, fake):
        fake([call("dossier_figures", code="D15"), say("This business has no month-by-month data in its research file.")])
        d = ask("Which months are weakest for my tractor garage?")
        assert d["reply"] == "This business has no month-by-month data in its research file."
        assert not d["guard"].get("monthsFromServer")


class TestReviewFindingsOnTheMonthsTrigger:
    """A reviewer's findings on the first version of the trigger (14 Nov 2026)."""

    @pytest.mark.parametrize("text", [
        "I run a grocery shop, 12 month loan, my start is slow, what is my instalment?",
        "a slow start is ok for me",
        "I am quiet about my income",
        "What loan can I get?",
    ])
    def test_slow_or_quiet_in_another_sense_does_not_replace_the_reply(self, fake, text):
        fake([call("dossier_figures", code="D01"), say("What is your project cost?")])
        assert ask(text)["reply"] == "What is your project cost?"

    @pytest.mark.parametrize("text", [
        "Which months are weakest for my grocery shop?", "When is my grocery shop business slow?",
        "What is the slow season for a grocery shop?", "In which months do I earn least?",
        "When do my sales dip?", "मेरी दुकान के सबसे कमज़ोर महीने कौन से हैं?", "किस महीने कम बिक्री होती है?",
        "मेरी दुकान कब सबसे कम चलती है?", "मौसम का असर क्या है?",
    ])
    def test_natural_phrasings_of_a_season_question_are_all_caught(self, fake, text):
        fake([call("dossier_figures", code="D01"), say("Sales change through the year.")])
        d = ask(text)
        assert d["guard"].get("monthsFromServer") is True, text
        assert "25%" in d["reply"] and "15%" in d["reply"], text

    @pytest.mark.parametrize("word", ["मईदा", "कमई", "मार्चिंग", "जूनियर", "अगस्तिया"])
    def test_a_hindi_month_name_inside_a_longer_word_is_not_a_month(self, word):
        assert not chat.MONTH_NAMES.search(f"मेरा {word} ठीक है")

    @pytest.mark.parametrize("word", ["अगस्त", "फ़रवरी", "जुलाई", "सितंबर", "मई"])
    def test_a_hindi_month_name_on_its_own_is_still_a_month(self, word):
        assert chat.MONTH_NAMES.search(f"महीना {word} में") and chat.MONTH_NAMES.search(f"{word}।")

    def test_the_same_business_looked_up_twice_gives_one_sentence(self, fake):
        fake([call("dossier_figures", code="D01"), call("dossier_figures", code="D01"),
              say("Which months are weakest: August.")])
        d = ask("Which months are weakest for my grocery shop?")
        assert d["reply"].count("the weakest months are") == 1

    def test_two_businesses_each_get_their_own_sentence_once(self, fake):
        fake([call("dossier_figures", code="D01"), call("dossier_figures", code="D02"),
              call("dossier_figures", code="D01"), say("Which months are weakest: August.")])
        d = ask("Which months are weakest for a grocery shop and a haat trader?")
        assert d["reply"].count("the weakest months are") == 2 and "D01 dossier" in d["reply"] and "D02 dossier" in d["reply"]


def test_a_hindi_plural_count_noun_is_accepted():
    allowed = chat.allowed_numbers([chat._t_list_businesses()], [])
    assert chat.unsupported("हम 24 व्यवसायों में मदद कर सकते हैं", allowed) == []


def test_the_prompt_says_a_season_question_never_needs_the_project_cost():
    # In the Hindi laptop test the real model asked for the project cost and never looked the months up. A prompt
    # line cannot be unit-tested for what the model then does (only the live run shows that); this only pins that
    # the rule is still there and reaches the model in both languages.
    for lang in ("en", "hi"):
        p = chat.system_prompt(lang, None)
        assert "NEVER ask for the project cost, income or SC status first" in p, lang


# --------------------------------------------------------------------------- 2. the count the real model wrote
class TestTheCountWordsTheRealModelUses:
    def allowed(self):
        return chat.allowed_numbers([chat._t_list_businesses()], [])

    @pytest.mark.parametrize("good", [
        "I can help with **24** rural businesses.",             # the model's actual words
        "I can help with 24 verified businesses.",
        "all **24** businesses",
        "24 different kinds of businesses",
        "24 small local businesses",
        "**24** व्यवसाय",
        "24 ग्रामीण व्यवसाय",
    ])
    def test_a_count_the_server_returned_is_allowed_with_bold_marks_and_a_describing_word(self, good):
        assert chat.unsupported(good, self.allowed()) == [], good

    @pytest.mark.parametrize("bad", [
        "I can help with 25 rural businesses.",                  # a made-up count
        "**24** percent of businesses",
        "24 growth in businesses",
        "₹24 rural businesses",
        "24% rural businesses",
        "24 lakh rural businesses",
        "24 rural years",
    ])
    def test_it_is_still_only_a_count_never_money_a_rate_or_years(self, bad):
        assert chat.unsupported(bad, self.allowed()), bad

    def test_end_to_end_the_models_actual_sentence_is_no_longer_replaced(self, fake):
        fake([call("list_businesses"),
              say("I can help with **24** rural businesses.\nHere are their names (all are verified):\n\n"
                  "Village FMCG Retail, Periodic Haat Mobile Trade, Rural Electronics Recharge.")])
        d = ask("How many businesses can you help me with, and which are they?")
        assert d["guard"]["replaced"] is False and "**24** rural businesses" in d["reply"]

    def test_end_to_end_a_made_up_count_is_still_replaced(self, fake):
        fake([call("list_businesses"), say("I can help with **25** rural businesses.")])
        d = ask("How many businesses can you help me with?")
        assert d["guard"]["replaced"] is True and "25" not in d["reply"]
