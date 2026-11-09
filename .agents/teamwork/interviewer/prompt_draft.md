Ideate and plan the UI/UX architecture and design specifications for the SIH26091 platform (AI-Driven Hyper-Local Business Advisory & Financial Restructuring Platform for rural Scheduled Caste micro-entrepreneurs). This is a planning-only phase producing comprehensive UI/UX specifications, screen architectures, component hierarchies, design token systems, and user flows for a minimal, interactive, and alive public landing page and an extremely functional authenticated dashboard.

Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Integrity mode: development

## Requirements

### R1. Public Landing Page UI/UX Specification ("Nuvo Rural Split-Hero" Direction)
Plan and specify a minimal, interactive, alive, premium, and institutional public landing page introducing the mission, statutory schemes (NSFDC, PM Vishwakarma, PMEGP, PMMSY), 24 domain exploration preview (across 6 operational baskets: Agro-Processing, Rural Retail & Trade, Technical Services & Repair, Livestock & Allied Farming, Traditional Artisans/PM Vishwakarma, and Green Micro-Units), live mandi market pulse ticker, eligibility explainer, and registration / login gateway. The specification must define:
- Split-screen hero layout:
  - Left panel (~46% width): Tall rounded media panel featuring an atmospheric ambient living loop tailored to Rural Indian MSME/enterprise contexts, layered with floating translucent advisory/credit cards with soft depth (e.g., Total NSFDC Credit Limit ₹1,25,000 @ 6.5%, Lead-Bank DPR status, statutory margin ₹15,000 / 10.71%, Agmarknet spot price chip), subtle ambient floating particles, and bold typographic greeting.
  - Right column: Calm, warm off-white surface with high-end editorial typography mixing structured sans (Instrument Sans / Inter) with elegant serif italics for focal terms, tight-leading headline, concise lede, bold primary CTA with micro-interaction, and light footer trust facts (MoSJE / NSFDC mandate, Lead Bank Scheme compliance, ₹0 hidden fees).
- Information architecture for subsequent sections: 24-domain interactive browser by operational basket, statutory scheme comparison matrix, mandi price pulse ribbon, eligibility checker, and registration entry point.

### R2. Authenticated Dashboard UI/UX Specification ("Glass Iris AI Financial OS" Direction)
Plan and specify a deeply functional, minimal, and alive authenticated dashboard workspace for registered micro-entrepreneurs who have onboarded their enterprise idea. The specification must detail screen layouts, visual hierarchies, and interactive states for:
- Left navigation rail: Grouped modular tool tiles (Overview, 24-Domain Simulator, NSFDC Amortization, Mode B Debt Restructuring, 1-Page DPR Studio, Regulatory Checklist).
- Top utility bar: Breadcrumbs, active statutory scheme pill (e.g. "NSFDC MCF Active: 11 Quarters"), English / Hindi bilingual toggle, and live mandi price pulse.
- Central functional workspace & smart composer: Prompts for voice and quick actions (Stress test cash flows, refinance moneylender debt, generate QR-verified DPR, check Udyam/pollution compliance), accompanied by an interactive glowing AI advisory core / status orb.
- Analytical and operational modules:
  1. Enterprise Viability & Solvency Simulator: Quarterly cash flow projections, lean month stress testing, and interactive DSCR gauges.
  2. NSFDC Dual-Tier Credit & Debt Restructuring Engine: Full 11-quarter (Micro Credit Finance <= ₹1.40L @ 6.5%) and 26-quarter (Term Loan <= ₹50L @ 8.0%) amortization schedules, plus Mode B moneylender refinancing & cash flow liberation calculator.
  3. Statutory Scheme Matching & 1-Page Lead-Bank Ready DPR Generator: Preview layout, statutory subsidy/margin computation, and QR code verification block.
  4. Regulatory Compliance & Licensing Checklist: Step-by-step statutory progress tracking (Udyam, FSSAI, Pollution White Category, GST).

### R3. End-to-End User Flows & Navigation Architecture
Map the complete end-to-end user journeys with emphasis on user flows:
- Public visitor discovery -> 24-domain preview & scheme exploration -> Enterprise onboarding & registration gateway.
- Authenticated user workspace navigation -> Invoking smart composer actions, interacting with the solvency waterfall, adjusting debt restructuring parameters, generating DPRs, and reviewing compliance milestones.
- Contextual bilingual state transitions between English and Hindi across both landing page and dashboard views.

### R4. Design Tokens, Oxford Typography, and Component Hierarchy
Establish formal design token specifications (spacing scale, typography scale pairing structured sans with serif accents, warm off-white neutral surfaces, translucent glass layers with soft elevation, and status indicator palettes) and reusable component contracts adhering to Oxford interface design principles (clean, plain, polished, readable, uncluttered) and the "Glass Iris / Nuvo" design aesthetic.

## Acceptance Criteria

### Specification Completeness & Structure
- [ ] UI/UX planning document (`UI_UX_PLAN.md` or `UI-SPEC.md`) is created in the repository.
- [ ] Public Landing Page specification defines the split-screen hero layout (left media panel ~46% with floating credit cards, living ambient loop; right warm off-white editorial typography column) and all required public sections (mission, statutory schemes, 24 domains across 6 baskets, mandi ticker, eligibility explainer, registration gateway).
- [ ] Authenticated Dashboard specification defines the complete workspace architecture: left navigation rail, top utility bar with bilingual toggle and scheme status pill, central smart composer with glowing AI status orb, and all 4 core analytical tool modules.
- [ ] Simulator and restructuring specifications include layout definitions for the quarterly solvency waterfall, interactive DSCR gauges, 11/26 quarter amortization schedules, and Mode B moneylender debt refinancing calculator.
- [ ] 1-Page DPR Studio specification details the layout for single-page bank-ready export with QR verification.

### User Flow & Interaction Design
- [ ] End-to-end user flow diagrams/specifications document user transitions from landing page exploration through registration, onboarding, and dashboard tool execution.
- [ ] Bilingual (English / Hindi) interaction guidelines, typography handling, and layout responsiveness are explicitly defined.

### Design Tokens & Component Hierarchy
- [ ] Design token definitions specify font pairings (structured sans + serif italics), color tokens (warm off-white backgrounds, translucent card surfaces, glowing accents), spacing units, and elevation rules.
- [ ] Component contracts specify reusable UI elements (smart composer, navigation rail tiles, floating financial cards, metric gauges, and statutory status badges).

## Verification Resources
- Repository research and technical dossiers: `Deterministic_Financial_Engine_Spec.md`, `Mode_B_Debt_Restructuring_Refinancing_Engine_Dossier.md`, `Rural_MSME_Business_Taxonomy_Framework.md`, and `Regulatory_Compliance_Matrix.md`.
- Design direction references: "Nuvo freelance-banking split hero" (adapted for rural Indian MSME) and "Glass Iris AI Financial OS".
- Oxford interface guidelines (`oxfords`) and UI specification methodology (`gsd-ui-phase`).
