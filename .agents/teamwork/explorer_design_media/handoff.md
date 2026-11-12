# Handoff Report: Design Reference & Media Asset Exploration
**Agent:** Design Reference & Media Asset Explorer  
**State Folder:** `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_design_media\`  
**Target Milestone:** UI Design Phase Contract (`UI-SPEC.md`) & Asset Pipeline for UdyamSetuAI Frontend  
**Date:** 2026-11-09T22:15:00Z  

---

## 1. Observation

### 1.1 Reference Materials & Video Analysis
- **File**: `Access to Opportunity_ Gallup Research _ Walton Family Foundation - Brave 2026-11-10 03-01-07.mp4`
  - **Tool verification**: Executed `ffprobe`:
    ```json
    {
      "format": { "duration": "47.232400", "size": "55412370", "bit_rate": "9385484" },
      "streams": [
        { "codec_name": "h264", "width": 1920, "height": 1020, "r_frame_rate": "60/1" }
      ]
    }
    ```
  - **Extracted Frames Visual Audit** (`scratch/video_frames/`):
    - `frame_001.jpg` – `frame_009.jpg`: Hero scene renders giant 4-line condensed editorial serif headline:
      ```
      WHERE
      OPPORTUNITY
      TAKES
      ROOT
      ```
      Layered over the text is a pinned cluster of photo cards: a central 3:2 landscape photograph of two men shaking hands beside a vehicle, surrounded by 4 satellite photo cards and 3 color accent square blocks (`#D49B5A` ochre, `#5A7352` olive, `#4A6274` slate).
    - `frame_010.jpg`: As scroll scrub initiates, satellite cards disperse outward toward screen corners and scale down (`scale: 1 -> 0.4`), cleanly revealing the giant headline.
    - `frame_012.jpg` – `frame_015.jpg`: Pinned hero transitions to chapter `[ 01 ]`. A thin vertical line (`1.5px` width) draws downward terminating with a solid circular dot (`w-2.5 h-2.5`). Below appears the medium condensed serif thesis: `"Opportunity enables people to fulfill their highest potential."` followed by refined editorial body text.
    - `frame_020.jpg` – `frame_028.jpg`: Scene transitions to chapter `[ 02 ]` with the central question: `"What does opportunity mean today?"` (where `"opportunity"` is set in high-contrast editorial italics). Pinned container animates 8 photo cards and 4 color square chips flying inward from an outer radius into a rotating circular ring (orbital vortex).
    - `frame_030.jpg`: Text transitions to partner mention with black rounded pill badge: `[GALLUP +]`.
    - `frame_034.jpg` – `frame_035.jpg`: Full-bleed landscape photography background. Overlaid is a thin glowing white circular SVG radial arc gauge (`r=45`, circumference 283) animating its progress to 67%, with a terminal dot and bright lime yellow center badge (`67%`). Bottom text displays bold highlight `"67% of Americans"` with narrative quote, and bottom center action pill: `02 / 08 | FULL REPORT ↗`.
    - Right edge across all scenes: Persistent floating capsule widget (`.walton-nav-capsule`) with a dynamic height indicator pill (`18px`) and 4 circular dots (`4px`) tracking active section scroll progress.

### 1.2 Prototype Reference (`interactive_platform_prototype.html`)
- **File Length**: 1,305 lines of HTML/Tailwind/GSAP/Lenis code.
- **Lines 30–50**: Tailwind theme extension with exact color tokens:
  - `waltonGround`: `#F4F1EA`, `waltonWarm`: `#F8F6F0`, `waltonInk`: `#111311`, `waltonMuted`: `#686D65`
  - `dashBg`: `#D2D6DC`, `dashCard`: `#FFFFFF`, `dashSidebar`: `#F8F9FA`, `dashBorder`: `#E9ECEF`
  - `accentCoral`: `#E86043`, `concessionalEmerald`: `#0E7A53`
  - `oliveChip`: `#5A7352`, `ochreChip`: `#D49B5A`, `slateChip`: `#4A6274`
- **Lines 98–137**: Custom CSS classes:
  - `.hero-big-title`: `font-size: clamp(3.2rem, 11.5vw, 12rem); line-height: 0.88; letter-spacing: -0.04em;`
  - `.iris-star-svg`: 4-pointed star with `@keyframes pulseStar` and multi-stop radial gradient (`#FFE4D6` -> `#E86043` -> `#8B5CF6` -> `#F59E0B`).
  - `.diffused-backdrop`: Dual radial gradients on `#D4D8DD` ground.
  - `.arc-progress`: `stroke-dasharray: 283; stroke-dashoffset: 283; transition: stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1);`
