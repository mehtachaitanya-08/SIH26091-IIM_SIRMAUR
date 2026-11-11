# How to open the GraminAI dashboard

Three ways, easiest first.

## Easiest: double-click (Windows or Mac)

1. On https://github.com/mehtachaitanya-08/SIH26091-IIM_SIRMAUR click the green **Code** button → **Download ZIP**, and unzip it.
2. Open the unzipped folder and double-click:
   - **Windows:** `start.bat`. If Windows says "Windows protected your PC", click **More info → Run anyway**.
   - **Mac:** `start.command`. The first time: right-click → **Open** → **Open**.
3. The first time it sets everything up by itself (a few minutes):
   - it installs Python and Node.js if they're missing (Windows only; on a Mac it tells you where to get them);
   - it installs the packages and builds the website;
   - it asks for your Groq key (paste it, or press Enter to skip).
   On Windows, if it installs Python or Node.js, it asks you to close the window and double-click `start.bat` again; then it carries on.
4. The dashboard opens in your browser at http://127.0.0.1:8000/dashboard. Keep the black window open while you use it.

Next time: just double-click again; it starts in seconds.

The other two ways: **Option A** needs nothing installed on your computer. **Option B** is the manual version of the double-click.

Demo sign-in on the website: phone **9876543210**, PIN **2026**.

---

## Option A: open it from GitHub (Codespaces), nothing to install

GitHub runs the project for you in the cloud and opens the dashboard in your browser.

**Once: save your keys in GitHub**
1. On github.com, click your profile picture (top right) → **Settings**.
2. In the left menu: **Codespaces**.
3. Under **Secrets**, click **New secret**:
   - Name: `GROQ_API_KEY`
   - Value: your Groq key (free at console.groq.com → API Keys)
   - Repository access: choose **mehtachaitanya-08/SIH26091-IIM_SIRMAUR**
   - Click **Add secret**.
4. Optional, for live mandi prices: add a second secret named `DATA_GOV_IN_API_KEY` the same way.

Without these keys the dashboard still works; only the chat says "AI offline" and the mandi panel says "no live data".

**Every time: open it**
1. Go to https://github.com/mehtachaitanya-08/SIH26091-IIM_SIRMAUR
2. Click the green **Code** button → **Codespaces** tab.
3. **First time:** click **Create codespace on main**.
   **Later:** click the codespace already listed there; it opens much faster.
4. Wait. The first start installs everything and builds the website, which takes a few minutes. You'll see a terminal working.
5. When it's ready, a **"GraminAI dashboard"** preview opens by itself. If it doesn't:
   - open the **PORTS** tab at the bottom;
   - find port **8000**;
   - click the globe icon ("Open in Browser").
6. Add **/dashboard** to the end of the address and press Enter. Sign in with the demo account.

**If the page doesn't load**, open the codespace's terminal and run:
```
backend/.venv/bin/uvicorn backend.app:app --host 0.0.0.0 --port 8000
```
Then open port 8000 again from the PORTS tab.

**When you're done:** Code → Codespaces → **…** next to the codespace → **Stop codespace**. Codespaces have a free monthly allowance; stopped codespaces use far less of it.

---

## Option B: run it on your own computer

You need **Python 3.12 or newer** (python.org; tick "Add Python to PATH") and **Node.js LTS** (nodejs.org).

**First time only.** Windows (PowerShell or Command Prompt), one line at a time:
```
git clone https://github.com/mehtachaitanya-08/SIH26091-IIM_SIRMAUR.git
cd SIH26091-IIM_SIRMAUR
python -m venv backend\.venv
backend\.venv\Scripts\pip install -r backend\requirements.txt
copy .env.example .env
cd frontend
npm install
npm run build
cd ..
```
Mac / Linux: the same, but with `python3`, `backend/.venv/bin/pip` and `cp .env.example .env`.

Open the `.env` file in Notepad and put your keys after the `=`:
- `GROQ_API_KEY=` for the chat;
- `DATA_GOV_IN_API_KEY=` for mandi prices (optional).

`.env` is never uploaded to GitHub.

**Every time:** one command, from the project folder:
```
backend\.venv\Scripts\uvicorn backend.app:app --port 8000
```
(Mac / Linux: `backend/.venv/bin/uvicorn backend.app:app --port 8000`)

Then open **http://127.0.0.1:8000/dashboard** in your browser. Keep that window open while you use the dashboard.

**After `git pull`**, if the website changed, rebuild it once: `cd frontend`, then `npm run build`, then `cd ..`.

---

## Common problems

| Problem | Fix |
|---|---|
| "This site can't be reached" | The server isn't running. Start it (Option B "Every time"), or in a codespace use the command under "If the page doesn't load". |
| Page says "the website is not built yet" | Run `npm run build` in the `frontend` folder, then reload. |
| Chat says "AI offline" | No Groq key: add `GROQ_API_KEY` (Codespaces secret, or `.env` on your computer), then restart the server or the codespace. |
| Chat pauses for up to 30 seconds | Groq's free tier allows about 8,000 tokens a minute; wait a little between questions. |
| A link with 127.0.0.1 from someone else doesn't open | 127.0.0.1 always means "this computer". It only works on the machine where the server is running. |

## For developers

- Website with live reload while editing: `cd frontend && npm run dev`, then open http://127.0.0.1:5173. Keep the server on port 8000 running too.
- Tests: `backend/.venv/bin/python -m pytest -q backend/tests`, and in `frontend`: `node --test test/`.
- The chat model is Groq's `openai/gpt-oss-120b`.
