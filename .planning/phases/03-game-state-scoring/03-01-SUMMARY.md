---
phase: 03-game-state-scoring
plan: 01
subsystem: state
tags: [zundo, temporal, undo-redo, animations, score-display, zustand]

# Dependency graph
requires:
  - phase: 02-dual-screen-architecture
    provides: BroadcastChannel sync, dual-screen layout, showStore architecture
provides:
  - Temporal middleware wrapping showStore with 50-state undo/redo history
  - swapSides action for atomically swapping scores, team names, and turn state
  - Reusable TeamScore component with pop animation, delta indicators, and active team glow
  - ScoreOverlay for audience display (compact fixed overlay)
  - useScoreDelta hook for computing and displaying score deltas
affects: [03-02-keyboard-controls, future-undo-redo-ui]

# Tech tracking
tech-stack:
  added: [zundo@2.3.0, react-hotkeys-hook@5.2.4]
  patterns: [temporal-middleware-ordering, score-delta-animation, first-render-skip, variant-components]

key-files:
  created:
    - src/hooks/useScoreDelta.ts
    - src/components/score/TeamScore.tsx
    - src/components/audience/ScoreOverlay.tsx
  modified:
    - src/state/showStore.ts
    - src/styles/main.css
    - src/screens/audience/AudienceDisplay.tsx
    - src/screens/operator/OperatorControls.tsx

key-decisions:
  - "Middleware ordering: broadcast(persist(temporal(creator))) ensures temporal captures state before persist/broadcast"
  - "Temporal partialize: only track score-related fields (rightScore, leftScore, rightsTurn, turned, sidesSwapped) to avoid undo affecting non-scoring state"
  - "Pop & scale animation chosen over rolling counter/flip for simplicity, reliability, and broadcast sync"
  - "Single gold accent color for active team glow (not team-specific colors)"
  - "First-render skip in useScoreDelta prevents spurious delta indicators on page load"

patterns-established:
  - "Temporal middleware innermost: temporal must wrap creator before persist to capture raw state mutations"
  - "Variant components: TeamScore supports 'audience' (broadcast styling) and 'operator' (themed) variants"
  - "Delta fade pattern: 2-second CSS animation with cleanup on score change"
  - "GPU hints: will-change: transform on animated elements for hardware acceleration"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 03 Plan 01: Score State & Display Summary

**Temporal undo/redo middleware (limit: 50) wrapping showStore with swapSides action, reusable TeamScore components featuring pop animations and 2-second delta fade-out, and gold glow transitions on turn changes**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-02-14T13:07:09Z
- **Completed:** 2026-02-14T13:10:47Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Temporal middleware integrated with proper ordering (innermost wrapper) and partialization to score fields
- Atomic swapSides action swaps scores, team names, and turn state in single operation
- Reusable TeamScore component with pop & scale animation, delta indicators (+N/-N), and smooth glow transitions
- Compact ScoreOverlay for audience display with always-visible fixed positioning
- CSS-only animations (score-pop, delta-fade) for 60fps performance without JavaScript animation libraries

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and extend showStore with temporal middleware and swapSides** - `204d04c` (feat)
2. **Task 2: Create score display components with pop animation, delta indicator, and glow effect** - `21e9524` (feat)

## Files Created/Modified

### Created
- `src/hooks/useScoreDelta.ts` - Hook that computes delta from score changes, skips first render, clears after 2s
- `src/components/score/TeamScore.tsx` - Reusable team score with animations, delta, glow (audience/operator variants)
- `src/components/audience/ScoreOverlay.tsx` - Compact fixed overlay for audience display with both team scores

### Modified
- `src/state/showStore.ts` - Added temporal middleware, swapSides action, sidesSwapped flag
- `src/styles/main.css` - Added score-pop, delta-fade keyframes, glow classes, GPU hints
- `src/screens/audience/AudienceDisplay.tsx` - Replaced inline score cards with ScoreOverlay component
- `src/screens/operator/OperatorControls.tsx` - Replaced inline ScoreCard with TeamScore component

## Decisions Made

**1. Middleware ordering: broadcast(persist(temporal(creator)))**
- Temporal must be innermost to intercept set() calls before persist processes them
- Prevents BroadcastChannel from echoing undo actions (Pitfall 7 from research)
- Ensures broadcast sends final persisted state, not intermediate temporal states

**2. Temporal partialization to score fields only**
- Only tracks: rightScore, leftScore, rightsTurn, turned, sidesSwapped
- Undo/redo doesn't affect data, quickQuestion, audienceQuestion
- Prevents confusing state where undo changes loaded episode data

**3. Pop & scale animation over rolling counter/flip**
- Simplest to implement with pure CSS (no JS animation library needed)
- Most reliable for broadcast sync (no timing coordination issues)
- Instantly readable at any resolution (flip/roll hard to read mid-transition)
- Combined with glow provides sufficient visual feedback

**4. Single gold accent color for active team glow**
- Gold (#FFD700 rgba) for both teams when active
- Avoids need for team-specific color management
- Consistent with broadcast design aesthetics

**5. First-render skip in useScoreDelta**
- isFirstRenderRef prevents delta indicator on initial page load
- Avoids flash of "+0" or spurious delta on mount
- Delta only appears on actual score changes after mount

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without errors or obstacles.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03-02 (Keyboard Controls):**
- Temporal store provides undo/redo methods via `useShowStore.temporal.getState()`
- swapSides action ready to be bound to keyboard shortcut
- react-hotkeys-hook already installed for keyboard binding
- Score display animations work on both screens with BroadcastChannel sync
- Active team glow transitions smoothly (300ms) ready for turn change shortcuts

**No blockers or concerns.**

## Self-Check: PASSED

All claimed files verified:
- ✓ Created files exist (useScoreDelta.ts, TeamScore.tsx, ScoreOverlay.tsx)
- ✓ Commits exist (204d04c, 21e9524)
- ✓ Modified files contain expected changes (temporal, score-pop, ScoreOverlay, TeamScore)

---
*Phase: 03-game-state-scoring*
*Completed: 2026-02-14*
