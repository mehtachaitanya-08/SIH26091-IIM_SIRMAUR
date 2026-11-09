# Rural MSME Business Segmentation & Research Taxonomy Framework
## Architectural Blueprint for AI-Driven Financial Advisory & Restructuring Platform

**Project Reference:** SIH-2026-TAXONOMY-V1  
**Authority Grounding:** RBI Expert Committee Report on MSMEs (2019) | NSSO 73rd Round (Report No. 582) | Annual Survey of Unincorporated Sector Enterprises (ASUSE 2022-23) | Ministry of MSME  
**Document Purpose:** Definitive Business Classification, User-Facing Onboarding Taxonomies, and Independent Agent Research Scopes  
**Status:** Approved Architectural Standard  

---

## 1. Critical Evaluation of the Existing Six Archetypes

The initial six archetypes bridged the gap between our original single-niche agro-processing focus and the broader rural economy. However, an objective architectural evaluation reveals structural flaws, category conflations, and critical omissions that make them unsuitable as either direct user-facing options or clean, independent research domains.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      EVALUATION OF EXISTING 6 ARCHETYPES                               │
├────────────────────────────────┬───────────────────────────┬───────────────────────────┤
│ Archetype                      │ Structural Limitation     │ Root Cause of Breakdown   │
├────────────────────────────────┼───────────────────────────┼───────────────────────────┤
│ 1. Agro-Processing & Food      │ Well-researched, but too  │ Conflates low-margin bulk │
│    Value Addition              │ broad.                    │ milling with high-margin  │
│                                │                           │ packaged goods.           │
├────────────────────────────────┼───────────────────────────┼───────────────────────────┤
│ 2. Rural Retail, Kirana &      │ Conflates FMCG retail     │ Trading FMCG vs. regulated│
│    Agri-Input Supply           │ with regulated Agri-inputs│ seed/chemical distribution│
│                                │ (Seeds/Fertilizers).      │ have opposing regulations.│
├────────────────────────────────┼───────────────────────────┼───────────────────────────┤
│ 3. Rural Technical Services &  │ Combines heavy farm       │ High-capex mechanical bay │
│    Machinery Repair            │ machinery with light/EV   │ lumped with zero-capex    │
│                                │ and domestic electronics. │ domestic artisan trades.  │
├────────────────────────────────┼───────────────────────────┼───────────────────────────┤
│ 4. Livestock, Dairy & Allied   │ Lumps dairy (daily flow)  │ Daily perishable liquidity│
│    Micro-Farming               │ with meat/goats/poultry   │ mixed with long biological│
│                                │ (terminal batch cycle).   │ lumpy capital growth.     │
├────────────────────────────────┼───────────────────────────┼───────────────────────────┤
│ 5. Traditional Artisans &      │ Defined by a government   │ Scheme-driven bucket, not │
│    Crafts (PM Vishwakarma)     │ scheme, not by commercial │ economic-driven. Tailors &│
│                                │ or operational logic.     │ blacksmiths lumped.       │
├────────────────────────────────┼───────────────────────────┼───────────────────────────┤
│ 6. Circular Bio-Waste &        │ Niche & artificial.       │ Conflates ultra-low capex │
│    Green Micro-Units           │ Forces disparate items    │ vermicompost with high-   │
│                                │ together under 'green'.   │ power biomass briquetting.│
└────────────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### 1.1 Specific Flaws Identified

1. **The Scheme-Driven Taxonomy Fallacy (Archetype 5):**
   - Defining a business category by a specific government scheme (*PM Vishwakarma*) violates core system architecture principles. A scheme is a **financing policy vehicle**, not an economic activity.
   - A rural tailor (*Darzi*) operates in apparel manufacturing and repair, driven by fabric margins, sewing equipment, and festival wedding demand. A blacksmith (*Lohar*) operates in metal fabrication, driven by steel scrap prices, welding gases, and agricultural implements. Putting them in one bucket because of a shared scheme confuses the financial models and research objectives.

2. **The Regulatory & Risk Chasm in Retail (Archetype 2):**
   - A general village Kirana store requires only a basic FSSAI registration (<₹12L) and operates on fast-moving consumer goods with high inventory turns (15–30 days) and 8%–14% margins.
   - An Agri-Input dealership sells chemical fertilizers, certified seeds, and insecticides. It requires mandatory science/DAESI qualifications, licenses under the Fertilizer Control Order (FCO 1985), Seeds Act 1966, and Insecticides Act 1968, and faces severe regulatory scrutiny, strict seasonal working capital spikes, and agricultural credit exposure. Conflating them destroys risk modeling.

3. **Perishable Cash-Flow vs. Biological Batch Growth (Archetype 4):**
   - Dairy farming yields a **daily perishable cash inflow** (paid every 10–15 days by cooperatives based on FAT/SNF testing) with recurring daily feed expenditures.
   - Commercial goat rearing or poultry broiler farming functions as a **biological batch cycle** with zero daily cash inflow for 40 days (poultry) or 10–14 months (goats), culminating in a single lump-sum realization at livestock mandis. The working capital financing, debt service schedules, and DSCR curves of these two are incompatible.

4. **Critical Missing Rural Sectors:**
   - **Rural Construction, Building Materials & Extraction:** Fly-ash brick making, stone grit, cement hollow blocks, precast boundary walls, and borehole drilling represent over **8.4% of rural non-farm investment**, completely omitted from the six archetypes.
   - **Rural Transport & Logistics Fleet:** Small commercial vehicles (Tata Ace / Mahindra Bolero Pik-Up), e-rickshaws, tractor trolley rentals for mandi transit, and cold-chain milk vans.
   - **Rural Consumer, Personal & Digital Services:** Village photography/photocopy studios, CSC digital kiosks, beauty parlors, event sound/tent/catering businesses, which employ millions of rural youth.

---

## 2. The Redesigned Business Segmentation Framework

