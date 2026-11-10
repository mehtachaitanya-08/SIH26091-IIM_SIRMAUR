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

**How to read this file.**
- Every figure carries one of these tags:
  - `[S#]`: see the Source log at the end
  - `ESTIMATE`: inputs and sum shown
  - `NOT FOUND`
  - `VENDOR QUOTE NEEDED`
- Rows marked `⚠` need Person D to open the page in a normal browser.
- Lines marked "our design choice" are app rules we chose, not facts.
- Nothing here comes from memory, blogs or news.

**Scanned source.** The Ministry of Power guidelines [S9] are a scanned image. We extracted the text with OCR (automatic text reading) and saved it as `D22/MoP_Guidelines_15032024_Ash.ocr.txt`.

**Sources that could not be opened on 09 Nov 2026** (facts they hold are NOT FOUND here, not guessed):
- bis.gov.in: the Indian Standard for fly-ash bricks
- CEA list of thermal power plants by district
- CPWD / State PWD Schedule of Rates for ash bricks
- pmvishwakarma.gov.in
- mudra.org.in
- kviconline.gov.in
- State DISCOM sites

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2025 code | 239508 "Manufacture of bricks, blocks, tiles and similar products of fly ash" | [S3] p.100 |
| NIC 2008 code | **No fly-ash code.** Closest: 23952 "Manufacture of articles articles of concrete, cement or artificial stone (tiles, bricks etc.)" (sic). Clay bricks are 23921 "Manufacture of bricks". Which one to use is our reading ⚠ | [S2] pp.67–68 |
| Sector | Manufacturing (NIC Division 23) | [S2] p.67 |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Rural count of fly-ash brick units | NOT FOUND | — |

**Demand drivers: a legal mandate near coal power plants** (Ash Utilisation Notification S.O. 5481(E), 31.12.2021, as amended on 30.12.2022 and 01.01.2024 [S8]).

1. **Building projects within 300 km must use ash bricks, if the price is right.** The 2024 text reads: "All building construction projects (Central, State and Local authorities, Govt. undertakings, other Govt. agencies and all private agencies) located within a radius of 300 kms from a coal or lignite based thermal power plant shall use ash bricks, tiles, sintered ash aggregate or other ash based products, provided these are made available at prices not more than the price mentioned in the Schedule of Rates as specified by the Central Public Works Department (CPWD) or Public Works Department (PWD) of the State concerned or price of alternative products, if not mentioned in the Schedule of Rates." It also says the CPWD and State PWDs "shall publish the Schedule of Rates specified within six months from the 1st January, 2024" [S8] p.30. **So the price ceiling is the CPWD/PWD rate, or, where no rate is listed, the price of the alternative product (e.g. clay bricks).** Whether those rates were published: NOT FOUND ⚠.
2. **Brick makers can serve notice on those projects.** "The manufacturers of ash bricks or tiles or sintered ash aggregate or other ash-based products shall give a written notice to persons or agencies who are required to utilise ash-based products under sub-paragraph (8) of paragraph B for offering for sale of such products with a copy to concerned State Pollution Control Board." [S8] p.30. **A notice is not a sure sale.** Buyers who "have already tied up with other agencies" must inform the maker "if they cannot use ash based products, or may use reduced quantity" [S8] p.27.
3. **Local building bye-laws.** "All local authorities shall make provisions in their respective building bye-laws and other relevant regulations for the use of ash and ash-based products, such as bricks, blocks, tiles" [S8] p.30.

**App rule (our design choice):**
- IF the user's block is within 300 km of a coal or lignite power plant THEN show the mandate as a demand driver.
- The plant list and distances are NOT FOUND (CEA list not opened ⚠).
- The CPWD/PWD price cap per brick is NOT FOUND ⚠.

**Demand within 5–10 km (formula for the app).**
`ESTIMATE: houses and public buildings under construction in the catchment [NOT FOUND] × bricks per building [NOT FOUND]`.
The inputs are NOT FOUND.

**Clay bricks stay a competitor.** The 2021 notification replaced the 1999 one that restricted digging top soil for bricks near power plants. It keeps only the aim, "there is a need to conserve top soil by promoting manufacture and mandating use of ash based products" [S8] p.13. No operative clay-brick ban near plants was found in it (our reading).

**Rural vs semi-urban.** No official comparison: NOT FOUND. The 300 km mandate covers building "projects" by "all private agencies" too [S8] p.30. Whether an individual building their own house counts as an "agency" is **unclear** ⚠, so the app should not promise demand from rural house builders.

**Sales channels.** These are from official sources:
- Written notice to government and private builders bound by B(8) [S8] p.30.
- Government building projects (Central, State, local) [S8] p.30.

Walk-in house builders and contractors: field-survey question, not data.

**Underserved niches and how to spot them in a block.**

| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Supplying government building projects within 300 km of a power plant | They "shall use ash bricks" if priced within the CPWD/PWD Schedule of Rates | Ask the block or district PWD office which projects are coming and what rate they accept | [S8] p.30 |
| Small units buying cheap reserved ash | Power plants must reserve ash for "micro and small enterprises" at a floor price of "50 % of the lowest price" in their open auction | Ask the nearest power plant for its limited-auction notice | [S8] p.30; [S9] p.3 |

---

## 2. CapEx

**Price source.** The UP Government MSME portal profile "Fly ash bricks manufacturing Unit" [S5] is **undated**. It gives totals only: "Gross Block 30.48" lakh, with **no machine list**. So all machine prices are VENDOR QUOTE NEEDED. The profile also says: "We can modify the project capacity and project cost as per your requirement." [S5] p.2

**Checks on the profile's arithmetic** (SOP D4):

