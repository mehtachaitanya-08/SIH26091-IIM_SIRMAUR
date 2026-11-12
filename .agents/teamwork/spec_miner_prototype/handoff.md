# Specification Mining Report: Prototype & Requirements Specification

**Agent**: Specification Miner (Prototype & Requirements)  
**State Folder**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\spec_miner_prototype\`  
**Target Milestone**: Video Specification Extraction & Platform Grounding (SIH26091 — MoSJE / NSFDC)  
**Timestamp**: 2026-11-09T22:07:00Z  

---

## 1. Observation

Direct examination of authoritative workspace sources yielded exact parameters, formulas, schemas, and design contracts:

### 1.1 Authoritative Sources Inspected
- `interactive_platform_prototype.html` (66,374 bytes, 1,305 lines): Complete working reference implementation of the 6-scene landing page and SETO minimal mockup dashboard.
- `data/dossiers_db.json` (466,531 bytes, 24 dossiers): Authoritative empirical taxonomy of 24 Scheduled Caste micro-enterprise trades across 9 sectoral baskets, with capex tiers, unit economics, and seasonal cash flow weights.
- `engine/nsfdc_calculator.py` (533 lines) & `frontend/src/engine.js` (667 lines): Deterministic financial algorithms for NSFDC dual-tier credit structuring, quarterly EQI amortization, 12-month solvency stress-testing, and Mode B moneylender debt refinancing.
- `generate_1page_dpr_pdf.py` (16,226 bytes): RBI Lead Bank Scheme (1969) compliant 1-Page Detailed Project Appraisal Report (DPR) structure with QR hash verification.
- `data/target_site_dump.html` & `data/target_site.css`: Original Walton Family Foundation design system, typography, and layout structure.

### 1.2 Exact Design System & Tokens (from `interactive_platform_prototype.html` lines 24–52, 104–138)
- **Palette**:
  - `waltonGround`: `#F4F1EA` (Light cream background)
  - `waltonWarm`: `#F8F6F0` (Warm card/section background)
  - `waltonInk`: `#111311` (Deep dark slate/charcoal text & accent)
  - `waltonMuted`: `#686D65` (Muted olive-gray secondary text)
  - `dashBg`: `#D4D8DD` (Diffused outer ambient canvas)
  - `dashCard`: `#FFFFFF` (White dashboard container shell)
  - `dashSidebar`: `#F8F9FA` (Off-white navigation rail)
  - `dashBorder`: `#E9ECEF` (Border separator)
  - `accentCoral`: `#E86043` (Primary brand accent, chip & star gradient)
  - `concessionalEmerald`: `#0E7A53` (Statutory concessional verified green)
  - `oliveChip`: `#5A7352` (Accent chip)
  - `ochreChip`: `#D49B5A` (Accent chip)
  - `slateChip`: `#4A6274` (Accent chip)
- **Diffused Backdrop Formula**:
  ```css
  background: radial-gradient(circle at 18% 22%, rgba(205, 220, 235, 0.65) 0%, transparent 45%),
              radial-gradient(circle at 82% 80%, rgba(245, 185, 160, 0.5) 0%, transparent 45%),
              #D4D8DD;
  ```
- **Typography**:
  - `display`: Cinzel (600, 700, 800, 900)
  - `serif`: Instrument Serif (regular, italic)
  - `sans`: Plus Jakarta Sans (400, 500, 600, 700, 800)
  - `dashboard`: Inter Tight (400, 500, 600, 700)
  - `mono`: Space Grotesk (400, 500, 600, 700)

### 1.3 Persistent Navigation & Ambient Controls (lines 146–192)
- **Right Capsule Progress Indicator**:
  - Position: `fixed; right: 28px; top: 50%; transform: translateY(-50%); z-index: 60;`
  - Style: `background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(12px); border-radius: 9999px; padding: 12px 7px;`
  - Items: Top hamburger icon `☰` (text-[10px] text-waltonMuted font-bold) + 5 indicators.
  - Active indicator: `capsule-pill-indicator` (width: 5px, height: 18px, bg: `#111311`).
  - Inactive indicator: `capsule-dot` (width: 4px, height: 4px, bg: `#A0A59D`).
  - Scroll mapping across 5 milestones: Hero, Thesis, Orbit, Immersive, Dashboard.
- **Top Header**:
  - Position: `fixed top-0 left-0 right-0 z-50 py-5 px-8`
  - Left Badge: `MoSJE · NSFDC · SIH26091` (font-mono uppercase text-xs bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-black/5).
  - Center Emblem: Circle 32x32 bg-waltonInk text-white `ग` (Gramin Emblem) with 4 colored dots underneath (`#E86043`, `#0E7A53`, `#D49B5A`, `#4A6274`).
  - Right Buttons: `Dashboard ↗` pill (bg-white/80) + circular hamburger button `=` (w-9 h-9 bg-white).

### 1.4 Detailed Scene-by-Scene Extraction

#### Scene 1: The Pinned Hero Dispersion (lines 199–261, 853–878)
- **Container**: `#hero-pinned-scene` (relative w-full h-screen overflow-hidden flex items-center justify-center bg-waltonGround).
- **GSAP ScrollTrigger**:
  - Trigger: `#hero-pinned-scene`, start: `top top`, end: `+=120%`, pin: `true`, scrub: `1.2`.
