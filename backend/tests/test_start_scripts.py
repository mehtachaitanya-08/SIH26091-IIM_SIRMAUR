"""
One-click start files: start.bat (Windows) and start.command (Mac/Linux). Each sets everything up
the first time (Python packages, website build, Groq key into .env), then starts the one server and
opens http://127.0.0.1:8000/dashboard.
"""

import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BAT = (REPO / "start.bat").read_text(encoding="utf-8") if (REPO / "start.bat").exists() else ""
SH_PATH = REPO / "start.command"
SH = SH_PATH.read_text(encoding="utf-8") if SH_PATH.exists() else ""


def test_windows_file_does_every_step():
    assert BAT, "start.bat missing"
    assert 'cd /d "%~dp0"' in BAT                                   # works wherever it is double-clicked
    assert "winget install" in BAT and "Python.Python.3.12" in BAT and "OpenJS.NodeJS.LTS" in BAT
    assert "-m venv backend\\.venv" in BAT and "pip install" in BAT and "backend\\requirements.txt" in BAT
    assert "call npm install" in BAT and "call npm run build" in BAT  # npm is a .cmd: needs call
    assert "GROQ_API_KEY" in BAT and ".env.example" in BAT
    assert "uvicorn backend.app:app" in BAT and "--port 8000" in BAT
    assert "http://127.0.0.1:8000/dashboard" in BAT


def test_windows_file_uses_windows_line_endings():
    raw = (REPO / "start.bat").read_bytes()
    assert b"\r\n" in raw and b"\n" not in raw.replace(b"\r\n", b"")


def test_mac_linux_file_does_every_step_and_is_executable():
    assert SH, "start.command missing"
    assert SH.startswith("#!/usr/bin/env bash")
    assert os.access(SH_PATH, os.X_OK)
    for part in ("python3 -m venv backend/.venv", "pip install", "npm install", "npm run build",
                 "GROQ_API_KEY", "uvicorn backend.app:app", "--port 8000", "http://127.0.0.1:8000/dashboard"):
        assert part in SH, part


def test_no_key_ever_written_into_the_files():
    for text in (BAT, SH):
        assert "gsk_" not in text and "proxy-injected" not in text
