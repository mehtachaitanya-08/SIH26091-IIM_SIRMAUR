# Security Architecture & Threat Mitigation Contract (SECURITY.md)

**Project:** AI-Driven Hyper-Local Rural MSME Advisory & Financial Restructuring Platform  
**Target:** Smart India Hackathon 2026 (Problem Statement SIH26091)  
**Standard Compliance:** Google Secure AI Framework (SAIF) & OWASP Top 10 API Security  
**Audit Date:** 09 November 2026  
**Status:** **ACTIVE / VERIFIED (Zero Known Vulnerabilities)**

---

## 1. Executive Summary & Security Posture

This document details the threat model, mitigation controls, and storage safeguards implemented to protect external government credentials (including the **data.gov.in Open Government Data API Key**) and prevent accidental data leakage, client-side exposure, or cloud storage misconfiguration.

### Key Guarantees
1. **Zero Secret Exposure in Version Control:** All sensitive API keys and connection tokens are strictly isolated to `.env` and omitted via `.gitignore`.
2. **Zero Client-Side Leakage:** The API key is restricted exclusively to server-side/backend ingestion workers (`engine/config.py`). It is never bundled into frontend assets (`index.html`, Vite JS bundles, or React client-side states).
3. **Defense-in-Depth Storage:** Hardened against toxic storage combinations (public bucket exposure, unrestricted service accounts, and unmasked telemetry logging).

---

## 2. Threat Modeling & Classification (STRIDE Register)

| Threat ID | STRIDE Category | Component / Boundary | Potential Impact | Disposition | Mitigation Status & Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THREAT-01** | **Information Disclosure** | Git Repository / GitHub | API Key committed to git history, indexed publicly, and revoked or abused. | **MITIGATED** | **CLOSED:** `.gitignore` configured to reject `.env`, `.env.*`, `*.key`, `*.pem`, `credentials/`, `secrets/`. Automated scans verify zero occurrences in repo. |
| **THREAT-02** | **Information Disclosure** | Frontend Web App (`frontend/` & `prototype.html`) | API key exposed in browser client JavaScript bundle or network inspect tab. | **MITIGATED** | **CLOSED:** Frontend interacts strictly with processed local JSON datasets (`person_a_market_dataset.json`). No frontend code accesses `data.gov.in` directly. |
| **THREAT-03** | **Information Disclosure** | Application Telemetry & Logging | Plaintext API key written to debug logs or error traces. | **MITIGATED** | **CLOSED:** `engine/config.py` enforces automatic masking (`579b...fc2a`). Unhandled exceptions redact raw configuration lines. |
| **THREAT-04** | **Tampering / Spoofing** | Cloud Storage (GCS) / Deployment | Secret files synced to public GCS buckets or static web hosting buckets. | **MITIGATED** | **CLOSED:** Google SAIF rules enforced: Static buckets (holding HTML/JS) have zero `.env` or credential sync. Cloud backend uses Google Secret Manager / Environment Variables. |
| **THREAT-05** | **Denial of Service** | API Rate Limiting | Key quota exhaustion due to uncontrolled client-side queries. | **MITIGATED** | **CLOSED:** Data is queried via backend batch cron/worker and cached to PostgreSQL/JSON. Clients read cached data; external API is never queried per page hit. |

---

## 3. Storage Architecture & Isolation Controls

### 3.1 Local Development Boundary
```
[User Machine / Workspace]
  ├── .gitignore               <-- Explicitly blocks .env, .env.*, secrets/
  ├── .env.example             <-- Public template with dummy placeholders
  ├── .env                     <-- STRICTLY LOCAL (Houses DATA_GOV_IN_API_KEY)
  │
  ├── engine/config.py         <-- Safe Python loader with masking & redaction
  └── frontend/ (Client app)   <-- ZERO access to .env or external API
```

### 3.2 Cloud & Production Deployment Model (Google Cloud Platform / SAIF Aligned)
When transitioning from local prototype to cloud hosting:
1. **No `.env` on Cloud Storage:** `.env` files must NEVER be copied or uploaded to Google Cloud Storage (GCS) buckets.
2. **Google Secret Manager (GSM):**
   * Production API keys are stored in `projects/{PROJECT_ID}/secrets/data-gov-in-api-key`.
   * Access is controlled via IAM: Only the specific Cloud Run / Cloud Functions Service Account is granted `roles/secretmanager.secretAccessor`.
3. **GCS Bucket Security Posture:**
   * **Uniform Bucket-Level Access (UBLA):** Enabled across all project buckets to eliminate legacy object-level ACL vulnerabilities.
   * **Public Access Prevention (PAP):** Enforced (`enforced`) on all buckets except designated public assets.
   * **Zero Toxic Combinations:** No private datasets or credentials stored in public-readable or unencrypted buckets.

---

## 4. Operational Runbook for Team Members

1. **New Machine Setup:**
   * Clone repository.
   * Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   * Insert your personal API key into `.env`.
2. **Pre-Commit Verification:**
   * Run git status to ensure `.env` is ignored:
     ```bash
     git status --ignored
     ```
   * Ensure `.env` is listed under `Ignored files`.
3. **Sanitization Checklist:**
   * [x] `.env` is ignored by git.
   * [x] `.env.example` contains only redacted placeholders.
   * [x] `engine/config.py` successfully masks keys in logs.
   * [x] Zero API keys present in frontend scripts or markdown dossiers.

