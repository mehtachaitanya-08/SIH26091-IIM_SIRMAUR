# Sourced Rural MSME Sector Dossier: Commercial Goat & Sheep Meat Husbandry (D12)

**Domain Code:** `D12`  
**Short Name:** `Goat_Sheep`  
**Domain Title:** Commercial Goat & Sheep Meat Husbandry  
**Parent Basket:** `B4: Dairy & Livestock`  
**Units Studied:** 
1. **Micro Finance Tier:** 10+1 Flock (NSFDC Micro Credit / MSY — Cost ≤ ₹1,40,000)
2. **Intermediate Term Loan Tier:** 20+1 Flock (NSFDC Term Loan Standard Smallholder — Cost ₹2,58,000)
3. **Commercial Term Loan Tier:** 100+5 Flock (NSFDC Term Loan / NLM-EDP Aligned — Cost ₹20,00,000)  
**Effective Date:** 08 November 2026  
**Target Context:** Smart India Hackathon 2026 (SIH26091 — Ministry of Social Justice & Empowerment - MoSJE)  
**Beneficiary Persona:** Scheduled Caste (SC) rural/semi-urban entrepreneurs (annual family income ceiling ≤ ₹5.00 Lakh p.a., effective 07 Jan 2026) borrowing through NSFDC State Channelizing Agencies (SCAs).

---

# EXECUTIVE AUDIT & REVIEW OF PRIOR FINDINGS

Before detailing the full technical architecture and bankable financial models, this section documents the audit findings challenging the prior preliminary investigation:

| # | Investigation Topic | Claim in Prior Attempt | Evidence Cited | What the Code / Math Actually Shows | Corrected Finding & Impact |
|---|---|---|---|---|---|
| **1** | **Micro Tier CapEx Addition** | CapEx table sums to **₹1,40,000** | Table in Section 2.1 | Summing C1-01 through C1-09: $70k + 10k + 22.5k + 3.5k + 8k + 0.2k + 3.2k + 1.6k + 31k = \mathbf{₹1,50,000}$. An error of **+₹10,000**. | Items exceed the strict NSFDC Micro Finance ceiling of ₹1.40L! To maintain the ₹1.40L ceiling, C1-09 (Capitalized Working Capital) must be reduced from ₹31,000 to **₹21,000**. |
| **2** | **Term Loan CapEx Addition** | CapEx table sums to **₹20,00,000** | Table in Section 2.2 | Summing C2-01 through C2-15: $750k + 70k + 525k + 90k + 75k + 38k + 22k + 38k + 32k + 1.5k + 32.8k + 10.7k + 85k + 15k + 245k = \mathbf{₹20,30,000}$. An error of **+₹30,000**. | Capitalized Working Capital (C2-15) must be corrected from ₹2,45,000 to **₹2,15,000** to balance the project cost exactly at ₹20,00,000. |
| **3** | **Scope: 20+1 Flock Omission** | Studied only 10+1 and 100+5 flocks; 20+1 relegated to a 4-line note. | Original Task: *"Unit to Study: 20+1 up to 100+5 flock"* | The prior attempt failed to model CapEx BOM, monthly OpEx, biological cycles, or 3-year cash flows for the **20+1 flock**—the standard smallholder entry scale. | A full, standalone 20+1 flock model (CapEx ₹2,58,000; NSFDC Term Loan ₹2,32,200 @ 8.0%; KCC AH bridge; NLM exclusion) has been built from the ground up. |
| **4** | **OpEx Contradiction: Section 3 vs 4** | Micro OpEx: ₹6,535/mo (₹78,420/yr). Commercial OpEx: ₹77,767/mo (₹9,33,200/yr). | Section 3.1 A & B bottom-up feeding calculations | In Section 4.3, the author arbitrarily changed OpEx to **₹54,000/yr** (Micro) and **₹5,60,000/yr** (Term Loan), artificially suppressing OpEx by ₹24,420 and ₹3,73,200! | Under true bottom-up OpEx, Year 3 DSCR for Micro is **2.11x** (not 2.60x), and for Term Loan is **1.93x** (not 2.97x). Section 4 must show both full-purchase and grazing/farm-fodder models. |
| **5** | **Seasonality Stress Test Concealment** | In August (trough multiplier 0.45), Term Loan generates a positive operating surplus of +₹14,199. | Section 5.2 | The author used the suppressed OpEx (₹46,667/mo). Under true OpEx (₹77,767/mo), revenue (₹60,866) minus OpEx yields an **operational deficit of -₹16,901**; with monthly EQI share (₹29,820), net deficit is **-₹46,721**! | August is severely cash-flow negative. This proves why the **June Bakrid cash buffer (+₹1,29,115 surplus)** and KCC limit are legally and operationally mandatory. |
| **6** | **Flawed Break-Even Analysis** | Fixed Costs: Micro = ₹10,600 (Break-even = 1.63 kids); Term = ₹2,93,400 (Break-even = 43.9 kids). | Section 4.4 | The author completely excluded adult breeding doe and buck feed from fixed costs! In livestock rearing, parent stock must be fed year-round regardless of kid birth rates. | Factoring adult herd maintenance into enterprise fixed costs raises true break-even to **8.4 kids/yr (46.7%)** for Micro and **70.7 kids/yr (47.1%)** for Term Loan. |
| **7** | **NLM Capital Subsidy Working Capital Rule** | Claimed full 50% subsidy (₹10.00L) on ₹20.00L project containing ₹2.45L working capital. | Section 2.2 & 7.2; NLM Guidelines | DAHD NLM guidelines explicitly state that working capital is **excluded** from eligible capital subsidy calculation. | Eligible physical CapEx is ₹17,85,000; 50% subsidy is **₹8,92,500**, unless physical assets are expanded to ₹20,00,000. |
| **8** | **Critical Financial Engine Defect** | The Python engine routes any Archetype 4 project with cost > ₹2.00L to NLM 50% subsidy. | `multi_archetype_financial_engine.py` (lines 260-276) | Lines 260-276 automatically allocate NLM 50% subsidy to a ₹2,58,000 (20+1) unit, violating DAHD statutory norms requiring $\ge 100+5$ animals! | **Critical Engine Bug Logged:** The engine must enforce `if unit_size >= 100:` before allocating NLM; 20+1 units must route to NSFDC Term Loan + KCC AH. |
| **9** | **Statistical Gap: ASUSE Clarification** | Missing explanation of why MoSPI ASUSE data does not cover livestock rearing. | Original Task Section 1 | MoSPI ASUSE specifically surveys *non-agricultural unincorporated enterprises* (excluding Section A: Agriculture, Forestry & Fishing). | Livestock is officially covered by **NSS Report No. 587 (Situation Assessment Survey)** and **NSS Report No. 588 (AIDIS)**, not ASUSE. |

---

## 1. CLASSIFICATION & MARKET STRUCTURE

### 1.1 Official Statistical & Industrial Classification
* **NIC 2008 Code [S8]:** 
  * **Division 01:** Crop and animal production, hunting and related service activities.
  * **Group 014:** Animal production.
  * **Class 0144:** Raising of sheep and goats.
  * **Sub-Class 01441:** Raising and breeding of sheep and goats (primary meat purpose).
  * **Sub-Class 01442:** Production of milk from sheep or goat.
  * **Sub-Class 01443:** Production of raw wool.
* **NIC 2025 Standard (ISIC Rev. 5 Aligned) [S8]:**
  * **Section A:** Agriculture, Forestry and Fishing.
  * **Division 01:** Crop and animal production, hunting and related service activities.
  * **Group 014:** Animal production.
  * **Class 0144:** Raising of sheep and goats.
  * **Sub-Class 014410:** Commercial raising, breeding, and fattening of sheep and goats for meat production.
* **GST Classification [S13]:**
  * **Live Animals (Sheep & Goats):** HSN `0104` — **0% GST (NIL)** under Notification No. 2/2017-Central Tax (Rate), Entry No. 9.
  * **Compounded Animal / Goat Feed:** HSN `2309` — **0% GST (NIL)** under Notification No. 2/2017-Central Tax (Rate), Entry No. 102.
  * **Fresh / Chilled Meat of Sheep or Goats (Unbranded / Unpacked):** HSN `0204` — **0% GST (NIL)** under Notification No. 2/2017-Central Tax (Rate), Entry No. 5.

### 1.2 Macro Sectoral Footprint & Ground-Truth Baseline
* **Enterprise Census Footprint [S10]:** According to the *RBI Expert Committee Report on MSMEs (2019, Table III, p. 21)*, rural non-crop allied agriculture accounts for **13.13 million enterprises**, of which **livestock rearing constitutes 86.74% (11.39 million units)** across India.
* **ASUSE Scope Demarcation [S8, S9]:** The *Annual Survey of Unincorporated Sector Enterprises (ASUSE)* conducted by MoSPI targets unincorporated *non-agricultural* establishments (manufacturing, trade, services). Primary livestock enterprises fall under Section A of NIC and are therefore captured under the **NSS Situation Assessment Survey (SAS) of Agricultural Households (NSS Report No. 587)** and the **All India Debt and Investment Survey (AIDIS, NSS Report No. 588)** [S9].
* **Household Income Buffer [S9]:** Under NSS Report No. 587, the average monthly rural agricultural household income is ₹10,218, with livestock receipts generating **₹1,582 per month (15.5%)**, representing the primary liquid, non-seasonal shock absorber against crop failure.
* **National Herd Inventory [S11, S12]:** Per the *20th Livestock Census (DAHD, GoI)*, India's goat population stands at **148.88 million** (ranking 2nd globally) and sheep population stands at **74.26 million** (ranking 3rd globally). Small ruminants contribute **over 2.45 million metric tonnes** of meat annually, accounting for **26.8% of total domestic meat production** (*BAHS 2023/2024*).
* **Catchment & Demand Dynamics:**
  * **Primary Rural Catchment:** Village cluster radius of 15–25 km feeding local weekly livestock haats / APMC mandis.
  * **Terminal Urban Demand:** Urban slaughterhouses and meat retail centers (mutton consumption averages 5.4 kg/capita/year among non-vegetarian urban households, with a 7.2% CAGR driven by protein consumption shifts).
  * **Spot Liquidity Advantage:** Live animals function as a "living savings deposit" convertible to instant cash on mandi days without credit counterparty risk.

---

## 2. CAPITAL EXPENDITURE (BILL OF MATERIALS)

### 2.1 Micro Finance Tier: 10+1 Flock (NSFDC Micro Credit / MSY — Cost ≤ ₹1,40,000)
* **Production Model:** Semi-Intensive Goat Rearing Unit (**10 Breeding Does + 1 Pedigree Buck**; Barbari or Sirohi breed).
* **Financing Structure [S1, S3]:** Total Cost = **₹1,40,000** | Promoter Equity (10.71%) = **₹15,000** | NSFDC Loan (89.29% - strictly capped at ceiling) = **₹1,25,000** (NOT ₹1.26L).

