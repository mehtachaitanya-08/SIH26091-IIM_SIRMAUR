# D15 Tractor Garage — sector dossier (SIH26091)

| Field | Value |
|---|---|
| Domain code | D15 |
| Short name | Tractor_Garage |
| Domain | Tractor & farm implement repair garage, including welding |
| Basket | B5 Machinery Workshop, Vehicle & Pump Repair (गैराज, मोटर वाइंडिंग एवं वेल्डिंग) |
| Unit to study | Repair and welding shop (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

**How to read this file.** Every figure carries a tag:
- `[S#]`: see the Source log at the end
- `ESTIMATE`: inputs and sum shown
- `NOT FOUND`
- `VENDOR QUOTE NEEDED`

Rows marked `⚠` need Person D to open the page in a normal browser. Lines marked "our design choice" are app rules we chose, not facts. Nothing here comes from memory, blogs or news.

**No official project report was found for this business.**
- The UP Government MSME portal (msme1connect.up.gov.in) lists 320 business categories [S16]. None is a tractor or farm-machinery repair garage. The full list was checked on 09 Nov 2026 and is saved as `UP_MSME_portal_categories.txt`.
- **So every CapEx and OpEx figure here is VENDOR QUOTE NEEDED or NOT FOUND.**

**Sources that could not be opened on 09 Nov 2026** (the facts they hold are NOT FOUND here, not guessed):

| Source | Problem | What we lose |
|---|---|---|
| cpcb.nic.in | Certificate revoked | Hazardous and Other Wastes Rules 2016 text (used oil) |
| kviconline.gov.in / dcmsme.gov.in | — | Model profiles |
| Agriculture Census Input Survey 2016-17 | All-India report not located on an allowed government site | Number of tractors |
| pmvishwakarma.gov.in, mudra.org.in | Connection reset | — |

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2008 code | 33124 "Repair and maintenance of agricultural machinery and forestry and logging machinery including agricultural tractors" | [S2] p.91 |
| NIC 2025 code | 331204 "Repair and maintenance of agricultural machinery and forestry and logging machinery including agricultural tractors" | [S3] p.138 |
| Welding repair | It falls in the same class, **except mobile (field call-out) welding**, which NIC 2025 places under "331199 Repair and maintenance of other fabricated metal products n.e.c. including Mobile welding repair" [S3] p.137. NIC 2008 class 3312 "includes … the provision of welding (e.g. automotive, general) repair services; the repair of agricultural and other heavy and industrial machinery". NIC 2025 class 3312 has the same welding wording [S3] p.137, but adds exclusions, including "repair and maintenance of engines for motor vehicles, see 9531" [S3] p.138 | [S2] p.91; [S3] pp.137–138 |
| Sector | Under MoSPI survey definitions, repair of machinery counts as **manufacturing**: "This will also include those units which are primarily engaged in providing manufacturing services such as maintenance and repair of industrial, commercial and similar machinery and equipment." These survey definitions do not decide the GST treatment (§6) or which PMEGP cap applies (§7) ⚠ | [S4] p.16 |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Rural count of tractor-repair garages (NIC 33124 / 331204) | NOT FOUND (needs ASUSE unit-level data) | — |
| Number of tractors per district / block | NOT FOUND ⚠ (Agriculture Census Input Survey 2016-17 and VAHAN tractor registrations not opened) | — |

**Demand within 5–10 km (formula for the app):**

`ESTIMATE: tractors in the catchment [Input Survey / VAHAN, NOT IN HAND ⚠] × repair visits per tractor per year [NOT FOUND] × average bill [NOT FOUND] = yearly repair market.`

All three inputs are NOT FOUND. The app can show the formula, but not a number.

**Rural vs semi-urban.** No official source compares the two. NOT FOUND.

**Sales channels.** No official source was found. These are questions for our field survey, not data:
- Walk-in tractor owners
- Custom-hiring operators
- Field call-outs at harvest
- Implement welding for dealers

**Underserved niches and how to spot them in a block.**

| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Implement repair and welding (ploughs, cultivators, trolleys) | Welding repair is part of the same NIC class as tractor repair [S2] p.91, so one shop can do both | Count shops in the block that weld implements vs those that only service engines | [S2] for the class; niche size NOT FOUND |
| Field call-out service at harvest | NOT FOUND | Ask tractor owners how long they wait in harvest season | — |
| Hydraulics / trolley repair | NOT FOUND | Ask the nearest tractor dealer which jobs they send out | — |

---

## 2. CapEx

**Price source.** There is no official price list for a tractor garage.

The only official unit prices found for similar tools are in the UP MSME portal's "Fabrication of Grills, Gates and Fence" project report [S15]:
- "Welding Machine Nos 2 25000 50000"
- "Hand Drills and tools Nos 1 20000 20000"

That report is for a different business (gate fabrication). It is undated, and it says "We can modify the project capacity and project cost as per your requirement." Use its prices only as a **guide**, and get a fresh quotation. Every other price is VENDOR QUOTE NEEDED. The item lists are our design choice, not an official design.

**Connected load and phase.** NOT FOUND. Whether a welding set or air compressor needs a 3-phase supply depends on the machine rating (vendor quote) and the State DISCOM supply code ⚠.

**Where machines are made.** NOT FOUND.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])