To reconcile user simplicity on the frontend with analytical precision on the backend, we introduce a **Two-Tier Architecture**:
- **Tier 1: 8 User-Facing Business Baskets (Frontend)** — Pragmatic, recognizable activity hubs that rural entrepreneurs naturally identify with in vernacular languages.
- **Tier 2: 24 Specialized Research & Modeling Domains (Backend)** — Granular industry sectors with uniform unit economics, identical regulatory regimes, and distinct financial models.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND INTUITIVE USER BASKETS (TIER 1)                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [1. Kirana, General Retail & Consumer Goods]       (किराना एवं खुदरा व्यापार)         │
│  [2. Agri-Inputs, Seeds & Farm Machinery Trading]   (खाद, बीज एवं कृषि यंत्र व्यापार)  │
│  [3. Food Milling, Processing & Local Packaging]    (अनाज पिसाई, तेल एवं खाद्य उद्योग) │
│  [4. Dairy, Livestock & Allied Animal Husbandry]    (डेयरी, पशुपालन एवं पोल्ट्री)     │
│  [5. Machinery Workshop, Vehicle & Pump Repair]     (गैराज, मोटर वाइंडिंग एवं वेल्डिंग)│
│  [6. Apparel, Tailoring & Handcrafted Goods]        (कपड़ा सिलाई, बुनाई एवं शिल्प)     │
│  [7. Rural Construction, Building Materials & Green](ईंट, सीमेंट एवं कम्पोस्ट निर्माण) │
│  [8. Rural Mobility, Transport & Logistics Fleet]   (लोडर वाहन, ट्रैक्टर एवं परिवहन)   │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ (System Routes to Granular Domain)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   BACKEND RESEARCH & AGENT DOMAINS (TIER 2)                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DOMAIN 1: Fast-Moving Consumer Goods & Village Retail Stores                            │
│ DOMAIN 2: Regulated Agricultural Inputs & Chemical Dealerships                         │
│ DOMAIN 3: Animal Feeds, Fodder & Veterinary OTC Distribution                           │
│ DOMAIN 4: Primary Grains, Pulses & Oilseed Custom Milling                              │
│ DOMAIN 5: Commercial Packaged Foods, Spices & Regional Confectionery                   │
│ DOMAIN 6: Perishable Horticultural Value Addition & Cold Storage                       │
│ DOMAIN 7: Bovine Dairy Production & Milk Chilling Hubs                                 │
│ DOMAIN 8: Small Ruminant (Goat & Sheep) Breeding & Meat Enterprises                   │
│ DOMAIN 9: Intensive Broiler & Layer Poultry Production                                 │
│ DOMAIN 10: Agricultural Machinery, Tractor & Heavy Implement Garages                   │
│ DOMAIN 11: Electrical Submersible Pumpsets, Motors & Solar Servicing                   │
│ DOMAIN 12: Light Commercial Vehicles, Two-Wheelers & Rural EV Garages                  │
│ DOMAIN 13: Garment Tailoring, Custom Stitching & Boutiques                             │
│ DOMAIN 14: Traditional Metal, Wood & Carpentry Fabrication (Vishwakarma Core)          │
│ DOMAIN 15: Traditional Pottery, Terracotta & Rural Ceramic Arts                        │
│ DOMAIN 16: Handloom Weaving, Jute, Coir & Natural Fiber Crafts                         │
│ DOMAIN 17: Masonry, Concrete Products & Pre-Cast Building Materials                    │
│ DOMAIN 18: Decentralized Biomass, Vermicompost & Organic Inputs                         │
│ DOMAIN 19: Rural Water Purification, Bottling & Automated Kiosks                       │
│ DOMAIN 20: Last-Mile Freight Logistics & Agri-Commodity Transport                      │
│ DOMAIN 21: Rural Passenger Transit & Electric Mobility Fleets                         │
│ DOMAIN 22: Farm Equipment Custom Hiring Centers (CHC)                                  │
│ DOMAIN 23: Digital Services, CSC Centers & Village FinTech Outposts                    │
│ DOMAIN 24: Rural Event, Tent House, Sound & Hospitality Rentals                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Comprehensive Domain Specifications (The 10-Point Analysis)

Below are the 8 fundamental business baskets and their 24 research domains, analyzed across all 10 structural dimensions.

---

### BASKET 1: Kirana, General Retail & Consumer Goods (किराना एवं खुदरा व्यापार)

#### 1. Business Definition
Enterprises engaged in retail distribution of packaged food staples, toiletries, personal care, household essentials, stationery, and non-perishable general merchandise directly to rural end-consumers.

#### 2. Subcategories & Domains
- **Domain 1.1: Village Kirana & FMCG Retail Store:** Fixed-location convenience stores (150–400 sq. ft.) serving 150–600 village households.
- **Domain 1.2: Periodic Weekly Haat & Mobile Trade Vendors:** Itinerant retailers trading across weekly rural market cycles (*haats/shandies*).
- **Domain 1.3: Rural Consumer Electronics & Mobile Accessories Counter:** Retail of mobile phones, recharges, LED fixtures, cables, and home appliances.

#### 3. Market Dynamics
- **Demand Driver:** Non-cyclical, continuous daily consumption. Rising penetration of branded FMCG (sachets, packaged biscuits, detergents).
- **Competitive Landscape:** High village-level density (3–8 stores per 1,000 population). Competition based on physical proximity, personal relationships, and willingness to extend credit (*bahi-khata*).
- **Credit Velocity:** High transaction count, low average ticket size (₹80–₹250).

#### 4. Revenue Models
- Retail price margin: Mark-up over wholesale procurement prices from block/tehsil mandi wholesalers.
- Auxiliary revenue: Mobile recharges, digital bill payments (BBPS), AePS cash withdrawal commissions (0.2%–0.5%).

#### 5. Cost Structures
- **CapEx:** ₹80,000 – ₹2,50,000 (display racks, glass counters, deep freezer/visi-cooler, digital weighing scale, billing terminal/inverter).
- **OpEx:** ₹8,000 – ₹18,000/month (shop rent, commercial electricity, mandi freight, packaging bags, spoilage allowance 1–2%).
- **Working Capital:** High inventory dependency (₹1,50,000 – ₹4,50,000). Turnover cycle: 18–28 days.

#### 6. Financial Characteristics
- **Gross Margins:** 8% – 15% (blended). Staples (flour, oil, sugar): 5% – 8%; Branded FMCG: 10% – 16%; Cosmetics/Snacks: 18% – 25%.
- **Cash Flow:** Continuous daily cash and UPI inflow. 25%–35% of monthly revenue locked in informal credit book (*udhaar*), turning over every 30–60 days.
- **Break-Even Period:** 4 – 8 months.

#### 7. Operational Dependencies
- **Logistics:** Weekly procurement trips to nearest wholesale market (5–20 km) via small commercial vehicle or auto.
- **Power:** Reliable 230V single-phase power for refrigeration (ice cream, dairy, cold drinks). Power backup (inverter/solar) required.
- **Labor:** Typically Own-Account Enterprises (OAE) run by 1–2 family members.

#### 8. Seasonality & Risks
- **Seasonality:** Spikes during festival seasons (Diwali, Eid, Chhath) and post-harvest months (April–May, November–December) by +30%–50%. Lean during peak monsoon (July–August).
- **Risks:** Working capital lockup due to default on informal customer credit; product obsolescence/expiry; entry of quick-commerce/e-commerce encroaching peri-urban villages.

