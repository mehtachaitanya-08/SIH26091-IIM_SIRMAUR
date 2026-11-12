# UI Design Phase Contract: UdyamSetuAI Production Landing Page & SETO Mockup Dashboard

**Specification Standard**: `gsd-ui-phase` & `oxfords` UI Principles  
**Target Platform**: UdyamSetuAI (MoSJE / NSFDC SIH26091)  
**Location**: `frontend/src/`  
**Status**: APPROVED DESIGN CONTRACT  

---

## 1. Editorial Vision & Aesthetic Synthesis
UdyamSetuAI unifies the high-refinement editorial publication style of the Walton Family Foundation research microsite (`opportunity.waltonfamilyfoundation.org`) with the SETO minimal diffused ambient dashboard aesthetic.

- **Tone**: Dignified, institutional, authoritative, yet deeply human and grounded in the rural Indian Scheduled Caste micro-entrepreneur experience.
- **Editorial Contrast**: Giant condensed serif typography (`WHERE OPPORTUNITY TAKES ROOT`) juxtaposed with authentic photographic portraits of artisans, handloom weavers, and agri-entrepreneurs.
- **Ambient Transition**: Natural warm bone and parchment grounds (`#F4F1EA`, `#F8F6F0`) transitioning into SETO's diffused slate/peach canvas (`#D4D8DD`) housing the rounded white workspace shell (`rounded-[28px]`).

---

## 2. Color System & Design Tokens

### 2.1 Surfaces & Canvas
| Token | Hex Value | Semantic Role |
|---|---|---|
| `--color-walton-ground` | `#F4F1EA` | Primary warm bone canvas for hero and landing page |
| `--color-walton-warm` | `#F8F6F0` | Slightly warmer section ground for Scene 2 (Thesis) |
| `--color-dash-bg` | `#D4D8DD` | Diffused ambient outer backdrop for Scene 6 SETO dashboard |
| `--color-dash-card` | `#FFFFFF` | Crisp white container surface for SETO 3-column shell |
| `--color-dash-sidebar` | `#F8F9FA` | Off-white navigation rail surface |
| `--color-dash-border` | `#E9ECEF` | Subtle 1px separation borders |

### 2.2 Text & Content Hierarchy
| Token | Hex Value | WCAG Contrast Ratio on Ground | Usage |
|---|---|---|---|
| `--color-walton-ink` | `#111311` | 17.8:1 (AAA) | Primary headlines, Cinzel display, strong labels |
| `--color-walton-muted` | `#686D65` | 4.9:1 (AA) | Secondary editorial text, subtitles, captions |
| `--color-subtle` | `#A0A59D` | 3.1:1 (UI Components) | Inactive capsule dots, subtle dividers |

### 2.3 Semantic Brand & Domain Accents
| Token | Hex Value | Role |
|---|---|---|
| `--color-accent-coral` | `#E86043` | Primary brand accent, star bloom gradient, pulse indicator |
| `--color-concessional-emerald` | `#0E7A53` | Statutory concessional credit, "✦ Statutory Verified" badge |
| `--color-chip-ochre` | `#D49B5A` | Agricultural mustard/gold accent chip |
| `--color-chip-olive` | `#5A7352` | Farmland olive green accent chip |
| `--color-chip-slate` | `#4A6274` | Mechanical/technical slate blue accent chip |
| `--color-arc-gauge-yellow` | `#FACC15` | Glowing SVG radial arc gauge, metric highlight (67%) |

### 2.4 Diffused Ambient Backdrop Formula
```css
background: radial-gradient(circle at 18% 22%, rgba(205, 220, 235, 0.65) 0%, transparent 45%),
            radial-gradient(circle at 82% 80%, rgba(245, 185, 160, 0.5) 0%, transparent 45%),
            #D4D8DD;
```

---

## 3. Typography Hierarchy

| Style Role | Font Family | Weights | Sizing Range | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **Giant Display** | `Cinzel`, Georgia, serif | 700, 800, 900 | `clamp(3.5rem, 11.5vw, 12rem)` | `0.88` | `-0.04em` |
| **Editorial Serif**| `Instrument Serif`, Georgia, serif | 400, 400 italic | `clamp(1.75rem, 4.2vw, 3.75rem)` | `1.15` | `-0.02em` |
| **Modern UI Sans** | `Plus Jakarta Sans`, sans-serif | 500, 600, 700 | `12px – 16px` | `1.4` | `-0.01em` |
| **Dashboard Dense**| `Inter Tight`, sans-serif | 400, 500, 600, 700 | `11px – 14px` | `1.35` | normal |
| **Tabular Numbers** | `Space Grotesk`, monospace | 500, 600, 700 | `10px – 14px` | `1.2` | `font-feature-settings: 'tnum'` |

