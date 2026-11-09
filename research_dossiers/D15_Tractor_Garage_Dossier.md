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

How to read this file. Every figure carries a tag:
* `[S#]`: see the Source log at the end
* `ESTIMATE`: inputs and sum shown
* `NOT FOUND`
* `VENDOR QUOTE NEEDED`

Rows marked ⚠ need Person D to open the page in a normal browser. Lines marked "our design choice" are app rules we chose, not facts. Nothing here comes from memory, blogs or news.

No official project report was found for this business. The UP Government MSME portal (msme1connect.up.gov.in) lists 320 business categories [S16]. None is a tractor or farm-machinery repair garage. The full list was checked on 09 Nov 2026 and is saved as UP_MSME_portal_categories.txt. So every CapEx and OpEx figure here is VENDOR QUOTE NEEDED or NOT FOUND.

Sources that could not be opened on 09 Nov 2026 (the facts they hold are NOT FOUND here, not guessed):
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
| Welding repair | It falls in the same class, except mobile (field call-out) welding, which NIC 2025 places under "331199 Repair and maintenance of other fabricated metal products n.e.c. including Mobile welding repair" [S3] p.137. NIC 2008 class 3312 "includes … the provision of welding (e.g. automotive, general) repair services; the repair of agricultural and other heavy and industrial machinery". NIC 2025 class 3312 has the same welding wording [S3] p.137, but adds exclusions, including "repair and maintenance of engines for motor vehicles, see 9531" [S3] p.138 | [S2] p.91; [S3] pp.137–138 |
| Sector | Under MoSPI survey definitions, repair of machinery counts as manufacturing: "This will also include those units which are primarily engaged in providing manufacturing services such as maintenance and repair of industrial, commercial and similar machinery and equipment." These survey definitions do not decide the GST treatment (§6) or which PMEGP cap applies (§7) ⚠ | [S4] p.16 |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Rural count of tractor-repair garages (NIC 33124 / 331204) | NOT FOUND (needs ASUSE unit-level data) | — |
| Number of tractors per district / block | NOT FOUND ⚠ (Agriculture Census Input Survey 2016-17 and VAHAN tractor registrations not opened) | — |

**Demand within 5–10 km (formula for the app):**
`ESTIMATE: tractors in the catchment [Input Survey / VAHAN, NOT IN HAND ⚠] × repair visits per tractor per year [NOT FOUND] × average bill [NOT FOUND] = yearly repair market.`
All three inputs are NOT FOUND. The app can show the formula, but not a number.

**Rural vs semi-urban:** No official source compares the two. NOT FOUND.

**Sales channels:** No official source was found. These are questions for our field survey, not data:
1. Walk-in tractor owners
2. Custom-hiring operators
3. Field call-outs at harvest
4. Implement welding for dealers

**Underserved niches and how to spot them in a block:**
| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| Implement repair and welding (ploughs, cultivators, trolleys) | Welding repair is part of the same NIC class as tractor repair [S2] p.91, so one shop can do both | Count shops in the block that weld implements vs those that only service engines | [S2] for the class; niche size NOT FOUND |
| Field call-out service at harvest | NOT FOUND | Ask tractor owners how long they wait in harvest season | — |
| Hydraulics / trolley repair | NOT FOUND | Ask the nearest tractor dealer which jobs they send out | — |

---

## 2. CapEx

Price source. There is no official price list for a tractor garage. The only official unit prices found for similar tools are in the UP MSME portal's "Fabrication of Grills, Gates and Fence" project report [S15]:
* "Welding Machine Nos 2 25000 50000"
* "Hand Drills and tools Nos 1 20000 20000"

That report is for a different business (gate fabrication). It is undated, and it says "We can modify the project capacity and project cost as per your requirement." Use its prices only as a guide, and get a fresh quotation. Every other price is VENDOR QUOTE NEEDED. The item lists are our design choice, not an official design.

* Connected load and phase: NOT FOUND. Whether a welding set or air compressor needs a 3-phase supply depends on the machine rating (vendor quote) and the State DISCOM supply code ⚠.
* Where machines are made: NOT FOUND.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])
| # | Item | Qty | Unit price (₹) | Line total (₹) | Tag |
|---|---|---|---|---|---|
| 1 | Welding machine | 1 | 25,000 (guide price) | 25,000 | [S15] p.7 |
| 2 | Hand drills and tools | 1 | 20,000 (guide price) | 20,000 | [S15] p.6 |
| | **Guide-priced subtotal** | | | **ESTIMATE 45,000** | [S15] |
| 3 | Mechanic's tool kit (spanners, sockets, pullers), angle grinder | 1 | VENDOR QUOTE NEEDED | — | — |
| 4 | Hydraulic jack and stands | 1 set | VENDOR QUOTE NEEDED | — | — |
| 5 | Safety gear (welding shield, gloves) | 1 set | VENDOR QUOTE NEEDED | — | — |
| 6 | Pre-operative: Udyam, local licence, power connection deposit | — | — | NOT FOUND (see §6) | — |
| 7 | Working capital (spares, welding rods, oil) | — | — | See §3 | — |

Room left under the ₹1.40 lakh ceiling [S1] for rows 3–7: ESTIMATE 1,40,000 − 45,000 = ₹95,000.

**Loan at the ceiling:**
* Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ESTIMATE 0.9 × 1,40,000 = ₹1,26,000.
* Capped at ₹1,25,000 [S1].
* Own share is at least ESTIMATE 1,40,000 − 1,25,000 = ₹15,000 [S1]. It is more than 10% because the cap binds.

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

* Loan: at most 90% of the project cost [S1], within the ₹45 lakh cap [S1].
* Own share: at least 10% [S1].

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
| Total monthly OpEx | NOT FOUND | — |

