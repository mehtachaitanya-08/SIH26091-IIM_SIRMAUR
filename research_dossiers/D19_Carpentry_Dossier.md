# D19 Carpentry — sector dossier (SIH26091)

| Field | Value |
|---|---|
| Domain code | D19 |
| Short name | Carpentry |
| Domain | Carpentry: furniture, doors, window frames |
| Basket | B6 Apparel, Tailoring & Handcrafted Goods (कपड़ा सिलाई, बुनाई एवं शिल्प) |
| Unit to study | Furniture, frames (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

**How to read this file.** Every figure carries a tag:
- `[S#]`: see the Source log at the end
- `ESTIMATE`: inputs and sum shown
- `NOT FOUND`
- `VENDOR QUOTE NEEDED`

Rows marked `⚠` need Person D to open the page in a normal browser. Lines marked "our design choice" are app rules we chose, not facts. Nothing here comes from memory, blogs or news.

**Sources that could not be opened on 09 Nov 2026** (facts they hold are NOT FOUND here, not guessed):

| Site | What it would have given |
|---|---|
| pmvishwakarma.gov.in | Full PM Vishwakarma guideline. The D18 dossier quotes v30 from Person C's main copy |
| mudra.org.in | MUDRA |
| kviconline.gov.in | PMEGP model profiles |
| State forest department sites | Timber transit and saw-machine licences |

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2008 code, furniture | 31001 "Manufacture of furniture made of wood" | [S2] p.88 |
| NIC 2008 code, doors and frames | 16221 "Manufacture of structural wooden goods [intended to be used primarily in the construction industry such as beams, rafters, roof struts, … doors, windows, shutters and their frames…]" | [S2] p.58 |
| NIC 2008 code, repair only | 95240 "Repair of furniture and home furnishings" | [S2] p.136 |
| NIC 2025 code, furniture | 310101 "Manufacture of furniture made of wood including of engineered wood, plyboard" | [S3] p.132 |
| NIC 2025 code, doors and frames | 162202 "Manufacture of wooden doors, windows, shutters, stairs, railings and their frames" | [S3] p.85 |
| NIC 2025 code, repair only | 952400 "Repair of furniture and home furnishings" | [S3] p.250 |
| App rule (our design choice) | Use the code for the user's main income: furniture → 31001 / 310101; doors and frames → 16221 / 162202; mostly repairs → 95240 / 952400 | — |
| Sector | Manufacturing (NIC Section C for 31001 and 16221) [S2]. Repair-only work is in Division 95 (services) [S2] p.136 | [S2] |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Rural count of carpentry units | NOT FOUND (needs ASUSE unit-level data) | — |
| PM Vishwakarma registrations | "Carpenter" is listed among the top registered trades | [S14] p.6 |

**Demand drivers.** The UP Government profile lists the products as "chairs, tables, beds, safes, sofa sets, Almirahs cabinets, etc." [S5] p.5. The same page also gives market-size and import figures (e.g. "USD32 billion by 2019"). Those carry no source and are out of date, so **they are not used here**.

**Demand within 5–10 km (formula for the app).**

`ESTIMATE: households in the catchment [Census, NOT IN HAND] × furniture/door purchases per household per year [NOT FOUND] × average order value [NOT FOUND] = yearly market.`

Inputs NOT FOUND.

**Rural vs semi-urban.** No official comparison was found: NOT FOUND.

**Sales channels.** The first three are field-survey questions, not data; the last two are official:
- walk-in orders for beds, doors and frames
- house-construction contractors
- repairs
- PM Vishwakarma marketing support, which lists "onboarding them on e-commerce platforms such as GeM" [S14] p.5
- NSFDC fairs: NSFDC "provides market exposure by helping artisans participate in major fairs and exhibitions (e.g., India International Trade Fair, Dilli Haat, Surajkund Mela, Shilp Samagam)" [S1]

**Underserved niches and how to spot them in a block.**

| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Doors, windows and frames for new houses | Has its own NIC code, separate from furniture [S2][S3] | Ask local masons and contractors who supplies doors now | [S2] p.58 for the code; demand NOT FOUND |
| Repair and polishing | Separate service code 95240 [S2] | Count repair-only carpenters vs furniture makers | Niche size NOT FOUND |
| Wooden farm implements and tool handles | Maharashtra lists "Manufacturing of wooden agricultural implements" and "Manufacturing of wooden tool handles" as White [S8] p.6 | Ask farmers where they buy plough parts and handles | [S8] for the category; demand NOT FOUND |

---

## 2. CapEx

**Price source.** The UP Government MSME portal profile "Wooden Furniture Manufacturing unit" [S5] gives a full machine list with prices.
- The portal files it under "Wooden Doors Making unit(Small Scale)" [S6]. The report itself is titled "WOODEN FURNITURE MANUFACTURING UNIT" [S5] p.2.
- It is **undated**, and it says "We can modify the project capacity and project cost as per your requirement." [S5] p.2.
- **Each price needs a fresh quotation** before a user relies on it.

**Checks on the profile's arithmetic** (SOP D4):

| Check | Sum | Result |
|---|---|---|
| Machine list | 2,85,500 + 44,000 + 29,500 + 1,00,000 + 80,000 + 9,500 + 20,000 + 5,500 + 45,000 + 1,000 + 2,000 + 1,500 + 1,500 + 2,500 + 1,000 + 9,500 = 6,38,000 | Matches the printed "Total 6,38,000/-" [S5] p.7 |
| Cost of project | 6.38 + 1.50 + 5.78 = 13.66 | Matches [S5] p.3 |
| Means of finance | 1.37 + 5.20 + 7.09 = 13.66 | Matches [S5] p.3 |
| Year-1 cost of production | 50.40 + 1.01 + 1.57 + 15.12 + 1.11 = 69.21 | Printed as "69.20", a 0.01 rounding gap [S5] p.9 |
| Stock | "Finished Goods (10 Days requirement) 2.70" + "Raw Material (10 Days requirement) 1.68" = "Closing Stock 4.38" [S5] p.11 | Consistent. The profit statement's 2.70 is finished goods only; the balance sheet's 4.38 adds raw material |
| How to read the machine list | Its "Unit" column holds quantities, and "Price (INR)" is the line total. The line totals add up exactly to the printed "Total 6,38,000/-" [S5] p.7 | So "Carpenter Chisels 10 2,000/-" means 10 chisels for ₹2,000 in all (our reading, confirmed by the sum) |

**Connected load and phase.**
- "Power Requirement- - The estimated Power requirement is taken at 15 HP." [S5] p.7. ESTIMATE: 15 HP × 0.746 = 11.19 kW (unit conversion).
- Whether this needs a 3-phase connection: NOT FOUND. It depends on the motor ratings (vendor quote) and the State DISCOM supply code ⚠.
- A hand-tool Micro unit (§2a) has no official load figure: NOT FOUND.

**Where machines are made.** NOT FOUND (the profile names no suppliers or hubs).

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])