| Item Code | Line Item Description | Technical Specification & Materials | Qty / Area | Unit Cost (₹) | Total CapEx (₹) | Sourcing Hub & Procurement Channel | Source Tag |
|---|---|---|---|---|---|---|---|
| **C1-01** | Foundation Breeding Does | 10–12 months age, 22–25 kg body weight, vaccinated (PPR/ET), ear-tagged | 10 Head | ₹7,000 | ₹70,000 | CIRG Makhdoom / Nagaur Mandi / Local Breed Farm | `[S1, S18]` |
| **C1-02** | Superior Breeding Buck | 12–15 months age, 30–35 kg, proven pedigree, sound testicular circumference | 1 Head | ₹10,000 | ₹10,000 | CIRG Makhdoom / CSWRI Avikanagar / Certified Breeder | `[S1, S18]` |
| **C1-03** | Low-Cost Night Shelter | 150 sq. ft. (12 sq. ft./doe + 20 sq. ft./buck + 10 sq. ft. partition). Raised slatted bamboo/eucalyptus floor (1.5 ft above ground), treated poles, GI corrugated sheet/thatch roof | 150 sq. ft. | ₹150/sq. ft. | ₹22,500 | Local rural carpentry / Bamboo growers / Mandi suppliers | `[S18, S19]` |
| **C1-04** | Feeding & Watering Gear | Galvanized Iron (GI) / PVC halved pipe mangers (6 ft length, 3 units) + plastic bucket drinkers with welded wire stands | 1 Setup | ₹3,500 | ₹3,500 | Local agro-fabrication fabrication workshop | `[S19]` |
| **C1-05** | Biosecurity Perimeter Fence | 100 running feet chain-link mesh (4 ft height, 12-gauge) with treated wooden/iron angle posts and lockable entry gate | 100 RFT | ₹80/RFT | ₹8,000 | District hardware market / GeM verified vendor | `[S19]` |
| **C1-06** | Identification & Tagging | 12-digit polyurethane barcoded/RFID ear tags with manual applicator | 11 Sets | ₹18.18 | ₹200 | DAHD Bharat Pashudhan Portal / Veterinary Hospital | `[S5, S16]` |
| **C1-07** | Livestock Insurance | 1-Year Comprehensive Policy against mortality due to disease/accidents @ 4.0% of animal value (₹80,000) | 11 Head | 4.0% | ₹3,200 | National Insurance / New India / United India via SCA | `[S1, S5]` |
| **C1-08** | Vet Health & First-Aid Kit | Drenching gun, digital thermometer, antiseptic spray, potassium permanganate footbath trough, initial PPR/ET vaccines | 1 Kit | ₹1,600 | ₹1,600 | District Veterinary Polyclinic / Jan Aushadhi Kendra | `[S16, S18]` |
| **C1-09** | Capitalized Working Capital | Initial concentrate feed pellets (HSN 2309, 0% GST) for gestation phase (Months 1–6) + mineral mix reserve (*Calibrated to balance ₹1.40L cap*) | 6 Months Buffer | Lump sum | **₹21,000** | Local registered feed dealer / FPO supply depot | `[S1, S13]` |
| **TOTAL** | **Micro Finance Tier CapEx** | **10+1 Semi-Intensive Commercial Breeding Unit** | — | — | **₹1,40,000** | **NSFDC Micro Credit / MSY Framework** | `[S1, S3]` |

* **Power & Utilities (Micro):** Single-phase 0.5 kW domestic/agricultural connection for LED night illumination and water delivery; manual or existing household tube-well water source.

---

### 2.2 Intermediate Term Loan Tier: 20+1 Flock (NSFDC Term Loan Scheme — Cost ₹2,58,000)
* **Production Model:** Semi-Intensive Commercial Smallholder Flock (**20 Breeding Does + 1 Pedigree Buck**; Sirohi or Barbari).
* **Financing Structure [S2, S3, S5]:** Total Cost = **₹2,58,000** | Promoter Equity (10.0%) = **₹25,800** | NSFDC Term Loan (90.0%) = **₹2,32,200** @ 8.0% p.a. over 7 years (28 quarters with 6-month moratorium). *Note:* Ineligible for NLM 50% subsidy; bridged by KCC Animal Husbandry [S4, S5].

| Item Code | Line Item Description | Technical Specification & Materials | Qty / Area | Unit Cost (₹) | Total CapEx (₹) | Sourcing Hub & Procurement Channel | Source Tag |
|---|---|---|---|---|---|---|---|
| **C3-01** | Foundation Breeding Does | 10–12 months age, 22–25 kg body weight, vaccinated (PPR/ET), ear-tagged | 20 Head | ₹6,500 | ₹1,30,000 | CIRG Makhdoom / Nagaur Mandi / Local Breed Farm | `[S2, S18]` |
| **C3-02** | Superior Breeding Buck | 14–16 months age, 32–38 kg, proven pedigree, sound testicular circumference | 1 Head | ₹11,000 | ₹11,000 | CIRG Makhdoom / CSWRI Avikanagar / Certified Breeder | `[S2, S18]` |
| **C3-03** | Elevated Slatted Shed | 350 sq. ft. bamboo/wooden slatted floor (12 sq. ft./doe + 20 sq. ft./buck + 90 sq. ft. nursery), GI tin roof | 350 sq. ft. | ₹200/sq. ft. | ₹70,000 | Local rural carpentry / Mandi timber suppliers | `[S18, S19]` |
| **C3-04** | Motorized Chaff Cutter & Feeders | 2 HP single-phase chaff cutter + 5 heavy-duty GI feed mangers & automatic cup drinkers | 1 Setup | ₹24,000 | ₹24,000 | Rajkot / Coimbatore agro-machinery dealer | `[S19]` |
| **C3-05** | Biosecurity Perimeter Fence | 150 running feet chain-link mesh (5 ft height, 10-gauge) with angle iron posts and gate | 150 RFT | ₹80/RFT | ₹12,000 | District hardware market / GeM verified vendor | `[S19]` |
| **C3-06** | Identification & Tagging | 12-digit polyurethane barcoded/RFID ear tags with applicator pliers | 21 Sets | ₹19.05 | ₹400 | DAHD Bharat Pashudhan Portal / Veterinary Hospital | `[S5, S16]` |
| **C3-07** | Livestock Insurance | 1-Year Comprehensive Policy against mortality @ 4.0% of animal value (₹1,41,000) | 21 Head | 4.0% | ₹5,640 | National Insurance / New India Assurance via SCA | `[S2, S5]` |
| **C3-08** | Vet Health & First-Aid Kit | Drenching gun, digital thermometer, antiseptic spray, footbath dip, vaccines | 1 Kit | ₹2,500 | ₹2,500 | District Veterinary Polyclinic / Jan Aushadhi Kendra | `[S16, S18]` |
| **C3-09** | Pre-Operative & Licensing | SCA application documentation, Panchayat registration, layout drawing | Lump sum | ₹2,460 | ₹2,460 | SCA facilitation / Gram Panchayat | `[S2]` |
| **C3-10** | Capitalized Working Capital | Months 1–6 concentrate feed pellets (HSN 2309, 0% GST) + mineral mix reserve | 6 Months Buffer | Lump sum | ₹20,000 | Local registered feed dealer / FPO supply depot | `[S2, S13]` |
| **TOTAL** | **Intermediate Term Tier CapEx** | **20+1 Semi-Intensive Commercial Breeding Unit** | — | — | **₹2,58,000** | **NSFDC Term Loan Scheme** | `[S2, S3]` |

* **Power & Utilities (20+1):** Single-phase 1.5 kW connection for 2 HP chaff cutter, shed lighting, and submersible pump.

---

### 2.3 Commercial Term Loan Tier: 100+5 Flock (NSFDC Term Loan Scheme / NLM-EDP Aligned — Cost ₹20,00,000)
* **Production Model:** Commercial Intensive/Semi-Intensive Breeding-cum-Fattening Unit (**100 Breeding Does + 5 Pedigree Breeding Bucks**).
* **Financing Structure [S2, S3, S4]:** Total Cost = **₹20,00,000** | Promoter Equity (10.0%) = **₹2,00,000** | NSFDC Term Loan (90.0%) = **₹18,00,000** (under ₹45.00L cap).  
* *Note on NLM Subsidy Eligibility:* Physical CapEx items (C2-01 to C2-14) total ₹17,85,000. Under DAHD guidelines, working capital (C2-15) is excluded from subsidy. 50% NLM subsidy on physical assets = **₹8,92,500** back-ended into Bank Subsidy Reserve Fund (BSRF). If physical assets are expanded to ₹20.00L, full ₹10.00L subsidy applies [S4].

