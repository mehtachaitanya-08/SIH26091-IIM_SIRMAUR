## Task Assignment: Implementation Worker (Milestone 1)

Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
State folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_m1\
Original Request path: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Project path: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\orchestrator\PROJECT.md
UI-SPEC path: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\orchestrator\UI-SPEC.md

### Reference Reports to Read Before Writing Code
1. `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_m1_scenes\handoff.md` (Contains complete React 19 Lenis + GSAP ScrollTrigger choreography, timeline code, and styles for Scenes 1 to 5, nav capsule, and header).
2. `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_m1_seto\handoff.md` (Contains complete React component code and styles for Scene 6 SETO Minimal Dashboard, iridescent star blossom SVG, and `engine.js` live viewports).
3. `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_design_media\handoff.md` (Section 4.1 & 4.2: Asset inventory and `scripts/download_assets.py`).

### File Ownership
You have exclusive write ownership of:
- `frontend/package.json`
- `frontend/index.html`
- `frontend/src/index.css`
- `frontend/src/App.jsx`
- `frontend/public/images/*`
- `scripts/download_assets.py` (if created)

### Mandatory Tasks
1. Install required packages in `frontend/`: `npm install gsap lenis` (or add to `package.json` and run `npm install`).
2. Populate `frontend/public/images/` with the 16 local photographic assets using the script from `explorer_design_media/handoff.md`. Verify all 16 images exist locally on disk and are valid JPEGs.
3. Configure `frontend/index.html`: add Google Fonts link for Cinzel, Instrument Serif, Plus Jakarta Sans, Inter Tight, Space Grotesk. Remove any inline `<style>` blocks that cause Vite html-proxy errors during bundling.
4. Add custom utilities (`.diffused-backdrop`, `.soft-shadow`, `.soft-card-shadow`, `.iris-star-svg`, `@keyframes pulseStar`, `@keyframes pulseGlow`) to `frontend/src/index.css`.
5. Implement `frontend/src/App.jsx` synthesizing the blueprints from `explorer_m1_scenes/handoff.md` and `explorer_m1_seto/handoff.md` cleanly. Ensure all 6 scenes, persistent header, and right capsule progress indicator are rendered with full polish.
6. Run `npm run build` inside `frontend/` and ensure it completes with exit code 0 and zero bundling errors.
7. Write your handoff report to `handoff.md` in your state folder detailing build results, verification commands, and layout compliance.

### Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-09T22:25:38Z
You are the Frontend Implementation Worker for Milestone 1.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
State folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_m1\
Original Request path: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Project path: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\orchestrator\PROJECT.md
UI-SPEC path: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\orchestrator\UI-SPEC.md

Read your task assignment in `.agents/teamwork/worker_m1/DISPATCH.md` first.
Read the 3 reference reports:
- `.agents/teamwork/explorer_m1_scenes/handoff.md`
- `.agents/teamwork/explorer_m1_seto/handoff.md`
- `.agents/teamwork/explorer_design_media/handoff.md`

Your tasks:
1. Populate `frontend/public/images/` with all 16 local photographic assets using the script in `explorer_design_media/handoff.md`.
2. Add `gsap` and `lenis` to `frontend/package.json` and run `npm install`.
3. Update `frontend/index.html` with Google Fonts (Cinzel, Instrument Serif, Plus Jakarta Sans, Inter Tight, Space Grotesk) and remove any inline `<style>` blocks that break Vite bundling.
4. Update `frontend/src/index.css` with required tokens, keyframes (`pulseStar`), and styles.
5. Implement `frontend/src/App.jsx` cleanly incorporating Scenes 1 to 5 and Scene 6 (SETO Minimal Mockup Dashboard) per the exact blueprints.
6. Run `npm run build` in `frontend/` and verify exit code 0.
7. Deliver your report in `handoff.md` in your state folder and message the caller when done.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
