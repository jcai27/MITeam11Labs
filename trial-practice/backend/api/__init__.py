"""API layer that helps the defendant attorney begin and monitor rehearsals.
This package exposes session/scenario operations to webhooks, CLI tools, or gRPC so the user can request courtroom practice, resume a paused cross-examination, or fetch coaching tips.
Guidelines:
  - Keep each endpoint lightweight: parse the defense-focused inputs, route to services, and format responses for the UI or CLI voice controls.
  - Prefer data models from `models` for request/response payloads to ensure consistent session state and transcripts.
"""

# API helpers and factories go here.