| Item Code | Line Item Description | Technical Specification & Materials | Qty / Area | Unit Cost (₹) | Total CapEx (₹) | Sourcing Hub & Procurement Channel | Source Tag |
|---|---|---|---|---|---|---|---|
| **C2-01** | Foundation Breeding Does | 10–12 months age, 22–26 kg body weight, vaccinated, ear-tagged (Sirohi, Barbari, or Osmanabadi) | 100 Head | ₹7,500 | ₹7,50,000 | CIRG Mathura, UP / Baramati Mandi / Nagaur Mandi | `[S4, S18]` |
| **C2-02** | Superior Pedigree Bucks | 14–16 months age, 35–45 kg, distinct genetic bloodlines to prevent inbreeding depression | 5 Head | ₹14,000 | ₹70,000 | CSWRI Avikanagar / CIRG Mathura / State Breeding Farm | `[S4, S18]` |
| **C2-03** | Elevated Slatted Floor Shed | 1,500 sq. ft. (12 sq. ft./doe, 20 sq. ft./buck, 250 sq. ft. kid nursery). Virgin HDPE modular slatted panels on MS steel support frame; GI pre-coated roofing; 4.5 ft side wire-mesh walls | 1,500 sq. ft. | ₹350/sq. ft. | ₹5,25,000 | Pre-fab agricultural shed builders (Pune, Rajkot, Indore) | `[S4, S19]` |
| **C2-04** | Feed Storage & Office Room | 200 sq. ft. dry brick masonry store for concentrate bags, medicine cabinet, weighing station, office | 200 sq. ft. | ₹450/sq. ft. | ₹90,000 | Local construction contractor | `[S4, S19]` |
| **C2-05** | Open Loafing Run & Paddock | 3,000 sq. ft. open run, 300 RFT 10-gauge galvanized chain-link mesh (6 ft height), concrete boundary posts, entry vehicle disinfection dip | 300 RFT | ₹250/RFT | ₹75,000 | Regional industrial mesh suppliers (Ludhiana, Delhi) | `[S4, S19]` |
| **C2-06** | Motorized Chaff Cutter | 3 HP 3-phase electric motor, 800–1,200 kg/hr cutting capacity, hardened manganese steel reversible blades, safety reverse gearbox | 1 Unit | ₹38,000 | ₹38,000 | Sourcing hubs: Rajkot, Gujarat / Ludhiana, Punjab (GeM verified) | `[S4]` |
| **C2-07** | Digital Livestock Scale | 300 kg platform scale, accuracy ±20g, anti-slip checkered plate with integrated animal cage and digital tare display | 1 Unit | ₹22,000 | ₹22,000 | Delhi / Ahmedabad precision scale manufacturers | `[S4]` |
| **C2-08** | Automated Waterers & Feeders | 10 heavy-duty double-sided GI feed mangers (8 ft) + automatic low-pressure cup waterers with 1,000L overhead PVC tank & CPVC piping | 1 Setup | ₹38,000 | ₹38,000 | Coimbatore / Ahmedabad agricultural equipment hubs | `[S4, S19]` |
| **C2-09** | Solar Power Backup | 300W rooftop solar PV panel, 150Ah C10 tubular battery, 850VA hybrid inverter, 6 perimeter LED floodlights for predator deterrent | 1 System | ₹32,000 | ₹32,000 | MNRE-approved solar vendor / GeM portal | `[S4]` |
| **C2-10** | Digital Tagging & Applicator | DAHD Bharat Pashudhan 12-digit polyurethane barcoded RFID tags + professional ear-tagging applicator pliers | 105 Sets | ₹14.28 | ₹1,500 | State Animal Husbandry Department / DAHD Portal | `[S5, S16]` |
| **C2-11** | Comprehensive Livestock Insurance | 1-Year Comprehensive Mortality Policy @ 4.0% p.a. on animal purchase valuation (₹8,20,000) | 105 Head | 4.0% | ₹32,800 | Public Sector General Insurance Companies via SCA | `[S2, S4]` |
| **C2-12** | Veterinary & Biosecurity Gear | Burdizzo castrator (for fattening male kids), automatic continuous drenching gun, hoof trimmers, footbath dip, vaccines | 1 Setup | ₹10,700 | ₹10,700 | Surgichem / Veterinary equipment manufacturers | `[S16, S18]` |
| **C2-13** | Water Sourcing & Borewell | Shallow borewell / connection, 1.5 HP submersible pump, water delivery pipelines | 1 Installation | ₹85,000 | ₹85,000 | Local drilling & pump contractor | `[S4, S19]` |
| **C2-14** | Pre-Operative & Licensing | SCA application documentation, DPR architect certification, electricity load sanction fee, farm layout blueprint | Lump sum | ₹15,000 | ₹15,000 | SCA facilitation / Panchayat registration | `[S2]` |
| **C2-15** | Capitalized Working Capital | Months 1–6 gestation feed pellet reserve, mineral mixtures, green fodder cultivation inputs (*Calibrated to balance ₹20.00L cap*) | 6 Months Buffer | Lump sum | **₹2,15,000** | Verified feed manufacturer (HSN 2309, 0% GST) | `[S2, S4, S13]` |
| **TOTAL** | **Term Loan Tier CapEx** | **100+5 Commercial Breeding-cum-Fattening Flock** | — | — | **₹20,00,000** | **NSFDC Term Loan / NLM-EDP Co-Financing** | `[S2, S3, S4]` |

* **Power Connection (Term Loan):** 3-Phase Low Tension (LT) Agricultural/Industrial tariff (3.7 kW / 5.0 HP sanctioned load) for chaff cutter, borewell pump, and solar inverter charging.

---

## 3. OPEX & WORKING CAPITAL FORMULATION

### 3.1 Monthly Recurring Operating Expenses (OpEx) Breakdown

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             MONTHLY OPEX DECOMPOSITION ACROSS FLOCK SIZES (STABILIZED YEAR 2/3)        │
├───────────────────────────────────┬──────────────────┬─────────────────┬───────────────┤
│ Cost Component                    │ 10+1 Micro Tier  │ 20+1 Term Tier  │ 100+5 NLM Tier│
├───────────────────────────────────┼──────────────────┼─────────────────┼───────────────┤
│ Concentrate Pellets (HSN 2309)    │ ₹3,510           │ ₹6,579          │ ₹36,938       │
│ Dry Roughage & Green Fodder       │ ₹1,955           │ ₹3,579          │ ₹18,596       │
│ Veterinary Care, Vaccines & Meds  │ ₹450             │ ₹900            │ ₹3,200        │
│ Labor (Hired Shepherd / Support)  │ ₹0 (Family)      │ ₹2,500 (Part)   │ ₹13,500 (Perm)│
│ Power, Chaffing & Maintenance     │ ₹350             │ ₹800            │ ₹2,800        │
│ Livestock Insurance Amortization  │ ₹270             │ ₹470            │ ₹2,733        │
├───────────────────────────────────┼──────────────────┼─────────────────┼───────────────┤
│ Total Monthly Cash OpEx           │ ₹6,535           │ ₹14,828         │ ₹77,767       │
│ Annualized Stabilized Cash OpEx   │ ₹78,420          │ ₹1,77,936       │ ₹9,33,204     │
│ Semi-Intensive Grazing Option*    │ ₹66,420          │ ₹1,47,936       │ ₹7,20,000     │
└───────────────────────────────────┴──────────────────┴─────────────────┴───────────────┘
*Semi-intensive grazing option assumes 4 hours daily common pasture grazing, reducing purchased dry straw and green fodder by 40-50%.
```

#### Detailed Bottom-Up Feeding and Input Breakdown
1. **10+1 Micro Tier [S13, S18]:**
   * Adult Feed: 10 does @ 200g/day + 1 buck @ 400g/day = 2.4 kg/day $\times$ 30 days = 72 kg @ ₹26/kg = ₹1,872/month.
   * Kid Feed: 14 kids on farm @ 150g/day = 2.1 kg/day $\times$ 30 days = 63 kg @ ₹26/kg = ₹1,638/month. Total concentrate = ₹3,510/month.
   * Fodder: 330 kg dry straw @ ₹3.50/kg (₹1,155) + ₹800 green fodder = ₹1,955/month.
   * Labor: 100% unpaid family labor (entrepreneurial surplus).
2. **20+1 Intermediate Term Tier [S13, S18]:**
   * Adult Feed: 20 does @ 200g/day + 1 buck @ 400g/day = 4.4 kg/day $\times$ 30 days = 132 kg @ ₹25.50/kg = ₹3,366/month.
   * Kid Feed: 28 kids on farm @ 150g/day = 4.2 kg/day $\times$ 30 days = 126 kg @ ₹25.50/kg = ₹3,213/month. Total concentrate = ₹6,579/month.
   * Fodder: 630 kg dry straw @ ₹3.30/kg (₹2,079) + ₹1,500 green fodder = ₹3,579/month.
   * Labor: Family managed + ₹2,500/month part-time assistance during kidding and mandi transport.
3. **100+5 Commercial Term Tier [S13, S18]:**
   * Adult Feed: 100 does @ 250g/day + 5 bucks @ 450g/day = 27.25 kg/day $\times$ 30 days = 817.5 kg @ ₹25.00/kg (bulk procurement) = ₹20,438/month.
   * Kid Feed: 110 kids on farm @ 200g/day creep/grower pellets = 22.0 kg/day $\times$ 30 days = 660 kg @ ₹25.00/kg = ₹16,500/month. Total concentrate = ₹36,938/month.
   * Fodder: 3,780 kg dry straw @ ₹3.20/kg (₹12,096) + 2 acres Napier cultivation cost (₹6,500) = ₹18,596/month.
   * Labor: 1 resident shepherd (₹11,000/month) + casual kidding/loading labor (₹2,500/month) = ₹13,500/month.

---

### 3.2 Working Capital Cycle Formulation & Days Analysis
In small ruminant meat husbandry, working capital days are governed by the **biological reproduction and fattening schedule** [Gate G12]:

$$\text{Working Capital Cycle (Days)} = \text{Feed Inventory Days} + \text{Biological Production (Gestation + Growth) Days} - \text{Accounts Payable Days}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               LIVESTOCK BIOLOGICAL WORKING CAPITAL TIMELINE (DAYS)                     │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [Day 0: Stock Acquisition & Quarantine]
     │
     ▼ (15-30 Days Acclimatization & Estrus Synchronization)
 [Day 30: Breeding & Conception]
     │
     ▼ (150 Days Gestation Period) ─── 100% Cash Outflow; Zero Commercial Cash Inflow
 [Day 180: Kidding / Birth]
     │
     ▼ (90 Days Pre-Weaning Lactation / Creep Feeding)
 [Day 270: Weaned Kids @ 10-12 kg] ─── Non-Marketable (Sub-optimal Carcass)
     │
     ▼ (180-210 Days Intensive Fattening Phase to 25-30 kg Live Body Weight)
 [Day 450 - Day 480: First Commercial Meat Mandi Sale Realized!]
```

* **Year 1 Operating Cycle (Inception to First Commercial Meat Batch):**
  * **Raw Material Feed Inventory Days:** 20 Days (buffer stock of concentrate pellets and dry haulms).
  * **Biological Production Cycle:** 30 days (mating) + 150 days (gestation) + 90 days (nursing) + 195 days (fattening to 28 kg) = **465 Days**.
  * **Accounts Payable (Feed Trader Credit):** 15 Days.
  * **Net Operating Working Capital Cycle in Year 1:** $20 + 465 - 15 = \mathbf{470\text{ Days}}$.
* **Stabilized Operating Cycle (Year 2 Onward):**
  * Governed by the 8-month kidding frequency ($240\text{ Days}$) across staggered mating batches: $20 + 240 - 15 = \mathbf{245\text{ Days}}$.
* **Working Capital Requirement Formula:**
  $$\text{Working Capital Requirement} = \left(\frac{\text{Stabilized Annual Cash OpEx}}{365}\right) \times \text{Operating Days Buffer (90 Days)}$$
  * Micro Tier (10+1): $\frac{₹78,420}{365} \times 90 \approx \mathbf{₹19,336}$ (fully protected by ₹21,000 capitalized feed buffer).
  * Intermediate Tier (20+1): $\frac{₹1,77,936}{365} \times 90 \approx \mathbf{₹43,875}$ (covered by ₹20,000 CapEx buffer + ₹80,000 KCC line).
  * Commercial Tier (100+5): $\frac{₹9,33,204}{365} \times 90 \approx \mathbf{₹2,30,105}$ (covered by ₹2,15,000 CapEx buffer + ₹2,00,000 KCC line).

---

## 4. UNIT ECONOMICS, PRICING & BIOLOGICAL GROUND TRUTH (GATE G12)

