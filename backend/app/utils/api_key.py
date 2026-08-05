"""
Generates project API keys used by the tracking SDK to authenticate
event-ingestion requests (separate from user JWT auth).
"""
import secrets


def generate_api_key() -> str:
    return f"pap_{secrets.token_urlsafe(32)}"