The machine mix is our design choice (hand and small power tools only, no band saw or seasoning plant). The prices are the profile's line totals.

| # | Item | Qty | Line total (₹) | Tag |
|---|---|---|---|---|
| 1 | Drill Machine | 1 | 44,000 | [S5] p.7 |
| 2 | Planing Tools | 1 | 29,500 | [S5] p.7 |
| 3 | Carpentary Saw | 1 | 9,500 | [S5] p.7 |
| 4 | Belt Sander | 1 | 9,500 | [S5] p.7 |
| 5 | Carpenter Chisels | 10 | 2,000 | [S5] p.7 |
| 6 | U- gouges | 10 | 1,500 | [S5] p.7 |
| 7 | V- gouges | 10 | 1,500 | [S5] p.7 |
| 8 | Round Cutter | 1 | 5,500 | [S5] p.7 |
| | **Sourced subtotal** | | **ESTIMATE 44,000 + 29,500 + 9,500 + 9,500 + 2,000 + 1,500 + 1,500 + 5,500 = 1,03,000** | [S5] |
| 9 | Workbench, clamps | — | VENDOR QUOTE NEEDED | — |
| 10 | Pre-operative: Udyam, local licence, power connection | — | NOT FOUND (see §6) | — |
| 11 | Working capital (timber, nails, adhesive, polish) | — | See §3 | — |

- Room left under the ₹1.40 lakh ceiling [S1] for rows 9–11: ESTIMATE 1,40,000 − 1,03,000 = ₹37,000.
- Loan on the sourced kit alone: ESTIMATE at most 90% [S1] × 1,03,000 = ₹92,700. Own share **at least** 1,03,000 − 92,700 = ₹10,300 [S1]. Both rise once rows 9–11 are priced.
- PM Vishwakarma's toolkit e-voucher of "₹15,000" [S14] p.4 could cover part of the hand tools for an eligible user (see §7).

**Loan at the ceiling.**
- Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ₹1,26,000 → capped at ₹1,25,000 [S1].
- Own share is **at least** 1,40,000 − 1,25,000 = ₹15,000 [S1].

### 2b. Term Loan size (the UP profile's unit)

| # | Item | ₹ lakh | Tag |
|---|---|---|---|
| 1 | Plant & Machinery (16 lines, incl. "Band Saw 1 2,85,500/-", "Wood Seasoning Plant 1 1,00,000/-", "Planer Machine 1 80,000/-", "Wood Lathe Machine 1 45,000/-") | 6.38 | [S5] pp.3, 7 |
| 2 | Furniture & Fixtures | 1.50 | [S5] p.3 |
| 3 | Working Capital | 5.78 | [S5] p.3 |
| | **Cost of project** | **13.66** | [S5] p.3 |
| 4 | Land / shed | "Own/Rented"; "around 2000sqft" | [S5] pp.3, 7 |

**Loan on this unit (NSFDC Term Loan).**
- ESTIMATE at most 90% [S1] × 13.66 = **₹12.294 lakh**, below the ₹45 lakh cap [S1].
- Own share: **at least** 13.66 − 12.294 = **₹1.366 lakh** [S1].
- The profile itself plans a bank term loan of 7.09 lakh plus "Working Capital(Finance) 5.20" lakh [S5] p.3, not NSFDC.
- Its term loan and its working-capital loan are both at 11%: "Interest on working Capital Loan and Term loan has been taken at 11%" [S5] p.14. The term loan schedule shows "11.0%", with "Moratorium Period 6 Months" and "Repayment Period 54 Months" [S5] p.12. NSFDC's Term Loan is "8% p.a." [S1], so the profile's interest lines overstate the cost for an NSFDC borrower.
- This unit employs "12 Persons" [S5] p.3. So it likely fails PM Vishwakarma's self-employment test (§7, our reading).

---

## 3. OpEx & working capital

**Monthly operating cost, Term Loan size** (UP profile, year 1 [S5] p.9):

| Cost (year 1) | ₹ lakh / year | Tag |
|---|---|---|
| Raw Material Consumed | 50.40 | [S5] p.9 |
| Electricity | 1.01 | [S5] p.9 |
| Repair & Maintenance | 1.57 | [S5] p.9 |
| Labour & Wages | 15.12 | [S5] p.9 |
| Salary to Staff | 5.67 | [S5] p.9 |
| Selling & Adm Expenses | 2.35 | [S5] p.9 |
| **Total cash OpEx** (cost of production 69.20 − depreciation 1.11 + salary 5.67 + selling 2.35) | **ESTIMATE 76.11 / year = 6.343 / month** | [S5] p.9 |

**Micro Finance size:** rent, electricity, timber and wages are all NOT FOUND. A 12-person factory profile does not scale down to a one-person shop (SOP D5).