| # | Item | Qty | Unit price (₹) | Line total (₹) | Tag |
|---|---|---|---|---|---|
| 1 | Welding machine | 1 | 25,000 (guide price) | 25,000 | [S15] p.7 |
| 2 | Hand drills and tools | 1 | 20,000 (guide price) | 20,000 | [S15] p.6 |
| | **Guide-priced subtotal** | | | **ESTIMATE 25,000 + 20,000 = 45,000** | [S15] |
| 3 | Mechanic's tool kit (spanners, sockets, pullers), angle grinder | 1 | VENDOR QUOTE NEEDED | — | — |
| 4 | Hydraulic jack and stands | 1 set | VENDOR QUOTE NEEDED | — | — |
| 5 | Safety gear (welding shield, gloves) | 1 set | VENDOR QUOTE NEEDED | — | — |
| 6 | Pre-operative: Udyam, local licence, power connection deposit | — | — | NOT FOUND (see §6) | — |
| 7 | Working capital (spares, welding rods, oil) | — | — | See §3 | — |

Room left under the ₹1.40 lakh ceiling [S1] for rows 3–7: ESTIMATE 1,40,000 − 45,000 = ₹95,000.

**Loan at the ceiling.**
- Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ESTIMATE 0.9 × 1,40,000 = ₹1,26,000.
- Capped at ₹1,25,000 [S1].
- Own share is **at least** ESTIMATE 1,40,000 − 1,25,000 = ₹15,000 [S1]. It is more than 10% because the cap binds, and more again if the agency lends less than the maximum.

### 2b. Term Loan size (example: repair garage with a small machine shop)

| # | Item | Qty | Unit price (₹) | Line total (₹) | Tag |
|---|---|---|---|---|---|
| 1 | Everything in 2a | — | VENDOR QUOTE NEEDED | — | — |
| 2 | Air compressor | 1 | VENDOR QUOTE NEEDED | — | — |
| 3 | Bench lathe | 1 | VENDOR QUOTE NEEDED | — | — |
| 4 | Chain pulley block / hoist | 1 | VENDOR QUOTE NEEDED | — | — |
| 5 | Battery charger, gas cutting set | 1 each | VENDOR QUOTE NEEDED | — | — |
| 6 | Shed / workshop rent deposit | — | — | NOT FOUND | — |
| 7 | Working capital | — | — | See §3 | — |

- Loan: at most 90% of the project cost [S1], within the ₹45 lakh cap [S1].
- Own share: at least 10% [S1].
- The figures can't be filled until vendor quotes arrive.

---

## 3. OpEx & working capital

| Monthly cost | Value | Tag |
|---|---|---|
| Rent | NOT FOUND (local) | — |
| Electricity | NOT FOUND (State DISCOM tariff, not opened) | — |
| Welding rods, gas, consumables | VENDOR QUOTE NEEDED | — |
| Spare parts stock | VENDOR QUOTE NEEDED | — |
| Helper / mechanic wages (Term Loan size) | NOT FOUND (State minimum-wage notifications, not opened) | — |
| Used oil disposal | NOT FOUND (see §6) | — |
| **Total monthly OpEx** | **NOT FOUND** | — |

**Working-capital cycle (days).**

| Stage | Days | Tag |
|---|---|---|
| Spare parts in stock | NOT FOUND | — |
| Job time per repair | NOT FOUND | — |
| Customer credit (udhaar), often until harvest cash comes in | NOT FOUND | — |

