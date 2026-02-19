---
phase: 06-quiz-sections
plan: 05
subsystem: ui
tags: [zustand, react-hotkeys-hook, motion, audience-display, operator-panel, animals-grid, timer]

# Dependency graph
requires:
  - phase: 06-quiz-sections
    provides: "sectionState slice (askedQuestions), section routing, section pair pattern"
provides:
  - "AskIntelligentlyPanel — operator controls with start/deduct/end workflow"
  - "AskIntelligentlyDisplay — audience view with composite animal grid image"
  - "Ask Intelligently section fully wired in both operator and audience screens"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Composite image placeholder: single animals.png displayed as grid until individual images collected"
    - "Local started state for operator-only UI phases (pre-start vs active)"
    - "Progress bar with color transitions (green>10, amber 5-10, red<5)"

key-files:
  created:
    - src/components/operator/sections/AskIntelligentlyPanel.tsx
    - src/components/audience/sections/AskIntelligentlyDisplay.tsx
  modified:
    - src/screens/operator/OperatorControls.tsx
    - src/screens/audience/AudienceDisplay.tsx

key-decisions:
  - "Local started state instead of sectionState flag — pre-start/active is operator-only UI concern"
  - "Composite animals.png as single image placeholder — future upgrade to 72-cell CSS grid when individual images collected"
  - "eager loading for 12MB image — section should preload immediately on entry"

patterns-established:
  - "Two-phase operator panel: pre-start (config + start) → active (controls + feedback)"
  - "Remaining points visualization: progress bar with color thresholds"

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 6 Plan 5: Ask Intelligently Section Summary

**Mouse-driven operator panel with +20 point start, per-question Q-key deduction with visual progress bar, and composite 72-animal grid image on audience display**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T06:40:28Z
- **Completed:** 2026-02-19T06:42:58Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- AskIntelligentlyPanel with two-phase UI: pre-start shows animal thumbnail + start button, active shows remaining points bar + deduct/end controls
- Start awards +20 to active team and begins 120s countdown via timerStore
- Q key / click deducts 1 point per question asked, tracked via sectionState.askedQuestions
- E key / click ends section early and stops timer
- AskIntelligentlyDisplay shows composite animals.png with object-contain, eager loading, and motion entrance animation
- Both screens wired: OperatorControls and AudienceDisplay route to respective components

## Task Commits

Each task was committed atomically:

1. **Task 1: AskIntelligentlyPanel — operator controls** - `73b52b2` (feat)
2. **Task 2: AskIntelligentlyDisplay — audience view** - `a891c21` (feat)

## Files Created/Modified
- `src/components/operator/sections/AskIntelligentlyPanel.tsx` - Operator panel with start/deduct/end controls, points progress bar
- `src/components/audience/sections/AskIntelligentlyDisplay.tsx` - Audience display with composite animal grid image and timer
- `src/screens/operator/OperatorControls.tsx` - Added AskIntelligentlyPanel import and section route
- `src/screens/audience/AudienceDisplay.tsx` - Added AskIntelligentlyDisplay import and section route

## Decisions Made
- Used local `started` state for pre-start/active phase tracking — this is operator-only UI state, not needed in sectionState broadcast
- Composite animals.png displayed as single image — documented future upgrade path for when individual animal images are collected
- Set `loading="eager"` on 12MB image to preload immediately when section enters

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ask Intelligently section complete — all 5 Phase 6 plans now have their section implementations
- 72 animal photos still need collection/licensing (noted in STATE.md) for future grid upgrade

---
*Phase: 06-quiz-sections*
*Completed: 2026-02-19*

## Self-Check: PASSED