**Working-capital cycle (days), Term Loan size.** The profile states its stock days directly: "Finished Goods (10 Days requirement)" and "Raw Material (10 Days requirement)" [S5] p.11.

| Stage | Days | Tag |
|---|---|---|
| Raw material in stock | **10** | [S5] p.11 |
| Finished goods in stock | **10** | [S5] p.11 |
| Customer credit (debtors) | **15**: "Credit period to Sundry Debtors has been given for 15 days." (cross-check from the balance sheet: ESTIMATE 3.92 ÷ 78.30 × 365 = 18.3) | [S5] pp.8–9, 14 |
| Less: supplier credit (creditors) | **15**: "Credit period by the Sundry Creditors has been provided for 15 days." (cross-check: ESTIMATE 2.52 ÷ 50.40 × 365 = 18.2) | [S5] pp.8–9, 14 |
| **Gross cycle** (before supplier credit) | **ESTIMATE 10 + 10 + 15 = 35** | — |
| **Net cycle** (after supplier credit) | **ESTIMATE 35 − 15 = 20** | — |

**Formula** (framework G11): `Working capital = (sum of cycle days ÷ 30) × monthly OpEx`

| Method | Working capital | Tag |
|---|---|---|
| Framework formula, gross | ESTIMATE (35 ÷ 30) × 6.343 = ₹7.40 lakh | — |
| Framework formula, net of supplier credit | ESTIMATE (20 ÷ 30) × 6.343 = **₹4.23 lakh** | — |
| Profile's own balance-sheet method (net of supplier credit) | "Stock in Hand 4.38", "Less: Sundry Creditors 2.52", "Paid Stock 1.86", plus "Sundry Debtors 3.92". ESTIMATE 1.86 + 3.92 = **₹5.78 lakh**, which equals the project's "Working Capital 5.78". The profile funds it as "Working Capital Requirement 5.20" plus "Margin 0.58" | [S5] pp.3, 11 |

- The gross ₹7.40 lakh **overstates** the need, because suppliers give "15 days" of credit [S5] p.14.
- **App rule (our design choice):** use the profile's ₹5.78 lakh, which is net of supplier credit and built from actual items. Show the formula figure (₹4.23 lakh net) beside it. Never show the gross figure as the amount to borrow.

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Sales, year 1 (Term Loan unit) | ₹78.30 lakh; "Estimated Annual Sales Turnover (Max Capacity) 151.44 Lakhs" (year 5) | [S5] pp.3, 9 |
| Raw material as a share of sales, year 1 | ESTIMATE 50.40 ÷ 78.30 = **64.4%** | [S5] p.9 |
| Gross margin, year 1 | "15.07%" | [S5] p.9 |
| Net profit, year 1 | "2.44" lakh, "3.1%" of sales | [S5] p.9 |
| Break-even | "Break Even Point : 29%" | [S5] p.3 |
| Price per item (bed, door, frame) | NOT FOUND (no official price series) | — |
| Timber price | NOT FOUND (no official series opened) | — |
| By-products | Sawdust and off-cuts: our assumption; value NOT FOUND | — |

**Regional purchasing power.** HCES 2023-24 rural MPCE (monthly per-person spending), Statement 7, Rural column [S13] p.12:

| State | Rural MPCE (₹) | vs all-India (ESTIMATE ÷ 4,122) |
|---|---|---|
| UP | 3,481 | 0.84 |
| Bihar | 3,670 | 0.89 |
| MP | 3,441 | 0.83 |
| Rajasthan | 4,510 | 1.09 |
| Maharashtra | 4,145 | 1.01 |
| All-India | 4,122 | 1.00 |

These are the Section I figures ("‘MPCE estimates with imputation’ are presented in Section II") [S13] p.4.

**Pricing strategy (our design choice).**
- Raw material (mostly timber; the profile lists "Wood, Adhesives,nails and finishing" [S5] p.3) is about two-thirds of sales (64.4% [S5]), so quote material at the day's rate plus a labour charge, rather than a fixed price.
- In States with a ratio below 1.0, lead with doors, frames and repairs (needed items) before decorative furniture.
- The base price is NOT FOUND.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |
| Reason | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

- No official monthly series for carpentry demand was found.
- **Lean-month stress factor: NOT FOUND.**
- **G9 fails until our field survey fills this row.** Survey question: "In which months do you get the most and the fewest orders (weddings, house building)? Roughly how many in each?"

---

## 6. Compliance

All rows were opened on 09 Nov 2026 unless marked ⚠.