**Formula (for the app and for D's sheet):** `Working capital = (sum of cycle days ÷ 30) × monthly OpEx` (framework G11).

All inputs are NOT FOUND, so the result is NOT FOUND. Survey questions:
- "How many days of spare parts do you keep?"
- "How many days after the repair do farmers pay you?"

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Labour charge per job (service, overhaul, welding per joint) | NOT FOUND (no official price series) | — |
| Margin on spare parts | NOT FOUND | — |
| Jobs per month | NOT FOUND | — |
| By-products | Scrap metal: our assumption, to be checked in the field survey. Value NOT FOUND | — |
| Break-even utilisation | NOT FOUND. Formula: fixed cost ÷ (price − variable cost per job) | — |

**Regional purchasing power.** HCES 2023-24 rural MPCE (monthly per-person spending), Statement 7, Rural column [S13] p.12:

| State | Rural MPCE (₹) |
|---|---|
| UP | 3,481 |
| Bihar | 3,670 |
| MP | 3,441 |
| Rajasthan | 4,510 |
| Maharashtra | 4,145 |
| All-India | 4,122 |

- These are the Section I figures, without the value of free items ("‘MPCE estimates with imputation’ are presented in Section II") [S13] p.4.
- Tractor repair is a farm business cost, not household spending. How repair prices move with MPCE is NOT FOUND.

**Pricing strategy (our design choice).**
- Quote labour and parts separately.
- Allow harvest-time credit only up to a set limit, because customer credit is the main working-capital risk (§8).
- The limit has to come from our field survey.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |
| Reason | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

- The framework expects "Harvest-time overload" (§3 domain table), but no official monthly series for tractor repair demand was found.
- A State crop calendar (sowing and harvest months for rabi and kharif crops) would give the timing but not the size of the peaks. Not opened ⚠.
- **Lean-month stress factor: NOT FOUND.**
- **G9 fails until our field survey fills this row.** Survey question: "In which months do you get the most and the fewest tractors? Roughly how many in each?"

---

## 6. Compliance

All rows were opened on 09 Nov 2026 unless marked ⚠. Links are in the Source log under each tag.

| Rule | Law & section | Trigger | Threshold | Govt fee | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — | — |
| **Pollution: which CPCB row applies? ⚠** | CPCB directions, 12.02.2025 and 17.10.2025 | Depends on what the garage does | **Two possible rows, different categories** (see the next three rows) | — | SPCB | — | [S5] | The State board decides. App rule (our design choice): IF the garage charges lead-acid batteries, vulcanises tyres or tubes, is a dealer's authorised service centre, changes engine oil, washes vehicles or spray-paints THEN show **Orange**; ELSE IF it only does mechanical repair and dry welding/fabrication THEN show White, and tell the user to confirm with the State board |
| → Battery charging (if offered) | CPCB list | "assembling & charging of acid lead battery on micro scale" | **Orange**, pollution index 76.0 | — | SPCB | Sector 9.2 "Dry cell battery (excluding manufacturing of electrodes) and assembling & charging of acid lead battery on micro scale" … "76.0 Orange" | [S5] p.4 | Whether occasional charging of customers' batteries falls under this row: NOT FOUND ⚠ |
| → Tyre and tube vulcanising (if offered) | CPCB list | Hot repair of tyres or tubes | **Orange**, pollution index 61.8 | — | SPCB | Sector 142.2 "Tyres and tubes vulcanization/ hot retreading" … "61.8 Orange" | [S5] p.36 | Sector 148.0 "Tyre retraders" is listed as "0.0 White" [S5] p.37. Which row a village puncture shop falls under: NOT FOUND ⚠ |
| → Dealer's authorised service centre | CPCB list, Service/Infrastructure sectors | Small authorised service centre | **Orange**, pollution index 79.0 | — | SPCB | Sector 5.2 "Railway locomotive work shop/ Integrated road transport workshop/ Authorized service centers (wastewater generation <10 KLD)" … "79.0 Orange" | [S5] p.61 | Matters only if the garage is tied to a tractor dealer |
| → Diesel engine / pump work, dry process | CPCB list; 2026 Schedule | Dry mechanical repair | **White**, pollution index 20.0 | — | SPCB | Sector 45.0 "Diesel pump repairing and servicing (complete mechanical dry process)" … "20.0 White" [S5] p.11; 2026 Schedule "14. Diesel pump repairing and servicing (complete mechanical dry process)" [S6] p.26 | [S5] p.11; [S6] p.26 | Closest row for diesel engine work (our reading) |
| → Metal fabrication through machines | CPCB list; 2026 Schedule | Implement fabrication, no heat or surface treatment or painting | **White**, pollution index 0.0 | — | SPCB | Sector 209.0 "Metal fabrication works and hand tool manufacturing through machines (without heat/surface treatment or spray painting)" [S5] p.53; 2026 Schedule "78. Metal fabrication works and hand tool manufacturing through machines (without heat or surface treatment or spray painting)" [S6] p.28 | [S5] p.53; [S6] p.28 | — |
| → Mechanical workshop, no heat or surface treatment or spray painting | CPCB list | Repair and welding only | **White**, pollution index 20.0 | — | SPCB | Sector 189.0 "Assembling units and mechanical workshops (without heat/surface treatment or spray painting)" … "20.0 White" … "17.10.2025" | [S5] p.49 | Index 20.0 is within the "upto 25" exemption limit [S6] p.8 |
| → Engineering and fabrication, dry process | CPCB list | Fabrication / welding of implements | **White**, pollution index 0.0 | — | SPCB | Sector 51.0 "Engineering and fabrication units (dry process without any heat treatment / metal surface finishing operations / painting)" … "0.0 White" | [S5] p.12 | — |
| → Automobile service station / workshop | CPCB list, Service/Infrastructure sectors | Vehicle servicing | **Orange**, pollution index 75.5 | NOT FOUND | SPCB | Sector 9.0 "Automobile service stations/ workshops" … "75.5 Orange" | [S5] p.62 | Whether a tractor garage counts as an "automobile" workshop: NOT FOUND ⚠ |
| White: no consent, written intimation | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) [S6] p.8. Water Act s.25 proviso: G.S.R. 703(E) 12.11.2024, para (a) replaced by G.S.R. 511(E) [S7] p.8. Both dated "28th July, 2025" on p.8; later notes give "29th July, 2025" ⚠. Schedules replaced by G.S.R. 761(E) [S6] p.16 / 762(E) [S7] p.16 (17.10.2025), then by G.S.R. 598(E) [S6] p.25 / 599(E) [S7] p.24 (08.07.2026) | Listed White sector | Pollution index **up to 25, and only if the sector is named in the Schedule**. A score of 25 or less alone does not exempt (e.g. Green rows scored 25.0 are not exempt) | — | SPCB | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees" (2025 text, [S6] p.8). 2026 Schedule: "17. Engineering and fabrication units dry process without any heat treatment or metal surface finishing"; "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)" | [S6] pp.8, 26–27; [S7] pp.8, 25–26 | Orange units need consent from the State board (procedure and fee NOT FOUND ⚠) |
| Pollution: Maharashtra | MPCB circular, 16.06.2025 | On the State list | **White**: item 53 "Engineering workshop, machine shop, fabrication shop, smithy shop, turning shop, cutting shop"; item 55 "Fabricating units for tractor trailer, agricultural equipment etc. (without electroplating, spray painting & powder coating)"; item 56 "Fabricating units for vehicle parts without electroplating, heat treatment, spray painting and powder coating"; item 17 "Automobile Body building (without wet process)" | NOT FOUND | MPCB | "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | [S8] pp.1, 3–4 | Maharashtra names "Engineering workshop" and tractor-trailer fabrication as White. UP, Bihar, MP and Rajasthan lists: ⚠ not opened. **Note:** Maharashtra's own White list does not by itself give the central written-intimation exemption, which covers only sectors named in the central Schedule [S6] p.8 (our reading) |
| **Used engine oil** | Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016 | Garage collects used oil | NOT FOUND ⚠ (rules text not opened; cpcb.nic.in certificate revoked) | NOT FOUND | SPCB | **Comparison only (a different sector):** for mobile towers with gensets, CPCB says "The used oil/waste oil generated during repair and maintenance need to be disposed through authorized hazardous waste recycler" | [S5] p.24 (comparison) | App rule (our design choice): IF the garage changes oil THEN tell the user to hand used oil to an authorised hazardous-waste recycler, and to ask the State board whether the garage itself needs authorisation |
| **GST registration** | CGST Act s.22(1) | Aggregate turnover in a financial year | ₹20 lakh; ₹10 lakh in "special category States" | NOT FOUND | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees" | [S11] pp.49–50 | The Act defines "special category States" as the Article 279A(4)(g) States, minus "Jammu and Kashmir" and "Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand" [S11] p.51. None of our 5 States is named there. The Article 279A list itself was not opened, so the final answer stays ⚠ |
| GST ₹40 lakh goods-only limit | Notification 10/2019-CT | Only for "exclusive supply of goods" | ₹40 lakh | — | CBIC | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | [S12] | A garage sells repair labour as well as parts, so it is very likely **not** "exclusively" a goods supplier (our reading). That means the ₹20 lakh limit applies. GST classification: NOT FOUND ⚠ |
| GST: inter-State supply | CGST Act s.24(i) | Any inter-State taxable supply | Registration compulsory | — | CBIC | "persons making any inter-State taxable supply" | [S11] p.51 | Matters near a State border. Exemption for services: NOT FOUND ⚠ |
| Udyam registration | MSMED Act (section NOT FOUND) | Needed for many schemes; trigger NOT FOUND | NOT FOUND | NOT FOUND ⚠ | MoMSME | PM Vishwakarma artisans "also get assistance while onboarding on Udyam Assist Platform", which gives a "Udyam Registration Number" | [S14] p.5 | NOT FOUND |
| Shops & Establishments / panchayat licence | State Acts | Workshop premises | NOT FOUND | NOT FOUND | State labour dept / panchayat | — | ⚠ | NOT FOUND for each of the 5 States |
| Electricity connection (welding load, 3-phase) | State supply code / tariff order | New commercial or industrial connection | NOT FOUND | NOT FOUND | DISCOM | — | ⚠ | NOT FOUND for each of the 5 States |
| Gas cylinders for cutting (oxy-acetylene) | Gas Cylinders Rules ⚠ | Storing cylinders | NOT FOUND ⚠ | — | PESO ⚠ | — | ⚠ | — |

