# How to run GraminAI on your computer

One program serves everything (server and website) at **http://127.0.0.1:8000**.

## First time only

You need **Python 3.12+** (python.org; tick "Add Python to PATH") and **Node.js LTS** (nodejs.org).

```
git clone https://github.com/mehtachaitanya-08/SIH26091-IIM_SIRMAUR.git
cd SIH26091-IIM_SIRMAUR
```

Windows (PowerShell or Command Prompt):
```
python -m venv backend\.venv
backend\.venv\Scripts\pip install -r backend\requirements.txt
copy .env.example .env
cd frontend && npm install && npm run build && cd ..
```

Mac / Linux:
```
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
cp .env.example .env
cd frontend && npm install && npm run build && cd ..
```

Open `.env` in a text editor and put your keys after the `=`:
- `GROQ_API_KEY=` for the chat assistant (free key from console.groq.com → API Keys);
- `DATA_GOV_IN_API_KEY=` for live mandi prices (optional; without it the panel says "no live data").

`.env` is never uploaded to GitHub.

## Every time

Windows:
```
backend\.venv\Scripts\uvicorn backend.app:app --port 8000
```
Mac / Linux:
```
backend/.venv/bin/uvicorn backend.app:app --port 8000
```

Then open **http://127.0.0.1:8000/dashboard** in your browser. Demo sign-in: phone 9876543210, PIN 2026.

After `git pull`, if the website changed, run `cd frontend && npm run build` again.

## For developers

- Website with live reload while editing: `cd frontend && npm run dev`, then open http://127.0.0.1:5173. The dev proxy sends `/api` to port 8000, so keep the server running.
- Tests: `backend/.venv/bin/python -m pytest -q backend/tests` and, in `frontend`, `node --test test/`.
- The chat uses Groq's `openai/gpt-oss-120b`. The free tier allows about 8,000 tokens a minute, so leave a short pause between chat questions.