| Check | Sum | Result |
|---|---|---|
| Year-1 cost of production | 69.58 + 5.94 + 0.29 + 13.86 + 1.10 = 90.77 | Matches [S5] p.5 |
| Gross profit | 110.16 − 83.81 = 26.35 | Matches [S5] p.5 |
| Expenses (D) | 10.80 + 3.30 + 2.34 + 3.00 + 4.13 = 23.57 | Matches [S5] p.5 |
| Net profit | 26.35 − 23.57 = 2.78 | Matches [S5] p.5 |
| Build-stage funding | 9.80 + 21.50 + 0.30 + 0.20 = 31.80 | Matches [S5] p.4 |
| **Working-capital interest** | "Interest on Working Capital Loan 3.00" on a "Working Capital Loan 5.00" | **Apparent error** (unless the profile assumed a larger cash-credit limit it does not show). ESTIMATE 3.00 ÷ 5.00 = **60%** a year. This overstates costs and understates profit [S5] pp.4–5 |
| **Profit added to capital** | "Closing Capital" year 1 = 9.80 + 2.78 − 1.00 = 11.58, using **profit before tax** (2.78) | **Error.** Using profit after tax (2.22) gives ESTIMATE 11.02 [S5] pp.4–5. Taxes never appear as a payment in the fund-flow statement [S5] p.6 |
| Balance-sheet assets, year 1 | 26.35 + 7.34 + 6.96 + 1.42 + 0.55 = 42.62 | Printed "42.63": rounding [S5] p.4 |

**Connected load and phase.** NOT FOUND. The profile gives "Power Expense 5.94" lakh a year [S5] p.5, but no kW. A brick press and pan mixer may need 3-phase supply (our reading; vendor quote and State DISCOM code ⚠).

**Where machines are made.** NOT FOUND.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])

**Probably does NOT fit (our reading).** No official source gives a fly-ash brick press, mixer and curing yard for under ₹1.40 lakh. A manual press could be priced by a vendor: VENDOR QUOTE NEEDED.

**Buying ash at small scale:**
- The MoP limited auction says "For Micro and Small Enterprises the bid threshold shall be 50 tonnes." [S9] p.2. We read this as a minimum bid (our reading).
- There is also a **free route with no threshold stated**. Ash left over after auctions "shall be offered through open Expression of Interest (EOI) for lifting ash on ‘as is where is’ basis, to be given free of cost on first come first serve basis, if the user agency is willing to bear transportation cost" [S9] p.4.

**App rule (our design choice):** IF the project is up to ₹1.40 lakh THEN tell the user that no official design was found at this size, and suggest getting a vendor quote for a manual press before applying.

Loan at the ceiling, if a design is found:
- Project ₹1,40,000 [S1] → at most 90% = ₹1,26,000 → capped at ₹1,25,000 [S1].
- Own share **at least** ₹15,000 [S1].

### 2b. Term Loan size (the UP profile's unit)

| # | Item | ₹ lakh | Tag |
|---|---|---|---|
| 1 | Capital expenditure (machines, shed; no breakdown) | 30.48 | [S5] p.6 ("Capital Expenditure 30.48") |
| 2 | Year-1 working capital: inventory 6.96 + debtors 7.34 − creditors 5.50 | ESTIMATE **8.80** | [S5] p.4 |
| | **Basis A: what the money is spent on** | ESTIMATE 30.48 + 8.80 = **39.28** | [S5] |
| | **Basis B: money brought in** (capital + term loan + working-capital loan) | ESTIMATE 9.80 + 21.50 + 5.00 = **36.30** | [S5] pp.4, 6 |

**NSFDC Term Loan on this unit:**

| Basis | Loan: at most 90% [S1], below the ₹45 lakh cap [S1] | Own share: **at least** |
|---|---|---|
| A | ESTIMATE 0.9 × 39.28 = **₹35.352 lakh** | ESTIMATE ₹3.928 lakh |
| B | ESTIMATE 0.9 × 36.30 = ₹32.67 lakh | ESTIMATE ₹3.63 lakh |

- The app should use Basis A (our design choice: it is safer for the borrower).
- The profile itself puts in own capital of 9.80. That is ESTIMATE 9.80 ÷ (9.80 + 21.50) = 31.3% of the capital plus term loan (the build-stage total, including creditors and provisions, is 31.80) [S5] p.4. NSFDC needs only **at least 10%** [S1].
- The profile's bank interest works out to about ESTIMATE 2.34 ÷ 21.50 = 10.9% on the term loan [S5] pp.4–5. NSFDC's Term Loan is "8% p.a." [S1].

---

## 3. OpEx & working capital

**Monthly operating cost, Term Loan size** (year 1 [S5] p.5):

| Cost | ₹ lakh / year | Tag |
|---|---|---|
| Raw Material & Consumable | 69.58 | [S5] p.5 |
| Power Expense | 5.94 | [S5] p.5 |
| Repair & Maintenance | 0.29 | [S5] p.5 |
| Wages & Salary | 13.86 | [S5] p.5 |
| Factory Expenses | 1.10 | [S5] p.5 |
| Salary to Staff | 10.80 | [S5] p.5 |
| Selling & Administrative Expenses | 3.30 | [S5] p.5 |
| **Total cash OpEx** (cost of production 90.77 + staff 10.80 + selling 3.30) | ESTIMATE **104.87 / year = 8.739 / month** | [S5] p.5 |

**Ash cost.** The raw-material line does not split out ash, cement, lime or sand: NOT FOUND. If the unit buys reserved ash through a limited auction, the floor price is "50 % of the lowest price of the ash discovered by the TPP in the last ‘Open Auction’ … subject to a minimum floor price (Reserved Price) of Rs 1.00 (one) per Metric Tonne (MT)" [S9] p.3. Transport cost: NOT FOUND.

**Working-capital cycle (days)** (year 1):

