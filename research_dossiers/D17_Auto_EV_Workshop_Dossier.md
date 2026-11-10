# D17 Auto & EV Workshop — sector dossier (SIH26091)

| Field | Value |
|---|---|
| Domain code | D17 |
| Short name | Auto_EV_Workshop |
| Domain | Two- and three-wheeler workshop, including e-rickshaw battery work |
| Basket | B5 Machinery Workshop, Vehicle & Pump Repair (गैराज, मोटर वाइंडिंग एवं वेल्डिंग) |
| Unit to study | 2W/3W, e-rickshaw battery (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

**How to read this file.**
- Every figure carries a tag:
  - `[S#]`: see the Source log at the end
  - `ESTIMATE`: inputs and sum shown
  - `NOT FOUND`
  - `VENDOR QUOTE NEEDED`
- Rows marked `⚠` need Person D to open the page in a normal browser.
- Lines marked "our design choice" are app rules we chose, not facts.
- Nothing here comes from memory, blogs or news.

**No official project report was found for this business.** The UP Government MSME portal's 320 business categories include no vehicle-repair workshop (see `UP_MSME_portal_categories.txt`). **So every CapEx and OpEx figure here is VENDOR QUOTE NEEDED or NOT FOUND.**

**Sources that could not be opened on 09 Nov 2026** (the facts they hold are NOT FOUND here, not guessed):

| Source | What it would give |
|---|---|
| VAHAN dashboard (parivahan.gov.in) | 2W/3W/e-rickshaw registrations by district |
| Hazardous and Other Wastes Rules 2016 text | Used oil (cpcb.nic.in certificate revoked) |
| CPCB guidelines for collecting and storing waste batteries | — |
| Fire-safety rules for battery charging | — |
| pmvishwakarma.gov.in, mudra.org.in, kviconline.gov.in | — |
| State DISCOM sites | — |

**Source copy note.** The Battery Waste Management Rules 2022 [S8] were read from a copy hosted on a government court website (thc.nic.in), not on the MoEFCC or e-Gazette site.
- Its later note says the rules were amended by "S.O. 4669(E), dated the 25th October, 2023, G.S.R. 190(E), dated the 14th March, 2024, S.O. 2374 (E), dated 20th June, 2024 and S.O. 5210 (E), dated 3rd December, 2024" [S8] p.27. Only the last amendment, S.O. 958(E) of 24.02.2025, is in the copy.
- **So every quote from these rules is "as originally notified" ⚠.** Rules 7, 8 and 13 may have changed since.
- **Date mismatch:** the notice is dated "New Delhi, the 22nd August, 2022" [S8] p.1, but the 2025 note says the rules were published "dated the 24th August, 2022" [S8] p.27 ⚠.
- Person D should confirm all of this against the official Gazette ⚠.

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2008 code, 2W/3W repair | 45403 "Maintenance and repair of motor cycles, mopeds, scooters and three" wheelers | [S2] p.100 |
| NIC 2008 code, other motor vehicles | 45200 "Maintenance and repair of motor vehicles". The class includes "mechanical repairs, electrical repairs, … ordinary servicing, bodywork repair, … washing, polishing, etc. spraying and painting, … tyre and tube repair" | [S2] p.99 |
| NIC 2025 code, 2W/3W repair | 953200 "Repair and maintenance of motor cycles, mopeds, scooters and three wheelers" | [S3] p.250 |
| NIC 2025 code, other motor vehicles | 953100 "Repair and maintenance of car, trucks, buses and other motor vehicles" | [S3] p.250 |
| NIC 2025 note | NIC 2025 moved vehicle repair to Division 95 (services). Class 9532 excludes "repair and maintenance of bicycles, e-bikes, monowheels, hoverboards, kick scooters, see 9529" | [S3] p.250 |
| App rule (our design choice) | Use 45403 / 953200 for a 2W/3W and e-rickshaw workshop | — |
| Sector | **Service** under NIC 2025 (Division 95) [S3] p.250. Whether PMEGP treats it as service: NOT FOUND ⚠ | [S3] |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Number of 2W/3W/e-rickshaws by district | NOT FOUND ⚠ (VAHAN not opened) | — |

**Demand within 5–10 km (formula for the app).**
`ESTIMATE: registered 2W/3W/e-rickshaws in the catchment [VAHAN, NOT IN HAND ⚠] × services per vehicle per year [NOT FOUND] × average bill [NOT FOUND]`.
All inputs are NOT FOUND.

**Rural vs semi-urban.** No official comparison was found: NOT FOUND.

**Sales channels.** No official source was found. These are field-survey questions, not data:
- walk-in riders
- e-rickshaw fleet owners
- dealers passing on out-of-warranty work
- roadside call-outs

**Underserved niches and how to spot them in a block.**

| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| E-rickshaw battery and motor work | Batteries are covered by new rules that apply to "all types of batteries regardless of chemistry" [S8] p.2. The rules set collection targets for producers for "Electric Vehicles (EV) Battery of E-rickshaw (three wheelers)" from "2024-25" [S8] p.16, so producers need registered partners. A registered refurbisher (§6) may face less competition (our reading) | Count e-rickshaws at the local stand, and ask drivers where they get batteries serviced | [S8] for the rule; demand NOT FOUND |
| 2W tyre and tube repair | Part of the NIC class: "tyre and tube repair, fitting or replacement" [S2] p.99 | Count puncture shops on the main road | Demand NOT FOUND |

---

## 2. CapEx

**Price source.** There is no official price list or project profile (see the top of this file). Every price is VENDOR QUOTE NEEDED. The item lists below are our design choice.

**Connected load and phase.** NOT FOUND. It depends on the compressor and battery chargers (vendor quote) and the State DISCOM code ⚠.

**Where machines are made.** NOT FOUND.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])

