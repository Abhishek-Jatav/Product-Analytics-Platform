"""
Turns a workspace name into a URL-safe, unique-ish slug.
"""
import re
import uuid


def slugify(text: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    suffix = uuid.uuid4().hex[:6]
    return f"{base}-{suffix}" if base else f"workspace-{suffix}"
