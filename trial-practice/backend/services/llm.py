"""LLM integration layer powering the multi-agent courtroom for the defense rehearsal.
Encapsulate prompt templates, conversation chains, safety guards, and reasoning steps so agents can collaborate while keeping the defendant attorney user centered.
Guidelines:
  - Provide reusable helpers for system prompts, user context injection, history trimming, and response parsing across agents.
  - Include metrics/tracing hooks to monitor latency, errors, and any hallucination so coaching notes can make adjustments.
  - Support switching providers or models per scenario while reliably injecting the user's role, defense goals, and current evidence.
"""

# LLM adapters and prompt helpers go here.