| # | Item | Qty | Unit price | Tag |
|---|---|---|---|---|
| 1 | Mechanic's tool kit (spanners, sockets, pullers) | 1 set | VENDOR QUOTE NEEDED | — |
| 2 | Air compressor (tyres, cleaning) | 1 | VENDOR QUOTE NEEDED | — |
| 3 | Battery tester / multimeter | 1 | VENDOR QUOTE NEEDED | — |
| 4 | Stand / ramp for 2W | 1 | VENDOR QUOTE NEEDED | — |
| 5 | Pre-operative: Udyam, local licence, power connection | — | NOT FOUND (see §6) | — |
| 6 | Working capital (spares, oil) | — | See §3 | — |

**Loan at the ceiling.**
- Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ₹1,26,000.
- That is capped at ₹1,25,000 [S1].
- So the own share is **at least** ₹15,000 [S1].

**App rule (our design choice):** a micro unit should **not** offer battery charging, battery reconditioning or vehicle washing. Those change its pollution category and registration duties (§6).

### 2b. Term Loan size (example: 2W/3W workshop with e-rickshaw battery service)

| # | Item | Qty | Unit price | Tag |
|---|---|---|---|---|
| 1 | Everything in 2a | — | VENDOR QUOTE NEEDED | — |
| 2 | Battery chargers (lead-acid / lithium) | — | VENDOR QUOTE NEEDED | — |
| 3 | Hydraulic lift / 3W ramp | 1 | VENDOR QUOTE NEEDED | — |
| 4 | Fire extinguishers, ventilation for the charging area | — | VENDOR QUOTE NEEDED | — |
| 5 | Covered, separate store for waste batteries | — | VENDOR QUOTE NEEDED | — |
| 6 | Shed rent deposit | — | NOT FOUND | — |
| 7 | Working capital | — | See §3 | — |

The loan is at most 90% of the project cost [S1], within the ₹45 lakh cap [S1], and the own share is at least 10% [S1]. Figures can't be filled until vendor quotes come in.

---

## 3. OpEx & working capital

| Monthly cost | Value | Tag |
|---|---|---|
| Rent | NOT FOUND (local) | — |
| Electricity (chargers, compressor) | NOT FOUND (State tariff) | — |
| Spares, oil, consumables | VENDOR QUOTE NEEDED | — |
| Mechanic / helper wages | NOT FOUND (State minimum-wage notices not opened) | — |
| Waste-battery and used-oil handover | NOT FOUND | — |
| **Total monthly OpEx** | **NOT FOUND** | — |

**Working-capital cycle (days).**

| Stage | Days | Tag |
|---|---|---|
| Spares in stock | NOT FOUND | — |
| Job time | NOT FOUND | — |
| Customer credit (udhaar), e.g. e-rickshaw drivers paying weekly | NOT FOUND | — |
| Supplier credit (spares dealer) | NOT FOUND | — |

**Formula** (framework G11): `Working capital = (sum of cycle days ÷ 30) × monthly OpEx`. All the inputs are NOT FOUND, so the result is NOT FOUND.

Survey questions:
- "How many days of spares do you keep?"
- "How long do fleet owners take to pay?"

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Labour charge per service (2W, 3W, e-rickshaw) | NOT FOUND (no official price series) | — |
| Margin on spares | NOT FOUND | — |
| Jobs per day | NOT FOUND | — |
| Break-even | NOT FOUND. Formula: fixed cost ÷ (price − variable cost per job) | — |

**Regional purchasing power.** HCES 2023-24 rural MPCE (monthly per-person spending), Statement 7, Rural column [S13] p.12:

| State | Rural MPCE (₹) | Ratio to all-India (ESTIMATE ÷ 4,122) |
|---|---|---|
| UP | 3,481 | 0.84 |
| Bihar | 3,670 | 0.89 |
| MP | 3,441 | 0.83 |
| Rajasthan | 4,510 | 1.09 |
| Maharashtra | 4,145 | 1.01 |
| All-India | 4,122 | 1.00 |

- These are the Section I figures. "‘MPCE estimates with imputation’ are presented in Section II" [S13] p.4.
- HCES lists "conveyance" spending of "313" rupees per person per month in rural areas, "7.59" per cent of spending [S13] p.9. That is the household budget that pays for vehicle running costs (our reading).

**Pricing strategy (our design choice).**
- Quote labour and parts separately.
- For e-rickshaw fleet owners, consider a monthly service contract.
- The base price is NOT FOUND.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |
| Reason | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

- No official monthly series was found.
- **Lean-month stress factor: NOT FOUND.**
- **G9 fails until our field survey fills this row.** Survey question: "In which months do you get the most and the fewest vehicles? Roughly how many in each?"

---

## 6. Compliance

All rows were opened on 09 Nov 2026 unless marked ⚠.

**Pollution: which category applies depends on what the workshop does.**

