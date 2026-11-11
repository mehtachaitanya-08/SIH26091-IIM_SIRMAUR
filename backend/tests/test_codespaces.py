"""
The GitHub Codespaces setup (.devcontainer/devcontainer.json): opening the repo in a codespace
installs everything, builds the website, starts the one server on port 8000 and opens it.
"""

import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CFG = REPO / ".devcontainer" / "devcontainer.json"


def cfg():
    # devcontainer.json is JSON with // comment lines (as GitHub reads it)
    lines = [l for l in CFG.read_text(encoding="utf-8").splitlines() if not l.strip().startswith("//")]
    return json.loads("\n".join(lines))


def test_installs_python_and_website_and_builds_it():
    create = cfg()["postCreateCommand"]
    for part in ("python3 -m venv backend/.venv", "backend/.venv/bin/pip install -r backend/requirements.txt",
                 "npm install", "npm run build"):
        assert part in create, part


def test_starts_the_one_server_on_8000_reachable_from_the_browser():
    start = cfg()["postStartCommand"]
    assert "backend/.venv/bin/uvicorn backend.app:app" in start
    assert "--host 0.0.0.0" in start and "--port 8000" in start
    assert "nohup" in start   # in the background, so the codespace finishes starting


def test_port_8000_forwarded_and_opened():
    c = cfg()
    assert 8000 in c["forwardPorts"]
    assert c["portsAttributes"]["8000"]["onAutoForward"] in ("openPreview", "openBrowser")


def test_asks_for_keys_as_secrets_never_values():
    c = cfg()
    assert set(c["secrets"]) == {"GROQ_API_KEY", "DATA_GOV_IN_API_KEY"}
    text = CFG.read_text(encoding="utf-8")
    assert "gsk_" not in text and "proxy-injected" not in text


def test_python_and_node_available():
    c = cfg()
    assert "python" in c["image"]
    assert any("features/node" in f for f in c["features"])
