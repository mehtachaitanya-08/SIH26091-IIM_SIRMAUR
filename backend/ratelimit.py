"""
Rate limits for the chat (POST /api/chat), added 14 Nov 2026 at the owner's request.

WHY THIS FILE EXISTS. Every chat question is a paid-for call on the team's one Groq key, and the free
tier of that key allows 8,000 tokens a minute (see chat.py). Without a limit, one visitor typing
questions in a loop, or a crowd arriving at once, would use the whole allowance and leave the chat
dead for everybody, and a public site makes that easy to do by accident or on purpose.

THE THREE LIMITS
  - per visitor: 10 questions in any 10 minutes. Settings: CHAT_LIMIT_PER_VISITOR and
    CHAT_WINDOW_SECONDS (seconds).
  - site-wide per day: 500 questions in any 24 hours. Setting: CHAT_DAILY_CAP.
  - site-wide per minute, in tokens: 6,000 tokens in any 60 seconds. Setting: CHAT_TOKENS_PER_MINUTE.
The settings are read from the environment on every question, so a host (Render, Codespaces) can
change them without a code change. A missing, zero, negative or non-whole value means the default,
never "no limit": a typo must not switch the protection off.

WHY THE TOKEN GUARD (review finding, 14 Nov 2026). The two question counts do not protect Groq's
per-minute ceiling: one question can make up to six model calls (five tool rounds and the first), each
retried once, and every call re-sends the conversation. So chat.py reports the tokens each Groq reply
says it used (note_tokens), and a new question is refused while the last 60 seconds hold 6,000 or more.
6,000 is the owner-facing default, chosen as three quarters of the 8,000 the free tier allows so that
the question already in flight has room; it is a choice, not a measurement, and the number 8,000 itself
comes from a comment in chat.py dated 11 Nov 2026 that nobody has re-checked against Groq's account page.
It is reactive, and blind to questions still in flight: it cannot stop a question halfway, only the next
one, so a single heavy question can still cross the ceiling once; and if many visitors press send in
the same second, all of them are admitted before any reply has reported its tokens, so a crowd that
arrives at once can still exceed the ceiling (a reviewer's finding, 14 Nov 2026). What bounds that case
is the per-visitor limit, the daily cap and Groq's own 429 retry in chat.py; counting questions in
flight as an estimated cost against the budget would be the next step, and is not done.

WHAT COUNTS. Only a question that would really be sent to Groq. A request refused as malformed, or
answered "AI offline" because no key is set, costs nothing and is not counted (chat.py calls take()
after those checks). A question refused by one limit does not use up another: one spammer, refused
again and again, must not burn the daily cap that every other visitor shares, and a question refused
by the daily cap or the token guard must not eat the visitor's own allowance.

WHAT IT CANNOT DO. The counts live in this process's memory: they reset when the server restarts, and
if the site ever runs on two servers each counts alone (the real daily cap would then be twice as big).
That is acceptable for the one small server it runs on today; a shared store would be needed to change
it. The limiter also cannot tell apart people who share one network address (a campus, or a mobile
carrier that puts many phones behind one address): they count as one visitor and share its 10
questions, and a host with such users should raise CHAT_LIMIT_PER_VISITOR.

WHO A VISITOR IS. The network address the server sees. Behind Render, every request arrives from
Render's own proxy, so the address is read from X-Forwarded-For, and only the LAST entry is trusted:
a proxy appends the address it really saw at the end, while anything before it is whatever the visitor
chose to send, so using the first entry would let anyone pick a fresh identity on every question.
Render's documentation confirms that RENDER is always "true" on Render (checked 14 Nov 2026). It does NOT
say which header carries the visitor's address or in what order, and no real Render request has been
looked at: if Render's own edge adds an address after the visitor's, everybody would count as one
visitor. HOW_TO_RUN.md tells the owner how to check this after the first deploy. Off Render the header
is ignored (anyone could write it), unless TRUST_PROXY_HEADERS=1 is set for a host that sits behind a
proxy of its own.

THREADS. chat.py runs the blocking Groq call off the event loop, so note_tokens is called from worker
threads while take is called on the loop; one lock keeps the counts consistent.
"""

import math
import os
import threading
import time
from collections import deque

from backend.compat import _error

VISITOR_LIMIT = 10
VISITOR_WINDOW_S = 600
DAILY_CAP = 500
DAY_S = 86400
TOKEN_BUDGET_PER_MIN = 6000
TOKEN_WINDOW_S = 60
LONG_WAIT_S = 7200             # a daily-cap wait longer than this is told as "tomorrow" (frontend chatText.js mirrors it)
MAX_TRACKED_VISITORS = 10000   # forget visitors who have gone quiet once more than this many are held


def _setting(name, default):
    """A positive whole number from the environment, else the default (never zero, never 'off')."""
    try:
        n = int(os.environ.get(name, "").strip())
    except ValueError:
        return default
    return n if n > 0 else default


