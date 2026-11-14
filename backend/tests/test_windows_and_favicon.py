"""
Fixes after the owner's Windows laptop check (14 Nov 2026, owner's decisions 3 and 5).
- The API sends research-file paths with forward slashes on every computer (Windows sent "\\").
- /favicon.ico answers with the site's own icon instead of 404.
The symlink fallback for Windows is tested in test_businesses.py.
"""

from pathlib import PureWindowsPath

from fastapi.testclient import TestClient

from backend import dossier_figures, site
from backend.app import app


def test_dossier_path_uses_forward_slashes_even_for_a_windows_path():
    root = PureWindowsPath(r"C:\work\SIH26091")
    p = PureWindowsPath(r"C:\work\SIH26091\research_dossiers\D01_Village_FMCG_Retail_Dossier.md")
    assert dossier_figures.repo_relative(p, root) == "research_dossiers/D01_Village_FMCG_Retail_Dossier.md"


def test_every_dossier_path_from_the_api_has_no_backslash():
    client = TestClient(app)
    for code in dossier_figures.all_figures():
        d = client.get(f"/api/dossiers/{code}").json()
        assert "\\" not in d["dossier"] and d["dossier"].startswith("research_dossiers/"), code


def test_favicon_answers_with_the_site_icon(tmp_path, monkeypatch):
    (tmp_path / "index.html").write_text("<!doctype html>", encoding="utf8")
    (tmp_path / "icon.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>', encoding="utf8")
    monkeypatch.setattr(site, "SITE_DIR", tmp_path)
    r = TestClient(app).get("/favicon.ico")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/svg+xml")
    assert r.content.startswith(b"<svg")
