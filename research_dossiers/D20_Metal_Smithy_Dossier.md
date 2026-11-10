# D20 Metal Smithy — sector dossier (SIH26091)

| Field | Value |
|---|---|
| Domain code | D20 |
| Short name | Metal_Smithy |
| Domain | Metal smithy (lohar): farm hand tools, gates, grills |
| Basket | B6 Apparel, Tailoring & Handcrafted Goods (कपड़ा सिलाई, बुनाई एवं शिल्प) |
| Unit to study | Gates, farm tools (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

**How to read this file.**
- Every figure carries one tag:
  - `[S#]`: see the Source log at the end
  - `ESTIMATE`: inputs and the sum are shown
  - `NOT FOUND`
  - `VENDOR QUOTE NEEDED`
- Rows marked `⚠` need Person D to open the page in a normal browser.
- Lines marked "our design choice" are app rules we chose, not facts.
- Nothing here comes from memory, blogs or news.

**Sources that could not be opened on 09 Nov 2026** (facts they hold are NOT FOUND here, not guessed):
- pmvishwakarma.gov.in: full guideline and the list of 18 trades
- mudra.org.in
- kviconline.gov.in
- State minimum-wage and DISCOM tariff sites
- Any official steel price series

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2008, farm hand tools | 25932 "Manufacture of hand tools (non-power-driven) for agricultural/horticulture/ forestry" | [S2] p.71 |
| NIC 2008, other hand tools | 25933 "Manufacture of hand tools such as pliers, screwdrivers, press tools, blacksmiths’ tools, drills, punches, milling cutters etc." | [S2] p.71 |
| NIC 2008, forging | 25910 "Forging, pressing, stamping and roll-forming of metal; powder metallurgy" | [S2] p.71 |
| NIC 2008, gates and grills | 25111 "Manufacture of doors, windows and their frames, shutters and rolling shutters, gates and similer articles used on buildings" | [S2] p.70 |
| NIC 2025, farm hand tools | 259302 "Manufacture of hand tools (non-power-driven) for agricultural/ horticulture/ forestry" | [S3] p.105 |
| NIC 2025, other hand tools | 259303 "Manufacture of hand tools such as pliers, screwdrivers, press tools, blacksmiths’ tools, hammers, drills, punches, milling cutters and similar items" | [S3] p.105 |
| NIC 2025, forging | 259101 "Forging, pressing, stamping and roll-forming of metal" | [S3] p.104 |
| NIC 2025, gates and grills | 251101 "Manufacture of metal doors, windows and their frames, shutters and rolling shutters, gates and similar articles used in buildings" | [S3] p.102 |
| App rule (our design choice) | Pick the code for the user's main income: farm tools → 25932 / 259302; gates and grills → 25111 / 251101 | — |
| Sector | Manufacturing (NIC Section C, Division 25) | [S2] pp.70–71 |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Rural count of smithy units | NOT FOUND (needs ASUSE unit-level data) | — |
| Who does this work | The PIB note says traditional artisans "are generally engaged in occupations like carpenter, Blacksmith, Potter, Washerman, and others" | [S14] p.2 |

**Demand drivers.**
- **Gates and grills.** The UP Government profile says: "Demand for fence, grill and railing is mostly from new or redevelopment/ remodeling of housing and commercial buildings" [S5] p.4.
- **Farm tools.** No official demand figure found: NOT FOUND.

**Demand within 5–10 km (formula for the app).**
`ESTIMATE: farm households [Census, NOT IN HAND] × tools bought or re-sharpened per household per year [NOT FOUND] × price [NOT FOUND]`

The inputs are NOT FOUND.

**Rural vs semi-urban.** No official comparison: NOT FOUND. Gate and grill demand follows building work [S5] p.4, so it is likely stronger in semi-urban areas (our reading).

**Sales channels.** No official source. These are field-survey questions, not data:
- Walk-in farmers (tools, re-sharpening)
- Haat sales
- House-builders (gates, grills)
- PM Vishwakarma marketing support, which includes "onboarding them on e-commerce platforms such as GeM" [S14] p.5

**Underserved niches and how to spot them in a block.**

| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Re-sharpening and repair of farm tools before sowing and harvest | Farm hand tools have their own NIC code [S2] p.71 | Ask farmers where they get sickles and ploughshares sharpened, and how long they wait | Demand NOT FOUND |
| Gates and grills for new houses | Demand follows building work [S5] p.4 | Count houses under construction in the block | [S5] for the driver; size NOT FOUND |
| Implement repair welding | See the D15 dossier | — | — |

---

## 2. CapEx

**Price source.** The UP Government MSME portal profile "Fabrication of Grills, Gates and Fence" [S5] gives a machine list with quantity, rate and total.

| Point | Detail | Tag |
|---|---|---|
| Date | **Undated** | [S5] |
| Scale | It is a **large unit**: "Total Recurring Expenditure 233.58" lakh a year | [S5] p.7 |
| Caveat | "We can modify the project capacity and project cost as per your requirement." | [S5] p.2 |

Each price needs a fresh quotation.

**Checks on the profile's arithmetic** (SOP D4):

| Check | Sum | Result |
|---|---|---|
| Machine list | 40,000 + 36,000 + 20,000 + 40,000 + 20,000 + 75,000 + 25,000 + 15,000 + 10,000 + 50,000 + 10,000 + 10,000 = 3,51,000 | Matches "Total : 351000" [S5] p.7 |
| Project cost | 3.51 + 0.80 + 0.30 + 0.30 + 38.93 = 43.84 | Matches "43.84" [S5] p.5 |
| Own share | 0.88 + 0.20 + 0.08 + 0.30 + 9.73 = 11.19 | Matches [S5] p.5 |
| Loan | 2.63 + 0.60 + 0.23 + 29.20 = 32.66 | Matches [S5] p.5 |
| Salaries | 4 × 7,000 + 4 × 5,000 + 15,000 + 7,000 = 70,000 a month; × 12 = 8,40,000 | Matches [S5] p.5 |
| Turnover | 202.50 × 65,000 + 64.80 × 1,50,000 + 2.70 × 12,00,000 = 2,61,22,500 | Matches [S5] p.8 |
| Working-capital heading | Says "TOTAL WORKING CAPITAL 3 MONTHS", but the 233.58 lakh total uses the **annual** salary of 8.40 lakh | **Inconsistent.** The 38.93 is 233.58 ÷ 6 = 2 months, as the next line says ("Working Capital for 2 months") [S5] p.6 |
| Furniture | Shown as "0.80" in the cost table (p.5), but "Furniture and Fixture/ Office Equipment, electricity installation 0.50" on p.7 | **Inconsistent** [S5] |
| Staff count | "start from 8 employees" (p.5), but the salary table lists 4 + 4 + 1 + 1 = 10 people | **Inconsistent** [S5] p.5 |
| Profit | Printed "28.57"; ESTIMATE 266.63 − 238.08 = 28.55 | Rounding only. The label "Cost of Production ‐ Turnover" is the wrong way round [S5] p.8 |
| Wastage | The turnover is labelled "Excluding 10% wastage", but nothing is deducted: ESTIMATE 2,61,22,500 + 5,40,000 = 2,66,62,500 | **Inconsistent** [S5] p.8 |
| Own share | The profile funds "based on 25% loan on fixed assets": own 11.19 of 43.84 = ESTIMATE 25.5% | NSFDC needs only **at least 10%** [S1], so an SC borrower may need far less own money than this profile shows [S5] p.6 |

**Connected load and phase.** NOT FOUND. The profile gives no HP or kW figure. Whether 3-phase is needed likely depends on the welding sets and presses (our reading; vendor quote) and the State DISCOM code ⚠.

**Where machines are made.** NOT FOUND.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1]): village lohar

