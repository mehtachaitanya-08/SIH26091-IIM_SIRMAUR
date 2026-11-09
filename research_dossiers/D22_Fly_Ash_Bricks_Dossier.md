# D22 Fly-Ash Bricks — sector dossier (SIH26091)

| Field | Value |
|---|---|
| Domain code | D22 |
| Short name | Fly_Ash_Bricks |
| Domain | Fly-ash brick and block making |
| Basket | B7 Rural Construction, Materials & Green Units (ईंट, सीमेंट एवं कम्पोस्ट निर्माण) |
| Unit to study | Semi-automatic press (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

How to read this file.
Every figure carries one of these tags:
[S#]: see the Source log at the end
ESTIMATE: inputs and sum shown
NOT FOUND
VENDOR QUOTE NEEDED
Rows marked ⚠ need Person D to open the page in a normal browser.
Lines marked "our design choice" are app rules we chose, not facts.
Nothing here comes from memory, blogs or news.

Scanned source. The Ministry of Power guidelines [S9] are a scanned image. We extracted the text with OCR (automatic text reading) and saved it as D22/MoP_Guidelines_15032024_Ash.ocr.txt.

Sources that could not be opened on 09 Nov 2026 (facts they hold are NOT FOUND here, not guessed):
* bis.gov.in: the Indian Standard for fly-ash bricks
* CEA list of thermal power plants by district
* CPWD / State PWD Schedule of Rates for ash bricks
* pmvishwakarma.gov.in
* mudra.org.in
* kviconline.gov.in
* State DISCOM sites

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2025 code | 239508 "Manufacture of bricks, blocks, tiles and similar products of fly ash" | [S3] p.100 |
| NIC 2008 code | No fly-ash code. Closest: 23952 "Manufacture of articles of concrete, cement or artificial stone (tiles, bricks etc.)". Clay bricks are 23921 "Manufacture of bricks". Which one to use is our reading ⚠ | [S2] pp.67–68 |
| Sector | Manufacturing (NIC Division 23) | [S2] p.67 |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Rural count of fly-ash brick units | NOT FOUND | — |

**Demand drivers: a legal mandate near coal power plants (Ash Utilisation Notification S.O. 5481(E), 31.12.2021, as amended on 30.12.2022 and 01.01.2024 [S8]):**
1. **Building projects within 300 km must use ash bricks:** "All building construction projects (Central, State and Local authorities, Govt. undertakings, other Govt. agencies and all private agencies) located within a radius of 300 kms from a coal or lignite based thermal power plant shall use ash bricks, tiles, sintered ash aggregate or other ash based products, provided these are made available at prices not more than the price mentioned in the Schedule of Rates as specified by the CPWD or PWD of the State concerned or price of alternative products..." [S8] p.30. Price ceiling is CPWD/PWD rate. Whether rates published: NOT FOUND ⚠.
2. **Brick makers can serve notice on those projects:** "The manufacturers of ash bricks... shall give a written notice to persons or agencies who are required to utilise ash-based products under sub-paragraph (8) of paragraph B... with a copy to concerned State Pollution Control Board." [S8] p.30. Buyers tied up with others must inform the maker [S8] p.27.
3. **Local building bye-laws:** "All local authorities shall make provisions in their respective building bye-laws and other relevant regulations for the use of ash and ash-based products" [S8] p.30.

App rule (our design choice): IF user's block is within 300 km of a coal/lignite power plant THEN show mandate as demand driver. Plant list and distances NOT FOUND (CEA list not opened ⚠). CPWD/PWD price cap NOT FOUND ⚠.

**Demand formula:** `ESTIMATE: houses and public buildings under construction in catchment [NOT FOUND] × bricks per building [NOT FOUND]`. Inputs are NOT FOUND. Clay bricks stay a competitor [S8] p.13.

**Sales channels:**
* Written notice to builders bound by B(8) [S8] p.30.
* Government building projects [S8] p.30.
* Walk-in house builders and contractors: field-survey question.

**Underserved niches and how to spot them in a block:**
| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Supplying government building projects within 300 km of power plant | They "shall use ash bricks" if priced within CPWD/PWD Schedule of Rates | Ask block or district PWD office which projects are coming and what rate they accept | [S8] p.30 |
| Small units buying cheap reserved ash | Power plants must reserve ash for MSEs at a floor price of "50 % of the lowest price" in their open auction | Ask nearest power plant for limited-auction notice | [S8] p.30; [S9] p.3 |

---

## 2. CapEx

Price source. UP Government MSME portal profile "Fly ash bricks manufacturing Unit" [S5] is undated. Gives totals only: "Gross Block 30.48" lakh, no machine list. All machine prices are VENDOR QUOTE NEEDED.

**Checks on the profile's arithmetic (SOP D4):**
* Cost of production: $69.58 + 5.94 + 0.29 + 13.86 + 1.10 = 90.77$. Matches [S5] p.5.
* Gross profit: $110.16 - 83.81 = 26.35$. Matches [S5] p.5.
* Expenses (D): $10.80 + 3.30 + 2.34 + 3.00 + 4.13 = 23.57$. Matches [S5] p.5.
* Net profit: $26.35 - 23.57 = 2.78$. Matches [S5] p.5.
* Build-stage funding: $9.80 + 21.50 + 0.30 + 0.20 = 31.80$. Matches [S5] p.4.
* **Working-capital interest blunder:** "Interest on Working Capital Loan 3.00" on a "Working Capital Loan 5.00" $\rightarrow$ ESTIMATE $3.00 \div 5.00 = 60\%$ a year! Overstates costs and understates profit [S5] pp.4–5.
* Profit added to capital: "Closing Capital" year 1 = $9.80 + 2.78 - 1.00 = 11.58$, using profit before tax (2.78). Error. Using profit after tax (2.22) gives ESTIMATE 11.02 [S5] pp.4–5.
* Balance-sheet assets: $26.35 + 7.34 + 6.96 + 1.42 + 0.55 = 42.62$. Printed "42.63" [S5] p.4.

Connected load and phase: NOT FOUND. "Power Expense 5.94" lakh/year [S5] p.5, but no kW. Press and pan mixer likely need 3-phase (vendor quote and State DISCOM code ⚠).

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])
Probably does NOT fit (our reading). No official source gives press, mixer and curing yard for under ₹1.40 lakh. Manual press could be priced: VENDOR QUOTE NEEDED.

