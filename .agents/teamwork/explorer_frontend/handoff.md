# Frontend Architecture & Financial Engine Survey Report

## 1. Observation

### 1.1 Original Request & Architectural Mandate
- **Source**: `ORIGINAL_REQUEST.md` (lines 18–42).
- **Core Directives**:
  - Implement production landing page in `frontend/src/` with 6 scroll scenes inspired by Walton Family Foundation (`https://opportunity.waltonfamilyfoundation.org/`) and the SETO minimal dashboard (`#D4D8DD` ambient canvas, rounded white 3-column container `rounded-[28px]`, left nav rail, center workspace with 4-pointed iridescent star, right sidebar).
  - Stack: Vite + React 19 + Tailwind CSS + Lucide React + GSAP ScrollTrigger + Lenis smooth scrolling.
  - Core calculations must integrate with `engine/nsfdc_calculator.py` and `frontend/src/engine.js`.

### 1.2 Package Setup (`frontend/package.json`)
- **File**: `frontend/package.json`
- **Current Content**:
  ```json
  {
    "name": "rural-enterprise-advisory-platform",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "lucide-react": "^1.16.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    "devDependencies": {
      "@vitejs/plugin-react": "^4.3.4",
      "vite": "^6.2.0"
    }
  }
  ```
- **Observations**:
  - `react`: `^19.0.0` and `react-dom`: `^19.0.0`.
  - `vite`: `^6.2.0` and `@vitejs/plugin-react`: `^4.3.4`.
  - `lucide-react`: `^1.16.0`.
  - **Missing Required Dependencies**:
    - `gsap` (required for GSAP ScrollTrigger scene pin and scrub animations in Scenes 1, 2, 3, 4).
    - `lenis` / `@studio-freight/lenis` / `lenis/react` (required for Lenis smooth scrolling).
    - `tailwindcss`, `postcss`, `autoprefixer` (not present in dependencies or devDependencies).

