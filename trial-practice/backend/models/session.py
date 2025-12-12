"""Data model describing a courtroom rehearsal revolving around the defendant attorney user.
Include fields for session id, user role (defense), current phase, active agent states, transcripts, coaching cues, and evaluation metrics.
Guidelines:
  - Keep the model serializable for storage or transmission to CLI/UI clients.
  - Provide factory helpers for new defense sessions plus resume checkpoints.
  - Document which services mutate each field so the trial engine and APIs remain consistent.
"""

# Session data structures live here.
