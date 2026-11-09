# D16 Motor Rewinding — sector dossier (SIH26091)

| Field | Value |
| --- | --- |
| Domain code | D16 |
| Short name | Motor_Rewinding |
| Domain | Pump motor rewinding & repair (3–15 HP pump motors) |
| Basket | B5 Machinery Workshop, Vehicle & Pump Repair (गैराज, मोटर वाइंडिंग एवं वेल्डिंग) |
| Unit to study | 3–15 HP pump motors (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

How to read this file. Every figure carries one of these tags:
[S#]: see the Source log at the end.
ESTIMATE: inputs and sum shown.
NOT FOUND
VENDOR QUOTE NEEDED
Rows marked ⚠ need Person D to open the page in a normal browser. Lines marked "our design choice" are app rules we chose, not facts. Nothing here comes from memory, blogs or news.
Sources that could not be opened on 09 Nov 2026 (the facts they hold are NOT FOUND here, not guessed):

| Site | What failed | What we lose |
| --- | --- | --- |
| mowr.nic.in, 6th Minor Irrigation Census Vol-1 (https://mowr.nic.in/core/WebsiteUpload/2023/MI6.pdf) | Server certificate chain incomplete | Number of pumps (the demand base) |
| micensus.gov.in | Gateway error | Same |
| pmvishwakarma.gov.in | Connection reset | Full trade list |
| mudra.org.in | Connection reset | — |
| kviconline.gov.in | Refused | PMEGP model profiles |
| dcmsme.gov.in | Certificate chain incomplete | MSME-DI profiles |
| ospcboard.odisha.gov.in | Connection reset | — |
| gstcouncil.gov.in, Notification 34/2023 | Refused | — |


## 1. Classification & market

| Item | Value | Tag |
| --- | --- | --- |
| NIC 2008 code, motor rewinding | 33140 "Repair of electrical equipment". Class 3314: "This class includes the repair and maintenance of goods of division 27, except those in class 2750 (domestic appliances)". Division 27 includes "Manufacture of electric motors, generators, transformers…" [S2] p.76 | [S2] pp.76, 92 |
| NIC 2025 code, motor rewinding | 331400 "Repair and maintenance of electrical equipment" | [S3] p.140 |
| NIC code, work on the pump itself (impeller, valves) | NIC 2008: 33122 "Repair and maintenance of pumps and related equipment, fluid power equipment, valves" [S2] p.91. NIC 2025: 331202 "Repair and maintenance of pumps and related equipment, fluid power equipment, valves" [S3] p.138. App rule (our design choice): use 33140 / 331400 if rewinding is the main income, and 33122 / 331202 if pump repair is | [S2] p.91; [S3] p.138 |
| Sector (MoSPI survey definition only) | MoSPI counts it as manufacturing: "This will also include those units which are primarily engaged in providing manufacturing services such as maintenance and repair of industrial, commercial and similar machinery and equipment." [S4] p.16. The same fact sheet also describes services as work where "the producer works directly on goods owned by the consumer by transporting, cleaning, repairing" [S4] p.17. These MoSPI survey definitions settle neither the GST treatment (§6) nor the PMEGP ₹50 lakh vs ₹20 lakh cap (§7). Both are ⚠ | [S4] pp.16–17 |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025), i.e. 397.5 lakh and 424.1 lakh | [S4] p.6 |
| Rural count of motor-rewinding units (NIC 33140 / 331400) | NOT FOUND (needs ASUSE unit-level data) | — |
| Number of electric pump sets / MI schemes, by State | NOT FOUND ⚠. Minor Irrigation Census site not opened (see above) | — |

Demand drivers. The UP Government MSME portal profile says:
"Motors are used as a prime mover for driving various machines and pump sets in industry, agriculture and domestic application" [S5] p.3.
"the winding is one of the main part of any motor. It gets damaged frequently due to wear and tear and needs rewinding" [S5] p.3.
Rural vs semi-urban. The same profile says that motor servicing and repair "is in great demand, especially in the semi-urban and rural areas" [S5] p.3. No number is given.
Demand within 5–10 km (formula for the app).
ESTIMATE: electric pump sets in the catchment [MI Census, NOT IN HAND ⚠] × burn-outs per pump per year [NOT FOUND] = rewinding jobs per year.
Both inputs are NOT FOUND. The app can show the formula, but no figure until D opens the MI Census and our field survey gives a burn-out rate.
Sales channels. No official source was found on how rural rewinders get work. These are questions for our field survey, not data:
walk-in farmers bringing a burnt motor
pump dealers and hardware shops passing on repair jobs
panchayat / drinking-water scheme motors
Underserved niches and how to spot them in a block.

| Niche | Why it may be open | How a user checks it | Tag |
| --- | --- | --- | --- |
| Villages far from any rewinding shop | Rural and semi-urban demand is "great" [S5] p.3, but shop locations are not published | Ask farmers how far they carry a burnt motor and how many days they wait | [S5] for the demand statement; distance NOT FOUND |
| Submersible pump repair | NOT FOUND | Ask pump dealers which motor types they cannot get repaired locally | — |
| Repair for drinking-water scheme pumps | NOT FOUND | Ask the gram panchayat who repairs its pumps now | — |


## 2. CapEx
Price source. The only official profile found is the UP Government MSME portal's "Electrical Motor Winding Unit" project report [S5].
It gives only totals in ₹ lakh, not a machine list. Machine prices are VENDOR QUOTE NEEDED.
It is undated. The file name holds a timestamp that decodes to 26 Oct 2024 (our reading; not printed in the file).
It carries a disclaimer: "The views expressed in this Project Report are advisory in nature." [S5] p.7
Errors found in the UP profile itself (do not copy these lines).

| Problem | Evidence | ESTIMATE |
| --- | --- | --- |
| Term-loan repayments exceed the loan | Loan "5.23"; repayments "1.31" (years 2–4) and "1.75" (year 5) [S5] p.4 | 1.31 × 3 + 1.75 = 5.68, which is 0.45 more than the 5.23 borrowed. The balance sheet shows the term loan at "- 0.45" in year 5 [S5] p.5 |
| Expense subtotal does not add up | "TOTAL (D+E)" is printed as "2.68" [S5] p.6 | 0.45 + 0.24 + 1.58 + 0.40 = 2.67. The label also leaves out line F, which the total includes. This is a rounding issue only; it does not change the net profit of 4.36 |

What the profile does add up correctly (checked):

| Line | Sum | Tag |
| --- | --- | --- |
| Year-1 cost of production | 9.90 + 0.43 + 0 + 3.43 + 0.59 + 0.40 = 14.75 | [S5] p.6 |
| Gross profit | 20.01 − 12.97 = 7.04 | [S5] p.6 |
| Net profit | 7.04 − 2.68 = 4.36 | [S5] p.6 |

Connected load and phase.
NOT FOUND. The profile prints no HP or kW figures.
Whether a rewinding shop needs a 3-phase supply (for example, to test a 3-phase pump motor after rewinding) is NOT FOUND. It needs the State DISCOM supply code ⚠ and a vendor quote for the test bench.
Where machines are made. NOT FOUND (the profile names no suppliers or hubs).
### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])
The item list is our design choice, not an official design. No official price exists for any line.

| # | Item | Spec | Qty | Unit price (₹) | Line total (₹) | Tag |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Coil winding machine (hand-operated) | — | 1 | VENDOR QUOTE NEEDED | — | — |
| 2 | Insulation tester and multimeter | — | 1 each | VENDOR QUOTE NEEDED | — | — |
| 3 | Bearing puller, hand tools, soldering set | — | 1 set | VENDOR QUOTE NEEDED | — | — |
| 4 | Varnish tank and drying arrangement | — | 1 | VENDOR QUOTE NEEDED | — | — |
| 5 | Test board (starter, cables) | 1-phase / 3-phase NOT FOUND | 1 | VENDOR QUOTE NEEDED | — | — |
| 6 | Pre-operative: Udyam, local licence, power connection deposit | — | — | — | NOT FOUND (see §6) | — |
| 7 | Working capital (copper wire, insulation paper, varnish, bearings) | — | — | — | See §3 | — |

Loan at the ceiling.
Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ₹1,26,000.
That is capped at ₹1,25,000 [S1].
Own share is at least 1,40,000 − 1,25,000 = ₹15,000 [S1]. That is more than 10% because the cap binds, and it is more again if the agency lends less than the maximum.
### 2b. Term Loan size (the UP profile's unit)
The profile prints no "project cost" line. Its year-1 cash-flow statement [S5] p.4 gives two different totals:

| # | Item | Value (₹ lakh) | Tag |
| --- | --- | --- | --- |
| 1 | Fixed assets (machinery etc.; no breakdown given) | 5.31 | [S5] p.4 ("Increase in Fixed Assets 5.31") |
| 2 | Stock | 2.27 | [S5] p.4 ("Increase in Stock 2.27") |
| 3 | Debtors | 0.67 | [S5] p.4 ("Increase in Debtors 0.67") |
| 4 | Deposits & advances | 2.50 | [S5] p.4 ("Increase in Deposits & Adv 2.50") |
|  | Basis A: what the money is spent on | ESTIMATE 5.31 + 2.27 + 0.67 + 2.50 = 10.75 (printed total "10.75") | [S5] p.4 |
| 5 | Basis B: money brought in from outside (share capital + term loan + cash credit) | ESTIMATE 0.85 + 5.23 + 2.44 = 8.52 | [S5] p.4 |
| 6 | Machine-by-machine list and prices | VENDOR QUOTE NEEDED | — |

The gap between A and B (ESTIMATE 10.75 − 8.52 = 2.23) is paid in the profile from year-1 "Reserve & Surplus 4.36", "Depriciation & Exp. W/off 0.59", "Increase in Creditors 0.23" and "Increase in Provisions 0.36" [S5] p.4. A new SC borrower would not have that profit before starting.
Basis A is the safer project cost for the app (our design choice).
What the "Deposits & Adv 2.50" are for (e.g. a power or rent deposit) is NOT FOUND.
Loan on this unit (NSFDC Term Loan), both bases:

| Basis | Project cost (₹ lakh) | Loan: at most 90% [S1], below the ₹45 lakh cap [S1] | Own share: at least | Tag |
| --- | --- | --- | --- | --- |
| A (spending) | 10.75 | ESTIMATE 0.9 × 10.75 = 9.675 | ESTIMATE 10.75 − 9.675 = 1.075 | [S1][S5] |
| B (outside funding) | 8.52 | ESTIMATE 0.9 × 8.52 = 7.668 | ESTIMATE 8.52 − 7.668 = 0.852 | [S1][S5] |

The profile itself assumes a bank term loan plus a cash-credit limit [S5] p.4, not NSFDC. Its interest lines can't be reused for NSFDC's 8% [S1].

## 3. OpEx & working capital
Monthly operating cost, Term Loan size. All values are from the UP profile, year 1 [S5] p.6.

| Cost (year 1) | ₹ lakh / year | ₹ lakh / month (ESTIMATE ÷ 12) | Tag |
| --- | --- | --- | --- |
| Raw material consumed | 9.90 | 0.825 | [S5] p.6 |
| Electricity | 0.43 | 0.0358 | [S5] p.6 |
| Labour & wages | 3.43 | 0.2858 | [S5] p.6 |
| Consumables and other expense | 0.40 | 0.0333 | [S5] p.6 |
| Salary to staff | 1.58 | 0.1317 | [S5] p.6 |
| Selling & admin expenses | 0.40 | 0.0333 | [S5] p.6 |
| Total cash OpEx (cost of production 14.75 − depreciation 0.59 + salary 1.58 + selling 0.40) | ESTIMATE 16.14 | ESTIMATE 1.345 | [S5] p.6 |

Repair & maintenance is "-" (nil) in year 1 [S5] p.6.
What the raw material is (copper wire, varnish, etc.) and its unit prices: NOT FOUND.
Micro Finance size: rent, electricity and materials are all NOT FOUND. A factory-style profile doesn't scale down to a one-person shop (SOP D5).
Working-capital cycle (days). These ESTIMATES come from the profile's year-1 figures [S5] pp.5–6.
The profile gives two different year-1 stock figures, so both are shown. Which one it meant is NOT FOUND.

| Stage | Days, version 1 (balance-sheet stock) | Days, version 2 (profit-statement closing stock) | Tag |
| --- | --- | --- | --- |
| Stock (materials + work in progress) | ESTIMATE "Stock in Hand 2.27" ÷ 14.75 cost of production × 365 = 56.2 | ESTIMATE "Closing Stock /WIP 1.78" ÷ 14.75 × 365 = 44.0 | [S5] pp.5–6 |
| Customer credit (udhaar / debtors) | ESTIMATE 0.67 debtors ÷ 20.01 sales × 365 = 12.2 | same, 12.2 | [S5] pp.5–6 |
| Sum of cycle days | ESTIMATE 56.2 + 12.2 = 68.4 | ESTIMATE 44.0 + 12.2 = 56.2 | — |

Formula (framework G11): Working capital = (sum of cycle days ÷ 30) × monthly OpEx
Version 1: ESTIMATE (68.4 ÷ 30) × 1.345 = ₹3.07 lakh (Term Loan size).
Version 2: ESTIMATE (56.2 ÷ 30) × 1.345 = ₹2.52 lakh.
The app should use the higher figure, ₹3.07 lakh (our design choice: it is safer for the borrower).
For comparison, the profile funds working capital with a cash-credit limit of "2.44" lakh [S5] p.4, plus creditors of "0.23" lakh [S5] p.5.
Micro size: cycle days NOT FOUND (field survey).

## 4. Unit economics & pricing

| Item | Value | Tag |
| --- | --- | --- |
| Rewinding charge per motor, by HP (3, 5, 7.5, 10, 15 HP) | NOT FOUND (no official price series) | — |
| Copper wire used per motor, by HP | NOT FOUND | — |
| Jobs per month | NOT FOUND (the profile gives no capacity) | — |
| Sales, year 1 (Term Loan unit) | ₹20.01 lakh | [S5] p.6 |
| Raw material as a share of sales, year 1 | ESTIMATE 9.90 ÷ 20.01 = 49.5% | [S5] p.6 |
| Gross margin, year 1 | "35%" (printed); ESTIMATE 7.04 ÷ 20.01 = 35.2% | [S5] p.6 |
| Net profit before tax, year 1 | ₹4.36 lakh; ESTIMATE 4.36 ÷ 20.01 = 21.8% of sales | [S5] p.6 |
| By-products | Possibly scrap copper from old windings: our assumption, to be checked in the field survey. Value NOT FOUND | — |
| Break-even utilisation | NOT FOUND. Formula: fixed cost ÷ (price − variable cost per job) | — |

Regional purchasing power. HCES 2023-24 rural MPCE (monthly per-person spending), Statement 7, Rural column [S15] p.12:

| State | Rural MPCE (₹) |
| --- | --- |
| UP | 3,481 |
| Bihar | 3,670 |
| MP | 3,441 |
| Rajasthan | 4,510 |
| Maharashtra | 4,145 |
| All-India | 4,122 |

These are the Section I figures. They do not add the value of items received free from welfare schemes; those are in the separate "‘MPCE estimates with imputation’ are presented in Section II" [S15] p.4.
Pump repair is a farm cost, not household consumption. How it moves with MPCE is NOT FOUND.
Pricing strategy (our design choice). Price by HP band, and charge copper separately at the day's rate. The copper price is the biggest cost (49.5% of sales [S5]), so a fixed price per motor would expose the owner to copper price swings. The copper price series is NOT FOUND.

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |
| Reason | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

No official monthly series for pump-repair demand was found.
The framework expects a "lull in the monsoon" (§3 domain table), but no source gives a number.
A possible official proxy is State-wise monthly electricity sales to agriculture (CEA). Not opened ⚠.
Lean-month stress factor: NOT FOUND.
G9 fails until our field survey fills this row. Survey question: "In which months do you get the most and the least burnt motors? Roughly how many in each?"

## 6. Compliance
All rows were opened on 09 Nov 2026 unless marked ⚠. Links are in the Source log under each tag.

| Rule | Law & section | Trigger | Threshold | Govt fee | Enforcer | Exact quote | Tag | State differences |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — | — |
| Pollution: CPCB national list | CPCB directions, 12.02.2025 | Repairing motors by a dry mechanical process | White, pollution index 0.0 | — | SPCB | Sector 146.0 "Repairing of electric motors and generators (dry mechanical process)" … "White" | [S7] p.36 | — |
| Pollution: diesel pump repair (if the shop also does it) | CPCB directions, 12.02.2025; 2026 Schedule | Diesel pump repair, dry process | White, pollution index 20.0 | — | SPCB | Sector 45.0 "Diesel pump repairing and servicing (complete mechanical dry process)" … "20.0 White" [S7] p.11; 2026 Schedule item 14 "Diesel pump repairing and servicing (complete mechanical dry process)" [S8] p.26 | [S7] p.11; [S8] p.26 | Its index of 20.0 is within the "upto 25" exemption limit [S8] p.8 |
| White: no consent, written intimation | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) [S8] p.8. Water Act s.25 proviso: G.S.R. 703(E) 12.11.2024, para (a) replaced by G.S.R. 511(E) [S9] p.8. Both dated "28th July, 2025" on p.8; later notes give "29th July, 2025" ⚠. Schedules replaced by G.S.R. 761(E) [S8] p.16 / 762(E) [S9] p.16 (17.10.2025), then by G.S.R. 598(E) [S8] p.25 / 599(E) [S9] p.24 (08.07.2026) | Listed White sector | Pollution index up to 25, and only if the sector is named in the Schedule. A score of 25 or less alone does not exempt (e.g. Green rows scored 25.0 are not exempt) | — | SPCB | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees" (2025 text, [S8] p.8). 2026 Schedule item 42: "Repairing of electric motors and generators (dry mechanical process)" | [S8] pp.8, 25–26; [S9] pp.8, 24–26 | — |
| Pollution: Maharashtra | MPCB circular, 16.06.2025 | On the State list | "Motor Rewinding" (item 153) and "Repairing of electric motors & generators (dry mechanical process)" (item 185): White | NOT FOUND | MPCB | "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | [S10] pp.1, 6–7 | Maharashtra lists "Motor Rewinding" by name. UP, Bihar, MP, Rajasthan State lists: ⚠ not opened. Note: Maharashtra's own White list does not by itself give the central written-intimation exemption, which covers only sectors named in the central Schedule [S8] p.8 (our reading) |
| Varnish dipping and baking | — | Is a varnish oven still a "dry mechanical process"? | NOT FOUND ⚠ | — | SPCB | — | — | App rule (our design choice): IF the unit has a varnish baking oven THEN tell the user to confirm the category with the State board |
| GST registration | CGST Act s.22(1) | Aggregate turnover in a financial year | ₹20 lakh; ₹10 lakh in "special category States" | NOT FOUND | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees" | [S12] pp.49–50 | The Act defines "special category States" as the Article 279A(4)(g) States, minus "Jammu and Kashmir" and "Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand" [S12] p.51. None of our 5 States is named there. The Article 279A list itself was not opened, so the final answer stays ⚠ |
| GST ₹40 lakh goods-only limit | Notification 10/2019-CT | Only for "exclusive supply of goods" | ₹40 lakh | — | CBIC | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | [S13] | Repair is work on the customer's own motor, so a rewinder is very likely not "exclusively" a goods supplier (our reading) → the ₹20 lakh limit applies. MoSPI's survey definitions [S4] pp.16–17 do not decide this for GST. The GST classification itself: NOT FOUND ⚠ |
| GST: inter-State supply | CGST Act s.24(i) | Any inter-State taxable supply | Registration compulsory | — | CBIC | "persons making any inter-State taxable supply" | [S12] p.51 | Matters only if the shop repairs motors for customers across a State border. Any exemption for services: NOT FOUND ⚠ |
| Udyam registration | MSMED Act (section NOT FOUND) | Needed for many schemes; trigger NOT FOUND | NOT FOUND | NOT FOUND ⚠ | MoMSME | PM Vishwakarma artisans "also get assistance while onboarding on Udyam Assist Platform", which gives a "Udyam Registration Number" | [S16] p.5 | NOT FOUND |
| Shops & Establishments / panchayat licence | State Acts | Shop premises | NOT FOUND | NOT FOUND | State labour dept / panchayat | — | ⚠ | NOT FOUND for each of the 5 States |
| Electricity connection (framework flags "DISCOM ⚠") | State supply code / tariff order | New commercial or industrial connection; 3-phase | NOT FOUND | NOT FOUND | DISCOM | — | ⚠ | Must be checked per State: UPERC, BERC, MPERC, RERC, MERC tariff orders, not opened |
| Electrical safety | Electricity Act / CEA safety regulations | Testing motors on live supply | NOT FOUND ⚠ | — | Electrical Inspector | — | ⚠ | — |
| BIS / sector licences | — | — | None found that applies to rewinding. NOT FOUND ⚠ | — | — | — | — | — |


## 7. Scheme fit
### 7.1 NSFDC first

| Item | Micro Finance Scheme (MFS) | Term Loan |
| --- | --- | --- |
| Project cost | "units costing up to ₹1.40 lakh" [S1] | "more than ₹1.40 lakh and up to ₹50.00 lakh" [S1] |
| Loan | "The maximum loan limit is ₹1.25 lakh" [S1] | "up to ₹45.00 lakh" [S1] |
| Share of cost | "In all schemes, NSFDC provides up to 90% of the project cost." [S1]. So the own share is at least 10%, more when the cap binds | same [S1] |
| Interest | "6.5% p.a." [S1] | "8% p.a." [S1] |
| Channel | "Implemented via SCAs/CAs." [S1] | "Implemented via SCAs/CAs." [S1] |
| Repayment | "quarterly installments within 3 years (including a 3-month moratorium)" [S1] | "within 7 years (including a 6-month moratorium…)" [S1] |
| Who | SC with a valid caste certificate; "Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026)" [S1]. "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold" [S1] | same [S1] |
| Fits D16? | Probably. NSFDC's list includes "Service & Transport Sector (e.g., retail shops, repair centers…)" [S1]. Whether a full rewinding kit fits under ₹1.40 lakh is NOT FOUND (all prices VENDOR QUOTE NEEDED) | Yes: the §2b unit (₹10.75 lakh on Basis A, ₹8.52 lakh on Basis B) [S1][S5] |

Women. "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries." [S1]
Watch the channel. Two other NSFDC schemes cover the same project sizes at much higher interest [S1]:

| NSFDC scheme | Project size | Channel | Interest | Tag |
| --- | --- | --- | --- | --- |
| Aajeevika Micro-Finance Yojana (AMY) | "projects costing up to ₹1.40 lakh" | NBFC-MFIs | "15% p.a." | [S1] |
| Udyam Nidhi Yojana (UNY) | "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh" | "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a." | 13% / 15% | [S1] |

App rule (our design choice): quote 6.5% only for the Micro Finance Scheme loan, and 8% only for the Term Loan, both "Implemented via SCAs/CAs." [S1]. IF the user's lender is an MFI, cooperative bank or small finance bank THEN warn: "This may be AMY or UNY at 13–15%, not 6.5% or 8%." IF the lender is a public sector bank or regional rural bank THEN say: "Confirm the rate with the lender." NSFDC's partners include "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)", and "rates vary slightly by scheme and channelizing agency" [S1].
Two more NSFDC services to show the user [S1]:

| Service | What it is | Tag |
| --- | --- | --- |
| Online application | "Online Mode (PM-SURAJ Portal)" | [S1] |
| Free skill training (e.g. rewinding up-skilling) | "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period" | [S1] |

How to apply [S1]:
NSFDC does not take applications directly: "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."
Offline applications go with "a valid caste certificate, income proof, KYC documents" and the agency's checklist.
Note: [S1] is a MoSJE development-site copy (devmosje.negd.in). Confirm on nsfdc.nic.in ⚠.
### 7.2 Other schemes

| Scheme | Who qualifies | Min. size | Benefit | Own share | Period / open now? | Negative list | Combine with NSFDC loan? | Tag |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PMEGP | Any individual above 18. "There will be no income ceiling". Class VIII pass for projects "above Rs.10 lakh in the manufacturing sector and above Rs. 5.00 lakh in the business /service sector". New projects only. "Only one person from one family… The 'Family' includes self and spouse." "Projects without Capital Expenditure are not eligible" | NOT FOUND | Subsidy for "Special (including SC…)": 25% urban, 35% rural | 5% (special category) | Undated summary (2022-11 web folder). Status after March 2026: NOT FOUND (kviconline.gov.in unreachable) | The summary points to "the negative list of the guidelines (Para 30…)", which is not included. The pre-revision list (Para 29, p.23) does not name repair in its readable text; the scan is partly garbled ⚠ | Unclear ⚠. Two rules point the same way. (1) "the units that have already availed Government Subsidy under any other scheme… are not eligible". (2) PMEGP is built around a bank loan: "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks" [S11] p.2. So an NSFDC loan through an SCA may not fit PMEGP's structure. Whether an SCA can act as the PMEGP financing agency: NOT FOUND | [S11] pp.2–3; [S14] p.23 |
| PMEGP and NSFDC together | PMEGP lists its financing institutions as "All Public Sector Banks", "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI" and "Small Industries Development Bank of India (SIDBI)". NSFDC and SCAs are not listed; the implementing agencies name "National Scheduled Tribes Finance and Development Corporation (NSTFDC)" but not NSFDC. Also: "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" are not eligible | — | — | — | — | — | So the PMEGP bank loan cannot be the NSFDC loan, and a unit already set up with an NSFDC (Government of India) loan is likely shut out of a PMEGP first loan (our reading) ⚠ | [S11] pp.3–5 |
| PMEGP bank loan terms | — | — | "The Bank will sanction 90% of the project cost in case of General Category of beneficiary/institution and 95% in case of special category". Interest: "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years". So the PMEGP bank loan is at the bank's normal rate, not NSFDC's 6.5% or 8% [S1] | — | — | — | — | [S11] pp.5–6 |
| PMEGP limits | — | — | Working capital: "for units under Service-Trading Sector the working capital shall not be more than 60% of the project cost" (manufacturing: "not be more than 40%"). Capital per worker: "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas" | — | — | — | — | [S11] p.6 |
| PMEGP 2nd loan (upgradation) | Only for "existing PMEGP/REGP/MUDRA units", where the "First loan under PMEGP/MUDRA/REGP has to be successfully repaid" | — | "15%" subsidy ("20% for NER and Hill States"); project caps "Rs. 1.00 Crore" (manufacturing) and "Rs. 25.00 lakh" (service). Also needs: "Margin Money (Subsidy) claimed under PMEGP has be successfully adjusted on the completion of lock in period of 3 years" and "The unit is profit making" | 10% | — | — | A shop first funded by NSFDC is not a PMEGP/REGP/MUDRA unit, so this route looks closed (our reading) ⚠ | [S11] pp.2–3 |
| PMEGP Class VIII rule on the §2b unit | — | — | Project above "Rs.10 lakh in the manufacturing sector" or "Rs. 5.00 lakh in the business /service sector" needs "at least VIII standard pass". Basis A (₹10.75 lakh): needed under either cap. Basis B (₹8.52 lakh): needed if treated as service, not if manufacturing (ESTIMATE comparisons) | — | — | — | — | [S11] p.2 |
| PMEGP cost cap | — | — | "Rs. 50.00 lakh" (manufacturing); "Rs. 20.00 lakh" (business/service). Which applies to rewinding: NOT FOUND ⚠. MoSPI counts repair of machinery as manufacturing [S4] p.16, but PMEGP may not follow MoSPI | — | — | — | — | [S11] p.2 |
| PMEGP, workshop rent | — | — | "Cost of the ready built as well as long lease or rental Work-shed/Workshop can be included in the project cost", "for a maximum period of 3 years only" | — | — | — | — | [S11] p.3 |
| PM Vishwakarma | Must be "Engaged in one of the mentioned 18 family-based traditional trades" and "working with bare hands and tools" [S16] p.3. The list of 18 trades is not in the saved copy: NOT FOUND ⚠ | — | — | — | — | — | Two blocks. (1) Motor rewinding is not an inherited traditional craft, so it is very unlikely to be one of the 18 trades (our reading). (2) "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years" [S16] p.3. An NSFDC loan may count as such a scheme; whether it does is NOT FOUND ⚠. Treat as does NOT fit until D confirms | [S16] p.3 |
| MUDRA | Loan tiers: NOT FOUND in this session (mudra.org.in did not open ⚠). The D18 dossier has the tiers from a saved copy of the MUDRA home page | — | — | — | — | — | NOT FOUND | ⚠ |
| Other schemes listed for this business on the UP portal (UP users only, unless the scheme is national) | The page lists: "National SC-ST Hub (NSSH)"; "CGTMSE(Credit Guarantee Fund Trust for MSE)"; "Training Scheme for SC/ST"; "Mukhyamantri Yuva Udyami Vikas Abhiyan"; "Interest Subsidy under Micro, Small, and Medium Enterprises"; "Stamp Duty Exemption" | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND ⚠ | NOT FOUND | NOT FOUND ⚠ | [S6] |

When D16 does NOT fit:
PM Vishwakarma: very likely not a listed trade (confirm ⚠).
PMEGP, first loan: only for new projects. "Assistance under the Scheme is available only for new projects", and units that already took a Government subsidy are excluded [S11] pp.2–3. An existing shop can use only the 2nd-loan (upgradation) route, and only if it was first funded under PMEGP, REGP or MUDRA [S11] pp.2–3.
PM Vishwakarma: possibly blocked for 5 years by an NSFDC loan [S16] p.3 ⚠.
PMEGP: not without capital spending. "Projects without Capital Expenditure are not eligible" [S11] p.3.

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
| --- | --- | --- | --- | --- |
| Copper price rise (raw material is about half of sales) | High (our judgement) | Copper wire rate rises at the supplier | IF raw material > 50% of sales THEN warn and suggest charging copper separately | ESTIMATE 49.5% [S5]; threshold is our design choice |
| Monsoon lull (framework key risk) | NOT FOUND | Fewer motors in Jul–Sep | Needs §5 | — |
| Single-supplier dependence (copper wire from one dealer) | NOT FOUND | One dealer for all wire | IF one supplier only THEN ask for a second | our design choice |
| Single-buyer dependence (one pump dealer sends most jobs) | Medium (our judgement) | One referrer > half of jobs | IF one source > 50% of jobs THEN warn and stress-test EMI without it | threshold is our design choice |
| Electrical shock / fire while testing | NOT FOUND | — | IF the shop tests motors on live supply THEN show the electrical-safety check (⚠) | — |
| Wrong pollution category (varnish oven) | Low (our judgement) | Unit plans a baking oven | IF oven THEN confirm with the State board | [S7] covers "dry mechanical process" only |
| Owner extends credit to farmers | Medium (our judgement) | Debtor days above the profile's 12.2 | IF udhaar days > 30 THEN raise working capital | ESTIMATE 12.2 days [S5]; threshold is our design choice |

SWOT (both sizes).

|  | Micro Finance (≤ ₹1.40 lakh) [S1] | Term Loan (UP profile unit, ₹10.75 lakh, Basis A) [S1][S5] |
| --- | --- | --- |
| Strengths | White category (dry process) [S7]; demand "in great demand, especially in the semi-urban and rural areas" [S5] | Profile shows gross margin "35%" and net profit 21.8% of sales in year 1 (ESTIMATE) [S5] |
| Weaknesses | No official machine prices; OpEx NOT FOUND | Profile has arithmetic errors (§2); no machine list |
| Opportunities | PMEGP 35% rural subsidy for SC (if open after Mar 2026 ⚠) [S11] | Same; bigger jobs (submersibles, panchayat pumps), NOT FOUND |
| Threats | Copper price; monsoon lull (unquantified) | Same, plus working capital ₹3.07 lakh (ESTIMATE) tied up |

Competitor density in a block. No official block-level count of rewinding shops was found. Options, in order:
ASUSE unit-level data at district level for NIC 33140 / 331400 [S2][S3]: NOT FOUND in the fact sheet.
Udyam registrations by NIC code and district (Udyam portal ⚠, not opened).
Field count: ask pump dealers in the block how many rewinding shops they send work to (our survey).

## Source log

| Tag | Title | Issuer | URL (deep link) | Exact words used | Date opened | Saved copy |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | FAQ – National Scheduled Castes Finance and Development Corporation | MoSJE (dev-site copy) | https://devmosje.negd.in/?p=15629 | "units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a."; "more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a."; "In all schemes, NSFDC provides up to 90% of the project cost."; "Implemented via SCAs/CAs."; "at an interest rate of 15% p.a."; "Service & Transport Sector (e.g., retail shops, repair centers"; "(applicable to both rural and urban areas, effective January 7, 2026)"; "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh"; "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a."; "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)"; "rates vary slightly by scheme and channelizing agency"; "Online Mode (PM-SURAJ Portal)"; "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT)"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold"; "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries."; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period"; "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."; "a valid caste certificate, income proof, KYC documents"; "Annual family income from all sources must not exceed ₹5.00 Lakhs" | 09 Nov 2026 | _shared/NSFDC_devmosje_p15629.html |
| S2 | National Industrial Classification 2008, pp.76, 91–92 (PDF pages) | MoSPI | https://mospi.gov.in/sites/default/files/main_menu/national_industrial_classification/nic_2008_17apr09.pdf | "33140 Repair of electrical equipment"; "This class includes the repair and maintenance of goods of division 27, except those in class 2750 (domestic appliances)"; "33122 Repair and maintenance of pumps and related equipment, fluid power equipment, valves"; "Manufacture of electric motors, generators, transformers" | 09 Nov 2026 | _shared/NIC_2008.pdf |
| S3 | National Industrial Classification 2025, pp.138, 140 (PDF pages) | MoSPI | https://mospi.gov.in/uploads/publications_reports/publications_reports1763457214315_c3e5d4f3-8e25-4775-85e3-ad42d571652f_NIC_2025_Final.pdf | "331400 Repair and maintenance of electrical equipment"; "331202 Repair and maintenance of pumps and related equipment, fluid power equipment, valves" | 09 Nov 2026 | _shared/NIC_2025.pdf |
| S4 | Fact sheet ASUSE 2025, pp.6, 16–17 | MoSPI | https://www.mospi.gov.in/uploads/latestreleasesfiles/1777360756062-publications_reports1774347275480_658da785-11e1-4df3-9f02-27e08a8675f6_Factsheet_ASUSE_2025-f.pdf | "3,97,477"; "4,24,139"; "This will also include those units which are primarily engaged in providing manufacturing services such as maintenance and repair of industrial, commercial and similar machinery and equipment."; "the producer works directly on goods owned by the consumer by transporting, cleaning, repairing" | 09 Nov 2026 | _shared/ASUSE_2025_Factsheet.pdf |
| S5 | Project Report of Electrical Motor Winding (pre-feasibility), pp.3–7 (undated) | UP MSME 1-Connect portal, Government of Uttar Pradesh | https://msme1connect.up.gov.in/Projectreport/Project%20Report638655583060789659.pdf | "Motors are used as a prime mover for driving various machines and pump sets in industry, agriculture and domestic application"; "the winding is one of the main part of any motor. It gets damaged frequently due to wear and tear and needs rewinding"; "especially in the semi-urban and rural areas"; "Increase in Fixed Assets 5.31"; "Increase In Term Loan 5.23"; "Increase in Cash Credit 2.44"; "Share Capital 0.85"; "Gross Sale 20.01"; "Raw Mateiral Consumed 9.90"; "Elecricity Expenses 0.43"; "Labour & Wages 3.43"; "Cost of Production 14.75"; "Salary to Staff 1.58"; "NET PROFIT 4.36"; "Sundry Debtors 0.67"; "Stock in Hand 2.27"; "Increase in Stock 2.27"; "Increase in Debtors 0.67"; "Increase in Deposits & Adv 2.50"; "Closing Stock /WIP 1.78"; "The views expressed in this Project Report are advisory in nature."; "Reserve & Surplus"; "Depriciation & Exp. W/off"; "Increase in Creditors"; "Increase in Provisions" | 09 Nov 2026 | D16/UP_MSME_Electrical_Motor_Winding_Unit.pdf |
| S6 | Business category page "Electric Motor Winding" | UP MSME 1-Connect portal | https://msme1connect.up.gov.in/Home/BusinessDetails?Id=101 | "An Electric Motor Winding Unit is a facility that focuses on winding, assembling, and repairing the core component of electric motors the stator and rotor coils."; "National SC-ST Hub (NSSH)"; "CGTMSE(Credit Guarantee Fund Trust for MSE)"; "Training Scheme for SC/ST"; "Mukhyamantri Yuva Udyami Vikas Abhiyan"; "Interest Subsidy under Micro, Small, and Medium Enterprises"; "Stamp Duty Exemption" | 09 Nov 2026 | D16/UP_MSME_BusinessDetails_101.html |
| S7 | List of Sectors Classified by Central Pollution Control Board (As on 24th August 2026), pp.11, 36 | CPCB | https://cpcb.gov.in/uploads/Sectors_Classified_by_CPCB.pdf | "146.0 Repairing of electric motors and generators (dry mechanical process)"; "0.0 White"; "12.02.2025"; "45.0 Diesel pump repairing and servicing (complete mechanical dry process)"; "20.0 White" | 09 Nov 2026 | _shared/CPCB_Sectors_Classified.pdf |
| S8 | MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 512(E) 28.07.2025 and G.S.R. 598(E) 08.07.2026 (compiled), pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_airact.pdf | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; "42. Repairing of electric motors and generators (dry mechanical process)"; "G.S.R. 512(E)"; "New Delhi, the 28th July, 2025"; "14. Diesel pump repairing and servicing (complete mechanical dry process)"; "G.S.R. 761(E)"; "New Delhi, the 8th July, 2026"; "G.S.R. 598(E)"; "29th July, 2025" | 09 Nov 2026 | _shared/CPCB_White_exemption_airact.pdf |
| S9 | MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendments incl. G.S.R. 599(E) 08.07.2026 (compiled), pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_wateract.pdf | Same exemption wording as S8; "42. Repairing of electric motors and generators (dry mechanical process)"; "G.S.R. 511(E)"; "G.S.R. 599(E)"; "G.S.R. 762(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_wateract.pdf |
| S10 | Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 6–7 | Maharashtra Pollution Control Board | https://mpcb.gov.in/sites/default/files/standing_orders/Circular_White_Category_MPCB_16062025.pdf | "153 Motor Rewinding"; "185 Repairing of electric motors & generators (dry mechanical process)"; "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | 09 Nov 2026 | _shared/MPCB_White_Circular_16062025.pdf |
| S11 | Salient Features of Revised PMEGP, pp.2–3, 5–6 (undated; web folder 2022-11) | Delhi Khadi & Village Industries Board | https://dkvib.delhi.gov.in/sites/default/files/2022-11/salient-features-of-revised-ppmegp.pdf | Special category "05%" own, "25%" urban, "35%" rural; "manufacturing sector is Rs. 50.00 lakh"; "business/service Sector is Rs. 20.00 lakh."; "There will be no income ceiling"; "Assistance under the Scheme is available only for new projects"; "the units that have already availed Government Subsidy under any other scheme of Government of India or State Government are not eligible"; "Projects without Capital Expenditure are not eligible for Financing under the scheme."; "for a maximum period of 3 years only"; "The ‘Family’ includes self and spouse."; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks."; "The Bank will sanction 90% of the project cost in case of General Category of beneficiary/institution and 95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years"; "for units under Service-Trading Sector the working capital shall not be more than 60% of the project cost"; "not be more than 40%"; "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas"; "2nd loan for upgradation of existing PMEGP/REGP/MUDRA units"; "First loan under PMEGP/MUDRA/REGP has to be successfully repaid"; "20% for NER and Hill"; "Rs. 1.00 Crore"; "Rs. 25.00 lakh"; "Margin Money (Subsidy) claimed under PMEGP has be successfully adjusted on the completion of lock in period of 3 years"; "The unit is profit making"; "All Public Sector Banks."; "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI."; "Small Industries Development Bank of India (SIDBI)."; "National Scheduled Tribes Finance and Development Corporation (NSTFDC)"; "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy"; "at least VIII standard pass" | 09 Nov 2026 | _shared/PMEGP_Revised_Salient_DelhiKVIB.pdf |
| S12 | CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 | CBIC | https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "persons making any inter-State taxable supply"; "the expression ―special category States‖ shall mean the States as specified"; "Arunachal Pradesh, Assam, Himachal Pradesh"; "aggregate turnover in a financial year exceeds ten lakh rupees" | 09 Nov 2026 | _shared/CGST_Act_updated_31082021.pdf |
| S13 | Notification No. 10/2019-Central Tax | Ministry of Finance | https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | 09 Nov 2026 | _shared/GST_Notfn_10_2019_CT.pdf |
| S14 | Guidelines on PMEGP (pre-revision scan), p.23, Para 29 | KVIC copy on a Government server | https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2023/03/2023031676.pdf | "Negative List of Activities"; "The following list of activities will not be permitted under PMEGP" | 09 Nov 2026 | _shared/PMEGP_Guidelines_s3waas_2023-03.pdf |
| S15 | Fact Sheet on HCES 2023-24, pp.4, 12 (Statement 7) | MoSPI | https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf | "Statement 7: Average MPCE for each State/UT in 2023-24"; "‘MPCE estimates with imputation’ are presented in Section II" | 09 Nov 2026 | _shared/HCES_FactSheet_2023-24.pdf |
| S16 | PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), p.3 | PIB | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc2025916638501.pdf | "Engaged in one of the mentioned 18 family-based traditional trades"; "working with bare hands and tools"; "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years"; "assistance while onboarding on Udyam Assist"; "Udyam Registration Number" | 09 Nov 2026 | _shared/PM_Vishwakarma_PIB_Sep2025.pdf |

## Quality gates (researcher)

| Gate | Result |
| --- | --- |
| G1 Every number tagged | Pass, per the check script (see the hand-over) |
| G3 FSSAI | Not applicable (no food) |
| G4 GST | Pass with ⚠: ₹20 lakh applies (not goods-only, our reading); GST classification of rewinding NOT FOUND |
| G5 Pollution category | Pass: CPCB national list White (dry mechanical process) [S7]; Air and Water exemption with written intimation [S8][S9]; Maharashtra lists "Motor Rewinding" by name [S10]. Varnish oven ⚠ |
| G6 Scheme open | PMEGP after March 2026 NOT FOUND; PM Vishwakarma likely not applicable |
| G7 Scheme fit | Done; PMEGP manufacturing-vs-service cap and NSFDC combination unclear ⚠ |
| G8 NSFDC tier first | Pass |
| G9 Seasonality | Fail: no source; needs field survey |
| G10 Working capital from cycle days | Pass for the Term Loan size: ESTIMATE ₹3.07 lakh (balance-sheet stock) or ₹2.52 lakh (closing stock); the app uses the higher. Micro size NOT FOUND |
| G12 Biology | Not applicable |