#### 9. Financing Requirements
- **Debt Products:** Working capital term loans / Cash Credit (CC) overdraft limit.
- **Schemes:** PMMY MUDRA (Shishu ₹50k, Kishor ₹50k–₹5L), PM SVANidhi (₹10k–₹50k for periodic haat vendors). Ineligible for PMEGP capital subsidy (trading restriction).

#### 10. AI Advisory Requirements
- Optimal working capital buffer sizing based on local crop harvest dates.
- Threshold alerts on credit book exposure (capping informal credit at 25% of working capital).
- Fast-moving SKU reorder recommendations to avoid dead inventory.

---

### BASKET 2: Agri-Inputs, Seeds & Farm Machinery Trading (खाद, बीज एवं कृषि यंत्र व्यापार)

#### 1. Business Definition
Commercial distribution of statutory agricultural inputs—chemical and bio-fertilizers, certified hybrid seeds, plant protection chemicals (insecticides, fungicides, herbicides), micro-nutrients, and manual/power-operated agricultural implements.

#### 2. Subcategories & Domains
- **Domain 2.1: Certified Seeds, Fertilizers & Crop Protection Retail:** Integrated input store operated by a certified licensee.
- **Domain 2.2: Cattle Feed, Poultry Mash & Veterinary OTC Supplements:** Concentrates, mineral mixtures, de-oiled cakes, and feed additives.
- **Domain 2.3: Farm Hardware, Drip Irrigation & Agricultural Tools:** Pipes, sprinklers, delivery hoses, tarpaulins, sprayers, and spare components.

#### 3. Market Dynamics
- **Regulatory Gate:** Heavily regulated. Requires mandatory technical qualification (B.Sc. Agriculture or DAESI diploma).
- **Pricing:** Fertilizers (Urea, DAP) operate on statutory subsidized margins controlled by the Department of Fertilizers (DoF) through DBT POS machines.
- **Demand Pattern:** Hyper-seasonal and strictly synchronized with sowing calendars (Kharif: May–July; Rabi: October–December).

#### 4. Revenue Models
- Regulated retail margins: Fixed margins on subsidized fertilizers (₹15–₹45/bag); competitive retail margins on seeds (12%–20%) and crop protection chemicals (18%–30%).
- Dealership performance incentives: Volume rebates and cash discounts from seed/chemical corporates.

#### 5. Cost Structures
- **CapEx:** ₹1,50,000 – ₹3,50,000 (moisture-proof godown pallets, heavy MS racks, 500kg electronic platform scale, DoF DBT biometric POS device, fire extinguishers).
- **OpEx:** ₹15,000 – ₹35,000/month (godown lease, freight charges from railhead/depot, compliance renewals, electricity).
- **Working Capital:** High working capital requirement (₹5,00,000 – ₹18,00,000) concentrated in two peak seasons.

#### 6. Financial Characteristics
- **Gross Margins:** Blended 8% – 12%. Urea/DAP: 3% – 5%; Hybrid seeds: 15%; Specialty chemicals: 22%.
- **Cash Flow:** Highly lumpy. 70% of annual revenue concentrated in 4 peak months.
- **Break-Even Period:** 8 – 14 months.

#### 7. Operational Dependencies
- **Statutory Licenses:** Seed Selling License (Seeds Act 1966), Fertilizer Dealership (FCO 1985 Form A/O), Insecticide License (Form VIII).
- **Storage:** Mandatory leak-proof, dry, elevated godown complying with pesticide safety protocols.
- **Supply Chains:** Direct allocations from company distributors, IFFCO/KRIBHCO, or district stockists.

#### 8. Seasonality & Risks
- **Risks:** Monsoon failure/drought leading to collapse in sowing input demand; unsold expired seed lots (germination loss); regulatory inspections and cancellation of license for non-compliance with DBT records.

#### 9. Financing Requirements
- **Debt Products:** High-limit seasonal Cash Credit (CC) limits with flexible repayment schedules aligned with harvest realizations.
- **Schemes:** MUDRA Tarun (₹5L–₹10L), Stand-Up India (for SC/ST/Women), AIF (Agriculture Infrastructure Fund for setting up custom storage godowns with 3% interest subvention).

#### 10. AI Advisory Requirements
- Demand forecasting tied to local monsoon predictions and block-level crop acreage shifts.
- Statutory compliance calendar tracking (license renewals, stock registers).
- Margin-mix optimizer: Balancing low-margin fertilizer quotas with high-margin bio-stimulants and micronutrients.

---

### BASKET 3: Food Milling, Processing & Local Packaging (अनाज पिसाई, तेल एवं खाद्य उद्योग)

#### 1. Business Definition
Manufacturing enterprises that perform mechanical, thermal, or biochemical transformation of locally grown agricultural commodities into intermediate or ready-to-consume food products.

#### 2. Subcategories & Domains
- **Domain 3.1: Custom Grain Milling (Atta Chakkis, Mini Rice Mills, Dal Hullers):** Service-based or stock-milling of wheat, paddy, and pulses.
- **Domain 3.2: Edible Oil Extraction (Expellers & Cold-Press Ghanis):** Mustard, groundnut, sesame, or sunflower oil pressing and oil-cake production.
- **Domain 3.3: Commercial Spice Grinding, Blending & Packaging:** Turmeric, chili, coriander pulverizing, cleaning, and consumer pouch packaging.
- **Domain 3.4: Perishable Horticultural Processing & Drying:** Tomato puree, mango pulp, dried chips, makhana popping, fruit dehydration.

#### 3. Market Dynamics
- **Core Value Add:** Reduces transit loss and captures value within rural clusters. Serves both custom processing (*pissai/perai* where farmers bring raw material and pay only milling charges) and branded commercial manufacturing (buying grain, milling, packing, and selling).
- **Market Linkage:** Local village consumption, institutional buyers (mid-day meal schemes, local hostels), and urban wholesale brokers.

#### 4. Revenue Models
- Custom Processing Fees: ₹3.00 – ₹5.00/kg for wheat flour; ₹6.00 – ₹10.00/kg for mustard oil extraction; ₹8.00 – ₹15.00/kg for spice grinding.
- Merchant Manufacturing: Gross processing spread between raw commodity price at mandi harvest and packaged finished product price.
- Byproduct Sales: High-value animal feed byproducts (wheat bran *chokar*, oil-cake *khali*, pulse chuni/husk).

