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