**Buying ash at small scale:**
* MoP limited auction: "For Micro and Small Enterprises the bid threshold shall be 50 tonnes" [S9] p.2.
* Free route: Leftover ash after auctions "shall be offered through open Expression of Interest (EOI) for lifting ash on 'as is where is' basis, to be given free of cost on first come first serve basis, if the user agency is willing to bear transportation cost" [S9] p.4.

App rule (our design choice): IF project is up to ₹1.40 lakh THEN tell user no official design was found at this size; suggest getting a vendor quote for manual press.
Loan at ceiling (if design found): Project ₹1,40,000 [S1] → max loan ₹1,25,000 [S1]. Own share at least ₹15,000 [S1].

### 2b. Term Loan size (the UP profile's unit)
| # | Item | ₹ lakh | Tag |
|---|---|---|---|
| 1 | Capital expenditure (machines, shed; no breakdown) | 30.48 | [S5] p.6 ("Capital Expenditure 30.48") |
| 2 | Year-1 working capital: inventory 6.96 + debtors 7.34 - creditors 5.50 | ESTIMATE 8.80 | [S5] p.4 |
| | **Basis A: what the money is spent on** | **ESTIMATE 30.48 + 8.80 = 39.28** | [S5] |
| | **Basis B: money brought in (capital + term loan + WC loan)** | **ESTIMATE 9.80 + 21.50 + 5.00 = 36.30** | [S5] pp.4, 6 |

