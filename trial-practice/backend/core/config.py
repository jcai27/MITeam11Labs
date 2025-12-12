"""Configuration registry for the defendant attorney rehearsal arena.
Define structured settings (dataclasses or dicts) describing:
  - Model/agent selection, persona details for judge/prosecutor/witness/coach, rehearsal pacing, scoring thresholds, and user's baseline (defense strategy preferences).
  - Third-party integrations like LLM endpoints, ElevenLabs voice keys, session storage, and logging destinations that track the courtroom choreography.
  - Environment-specific overrides for sandbox, demo, or production rehearsals.
Guidelines:
  - Keep sensitive values configurable via env vars/shared secrets and make defaults safe for demo runs.
  - Document each section so orchestration code knows which keys agents/services expect.
"""

# TODO: Load and validate configuration data, expose typed accessors for runtime components.