---

## 7. Scheme fit

### 7.1 NSFDC first

| Item | Micro Finance Scheme (MFS) | Term Loan |
|---|---|---|
| Project cost | "units costing up to ₹1.40 lakh" [S1] | "more than ₹1.40 lakh and up to ₹50.00 lakh" [S1] |
| Loan | "The maximum loan limit is ₹1.25 lakh" [S1] | "up to ₹45.00 lakh" [S1] |
| Share of cost | "In all schemes, NSFDC provides up to 90% of the project cost." [S1]. So the own share is at least 10%, more when the cap binds | same [S1] |
| Interest | "6.5% p.a." [S1] | "8% p.a." [S1] |
| Channel | "Implemented via SCAs/CAs." [S1] | "Implemented via SCAs/CAs." [S1] |
| Repayment | "quarterly installments within 3 years (including a 3-month moratorium)" [S1] | "within 7 years (including a 6-month moratorium…)" [S1] |
| Who | SC with a valid caste certificate; "Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026)" [S1]. "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold" [S1] | same [S1] |
| Fits D15? | Probably. NSFDC's list includes "Service & Transport Sector (e.g., retail shops, repair centers" [S1]. Whether a welding-and-tools kit fits under ₹1.40 lakh is NOT FOUND (no prices) | Yes, for a larger garage [S1]. Project cost NOT FOUND |