**NSFDC Term Loan on this unit:**
* Basis A: Loan 90% = **₹35.352 lakh**; Own share **₹3.928 lakh** [S1]. Below ₹45 lakh loan cap [S1].
* Basis B: Loan 90% = **₹32.67 lakh**; Own share **₹3.63 lakh** [S1].
* App should use Basis A (safer for borrower). Profile put own capital 9.80L (31.3% of capital + term loan) [S5] p.4; NSFDC needs only $\ge 10\%$ [S1].
* Profile's bank interest works out to about $2.34 \div 21.50 = 10.9\%$ on term loan [S5] pp.4–5. NSFDC is 8% p.a. [S1].

---

## 3. OpEx & working capital

**Monthly operating cost, Term Loan size (year 1 [S5] p.5):**
* Raw Material & Consumable: ₹69.58L/yr [S5] p.5
* Power Expense: ₹5.94L/yr [S5] p.5
* Repair & Maintenance: ₹0.29L/yr [S5] p.5
* Wages & Salary: ₹13.86L/yr [S5] p.5
* Factory Expenses: ₹1.10L/yr [S5] p.5
* Salary to Staff: ₹10.80L/yr [S5] p.5
* Selling & Administrative: ₹3.30L/yr [S5] p.5
* Total cash OpEx: **₹104.87L/year = ₹8.739L/month** [S5] p.5

Ash cost: Raw-material line does not split out ash, cement, lime or sand: NOT FOUND. In limited auction, floor price is "50 % of the lowest price ... minimum floor price (Reserved Price) of Rs 1.00 (one) per Metric Tonne (MT)" [S9] p.3. Transport cost NOT FOUND.

**Working-capital cycle (days) (year 1):**
* Finished bricks in stock ("Inventory 6.96"): ESTIMATE $6.96 \div 90.77 \times 365 = 28.0\text{ days}$ [S5] pp.4–5
* Debtors ("Sundry Debtors 7.34"): ESTIMATE $7.34 \div 110.16 \times 365 = 24.3\text{ days}$ [S5] pp.4–5
* Less creditors ("Sundry Creditors 5.50"): ESTIMATE $5.50 \div 69.58 \times 365 = 28.9\text{ days}$ [S5] pp.4–5
* Curing time ("Curing time ties up cash"): NOT FOUND
* Net cycle: ESTIMATE $28.0 + 24.3 - 28.9 = \mathbf{23.4\text{ days}}$

Formula (G11): `Working capital = (sum of cycle days ÷ 30) × monthly OpEx`
* Net of supplier credit: ESTIMATE $(23.4 \div 30) \times 8.739 = \mathbf{₹6.82\text{ lakh}}$.
* Gross (no supplier credit): ESTIMATE $(52.3 \div 30) \times 8.739 = ₹15.23\text{ lakh}$.
* Profile's own figure: ESTIMATE $6.96 + 7.34 - 5.50 = \mathbf{₹8.80\text{ lakh}}$ [S5] p.4.
* App rule: use profile's net ₹8.80 lakh; never use gross figure as borrow amount.

---

## 4. Unit economics & pricing

* Sales, year 1: "Gross Sale (Fly Ash Bricks) 110.16" lakh [S5] p.5
* Raw material as share of sales: ESTIMATE $69.58 \div 110.16 = 63.2\%$ [S5] p.5
* Gross margin, year 1: "23.92%" [S5] p.5
* Profit after tax, year 1: "2.22" lakh, "2.02%" of sales [S5] p.5
* Effect of 60% interest error: If working-capital interest were 8% [S1] instead: ESTIMATE $5.00 \times 8\% = 0.40$ instead of 3.00, so profit before tax rises by ESTIMATE $3.00 - 0.40 = \mathbf{₹2.60\text{ lakh}}$ [S1][S5].
* Price per brick / Bricks per day capacity / Break-even: NOT FOUND.

**Regional purchasing power (HCES 2023-24 rural MPCE) [S13] p.12:**
* UP: ₹3,481 (0.84)
* Bihar: ₹3,670 (0.89)
* MP: ₹3,441 (0.83)
* Rajasthan: ₹4,510 (1.09)
* Maharashtra: ₹4,145 (1.01)
* All-India: ₹4,122 (1.00)