| Activity | Category | Exact quote | Tag |
|---|---|---|---|
| Automobile service station / workshop (servicing, washing, painting) | **Orange** (pollution index 75.5) | Service/Infrastructure list row "9.0 Automobile service stations/ workshops" … "75.5 Orange" (not the Industrial list's 9.0, which is battery manufacturing) | [S7] p.62 |
| Authorised service centre (dealer-tied, under 10 KLD wastewater) | **Orange** (79.0) | "5.2 Railway locomotive work shop/ Integrated road transport workshop/ Authorized service centers (wastewater generation <10 KLD)" … "79.0 Orange" | [S7] p.61 |
| Charging lead-acid batteries (micro scale) | **Orange** (76.0), if the board applies this row to a workshop (our reading ⚠: the row sits under "Battery manufacturing") | Industrial list row 9.2 "assembling & charging of acid lead battery on micro scale" … "76.0 Orange" | [S7] p.4 |
| Authorised service centre, 10 KLD of wastewater or more | **Red** (84.3) | "(wastewater generation ≥ 10 KLD)" … "84.3 Red" | [S7] p.61 |
| **Repairing electric motors (e-rickshaw motor work), dry process** | **White** (0.0) | "146.0 Repairing of electric motors and generators (dry mechanical process)" … "0.0 White"; 2026 Schedule "42. Repairing of electric motors and generators (dry mechanical process)" | [S7] p.36; [S9] p.26 |
| Tyre retreading | **White** (0.0): "148.0 Tyre retraders" … "0.0 White"; 2026 Schedule "44. Tyre retreaders". This **overlaps** with row 142.2 hot retreading = Orange (below). Which applies: NOT FOUND ⚠ | as quoted | [S7] p.37; [S9] p.26 |
| End-of-life vehicle collection only / with dismantling | **White** (collection only) / **Orange** (62.9) | "153.4 Scraping facilities for end-of-life vehicles, wagons and coaches having Collection Centers only (Without depollution, dismantling and shredding)" … "0.0 White"; "153.1 … Collection, Depollution and Dismantling (Without shredding)" … "62.9 Orange"; 2026 Schedule "45. Collection centres (without depollution, dismantling and shredding)" | [S7] p.41; [S9] p.27 |
| E-waste refurbishing (e.g. controllers, chargers) | **Green** (43.1) | "150.4 E-Waste refurbishing centres" … "43.1 Green" | [S7] p.39 |
| Where waste goes: used-oil recyclers | **Orange** (74.0) | "151.7 Recycling / reprocessing of waste oil" … "74.0 Orange" | [S7] p.40 |
| EV charging alone; vehicle washing alone | **NOT FOUND**: no standalone CPCB row | — | [S7] |
| Collecting waste batteries (as a collection centre) | **Green** (47.5) | "220.0 Waste Battery Collection Centres" … "47.5 Green". Such units should follow "Guidelines for Collection, Handling, Storage, and Transportation of Waste Batteries" | [S7] p.54 |
| Tyre and tube vulcanising (hot repair) | **Orange** (61.8) | "142.2 Tyres and tubes vulcanization/ hot retreading" … "61.8 Orange" | [S7] p.36 |
| Mechanical workshop only (no heat or surface treatment, no spray painting) | **White** (20.0), with written intimation to the SPCB [S9] p.8 | "189.0 Assembling units and mechanical workshops (without heat/surface treatment or spray painting)" … "20.0 White" | [S7] p.49 |

- The framework's "CPCB Orange ⚠" for auto workshops is **confirmed** by row 9.0 [S7] p.62.

**App rule (our design choice):**
- IF the workshop services vehicles (oil change, washing, painting), charges lead-acid batteries, or does hot tyre repair THEN show **Orange** and the consent step.
- ELSE IF it does only mechanical repair and dry e-rickshaw motor rewinding THEN show White (rows 189.0 and 146.0), with a written letter to the SPCB, and tell the user to confirm with the State board.
- Most real 2W/3W workshops do oil changes, so expect **Orange** (our reading).
- A dealer-tied service centre with 10 KLD or more of wastewater is **Red** [S7] p.61.

| Rule | Law & section | Trigger | Threshold | Govt fee | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — | — |
| **Battery Waste Management Rules 2022: who they cover** | S.O. 3984(E), 22.08.2022, Rule 2 | Handling any battery | All batteries | — | SPCB / CPCB | "These rules shall apply to, –(i) Producer, dealer, consumer, entities involved in collection, segregation, transportation, re-furbishment and recycling of Waste Battery; (ii) all types of batteries regardless of chemistry" | [S8] p.2 | — |
| **Repairing or reconditioning batteries = "Refurbisher"** | Rule 3(x), Rule 8 (as originally notified ⚠) | Repairing or reconditioning used batteries (how common this is for e-rickshaws: NOT FOUND) | No minimum quantity is stated (our reading) | NOT FOUND | SPCB | "‘Refurbishment’ means repairing, re-conditioning, re-purposing of used Battery for its second life"; "All refurbishers shall register with State Pollution Control Board on the centralised portal"; "make an application in Form 2(A) to the State Pollution Control Board for grant of one-time registration"; "Refurbishers shall furnish quarterly returns in Form 4", which "shall be filed by the end of the month succeeding the end of the quarter"; "Refurbisher shall not deal with any other entity not having registration mandated under these rules". **Before registering**, Form 2(A) asks for "Consent Validity a. Under Air Act, 1981 … b. Under Water Act, 1974", "Validity of Authorisation under rule 6 of the Hazardous Wastes (Management and Handling) Rules, 2016" and "registration with District Industries Centre" | [S8] pp.3–5, 22 | **App rule (our design choice):** IF the user will repair or recondition batteries THEN show these steps in order: (1) DIC/Udyam registration; (2) SPCB consent under the Air and Water Acts; (3) hazardous-waste authorisation; (4) refurbisher registration in Form 2(A); (5) quarterly Form 4 returns; (6) buy from and sell to registered entities only |
| **Selling refurbished batteries under the workshop's own brand = "Producer"** | Rule 3(u), Rule 4 | Selling refurbished batteries under its own brand | — | NOT FOUND | CPCB | A Producer includes an entity engaged in "sale of Battery including refurbished Battery, including in equipment, under its own brand produced by other manufacturers or suppliers"; producers "register through the online centralised portal as Producer in Form 1(A)" | [S8] p.3 | App rule (our design choice): IF the user will sell refurbished batteries under their own brand name THEN warn that Producer registration and EPR (extended producer responsibility, the duty to arrange collection and recycling) apply. Advise against this at micro scale |
| Consumer and facility duties | Rules 5 and 7(2) | Workshop as a battery user or collector | — | — | SPCB | Consumers must hand waste batteries "to an entity engaged in collection or refurbishment or recycling"; collectors must "ensure that a facility is in accordance with the standards or guidelines prescribed by the Central Pollution Control Board" | [S8] p.4 | Duties of a **dealer**: Rule 2 names "dealer", but no dealer-duty rule was found in the saved copy (NOT FOUND ⚠; it may be in the amendments) |
| Battery collection / handover | Rule 7 | Taking customers' old batteries | — | — | SPCB | "It shall be the responsibility of entities involved in collection, segregation and treatment to hand over Waste Battery to registered refurbisher or recycler" | [S8] p.4 | App rule (our design choice): IF the workshop takes back old batteries THEN hand them only to a **registered** refurbisher or recycler |
| Penalty (Environmental Compensation) | Rule 13 (as originally notified ⚠) | Working without registration; collectors "not following sound handling of Waste Battery" | **The rules set no amount.** The Implementation Committee "shall prepare and recommend guidelines for imposition and collection of Environmental Compensation" | Amount NOT FOUND | **SPCB** for refurbishers and collectors: "Environmental Compensation shall be levied by respective State Pollution Control Board on entities involved in refurbishment or recycling of Waste Battery as well as entities involved in collection, segregation and treatment" | "Environmental Compensation shall also be levied for the following activities based on polluter pays principle, – i. entities carrying out activities without registration as mandated under these rules" | [S8] pp.8–9 | — |
| **Used engine oil** | Hazardous and Other Wastes Rules 2016 | Oil changes | NOT FOUND ⚠ (rules text not opened) | NOT FOUND | SPCB | **Comparison only (different sector):** for gensets, CPCB says "The used oil/waste oil generated during repair and maintenance need to be disposed through authorized hazardous waste recycler" | [S7] p.24 (comparison) | App rule (our design choice): hand used oil only to an authorised recycler, and ask the SPCB whether the workshop needs authorisation |
| White: no consent, written intimation (listed White sectors only) | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) [S9] p.8. Water Act s.25 proviso: G.S.R. 703(E) 12.11.2024, para (a) replaced by G.S.R. 511(E) [S10] p.8. Both dated "28th July, 2025" on p.8; later notes give "29th July, 2025" ⚠. Schedules replaced by G.S.R. 761(E) [S9] p.16 / 762(E) [S10] p.16 (17.10.2025), then by G.S.R. 598(E) [S9] p.25 / 599(E) [S10] p.24 (08.07.2026) | Listed White sector | Pollution index **up to 25, and only if the sector is named in the Schedule**. A score of 25 or less alone does not exempt (e.g. Green rows scored 25.0 are not exempt) | — | SPCB | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; 2026 Schedule "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)" | [S9] pp.8, 27; [S10] p.8 | Only for a mechanical-only workshop |
| Pollution: Maharashtra | MPCB circular, 16.06.2025 | On the State list | **White** items that fit parts of the work: item 53 "Engineering workshop, machine shop, fabrication shop, smithy shop, turning shop, cutting shop"; item 153 "Motor Rewinding"; item 185 "Repairing of electric motors & generators (dry mechanical process)"; also "Automobile Body building (without wet process)" and "Automobile fuel outlets (only dispensing)" | NOT FOUND | MPCB | "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board" | [S11] pp.1, 3–4, 6–7 | No Maharashtra item covers **servicing with oil changes or washing**, so that work follows CPCB Orange (our reading). **Note:** Maharashtra's own White list does not by itself give the central written-intimation exemption, which covers only sectors named in the central Schedule [S9] p.8 (our reading) |
| **GST registration** | CGST Act s.22(1) | Aggregate turnover in a year | ₹20 lakh; ₹10 lakh in "special category States" | NOT FOUND | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees" | [S14] pp.49–50 | Special category = Article 279A(4)(g) States minus "Jammu and Kashmir" and "Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand" [S14] p.51. None of our 5 States is named. The Article 279A list was not opened ⚠ |
| GST ₹40 lakh goods-only limit | Notification 10/2019-CT | Only for "exclusive supply of goods" | ₹40 lakh | — | CBIC | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | [S15] | A workshop sells repair labour as well as parts, so it is very likely **not** "exclusively" a goods supplier. That means the ₹20 lakh limit applies (our reading) |
| GST: inter-State supply | CGST Act s.24(i) | Any inter-State taxable supply | Registration compulsory | — | CBIC | "persons making any inter-State taxable supply" | [S14] p.51 | Exemption for services: NOT FOUND ⚠ |
| Fire safety for battery charging | NOT FOUND ⚠ | Charging area | NOT FOUND | NOT FOUND | State fire service ⚠ | — | ⚠ | Framework key risk: "Battery fire" |
| Udyam registration | MSMED Act (section NOT FOUND) | NOT FOUND | NOT FOUND | NOT FOUND ⚠ | MoMSME | NOT FOUND | ⚠ | NOT FOUND |
| Shops & Establishments / panchayat licence | State Acts | Premises | NOT FOUND | NOT FOUND | State labour dept / panchayat | NOT FOUND | ⚠ | NOT FOUND |
| Electricity connection | State supply code | Chargers, compressor | NOT FOUND | NOT FOUND | DISCOM | NOT FOUND | ⚠ | NOT FOUND |