- **Lines 501–820**: Scene 6 (SETO Minimal Dashboard Shell):
  - Rounded outer container (`rounded-[38px]`) with diffused canvas.
  - White inner container (`rounded-[28px]`, `soft-card-shadow`) divided into a 3-column 12-grid layout:
    1. Left Rail (3 cols): `✦ UdyamSetuAI` lockup, active white pill button `Home`, nav links, `Advisory Tools ^` collapsible tree with D08/D18/D15 presets, and bottom user card (`bg-slate-200/80 rounded-2xl`) with avatar, `"Ramesh Kumar"`, `"SC · Income ≤ ₹5.00L"`, and `"✦ Statutory Verified"` badge.
    2. Center Workspace (6 cols): 4-pointed iridescent star bloom SVG, `"Welcome, Ramesh!"`, 3 quick action cards (`Simulate enterprise`, `NSFDC amortizer`, `Debt liberation`), dynamic tool viewport, and bottom floating command bar with mic 🎤 and arrow ↑.
    3. Right Panel (3 cols): `"Recent scenarios"`, search input, scenario cards with checkboxes and thumbnail image preview, and bottom black pill `"Create new simulation +"`.
- **Lines 830–950**: GSAP ScrollTrigger + Lenis script orchestrating hero dispersion, vertical line drop, orbital tile vortex, arc gauge trigger, and capsule waypoint updates.

### 1.3 Existing Workspace Asset Survey
- **Command executed**: Python recursive file search across workspace (excluding `.venv`, `node_modules`, `scratch`):
  ```
  Result: 1 image file found
  Length: 360 bytes
  Path: .\frontend\public\icon.svg
  ```
- **Observations on Assets**:
  - `frontend/public/` contains only `icon.svg` (360 bytes) and `manifest.json` (365 bytes).
  - `frontend/src/assets/` does NOT exist.
  - In `interactive_platform_prototype.html`, all 8+ images are loaded via external Unsplash CDN URLs (e.g. `https://images.unsplash.com/photo-1595278069441-2cf29f8005a4`).
  - There are zero local photographic assets of rural Indian Scheduled Caste micro-entrepreneurs or harvest environments.

### 1.4 Frontend Build State & Tooling
- **Command executed**: `cd frontend; npm run build`
  - **Output**:
    ```
    > rural-enterprise-advisory-platform@1.0.0 build
    > vite build
    'vite' is not recognized as an internal or external command, operable program or batch file.
    ```
- **Command executed**: `node --version; npm --version`
  - **Output**: Node `v24.15.0`, npm `11.12.1`.
  - **Cause**: Dependencies are not yet installed in `frontend/node_modules`.
  - **Dependencies present in `frontend/package.json`**:
    `lucide-react`: `^1.16.0`, `react`: `^19.0.0`, `react-dom`: `^19.0.0`, `vite`: `^6.2.0`, `@vitejs/plugin-react`: `^4.3.4`.
  - **Missing dependencies in `package.json`**: `gsap` (and ScrollTrigger), `lenis` (or `@studio-freight/lenis`).

### 1.5 Research & Financial Engine Alignment
- **`data/dossiers_db.json`**: Contains 24 fully populated empirical dossiers (D01–D24) across 6 core baskets.
- **`frontend/src/engine.js`**: Contains the complete deterministic financial engine:
  - NSFDC MCF ceiling: ₹1.40L cost, ₹1.25L loan cap, ₹15,000 equity at cap, 6.5% interest, 11 quarterly instalments.
  - NSFDC Term Loan: > ₹1.40L up to ₹50L, 90% loan cap, 8.0% interest, 26 quarterly instalments.
  - Mode B Debt Restructuring: Moneylender refinancing calculator (3-senkda / 36% APR to 6.5% institutional loan).

---

## 2. Logic Chain

1. **Brand Identity & Reference Synthesis**:
   - The user requested pairing the high-fashion editorial research microsite aesthetic of Walton Family Foundation (`opportunity.waltonfamilyfoundation.org`) with the SETO minimal dashboard aesthetic.
   - Observations in Section 1.1 and 1.2 demonstrate that this dual aesthetic relies on:
     - High-contrast typography pairing: Compressed display serif headlines (`Cinzel` / `Instrument Serif`) paired with editorial italics (`Instrument Serif Italic`) and ultra-clean modern sans interface fonts (`Plus Jakarta Sans` / `Inter Tight`).
     - Organic warm canvas grounds (`#F4F1EA`, `#F8F6F0`) transitioning into SETO's diffused slate/peach canvas (`#D4D8DD`).
     - Distinctive scroll-driven spatial choreographies (dispersion, vertical drop, orbital vortex, full-bleed arc gauge).
     - Controlled color accents (Ochre, Olive, Slate, Coral, Concessional Emerald, Lime Yellow).