The item list is our design choice. Only three lines have official prices.

| # | Item | Qty | Line total (₹) | Tag |
|---|---|---|---|---|
| 1 | Welding Machine | 1 | 25,000 (the profile's "Rate" for one) | [S5] p.7 |
| 2 | Hand Drills and tools | 1 | 20,000 | [S5] p.6 |
| 3 | Hand Tools and gauges | 1 lot | 10,000 | [S5] p.7 |
| | **Sourced subtotal** | | **ESTIMATE 25,000 + 20,000 + 10,000 = 55,000** | [S5] |
| 4 | Hearth (bhatti), blower, anvil, hammers, tongs | 1 set | VENDOR QUOTE NEEDED | — |
| 5 | Bench grinder | 1 | VENDOR QUOTE NEEDED | — |
| 6 | Pre-operative: Udyam, local licence, power connection | — | NOT FOUND (see §6) | — |
| 7 | Working capital (steel, coal or charcoal, electrodes) | — | See §3 | — |

- **Room under the ceiling.** ₹1.40 lakh [S1] − 55,000 = ESTIMATE ₹85,000 left for rows 4–7.
- **Loan on the sourced items alone.** At most 90% [S1] × 55,000 = ESTIMATE ₹49,500. Own share at least ₹5,500.
- **Loan at the ceiling.** Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ₹1,26,000 → capped at ₹1,25,000 [S1]. Own share is **at least** ₹15,000 [S1].
- **PM Vishwakarma toolkit.** The e-voucher of "₹15,000" [S14] p.4 could cover part of row 4 for an eligible user (see §7).

### 2b. Term Loan size (the UP profile's unit)

| # | Item | ₹ lakh | Tag |
|---|---|---|---|
| 1 | Plant and Machinery (12 lines, incl. "Pickling and Surface treatment 75000", "Sand Blasting Facility 25000", "Spray Painting Facility 15000", "Welding Machine Nos 2 25000 50000") | 3.51 | [S5] pp.5–7 |
| 2 | Furniture & Fixture | 0.80 | [S5] p.5 |
| 3 | Contingencies | 0.30 | [S5] p.5 |
| 4 | Pre and Post operative | 0.30 | [S5] p.5 |
| 5 | Margin for Working Capital | 38.93 | [S5] p.5 |
| | **Total project cost** | **43.84** | [S5] p.5 |

- **NSFDC Term Loan.** At most 90% [S1] × 43.84 = ESTIMATE **₹39.456 lakh**, below the ₹45 lakh cap [S1]. Own share is **at least** ESTIMATE 43.84 − 39.456 = **₹4.384 lakh** [S1].
- **The profile's own funding.** Own contribution "11.19", Term Loan "3.46", Working capital "29.20" [S5] p.6, from a bank, not NSFDC.
- **Working capital dominates.** ESTIMATE 38.93 ÷ 43.84 = **88.8%** of the project is working capital. This unit **would fail PMEGP's limit** (§7).
- **Pollution.** The machine list includes pickling, sandblasting and spray painting [S5] p.6. It also sells "Brass, Bronze, SS steel with plating/ metal coating" and "Cast products" [S5] p.8.
  - Pickling and plating are **Red** [S7] p.27.
  - Casting in-house would be **Orange** foundry work [S7] p.28, unless the castings are bought in (NOT FOUND).
  - So this unit is **Red, not White** (§6).

---

## 3. OpEx & working capital

**Yearly recurring cost, Term Loan size** (UP profile [S5] p.6):

| Cost | ₹ | Tag |
|---|---|---|
| Salary and Wages | 8,40,000 | [S5] p.6 |
| Raw Material | 2,17,75,000 | [S5] p.6 |
| Utilities | 2,07,770 | [S5] p.6 |
| Other selling and administrative | 5,35,250 | [S5] p.6 |
| **Total** | **233.58 lakh a year** (ESTIMATE ÷ 12 = **19.465 lakh a month**) | [S5] p.6 |

**Raw material per tonne sold.** ESTIMATE 2,17,75,000 ÷ (202.50 + 64.80 + 2.70 = 270 t) = about ₹80,648 per tonne of output [S5] pp.6, 8. This is above the profile's own selling rate for mild-steel railings of "65,000.00" per tonne [S5] p.8. The figures don't fit together for mild steel alone; they only work because of the much higher-priced stainless and brass lines [S5] p.8 (our reading). **Do not use the profile's per-tonne economics for a village smithy.**

**Micro Finance size.** All costs (rent, coal or charcoal, steel, electricity) are NOT FOUND. A factory profile does not scale down to a one-person forge (SOP D5).

**Working-capital cycle (days).**

| Stage | Days | Tag |
|---|---|---|
| Profile's own working capital | "Working Capital for 2 months" = 38.93 lakh, i.e. about 60 days of recurring cost | [S5] p.6 |
| Steel / coal stock (Micro) | NOT FOUND | — |
| Making time per order | NOT FOUND | — |
| Customer credit (udhaar) | NOT FOUND | — |

**Formula** (framework G11): `Working capital = (sum of cycle days ÷ 30) × monthly OpEx`.
- Term Loan size, using the profile's 2 months: ESTIMATE (60 ÷ 30) × 19.465 = 38.93 lakh, which matches [S5] p.6.
- The profile gives no split by stage (stock vs credit), and **no supplier credit is subtracted**, so this is a gross figure.
- Micro size: NOT FOUND (field survey).

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Selling rate, mild-steel railings and fencing | "65,000.00" per tonne | [S5] p.8 |
| Selling rate, cast products and stainless steel | "1,50,000.00" per tonne | [S5] p.8 |
| Scrap | "Add cost of Scrap 30 18,000.00 5,40,000.00" | [S5] p.8 |
| Turnover at 100% capacity | "266.63" lakh | [S5] p.8 |
| Profit on sales at 100% capacity | "10.72%" | [S5] p.8 |
| Price per farm tool (sickle, khurpi, ploughshare) | NOT FOUND (no official price series) | — |
| Steel price | NOT FOUND (no official series opened) | — |
| Break-even | NOT FOUND | — |

**Regional purchasing power.** HCES 2023-24 rural MPCE (Statement 7, Rural column) [S13] p.12. These are Section I figures; "‘MPCE estimates with imputation’ are presented in Section II" [S13] p.4.

| State | Rural MPCE (₹) | Ratio to all-India (ESTIMATE ÷ 4,122) |
|---|---|---|
| UP | 3,481 | 0.84 |
| Bihar | 3,670 | 0.89 |
| MP | 3,441 | 0.83 |
| Rajasthan | 4,510 | 1.09 |
| Maharashtra | 4,145 | 1.01 |
| All-India | 4,122 | 1.00 |

**Pricing strategy (our design choice).**
- Quote steel at the day's rate plus a labour charge, so the owner is not exposed to steel price swings.
- In States with a ratio below 1.0, lead with farm-tool sales and re-sharpening (needed items) before decorative grills.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |
| Reason | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

- No official monthly series was found.
- Farm-tool demand likely follows sowing and harvest, but no source gives a number.
- **Lean-month stress factor: NOT FOUND.**
- **G9 fails until our field survey fills this row.** Survey question: "In which months do you sell or sharpen the most and the fewest tools? Roughly how many in each?"

---

## 6. Compliance

All rows were opened on 09 Nov 2026 unless marked ⚠.

**Pollution: which category applies depends on the process.**

| Process | Category | Exact quote | Tag |
|---|---|---|---|
| Hot forging, liquid fuel | **Orange** (PI 76.0) | "102.1 Forging of ferrous and non- ferrous metals using liquid fuel" … "76.0 Orange" | [S7] p.28 |
| Hot forging, gaseous fuel | **Orange** (PI 68.0) | "102.2 … using gaseous fuel" … "68.0 Orange" | [S7] p.28 |
| Hot forging, electricity | **Orange** (PI 60.0) | "102.3 … using electricity" … "60.0 Orange" | [S7] p.28 |
| Cold forging, no heat treatment | **Green** (PI 40.0) | "102.4 Forging of ferrous and non- ferrous metals (cold forging, without any heat treatment)" … "40.0 Green" | [S7] p.28 |
| Hot forging on a **coal or charcoal hearth** (the usual village bhatti) | **NOT FOUND ⚠**: no row names solid fuel | — | [S7] |
| Metal fabrication or hand-tool making by machine, no heat or surface treatment, no spray painting | **White** (PI 0.0) | "209.0 Metal fabrication works and hand tool manufacturing through machines (without heat/surface treatment or spray painting)" | [S7] p.53 |
| Engineering and fabrication, dry process | **White** (PI 0.0) | "51.0 Engineering and fabrication units (dry process without any heat treatment / metal surface finishing operations / painting)" | [S7] p.12 |
| **Pickling or other metal surface treatment** (in the UP profile's machine list) | **Red** (PI 88.8) | "101.1 Industry or process involving metal surface treatment or process such as pickling/ electroplating/paint stripping/ heat treatment using cyanide bath/ phosphating or finishing and anodizing / enamellings/ galvanizing" … "88.8 Red" | [S7] p.27 |
| **Almirah and grill making, dry mechanical process** (the D20 gates and grills product) | **Green** (PI 30.0) | "3.0 Almirah, Grill Manufacturing (Dry Mechanical Process )" … "30.0 Green" | [S7] p.2 |
| Heat treatment in a furnace, e.g. hardening sickles (no cyaniding) | **Green** (PI 50.0) | "101.3 Heat treatment - furnace ( without cyaniding)" … "50.0 Green" | [S7] p.27 |
| Heat treatment by newer methods (induction hardening etc.) | **Green** (PI 38.8) | "101.4 Heat treatment with any of the new technology like ultrasound probe, induction hardening, ionization beam, gas carburizing etc." … "38.8 Green" | [S7] p.27 |
| Foundry (casting), cupola furnace | **Orange** (PI 77.5) | "104.1 Foundry operations using Cupola furnace" … "77.5 Orange" | [S7] p.28 |
| Foundry (casting), induction or arc furnace | **Orange** (PI 59.5) | "104.2 Foundry operations using Induction furnace/arc furnace" … "59.5 Orange" | [S7] p.28 |
| Steel furniture without spray painting / with spray painting | **White** (0.0) / **Green** (25.0) | "63.2 Steel furniture without spray painting" … "0.0 White"; "63.1 Steel furniture with spray painting" … "25.0 Green" | [S7] pp.15–16 |
| Sand or shot blasting (in the UP profile) | **NOT FOUND**: no CPCB row names it | — | [S7] |
| Blacksmithy as such | **NOT FOUND**: the only smithy row is "70.0 Gold and silver smithy" | — | [S7] p.21 |
| Spray painting | **Green** (PI 47.5) | "125.0 Spray painting, paint baking, paint shipping" … "47.5 Green" | [S7] p.34 |
| Wire drawing, no pickling, no heat treatment | **White** (PI 0.0) | "105.3 Wire drawing and wire netting (without pickling and without heat treatment)" … "0.0 White" | [S7] p.28 |

**App rule (our design choice):**
- IF the unit does pickling, plating or galvanising THEN show **Red**, and tell the user to drop it or outsource it.
- ELSE IF it does hot forging or in-house casting THEN show **Orange**. If the fuel is coal or charcoal, tell the user to confirm with the State board ⚠.
- ELSE IF it makes gates, grills or almirahs, heat-treats tools, or spray-paints THEN show **Green**. Exception: in Maharashtra, grill making "(Without Painting)" is White (MPCB item 6 [S8]).
- ELSE (cold work, repair welding and general fabrication only) show **White**, and tell the user to confirm with the State board ⚠. The State board decides how CPCB rows 3.0, 51.0 and 209.0 apply (NOT FOUND).

| Rule | Law & section | Trigger | Threshold | Govt fee | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — | — |
| White: no consent, written intimation | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) [S9] p.8. Water Act s.25 proviso: G.S.R. 703(E) 12.11.2024, para (a) replaced by G.S.R. 511(E) [S10] p.8. Both dated "28th July, 2025" on p.8; later notes give "29th July, 2025" ⚠. Schedules replaced by G.S.R. 761(E) [S9] p.16 / 762(E) [S10] p.16 (17.10.2025), then by G.S.R. 598(E) [S9] p.25 / 599(E) [S10] p.24 (08.07.2026) | Listed White sector | Pollution index **up to 25, and only if the sector is named in the Schedule**. A score of 25 or less alone does not exempt (e.g. Green rows scored 25.0 are not exempt) | — | SPCB | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees" (2025 text, [S9] p.8). 2026 Schedule: "78. Metal fabrication works and hand tool manufacturing through machines (without heat or surface treatment or spray painting)"; "17. Engineering and fabrication units dry process without any heat treatment or metal surface finishing operations or painting"; "19. Steel furniture without spray painting"; "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)"; "73. Manufacturing of domestic hardware and utensils (without heat or surface treatment or effluent generation)". Almirah and grill making is **not** in the 2026 White Schedule | [S9] pp.8, 26–28; [S10] p.8 | Orange or Red units need consent from the State board: procedure and fee NOT FOUND ⚠ |
| Pollution: Maharashtra | MPCB circular, 16.06.2025 | On the State list ("new or left-over White category industries") | **White**: item 53 "Engineering workshop, machine shop, fabrication shop, smithy shop, turning shop, cutting shop"; item 76 "Hand Tools without casting"; item 213 "Various types of Hand Tools manufacturing"; item 6 "Assembling of Almirah, Grill Manufacturing (Without Painting)"; item 55 "Fabricating units for tractor trailer, agricultural equipment etc. (without electroplating, spray painting & powder coating)"; item 60 "Fabricatingunits for iron doors and shutters (without electroplating, spray painting & powder coating)" | NOT FOUND | MPCB | "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | [S8] pp.1, 3–4, 7 | Maharashtra lists "smithy shop" as White by name. How this fits with CPCB's Orange hot-forging rows: NOT FOUND ⚠. UP, Bihar, MP, Rajasthan lists: ⚠ not opened. **Note:** Maharashtra's own White list does not by itself give the central written-intimation exemption, which covers only sectors named in the central Schedule [S9] p.8 (our reading) |
| **GST registration** | CGST Act s.22(1) | Aggregate turnover in a financial year | ₹20 lakh; ₹10 lakh in "special category States" | NOT FOUND | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees" | [S11] p.49 | Special category = the Article 279A(4)(g) States, minus "Jammu and Kashmir" and "Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand" [S11] p.51. None of our 5 States is named. Article 279A list not opened ⚠ |
| GST ₹40 lakh goods-only limit | Notification 10/2019-CT | Only for "exclusive supply of goods" | ₹40 lakh | — | CBIC | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | [S12] | A smith who only sells tools and gates he makes may be "exclusively" a goods supplier (our reading). Repair or sharpening work makes it a mix, so ₹20 lakh applies. Not available in "Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Telangana, Tripura, Uttarakhand" [S12] |
| GST: inter-State supply | CGST Act s.24(i) | Any inter-State taxable supply | Registration compulsory | — | CBIC | "persons making any inter-State taxable supply" | [S11] p.51 | Selling tools across a State border forces registration [S11] |
| Udyam registration | MSMED Act (section NOT FOUND) | NOT FOUND | NOT FOUND | NOT FOUND ⚠ | MoMSME | NOT FOUND | ⚠ | NOT FOUND |
| Shops & Establishments / panchayat licence | State Acts | Workshop premises | NOT FOUND | NOT FOUND | State labour dept / panchayat | NOT FOUND | ⚠ | NOT FOUND for each of the 5 States |
| Electricity connection | State supply code / tariff order | Welding sets, presses | NOT FOUND | NOT FOUND | DISCOM | NOT FOUND | ⚠ | NOT FOUND |
| Gas cylinders (if gas cutting or gas forging) | NOT FOUND ⚠ | Storing cylinders | NOT FOUND | — | NOT FOUND ⚠ | — | ⚠ | — |

