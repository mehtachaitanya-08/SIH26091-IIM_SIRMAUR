"""
The server also serves the built website (frontend/dist), so one program and one link
(http://127.0.0.1:8000) run everything. The /api addresses keep working as before.
"""

import pytest
from fastapi.testclient import TestClient

from backend import site
from backend.app import app

client = TestClient(app)


@pytest.fixture
def built(tmp_path, monkeypatch):
    (tmp_path / "assets").mkdir()
    (tmp_path / "index.html").write_text("<html>UdyamSetuAI app</html>")
    (tmp_path / "assets" / "app.js").write_text("console.log(1)")
    (tmp_path / "manifest.json").write_text("{}")
    monkeypatch.setattr(site, "SITE_DIR", tmp_path)
    return tmp_path


def test_home_and_dashboard_give_the_website(built):
    for path in ("/", "/dashboard", "/dashboard/anything"):
        r = client.get(path)
        assert r.status_code == 200 and "UdyamSetuAI app" in r.text, path
        assert r.headers["content-type"].startswith("text/html")


def test_built_files_are_served(built):
    assert client.get("/assets/app.js").text == "console.log(1)"
    assert client.get("/manifest.json").status_code == 200


def test_api_still_answers_first(built):
    assert client.get("/api/health").json()["status"] == "ok"
    r = client.get("/api/no-such-thing")
    assert r.status_code == 404 and r.headers["content-type"].startswith("application/json")
    assert client.get("/health").json()["status"] == "ok"   # the original loan API too


def test_no_reading_outside_the_website_folder(built):
    for path in ("/../backend/app.py", "/%2e%2e/%2e%2e/etc/passwd", "/assets/../../.env"):
        r = client.get(path)
        assert "UdyamSetuAI app" in r.text or r.status_code == 404, path
        assert "import" not in r.text and "GROQ" not in r.text


def test_not_built_yet_says_how(tmp_path, monkeypatch):
    monkeypatch.setattr(site, "SITE_DIR", tmp_path / "missing")
    r = client.get("/dashboard")
    assert r.status_code == 503 and "npm run build" in r.text