| Stage | Days | Tag |
|---|---|---|
| Finished bricks in stock ("Inventory 6.96") | ESTIMATE 6.96 ÷ 90.77 × 365 = **28.0** | [S5] pp.4–5 |
| Customer credit ("Sundry Debtors 7.34") | ESTIMATE 7.34 ÷ 110.16 × 365 = **24.3** | [S5] pp.4–5 |
| Less: supplier credit ("Sundry Creditors 5.50") | ESTIMATE 5.50 ÷ 69.58 × 365 = **28.9** | [S5] pp.4–5 |
| Curing time ("Curing time ties up cash", framework key risk) | NOT FOUND (days of curing) | — |
| **Net cycle** | **ESTIMATE 28.0 + 24.3 − 28.9 = 23.4** | — |

**Formula** (framework G11): `Working capital = (sum of cycle days ÷ 30) × monthly OpEx`

| Version | Working capital | Tag |
|---|---|---|
| Net of supplier credit | ESTIMATE (23.4 ÷ 30) × 8.739 = **₹6.82 lakh** | — |
| Gross (no supplier credit) | ESTIMATE (52.3 ÷ 30) × 8.739 = ₹15.23 lakh | — |
| Profile's own figure | ESTIMATE inventory 6.96 + debtors 7.34 − creditors 5.50 = **₹8.80 lakh**, funded partly by "Working Capital Loan 5.00" | [S5] p.4 |

**App rule (our design choice):** use the profile's net ₹8.80 lakh, and never use the gross figure as the amount to borrow.

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Sales, year 1 | "Gross Sale (Fly Ash Bricks) 110.16" lakh | [S5] p.5 |
| Raw material as share of sales | ESTIMATE 69.58 ÷ 110.16 = **63.2%** | [S5] p.5 |
| Gross margin, year 1 | "23.92%" | [S5] p.5 |
| Profit after tax, year 1 | "2.22" lakh, "2.02%" of sales | [S5] p.5 |
| Effect of the 60% interest error (illustration only) | NSFDC's 8% is a term-loan rate, used here only for illustration. If working-capital interest were 8% [S1] instead: ESTIMATE 5.00 × 8% = 0.40 instead of 3.00, so profit before tax rises by ESTIMATE 3.00 − 0.40 = 2.60 lakh | [S1][S5] |
| Price per brick | NOT FOUND. For mandated projects, the legal ceiling is the CPWD/PWD Schedule of Rates, or the "price of alternative products, if not mentioned in the Schedule of Rates" [S8] p.30. Neither was opened ⚠ | — |
| Bricks per day (capacity) | NOT FOUND (the profile gives none) | — |
| Break-even | NOT FOUND | — |

**Regional purchasing power.** HCES 2023-24 rural MPCE (Statement 7, Rural column) [S13] p.12:

| State | Rural MPCE (₹) | Ratio to all-India (ESTIMATE ÷ 4,122) |
|---|---|---|
| UP | 3,481 | 0.84 |
| Bihar | 3,670 | 0.89 |
| MP | 3,441 | 0.83 |
| Rajasthan | 4,510 | 1.09 |
| Maharashtra | 4,145 | 1.01 |
| All-India | 4,122 | 1.00 |

These are the Section I figures. "‘MPCE estimates with imputation’ are presented in Section II" [S13] p.4.

**Pricing strategy (our design choice).**
- For mandated buyers, price at or below the CPWD/PWD Schedule of Rates [S8] p.30.
- For private rural buyers in States with a ratio below 1.0, compete on price against clay bricks. The clay-brick price is NOT FOUND.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |
| Reason | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

- No official monthly series was found. Building work, and so brick demand, likely slows in the monsoon, but no source gives a number.
- **Ash buying is planned yearly, before the financial year.** Power plants "invite bids on annual basis or for longer period but not more than three years" and start "at least 4 months before the end of current financial year" [S9] p.2. So bids open around **November** or earlier for supply from April (ESTIMATE: 4 months before 31 March). The limited auction for MSEs is held "annually" [S9] p.3.
- **Lean-month stress factor: NOT FOUND.**
- **G9 fails until our field survey fills this row.** Survey question: "In which months do you sell the most and the fewest bricks?"

---

## 6. Compliance

All rows were opened on 09 Nov 2026 unless marked ⚠.

