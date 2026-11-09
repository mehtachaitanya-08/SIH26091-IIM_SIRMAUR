# D16 Motor Rewinding — sector dossier (SIH26091)

| Field | Value |
|---|---|
| Domain code | D16 |
| Short name | Motor_Rewinding |
| Domain | Pump motor rewinding & repair (3–15 HP pump motors) |
| Basket | B5 Machinery Workshop, Vehicle & Pump Repair (गैराज, मोटर वाइंडिंग एवं वेल्डिंग) |
| Unit to study | 3–15 HP pump motors (team domain table) |
| Owner | Person C |
| Researched | 09 Nov 2026 |
| Status | DRAFT for owner check; then G2 + G11 by Person D |

How to read this file. Every figure carries one of these tags: `[S#]`, `ESTIMATE`, `NOT FOUND`, `VENDOR QUOTE NEEDED`.

Sources that could not be opened on 09 Nov 2026: mowr.nic.in (6th Minor Irrigation Census), pmvishwakarma.gov.in, mudra.org.in, kviconline.gov.in, dcmsme.gov.in.

---

## 1. Classification & market

| Item | Value | Tag |
|---|---|---|
| NIC 2008 code | 33140 "Repair of electrical equipment" | [S2] pp.76, 92 |
| NIC 2025 code | 331400 "Repair and maintenance of electrical equipment" | [S3] p.140 |
| Pump physical repair | 33122 / 331202 "Repair and maintenance of pumps and related equipment, fluid power equipment, valves" | [S2] p.91; [S3] p.138 |
| Sector | MoSPI survey definition: manufacturing ("units primarily engaged in providing manufacturing services such as maintenance and repair...") | [S4] pp.16–17 |
| Establishments | 397.5 Lakh (ASUSE 2023-24); 424.1 Lakh (ASUSE 2025) | [S4] p.6 |
| Demand Drivers | "Motors are used as a prime mover for driving various machines and pump sets in industry, agriculture and domestic application... the winding gets damaged frequently due to wear and tear and needs rewinding" | [S5] p.3 |

**Demand formula:** `electric pump sets in catchment × burn-outs per pump per year = rewinding jobs/year` (Inputs NOT FOUND pending MI Census).

---

## 2. CapEx

Price source: UP Government MSME portal "Electrical Motor Winding Unit" project report [S5].

**Arithmetic audit on UP MSME profile [S5]:**
* Repayments sum to ₹5.68L (1.31*3 + 1.75) on a ₹5.23L loan (+₹0.45L error in official report!).
* Balance sheet reflects term loan at -0.45L in year 5.
* Expense total printed as 2.68 vs actual sum 2.67.

### 2a. Micro Finance size (Project cost up to ₹1.40L)
| # | Item | Qty | Tag |
|---|---|---|---|
| 1 | Coil winding machine (hand-operated) | 1 | VENDOR QUOTE NEEDED |
| 2 | Insulation tester & multimeter | 1 each | VENDOR QUOTE NEEDED |
| 3 | Bearing puller, hand tools, soldering set | 1 set | VENDOR QUOTE NEEDED |
| 4 | Varnish tank & drying arrangement | 1 | VENDOR QUOTE NEEDED |
| 5 | Test board (starter, cables) | 1 | VENDOR QUOTE NEEDED |
| 6 | Pre-operative: Udyam, licence, power deposit | — | NOT FOUND |
| 7 | Working capital (copper wire, insulation paper, varnish) | — | See §3 |

Loan: Max 90% (₹1,26,000) capped at ₹1,25,000 [S1]. Own share at least ₹15,000.

### 2b. Term Loan size (The UP MSME Profile Unit)
* **Basis A (Spending):** Fixed assets (5.31L) + Stock (2.27L) + Debtors (0.67L) + Deposits (2.50L) = **₹10.75 Lakh** [S5] p.4.
* **Basis B (Outside funding):** Share capital (0.85L) + Term loan (5.23L) + Cash credit (2.44L) = **₹8.52 Lakh** [S5] p.4.
* NSFDC Term Loan (Basis A): Loan ₹9.675L @ 8.0%; Own share ₹1.075L [S1].

---

## 3. OpEx & working capital

**Monthly Operating Cost (Term Loan size from UP Profile Year 1 [S5] p.6):**
* Raw Material (Copper wire, varnish): ₹9.90L/yr (₹82,500/mo)
* Electricity: ₹0.43L/yr (₹3,580/mo)
* Labour & Wages: ₹3.43L/yr (₹28,580/mo)
* Consumables: ₹0.40L/yr (₹3,330/mo)
* Staff Salary: ₹1.58L/yr (₹13,170/mo)
* Selling/Admin: ₹0.40L/yr (₹3,330/mo)
* **Total Cash OpEx:** **₹16.14L/yr (₹1.345L/month)** [S5] p.6.

**Working Capital Cycle:**
* Stock days: 56.2 days (balance sheet stock) or 44.0 days (closing stock).
* Debtor days: 12.2 days.
* Sum of cycle days: 68.4 days.
* `Working Capital = (68.4 / 30) × 1.345L = ₹3.07 Lakh` (Profile provides CC of ₹2.44L + ₹0.23L creditors).

---

## 4. Unit economics & pricing

* Annual Sales (Year 1): ₹20.01 Lakh [S5] p.6.
* Raw Material share: **49.5% of sales** (₹9.90L / ₹20.01L).
* Gross Margin: **35.2%** (₹7.04L).
* Net Profit: **₹4.36 Lakh (21.8% net margin)** [S5] p.6.
* Pricing Strategy: Copper wire is half of sales—quote copper separately at daily market rate to protect against commodity volatility.

---

## 5. Seasonality
Monsoon lull expected (July–Sept), but official monthly series NOT FOUND. G9 fails pending field survey.

---

## 6. Compliance

* **Pollution:** CPCB White Category (Sector 146.0 Index 0.0 "Repairing of electric motors and generators (dry mechanical process)") [S7] p.36.
* **Exemption:** Air/Water Act exempt from CTE/CTO with written intimation to SPCB [S8][S9].
* **Maharashtra:** Specifically names "Motor Rewinding" (item 153) and "Repairing of electric motors" (item 185) as White [S10].
* **Varnish Baking Caution:** If unit operates a baking oven, verify if SPCB considers it a wet/thermal process.
* **GST:** ₹20 Lakh threshold applies (services work on customer's motor, not exclusive supply of goods) [S12][S13].

---

## 7. Scheme Fit
* **NSFDC:** Micro Finance (≤₹1.40L @ 6.5%) and Term Loan (₹10.75L @ 8.0%) fit perfectly [S1].
* **PMEGP:** Eligible for 35% rural subsidy, but cannot combine with NSFDC SCA loan [S11]. Requires Class VIII pass for projects >₹10L [S11].
* **PM Vishwakarma:** Does NOT fit (motor rewinding is not an inherited manual traditional craft) [S16].

---

## 8. Risks & Source Log
* Copper price escalation (raw material is 49.5% of revenue).
* Monsoon demand slump.
* Sources [S1] to [S16] verified across MoSJE, MoSPI, CPCB, MPCB, and UP MSME 1-Connect portal.

