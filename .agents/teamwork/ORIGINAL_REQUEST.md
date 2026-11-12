# Original User Request

## Initial Request — 2026-11-09T21:58:52Z

Use gsd-ui-phase to build the front end. Build the production landing page and limited mockup dashboard for UdyamSetuAI (Hyper-Local Business Advisory & Concessional Credit Platform for Scheduled Caste rural micro-entrepreneurs, SIH 2026: SIH26091 — MoSJE / NSFDC) in `frontend/src/` with top-tier visual polish, editorial typography, high-refinement imagery, and smooth scroll interactions, following `gsd-ui-phase` workflow standards.

Integrity mode: development

Reference material:
- Design reference: https://opportunity.waltonfamilyfoundation.org/
- Video breakdown: `Access to Opportunity_ Gallup Research _ Walton Family Foundation - Brave 2026-11-10 03-01-07.mp4`
- Prototype reference: `interactive_platform_prototype.html`
- Core engine: `engine/nsfdc_calculator.py` and `frontend/src/engine.js`
- Dossiers dataset: `data/dossiers_db.json`

## Requirements

### R1. UI Design Phase Contract
Execute the UI phase following `gsd-ui-phase` workflow standards. Establish the UI design specification covering editorial typography, high-refinement imagery composition, palette, and interactive states before implementing code.

### R2. High-Refinement Photography & Asset Integration
Source or generate high-refinement photographic assets of real rural Indian Scheduled Caste micro-entrepreneurs (artisans, handloom weavers, agri-entrepreneurs) and rural harvest environments, integrating them directly into project assets (`frontend/public/` or `frontend/src/assets/`) with proper optimization.

### R3. Production Landing Page (6 Scroll Scenes)
Implement the production landing page in `frontend/src/` using Vite + React 19 + Tailwind CSS + Lucide React, GSAP ScrollTrigger, and Lenis smooth scrolling, featuring the 6 scenes:
- Scene 1 (Pinned Hero Dispersion): Giant 4-line condensed serif text (`WHERE OPPORTUNITY TAKES ROOT` in Cinzel / Instrument Serif) overlaid with layered, high-refinement photo cards of real rural Indian entrepreneurs and small color accent blocks. On scroll scrub, pinned photo cards disperse outward to corners and scale down to cleanly reveal typography.
- Scene 2 (Vertical Line Drop): Animated thin vertical line drawing downward with a terminal dot, unlocking chapter `[ 01 ]` with the thesis statement on statutory credit.
- Scene 3 (Orbital Vortex): Multi-photo cluster flying inward to form an orbiting circular ring around `[ 02 ] What does opportunity mean today?`.
- Scene 4 (Full-Bleed Immersion & Arc Gauge): Full-bleed high-res rural harvest photography with a glowing circular SVG radial arc gauge (animating to 67%), metric text, and action pill `02 / 04 OPEN DASHBOARD ↗`.
- Scene 5 (Platform in 4 Pillars): 4 clean cards summarizing:
  1. NSFDC Dual-Tier Credit (MCF ≤ ₹1.40L @ 6.5%, Term Loan up to ₹50L @ 8.0%)
  2. 12-Month Solvency Simulator (August lean-month stress test)
  3. Mode B Moneylender Debt Liberation (Refinancing 3-senkda debt)
  4. 1-Page Lead-Bank DPR (RBI Lead Bank Scheme standard)
- Scene 6 (SETO Minimal Dashboard Mockup): Replicate the SETO aesthetic at the end of the landing page:
  * Diffused ambient canvas (`#D4D8DD` with warm peach/slate radial gradients).
  * Rounded white 3-column container (`rounded-[28px]`, soft-neumorphic shadow).
  * Left navigation rail with `✦ UdyamSetuAI` lockup, active white pill, collapsible `Advisory Tools ^`, and bottom user card ("Ramesh Kumar", SC · Income ≤ ₹5.00L, with "Statutory Verified" badge).
  * Center workspace with top 4-pointed iridescent star SVG blossom, "Welcome, Ramesh! How can I help you today?", 3 quick action cards, and floating bottom command bar with mic and arrow.
  * Right sidebar with "Recent scenarios", search, and history cards with avatars and image previews.
  * Keep dashboard functionality strictly limited as a mockup per user instructions.

