#!/usr/bin/env python3
"""
GraminAI Backend Server Runner
Usage:
    python scripts/run_backend.py [--host 127.0.0.1] [--port 8000]
"""

import argparse
import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from engine.server import run_server


def main():
    parser = argparse.ArgumentParser(description="GraminAI Deterministic Financial Engine REST Server")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"), help="Host address to bind (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)), help="Port to listen on (default: 8000)")
    args = parser.parse_args()

    print(f"================================================================")
    print(f"  GraminAI — AI-Driven Rural Micro-Enterprise Advisory Server  ")
    print(f"  Statutory Mandate: MoSJE / NSFDC (SIH26091)                   ")
    print(f"================================================================")
    print(f"Starting server at http://{args.host}:{args.port}")
    run_server(host=args.host, port=args.port)


if __name__ == "__main__":
    main()
