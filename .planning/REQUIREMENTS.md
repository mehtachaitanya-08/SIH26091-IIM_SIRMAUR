# Project Requirements: AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant

## System Overview
An AI-powered, bilingual voice-first assistant and assisted portal empowering rural micro-entrepreneurs to evaluate localized business viability, stress-test irregular cash flows, and generate bankable Detailed Project Reports (DPRs) linked to government subsidy schemes.

---

## Functional Requirements

### Module 1: Hyper-Local Market Feasibility Engine
- **REQ-01 (Macro Layer Integration):** Ingest and index public district/block-level datasets (Census population density, PMGSY road connectivity indices, and APMC agricultural mandi prices).
- **REQ-02 (Conversational Micro Ground-Truth):** Prompt the entrepreneur with 3–5 targeted conversational questions to capture local competitive context (number of nearby competing shops, supply distance, target village clusters).
- **REQ-03 (Viability & Saturation Index):** Synthesize macro and micro inputs into a weighted Viability Score (0–100) and an audio/visual SWOT summary (High/Medium/Low demand, competition risk, supply bottlenecks).

### Module 2: Deterministic Financial Structurer & Scheme Matcher
- **REQ-04 (Cost & Margin Breakdown):** Calculate true CapEx, OpEx, and initial working capital based on user's business type and available personal margin money.
- **REQ-05 (Seasonal Cash-Flow Stress Testing):** Interactive conversational simulation testing revenue dips during lean/monsoon seasons, calculating dynamic Debt Service Coverage Ratios (DSCR).
- **REQ-06 (Government Scheme Matching Engine):** Deterministic rules engine matching user profile and business category with schemes:
  - Pradhan Mantri Mudra Yojana (PMMY - Shishu / Kishore / Tarun)
  - Prime Minister's Employment Generation Programme (PMEGP - 15% to 35% margin money subsidy)
  - PM SVANidhi (street vendor collateral-free credit)
  - Deendayal Antyodaya Yojana - NRLM (women SHG micro-enterprise loans)

### Module 3: DPR Generation & Delivery Channels
- **REQ-07 (Bank-Ready 1-Page DPR PDF):** Automatically compile a standardized, bilingual (English + regional language) 1-page Detailed Project Report including cost breakdown, means of finance, repayment schedule, and verification QR code.
- **REQ-08 (Voice-First WhatsApp Interface):** Direct channel for rural entrepreneurs allowing voice notes in regional languages (via Bhashini/Whisper Indic STT/TTS) and returning audio answers + PDF report.
- **REQ-09 (Assisted PWA Portal):** Web interface for Village Level Entrepreneurs (VLEs), CSC operators, or Bank Sakhis to assist thin-file entrepreneurs, review profiles, and print physical reports.

---

## Non-Functional Requirements
- **NFR-01 (Zero Hallucination on Financials):** Financial calculations, interest rates, and subsidy percentages must be computed strictly via deterministic Python modules, never directly by an LLM prompt.
- **NFR-02 (Low Bandwidth & Offline Grace):** PWA must support offline caching of questionnaire forms; WhatsApp bot must handle audio compressed over 2G/3G connections.
- **NFR-03 (Dialect Robustness):** Speech pipeline must achieve high transcription accuracy for colloquial rural speech patterns.

