# Section 3 & 4: Technical Architecture, Data Pipeline & Geo-Spatial Feasibility Engine
**Project:** AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs  
**Theme:** Smart India Hackathon (SIH) | Data Engineering, Geo-Spatial Intelligence & Macro-Micro Triangulation  
**Date:** November 2026  

---

## 1. The Core Data Challenge: Solving the "Rural Data Black Hole"

In urban markets, business viability models query Google Places, Zomato listings, Swiggy order densities, and municipal tax registries to calculate footfall and competitor saturation. 

In rural India (spanning **660,000+ villages**), **none of these commercial APIs exist**. Village grocery stores, oil expellers, and repair garages have zero digital footprints.

To solve this, our platform engineers a **Three-Tier Macro-Micro Triangulation Architecture**:
1. **Tier 1 (Public Macro-Data Ingestion):** District/Block demographic, road connectivity, and agricultural output baselines.
2. **Tier 2 (Open Geo-Spatial Extraction):** OpenStreetMap (OSM) Overpass API queries mapping rural transport nodes, weekly haats, and registered rural points of interest (POIs).
3. **Tier 3 (Conversational Micro Ground-Truth):** Targeted voice questions via WhatsApp/PWA to extract localized competitive density directly from the resident entrepreneur.

```
                  THE THREE-TIER TRIANGULATION DATA PIPELINE
                  
  ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
  │ TIER 1: MACRO STATISTICAL DATA  │       │ TIER 2: GEO-SPATIAL PROXIES     │
  │ • Census PCA (Population, SC/ST)│       │ • OpenStreetMap (Overpass API)  │
  │ • PMGSY Road Connectivity Index │       │ • PMGSY Habitation Geometries   │
  │ • Agmarknet Daily APMC Mandi    │       │ • Bhuvan (ISRO) Land-Use Maps   │
  │   Modal Prices (data.gov.in)    │       │ • Distance to Highway / Mandi   │
  └────────────────┬────────────────┘       └────────────────┬────────────────┘
                   │                                         │
                   └───────────────────┬─────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │   INTERPOLATED BLOCK INDEX    │
                       │   (Macro Demand Baseline)     │
                       └───────────────┬───────────────┘
                                       │
                                       ▼ (Fused with)
                       ┌───────────────────────────────┐
                       │ TIER 3: CONVERSATIONAL MICRO  │
                       │ GROUND-TRUTH (Voice Dialogue) │
                       │ • Direct competitor count (3km│
                       │ • Raw material source distance│
                       │ • Target customer villages    │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │ HYPER-LOCAL DEMAND &          │
                       │ SATURATION INDEX (HDSI)       │
                       │ Score: 0 – 100 & SWOT Matrix  │
                       └───────────────────────────────┘
```

---

## 2. Ingestion Pipeline & Public Dataset Integrations

### 2.1 Census Primary Census Abstract (PCA) & Socio-Economic Caste Census (SECC)
* **Ingestion Source:** Ministry of Home Affairs / Office of the Registrar General & Census Commissioner.
* **Granularity:** Village level (28-digit Village Census Code / LGD - Local Government Directory).
* **Key Feature Vectors:**
  - `total_households` ($H_v$): Village consumption base.
  - `sc_st_population_pct`: Determines eligibility for 35% Special Category PMEGP subsidies.
  - `agricultural_laborers_ratio`: Indicates seasonal liquidity surges post-harvest vs. lean seasons.
  - `electrification_status`: Flags three-phase power availability required for industrial machinery.

### 2.2 Pradhan Mantri Gram Sadak Yojana (PMGSY) Connectivity Index
* **Ingestion Source:** National Rural Infrastructure Development Agency (NRIDA) / OGD Platform India.
* **Feature Utility:** Unconnected or dirt-road villages face 2.5x higher transport overhead for raw materials.
* **Connectivity Metric:**
$$\text{Transport Penalty Factor} (\tau) = \begin{cases} 1.00 & \text{All-weather paved BT road} \\ 1.25 & \text{Gravel / WBM road} \\ 1.50 & \text{Fair-weather dirt track (monsoon vulnerable)} \end{cases}$$

### 2.3 Agmarknet & data.gov.in Real-Time Mandi Price Feeds
* **Ingestion Source:** Directorate of Marketing & Inspection (DMI) via data.gov.in REST API.
* **Daily Ingestion Loop:** Pulls daily `modal_price`, `min_price`, and `max_price` for 300+ commodities across 3,000+ APMC market yards.
* **Feature Utility:** Calculates realistic raw material procurement costs for agro-processing micro-enterprises (e.g., prevailing mustard seed price in Chomu Mandi vs. processed oil selling price in Jaipur retail).