| Rule | Law & section | Trigger | Threshold | Govt fee | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — | — |
| **Pollution: without boiler** | CPCB directions, 12.02.2025 | Fly-ash brick making, no boiler | **Green**, pollution index 25.0 | NOT FOUND | SPCB | "7.2 Fly ash bricks/ block manufacturing (without boiler)" … "25.0 Green" | [S7] p.3 | The index of 25.0 is within "upto 25" [S10] p.8, but the White exemption covers only sectors "as listed in the Schedule" [S10] p.8, and fly-ash bricks are **not** in the 2026 White Schedule (our check of [S10]). So it stays **Green** nationally (our reading) |
| **Pollution: with boiler** (e.g. steam curing) | CPCB list | Fly-ash brick making with a boiler | **Orange**, pollution index 75.0 | NOT FOUND | SPCB | "7.1 Fly ash bricks/ block manufacturing (with boiler)" … "75.0 Orange" | [S7] p.3 | App rule (our design choice): IF a boiler or steam curing is used THEN show Orange |
| White list history | — | — | The Nov 2024 White Schedule listed "16. Fly ash bricks/ block manufacturing" [S10] p.4. The later Schedules (from 28.07.2025) do not list it [S10] | — | — | as quoted | [S10] p.4 | So fly-ash bricks **lost** national White status in 2025 (our reading of [S10]) |
| Cement blocks and tiles, small scale (if the unit makes cement-based blocks) | CPCB list; 2026 Schedule | Under 1 tonne a day | **White** (0.0) | — | SPCB | "193.0 Cement products (without using Asbestos) like pipe, pillar, jafri, well ring, blocks/tiles etc. (<1 TPD)" … "0.0 White" [S7] p.50; 2026 Schedule item "60. Cement products (without using asbestos) like pipe, pillar, jafri, well ring, blocks or tiles etc. (<1" [S10] p.27 | [S7] p.50; [S10] p.27 | Larger precast units without steam curing are **Green** (30.6): "32.0 Manufacturing of precast cement products (without using asbestos/ boiler / steam curing)" [S7] p.8 |
| Pollution: Maharashtra | MPCB circular, 16.06.2025 ("new or left-over White category industries") | On the State list | **White**: item 66 "Fly ash bricks / block manufacturing units" | NOT FOUND | MPCB | "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | [S11] pp.1, 4 | The boiler condition is not stated in the MPCB item ⚠. The circular rests on the "Notification dated 12/11/2024" and its SOP [S11] p.1, whose Schedule (then) listed fly-ash bricks; the national list has changed since ⚠. UP, Bihar, MP, Rajasthan State lists: ⚠ not opened. **Note:** Maharashtra's own White list does not by itself give the central written-intimation exemption, which covers only sectors named in the central Schedule [S10] p.8 (our reading) |
| **Ash use: products must meet standards** | Ash Notification S.O. 5481(E), para B(9) | Making ash-based products | — | — | CPCB, SPCB/PCC and the "District Magistrate" [S8] p.18 | "Manufacturing of ash based products and use of ash in such products shall be in accordance with specifications and guidelines laid down by the Bureau of Indian Standards, Indian Road Congress, and Central Pollution Control Board." | [S8] p.17 | The BIS standard number and whether it is mandatory: NOT FOUND ⚠ |
| **Ash users: penalties and reporting** | Ash Notification paras C(5), C(6), E | Buying or using ash | — | — | SPCB / PCC; enforcement also by "District Magistrate" [S8] p.18 | C(5): users must use ash "in an eco-friendly manner", or "an environmental compensation of Rs. 1500 or per ton shall be imposed by State Pollution Control Board (SPCB) or Pollution Control Committee (PCC)" [S8] p.17. C(6): user agencies that fall short "shall be liable to pay Rs. 1500 per ton of ash", and for building projects "the environmental compensation on building constructions shall be levied at Rs.75/- per square feet of built up area of construction" [S8] p.17 | [S8] pp.17–18 | The Rs.75 per sq ft penalty on non-complying buildings is a **sales argument** for the maker (our reading). Exact reporting and audit duties for small users: NOT FOUND ⚠ |
| **Buying reserved ash (limited auction)** | MoP guidelines 15.03.2024 under para D(4) of the notification | Buying dry fly ash from a power plant | Bid in lots of "50 tonnes" or more | Price set by auction; floor "50 %" of the last open-auction price, minimum "Rs 1.00 (one) per Metric Tonne" | Power plant; SPCB verifies use | "Limited auction of Reserved Quantity shall be conducted among Micro and Small Enterprises having valid “Consent to Operate”(CTO) issued by CPCB/SPCBs if applicable or with a valid MSE registration." | [S9] pp.2–3 | So the user needs a **Consent to Operate** (if applicable) **or Udyam/MSE registration** to bid. "The Concerned Pollution Control Board shall verify that ash issued to Micro and Small Enterprises is being utilized to make ash-based products" [S9] p.3 |
| **Consent to Establish and Consent to Operate** (Green unit) | Water Act / Air Act consent (sections NOT FOUND in our sources) | Green category (no boiler) [S7] p.3 | — | NOT FOUND | SPCB | The MoP auction needs a "valid “Consent to Operate”(CTO) issued by CPCB/SPCBs if applicable or with a valid MSE registration" [S9] p.3. What "if applicable" means is NOT FOUND ⚠ | [S9] p.3 | **App rule (our design choice):** tell a Green unit to get SPCB consent first, and to keep Udyam registration as well |
| White: no consent, written intimation (listed White sectors only) | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) [S10] p.8. Water Act s.25 proviso: G.S.R. 703(E) 12.11.2024, para (a) replaced by G.S.R. 511(E) [S12] p.8. Both dated "28th July, 2025" on p.8; later notes give "29th July, 2025" ⚠. Schedules replaced by G.S.R. 761(E) [S10] p.16 / 762(E) [S12] p.16 (17.10.2025), then by G.S.R. 598(E) [S10] p.25 / 599(E) [S12] p.24 (08.07.2026) | Listed White sector | Pollution index **up to 25, and only if the sector is named in the Schedule**. A score of 25 or less alone does not exempt (e.g. Green rows scored 25.0 are not exempt) | — | SPCB | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees" | [S10] p.8; [S12] p.8 | Fly-ash bricks are not in the national White Schedule (above) |
| **GST registration** | CGST Act s.22(1) | Aggregate turnover in a year | ₹20 lakh; ₹10 lakh in "special category States" | NOT FOUND | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees" | [S14] pp.49–50 | Special category = Article 279A(4)(g) States minus "Jammu and Kashmir" and "Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand" [S14] p.51. None of our 5 States is named. Article 279A list not opened ⚠ |
| GST ₹40 lakh goods-only limit | Notification 10/2019-CT | Only for "exclusive supply of goods" | ₹40 lakh | — | CBIC | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | [S15] | A brick maker selling only bricks is very likely "exclusively" a goods supplier (our reading). The profile's year-1 sales of 110.16 lakh [S5] are far above both limits, so it must register. Not available in "Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Telangana, Tripura, Uttarakhand" [S15] |
| GST: inter-State supply | CGST Act s.24(i) | Any inter-State taxable supply | Registration compulsory | — | CBIC | "persons making any inter-State taxable supply" | [S14] p.51 | — |
| Udyam / MSE registration | MSMED Act (section NOT FOUND) | One of the two routes into the limited auction ("with a valid MSE registration"); it does not replace SPCB consent for a Green unit (our reading) [S9] p.3 | NOT FOUND | NOT FOUND ⚠ | MoMSME | "with a valid MSE registration" | [S9] p.3 | — |
| Shops & Establishments / panchayat licence | State Acts | Premises | NOT FOUND | NOT FOUND | State labour dept / panchayat | NOT FOUND | ⚠ | NOT FOUND |
| Electricity connection | State supply code | Press and mixer load | NOT FOUND | NOT FOUND | DISCOM | NOT FOUND | ⚠ | NOT FOUND |

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
| Repayment | "quarterly installments within 3 years (including a 3-month moratorium)" [S1] | "within 7 years (including a 6-month moratorium, which is extended to 12 months for plantation and construction activities)" [S1]. Whether brick making counts as "construction" for the 12-month moratorium: NOT FOUND ⚠ |
| Who | SC with a valid caste certificate; "Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026)" [S1]. "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold" [S1] | same [S1] |
| Fits D22? | Probably not (§2a) | Yes: the §2b unit (ESTIMATE ₹39.28 lakh) is under ₹50 lakh, and its loan of ₹35.352 lakh is under the ₹45 lakh cap [S1][S5] |

