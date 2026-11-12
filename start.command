#!/usr/bin/env bash
# UdyamSetuAI - double-click (Mac) or run ./start.command (Linux) to set up the first time and open the dashboard.
# First time: the project's packages, the website build and your Groq key. After that: start + open browser.
set -e
cd "$(dirname "$0")"
echo
echo " ===== UdyamSetuAI: getting everything ready ====="
echo

# 1. Python 3.10+
if ! python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
  echo " Python 3.10 or newer was not found."
  echo " Install it from https://www.python.org/downloads/ (Mac: or 'brew install python'), then run this again."
  read -r -p " Press Enter to close." _; exit 1
fi
echo " [1/5] Python found."

# 2. Python packages
if [ ! -x backend/.venv/bin/python ]; then
  echo " [2/5] Creating the Python environment (first time only)..."
  python3 -m venv backend/.venv
fi
echo " [2/5] Installing / checking Python packages..."
backend/.venv/bin/python -m pip install -q --disable-pip-version-check -r backend/requirements.txt

# 3. Website (built once; delete frontend/dist to rebuild)
if [ ! -f frontend/dist/index.html ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo " Node.js was not found. Install the LTS version from https://nodejs.org (Mac: or 'brew install node'), then run this again."
    read -r -p " Press Enter to close." _; exit 1
  fi
  echo " [3/5] Building the website (first time only, about a minute)..."
  (cd frontend && npm install && npm run build)
fi
echo " [3/5] Website ready."

# 4. Keys in .env
[ -f .env ] || cp .env.example .env
if ! grep -qE '^GROQ_API_KEY=.+' .env; then
  echo
  echo " The chat assistant needs a free Groq key: console.groq.com -> API Keys -> Create API Key."
  read -r -p " Paste your Groq key and press Enter (or just press Enter to skip): " GROQKEY
  if [ -n "$GROQKEY" ]; then
    GROQKEY="$GROQKEY" backend/.venv/bin/python - <<'PY'
import os, re
p = ".env"
s = open(p, encoding="utf-8").read()
s = re.sub(r"(?m)^GROQ_API_KEY=.*$", lambda m: "GROQ_API_KEY=" + os.environ["GROQKEY"].strip(), s)
open(p, "w", encoding="utf-8").write(s)
PY
    echo " Key saved in .env (this file is never uploaded to GitHub)."
  else
    echo " No key entered: the chat will say \"AI offline\". Add it later in the .env file."
  fi
fi
echo " [4/5] Keys checked (.env)."

# 5. Start and open
URL="http://127.0.0.1:8000/dashboard"
echo " [5/5] Starting UdyamSetuAI. The dashboard opens in your browser in a few seconds."
echo "       Keep this window open while you use it. Close it (or press Ctrl+C) to stop."
echo "       Address: $URL   Demo sign-in: 9876543210 / PIN 2026"
( sleep 4; if command -v open >/dev/null 2>&1; then open "$URL"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1; fi ) &
exec backend/.venv/bin/python -m uvicorn backend.app:app --port 8000