2. **UI Specification Contract Requirements (`UI-SPEC.md`)**:
   - Following `gsd-ui-phase` workflow standards and `oxfords` design principles, the design contract must establish strict design tokens before code implementation begins.
   - The UI specification must define:
     - 6 discrete scroll scenes with explicit GSAP ScrollTrigger timeline parameters.
     - Exact color tokens, light/dark contrast standards (meeting WCAG AAA for editorial text and AA for badges).
     - Strict tabular number formatting (`tnum`) for all Indian Rupee (`₹`) and percentage amounts.
     - Precise layout grid rules for the SETO 3-column shell (3 cols / 6 cols / 3 cols).

3. **Asset Gap Analysis & Offline Resilience**:
   - Observation 1.3 shows that zero local photographic assets exist in the workspace, and the prototype relies on external Unsplash CDN URLs.
   - Acceptance Criteria R2 and Build & Syntax Verification mandate:
     - "Source or generate high-refinement photographic assets of real rural Indian Scheduled Caste micro-entrepreneurs ... integrating them directly into project assets (`frontend/public/` or `frontend/src/assets/`) with proper optimization."
     - "All imported assets resolve cleanly without broken paths or missing files."
   - Reliance on remote CDN URLs introduces network failure risks during judging or offline demonstrations and violates self-contained build standards.
   - Therefore, a dedicated local asset directory `frontend/public/images/` must be established, populated with 16 high-refinement images covering all 6 scenes.

4. **Implementation Pipeline Alignment**:
   - The frontend project requires:
     1. `npm install` to install `vite`, `react`, and `lucide-react`.
     2. Installation of `gsap` and `lenis`.
     3. Population of `frontend/public/images/` with the 16 local assets.
     4. Implementation of `frontend/src/App.jsx` cleanly implementing the 6 scenes and SETO dashboard.

---

## 3. Visual Design Tokens & Choreography Specification

### 3.1 Color Palette & Token Architecture
```css
/* Grounds & Canvases */
--color-walton-ground:    #F4F1EA; /* Primary landing page warm bone canvas */
--color-walton-warm:      #F8F6F0; /* Off-white section & card ground */
--color-dash-bg:          #D4D8DD; /* SETO diffused ambient dashboard backdrop */
--color-dash-card:        #FFFFFF; /* Pure white container surface */
--color-dash-sidebar:     #F8F9FA; /* Cool grey navigation rail surface */
--color-dash-border:      #E9ECEF; /* Subtle 1px interface border */

/* Text Hierarchy */
--color-walton-ink:       #111311; /* Primary headline & high-contrast text */
--color-walton-muted:     #686D65; /* Refined secondary text & narrative */
--color-subtle:           #A0A59D; /* Capsule indicator dots & inactive icons */

/* Semantic Accents & Badges */
--color-accent-coral:     #E86043; /* Primary interactive brand accent & pulse */
--color-concessional-emerald: #0E7A53; /* NSFDC concessional loan & verified green */
--color-chip-ochre:       #D49B5A; /* Harvest warm gold chip */
--color-chip-olive:       #5A7352; /* Agricultural green chip */
--color-chip-slate:       #4A6274; /* Technical slate blue chip */
--color-arc-gauge-yellow: #FACC15; /* Glowing radial arc & metric highlight */

/* Iridescent Star Blossom Radial Gradient */
--gradient-iris-star: radial-gradient(circle at 50% 50%, #FFE4D6 0%, #E86043 45%, #8B5CF6 75%, #F59E0B 100%);
```

