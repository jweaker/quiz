---
phase: 06-quiz-sections
plan: 04
subsystem: ui
tags: [react, zustand, motion, debate, vote-reveal, animation, arabic-rtl]

# Dependency graph
requires:
  - phase: 06-01
    provides: sectionState slice with debateVotes/debateRevealedCount fields, section routing infrastructure
provides:
  - DebatePanel operator component with vote entry form and gated reveal sequence
  - DebateDisplay audience component with dramatic sequential vote reveal slots
  - Debate section fully wired into operator and audience routing
affects: [06-quiz-sections]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gated hotkey pattern: enableOnFormTags false + enabled conditional prevents Enter conflicts during form entry"
    - "Sequential reveal pattern: revealedCount threshold controls progressive slot visibility with AnimatePresence"
    - "Confirm-then-reveal pattern: local state form → store write → hotkey activation gate"

key-files:
  created:
    - src/components/operator/sections/DebatePanel.tsx
    - src/components/audience/sections/DebateDisplay.tsx
  modified:
    - src/screens/operator/OperatorControls.tsx
    - src/screens/audience/AudienceDisplay.tsx

key-decisions:
  - "Enter key gated with enableOnFormTags: false and debateVotes !== null to prevent accidental reveal during vote entry"
  - "Vote slots use scale+fade entrance animation (scale 0.3→1) for dramatic reveal feel"
  - "revealedCount === 4 signals scores applied (beyond the 3 vote slots) as a distinct final state"

patterns-established:
  - "Gated hotkey pattern: useHotkeys with enableOnFormTags: false + enabled conditional for form-coexisting hotkeys"
  - "Sequential reveal: threshold-based slot visibility with AnimatePresence for staggered dramatic reveals"

# Metrics
duration: 5min
completed: 2026-02-19
---

# Phase 06 Plan 04: Debate Section Summary

**Debate section with 6-field vote entry form, confirm gate, and 3-step dramatic vote reveal sequence using AnimatePresence**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-19T06:40:32Z
- **Completed:** 2026-02-19T06:46:07Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- DebatePanel with 6 numeric inputs (judges 0-9, audience 0-3, guest 0-3 per team), confirm button, and Enter-gated sequential reveal
- DebateDisplay with debate topic text pre-votes, dramatic scale+fade vote slot reveals, and total row with green checkmark on score application
- Enter key conflict resolution via enableOnFormTags: false and debateVotes !== null gate — prevents accidental reveal during vote entry
- Timer integration with T (start/stop) and Shift+T (reset to 40s second round)

## Task Commits

Each task was committed atomically:

1. **Task 1: DebatePanel — operator vote entry with confirm gate and reveal sequence** - `d3ee964` (feat)
2. **Task 2: DebateDisplay — audience view with topic and dramatic vote reveal slots** - `b24ae11` (feat)

**Plan metadata:** `34a2159` (docs: complete plan)

## Files Created/Modified
- `src/components/operator/sections/DebatePanel.tsx` - Operator panel with vote entry form (6 numeric inputs), confirm gate, Enter-key sequential reveal, timer hotkeys
- `src/components/audience/sections/DebateDisplay.tsx` - Audience display with debate topic text, 3 animated vote reveal slots, total row with checkmark
- `src/screens/operator/OperatorControls.tsx` - Added DebatePanel import and debate section route (committed in prior 06-03 plan as Rule 1 fix)
- `src/screens/audience/AudienceDisplay.tsx` - Added DebateDisplay import and debate section route

## Decisions Made
- Enter key gated with `enableOnFormTags: false` and `debateVotes !== null` to prevent accidental reveal during vote entry — matches Research Pitfall 2 guidance
- Vote slots use scale+fade entrance animation (scale 0.3→1, opacity 0→1, y: 60→0) for dramatic reveal
- `revealedCount === 4` used as distinct "scores applied" state beyond the 3 reveal slots
- Team name headers use VS separator between right/left team names from episode data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Debate section complete — all 6 quiz sections now have operator panels (Speed Question, Audience Questions, Ask Intelligently, Windows, Puzzle, Debate)
- Remaining plan 06-05 covers any final integration/wiring
- All sectionState fields from 06-01 are now consumed by their respective components

---
*Phase: 06-quiz-sections*
*Completed: 2026-02-19*

## Self-Check: PASSED

All files verified on disk, all commits verified in git log.