#### 5. Cost Structures
- **CapEx:** ₹3,50,000 – ₹15,00,000 (milling machinery, oil expeller 6-bolt/9-bolt, cleaning screeners, packaging machines, commercial 3-phase power line/transformer).
- **OpEx:** ₹30,000 – ₹1,80,000/month (3-phase electricity tariff, skilled operator, unorganized labor, machinery wear/belts/plates replacement, packaging pouches).
- **Working Capital:** Low for pure custom service units (₹40,000); High for merchant manufacturing units buying raw stock (₹3,00,000 – ₹12,00,000).

#### 6. Financial Characteristics
- **Gross Margins:** Custom service model: 45% – 65% operating margin on labor/power; Merchant production model: 14% – 22% net margin.
- **Cash Flow:** Custom service brings daily cash; merchant manufacturing requires 15–30 day receivable cycles from retail channels.
- **Break-Even Period:** 6 – 12 months.

#### 7. Operational Dependencies
- **Power Infrastructure:** 3-Phase commercial electricity (10 HP to 30 HP sanctioned load). Power interruptions directly cause machine jamming.
- **Compliance:** FSSAI Registration (<₹12L) or State License (₹12L–₹20Cr); CPCB/SPCB White Category exemption (non-polluting mechanical dry milling); Legal Metrology registration for packaged goods.

#### 8. Seasonality & Risks
- **Seasonality:** Bimodal spikes aligned with wheat/mustard harvest (Rabi: April–June) and paddy/soybean harvest (Kharif: November–January).
- **Risks:** Severe commodity price volatility (raw seed price spiking faster than processed oil/flour prices); mechanical breakdowns during peak harvest weeks; power tariff surges.

#### 9. Financing Requirements
- **Debt Products:** Medium-term capital loans (5–7 years) for machinery + working capital lines.
- **Schemes:** **PMFME (35% credit-linked capital subsidy up to ₹10 Lakhs)**; **PMEGP Manufacturing (35% rural margin money subsidy up to ₹50 Lakhs project cost)**; AIF (3% interest subvention for post-harvest infrastructure).

#### 10. AI Advisory Requirements
- Machine capacity utilization optimizer (balancing custom service hours vs. own stock production).
- Commodity buying trigger alerts based on mandi arrival velocity and price dips.
- Recovery ratio tracking (e.g., alert if oil recovery drops below 33% or dal splitting loss exceeds 12%).

---

### BASKET 4: Dairy, Livestock & Allied Animal Husbandry (डेयरी, पशुपालन एवं पोल्ट्री)

#### 1. Business Definition
Enterprises centered on commercial breeding, rearing, and management of livestock animals for production of perishable nutritional commodities (milk, eggs, meat) and organic farm byproducts.

#### 2. Subcategories & Domains
- **Domain 4.1: High-Yield Bovine Dairy (Cattle & Buffalo Farming):** Mini dairies (5–15 animals: Murrah buffaloes, Holstein-Friesian/Jersey crosses).
- **Domain 4.2: Small Ruminant (Commercial Goat & Sheep) Husbandry:** Semi-intensive meat and breeding units (20 Does + 1 Buck up to 100+ units).
- **Domain 4.3: Commercial Poultry Production (Broiler & Layer Units):** 1,000–5,000 bird batches under contract integration or open market management.
- **Domain 4.4: Inland Aquaculture & Fresh Water Fish Rearing:** Gram Panchayat pond leases or dedicated farm ponds for carp/catfish culture.

#### 3. Market Dynamics
- **Economic Safety Net:** Operates as a "living capital asset." Uniquely accessible to marginal farmers and landless laborers.
- **Offtake Guarantee:** Milk enjoys near-guaranteed daily procurement through cooperative societies (Amul, Nandini, Sudha, Mother Dairy) or private dairies. Meat enjoys spot-cash transactions in weekly livestock markets.
- **Production Anchor:** Governed by biological reproduction, lactation cycles, and feed conversion ratios (FCR).

#### 4. Revenue Models
- Milk Sales: Bi-monthly or 10-day payment cycles calculated via automated Fat and SNF testing.
- Live Animal Sales: Culled adult stock and young offspring sold by live weight (₹300–₹420/kg for chevon/mutton).
- Byproduct Sales: Cow dung manure, slurry for organic farming, poultry litter (high nitrogen).

#### 5. Cost Structures
- **CapEx:** ₹2,50,000 – ₹12,00,000 (elevated animal shed with slatted floors or head-to-head barns, purchase of certified pedigree breeding stock, chaff cutters, milking cans/machines, biosecurity fencing).
- **OpEx:** ₹18,000 – ₹65,000/month (compound cattle feed, green/dry fodder, mineral supplements, veterinary vaccinations, mortality insurance premiums). Feed constitutes 65%–75% of recurring OpEx.
- **Working Capital:** High for poultry (chick purchase and feed cycles); Moderate for dairy (continuous milk revenue funds daily fodder).

#### 6. Financial Characteristics
- **Gross Margins:** Dairy: 25% – 38%; Goatry: 40% – 55% (stabilized Year 2+); Poultry (Contract farming): ₹9.50 – ₹12.50 per kg live weight.
- **Cash Flow:** Dairy provides daily liquidity; Goatry provides lump-sum realizations at 8–12 month intervals; Poultry cycles every 42 days.
- **Break-Even Period:** Dairy: 8 – 14 months; Goatry: 18 – 24 months (due to gestation/kidding timeline); Poultry: 3 – 4 cycles (6 months).

#### 7. Operational Dependencies
- **Veterinary Services:** Proximity to veterinary dispensary or trained artificial insemination (AI) technicians.
- **Fodder Security:** Access to green fodder cultivation land (at least 0.5 acre for 5 cows) or silage supply contracts.
- **Cold Chain:** Access to village Bulk Milk Coolers (BMC) or chilling centers within 2 hours of milking.

#### 8. Seasonality & Risks
- **Seasonality:** "Flush season" (winter: high milk production, lower prices) vs. "Lean season" (summer: heat stress drops yield by 20%–35%, prices rise). Festive spikes for meat (Bakrid, festivals).
- **Risks:** Epidemic diseases (Foot and Mouth Disease - FMD, PPR in goats, Ranikhet/Avian Influenza in poultry) causing sudden mortality; fodder price inflation.

#### 9. Financing Requirements
- **Debt Products:** Term loans for animal asset acquisition + Kisan Credit Card (KCC) for Animal Husbandry working capital.
- **Schemes:** **National Livestock Mission (NLM: 50% capital subsidy up to ₹25 Lakh for goat/poultry/pig breeding units)**; **KCC Animal Husbandry (up to ₹2 Lakh @ 7% base with 3% prompt repayment incentive $\rightarrow$ net 4.0% p.a.)**; AHIDF (3% interest subvention).

