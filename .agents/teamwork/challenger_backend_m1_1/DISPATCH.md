# Challenger Task Assignment — Challenger 1 (Milestone M1)

## Objective
Empirically challenge Milestone M1: Backend REST Server & API Integration.
Write adversarial empirical stress tests, probe edge cases, evaluate boundary conditions, and verify mathematical correctness of the REST API and frontend client.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_1`

## Mandatory Input Files
Read before starting challenge:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\handoff.md`

## Challenge Tasks
1. Write and execute an empirical test script (e.g. in your state folder or running directly):
   - Test adversarial and boundary inputs to `engine/server.py`:
     * Negative project costs, zero family income, massive loans (>₹50L limit), non-SC profiles.
     * Ill-formed JSON payloads, extra/missing fields, unicode and sql-injection-like inputs in dossier query paths.
     * Damdupat extreme boundaries: where paidToDate is exactly equal to, less than, and greater than principal.
   - Test `frontend/src/services/api.js`:
     * Validate offline fallback behavior when backend is down/unreachable.
     * Validate output structures against expected schemas.
2. Verify system stability:
   - Does the server crash on unexpected requests? (It must return 400/404/500 JSON, never crash).

## Deliverables
Write your challenge report and verdict (`APPROVE` or `REQUEST_CHANGES`) to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_1\handoff.md`
Send a completion message to the orchestrator with your verdict.

## 2026-11-10T11:58:00Z
You are an adversarial challenger agent.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_1
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_1\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read Worker M1's handoff report at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_backend_m1\handoff.md

Empirically challenge engine/server.py and frontend/src/services/api.js with boundary values, stress tests, error conditions, and offline fallbacks.
Write your challenge report and verdict (APPROVE or REQUEST_CHANGES) to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_backend_m1_1\handoff.md
Send a completion message to the caller with your verdict and report path.