**Women.** "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries." [S1]

**Watch the channel.** Two other NSFDC schemes cover the same project sizes at much higher interest [S1]:

| NSFDC scheme | Project size | Channel | Interest | Tag |
|---|---|---|---|---|
| Aajeevika Micro-Finance Yojana (AMY) | "projects costing up to ₹1.40 lakh" | NBFC-MFIs | "15% p.a." | [S1] |
| Udyam Nidhi Yojana (UNY) | "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh" | "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a." | 13% / 15% | [S1] |

**App rule (our design choice).**
- Quote 6.5% only for the MFS loan and 8% only for the Term Loan, both "Implemented via SCAs/CAs." [S1].
- IF the lender is an MFI, cooperative bank or small finance bank THEN warn: "This may be AMY or UNY at 13–15%." [S1]
- IF the lender is a public sector bank or regional rural bank THEN say: "Confirm the rate with the lender." NSFDC's partners include "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)", and its FAQ says "rates vary slightly by scheme and channelizing agency" [S1].

**Two more NSFDC services to show the user** [S1]:

| Service | What it is | Tag |
|---|---|---|
| Online application | "Online Mode (PM-SURAJ Portal)" | [S1] |
| Free skill training (e.g. mechanic up-skilling) | "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period" | [S1] |

**How to apply** [S1]:
- NSFDC does not take applications directly: "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."
- Offline applications go with "a valid caste certificate, income proof, KYC documents" and the agency's checklist.

Note: [S1] is a MoSJE development-site copy (devmosje.negd.in). Confirm on nsfdc.nic.in ⚠.

### 7.2 Other schemes

| Scheme | Who qualifies | Min. size | Benefit | Own share | Period / open now? | Negative list | Combine with NSFDC loan? | Tag |
|---|---|---|---|---|---|---|---|---|
| **PMEGP** | Any individual above 18; "There will be no income ceiling". Class VIII pass for projects "above Rs.10 lakh in the manufacturing sector and above Rs. 5.00 lakh in the business /service sector". New projects only; "Projects without Capital Expenditure are not eligible". "The ‘Family’ includes self and spouse." | NOT FOUND | Subsidy for "Special (including SC…)": 25% urban, **35% rural** | **5%** (special category) | Undated summary (2022-11 web folder). **Status after March 2026: NOT FOUND** | The summary points to "the negative list of the guidelines (Para 30…)", which is not in the summary. The pre-revision list (Para 29, p.23) does not name repair in its readable text; the scan is partly garbled ⚠ | **Unclear ⚠.** (1) "the units that have already availed Government Subsidy under any other scheme… are not eligible". (2) "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks". An NSFDC loan through an SCA may not fit this structure | [S9] pp.2–3; [S10] pp.23, 36 |
| **PMEGP and NSFDC together** | PMEGP lists its financing institutions as "All Public Sector Banks", "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI" and "Small Industries Development Bank of India (SIDBI)". **NSFDC and SCAs are not listed**; the implementing agencies name "National Scheduled Tribes Finance and Development Corporation (NSTFDC)" but not NSFDC. Also: "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" are not eligible | — | — | — | — | — | **So the PMEGP bank loan cannot be the NSFDC loan, and a unit already set up with an NSFDC (Government of India) loan is likely shut out of a PMEGP first loan** (our reading) ⚠ | [S9] pp.3–5 |
| PMEGP bank loan terms | — | — | "The Bank will sanction 90% of the project cost in case of General Category of beneficiary/institution and 95% in case of special category". Interest: "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years". **So the PMEGP bank loan is at the bank's normal rate, not NSFDC's 6.5% or 8%** [S1] | — | — | — | — | [S9] pp.5–6 |
| PMEGP limits | — | — | Working capital: "for units under Service-Trading Sector the working capital shall not be more than 60% of the project cost" (manufacturing: "not be more than 40%"). Capital per worker: "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas" | — | — | — | — | [S9] p.6 |
| PMEGP negative list (pre-revision) | — | — | Item (b) of the clearer copy reads "Animal Husbandry like Pisciculture, Piggery, Poultry, Harvester machines etc." A garage that also runs **harvester hiring** may be excluded for that part (our reading). The revised list (Para 30) was not opened ⚠ | — | — | — | — | [S10] p.36 |
| PMEGP 2nd loan (upgradation) | Only for "existing PMEGP/REGP/MUDRA units", where the "First loan under PMEGP/MUDRA/REGP has to be successfully repaid" | — | "15%" subsidy ("20% for NER and Hill States"); project caps "Rs. 1.00 Crore" (manufacturing) and "Rs. 25.00 lakh" (service). Also needs: "Margin Money (Subsidy) claimed under PMEGP has be successfully adjusted on the completion of lock in period of 3 years" and "The unit is profit making" | 10% | — | — | A garage first funded by NSFDC is not a PMEGP/REGP/MUDRA unit, so this route looks closed (our reading) ⚠ | [S9] pp.2–3 |
| PMEGP cost cap | — | — | "Rs. 50.00 lakh" (manufacturing); "Rs. 20.00 lakh" (business/service). **Which applies to a repair garage: NOT FOUND ⚠** | — | — | — | — | [S9] p.2 |
| PMEGP, workshop rent | — | — | "Cost of the ready built as well as long lease or rental Work-shed/Workshop can be included in the project cost", "for a maximum period of 3 years only" | — | — | — | — | [S9] p.3 |
| **PM Vishwakarma** | Must be "Engaged in one of the mentioned 18 family-based traditional trades" and "working with bare hands and tools" [S14] p.3. The list of 18 trades is not in the saved copy: NOT FOUND ⚠ | — | — | — | — | — | **Two blocks.** (1) A powered repair garage is not a family-based traditional trade (our reading). (2) "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years" [S14] p.3. An NSFDC loan may count as such a scheme; whether it does is NOT FOUND ⚠ | [S14] p.3 |
| **MUDRA** | Loan tiers: NOT FOUND in this session (mudra.org.in did not open ⚠). See the D18 dossier for the tiers from a saved copy | — | — | — | — | — | NOT FOUND | ⚠ |