- **Headline**:
  - Text: 4 lines: `WHERE` / `OPPORTUNITY` / `TAKES` / `ROOT` in Cinzel / Instrument Serif.
  - Style: `font-size: clamp(3.2rem, 11.5vw, 12rem); line-height: 0.88; letter-spacing: -0.04em; font-bold uppercase text-waltonInk`.
  - Motion: Scales from 0.96 to 1.04, then fades to opacity 0.15 with y: -60.
- **Layered Photo Cards Cluster**:
  - Central Card: Ramesh Kumar & rural partner shaking hands (340px / 440px by 250px / 310px, rounded-2xl, shadow-2xl, border-4 border-white/90). Badge at bottom: `Ramesh Kumar (D08)` | `NSFDC Term Loan Verified` (text-concessionalEmerald).
    - Motion: scales down to 0.65, y: -40, opacity: 0.
  - Satellite 1 (Top Right, Mustard fields): w-24 sm:w-36 h-20 sm:h-28. Disperses to `x: 260, y: -180, scale: 0.4, opacity: 0`.
  - Satellite 2 (Bottom Left, Sunita Devi Tailoring): w-32 sm:w-48 h-24 sm:h-36. Disperses to `x: -280, y: 160, scale: 0.4, opacity: 0`.
  - Satellite 3 (Bottom Right, Manoj Paswan Garage): w-28 sm:w-44 h-24 sm:h-32. Disperses to `x: 300, y: 180, scale: 0.4, opacity: 0`.
  - Satellite 4 (Top Left, Village fisheries/aquaculture): w-28 sm:w-40 h-20 sm:h-28. Disperses to `x: -240, y: -160, scale: 0.4, opacity: 0`.
  - Color Chips: Ochre (top 40% right 25%, to `x: 140, y: -100`), Olive (bottom 36% left 25%, to `x: -140, y: 100`), Slate (top 50% left 20px, to `x: -180`).
- **Scroll Hint**: `SCROLL TO EXPLORE` with down bouncing arrow `↓` (font-mono text-[11px] text-waltonMuted).

#### Scene 2: Thesis & Vertical Line Drop (lines 265–291, 880–892)
- **Container**: `#scene-thesis` (min-h-screen py-32 px-6 sm:px-10 flex flex-col items-center justify-center bg-waltonWarm relative).
- **Vertical Line Drop Animation**:
  - Geometry: `w-[1.5px] h-28 bg-waltonInk relative origin-top`. Terminal dot: `w-2.5 h-2.5 (10px) rounded-full bg-waltonInk absolute -bottom-1 -left-[4.5px]`.
  - GSAP: `scaleY: 0` to `1` over `1.2s`, ease: `power2.out`, triggered at `top 65%`.
- **Chapter**: `[ 01 ]` (text-xs font-mono uppercase text-waltonMuted font-bold tracking-widest mb-4).
- **Thesis Headline**: "Statutory credit enables rural producers to fulfill their highest potential." (font-serif text-3xl sm:text-5xl lg:text-6xl text-center text-waltonInk max-w-3xl leading-[1.15]).
- **Subtext**: "To break the cycle of predatory 36% moneylender interest and build intergenerational wealth. Commissioned under the Ministry of Social Justice and Empowerment for Scheduled Caste micro-entrepreneurs across 24 core domains." (font-sans text-sm sm:text-base text-waltonMuted text-center max-w-xl mt-6 leading-relaxed).

#### Scene 3: The Floating Orbit / Vortex (lines 294–361, 895–925)
- **Container**: `#scene-orbit` (relative w-full h-[180vh] bg-waltonGround).
- **Pinned Wrap**: `#orbit-pinned-wrap` (sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center px-4).
- **GSAP ScrollTrigger**: trigger: `#scene-orbit`, start: `top top`, end: `+=150%`, pin: `#orbit-pinned-wrap`, scrub: `1.4`.
- **Central Narrative**:
  - Indicator: `[ 02 ]` (font-mono uppercase text-waltonMuted font-bold tracking-widest).
  - Headline: "What does opportunity mean today?" (font-serif italic text-4xl sm:text-6xl text-waltonInk leading-tight).
  - Subtext: "It means access to 6.5% institutional loans instead of 3-senkda sahukars, 12-month solvency stress testing, and instant bank-sanction DPRs." (text-xs sm:text-sm text-waltonMuted mt-4 max-w-md mx-auto leading-relaxed).