| Rule | Law & section | Trigger | Threshold | Govt fee | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — | — |
| **Pollution: carpentry without spray painting** | CPCB directions, 12.02.2025 | Electric machines, no spray painting, not a saw mill | **White**, pollution index 0.0 | — | SPCB | Sector 60.2 "Carpentry & wooden furniture manufacturing without spray painting (excluding saw mill) with the help of electrical (motorized) machines such as electrical wood planner, steel saw cutting circular blade, etc." … "0.0 White" | [S7] p.15 | — |
| **Pollution: carpentry with spray painting** | CPCB list | Spray painting / polishing booth | **Green**, pollution index 25.0 | NOT FOUND | SPCB | Sector 60.1 "Carpentry & wooden furniture manufacturing with spray painting (excluding saw mill)" … "25.0 Green" | [S7] p.15 | App rule (our design choice): IF the user spray-paints THEN show Green and the consent step |
| **Pollution: saw mill** | CPCB list | Sawing logs into planks | **Green**, pollution index 30.0 | NOT FOUND | SPCB | Sector 164.0 "Saw mills" … "30.0 Green" | [S7] p.45 | The profile's "Band Saw" [S5] p.7 may make the unit a saw mill if it saws logs (our reading) ⚠ |
| **Pollution: wood seasoning in a steam chamber** | CPCB list | Steam-heated seasoning of timber | **Green**, pollution index 50.0 | NOT FOUND | SPCB | Sector 184.0 "Seasoning of wood in steam heated chamber" … "50.0 Green" | [S7] p.49 | The §2b profile unit has a "Wood Seasoning Plant 1 1,00,000/-" [S5] p.7. The profile doesn't say whether it is steam-heated: ⚠ |
| Pollution: spray painting as a separate process | CPCB list | Spray painting or paint baking | **Green**, pollution index 47.5 | NOT FOUND | SPCB | Sector 125.0 "Spray painting, paint baking, paint shipping" … "47.5 Green" | [S7] p.34 | The profile's finishing materials are "stains, basecoat, glazers,enamles" [S5] p.5, and the portal page mentions "polishing or laminating" [S6]. The finishing method is ⚠ |
| **Pollution: modular furniture from particle board / MDF** | CPCB list | Board-based furniture with synthetic resin | **With boiler: Orange** (pollution index 60.0). **Without boiler: Green** (25.0) | NOT FOUND | SPCB | Sector 59.1 "Modular wooden furniture from particle board, MDF, swan timber etc … (With boiler)" … "60.0 Orange"; Sector 59.2 (same activity, without boiler) … "25.0 Green" | [S7] p.14 | App rule (our design choice): IF the user works with MDF or particle board THEN show Green, or Orange if there is a boiler |
| Other wood rows | CPCB list | — | "185.0 Pulverization of bamboo and scrap wood" … "25.0 Green"; "216.0 Sports Goods Manufacturing Units (without seasoning of woods)" … "20.0 White" | — | SPCB | as quoted | [S7] pp.49, 53 | — |
| **§2b profile unit: overall category** | — | Has a seasoning plant and finishing | **Green until confirmed** (our reading of [S7] pp.15, 34, 49) | — | SPCB | — | ⚠ | App rule (our design choice): IF the unit has a seasoning plant OR spray / paint finishing THEN show Green; ELSE IF hand finishing only, no seasoning and no saw mill THEN show White (60.2) |
| White: no consent, written intimation | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) [S9] p.8. Water Act s.25 proviso: G.S.R. 703(E) 12.11.2024, para (a) replaced by G.S.R. 511(E) [S10] p.8. Both dated "28th July, 2025" on p.8; later notes give "29th July, 2025" ⚠. Schedules replaced by G.S.R. 761(E) [S9] p.16 / 762(E) [S10] p.16 (17.10.2025), then by G.S.R. 598(E) [S9] p.25 / 599(E) [S10] p.24 (08.07.2026) | Listed White sector | Pollution index **up to 25, and only if the sector is named in the Schedule**. A score of 25 or less alone does not exempt (e.g. Green rows scored 25.0 are not exempt) | — | SPCB | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees" (2025 text, [S9] p.8). 2026 Schedule item 18: "Carpentry and wooden furniture manufacturing without spray painting [excluding saw mill with the help of electrical (motorized) machines such as electrical wood planer, steel saw cutting circular blade, etc.]" | [S9] pp.8, 26; [S10] pp.8, 25 | — |
| Pollution: Maharashtra | MPCB circular, 16.06.2025 | On the State list | **White** (a list of "new or left-over White category industries"): item 32 "Carpentry & furniture units without Seasoning without electrical motor"; item 206 "Timber works such as fixing of doors, windows and panels etc."; item 219 "Wooden furniture (basic items)"; item 77 "Handicrafts (wood, metal, stone)"; item 129 "Manufacturing of other wooden household products n.e.c."; item 139 "Manufacturing of wooden agricultural implements"; item 142 "Manufacturing of wooden tool handles"; item 143 "Manufacturing of wooden toys"; item 207 "Toy making (wooden/clay)"; item 20 "Bamboo crafts and furniture" | NOT FOUND | MPCB | "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | [S8] pp.1, 3–4, 6–7 | The profile's unit has a "Wood Seasoning Plant" and electric machines [S5] p.7, so MPCB item 32 does not cover it. Treat it as **Green until the seasoning and finishing methods are confirmed** (see the "§2b profile unit: overall category" row) ⚠. UP, Bihar, MP and Rajasthan State lists: ⚠ not opened. **Note:** Maharashtra's own White list does not by itself give the central written-intimation exemption, which covers only sectors named in the central Schedule [S9] p.8 (our reading) |
| **Timber: buying, transit, saw-machine licence** | State forest rules ⚠ | Buying logs; running a saw | NOT FOUND ⚠ | NOT FOUND | State forest dept | — | ⚠ | NOT FOUND for each of the 5 States. App rule (our design choice): IF the user will saw logs THEN tell them to ask the forest range office about a saw-machine licence and timber transit passes |
| **GST registration** | CGST Act s.22(1) | Aggregate turnover in a financial year | ₹20 lakh; ₹10 lakh in "special category States" | NOT FOUND | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees" | [S11] pp.49–50 | Special category = the Article 279A(4)(g) States, minus "Jammu and Kashmir" and "Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand" [S11] p.51. None of our 5 States is named there. The Article 279A list itself was not opened ⚠ |
| GST ₹40 lakh goods-only limit | Notification 10/2019-CT | Only for "exclusive supply of goods" | ₹40 lakh | — | CBIC | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | [S12] | A unit that only **sells furniture it makes** may be "exclusively" a goods supplier and get ₹40 lakh (our reading). A carpenter who also does repairs or on-site fitting likely is not, so ₹20 lakh applies. Not available in "Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Telangana, Tripura, Uttarakhand" [S12]. GST classification ⚠ |
| GST: inter-State supply | CGST Act s.24(i) | Any inter-State taxable supply | Registration compulsory | — | CBIC | "persons making any inter-State taxable supply" | [S11] p.51 | Selling furniture across a State border forces registration [S11] |
| Udyam registration | MSMED Act (section NOT FOUND) | Needed for many schemes; trigger NOT FOUND | NOT FOUND | NOT FOUND ⚠ | MoMSME | PM Vishwakarma artisans "also get assistance while onboarding on Udyam Assist Platform", which gives a "Udyam Registration Number" | [S14] p.5 | NOT FOUND |
| Shops & Establishments / panchayat licence | State Acts | Workshop premises | NOT FOUND | NOT FOUND | State labour dept / panchayat | — | ⚠ | NOT FOUND for each of the 5 States |
| Electricity connection (15 HP, Term Loan size) | State supply code / tariff order | New connection | NOT FOUND | NOT FOUND | DISCOM | — | ⚠ | NOT FOUND for each of the 5 States |

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
| Who | SC with a valid caste certificate; "Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026)" [S1]. Groups can also borrow: "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold" [S1] | same [S1] |
| Fits D19? | Yes. NSFDC lists "Small Industries Sector (e.g., manufacturing units, handicrafts, boutiques)" [S1]. The §2a kit (₹1,03,000 sourced) fits under ₹1.40 lakh [S1][S5] | Yes: the §2b unit (₹13.66 lakh) [S1][S5] |

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

