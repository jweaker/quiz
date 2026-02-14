---
phase: 04-timer-system
plan: 02
subsystem: ui
tags: [react, zustand, worker-timers, react-hotkeys-hook, chess-clock, countdown, broadcast]

# Dependency graph
requires:
  - phase: 04-01
    provides: Timer infrastructure with drift-corrected countdown and audio cues
provides:
  - Chess clock hook with mutual exclusion and points conversion
  - Operator timer controls with full keyboard shortcuts
  - Audience timer display for countdown and chess clock
affects: [04-03, phase-05, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Mutual exclusion via single activeTimer state field
    - Points conversion formula: Math.floor(timeMs / 5000) for 5s = 1pt
    - Dual-mode UI component (countdown/chess-clock toggle)
    - Active team highlighting with gold glow pattern

key-files:
  created:
    - src/hooks/useChessClock.ts
    - src/components/operator/TimerPanel.tsx
    - src/components/audience/TimerDisplay.tsx
  modified:
    - src/screens/operator/OperatorControls.tsx
    - src/screens/audience/AudienceDisplay.tsx

key-decisions:
  - "Single activeTimer field ensures mutual exclusion - only one team's clock ticks at a time"
  - "Atomic switching via activeTimer state toggle (no race conditions)"
  - "Points conversion uses Math.floor for conservative rounding (5000ms = 1pt)"
  - "Audio thresholds (10s, 5s, 0s) tracked with Set ref to prevent duplicate beeps"
  - "Dual-mode TimerPanel with tab toggle between countdown and chess clock"
  - "Keyboard shortcuts follow operator panel pattern: enableOnFormTags: false"
  - "Western numerals class for all timer digits (Arabic interface, western numbers)"

patterns-established:
  - "Chess clock mutual exclusion: single activeTimer field in store, never two timers ticking simultaneously"
  - "Points preview calculation: displayed in real-time during chess clock countdown"
  - "Active team glow: reuse team-glow-active CSS class from TeamScore component"
  - "Threshold tracking: Set ref prevents duplicate audio/visual triggers on threshold crossings"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 4 Plan 2: Chess Clock UI Summary

**Chess clock with mutual-exclusion dual timers, real-time points conversion display (5s = 1pt), and full keyboard control for operator with broadcast-ready audience display**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-02-14T18:34:04Z
- **Completed:** 2026-02-14T18:37:04Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments
- Chess clock hook with atomic switching and mutual exclusion via single activeTimer field
- Operator TimerPanel with dual-mode UI (countdown/chess clock) and 8 keyboard shortcuts
- Audience TimerDisplay with side-by-side clocks, active team highlighting, and real-time points preview
- Points conversion formula visible to audience: remaining time converts to points (5s = 1pt)
- Full integration into operator controls and audience display screens

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chess clock hook with mutual exclusion and points conversion** - `5428ee2` (feat)
2. **Task 2: Create operator TimerPanel and audience TimerDisplay components** - `8bea6af` (feat)

## Files Created/Modified

**Created:**
- `src/hooks/useChessClock.ts` - Chess clock logic with mutual exclusion, points conversion, and audio cues
- `src/components/operator/TimerPanel.tsx` - Operator controls for countdown and chess clock with keyboard shortcuts
- `src/components/audience/TimerDisplay.tsx` - Audience-facing timer display (countdown or chess clock)

**Modified:**
- `src/screens/operator/OperatorControls.tsx` - Integrated TimerPanel below ScoringPanel
- `src/screens/audience/AudienceDisplay.tsx` - Integrated TimerDisplay within safe area

## Decisions Made

**Chess clock implementation:**
- Single `activeTimer` field in timerStore ensures mutual exclusion - only one team's clock ticks at a time, atomic switching prevents race conditions
- Points conversion uses `Math.floor(timeMs / 5000)` for conservative rounding (e.g., 4999ms = 0pt, 5000ms = 1pt)
- Audio thresholds tracked with Set ref to prevent duplicate beeps when crossing 10s/5s/0s

**UI patterns:**
- Dual-mode TimerPanel with toggle between countdown and chess clock modes
- Keyboard shortcuts: countdown (t, shift+t), chess clock ([, ], \\, p, shift+p) with enableOnFormTags: false
- Active team highlighted with gold glow (reuses team-glow-active CSS from TeamScore)
- Western numerals class applied to all timer digits for broadcast clarity

**Display behavior:**
- Audience display shows chess clock when activeTimer !== null OR timeMs < 100000 (detects in-progress state)
- Countdown color changes: white → yellow at 10s → red at 5s
- Points preview shown below each timer: "= X نقطة" for instant feedback

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components integrated smoothly with existing patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 04-03 (Poetic Chase Integration):**
- Chess clock fully functional with mutual exclusion and points conversion
- Operator has keyboard-only control of all timer functions
- Audience display shows real-time countdown with visual feedback
- Timer state syncs across operator/audience via BroadcastChannel
- Audio cues fire at configured thresholds (10s, 5s, 0s)

**Blockers/Concerns:**
None - chess clock and countdown timers are production-ready for Poetic Chase section.

## Self-Check: PASSED

All files created, commits exist, and key patterns verified:
- ✓ useChessClock.ts implements activeTimer mutual exclusion (11 references)
- ✓ Points conversion formula: Math.floor(timeMs / 5000)
- ✓ TimerPanel has 8 keyboard shortcuts via useHotkeys
- ✓ TimerDisplay uses team-glow-active pattern for active team
- ✓ Commits 5428ee2 and 8bea6af present in git history
- ✓ All 3 created files and 2 modified files exist

---
*Phase: 04-timer-system*
*Completed: 2026-02-14*