- **Orbiting Ring Constellation**:
  - 8 photo tiles flying inward into a circular ring:
    - Tile 1 (Top Center): `translate-y-[-16rem]`, 96x96 rounded-xl (oil expeller).
    - Tile 2 (Top Right): `translate-x-[13rem] translate-y-[-12rem]`, 80x80 rounded-xl (farmland).
    - Tile 3 (Right): `translate-x-[18rem]`, 112x80 rounded-xl (tailoring workshop).
    - Tile 4 (Bottom Right): `translate-x-[14rem] translate-y-[12rem]`, 96x96 rounded-xl (mechanical repairs).
    - Tile 5 (Bottom Center): `translate-y-[16rem]`, 112x80 rounded-xl (rural artisan).
    - Tile 6 (Bottom Left): `translate-x-[-14rem] translate-y-[12rem]`, 80x80 rounded-xl (entrepreneur).
    - Tile 7 (Left): `translate-x-[-18rem]`, 96x96 rounded-xl (village store).
    - Tile 8 (Top Left): `translate-x-[-13rem] translate-y-[-12rem]`, 80x80 rounded-xl (agro trade).
  - 4 Color chips in orbit: Ochre (-7rem, -16rem), Coral (8rem, -16rem), Olive (16rem, 4rem), Slate (-16rem, 4rem).
  - Motion: Tiles fly inward from `scale: 0.2, opacity: 0` (stagger 0.05), text fades in (`opacity: 0, scale: 0.85` to `1`), and entire ring rotates `45deg` on scrub.

#### Scene 4: Full-Bleed Immersion & Radial Arc Gauge (lines 365–425, 927–937)
- **Container**: `#scene-immersive` (relative w-full h-screen overflow-hidden flex flex-col justify-between p-8 sm:p-14 bg-black text-white).
- **Backdrop**: Full-bleed high-res rural harvest photo with `filter brightness-[0.6] contrast-[1.1]` and gradient `from-black/90 via-black/30 to-black/40`.
- **Top Breadcrumb**:
  - Left: `02 / 04 · STATUTORY SOLVENCY RATING` (text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold).
  - Right: `SIH26091 VERIFIED` (text-xs font-mono text-white/60).
- **Radial Arc Gauge (Exact Mathematical Formula)**:
  - SVG: `viewBox="0 0 100 100"` with `-rotate-90` transform.
  - Geometry: Circle `cx="50" cy="50" r="45"`.
  - Circumference = $2 \times \pi \times 45 = 282.74$ (standardized to `stroke-dasharray: 283`).
  - At 67% arc fill: `stroke-dashoffset = 283 * (1 - 0.67) = 93.39` (standardized to `93`).
  - Animated on ScrollTrigger enter (`start: "top 50%"`): from `283` to `93` with `transition: stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)`. On `onLeaveBack`, resets to `283`.
  - Center Percentage Badge: 56px (w-14 h-14) amber pill `bg-yellow-400 text-slate-950 font-bold text-xs font-mono shadow-xl flex items-center justify-center` displaying `67%`.
  - Terminal Dot on Arc: `top-2 w-3 h-3 rounded-full bg-white shadow-lg`.
- **Bottom Copy & Action Button**:
  - Heading: `67% of rural producers` (text-3xl sm:text-5xl font-sans font-bold text-yellow-400 tracking-tight leading-none).
  - Subtext: `struggle with informal debt traps before accessing structured Lead-Bank facilities.` (text-sm sm:text-base text-white/85 mt-2 font-serif italic).
  - Action Pill: `02 / 04 | OPEN DASHBOARD ↗` (px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-3 shadow-2xl hover:bg-slate-100 transition-all).

#### Scene 5: Platform in 4 Pillars (lines 429–496)
- **Container**: `#scene-cards` (py-24 px-6 sm:px-12 max-w-7xl mx-auto).
- **Header**: `[ 03 ] · CORE MODULES`, `The Four Pillars.`, "Fitting all 24 empirical domains and statutory NSFDC rules into a unified advisory platform."
- **4 Cards Specification**:
  1. **Pillar 01: NSFDC Dual-Tier Credit**
     - Description: Statutory micro credit (≤ ₹1.40L @ 6.5% with 11 quarters) and term loans (up to ₹50L @ 8.0% with 26 quarters).
     - Footer: `₹1,40,000 → ₹1,25,000 Loan + ₹15k Equity` (concessionalEmerald).
  2. **Pillar 02: 12-Month Solvency Simulator**
     - Description: August monsoon lean-month stress testing across 24 empirical trade domains.
     - Footer: `Annual DSCR ≥ 1.50 Guaranteed` (waltonInk).
  3. **Pillar 03: Mode B Debt Liberation**
     - Description: Consolidating informal 3-senkda (36% APR) sahukar debt into low-cost institutional banking.
     - Footer: `Damdupat & Usurious Loans Relief` (accentCoral).
  4. **Pillar 04: 1-Page Lead-Bank DPR**
     - Description: Single-page bank sanction proposal conforming to RBI Lead Bank Scheme standards with QR verification.
     - Footer: `Instant PDF Sanction Proposal Export` (concessionalEmerald).