#### 10. AI Advisory Requirements
- Feed optimization algorithm (least-cost ration formulation combining local crop residue, green grass, and protein meals).
- Lactation and kidding schedule forecaster to prevent dry-period cash flow deficits.
- Mortality de-risking and mandatory insurance claim audit assistance.

---

### BASKET 5: Machinery Workshop, Vehicle & Pump Repair (गैराज, मोटर वाइंडिंग एवं वेल्डिंग)

#### 1. Business Definition
Technical engineering and mechanical service units providing repair, maintenance, fabrication, component rebuilding, and electrical overhaul for farm machinery, transport vehicles, irrigation systems, and commercial tools.

#### 2. Subcategories & Domains
- **Domain 5.1: Tractor, Harvester & Agricultural Implement Workshop:** Engine overhauls, hydraulic system repair, cultivator/plow blade fabrication, arc/gas welding.
- **Domain 5.2: Borewell Submersible Pumpset & Electric Motor Rewinding:** Rewinding of 3 HP–15 HP induction motors, insulation varnishing, pump impeller rebuilds.
- **Domain 5.3: Two-Wheeler, e-Rickshaw & Rural Commercial Auto Garage:** General servicing, tire puncture/retreading, brake overhauls, EV battery testing and wiring.

#### 3. Market Dynamics
- **High Technical Moat:** Driven by manual trade skills, specialized tooling, and diagnostic experience. Cannot be replaced by online commerce.
- **Emergency Service Nature:** During sowing/harvesting seasons, a broken tractor or burned pump motor represents an acute emergency for farmers; service pricing power is high.
- **Footprint Location:** Strategic clusters at rural road intersections (*Chaurahas*), Major District Road (MDR) crossings, and peri-mandi fringes.

#### 4. Revenue Models
- Pure Labor / Diagnostic Service Charges: ₹500 – ₹1,200 for minor servicing; ₹3,500 – ₹12,000 for major engine/gearbox rebuilds; ₹1,800 – ₹4,000 for motor rewinding.
- Spares & Consumables Retail Spread: 15% – 28% margin on engine oils (15W-40), hydraulic fluids, copper wire, filters, bearings, V-belts, seals.
- Custom Job Fabrication: Per-piece charges for welding gates, agricultural trolleys, harrow frames.

#### 5. Cost Structures
- **CapEx:** ₹2,00,000 – ₹6,50,000 (air compressor, 30-ton hydraulic press, inverter arc welding machine, automatic coil winder, high-voltage megger, lathe/drill machines, hand pneumatic tools).
- **OpEx:** ₹18,000 – ₹45,000/month (workshop shed rent, commercial 3-phase power, skilled mechanic wages, welding electrodes, industrial gases, degreasers).
- **Working Capital:** ₹80,000 – ₹2,50,000 (stock of fast-moving bearings, wire, oils, gaskets).

#### 6. Financial Characteristics
- **Gross Margins:** 45% – 68% on service labor; 18% – 24% on spare parts. Blended operating profit: 32% – 48%.
- **Cash Flow:** Predominantly spot cash and direct UPI payments upon delivery of serviced equipment. Minimal credit lockup compared to retail.
- **Break-Even Period:** 4 – 9 months.

#### 7. Operational Dependencies
- **Power:** Stable 3-Phase power (for welding, heavy compressors, test benches).
- **Environmental Compliance:** CPCB White Category (exempt from CTE/CTO for dry mechanical repair without water washing bays); Hazardous Waste Rules 2016 for safe collection and authorized handover of spent lube oils; Battery Waste Management Rules 2022.
- **Skilled Apprenticeship:** Access to trained polytechnic/ITI mechanics or experienced master craftsmen (*ustad*).

#### 8. Seasonality & Risks
- **Seasonality:** Extreme peaks coinciding with crop sowing (tractor tillage, pump operations in June–July, October–November) and harvesting (combine harvesters, threshers in March–May). Lean lull during heavy monsoons.
- **Risks:** Occupational accidents (machinery handling, high-voltage testing); migration of skilled mechanic assistants to urban centers.

#### 9. Financing Requirements
- **Debt Products:** Capital term loans for specialized tooling and diagnostic machinery.
- **Schemes:** **PMEGP Services Sector (up to ₹20 Lakh project cost, 35% Margin Money grant for Rural Special Category with only 5% promoter equity)**; MUDRA Kishor (₹50k–₹5L collateral-free).

#### 10. AI Advisory Requirements
- Off-season service diversification playbook (shifting from tractor repair to solar pump and inverter AMC during monsoon).
- Spare parts inventory velocity tracker (alerting to stock up on hydraulic seals and copper wire 3 weeks before harvest season).
- Equipment lease-vs-buy payback calculator for high-cost shop machinery (e.g., automated lathe vs. outsourcing).

---

### BASKET 6: Apparel, Tailoring & Handcrafted Goods (कपड़ा सिलाई, बुनाई एवं शिल्प)

#### 1. Business Definition
Micro-enterprises engaged in fabric transformation, customized apparel stitching, school uniform production, traditional textile weaving, pottery, leatherwork, and hereditary artisanal crafts.

#### 2. Subcategories & Domains
- **Domain 6.1: Village Tailoring, Custom Apparel & Rural Boutiques:** Sewing men's/women's garments, alterations, school uniforms, festival wear.
- **Domain 6.2: Traditional Woodcraft, Furniture & Carpentry (*Suthar*):** Wooden cots, doors, window frames, agricultural implements.
- **Domain 6.3: Traditional Blacksmithing & Hardware Fabrication (*Lohar*):** Sickles, plows, pickaxes, iron gates, knives, domestic tools.
- **Domain 6.4: Traditional Pottery, Terracotta & Ceramic Items (*Kumhaar*):** Earthen pots (*matkas*), festival clay lamps (*diyas*), decorative terracotta pottery.
- **Domain 6.5: Handloom, Powerloom Weaving & Fiber Craft:** Saree weaving, durries, jute bags, coir mats, bamboo craft.

#### 3. Market Dynamics
- **Sociological Foundation:** Anchored in hereditary community skills (*Guru-Shishya Parampara*), household labor, and specialized regional craft clusters.
- **High Female Participation:** Tailoring, embroidery, and weaving represent the largest non-farm avenue for rural women entrepreneurs and SHG federations.
- **Twin Markets:** Local village utility market (daily functional needs) vs. Peri-urban/urban premium markets (artisanal handloom, GI-tagged crafts, exhibition/e-commerce sales).