**PM Vishwakarma is the best-fitting scheme for D19.** "Carpenter" is a covered trade: "The scheme also accommodated Vishwakarmas of various trades such as Raajmistri (Mason), Tailor, Garland Maker, Carpenter, and Cobbler." [S14] p.6

| Scheme | Who qualifies | Min. size | Benefit | Own share | Period / open now? | Negative list | Combine with NSFDC loan? | Tag |
|---|---|---|---|---|---|---|---|---|
| **PM Vishwakarma** | The scheme gives "special attention to women empowerment and marginalised or underserved groups like the Scheduled Castes" [S14] p.2, and its loans are "collateral-free" [S14] p.4. "working with bare hands and tools"; "Engaged in one of the mentioned 18 family-based traditional trades"; "Minimum age should be 18 years on the date of registration"; "restricted to one member of the family only"; family member must "not be employed in government service". **Fits the Micro size (§2a) only.** The 12-person unit (§2b) likely fails the self-employment test ("Involved in the unorganized sector or self-employment basis") (our reading) | NOT FOUND | Toolkit "₹15,000 in the form of an e-voucher"; training "stipend of ₹500 per day"; loan "₹1 Lakhs" (18 months), condition "Basic training completed"; then "₹2 Lakhs" (30 months), conditions "Availed 1st tranche of loan", "Maintained standard loan account", "Adopted digital transactions in business, or undergone advanced training"; "Concessional rate of interest fixed at 5%"; "Re.1 per digital transaction", "up to a maximum of 100 transactions monthly" | NOT FOUND | Scheme outlay "from FY 2023-24 to FY 2027-28". New registrations open now? ⚠ | NOT FOUND | **Unclear ⚠.** "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years." Which schemes count as "similar", and whether repaid loans are allowed: **NOT FOUND** here (the full guideline is not saved in `_shared/` ⚠). **App rule (our design choice):** show the NSFDC tier first (framework rule). Then show PM Vishwakarma as an option (5% vs NSFDC's 6.5%/8%) with the warning: "An NSFDC loan may count as a similar credit-based scheme and block PM Vishwakarma for 5 years. Ask the District Project Management Unit before taking either loan." | [S14] pp.2–6; guideline details ⚠ |
| **PMEGP** | Any individual above 18; "There will be no income ceiling"; Class VIII pass for projects "above Rs.10 lakh in the manufacturing sector"; new projects only; "Projects without Capital Expenditure are not eligible"; "The ‘Family’ includes self and spouse." | NOT FOUND | Subsidy for "Special (including SC…)": 25% urban, **35% rural** | **5%** | Undated summary (2022-11 web folder). **Status after March 2026: NOT FOUND** | The revised summary points to Para 30 (not included). The pre-revision list does not name carpentry in its readable text ⚠ | **Unclear ⚠.** (1) "the units that have already availed Government Subsidy under any other scheme… are not eligible". (2) "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks". An NSFDC loan through an SCA may not fit | [S15] pp.2–3; [S16] p.23 |
| **PMEGP and NSFDC together** | PMEGP lists its financing institutions as "All Public Sector Banks", "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI" and "Small Industries Development Bank of India (SIDBI)". **NSFDC and SCAs are not listed**; the implementing agencies name "National Scheduled Tribes Finance and Development Corporation (NSTFDC)" but not NSFDC. Also: "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" are not eligible | — | — | — | — | — | **So the PMEGP bank loan cannot be the NSFDC loan, and a unit already set up with an NSFDC (Government of India) loan is likely shut out of a PMEGP first loan** (our reading) ⚠ | [S15] pp.3–5 |
| PMEGP bank terms and limits | — | — | "The Bank will sanction 90% of the project cost in case of General Category of beneficiary/institution and 95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years". So the bank loan is at the bank's normal rate, not 6.5%/8% [S1]. Manufacturing working capital "not be more than 40%" of project cost. Capital per worker "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas". Manufacturing cap "Rs. 50.00 lakh" | — | — | — | — | [S15] pp.2, 5–6 |
| PMEGP check on the §2b unit | — | — | Class VIII: the ₹13.66 lakh project is above "Rs.10 lakh in the manufacturing sector", so "at least VIII standard pass" applies [S15] p.2. | Working capital share: ESTIMATE 5.78 ÷ 13.66 = **42.3%**, which is **above** PMEGP's 40% manufacturing limit [S15]. Capital per worker: ESTIMATE (6.38 + 1.50) ÷ 12 = 0.66 lakh, within Rs. 3 lakh [S15] | — | — | — | — | [S5] p.3; [S15] p.6 |
| **MUDRA** | Loan tiers NOT FOUND this session (mudra.org.in did not open ⚠); see D18 | — | — | — | — | — | NOT FOUND | ⚠ |

**When D19 does NOT fit:**
- PM Vishwakarma: a unit with hired workers likely fails "self-employment basis" (our reading of [S14] p.3). Possibly blocked for 5 years by an earlier government business loan [S14] p.3 ⚠.
- PMEGP: the §2b unit as designed has working capital at 42.3% of project cost, above the 40% manufacturing limit [S15] p.6. Its working capital would need trimming.
- PMEGP: not for a unit that already took a Government subsidy [S15] p.3.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Timber cost (framework key risk): raw material (mostly timber) is about two-thirds of sales | High (our judgement) | Timber rate rises at the depot | IF raw material is more than 60% of sales THEN warn and suggest pricing material separately | ESTIMATE 64.4% [S5]; threshold is our design choice |
| Thin margin at Term Loan size | High (our judgement) | Net profit "3.1%" of sales in year 1 [S5] | IF net margin is below 5% THEN stress-test the EMI with a 10% sales drop | [S5] p.9; test is our design choice |
| Wood dust (framework key risk) | NOT FOUND | — | Show a dust-mask and ventilation checklist (our design choice) | — |
| Single-buyer dependence (one contractor gives most door orders) | Medium (our judgement) | One buyer is more than half of orders | IF one buyer is more than 50% of sales THEN warn and stress-test the EMI without that buyer | Threshold is our design choice |
| Single-supplier dependence (one timber depot) | NOT FOUND | One depot for all timber | IF one supplier only THEN ask for a second | Our design choice |
| Wrong pollution category (spray painting, steam seasoning, MDF/board, saw mill → Green; MDF/board with boiler → Orange) | Medium (our judgement) | Plans any of these | IF yes THEN show Green or Orange and the consent step | [S7] pp.14–15, 34, 45, 49 |
| Timber legality (transit pass, saw licence) | NOT FOUND ⚠ | Buying logs without papers | See §6 | ⚠ |

**SWOT (both sizes).**

| | Micro Finance (≤ ₹1.40 lakh) [S1] | Term Loan (UP profile unit, ₹13.66 lakh) [S1][S5] |
|---|---|---|
| Strengths | Sourced tool kit ₹1,03,000 (§2a) [S5]; White category without spray painting [S7]; covered PM Vishwakarma trade [S14] | Full machine shop incl. "Band Saw" and "Wood Seasoning Plant" [S5]; "Break Even Point : 29%" [S5] |
| Weaknesses | OpEx, prices and seasonality NOT FOUND | Thin 3.1% net margin in year 1 [S5]; working capital above PMEGP's 40% limit (§7); **Green until seasoning and sawing are confirmed** (§6) [S7]; possible saw-machine licence ⚠ |
| Opportunities | PM Vishwakarma toolkit and 5% loan [S14]; GeM onboarding [S14] | Doors and frames for house construction (own NIC code [S3]) |
| Threats | Timber price; competition from ready-made furniture (NOT FOUND) | Same, plus 12 salaries in lean months |

**Competitor density in a block.** No official block-level count of carpenters was found. Options, in order:
1. PM Vishwakarma registrations by district, "Carpenter" trade, from the MSME dashboard (dashboard.msme.gov.in, linked in [S14]): ⚠ not opened.
2. ASUSE unit-level data for NIC 31001 / 310101: NOT FOUND in the fact sheet.
3. Field count: walk the market and count carpentry shops (our survey).

---

## Source log

| Tag | Title | Issuer | URL (deep link) | Exact words used | Date opened | Saved copy |
|---|---|---|---|---|---|---|
| S1 | FAQ – National Scheduled Castes Finance and Development Corporation | MoSJE (dev-site copy) | https://devmosje.negd.in/?p=15629 | "units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a."; "more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a."; "In all schemes, NSFDC provides up to 90% of the project cost."; "Implemented via SCAs/CAs."; "at an interest rate of 15% p.a."; "Small Industries Sector (e.g., manufacturing units, handicrafts, boutiques)"; "(applicable to both rural and urban areas, effective January 7, 2026)"; "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh"; "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a."; "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)"; "rates vary slightly by scheme and channelizing agency"; "Online Mode (PM-SURAJ Portal)"; "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT)"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community"; "subject to maintaining an overall attendance of 80% or above throughout the training period"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold"; "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries."; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period"; "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."; "a valid caste certificate, income proof, KYC documents"; "Annual family income from all sources must not exceed ₹5.00 Lakhs"; "provides market exposure by helping artisans participate in major fairs and exhibitions (e.g., India International Trade Fair, Dilli Haat, Surajkund Mela, Shilp Samagam)" | 09 Nov 2026 | _shared/NSFDC_devmosje_p15629.html |
| S2 | National Industrial Classification 2008, pp.58, 88, 136 | MoSPI | https://mospi.gov.in/sites/default/files/main_menu/national_industrial_classification/nic_2008_17apr09.pdf | "31001 Manufacture of furniture made of wood"; "16221 Manufacture of structural wooden goods [intended to be used primarily in the construction industry such as beams, rafters, roof struts"; "doors, windows, shutters and their frames"; "95240 Repair of furniture and home furnishings" | 09 Nov 2026 | _shared/NIC_2008.pdf |
| S3 | National Industrial Classification 2025, pp.85, 132, 250 | MoSPI | https://mospi.gov.in/uploads/publications_reports/publications_reports1763457214315_c3e5d4f3-8e25-4775-85e3-ad42d571652f_NIC_2025_Final.pdf | "310101 Manufacture of furniture made of wood including of engineered wood, plyboard"; "162202 Manufacture of wooden doors, windows, shutters, stairs, railings and their frames"; "952400 Repair of furniture and home furnishings" | 09 Nov 2026 | _shared/NIC_2025.pdf |
| S4 | Fact sheet ASUSE 2025, p.6 | MoSPI | https://www.mospi.gov.in/uploads/latestreleasesfiles/1777360756062-publications_reports1774347275480_658da785-11e1-4df3-9f02-27e08a8675f6_Factsheet_ASUSE_2025-f.pdf | "3,97,477"; "4,24,139" | 09 Nov 2026 | _shared/ASUSE_2025_Factsheet.pdf |
| S5 | Project Report of Wooden Furniture Manufacturing Unit, pp.2–14 (undated) | UP MSME 1-Connect portal, Government of Uttar Pradesh | https://msme1connect.up.gov.in/Projectreport/Project%20Report638665867034417172.pdf | "WOODEN FURNITURE MANUFACTURING UNIT"; "We can modify the project capacity and project cost as per your requirement."; "Cost of Project"; "Rs.13.66 Lakhs"; "Plant & Machinery 6.38"; "Furniture & Fixtures 1.50"; "Working Capital 5.78"; "Own Contribution 1.37"; "Working Capital(Finance) 5.20"; "Term Loan 7.09"; "Break Even Point"; "29%"; "12 Persons"; "15.00 HP"; "151.44 Lakhs"; "chairs, tables, beds, safes, sofa sets, Almirahs cabinets, etc."; "USD32 billion by 2019"; "around 2000sqft"; "Band Saw 1 2,85,500/-"; "Drill Machine 1 44,000/-"; "Planing Tools 1 29,500/-"; "Wood Seasoning Plant 1 1,00,000/-"; "Planer Machine 1 80,000/-"; "Belt Sander 1 9,500/-"; "Round Cutter 1 5,500/-"; "Wood Lathe Machine 1 45,000/-"; "Carpenter Chisels 10 2,000/-"; "U- gouges 10 1,500/-"; "V- gouges 10 1,500/-"; "Carpentary Saw 1 9,500/-"; "Total 6,38,000/-"; "The estimated Power requirement is taken at 15 HP."; "Stock in Hand 4.38"; "Sundry Debtors 3.92"; "Sundry Creditors 2.52"; "Gross Sale 78.30"; "Raw Material Consumed 50.40"; "Elecricity Expenses 1.01"; "Repair & Maintenance 1.57"; "Labour & Wages 15.12"; "Depreciation 1.11"; "Cost of Production 69.20"; "Closing Stock /WIP 2.70"; "15.07%"; "Salary to Staff 5.67"; "Selling & Adm Expenses Exp. 2.35"; "NET PROFIT 2.44"; "3.1%"; "Finished Goods (10 Days requirement) 2.70"; "Raw Material (10 Days requirement) 1.68"; "Closing Stock 4.38"; "Less: Sundry Creditors 2.52"; "Paid Stock 1.86"; "Working Capital Requirement 5.20"; "Margin 0.58"; "11.0%"; "Moratorium Period 6 Months"; "Repayment Period 54 Months"; "stains, basecoat, glazers,enamles"; "Credit period to Sundry Debtors has been given for 15 days."; "Credit period by the Sundry Creditors has been provided for 15 days."; "Interest on working Capital Loan and Term loan has been taken at 11%."; "Wood, Adhesives,nails and finishing" | 09 Nov 2026 | D19/UP_MSME_Wooden_Doors.pdf |
| S6 | Business category page "Wooden Doors Making unit(Small Scale)" | UP MSME 1-Connect portal | https://msme1connect.up.gov.in/Home/BusinessDetails?Id=213 | "Wooden Doors Making unit(Small Scale)"; "polishing or laminating" | 09 Nov 2026 | D19/UP_MSME_BusinessDetails_213.html |
| S7 | List of Sectors Classified by Central Pollution Control Board (As on 24th August 2026), pp.14–15, 34, 45, 49, 53 | CPCB | https://cpcb.gov.in/uploads/Sectors_Classified_by_CPCB.pdf | "60.1 Carpentry & wooden furniture manufacturing with spray painting (excluding saw mill)"; "25.0 Green"; "60.2 Carpentry & wooden furniture manufacturing without spray painting (excluding saw mill) with the help of electrical (motorized) machines such as electrical wood planner, steel saw cutting circular blade, etc."; "0.0 White"; "164.0 Saw mills"; "30.0 Green"; "Modular wooden furniture from particle board, MDF"; "184.0 Seasoning of wood in steam heated chamber"; "50.0 Green"; "125.0 Spray painting, paint baking, paint shipping"; "47.5 Green"; "Modular wooden furniture from particle board, MDF, swan timber etc"; "(With boiler)"; "60.0 Orange"; "185.0 Pulverization of bamboo and scrap wood"; "216.0 Sports Goods Manufacturing Units (without seasoning of woods)"; "20.0 White" | 09 Nov 2026 | _shared/CPCB_Sectors_Classified.pdf |
| S8 | Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 3–4, 6–7 | Maharashtra Pollution Control Board | https://mpcb.gov.in/sites/default/files/standing_orders/Circular_White_Category_MPCB_16062025.pdf | "Carpentry & furniture units without Seasoning without electrical motor"; "Wooden furniture (basic items)"; "Manufacturing of wooden tool handles"; "Manufacturing of wooden agricultural implements"; "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board"; "new or left-over White category industries"; "Timber works such as fixing of doors, windows and panels etc."; "Handicrafts (wood, metal, stone)"; "Manufacturing of other wooden household products n.e.c."; "Manufacturing of wooden toys"; "Toy making (wooden/clay)"; "Bamboo crafts and furniture" | 09 Nov 2026 | _shared/MPCB_White_Circular_16062025.pdf |
| S9 | MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 598(E) 08.07.2026, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_airact.pdf | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; "18. Carpentry and wooden furniture manufacturing without spray painting [excluding saw mill with the help of electrical (motorized) machines such as electrical wood planer, steel saw cutting circular blade, etc.]"; "G.S.R. 761(E)"; "New Delhi, the 8th July, 2026"; "G.S.R. 598(E)"; "29th July, 2025" | 09 Nov 2026 | _shared/CPCB_White_exemption_airact.pdf |
| S10 | MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendments incl. G.S.R. 599(E) 08.07.2026, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_wateract.pdf | "all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed"; "18. Carpentry and wooden furniture manufacturing without spray painting"; "G.S.R. 511(E)"; "G.S.R. 599(E)"; "G.S.R. 762(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_wateract.pdf |
| S11 | CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 | CBIC | https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "the expression ―special category States‖ shall mean the States as specified"; "Arunachal Pradesh, Assam, Himachal Pradesh"; "persons making any inter-State taxable supply"; "aggregate turnover in a financial year exceeds ten lakh rupees" | 09 Nov 2026 | _shared/CGST_Act_updated_31082021.pdf |
| S12 | Notification No. 10/2019-Central Tax | Ministry of Finance | https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees"; "Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Telangana, Tripura, Uttarakhand" | 09 Nov 2026 | _shared/GST_Notfn_10_2019_CT.pdf |
| S13 | Fact Sheet on HCES 2023-24, pp.4, 12 | MoSPI | https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf | "Statement 7: Average MPCE for each State/UT in 2023-24"; "‘MPCE estimates with imputation’ are presented in Section II" | 09 Nov 2026 | _shared/HCES_FactSheet_2023-24.pdf |
| S14 | PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), pp.2–6 | PIB | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc2025916638501.pdf | "working with bare hands and tools"; "Engaged in one of the mentioned 18 family-based traditional trades"; "Involved in the unorganized sector or self-employment basis"; "Minimum age should be 18 years on the date of registration"; "restricted to one member of the family only"; "not be employed in government service"; "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years"; "₹15,000 in the form of an e-"; "stipend of ₹500 per day"; "₹1 Lakhs"; "18 months"; "₹2 Lakhs"; "30 months"; "Concessional rate of interest fixed at 5%"; "Re.1 per digital transaction"; "onboarding them on e-commerce platforms such as GeM"; "The scheme also accommodated Vishwakarmas of various trades such as Raajmistri (Mason), Tailor, Garland Maker, Carpenter, and Cobbler."; "Basic training completed"; "Availed 1st tranche of loan"; "Maintained standard loan account"; "Adopted digital transactions in business, or"; "undergone advanced training"; "assistance while onboarding on Udyam Assist"; "Udyam Registration Number"; "up to a maximum of 100 transactions monthly"; "special attention to women empowerment and"; "marginalised or underserved groups like the Scheduled Castes"; "collateral-free" | 09 Nov 2026 | _shared/PM_Vishwakarma_PIB_Sep2025.pdf |
| S15 | Salient Features of Revised PMEGP, pp.2–3, 5–6 (undated; web folder 2022-11) | Delhi Khadi & Village Industries Board | https://dkvib.delhi.gov.in/sites/default/files/2022-11/salient-features-of-revised-ppmegp.pdf | Special category "05%" own, "25%" urban, "35%" rural; "manufacturing sector is Rs. 50.00 lakh"; "There will be no income ceiling"; "the units that have already availed Government Subsidy under any other scheme of Government of India or State Government are not eligible"; "Projects without Capital Expenditure are not eligible for Financing under the scheme."; "The ‘Family’ includes self and spouse."; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks."; "The Bank will sanction 90% of the project cost in case of General Category of beneficiary/institution and 95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years"; "not be more than 40%"; "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas"; "All Public Sector Banks."; "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI."; "Small Industries Development Bank of India (SIDBI)."; "National Scheduled Tribes Finance and Development Corporation (NSTFDC)"; "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy"; "at least VIII standard pass" | 09 Nov 2026 | _shared/PMEGP_Revised_Salient_DelhiKVIB.pdf |
| S16 | Guidelines on PMEGP (pre-revision scan), p.23, Para 29 | KVIC copy on a Government server | https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2023/03/2023031676.pdf | "Negative List of Activities"; "The following list of activities will not be permitted under PMEGP" | 09 Nov 2026 | _shared/PMEGP_Guidelines_s3waas_2023-03.pdf |

