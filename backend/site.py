"""
Serves the built website (frontend/dist) from this server, so one program and one link
(http://127.0.0.1:8000) run everything. Build it once with:  cd frontend && npm install && npm run build

Included LAST in backend/app.py: every /api and loan address is matched before this catch-all.
Paths that are not a built file get index.html (the website handles /dashboard itself).
Nothing outside frontend/dist is ever read.
"""

from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse

router = APIRouter()
SITE_DIR = Path(__file__).resolve().parents[1] / "frontend" / "dist"

NOT_BUILT = """<!doctype html><meta charset="utf-8"><title>UdyamSetuAI</title>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.5">
<h2>The server is running, but the website is not built yet.</h2>
<p>Build it once (needs Node.js), then reload this page:</p>
<pre>cd frontend
npm install
npm run build</pre></body>"""


@router.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Browsers ask for /favicon.ico on every page; answer with the site's own icon instead of a 404
    (owner's Windows check, 14 Nov 2026)."""
    icon = SITE_DIR.resolve() / "icon.svg"
    if icon.is_file():
        return FileResponse(icon, media_type="image/svg+xml")
    return JSONResponse({"error": "File not found: /favicon.ico", "status": 404}, status_code=404)


@router.get("/{path:path}", include_in_schema=False)
def website(path: str):
    if path == "api" or path.startswith("api/"):
        return JSONResponse({"error": f"Endpoint not found: /{path}", "status": 404}, status_code=404)
    root = SITE_DIR.resolve()
    index = root / "index.html"
    if not index.is_file():
        return HTMLResponse(NOT_BUILT, status_code=503)
    if path:
        target = (root / path).resolve()
        if target.is_relative_to(root) and target.is_file():
            return FileResponse(target)
        if "." in path.rsplit("/", 1)[-1]:   # a missing file such as /assets/x.js: not the page
            return JSONResponse({"error": f"File not found: /{path}", "status": 404}, status_code=404)
    return FileResponse(index, media_type="text/html")