---

## 7. Scheme fit

### 7.1 NSFDC first

| Item | Micro Finance Scheme (MFS) | Term Loan |
|---|---|---|
| Project cost | "units costing up to ₹1.40 lakh" [S1] | "more than ₹1.40 lakh and up to ₹50.00 lakh" [S1] |
| Loan | "The maximum loan limit is ₹1.25 lakh" [S1] | "up to ₹45.00 lakh" [S1] |
| Share of cost | "In all schemes, NSFDC provides up to 90% of the project cost." [S1]. Own share at least 10%, more when the cap binds | same [S1] |
| Interest | "6.5% p.a." [S1] | "8% p.a." [S1] |
| Channel | "Implemented via SCAs/CAs." [S1] | "Implemented via SCAs/CAs." [S1] |
| Repayment | "quarterly installments within 3 years (including a 3-month moratorium)" [S1] | "within 7 years (including a 6-month moratorium…)" [S1] |
| Who | SC with a valid caste certificate; "Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026)" [S1]. "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community" [S1] | same [S1] |
| Fits D20? | Yes. NSFDC lists "Small Industries Sector (e.g., manufacturing units, handicrafts, boutiques)" [S1]. The §2a sourced items (₹55,000) fit under ₹1.40 lakh [S1][S5] | **⚠ Unclear.** The §2b unit (₹43.84 lakh) is below ₹50 lakh [S1][S5], but 88.8% of it is working capital (ESTIMATE, §2b). Whether an SCA will fund a project that is mostly working capital at 8%: NOT FOUND ⚠. It is close to the ₹45 lakh loan cap: the loan of ₹39.456 lakh leaves ₹5.544 lakh of room (ESTIMATE 45 − 39.456) |

