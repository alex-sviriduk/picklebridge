# Verification record

Verified locally on Windows with Node 24.19.0. The project targets Node 22.12+ and CI runs Node 22. No CI run on a hosted GitHub repository is claimed.

## Automated checks

- Clean `npm install` using npm 10 and the supplied lockfile: passed.
- Reproducible `npm ci` in a disposable verification checkout: passed.
- `npm run typecheck`: passed.
- `npm test`: **44 tests passed**.
- `npm run build`: passed; Vite emits deployable static assets in `dist/`.
- Dependency audit from the clean install: **0 known vulnerabilities** at verification time.

The suite covers every sport's profile creation, required assessment validation, persistence round-trip/reset, corrupt and invalid nested data, failed writes, date-window edges, future dates, duplicate issues, custom issue normalization, recurrence thresholds, resolution/reopening, manual focus controls, goal/style effects, valid drill selection, plan rotation, dismissed-plan filtering, coaching context, service mutation persistence and supported/unknown coaching topics.

## Browser checks

Performed against the running local application using a disposable **Test player** profile and two explicitly labeled QA sessions:

- Completed all three onboarding steps and opened the personalized transfer report.
- Logged sessions and confirmed successful saves and visible history.
- Confirmed two dink pop-up observations produce an emerging issue and elevate dink control, with a written explanation.
- Reloaded and confirmed the profile and changed priorities persist.
- Asked the coach about dink pop-ups and verified it referenced the actual two recorded observations.
- Changed practice availability and regenerated the plan; opened a drill from the plan.
- Changed background to badminton, confirmed tennis-only questions disappear and existing sessions remain, then restored tennis.
- Pinned, unpinned, dismissed and restored a focus area.
- Reviewed desktop and 390px mobile layouts. Mobile dashboard/drill views had no page-level horizontal overflow.
- Validated optional WebMCP tool registration, training summary read-back, session-form navigation and intentional rejection of unexpected input keys.
- Opened the production build on its own local origin and confirmed onboarding renders with no browser warnings or errors. This clean preview contains no verification profile.

An initial sandbox restriction prevented esbuild from resolving dependencies. The final local preview and checks ran successfully with appropriate process permissions. During the switch from pnpm to npm dependencies, hot-reload clients briefly held old module references; a full reload resolved them. These development-only events are not present in the final production build.

## Limits of verification

Browser checks are recorded manual automation, not a committed Playwright CI suite. No external LLM, cloud persistence, deployment, authenticated backend, actual on-court improvement or video analysis was tested or claimed. Screenshots show test data, not athlete results.