**Women.** "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries." [S1]

**Watch the channel.** Two other NSFDC schemes cover smaller project sizes at higher interest [S1]:

| NSFDC scheme | Project size | Channel | Interest | Tag |
|---|---|---|---|---|
| Aajeevika Micro-Finance Yojana (AMY) | "projects costing up to ₹1.40 lakh" | NBFC-MFIs | "15% p.a." | [S1] |
| Udyam Nidhi Yojana (UNY) | "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh" | "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a." | 13% / 15% | [S1] |

**App rules (our design choice):**
- Quote 8% only for the Term Loan "Implemented via SCAs/CAs." [S1].
- IF the lender is an MFI, cooperative bank or small finance bank THEN warn: "This may be AMY or UNY at 13–15%." [S1]
- IF the lender is a public sector bank or regional rural bank THEN say: "Confirm the rate." NSFDC's partners include "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)", and "rates vary slightly by scheme and channelizing agency" [S1].

**Two more NSFDC services** [S1]:

| Service | What it is | Tag |
|---|---|---|
| Online application | "Online Mode (PM-SURAJ Portal)" | [S1] |
| Free skill training | "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period" | [S1] |

**How to apply** [S1]:
- NSFDC does not take applications directly: "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."
- Offline applications go with "a valid caste certificate, income proof, KYC documents" and the agency's checklist.

Note: [S1] is a MoSJE development-site copy (devmosje.negd.in). Confirm on nsfdc.nic.in ⚠.

### 7.2 Other schemes and supports

| Scheme | Who qualifies | Min. size | Benefit | Own share | Period / open now? | Negative list | Combine with NSFDC loan? | Tag |
|---|---|---|---|---|---|---|---|---|
| **Reserved ash for small units (MoP limited auction)** | "Micro and Small Enterprises having valid “Consent to Operate”(CTO) issued by CPCB/SPCBs if applicable or with a valid MSE registration" | Bid of "50 tonnes" | Floor price "50 %" of the plant's lowest open-auction price, minimum "Rs 1.00 (one) per Metric Tonne"; "Reserved Quantity" is 1.10 times the highest past MSE quantity, or "20% (twenty per cent) of issuable quantity" in the first year | — | Bids invited "on annual basis or for longer period but not more than three years", "at least 4 months before the end of current financial year"; guidelines dated 15.03.2024 | — | Not a loan, so no conflict found (our reading) | [S9] pp.2–3 |
| **PMEGP** | Any individual above 18; "There will be no income ceiling"; new projects only; "Projects without Capital Expenditure are not eligible"; "The ‘Family’ includes self and spouse." | NOT FOUND | Subsidy for "Special (including SC…)": 25% urban, **35% rural** | **5%** | Undated summary (2022-11 web folder). **Status after March 2026: NOT FOUND** | Pre-revision list does not name bricks in its readable text ⚠ | **Unclear ⚠.** "the units that have already availed Government Subsidy under any other scheme… are not eligible"; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks" | [S16] pp.2–3; [S17] p.23 |
| **PMEGP and NSFDC together** | PMEGP lists its financing institutions as "All Public Sector Banks", "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI" and "Small Industries Development Bank of India (SIDBI)". **NSFDC and SCAs are not listed**; the implementing agencies name "National Scheduled Tribes Finance and Development Corporation (NSTFDC)" but not NSFDC. Also: "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" are not eligible | — | — | — | — | — | **So the PMEGP bank loan cannot be the NSFDC loan, and a unit already set up with an NSFDC (Government of India) loan is likely shut out of a PMEGP first loan** (our reading) ⚠ | [S16] pp.3–5 |
| PMEGP bank terms and limits | — | — | "95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years" (the bank's own rate, not NSFDC's 6.5%/8% [S1]). Manufacturing cap "Rs. 50.00 lakh". Working capital "not be more than 40%". Capital per worker "does not exceed Rs. 3 lakh in Plain areas" | — | — | — | — | [S16] pp.2, 5–6 |
| PMEGP check on the §2b unit | — | — | Working capital: ESTIMATE 8.80 ÷ 39.28 = 22.4%, within 40% [S16]. Capital per worker: ESTIMATE 30.48 ÷ 3 lakh = at least 11 full-time workers needed (30.48 ÷ 10 = 3.05 > 3). The worker count in the profile: NOT FOUND | — | — | — | — | [S5][S16] |
| **PM Vishwakarma** | Must be "Engaged in one of the mentioned 18 family-based traditional trades" [S18] p.3 | — | — | — | — | — | Machine brick-making is not a family-based traditional trade (our reading). **Does NOT fit** ⚠ | [S18] p.3 |
| **MUDRA** | Tiers NOT FOUND this session (mudra.org.in did not open ⚠) | — | — | — | — | — | NOT FOUND | ⚠ |
| Other schemes on the UP portal page | Listed on the UP page: NOT FOUND in our extract ⚠ | — | — | — | — | — | — | [S6] |

