# Project Requirements v2.0: AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant
**Problem Statement:** SIH26091 — Ministry of Social Justice and Empowerment (MoSJE)  
**Target Authority:** National Scheduled Castes Finance and Development Corporation (NSFDC)  
**Document Ref:** SIH-2026-REQUIREMENTS-V2 (Revises and supersedes v1.0)

---

## 1. System Overview & Statutory Mandate
An AI-powered, bilingual voice-first advisory platform and assisted portal empowering rural and semi-urban Scheduled Caste (SC) micro-entrepreneurs to evaluate localized enterprise feasibility, simulate seasonal cash flows, and generate bankable Detailed Project Reports (DPRs) linked to statutory credit and subsidy schemes under MoSJE and NSFDC.

### Core Beneficiary Eligibility Gates
- **Gate SC-01 (Community Eligibility):** Beneficiary must belong to the Scheduled Caste (SC) community and possess a valid caste certificate.
- **Gate SC-02 (Income Ceiling):** Total annual family income must not exceed **₹5,00,000** (applicable uniformly across rural and semi-urban/urban areas, effective 07 January 2026).
- **Target Geography:** Rural and semi-urban blocks across 24 priority enterprise domains spanning 6 core baskets (B1–B6).

---

## 2. Statutory Credit Framework: NSFDC Dual-Tier Financing

The financial calculation engine must be strictly calibrated against the official NSFDC concessionary lending schemes channeled via State Channelizing Agencies (SCAs):

### Tier 1: Micro Credit Finance (MCF / Mahila Samriddhi Yojana - MSY)
- **Project Cost Ceiling:** Up to **₹1,40,000**.
- **Maximum Loan Share:** Up to 90% of project cost, subject to an absolute **loan cap of ₹1,25,000**.
  - *Hard Constraint:* At ₹1,40,000 project cost, loan is capped at ₹1,25,000 and promoter equity is ₹15,000 (10.71%), NOT 10% / ₹14,000.
- **Interest Rate:** **6.5% p.a.** concessional rate to beneficiary.
- **Repayment Schedule:** **3 years (36 months)** including a **3-month moratorium** on principal repayment.
- **Instalment Frequency:** **11 quarterly instalments** following the 3-month moratorium.

### Tier 2: Term Loan Scheme
- **Project Cost Range:** Above **₹1,40,000** up to **₹50,00,000** (typical micro-units: ₹2.00L – ₹15.00L).
- **Maximum Loan Share:** Up to 90% of project cost (NSFDC + SCA share).
- **Promoter Equity Contribution:** Minimum 10% of project cost (or balance remaining after loan).
- **Interest Rate:** **8.0% p.a.** concessional rate.
- **Repayment Schedule:** Up to **7 years (84 months)** including a **6-month moratorium** (up to 12 months for specialized agricultural/infrastructure units).
- **Instalment Frequency:** **26 quarterly instalments** (standard 7-year tenure with 6-month moratorium).

---

## 3. Functional Requirements

### Module 1: Hyper-Local Market Feasibility Engine
- **REQ-01 (Domain Baseline Database):** Index and query the 24 researched sector dossiers (D01–D24) encompassing CapEx breakdowns, OpEx structures, working capital cycles, and unit economics.
- **REQ-02 (Macro Data Ingestion):** Incorporate official district/block-level data:
  - ASUSE 2023-24 / 2025 enterprise density.
  - MPCE (Household Consumption Expenditure) rural purchasing power parity indices.
  - Mandi / APMC prices (Agmarknet) for agri/livestock inputs and finished goods.
- **REQ-03 (Conversational Micro Ground-Truth):** Multi-turn conversational elicitation (voice/text) capturing micro-catchment realities: local competitor count within 5–10 km, customer catchment radius, raw material sourcing distance, and power availability.
- **REQ-04 (Viability & SWOT Assessment):** Deterministic synthesis of micro/macro parameters producing a Viability Score (0–100) and actionable SWOT matrix highlighting single-buyer dependence, seasonal supply bottlenecks, and margin volatility.

### Module 2: Deterministic NSFDC Financial Structurer & Scheme Matcher
- **REQ-05 (Statutory Means of Finance):** Compute project cost, promoter equity, and loan amount strictly applying NSFDC caps, 90% rules, and minimum margin thresholds.
- **REQ-06 (Quarterly Amortization Engine):** Deterministic generation of quarterly repayment schedules incorporating exact moratorium periods, quarterly interest compounding/accrual, principal amortization, and ending balances.
- **REQ-07 (Seasonal Cash-Flow & DSCR Stress Testing):** Model month-by-month or quarter-by-quarter revenue dips during lean/monsoon months; calculate dynamic Debt Service Coverage Ratios (DSCR) ensuring benchmark bankability (DSCR >= 1.25).
- **REQ-08 (Scheme Routing & Inter-Scheme Conflict Detection):**
  - Primary Router: NSFDC MCF (<= ₹1.40L) or NSFDC Term Loan (> ₹1.40L).
  - Secondary Schemes:
    * **PM Vishwakarma:** Covered traditional artisan trades (Darzi, Carpenter, Blacksmith, Potter) with ₹15,000 toolkit voucher and 5% interest rate. Enforce exclusion rule: ineligible if PMEGP availed in past 5 years.
    * **PMEGP:** 25%–35% rural margin money subsidy. Flag restriction: cannot double-dip on asset subsidy with NSFDC SCA financing.
    * **PM Mudra Yojana (PMMY):** Alternative commercial route (Shishu/Kishore/Tarun) if non-SC or income exceeds ₹5L.
    * **PM SVANidhi:** Urban/peri-urban haat cart vendors (conditional).
    * **PMMSY / NLM / KCC / AIF:** Domain-specific livestock, dairy, fisheries, and post-harvest infrastructure credit.

### Module 3: DPR Generation & Delivery Channels
- **REQ-09 (Bank-Ready 1-Page DPR PDF):** Deterministic compilation of a standardized, bilingual 1-page Detailed Project Report containing:
  - Beneficiary profile & eligibility verification badge.
  - Project cost breakdown (Plant & Machinery, Civil/Electrification, Working Capital).
  - Means of Finance (Promoter Equity vs NSFDC Loan).
  - 11-quarter or 26-quarter repayment summary table and DSCR indicator.
  - Verification QR code and tamper-evident metadata.
- **REQ-10 (Multilingual Voice-First Interface):** WhatsApp / PWA voice-first interaction supporting conversational speech in Hindi and English.
- **REQ-11 (Assisted PWA Portal):** Responsive web application for VLEs, CSCs, and Bank Sakhis supporting offline form persistence, live financial recalibration, and instant PDF generation.

---

## 4. Non-Functional Requirements
- **NFR-01 (Zero Hallucination on Financials):** All credit amounts, interest rates, instalments, DSCR ratios, and subsidies must be strictly computed by deterministic Python/JS engines. LLMs are prohibited from computing numerical financials.
- **NFR-02 (Full Source Provenance):** CapEx and OpEx items in the database must retain source tags (`[S#]`, `ESTIMATE`, `VENDOR QUOTE NEEDED`, `NOT FOUND`). Fabricated values are strictly prohibited.
- **NFR-03 (Statutory Integrity & Legal Guardrails):**
  - Disclaimer regarding Digital Lending Guidelines 2025: app acts as an advisory/information portal, not a Lending Service Provider (LSP).
  - Regulatory warnings on state money-lending caps (e.g. Damdupat rules).
- **NFR-04 (Low-Bandwidth & Offline Resilience):** Frontend must function smoothly under low-connectivity 2G/3G conditions with local state persistence.