**Women.** "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries." [S1]

**Watch the channel.** Two other NSFDC schemes cover the same project sizes at much higher interest [S1]:

| NSFDC scheme | Project size | Channel | Interest | Tag |
|---|---|---|---|---|
| Aajeevika Micro-Finance Yojana (AMY) | "projects costing up to ₹1.40 lakh" | NBFC-MFIs | "15% p.a." | [S1] |
| Udyam Nidhi Yojana (UNY) | "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh" | "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a." | 13% / 15% | [S1] |

**App rules (our design choice):**
- Quote 6.5% only for the MFS loan and 8% only for the Term Loan, both "Implemented via SCAs/CAs." [S1].
- IF the lender is an MFI, cooperative bank or small finance bank THEN warn: "This may be AMY or UNY at 13–15%." [S1]
- IF the lender is a public sector bank or regional rural bank THEN say "confirm the rate". NSFDC's partners include "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)", and "rates vary slightly by scheme and channelizing agency" [S1].

**Two more NSFDC services** [S1]:

| Service | What it is | Tag |
|---|---|---|
| Online application | "Online Mode (PM-SURAJ Portal)" | [S1] |
| Free skill training | "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period" | [S1] |

**How to apply** [S1]:
- NSFDC does not take applications directly: "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."
- Offline applications go with "a valid caste certificate, income proof, KYC documents" and the agency's checklist.