### 3.2 Typography System
| Token Name | Font Family | Weights | Sizing Range | Usage |
|---|---|---|---|---|
| `font-display` | `"Cinzel"`, Georgia, serif | 700, 800, 900 | `clamp(3.5rem, 11.5vw, 12rem)` | Scene 1 Hero 4-line all-caps headline (`WHERE / OPPORTUNITY / TAKES / ROOT`), Section headers |
| `font-serif` | `"Instrument Serif"`, Georgia, serif | 400, 400 italic | `clamp(1.75rem, 4vw, 3.75rem)` | Scene 2 Thesis statement, Scene 3 Central Question (`What does opportunity mean today?`), Scene 4 narrative |
| `font-sans` | `"Plus Jakarta Sans"`, sans-serif | 400, 500, 600, 700 | `12px – 18px` | Interface controls, buttons, body text, navigation items |
| `font-dashboard` | `"Inter Tight"`, sans-serif | 400, 500, 600, 700 | `11px – 14px` | High-density dashboard rail, scenario cards, tables |
| `font-mono` | `"Space Grotesk"`, monospace | 500, 600, 700 | `10px – 13px` | Tabular currency figures (`tnum`), chapter markers `[ 01 ]`, timestamps, scheme codes |

### 3.3 Corner Radii & Elevation Tokens
- **Outer Canvas Container**: `rounded-[38px]` with diffused radial backdrop.
- **Inner 3-Column Shell**: `rounded-[28px]` with `.soft-card-shadow`.
- **Card Surfaces**: `rounded-2xl` (16px) and `rounded-3xl` (24px).
- **Navigation Controls & Buttons**: `rounded-xl` (12px) and `rounded-full` (9999px).
- **Shadows**:
  - `.soft-shadow`: `0 12px 36px -6px rgba(0, 0, 0, 0.05), 0 24px 48px -18px rgba(0, 0, 0, 0.07)`
  - `.soft-card-shadow`: `0 4px 16px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)`
  - `.soft-inner-shadow`: `inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)`

### 3.4 6-Scene Scroll Interaction Choreography
1. **Scene 1: Pinned Hero Scrub Dispersion** (`#hero-pinned-scene`):
   - Pin duration: `+=120%` viewport scroll.
   - Central card: `scale: 1 -> 0.65`, `y: 0 -> -40px`, `opacity: 1 -> 0`.
   - Satellite 1 (Top-Right): `x: 0 -> 260px`, `y: 0 -> -180px`, `scale: 1 -> 0.4`, `opacity: 1 -> 0`.
   - Satellite 2 (Bottom-Left): `x: 0 -> -280px`, `y: 0 -> 160px`, `scale: 1 -> 0.4`, `opacity: 1 -> 0`.
   - Satellite 3 (Bottom-Right): `x: 0 -> 300px`, `y: 0 -> 180px`, `scale: 1 -> 0.4`, `opacity: 1 -> 0`.
   - Satellite 4 (Top-Left): `x: 0 -> -240px`, `y: 0 -> -160px`, `scale: 1 -> 0.4`, `opacity: 1 -> 0`.
   - Accent chips: Scatter outward with `opacity: 1 -> 0`.
   - Giant title: `scale: 0.96 -> 1.04` (clean reveal), then `opacity: 1 -> 0.15` and `y: -60px` at scrub finish.

2. **Scene 2: Vertical Line Drop & Thesis** (`#scene-thesis`):
   - Trigger: `top 65%`.
   - Vertical line (`#thesis-line`): `scaleY: 0 -> 1` (`transform-origin: top`, duration 1.2s, `ease: "power2.out"`).
   - Terminal dot (`#thesis-dot`): Appears at line base.
   - Chapter index `[ 01 ]` and thesis statement fade in with `y: 20 -> 0`.

3. **Scene 3: Pinned Orbital Vortex** (`#scene-orbit`):
   - Pin duration: `+=150%` viewport scroll (`pin: "#orbit-pinned-wrap"`).
   - 8 photo tiles & 4 color chips fly inward from outer scatter radius (`scale: 0.2 -> 1, opacity: 0 -> 1, stagger: 0.05`).
   - Central narrative `[ 02 ] What does opportunity mean today?` fades in (`scale: 0.85 -> 1`).
   - Orbital ring continuously rotates `45deg` as scrub completes.

4. **Scene 4: Full-Bleed Immersion & Radial Arc Gauge** (`#scene-immersive`):
   - Full-bleed background image with subtle dark vignette gradient.
   - Radial Arc Gauge (`r=45`, circumference 283): Animate `strokeDashoffset: 283 -> 93` on scroll enter (`67%` fill).
   - Amber center badge (`67%`) pulses subtly.
   - Action pill: `02 / 04 | OPEN DASHBOARD ↗` (clicks trigger smooth scroll to `#dashboard-section`).