### 2.4 OpenStreetMap (OSM) Overpass API for Rural POIs
* **Ingestion Strategy:** Geospatial bounding-box queries ($5\text{ km}$ radius around target Gram Panchayat).
* **Tags Queried:**
  - `amenity=marketplace`, `amenity=bank`, `amenity=fuel`
  - `shop=general`, `shop=agrarian`, `shop=tailor`
  - `highway=primary`, `highway=secondary`, `highway=bus_stop`
* **Output:** Quantifies existing commercial clustering and transport accessibility.

---

## 3. Mathematical Formulation: Hyper-Local Demand & Saturation Index (HDSI)

The engine computes an audited composite index $\text{HDSI} \in [0, 100]$:

$$\text{HDSI} = \alpha \cdot \text{Demand Potential} + \beta \cdot \text{Market Saturation Penalty} + \gamma \cdot \text{Supply Accessibility} + \delta \cdot \text{Seasonal Stability}$$

Where standard default weights are: $\alpha = 0.35, \beta = 0.30, \gamma = 0.20, \delta = 0.15$.

### 3.1 Sub-Factor Mathematical Formulations

#### 1. Demand Potential Score ($D_p \in [0, 100]$)
Measures the local economic absorption capacity based on population density and household purchasing power:
$$D_p = \min\left(100, \frac{\sum_{i \in \text{Cluster}} H_i \cdot \text{Category Expenditure Factor}}{K_{\text{capacity}}}\right)$$
Where $H_i$ is the household count of neighboring villages within a $5\text{ km}$ service radius, and $K_{\text{capacity}}$ is the category benchmark (e.g., 800 households per small flour mill).

#### 2. Market Saturation Penalty ($S_p \in [0, 100]$)
Penalizes "copycat herding" when multiple identical enterprises operate in close proximity:
$$S_p = 100 \cdot \exp\left(-\lambda \cdot \frac{N_{\text{competitors}}}{\text{Max Village Capacity}}\right)$$
Where $N_{\text{competitors}}$ is obtained via conversational ground-truth + OSM nodes, and $\lambda = 1.2$.
* If $N_{\text{competitors}} = 0$ or $1$ (defunct): $S_p \approx 90 - 100$ (Low Saturation Risk).
* If $N_{\text{competitors}} \ge 4$: $S_p < 30$ (Severe Over-Saturation Risk — triggers system advisory).

#### 3. Supply Chain Accessibility Score ($A_s \in [0, 100]$)
$$A_s = 100 - \min\left(80, \text{Distance to Raw Material (km)} \times 2.0 \times \tau\right)$$
Where $\tau$ is the PMGSY transport road quality multiplier.

#### 4. Seasonal Stability Score ($V_{\text{season}} \in [0, 100]$)
$$V_{\text{season}} = 100 \times \left(1.0 - \frac{\text{Peak Revenue} - \text{Lean Revenue}}{\text{Average Annual Revenue}}\right)$$

---

## 4. End-to-End System Architecture & Database Schema

```
                                SYSTEM COMPONENT ARCHITECTURE
                                
      ┌─────────────────────────────────────────────────────────────────────────────┐
      │                         CLIENT ACCESS CHANNELS                              │
      │  [WhatsApp Business Bot (Twilio/Gupshup)]  │  [React + Vite Offline PWA]    │
      └──────────────────────────────────────┬──────────────────────────────────────┘
                                             │ HTTPS / WebSocket / Webhooks
                                             ▼
      ┌─────────────────────────────────────────────────────────────────────────────┐
      │                        API GATEWAY & AUTHENTICATION                         │
      │  FastAPI Gateway (Rate Limiting, Aadhaar Masking, JWT Session Management)   │
      └──────────────────────────────────────┬──────────────────────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
      ┌───────────────────────────────┐             ┌───────────────────────────────┐
      │ SENSORY VOICE & NLP PIPELINE  │             │ DETERMINISTIC CORE ENGINE     │
      │ • Bhashini ASR/TTS Bridge     │             │ • Project Cost Decomposition  │
      │ • Indic-Llama-70B Agent       │             │ • PMEGP / MUDRA Rule Tree     │
      │ • Entity Parsing (JSON Schema)│             │ • Dynamic DSCR / Stress Model │
      └───────────────┬───────────────┘             └───────────────┬───────────────┘
                      │                                             │
                      └──────────────────────┬──────────────────────┘
                                             ▼
      ┌─────────────────────────────────────────────────────────────────────────────┐
      │                             STORAGE PERSISTENCE                             │
      │  • PostgreSQL + PostGIS: Geospatial village bounds, census tables, profiles │
      │  • Redis: Voice note session state & multi-turn dialogue cache              │
      │  • ChromaDB: Vectorized official KVIC / MoMSME gazette circulars            │
      └─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Production Database Schema (PostgreSQL + PostGIS DDL)

```sql
-- Extension for Geospatial distance and cluster queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Village & Block Demographic Baseline Table
CREATE TABLE village_demographics (
    lgd_village_code VARCHAR(20) PRIMARY KEY,
    village_name VARCHAR(100) NOT NULL,
    block_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    geom GEOMETRY(Point, 4326),
    total_population INT NOT NULL,
    total_households INT NOT NULL,
    sc_population INT DEFAULT 0,
    st_population INT DEFAULT 0,
    has_three_phase_power BOOLEAN DEFAULT TRUE,
    pmgsy_road_status VARCHAR(20) DEFAULT 'paved_all_weather'
);