**When D22 does NOT fit:**
- Micro size: no official design under ₹1.40 lakh (our reading). The limited auction has a "50 tonnes" bid threshold [S9] p.2, though leftover ash can be lifted free on a first-come basis if the user pays transport [S9] p.4.
- PM Vishwakarma: not a traditional trade (our reading of [S18] p.3).
- Pollution: a unit with a boiler or steam curing is **Orange** [S7] p.3.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Curing time ties up cash (framework key risk) | NOT FOUND (curing days) | Stock of unsold bricks grows | Ask curing days in the survey; until then use the 28 days of stock from the profile | ESTIMATE 28.0 days [S5] |
| Ash supply: no tie-up with a power plant | High (our judgement) | No limited-auction allocation; the plant's daily ash data shows none available. Plants must "provide real time data on daily basis of availability of ash" via the CPCB portal or app "for the benefit of actual user(s)" [S8] p.15 | IF there is no ash tie-up THEN warn before the loan, and point the user to the CPCB ash portal | [S8] p.15; [S9] p.3 |
| A served notice is refused | Medium (our judgement) | Buyer replies that they are "already tied up" [S8] p.27 | Do not count notices as sales in the forecast (our design choice) | [S8] p.27 |
| Distance to a power plant (transport cost; outside the 300 km mandate) | High (our judgement) | More than 300 km to the nearest plant | IF more than 300 km THEN drop the mandate as a demand driver | [S8] p.30; distance data NOT FOUND ⚠ |
| Thin margin | High (our judgement) | Profit after tax "2.02%" of sales in year 1 [S5] | Stress-test the EMI at year-1 sales; correct the 60% interest error first (§4) | [S5] p.5 |
| Single-buyer dependence (one government project or one contractor) | High (our judgement) | One buyer is more than half of sales | IF one buyer is more than 50% of sales THEN warn and stress-test the EMI without them | Threshold is our design choice |
| Price cap for mandated buyers | Medium | CPWD/PWD rate below cost | Compare cost per brick with the Schedule of Rates ⚠ | [S8] p.30 |
| Wrong pollution category (boiler → Orange) | Medium | Plans steam curing | See §6 | [S7] p.3 |

**SWOT (both sizes).**

| | Micro Finance (≤ ₹1.40 lakh) [S1] | Term Loan (UP profile unit, ₹39.28 lakh) [S1][S5] |
|---|---|---|
| Strengths | — | Legal demand within 300 km of power plants [S8]; reserved cheap ash for MSEs [S9]; Green (not Orange) without a boiler [S7] |
| Weaknesses | No official design at this size | Thin 2.02% margin [S5]; profile errors (§2) |
| Opportunities | — | Written notices to mandated builders [S8] p.30; NSFDC 8% vs the profile's ~10.9% [S1][S5] |
| Threats | — | Price cap at CPWD/PWD rates [S8]; ash-supply tie-up; transport distance |

**Competitor density in a block.** No official block-level count was found. Options, in order:
1. The SPCB's list of consented fly-ash brick units ⚠ (not opened).
2. The nearest power plant's list of limited-auction bidders ⚠.
3. Field count (our survey).

---

## Source log

