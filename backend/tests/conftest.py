"""
Shared test set-up for backend/tests.

The chat's rate limiter (backend/ratelimit.py) keeps its counts in memory for the life of the
process. Without this reset, the dozens of chat questions asked across test files would share one
visitor ("testclient") and the eleventh would be refused, so an unrelated test would fail for a
reason that has nothing to do with it (14 Nov 2026, when the limiter was added).
"""

import pytest

from backend import mandi_snapshot, ratelimit


@pytest.fixture(autouse=True)
def _fresh_chat_limits():
    ratelimit.chat_limits.reset()
    yield
    ratelimit.chat_limits.reset()


@pytest.fixture(autouse=True)
def _no_saved_prices(tmp_path, monkeypatch):
    """The saved mandi prices (backend/mandi_snapshot.py, 14 Nov 2026) are read from data/mandi_snapshot.json,
    which the owner commits for the live site. Every test points the reader at an empty temporary path instead,
    so a real snapshot can never change what an unrelated test sees (for example tests that force a failed live
    call for Uttar Pradesh / Mustard and expect the plain gap), and clears the failure memory, which would
    otherwise leak from one test into the next."""
    monkeypatch.setattr(mandi_snapshot, "SNAPSHOT_FILE", tmp_path / "no-snapshot.json")
    mandi_snapshot.reset()
    yield
    mandi_snapshot.reset()
