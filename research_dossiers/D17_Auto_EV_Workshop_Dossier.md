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

How to read this file.
Every figure carries a tag:
[S#]: see the Source log at the end
ESTIMATE: inputs and sum shown
NOT FOUND
VENDOR QUOTE NEEDED
Rows marked ⚠ need Person D to open the page in a normal browser.
Lines marked "our design choice" are app rules we chose, not facts.
Nothing here comes from memory, blogs or news.

No official project report was found for this business. The UP Government MSME portal's 320 business categories include no vehicle-repair workshop (see UP_MSME_portal_categories.txt). So every CapEx and OpEx figure here is VENDOR QUOTE NEEDED or NOT FOUND.

Sources that could not be opened on 09 Nov 2026 (the facts they hold are NOT FOUND here, not guessed):
| Source | What it would give |
|---|---|
| VAHAN dashboard (parivahan.gov.in) | 2W/3W/e-rickshaw registrations by district |
| Hazardous and Other Wastes Rules 2016 text | Used oil (cpcb.nic.in certificate revoked) |
| CPCB guidelines for collecting and storing waste batteries | — |
| Fire-safety rules for battery charging | — |
| pmvishwakarma.gov.in, mudra.org.in, kviconline.gov.in | — |
| State DISCOM sites | — |

Source copy note. The Battery Waste Management Rules 2022 [S8] were read from a copy hosted on a government court website (thc.nic.in), not on the MoEFCC or e-Gazette site.
Its later note says the rules were amended by "S.O. 4669(E), dated the 25th October, 2023, G.S.R. 190(E), dated the 14th March, 2024, S.O. 2374 (E), dated 20th June, 2024 and S.O. 5210 (E), dated 3rd December, 2024" [S8] p.27. Only the last amendment, S.O. 958(E) of 24.02.2025, is in the copy.
So every quote from these rules is "as originally notified" ⚠. Rules 7, 8 and 13 may have changed since.
Date mismatch: the notice is dated "New Delhi, the 22nd August, 2022" [S8] p.1, but the 2025 note says the rules were published "dated the 24th August, 2022" [S8] p.27 ⚠.
Person D should confirm all of this against the official Gazette ⚠.

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
| Sector | Service under NIC 2025 (Division 95) [S3] p.250. Whether PMEGP treats it as service: NOT FOUND ⚠ | [S3] |
| Rural unincorporated non-farm establishments, all activities | 3,97,477 hundred (ASUSE 2023-24); 4,24,139 hundred (ASUSE 2025) | [S4] p.6 |
| Number of 2W/3W/e-rickshaws by district | NOT FOUND ⚠ (VAHAN not opened) | — |

**Demand within 5–10 km (formula for the app):**
`ESTIMATE: registered 2W/3W/e-rickshaws in the catchment [VAHAN, NOT IN HAND ⚠] × services per vehicle per year [NOT FOUND] × average bill [NOT FOUND].` All inputs are NOT FOUND.

**Rural vs semi-urban:** No official comparison was found: NOT FOUND.

**Sales channels:** No official source was found. These are field-survey questions, not data:
1. Walk-in riders
2. E-rickshaw fleet owners
3. Dealers passing on out-of-warranty work
4. Roadside call-outs

**Underserved niches and how to spot them in a block:**
| Niche | Why it may be open | How a user checks it | Tag |
|---|---|---|---|
| E-rickshaw battery and motor work | Batteries are covered by new rules that apply to "all types of batteries regardless of chemistry" [S8] p.2. The rules set collection targets for producers for "Electric Vehicles (EV) Battery of E-rickshaw (three wheelers)" from "2024-25" [S8] p.16, so producers need registered partners. A registered refurbisher (§6) may face less competition (our reading) | Count e-rickshaws at the local stand, and ask drivers where they get batteries serviced | [S8] for the rule; demand NOT FOUND |
| 2W tyre and tube repair | Part of the NIC class: "tyre and tube repair, fitting or replacement" [S2] p.99 | Count puncture shops on the main road | Demand NOT FOUND |

---

## 2. CapEx

Price source. There is no official price list or project profile (see the top of this file). Every price is VENDOR QUOTE NEEDED. The item lists below are our design choice.
Connected load and phase. NOT FOUND. It depends on the compressor and battery chargers (vendor quote) and the State DISCOM code ⚠.
Where machines are made. NOT FOUND.

### 2a. Micro Finance size (project cost up to ₹1.40 lakh [S1])
| # | Item | Qty | Unit price | Tag |
|---|---|---|---|---|
| 1 | Mechanic's tool kit (spanners, sockets, pullers) | 1 set | VENDOR QUOTE NEEDED | — |
| 2 | Air compressor (tyres, cleaning) | 1 | VENDOR QUOTE NEEDED | — |
| 3 | Battery tester / multimeter | 1 | VENDOR QUOTE NEEDED | — |
| 4 | Stand / ramp for 2W | 1 | VENDOR QUOTE NEEDED | — |
| 5 | Pre-operative: Udyam, local licence, power connection | — | NOT FOUND (see §6) | — |
| 6 | Working capital (spares, oil) | — | See §3 | — |

**Loan at the ceiling:**
* Project ₹1,40,000 [S1] → "up to 90%" [S1] = at most ₹1,26,000.
* That is capped at ₹1,25,000 [S1].
* So the own share is at least ₹15,000 [S1].
* App rule (our design choice): a micro unit should not offer battery charging, battery reconditioning or vehicle washing. Those change its pollution category and registration duties (§6).

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
| Total monthly OpEx | NOT FOUND | — |

**Working-capital cycle (days):**
| Stage | Days | Tag |
|---|---|---|
| Spares in stock | NOT FOUND | — |
| Job time | NOT FOUND | — |
| Customer credit (udhaar), e.g. e-rickshaw drivers paying weekly | NOT FOUND | — |
| Supplier credit (spares dealer) | NOT FOUND | — |

Formula (framework G11): `Working capital = (sum of cycle days ÷ 30) × monthly OpEx`. All the inputs are NOT FOUND, so the result is NOT FOUND.

---

## 4. Unit economics & pricing

| Item | Value | Tag |
|---|---|---|
| Labour charge per service (2W, 3W, e-rickshaw) | NOT FOUND (no official price series) | — |
| Margin on spares | NOT FOUND | — |
| Jobs per day | NOT FOUND | — |
| Break-even | NOT FOUND. Formula: fixed cost ÷ (price − variable cost per job) | — |

**Regional purchasing power (HCES 2023-24 rural MPCE) [S13] p.12:**
* UP: ₹3,481 (Ratio to all-India: 0.84)
* Bihar: ₹3,670 (0.89)
* MP: ₹3,441 (0.83)
* Rajasthan: ₹4,510 (1.09)
* Maharashtra: ₹4,145 (1.01)
* All-India: ₹4,122 (1.00)

HCES lists "conveyance" spending of "313" rupees per person per month in rural areas, "7.59" per cent of spending [S13] p.9. That is the household budget that pays for vehicle running costs (our reading).

Pricing strategy (our design choice): Quote labour and parts separately. For e-rickshaw fleet owners, consider a monthly service contract. Base price is NOT FOUND.

---

## 5. Seasonality

| Month | M1 Apr | M2 May | M3 Jun | M4 Jul | M5 Aug | M6 Sep | M7 Oct | M8 Nov | M9 Dec | M10 Jan | M11 Feb | M12 Mar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND | NOT FOUND |

No official monthly series was found. Lean-month stress factor: NOT FOUND. G9 fails until our field survey fills this row.

---

## 6. Compliance

All rows were opened on 09 Nov 2026 unless marked ⚠.
Pollution: which category applies depends on what the workshop does.

| Activity | Category | Exact quote | Tag |
|---|---|---|---|
| Automobile service station / workshop (servicing, washing, painting) | Orange (pollution index 75.5) | Service/Infrastructure list row "9.0 Automobile service stations/ workshops" … "75.5 Orange" | [S7] p.62 |
| Authorised service centre (dealer-tied, under 10 KLD wastewater) | Orange (79.0) | "5.2 Railway locomotive work shop/ Integrated road transport workshop/ Authorized service centers (wastewater generation <10 KLD)" … "79.0 Orange" | [S7] p.61 |
| Charging lead-acid batteries (micro scale) | Orange (76.0), if the board applies this row to a workshop (our reading ⚠: the row sits under "Battery manufacturing") | Industrial list row 9.2 "assembling & charging of acid lead battery on micro scale" … "76.0 Orange" | [S7] p.4 |
| Authorised service centre, 10 KLD of wastewater or more | Red (84.3) | "(wastewater generation ≥ 10 KLD)" … "84.3 Red" | [S7] p.61 |
| Repairing electric motors (e-rickshaw motor work), dry process | White (0.0) | "146.0 Repairing of electric motors and generators (dry mechanical process)" … "0.0 White"; 2026 Schedule "42. Repairing of electric motors and generators (dry mechanical process)" | [S7] p.36; [S9] p.26 |
| Tyre retreading | White (0.0): "148.0 Tyre retraders" … "0.0 White"; 2026 Schedule "44. Tyre retreaders". Overlaps with row 142.2 hot retreading = Orange. Which applies: NOT FOUND ⚠ | as quoted | [S7] p.37; [S9] p.26 |
| End-of-life vehicle collection only / with dismantling | White (collection only) / Orange (62.9) | "153.4 Scraping facilities for end-of-life vehicles... Collection Centers only (Without depollution, dismantling and shredding)" … "0.0 White"; "153.1 … Collection, Depollution and Dismantling (Without shredding)" … "62.9 Orange"; 2026 Schedule "45. Collection centres" | [S7] p.41; [S9] p.27 |
| E-waste refurbishing (e.g. controllers, chargers) | Green (43.1) | "150.4 E-Waste refurbishing centres" … "43.1 Green" | [S7] p.39 |
| Where waste goes: used-oil recyclers | Orange (74.0) | "151.7 Recycling / reprocessing of waste oil" … "74.0 Orange" | [S7] p.40 |
| EV charging alone; vehicle washing alone | NOT FOUND: no standalone CPCB row | — | [S7] |
| Collecting waste batteries (as a collection centre) | Green (47.5) | "220.0 Waste Battery Collection Centres" … "47.5 Green" | [S7] p.54 |
| Tyre and tube vulcanising (hot repair) | Orange (61.8) | "142.2 Tyres and tubes vulcanization/ hot retreading" … "61.8 Orange" | [S7] p.36 |
| Mechanical workshop only (no heat or surface treatment, no spray painting) | White (20.0), with written intimation to the SPCB [S9] p.8 | "189.0 Assembling units and mechanical workshops (without heat/surface treatment or spray painting)" … "20.0 White" | [S7] p.49 |

The framework's "CPCB Orange ⚠" for auto workshops is confirmed by row 9.0 [S7] p.62.
App rule (our design choice):
IF the workshop services vehicles (oil change, washing, painting), charges lead-acid batteries, or does hot tyre repair THEN show Orange and the consent step.
ELSE IF it does only mechanical repair and dry e-rickshaw motor rewinding THEN show White (rows 189.0 and 146.0), with a written letter to the SPCB, and tell the user to confirm with the State board. Most real 2W/3W workshops do oil changes, so expect Orange (our reading).

| Rule | Law & section | Trigger | Threshold | Enforcer | Exact quote | Tag | State differences |
|---|---|---|---|---|---|---|---|
| FSSAI | FSS Act | Food business only | Not applicable | — | — | — | — |
| Battery Waste Management Rules 2022: who they cover | S.O. 3984(E), 22.08.2022, Rule 2 | Handling any battery | All batteries | SPCB / CPCB | "These rules shall apply to, –(i) Producer, dealer, consumer, entities involved in collection, segregation, transportation, re-furbishment and recycling of Waste Battery; (ii) all types of batteries regardless of chemistry" | [S8] p.2 | — |
| Repairing or reconditioning batteries = "Refurbisher" | Rule 3(x), Rule 8 (as originally notified ⚠) | Repairing or reconditioning used batteries | No minimum quantity stated | SPCB | "‘Refurbishment’ means repairing, re-conditioning, re-purposing of used Battery for its second life"; "All refurbishers shall register with State Pollution Control Board on the centralised portal"; "make an application in Form 2(A) ... for grant of one-time registration"; "furnish quarterly returns in Form 4"; "Refurbisher shall not deal with any other entity not having registration mandated under these rules". Form 2(A) asks for Consent under Air and Water Acts, and Authorisation under Hazardous Wastes Rules 2016 | [S8] pp.3–5, 22 | App rule: (1) DIC/Udyam; (2) Air/Water Consent; (3) Haz-waste auth; (4) Form 2(A) registration; (5) Quarterly Form 4; (6) Registered trading only |
| Selling refurbished batteries under own brand = "Producer" | Rule 3(u), Rule 4 | Selling refurbished batteries under its own brand | — | CPCB | Producer includes "sale of Battery including refurbished Battery, including in equipment, under its own brand"; register online in Form 1(A) | [S8] p.3 | Warn that Producer registration and EPR apply. Advise against at micro scale |
| Consumer and facility duties | Rules 5 and 7(2) | Workshop as a battery user or collector | — | SPCB | Consumers must hand waste batteries "to an entity engaged in collection or refurbishment or recycling"; collectors must "ensure that a facility is in accordance with the standards or guidelines prescribed by CPCB" | [S8] p.4 | — |
| Battery collection / handover | Rule 7 | Taking customers' old batteries | — | SPCB | "It shall be the responsibility of entities involved in collection, segregation and treatment to hand over Waste Battery to registered refurbisher or recycler" | [S8] p.4 | Hand over only to registered entities |
| Penalty (Environmental Compensation) | Rule 13 (as originally notified ⚠) | Working without registration | Amount NOT FOUND | SPCB | "Environmental Compensation shall also be levied for the following activities based on polluter pays principle, – i. entities carrying out activities without registration as mandated under these rules" | [S8] pp.8–9 | — |
| Used engine oil | Hazardous & Other Wastes Rules 2016 | Oil changes | NOT FOUND ⚠ | SPCB | "The used oil/waste oil generated during repair and maintenance need to be disposed through authorized hazardous waste recycler" | [S7] p.24 | Hand used oil only to an authorised recycler |
| White: no consent, written intimation | Air Act s.21 proviso: G.S.R. 702(E) 12.11.2024, para (a) replaced by G.S.R. 512(E) 28.07.2025; Water Act s.25 proviso | Listed White sector | Pollution index up to 25 | SPCB | Schedule item 56: "Assembling units and mechanical workshops (without heat or surface treatment or spray painting)" | [S9] pp.8, 27; [S10] p.8 | Only for mechanical-only workshop |
| Maharashtra Pollution | MPCB circular, 16.06.2025 | On the State list | White: item 53 (Engineering workshop), item 153 (Motor Rewinding), item 185 (Electric motor repair), item 17 (Automobile Body building without wet process) | MPCB | Self-certification on portal | [S11] pp.1, 3–4, 6–7 | No item covers servicing with oil change or washing; follows CPCB Orange. Maharashtra's list does not give central intimation exemption |
| GST registration | CGST Act s.22(1) | Aggregate turnover in a year | ₹20 lakh; ₹10 lakh in special category | CBIC / State tax | "if his aggregate turnover in a financial year exceeds twenty lakh rupees" | [S14] pp.49–50 | Special category States list ⚠ |
| GST ₹40L goods limit | Notification 10/2019-CT | Exclusive supply of goods | ₹40 lakh | CBIC | Not applicable (supplies repair labour as well as parts); ₹20 lakh limit applies | [S15] | — |
| GST inter-State | CGST Act s.24(i) | Inter-State taxable supply | Compulsory registration | CBIC | "persons making any inter-State taxable supply" | [S14] p.51 | Exemption for services NOT FOUND ⚠ |
| Fire safety | NOT FOUND ⚠ | Charging area | NOT FOUND | State fire service ⚠ | — | ⚠ | Framework key risk: "Battery fire" |

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
| Fits D17? | Yes. NSFDC lists "Service & Transport Sector (e.g., retail shops, repair centers, commercial vehicles, e-rickshaws)" [S1] | Yes [S1]. Project cost NOT FOUND |

* Women: 40% funds specifically allocated for women beneficiaries [S1].
* Watch channel: AMY is 15% p.a. through NBFC-MFIs; UNY is 13–15% through Coops/SFBs [S1].
* App rules: Quote 6.5% only for MFS and 8% only for Term Loan via SCAs/CAs.
* Free skill training: PM-DAKSH free NSQF training for SCs (age 18–45) with ₹1,500/month DBT stipend [S1].

### 7.2 Other schemes
| Scheme | Who qualifies | Benefit | Own share | Tag |
|---|---|---|---|---|
| PMEGP | Any individual >18; Class VIII pass for projects >₹5.00L in service sector; new projects only | Special category: 25% urban, 35% rural subsidy | 5% | [S16] pp.2–3; [S17] p.23 |
| PMEGP bank terms & limits | 95% bank loan; bank normal interest rate; service cap ₹20.00 lakh; working capital max 60% | Bank rate | — | [S16] pp.2, 5–6 |
| PM Vishwakarma | Engaged in 18 family-based traditional trades | Vehicle workshop is NOT a traditional trade | Does NOT fit | [S18] p.3 |
| MUDRA | Tiers NOT FOUND this session (mudra.org.in did not open ⚠) | — | — | ⚠ |

**When D17 does NOT fit:**
* PM Vishwakarma: not a traditional trade [S18] p.3.
* PMEGP: not for an existing workshop [S16] p.2.
* Battery reconditioning without SPCB refurbisher registration risks Environmental Compensation [S8] p.8.

---

## 8. Risks, SWOT & competition

| Risk | Severity | Early warning sign | App rule (if-then) | Tag |
|---|---|---|---|---|
| Battery fire while charging | High | Charging in closed room; swollen batteries | Show charging-safety checklist | — |
| Working without battery refurbisher registration | High | Repairing/reconditioning batteries | See §6 app rule | [S8] pp.4–5, 8 |
| Wrong pollution category (Orange for servicing, washing, charging) | Medium | Oil changes, washing bay | See §6 app rule | [S7] pp.4, 61–62 |
| Single-buyer dependence (one fleet owner) | Medium | One customer > 50% of jobs | Warn and stress-test EMI without them | Threshold is our design choice |
| Single-supplier dependence | NOT FOUND | One dealer only | Ask for a second supplier | Our design choice |
| Used-oil handling | NOT FOUND ⚠ | Oil drums pile up | See §6 | ⚠ |

**SWOT (both sizes):**
* **Strengths:** NSFDC names "repair centers" and "e-rickshaws" [S1]; White if mechanical repair only [S7][S9]; battery service as registered refurbisher [S8].
* **Weaknesses:** No official prices, OpEx or seasonality; Orange category requires registration and quarterly returns [S7][S8].
* **Opportunities:** 2W tyre and repair work [S2]; E-rickshaw battery and motor work.
* **Threats:** Dealer service centres; battery fire; penalties for working unregistered [S8].

---

## Source log
* **S1:** FAQ – National Scheduled Castes Finance and Development Corporation (MoSJE, devmosje.negd.in/?p=15629, opened 09 Nov 2026).
* **S2:** National Industrial Classification 2008, pp.99–100 (MoSPI, opened 09 Nov 2026).
* **S3:** National Industrial Classification 2025, p.250 (MoSPI, opened 09 Nov 2026).
* **S4:** Fact sheet ASUSE 2025, p.6 (MoSPI, opened 09 Nov 2026).
* **S7:** List of Sectors Classified by Central Pollution Control Board (24 Aug 2026), pp.4, 24, 36–37, 39–41, 49, 54, 61–62 (CPCB, opened 09 Nov 2026).
* **S8:** Battery Waste Management Rules, 2022 (S.O. 3984(E), 22 Aug 2022), pp.1–5, 8–9, 16, 22, 26–27 (MoEFCC via thc.nic.in, opened 09 Nov 2026).
* **S9:** MoEFCC G.S.R. 702(E) 12.11.2024 (Air Act) and amendments incl. G.S.R. 512(E) 28.07.2025 and G.S.R. 598(E) 08.07.2026, pp.8, 16, 26–27 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S10:** MoEFCC G.S.R. 703(E) 12.11.2024 (Water Act) and amendment G.S.R. 511(E) 28.07.2025, p.8 (MoEFCC via CPCB, opened 09 Nov 2026).
* **S11:** Circular: Categorization of new or left-over White category industries (16/06/2025), pp.1, 3–4, 6–7 (Maharashtra Pollution Control Board, opened 09 Nov 2026).
* **S13:** Fact Sheet on HCES 2023-24, pp.4, 9, 12 (MoSPI, opened 09 Nov 2026).
* **S14:** CGST Act 2017 (updated 31.08.2021), ss.22, 24, pp.49–51 (CBIC, opened 09 Nov 2026).
* **S15:** Notification No. 10/2019-Central Tax (Ministry of Finance, opened 09 Nov 2026).
* **S16:** Salient Features of Revised PMEGP, pp.2–6 (Delhi KVIB, opened 09 Nov 2026).
* **S17:** Guidelines on PMEGP (pre-revision scan), p.23, Para 29 (KVIC via s3waas, opened 09 Nov 2026).
* **S18:** PM Vishwakarma Scheme: Honouring Heritage, Powering Progress (16 Sep 2025), p.3 (PIB, opened 09 Nov 2026).
*(Tags S5, S6 and S12 are not used in this dossier.)*

---

## Quality gates (researcher)
* **G1 Every number tagged:** Pass, per check script.
* **G3 FSSAI:** Not applicable (no food).
* **G4 GST:** Pass with ⚠: ₹20 lakh (not goods-only; our reading).
* **G5 Pollution category:** Pass with ⚠: Orange for service workshop [S7]; Red for large authorised service centre; White for mechanical-only and dry motor rewinding [S7][S9]. Battery rules [S8] covered as originally notified. Used-oil rules ⚠.
* **G6 Scheme open:** PMEGP after March 2026 NOT FOUND.
* **G7 Scheme fit:** Done; PM Vishwakarma does not fit.
* **G8 NSFDC tier first:** Pass.
* **G9 Seasonality:** Fail: no source; needs field survey.
* **G10 Working capital from cycle days:** Fail: formula given; all inputs NOT FOUND.
* **G12 Biology:** Not applicable.
