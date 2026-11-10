# Challenger Task Assignment — Challenger 2 (Milestone M1)

## Objective
Empirically stress-test Milestone M1: Backend REST Server & API Integration.
Verify numerical precision, concurrency handling, and contract conformance between `engine/server.py` and `frontend/src/services/api.js`.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_2`

## Mandatory Input Files
Read before starting challenge:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\handoff.md`

## Challenge Tasks
1. Execute empirical verification:
   - Verify numerical parity between Python server outputs and client-side `engine.js` calculations for identical inputs across all 24 dossiers.
   - Test concurrent request simulation through `ThreadingHTTPServer` / `GraminAIRequestHandler`.
   - Test dossier search / code lookups for all valid codes (`D01` to `D24`), case-insensitivity (`d08` vs `D08`), and invalid codes (`D99`, `invalid`).
   - Verify CORS headers on all endpoints including OPTIONS preflight.
2. Verify all existing test suites pass:
   - `python -m unittest discover tests`
   - `cd frontend; node --test test/*.js`
   - `cd frontend; npm run build`

## Deliverables
Write your challenge report and verdict (`APPROVE` or `REQUEST_CHANGES`) to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_2\handoff.md`
Send a completion message to the orchestrator with your verdict.


## 2026-11-10T11:58:06Z
You are an adversarial challenger agent.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_2
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_2\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read Worker M1's handoff report at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\handoff.md

Empirically verify numerical precision across all 24 dossiers between server and engine.js, test concurrency, test CORS preflight, and verify test suites.
Write your challenge report and verdict (APPROVE or REQUEST_CHANGES) to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_2\handoff.md
Send a completion message to the caller with your verdict and report path.