Pricing strategy: Price at/below CPWD/PWD Schedule of Rates for mandated buyers [S8] p.30. Compete on price against clay bricks for private rural buyers.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

No official monthly series was found. Building work slows in monsoon. Ash buying is planned yearly: power plants start bidding at least 4 months before fiscal year end (around November) [S9] p.2. Limited auction for MSEs is held annually [S9] p.3. G9 fails until field survey.

---

## 6. Compliance

All rows opened 09 Nov 2026 unless marked ⚠.

| Rule | Law & section | Trigger | Threshold | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — |
| Pollution: without boiler | CPCB directions, 12.02.2025 | Fly-ash brick making, no boiler | Green (PI 25.0) | SPCB | "7.2 Fly ash bricks/ block manufacturing (without boiler)" … "25.0 Green" | [S7] p.3 | Score 25.0 is within "upto 25", but White exemption covers only sectors listed in Schedule. Fly-ash bricks not in 2026 White Schedule; stays Green nationally [S10] p.8 |
| Pollution: with boiler | CPCB list | With boiler (steam curing) | Orange (PI 75.0) | SPCB | "7.1 Fly ash bricks/ block manufacturing (with boiler)" … "75.0 Orange" | [S7] p.3 | IF boiler or steam curing THEN show Orange |
| White list history | — | — | Nov 2024 White Schedule listed "16. Fly ash bricks/ block manufacturing" [S10] p.4. Later Schedules (from 28.07.2025) do not list it | — | as quoted | [S10] p.4 | Lost national White status in 2025 |
| Cement blocks/tiles (<1 TPD) | CPCB list; 2026 Schedule | Under 1 tonne a day | White (0.0) | SPCB | "193.0 Cement products... (<1 TPD)" … "0.0 White"; 2026 Schedule item 60 | [S7] p.50; [S10] p.27 | Larger precast without steam curing are Green (30.6) [S7] p.8 |
| Maharashtra Pollution | MPCB circular, 16.06.2025 | On State list | White: item 66 "Fly ash bricks / block manufacturing units" | MPCB | Self-certification on portal | [S11] pp.1, 4 | Based on Nov 2024 notification; national list has changed since ⚠. Other States ⚠ |
| Ash use standards | Ash Notification S.O. 5481(E), B(9) | Making ash products | — | CPCB, SPCB, District Magistrate | "in accordance with specifications and guidelines laid down by BIS, IRC, and CPCB" | [S8] p.17 | BIS standard number NOT FOUND ⚠ |
| Ash user penalties | Ash Notification C(5), C(6) | Using ash | Non-eco-friendly use / non-compliance | SPCB / PCC | C(5): compensation of ₹1,500/ton of ash. C(6): building projects failing to use ash penalized at "Rs.75/- per square feet of built up area" | [S8] pp.17–18 | ₹75/sq.ft penalty on non-complying buildings is sales argument for maker |
| Buying reserved ash (limited auction) | MoP guidelines 15.03.2024 | Buying dry fly ash from TPP | Bid $\ge$ 50 tonnes | TPP / SPCB | Reserved for MSEs with valid CTO or MSE registration. Floor price: 50% of lowest open auction price, min ₹1.00/MT | [S9] pp.2–3 | SPCB verifies ash issued to MSEs is used for ash products |
| Consent to Establish / Operate (Green unit) | Water / Air Act consent | Green category (no boiler) | — | SPCB | MoP auction requires valid CTO or valid MSE registration [S9] p.3 | [S9] p.3 | Tell Green unit to get SPCB consent first and keep Udyam registration |
| GST registration | CGST Act s.22(1) | Aggregate turnover | ₹20 lakh; ₹10 lakh in special category | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees" | [S14] pp.49–50 | Special category States list ⚠ |
| GST ₹40L goods limit | Notification 10/2019-CT | Exclusive supply of goods | ₹40 lakh | CBIC | Maker selling only bricks is exclusively goods supplier. Profile year-1 sales (110.16L) exceed both limits; must register | [S15] | — |
| Udyam / MSE registration | MSMED Act | Route into limited auction | — | MoMSME | "with a valid MSE registration" | [S9] p.3 | Does not replace SPCB consent for Green unit |

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
| Repayment | quarterly installments within 3 years (3-month moratorium) [S1] | within 7 years (6-month moratorium, extended to 12 months for construction) [S1] |
| Who | SC with valid caste certificate; family income $\le$ ₹5.00 Lakhs (effective Jan 7, 2026) [S1] | same [S1] |
| Fits D22? | Probably not (§2a) | Yes: §2b unit (ESTIMATE ₹39.28 lakh) is under ₹50 lakh; loan ₹35.352 lakh is under ₹45 lakh cap [S1][S5] |

