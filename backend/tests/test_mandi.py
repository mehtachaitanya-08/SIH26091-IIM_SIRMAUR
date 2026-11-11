"""
GET /api/mandi-prices: the teammate's data.gov.in (Agmarknet) price lookup, moved into the verified
server. Live data only: with no key, or when the call fails, the reply says "no live data" and
carries no price (his version showed 7 fixed prices labelled "Verified Daily Mandi Rate").
No real network call is made here: the data.gov.in request is replaced by a stand-in.
"""

import pytest
from fastapi.testclient import TestClient

from backend import mandi
from backend.app import app

client = TestClient(app)


@pytest.fixture
def no_key(monkeypatch, tmp_path):
    monkeypatch.delenv("DATA_GOV_IN_API_KEY", raising=False)
    monkeypatch.setattr(mandi, "ENV_FILE", tmp_path / "missing.env")


def test_no_key_means_no_price(no_key):
    d = client.get("/api/mandi-prices?commodity=Mustard&state=Uttar+Pradesh").json()
    assert d["status"] == "no_live_data" and d["isLive"] is False
    assert d["modalPrice"] is None and d["records"] == []
    assert d["apiKeyConfigured"] is False and "DATA_GOV_IN_API_KEY" in d["reason"]


def test_placeholder_key_counts_as_no_key(monkeypatch, tmp_path):
    monkeypatch.delenv("DATA_GOV_IN_API_KEY", raising=False)
    env = tmp_path / ".env"
    env.write_text("DATA_GOV_IN_API_KEY=your_api_key_here\n")
    monkeypatch.setattr(mandi, "ENV_FILE", env)
    assert client.get("/api/mandi-prices").json()["apiKeyConfigured"] is False


def test_key_read_from_dotenv_and_live_records_returned(monkeypatch, tmp_path):
    monkeypatch.delenv("DATA_GOV_IN_API_KEY", raising=False)
    env = tmp_path / ".env"
    env.write_text("OTHER=1\nDATA_GOV_IN_API_KEY=abc123\n")
    monkeypatch.setattr(mandi, "ENV_FILE", env)
    seen = {}

    def fake_get(url, params, timeout):
        seen.update(params)
        return {"records": [{"state": "Uttar Pradesh", "district": "Sitapur", "market": "Sitapur",
                             "commodity": "Mustard", "variety": "Yellow", "arrival_date": "10/11/2026",
                             "min_price": "5600", "max_price": "6000", "modal_price": "5800"}]}

    monkeypatch.setattr(mandi, "_get", fake_get)
    d = client.get("/api/mandi-prices?commodity=Mustard&state=Uttar+Pradesh").json()
    assert seen["api-key"] == "abc123" and seen["filters[commodity]"] == "Mustard"
    assert d["status"] == "success" and d["isLive"] is True and d["modalPrice"] == 5800
    assert d["market"] == "Sitapur" and d["records"][0]["arrival_date"] == "10/11/2026"
    assert d["tag"].startswith("data.gov.in")


def test_failed_call_or_empty_records_is_no_live_data(monkeypatch):
    monkeypatch.setenv("DATA_GOV_IN_API_KEY", "abc123")

    def boom(url, params, timeout):
        raise RuntimeError("timed out")

    monkeypatch.setattr(mandi, "_get", boom)
    d = client.get("/api/mandi-prices").json()
    assert d["status"] == "no_live_data" and d["modalPrice"] is None and "timed out" in d["reason"]
    monkeypatch.setattr(mandi, "_get", lambda url, params, timeout: {"records": []})
    d = client.get("/api/mandi-prices").json()
    assert d["status"] == "no_live_data" and d["apiKeyConfigured"] is True


def test_key_never_echoed(monkeypatch):
    monkeypatch.setenv("DATA_GOV_IN_API_KEY", "secret-key-xyz")

    def boom(url, params, timeout):
        raise RuntimeError(f"failed for {url}?api-key={params['api-key']}")

    monkeypatch.setattr(mandi, "_get", boom)
    assert "secret-key-xyz" not in client.get("/api/mandi-prices").text


def test_health_says_whether_the_mandi_key_is_set(monkeypatch, tmp_path):
    # the dashboard's key light must not depend on a business having a crop
    monkeypatch.setattr(mandi, "ENV_FILE", tmp_path / "missing.env")
    monkeypatch.delenv("DATA_GOV_IN_API_KEY", raising=False)
    assert client.get("/api/health").json()["mandiKeyConfigured"] is False
    monkeypatch.setenv("DATA_GOV_IN_API_KEY", "abc123")
    h = client.get("/api/health").json()
    assert h["mandiKeyConfigured"] is True and "abc123" not in str(h)
