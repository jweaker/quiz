# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.
**Current focus:** Phase 5 (Visual System) — Complete

## Current Position

Phase: 5 of 7 (Visual System) — COMPLETE
Plan: 4 of 4 complete
Status: Phase 5 complete — rundown rail, section state, and audience display wired
Last activity: 2026-02-16 — Completed 05-04 (Rundown Rail & Section State)

Progress: [██████████████████░░░░░] 18/26 (69%)

## Performance Metrics

**Velocity:**
- Total plans completed: 18
- Average duration: 4.5 min
- Total execution time: 1.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Migration | 4/4 ✅ | 36 min | 9 min |
| 2 - Dual-Screen Architecture | 3/3 ✅ | 13 min | 4 min |
| 3 - Game State & Scoring | 2/2 ✅ | 6 min | 3 min |
| 4 - Timer System | 4/4 ✅ | 9 min | 2.25 min |
| 5 - Visual System | 4/4 ✅ | 21 min | 5.25 min |

**Recent Trend:**
- Last 5 plans: 04-04 (2 min), 05-01 (4 min), 05-02 (4 min), 05-03 (4 min), 05-04 (9 min)
- Trend: Consistent 2-9 min range

*Updated after each plan completion*
| Phase 04 P03 | 2 | 2 tasks | 6 files |
| Phase 04-timer-system P04 | 2 | 2 tasks | 3 files |
| Phase 05-visual-system P01 | 4 | 2 tasks | 8 files |
| Phase 05-visual-system P04 | 9 | 2 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Dual-screen architecture: Operator controls on laptop, audience view on external display (Pending)
- Individual Zustand selectors: useShowStore((s) => s.field) per field for optimal re-render performance (01-03)
- Physical positioning for Score panels: right/left not start/end for spatial consistency regardless of RTL (01-04)
- @ path alias: baseUrl/paths in tsconfig + resolve.alias in vite.config for shadcn/ui imports (02-01)
- broadcast(persist(creator)) ordering: broadcast wraps persist so BroadcastChannel gets post-hydration state (02-01)
- partialize operatorStore: audienceWindowConnected excluded from persistence — runtime-only state (02-01)
- ESM vite config: fileURLToPath/import.meta.url instead of __dirname for ESM compatibility (02-01)
- esbuild build scripts: pnpm.onlyBuiltDependencies for esbuild to fix EPIPE errors (02-01)
- ResizablePanelGroup v4 API: Uses orientation (not direction), onLayoutChanged with Layout map (not onLayout with number[]), panel id for tracking (02-02)
- Lazy-loaded route screens: React.lazy() for OperatorPanel, AudienceDisplay, Settings (02-02)
- Safe area defaults: bottom 15% margin for broadcast lower-third space (02-02)
- Unit toggle resets margins: Switching px/% resets values to avoid nonsensical conversions (02-02)
- Temporal middleware ordering: broadcast(persist(temporal(creator))) ensures temporal captures state before persist/broadcast (03-01)
- Temporal partialization: only track score-related fields to avoid undo affecting non-scoring state (03-01)
- Pop & scale animation: chosen over rolling counter/flip for simplicity, reliability, and broadcast sync (03-01)
- Single gold accent color: for active team glow, not team-specific colors (03-01)
- First-render skip: useScoreDelta prevents spurious delta indicators on page load (03-01)
- Form-tag awareness: enableOnFormTags: false prevents shortcuts from firing while typing in custom score input (03-02)
- Active team pattern: All scoring presets apply to whichever team has rightsTurn flag (03-02)
- Reverse-chronological history: Most recent actions at top for natural "what just happened?" workflow (03-02)
- Per-entry revert: Each history entry has revert button for direct state restoration (03-02)
- Separate timer BroadcastChannel: quiz-timer-state channel and timer-storage localStorage key for independent sync (04-01)
- Timer state temporal exclusion: Timer state excluded from temporal middleware to prevent undo rewinding clocks (04-01)
- worker-timers for countdown: Background-tab resilience with performance.now() drift correction for broadcast accuracy (04-01)
- Audio placeholder strategy: Copied existing assets to public/sounds/ for unblocked development with swap capability (04-01)
- Chess clock mutual exclusion: Single activeTimer field ensures only one team's clock ticks at a time, atomic switching (04-02)
- Points conversion formula: Math.floor(timeMs / 5000) for conservative rounding in Poetic Chase (5s = 1pt) (04-02)
- Dual-mode timer UI: TimerPanel toggles between countdown and chess clock modes with dedicated keyboard shortcuts (04-02)
- Western numerals for timers: All timer digits use western-numerals class for broadcast clarity (04-02)
- Local state for pass tracking: passActive and passedToTeam stored in hook state, not global store (transient flow state) (04-03)
- Pass scoring rules: +1pt for receiving team on pass, +1pt additional bonus for correct answer after pass (04-03)
- Letter keys conflict-free: a-z verified no conflicts with scoring (numbers), timer (t/p/[/]\), pass (g/v/x) (04-03)
- [Phase 04-timer-system]: KeyboardEvent.code names for react-hotkeys-hook v5 bracket/backslash support (04-04)
- [Phase 04-timer-system]: Elapsed time offset for pause/resume: startTimeRef accounts for (duration - remaining) (04-04)
- [Phase 05-visual-system]: Motion ^12.34.0 installed as latest stable; MotionConfig wraps app with reducedMotion='user' (05-01)
- [Phase 05-visual-system]: TypewriterText at 50ms stagger for show title (slower than 30ms default for dramatic Arabic reveal) (05-01)
- [Phase 05-visual-system]: Hardcoded 'idle' section type until Plan 05-04 adds section state to showStore (05-01)
- [Phase 05-visual-system]: Section IDs use kebab-case matching SectionType union; background keys aligned accordingly (05-04)
- [Phase 05-visual-system]: RundownRail placed between persistent and adaptive zones as natural divider (05-04)
- [Phase 05-visual-system]: MinefieldLayout activates for entire windows section type; Phase 6 adds granular detection (05-04)