---

## 7. Scheme fit

### 7.1 NSFDC first

| Item | Micro Finance Scheme (MFS) | Term Loan |
|---|---|---|
| Project cost | "units costing up to ₹1.40 lakh" [S1] | "more than ₹1.40 lakh and up to ₹50.00 lakh" [S1] |
| Loan | "The maximum loan limit is ₹1.25 lakh" [S1] | "up to ₹45.00 lakh" [S1] |
| Share of cost | "In all schemes, NSFDC provides up to 90% of the project cost." [S1]. The own share is at least 10%, more when the cap binds | same [S1] |
| Interest | "6.5% p.a." [S1] | "8% p.a." [S1] |
| Channel | "Implemented via SCAs/CAs." [S1] | "Implemented via SCAs/CAs." [S1] |
| Repayment | "quarterly installments within 3 years (including a 3-month moratorium)" [S1] | "within 7 years (including a 6-month moratorium…)" [S1] |
| Who | SC with a valid caste certificate; "Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026)" [S1]. "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold" [S1] | same [S1] |
| Fits D17? | Yes. NSFDC lists "Service & Transport Sector (e.g., retail shops, repair centers, commercial vehicles, e-rickshaws)" [S1]. Whether a kit fits under ₹1.40 lakh: NOT FOUND (no prices) | Yes [S1]. Project cost NOT FOUND |