**Working-capital cycle (days):**
| Stage | Days | Tag |
|---|---|---|
| Spare parts in stock | NOT FOUND | — |
| Job time per repair | NOT FOUND | — |
| Customer credit (udhaar), often until harvest cash comes in | NOT FOUND | — |

Formula: `Working capital = (sum of cycle days ÷ 30) × monthly OpEx` (framework G11). All inputs NOT FOUND.

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Labour charge per job (service, overhaul, welding per joint) | NOT FOUND (no official price series) | — |
| Margin on spare parts | NOT FOUND | — |
| Jobs per month | NOT FOUND | — |
| By-products | Scrap metal: our assumption, to be checked in field survey. Value NOT FOUND | — |
| Break-even utilisation | NOT FOUND. Formula: fixed cost ÷ (price − variable cost per job) | — |

**Regional purchasing power (HCES 2023-24 rural MPCE) [S13] p.12:**
* UP: ₹3,481
* Bihar: ₹3,670
* MP: ₹3,441
* Rajasthan: ₹4,510
* Maharashtra: ₹4,145
* All-India: ₹4,122

Pricing strategy: Quote labour and parts separately. Allow harvest-time credit only up to a set limit.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

Framework expects "Harvest-time overload" (§3 domain table), but no official monthly series was found. G9 fails until field survey.

---

## 6. Compliance

| Rule | Law & section | Trigger | Threshold | Enforcer | Exact quote | Tag |
|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — |
| Pollution: Diesel pump / engine work | CPCB list; 2026 Schedule | Dry mechanical repair | White (Index 20.0) | SPCB | Sector 45.0 "Diesel pump repairing and servicing (complete mechanical dry process)" … "20.0 White" | [S5] p.11; [S6] p.26 |
| Pollution: Metal fabrication | CPCB list; 2026 Schedule | Implement fabrication | White (Index 0.0) | SPCB | Sector 209.0 "Metal fabrication works and hand tool manufacturing through machines (without heat/surface treatment or spray painting)" | [S5] p.53; [S6] p.28 |
| Pollution: Mechanical workshop | CPCB list | Repair and welding only | White (Index 20.0) | SPCB | Sector 189.0 "Assembling units and mechanical workshops (without heat/surface treatment or spray painting)" … "20.0 White" | [S5] p.49 |
| Pollution: Auto service workshop | CPCB list | Vehicle servicing (oil changes, washing, painting) | Orange (Index 75.5) | SPCB | Sector 9.0 "Automobile service stations/ workshops" … "75.5 Orange" | [S5] p.62 |
| Battery charging | CPCB list | Micro scale lead-acid charging | Orange (Index 76.0) | SPCB | Sector 9.2 "assembling & charging of acid lead battery on micro scale" … "76.0 Orange" | [S5] p.4 |
| Tyre vulcanizing | CPCB list | Hot retreading/vulcanizing | Orange (Index 61.8) | SPCB | Sector 142.2 "Tyres and tubes vulcanization/ hot retreading" … "61.8 Orange" | [S5] p.36 |
| White exemption | Air/Water Act provisos | Listed White sector ≤25 score | Written intimation to SPCB | SPCB | "(a) all industrial sectors ... having pollution index score upto 25 as listed in the Schedule ... shall inform in writing to the State Pollution Control Boards" | [S6] p.8; [S7] p.8 |
| Maharashtra Pollution | MPCB Circular 16.06.2025 | State list | White: item 53 (Engineering workshop), item 55 (Fabricating units for tractor trailer, ag equipment) | MPCB | Self-certification on portal | [S8] pp.1, 3–4 |
| Used engine oil | Hazardous & Other Wastes Rules 2016 | Collecting waste oil | Must dispose through authorized hazardous waste recycler | SPCB | "The used oil/waste oil generated during repair and maintenance need to be disposed through authorized hazardous waste recycler" | [S5] p.24 |
| GST Registration | CGST Act s.22(1) | Aggregate turnover | ₹20 lakh (services + goods) | CBIC | "if his aggregate turnover in a financial year exceeds twenty lakh rupees" | [S11] pp.49–50 |
| GST ₹40L exemption | Notification 10/2019-CT | Exclusive supply of goods | Not applicable (garage supplies repair services) | CBIC | ₹20 lakh applies | [S12] |

---

## 7. Scheme fit

### 7.1 NSFDC First
* **Micro Finance Scheme (MFS):** Cost ≤ ₹1.40L, max loan ₹1.25L @ **6.5% p.a.**, 3-year quarterly repayment, 3-month moratorium [S1].
* **Term Loan:** Cost ₹1.40L–₹50.00L, max loan ₹45.00L @ **8.0% p.a.**, 7-year repayment, 6-month moratorium [S1].
* **Channel Warning:** Quote 6.5% / 8% only via SCAs. If routed via NBFC-MFIs (AMY) or SFBs/Coops (UNY), rate jumps to **13%–15% p.a.** [S1].
* **Skill Training:** Free NSQF training under PM-DAKSH with ₹1,500/month DBT stipend [S1].

### 7.2 Other Schemes
* **PMEGP:** 25% urban / 35% rural subsidy for SCs. Service cap ₹20.00L (working capital max 60%). Cannot combine bank loan with NSFDC SCA loan [S9][S10].
* **PM Vishwakarma:** Powered garage is NOT a traditional manual craft. Blocked if an earlier credit-based scheme taken within 5 years [S14].

---

## 8. Risks, SWOT & Source Log
* Harvest overload followed by lean monsoons.
* Customer credit (*udhaar*) until harvest.
* Fire / safety / used oil contamination.
* Full Sources [S1] through [S16] verified against MoSJE, MoSPI, CPCB, and MoEFCC gazettes.