* Women: 40% funds specifically allocated for women beneficiaries [S1].
* Watch channel: AMY is 15% p.a. through NBFC-MFIs; UNY is 13–15% through Coops/SFBs [S1].
* Free skill training: PM-DAKSH free NSQF training for SCs (age 18–45) with ₹1,500/month DBT stipend [S1].

### 7.2 Other schemes and supports
| Scheme | Who qualifies | Benefit | Own share | Tag |
|---|---|---|---|---|
| Reserved ash for MSEs (MoP auction) | MSEs with valid CTO or MSE registration | Floor price 50% of lowest open auction price, min ₹1.00/MT; 20% reserved quantity | — | [S9] pp.2–3 |
| PMEGP | Any individual >18; no income ceiling; new projects only | Special category: 25% urban, 35% rural subsidy | 5% | [S16] pp.2–3; [S17] p.23 |
| PMEGP bank terms & limits | 95% bank loan; bank normal rate; manufacturing cap ₹50.00L; working capital max 40%; capital per worker $\le$ ₹3L | Bank rate | — | [S16] pp.2, 5–6 |
| PMEGP check on §2b unit | Working capital: $8.80 \div 39.28 = 22.4\%$, within 40% [S16]. Capital per worker: $30.48 \div 3\text{ lakh} = \text{at least 11 workers needed}$ | — | — | [S5][S16] |
| PM Vishwakarma | Engaged in 18 traditional trades | Machine brick-making is NOT a traditional trade | Does NOT fit | [S18] p.3 |
| MUDRA | Tiers NOT FOUND this session ⚠ | — | — | ⚠ |

**When D22 does NOT fit:**
* Micro size: no official design under ₹1.40 lakh. Limited auction has 50 tonnes bid threshold [S9] p.2.
* PM Vishwakarma: not a traditional trade [S18] p.3.
* Pollution: unit with boiler or steam curing is Orange [S7] p.3.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Curing time ties up cash | NOT FOUND (curing days) | Stock of unsold bricks grows | Ask curing days in survey; until then use 28 days of stock | ESTIMATE 28.0 days [S5] |
| Ash supply: no tie-up with TPP | High | No limited-auction allocation; TPP daily ash data shows none available | Warn before loan; point user to CPCB ash portal | [S8] p.15; [S9] p.3 |
| A served notice is refused | Medium | Buyer replies they are "already tied up" [S8] p.27 | Do not count notices as sales in forecast | [S8] p.27 |
| Distance to power plant (>300 km) | High | > 300 km to nearest plant | IF > 300 km THEN drop mandate as demand driver | [S8] p.30; distance NOT FOUND ⚠ |
| Thin margin | High | Profit after tax 2.02% of sales in year 1 [S5] | Stress-test EMI at year-1 sales; correct 60% interest error first | [S5] p.5 |
| Single-buyer dependence | High | One buyer > half of sales | Warn and stress-test EMI without them | Threshold is our design choice |
| Price cap for mandated buyers | Medium | CPWD/PWD rate below cost | Compare cost per brick with Schedule of Rates ⚠ | [S8] p.30 |
| Wrong pollution category (boiler → Orange) | Medium | Plans steam curing | See §6 | [S7] p.3 |

