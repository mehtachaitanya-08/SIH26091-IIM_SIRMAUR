# Task Assignment — Explorer 2 (Survey: Auth, Demo Elimination & Profiles)

## Objective
Survey the codebase for Requirement 2: Production Google Authentication & Demo Mode Elimination.
Catalog all demo modes, mock data, and hardcoded "Ramesh" profiles across frontend and data stores. Investigate Google OAuth 2.0 implementation requirements and .env configuration.

## Working Directory
`c:\Users\LENOVO\Desktop\IPL 2 Project Research`

## State Folder
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2`

## Mandatory Input
Read `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md` before starting.

## Scope of Investigation
1. Catalog Mock & Demo Occurrences:
   - Search across the entire codebase (`frontend/`, `backend/`, `data/`, etc.) for:
     * "Ramesh", "Ramesh Kumar"
     * "demo", "isDemo", "DEMO_MODE", demo toggles, mock data
     * Mock user profiles, hardcoded credentials, mock storage
   - List every file path and line number where these exist.
2. Current Authentication Mechanism:
   - Identify how login is currently handled in the frontend (components, contexts, hooks, services).
   - What happens when a user clicks the Google login button right now?
   - What state stores user authentication status?
3. Real Google OAuth 2.0 Integration:
   - Determine the cleanest and most robust way to integrate Google OAuth 2.0 in the Vite + React frontend (and backend if needed for token verification).
   - Examine environment variables (.env / .env.example / .env.local).
   - Check what packages or libraries are currently installed or needed for Google OAuth (e.g. `@react-oauth/google`, Google Identity Services script, etc.).
   - Define the exact configuration steps and fallback/error handling needed.

## Deliverables
Write your comprehensive analysis and evidence to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\survey_report.md`
and write your self-contained handoff report to:
`c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\handoff.md`

Remember: You are read-only. Do not edit source code. Include exact file paths and line numbers.


## 2026-11-10T11:05:00Z
You are a read-only exploration agent.
Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Your state folder: c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2
Read your task assignment at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\DISPATCH.md
Read the user requirements at c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\ORIGINAL_REQUEST.md
Catalog all demo modes, mock data, and hardcoded 'Ramesh' profiles across frontend and data stores. Investigate Google OAuth 2.0 implementation requirements and .env configuration.
Write your detailed report to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\survey_report.md
Write your self-contained handoff to c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_survey_2\handoff.md
When finished, send a message to the orchestrator (caller) stating your findings and referencing the report paths.