**Women.** "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries." [S1]

**Watch the channel.** Two other NSFDC schemes cover the same project sizes at much higher interest [S1]:

| NSFDC scheme | Project size | Channel | Interest | Tag |
|---|---|---|---|---|
| Aajeevika Micro-Finance Yojana (AMY) | "projects costing up to ₹1.40 lakh" | NBFC-MFIs | "15% p.a." | [S1] |
| Udyam Nidhi Yojana (UNY) | "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh" | "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a." | 13% / 15% | [S1] |

**App rules (our design choice):**
- Quote 6.5% only for the MFS loan and 8% only for the Term Loan, both "Implemented via SCAs/CAs." [S1].
- IF the lender is an MFI, cooperative bank or small finance bank THEN warn: "This may be AMY or UNY at 13–15%." [S1]
- IF the lender is a public sector bank or regional rural bank THEN say: "Confirm the rate." NSFDC's partners include "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)", and "rates vary slightly by scheme and channelizing agency" [S1].

**Two more NSFDC services** [S1]:

| Service | What it is | Tag |
|---|---|---|
| Online application | "Online Mode (PM-SURAJ Portal)" | [S1] |
| Free skill training (e.g. EV mechanic) | "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period" | [S1] |

**How to apply** [S1]:
- NSFDC does not take applications directly: "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."
- Offline applications go with "a valid caste certificate, income proof, KYC documents" and the agency's checklist.

Note: [S1] is a MoSJE development-site copy (devmosje.negd.in). Confirm on nsfdc.nic.in ⚠.

### 7.2 Other schemes

| Scheme | Who qualifies | Min. size | Benefit | Own share | Period / open now? | Negative list | Combine with NSFDC loan? | Tag |
|---|---|---|---|---|---|---|---|---|
| **PMEGP** | Any individual above 18; "There will be no income ceiling"; Class VIII pass for projects "above Rs. 5.00 lakh in the business /service sector"; new projects only; "Projects without Capital Expenditure are not eligible"; "The ‘Family’ includes self and spouse." | NOT FOUND | Subsidy for "Special (including SC…)": 25% urban, **35% rural** | **5%** | Undated summary (2022-11 web folder). **Status after March 2026: NOT FOUND** | The pre-revision list does not name vehicle repair in its readable text ⚠ | **Unclear ⚠.** "the units that have already availed Government Subsidy under any other scheme… are not eligible"; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks" | [S16] pp.2–3; [S17] p.23 |
| **PMEGP and NSFDC together** | PMEGP lists its financing institutions as "All Public Sector Banks", "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI" and "Small Industries Development Bank of India (SIDBI)". **NSFDC and SCAs are not listed**; the implementing agencies name "National Scheduled Tribes Finance and Development Corporation (NSTFDC)" but not NSFDC. Also: "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" are not eligible | — | — | — | — | — | **So the PMEGP bank loan cannot be the NSFDC loan, and a unit already set up with an NSFDC (Government of India) loan is likely shut out of a PMEGP first loan** (our reading) ⚠ | [S16] pp.3–5 |
| PMEGP bank terms and limits | — | — | "95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years" (the bank's rate, not NSFDC's 6.5%/8% [S1]). Service cap "Rs. 20.00 lakh". Service working capital "shall not be more than 60% of the project cost" | — | — | — | — | [S16] pp.2, 5–6 |
| **PM Vishwakarma** | Must be "Engaged in one of the mentioned 18 family-based traditional trades" [S18] p.3 | — | — | — | — | — | A vehicle workshop is not a family-based traditional trade (our reading). **Does NOT fit** ⚠ | [S18] p.3 |
| **MUDRA** | Tiers NOT FOUND this session (mudra.org.in did not open ⚠) | — | — | — | — | — | NOT FOUND | ⚠ |

