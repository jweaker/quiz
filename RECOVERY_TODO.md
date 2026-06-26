# Recovery TODO

## P0 - Must be correct for live show
- [x] Restore legacy Question flow regressions (chess clock, debate timing, rapid A/B).
- [x] Restore updated Arabic naming (`نوافذ المعرفة`, `حقل الالغام`).
- [x] Add quick side-swap and cursor hide keyboard controls in legacy flow.
- [ ] Verify all keyboard mappings end-to-end with a dry-run script per section.
- [ ] Validate scoring math for each section with test cases.
- [ ] Resolve any remaining sound-effect trigger gaps in both legacy and operator modes.
- [x] Fix operator windows flow to support direct question selection (non-sequential).
- [x] Restore windows question timer visibility on audience display.
- [x] Align poetic chase base scoring with requested rules (+1 / +0 / +0).
- [x] Prevent stale timers from leaking between sections/reloads.

## P1 - Operator/Audience production readiness
- [ ] Run operator + audience full rehearsal path (section by section) and fix desync bugs.
- [ ] Align Poetic Chase pass rules fully to spec (same-letter return rule state).
- [ ] Confirm Ask Smartly grid behavior and scoring workflow.
- [ ] Ensure rapid section enforces a fixed 20-question symmetric run.
- [ ] Add clear on-screen operator cheat-sheet for all hotkeys.

## P1 - Episode data and editor quality
- [ ] Finalize episode schema for 2026 rules (minefield semantics, section-specific settings).
- [ ] Add schema migration utility for old episode JSON files.
- [ ] Improve editor UX for per-section durations and 20-question rapid authoring.
- [ ] Add validation warnings for missing/invalid section data before showtime.

## P2 - Visual and broadcast polish
- [ ] Define Ramadan visual theme tokens for both operator and audience experiences.
- [ ] Improve audience transitions and section identity animations.
- [ ] Audit scaling at 1080p/1440p/4K and safe-area clipping.
- [ ] Add broadcast-safe lower-third/obstruction preview tooling.

## P2 - Reliability and maintainability
- [ ] Add unit tests for timer math and scoring reducers.
- [ ] Add integration tests for section navigation + key events.
- [ ] Add a rehearsal reset command to clear persisted stores quickly.