### Pending Todos

None.

### Blockers/Concerns

**Phase 1 (Foundation & Migration):** ✅ COMPLETE

**Phase 2 (Dual-Screen):** ✅ COMPLETE

**Phase 3 (Game State & Scoring):** ✅ COMPLETE
- Plan 03-01 complete — temporal middleware and score display foundation ready
- Plan 03-02 complete — keyboard controls for scoring and undo/redo
- All scoring workflow operable via keyboard only (zero mouse dependency)

**Phase 4 (Timer System):** ✅ COMPLETE
- Plan 04-01 complete — Timer infrastructure with drift-corrected countdown and audio cues
- Plan 04-02 complete — Chess clock UI with operator controls and audience display
- Plan 04-03 complete — Poetic Chase pass mechanic and letter display integration
- Plan 04-04 complete — UAT gap closure (pause/resume fix, audio wiring, keyboard shortcuts, custom input, verse counter)
- All 5 UAT gaps closed, timer system production-ready

**Phase 5 (Visual System):** ✅ COMPLETE
- Plan 05-01 complete — Motion foundation with animation presets, TypewriterText, WipeTransition
- Plan 05-02 complete — Score celebrations and Minefield visual effects
- Plan 05-03 complete — Operator panel redesign with persistent+adaptive zones, shortcut registry
- Plan 05-04 complete — Rundown rail, section state, audience display section wiring
- CRITICAL USER FEEDBACK addressed: operator panel redesigned from broken vertical scroll to compact mission-control density

**Phase 6 (Quiz Sections):**
- 72 animal photos need collection/licensing before Ask Intelligently section implementation

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 05-04-PLAN.md (Rundown Rail & Section State) — Phase 5 complete
Resume file: None
Next step: Plan Phase 6 (Quiz Sections)
