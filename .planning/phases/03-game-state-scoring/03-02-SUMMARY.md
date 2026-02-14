---
phase: 03-game-state-scoring
plan: 02
subsystem: controls
tags: [keyboard-shortcuts, scoring-controls, react-hotkeys-hook, undo-redo, scoring-history]

# Dependency graph
requires:
  - phase: 03-game-state-scoring
    plan: 01
    provides: Temporal middleware, score display components, undo/redo foundation
provides:
  - useScoreControls hook with global keyboard shortcuts for scoring workflow
  - Section-aware scoring presets (1, 2, 5, 8, 0, Shift+5, Shift+6, -) applying to active team
  - CustomScoreInput for arbitrary score values with +/- toggle and Enter/Escape handling
  - ScoringHistory with reverse-chronological list and per-entry revert capability
  - ScoringPanel combining presets, custom input, quick actions, and history
  - Full keyboard-only operator workflow (zero mouse dependency during live scoring)
affects: [future-quiz-sections, future-operator-workflows]

# Tech tracking
tech-stack:
  added: []
  patterns: [form-tag-aware-shortcuts, reverse-chronological-history, active-team-presets, temporal-revert]

key-files:
  created:
    - src/hooks/useScoreControls.ts
    - src/components/operator/CustomScoreInput.tsx
    - src/components/operator/ScoringHistory.tsx
    - src/components/operator/ScoringPanel.tsx
  modified:
    - src/screens/operator/OperatorControls.tsx

key-decisions:
  - "Form-tag awareness: enableOnFormTags: false prevents shortcuts from firing while typing in custom score input"
  - "Active team pattern: All presets apply to whichever team has rightsTurn flag, not left/right specific keys"
  - "Reverse-chronological history: Most recent actions at top for natural 'what just happened?' workflow"
  - "Per-entry revert: Each history entry has its own revert button (undo N steps) for direct state restoration"
  - "Current team names in history: ScoringHistory reads current team names from main store (not temporal partialized state)"
  - "Removed placeholder button: Audience window launcher already exists in OperatorPanel from Phase 2"

patterns-established:
  - "Global keyboard hooks: useScoreControls called once in OperatorControls to register all shortcuts"
  - "Temporal store access: useShowStore.temporal.getState() for undo/redo methods (not reactive)"
  - "Delta computation: Compare adjacent pastStates to determine which team and how many points"
  - "Preset + fallback buttons: Keyboard shortcuts primary, clickable buttons as mouse fallback"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 03 Plan 02: Keyboard Controls Summary

**Complete keyboard-driven scoring workflow with section-aware presets (1, 2, 5, 8, 0, Shift+5, Shift+6, -), custom number input, reverse-chronological history with per-entry revert, and full undo/redo — zero mouse dependency for live operators**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-02-14T13:14:11Z
- **Completed:** 2026-02-14T13:17:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Global keyboard shortcuts registered via react-hotkeys-hook with form-tag awareness
- Section-aware scoring presets cover all quiz format values (+1 speed, +2 windows, +5 puzzle/debate, +8 windows max, +10 puzzle first, +15 puzzle/debate max, +16 minefield, -8 minefield wrong)
- All presets apply to active team (determined by rightsTurn) for single-hand operation
- Custom score input with +/- toggle, Enter to apply, Escape to clear/blur
- Keyboard shortcuts disabled while typing in custom input (enableOnFormTags: false)
- Turn toggle (Space), swap sides (Cmd/Ctrl+Shift+S), undo (Cmd/Ctrl+Z), redo (Cmd/Ctrl+Shift+Z)
- Reverse-chronological scoring history with revert-to-state capability
- Visual keyboard shortcut reference via <kbd> elements on all buttons
- Clickable preset buttons as mouse fallback (same logic as keyboard shortcuts)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create keyboard controls hook and custom score input component** - `0e105f6` (feat)
2. **Task 2: Create scoring history panel and integrate all controls into operator UI** - `dfb2a76` (feat)

## Files Created/Modified

### Created
- `src/hooks/useScoreControls.ts` - Global keyboard shortcuts for scoring, turn, swap, undo/redo
- `src/components/operator/CustomScoreInput.tsx` - Arbitrary score input with +/- toggle, Enter/Escape handling
- `src/components/operator/ScoringHistory.tsx` - Reverse-chronological list with per-entry revert
- `src/components/operator/ScoringPanel.tsx` - Cohesive panel combining presets, custom input, quick actions, history