| Tag | Title | Issuer | URL (deep link) | Exact words used | Date opened | Saved copy |
|---|---|---|---|---|---|---|
| S1 | FAQ – National Scheduled Castes Finance and Development Corporation | MoSJE (dev-site copy) | https://devmosje.negd.in/?p=15629 | "units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a."; "more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a."; "In all schemes, NSFDC provides up to 90% of the project cost."; "Implemented via SCAs/CAs."; "at an interest rate of 15% p.a."; "including a 6-month moratorium, which is extended to 12 months for plantation and construction activities"; "(applicable to both rural and urban areas, effective January 7, 2026)"; "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh"; "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a."; "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)"; "rates vary slightly by scheme and channelizing agency"; "Online Mode (PM-SURAJ Portal)"; "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold"; "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries."; "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."; "a valid caste certificate, income proof, KYC documents"; "Annual family income from all sources must not exceed ₹5.00 Lakhs" | 09 Nov 2026 | _shared/NSFDC_devmosje_p15629.html |
| S2 | National Industrial Classification 2008, pp.67–68 | MoSPI | https://mospi.gov.in/sites/default/files/main_menu/national_industrial_classification/nic_2008_17apr09.pdf | "23952 Manufacture of articles articles of concrete, cement or artificial stone (tiles, bricks etc.)"; "23921 Manufacture of bricks" | 09 Nov 2026 | _shared/NIC_2008.pdf |
| S3 | National Industrial Classification 2025, p.100 | MoSPI | https://mospi.gov.in/uploads/publications_reports/publications_reports1763457214315_c3e5d4f3-8e25-4775-85e3-ad42d571652f_NIC_2025_Final.pdf | "239508 Manufacture of bricks, blocks, tiles and similar products of fly ash" | 09 Nov 2026 | _shared/NIC_2025.pdf |
| S4 | Fact sheet ASUSE 2025, p.6 | MoSPI | https://www.mospi.gov.in/uploads/latestreleasesfiles/1777360756062-publications_reports1774347275480_658da785-11e1-4df3-9f02-27e08a8675f6_Factsheet_ASUSE_2025-f.pdf | "3,97,477"; "4,24,139" | 09 Nov 2026 | _shared/ASUSE_2025_Factsheet.pdf |
| S5 | Project Report of Fly Ash Bricks, pp.2–6 (undated) | UP MSME 1-Connect portal, Government of Uttar Pradesh | https://msme1connect.up.gov.in/Projectreport/Project%20Report638665937188045712.pdf | "We can modify the project capacity and project cost as per your requirement."; "Addition in Capital 9.80"; "Term Loan From Bank 21.50"; "Working Capital Loan - 5.00"; "Closing Capital 9.80 11.58"; "Gross Block 30.48"; "Sundry Debtors - 7.34"; "Inventory - 6.96"; "Sundry Creditors 0.30 5.50"; "TOTAL : 31.80 42.63"; "Gross Sale (Fly Ash Bricks) 110.16"; "Raw Material & Consumable 69.58"; "Power Expense 5.94"; "Repair & Maintenance 0.29"; "Wages & Salary 13.86"; "Factory Expenses 1.10"; "COST OF PRODUCTION 90.77"; "Less : Cl. Fin. Goods 6.96"; "TOTAL (B) 83.81"; "GROSS PROFIT (A-B) 26.35"; "23.92%"; "Salary to Staff 10.80"; "Selling & Adminsitrative Expenses 3.30"; "Interest on Term Loan 2.34"; "Interest on Working Capital Loan 3.00"; "Depreciation 4.13"; "TOTAL (D) 23.57"; "NET PROFIT (C-D) 2.78"; "LESS : TAXES 0.56"; "PROFIT AFTER TAX 2.22"; "2.02%"; "Capital Expenditure 30.48" | 09 Nov 2026 | D22/UP_MSME_Fly_Ash_Bricks.pdf |
| S6 | Business category page "Fly Ash Bricks" (Id 22) | UP MSME 1-Connect portal | https://msme1connect.up.gov.in/Home/BusinessDetails?Id=22 | "Fly Ash Bricks" | 09 Nov 2026 | D22/UP_MSME_BusinessDetails_22.html |
| S7 | List of Sectors Classified by Central Pollution Control Board (As on 24th August 2026), pp.3, 8, 50 | CPCB | https://cpcb.gov.in/uploads/Sectors_Classified_by_CPCB.pdf | "7.1 Fly ash bricks/ block manufacturing (with boiler)"; "75.0 Orange"; "7.2 Fly ash bricks/ block manufacturing (without boiler)"; "25.0 Green"; "193.0 Cement products (without using Asbestos) like pipe, pillar, jafri, well ring, blocks/tiles etc. (<1 TPD)"; "0.0 White"; "32.0 Manufacturing of precast cement products (without using asbestos/ boiler / steam curing)"; "30.6 Green" | 09 Nov 2026 | _shared/CPCB_Sectors_Classified.pdf |
| S8 | Ash Utilisation Notification S.O. 5481(E) 31.12.2021, with amendments S.O. 6169(E) 30.12.2022 and S.O. 05(E) 01.01.2024 (compiled), pp.13, 15, 17–18, 27, 30–31 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/flyash/Ash_Notification_dated_31.12.2021.pdf | "Fly ash based products viz. bricks, blocks, tiles"; "Manufacturing of ash based products and use of ash in such products shall be in accordance with specifications and guidelines laid down by the Bureau of Indian Standards, Indian Road Congress, and Central Pollution Control Board."; "All building construction projects (Central, State and Local authorities, Govt. undertakings, other Govt. agencies and all private agencies) located within a radius of 300 kms from a coal or lignite based thermal power plant shall use ash bricks, tiles, sintered ash aggregate or other ash based products, provided these are made available at prices not more than the price mentioned in the Schedule of Rates as specified by the Central Public Works Department (CPWD) or Public Works Department (PWD) of the State concerned"; "The manufacturers of ash bricks or tiles or sintered ash aggregate or other ash-based products shall give a written notice to persons or agencies who are required to utilise ash-based products under sub-paragraph (8) of paragraph B for offering for sale of such products with a copy to concerned State Pollution Control Board."; "All local authorities shall make provisions in their respective building bye-laws and other relevant regulations for the use of ash and ash-based products, such as bricks, blocks, tiles"; "reserve certain percentage of ash for supply to all micro and small enterprises engaged in ash-based"; "New Delhi, the 1st January, 2024"; "or price of alternative products, if not mentioned in the Schedule of Rates."; "shall publish the Schedule of Rates specified within six months from the 1st January, 2024"; "have already tied up with other agencies"; "if they cannot use ash based products, or may"; "use reduced quantity"; "there is a need to conserve top soil by promoting manufacture and mandating use of ash based"; "an environmental compensation of Rs. 1500 or per"; "ton shall be imposed by State Pollution Control Board (SPCB) or Pollution Control Committee (PCC)"; "liable to pay Rs. 1500 per ton of ash"; "the environmental compensation on building constructions shall be levied at Rs.75/- per square"; "feet of built up area of construction"; "District Magistrate"; "provide real time data on daily basis of availability of ash"; "for the benefit of actual user(s)" | 09 Nov 2026 | D22/Ash_Notification_31122021.pdf |
| S9 | Guidelines for coal or lignite based TPPs to utilise ash by providing it to user agencies, No. 9/8/2024-St. Th., 15.03.2024, pp.1–4 (scanned) | Ministry of Power via CPCB | https://cpcb.gov.in/uploads/flyash/MoP_Guidelines_dated_15-03-2024_for_TPPs_for_Ash_Utilization.pdf | "New Delhi, 15th March, 2024"; "For Micro and Small Enterprises the bid threshold shall be 50"; "tonnes."; "TPP shall reserve"; "20% (twenty per cent) of issuable quantity for first year of limited"; "auction for Micro and Small Enterprises shall be 50 % of the lowest"; "price of the ash discovered by the TPP in the last ‘Open Auction’ of"; "(Reserved Price) of Rs 1.00 (one) per Metric Tonne (MT)."; "auction annually exclusively for Micro and Small Enterprises engaged"; "Micro and Small Enterprises having valid “Consent to Operate”(CTO)"; "issued by CPCB/SPCBs if applicable or with a valid MSE registration."; "The Concerned Pollution Control Board shall verify that ash issued to"; "invite bids on annual basis or for longer period"; "but not more than three years"; "at least 4 months before the end of current financial year"; "Expression of Interest (EOI) for"; "lifting ash on ‘as is where is’ basis, to be given free of cost on first"; "come first serve basis, if the user agency is willing to bear"; "transportation cost." | 09 Nov 2026 | D22/MoP_Guidelines_15032024_Ash.pdf; OCR text: D22/MoP_Guidelines_15032024_Ash.ocr.txt |
| S10 | MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 512(E) 28.07.2025 and G.S.R. 598(E) 08.07.2026, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_airact.pdf | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; "16. Fly ash bricks/ block manufacturing"; "60. Cement products (without using asbestos) like pipe, pillar, jafri, well ring, blocks or tiles etc. (<1"; "G.S.R. 761(E)"; "New Delhi, the 8th July, 2026"; "G.S.R. 598(E)"; "29th July, 2025"; "G.S.R. 761(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_airact.pdf |
| S11 | Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 4 | Maharashtra Pollution Control Board | https://mpcb.gov.in/sites/default/files/standing_orders/Circular_White_Category_MPCB_16062025.pdf | "new or left-over White category industries"; "Fly ash bricks / block manufacturing units"; "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board"; "Notification dated 12/11/2024" | 09 Nov 2026 | _shared/MPCB_White_Circular_16062025.pdf |
| S12 | MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendment G.S.R. 511(E) 28.07.2025, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_wateract.pdf | "G.S.R. 511(E)"; "all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed"; "G.S.R. 599(E)"; "G.S.R. 762(E)"; "G.S.R. 511(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_wateract.pdf |
| S13 | Fact Sheet on HCES 2023-24, pp.4, 12 | MoSPI | https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf | "Statement 7: Average MPCE for each State/UT in 2023-24"; "‘MPCE estimates with imputation’ are presented in Section II" | 09 Nov 2026 | _shared/HCES_FactSheet_2023-24.pdf |
| S14 | CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 | CBIC | https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees"; "the expression ―special category States‖ shall mean the States as specified"; "Arunachal Pradesh, Assam, Himachal Pradesh"; "persons making any inter-State taxable supply" | 09 Nov 2026 | _shared/CGST_Act_updated_31082021.pdf |
| S15 | Notification No. 10/2019-Central Tax | Ministry of Finance | https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees"; "Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Telangana, Tripura, Uttarakhand" | 09 Nov 2026 | _shared/GST_Notfn_10_2019_CT.pdf |
| S16 | Salient Features of Revised PMEGP, pp.2–6 (undated; web folder 2022-11) | Delhi Khadi & Village Industries Board | https://dkvib.delhi.gov.in/sites/default/files/2022-11/salient-features-of-revised-ppmegp.pdf | Special category "05%" own, "25%" urban, "35%" rural; "manufacturing sector is Rs. 50.00 lakh"; "There will be no income ceiling"; "the units that have already availed Government Subsidy under any other scheme of Government of India or State Government are not eligible"; "Projects without Capital Expenditure are not eligible for Financing under the scheme."; "The ‘Family’ includes self and spouse."; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks."; "95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years"; "not be more than 40%"; "does not exceed Rs. 3 lakh in Plain areas"; "All Public Sector Banks."; "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI."; "Small Industries Development Bank of India (SIDBI)."; "National Scheduled Tribes Finance and Development Corporation (NSTFDC)"; "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" | 09 Nov 2026 | _shared/PMEGP_Revised_Salient_DelhiKVIB.pdf |
| S17 | Guidelines on PMEGP (pre-revision scan), p.23, Para 29 | KVIC copy on a Government server | https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2023/03/2023031676.pdf | "Negative List of Activities"; "The following list of activities will not be permitted under PMEGP" | 09 Nov 2026 | _shared/PMEGP_Guidelines_s3waas_2023-03.pdf |
| S18 | PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), p.3 | PIB | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc2025916638501.pdf | "Engaged in one of the mentioned 18 family-based traditional trades" | 09 Nov 2026 | _shared/PM_Vishwakarma_PIB_Sep2025.pdf |

## Quality gates (researcher)

| Gate | Result |
|---|---|
| G1 Every number tagged | Pass, per the check script |
| G3 FSSAI | Not applicable (no food) |
| G4 GST | Pass: ₹40 lakh for a goods-only maker (our reading); the profile unit's sales exceed it, so it must register |
| G5 Pollution category | **Pass with ⚠**: Green without a boiler, Orange with one [S7] (framework ⚠ confirmed). Fly-ash bricks were White in the Nov 2024 Schedule but dropped in 2025 [S10]. White in Maharashtra [S11], on a circular based on the 2024 list ⚠. Small cement-block units under 1 TPD are White [S7][S10] |
| G6 Scheme open | MoP limited auction is annual (2024 guidelines) [S9]. PMEGP after March 2026 NOT FOUND |
| G7 Scheme fit | Done. Micro size probably does not fit; PM Vishwakarma does not fit |
| G8 NSFDC tier first | Pass |
| G9 Seasonality | **Fail**: no source; needs field survey |
| G10 Working capital from cycle days | Pass (Term Loan): ESTIMATE ₹6.82 lakh net by formula; profile's net ₹8.80 lakh used by the app. Curing days NOT FOUND |
| G12 Biology | Not applicable |