#### Scene 6: The SETO Minimal Dashboard Mockup (lines 500–823)
- **Container**: `#dashboard-section` (py-16 px-4 sm:px-8 max-w-[1500px] mx-auto).
- **Header**: `[ 04 ] · OPERATIONAL CORE`, `The Entrepreneur Workspace`, "Exact visual reproduction of your SETO minimal dashboard reference."
- **Outer Canvas**: `diffused-backdrop rounded-[38px] p-4 sm:p-7 soft-shadow`.
- **Inner 3-Column Card**: `bg-dashCard rounded-[28px] overflow-hidden soft-card-shadow grid grid-cols-1 lg:grid-cols-12 min-h-[760px] font-dashboard`.
- **Left Navigation Rail (lg:col-span-3)**:
  - Brand Lockup: `✦ UdyamSetuAI` (w-7 h-7 rounded-lg bg-waltonInk text-white flex items-center justify-center font-bold text-xs `✦`).
  - Nav Tabs:
    - `🏠 Home` (active pill: bg-white text-waltonInk font-semibold soft-card-shadow)
    - `⚙️ Enterprise Studio` (triggers simulator tab)
    - `📉 NSFDC Amortizer` (triggers amortizer tab)
    - `⚖️ Debt Liberation` (triggers restructure tab)
    - `📄 1-Page DPR` (triggers DPR tab)
    - `🔔 Notifications` (badge `8`)
    - `⚙️ Settings`
  - Collapsible Sub-Tree: `Advisory Tools ^`:
    - `🌾 D08 Mustard Oil Mill`
    - `🧵 D18 Tailoring Workshop`
    - `🔧 D15 Tractor Garage`
  - Bottom User Card:
    - Container: `bg-slate-200/80 rounded-2xl p-3.5 space-y-3 soft-inner-shadow`.
    - Avatar image + "Ramesh Kumar" (font-bold text-xs text-waltonInk) + "SC · Income ≤ ₹5.00L" (font-mono text-[10px] text-waltonMuted).
    - Pill Button: `✦ Statutory Verified` (bg-white text-waltonInk font-bold text-xs flex items-center justify-center space-x-1.5 soft-card-shadow, icon in concessionalEmerald).
- **Center Workspace (lg:col-span-6)**:
  - 4-Pointed Iridescent Star SVG Blossom:
    - Geometry: `viewBox="0 0 100 100"`, width/height: 58px.
    - Path: `d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"`.
    - Radial Gradient: Stop 0% `#FFE4D6`, Stop 45% `#E86043`, Stop 75% `#8B5CF6`, Stop 100% `#F59E0B`.
    - Central white glow circle `cx="50" cy="50" r="10"` fill `#FFFFFF` opacity 0.85 filter `blur(2px)`.
    - Drop shadows: `drop-shadow(0 4px 14px rgba(232, 96, 67, 0.3)) drop-shadow(0 2px 8px rgba(139, 92, 246, 0.25))`.
    - Animation: Keyframes `pulseStar` (5s ease-in-out infinite, scale 1 to 1.06, rotate 0 to 3deg).
  - Greeting: "Welcome, Ramesh!" (text-3xl sm:text-4xl font-bold font-sans text-waltonInk), Subtext: "How can I help structure your rural enterprise today?"
  - 3 Quick Action Cards:
    1. `⭐ Simulate enterprise`: Test 12-month seasonality & August lean-month cash flows.
    2. `✏️ NSFDC amortizer`: Calculate 11 or 26 quarterly instalments at 6.5% / 8.0%.
    3. `🎨 Debt liberation`: Refinance 3-senkda moneylender debt into bank credit.
  - Interactive Mockup Viewports (injected dynamically):
    - Simulator: Project Cost ₹6,80,000, Annual NOCF ₹2,84,400, 12-month bar chart with August lean trough highlight (weights: [1.3, 1.2, 1.0, 0.7, 0.6, 0.8, 1.1, 1.3, 1.4, 1.3, 1.2, 1.1]), Solvency Rating SAFE (DSCR 1.62).
    - Amortizer: Sanction Loan ₹6,12,000, Promoter Margin ₹68,000, EQI ₹30,420, Quarterly table showing Q1-Q2 Moratorium (Interest-only ₹12,240), Q3-Q5 Amortizing (₹30,420).
    - Debt Liberation: Principal slider (₹20,000 to ₹3,00,000, default ₹1,20,000), Dialectal Quote dropdown (2, 3, 4, 5 senkda), Current monthly bleed (₹3,600/mo), New NSFDC 6.5% EMI (₹1,140/mo), Net relief (+₹2,460/month).
    - DPR View: Enterprise Name, Beneficiary (Ramesh Kumar SC Verified), Sanction Loan ₹6,12,000 @ 8.0%, Lead-Bank QR Hash (`SHA256: 290bfbc...mosje_nsfdc`), and Download PDF action.
  - Floating Bottom Command Bar:
    - Input: `Initiate a query or send a command to the AI...`
    - Action pills: `📎 Lead-Bank DPR`, `⚙️ Quarterly EQI`, `🌐 Options` (language toggle).
    - Mic button: `🎤` (Bhashini multilingual audio indicator).
    - Submit arrow button: `↑` (w-8 h-8 rounded-full bg-waltonInk text-white font-bold flex items-center justify-center).
- **Right Panel (lg:col-span-3)**:
  - Header: "Recent scenarios", refresh icon `🖼️`.
  - Search: "Search..." input with search icon `🔍`.
  - History Cards:
    1. `D08 Mustard Oil Mill`: ₹6.80L Term Loan · 26 Qtrs, avatars [R, B], 2h ago, checked checkbox.
    2. `D18 Tailoring Workshop`: PM Vishwakarma 5% credit..., image preview thumbnail, avatar [S], 3h ago, checkbox.
    3. `Sahukar Debt Relief`: ₹1.20L @ 3 senkda → 6.5%, "+₹2,460/mo relief", 5h ago, checkbox.
  - Bottom Action: `Create new simulation +` (rounded-full bg-waltonInk text-white font-bold text-xs py-3 w-full).

