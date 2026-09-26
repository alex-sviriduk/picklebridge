# Architecture

## State and ownership

`App` owns the committed player profile and simple hash navigation. Feature components keep temporary form state locally. A successful domain mutation is validated and written to the repository **before** the UI accepts the new profile. Failed storage writes therefore cannot produce a false success notification or discard the open session form.

`PlayerProfile` contains user-entered assessment, sessions, explicit issue events, pinned/dismissed topics, issue resolution dates, a focus-change journal, plan rotation and recent chat. Assessment, transfer/habit content and derived coaching context remain distinct. Transfer maps and current priorities are derived instead of stored as competing copies.

Changing sport retains session history, recomputes the transfer pathway, and clears sport-specific manual focus overrides. Reset deletes only the app's storage key and requires visible confirmation. Session dates are local calendar dates; creation/update timestamps are ISO instants.

## Persistence boundary

`PlayerRepository` supports load, save, reset and raw backup access. `LocalPlayerRepository` uses the `picklebridge.profile.v1` key with `{version: 1, profile}`. Zod checks nested data on load and save. Unknown versions and malformed data enter recovery without overwriting the original value. Storage permission/quota failures are surfaced to the user.

No automatic lossy migration is performed. A future schema change should add a version-specific parser and explicit tested migration before writing a new version. A backend repository should introduce revisions/ETags and ownership checks rather than carrying forward local last-writer-wins behavior.

## Recommendation engine

The authored data layer provides stable topic IDs, sport pathways, common issue mappings and drill IDs. `detectIssues` applies a rolling thirty-day inclusive date window and takes the most recent ten sessions. Issue IDs are normalized and deduplicated within a session. Counts map to observation (1), emerging (2) and recurring (3+). Resolution uses a date watermark; same-day observations remain suppressed and a later date reopens the issue.

`prioritiesFor` combines starting rank, tennis-specific modifiers, level, goal matches, observed issues and explicit pins. It emits a score used only for ordering and a human-readable explanation. Counts are not measurements of actual competence. `generatePlan` ranks real library drills, excludes dismissed topics, rotates the top choices using a persisted counter, and adds a ten-minute play constraint. If externally supplied valid data dismisses every topic, it falls back to the library rather than crashing; normal UI operations prevent dismissing the final topic.

Time-dependent functions accept a reference date where useful for deterministic tests. Focus history captures the top three topics whenever a saved mutation changes their ordering. UI displays live recommendations, so expired observations disappear when the page recomputes even before the next saved focus-history entry.

## Coaching boundary

`CoachingEngine.respond(message, context)` returns a promise and a structured response with optional topic and drill ID. `buildContext` includes the full assessment, goals, strengths, current habits, top priorities, active issue observations and five recent sessions. The local implementation performs bounded topic matching and assembles likely cause, background connection, cue, drill and next-session observation advice.

Unknown questions get an honest supported-topic fallback. Responses describe possible causes, not diagnoses. Coaching text is rendered as React text, never injected as HTML. User text is not executed. No frontend API secret exists.

## UI and accessibility

Shared components keep focus rows and drill cards consistent; routes retain different layouts for reports, chat, library and history. Native form controls have visible labels and browser validation. Pressed-state buttons represent multiselect choices. Save feedback uses live regions, errors use alerts, and focus outlines are visible. Desktop uses a fixed sidebar; mobile exposes all routes through a labeled select. The application does not depend on animation.

## Future server and video boundaries

Introduce `HttpPlayerRepository` or an asynchronous repository contract when adding server persistence. Put authentication, authorization, mutation validation, rate limits and audit events on the server. A future `RemoteCoachingEngine` should call a same-origin authenticated endpoint; the server obtains trusted current state and talks to the model provider. Client-supplied profile IDs must never authorize access.

Video is future work. A separate upload service could store consented clips and annotations. Any analysis should return uncertain observations linked to a timestamp and reviewable evidence, not mutate priorities as fact. File limits, private object storage, retention and deletion policies belong in that feature's design. No vision inference is claimed by this MVP.