## Acceptance Criteria

### Build & Syntax Verification
- [ ] `npm run build` executed in `frontend/` succeeds with exit code 0 and zero TypeScript/JSX/bundling errors.
- [ ] All imported assets (images, fonts, stylesheets) resolve cleanly without broken paths or missing files.

### Visual & Interactive Scene Verification
- [ ] Scene 1 hero renders giant 4-line condensed serif typography (`WHERE OPPORTUNITY TAKES ROOT`) overlaid with layered photo cards; on scroll scrub via GSAP ScrollTrigger + Lenis, cards disperse to corners and scale down smoothly without jitter or layout shifts.
- [ ] Scene 2 displays the vertical line draw animation with terminal dot unlocking chapter `[ 01 ]` and statutory credit thesis text.
- [ ] Scene 3 animates multi-photo cluster inward into an orbiting circular formation around `[ 02 ] What does opportunity mean today?`.
- [ ] Scene 4 displays full-bleed rural harvest photography with SVG radial arc gauge animating to 67%, metric display, and action pill `02 / 04 OPEN DASHBOARD ↗`.
- [ ] Scene 5 displays the 4 platform pillars (NSFDC Dual-Tier Credit, 12-Month Solvency Simulator, Mode B Moneylender Debt Liberation, 1-Page Lead-Bank DPR) with clean card styling.
- [ ] Scene 6 renders the SETO mockup dashboard with diffused `#D4D8DD` ambient canvas, rounded 3-column container (`rounded-[28px]`), left nav rail with user card, center workspace with 4-pointed iridescent star blossom and action cards, and right sidebar with recent scenarios.
- [ ] Dashboard interactivity remains strictly limited to mockup interactions without unbuilt backend dependencies.


## Follow-up — 2026-11-10T11:01:20Z

Build production-grade dashboard functionality connected to the latest backend and ML models from GitHub, replacing demo modes and mock profiles with real Google authentication, and synchronizing design changes between the main dashboard and the landing page mockup.

Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Integrity mode: development

## Requirements

### R1. GitHub Synchronization & Backend/ML Integration
Pull the latest backend services and ML model definitions from GitHub (origin/main). Connect frontend API services to the local backend and ML services running the updated models.

### R2. Production Google Authentication & Demo Mode Elimination
Eliminate all demo modes, mock data, and hardcoded "Ramesh" profiles across the frontend and data stores. Implement real Google OAuth 2.0 login when clicking the Google authentication option, loading credentials via environment configuration (.env).

### R3. Production Dashboard Implementation & Landing Page Synchronization
Build the production dashboard components matching the design established in SetoDashboard.jsx. Ensure all edits, components, and layout updates made to the main dashboard are reflected in the mockup dashboard on the landing page.

## Acceptance Criteria

### Authentication & Mode Removal
- [ ] Clicking Google login initiates the real Google OAuth flow instead of activating demo mode
- [ ] All demo toggles, mock data, and hardcoded "Ramesh" profile references are eliminated from the codebase
- [ ] Google authentication client credentials configure correctly from .env

### Backend & ML Connectivity
- [ ] Working tree incorporates the latest backend and ML model updates pulled from origin/main
- [ ] Frontend communicates with local backend and ML model service endpoints without errors

### Dashboard & Landing Page Synchronization
- [ ] Main dashboard displays production functionality matching established platform designs
- [ ] Landing page mockup dashboard reflects the structure, components, and styling of the main dashboard
- [ ] Frontend builds cleanly with zero errors (npm run build)
- [ ] Automated verification tests pass