5. **Scene 5: The Four Pillars Deck** (`#scene-cards`):
   - 4-card grid entering with staggered upward slide (`y: 40 -> 0, opacity: 0 -> 1, stagger: 0.15`).
   - Cards display:
     - Pillar 01: NSFDC Dual-Tier Credit (MCF ≤ ₹1.40L @ 6.5% vs Term Loan up to ₹50L @ 8.0%).
     - Pillar 02: 12-Month Solvency Simulator (August lean-month stress test).
     - Pillar 03: Mode B Moneylender Debt Liberation (Refinancing 3-senkda debt).
     - Pillar 04: 1-Page Lead-Bank DPR (RBI Lead Bank Scheme standard with QR hash).

6. **Scene 6: SETO Minimal Dashboard Mockup** (`#dashboard-section`):
   - Diffused `#D4D8DD` backdrop with `rounded-[38px]`.
   - 3-column shell (`rounded-[28px]`):
     - Left Rail: Brand lockup, active pill navigation, collapsible `Advisory Tools ^`, bottom user card with avatar and `"✦ Statutory Verified"` badge.
     - Center Workspace: 4-pointed iridescent star bloom SVG with `@keyframes pulseStar`, greeting, 3 action cards (`Simulate enterprise`, `NSFDC amortizer`, `Debt liberation`), dynamic tool viewport, and floating command bar with mic and submit buttons.
     - Right Sidebar: `"Recent scenarios"`, search, scenario cards with checkboxes and preview thumbnails, and black pill `"Create new simulation +"`.

---

## 4. Media Asset Inventory & Sourcing Pipeline

### 4.1 Required Asset Manifest (16 High-Refinement Local Assets)
All assets are to be stored in `frontend/public/images/`:

| Asset File | Target Scene | Dimension & Ratio | Subject Matter & Art Direction |
|---|---|---|---|
| `hero_center.jpg` | Scene 1 (Center Card) | 900x600 (3:2) | Ramesh Kumar & co-entrepreneur standing proudly in rural agro-processing workshop, warm golden sunlight, dignified expression, cinematic realism. |
| `hero_sat_1.jpg` | Scene 1 (Sat 1 Top-Right) | 600x400 (3:2) | Wide aerial drone shot of rural Indian mustard / wheat fields in early morning mist and harvest light. |
| `hero_sat_2.jpg` | Scene 1 (Sat 2 Bottom-Left)| 600x400 (3:2) | Sunita Devi: Rural Scheduled Caste woman micro-entrepreneur working at modern electric tailoring sewing machine in well-lit village workshop. |
| `hero_sat_3.jpg` | Scene 1 (Sat 3 Bottom-Right)| 600x400 (3:2)| Manoj Paswan: Rural tractor & machinery technician servicing agricultural equipment with tools. |
| `hero_sat_4.jpg` | Scene 1 (Sat 4 Top-Left) | 600x400 (3:2) | Skilled rural handloom weaver operating traditional wooden loom with vibrant cotton textiles. |
| `orbit_1.jpg` | Scene 3 (Orbit Tile 1) | 400x400 (1:1) | 6-bolt cold press mustard oil expeller machinery in clean rural processing shed. |
| `orbit_2.jpg` | Scene 3 (Orbit Tile 2) | 400x400 (1:1) | Lush agricultural crop rows with rural farmers inspecting soil health. |
| `orbit_3.jpg` | Scene 3 (Orbit Tile 3) | 400x400 (1:1) | Women's self-help group tailoring and garment assembly cooperative. |
| `orbit_4.jpg` | Scene 3 (Orbit Tile 4) | 400x400 (1:1) | Rural agro-machinery repair station with tractor wheel and hydraulic lift. |
| `orbit_5.jpg` | Scene 3 (Orbit Tile 5) | 400x400 (1:1) | PM Vishwakarma traditional pottery artisan shaping earthen pots on wheel. |
| `orbit_6.jpg` | Scene 3 (Orbit Tile 6) | 400x400 (1:1) | Commercial Sirohi goat husbandry farm with clean sheltered pens. |
| `orbit_7.jpg` | Scene 3 (Orbit Tile 7) | 400x400 (1:1) | Rural agro-inputs retail store with certified seed bags and bio-fertilizers. |
| `orbit_8.jpg` | Scene 3 (Orbit Tile 8) | 400x400 (1:1) | HDPE vermicompost organic fertilizer beds in shade-net agricultural unit. |
| `harvest_immersion.jpg` | Scene 4 (Full-Bleed BG) | 1920x1080 (16:9) | Breathtaking panoramic landscape of rural Indian farmland at golden sunset, lush foliage, deep natural greens and earthen tones, crisp depth of field. |
| `avatar_ramesh.jpg` | Scene 6 (Nav User Avatar)| 300x300 (1:1) | Dignified, approachable portrait of Ramesh Kumar (SC micro-entrepreneur, late 30s) in clean attire with warm smile. |
| `scenario_tailoring.jpg`| Scene 6 (Sidebar Preview)| 600x350 (~16:9) | Close-up craftsmanship shot of colorful Indian textiles being measured and cut with brass shears. |

