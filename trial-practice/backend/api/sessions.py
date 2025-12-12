"""Endpoint helpers around courtroom rehearsals where the user plays the defendant attorney.
Provide functions to create new sessions, resume paused trails, fetch status (active agents, transcripts, coaching cues), and expose evaluation feedback.
Guidelines:
  - Coordinate with `services.trial_engine` to orchestrate multi-agent interaction loops.
  - Use `models.session` to validate session state and persist checkpoints.
  - Normalize user inputs (scenario id, defense goals, voice preferences) before passing to downstream services.
"""

# Future session API implementations for initiating defense practice go here.
