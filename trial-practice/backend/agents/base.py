"""Shared abstractions for court agents that support the defendant attorney user.
Define the interface and helpers that every AI character (judge, prosecutor, witness, coach, and supporting defense assistant) should adhere to.
Guidelines:
  - Include lifecycle hooks (prepare, respond, finalize), state syncing, and logging helpers to keep the courtroom narrative consistent.
  - Provide utilities for scoring tone and pacing, referencing scenario facts, and tracking short/long-term context so agents can adapt to the user's defense strategy.
  - Surface metadata that lets the trial engine decide when to call for coaching cues, objections, or voice playback adjustments.
"""

# Agent base interfaces and utilities go here.