**When D17 does NOT fit:**
- PM Vishwakarma: not a traditional trade (our reading of [S18] p.3).
- PMEGP: not for an existing workshop; "Assistance under the Scheme is available only for new projects" [S16] p.2.
- Any battery reconditioning without SPCB refurbisher registration risks Environmental Compensation [S8] p.8.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Battery fire while charging (framework key risk) | High (our judgement) | Charging in a closed room; swollen batteries | Show a charging-safety checklist (our design choice); official fire rules NOT FOUND ⚠ | — |
| Working without battery refurbisher registration | High (our judgement) | Repairing or reconditioning batteries | See §6 app rule | [S8] pp.4–5, 8 |
| Wrong pollution category (Orange for servicing, washing, charging) | Medium (our judgement) | Oil changes, washing bay | See §6 app rule | [S7] pp.4, 61–62 |
| Single-buyer dependence (one e-rickshaw fleet owner) | Medium (our judgement) | One customer is more than half of jobs | IF one customer is more than 50% of sales THEN warn, and stress-test the EMI without them | Threshold is our design choice |
| Single-supplier dependence (spares from one dealer) | NOT FOUND | One dealer only | IF one supplier only THEN ask for a second | Our design choice |
| Used-oil handling | NOT FOUND ⚠ | Oil drums pile up | See §6 | ⚠ |
| Lean months | NOT FOUND | — | Needs §5 | — |

**SWOT (both sizes).**

| | Micro Finance (≤ ₹1.40 lakh) [S1] | Term Loan [S1] |
|---|---|---|
| Strengths | NSFDC names "repair centers" and "e-rickshaws" in its list [S1]; White if mechanical repair only (no heat or surface treatment or spray painting, with a written letter to the SPCB) [S7][S9] | Battery service as a registered refurbisher [S8] |
| Weaknesses | No official prices, OpEx or seasonality | Orange category; registration and quarterly returns [S7][S8] |
| Opportunities | 2W tyre and repair work [S2] | E-rickshaw battery and motor work (demand NOT FOUND) |
| Threats | Dealer service centres (NOT FOUND) | Battery fire; penalties for working unregistered [S8] |

**Competitor density in a block.** No official block-level count was found. Options, in order:
1. The SPCB's list of registered battery refurbishers ⚠.
2. Udyam registrations by NIC code and district ⚠.
3. Field count (our survey).

---

## Source log

