"""
Secure Configuration & Secrets Management Module
Project: SIH26091 - AI-Driven Hyper-Local Rural MSME Advisory Platform

Architecture:
- Loads secrets from local .env or system environment variables.
- Enforces strict redaction on logging.
- Prohibits passing secrets to client-side bundles.
"""

import os
from pathlib import Path

def load_env_file(filepath: Path = None):
    """Safely parse a .env file into environment variables without shell evaluation."""
    if filepath is None:
        filepath = Path(__file__).resolve().parent.parent / ".env"
    
    if not filepath.exists():
        return
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("\"'")
                    if key and key not in os.environ:
                        os.environ[key] = val
    except Exception as e:
        # Avoid logging file contents or secret lines
        print(f"[SECURITY WARNING] Failed to load .env safely: {type(e).__name__}")

# Initialize environment
load_env_file()

def get_data_gov_api_key() -> str:
    """
    Retrieve the data.gov.in API key securely.
    Raises ValueError if key is not configured.
    """
    key = os.getenv("DATA_GOV_IN_API_KEY")
    if not key or key == "your_api_key_here":
        raise ValueError(
            "CRITICAL: DATA_GOV_IN_API_KEY is not set or using placeholder. "
            "Please configure your valid API key in .env or as a system environment variable."
        )
    return key

def get_masked_api_key() -> str:
    """Return a masked representation of the API key for safe debugging/telemetry."""
    try:
        key = get_data_gov_api_key()
        if len(key) <= 8:
            return "****"
        return f"{key[:4]}...{key[-4:]}"
    except Exception:
        return "[NOT CONFIGURED]"

if __name__ == "__main__":
    print(f"Configuration loaded successfully.")
    print(f"DATA_GOV_IN_API_KEY Status: {get_masked_api_key()}")