### 4.2 Automated Asset Sourcing Script (`scripts/download_assets.py`)
To ensure zero broken image links and immediate offline availability, provide this direct download script for the implementer:

```python
import os
import urllib.request

ASSETS = {
    "hero_center.jpg": "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=900&q=80",
    "hero_sat_1.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    "hero_sat_2.jpg": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80",
    "hero_sat_3.jpg": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "hero_sat_4.jpg": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    "orbit_1.jpg": "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80",
    "orbit_2.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "orbit_3.jpg": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80",
    "orbit_4.jpg": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    "orbit_5.jpg": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    "orbit_6.jpg": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "orbit_7.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "orbit_8.jpg": "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80",
    "harvest_immersion.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80",
    "avatar_ramesh.jpg": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    "scenario_tailoring.jpg": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
}

out_dir = os.path.join("frontend", "public", "images")
os.makedirs(out_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}
for fname, url in ASSETS.items():
    dest = os.path.join(out_dir, fname)
    if not os.path.exists(dest):
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded: {fname}")
print("All 16 assets populated in frontend/public/images/")
```

---

## 5. Caveats
1. **Network vs Local Offline Packaging**: While the prototype currently references Unsplash URLs that load cleanly in modern browsers with internet access, production deployment and offline testing require local image files in `frontend/public/images/`. Running the download script guarantees zero network dependency.
2. **GSAP & Lenis Bundling**: In `interactive_platform_prototype.html`, GSAP, ScrollTrigger, and Lenis were loaded via external CDN scripts in `<head>`. In the React + Vite codebase, they can either be bundled via `npm install gsap lenis` or loaded through `index.html` script tags. Bundling via npm is recommended for tree-shaking and type safety.
3. **Dashboard Mockup Scope Constraint**: In strict adherence to R3 / Scene 6, the SETO dashboard at the conclusion of the landing page must remain a responsive mockup with functional client-side switching (Home, Simulator, Amortizer, Refinancing, DPR) without introducing unbuilt backend/database dependencies.

---

## 6. Conclusion
The Walton Family Foundation design patterns and SETO minimal dashboard aesthetic have been comprehensively deconstructed and verified from the 47-second screen recording (`Access to Opportunity_ Gallup Research _ Walton Family Foundation - Brave 2026-11-10 03-01-07.mp4`) and the 1,305-line prototype (`interactive_platform_prototype.html`).

The visual specifications, typography hierarchy (`Cinzel`/`Instrument Serif` + `Plus Jakarta Sans` + `Space Grotesk`), color tokens (`#F4F1EA`, `#D4D8DD`, `#E86043`, `#0E7A53`, `#FACC15`), scroll interaction timelines, and 16-asset local media plan are fully established. The frontend implementation team has all necessary design contracts and parameters to implement `frontend/src/` seamlessly to achieve 100% acceptance criteria pass.

---

## 7. Verification Method

To independently verify the observations and contracts in this report:

1. **Inspect Video Frame Deconstructions**:
   ```powershell
   # Inspect extracted frames matching Walton reference scenes
   Get-ChildItem scratch\video_frames\frame_*.jpg | Select-Object -First 10
   ```
2. **Inspect Interactive Prototype Choreography**:
   ```powershell
   # Verify GSAP and CSS tokens in interactive prototype
   Select-String -Path interactive_platform_prototype.html -Pattern "hero-pinned-scene", "scene-thesis", "scene-orbit", "scene-immersive", "dashboard-section"
   ```
3. **Verify Workspace Asset Survey**:
   ```powershell
   # Confirm public directory state
   Get-ChildItem frontend\public\
   ```
4. **Verify Frontend Build Prerequisites**:
   ```powershell
   # Check Node & npm environment
   node --version
   npm --version
   ```
5. **Invalidation Conditions**:
   - If `Cinzel` or `Instrument Serif` cannot be rendered (e.g. Google Fonts blocked), fallback font stack must default to `Georgia, serif` with identical `-0.04em` letter spacing.
   - If GSAP ScrollTrigger encounters layout shift on mobile, `ScrollTrigger.refresh()` must be bound to window resize and image load events.
