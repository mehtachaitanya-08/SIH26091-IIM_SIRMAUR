# Project: UdyamSetuAI Production Landing Page & SETO Minimal Mockup Dashboard

## Architecture
- **Framework**: Vite 6 + React 19 + Tailwind CSS + Lucide React + GSAP 3 (ScrollTrigger) + Lenis smooth scrolling.
- **Visual Design**: High-fashion editorial research publication (Walton Family Foundation) transitioning into SETO minimal diffused ambient dashboard canvas (`#D4D8DD`, `rounded-[28px]`, soft-neumorphic shadow).
- **Core Engine Integration**: Client-side financial intelligence powered by `frontend/src/engine.js` (NSFDC dual-tier credit, 12-month seasonality, Mode B debt refinancing, Lead-Bank DPR structure) in 100% parity with `engine/nsfdc_calculator.py`.
- **Media Asset Pipeline**: 16 high-refinement local photographic assets in `frontend/public/images/` representing real Scheduled Caste rural micro-entrepreneurs and harvest environments.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Editorial Typography System | Cinzel, Instrument Serif, Plus Jakarta Sans, Inter Tight, Space Grotesk via Google Fonts | M1 | survey |
| 2 | Package & Build Infrastructure | Vite, React 19, Lucide, GSAP + ScrollTrigger, Lenis, Tailwind build pipeline | M1 | survey |
| 3 | Local Photographic Asset Manifest | 16 high-refinement local images in `frontend/public/images/` (artisans, handloom, garage, agro, harvest) | M1 | survey |
| 4 | Persistent Capsule Progress Rail | Fixed right capsule indicator tracking 5 milestones with dynamic active pill | M1 | survey |
| 5 | Fixed Editorial Header Bar | Brand emblem `ग`, SIH26091 badge, Dashboard link, mobile hamburger | M1 | survey |
| 6 | Scene 1: Giant 4-Line Headline | `WHERE / OPPORTUNITY / TAKES / ROOT` in Cinzel / Instrument Serif | M1 | survey |
| 7 | Scene 1: Pinned Hero Card Dispersion | Central Ramesh card + 4 satellite cards + 3 color chips dispersing on scroll scrub | M1 | survey |
| 8 | Scene 2: Animated Vertical Line Drop | Thin 1.5px vertical line drawing downward with terminal dot to unlock chapter `[ 01 ]` | M1 | survey |
| 9 | Scene 2: Statutory Credit Thesis | High-contrast editorial thesis statement on statutory credit vs moneylender traps | M1 | survey |
| 10 | Scene 3: Pinned Orbital Vortex | Central `[ 02 ] What does opportunity mean today?` with 8 photo tiles & 4 chips flying into rotating ring | M1 | survey |
| 11 | Scene 4: Full-Bleed Harvest Immersion | Full-bleed panoramic rural harvest photography with contrast vignette | M1 | survey |
| 12 | Scene 4: Radial Arc Gauge Animation | SVG radial arc gauge (`r=45`, circumference 283) animating from 283 to 93 (67%) on scroll | M1 | survey |
| 13 | Scene 4: Metric Text & Action Pill | `67% of rural producers` headline and `02 / 04 OPEN DASHBOARD ↗` action pill | M1 | survey |
| 14 | Scene 5: Platform in 4 Pillars | 4 clean cards: NSFDC Dual-Tier, 12-Month Solvency, Mode B Debt Liberation, 1-Page DPR | M1 | survey |
| 15 | Scene 6: Diffused Ambient Canvas | `#D4D8DD` outer canvas with dual radial peach/slate gradients and `rounded-[38px]` | M1 | survey |
| 16 | Scene 6: 3-Column White Shell | Rounded white container (`rounded-[28px]`, `soft-card-shadow`) divided 3:6:3 | M1 | survey |
| 17 | Scene 6: Left Navigation Rail | `✦ UdyamSetuAI` lockup, active white pill, collapsible `Advisory Tools ^` tree with D08/D18/D15 | M1 | survey |
| 18 | Scene 6: Bottom User Profile Card | Ramesh Kumar (SC · Income ≤ ₹5.00L) with `✦ Statutory Verified` green badge | M1 | survey |
| 19 | Scene 6: Iridescent Star Blossom | 4-pointed SVG star with `@keyframes pulseStar` and peach/coral/violet/amber radial gradient | M1 | survey |
| 20 | Scene 6: Center Greeting & Action Cards | "Welcome, Ramesh!" with 3 quick cards (`Simulate enterprise`, `NSFDC amortizer`, `Debt liberation`) | M1 | survey |
| 21 | Scene 6: Interactive Mockup Viewports | Live viewports for seasonality chart, quarterly amortizer, debt refinancing slider, and DPR | M1 | survey |
| 22 | Scene 6: Floating Command Bar | Input bar with action pills (`📎 Lead-Bank DPR`, `⚙️ Quarterly EQI`), mic 🎤, and submit arrow | M1 | survey |
| 23 | Scene 6: Right Panel Scenario History | "Recent scenarios" list with D08 Mustard Mill, D18 Tailoring, search bar, and thumbnail preview | M1 | survey |
| 24 | Lenis Smooth Scrolling | Window-level smooth inertial scroll integrated with GSAP ScrollTrigger updates | M1 | survey |
| 25 | Production Build Verification | `npm run build` succeeds with exit code 0, zero bundling or missing asset errors | M1 | survey |
| 26 | Forensic Integrity Audit | Static analysis and asset verification confirming 0% dummy/mockup bypasses | M1 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Production Landing Page (Scenes 1–6) & SETO Minimal Dashboard | Setup package dependencies (gsap, lenis), integrate 16 high-refinement local assets, configure typography fonts, implement all 6 scenes + SETO dashboard in App.jsx and SetoDashboard.jsx, verify npm run build exit code 0 | survey | DONE (Build exit code 0, 34/34 tests pass, Forensic Audit CLEAN) |