### 1.5 Statutory Credit Definitions & Formulas (from `engine/nsfdc_calculator.py` & `frontend/src/engine.js`)
- **Eligibility Gates**:
  - Community: Scheduled Caste (SC) with valid caste certificate under MoSJE mandate.
  - Income Ceiling: Annual family income $\le ₹5,00,000$ (effective 07 January 2026).
  - Project Boundary: Maximum project cost $₹50,00,000$.
- **Dual-Tier Scheme Parameters**:
  - **Tier 1: Micro Credit Finance (MCF / Mahila Samriddhi Yojana)**:
    - Project Cost: Up to $₹1,40,000$
    - Loan Share: Up to 90%, hard capped at $₹1,25,000$
    - Promoter Equity at Cap: $₹15,000$ ($10.71\%$ equity, strictly enforcing the gap between $₹1.40\text{L}$ and $₹1.25\text{L}$)
    - Interest Rate: $6.5\%$ p.a.
    - Tenure: 3 years (12 quarters)
    - Moratorium: 1 quarter (3 months) interest-only payment
    - Repayment Quarters: 11 quarterly instalments
  - **Tier 2: Term Loan Scheme**:
    - Project Cost: Above $₹1,40,000$ up to $₹50,00,000$
    - Loan Share: Up to 90%, hard capped at $₹45,00,000$
    - Promoter Equity: Minimum $10\%$
    - Interest Rate: $8.0\%$ p.a.
    - Tenure: 7 years (28 quarters)
    - Moratorium: 2 quarters (6 months) interest-only payment
    - Repayment Quarters: 26 quarterly instalments
- **Amortization Formulas**:
  - Quarterly interest rate: $r = \frac{\text{rate\_pa}}{100 \times 4}$
  - Equated Quarterly Instalment (EQI):
    $$\text{EQI} = P \times \frac{r (1 + r)^n}{(1 + r)^n - 1}$$
    where $P = \text{loan amount}$, $n = \text{repayment quarters}$ (11 for MCF, 26 for Term Loan).
  - Moratorium Quarters ($q \le \text{moratorium\_quarters}$):
    $$\text{Principal Payment} = 0, \quad \text{Interest Payment} = P \times r, \quad \text{Closing Balance} = P$$
- **12-Month Solvency & Lean-Month Stress Test**:
  - August Monsoon Trough: Historical lowest cash flow month for agricultural and artisanal trades (multiplier $0.5 - 0.7$).
  - Net Operating Cash Flow: $\text{NOCF}_m = \text{Revenue}_m - \text{OpEx}_m$
  - Debt Service Coverage Ratio:
    $$\text{DSCR}_m = \frac{\text{NOCF}_m}{\text{Monthly EMI Equiv}}$$
    Benchmark: Annual average $\text{DSCR} \ge 1.50$ (High Feasibility / Bankable), worst lean-month buffer $\text{DSCR} \ge 1.20$.
- **Mode B Moneylender Refinancing & Damdupat Legal Rule**:
  - Vernacular Quote Parsing: "$X\text{ senkda}$" means $X\%$ per month $\implies \text{APR} = X \times 12\%$.
    - 2 senkda = $24\%$ APR
    - 3 senkda = $36\%$ APR
    - 4 senkda = $48\%$ APR
    - 5 senkda = $60\%$ APR
  - Current Monthly Interest Bleed: $\text{Bleed} = P \times \frac{\text{APR}}{1200}$
  - Damdupat Rule: Codified under State Money-Lenders Acts and Usurious Loans Act 1918. Total interest recovered cannot exceed the original principal ($P$). If $\text{Total Paid} \ge P$, further interest recovery is legally void.
  - Cash Flow Relief: $\Delta = \text{Bleed} - \text{EMI}_{\text{formal 6.5\%}}$

### 1.6 Dossiers Database Schema (`data/dossiers_db.json`)
The database contains 24 micro-enterprise dossiers grouped into 9 sectoral baskets:
1. `Rural Retail, Haat & Small-Scale Distribution`: D01 (Kirana Store), D02 (Haat Vendor), D03 (Electronics & CSC Kiosk)
2. `Agri-Inputs, Seed & Fertiliser Stores`: D04 (Certified Seeds), D05 (Animal Feed), D06 (Drip Irrigation)
3. `Food Milling, Processing & Local Packaging`: D07 (Atta Chakki & Dal Mill), D08 (Mustard & Edible Oil Expeller), D09 (Spice Grinding), D10 (Solar Dehydration)
4. `Dairy, Livestock, Poultry & Fisheries`: D11 (Dairy Husbandry), D12 (Goat & Sheep Meat), D13 (Poultry Farming), D14 (Inland Aquaculture)
5. `Machinery Workshop, Vehicle & Pump Repair`: D15 (Tractor Garage), D16 (Motor Rewinding), D17 (Auto & EV Workshop)
6. `Apparel, Tailoring & Handcrafted Goods`: D18 (Tailoring & Garments), D19 (Carpentry), D20 (Metal Smithy), D21 (Pottery)
7. `Rural Construction, Clay & Fly-Ash Bricks`: D22 (Fly-Ash Bricks)
8. `Bio-Waste, Organic Composting & Circular Economy`: D23 (Commercial Vermicomposting)
9. `Rural Logistics, Freight & Custom Hiring`: D24 (Rural Freight & Custom Hiring Fleet)

