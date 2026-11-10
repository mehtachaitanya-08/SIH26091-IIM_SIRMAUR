Build production-grade dashboard functionality connected to the latest backend and ML models from GitHub, replacing demo modes and mock profiles with real Google authentication, and synchronizing design changes between the main dashboard and the landing page mockup.

Working directory: c:\Users\LENOVO\Desktop\IPL 2 Project Research
Integrity mode: development

## Requirements

### R1. GitHub Synchronization & Backend/ML Integration
Pull the latest backend services and ML model definitions from GitHub (origin/main). Connect frontend API services to the local backend and ML services running the updated models.

### R2. Production Google Authentication & Demo Mode Elimination
Eliminate all demo modes, mock data, and hardcoded "Ramesh" profiles across the frontend and data stores. Implement real Google OAuth 2.0 login when clicking the Google authentication option, loading credentials via environment configuration (.env).

### R3. Production Dashboard Implementation & Landing Page Synchronization
Build the production dashboard components matching the design established in SetoDashboard.jsx. Ensure all edits, components, and layout updates made to the main dashboard are reflected in the mockup dashboard on the landing page.

## Acceptance Criteria

### Authentication & Mode Removal
- [ ] Clicking Google login initiates the real Google OAuth flow instead of activating demo mode
- [ ] All demo toggles, mock data, and hardcoded "Ramesh" profile references are eliminated from the codebase
- [ ] Google authentication client credentials configure correctly from .env

### Backend & ML Connectivity
- [ ] Working tree incorporates the latest backend and ML model updates pulled from origin/main
- [ ] Frontend communicates with local backend and ML model service endpoints without errors

### Dashboard & Landing Page Synchronization
- [ ] Main dashboard displays production functionality matching established platform designs
- [ ] Landing page mockup dashboard reflects the structure, components, and styling of the main dashboard
- [ ] Frontend builds cleanly with zero errors (npm run build)
- [ ] Automated verification tests pass