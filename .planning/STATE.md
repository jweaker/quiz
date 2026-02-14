# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.
**Current focus:** Phase 3 (Game State & Scoring) — In Progress

## Current Position

Phase: 3 of 7 (Game State & Scoring) — COMPLETE
Plan: 2 of 2 complete
Status: Phase 3 complete — Full keyboard-driven scoring workflow ready
Last activity: 2026-02-14 — Completed 03-02 (Keyboard Controls)

Progress: [█████████░░░░░░░░░░░░░░░] 9/25 (36%)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 6 min
- Total execution time: 0.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Migration | 4/4 ✅ | 36 min | 9 min |
| 2 - Dual-Screen Architecture | 3/3 ✅ | 13 min | 4 min |
| 3 - Game State & Scoring | 2/2 ✅ | 6 min | 3 min |

**Recent Trend:**
- Last 5 plans: 02-01 (6 min), 02-02 (7 min), 02-03 (~5 min), 03-01 (3 min), 03-02 (3 min)
- Trend: Accelerating (3-7 min range, recent plans averaging ~4 min)

*Updated after each plan completion*

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

### Pending Todos

None.

### Blockers/Concerns

**Phase 1 (Foundation & Migration):** ✅ COMPLETE

**Phase 2 (Dual-Screen):** ✅ COMPLETE

**Phase 3 (Game State & Scoring):** ✅ COMPLETE
- Plan 03-01 complete — temporal middleware and score display foundation ready
- Plan 03-02 complete — keyboard controls for scoring and undo/redo
- All scoring workflow operable via keyboard only (zero mouse dependency)

**Phase 4 (Timer System):**
- Web Worker timer implementation patterns need research before detailed planning (MEDIUM confidence)

**Phase 6 (Quiz Sections):**
- 72 animal photos need collection/licensing before Ask Intelligently section implementation

## Session Continuity

Last session: 2026-02-14
Stopped at: Completed 03-02-PLAN.md (Keyboard Controls)
Resume file: None
Next step: Phase 3 complete — ready for Phase 4 (Timer System) planning/research or Phase 5 (Episode Data Management)
