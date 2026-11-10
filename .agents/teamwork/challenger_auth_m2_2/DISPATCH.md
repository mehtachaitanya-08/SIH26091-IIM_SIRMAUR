# Challenger Task Assignment — Challenger 2 (Milestone M2)

## Objective
Empirically test dynamic profile rendering and SSR fidelity for Milestone M2: Google Authentication & Demo Elimination.
Verify that all dashboard elements render dynamically for various real profiles and that SSR matches the client build.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_2`

## Mandatory Input Files
Read before starting challenge:
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md`
- `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\handoff.md`

## Challenge Tasks
1. Test Dynamic Rendering:
   - Test rendering of `SetoDashboard` with different user profiles (e.g. `{ name: 'Ananya Sharma', category: 'SC', id: 'UP-LKN-992100' }`, `{ name: 'Vikram Das', category: 'SC', id: 'UP-VNS-110293' }`, and unauthenticated `currentUser = null`).
   - Confirm that header greeting, beneficiary verification modal, bottom user card, and DPR summary all display the actual user's data dynamically.
2. Verify SSR & Build:
   - Run `node test/render_check.mjs` in `frontend/`.
   - Run `cd frontend; node --test test/*.js`.
   - Run `cd frontend; npm run build`.

## Deliverables
Write your challenge report and verdict (`APPROVE` or `REQUEST_CHANGES`) to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_2\handoff.md`
Send a completion message to the orchestrator with your verdict.


## 2026-11-10T12:53:41Z
You are an adversarial challenger agent.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_2
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_2\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture at c:\Users\LENOVO\Desktop\IPL 2 Project Research\PROJECT.md
Read Worker M2's handoff report at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\worker_auth_m2\handoff.md

Empirically test dynamic profile rendering across all views and SSR bundle fidelity against client build.
Write your challenge report and verdict (APPROVE or REQUEST_CHANGES) to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\challenger_auth_m2_2\handoff.md
Send a completion message to the caller with your verdict and report path.