**SWOT (both sizes):**
* **Strengths:** Legal demand within 300 km of power plants [S8]; reserved cheap ash for MSEs [S9]; Green (not Orange) without a boiler [S7].
* **Weaknesses:** No official design at micro size; thin 2.02% margin [S5]; profile arithmetic errors (§2).
* **Opportunities:** Written notices to mandated builders [S8] p.30; NSFDC 8% vs profile's ~10.9% [S1][S5].
* **Threats:** Price cap at CPWD/PWD rates [S8]; ash supply tie-up; transport distance.

---

## Source log
* **S1:** FAQ – National Scheduled Castes Finance and Development Corporation (MoSJE, devmosje.negd.in/?p=15629, opened 09 Nov 2026).
* **S2:** National Industrial Classification 2008, pp.67–68 (MoSPI, opened 09 Nov 2026).
* **S3:** National Industrial Classification 2025, p.100 (MoSPI, opened 09 Nov 2026).
* **S4:** Fact sheet ASUSE 2025, p.6 (MoSPI, opened 09 Nov 2026).
* **S5:** Project Report of Fly Ash Bricks, pp.2–6 (UP MSME 1-Connect, opened 09 Nov 2026).
* **S6:** Business category page "Fly Ash Bricks" (Id 22) (UP MSME 1-Connect, opened 09 Nov 2026).
* **S7:** List of Sectors Classified by Central Pollution Control Board (24 Aug 2026), pp.3, 8, 50 (CPCB, opened 09 Nov 2026).
* **S8:** Ash Utilisation Notification S.O. 5481(E) 31.12.2021, with amendments S.O. 6169(E) 30.12.2022 and S.O. 05(E) 01.01.2024, pp.13, 15, 17–18, 27, 30–31 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S9:** Guidelines for coal or lignite based TPPs to utilise ash by providing it to user agencies, No. 9/8/2024-St. Th., 15.03.2024, pp.1–4 (Ministry of Power via CPCB, scanned, OCR text saved, opened 09 Nov 2026).
* **S10:** MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 512(E) 28.07.2025 and G.S.R. 598(E) 08.07.2026, pp.4, 8, 16, 27 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S11:** Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 4 (Maharashtra Pollution Control Board, opened 09 Nov 2026).
* **S12:** MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendment G.S.R. 511(E) 28.07.2025, p.8 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S13:** Fact Sheet on HCES 2023-24, pp.4, 12 (MoSPI, opened 09 Nov 2026).
* **S14:** CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 (CBIC, opened 09 Nov 2026).
* **S15:** Notification No. 10/2019-Central Tax (Ministry of Finance, opened 09 Nov 2026).
* **S16:** Salient Features of Revised PMEGP, pp.2–6 (Delhi KVIB, opened 09 Nov 2026).
* **S17:** Guidelines on PMEGP (pre-revision scan), p.23, Para 29 (KVIC via s3waas, opened 09 Nov 2026).
* **S18:** PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), p.3 (PIB, opened 09 Nov 2026).

---

## Quality gates (researcher)
* **G1 Every number tagged:** Pass, per check script.
* **G3 FSSAI:** Not applicable (no food).
* **G4 GST:** Pass: ₹40 lakh for goods-only maker; profile sales exceed limit, must register.
* **G5 Pollution category:** Pass with ⚠: Green without boiler, Orange with one [S7]. Lost national White status in 2025 [S10]. White in Maharashtra [S11]. Small cement blocks (<1 TPD) are White [S7][S10].
* **G6 Scheme open:** MoP limited auction is annual [S9]. PMEGP after March 2026 NOT FOUND.
* **G7 Scheme fit:** Done. Micro size probably does not fit; PM Vishwakarma does not fit.
* **G8 NSFDC tier first:** Pass.
* **G9 Seasonality:** Fail: no source; needs field survey.
* **G10 Working capital from cycle days:** Pass (Term Loan): ESTIMATE ₹6.82 lakh net by formula; profile's net ₹8.80 lakh used. Curing days NOT FOUND.
* **G12 Biology:** Not applicable.
