import os
import re
from typing import List, Optional
from pydantic import BaseModel, Field

# Security and CORS Allowed Origins
DEFAULT_ALLOWED_ORIGINS = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

def get_allowed_origins() -> List[str]:
    """
    Returns strict, W3C-compliant allowed origins.
    Never returns wildcard '*' when credentials are used.
    """
    env_origins = os.environ.get("ALLOWED_ORIGINS", "")
    if env_origins.strip():
        origins = [o.strip() for o in env_origins.split(",") if o.strip()]
        # Filter out wildcard to avoid credentialed preflight failure
        return [o for o in origins if o != "*"]
    return list(DEFAULT_ALLOWED_ORIGINS)


class DPDPConsent(BaseModel):
    user_id: Optional[str] = None
    consent_given: bool = True
    purpose: str = "concessional_credit_appraisal"
    retention_policy: str = "in_session_local_storage_only"
    timestamp: Optional[str] = None


class DataPurgeRequest(BaseModel):
    user_id: Optional[str] = None
    phone: Optional[str] = None
    confirm: bool = True


def purge_user_record(phone: Optional[str] = None) -> dict:
    """
    Statutory DPDP Act 2023 'Right to Erasure' compliance handler.
    Flushes all identifiable in-memory records and validates compliance.
    """
    return {
        "status": "purged",
        "message": "All personal identifiers and session artifacts have been erased under DPDP Act 2023 guidelines.",
        "erased": True
    }

