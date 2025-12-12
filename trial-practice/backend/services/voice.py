"""Voice service wrapper for ElevenLabs to narrate the courtroom agents while the defendant attorney user practices.
Convert agent messages into audio cues and coordinate playback so the user hears judge, prosecutor, witness, and coach content in turn.
Guidelines:
  - Convert structured agent messages into ElevenLabs-compatible audio inputs, manage rate limits, and handle per-session voice personas.
  - Support text fallback when voice synthesis is unavailable, and provide cues so the user knows when to respond.
  - Track active audio streams per session so coaching cues, judge prompts, and user narration stay synchronized.
"""

# Voice integration helpers go here.