**When D15 does NOT fit:**
- PMEGP, first loan: only for new projects. "Assistance under the Scheme is available only for new projects" [S9] p.2. An existing garage can use only the 2nd-loan (upgradation) route, and only if it was first funded under PMEGP, REGP or MUDRA [S9] pp.2–3.
- PMEGP: not for a unit that already took a Government subsidy, nor for "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government)" [S9] p.3. A garage already funded by an NSFDC loan is likely excluded (our reading) ⚠.
- PMEGP: the harvester-hiring part of a business may fall on the negative list (pre-revision, [S10] p.36) ⚠.
- PM Vishwakarma: not for the garage business as such, and possibly blocked for 5 years by an NSFDC loan [S14] p.3 ⚠.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Harvest-time overload (framework key risk), then idle months | NOT FOUND | Queue of tractors in harvest season | Needs §5 | — |
| Customer credit until harvest | Medium (our judgement) | Unpaid bills older than one season | IF udhaar is more than 30 days of sales THEN raise working capital and warn | Threshold is our design choice |
| Single-buyer dependence (one custom-hiring operator or dealer sends most jobs) | Medium (our judgement) | One source is more than half of jobs | IF one source is more than 50% of jobs THEN warn and stress-test the EMI without it | Threshold is our design choice |
| Single-supplier dependence (spare parts from one dealer) | NOT FOUND | One dealer for all parts | IF one supplier only THEN ask for a second | Our design choice |
| Wrong pollution category (Orange if servicing, painting, battery charging, tyre vulcanising or authorised service centre) | Medium (our judgement) | Unit plans any of these | IF yes THEN show Orange and the consent step. (Painting as an Orange trigger is our design choice: the "Automobile service stations/ workshops" row covers it [S5] p.62; no separate painting row was used) | [S5] pp.4, 36, 61, 62 |
| Used-oil handling | NOT FOUND | Oil drums piling up | See §6 | ⚠ |
| Welding burns, eye injury, fire | NOT FOUND | — | Show a safety checklist (our design choice) | — |

**SWOT (both sizes).**

| | Micro Finance (≤ ₹1.40 lakh) [S1] | Term Loan [S1] |
|---|---|---|
| Strengths | Welding and implement repair are in the same NIC class as tractor repair [S2] p.91, so one small shop can offer both | Machine shop can take bigger jobs; NOT FOUND |
| Weaknesses | No official prices, OpEx or seasonality | Same; plus a higher chance of an Orange category if it services vehicles [S5] p.62 |
| Opportunities | PMEGP 35% rural subsidy for SC (if open after March 2026 ⚠) [S9] | Same |
| Threats | Harvest-season credit; unquantified lean months | Same, plus a larger EMI in lean months |

**Competitor density in a block.** No official block-level count of tractor garages was found. Options, in order:
1. ASUSE unit-level data at district level for NIC 33124 / 331204 [S2][S3]: NOT FOUND in the fact sheet.
2. Udyam registrations by NIC code and district (Udyam portal ⚠, not opened).
3. Field count: ask the nearest tractor dealers how many independent garages work in the block (our survey).

---

## Source log

