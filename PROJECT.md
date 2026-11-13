# Project: GraminAI Production Dashboard & Backend Integration

## Architecture
- **Backend**: Python 3.12 deterministic financial engines (`engine/nsfdc_calculator.py`, `engine/multi_archetype_financial_engine.py`) exposed via zero-dependency HTTP REST service (`engine/server.py` on `127.0.0.1:8000`).
- **Frontend**: Vite + React 19 + Tailwind CSS + Lucide React + GSAP ScrollTrigger + Lenis.
- **API Proxy**: Vite dev server proxies `/api` requests to backend on port 8000; `frontend/src/services/api.js` provides client calls with deterministic client-side fallback.
- **Authentication**: mobile number + 4-digit PIN, saved in this browser only (`frontend/src/data/userDatabase.js`). Google sign-in was removed on 12 Nov 2026 (owner: "no need for it"; it never had a real client ID). One demo account (mobile 9876543210, PIN 2026) lets judges sign in at once.
- **Dashboard Synchronization**: Single Source of Truth (SSOT) modular components under `frontend/src/components/dashboard/`. `SetoDashboard.jsx` renders Scene 6 mockup (`mode="mockup"`), while `ProductionDashboard.jsx` renders the live authenticated experience (`mode="production"`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | GitHub Upstream Sync | Verify local working tree contains all backend & ML updates from origin/main | M1 | Survey (Explorer 1) |
| 2 | Backend REST API Service | Lightweight zero-dependency HTTP server exposing calculation engines & dossiers | M1 | Survey (Explorer 1) |
| 3 | Vite API Proxy & Env Dir | Configure Vite proxy for `/api` and `envDir: '../'` to access root `.env` | M1 | Survey (Explorer 1) |
| 4 | Frontend API Client Service | Modular API service (`frontend/src/services/api.js`) with engine.js fallback | M1 | Survey (Explorer 1) |
| 5 | ~~Google Identity Services OAuth~~ | Removed 12 Nov 2026: sign-in is mobile number + PIN | M2 | Removed |
| 6 | ~~Root & Frontend .env Config for Google~~ | Removed 12 Nov 2026 with Google sign-in | M2 | Removed |
| 7 | Mock & Demo Elimination | Purge all `SEED_USERS`, fake profiles, and demo fallbacks from userDatabase.js & App.jsx | M2 | Survey (Explorer 2) |
| 8 | Dynamic Profile Binding | Replace hardcoded "Ramesh Kumar" references with dynamic `currentUser` props | M2 | Survey (Explorer 2) |
| 9 | Modular Dashboard Subcomponents | Modularize 3-column layout into `frontend/src/components/dashboard/` | M3 | Survey (Explorer 3) |
| 10 | SETO Visual Restoration | Restore `.diffused-backdrop` ambient canvas and 4-pointed iridescent star blossom | M3 | Survey (Explorer 3) |
| 11 | Dashboard & Mockup Synchronization | Single Source of Truth architecture sharing subcomponents between Scene 6 & main dashboard | M3 | Survey (Explorer 3) |
| 12 | End-to-End Test Suite Verification | Full suite passing: Python unit tests, React test harness, SSR render, build clean | M4 | Survey (All) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend REST Server & API Integration | `engine/server.py`, `tests/test_api_server.py`, `vite.config.js`, `frontend/src/services/api.js` | none | DONE |
| M2 | Sign-in (Google sign-in later removed, 12 Nov 2026) & Demo Elimination | `userDatabase.js`, `App.jsx`, test fixtures alignment | M1 | DONE |
| M3 | Modular Dashboard & Synchronization | `frontend/src/components/dashboard/`, `SetoDashboard.jsx`, `ProductionDashboard.jsx` | M2 | DONE |
| M4 | E2E Verification & Forensic Integrity Gate | Full test suites, clean build, zero mock data grep, adversarial audit | M3 | IN_PROGRESS |

## Interface Contracts

### Backend REST API (`engine/server.py` ↔ `frontend/src/services/api.js`)
- `GET /api/health` -> `{ status: "ok", version: "1.0.0", timestamp: string }`
- `POST /api/engine/nsfdc/calculate`
  - Input: `{ projectCost: number, familyIncome: number }`
  - Output: `{ tier: string, maxLoanAmount: number, promoterContribution: number, termYears: number, quarterlyInterestRate: number, moratoriumQuarters: number, amortizationSchedule: Array }`
- `POST /api/engine/mode-a/evaluate`
  - Input: `{ archetypeKey: string, scale: number }`
  - Output: `{ capex: number, monthlyOpex: number, revenue: number, seasonalDscr: Array, grantSubsidy: number }`
- `POST /api/engine/mode-b/restructure`
  - Input: `{ principal: number, monthlyRatePct: number, durationMonths: number }`
  - Output: `{ oldMonthlyInterest: number, newMonthlyEmi: number, monthlySavings: number, damdupatViolated: boolean }`
- `GET /api/dossiers` -> `{ count: number, dossiers: Array }`
- `GET /api/dossiers/:code` -> `{ code: string, title: string, capex: number, opex: number, ... }`

### Authentication (`userDatabase.js` ↔ `App.jsx`)
- Sign-in is mobile number + 4-digit PIN; accounts are kept in this browser only. Google sign-in (`googleAuth.js`) was removed on 12 Nov 2026, and `frontend/test/stageA_auth_removed.test.js` keeps it out.

### Dashboard Props (`DashboardShell`, `SetoDashboard`, `ProductionDashboard`)
- Props: `{ mode: "mockup" | "production", language: "en" | "hi", currentUser: UserProfile | null, onNavigate?: Function }`

## Code Layout
- `engine/server.py` — Python HTTP REST service
- `tests/test_api_server.py` — Backend REST API unit tests
- `frontend/src/services/api.js` — Frontend API client service
- `frontend/src/data/userDatabase.js` — Pure real user authentication storage
- `frontend/src/components/dashboard/` — Modular SSOT dashboard subcomponents
  - `DashboardShell.jsx`
  - `NavRail.jsx`
  - `CenterWorkspace.jsx`
  - `SeasonalitySimulatorView.jsx`
  - `NsfdcAmortizerView.jsx`
  - `DebtLiberationView.jsx`
  - `LeadBankDprView.jsx`
  - `CommandBar.jsx`
  - `ScenariosSidebar.jsx`
  - `StarBlossom.jsx`
  - `StatutoryVerificationModal.jsx`
- `frontend/src/components/SetoDashboard.jsx` — Synchronized Scene 6 mockup facade
- `frontend/src/components/ProductionDashboard.jsx` — Production authenticated dashboard
- `frontend/src/App.jsx` — Application routing and global auth state
