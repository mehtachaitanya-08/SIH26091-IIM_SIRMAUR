"""
Shared test set-up for backend/tests.

The chat's rate limiter (backend/ratelimit.py) keeps its counts in memory for the life of the
process. Without this reset, the dozens of chat questions asked across test files would share one
visitor ("testclient") and the eleventh would be refused, so an unrelated test would fail for a
reason that has nothing to do with it (14 Nov 2026, when the limiter was added).
"""

import pytest

from backend import ratelimit


@pytest.fixture(autouse=True)
def _fresh_chat_limits():
    ratelimit.chat_limits.reset()
    yield
    ratelimit.chat_limits.reset()