## Code Layout
```
frontend/
├── index.html                    (Google Fonts: Cinzel, Instrument Serif, Plus Jakarta Sans, Inter Tight, Space Grotesk)
├── package.json                  (react, react-dom, lucide-react, gsap, lenis, vite)
├── vite.config.js
├── public/
│   ├── images/
│   │   ├── hero_center.jpg       (Ramesh Kumar & partner in agro workshop)
│   │   ├── hero_sat_1.jpg        (Aerial mustard fields)
│   │   ├── hero_sat_2.jpg        (Sunita Devi electric tailoring)
│   │   ├── hero_sat_3.jpg        (Manoj Paswan tractor repair)
│   │   ├── hero_sat_4.jpg        (Handloom weaving artisan)
│   │   ├── orbit_1.jpg – orbit_8.jpg (8 circular ring tiles)
│   │   ├── harvest_immersion.jpg (Full-bleed panoramic harvest sunset)
│   │   ├── avatar_ramesh.jpg     (Ramesh Kumar portrait)
│   │   └── scenario_tailoring.jpg(Craft textile cutting preview)
│   ├── icon.svg
│   └── manifest.json
└── src/
    ├── App.jsx                   (Master production landing page with Scenes 1–6 and SETO minimal dashboard)
    ├── components/
    │   └── SetoDashboard.jsx     (Scene 6 SETO minimal mockup dashboard)
    ├── engine.js                 (Deterministic NSFDC credit & debt calculation engine)
    ├── index.css                 (Tailwind base/components/utilities, custom tokens, keyframes)
    ├── main.jsx                  (Root React entry point)
    └── data/
        └── dossiers_db.json      (24 empirical SC micro-enterprise trade dossiers)
```

## Interface Contracts
### `engine.js` ↔ `App.jsx` & `SetoDashboard.jsx`
- `calculateNSFDCLoan(projectCost, options)` -> `{ loanAmount, promoterMargin, subsidy, interestRate, quarterlyEQI, totalInterest, schedule }`
- `assessAnnualSolvency(projectCost, baseNOCF, basketCode)` -> `{ annualDSCR, minQuarterlyDSCR, leanMonthSurplus, rating, monthlyCashFlows }`
- `restructureInformalDebt(principal, monthlyRateSenkda)` -> `{ currentAnnualInterest, newNSFDCAnnualInterest, monthlySavings, totalRelief }`
- `calculateEMI(principal, annualRatePct, tenureMonths)` -> standard amortized monthly EMI