---

## 2. Logic Chain

1. **Mapping Walton Family Foundation Architecture to UdyamSetuAI**:
   - The Walton reference site (`opportunity.waltonfamilyfoundation.org`) uses a 4-line condensed serif hero headline with dispersing image cards, vertical chapter drop lines, an orbital vortex of circular image tiles, and a circular radial arc gauge (animating to 67%) over full-bleed photography.
   - `interactive_platform_prototype.html` adapts this visual language specifically for SIH26091 (MoSJE / NSFDC): replacing generic American themes with rural Scheduled Caste entrepreneurship, statutory 6.5%/8.0% credit, August monsoon lean-month stress testing, and the SETO minimal dashboard layout.

2. **Replication of SETO Dashboard Design**:
   - The user provided a specific SETO dashboard design: diffused `#D4D8DD` ambient background with warm peach/slate gradients, rounded white container (`rounded-[28px]`), left navigation rail with brand lockup `✦ UdyamSetuAI` and user profile card (`Ramesh Kumar`, `SC · Income ≤ ₹5.00L`, `✦ Statutory Verified`), center workspace with 4-pointed iridescent star SVG blossom, 3 action cards, command input bar, and right sidebar with recent scenarios and search.
   - All interactive elements must remain strictly client-side mockups without requiring unbuilt backend microservices, fulfilling acceptance criteria while preserving complete visual fidelity.

3. **Statutory Integrity**:
   - Loan math must conform to zero-hallucination rules: MCF has a hard $₹1,25,000$ loan cap at $₹1,40,000$ cost (promoter equity is exactly $₹15,000$ or $10.71\%$, NOT $10\%$). Term loan has a 90% cap up to $₹45,00,000$ at $8.0\%$. Moratoriums must be respected (1 quarter for MCF, 2 quarters for Term Loan).
   - Seasonality must specifically highlight the August lean-month trough across agricultural and artisanal trade dossiers.

---

## 3. Caveats

- **Mockup Scope**: In Scene 6, the SETO dashboard is strictly an interactive mockup. It does not initiate actual API calls to Bhashini speech microservices or generate live ReportLab PDF binaries on the server; instead, it uses client-side state transitions, browser alerts, and simulated modal views.
- **Frontend Dependencies**: `frontend/package.json` currently has `lucide-react`, `react`, and `react-dom`. Implementing the 6-scene landing page with GSAP ScrollTrigger and Lenis smooth scrolling will require adding `gsap`, `lenis` (or `@studio-freight/lenis`), and installing/configuring Tailwind CSS properly in `frontend/`.
- **Image Assets**: The prototype currently uses Unsplash URLs with specific query parameters. For production, high-refinement photography of real rural Scheduled Caste artisans, handloom weavers, and agri-entrepreneurs must either be hosted locally in `frontend/public/` or bundled as static assets.

---

## 4. Conclusion

All prototype elements, copy, styling, statutory credit parameters, dossier models, and scene requirements have been extracted into exact specifications. The UI planning and implementation teams can execute the production landing page and mockup dashboard in `frontend/src/` with zero ambiguity.

---

## 5. Verification Method

To independently verify the extracted specifications:
1. **Prototype Inspection**:
   - Open `interactive_platform_prototype.html` in a web browser.
   - Verify Scene 1 hero dispersion on scroll scrub.
   - Verify Scene 2 vertical line drop and chapter `[ 01 ]`.
   - Verify Scene 3 orbital photo ring rotation around `[ 02 ]`.
   - Verify Scene 4 full-bleed background and 67% arc gauge animation (stroke-dashoffset 93 on 283 circumference).
   - Verify Scene 5 platform 4 pillars.
   - Verify Scene 6 SETO dashboard: click tabs (`Home`, `Enterprise Studio`, `NSFDC Amortizer`, `Debt Liberation`, `1-Page DPR`), enter text into command bar, and inspect `Ramesh Kumar` user card.
2. **Deterministic Financial Verification**:
   - Run Python command:
     ```powershell
     python -c "from engine.nsfdc_calculator import NSFDCCalculator, BeneficiaryProfile; c = NSFDCCalculator(); s = c.calculate_loan_structure(BeneficiaryProfile(project_cost=140000)); print('MCF Loan:', s.loan_amount, 'Equity:', s.promoter_equity); s2 = c.calculate_loan_structure(BeneficiaryProfile(project_cost=680000)); print('Term Loan:', s2.loan_amount, 'Equity:', s2.promoter_equity)"
     ```
   - Expected Output:
     `MCF Loan: 125000.0 Equity: 15000.0`
     `Term Loan: 612000.0 Equity: 68000.0`
