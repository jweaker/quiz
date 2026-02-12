# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.
**Current focus:** Phase 2 complete — Dual-Screen Architecture (3/3 plans done). Ready for Phase 3.

## Current Position

Phase: 2 of 7 (Dual-Screen Architecture)
Plan: 3 of 3 in current phase
Status: Phase complete
Last activity: 2026-02-10 — Completed 02-02-PLAN.md (Operator panel, audience display, safe area settings)

Progress: [███████░░░░░░░░░░░░░░░░░░] 7/25 (28%)

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 7 min
- Total execution time: 0.8 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Migration | 4/4 ✅ | 36 min | 9 min |
| 2 - Dual-Screen Architecture | 3/3 ✅ | 13 min | 4 min |

**Recent Trend:**
- Last 5 plans: 01-03 (10 min), 01-04 (11 min), 02-01 (6 min), 02-02 (7 min), 02-03 (~5 min)
- Trend: Consistent ~5-11 min per plan

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

### Pending Todos

None.

### Blockers/Concerns

**Phase 1 (Foundation & Migration):** ✅ COMPLETE

**Phase 2 (Dual-Screen):** ✅ COMPLETE

**Phase 4 (Timer System):**
- Web Worker timer implementation patterns need research before detailed planning (MEDIUM confidence)

**Phase 6 (Quiz Sections):**
- 72 animal photos need collection/licensing before Ask Intelligently section implementation

## Session Continuity

Last session: 2026-02-10
Stopped at: Completed 02-02-PLAN.md (Operator panel, audience display, safe area settings)
Resume file: None
Next step: Execute Phase 3 — Game State & Scoring (03-01-PLAN.md)