| Tag | Title | Issuer | URL (deep link) | Exact words used | Date opened | Saved copy |
|---|---|---|---|---|---|---|
| S1 | FAQ – National Scheduled Castes Finance and Development Corporation | MoSJE (dev-site copy) | https://devmosje.negd.in/?p=15629 | "units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a."; "more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a."; "In all schemes, NSFDC provides up to 90% of the project cost."; "Implemented via SCAs/CAs."; "at an interest rate of 15% p.a."; "Service & Transport Sector (e.g., retail shops, repair centers, commercial vehicles, e-rickshaws)"; "(applicable to both rural and urban areas, effective January 7, 2026)"; "projects costing up to ₹5.00 lakh"; "The maximum loan is ₹4.50 lakh"; "Cooperative Societies and Cooperative Banks at a beneficiary interest rate of 13% p.a., and through Small Finance Banks (SFBs) at 15% p.a."; "Public Sector Banks (PSBs) Regional Rural Banks (RRBs)"; "rates vary slightly by scheme and channelizing agency"; "Online Mode (PM-SURAJ Portal)"; "free, NSQF-compliant Skill Development Training Programmes for persons belonging to Scheduled Castes (between the ages of 18 and 45) under the PM-DAKSH Yojana"; "stipend of ₹1,500/- per month via Direct Benefit Transfer (DBT), subject to maintaining an overall attendance of 80% or above throughout the training period"; "Partnership firms and co-operative societies are eligible to apply for funding, provided that all members belong to the Scheduled Caste community and the annual family income of each individual member does not exceed the ₹5.00 lakh threshold"; "A target of 40% of the total funds under the Term Loan and Micro Finance Schemes is specifically allocated for women beneficiaries."; "Direct contact or correspondence by applicants/beneficiaries is not entertained by NSFDC. All loan applications must be routed through authorized State Channelizing Agencies (SCAs) or other Channelizing Agencies (CAs)."; "a valid caste certificate, income proof, KYC documents"; "Annual family income from all sources must not exceed ₹5.00 Lakhs" | 09 Nov 2026 | _shared/NSFDC_devmosje_p15629.html |
| S2 | National Industrial Classification 2008, pp.99–100 | MoSPI | https://mospi.gov.in/sites/default/files/main_menu/national_industrial_classification/nic_2008_17apr09.pdf | "45403 Maintenance and repair of motor cycles, mopeds, scooters and three"; "45200 Maintenance and repair of motor vehicles"; "mechanical repairs, electrical repairs, electronic injection systems repair, ordinary servicing, bodywork repair"; "tyre and tube repair, fitting or replacement" | 09 Nov 2026 | _shared/NIC_2008.pdf |
| S3 | National Industrial Classification 2025, p.250 | MoSPI | https://mospi.gov.in/uploads/publications_reports/publications_reports1763457214315_c3e5d4f3-8e25-4775-85e3-ad42d571652f_NIC_2025_Final.pdf | "953200 Repair and maintenance of motor cycles, mopeds, scooters and three wheelers"; "953100 Repair and maintenance of car, trucks, buses and other motor vehicles"; "repair and maintenance of bicycles, e-bikes, monowheels, hoverboards, kick scooters, see 9529" | 09 Nov 2026 | _shared/NIC_2025.pdf |
| S4 | Fact sheet ASUSE 2025, p.6 | MoSPI | https://www.mospi.gov.in/uploads/latestreleasesfiles/1777360756062-publications_reports1774347275480_658da785-11e1-4df3-9f02-27e08a8675f6_Factsheet_ASUSE_2025-f.pdf | "3,97,477"; "4,24,139" | 09 Nov 2026 | _shared/ASUSE_2025_Factsheet.pdf |
| S7 | List of Sectors Classified by Central Pollution Control Board (As on 24th August 2026), pp.4, 24, 36–37, 39–41, 49, 54, 61–62 | CPCB | https://cpcb.gov.in/uploads/Sectors_Classified_by_CPCB.pdf | "9.0 Automobile service stations/ workshops"; "75.5 Orange"; "5.2 Railway locomotive work shop/ Integrated road transport workshop/ Authorized service centers (wastewater generation <10 KLD)"; "79.0 Orange"; "assembling & charging of acid lead battery on micro scale"; "76.0 Orange"; "220.0 Waste Battery Collection Centres"; "47.5 Green"; "Guidelines for Collection, Handling, Storage, and Transportation of Waste Batteries"; "142.2 Tyres and tubes vulcanization/ hot retreading"; "61.8 Orange"; "189.0 Assembling units and mechanical workshops (without heat/surface treatment or spray painting)"; "20.0 White"; "The used oil/waste oil generated during repair and maintenance need to be disposed through authorized hazardous waste recycler"; "(wastewater generation ≥ 10 KLD)"; "84.3 Red"; "146.0 Repairing of electric motors and generators (dry mechanical process)"; "0.0 White"; "148.0 Tyre retraders"; "153.4 Scraping facilities for end-of-life vehicles, wagons and coaches having Collection Centers only (Without depollution, dismantling and shredding)"; "62.9 Orange"; "150.4 E-Waste refurbishing centres"; "43.1 Green"; "151.7 Recycling / reprocessing of waste oil"; "74.0 Orange" | 09 Nov 2026 | _shared/CPCB_Sectors_Classified.pdf |
| S8 | Battery Waste Management Rules, 2022 (S.O. 3984(E), 22nd August 2022), pp.1–5, 8–9, 16, 22, 26–27 | MoEFCC (copy hosted on thc.nic.in ⚠) | https://thc.nic.in/Central%20Governmental%20Rules/Battery%20Waste%20Management%20Rules,%202022.pdf | "New Delhi, the 22nd August, 2022"; "S.O. 3984(E)"; "These rules shall apply to, –(i) Producer, dealer, consumer, entities involved in collection, segregation, transportation, re-furbishment and recycling of Waste Battery; (ii) all types of batteries regardless of chemistry"; "‘Refurbishment’ means repairing, re-conditioning, re-purposing of used Battery for its second life"; "All refurbishers shall register with State Pollution Control Board on the centralised portal"; "make an application in Form 2(A) to the State Pollution Control Board for grant of one-time registration"; "Refurbishers shall furnish quarterly returns in Form 4"; "It shall be the responsibility of entities involved in collection, segregation and treatment to hand over Waste Battery to registered refurbisher or recycler"; "Environmental Compensation shall also be levied for the following activities based on polluter pays principle"; "entities carrying out activities without registration as mandated under these rules"; "S.O. 4669(E), dated the 25th October, 2023, G.S.R. 190(E), dated the 14th March, 2024, S.O. 2374 (E), dated 20th June, 2024 and S.O. 5210 (E), dated 3rd December, 2024"; "dated the 24th August, 2022"; "S.O. 958(E)"; "shall be filed by the end of the month succeeding the end of the quarter"; "Refurbisher shall not deal with any other entity not having registration mandated under these rules"; "Consent Validity"; "Under Air Act, 1981"; "Under Water Act, 1974"; "Validity of Authorisation under rule 6 of the Hazardous Wastes (Management and Handling) Rules, 2016"; "registration with District"; "Industries Centre"; "sale of Battery including refurbished Battery, including in equipment, under its own brand produced by other manufacturers or suppliers"; "register through the online centralised portal as Producer in Form 1(A)"; "to an entity engaged in collection or refurbishment or recycling"; "ensure that a facility is in accordance with the standards or guidelines prescribed by the Central Pollution Control Board"; "not following sound handling of Waste Battery"; "shall prepare and recommend guidelines for imposition and collection of Environmental Compensation"; "Environmental Compensation shall be levied by respective State Pollution Control Board on entities involved in refurbishment or recycling of Waste Battery as well as entities involved in collection, segregation and treatment"; "Electric Vehicles (EV) Battery of E-rickshaw (three wheelers)"; "2024-25" | 09 Nov 2026 | D17/Battery_Waste_Management_Rules_2022.pdf |
| S9 | MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 512(E) 28.07.2025 and G.S.R. 598(E) 08.07.2026, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_airact.pdf | "(a) all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed in the Schedule to this notification, subject to condition that such industrial sectors or projects or processes or activities shall inform in writing to the State Pollution Control Boards or the Pollution Control Committees"; "56. Assembling units and mechanical workshops (without heat or surface treatment or spray painting)"; "42. Repairing of electric motors and generators (dry mechanical process)"; "44. Tyre retreaders"; "45. Collection centres (without depollution, dismantling and shredding)"; "G.S.R. 761(E)"; "New Delhi, the 8th July, 2026"; "G.S.R. 598(E)"; "29th July, 2025"; "G.S.R. 761(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_airact.pdf |
| S10 | MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendment G.S.R. 511(E) 28.07.2025, pp.3–4, 8, 16, 24–28 | MoEFCC via CPCB | https://cpcb.gov.in/uploads/White_category_exemption_wateract.pdf | "G.S.R. 511(E)"; "all industrial sectors or projects or processes or activities having pollution index score upto 25 as listed"; "G.S.R. 599(E)"; "G.S.R. 762(E)"; "G.S.R. 511(E)" | 09 Nov 2026 | _shared/CPCB_White_exemption_wateract.pdf |
| S11 | Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 3–4, 6–7 | Maharashtra Pollution Control Board | https://mpcb.gov.in/sites/default/files/standing_orders/Circular_White_Category_MPCB_16062025.pdf | "Automobile Body building (without wet process)"; "Automobile fuel outlets (only dispensing)"; "the consents for White category industries will be granted based on self-certification by the respective White category industries on the portal of the MPC Board"; "Engineering workshop, machine shop, fabrication shop, smithy shop, turning shop, cutting shop"; "Motor Rewinding"; "Repairing of electric motors & generators (dry mechanical process)" | 09 Nov 2026 | _shared/MPCB_White_Circular_16062025.pdf |
| S13 | Fact Sheet on HCES 2023-24, pp.4, 9, 12 | MoSPI | https://mospi.gov.in/sites/default/files/publication_reports/HCES%20FactSheet%202023-24.pdf | "Statement 7: Average MPCE for each State/UT in 2023-24"; "‘MPCE estimates with imputation’ are presented in Section II"; "conveyance 313 592 7.59 8.46" | 09 Nov 2026 | _shared/HCES_FactSheet_2023-24.pdf |
| S14 | CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 | CBIC | https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf | "if his aggregate turnover in a financial year exceeds twenty lakh rupees"; "aggregate turnover in a financial year exceeds ten lakh rupees"; "the expression ―special category States‖ shall mean the States as specified"; "Arunachal Pradesh, Assam, Himachal Pradesh"; "persons making any inter-State taxable supply" | 09 Nov 2026 | _shared/CGST_Act_updated_31082021.pdf |
| S15 | Notification No. 10/2019-Central Tax | Ministry of Finance | https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf | "Any person, who is engaged in exclusive supply of goods and whose aggregate turnover in the financial year does not exceed forty lakh rupees" | 09 Nov 2026 | _shared/GST_Notfn_10_2019_CT.pdf |
| S16 | Salient Features of Revised PMEGP, pp.2–6 (undated; web folder 2022-11) | Delhi Khadi & Village Industries Board | https://dkvib.delhi.gov.in/sites/default/files/2022-11/salient-features-of-revised-ppmegp.pdf | Special category "05%" own, "25%" urban, "35%" rural; "business/service Sector is Rs. 20.00 lakh."; "There will be no income ceiling"; "above Rs. 5.00 lakh in the business /service sector"; "Assistance under the Scheme is available only for new projects"; "the units that have already availed Government Subsidy under any other scheme of Government of India or State Government are not eligible"; "Projects without Capital Expenditure are not eligible for Financing under the scheme."; "The ‘Family’ includes self and spouse."; "The balance amount ( excluding the own contribution) of the total project cost will be Provided by Banks."; "95% in case of special category"; "Normal Rate of interest shall be charged. Repayment schedule may range between 3 to 7 years"; "the working capital shall not be more than 60% of the project cost"; "All Public Sector Banks."; "All Regional Rural Banks, Co-operative Banks, Private Sector Scheduled Commercial Banks regulated by RBI."; "Small Industries Development Bank of India (SIDBI)."; "National Scheduled Tribes Finance and Development Corporation (NSTFDC)"; "Existing Units (under PMRY, REGP or any other scheme of Government of India or State Government) and the units that have already availed Government Subsidy" | 09 Nov 2026 | _shared/PMEGP_Revised_Salient_DelhiKVIB.pdf |
| S17 | Guidelines on PMEGP (pre-revision scan), p.23, Para 29 | KVIC copy on a Government server | https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2023/03/2023031676.pdf | "Negative List of Activities"; "The following list of activities will not be permitted under PMEGP" | 09 Nov 2026 | _shared/PMEGP_Guidelines_s3waas_2023-03.pdf |
| S18 | PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), p.3 | PIB | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/sep/doc2025916638501.pdf | "Engaged in one of the mentioned 18 family-based traditional trades" | 09 Nov 2026 | _shared/PM_Vishwakarma_PIB_Sep2025.pdf |

(Tags S5, S6 and S12 are not used in this dossier.)

## Quality gates (researcher)

| Gate | Result |
|---|---|
| G1 Every number tagged | Pass, per the check script |
| G3 FSSAI | Not applicable (no food) |
| G4 GST | Pass with ⚠: ₹20 lakh (not goods-only; our reading) |
| G5 Pollution category | **Pass with ⚠**: Orange for a service workshop [S7] (framework ⚠ confirmed); Red for a large authorised service centre; White for mechanical-only work and dry motor rewinding [S7][S9]. Battery rules [S8] covered as originally notified, with 4 later amendments not read ⚠. Used-oil rules ⚠ |
| G6 Scheme open | PMEGP after March 2026 NOT FOUND |
| G7 Scheme fit | Done; PM Vishwakarma does not fit |
| G8 NSFDC tier first | Pass |
| G9 Seasonality | **Fail**: no source; needs field survey |
| G10 Working capital from cycle days | **Fail**: formula given; all inputs NOT FOUND |
| G12 Biology | Not applicable |