Note: [S1] is a MoSJE development-site copy (devmosje.negd.in). Confirm on nsfdc.nic.in ⚠.

### 7.2 Other schemes

**PM Vishwakarma** is likely the best fit for a village lohar. The PIB note names "Blacksmith" among the occupations of traditional artisans [S14] p.2. Whether "Blacksmith (Lohar)" is one of the 18 listed trades: the trade list is not in the saved copy ⚠. The SOP points to the full guideline (p.12), which is not saved here.

| Scheme | Who qualifies | Min. size | Benefit | Own share | Period / open now? | Negative list | Combine with NSFDC loan? | Tag |
|---|---|---|---|---|---|---|---|---|
| **PM Vishwakarma** | "working with bare hands and tools"; "Engaged in one of the mentioned 18 family-based traditional trades"; "Involved in the unorganized sector or self-employment basis"; "Minimum age should be 18 years on the date of registration"; "restricted to one member of the family only"; family member must "not be employed in government service". **Fits the Micro size (§2a) only.** The 10-person factory (§2b) likely fails "self-employment basis" (our reading) | NOT FOUND | Toolkit "₹15,000 in the form of an e-voucher"; training "stipend of ₹500 per day"; loan "₹1 Lakhs" (18 months, "Basic training completed"), then "₹2 Lakhs" (30 months: "Availed 1st tranche of loan", "Maintained standard loan account", "Adopted digital transactions in business, or undergone advanced training"); "Concessional rate of interest fixed at 5%"; "Re.1 per digital transaction" | NOT FOUND | Outlay "from FY 2023-24 to FY 2027-28". New registrations? ⚠ | NOT FOUND | **Unclear ⚠.** "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years." Whether NSFDC counts: NOT FOUND ⚠. **App rule (our design choice):** IF the user is a traditional lohar THEN show PM Vishwakarma first (5%), and tell them to ask the District Project Management Unit before taking an NSFDC loan | [S14] pp.2–5 |
| **PMEGP** | Any individual above 18; "There will be no income ceiling"; new projects only; "Projects without Capital Expenditure are not eligible"; "The ‘Family’ includes self and spouse." | NOT FOUND | Subsidy for "Special (including SC…)": 25% urban, **35% rural** | **5%** | Undated summary (2022-11 web folder). **Status after March 2026: NOT FOUND** | Pre-revision list does not name smithy in its readable text ⚠ | **Unclear ⚠.** "the units that have already availed Government Subsidy under any other scheme… are not eligible"; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks" | [S15] pp.2–3; [S16] p.23 |
| **PMEGP and NSFDC together** | PMEGP lists its financing institutions as "All Public Sector Banks", "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI" and "Small Industries Development Bank of India (SIDBI)". **NSFDC and SCAs are not listed**; the implementing agencies name "National Scheduled Tribes Finance and Development Corporation (NSTFDC)" but not NSFDC. Also: "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" are not eligible | — | — | — | — | — | **So the PMEGP bank loan cannot be the NSFDC loan, and a unit already set up with an NSFDC (Government of India) loan is likely shut out of a PMEGP first loan** (our reading) ⚠ | [S15] pp.3–5 |
| PMEGP bank terms and limits | — | — | "95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years" (the bank's rate, not NSFDC's 6.5%/8% [S1]). Manufacturing working capital "not be more than 40%" of project cost. Capital per worker "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas". Cap "Rs. 50.00 lakh" | — | — | — | — | [S15] pp.2, 5–6 |
| PMEGP check on the §2b unit | — | — | Working capital = ESTIMATE 88.8% of project cost, **far above the 40% manufacturing limit** [S15]. So the unit **fails PMEGP as designed** | — | — | — | — | [S5]; [S15] p.6 |
| **MUDRA** | Tiers NOT FOUND this session (mudra.org.in did not open ⚠) | — | — | — | — | — | NOT FOUND | ⚠ |