class ChatLimits:
    """Sliding-window counters: question times per visitor and for the whole site, and tokens per minute."""

    def __init__(self):
        self._lock = threading.Lock()
        self.reset()

    def reset(self):
        self._visitors = {}
        self._day = deque()
        self._tokens = deque()     # (time, tokens used by one Groq reply)
        self._last_prune = 0.0

    def note_tokens(self, tokens, now=None):
        """Record the tokens one Groq reply says it used. Anything that is not a positive whole number is ignored."""
        if isinstance(tokens, bool) or not isinstance(tokens, int) or tokens <= 0:
            return
        with self._lock:
            # The clock is read inside the lock so entries stay in time order across threads: pruning
            # only looks at the front of the list (a reviewer's nit, 14 Nov 2026).
            now = time.monotonic() if now is None else now
            self._tokens.append((now, tokens))

    def take(self, visitor, now=None):
        """Count one question. Returns (allowed, seconds_to_wait, scope); scope is None, "daily", "busy" or "visitor"."""
        per_visitor = _setting("CHAT_LIMIT_PER_VISITOR", VISITOR_LIMIT)
        window = _setting("CHAT_WINDOW_SECONDS", VISITOR_WINDOW_S)
        cap = _setting("CHAT_DAILY_CAP", DAILY_CAP)
        budget = _setting("CHAT_TOKENS_PER_MINUTE", TOKEN_BUDGET_PER_MIN)
        with self._lock:
            now = time.monotonic() if now is None else now
            day = self._day
            while day and day[0] <= now - DAY_S:
                day.popleft()
            if len(day) >= cap:
                return False, max(1, math.ceil(day[0] + DAY_S - now)), "daily"

            tokens = self._tokens
            while tokens and tokens[0][0] <= now - TOKEN_WINDOW_S:
                tokens.popleft()
            used = sum(n for _, n in tokens)
            if used >= budget:
                # wait until enough of the oldest replies are a minute old for the total to drop under the budget
                for when, n in tokens:
                    used -= n
                    if used < budget:
                        return False, max(1, math.ceil(when + TOKEN_WINDOW_S - now)), "busy"

            hits = self._visitors.setdefault(visitor, deque())
            while hits and hits[0] <= now - window:
                hits.popleft()
            if len(hits) >= per_visitor:
                return False, max(1, math.ceil(hits[0] + window - now)), "visitor"

            hits.append(now)
            day.append(now)
            self._prune(now, window)
            return True, 0, None

    def _prune(self, now, window):
        # At most once a second, and only when many visitors are held: a scan of every visitor on every
        # question would itself become the slow part under a flood. (Called with the lock held.)
        if len(self._visitors) <= MAX_TRACKED_VISITORS or now - self._last_prune < 1:
            return
        self._last_prune = now
        quiet = [v for v, hits in self._visitors.items() if not hits or hits[-1] <= now - window]
        for v in quiet:
            del self._visitors[v]


chat_limits = ChatLimits()


def visitor_key(request):
    """The network address to count a question against (see "WHO A VISITOR IS" above)."""
    if os.environ.get("RENDER") or os.environ.get("TRUST_PROXY_HEADERS") == "1":
        parts = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
        if parts:
            return parts[-1]
    return request.client.host if request.client else "unknown"


REFUSALS = {
    "visitor": {
        "en": "You have asked many questions in a short time. Please wait about {m} {unit} and ask again. "
              "The loan calculator still works.",
        "hi": "आपने थोड़े समय में बहुत सवाल पूछे हैं। कृपया लगभग {m} मिनट रुककर फिर पूछें। "
              "लोन कैलकुलेटर फिर भी चलता है।",
    },
    "busy": {
        "en": "The assistant is busy right now because many people are asking. Please wait about {m} {unit} "
              "and ask again. The loan calculator still works.",
        "hi": "सहायक अभी व्यस्त है क्योंकि बहुत लोग पूछ रहे हैं। कृपया लगभग {m} मिनट रुककर फिर पूछें। "
              "लोन कैलकुलेटर फिर भी चलता है।",
    },
    # The daily cap slides, so its wait can be only minutes: "tomorrow" is told only for a long wait.
    "daily_soon": {
        "en": "The assistant has reached today's limit for now. Please wait about {m} {unit} and ask again. "
              "The loan calculator still works.",
        "hi": "आज के लिए सहायक की सीमा अभी पूरी हो गई है। कृपया लगभग {m} मिनट रुककर फिर पूछें। "
              "लोन कैलकुलेटर फिर भी चलता है।",
    },
    "daily": {
        "en": "The assistant has reached today's limit. Please try again tomorrow. The loan calculator still works.",
        "hi": "आज के लिए सहायक की सीमा पूरी हो गई है। कृपया कल फिर कोशिश करें। लोन कैलकुलेटर फिर भी चलता है।",
    },
}


def refusal(scope, wait, language):
    """HTTP 429 in plain words: how long to wait, and which limit was hit. Retry-After is the standard header."""
    key = ("daily" if wait > LONG_WAIT_S else "daily_soon") if scope == "daily" else scope
    minutes = max(1, math.ceil(wait / 60))
    text = REFUSALS[key]["hi" if language == "hi" else "en"].format(
        m=minutes, unit="minute" if minutes == 1 else "minutes")
    response = _error(text, 429, details={"retryAfterSeconds": wait, "scope": scope})
    response.headers["Retry-After"] = str(wait)
    return response