#### 4. Revenue Models
- Piece-Rate Tailoring/Stitching Charges: ₹120 – ₹250 for simple blouses/shirts; ₹400 – ₹900 for suits/designer wear; ₹150 – ₹300 per school uniform set.
- Finished Goods Sale: Direct retail of finished furniture, agricultural hand tools, woven textiles, and terracotta pottery.
- Bulk Institutional Contracts: Supply of uniforms to local private/government schools, panchayat orders, or exhibition sales.

#### 5. Cost Structures
- **CapEx:** ₹40,000 – ₹2,50,000 (direct-drive industrial motorized sewing machines, overlock machines, carpentry power tools, motorized potter wheels, handlooms).
- **OpEx:** ₹5,000 – ₹18,000/month (workshop rent, single-phase power, sewing threads, needles, polishing varnishes, clay/timber raw material).
- **Working Capital:** Low for service tailoring (₹15,000); Moderate for weavers/carpenters stocking fabric rolls, yarn, or seasoned timber (₹50,000 – ₹1,80,000).

#### 6. Financial Characteristics
- **Gross Margins:** 60% – 85% on pure stitching/craft labor; 25% – 40% on finished artisan goods with material.
- **Cash Flow:** Frequent small cash inflows. Tailoring experiences massive cash surges during wedding season and school reopening (June–July).
- **Break-Even Period:** 2 – 5 months (lowest capital threshold of all sectors).

#### 7. Operational Dependencies
- **Tooling Modernization:** Upgrading from manual foot-treadle machines to direct-drive motorized power tools increases output speed by 2.5x to 4x.
- **Raw Material Access:** Access to wholesale fabric markets, seasoned timber, quality clay deposits, or natural fibers.
- **Digital Showcase:** Photography and basic social media (WhatsApp catalog) for showcasing designs to local customers.

#### 8. Seasonality & Risks
- **Seasonality:** Extreme demand during wedding seasons (*Lagna / Saava*) and regional festivals (Diwali, Eid, Durga Puja), where revenue jumps 2.5x–4x. Lean monsoon months.
- **Risks:** Influx of cheap industrial readymade garments displacing custom tailoring; occupational health hazards (musculoskeletal strain, dust inhalation in pottery/woodworking).

#### 9. Financing Requirements
- **Debt Products:** Micro-credit tranches, modern toolkit grants, and working capital overdrafts.
- **Schemes:** **PM Vishwakarma Scheme (₹15,000 digital e-RUPI toolkit voucher + Tranche 1: ₹1,00,000 @ 5% fixed interest + Tranche 2: ₹2,00,000 @ 5% fixed interest with 100% CGTMSE guarantee)**; DAY-NRLM SHG bank linkage (interest subvention to 7%).

#### 10. AI Advisory Requirements
- Production batching and capacity management during peak wedding seasons to prevent delivery default.
- Modern equipment payback calculator (e.g., ROI of buying an overlock machine vs. manual finishing).
- Digital commerce onboarding assistance (ONDC / GeM portal registration guidance).

---

### BASKET 7: Rural Construction, Building Materials & Green Enterprises (ईंट, सीमेंट एवं कम्पोस्ट निर्माण)

#### 1. Business Definition
Manufacturing and quarrying micro-units supplying physical infrastructure materials for rural housing (PMAY-G), farm structures, and eco-friendly circular biological conversions.

#### 2. Subcategories & Domains
- **Domain 7.1: Fly-Ash Bricks, Cement Hollow Blocks & Pavers:** Semi-automated hydraulic brick-making using industrial fly-ash, stone dust, and cement.
- **Domain 7.2: Precast Concrete Products & Boundary Fabrication:** Precast RCC poles, door frames, fencing posts, well rings, and toilet pit rings.
- **Domain 7.3: Commercial Vermicomposting & Organic Bio-Inputs:** HDPE bed earthworm culture (*Eisenia fetida*) converting cow dung and crop residue into organic fertilizer.
- **Domain 7.4: Biomass Briquetting & Bio-Coal Pellets:** Chopping and pressing crop stubble/sawdust into dense high-calorific logs for boilers and brick kilns.

#### 3. Market Dynamics
- **Growth Engine:** Rural housing transformation driven by Pradhan Mantri Awas Yojana - Gramin (PMAY-G) and rural road connectivity (PMGSY).
- **Proximity Monopoly:** Construction materials are heavy, bulky, and have high transport costs. A brick or block unit enjoys a natural competitive monopoly within a 10–25 km radius.
- **Environmental Transition:** Government bans on red clay bricks in many zones create a massive tailwind for fly-ash bricks and precast structures.

#### 4. Revenue Models
- Volume Material Sales: Per-unit pricing (Fly-ash bricks: ₹4.50 – ₹6.50/brick; Concrete poles: ₹280 – ₹450/pole; Well rings: ₹600 – ₹1,100/ring).
- Organic Commodity Sales: Packed vermicompost in 25kg/50kg bags (₹7 – ₹11/kg); liquid vermiwash (₹50 – ₹80/liter).
- Industrial Supply Contracts: Supplying biomass briquettes to tea gardens, sugar factories, or local dyeing units at ₹5,200 – ₹6,200/MT.

#### 5. Cost Structures
- **CapEx:** ₹2,50,000 – ₹16,00,000 (hydraulic brick press with pan mixer and conveyor, concrete molding dies, vibrator tables, HDPE vermi-beds, hammer mill/briquetting press, 3-phase connection).
- **OpEx:** ₹35,00,000 – ₹1,80,000/month (procurement of fly-ash, stone dust, cement bags, raw cow dung, tractor freight, casual manual labor).
- **Working Capital:** High inventory holding for curing (bricks and concrete require 14–21 days of water curing before they can be sold: ₹2,00,000 – ₹6,00,000 locked in curing stock).

#### 6. Financial Characteristics
- **Gross Margins:** 22% – 35% on fly-ash bricks/blocks; 50% – 68% on vermicomposting; 28% – 42% on precast items.
- **Cash Flow:** Dependent on contractor billing and rural construction cycles. 30% advance, remainder on delivery.
- **Break-Even Period:** 7 – 14 months.

#### 7. Operational Dependencies
- **Land & Water Footprint:** Minimum 5,000 – 15,000 sq. ft. open yard for stacking and water curing. Continuous access to water (curing requires 3,000–8,000 liters/day).
- **Raw Material Access:** Stable supply line of fly-ash from thermal power plants and cement/stone grit from crushers.
- **Environmental Classification:** Vermicomposting is CPCB White Category (100% exempt from CTE/CTO). Fly-ash brick making is CPCB Green Category (simplified consent).

