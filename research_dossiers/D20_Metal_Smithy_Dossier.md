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

How to read this file.
Every figure carries one tag:
[S#]: see the Source log at the end
ESTIMATE: inputs and the sum are shown
NOT FOUND
VENDOR QUOTE NEEDED
Rows marked ⚠ need Person D to open the page in a normal browser.
Lines marked "our design choice" are app rules we chose, not facts.
Nothing here comes from memory, blogs or news.

Sources that could not be opened on 09 Nov 2026 (facts they hold are NOT FOUND here, not guessed):
* pmvishwakarma.gov.in: full guideline and the list of 18 trades
* mudra.org.in
* kviconline.gov.in
* State minimum-wage and DISCOM tariff sites
* Any official steel price series

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

**Demand drivers:**
* **Gates and grills:** The UP Government profile says: "Demand for fence, grill and railing is mostly from new or redevelopment/ remodeling of housing and commercial buildings" [S5] p.4.
* **Farm tools:** No official demand figure found: NOT FOUND.

**Demand within 5–10 km (formula for the app):** `ESTIMATE: farm households [Census, NOT IN HAND] × tools bought or re-sharpened per household per year [NOT FOUND] × price [NOT FOUND]`. Inputs are NOT FOUND.

**Rural vs semi-urban:** No official comparison: NOT FOUND. Gate and grill demand follows building work [S5] p.4, so it is likely stronger in semi-urban areas (our reading).

**Sales channels:** Field-survey questions:
1. Walk-in farmers (tools, re-sharpening)
2. Haat sales
3. House-builders (gates, grills)
4. PM Vishwakarma marketing support, which includes "onboarding them on e-commerce platforms such as GeM" [S14] p.5

**Underserved niches and how to spot them in a block:**
| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Re-sharpening and repair of farm tools before sowing and harvest | Farm hand tools have their own NIC code [S2] p.71 | Ask farmers where they get sickles and ploughshares sharpened, and how long they wait | Demand NOT FOUND |
| Gates and grills for new houses | Demand follows building work [S5] p.4 | Count houses under construction in the block | [S5] for the driver; size NOT FOUND |
| Implement repair welding | See the D15 dossier | — | — |

---

## 2. CapEx

Price source. The UP Government MSME portal profile "Fabrication of Grills, Gates and Fence" [S5] gives a machine list with quantity, rate and total.
* Date: Undated [S5]
* Scale: Large unit: "Total Recurring Expenditure 233.58" lakh a year [S5] p.7
* Caveat: "We can modify the project capacity and project cost as per your requirement." [S5] p.2

**Checks on the profile's arithmetic (SOP D4):**
* Machine list: $40,000 + 36,000 + 20,000 + 40,000 + 20,000 + 75,000 + 25,000 + 15,000 + 10,000 + 50,000 + 10,000 + 10,000 = 3,51,000$. Matches "Total : 351000" [S5] p.7.
* Project cost: $3.51 + 0.80 + 0.30 + 0.30 + 38.93 = 43.84$. Matches "43.84" [S5] p.5.
* Own share: $0.88 + 0.20 + 0.08 + 0.30 + 9.73 = 11.19$. Matches [S5] p.5.
* Loan: $2.63 + 0.60 + 0.23 + 29.20 = 32.66$. Matches [S5] p.5.
* Salaries: $4 \times 7,000 + 4 \times 5,000 + 15,000 + 7,000 = 70,000$/month; $\times 12 = 8,40,000$. Matches [S5] p.5.
* Turnover: $202.50 \times 65,000 + 64.80 \times 1,50,000 + 2.70 \times 12,00,000 = 2,61,22,500$. Matches [S5] p.8.
* Working-capital heading: Says "TOTAL WORKING CAPITAL 3 MONTHS", but the 233.58 lakh total uses the annual salary of 8.40 lakh. Inconsistent. The 38.93 is $233.58 \div 6 = 2\text{ months}$, as next line says ("Working Capital for 2 months") [S5] p.6.
* Furniture: Shown as "0.80" in cost table (p.5), but "Furniture and Fixture/ Office Equipment, electricity installation 0.50" on p.7 [S5].
* Staff count: "start from 8 employees" (p.5), but salary table lists $4 + 4 + 1 + 1 = 10\text{ people}$ [S5] p.5.
* Profit: Printed "28.57"; ESTIMATE $266.63 - 238.08 = 28.55$. Rounding only. Label "Cost of Production - Turnover" is inverted [S5] p.8.
* Wastage: Turnover labelled "Excluding 10% wastage", but nothing deducted: ESTIMATE $2,61,22,500 + 5,40,000 = 2,66,62,500$ [S5] p.8.
* Own share: Funds "based on 25% loan on fixed assets": own 11.19 of 43.84 = ESTIMATE 25.5%. NSFDC needs only $\ge 10\%$ [S1].

Connected load and phase: NOT FOUND. Whether 3-phase is needed depends on welding sets and presses (vendor quote) and State DISCOM code ⚠.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1]): village lohar
| # | Item | Qty | Line total (₹) | Tag |
|---|---|---|---|---|
| 1 | Welding Machine | 1 | 25,000 (profile's rate for one) | [S5] p.7 |
| 2 | Hand Drills and tools | 1 | 20,000 | [S5] p.6 |
| 3 | Hand Tools and gauges | 1 lot | 10,000 | [S5] p.7 |
| | **Sourced subtotal** | | **ESTIMATE 55,000** | [S5] |
| 4 | Hearth (bhatti), blower, anvil, hammers, tongs | 1 set | VENDOR QUOTE NEEDED | — |
| 5 | Bench grinder | 1 | VENDOR QUOTE NEEDED | — |
| 6 | Pre-operative: Udyam, local licence, power connection | — | NOT FOUND (see §6) | — |
| 7 | Working capital (steel, coal or charcoal, electrodes) | — | See §3 | — |

* Room under ceiling: ₹1.40 lakh [S1] - 55,000 = ESTIMATE ₹85,000 left for rows 4–7.
* Loan on sourced items: At most 90% [S1] × 55,000 = ESTIMATE ₹49,500. Own share at least ₹5,500.
* Loan at ceiling: Project ₹1,40,000 [S1] → at most ₹1,26,000 → capped at ₹1,25,000 [S1]. Own share at least ₹15,000 [S1].
* PM Vishwakarma toolkit e-voucher of "₹15,000" [S14] p.4 could cover part of row 4 for an eligible user (see §7).

### 2b. Term Loan size (the UP profile's unit)
| # | Item | ₹ lakh | Tag |
|---|---|---|---|
| 1 | Plant and Machinery (12 lines, incl. Pickling & Surface treatment 75k, Sand Blasting 25k, Spray Painting 15k, Welding Machine Nos 2 50k) | 3.51 | [S5] pp.5–7 |
| 2 | Furniture & Fixture | 0.80 | [S5] p.5 |
| 3 | Contingencies | 0.30 | [S5] p.5 |
| 4 | Pre and Post operative | 0.30 | [S5] p.5 |
| 5 | Margin for Working Capital | 38.93 | [S5] p.5 |
| | **Total project cost** | **43.84** | [S5] p.5 |

* NSFDC Term Loan: At most 90% [S1] × 43.84 = ESTIMATE ₹39.456 lakh, below the ₹45 lakh cap [S1]. Own share at least ESTIMATE ₹4.384 lakh [S1].
* Profile's own funding: Own 11.19L, Term Loan 3.46L, WC 29.20L from bank [S5] p.6.
* Working capital dominates: ESTIMATE $38.93 \div 43.84 = 88.8\%$ of project is working capital. Fails PMEGP's limit (§7).
* Pollution: Machine list includes pickling, sandblasting and spray painting [S5] p.6. Pickling and plating are **Red** [S7] p.27. Casting in-house is **Orange** [S7] p.28. Unit is Red, not White (§6).

---

## 3. OpEx & working capital

Yearly recurring cost, Term Loan size (UP profile [S5] p.6):
* Salary and Wages: ₹8,40,000 [S5] p.6
* Raw Material: ₹2,17,75,000 [S5] p.6
* Utilities: ₹2,07,770 [S5] p.6
* Selling and admin: ₹5,35,250 [S5] p.6
* Total: ₹233.58 lakh/year (ESTIMATE 19.465 lakh/month) [S5] p.6
* Raw material per tonne sold: ESTIMATE $2,17,75,000 \div 270\text{ t} \approx ₹80,648/\text{tonne}$ of output [S5] pp.6, 8.

Micro Finance size: All costs (rent, coal/charcoal, steel, electricity) NOT FOUND.

**Working-capital cycle (days):**
* Profile's working capital: "Working Capital for 2 months" = 38.93 lakh (60 days recurring cost) [S5] p.6.
* Formula (G11): `Working capital = (60 / 30) * 19.465L = 38.93 Lakh`.
* Micro size: NOT FOUND (field survey).

---

## 4. Unit economics & pricing

* Selling rate mild-steel railings and fencing: "65,000.00" per tonne [S5] p.8
* Selling rate cast products and stainless steel: "1,50,000.00" per tonne [S5] p.8
* Scrap: "Add cost of Scrap 30 18,000.00 5,40,000.00" [S5] p.8
* Turnover at 100% capacity: "266.63" lakh; Profit on sales: "10.72%" [S5] p.8
* Price per farm tool (sickle, khurpi, ploughshare): NOT FOUND.
* Steel price / Break-even: NOT FOUND.

**Regional purchasing power (HCES 2023-24 rural MPCE) [S13] p.12:**
* UP: ₹3,481 (0.84)
* Bihar: ₹3,670 (0.89)
* MP: ₹3,441 (0.83)
* Rajasthan: ₹4,510 (1.09)
* Maharashtra: ₹4,145 (1.01)
* All-India: ₹4,122 (1.00)

Pricing strategy: Quote steel at day's rate plus labour charge. Lead with farm tools before decorative grills in lower-income areas.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

No official monthly series was found. Farm-tool demand follows sowing and harvest. G9 fails until field survey.

---

## 6. Compliance

All rows opened 09 Nov 2026 unless marked ⚠.
Pollution: category depends on process.

| Process | Category | Exact quote | Tag |
|---|---|---|---|
| Hot forging, liquid fuel | Orange (PI 76.0) | "102.1 Forging of ferrous and non- ferrous metals using liquid fuel" … "76.0 Orange" | [S7] p.28 |
| Hot forging, gaseous fuel | Orange (PI 68.0) | "102.2 … using gaseous fuel" … "68.0 Orange" | [S7] p.28 |
| Hot forging, electricity | Orange (PI 60.0) | "102.3 … using electricity" … "60.0 Orange" | [S7] p.28 |
| Cold forging, no heat treatment | Green (PI 40.0) | "102.4 Forging of ferrous and non- ferrous metals (cold forging, without any heat treatment)" … "40.0 Green" | [S7] p.28 |
| Hot forging on coal/charcoal hearth (village bhatti) | NOT FOUND ⚠: no row names solid fuel | — | [S7] |
| Metal fabrication or hand-tool making by machine, no heat/surface treatment, no spray painting | White (PI 0.0) | "209.0 Metal fabrication works and hand tool manufacturing through machines (without heat/surface treatment or spray painting)" | [S7] p.53 |
| Engineering and fabrication, dry process | White (PI 0.0) | "51.0 Engineering and fabrication units (dry process without any heat treatment / metal surface finishing operations / painting)" | [S7] p.12 |
| Pickling or metal surface treatment | Red (PI 88.8) | "101.1 Industry or process involving metal surface treatment or process such as pickling/ electroplating/paint stripping..." … "88.8 Red" | [S7] p.27 |
| Almirah and grill making, dry mechanical process | Green (PI 30.0) | "3.0 Almirah, Grill Manufacturing (Dry Mechanical Process )" … "30.0 Green" | [S7] p.2 |
| Heat treatment in furnace (no cyaniding) | Green (PI 50.0) | "101.3 Heat treatment - furnace ( without cyaniding)" … "50.0 Green" | [S7] p.27 |
| Heat treatment by newer methods (induction) | Green (PI 38.8) | "101.4 Heat treatment with any of the new technology like ultrasound probe, induction hardening..." … "38.8 Green" | [S7] p.27 |
| Foundry (casting), cupola furnace | Orange (PI 77.5) | "104.1 Foundry operations using Cupola furnace" … "77.5 Orange" | [S7] p.28 |
| Foundry (casting), induction/arc furnace | Orange (PI 59.5) | "104.2 Foundry operations using Induction furnace/arc furnace" … "59.5 Orange" | [S7] p.28 |
| Steel furniture without spray painting / with | White (0.0) / Green (25.0) | "63.2 Steel furniture without spray painting" … "0.0 White"; "63.1 ... with spray painting" … "25.0 Green" | [S7] pp.15–16 |
| Spray painting | Green (PI 47.5) | "125.0 Spray painting, paint baking, paint shipping" … "47.5 Green" | [S7] p.34 |
| Wire drawing, no pickling, no heat treatment | White (PI 0.0) | "105.3 Wire drawing and wire netting (without pickling and without heat treatment)" … "0.0 White" | [S7] p.28 |

App rule (our design choice):
IF pickling, plating or galvanising THEN show Red (drop or outsource).
ELSE IF hot forging or in-house casting THEN show Orange.
ELSE IF gates, grills, almirahs, heat-treats tools, or spray-paints THEN show Green (Exception: in Maharashtra, grill making without painting is White [S8]).
ELSE show White (cold work, repair welding and general fabrication only).

| Rule | Law & section | Trigger | Threshold | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — |
| White: no consent, written intimation | Air Act s.21 proviso: G.S.R. 702(E) / 512(E) / 761(E); Water Act s.25 proviso | Listed White sector | Pollution index up to 25 | SPCB | 2026 Schedule: "78. Metal fabrication works and hand tool manufacturing through machines (without heat or surface treatment or spray painting)"; "17. Engineering and fabrication units dry process..."; "19. Steel furniture without spray painting"; "56. Assembling units and mechanical workshops..."; "73. Domestic hardware and utensils..." | [S9] pp.8, 26–28; [S10] p.8 | Orange or Red units need SPCB consent (fee NOT FOUND ⚠) |
| Maharashtra Pollution | MPCB circular, 16.06.2025 | On State list | White: item 53 (Engineering workshop, smithy shop), item 76 (Hand tools without casting), item 213 (Hand tools mfg), item 6 (Almirah/Grill mfg without painting), item 55 (tractor trailer/ag equip fabrication), item 60 (iron doors/shutters fabrication) | MPCB | Self-certification on portal | [S8] pp.1, 3–4, 7 | Maharashtra lists "smithy shop" as White by name. Central intimation exemption covers only sectors in central Schedule [S9] p.8 |
| GST registration | CGST Act s.22(1) | Aggregate turnover | ₹20 lakh; ₹10 lakh in special category | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees" | [S11] p.49 | Special category States list ⚠ |
| GST ₹40L goods limit | Notification 10/2019-CT | Exclusive supply of goods | ₹40 lakh | CBIC | Only if exclusively selling manufactured goods; repair/sharpening triggers ₹20 lakh | [S12] | — |
| GST inter-State | CGST Act s.24(i) | Inter-State taxable supply | Compulsory registration | CBIC | "persons making any inter-State taxable supply" | [S11] p.51 | Selling tools across State border forces registration |
| Gas cylinders | NOT FOUND ⚠ | Storing cylinders | NOT FOUND | PESO ⚠ | — | ⚠ | Gas cutting / forging |

---

## 7. Scheme fit

### 7.1 NSFDC first
| Item | Micro Finance Scheme (MFS) | Term Loan |
|---|---|---|
| Project cost | "units costing up to ₹1.40 lakh" [S1] | "more than ₹1.40 lakh and up to ₹50.00 lakh" [S1] |
| Loan | "The maximum loan limit is ₹1.25 lakh" [S1] | "up to ₹45.00 lakh" [S1] |
| Share of cost | Up to 90% [S1]. Own share at least 10%, more when cap binds | same [S1] |
| Interest | "6.5% p.a." [S1] | "8% p.a." [S1] |
| Channel | "Implemented via SCAs/CAs." [S1] | "Implemented via SCAs/CAs." [S1] |
| Repayment | quarterly installments within 3 years (3-month moratorium) [S1] | within 7 years (6-month moratorium) [S1] |
| Who | SC with valid caste certificate; family income $\le$ ₹5.00 Lakhs (effective Jan 7, 2026) [S1] | same [S1] |
| Fits D20? | Yes. Small Industries Sector (sourced items ₹55,000 fit under ₹1.40L) [S1][S5] | ⚠ Unclear. ₹43.84L is under ₹50L, but 88.8% is working capital. Loan ₹39.456L leaves ₹5.544L room [S1] |

* Women: 40% funds specifically allocated for women beneficiaries [S1].
* Watch channel: AMY is 15% p.a. through NBFC-MFIs; UNY is 13–15% through Coops/SFBs [S1].
* App rules: Quote 6.5% only for MFS and 8% only for Term Loan via SCAs/CAs.
* Free skill training: PM-DAKSH free NSQF training for SCs (age 18–45) with ₹1,500/month DBT stipend [S1].

### 7.2 Other schemes
| Scheme | Who qualifies | Benefit | Own share | Tag |
|---|---|---|---|---|
| PM Vishwakarma | Traditional artisans working with bare hands and tools; family-based traditional trade; unorganized/self-employment basis | Toolkit ₹15,000 e-voucher; training ₹500/day stipend; loan ₹1L (18 mos) then ₹2L (30 mos) @ 5% interest; Re.1/digital txn | — | [S14] pp.2–5 |
| PMEGP | Any individual >18; no income ceiling; new projects only | Special category: 25% urban, 35% rural subsidy | 5% | [S15] pp.2–3; [S16] p.23 |
| PMEGP bank terms & limits | 95% bank loan; bank normal interest rate; manufacturing cap ₹50.00L; working capital max 40%; capital per worker $\le$ ₹3L | Bank rate | — | [S15] pp.2, 5–6 |
| PMEGP check on §2b unit | Working capital = 88.8% of project cost, far above 40% limit. Fails PMEGP as designed | — | — | [S5]; [S15] p.6 |
| MUDRA | Tiers NOT FOUND this session ⚠ | — | — | ⚠ |

**When D20 does NOT fit:**
* PM Vishwakarma: not for a unit with hired workers [S14] p.3. May be blocked 5 years by earlier government business loan [S14] p.3 ⚠.
* PMEGP: the §2b profile unit fails the 40% working-capital limit [S15] p.6.
* Any scheme: pickling or plating makes unit Red [S7] p.27.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Heat and eye strain | NOT FOUND | — | Show safety checklist: eye shield, gloves, ventilation | — |
| Wrong pollution category (Red for pickling, Orange for hot forging) | High | Plans to pickle, plate or hot-forge | See §6 app rule | [S7] pp.27–28 |
| Steel price swings | High | Steel rate rises at dealer | IF steel price rises > 10% THEN re-quote orders | Price series NOT FOUND |
| Working capital far larger than machines (§2b) | High | WC > half of project | IF WC > 40% THEN warn PMEGP won't fund and stress-test EMI | [S5]; [S15] p.6 |
| Single-buyer dependence (one builder/contractor) | Medium | One buyer > half of orders | IF one buyer > 50% THEN warn and stress-test EMI | Threshold is our design choice |
| Single-supplier dependence | NOT FOUND | One dealer only | Ask for second supplier | Our design choice |
| Seasonal lull | NOT FOUND | — | Needs §5 | — |

**SWOT (both sizes):**
* **Strengths:** Low capital: sourced items ₹55,000 (§2a) [S5]; White if cold work/fabrication only [S7]; traditional artisans include blacksmiths [S14]. Term Loan has multiple product lines and 10.72% profit [S5].
* **Weaknesses:** Hot forging is Orange [S7]; coal-hearth category NOT FOUND. Term Loan profile has internal inconsistencies, 88.8% WC, and is Red if pickling [S7].
* **Opportunities:** PM Vishwakarma toolkit and 5% loan [S14]; re-sharpening before sowing. Gates and grills for new houses [S5].
* **Threats:** Factory-made tools; steel prices; consent process for Red/Orange.

---

## Source log
* **S1:** FAQ – National Scheduled Castes Finance and Development Corporation (MoSJE, devmosje.negd.in/?p=15629, opened 09 Nov 2026).
* **S2:** National Industrial Classification 2008, pp.70–71 (MoSPI, opened 09 Nov 2026).
* **S3:** National Industrial Classification 2025, pp.102, 104–105 (MoSPI, opened 09 Nov 2026).
* **S4:** Fact sheet ASUSE 2025, p.6 (MoSPI, opened 09 Nov 2026).
* **S5:** Project Report of Fabrication of Grills, Gates and Fence, pp.2–8 (UP MSME 1-Connect, opened 09 Nov 2026).
* **S7:** List of Sectors Classified by Central Pollution Control Board (24 Aug 2026), pp.2, 12, 15–16, 21, 27–28, 34, 53 (CPCB, opened 09 Nov 2026).
* **S8:** Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 3–4, 7 (Maharashtra Pollution Control Board, opened 09 Nov 2026).
* **S9:** MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 512(E) 28.07.2025 and G.S.R. 598(E) 08.07.2026, pp.3–4, 8, 16, 24–28 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S10:** MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendments incl. G.S.R. 599(E) 08.07.2026, p.8 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S11:** CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 (CBIC, opened 09 Nov 2026).
* **S12:** Notification No. 10/2019-Central Tax (Ministry of Finance, opened 09 Nov 2026).
* **S13:** Fact Sheet on HCES 2023-24, pp.4, 12 (MoSPI, opened 09 Nov 2026).
* **S14:** PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), pp.2–5 (PIB, opened 09 Nov 2026).
* **S15:** Salient Features of Revised PMEGP, pp.2–6 (Delhi KVIB, opened 09 Nov 2026).
* **S16:** Guidelines on PMEGP (pre-revision scan), p.23, Para 29 (KVIC via s3waas, opened 09 Nov 2026).
*(Tag S6 is not used in this dossier.)*