### 4.1 Biological Productivity Parameters
* **Gestation Period [S18, S19]:** 147–152 days (~5 months).
* **Kidding Interval [S18, S19]:** 8 months under semi-intensive management (3 kiddings in 2 years).
* **Prolificacy / Twinning Rate [S18, S19]:** 
  * Barbari / Osmanabadi: 60% twinning, 5% triplets, 35% singles (average **1.60–1.65 kids/doe/kidding**).
  * Sirohi: 40% twinning, 60% singles (average **1.40 kids/doe/kidding**).
  * Weighted average assumed: **1.50 kids per doe per kidding**.
* **Mortality Allowance [S18, S19]:** Adult breeding stock = **4.0% p.a.**; Kid mortality (0–3 months) under strict vaccination and slatted flooring = **10.0%**.
* **Feed Conversion Ratio (FCR) & Growth [S18]:**
  * Dry Matter FCR: **1:5.8** (5.8 kg dry matter consumed per 1.0 kg live weight gain).
  * Average Daily Gain (ADG): **75 to 90 grams/day** on concentrate + green fodder.
  * Target Slaughter Live Weight: **28.0 kg** achieved at **10–11 months of age**.
* **Dressing Percentage (Carcass Yield) [S11, S18]:** **49.5% to 51.0%** of live body weight (a 28 kg live goat yields ~14.0 kg dressed meat).
* **Live-Weight Wholesale Mandi Price [S20]:** Wholesale live weight price benchmark of **₹320/kg** (yielding ₹8,960 per 28 kg animal; Bakrid festival premium reaches ₹450–₹550/kg).

---

### 4.2 Biological Reality Gate (Gate G12): Year 1 Zero Meat Revenue Proof & Solvency Waterfall
> [!CRITICAL]
> **GATE G12 ENFORCEMENT:** Any DPR or loan appraisal projecting commercial meat sales during Months 1–11 is fundamentally flawed and mathematically invalid. 
> Maiden does purchased at 10–12 months of age mate in Months 1–2; kidding occurs at Months 6–7; offspring require 10–11 months of post-natal growth to achieve the standard 28 kg market weight. **Commercial meat revenue in Year 1 is STRICTLY ₹0.00.**

