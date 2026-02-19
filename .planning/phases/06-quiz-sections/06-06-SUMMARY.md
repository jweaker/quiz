---
phase: 06-quiz-sections
plan: 06
subsystem: ui
tags: [css-grid, motion, zustand, broadcast-channel, animation]

# Dependency graph
requires:
  - phase: 06-quiz-sections-05
    provides: Ask Intelligently base panel with composite animals.png and point deduction
provides:
  - 72-cell interactive grid overlay on Ask Intelligently for both operator and audience
  - Per-animal reveal state (revealedAnimals) in sectionState with BroadcastChannel sync
  - Animated reveal effects on audience display (scale+fade with emerald highlight)
affects: [07-audio-episode]

# Tech tracking
tech-stack:
  added: []
  patterns: [css-grid-overlay-on-background-image, per-cell-reveal-state-array, AnimatePresence-per-grid-cell]

key-files:
  created: []
  modified:
    - src/state/showStore.ts
    - src/components/operator/sections/AskIntelligentlyPanel.tsx
    - src/components/audience/sections/AskIntelligentlyDisplay.tsx

key-decisions:
  - "CSS grid overlay with background-image approach — 72 divs over animals.png rather than individual image slicing"
  - "revealedAnimals as number[] (cell indices 0-71) — simple array with .includes() check, adequate for 72 items"
  - "Cell click combines reveal + point deduction in single action — no separate Q-key needed for grid clicks"

patterns-established:
  - "Grid overlay pattern: position:relative container with bg-cover + absolute inset-0 grid for interactive cells"
  - "AnimatePresence per-cell: each grid cell wraps its reveal indicator in AnimatePresence for independent animations"

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 6 Plan 6: Ask Intelligently Grid Overlay Summary

**72-cell CSS grid overlay on animals.png composite with per-animal reveal tracking and animated audience highlights via BroadcastChannel sync**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-19T07:42:06Z
- **Completed:** 2026-02-19T07:45:13Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `revealedAnimals: number[]` to sectionState for per-animal reveal tracking
- Replaced static image thumbnails with interactive 9x8 CSS grid overlay on both operator and audience displays
- Operator can click individual cells during active phase to mark animals as revealed (dark overlay + point deduction)
- Audience display shows animated emerald highlights (scale+fade via motion.div + AnimatePresence) when cells are revealed

## Task Commits

Each task was committed atomically:

1. **Task 1: Add revealedAnimals state and upgrade operator grid** - `c5e1bac` (feat)
2. **Task 2: Upgrade audience display with animated grid reveal** - `1cf5ab0` (feat)

## Files Created/Modified
- `src/state/showStore.ts` - Added revealedAnimals: number[] to sectionState type and defaultSectionState
- `src/components/operator/sections/AskIntelligentlyPanel.tsx` - Replaced static img with clickable 9x8 CSS grid overlay on animals.png background
- `src/components/audience/sections/AskIntelligentlyDisplay.tsx` - Replaced static img with animated grid overlay driven by revealedAnimals store state

## Decisions Made
- CSS grid overlay with background-image: 72 invisible divs overlaid on a bg-cover container, rather than slicing the composite into 72 individual images. Simpler, single-asset approach.
- Cell click integrates both reveal marking and point deduction: clicking a cell adds its index to revealedAnimals AND calls the scoring logic, avoiding need for separate Q-key when using grid.
- Q key still works for non-grid deductions (backwards compatibility with original workflow).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 gap closure complete — Ask Intelligently now has the per-animal interaction required by SECT-09
- All quiz sections verified with interactive grids, reveal states, and broadcast sync
- Ready for Phase 7 (Audio & Episode Management)

---
*Phase: 06-quiz-sections*
*Completed: 2026-02-19*