**When D20 does NOT fit:**
- PM Vishwakarma: not for a unit with hired workers ("self-employment basis", our reading of [S14] p.3). It may also be blocked for 5 years by an earlier government business loan [S14] p.3 ⚠.
- PMEGP: the §2b profile unit fails the 40% working-capital limit [S15] p.6.
- Any scheme: a unit doing pickling or plating is **Red** [S7] p.27. Expect the State board's consent process before any lender disburses (our reading ⚠).

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Heat and eye strain (framework key risk) | NOT FOUND | — | Show a safety checklist: eye shield, gloves, ventilation (our design choice) | — |
| Wrong pollution category (Red for pickling, Orange for hot forging) | High (our judgement) | Plans to pickle, plate or hot-forge | See the §6 app rule | [S7] pp.27–28 |
| Steel price swings | High (our judgement) | Steel rate rises at the dealer | IF the steel price rises more than 10% THEN re-quote orders (our design choice) | Price series NOT FOUND |
| Working capital far larger than machines (§2b) | High (our judgement) | Working capital is more than half the project | IF working capital is more than 40% of project cost THEN warn that PMEGP won't fund it and stress-test the EMI | [S5]; [S15] p.6 |
| Single-buyer dependence (one builder or contractor gives most gate orders) | Medium (our judgement) | One buyer is more than half of orders | IF one buyer is more than 50% of sales THEN warn and stress-test the EMI without them | Threshold is our design choice |
| Single-supplier dependence (steel from one dealer) | NOT FOUND | One dealer only | IF one supplier only THEN ask for a second | Our design choice |
| Seasonal lull | NOT FOUND | — | Needs §5 | — |

**SWOT (both sizes).**

| | Micro Finance (≤ ₹1.40 lakh) [S1] | Term Loan (UP profile unit, ₹43.84 lakh) [S1][S5] |
|---|---|---|
| Strengths | Low capital: sourced items ₹55,000 (§2a) [S5]; White if cold work or fabrication only [S7]; traditional artisans include blacksmiths [S14] | Multiple product lines; "10.72%" profit on sales at full capacity [S5] |
| Weaknesses | Hot forging makes it Orange [S7]; coal-hearth category NOT FOUND | Profile has internal inconsistencies (§2); 88.8% working capital; Red if pickling [S7] |
| Opportunities | PM Vishwakarma toolkit and 5% loan (if the trade is listed ⚠) [S14]; re-sharpening before sowing | Gates and grills for new houses [S5] |
| Threats | Factory-made tools (NOT FOUND); steel prices | Steel prices; consent process for Red/Orange |

**Competitor density in a block.** No official block-level count of smithies was found. Options, in order:
1. PM Vishwakarma registrations by district and trade, from the MSME dashboard (linked in [S14]): ⚠ not opened.
2. ASUSE unit-level data for NIC 25932 / 259302: NOT FOUND in the fact sheet.
3. Field count (our survey).

---

## Source log

