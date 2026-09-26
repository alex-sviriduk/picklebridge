# Agent design

## Implemented today

The browser uses `LocalCoachingEngine`, not an LLM. The following are real `PlayerService` methods, independently callable and tested through the same persistence boundary used by the UI:

| Method                                        | Behavior                                                             |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `get_player_profile()`                        | Load the validated committed profile                                 |
| `get_recent_sessions(profile)`                | Return ten most recent sessions                                      |
| `get_recurring_issues(profile)`               | Return active observations and emerging/recurring counts             |
| `log_session(profile, session)`               | Validate date/fields, deduplicate issues, save and recalculate focus |
| `update_player_focus(profile, topic, action)` | Pin, dismiss or restore a focus area                                 |
| `generate_drill_plan(profile)`                | Generate a deterministic plan from real library entries              |
| `record_issue(profile, issue)`                | Append an explicit date-stamped observation                          |
| `resolve_issue(profile, id)`                  | Suppress observations through the current calendar date              |

All mutation methods return the saved new profile. A caller must replace its previous profile with that result. These are application functions, not public HTTP endpoints. `record_issue` is separate from chat: the local coach does not mutate the profile based on a conversational statement.

The browser optionally registers two WebMCP tools: `get_training_summary` (read-only) and `open_session_logger` (navigation only). Both validate empty-object input and share live application state. They do not expose automatic chat mutations or reset. Feature detection and abort cleanup keep unsupported browsers functional.

## Future LLM flow

Example conceptual orchestration:

```text
User: My dinks popped up again today.

get_player_profile()
get_recent_sessions(profile)

Agent: Was this a separate session you want to log, or an observation only?
User: Just an observation. Record it.

profile = record_issue(profile, "dink-popups")
get_recurring_issues(profile)

The deterministic engine automatically elevates dink control when appropriate.
If the user explicitly wants to pin it:
profile = update_player_focus(profile, "dinks", "pin")

generate_drill_plan(profile)
```

An agent must not record the same incident both as an issue note and a session issue. The current UI avoids this ambiguity by logging only through the session form. A production agent should use idempotency keys, a shared observation identity and explicit confirmation before writes.

This differs from a basic chatbot because the application owns durable structured state, exposes constrained domain tools, computes recurring patterns deterministically, and can explain what changed. The model would provide conversational interpretation; it would not become the source of truth for profiles or recommendations.

## Server integration contract

The future HTTP boundary should accept a bounded message and conversation reference, authenticate the user, then load the profile server-side. It should return a validated `CoachResponse` and any separately approved committed changes. API credentials must be held in server secrets, never a `VITE_*` variable, browser bundle or repository.

Suggested server flow:

1. Authenticate and authorize the player; apply request-size and rate limits.
2. Rebuild coaching context from repository data rather than trusting a client-supplied profile.
3. Treat user notes, past chat and imported text as untrusted data.
4. Allowlist tool names and validate every argument with domain schemas. Reload current state before a mutation and use revision checks.
5. Stage proposed changes and obtain explicit confirmation; record idempotency/audit metadata.
6. Validate the response, preserve uncertainty, and link recommendations to real drill IDs.
7. On an unavailable provider, offer the current local engine with an explicit local-mode label.

No provider, model, paid service or endpoint has been wired into this repository. The base app always works without credentials. An actual backend and provider key are required only for the future remote agent.

## Evaluation cases

Preserve the current behavioral tests and add adversarial prompt-injection cases, contradictory profile data, unknown topics, false confidence, duplicate write attempts, stale profile versions and provider timeouts. Evaluate usefulness with transitioning tennis players and qualified coaches. Do not label routing heuristics as learned intelligence.