3. **Dossier Database Integrity**:
   - Run Python command:
     ```powershell
     python -c "import json; db = json.load(open('data/dossiers_db.json', encoding='utf-8')); print('Total dossiers:', len(db['dossiers'])); print('D08:', db['dossiers']['D08']['short_name'])"
     ```
   - Expected Output: `Total dossiers: 24`, `D08: D08`

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Persistent Capsule Navigator | Floating right pill on desktop displaying scroll progress and section indicators | Scroll position (Sections 1–5) | Active pill (18px) or dot (4px) | Graceful fallback if DOM missing | `interactive_platform_prototype.html` lines 65–95, 146–154 |
| 2 | Navigation | Minimal Top Header | Fixed header with MoSJE badge, 'ग' emblem with 4 color dots, Dashboard jump | Click on logo or Dashboard button | Smooth scroll to top or dashboard | None (standard DOM scroll) | `interactive_platform_prototype.html` lines 159–192 |
| 3 | Scene 1 | Pinned Hero Dispersion | 4-line serif headline (`WHERE OPPORTUNITY TAKES ROOT`) overlaid with 5 photo cards & 3 color chips | Scroll scrub (GSAP ScrollTrigger pin) | Central card scales down; satellites disperse to 4 corners; headline scales 0.96→1.04 | Handled by scrub timeline | `interactive_platform_prototype.html` lines 199–261, 853–878 |
| 4 | Scene 2 | Vertical Line Drop | Animated 1.5px vertical line dropping 112px with terminal dot unlocking `[ 01 ]` and thesis | Scroll trigger at 65% viewport | Line draws downward via `scaleY: 1`, revealing statutory credit thesis | Reverse animation on scroll up | `interactive_platform_prototype.html` lines 265–291, 880–892 |
| 5 | Scene 3 | Pinned Orbital Vortex | 8 photo tiles & 4 color chips flying inward to form an orbiting circular constellation around `[ 02 ]` | Scroll scrub (GSAP ScrollTrigger pin) | Tiles scale up from 0.2 to 1.0; constellation rotates 45° | Pinned scrub over 180vh container | `interactive_platform_prototype.html` lines 294–361, 895–925 |
| 6 | Scene 4 | Radial Arc Solvency Gauge | Glowing circular SVG radial arc animating from offset 283 to 93 (67%) with amber badge | ScrollTrigger enter at top 50% | Circle stroke draws to 67%; 56px amber badge shows 67%; action pill `02 / 04 OPEN DASHBOARD ↗` | Resets to 283 on leave back | `interactive_platform_prototype.html` lines 365–425, 927–937 |
| 7 | Scene 5 | Four Platform Pillars | 4 clean cards detailing NSFDC Credit, 12-Mo Simulator, Mode B Debt Liberation, and 1-Page DPR | Grid display | Pillar headers, descriptions, and statutory metric footers | Responsive wrap from 4 cols to 1 col | `interactive_platform_prototype.html` lines 429–496 |
| 8 | Scene 6 | SETO Dashboard Container | Diffused ambient canvas (`#D4D8DD` with radial gradients) housing rounded white 3-column card (`rounded-[28px]`) | Section render | Neumorphic soft-shadowed 3-column operational layout | Responsive stacking on mobile | `interactive_platform_prototype.html` lines 500–522 |
| 9 | Scene 6 | SETO Left Rail & User Card | Left nav rail with `✦ UdyamSetuAI` lockup, active white nav pill, collapsible `Advisory Tools ^`, and Ramesh Kumar card | Click nav tab or domain preset | Switches active tab or preset; shows Ramesh Kumar (SC · Income ≤ ₹5.00L · Verified) | Default to Home tab | `interactive_platform_prototype.html` lines 522–613 |
| 10 | Scene 6 | Iridescent Blossom & Workspace | 4-pointed SVG star with multicolor radial gradient (#FFE4D6→#E86043→#8B5CF6→#F59E0B) pulsing above greeting | Active tab state | Star blossom glow, "Welcome, Ramesh!", 3 quick action cards, or active module viewport | Fallback to home view | `interactive_platform_prototype.html` lines 619–677 |
| 11 | Scene 6 | Dynamic Solvency Simulator View | In-dashboard enterprise simulator with Project Cost, NOCF, and 12-month bar chart with August lean trough | Select simulator tab or D08/D18/D15 | Displays seasonal multipliers, orange bars for lean months, DSCR safe rating | Validates project cost > 0 | `interactive_platform_prototype.html` lines 1031–1075 |
| 12 | Scene 6 | Dynamic Amortizer View | In-dashboard quarterly repayment schedule showing moratorium quarters and EQI | Select amortizer tab | Loan sanction, promoter margin, EQI, and 5-quarter preview table with moratorium highlight | Validates loan amount | `interactive_platform_prototype.html` lines 1078–1163 |
| 13 | Scene 6 | Dynamic Debt Liberation View | In-dashboard moneylender refinance calculator with principal slider (₹20k–₹3L) & senkda quote select | Slider input / dropdown change | Real-time computation of monthly bleed, new 6.5% EMI, and net cash flow relief | Bounded slider ranges | `interactive_platform_prototype.html` lines 1165–1233 |
| 14 | Scene 6 | Dynamic 1-Page DPR View | Bank-ready sanction proposal conforming to RBI Lead Bank Scheme standards | Select DPR tab | Enterprise name, beneficiary, sanction loan, Lead-Bank SHA256 QR hash, download action | Displays mock verified certificate | `interactive_platform_prototype.html` lines 1235–1270 |
| 15 | Scene 6 | Floating Bottom Command Bar | Text input with prompt placeholder, action pills (`Lead-Bank DPR`, `Quarterly EQI`, `Options`), mic and submit | User text command or mic click | Natural language intent routing to simulator, amortizer, restructure, or DPR views | Alerts on unrecognized command and routes safely | `interactive_platform_prototype.html` lines 684–723, 1283–1301 |
| 16 | Scene 6 | SETO Right Sidebar & Scenarios | Right panel with search bar, refresh button, 3 recent scenario cards with avatars/thumbnails, and create button | Search input or card click | Filters/selects recent scenarios (D08 Oil Mill, D18 Tailoring, Sahukar Relief) | Safe click handlers | `interactive_platform_prototype.html` lines 730–819 |
| 17 | Core Engine | NSFDC Micro Credit Finance (MCF) | Statutory credit tier for micro-enterprises ≤ ₹1.40L cost, capped at ₹1.25L @ 6.5%, 11 repayment quarters | Project cost ≤ ₹1,40,000 | Loan ₹1.25L, Equity ₹15k (10.71%), 1 moratorium quarter, 11 quarterly EQIs | Rejects if cost > ₹1.40L (routes to Term Loan) | `engine/nsfdc_calculator.py` lines 102–108, 226–251 |
| 18 | Core Engine | NSFDC Term Loan Scheme | Concessional credit tier > ₹1.40L up to ₹50.00L, 90% loan capped at ₹45.00L @ 8.0%, 26 repayment quarters | Project cost ₹1,40,001–₹50,00,000 | 90% loan, min 10% equity, 2 moratorium quarters, 26 quarterly EQIs | Rejects if cost > ₹50.00L | `engine/nsfdc_calculator.py` lines 109–114, 252–277 |
| 19 | Core Engine | Statutory Eligibility Gate | Caste certificate check (SC) and family income ceiling check (≤ ₹5,00,000/year effective Jan 2026) | Beneficiary profile | Eligibility boolean, rejection reasons, and recommended alternative schemes (PMMY, PMEGP) | Clear statutory rejection feedback | `engine/nsfdc_calculator.py` lines 147–212 |
| 20 | Core Engine | Vernacular Quote & Damdupat Rule | Parses rural interest dialect ("3 senkda" = 36% APR) and applies ancient Damdupat interest cap | Dialectal quote, principal, tenure | Annual APR, monthly bleed, formal refinance savings, Damdupat violation flag | Defaults to 36% if quote unrecognized | `frontend/src/engine.js` lines 581–667 |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | NSFDC MCF Equity Calculation | Project cost = ₹1,40,000 | Loan is capped at ₹1,25,000. Promoter equity is ₹15,000 ($10.71\%$), NOT $10\%$ (₹14,000). System enforces the statutory cap correctly. |
| 2 | Statutory Family Income Gate | Income = ₹5,00,001 | Fails eligibility gate (exceeds ₹5,00,000 ceiling effective 07 Jan 2026). Generates formal rejection and redirects to PMEGP / Mudra schemes without income caps. |
| 3 | Non-SC Caste Category | Caste = "OBC" or "General" | Fails NSFDC eligibility gate. System returns specific statutory reasons and recommends PMMY (Mudra), PMEGP, or PM SVANidhi. |
| 4 | Radial Arc Gauge Circumference | Window resize or initial render | SVG uses normalized viewBox `0 0 100 100` and radius `r=45`. Stroke dasharray is fixed at `283`, avoiding viewBox scaling distortions. |
| 5 | Seasonality Lean Month Trough | August month ($m=5$ in April–March fiscal year) | Multiplier drops to $0.5 - 0.7$. Solvency chart highlights August bar in warning amber/orange (`< 0.8`), testing minimum DSCR buffer. |
| 6 | Dialectal Quote Parsing | "3 senkda" or "3 saikda" or "3 per 100/mo" | Parser extracts monthly integer `3` and multiplies by 12 to yield `36.0% APR`. Handles non-standard quotes with safe regex fallback. |
| 7 | Damdupat Violation Detection | Loan ₹1,00,000 active for 36 months at 3 senkda | Interest paid to date = ₹1,08,000, which exceeds original principal ₹1,00,000. System flags Damdupat violation under State Money-Lenders Acts. |
| 8 | Command Bar Natural Language Parsing | Unrecognized query (e.g. "how do I apply?") | System displays conversational notice and safely defaults to opening the Enterprise Simulator tab without crashing or throwing errors. |
| 9 | Mobile Responsiveness of 3-Column Shell | Viewport < 1024px (mobile / tablet) | `grid-cols-1 lg:grid-cols-12` causes left rail, center workspace, and right scenario panel to stack vertically, preventing layout breakage. |
| 10 | Lenis Smooth Scroll Pin Collision | Fast scroll scrub on pinned hero or orbit | `lenis.raf` synchronizes with `requestAnimationFrame` and ScrollTrigger updates smoothly without jitter, rubber-banding, or sticky traps. |