---

## Quality gates (researcher)
* **G1 Every number tagged:** Pass, per check script.
* **G3 FSSAI:** Not applicable (no food).
* **G4 GST:** Pass with ⚠: ₹40 lakh only if purely selling own-made goods; else ₹20 lakh.
* **G5 Pollution category:** Pass with ⚠: White for cold work/fabrication [S7][S9]; Green for gates/grills, heat treatment and spray painting [S7]; Orange for hot forging and casting [S7]; Red for pickling/plating [S7]. Coal/charcoal hearth and sandblasting have no CPCB row ⚠. Maharashtra lists smithy shop and grill mfg without painting as White [S8].
* **G6 Scheme open:** PM Vishwakarma outlay to FY 2027-28 [S14]; trade list and new registrations ⚠. PMEGP after March 2026 NOT FOUND.
* **G7 Scheme fit:** Done. §2b fails PMEGP's 40% WC limit. PM Vishwakarma–NSFDC combination ⚠.
* **G8 NSFDC tier first:** Pass.
* **G9 Seasonality:** Fail: no source; needs field survey.
* **G10 Working capital from cycle days:** Partial: Term Loan 60 days gives ₹38.93 lakh gross [S5]; no stage split. Micro NOT FOUND.
* **G12 Biology:** Not applicable.