### Modified
- `src/screens/operator/OperatorControls.tsx` - Integrated ScoringPanel, called useScoreControls hook, removed placeholder button

## Decisions Made

**1. Form-tag awareness for keyboard shortcuts**
- All shortcuts use `{ enableOnFormTags: false }` option in useHotkeys
- Prevents scoring shortcuts from firing while operator types in custom score input
- Only Enter and Escape handled within the input element itself (via onKeyDown)
- Allows safe custom score entry without accidental preset triggering

**2. Active team pattern for scoring presets**
- All preset keys (1, 2, 5, 8, 0, Shift+5, Shift+6, -) apply to active team
- Active team determined by `rightsTurn` flag from store
- No left/right specific keys — operator just toggles turn with Space
- Single-hand operation: presets on number row, Space for turn toggle
- Rationale: Simpler mental model during live show ("press 8 for active team" vs "press D for left, K for right")

**3. Reverse-chronological history display**
- Most recent scoring actions at top of ScoringHistory list
- Natural "what just happened?" mental model for operators
- Each entry shows delta (+N/-N) and affected team name
- Alternative considered: chronological list — rejected because operators care most about recent actions
- Alternative considered: table view — rejected for vertical space efficiency

**4. Per-entry revert instead of multi-undo**
- Each history entry has "Revert" button that calls `undo(N)` to revert N steps
- Direct restoration to any previous state without repeated undo keypresses
- Rationale: Faster recovery from operator error (click entry to revert vs press Undo 5 times)
- Global undo/redo shortcuts still available via Cmd/Ctrl+Z for keyboard-only flow

**5. Current team names in history from main store**
- Temporal store only tracks partialized state (rightScore, leftScore, rightsTurn, turned, sidesSwapped)
- Team names (data.rightTeamName, data.leftTeamName) not in temporal state
- ScoringHistory reads current team names from main store via `useShowStore((s) => s.data)`
- Handles type safety for potentially undefined values from temporal pastStates

**6. Removed placeholder audience window button**
- OperatorControls had disabled "Open Audience Window" button from Phase 2
- WindowLauncher already exists in OperatorPanel.tsx header (from Plan 02-02)
- Removed placeholder to clean up UI — operator uses WindowLauncher in panel header

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**1. Type errors in ScoringHistory (Rule 1 - Bug)**
- **Found during:** Task 2 (initial build)
- **Issue:** Temporal store pastStates contain partialized state (only score fields), not full state including data
- **TypeScript errors:** Cannot access `state.data?.rightTeamName` on partialized temporal state type
- **Fix:** Read current team names from main store via `useShowStore((s) => s.data)` instead of temporal state
- **Fix:** Handle potentially undefined values with nullish coalescing: `(state.rightScore ?? 0) - (prevState?.rightScore ?? 0)`
- **Files modified:** src/components/operator/ScoringHistory.tsx
- **Commit:** dfb2a76 (included in Task 2 commit)
- **Rationale:** Temporal middleware partialization intentionally excludes data field (only tracks score-related state). Team names are current-state metadata, not historical scoring data.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 4 (Timer System) or Phase 5 (Episode Data Management):**
- Complete keyboard-only operator workflow functional
- Scoring controls tested with temporal undo/redo integration
- All keyboard shortcuts registered and form-tag aware
- Operator can run entire scoring flow without mouse during live broadcast
- Score changes sync to audience display via BroadcastChannel (Phase 2)
- Score animations and delta indicators work on both screens (Plan 03-01)

**Verified capabilities:**
- Preset scoring (+1, +2, +5, +8, +10, +15, +16, -8) via keyboard
- Custom score entry with arbitrary values
- Turn toggle and side swap via keyboard shortcuts
- Full undo/redo with visual history
- Zero mouse dependency for live scoring operations

**No blockers or concerns.**

## Self-Check: PASSED

All claimed files verified:
- ✓ Created files exist (useScoreControls.ts, CustomScoreInput.tsx, ScoringHistory.tsx, ScoringPanel.tsx)
- ✓ Commits exist (0e105f6, dfb2a76)
- ✓ Modified files contain expected changes (OperatorControls with ScoringPanel integration and useScoreControls hook)
- ✓ Build successful with zero type errors
- ✓ All keyboard shortcuts registered with form-tag awareness
- ✓ Scoring history displays reverse-chronological list with revert capability

---
*Phase: 03-game-state-scoring*
*Completed: 2026-02-14*