| Tag | Title | Issuer | URL (deep link) | Exact words used | Date opened | Saved copy |
|---|---|---|---|---|---|---|
| S1 | FAQ – National Scheduled Castes Finance and Development Corporation | MoSJE (dev-site copy) | https://devmosje.negd.in/?p=15629 | "units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a."; "more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a."; "In all schemes, NSFDC provides up to 90% of the project cost."; "Implemented via SCAs/CAs."; "at an interest rate of 15% p.a."; "Small Industries Sector (e.g., manufacturing units, handicrafts, boutiques)"; "(applicable to both rural and urban areas, effective January 7, 2026)"; "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh"; "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a."; "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)"; "rates vary slightly by scheme and channelizing agency"; "Online Mode (PM-SURAJ Portal)"; "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community"; "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries."; "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."; "a valid caste certificate, income proof, KYC documents"; "Annual family income from all sources must not exceed ₹5.00 Lakhs" | 09 Nov 2026 | _shared/NSFDC_devmosje_p15629.html |
| S2 | National Industrial Classification 2008, pp.70–71 | MoSPI | https://mospi.gov.in/sites/default/files/main_menu/national_industrial_classification/nic_2008_17apr09.pdf | "25932 Manufacture of hand tools (non-power-driven) for agricultural/horticulture/ forestry"; "25933 Manufacture of hand tools such as pliers, screwdrivers, press tools, blacksmiths’ tools, drills, punches, milling cutters etc."; "25910 Forging, pressing, stamping and roll-forming of metal; powder metallurgy"; "25111 Manufacture of doors, windows and their frames, shutters and rolling shutters, gates and similer articles used on buildings" | 09 Nov 2026 | _shared/NIC_2008.pdf |
| S3 | National Industrial Classification 2025, pp.102, 104–105 | MoSPI | https://mospi.gov.in/uploads/publications_reports/publications_reports1763457214315_c3e5d4f3-8e25-4775-85e3-ad42d571652f_NIC_2025_Final.pdf | "259302 Manufacture of hand tools (non-power-driven) for agricultural/ horticulture/ forestry"; "259101 Forging, pressing, stamping and roll-forming of metal"; "251101 Manufacture of metal doors, windows and their frames, shutters and rolling shutters, gates and similar articles used in buildings"; "259303 Manufacture of hand tools such as pliers, screwdrivers"; "hammers, drills, punches, milling cutters and similar items" | 09 Nov 2026 | _shared/NIC_2025.pdf |
| S4 | Fact sheet ASUSE 2025, p.6 | MoSPI | https://www.mospi.gov.in/uploads/latestreleasesfiles/1777360756062-publications_reports1774347275480_658da785-11e1-4df3-9f02-27e08a8675f6_Factsheet_ASUSE_2025-f.pdf | "3,97,477"; "4,24,139" | 09 Nov 2026 | _shared/ASUSE_2025_Factsheet.pdf |
| S5 | Project Report of Fabrication of Grills, Gates and Fence, pp.2–8 (undated) | UP MSME 1-Connect portal, Government of Uttar Pradesh | https://msme1connect.up.gov.in/Projectreport/Project%20Report638665747150126666.pdf | "We can modify the project capacity and project cost as per your requirement."; "Demand for fence, grill and railing is mostly from new or redevelopment/ remodeling of housing and commercial buildings"; "start from 8 employees"; "Skilled Workers 4 7,000.00 28,000.00"; "Semi‐skilled Workers 4 5,000.00 20,000.00"; "Supervisor 1 15,000.00"; "Total Monthly Salary 70,000.00"; "Plant and Machinery 3.51 0.88 2.63"; "Furniture & Fixture 0.80 0.20 0.60"; "Contingencies 0.30 0.08 0.23"; "Margin for Working Capital 38.93 9.73 29.20"; "Total 43.84 11.19 32.66"; "Own Contribution 11.19"; "Term Loan 3.46"; "Working capital 29.20"; "TOTAL WORKING CAPITAL 3 MONTHS"; "Salary and Wages 8,40,000.00"; "Raw Material 2,17,75,000.00"; "Utilities 2,07,770.00"; "Total 233.58"; "Working Capital for 2 months"; "38.93"; "Pickling and Surface treatment Nos 1 75000 75000"; "Sand Blasting Facility Nos 1 25000 25000"; "Spray Painting Facility Nos 1 15000 15000"; "Hand Drills and tools Nos 1 20000 20000"; "Welding Machine Nos 2 25000 50000"; "Hand Tools and gauges LS 1 10000 10000"; "Total : 351000"; "Furniture and Fixture/ Office Equipment, electricity installation 0.50"; "TOTAL COST OF PRODUCTION"; "238.08"; "202.50 65,000.00 1,31,62,500.00"; "64.80 1,50,000.00 97,20,000.00"; "2.70 12,00,000.00 32,40,000.00"; "Add cost of Scrap 30 18,000.00 5,40,000.00"; "266.63"; "Cost of Production ‐ Turnover"; "28.57"; "10.72%"; "Total Recurring Expenditure"; "Excluding 10% wastage"; "based on 25% loan on fixed assets"; "Brass, Bronze, SS steel with plating/ metal coating"; "Cast products and stainless steel" | 09 Nov 2026 | D20/UP_MSME_Grills_Gates.pdf |
| S7 | List of Sectors Classified by Central Pollution Control Board (As on 24th August 2026), pp.2, 12, 15–16, 21, 27–28, 34, 53 | CPCB | https://cpcb.gov.in/uploads/Sectors_Classified_by_CPCB.pdf | "102.1 Forging of ferrous and non- ferrous metals using liquid fuel"; "76.0 Orange"; "68.0 Orange"; "60.0 Orange"; "102.4 Forging of ferrous and non- ferrous metals (cold forging, without any heat treatment)"; "40.0 Green"; "209.0 Metal fabrication works and hand tool manufacturing through machines (without heat/surface treatment or spray painting)"; "51.0 Engineering and fabrication units (dry process without any heat treatment / metal surface finishing operations / painting)"; "101.1 Industry or process involving metal surface treatment or process such as pickling/ electroplating/paint stripping/ heat treatment using cyanide bath/ phosphating or finishing and anodizing / enamellings/ galvanizing"; "88.8 Red"; "125.0 Spray painting, paint baking, paint shipping"; "47.5 Green"; "105.3 Wire drawing and wire netting (without pickling and without heat treatment)"; "3.0 Almirah, Grill Manufacturing (Dry Mechanical Process )"; "30.0 Green"; "101.3 Heat treatment - furnace ( without cyaniding)"; "50.0 Green"; "101.4 Heat treatment with any of the new technology like ultrasound probe, induction hardening, ionization beam, gas carburizing etc."; "38.8 Green"; "104.1 Foundry operations using Cupola furnace"; "77.5 Orange"; "104.2 Foundry operations using Induction furnace/arc furnace"; "59.5 Orange"; "63.2 Steel furniture without spray painting"; "63.1 Steel furniture with spray painting"; "25.0 Green"; "70.0 Gold and silver smithy" | 09 Nov 2026 | _shared/CPCB_Sectors_Classified.pdf |
| S8 | Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 3–4, 7 | Maharashtra Pollution Control Board | https://mpcb.gov.in/sites/default/files/standing_orders/Circular_White_Category_MPCB_16062025.pdf | "new or left-over White category industries"; "Engineering workshop, machine shop, fabrication shop, smithy shop, turning shop, cutting shop"; "Hand Tools without casting"; "Various types of Hand Tools manufacturing"; "Assembling of Almirah, Grill Manufacturing (Without Painting)"; "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board"; "Fabricating units for tractor trailer, agricultural equipment etc. (without electroplating, spray painting & powder coating)"; "Fabricatingunits for iron doors and shutters (without electroplating, spray painting & powder coating)" | 09 Nov 2026 | _shared/MPCB_White_Circular_16062025.pdf |
| S9 | MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 598(E) 08.07.2026, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_airact.pdf | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; "78. Metal fabrication works and hand tool manufacturing through machines (without heat or surface treatment or spray painting)"; "17. Engineering and fabrication units dry process without any heat treatment or metal surface finishing"; "G.S.R. 512(E)"; "New Delhi, the 28th July, 2025"; "G.S.R. 761(E)"; "19. Steel furniture without spray painting"; "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)"; "73. Manufacturing of domestic hardware and utensils (without heat or surface treatment or effluent generation)"; "New Delhi, the 8th July, 2026"; "G.S.R. 598(E)"; "29th July, 2025"; "G.S.R. 761(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_airact.pdf |
| S10 | MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendments incl. G.S.R. 599(E) 08.07.2026, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_wateract.pdf | "all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed"; "all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed"; "G.S.R. 599(E)"; "G.S.R. 762(E)"; "G.S.R. 511(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_wateract.pdf |
| S11 | CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 | CBIC | https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "the expression ―special category States‖ shall mean the States as specified"; "Arunachal Pradesh, Assam, Himachal Pradesh"; "persons making any inter-State taxable supply" | 09 Nov 2026 | _shared/CGST_Act_updated_31082021.pdf |
| S12 | Notification No. 10/2019-Central Tax | Ministry of Finance | https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees"; "Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Telangana, Tripura, Uttarakhand" | 09 Nov 2026 | _shared/GST_Notfn_10_2019_CT.pdf |
| S13 | Fact Sheet on HCES 2023-24, pp.4, 12 | MoSPI | https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf | "Statement 7: Average MPCE for each State/UT in 2023-24"; "‘MPCE estimates with imputation’ are presented in Section II" | 09 Nov 2026 | _shared/HCES_FactSheet_2023-24.pdf |
| S14 | PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), pp.2–5 | PIB | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc2025916638501.pdf | "They are generally engaged in occupations like carpenter, Blacksmith, Potter,"; "working with bare hands and tools"; "Engaged in one of the mentioned 18 family-based traditional trades"; "Involved in the unorganized sector or self-employment basis"; "Minimum age should be 18 years on the date of registration"; "restricted to one member of the family only"; "not be employed in government service"; "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years"; "₹15,000 in the form of an e-"; "stipend of ₹500 per day"; "₹1 Lakhs"; "₹2 Lakhs"; "Basic training completed"; "Availed 1st tranche of loan"; "Maintained standard loan account"; "Adopted digital transactions in business, or"; "undergone advanced training"; "Concessional rate of interest fixed at 5%"; "Re.1 per digital transaction"; "onboarding them on e-commerce platforms such as GeM" | 09 Nov 2026 | _shared/PM_Vishwakarma_PIB_Sep2025.pdf |
| S15 | Salient Features of Revised PMEGP, pp.2–6 (undated; web folder 2022-11) | Delhi Khadi & Village Industries Board | https://dkvib.delhi.gov.in/sites/default/files/2022-11/salient-features-of-revised-ppmegp.pdf | Special category "05%" own, "25%" urban, "35%" rural; "manufacturing sector is Rs. 50.00 lakh"; "There will be no income ceiling"; "the units that have already availed Government Subsidy under any other scheme of Government of India or State Government are not eligible"; "Projects without Capital Expenditure are not eligible for Financing under the scheme."; "The ‘Family’ includes self and spouse."; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks."; "95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years"; "not be more than 40%"; "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas"; "All Public Sector Banks."; "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI."; "Small Industries Development Bank of India (SIDBI)."; "National Scheduled Tribes Finance and Development Corporation (NSTFDC)"; "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" | 09 Nov 2026 | _shared/PMEGP_Revised_Salient_DelhiKVIB.pdf |
| S16 | Guidelines on PMEGP (pre-revision scan), p.23, Para 29 | KVIC copy on a Government server | https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2023/03/2023031676.pdf | "Negative List of Activities"; "The following list of activities will not be permitted under PMEGP" | 09 Nov 2026 | _shared/PMEGP_Guidelines_s3waas_2023-03.pdf |

