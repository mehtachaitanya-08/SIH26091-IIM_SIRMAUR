# How to open the UdyamSetuAI dashboard

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
5. When it's ready, a **"UdyamSetuAI dashboard"** preview opens by itself. If it doesn't:
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

## Keys and limits, on any host

Both keys are read from the **environment first**, then from `.env`, so they work the same wherever the server runs. Never put a key in the code, in a commit, or in `.env.example`.

| Where it runs | Where the two keys go |
|---|---|
| **Render** (the live site) | Dashboard → the service → **Environment** → add `GROQ_API_KEY` and `DATA_GOV_IN_API_KEY`, then save (the service restarts). *Not checked against your Render account: this project has no Render configuration file, so the menu names above come from how Render generally works and may differ. Render's documentation does confirm that it sets `RENDER=true` on every service.* |
| **GitHub Codespaces** | Your GitHub **Settings → Codespaces → Secrets**, same two names. |
| **Your own computer** | `.env` (see Option B), or a Windows user setting: `[Environment]::SetEnvironmentVariable('DATA_GOV_IN_API_KEY','...','User')` in PowerShell, then restart the server. |

**Chat limits.** The chat uses the team's one Groq key, so it has three limits: **10 questions per visitor in 10 minutes**, **500 questions a day for the whole site**, and **6,000 Groq tokens a minute for the whole site** (a token is a small piece of text that Groq counts and charges for; one question can use several thousand). A person over a limit sees a friendly "please wait" message and their question stays in the box. The limits live in the server's memory: they reset when it restarts. A host can change them with these settings (whole numbers; a bad value falls back to the default, never to "no limit"):

| Setting | Default | Meaning |
|---|---|---|
| `CHAT_LIMIT_PER_VISITOR` | 10 | questions one visitor may ask in the window |
| `CHAT_WINDOW_SECONDS` | 600 | the window, in seconds |
| `CHAT_DAILY_CAP` | 500 | questions for the whole site in any 24 hours |
| `CLIENT_IP_HEADER` | none (Render: `CF-Connecting-IP`) | on a host behind its own proxy (with `TRUST_PROXY_HEADERS=1`): the header that proxy sets to the visitor's address, which the visitor cannot write |
| `CHAT_TOKENS_PER_MINUTE` | 6000 | Groq tokens the whole site may use in any 60 seconds. This is a choice, three quarters of the 8,000 a minute that a code comment of 11 Nov 2026 says the team key's free tier allows; check Groq's account page and change it if the real figure differs. It only learns a question's tokens after Groq has replied, so it stops *later* questions, not ones already running: if many people press send in the same second they all get in, and one big question can cross the ceiling once. A crowd that large is still held back by the per-visitor limit, the daily cap and Groq's own slow-down reply. |

**People who share one internet address count as one visitor.** A college network, or a mobile carrier that puts many phones behind one address, makes many real people look like a single visitor, and they then share the 10 questions. If that happens to your users, raise `CHAT_LIMIT_PER_VISITOR` (for example to 30).

**Who counts as a visitor on Render.** The limiter tells visitors apart by Cloudflare's `CF-Connecting-IP` header. Render appears to sit behind Cloudflare (its responses say `Server: cloudflare`), and Cloudflare sets that header itself, so a visitor cannot fake it, provided requests only reach the app through Cloudflare. The older `X-Forwarded-For` header is **not** safe on Render: a live test on 14 Nov 2026 sent 13 questions, each with a different made-up `X-Forwarded-For`, and none were refused. `X-Forwarded-For` is now only a fallback, with a warning in Render's log ("No CF-Connecting-IP header on Render ...") if it is ever used.

**After a deploy that includes this fix, check it once on the live site.** What is not yet proven is that Render passes `CF-Connecting-IP` through to the app. Two ways to check:
1. Look at the service's **Logs** in the Render dashboard. If the warning "No CF-Connecting-IP header on Render" appears, the header is not arriving and the limit can still be dodged: tell the team.
2. From one phone, ask 11 chat questions in a row; the 11th should be refused with "please wait". Then, from a different phone on mobile data, ask one question: it should be answered. If the second phone is also refused, everyone is being counted as one visitor: raise `CHAT_LIMIT_PER_VISITOR` and tell the team.
3. For the technical person: send chat questions with a different made-up `CF-Connecting-IP` header each time (and a made-up `X-Forwarded-For`). If Cloudflare overwrites the header, as it documents, the 11th is still refused. If all of them are allowed, a visitor can still pick their identity and the fix does not hold on Render. This is the one check that matters.

If the header is missing, the fallback (the last `X-Forwarded-For` entry) can be faked. The alternative, counting everyone behind the proxy as one visitor, cannot be faked but would give the whole site only 10 questions per 10 minutes, so it is not the default; that is a choice for the owner.

On another host behind its own proxy, set `TRUST_PROXY_HEADERS=1` and `CLIENT_IP_HEADER` to the name of the header that proxy sets and the visitor cannot write (for example `X-Real-IP`); without `CLIENT_IP_HEADER`, the last `X-Forwarded-For` entry is used, which only a proxy that appends the real address can make safe.

---

## Common problems

| Problem | Fix |
|---|---|
| "This site can't be reached" | The server isn't running. Start it (Option B "Every time"), or in a codespace use the command under "If the page doesn't load". |
| Page says "the website is not built yet" | Run `npm run build` in the `frontend` folder, then reload. |
| Chat says "AI offline" | No Groq key: add `GROQ_API_KEY` (Codespaces secret, or `.env` on your computer), then restart the server or the codespace. |
| Chat pauses for up to 30 seconds | Groq's free tier allows about 8,000 tokens a minute; wait a little between questions. |
| Chat says "please wait" or "today's limit" | The chat's limits (see "Keys and limits"). Wait the few minutes it says; your question stays in the box. |
| A link with 127.0.0.1 from someone else doesn't open | 127.0.0.1 always means "this computer". It only works on the machine where the server is running. |

## For developers

- Website with live reload while editing: `cd frontend && npm run dev`, then open http://127.0.0.1:5173. Keep the server on port 8000 running too.
- Tests: `backend/.venv/bin/python -m pytest -q backend/tests`, and in `frontend`: `node --test test/`.
- The chat model is Groq's `openai/gpt-oss-120b`.
