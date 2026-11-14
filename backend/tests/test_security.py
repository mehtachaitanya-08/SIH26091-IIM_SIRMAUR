import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend import security

client = TestClient(app)

def test_cors_explicit_origins_no_wildcard_with_credentials():
    origins = security.get_allowed_origins()
    assert "*" not in origins
    assert "http://127.0.0.1:8000" in origins
    assert "http://localhost:5173" in origins

def test_cors_preflight_request():
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
    }
    r = client.options("/api/schemes/evaluate", headers=headers)
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert r.headers.get("access-control-allow-credentials") == "true"

def test_dpdp_purge_endpoint():
    r = client.post("/api/privacy/purge")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "purged"
    assert data["erased"] is True