---

## 4. Scene-by-Scene Motion & Layout Choreography

### Scene 1: Pinned Hero Dispersion (`#hero-pinned-scene`)
- **Container**: `h-screen w-full relative overflow-hidden flex items-center justify-center bg-waltonGround`.
- **GSAP ScrollTrigger**: `trigger: "#hero-pinned-scene", start: "top top", end: "+=120%", pin: true, scrub: 1.2`.
- **Headline**: 4 lines: `WHERE / OPPORTUNITY / TAKES / ROOT` in Cinzel / Instrument Serif. Scales from 0.96 to 1.04 on initial scrub, fades to 0.15 with `y: -60px` at scrub finish.
- **Layered Photo Cards**:
  - Central Card: Ramesh Kumar & partner in agro-workshop (`hero_center.jpg`, 360x240 to 440x310), rounded-2xl, border-4 border-white, shadow-2xl. Disperses: `scale: 1 -> 0.65, y: 0 -> -40px, opacity: 1 -> 0`.
  - Satellite 1 (Top-Right): Aerial mustard fields (`hero_sat_1.jpg`). Disperses: `x: +260px, y: -180px, scale: 0.4, opacity: 0`.
  - Satellite 2 (Bottom-Left): Sunita Devi tailoring (`hero_sat_2.jpg`). Disperses: `x: -280px, y: +160px, scale: 0.4, opacity: 0`.
  - Satellite 3 (Bottom-Right): Manoj Paswan garage (`hero_sat_3.jpg`). Disperses: `x: +300px, y: +180px, scale: 0.4, opacity: 0`.
  - Satellite 4 (Top-Left): Handloom weaving (`hero_sat_4.jpg`). Disperses: `x: -240px, y: -160px, scale: 0.4, opacity: 0`.
  - Color Chips: Ochre, Olive, Slate scatter outward.

### Scene 2: Vertical Line Drop (`#scene-thesis`)
- **Geometry**: Thin `1.5px` vertical line (`h-28`), terminating with a solid circular dot (`w-2.5 h-2.5`).
- **Animation**: `scaleY: 0 -> 1` (`transform-origin: top`, duration 1.2s, `ease: "power2.out"`) triggered on scroll (`top 65%`).
- **Content**: Chapter `[ 01 ]` followed by the thesis statement: *"Statutory credit enables rural producers to fulfill their highest potential."*

### Scene 3: Pinned Orbital Vortex (`#scene-orbit`)
- **Pinned Container**: `h-screen`, `pin: "#orbit-pinned-wrap", scrub: 1.4, end: "+=150%"`.
- **Center**: Chapter `[ 02 ]` and headline *"What does opportunity mean today?"* with *"opportunity"* in elegant editorial italics.
- **Constellation**: 8 circular-ring photo tiles (`orbit_1.jpg` – `orbit_8.jpg`) and 4 color chips flying inward from outer scattered positions into a rotating circular ring around the central question, with continuous `45deg` scrub rotation.

### Scene 4: Full-Bleed Immersion & Radial Arc Gauge (`#scene-immersive`)
- **Backdrop**: Full-bleed `harvest_immersion.jpg` with high-contrast darkening vignette.
- **Breadcrumb**: `02 / 04 · STATUTORY SOLVENCY RATING` in emerald mono text.
- **SVG Arc Gauge**:
  - `viewBox="0 0 100 100"`, Circle `cx="50" cy="50" r="45"`.
  - `stroke-dasharray: 283`.
  - Animated on enter: `stroke-dashoffset: 283 -> 93` (filling 67% arc).
  - Center badge: Amber pill displaying `67%`.
- **Text & Action**: Bold headline `"67% of rural producers"`, narrative italic quote, and action pill `02 / 04 OPEN DASHBOARD ↗` triggering smooth scroll to Scene 6.

