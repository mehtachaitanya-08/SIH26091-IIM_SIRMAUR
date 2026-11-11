# Changes made to your work, and why

Written for you by Person C's side while merging your commit `51d5b45` ("dashboard advisory
rearchitecture plan and UI polish") with the verified-server website work, on the night of
10–11 Nov 2026. Branch: `stage4/dossiers`. Your design, layout and styling were kept; the
changes below are about where numbers come from.

**Team decisions these changes follow**
- The 24 research dossiers (`research_dossiers/*.md`) are the verified data.
  `data/dossiers_db.json` is not used: its figures disagree with the dossiers. Example, D08 Term Loan project cost: ₹8,50,000 in the dossier, ₹5,00,000 in the json, ₹6,80,000 on the old dashboard.
- Every figure shown carries a label: "D08 dossier", [S#], CALCULATED, ASSUMED, USER INPUT or NOT FOUND.
- No number is shown that the server did not give.

| # | File (yours) | What changed | Why |
|---|---|---|---|
| 1 | `frontend/src/services/api.js` → `fetchMandiPrices` | The 7 fixed prices are removed: mustard ₹5,450/qtl, wheat ₹2,275, paddy ₹2,183, maize ₹2,090, gram ₹5,875, groundnut ₹6,780, cotton ₹6,920. With no live answer, it now returns `status: "no_live_data"` and no price. | Whenever the call failed, they were shown as "Verified Daily Mandi Rate" from "data.gov.in Agmarknet Statutory Benchmark". With no key that was every time, which is why every number looked fake. The address and shape of the live reply are kept. |
| 2 | `frontend/src/components/dashboard/DashboardShell.jsx` | Your new full-page production layout is kept as is. One line added: a `banner` slot above it. | Shows the red "Server offline" banner. |
| 3 | `frontend/src/components/dashboard/NsfdcAmortizerView.jsx` | Your header style (grey uppercase label) is kept. The body is the input version: project cost, family income and SC boxes; NOT FOUND until they are filled in; tags on each figure; the server's warnings; the full schedule with an "Added to loan" column. "Sanction Loan" is now "NSFDC loan". | Your version always showed a loan, even before any cost was entered (the old dashboard filled in ₹6,80,000 or ₹1,00,000 on its own). The result is advice, not a sanction. |
| 4 | `frontend/src/components/ProductionDashboard.jsx`, mandi effect | Your business-to-crop list is kept, marked ASSUMED. A business not on the list now gets "no crop, no mandi price" instead of `|| 'Mustard'`. | D20 Metal Smithy, D24 Rural Freight and others were shown mustard prices. Please check D18 Tailoring → Cotton and D15 Tractor Garage → Mustard; they look like guesses. |
| 5 | `frontend/src/components/ProductionDashboard.jsx`, page title | Your `showTitle={false}` is kept; only `banner={banner}` is added. | Merge of both changes. |
| 6 | `frontend/src/components/SetoDashboard.jsx` (landing mock-up) | Your new preview design is kept in full. Removed: the built-in D08/D18/D15 costs, cash flows, DSCRs and season curves; the "DSCR 1.62x / 2.14x" and "+₹2,460/mo" badges; the preview card's "₹6,80,000 / ₹6,12,000 / ₹30,424 / DSCR 1.62x SAFE". They now read "see dashboard". Added an [S1] tag to the "6.5% / 8.0%, 11 or 26 quarterly instalments" line. | None of these figures had a source. ₹30,424 is also wrong: the verified quarterly instalment for ₹6,80,000 is ₹31,644.73, because the pause interest is added to the loan. |
| 7 | `engine/server.py` `/api/mandi-prices` → **copied** into `backend/mandi.py` (your file is not changed) | Same address, the same data.gov.in resource (`9ef84268…`), the same filters and the same live reply. Two changes: the key `DATA_GOV_IN_API_KEY` is read from the environment **or the `.env` file**; with no key, a failed call or no records, the reply is `no_live_data` with no price. The key is never echoed. 5 tests in `backend/tests/test_mandi.py`. | **Why your key wasn't read:** your server only uses `os.getenv`, and nothing loads `.env`, so a key in `.env` never arrived. The website talks to `backend/app.py`, which didn't have this address. |
| 8 | `frontend/src/components/dashboard/CenterWorkspace.jsx`, mandi panel | Your panel design is kept. The price shows only when the reply is live, with the arrival date; otherwise "NOT FOUND" plus the reason. The status badge says "No live data" instead of "Statutory Benchmark". The key light is green or red from the server's real `apiKeyConfigured`; it used to be always green. The crop name is marked "crop link ASSUMED (team's list)". | Before, with no data it showed `|| '5,450'`, labelled "Verified Daily Mandi Rate". |
| 9 | `frontend/src/App.jsx`, landing-page pillar text (English and Hindi) | Corrected to match the NSFDC page [S1] and what the app really does. **Pillar 1:** project cost up to ₹1,40,000, loan up to ₹1,25,000 at 6.5%, repaid within 3 years with a 3-month pause; Term Loan cost up to ₹50,00,000, loan up to ₹45,00,000 at 8%, within 7 years with a 6-month pause. **Pillar 2:** season pattern, DSCR and gaps come from each business's dossier. **Pillar 3:** a bank EMI comparison from the team's engine (ASSUMED); the Usurious Loans Act line now says "check with legal aid". **Pillar 4:** a 1-page advisory DPR, not a loan sanction. | Removed claims that had no source or were wrong: "Up to ₹1,40,000 … 11 quarters tenure" (that is the cost cap, not the loan; the tenure is 12 quarters), "DSCR ≥ 1.50 across all 12 operating cycles", "August drops −35% to −45%", "up to ₹4,800/month", refinancing "to 6.5%" (the engine uses MUDRA at 9.5%), "QR code verification hash" (there is none), "bank sanction appraisal", "RBI Lead Bank Scheme standard", "CAPEX, OPEX, Break-Even, Sensitivity tables". |
| 10 | Kept as you had them | "Statutory Verified" / "Statutory Profile Verified" on the user card, and "(SC · Verified)" on the DPR card. | The team chose to keep them. Note that nobody checks the caste certificate in the app; SC status is self-declared. |

## Your tests

- 45 of your frontend tests fail on your own `main` (51d5b45), before any of this work. Your new landing preview no longer has the debt sliders, search box, scenario list or user card those tests look for. They fail the same way after the merge, and none fail because of it. The list of their names was kept during the merge check.
- Of your other tests, 28 were updated to expect the offline behaviour, shown and approved in Stage 3: when the server is off, `api.js` returns `offline: true` and no figures, except the NSFDC loan, which is worked out in the browser with the server's exact rules.
- 5 tests about the demo account (Ramesh, 9876543210, UP-STP-008129) were failing before any of this work. That account is still in `userDatabase.js`.

## How to run everything

- Server: `backend/.venv/bin/uvicorn backend.app:app --port 8000`. It serves all your `/api` addresses plus `/api/dpr`, `/api/chat`, `/api/feasibility/{code}`, `/api/dossiers/{code}/cashflow` and `/api/mandi-prices`.
- Keys go in the repo's `.env` (gitignored):
  - `DATA_GOV_IN_API_KEY=` for mandi prices;
  - `GROQ_API_KEY=` for the chat.
- Website: `cd frontend && npm run dev` (the dev proxy sends `/api` to port 8000).
- `engine/server.py` is no longer used by the website. It was not changed or deleted.
