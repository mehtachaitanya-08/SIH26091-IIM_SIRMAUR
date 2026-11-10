# Challenger Task Assignment — Challenger 1 (Milestone M2)

## Objective
Empirically challenge Milestone M2: Google Authentication & Demo Elimination.
Stress-test auth flows, test unregistered users, invalid tokens, missing environment variables, and verify zero mock personas remain.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_1`

## Mandatory Input Files
Read before starting challenge:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\handoff.md`

## Challenge Tasks
1. Execute adversarial empirical tests:
   - Attempt login with missing, malformed, or null Google profile in `userDatabase.js` -> Must fail cleanly without injecting Ramesh Kumar.
   - Attempt login with unregistered mobile number in `App.jsx` -> Must return error, never fallback to demo user.
   - Test `googleAuth.js` with null/undefined client ID -> Must return error feedback, never crash.
2. Search codebase for leaked identifiers:
   - Verify `git grep -i "ramesh" frontend/src/` returns 0 matches.
   - Verify `git grep "9876543210" frontend/src/` returns 0 matches.
   - Verify `git grep "UP-STP-008129" frontend/src/` returns 0 matches.
3. Verify test runs:
   - `cd frontend; node --test test/*.js`
   - `python -m unittest discover tests/`
   - `cd frontend; npm run build`

## Deliverables
Write your challenge report and verdict (`APPROVE` or `REQUEST_CHANGES`) to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_1\handoff.md`
Send a completion message to the orchestrator with your verdict.


## 2026-11-10T12:53:31Z
You are an adversarial challenger agent.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_1
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_1\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read Worker M2's handoff report at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\handoff.md

Empirically challenge auth flows, test unregistered users, invalid tokens, missing environment variables, and verify zero mock personas remain via grep.
Write your challenge report and verdict (APPROVE or REQUEST_CHANGES) to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_1\handoff.md
Send a completion message to the caller with your verdict and report path.