### Scene 5: Platform in 4 Pillars (`#scene-cards`)
- **Grid**: 4 clean cards with staggered reveal on scroll.
- **Card 1**: NSFDC Dual-Tier Credit (MCF ≤ ₹1.40L @ 6.5%, Term Loan up to ₹50L @ 8.0%).
- **Card 2**: 12-Month Solvency Simulator (August lean-month stress testing).
- **Card 3**: Mode B Moneylender Debt Liberation (Refinancing 3-senkda debt).
- **Card 4**: 1-Page Lead-Bank DPR (RBI Lead Bank Scheme standard).

### Scene 6: SETO Minimal Mockup Dashboard (`#dashboard-section`)
- **Outer Canvas**: Diffused `#D4D8DD` canvas with `rounded-[38px]` and soft-shadow.
- **Inner Shell**: Rounded white container (`rounded-[28px]`, `soft-card-shadow`) divided into 3 columns (3 cols / 6 cols / 3 cols).
- **Left Rail**:
  - Brand lockup: `✦ UdyamSetuAI`.
  - Navigation items with active white pill: `🏠 Home`, `⚙️ Enterprise Studio`, `📉 NSFDC Amortizer`, `⚖️ Debt Liberation`, `📄 1-Page DPR`.
  - Collapsible `Advisory Tools ^`: D08 Mustard Mill, D18 Tailoring Workshop, D15 Tractor Garage.
  - Bottom User Card: Avatar, "Ramesh Kumar", "SC · Income ≤ ₹5.00L", with `✦ Statutory Verified` green pill badge.
- **Center Workspace**:
  - Top 4-pointed iridescent star SVG blossom with `@keyframes pulseStar` and peach/coral/violet/amber radial gradient.
  - Greeting: "Welcome, Ramesh! How can I help you today?".
  - 3 Quick Action Cards: `⭐ Simulate enterprise`, `✏️ NSFDC amortizer`, `🎨 Debt liberation`.
  - Live Viewports connected to `frontend/src/engine.js`:
    - Solvency Viewport: ₹6.80L cost, annual NOCF ₹2.84L, August lean-month trough indicator.
    - Amortizer Viewport: Loan ₹6.12L, quarterly EQI ₹30,420, moratorium breakdown.
    - Debt Liberation Viewport: ₹1,20,000 principal at 3 senkda (36% APR) vs 6.5% NSFDC loan showing monthly relief of +₹2,460.
    - DPR Viewport: Lead-Bank sanction sheet with SHA256 QR hash verification.
  - Floating Bottom Command Bar: Text input placeholder, pills (`📎 Lead-Bank DPR`, `⚙️ Quarterly EQI`), mic button 🎤, and submit arrow ↑.
- **Right Sidebar**:
  - "Recent scenarios", search bar, scenario cards with checkboxes and thumbnail previews (`D08 Mustard Oil Mill`, `D18 Tailoring Workshop`).

---

## 5. Media Asset Manifest (16 Local Assets in `frontend/public/images/`)
1. `hero_center.jpg` (900x600): Ramesh Kumar & agro-workshop partner.
2. `hero_sat_1.jpg` (600x400): Mustard/wheat fields aerial.
3. `hero_sat_2.jpg` (600x400): Sunita Devi tailoring workshop.
4. `hero_sat_3.jpg` (600x400): Manoj Paswan tractor garage.
5. `hero_sat_4.jpg` (600x400): Handloom weaving artisan.
6. `orbit_1.jpg` (400x400): Cold press mustard expeller machine.
7. `orbit_2.jpg` (400x400): Farmland crop rows.
8. `orbit_3.jpg` (400x400): Garment assembly cooperative.
9. `orbit_4.jpg` (400x400): Agro-machinery repair station.
10. `orbit_5.jpg` (400x400): PM Vishwakarma pottery artisan.
11. `orbit_6.jpg` (400x400): Goat husbandry livestock shed.
12. `orbit_7.jpg` (400x400): Rural agro-inputs store.
13. `orbit_8.jpg` (400x400): Vermicompost fertilizer beds.
14. `harvest_immersion.jpg` (1920x1080): Breathtaking rural harvest sunset landscape.
15. `avatar_ramesh.jpg` (300x300): Ramesh Kumar verified entrepreneur portrait.
16. `scenario_tailoring.jpg` (600x350): Textile tailoring craftsmanship preview.