| Tag | Title | Issuer | URL (deep link) | Exact words used | Date opened | Saved copy |
|---|---|---|---|---|---|---|
| S1 | FAQ – National Scheduled Castes Finance and Development Corporation | MoSJE (dev-site copy) | https://devmosje.negd.in/?p=15629 | "units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a."; "more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a."; "In all schemes, NSFDC provides up to 90% of the project cost."; "Implemented via SCAs/CAs."; "at an interest rate of 15% p.a."; "Service & Transport Sector (e.g., retail shops, repair centers"; "(applicable to both rural and urban areas, effective January 7, 2026)"; "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh"; "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a."; "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)"; "rates vary slightly by scheme and channelizing agency"; "Online Mode (PM-SURAJ Portal)"; "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT)"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold"; "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries."; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period"; "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."; "a valid caste certificate, income proof, KYC documents"; "Annual family income from all sources must not exceed ₹5.00 Lakhs" | 09 Nov 2026 | _shared/NSFDC_devmosje_p15629.html |
| S2 | National Industrial Classification 2008, p.91 (PDF page) | MoSPI | https://mospi.gov.in/sites/default/files/main_menu/national_industrial_classification/nic_2008_17apr09.pdf | "33124 Repair and maintenance of agricultural machinery and forestry and logging machinery including agricultural tractors"; "the provision of welding (e.g. automotive, general) repair services; the repair of agricultural and other heavy and industrial machinery" | 09 Nov 2026 | _shared/NIC_2008.pdf |
| S3 | National Industrial Classification 2025, pp.137–138 (PDF pages) | MoSPI | https://mospi.gov.in/uploads/publications_reports/publications_reports1763457214315_c3e5d4f3-8e25-4775-85e3-ad42d571652f_NIC_2025_Final.pdf | "331204 Repair and maintenance of agricultural machinery and forestry and logging machinery including agricultural tractors"; "the provision of welding (e.g. automotive, general) repair services"; "repair and maintenance of engines for motor vehicles, see 9531"; "331199"; "Repair and maintenance of other fabricated metal"; "products n.e.c. including Mobile welding repair" | 09 Nov 2026 | _shared/NIC_2025.pdf |
| S4 | Fact sheet ASUSE 2025, pp.6, 16 | MoSPI | https://www.mospi.gov.in/uploads/latestreleasesfiles/1777360756062-publications_reports1774347275480_658da785-11e1-4df3-9f02-27e08a8675f6_Factsheet_ASUSE_2025-f.pdf | "3,97,477"; "4,24,139"; "This will also include those units which are primarily engaged in providing manufacturing services such as maintenance and repair of industrial, commercial and similar machinery and equipment." | 09 Nov 2026 | _shared/ASUSE_2025_Factsheet.pdf |
| S5 | List of Sectors Classified by Central Pollution Control Board (As on 24th August 2026), pp.4, 11, 12, 24, 36–37, 49, 53, 61–62 | CPCB | https://cpcb.gov.in/uploads/Sectors_Classified_by_CPCB.pdf | "51.0 Engineering and fabrication units (dry process without any heat treatment / metal surface finishing operations / painting)"; "189.0 Assembling units and mechanical workshops (without heat/surface treatment or spray painting)"; "20.0 White"; "17.10.2025"; "9.0 Automobile service stations/ workshops"; "75.5 Orange"; "assembling & charging of acid lead battery on micro scale"; "76.0 Orange"; "142.2 Tyres and tubes vulcanization/ hot retreading"; "61.8 Orange"; "148.0 Tyre retraders"; "5.2 Railway locomotive work shop/ Integrated road transport workshop/ Authorized service centers (wastewater generation <10 KLD)"; "79.0 Orange"; "45.0 Diesel pump repairing and servicing (complete mechanical dry process)"; "209.0 Metal fabrication works and hand tool manufacturing through machines (without heat/surface treatment or spray painting)"; "The used oil/waste oil generated during repair and maintenance need to be disposed through authorized hazardous waste recycler" | 09 Nov 2026 | _shared/CPCB_Sectors_Classified.pdf |
| S6 | MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 598(E) 08.07.2026 (compiled), pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_airact.pdf | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; "17. Engineering and fabrication units dry process without any heat treatment or metal surface finishing"; "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)"; "14. Diesel pump repairing and servicing (complete mechanical dry process)"; "78. Metal fabrication works and hand tool manufacturing through machines (without heat or surface treatment or spray painting)"; "G.S.R. 761(E)"; "New Delhi, the 8th July, 2026"; "G.S.R. 598(E)"; "29th July, 2025" | 09 Nov 2026 | _shared/CPCB_White_exemption_airact.pdf |
| S7 | MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendments incl. G.S.R. 599(E) 08.07.2026 (compiled), pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_wateract.pdf | "all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed"; "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)"; "G.S.R. 511(E)"; "G.S.R. 599(E)"; "G.S.R. 762(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_wateract.pdf |
| S8 | Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 3–4 | Maharashtra Pollution Control Board | https://mpcb.gov.in/sites/default/files/standing_orders/Circular_White_Category_MPCB_16062025.pdf | "Engineering workshop, machine shop, fabrication shop, smithy shop, turning shop, cutting shop"; "Fabricating units for tractor trailer, agricultural equipment etc. (without electroplating, spray painting & powder coating)"; "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board"; "Fabricating units for vehicle parts without electroplating, heat treatment, spray painting and powder coating"; "Automobile Body building (without wet process)" | 09 Nov 2026 | _shared/MPCB_White_Circular_16062025.pdf |
| S9 | Salient Features of Revised PMEGP, pp.2–3, 5–6 (undated; web folder 2022-11) | Delhi Khadi & Village Industries Board | https://dkvib.delhi.gov.in/sites/default/files/2022-11/salient-features-of-revised-ppmegp.pdf | Special category "05%" own, "25%" urban, "35%" rural; "manufacturing sector is Rs. 50.00 lakh"; "business/service Sector is Rs. 20.00 lakh."; "There will be no income ceiling"; "Assistance under the Scheme is available only for new projects"; "the units that have already availed Government Subsidy under any other scheme of Government of India or State Government are not eligible"; "Projects without Capital Expenditure are not eligible for Financing under the scheme."; "for a maximum period of 3 years only"; "The ‘Family’ includes self and spouse."; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks."; "The Bank will sanction 90% of the project cost in case of General Category of beneficiary/institution and 95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years"; "for units under Service-Trading Sector the working capital shall not be more than 60% of the project cost"; "not be more than 40%"; "does not exceed Rs. 3 lakh in Plain areas and Rs. 4.5 lakh in hilly areas"; "2nd loan for upgradation of existing PMEGP/REGP/MUDRA units"; "First loan under PMEGP/MUDRA/REGP has to be successfully repaid"; "20% for NER and Hill"; "Rs. 1.00 Crore"; "Rs. 25.00 lakh"; "Margin Money (Subsidy) claimed under PMEGP has be successfully adjusted on the completion of lock in period of 3 years"; "The unit is profit making"; "All Public Sector Banks."; "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI."; "Small Industries Development Bank of India (SIDBI)."; "National Scheduled Tribes Finance and Development Corporation (NSTFDC)"; "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" | 09 Nov 2026 | _shared/PMEGP_Revised_Salient_DelhiKVIB.pdf |
| S10 | Guidelines on PMEGP (pre-revision scan), pp.23, 36, Para 29 | KVIC copy on a Government server | https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2023/03/2023031676.pdf | "Negative List of Activities"; "The following list of activities will not be permitted under PMEGP"; "Animal Husbandry like Pisciculture, Piggery, Poultry, Harvester machines etc." | 09 Nov 2026 | _shared/PMEGP_Guidelines_s3waas_2023-03.pdf |
| S11 | CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 | CBIC | https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "persons making any inter-State taxable supply"; "the expression ―special category States‖ shall mean the States as specified"; "Arunachal Pradesh, Assam, Himachal Pradesh"; "aggregate turnover in a financial year exceeds ten lakh rupees" | 09 Nov 2026 | _shared/CGST_Act_updated_31082021.pdf |
| S12 | Notification No. 10/2019-Central Tax | Ministry of Finance | https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | 09 Nov 2026 | _shared/GST_Notfn_10_2019_CT.pdf |
| S13 | Fact Sheet on HCES 2023-24, pp.4, 12 (Statement 7) | MoSPI | https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf | "Statement 7: Average MPCE for each State/UT in 2023-24"; "‘MPCE estimates with imputation’ are presented in Section II" | 09 Nov 2026 | _shared/HCES_FactSheet_2023-24.pdf |
| S14 | PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), p.3 | PIB | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc2025916638501.pdf | "Engaged in one of the mentioned 18 family-based traditional trades"; "working with bare hands and tools"; "No loans should have been availed under a similar credit-based scheme of the Central/State government for self-employment/business development in the past 5 years"; "assistance while onboarding on Udyam Assist"; "Udyam Registration Number" | 09 Nov 2026 | _shared/PM_Vishwakarma_PIB_Sep2025.pdf |
| S15 | Project Report of Fabrication of Grills, Gates and Fence, pp.2, 6–7 (undated) | UP MSME 1-Connect portal, Government of Uttar Pradesh | https://msme1connect.up.gov.in/Projectreport/Project%20Report638665747150126666.pdf | "Welding Machine Nos 2 25000 50000"; "Hand Drills and tools Nos 1 20000 20000"; "We can modify the project capacity and project cost as per your requirement." | 09 Nov 2026 | D20/UP_MSME_Grills_Gates.pdf |
| S16 | List of 320 business categories with project-report links (compiled by us from msme1connect.up.gov.in/Home/BusinessDetails?Id=1 to 320) | UP MSME 1-Connect portal | https://msme1connect.up.gov.in/Home/BusinessDetails?Id=83 | "Fabrication of Grills & Gates"; "Electric Motor Winding" | 09 Nov 2026 | _shared/UP_MSME_portal_categories.txt |

## Quality gates (researcher)

| Gate | Result |
|---|---|
| G1 Every number tagged | Pass, per the check script |
| G3 FSSAI | Not applicable (no food) |
| G4 GST | Pass with ⚠: ₹20 lakh applies (not goods-only; our reading); GST classification NOT FOUND |
| G5 Pollution category | **Partial ⚠**: White if only mechanical repair and dry fabrication [S5][S6][S7][S8]. Orange if it counts as an "Automobile service station/workshop", charges lead-acid batteries, vulcanises tyres, or is an authorised service centre [S5] pp.4, 36, 61–62. The State board decides. Used-oil rules not opened |
| G6 Scheme open | PMEGP after March 2026 NOT FOUND |
| G7 Scheme fit | Done; PMEGP cap and NSFDC combination unclear ⚠ |
| G8 NSFDC tier first | Pass |
| G9 Seasonality | **Fail**: no source; needs field survey |
| G10 Working capital from cycle days | **Fail**: formula given; all inputs NOT FOUND |
| G12 Biology | Not applicable |
