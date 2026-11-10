# Challenger Task Assignment — Challenger 2 (Milestone M4: Final Stress & Regression Verification)

## Objective
Independently stress-test the entire production system, verifying regression freedom, numerical parity, and zero mock/demo remnants.
Test full build cycles, SSR rendering, Python test suites, and frontend test suites.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_e2e_m4_2`

## Mandatory Input Files
Read before starting challenge:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\orchestrator_dashboard\GATE_STATUS.md`

## Challenge Scope & Assertions
1. Verify mock elimination purity:
   - `git grep -i "ramesh" frontend/src/` must yield 0 results (exit code 1).
   - `git grep "9876543210" frontend/src/` must yield 0 results (exit code 1).
   - `git grep "UP-STP-008129" frontend/src/` must yield 0 results (exit code 1).
   - `git grep "रमेश" frontend/src/` must yield 0 results (exit code 1).
2. Verify production build and SSR compilation:
   - `cd frontend; npm run build` must complete with exit code 0.
   - `cd frontend; node test/render_check.mjs` must render >10,000 bytes with zero errors.
3. Verify test suites pass 100%:
   - `python -m unittest discover tests/` (all 78+ unit tests pass).
   - `cd frontend; node --test test/*.js` (all 187+ unit/integration tests pass).
4. Verify backend server and offline fallback parity:
   - Verify `engine/server.py` and `frontend/src/services/api.js` return consistent data.

## Deliverables
Write your challenge report and verdict (`APPROVE` or `REQUEST_CHANGES`) to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_e2e_m4_2\handoff.md`
Send a completion message to the orchestrator with your verdict.