## Quality gates (researcher)

| Gate | Result |
|---|---|
| G1 Every number tagged | Pass, per the check script |
| G3 FSSAI | Not applicable (no food) |
| G4 GST | Pass with ⚠: ₹40 lakh only if purely selling own-made furniture (our reading); else ₹20 lakh |
| G5 Pollution category | **Pass with ⚠**: White for hand finishing without spray painting, seasoning or saw mill [S7][S9][S10]. Green with spray painting, steam seasoning, MDF/particle board or saw mill; Orange for MDF/board with a boiler [S7]. The §2b profile unit is treated as Green until its seasoning and finishing are confirmed ⚠. Maharashtra list checked [S8]. Timber rules ⚠ |
| G6 Scheme open | PM Vishwakarma outlay to FY 2027-28 [S14]; new registrations ⚠. PMEGP after March 2026 NOT FOUND |
| G7 Scheme fit | Done. PM Vishwakarma–NSFDC combination unclear ⚠. §2b fails PMEGP's 40% working-capital limit |
| G8 NSFDC tier first | Pass |
| G9 Seasonality | **Fail**: no source; needs field survey |
| G10 Working capital from cycle days | Pass for the Term Loan size: the profile's stated 10 + 10 stock days [S5] p.11 plus debtor and creditor days give ₹4.23 lakh net (ESTIMATE; 15/15 credit days [S5] p.14); the profile's own net figure is ₹5.78 lakh [S5], which the app uses. Micro size NOT FOUND |
| G12 Biology | Not applicable |