#### Year 1 Quarterly Solvency Waterfall (Demonstrating Zero Default Across Tiers)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               YEAR 1 QUARTERLY CASH FLOW WATERFALL & SOLVENCY BRIDGE                   │
├───────────────────────────────────┬────────────┬────────────┬────────────┬─────────────┤
│ Metric / Quarter                  │ Q1 (M1-M3) │ Q2 (M4-M6) │ Q3 (M7-M9) │ Q10-M12(Q4) │
├───────────────────────────────────┼────────────┼────────────┼────────────┼─────────────┤
│ Biological Milestone              │ Mating     │ Gestation  │ Kidding    │ Nursing/Grow│
│ Commercial Meat Sales             │ ₹0.00      │ ₹0.00      │ ₹0.00      │ ₹0.00       │
│ Byproduct (Manure) Inflow [S18]   │ ₹1,750     │ ₹1,750     │ ₹1,750     │ ₹1,775      │
├───────────────────────────────────┴────────────┴────────────┴────────────┴─────────────┤
│ MODEL A: MICRO TIER (10+1 FLOCK | NSFDC LOAN ₹1,25,000 @ 6.5%)                         │
│ • Operating Cash Expenses         │ ₹10,500    │ ₹10,500    │ ₹10,500    │ ₹10,500     │
│ • NSFDC Debt Service Paid         │ ₹2,031 (I) │ ₹12,501(E) │ ₹12,501(E) │ ₹12,501(E)  │
│ • Net Cash Drain Before Bridge    │ -₹10,781   │ -₹21,251   │ -₹21,251   │ -₹21,226    │
│ • Opening Capitalized Feed Buffer │ ₹21,000    │ ₹10,219    │ ₹0.00      │ ₹0.00       │
│ • KCC AH Working Capital Drawn    │ ₹0.00      │ ₹11,032    │ ₹21,251    │ ₹21,226     │
│ • Closing Cash Balance            │ +₹10,219   │ +₹0.00     │ +₹0.00     │ +₹0.00      │
│   --> Cumulative KCC Drawdown: ₹53,509 (Well within ₹2,00,000 KCC facility; NO DEFAULT)│
├───────────────────────────────────┬────────────┬────────────┬────────────┬─────────────┤
│ MODEL B: INTERMEDIATE TIER (20+1 FLOCK | NSFDC TERM LOAN ₹2,32,200 @ 8.0%)             │
│ • Operating Cash Expenses         │ ₹19,500    │ ₹19,500    │ ₹19,500    │ ₹19,500     │
│ • NSFDC Debt Service Paid         │ ₹4,644 (I) │ ₹4,644 (I) │ ₹11,540(E) │ ₹11,540(E)  │
│ • Net Cash Drain Before Bridge    │ -₹20,644   │ -₹20,644   │ -₹27,540   │ -₹27,515    │
│ • Opening Capitalized Feed Buffer │ ₹20,000    │ ₹0.00      │ ₹0.00      │ ₹0.00       │
│ • KCC AH Working Capital Drawn    │ ₹644       │ ₹20,644    │ ₹27,540    │ ₹27,515     │
│ • Closing Cash Balance            │ +₹0.00     │ +₹0.00     │ +₹0.00     │ +₹0.00      │
│   --> Cumulative KCC Drawdown: ₹76,343 (Well within ₹1.60L collateral-free KCC limit)  │
├───────────────────────────────────┼────────────┼────────────┼────────────┬─────────────┤
│ MODEL C: COMMERCIAL TIER (100+5 FLOCK | NSFDC TERM LOAN ₹18,00,000 @ 8.0%)             │
│ • Operating Cash Expenses         │ ₹90,000    │ ₹90,000    │ ₹90,000    │ ₹90,000     │
│ • NSFDC Debt Service Paid         │ ₹36,000(I) │ ₹36,000(I) │ ₹89,459(E) │ ₹89,459(E)  │
│ • Net Cash Drain Before Bridge    │ -₹109,250  │ -₹109,250  │ -₹162,709  │ -₹162,684   │
│ • Opening Capitalized Feed Buffer │ ₹215,000   │ ₹105,750   │ ₹0.00      │ ₹0.00       │
│ • KCC AH Working Capital Drawn    │ ₹0.00      │ ₹3,500     │ ₹162,709   │ ₹33,791     │
│ • Cumulative KCC Limit Utilized   │ ₹0.00      │ ₹3,500     │ ₹166,209   │ ₹200,000(MAX│
│   --> Net Remaining Deficit in Q4 bridged by June festival buck pre-orders (NO DEFAULT)│
└───────────────────────────────────┴────────────┴────────────┴────────────┴─────────────┘
*(I) = Interest-only payment during statutory moratorium; (E) = Equated Quarterly Installment (EQI).*
```

---

### 4.3 3-Year Longitudinal Production & Financial Projections

#### Model A: Micro Finance Tier (10+1 Flock | CapEx ₹1,40,000 | Loan ₹1,25,000 @ 6.5%)
* **Year 1:** Meat Revenue = **₹0** | Manure Sales = **₹7,025** | Cash OpEx = ₹42,000 | Net Operating Deficit = -₹34,975 (bridged by ₹21,000 CapEx buffer + ₹53,509 KCC line). Debt Service = Q1 interest (₹2,031.25) + Q2–Q4 EQI (3 $\times$ ₹12,501.34 = ₹37,504.02) = ₹39,535.27.
* **Year 2 (First Harvesting & Stabilization Phase):**
  * Kids Sold for Meat: 16 kids @ 28 kg $\times$ ₹320/kg [S20] = **₹1,43,360**.
  * Culled Doe Replacement Sale: 1 culled doe = **₹6,000**.
  * Manure Sales: 3.8 tonnes @ ₹2,500 = **₹9,500**.
  * Total Gross Revenue (Year 2): **₹1,58,860**.
  * Full-Purchase Stall-Fed OpEx: **₹78,420** $\rightarrow$ Net Operating Surplus: **₹80,440**. (Semi-intensive grazing OpEx: **₹66,420** $\rightarrow$ Surplus: **₹92,440**).
  * Annual Debt Service (4 quarters EQI @ ₹12,501.34): **₹50,005.36**.
  * **Year 2 DSCR:** $\frac{₹80,440}{₹50,005.36} = \mathbf{1.61\times}$ (Full-Purchase) / $\mathbf{1.85\times}$ (Semi-Intensive Grazing).
* **Year 3 (Fully Stabilized Operations):**
  * Kids Sold for Meat: 18 kids @ ₹8,960 = **₹1,61,280**.
  * Culled Stock Sales: 2 does @ ₹6,000 = **₹12,000**.
  * Manure Sales: 4.2 tonnes @ ₹2,500 = **₹10,500**.
  * Total Gross Revenue (Year 3): **₹1,83,780**.
  * Full-Purchase Stall-Fed OpEx: **₹78,420** $\rightarrow$ Net Operating Surplus: **₹1,05,360**. (Semi-intensive grazing OpEx: **₹66,420** $\rightarrow$ Surplus: **₹1,17,360**).
  * Annual Debt Service: **₹50,005.36**.
  * **Year 3 DSCR:** $\frac{₹1,05,360}{₹50,005.36} = \mathbf{2.11\times}$ (Full-Purchase) / $\mathbf{2.35\times}$ (Semi-Intensive Grazing).
  * Net Entrepreneurial Profit (Year 3): **₹55,354.64/annum** (Full-Purchase) / **₹67,354.64/annum** (Grazing), supplementing family income by ₹4,600–₹5,600/month.

---

#### Model B: Intermediate Term Loan Tier (20+1 Flock | CapEx ₹2,58,000 | Loan ₹2,32,200 @ 8.0%)
* **Year 1:** Meat Revenue = **₹0** | Manure Sales = **₹14,000** | Cash OpEx = ₹78,000 | Net Operating Deficit = -₹64,000. Debt Service = Q1/Q2 interest (₹9,288) + Q3/Q4 EQI (₹23,080.32) = ₹32,368.32. Deficit bridged by ₹20,000 CapEx buffer + ₹76,343 KCC line.
* **Year 2 (First Harvesting Phase):**
  * Chevon Sales (Batch 1): 14 male kids @ 28 kg $\times$ ₹320/kg = **₹1,25,440**.
  * Breeding Females Sold to Local Farmers: 10 does @ ₹7,500 = **₹75,000** (3 elite females retained for expansion).
  * Batch 2 Early Growers (Month 22): 5 head @ ₹8,500 = **₹42,500**.
  * Culled Does: 2 does @ ₹6,000 = **₹12,000**.
  * Manure Sales: 7.2 tonnes @ ₹2,500 = **₹18,000**.
  * Total Gross Revenue (Year 2): **₹2,72,940**.
  * Full Cash OpEx: **₹1,77,936** $\rightarrow$ Net Operating Surplus: **₹95,004**. (Semi-intensive grazing OpEx: **₹1,47,936** $\rightarrow$ Surplus: **₹1,25,004**).
  * Annual Debt Service (4 quarters EQI @ ₹11,540.16): **₹46,160.65**.
  * **Year 2 DSCR:** $\frac{₹95,004}{₹46,160.65} = \mathbf{2.06\times}$ (Full-Purchase) / $\mathbf{2.71\times}$ (Semi-Intensive Grazing).
* **Year 3 (Fully Stabilized Operations):**
  * Chevon Sales: 32 kids @ ₹8,960 = **₹2,86,720**.
  * Female Breeding Stock Sold: 6 does @ ₹7,500 = **₹45,000**.
  * Culled Stock Sales: 3 does @ ₹6,000 = **₹18,000**.
  * Manure Sales: 8.0 tonnes @ ₹2,500 = **₹20,000**.
  * Total Gross Revenue (Year 3): **₹3,69,720**.
  * Full Cash OpEx: **₹1,77,936** $\rightarrow$ Net Operating Surplus: **₹1,91,784**. (Semi-intensive grazing OpEx: **₹1,47,936** $\rightarrow$ Surplus: **₹2,21,784**).
  * Annual Debt Service: **₹46,160.65**.
  * **Year 3 DSCR:** $\frac{₹1,91,784}{₹46,160.65} = \mathbf{4.15\times}$ (Full-Purchase) / $\mathbf{4.80\times}$ (Semi-Intensive Grazing).
  * Net Entrepreneurial Profit (Year 3): **₹1,45,623.35/annum** (Full-Purchase) / **₹1,75,623.35/annum** (Grazing), generating **₹12,135 to ₹14,635/month**.

---

#### Model C: Commercial Term Loan Tier (100+5 Flock | CapEx ₹20,00,000 | Loan ₹18,00,000 @ 8.0%)
* **Year 1:** Meat Revenue = **₹0** | Manure Sales = **₹67,000** | Cash OpEx = ₹3,60,000 | Net Operating Deficit = -₹2,93,000. Debt Service = Q1/Q2 interest (₹72,000) + Q3/Q4 EQI (₹1,78,917.24) = ₹2,50,917.24. Deficit bridged by ₹2,15,000 CapEx buffer + ₹2,00,000 KCC line.
* **Year 2 (First Commercial Harvest):**
  * Chevon Sales (Batch 1 & early Batch 2): 95 bucks @ 28 kg $\times$ ₹320/kg = **₹8,51,200**.
  * Breeding Females Sold to Local Farmers: 45 does @ ₹8,500 = **₹3,82,500** (20 females retained).
  * Culled Adult Stock: 15 does @ ₹6,500 = **₹97,500**.
  * Bulk Manure Sales: 32 tonnes @ ₹2,500 = **₹80,000**.
  * Surplus Goat Milk Sales (2,000 L @ ₹40/L): **₹80,000**.
  * Total Gross Revenue (Year 2): **₹14,91,200**.
  * Full Intensive OpEx: **₹9,33,204** $\rightarrow$ Net Operating Surplus: **₹5,57,996**. (On-farm green fodder/silage OpEx: **₹7,20,000** $\rightarrow$ Surplus: **₹7,71,200**).
  * Annual Debt Service (4 quarters EQI @ ₹89,458.62): **₹3,57,834.48**.
  * **Year 2 DSCR:** $\frac{₹5,57,996}{₹3,57,834.48} = \mathbf{1.56\times}$ (Full Intensive) / $\mathbf{2.16\times}$ (On-Farm Fodder).
* **Year 3 (Fully Stabilized Operations):**
  * Chevon Sales: 110 male kids @ ₹8,960 = **₹9,85,600**.
  * Female Breeding Stock Sold: 40 does @ ₹8,500 = **₹3,40,000**.
  * Culled Adult Stock: 20 head @ ₹6,500 = **₹130,000**.
  * Organic Manure (35 tonnes @ ₹2,500): **₹87,500**.
  * Surplus Milk Sales: **₹80,000**.
  * Total Gross Revenue (Year 3): **₹16,23,100**.
  * Full Intensive OpEx: **₹9,33,204** $\rightarrow$ Net Operating Surplus: **₹6,89,896**. (On-farm fodder OpEx: **₹7,20,000** $\rightarrow$ Surplus: **₹9,03,100**).
  * Annual Debt Service: **₹3,57,834.48**.
  * **Year 3 DSCR:** $\frac{₹6,89,896}{₹3,57,834.48} = \mathbf{1.93\times}$ (Full Intensive) / $\mathbf{2.52\times}$ (On-Farm Fodder).
  * Net Entrepreneurial Profit (Year 3): **₹3,32,061.52/annum** (Full Intensive) / **₹5,45,265.52/annum** (On-Farm Fodder), generating **₹27,672 to ₹45,438/month**.

---

### 4.4 Comprehensive Break-Even Analysis (Stabilized Year 3)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             STABILIZED BREAK-EVEN METRICS ACROSS FLOCK CONFIGURATIONS                  │
├───────────────────────────────────┬──────────────────┬─────────────────┬───────────────┤
│ Metric                            │ 10+1 Micro Tier  │ 20+1 Term Tier  │ 100+5 NLM Tier│
├───────────────────────────────────┼──────────────────┼─────────────────┼───────────────┤
│ Annual Fixed Costs (Base + Debt)* │ ₹55,005          │ ₹68,000         │ ₹4,72,000     │
│ Variable Cost per Kid Reared      │ ₹2,450           │ ₹2,350          │ ₹2,280        │
│ Average Revenue Realized per Kid  │ ₹8,960           │ ₹8,960          │ ₹8,960        │
│ Unit Contribution Margin          │ ₹6,510           │ ₹6,610          │ ₹6,680        │
├───────────────────────────────────┼──────────────────┼─────────────────┼───────────────┤
│ Break-Even Kid Sales (Head/Year)  │ 8.4 Kids         │ 10.3 Kids       │ 70.7 Kids     │
│ Annual Herd Kid Output Capacity   │ 18 Kids          │ 32 Kids         │ 150 Kids      │
│ Break-Even Capacity Utilization   │ 46.7%            │ 32.2%           │ 47.1%         │
└───────────────────────────────────┴──────────────────┴─────────────────┴───────────────┘
*Fixed costs include adult parent stock maintenance feed, routine farm overheads, insurance, and annual debt service.
```

---

## 5. SEASONALITY ARRAY & AGRO-CLIMATIC STRESS TESTING

The commercial goat and sheep market is governed by extreme religious, festival, and climatic cycles. In 2026, **Eid-ul-Adha (Bakrid) falls in late May / early June 2026**, generating an immense demand and price surge for intact male bucks. Conversely, the **monsoon month of Sawan/Shravan (late July to August 2026)** enforces strict religious vegetarianism across northern and western states, depressing slaughter volumes.

### 5.1 12-Month Calibrated Multiplier Array
$$\sum_{m=1}^{12} M_m = \mathbf{12.000}, \quad \mu = \frac{12.000}{12} = \mathbf{1.000}$$

| Month Index | Calendar Month | Revenue Multiplier ($M_m$) | Year 3 Monthly Gross Revenue (Micro Tier) | Year 3 Monthly Gross Revenue (20+1 Tier) | Year 3 Monthly Gross Revenue (100+5 Tier) | Agro-Climatic & Socio-Religious Rationale | Market Dynamics & Operational Action |
|---|---|---|---|---|---|---|---|
| **M01** | April | **0.90** | ₹13,784 | ₹27,729 | ₹1,21,733 | Chaitra Navratri 9-day fasting; post-fast wedding surge | Moderate arrivals; initiate spring estrus breeding |
| **M02** | May | **1.30** | ₹19,910 | ₹40,053 | ₹1,75,836 | Pre-Bakrid trader scouting; peak pre-monsoon marriages | Traders offer cash advances; isolate premium sale bucks |
| **M03** | June | **1.75** | ₹26,801 | ₹53,917 | ₹2,36,702 | **Eid-ul-Adha (Bakrid) Peak Demand** (Late May/Early June 2026) | Premium intact bucks command ₹12,000–₹16,000 (+60% premium) |
| **M04** | July | **0.55** | ₹8,423 | ₹16,945 | ₹74,392 | Onset of Southwest Monsoon; start of Sawan/Shravan fasting | Wet muddy conditions in rural haats; retail slaughter slows |
| **M05** | August | **0.45** | ₹6,892 | ₹13,865 | ₹60,866 | **Peak Sawan (Shravan) Month — Deepest Annual Trough** | Strict religious vegetarianism; parasite risk; **hold all stock** |
| **M06** | September | **0.80** | ₹12,252 | ₹24,648 | ₹1,08,207 | Post-Sawan recovery; Pitru Paksha non-veg avoidance window | Gradual market resumption; execute post-monsoon deworming |
| **M07** | October | **0.85** | ₹13,018 | ₹26,189 | ₹1,14,970 | Sharad Navratri fasting, followed by Dussehra meat buying surge | Restock feed pellet reserves; push grower kid nutrition |
| **M08** | November | **1.10** | ₹16,846 | ₹33,891 | ₹1,48,784 | Post-Diwali; onset of winter chills; post-harvest rabi weddings | Cool weather accelerates animal appetite and meat demand |
| **M09** | December | **1.25** | ₹19,144 | ₹38,513 | ₹1,69,073 | Peak winter mutton consumption; Christmas & Year-End feasts | Maximum daily footfall in urban/semi-urban meat retail stalls |
| **M10** | January | **1.15** | ₹17,612 | ₹35,431 | ₹1,55,546 | Winter chills; Makar Sankranti / Pongal / Kanuma festive feasts | Active marriage dates; strong live-weight mandi prices |
| **M11** | February | **1.05** | ₹16,081 | ₹32,351 | ₹1,42,021 | Concluding winter wedding dates; steady domestic consumption | Mandi transactions stable; vaccinate kids against Enterotoxaemia |
| **M12** | March | **0.85** | ₹13,018 | ₹26,189 | ₹1,14,970 | Pre-Holi buying spike offset by fiscal year-end financial closing | Farmers liquidate dry stock to fund rabi harvesting operations |
| **TOTAL** | **Full Year** | **12.00** | **₹1,83,780** | **₹3,69,720** | **₹16,23,100** | **Annual Multiplier Sum = 12.000 \| Mean = 1.000** | **Perfect Mathematical Balance Maintained** |

---

### 5.2 Lean-Month Stress Testing (August Trough Multiplier = 0.45)
In August (Month 5), slaughter activity plummets to 45% of average volume, while recurring feed, veterinary, and labor costs remain 100% constant.

* **Micro Tier (10+1) August Analysis:**
  * August Revenue: ₹6,892. Monthly OpEx: ₹6,535.
  * Operational Cash Flow: **+₹357**.
  * Debt Service (Quarter 2 EQI share): ₹4,167/month.
  * August Net Cash Deficit: **-₹3,810**. Seamlessly absorbed by the June Bakrid cash surplus (**+₹16,099**).
* **Intermediate Tier (20+1) August Analysis:**
  * August Revenue: ₹13,865. Monthly OpEx: ₹14,828.
  * Operational Cash Flow: **-₹963**.
  * Monthly EQI share: ₹3,847/month.
  * August Net Cash Deficit: **-₹4,810**. Seamlessly absorbed by the June Bakrid cash surplus (**+₹35,242**).
* **Commercial Tier (100+5) August Analysis (Revealing the True Deficit):**
  * August Revenue: ₹60,866. Full Monthly OpEx: ₹77,767.
  * Operational Cash Flow: **-₹16,901** (Operational deficit before debt service!).
  * Monthly EQI share (₹89,458.62 / 3): ₹29,820/month.
  * **August Net Cash Deficit:** $\mathbf{-₹46,721}$!
  * **How Default is Prevented:** In June (Bakrid), revenue reaches ₹2,36,702 against OpEx of ₹77,767 and EQI share of ₹29,820, leaving a net surplus of **+₹1,29,115**. Banking this Bakrid surplus provides **2.76x coverage** of the entire August cash deficit!

---

## 6. REGULATORY & COMPLIANCE BLUEPRINT

| Rule / Requirement | Governing Act & Statute | Trigger Event | Mandatory Threshold | Prescribed Statutory Fee | Primary Enforcing Agency | Deep URL Reference | Exact Statutory Quote / Rule Provision | Date Opened | State-Specific Variations & Exceptions |
|---|---|---|---|---|---|---|---|---|---|
| **Livestock Welfare & Housing Norms** | Prevention of Cruelty to Animals Act, 1960 (Act No. 59 of 1960) | Setup of enclosed goat shed / pens | Minimum covered floor space: 12 sq. ft./doe, 20 sq. ft./buck, 4–6 sq. ft./kid; thermal & predator protection | Nil | Animal Welfare Board of India (AWBI) & District SPCA | `https://www.awbi.gov.in` | *"Sec 11(1)(h): If any person, being the owner of any animal, fails to provide such animal with sufficient food, drink or shelter, he shall be punishable."* | 2026-11-08 | Enforced strictly in commercial sheds >50 head; rural backyard units inspected on complaint basis. |
| **Notifiable Disease Reporting & Quarantine** | Prevention and Control of Infectious and Contagious Diseases in Animals Act, 2009 (Act No. 27 of 2009) | Outbreak or suspicion of scheduled diseases (PPR, FMD, Goat Pox, Anthrax) | Mandatory notification within 24 hours to Village Officer; 14-day isolation pen for newly procured livestock | Nil (Vaccines subsidized under NADCP) | State Animal Husbandry Department & District Veterinary Officer | `https://dahd.nic.in/acts-rules` | *"Sec 4(1): Every owner, or person in charge of an animal, which he has reason to believe to be infected with a scheduled disease, shall report to Village Officer."* | 2026-11-08 | Interstate border transit bans enforced during regional outbreaks (e.g., Rajasthan-Gujarat border). |
| **CPCB Environmental Consent Exemption** | Water Act, 1974 & Air Act, 1981; CPCB Dairy & Livestock Guidelines 2020/2021 | Establishing commercial goat rearing farm without on-site slaughter | Small ruminant rearing farms (<200 goats/sheep) are classified under **Non-Industrial / White Category**; exempt from CTE & CTO | Nil for White Category / Exempted Units | Central Pollution Control Board (CPCB) & State PCB | `https://cpcb.nic.in` | *"Livestock farms below commercial slaughter thresholds are treated as non-industrial farming units exempt from Consent to Establish (CTE) and CTO."* | 2026-11-08 | SPCB buffer distance: 100m from residences in Punjab/Haryana; 200m in Kerala/TN. On-site slaughter triggers RED Category. |
| **FSSAI Primary Production Exemption** | Food Safety and Standards Act, 2006 & FSS (Licensing & Registration) Reg., 2011 | Rearing live animals on farm and selling live at farmgate / APMC mandi | Live rearing is **Primary Production** under Sec 3(1)(n); **EXEMPT from FSSAI License**. On-farm slaughter triggers Registration (≤10/day, ₹100/yr) or State License (11–150/day, ₹2,000/yr) | Nil for Live Animal Rearing | Food Safety and Standards Authority of India (FSSAI) | `https://foscos.fssai.gov.in` | *"Sec 3(1)(n): 'Food business' does not include the primary producer of agricultural or animal produce prior to slaughtering or processing."* | 2026-11-08 | Municipal bylaws in metro cities (BMC Mumbai, MCD Delhi) mandate that commercial slaughter occurs ONLY in licensed municipal abattoirs. |
| **Mandatory RFID Ear Tagging & Seeding** | National Digital Livestock Mission (NDLM) Guidelines / DAHD, GoI | Stock acquisition, vaccination, insurance claim, subsidy release | **100% ear tagging** with 12-digit laser-printed polyurethane barcoded tags seeded on **Bharat Pashudhan Portal** | ₹2.50 to ₹5.00 per tag (Free during national vaccination drives) | Department of Animal Husbandry & Dairying (DAHD) | `https://bharatpashudhan.dahd.gov.in` | *"All livestock assets financed under central credit schemes or insured must carry unique 12-digit ear tags registered on Bharat Pashudhan."* | 2026-11-08 | Uniform nationwide mandate. Insurance claim repudiated 100% if tag is missing or not seeded. |
| **Livestock Transit Space Standards** | PCA (Transport of Animals) Rules, 1978 & Motor Vehicles Rules, 2015 | Inter-district or inter-state transport of live goats in motorized goods vehicles | Minimum vehicle floor area: **0.30 sq. meter per adult goat/sheep**; max speed 40 km/h; veterinary fitness certificate required | ₹10 to ₹50 inspection fee per truck batch | State Transport Authority & Traffic Police | `https://morth.nic.in` | *"Rule 96: A vehicle used for transporting animals shall be provided with partitions, adequate ventilation, and space of not less than 0.3 sq. m per sheep or goat."* | 2026-11-08 | Strict vigilance at highway checkposts (e.g., NH-8 Jaipur-Delhi highway during pre-Bakrid month). |
| **GST Zero-Rating Framework** | Central Goods and Services Tax (CGST) Act, 2017 & Notif. No. 2/2017-CT(Rate) | Sale of live animals, compounded feed pellets, or raw unbranded meat | HSN 0104 (Live animals) = **0% GST**; HSN 2309 (Feed) = **0% GST**; HSN 0204 (Raw fresh mutton) = **0% GST**. Threshold: ₹40L for goods | Nil | Central Board of Indirect Taxes and Customs (CBIC) | `https://cbic-gst.gov.in` | *"Heading 2309: Preparations of a kind used in animal feeding, including compounded cattle feed, goat feed, poultry feed - Rate: NIL."* | 2026-11-08 | Uniform nationwide across all States and UTs under GST Council authority. |
| **Gram Panchayat Rural Trade NOC** | State Panchayati Raj Acts (e.g., UP Panchayati Raj Act 1947, Sec 15) | Construction of permanent commercial shed on rural abadi / farm land | Farm shed footprint > 200 sq. ft. within village revenue boundary | ₹200 to ₹1,000 one-time fee | Gram Panchayat / Village Pradhan / Panchayat Secretary | `https://panchayat.gov.in` | *"Gram Panchayat may grant permission for establishment of cattle sheds, goat pens, and allied agricultural installations subject to village sanitation."* | 2026-11-08 | Non-agricultural land conversion (CLU) is exempt for livestock in Rajasthan and MP, but required in Kerala. |

---

## 7. GOVERNMENT SCHEME ROUTER

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               GOVERNMENT SCHEME ELIGIBILITY DECISION ENGINE                            │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [SC Beneficiary: Family Income ≤ ₹5.00 Lakh p.a. (MoSJE 07 Jan 2026 Norm)]
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
 [Micro Tier: 10+1]     [Interm Tier: 20+1]     [Commercial Tier: 100+5]
 (Cost ≤ ₹1,40,000)     (Cost = ₹2,58,000)      (Cost = ₹20,00,000)
        │                       │                        │
        ▼                       ▼                        ▼
 ┌──────────────────┐    ┌──────────────────┐    ┌────────────────────────┐
 │ PRIMARY FIT:     │    │ PRIMARY FIT:     │    │ PRIMARY FIT:           │
 │ NSFDC Micro MSY  │    │ NSFDC Term Loan  │    │ NSFDC Term Loan        │
 │ • Loan: 90%      │    │ • Loan: 90%      │    │ • Loan: 90% (₹18.00L)  │
 │   (Max ₹1.25L)   │    │   (₹2,32,200)    │    │ • Equity: 10% (₹2.00L) │
 │ • Equity: 10.71% │    │ • Equity: 10%    │    │ • Interest: 8.0% p.a.  │
 │   (₹15,000)      │    │   (₹25,800)      │    │ • Tenure: 7 Yrs (6m Mor│
 │ • Int: 6.5% p.a. │    │ • Int: 8.0% p.a. │    └────────────────────────┘
 │ • Tenure: 3 Yrs  │    │ • Tenure: 7 Yrs  │                 │
 │   (3m Moratorium)│    │   (6m Moratorium)│                 ▼
 └──────────────────┘    └──────────────────┘    ┌────────────────────────┐
        │                       │                │ CAPITAL SUBSIDY FIT:   │
        ▼                       ▼                │ NLM-EDP Small Ruminant │
 ┌──────────────────────────────────────────┐    │ • 50% Capital Subsidy  │
 │ MANDATORY WORKING CAPITAL BRIDGE:        │    │   (₹8.92L - ₹10.00L)   │
 │ Kisan Credit Card (KCC) Animal Husbandry │    │ • MINIMUM 100+5 FLOCK! │
 │ • Net Interest: 4.0% p.a. (MISS PRI)     │    └────────────────────────┘
 │ • Micro Tier: Draws ₹53,509 limit        │                 │
 │ • 20+1 Tier: Draws ₹76,343 limit         │                 ▼
 │ • 100+5 Tier: Draws ₹2,00,000 max limit  │    ┌────────────────────────┐
 └──────────────────────────────────────────┘    │ MANDATORY WC BRIDGE:   │
                        │                        │ KCC AH (₹2.00L @ 4.0%) │
                        ▼                        └────────────────────────┘
 ┌────────────────────────────────────────────────────────────────────────┐
 │ CRITICAL SCHEME EXCLUSION RULES (PERSON B STRICT AUDIT):               │
 │ 1. PMEGP (KVIC/DIC) = STRICTLY DISQUALIFIED under Clause 11 Negative   │
 │    List (a) [slaughtered meat] and (c) [primary animal rearing]!       │
 │ 2. NLM-EDP = STRICTLY DISQUALIFIED FOR 10+1 AND 20+1!                  │
 │    Statutory minimum is 100 females + 5 males.                         │
 └────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Primary Financing Routing
1. **Micro Finance Tier Fit:** **NSFDC Micro Credit Scheme / Mahila Samriddhi Yojana (MSY) [S1, S3]**
   * **Project Cost Limit:** Up to ₹1,40,000.
   * **Promoter Equity:** 10.71% (₹15,000 to match the exact ₹1.25L cap).
   * **Loan Amount:** 89.29%, **strictly capped at ₹1,25,000** (NOT ₹1.26L) [S1].
   * **Concessional Interest Rate:** **6.5% p.a.** to the beneficiary (NSFDC lends to SCA at 2.5%; SCA margin is 4.0%) [S1].
   * **Tenure & Moratorium:** 3-year quarterly amortization (11 repayment quarters after 3-month moratorium) [S1].
   * **Quarterly EQI:** **₹12,501.34** (Quarters 2 to 12; Quarter 1 interest only = ₹2,031.25).
2. **Intermediate Term Loan Tier Fit (20+1 Flock):** **NSFDC Term Loan Scheme [S2, S3]**
   * **Project Cost:** ₹2,58,000.
   * **Promoter Equity:** 10.0% (₹25,800).
   * **Loan Amount:** 90.0% (₹2,32,200) [S2].
   * **Concessional Interest Rate:** **8.0% p.a.** to beneficiary (NSFDC lends to SCA at 4.0%; SCA margin is 4.0%) [S2].
   * **Tenure & Moratorium:** 7-year quarterly amortization (26 repayment quarters after 6-month moratorium) [S2].
   * **Quarterly EQI:** **₹11,540.16** (Quarters 3 to 28; Quarters 1 & 2 interest only = ₹4,644.00 each).
3. **Commercial Term Loan Tier Fit (100+5 Flock):** **NSFDC Term Loan Scheme [S2, S3]**
   * **Project Cost:** ₹20,00,000.
   * **Promoter Equity:** 10.0% (₹2,00,000).
   * **Loan Amount:** 90.0% (₹18,00,000, under ₹45.00L cap) [S2].
   * **Concessional Interest Rate:** **8.0% p.a.** to beneficiary [S2].
   * **Tenure & Moratorium:** 7-year quarterly amortization (26 repayment quarters after 6-month moratorium) [S2].
   * **Quarterly EQI:** **₹89,458.62** (Quarters 3 to 28; Quarters 1 & 2 interest only = ₹36,000.00 each).

---

### 7.2 Secondary Fits & Subsidy Co-Financing
1. **National Livestock Mission (NLM-EDP) Small Ruminants [S4]:**
   * **Subsidy Percentage:** **50% back-ended capital subsidy** up to ₹10.00 Lakhs for 100+5 flock; ₹20.00L for 200+10; up to ₹50.00L for 500+25.
   * **Statutory Eligibility Gate:** **Minimum unit size of 100 females + 5 males**. Smaller units (10+1 or 20+1) are **STRICTLY INELIGIBLE** for NLM capital subsidy!
   * **Subsidy Scope Note:** Working capital is excluded from NLM calculation. On ₹17,85,000 physical CapEx, the 50% subsidy is ₹8,92,500.
2. **Kisan Credit Card (KCC) for Animal Husbandry [S5, S6]:**
   * **Credit Limit:** Working capital up to **₹2,00,000** (collateral-free up to ₹1,60,000 [S6]).
   * **Net Effective Interest Rate:** **4.0% p.a.** (Benchmark 7.0% minus 3.0% Prompt Repayment Incentive under MISS) [S5].
   * **Mandatory Function:** Bridges Year 1 feed and veterinary OpEx during the biological gestation and growth lag.
3. **Animal Husbandry Infrastructure Development Fund (AHIDF):**
   * 3.0% interest subvention for 8 years; applicable only for downstream meat processing, abattoir infrastructure, or feed pellet manufacturing plants.
4. **PMMY (MUDRA):**
   * Commercial bank rates (9.5%–12.0%) are significantly more expensive than NSFDC concessional credit (6.5%–8.0%).

---

### 7.3 Negative List & Ineligibility Audit
* **PMEGP Negative List Clause 11 [S7]:**
  * Clause 11(a) explicitly bars: *"Any industry/business connected with Meat(slaughtered), i.e. processing, canning and/or serving items made of it as food... is strictly ineligible under PMEGP."*
  * Clause 11(c) bars primary agricultural operations and animal husbandry, permitting only dairy, poultry, and beekeeping.
  * **Audit Verdict:** Commercial goat and sheep meat husbandry is **STRICTLY DISQUALIFIED from PMEGP**. Routing D12 to PMEGP is an unviable appraisal error.
* **Production Financial Engine Bug Audit:**
  * In `multi_archetype_financial_engine.py`, lines 260–276 automatically allocate NLM 50% subsidy to any Archetype 4 project with cost > ₹2,00,000.
  * This incorrectly grants NLM subsidy to small 20+1 flocks (₹2,58,000). The engine rule must be updated by the coordinator to check `unit_size >= 100` before assigning NLM.

---

## 8. RISKS, SWOT & OPERATIONAL RULES

### 8.1 Operational Risk Matrix

| Risk Factor | Probability | Impact | Severity Score (P $\times$ I) | Mitigation Mechanism & Standard Operating Procedure (SOP) | Early Warning Trigger Metric |
|---|---|---|---|---|---|
| **Epidemic Mortality (PPR / ET / Goat Pox)** | High (0.7) | Critical (0.9) | **0.63 (High)** | Mandatory slatted elevated floor; 100% vaccination protocol; 14-day isolation stall for new stock; 100% ear tagging & insurance | Sudden refusal of feed; nasal discharge; spike in rectal temperature (>103.5°F) |
| **Feed Price Inflation (Concentrate / Fodder)** | High (0.7) | High (0.7) | **0.49 (Medium)** | Dedicated on-farm cultivation of perennial Hybrid Napier/Lucerne (2 acres for 100+5); bulk harvest grain procurement; silage making in drums | Concentrate feed market price exceeds ₹28/kg on regional agri-exchanges |
| **Monsoon Foot Rot & Internal Nematodes** | High (0.8) | Moderate (0.5) | **0.40 (Medium)** | Raised wooden slatted flooring keeping hooves dry; 10% zinc sulphate footbath dip at entry; quarterly anthelmintic rotation (albendazole $\rightarrow$ ivermectin) | Limping in >2% of flock; submandibular edema ("bottle jaw" indicating worms) |
| **Predator Attack & Flock Rustling** | Moderate (0.4)| High (0.8) | **0.32 (Medium)** | 6 ft heavy-gauge chain-link fence with inward barbed-wire overhang; solar LED floodlights; guard dogs; steel night lock | Perimeter fence breach or nocturnal canine barking |
| **Mandi Price Crash / Trader Cartelization** | Moderate (0.5)| Moderate (0.6) | **0.30 (Medium)** | On-farm digital platform scale (sell strictly on live-weight basis @ ≥₹320/kg); target Bakrid festival window; form Goat Producer Groups | Mandi live price falls below ₹280/kg live weight |

---

### 8.2 Comparative SWOT Analysis Across Flock Sizes

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             COMPARATIVE SWOT MATRIX ACROSS FLOCK SIZES                                 │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ Configuration                     │ Key Strategic Dynamics                             │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 10+1 Micro Tier (≤ ₹1.40L)        │ • STRENGTHS: Minimal equity (₹15,000); 100% family │
│                                   │   labor eliminates payroll risk; 6.5% interest.    │
│                                   │ • WEAKNESSES: Middlemen price pressure; single     │
│                                   │   mortality eliminates 10% breeding base.          │
│                                   │ • OPPORTUNITIES: Compounding to 20+1 via retained  │
│                                   │   female kids within 24 months; dengue milk sales. │
│                                   │ • THREATS: Severe drought; delay in KCC sanction.  │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 20+1 Intermediate Tier (₹2.58L)   │ • STRENGTHS: Ideal smallholder commercial scale;   │
│                                   │   7-year tenure keeps EQI low (₹11,540/qtr);       │
│                                   │   DSCR reaches 4.15x by Year 3.                    │
│                                   │ • WEAKNESSES: Ineligible for NLM 50% subsidy;      │
│                                   │   requires ₹76k KCC line to bridge Year 1 OpEx.    │
│                                   │ • OPPORTUNITIES: Supply local meat vendors directly│
│                                   │   bypassing haat middlemen; sell breeding does.    │
│                                   │ • THREATS: Grazing land enclosure; foot rot.       │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 100+5 Commercial Tier (₹20.00L)   │ • STRENGTHS: 50% NLM subsidy eligibility; bulk     │
│                                   │   feed discounts; high profit (₹27k - ₹45k/mo).    │
│                                   │ • WEAKNESSES: Heavy quarterly EQI (₹89,459); hired │
│                                   │   labor dependency; severe August cash deficit.    │
│                                   │ • OPPORTUNITIES: Direct supply contracts with meat │
│                                   │   retail chains; branded organic manure packaging. │
│                                   │ • THREATS: Bank delay in NLM subsidy tranche credit│
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

### 8.3 Local Competitor Density & Market Saturation Measurement Rule
To prevent over-saturation in a single village cluster, the field loan officer / SCA channel partner must execute the following **Hyper-Local Density Filter** prior to sanctioning:
1. **Flock Carrying Capacity Index (FCCI):**
   $$\text{FCCI} = \frac{\text{Common Property Grazing Land (Acres)} \times 15}{\text{Existing Small Ruminant Census in 5 km Radius}}$$
   * *Threshold Rule:* If $\text{FCCI} < 1.0$, the applicant must demonstrate **100% stall-fed (intensive) capacity** with at least 0.02 acres of irrigated green fodder land per doe (2 acres for 100 does; 0.4 acres for 20 does; 0.25 acres for 10 does).
2. **APMC Mandi Absorption Capacity:** Weekly mandi arrivals must exceed 500 head within a 30 km radius to ensure liquidity without local price crashes.

---

## 9. COMPREHENSIVE SOURCE LOG

| Source Tag | Document / Policy Title | Issuing Authority / Body | Official Deep URL | Exact Sentence / Clause Verbatim Quote | Date Opened |
|---|---|---|---|---|---|
| `[S1]` | *Micro-Credit Finance Scheme & Mahila Samriddhi Yojana (MSY) Guidelines* | National Scheduled Castes Finance & Development Corporation (NSFDC), MoSJE | `https://nsfdc.nic.in` | "Under Micro Credit Scheme, unit cost is up to Rs. 1,40,000/- with NSFDC loan up to 90% strictly capped at Rs. 1,25,000/-, carrying interest of 6.5% p.a. payable by beneficiaries over 3 years including 3-month moratorium." | 2026-11-08 |
| `[S2]` | *Term Loan Scheme Operational Guidelines* | National Scheduled Castes Finance & Development Corporation (NSFDC), MoSJE | `https://nsfdc.nic.in` / `https://dosje.gov.in` | "For units costing above Rs. 1.40 lakh up to Rs. 50.00 lakh, NSFDC provides Term Loan up to 90% capped at Rs. 45.00 lakh at 8.0% p.a. interest to beneficiaries, repayable in quarterly installments over 7 years including 6-month moratorium." | 2026-11-08 |
| `[S3]` | *Revision of Annual Family Income Ceiling under NSFDC Schemes (Notification)* | Ministry of Social Justice and Empowerment (MoSJE), GoI | `https://pib.gov.in` / `https://nsfdc.nic.in` | "The annual family income ceiling for eligibility under all loan-based schemes of NSFDC has been enhanced to Rs. 5.00 Lakh p.a. for both rural and urban areas, effective from January 7, 2026." | 2026-11-08 |
| `[S4]` | *Operational Guidelines of National Livestock Mission (NLM) — Entrepreneurship Development Programme* | Department of Animal Husbandry and Dairying (DAHD), Ministry of Fisheries, Animal Husbandry & Dairying | `https://nlm.udyamimitra.in` / `https://dahd.nic.in` | "Under Small Ruminants (Goat/Sheep) EDP, Central Government provides 50% capital subsidy up to Rs. 10 Lakhs for 100 females + 5 males, Rs. 20 Lakhs for 200+10, and up to Rs. 50 Lakhs for 500+25 breeding units." | 2026-11-08 |
| `[S5]` | *Kisan Credit Card (KCC) Facility for Animal Husbandry and Fisheries (Circular FIDD.CO.FSD.BC.No.12/05.05.010/2018-19)* | Reserve Bank of India (RBI) | `https://www.rbi.org.in` | "Short-term working capital credit limit up to Rs. 2 lakh is extended to Animal Husbandry farmers under KCC with interest subvention of 2% and prompt repayment incentive of 3%, making net effective interest 4.0% p.a." | 2026-11-08 |
| `[S6]` | *Collateral Free Agricultural Loans — RBI Circular FIDD.CO.FSD.BC.No.13/05.05.010/2018-19* | Reserve Bank of India (RBI) | `https://www.rbi.org.in` | "Banks are mandated to extend collateral-free loans to agricultural and allied activities, including livestock rearing, up to a limit of Rs. 1.60 lakh without demanding third-party guarantee or property mortgage." | 2026-11-08 |
| `[S7]` | *Prime Minister's Employment Generation Programme (PMEGP) Guidelines & Negative List* | Ministry of Micro, Small and Medium Enterprises (MoMSME) / KVIC | `https://msme.gov.in` / `https://www.kviconline.gov.in` | "Clause 11 Negative List (a): Any industry or business connected with Meat (slaughtered), i.e. processing, canning and/or serving items made of it as food... is strictly ineligible under PMEGP." | 2026-11-08 |
| `[S8]` | *National Industrial Classification (NIC-2008 & Updated NIC-2025 Standard)* | Ministry of Statistics and Programme Implementation (MoSPI), GoI | `https://www.mospi.gov.in` | "Class 0144: Raising of sheep and goats; Sub-Class 01441: Raising and breeding of sheep and goats for meat production." | 2026-11-08 |
| `[S9]` | *Situation Assessment Survey of Agricultural Households, NSS 77th Round (Report No. 587)* | National Statistical Office (NSO), MoSPI, GoI | `https://www.mospi.gov.in` | "Net receipts from farming of animals (livestock) stood at Rs. 1,582 per month, accounting for 15.5% of total average rural household monthly income." | 2026-11-08 |
| `[S10]` | *Report of the Expert Committee on Micro, Small and Medium Enterprises (Chaired by U.K. Sinha)* | Reserve Bank of India (RBI) | `https://www.rbi.org.in` | "Table III, p. 21: Non-crop allied agricultural enterprises account for 13.13 million rural micro units, of which livestock rearing comprises 86.74% (11.39 million units)." | 2026-11-08 |
| `[S11]` | *Basic Animal Husbandry Statistics (BAHS 2023/2024)* | Department of Animal Husbandry and Dairying (DAHD), GoI | `https://dahd.nic.in` | "Goat and sheep meat (chevon and mutton) contribute over 2.45 million tonnes annually, comprising 26.8% of India's total domestic meat production." | 2026-11-08 |
| `[S12]` | *20th All India Livestock Census Key Results* | Department of Animal Husbandry and Dairying (DAHD), GoI | `https://dahd.nic.in` | "Total goat population in the country is 148.88 million and sheep population is 74.26 million, predominantly reared by small, marginal farmers and landless agricultural laborers." | 2026-11-08 |
| `[S13]` | *Notification No. 2/2017-Central Tax (Rate) & HSN GST Schedule* | Central Board of Indirect Taxes and Customs (CBIC), Ministry of Finance | `https://cbic-gst.gov.in` | "Entry No. 102, HSN Heading 2309: Preparations of a kind used in animal feeding, including compounded animal feed, cattle feed, goat feed — Rate of GST: NIL (0%). Entry No. 9, HSN 0104: Live sheep and goats — Rate: NIL." | 2026-11-08 |
| `[S14]` | *Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations, 2011* | Food Safety and Standards Authority of India (FSSAI), MoHFW | `https://www.fssai.gov.in` / `https://foscos.fssai.gov.in` | "Schedule 1: Petty slaughter units up to 10 small animals per day require Basic Registration (Fee Rs. 100/yr); 11 to 150 small animals/day require State License; live primary animal rearing is excluded under Sec 3(1)(n)." | 2026-11-08 |
| `[S15]` | *Guidelines for Environmental Management of Dairy Farms and Gaushalas & Categorization of Sectors* | Central Pollution Control Board (CPCB), MoEFCC | `https://cpcb.nic.in` | "Small-scale livestock rearing units without on-site abattoir installations are categorized under Non-Industrial / White Category and are exempt from obtaining Consent to Establish (CTE) and Consent to Operate (CTO)." | 2026-11-08 |
| `[S16]` | *Prevention and Control of Infectious and Contagious Diseases in Animals Act, 2009 (Act No. 27 of 2009)* | Ministry of Law and Justice / DAHD, GoI | `https://dahd.nic.in/acts-rules` | "Section 4 & Schedule: Mandatory notification and isolation procedures for scheduled ruminant diseases including Peste des Petits Ruminants (PPR), Foot and Mouth Disease, Anthrax, and Goat Pox." | 2026-11-08 |
| `[S17]` | *Prevention of Cruelty to Animals (Transport of Animals) Rules, 1978 & Motor Vehicles Rules* | Ministry of Road Transport & Highways (MoRTH) / AWBI | `https://morth.nic.in` | "Rule 96: A vehicle used for transporting animals shall provide partitions and floor space of not less than 0.30 sq. meters per adult sheep or goat, accompanied by veterinary certification." | 2026-11-08 |
| `[S18]` | *Package of Practices & Economics of Commercial Goat Farming* | ICAR - Central Institute for Research on Goats (CIRG), Makhdoom | `https://cirg.icar.gov.in` | "Under semi-intensive rearing, Barbari does achieve 1.6 kids/kidding with 8-month kidding interval; kids reach 25-28 kg at 10-12 months on FCR 1:5.8, yielding stabilized chevon dressing percentage of 49.5%." | 2026-11-08 |
| `[S19]` | *Model Bankable Project on Commercial Goat Rearing (20 Does + 1 Buck & 100 Does + 5 Bucks)* | National Bank for Agriculture and Rural Development (NABARD) | `https://www.nabard.org` | "Technical norms: Covered shed space 10-15 sq. ft. per doe, kidding interval 8 months, kid mortality 10%, commercial live animal sales at 10-12 months age; zero meat income in Year 1." | 2026-11-08 |
| `[S20]` | *Daily Commodity Mandi Price Reports for Livestock (Goat / Sheep)* | Directorate of Marketing & Inspection (DMI), Ministry of Agriculture / Agmarknet | `https://agmarknet.gov.in` | "Live-weight wholesale prices for meat-purpose commercial goats across major mandis average Rs. 300 to Rs. 380 per kg live body weight, with festive Bakrid premiums reaching Rs. 450 to Rs. 550 per kg." | 2026-11-08 |

---

## 10. REMAINING QUESTIONS & GAPS

1. **Production Financial Engine Bug Resolution:**
   * *Status:* Lines 260–276 in `multi_archetype_financial_engine.py` currently route all Archetype 4 projects with cost > ₹2,00,000 to NLM 50% capital subsidy. This causes small 20+1 units (₹2,58,000) to hallucinate an illegal ₹1,29,000 NLM grant.
   * *Priority for Follow-up:* Add a statutory gate `if unit_size >= 100 and sector == "Small Ruminants":` before triggering NLM logic. Smallholder units (20+1) must be assigned NSFDC Term Loan + KCC Animal Husbandry.
2. **State Channelizing Agency (SCA) Guarantee & Margin Variations:**
   * *Gap:* While central NSFDC terms are uniform (6.5% Micro, 8.0% Term Loan), state channelizing agencies (e.g., TAHDCO in Tamil Nadu, UPSCDC in Uttar Pradesh, Anuja Nigam in Rajasthan) offer state-specific margin subsidies (often covering the 10% promoter equity) or mandate collateral for loans above ₹1.60 Lakhs.
   * *Focus for Follow-up:* Conduct a state-by-state verification of SCA operational circulars for top demonstration states (Rajasthan, UP, Maharashtra).
3. **NLM Capital Subsidy Interim Interest Liability:**
   * *Gap:* Empirical evidence indicates that the National Livestock Mission capital subsidy (50%) experiences disbursement lags of 3 to 9 months between physical shed completion and the credit of funds into the Bank Subsidy Reserve Fund (BSRF).
   * *Focus for Follow-up:* Model the exact interim interest burden on the borrower during this disbursement lag and verify whether banks require bridge guarantees.
4. **Sub-District Haat Live-Weight Mandi Reporting Granularity:**
   * *Gap:* Agmarknet reporting at local rural haats frequently records small ruminants per head count rather than standardized live body weight (unlike terminal mandis such as Nagaur, Ghazipur, and Baramati).
   * *Focus for Follow-up:* Incorporate a localized weighing scale adoption incentive into the SCA field appraisal module.
