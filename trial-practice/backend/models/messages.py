"""Message payload definitions exchanged between courtroom agents and the defendant attorney user.
Define structures capturing speaker identity, timestamps, modalities (text/voice), context references, and moderation metadata.
Guidelines:
  - Align fields with the LLM and voice services for serialization and transcription.
  - Include metadata for pacing, tone, and persuasion scoring to feed coaching feedback.
  - Provide helpers for marshalling messages into ElevenLabs voice inputs and logging for review.
"""

# Message schemas and helpers live here.