(Tag S6 is not used in this dossier.)

## Quality gates (researcher)

| Gate | Result |
|---|---|
| G1 Every number tagged | Pass, per the check script |
| G3 FSSAI | Not applicable (no food) |
| G4 GST | Pass with ⚠: ₹40 lakh only if purely selling own-made goods (our reading); else ₹20 lakh |
| G5 Pollution category | **Pass with ⚠**: White for cold work, repair welding and general fabrication [S7][S9]; **Green for gates and grills** (row 3.0), heat treatment and spray painting [S7]; Orange for hot forging and casting [S7]; Red for pickling or plating [S7]. The White limit is a pollution index **up to 25** since 28.07.2025 [S9] p.8. A **coal or charcoal hearth has no CPCB row**, and sandblasting has none either ⚠. Maharashtra lists "smithy shop" and grill making without painting as White [S8] |
| G6 Scheme open | PM Vishwakarma outlay to FY 2027-28 [S14]; trade list and new registrations ⚠. PMEGP after March 2026 NOT FOUND |
| G7 Scheme fit | Done. The §2b unit fails PMEGP's 40% working-capital limit. PM Vishwakarma–NSFDC combination ⚠ |
| G8 NSFDC tier first | Pass |
| G9 Seasonality | **Fail**: no source; needs field survey |
| G10 Working capital from cycle days | Partial: the Term Loan unit's 2 months (60 days) gives ₹38.93 lakh gross [S5]; no stage split. Micro NOT FOUND |
| G12 Biology | Not applicable |