-- 2. Daily Mandi Commodity Prices
CREATE TABLE mandi_daily_prices (
    price_id SERIAL PRIMARY KEY,
    mandi_name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    arrival_date DATE NOT NULL,
    modal_price_per_qtl NUMERIC(10, 2) NOT NULL,
    min_price_per_qtl NUMERIC(10, 2),
    max_price_per_qtl NUMERIC(10, 2),
    CONSTRAINT unique_mandi_commodity_date UNIQUE (mandi_name, commodity, arrival_date)
);

-- 3. Micro-Enterprise Consultation Sessions
CREATE TABLE enterprise_appraisals (
    appraisal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    applicant_name VARCHAR(100) NOT NULL,
    masked_aadhaar_uap VARCHAR(30),
    social_category VARCHAR(30) NOT NULL,
    location_lgd_code VARCHAR(20) REFERENCES village_demographics(lgd_village_code),
    business_type VARCHAR(50) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    nic_code VARCHAR(10) NOT NULL,
    user_margin_capital NUMERIC(12, 2) NOT NULL,
    calculated_capex NUMERIC(12, 2) NOT NULL,
    calculated_opex_monthly NUMERIC(12, 2) NOT NULL,
    calculated_working_capital NUMERIC(12, 2) NOT NULL,
    total_project_outlay NUMERIC(12, 2) NOT NULL,
    matched_scheme VARCHAR(100) NOT NULL,
    government_subsidy_amount NUMERIC(12, 2) NOT NULL,
    bank_term_loan NUMERIC(12, 2) NOT NULL,
    monthly_emi NUMERIC(10, 2) NOT NULL,
    average_dscr NUMERIC(5, 2) NOT NULL,
    minimum_seasonal_dscr NUMERIC(5, 2) NOT NULL,
    competitor_density_count INT DEFAULT 0,
    hdsi_score NUMERIC(5, 2) NOT NULL,
    viability_status VARCHAR(30) NOT NULL,
    dpr_pdf_sha256 VARCHAR(64),
    session_audio_transcript TEXT
);

CREATE INDEX idx_village_geom ON village_demographics USING GIST(geom);
CREATE INDEX idx_mandi_search ON mandi_daily_prices (commodity, district, arrival_date);
```

---

## 5. Security, Data Privacy & DPDP Compliance

1. **Aadhaar & Personal Identifiers Masking:** In accordance with UIDAI regulations, full 12-digit Aadhaar numbers are never stored in databases or log files. Inputs are validated and masked as `XXXX-XXXX-4921`.
2. **Account Aggregator (AA) Consent Architecture:** When the entrepreneur provides bank statement access to prove liquidity, data is pulled via RBI-licensed Account Aggregators (Setu / Sahamati / Anumati) using ephemeral, digitally-signed time-bounded consent tokens.
3. **Tamper-Proof Verification Hash:** Every generated DPR generates a SHA-256 hash of its core financials:
$$\text{Hash} = \text{SHA256}(\text{Appraisal ID} \parallel \text{Applicant} \parallel \text{CapEx} \parallel \text{Bank Loan} \parallel \text{Subsidy} \parallel \text{Salt})$$
This hash is embedded into the printable QR Code, enabling branch managers to verify that a printed paper document matches the server's record without tampering.