### 1.3 Configuration Files & Styling
- **`frontend/vite.config.js`**:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: { port: 3000, host: true }
  });
  ```
- **`frontend/tailwind.config.*` & `frontend/postcss.config.*`**:
  - Direct check `Test-Path frontend/tailwind.config.*; Test-Path frontend/postcss.config.*` returns `False, False`.
- **`frontend/index.html`**:
  - Tailwind is loaded via external script: `<script src="https://cdn.tailwindcss.com"></script>` (lines 12–32) with inline `tailwind.config` extending brand colors.
  - Fonts loaded: Only `Plus Jakarta Sans` (`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap`).
  - Missing fonts required by R3: `Cinzel` (`font-display`) and `Instrument Serif` (`font-serif`), as well as `Inter Tight` and `Space Grotesk`.
- **`frontend/src/index.css`**:
  - Lines 1–3 specify `@tailwind base; @tailwind components; @tailwind utilities;`.
  - Contains custom scrollbar styles and gradients: `.gradient-hero`, `.gradient-card-amber`, `.gradient-card-emerald`, `.badge-pulse`.

### 1.4 Directory & Source Inspection (`frontend/src/`)
- **Structure**:
  ```
  frontend/
  ├── index.html
  ├── package.json
  ├── vite.config.js
  ├── public/
  │   ├── icon.svg
  │   └── manifest.json
  └── src/
      ├── App.jsx            (898 lines, 52,126 bytes)
      ├── engine.js          (667 lines, 26,625 bytes)
      ├── index.css          (41 lines, 774 bytes)
      ├── main.jsx           (11 lines, 236 bytes)
      └── data/
          └── dossiers_db.json (7,937 lines, 466,531 bytes)
  ```
- **Photographic Assets**:
  - Neither `frontend/public/` nor `frontend/src/assets/` currently contains rural entrepreneur photographs.
  - `interactive_platform_prototype.html` currently references Unsplash CDN URLs.
- **`frontend/src/App.jsx`**:
  - Currently a monolithic prototype calculator covering Mode A (6 archetypes, parameter sliders, subsidy breakdown, DSCR chart, NSFDC quarterly table) and Mode B (informal debt entry, vernacular quote parsing, Damdupat check, refinancing relief calculation).
  - It does NOT yet contain the 6 Walton-style scroll scenes or the SETO minimal dashboard layout.

### 1.5 Python Engine vs Frontend JavaScript Engine
- **Python Engine (`engine/nsfdc_calculator.py`)**:
  - 533 lines, class-based architecture (`NSFDCCalculator`).
  - Unit tests: `python -m unittest tests/test_nsfdc_calculator.py` runs 13 tests in 0.001s, all `OK`.
- **Frontend Engine (`frontend/src/engine.js`)**:
  - 667 lines, ES Module exports.
  - Node verification test: `node tests/test_frontend_engine.mjs` runs full suite, reports `All frontend/src/engine.js tests PASSED successfully!`.
- **Statutory Comparison**:
  | Statutory Parameter | `engine/nsfdc_calculator.py` | `frontend/src/engine.js` | Parity Status |
  | :--- | :--- | :--- | :--- |
  | Income Ceiling | ₹5,00,000 (effective 07 Jan 2026) | `INCOME_CEILING_INR = 500000.0` | 100% Identical |
  | Max Project Cost | ₹50,00,000 | `MAX_PROJECT_COST_INR = 5000000.0` | 100% Identical |
  | MCF Cost Cap | ₹1,40,000 | `MCF_COST_CAP_INR = 140000.0` | 100% Identical |
  | MCF Loan Cap | ₹1,25,000 (hard cap) | `MCF_LOAN_CAP_INR = 125000.0` | 100% Identical |
  | MCF Equity at Cap | ₹15,000 (10.71%) | `MCF_EQUITY_AT_CAP_INR = 15000.0` | 100% Identical |
  | MCF Rate & Quarters | 6.5% p.a., 1 mora + 11 repay | 6.5% p.a., 1 mora + 11 repay | 100% Identical |
  | Term Loan Loan Cap | 90% up to ₹45,00,000 | `TERM_LOAN_LOAN_CAP_INR = 4500000.0` | 100% Identical |
  | Term Loan Rate & Quarters | 8.0% p.a., 2 mora + 26 repay | 8.0% p.a., 2 mora + 26 repay | 100% Identical |
  | PM Vishwakarma Fitting | D18, D19, D20, D21 with PMEGP 5-yr rule | Same 4 domains, PMEGP 5-yr rule | 100% Identical |
  | Additional in `engine.js` | N/A | 6 Archetypes, 12-month seasonality weights, State multipliers, Mode B Vernacular Parser ("senkda"), Damdupat rule audit | Clean extension |

### 1.6 Build Verification & Syntax Error in `frontend/src/App.jsx`
- Command: `cd frontend; npm run build`
- Output:
  ```
  > rural-enterprise-advisory-platform@1.0.0 build
  > vite build

  vite v6.4.6 building for production...
  transforming...
  ✓ 3 modules transformed.
  ✗ Build failed in 175ms
  error during build:
  [vite:esbuild] Transform failed with 1 error:
  C:/Users/LENOVO/Desktop/IPL 2 Project Research/frontend/src/App.jsx:589:14: ERROR: Unterminated regular expression
  file: C:/Users/LENOVO/Desktop/IPL 2 Project Research/frontend/src/App.jsx:589:14

  587|              </div>
  588|            </div>
  589|          </div>
     |                ^
  590|          )}
  ```
- **Root Cause**:
  In `frontend/src/App.jsx`, line 589 contains an extraneous `</div>` after the Mode A container has already closed at line 588. When esbuild encounters `</div>` outside of valid JSX tag nesting, it parses the slash `/` as an unclosed regex literal, aborting the build.
- **Network / Tooling Behavior**:
  CLI commands inside the sandbox block outgoing internet requests to `registry.npmjs.org`. When running package installs, commands must execute with `BypassSandbox: true`.

---

## 2. Logic Chain

1. **Target Deliverable Analysis**:
   - `ORIGINAL_REQUEST.md` requires replacing or restructuring `frontend/src/` to present a 6-scene scroll narrative (Pinned Hero Dispersion, Vertical Line Drop, Orbital Vortex, Full-Bleed Immersion & Arc Gauge, Platform in 4 Pillars, SETO Minimal Dashboard Mockup).
   - A complete reference prototype of all 6 scenes already exists in `interactive_platform_prototype.html` (1305 lines).

2. **Package & Runtime Requirements**:
   - Scene 1 requires ScrollTrigger pin & dispersion scrub. Scene 2 requires line draw scrub. Scene 3 requires orbital tile clustering. Scene 4 requires arc gauge animation.
   - Smooth inertia scrolling requires Lenis.
   - Therefore, `gsap` and `lenis` must be added to `frontend/package.json` dependencies.

3. **Styling & Asset Strategy**:
   - Currently, `frontend/index.html` relies on CDN Tailwind and is missing Cinzel / Instrument Serif fonts.
   - For an autonomous production build (`npm run build`), either:
     - Tailwind CSS and PostCSS must be formally installed (`tailwindcss`, `postcss`, `autoprefixer` or `@tailwindcss/vite`), OR
     - If using Tailwind CDN, `frontend/src/index.css` must remove `@tailwind base;` directives so Vite's CSS parser does not throw missing plugin warnings.
   - Google Fonts link in `frontend/index.html` must be updated to include Cinzel, Instrument Serif, Inter Tight, and Space Grotesk.
   - High-refinement imagery must be placed in `frontend/public/images/` or `frontend/src/assets/` rather than relying exclusively on remote Unsplash URLs.

4. **Engine Parity**:
   - `frontend/src/engine.js` has already completed the statutory translation of `engine/nsfdc_calculator.py`.
   - Both engines pass 100% of their test suites.
   - The SETO dashboard mockup in Scene 6 can directly import and invoke `evaluateIncubation`, `evaluateRestructuring`, `checkNSFDCEligibility`, and `NSFDC_CONSTANTS` from `frontend/src/engine.js` without any external backend dependencies.

---

## 3. Caveats

1. **Active Node Modules**:
   `pnpm install` was run to verify package resolution and esbuild behavior. Dependencies are currently present in `frontend/node_modules/`.
2. **React 19 Compatibility**:
   React 19 does not alter standard `useRef`, `useState`, `useEffect` hooks used by GSAP and Lenis. GSAP and Lenis work cleanly in React 19 client components when initialized in `useEffect` or `useLayoutEffect`.
3. **Mockup Interactivity Scope**:
   Per R3 Acceptance Criteria, the SETO dashboard interactivity must remain strictly limited as a mockup (domain presets, statutory verification badge, quick action pills, tab toggles) without creating unbuilt backend API dependencies.

---

## 4. Conclusion

The frontend foundation is in a high-readiness state, with the financial engine (`frontend/src/engine.js`) already exhibiting 100% statutory parity and passing all tests.

To transition `frontend/` into the production deliverable satisfying all R1–R3 criteria:
1. **Dependencies**: Add `gsap` and `lenis` to `frontend/package.json` (install with `BypassSandbox: true`).
2. **Typography**: Add `Cinzel` (600, 700, 800, 900) and `Instrument Serif` (italic/normal) to `frontend/index.html`.
3. **Component Architecture**: Modularize `frontend/src/` into:
   - `src/components/NavigationCapsule.jsx` (persistent right pill indicator)
   - `src/components/Header.jsx` (emblem lockup and quick CTA)
   - `src/components/scenes/Scene1Hero.jsx` (pinned condensed serif with dispersing photo cards)
   - `src/components/scenes/Scene2Thesis.jsx` (vertical line drop and statutory thesis)
   - `src/components/scenes/Scene3Orbit.jsx` (orbiting photo vortex around [ 02 ])
   - `src/components/scenes/Scene4Immersion.jsx` (full-bleed harvest with SVG radial arc gauge)
   - `src/components/scenes/Scene5Pillars.jsx` (4 platform cards)
   - `src/components/scenes/Scene6Dashboard.jsx` (SETO minimal dashboard mockup)
4. **Build Readiness**: Remove the orphaned `</div>` syntax error currently present in the old `App.jsx` and ensure clean Vite bundling with exit code 0.

---

## 5. Verification Method

### 5.1 Financial Engine Verification
- **Python Engine**:
  ```powershell
  python -m unittest tests/test_nsfdc_calculator.py
  ```
  *Expected*: Ran 13 tests in 0.001s, OK.
- **JavaScript Engine**:
  ```powershell
  node tests/test_frontend_engine.mjs
  ```
  *Expected*: `All frontend/src/engine.js tests PASSED successfully!`.

### 5.2 Build Verification
- **Test Build**:
  ```powershell
  cd frontend
  npm run build
  ```
- **Invalidation Condition**:
  Build fails if `App.jsx:589` syntax error remains unaddressed, if `@tailwind` directives exist without PostCSS plugins, or if missing packages (`gsap`, `lenis`) are referenced before installation.