#### 8. Seasonality & Risks
- **Seasonality:** Strong activity from October to June. Total operational shutdown during monsoon (July–September) because outdoor drying and curing are impossible and construction stops.
- **Risks:** Cement price spikes; transport vehicle breakdowns; labor shortages during agricultural harvesting seasons.

#### 9. Financing Requirements
- **Debt Products:** Medium-term commercial equipment loans + Working capital lines for raw material inventory.
- **Schemes:** **PMEGP Manufacturing (35% rural subsidy up to ₹50 Lakhs project cost)**; **Agriculture Infrastructure Fund (AIF: 3% interest subvention up to ₹2 Crore for bio-waste / vermicompost post-harvest units)**; GOBAR-dhan grants.

#### 10. AI Advisory Requirements
- Curing cycle working capital forecaster (ensuring liquidity does not run dry during the mandatory 21-day curing period).
- Raw material mix optimization (ratio of cement:fly-ash:sand to maintain IS-12894 compressive strength standards at minimum cost).
- Monsoon shutdown liquidity preservation planner.

---

### BASKET 8: Rural Mobility, Transport & Logistics Fleet (लोडर वाहन, ट्रैक्टर एवं परिवहन)

#### 1. Business Definition
Commercial logistics and passenger mobility services facilitating movement of agricultural produce from farm-gate to mandi, wholesale goods to retail stores, and rural citizens to nearby towns.

#### 2. Subcategories & Domains
- **Domain 8.1: Small Commercial Freight Vehicles (SCV / LCV):** Tata Ace, Mahindra Bolero Pik-Up, Ashok Leyland Dost operating on short-haul logistics.
- **Domain 8.2: Agricultural Tractor Trolley Haulage & Custom Hiring:** Heavy harvest transport (sugarcane to mill, grain to mandi, sand/bricks to construction sites).
- **Domain 8.3: Rural Electric Passenger Mobility (e-Rickshaw / Shared Auto):** 3-wheeler feeder connectivity between interior villages and main highway bus stops.

#### 3. Market Dynamics
- **Vital Lifeline:** Rural public transport is deficient. Over 80% of villages rely on shared private commercial mobility for transit to tehsil centers.
- **Dual Income Stream:** Farm tractors and freight vehicles generate revenue from internal farm work AND external commercial hiring.
- **High Asset Mobility:** Collateral is a standardized, registered vehicular asset with established secondary resale markets.

#### 4. Revenue Models
- Freight Trip Charges: Per-trip or per-quintal rates (e.g., ₹800 – ₹1,800 per 15 km trip carrying 1.5 MT agricultural produce).
- Daily Passenger Fare: Shared per-seat fare (₹15 – ₹30 per passenger for 8–12 km feeder routes).
- Seasonal Haulage Contracts: Fixed seasonal contracts with sugar mills or mandi traders (₹1,50,000 – ₹3,50,000 per season).

#### 5. Cost Structures
- **CapEx:** ₹1,80,000 – ₹9,50,000 (down payment and total vehicle acquisition cost for e-rickshaw, pickup truck, or tractor + hydraulic trolley).
- **OpEx:** ₹12,000 – ₹42,000/month (diesel/electricity charging cost, driver/helper wage, routine oil servicing, tire wear, annual comprehensive insurance, fitness/permit renewals).
- **Working Capital:** Low (fuel cost for 7–10 days: ₹15,000 – ₹35,000).

#### 6. Financial Characteristics
- **Gross Margins:** 35% – 55% operating surplus over fuel and maintenance costs.
- **Cash Flow:** Immediate daily cash from passenger and small freight; 15–30 day billing cycles on corporate/sugar mill contracts.
- **Break-Even Period:** 14 – 22 months (dictated by vehicular asset amortization).

#### 7. Operational Dependencies
- **Statutory Compliances:** Commercial RTO registration, State Carriage Permits, Comprehensive Commercial Insurance, Pollution Under Control (PUC) certificate.
- **Road Infrastructure:** Operates on rural roads (PMGSY roads, unpaved village lanes); vehicle maintenance costs correlate with road quality.
- **Fuel/Charging Infrastructure:** Proximity to diesel bunks or reliable 230V connection for overnight e-rickshaw battery charging.

#### 8. Seasonality & Risks
- **Seasonality:** High freight demand during post-harvest marketing months (sugarcane crushing season: November–March; wheat harvest: April–May).
- **Risks:** Fuel price volatility; vehicular accidents; roadside police harassment / RTO challans; vehicle breakdown on bad rural roads.

#### 9. Financing Requirements
- **Debt Products:** Commercial Vehicle (CV) Loans from NBFCs / Banks with 15%–25% down payment; Priority Sector Lending auto loans.
- **Schemes:** MUDRA Tarun (for commercial pickup trucks); PMEGP Service Sector (for custom hiring centers); State EV subsidy programs (for e-rickshaws).

#### 10. AI Advisory Requirements
- Route profitability analyzer (calculating net margin per km factoring fuel, tire depreciation, and empty return trips).
- Commercial financing EMI vs. operating cash flow stress-tester.
- Fleet maintenance schedule alert system to prevent catastrophic engine failure.

---

## 4. Frontend vs. Backend Mapping Matrix

This table defines how user selections on the frontend map directly to underlying data models, compliance checklists, and research agent domains on the backend:

```
┌──────────────────────────────────────┬──────────────────────────────────────────┬────────────────────────┬──────────────────────┐
│ User-Facing Basket (Frontend)        │ Backend Specialized Research Domain      │ Statutory Regulator   │ Primary Scheme Match │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 1. Kirana, General Retail & Consumer │ D1: FMCG & Village Retail Stores         │ FSSAI (FoSCoS)         │ PMMY MUDRA (Kishor)  │
│    Goods                             │ D2: Haat & Mobile Trade Vendors          │ Local Municipal / Haat │ PM SVANidhi          │
│                                      │ D3: Rural Electronics & Recharges        │ State Shops & Est.     │ PMMY MUDRA (Shishu)  │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 2. Agri-Inputs, Seeds & Farm         │ D4: Certified Seeds, Fertilizer & Chem.  │ Dept of Agriculture    │ MUDRA / AIF          │
│    Machinery Trading                 │ D5: Cattle Feed & Veterinary OTC         │ FSSAI / Animal Health  │ MUDRA (Tarun)        │
│                                      │ D6: Farm Hardware & Drip Irrigation      │ Bureau of Indian Stds  │ MUDRA (Kishor)       │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 3. Food Milling, Processing & Local  │ D7: Custom Grain & Pulse Milling         │ FSSAI / SPCB (White)   │ PMFME / PMEGP Mfg    │
│    Packaging                         │ D8: Edible Oil Expellers & Cold-Press    │ FSSAI / AGMARK         │ PMFME / PMEGP Mfg    │
│                                      │ D9: Spice Grinding & Consumer Packaging  │ FSSAI / Legal Metrol.  │ PMFME / PMEGP Mfg    │
│                                      │ D10: Horticultural Processing & Drying   │ FSSAI / MoFPI          │ PMFME / AIF          │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 4. Dairy, Livestock & Allied Animal  │ D11: High-Yield Bovine Dairy Hubs        │ DAHD / Cooperatives    │ KCC / AHIDF          │
│    Husbandry                         │ D12: Commercial Goat & Sheep Units       │ DAHD / NLM Guidelines  │ NLM (50% Subsidy)/KCC│
│                                      │ D13: Broiler & Layer Poultry Production  │ DAHD / CPCB White      │ NLM / MUDRA          │
│                                      │ D14: Inland Aquaculture & Fisheries      │ NFDB / Dept Fisheries  │ PMMSY / KCC Fish.    │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 5. Machinery Workshop, Vehicle &     │ D15: Tractor & Farm Implement Garages    │ SPCB (White Category)  │ PMEGP Services (35%) │
│    Pump Repair                       │ D16: Submersible Pump & Motor Rewinding  │ State DISCOM LT Norms  │ PMEGP Services / MUDRA│
│                                      │ D17: Auto Garage, 2W & Rural EV Repair   │ State Pollution Board  │ PMEGP Services (35%) │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 6. Apparel, Tailoring & Handcrafted  │ D18: Village Tailoring & Boutiques       │ Ministry of MSME       │ PM Vishwakarma / SHG │
│    Goods                             │ D19: Carpentry & Woodcraft (Suthar)      │ MoMSME / DIC           │ PM Vishwakarma (5%)  │
│                                      │ D20: Metal Fabrication & Smithy (Lohar)  │ MoMSME / DIC           │ PM Vishwakarma (5%)  │
│                                      │ D21: Pottery & Terracotta (Kumhaar)      │ KVIC / MoMSME          │ PM Vishwakarma / PMEGP│
│                                      │ D22: Handloom & Fiber Craft Weaving      │ Ministry of Textiles   │ PM Vishwakarma / AHVY│
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 7. Rural Construction, Building      │ D23: Fly-Ash Bricks & Paver Blocks       │ SPCB (Green Category)  │ PMEGP Mfg (35%)      │
│    Materials & Green Enterprises     │ D24: Precast Concrete & Well Rings       │ Bureau of Indian Stds  │ PMEGP Mfg (35%)      │
│                                      │ D25: Commercial Vermicomposting Units    │ FCO Schedule IV        │ AIF / PMEGP / GOBAR  │
│                                      │ D26: Biomass Briquetting & Bio-Coal      │ SPCB (White Category)  │ PMEGP Mfg / AIF      │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────┼──────────────────────┤
│ 8. Rural Mobility, Transport &       │ D27: Small Freight Logistics (SCV/LCV)   │ Regional Transport Off.│ MUDRA Tarun / PSL    │
│    Logistics Fleet                   │ D28: Tractor Haulage & Custom Hiring     │ RTO / Dept of Agri     │ PMEGP Services / CHC │
│                                      │ D29: Shared Rural EV Mobility (e-Rick.)  │ RTO / FAME-II / State  │ MUDRA Shishu/Kishor  │
└──────────────────────────────────────┴──────────────────────────────────────────┴────────────────────────┴──────────────────────┘
```

---

## 5. Independent Research Architecture: Agent Scope & Deliverable Contracts

Each backend research domain is designed as a standalone investigation module. When research agents are deployed in the future, each will operate under an identical **Standard Research Contract** to ensure cross-comparability.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      STANDARDIZED AGENT RESEARCH SPECIFICATION                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Every research agent investigating an assigned domain must produce a structured        │
│ document containing the following 8 canonical sections:                               │
│                                                                                        │
│ 1. Macro Demographics & Demand Profile (NSSO / ASUSE / Industry Association Data)     │
│ 2. Standardized CapEx Bill of Materials (Machinery, Sourcing Hubs, Power, Pricing)    │
│ 3. Recurring OpEx Statement & Working Capital Cycle (Raw Materials, Labor, Logistics) │
│ 4. Deterministic Unit Economics Model (Yield Ratios, Unit Revenues, Blended Margins)  │
│ 5. 12-Month Agricultural Seasonality Multiplier Array [M1 to M12]                      │
│ 6. Regulatory & Compliance Blueprint (Acts, Forms, Portals, Exemptions, Timelines)     │
│ 7. Scheme Eligibility & Subsidy Decision Rules (PMEGP, PMFME, Vishwakarma, MUDRA, AIF) │
│ 8. Risk Register & Algorithmic Mitigation Rules (Operating & Financial Fragility)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Variables for Future ML Advisory Engine Integration
The findings from each agent will populate a centralized schema structured for predictive modeling:

```json
{
  "domain_id": "D08_OIL_EXPELLER",
  "basket_id": "B03_FOOD_PROCESSING",
  "statutory_sector": "Manufacturing",
  "financial_benchmarks": {
    "min_capex_inr": 450000,
    "optimal_capex_inr": 680000,
    "working_capital_days": 21,
    "gross_margin_pct_range": [14.0, 22.0],
    "typical_break_even_months": 7,
    "power_requirement_hp": 15,
    "power_phase": 3
  },
  "seasonality_weights": [1.4, 1.3, 1.2, 0.8, 0.6, 0.5, 0.5, 0.7, 0.9, 1.3, 1.4, 1.4],
  "statutory_matrix": {
    "cpcb_category": "White",
    "fssai_category": "Registration_or_State_License",
    "primary_act": "FSS Act 2006",
    "cte_cto_required": false
  },
  "optimal_scheme_priority": ["PMFME", "PMEGP_MFG", "AIF"],
  "informal_debt_refinance_suitability": {
    "preferred_facility": "MUDRA_TARUN",
    "max_refinance_headroom_inr": 1000000
  }
}
```

---

## 6. Synthesis & Strategic Readiness

1. **User Experience Solved:** A rural user never sees technical jargon like "Unincorporated Non-Farm MSME" or "NSSO Sector 3". They simply select one of **8 recognizable activity baskets** (e.g., *गैराज एवं रिपेयरिंग* or *किराना दुकान*).
2. **Analytical Granularity Preserved:** The backend maps that selection into one of **24 research domains**, unlocking exact unit economics, DSCR seasonality stress-tests, and regulatory rules.
3. **Clean Research Boundaries:** Each domain can now be investigated independently by dedicated research agents without risk of overlapping scopes or conflicting financial models.

